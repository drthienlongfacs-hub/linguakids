const CAPABILITY_EVENT_KEY = 'linguakids-capability-events';
const MAX_EVENTS = 40;

function safeWindow() {
    return typeof window !== 'undefined' ? window : null;
}

function safeNavigator() {
    return typeof navigator !== 'undefined' ? navigator : null;
}

export function getSpeechRecognitionCtor() {
    const win = safeWindow();
    if (!win) return null;
    return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function detectDeviceCapabilities() {
    const win = safeWindow();
    const nav = safeNavigator();
    const userAgent = nav?.userAgent || '';
    const platform = nav?.platform || '';
    const maxTouchPoints = nav?.maxTouchPoints || 0;
    const isiOS = /iPad|iPhone|iPod/.test(userAgent)
        || (platform === 'MacIntel' && maxTouchPoints > 1);
    const isSafari = /safari/i.test(userAgent) && !/chrome|android|crios|fxios/i.test(userAgent);
    const ttsSupported = !!(win?.speechSynthesis && win?.SpeechSynthesisUtterance);
    const sttSupported = !!getSpeechRecognitionCtor();
    const audioCaptureSupported = !!nav?.mediaDevices?.getUserMedia;
    const mediaRecorderSupported = !!win?.MediaRecorder;
    const voices = ttsSupported ? (win.speechSynthesis.getVoices() || []) : [];
    const platformLabel = isiOS
        ? 'iPhone / iPad'
        : /android/i.test(userAgent)
            ? 'Android'
            : /mac/i.test(platform)
                ? 'macOS'
                : /win/i.test(platform)
                    ? 'Windows'
                    : /linux/i.test(platform)
                        ? 'Linux'
                        : 'Unknown';

    return {
        platformLabel,
        browserLabel: isSafari ? 'Safari' : /chrome|crios/i.test(userAgent) ? 'Chrome' : 'Browser',
        isiOS,
        isSafari,
        ttsSupported,
        sttSupported,
        audioCaptureSupported,
        mediaRecorderSupported,
        voiceCount: voices.length,
        chineseVoiceCount: voices.filter((voice) => voice.lang.startsWith('zh')).length,
        englishVoiceCount: voices.filter((voice) => voice.lang.startsWith('en')).length,
    };
}

export function getSpeechInputReadiness(capabilities) {
    if (capabilities.sttSupported && capabilities.audioCaptureSupported) {
        return {
            status: 'supported',
            badge: 'Browser STT',
            title: 'Speech Input',
            summary: 'Nhận diện giọng nói chạy trực tiếp trong browser. Chất lượng phụ thuộc thiết bị, browser, và quyền micro.',
        };
    }

    if (capabilities.audioCaptureSupported) {
        return {
            status: 'limited',
            badge: 'Typed fallback',
            title: 'Speech Input',
            summary: 'Thiết bị có micro nhưng browser không cung cấp STT. Hệ thống sẽ chuyển sang nhập câu thủ công để không bị dead-end.',
        };
    }

    return {
        status: 'degraded',
        badge: 'Manual only',
        title: 'Speech Input',
        summary: 'Thiết bị không sẵn sàng cho speech input. Chỉ có thể dùng chế độ nghe mẫu và nhập đáp án thủ công.',
    };
}

export function getSpeechOutputReadiness(capabilities) {
    if (!capabilities.ttsSupported) {
        return {
            status: 'degraded',
            badge: 'No TTS',
            title: 'Speech Output',
            summary: 'Thiết bị không có speech synthesis. Các nút phát âm sẽ bị giới hạn.',
        };
    }

    return {
        status: capabilities.voiceCount > 0 ? 'supported' : 'limited',
        badge: capabilities.voiceCount > 0 ? 'Browser TTS' : 'Browser TTS (loading voices)',
        title: 'Speech Output',
        summary: 'Âm thanh hiện được phát bằng giọng của hệ điều hành hoặc browser, không phải thư viện thu âm native.',
    };
}

export function getListeningReadiness(capabilities, source = 'tts') {
    if (source === 'recorded') {
        return {
            status: 'supported',
            badge: 'Recorded audio',
            title: 'Listening Source',
            summary: 'Bài nghe đang dùng audio thu sẵn có transcript đồng bộ.',
        };
    }

    return {
        status: capabilities.ttsSupported ? 'limited' : 'degraded',
        badge: capabilities.ttsSupported ? 'Browser TTS' : 'No audio engine',
        title: 'Listening Source',
        summary: capabilities.ttsSupported
            ? 'Bài nghe hiện phát bằng TTS của browser. Nội dung, transcript và quiz là dữ liệu thật nhưng chất lượng âm phụ thuộc thiết bị.'
            : 'Thiết bị không sẵn sàng cho audio playback bằng TTS.',
    };
}

export function getConversationEngineReadiness() {
    return {
        status: 'guided',
        badge: 'Guided scenario engine',
        title: 'Conversation Engine',
        summary: 'Module hội thoại hiện dùng scenario và rule-based replies để luyện phản xạ, chưa phải model-based AI tutor.',
    };
}

export function getHanziWritingReadiness() {
    return {
        status: 'supported',
        badge: 'HanziWriter + remote data',
        title: 'Hanzi Writing',
        summary: 'Viết chữ Hán đang chạy thật bằng HanziWriter, nhưng stroke data được tải từ CDN và bộ chữ hiện vẫn là starter set.',
    };
}

export function readCapabilityEvents() {
    try {
        const raw = localStorage.getItem(CAPABILITY_EVENT_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function recordCapabilityEvent(type, details = {}) {
    try {
        const nextEvent = {
            id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
            type,
            details,
            timestamp: new Date().toISOString(),
        };
        const current = readCapabilityEvents();
        localStorage.setItem(
            CAPABILITY_EVENT_KEY,
            JSON.stringify([nextEvent, ...current].slice(0, MAX_EVENTS))
        );
        return nextEvent;
    } catch {
        return null;
    }
}

export function clearCapabilityEvents() {
    try {
        localStorage.removeItem(CAPABILITY_EVENT_KEY);
    } catch {
        // ignore storage failure
    }
}

export function formatCapabilityTimestamp(timestamp, locale = 'vi-VN') {
    try {
        return new Date(timestamp).toLocaleString(locale, {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
        });
    } catch {
        return timestamp;
    }
}


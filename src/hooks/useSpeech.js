// useSpeech — Premium TTS + Speech Recognition
// RCA Fix v2: Proper speech queue, iOS-safe timing, reliable full-sentence playback
// Root causes fixed: cancel-kills-queue, aggressive pause/resume, no queue, bad timing
import { useState, useCallback, useRef, useEffect } from 'react';

// Voice preference lists — best quality first
const VOICE_PREFERENCES = {
    'en-US': [
        'Samantha', 'Karen', 'Daniel', 'Moira', 'Tessa',
        'Google US English', 'Google UK English Female',
        'Microsoft Aria', 'Microsoft Jenny',
    ],
    'en-GB': [
        'Daniel', 'Kate', 'Oliver', 'Google UK English Female',
    ],
    'zh-CN': [
        'Ting-Ting', 'Mei-Jia', 'Sin-ji',
        'Google 普通话', 'Google 中文',
        'Microsoft Xiaoxiao', 'Microsoft Yunyang',
    ],
    'vi-VN': [
        'Linh', 'Google Tiếng Việt',
        'Microsoft HoaiMy',
    ],
};

function findBestVoice(lang, voices) {
    if (!voices || voices.length === 0) return null;
    const prefs = VOICE_PREFERENCES[lang] || [];

    // 1. Try preferred voices by name
    for (const pref of prefs) {
        const found = voices.find(v =>
            v.name.includes(pref) && v.lang.startsWith(lang.split('-')[0])
        );
        if (found) return found;
    }

    // 2. Try any voice for this language
    const langBase = lang.split('-')[0];
    const langVoices = voices.filter(v => v.lang.startsWith(langBase));

    // Prefer enhanced/premium voices
    const enhanced = langVoices.find(v =>
        v.name.toLowerCase().includes('enhanced') ||
        v.name.toLowerCase().includes('premium') ||
        v.name.toLowerCase().includes('natural')
    );
    if (enhanced) return enhanced;

    // Prefer local voices (better quality, no network delay)
    const local = langVoices.find(v => v.localService);
    if (local) return local;

    return langVoices[0] || null;
}

export function useSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [voices, setVoices] = useState([]);
    const recognitionRef = useRef(null);
    const queueRef = useRef([]);         // Speech queue
    const processingRef = useRef(false); // Queue lock
    const resumeTimerRef = useRef(null); // iOS resume timer

    // Load voices (some browsers load async)
    useEffect(() => {
        const loadVoices = () => {
            const v = window.speechSynthesis?.getVoices() || [];
            if (v.length > 0) setVoices(v);
        };

        loadVoices();
        window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
        const t1 = setTimeout(loadVoices, 500);
        const t2 = setTimeout(loadVoices, 1500);

        return () => {
            window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    // =============================================
    // FIX RC-3: Proper Speech Queue
    // =============================================
    const processQueue = useCallback(() => {
        if (processingRef.current) return;
        if (queueRef.current.length === 0) {
            setIsSpeaking(false);
            return;
        }

        processingRef.current = true;
        setIsSpeaking(true);
        const { text, lang, rate, pitch, onDone } = queueRef.current.shift();

        // FIX RC-1: Only cancel if there's stale speech, not our queue
        if (window.speechSynthesis?.speaking) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const bestVoice = findBestVoice(lang, voices);
        if (bestVoice) {
            utterance.voice = bestVoice;
            utterance.lang = bestVoice.lang;
        } else {
            utterance.lang = lang;
        }

        utterance.volume = 1.0;
        utterance.rate = rate;
        utterance.pitch = pitch;

        // FIX RC-2: iOS Safari resume — only for utterances > 3 seconds estimated
        // Short utterances don't need it, and it causes glitches on them
        const estimatedDuration = text.length * 80; // rough ms estimate
        if (estimatedDuration > 3000) {
            resumeTimerRef.current = setInterval(() => {
                if (window.speechSynthesis?.speaking && !window.speechSynthesis?.paused) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 12000); // 12s instead of 10s — less aggressive
        }

        utterance.onend = () => {
            clearInterval(resumeTimerRef.current);
            processingRef.current = false;
            if (onDone) onDone();
            // Process next in queue after a small gap
            setTimeout(() => processQueue(), 150);
        };

        utterance.onerror = (e) => {
            console.warn('TTS error:', e.error);
            clearInterval(resumeTimerRef.current);
            processingRef.current = false;
            // Still try next in queue
            setTimeout(() => processQueue(), 200);
        };

        // FIX RC-1: iOS Safari needs delay after cancel
        setTimeout(() => {
            try {
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.warn('TTS speak failed:', e);
                processingRef.current = false;
                processQueue();
            }
        }, 80);
    }, [voices]);

    // Main speak function — adds to queue
    const speak = useCallback((text, lang = 'en-US', options = {}) => {
        if (!window.speechSynthesis || !text) return;

        // FIX RC-5: Adjust rate based on sentence length
        const wordCount = text.split(/\s+/).length;
        let rate = options.rate || 0.85;
        if (wordCount > 8) rate = Math.max(rate, 0.85);  // Don't go too slow on long sentences
        if (wordCount <= 3) rate = Math.min(rate, 0.78); // Single words/short: slower for clarity

        queueRef.current.push({
            text,
            lang,
            rate,
            pitch: options.pitch || 1.05,
            onDone: options.onDone,
        });

        processQueue();
    }, [processQueue]);

    // Language-specific shortcuts
    const speakEnglish = useCallback((text) => {
        speak(text, 'en-US', { rate: 0.82, pitch: 1.05 });
    }, [speak]);

    const speakChinese = useCallback((text) => {
        speak(text, 'zh-CN', { rate: 0.7, pitch: 1.0 });
    }, [speak]);

    const speakVietnamese = useCallback((text) => {
        speak(text, 'vi-VN', { rate: 0.85, pitch: 1.0 });
    }, [speak]);

    // FIX RC-4: speakTwice uses queue properly (no time estimation)
    const speakTwice = useCallback((text, lang = 'en-US') => {
        speak(text, lang, { rate: 0.75, pitch: 1.05 });
        // Second utterance queued — will play after first finishes naturally
        speak(text, lang, { rate: 0.85, pitch: 1.05 });
    }, [speak]);

    // Stop all speech and clear queue
    const stopSpeaking = useCallback(() => {
        queueRef.current = [];
        processingRef.current = false;
        clearInterval(resumeTimerRef.current);
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    }, []);

    // =============================================
    // Speech Recognition — with iOS Safari fallback
    // =============================================
    const speechSupported = useRef(null);

    useEffect(() => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        speechSupported.current = !!SR;
    }, []);

    const startListening = useCallback((lang = 'en-US', onResult) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            speechSupported.current = false;
            const input = prompt('🎤 Nhập câu con muốn nói (mic không khả dụng):');
            if (input && onResult) {
                setTranscript(input.toLowerCase().trim());
                onResult([input.toLowerCase().trim()]);
            }
            return;
        }

        // Stop TTS first (avoid mic picking up speaker)
        stopSpeaking();

        try {
            const recognition = new SpeechRecognition();
            recognition.lang = lang;
            recognition.continuous = false;
            recognition.interimResults = false;
            recognition.maxAlternatives = 5;

            recognition.onstart = () => setIsListening(true);

            recognition.onerror = (e) => {
                console.warn('Recognition error:', e.error);
                setIsListening(false);
                if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
                    const input = prompt('🎤 Mic không khả dụng. Nhập câu con muốn nói:');
                    if (input && onResult) {
                        setTranscript(input.toLowerCase().trim());
                        onResult([input.toLowerCase().trim()]);
                    }
                }
            };

            recognition.onresult = (event) => {
                const results = [];
                for (let i = 0; i < event.results[0].length; i++) {
                    results.push(event.results[0][i].transcript.toLowerCase().trim());
                }
                setTranscript(results[0]);
                if (onResult) onResult(results);
            };

            // Auto-stop after 8 seconds
            const timeout = setTimeout(() => {
                try { recognition.stop(); } catch (e) { }
                setIsListening(false);
            }, 8000);

            recognition.onend = () => {
                clearTimeout(timeout);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (e) {
            console.warn('Failed to start recognition:', e);
            setIsListening(false);
            const input = prompt('🎤 Nhập câu con muốn nói:');
            if (input && onResult) {
                setTranscript(input.toLowerCase().trim());
                onResult([input.toLowerCase().trim()]);
            }
        }
    }, [stopSpeaking]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    // Kid-friendly pronunciation checking
    const checkPronunciation = useCallback((spoken, expected) => {
        if (!spoken || !expected) return { score: 40, feedback: 'tryAgain' };

        const s = spoken.toLowerCase().trim();
        const e = expected.toLowerCase().trim();

        if (s === e) return { score: 100, feedback: 'perfect' };
        if (s.includes(e) || e.includes(s)) return { score: 85, feedback: 'great' };

        const sWords = s.split(/\s+/);
        const eWords = e.split(/\s+/);
        const matching = eWords.filter(ew => sWords.some(sw => sw.includes(ew) || ew.includes(sw)));
        if (matching.length > 0) return { score: 70, feedback: 'good' };

        if (s[0] === e[0]) return { score: 55, feedback: 'good' };

        return { score: 40, feedback: 'tryAgain' };
    }, []);

    // Debug info
    const getVoiceInfo = useCallback(() => ({
        total: voices.length,
        english: voices.filter(v => v.lang.startsWith('en')).map(v => v.name),
        chinese: voices.filter(v => v.lang.startsWith('zh')).map(v => v.name),
        vietnamese: voices.filter(v => v.lang.startsWith('vi')).map(v => v.name),
        selectedEn: findBestVoice('en-US', voices)?.name,
        selectedCn: findBestVoice('zh-CN', voices)?.name,
        selectedVi: findBestVoice('vi-VN', voices)?.name,
    }), [voices]);

    return {
        speak,
        speakEnglish,
        speakChinese,
        speakVietnamese,
        speakTwice,
        isSpeaking,
        stopSpeaking,
        startListening,
        stopListening,
        isListening,
        transcript,
        checkPronunciation,
        getVoiceInfo,
        voicesLoaded: voices.length > 0,
    };
}

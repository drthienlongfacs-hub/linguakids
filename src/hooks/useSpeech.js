// useSpeech — Premium TTS + Speech Recognition
// Optimized for: loud, clear, native-quality voices on iOS/iPad/Chrome
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

    // 1. Try preferred voices by name (premium/enhanced first)
    for (const pref of prefs) {
        const found = voices.find(v =>
            v.name.includes(pref) && v.lang.startsWith(lang.split('-')[0])
        );
        if (found) return found;
    }

    // 2. Try any voice for this language
    const langBase = lang.split('-')[0]; // 'en', 'zh', 'vi'
    const langVoices = voices.filter(v => v.lang.startsWith(langBase));

    // Prefer "enhanced" or "premium" voices
    const enhanced = langVoices.find(v =>
        v.name.toLowerCase().includes('enhanced') ||
        v.name.toLowerCase().includes('premium') ||
        v.name.toLowerCase().includes('natural')
    );
    if (enhanced) return enhanced;

    // Prefer local (not remote/network) voices for better quality
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
    const utteranceRef = useRef(null);

    // Load voices (some browsers load async)
    useEffect(() => {
        const loadVoices = () => {
            const v = window.speechSynthesis?.getVoices() || [];
            if (v.length > 0) setVoices(v);
        };

        loadVoices();
        window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);

        // Fallback: retry after delays (Safari sometimes slow)
        const t1 = setTimeout(loadVoices, 500);
        const t2 = setTimeout(loadVoices, 1500);

        return () => {
            window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    // iOS Safari workaround: speechSynthesis pauses after ~15s
    // Keep it alive with periodic resume
    useEffect(() => {
        let interval;
        if (isSpeaking) {
            interval = setInterval(() => {
                if (window.speechSynthesis?.speaking) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 10000);
        }
        return () => clearInterval(interval);
    }, [isSpeaking]);

    // Text-to-Speech — loud, clear, native quality
    const speak = useCallback((text, lang = 'en-US', options = {}) => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Select best voice for this language
        const bestVoice = findBestVoice(lang, voices);
        if (bestVoice) {
            utterance.voice = bestVoice;
            utterance.lang = bestVoice.lang; // Use exact voice lang for best quality
        } else {
            utterance.lang = lang;
        }

        // Audio settings — LOUD and CLEAR for kids
        utterance.volume = 1.0;                    // Maximum volume
        utterance.rate = options.rate || 0.75;      // Slow for kids to hear clearly
        utterance.pitch = options.pitch || 1.05;    // Slightly higher = friendlier

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (e) => {
            console.warn('TTS error:', e);
            setIsSpeaking(false);
        };

        utteranceRef.current = utterance;

        // iOS Safari requires a small delay after cancel
        setTimeout(() => {
            window.speechSynthesis.speak(utterance);
        }, 50);
    }, [voices]);

    // Language-specific shortcuts with optimized settings
    const speakEnglish = useCallback((text) => {
        speak(text, 'en-US', { rate: 0.75, pitch: 1.05 });
    }, [speak]);

    const speakChinese = useCallback((text) => {
        speak(text, 'zh-CN', { rate: 0.65, pitch: 1.0 }); // Even slower for Chinese tones
    }, [speak]);

    const speakVietnamese = useCallback((text) => {
        speak(text, 'vi-VN', { rate: 0.8, pitch: 1.0 });
    }, [speak]);

    // Speak word twice (repeat for kids to hear better)
    const speakTwice = useCallback((text, lang = 'en-US') => {
        speak(text, lang, { rate: 0.7, pitch: 1.05 });
        // Queue second utterance after first completes
        setTimeout(() => {
            speak(text, lang, { rate: 0.8, pitch: 1.05 });
        }, text.length * 200 + 1000); // Estimate first utterance duration
    }, [speak]);

    // Speech Recognition
    const startListening = useCallback((lang = 'en-US', onResult) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported');
            return;
        }

        // Cancel any ongoing speech first (avoid mic picking up TTS)
        window.speechSynthesis?.cancel();

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 5; // More alternatives = better matching

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e) => {
            console.warn('Recognition error:', e.error);
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const results = [];
            for (let i = 0; i < event.results[0].length; i++) {
                results.push(event.results[0][i].transcript.toLowerCase().trim());
            }
            setTranscript(results[0]);
            if (onResult) onResult(results);
        };

        recognitionRef.current = recognition;
        recognition.start();
    }, []);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    // Kid-friendly pronunciation checking (very generous matching)
    const checkPronunciation = useCallback((spoken, expected) => {
        if (!spoken || !expected) return { score: 40, feedback: 'tryAgain' };

        const s = spoken.toLowerCase().trim();
        const e = expected.toLowerCase().trim();

        // Exact match
        if (s === e) return { score: 100, feedback: 'perfect' };

        // Contains match
        if (s.includes(e) || e.includes(s)) return { score: 85, feedback: 'great' };

        // Word-level match (for multi-word phrases)
        const sWords = s.split(/\s+/);
        const eWords = e.split(/\s+/);
        const matching = eWords.filter(ew => sWords.some(sw => sw.includes(ew) || ew.includes(sw)));
        if (matching.length > 0) return { score: 70, feedback: 'good' };

        // First letter/sound match
        if (s[0] === e[0]) return { score: 55, feedback: 'good' };

        // Any attempt is encouraged for kids
        return { score: 40, feedback: 'tryAgain' };
    }, []);

    const stopSpeaking = useCallback(() => {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    }, []);

    // Get available voice info (for debugging)
    const getVoiceInfo = useCallback(() => {
        return {
            total: voices.length,
            english: voices.filter(v => v.lang.startsWith('en')).map(v => v.name),
            chinese: voices.filter(v => v.lang.startsWith('zh')).map(v => v.name),
            vietnamese: voices.filter(v => v.lang.startsWith('vi')).map(v => v.name),
            selectedEn: findBestVoice('en-US', voices)?.name,
            selectedCn: findBestVoice('zh-CN', voices)?.name,
            selectedVi: findBestVoice('vi-VN', voices)?.name,
        };
    }, [voices]);

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

// useSpeech — Premium TTS + Speech Recognition
// RCA Fix v2: Proper speech queue, iOS-safe timing, reliable full-sentence playback
// v3: Enhanced recognition with confidence + N-best alternatives
// v4: Voice Personality System — accent + personality-aware TTS
import { useState, useCallback, useRef, useEffect } from 'react';
import { checkWordPronunciation } from '../utils/pronunciationEngine';
import { recordCapabilityEvent } from '../services/capabilityService';
import { ACCENT_PROFILES, findPersonalityVoice, getPersonalityProsody, DEFAULT_PERSONALITY } from '../data/voicePersonalities';

// Voice preference lists — best quality first
const VOICE_PREFERENCES = {
    'en-US': [
        'Samantha', 'Aaron', 'Allison', 'Ava',
        'Google US English', 'Google US English Female', 'Google US English Male',
        'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Mark',
    ],
    'en-GB': [
        'Daniel', 'Serena', 'Kate', 'Oliver', 'Arthur',
        'Google UK English Female', 'Google UK English Male',
        'Microsoft Hazel', 'Microsoft Ryan',
    ],
    'en-AU': [
        'Karen', 'Catherine', 'Gordon', 'Lee',
        'Google Australian English', 'Google Australian English Female', 'Google Australian English Male',
        'Microsoft Natasha', 'Microsoft William',
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
    const processQueue = useCallback(function processQueueImpl() {
        if (processingRef.current) return;
        if (queueRef.current.length === 0) {
            setIsSpeaking(false);
            return;
        }

        processingRef.current = true;
        setIsSpeaking(true);
        const { text, lang, rate, pitch, onDone, _voiceOverride } = queueRef.current.shift();

        // FIX RC-1: Only cancel if there's stale speech, not our queue
        if (window.speechSynthesis?.speaking) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const bestVoice = _voiceOverride || findBestVoice(lang, voices);
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
            setTimeout(() => processQueueImpl(), 150);
        };

        utterance.onerror = (e) => {
            console.warn('TTS error:', e.error);
            clearInterval(resumeTimerRef.current);
            processingRef.current = false;
            // Still try next in queue
            setTimeout(() => processQueueImpl(), 200);
        };

        // FIX RC-1: iOS Safari needs delay after cancel
        setTimeout(() => {
            try {
                window.speechSynthesis.speak(utterance);
            } catch (e) {
                console.warn('TTS speak failed:', e);
                processingRef.current = false;
                processQueueImpl();
            }
        }, 80);
    }, [voices]);

    // Main speak function — adds to queue
    const speak = useCallback((text, lang = 'en-US', options = {}) => {
        if (!window.speechSynthesis || !text) return;

        // FIX RC-5 v2: Gentle rate adjustment — never go below 0.90 to avoid
        // time-stretching distortion (RCA-041b: rate=0.78 caused muffled audio)
        const wordCount = text.split(/\s+/).length;
        let rate = options.rate || 0.90;
        if (wordCount > 8) rate = Math.max(rate, 0.90);  // Don't go too slow on long sentences
        if (wordCount <= 3) rate = Math.min(rate, 0.90); // Short words: slightly slower, NOT below 0.90

        queueRef.current.push({
            text,
            lang,
            rate,
            pitch: options.pitch || 1.0,  // RCA-041b: 1.05 thins audio on mobile → use 1.0
            onDone: options.onDone,
        });

        recordCapabilityEvent('speech_output_enqueued', {
            lang,
            chars: text.length,
        });

        processQueue();
    }, [processQueue]);

    // Language-specific shortcuts
    const speakEnglish = useCallback((text) => {
        speak(text, 'en-US', { rate: 0.92, pitch: 1.0 }); // RCA-041b: was 0.82/1.05
    }, [speak]);

    const speakChinese = useCallback((text) => {
        speak(text, 'zh-CN', { rate: 0.7, pitch: 1.0 });
    }, [speak]);

    const speakVietnamese = useCallback((text) => {
        speak(text, 'vi-VN', { rate: 0.85, pitch: 1.0 });
    }, [speak]);

    // v4: Accent + Personality-aware speaking
    const speakWithPersonality = useCallback((text, accentLang = 'en-US', personalityId = DEFAULT_PERSONALITY) => {
        if (!window.speechSynthesis || !text) return;
        const accentId = ACCENT_PROFILES.find((profile) => profile.lang === accentLang)?.id || null;
        const voice = accentId ? findPersonalityVoice(voices, accentId, personalityId) : null;
        const prosody = getPersonalityProsody(personalityId);
        queueRef.current.push({
            text,
            lang: accentLang,
            rate: prosody.rate,
            pitch: prosody.pitch,
            onDone: null,
            _voiceOverride: voice,
        });
        processQueue();
    }, [voices, processQueue]);

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
            recordCapabilityEvent('speech_input_fallback_triggered', {
                lang,
                reason: 'speech_recognition_unavailable',
                source: 'useSpeech',
            });
            const input = prompt('🎤 Nhập câu con muốn nói (mic không khả dụng):');
            if (input && onResult) {
                setTranscript(input.toLowerCase().trim());
                onResult([input.toLowerCase().trim()]);
                recordCapabilityEvent('speech_input_manual_submitted', {
                    lang,
                    chars: input.trim().length,
                    source: 'useSpeech',
                });
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

            recognition.onstart = () => {
                setIsListening(true);
                recordCapabilityEvent('speech_input_started', {
                    lang,
                    source: 'useSpeech',
                });
            };

            recognition.onerror = (e) => {
                console.warn('Recognition error:', e.error);
                setIsListening(false);
                recordCapabilityEvent('speech_input_error', {
                    lang,
                    error: e.error,
                    source: 'useSpeech',
                });
                if (e.error === 'not-allowed' || e.error === 'service-not-allowed' || e.error === 'audio-capture') {
                    recordCapabilityEvent('speech_input_fallback_triggered', {
                        lang,
                        error: e.error,
                        source: 'useSpeech',
                    });
                    const input = prompt('🎤 Mic không khả dụng. Nhập câu con muốn nói:');
                    if (input && onResult) {
                        setTranscript(input.toLowerCase().trim());
                        onResult([input.toLowerCase().trim()]);
                        recordCapabilityEvent('speech_input_manual_submitted', {
                            lang,
                            chars: input.trim().length,
                            source: 'useSpeech',
                        });
                    }
                }
            };

            recognition.onresult = (event) => {
                // Pass full alternatives with confidence scores
                const results = [];
                for (let i = 0; i < event.results[0].length; i++) {
                    results.push({
                        text: event.results[0][i].transcript.toLowerCase().trim(),
                        confidence: event.results[0][i].confidence || 0.5,
                    });
                }
                setTranscript(results[0]?.text || '');
                if (onResult) onResult(results);
                recordCapabilityEvent('speech_input_result', {
                    lang,
                    alternatives: results.length,
                    source: 'useSpeech',
                });
            };

            // Auto-stop after 8 seconds
            const timeout = setTimeout(() => {
                try { recognition.stop(); } catch { /* ignore */ }
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
            recordCapabilityEvent('speech_input_fallback_triggered', {
                lang,
                reason: 'start_failed',
                source: 'useSpeech',
            });
            const input = prompt('🎤 Nhập câu con muốn nói:');
            if (input && onResult) {
                setTranscript(input.toLowerCase().trim());
                onResult([input.toLowerCase().trim()]);
                recordCapabilityEvent('speech_input_manual_submitted', {
                    lang,
                    chars: input.trim().length,
                    source: 'useSpeech',
                });
            }
        }
    }, [stopSpeaking]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
        setIsListening(false);
    }, []);

    // Enhanced pronunciation checking using pronunciationEngine
    const checkPronunciation = useCallback((spokenAlts, expected) => {
        if (!expected) return { score: 40, feedback: 'tryAgain' };

        // Handle both old format (string) and new format (array of {text, confidence})
        const alternatives = typeof spokenAlts === 'string'
            ? [{ text: spokenAlts, confidence: 0.5 }]
            : Array.isArray(spokenAlts)
                ? spokenAlts.map(a => typeof a === 'string' ? { text: a, confidence: 0.5 } : a)
                : [{ text: String(spokenAlts), confidence: 0.5 }];

        return checkWordPronunciation(alternatives, expected);

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
        speakWithPersonality,
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

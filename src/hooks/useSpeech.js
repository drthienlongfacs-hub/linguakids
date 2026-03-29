// useSpeech — Premium TTS + Speech Recognition
// RCA Fix v2: Proper speech queue, iOS-safe timing, reliable full-sentence playback
// v3: Enhanced recognition with confidence + N-best alternatives
// v4: Voice Personality System — accent + personality-aware TTS
import { useState, useCallback, useRef, useEffect } from 'react';
import { checkWordPronunciation } from '../utils/pronunciationEngine';
import { recordCapabilityEvent } from '../services/capabilityService';
import { ACCENT_PROFILES, DEFAULT_PERSONALITY } from '../data/voicePersonalities.js';
import {
    applyVoiceProfileToUtterance,
    getStoredVoicePreferences,
    resolveVoiceProfile,
} from '../services/voicePreferenceService.js';

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
        const { text, lang, rate, pitch, volume, onDone, _voiceProfile } = queueRef.current.shift();

        // FIX RC-1: Only cancel if there's stale speech, not our queue
        if (window.speechSynthesis?.speaking) {
            window.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voiceProfile = _voiceProfile || resolveVoiceProfile({
            langCode: lang,
            voices,
        });
        applyVoiceProfileToUtterance(utterance, voiceProfile, {
            langCode: lang,
            rate,
            pitch,
            volume,
        });

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
    // options._bypassRateFloor: set by personality-aware callers that pre-compute safe rates
    const speak = useCallback((text, lang = 'en-US', options = {}) => {
        if (!window.speechSynthesis || !text) return;

        let rate = options.rate || 0.90;

        if (!options._bypassRateFloor) {
            // RCA-041b: rate floor for generic callers — avoids muffled distortion
            const wordCount = text.split(/\s+/).length;
            if (wordCount > 8) rate = Math.max(rate, 0.90);
            if (wordCount <= 3) rate = Math.min(rate, 0.90);
        }

        queueRef.current.push({
            text,
            lang,
            rate,
            pitch: options.pitch || 1.0,
            volume: typeof options.volume === 'number' ? options.volume : 1.0,
            onDone: options.onDone,
            _voiceProfile: options._voiceProfile || null,
        });

        recordCapabilityEvent('speech_output_enqueued', {
            lang,
            chars: text.length,
        });

        processQueue();
    }, [processQueue]);

    // v4→v5: Accent + Personality-aware speaking — uses speak() with bypass + volume
    const speakWithPersonality = useCallback((text, accentLang = 'en-US', personalityId = DEFAULT_PERSONALITY) => {
        if (!window.speechSynthesis || !text) return;
        const accentId = ACCENT_PROFILES.find((profile) => profile.lang === accentLang)?.id || null;
        const voiceProfile = resolveVoiceProfile({
            langCode: accentLang,
            voices,
            accentId,
            personalityId,
        });
        speak(text, accentLang, {
            rate: voiceProfile.prosody.rate,
            pitch: voiceProfile.prosody.pitch,
            volume: voiceProfile.prosody.volume,
            _voiceProfile: voiceProfile,
            _bypassRateFloor: true, // prosody already platform-safe
        });
    }, [voices, speak]);

    // Language-specific shortcuts — now personality-aware
    const speakEnglish = useCallback((text) => {
        const prefs = getStoredVoicePreferences();
        if (prefs) {
            const accentProfile = ACCENT_PROFILES.find(a => a.id === prefs.accent);
            speakWithPersonality(text, accentProfile?.lang || 'en-US', prefs.personality);
        } else {
            speak(text, 'en-US', { rate: 0.92, pitch: 1.0 });
        }
    }, [speak, speakWithPersonality]);

    const speakChinese = useCallback((text) => {
        const prefs = getStoredVoicePreferences();
        if (prefs) {
            const voiceProfile = resolveVoiceProfile({
                langCode: 'zh-CN',
                voices,
                personalityId: prefs.personality,
            });
            speak(text, 'zh-CN', {
                rate: Math.min(voiceProfile.prosody.rate, 0.80), // Chinese needs slower base
                pitch: voiceProfile.prosody.pitch,
                volume: voiceProfile.prosody.volume,
                _voiceProfile: voiceProfile,
                _bypassRateFloor: true,
            });
        } else {
            speak(text, 'zh-CN', { rate: 0.7, pitch: 1.0 });
        }
    }, [speak, voices]);

    const speakVietnamese = useCallback((text) => {
        const prefs = getStoredVoicePreferences();
        if (prefs) {
            const voiceProfile = resolveVoiceProfile({
                langCode: 'vi-VN',
                voices,
                personalityId: prefs.personality,
            });
            speak(text, 'vi-VN', {
                rate: Math.min(voiceProfile.prosody.rate, 0.85),
                pitch: voiceProfile.prosody.pitch,
                volume: voiceProfile.prosody.volume,
                _voiceProfile: voiceProfile,
                _bypassRateFloor: true,
            });
        } else {
            speak(text, 'vi-VN', { rate: 0.85, pitch: 1.0 });
        }
    }, [speak, voices]);

    // FIX RC-4: speakTwice uses queue properly (no time estimation)
    // Fixed: rate 0.75→0.80 (was below RCA-041b floor), pitch 1.05→1.0 (avoids mobile thinning)
    const speakTwice = useCallback((text, lang = 'en-US') => {
        speak(text, lang, { rate: 0.80, pitch: 1.0 });
        speak(text, lang, { rate: 0.90, pitch: 1.0 });
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
        selectedEn: resolveVoiceProfile({ langCode: 'en-US', voices }).voice?.name,
        selectedCn: resolveVoiceProfile({ langCode: 'zh-CN', voices }).voice?.name,
        selectedVi: resolveVoiceProfile({ langCode: 'vi-VN', voices }).voice?.name,
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

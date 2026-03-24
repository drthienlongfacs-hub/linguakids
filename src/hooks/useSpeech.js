// useSpeech — Text-to-Speech + Speech Recognition hook
// Supports: en-US, zh-CN, vi-VN
import { useState, useCallback, useRef } from 'react';

export function useSpeech() {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef = useRef(null);

    // Text-to-Speech
    const speak = useCallback((text, lang = 'en-US', rate = 0.85) => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate; // Slower for kids
        utterance.pitch = 1.1; // Slightly higher pitch for friendliness
        utterance.volume = 1;

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    }, []);

    const speakEnglish = useCallback((text) => speak(text, 'en-US', 0.8), [speak]);
    const speakChinese = useCallback((text) => speak(text, 'zh-CN', 0.75), [speak]);
    const speakVietnamese = useCallback((text) => speak(text, 'vi-VN', 0.85), [speak]);

    // Speech Recognition
    const startListening = useCallback((lang = 'en-US', onResult) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = lang;
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 3;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => setIsListening(false);

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

    // Simple fuzzy match for pronunciation checking (kid-friendly: generous matching)
    const checkPronunciation = useCallback((spoken, expected) => {
        const s = spoken.toLowerCase().trim();
        const e = expected.toLowerCase().trim();

        // Exact match
        if (s === e) return { score: 100, feedback: 'perfect' };

        // Contains match (very generous for kids)
        if (s.includes(e) || e.includes(s)) return { score: 80, feedback: 'great' };

        // First letter/sound match
        if (s[0] === e[0]) return { score: 60, feedback: 'good' };

        // Any attempt is encouraged
        return { score: 40, feedback: 'tryAgain' };
    }, []);

    const stopSpeaking = useCallback(() => {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    }, []);

    return {
        speak,
        speakEnglish,
        speakChinese,
        speakVietnamese,
        isSpeaking,
        stopSpeaking,
        startListening,
        stopListening,
        isListening,
        transcript,
        checkPronunciation,
    };
}

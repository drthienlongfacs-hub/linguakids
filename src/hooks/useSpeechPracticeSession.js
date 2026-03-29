import { useCallback, useEffect, useRef, useState } from 'react';
import { getSpeechRecognitionCtor, recordCapabilityEvent } from '../services/capabilityService';

function getMediaRecorderMimeType() {
    if (typeof window === 'undefined' || !window.MediaRecorder?.isTypeSupported) {
        return '';
    }

    const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/mp3'];
    return candidates.find((candidate) => window.MediaRecorder.isTypeSupported(candidate)) || '';
}

export function useSpeechPracticeSession(moduleName = 'speaking') {
    const [phase, setPhase] = useState('idle');
    const [interimText, setInterimText] = useState('');
    const [finalText, setFinalText] = useState('');
    const [error, setError] = useState('');
    const [audioUrl, setAudioUrl] = useState('');
    const [durationMs, setDurationMs] = useState(0);
    const [manualFallback, setManualFallback] = useState(null);
    const [confidence, setConfidence] = useState(0);
    const [alternatives, setAlternatives] = useState([]);

    const recognitionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioChunksRef = useRef([]);
    const audioUrlRef = useRef('');
    const startedAtRef = useRef(0);
    const stoppingRef = useRef(false);
    const autoStopOnEndRef = useRef(true);
    const finalizeCallbackRef = useRef(null);

    const revokeAudioUrl = useCallback(() => {
        if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current);
            audioUrlRef.current = '';
        }
        setAudioUrl('');
    }, []);

    const stopMediaTracks = useCallback(() => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null;
        }
    }, []);

    const resetSession = useCallback(() => {
        stoppingRef.current = true;
        recognitionRef.current?.abort?.();
        if (mediaRecorderRef.current?.state && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        stopMediaTracks();
        revokeAudioUrl();
        audioChunksRef.current = [];
        startedAtRef.current = 0;
        setPhase('idle');
        setInterimText('');
        setFinalText('');
        setError('');
        setDurationMs(0);
        setManualFallback(null);
        setConfidence(0);
        setAlternatives([]);
        stoppingRef.current = false;
    }, [revokeAudioUrl, stopMediaTracks]);

    useEffect(() => {
        return () => {
            resetSession();
        };
    }, [resetSession]);

    const requestManualFallback = useCallback((fallback) => {
        stopMediaTracks();
        setPhase('manual');
        setManualFallback(fallback || {
            title: 'Nhập lại câu đã nói',
            description: 'Thiết bị chưa thể nhận diện giọng nói. Hãy nhập transcript để tiếp tục.',
        });
    }, [stopMediaTracks]);

    const finalizeCapture = useCallback((transcriptOverride) => {
        const transcript = String(transcriptOverride ?? finalText ?? '').trim()
            || String(interimText || '').trim();
        const duration = startedAtRef.current ? Math.max(0, Date.now() - startedAtRef.current) : 0;
        setFinalText(transcript);
        setInterimText('');
        setDurationMs(duration);
        setPhase('done');
        recordCapabilityEvent('speech_capture_finalized', {
            module: moduleName,
            chars: transcript.length,
            durationMs: duration,
        });
        finalizeCallbackRef.current?.({
            transcript,
            durationMs: duration,
            confidence,
            alternatives,
        });
    }, [alternatives, confidence, finalText, interimText, moduleName]);

    const stopCapture = useCallback(() => {
        if (phase !== 'recording' && phase !== 'requesting') return;

        stoppingRef.current = true;
        setPhase('processing');
        recognitionRef.current?.stop?.();

        if (mediaRecorderRef.current?.state && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        stopMediaTracks();

        window.setTimeout(() => {
            finalizeCapture();
            stoppingRef.current = false;
        }, 220);
    }, [finalizeCapture, phase, stopMediaTracks]);

    const startCapture = useCallback(async ({
        lang = 'en-US',
        continuous = false,
        interimResults = true,
        maxAlternatives = 3,
        autoStopOnEnd = true,
        fallback,
        onFinalize,
    } = {}) => {
        resetSession();
        setPhase('requesting');
        finalizeCallbackRef.current = onFinalize || null;
        autoStopOnEndRef.current = autoStopOnEnd;

        const SpeechRecognitionCtor = getSpeechRecognitionCtor();
        const hasMediaCapture = !!navigator.mediaDevices?.getUserMedia;

        if (!hasMediaCapture) {
            requestManualFallback(fallback);
            return;
        }

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;
        } catch {
            requestManualFallback(fallback);
            return;
        }

        audioChunksRef.current = [];
        revokeAudioUrl();

        if (window.MediaRecorder && stream) {
            try {
                const mimeType = getMediaRecorderMimeType();
                const mediaRecorder = mimeType
                    ? new MediaRecorder(stream, { mimeType })
                    : new MediaRecorder(stream);

                mediaRecorderRef.current = mediaRecorder;
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        audioChunksRef.current.push(event.data);
                    }
                };
                mediaRecorder.onstop = () => {
                    if (!audioChunksRef.current.length) return;
                    const blob = new Blob(audioChunksRef.current, {
                        type: mediaRecorder.mimeType || 'audio/webm',
                    });
                    const nextUrl = URL.createObjectURL(blob);
                    audioUrlRef.current = nextUrl;
                    setAudioUrl(nextUrl);
                };
                mediaRecorder.start(150);
            } catch {
                mediaRecorderRef.current = null;
            }
        }

        if (!SpeechRecognitionCtor) {
            requestManualFallback(fallback);
            return;
        }

        const recognition = new SpeechRecognitionCtor();
        recognitionRef.current = recognition;
        recognition.lang = lang;
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.maxAlternatives = maxAlternatives;

        let stableTranscript = '';

        recognition.onresult = (event) => {
            let interim = '';
            for (let index = event.resultIndex; index < event.results.length; index += 1) {
                const result = event.results[index];
                const resultAlternatives = Array.from(result).map((item) => ({
                    text: item.transcript,
                    confidence: item.confidence || 0,
                }));

                if (result.isFinal) {
                    stableTranscript = `${stableTranscript} ${result[0].transcript}`.trim();
                    setFinalText(stableTranscript);
                    setAlternatives(resultAlternatives);
                    setConfidence(resultAlternatives[0]?.confidence || 0);
                } else {
                    interim += result[0].transcript;
                }
            }
            setInterimText(interim.trim());
        };

        recognition.onerror = (event) => {
            if (event.error === 'aborted') return;

            if (event.error === 'not-allowed' || event.error === 'audio-capture' || event.error === 'service-not-allowed') {
                requestManualFallback(fallback);
                return;
            }

            stopMediaTracks();
            setPhase('error');
            setError(`speech_${event.error}`);
            recordCapabilityEvent('speech_capture_error', {
                module: moduleName,
                error: event.error,
            });
        };

        recognition.onend = () => {
            if (stoppingRef.current) return;
            if (autoStopOnEndRef.current) {
                stopCapture();
            }
        };

        try {
            recognition.start();
            startedAtRef.current = Date.now();
            setPhase('recording');
            recordCapabilityEvent('speech_capture_started', {
                module: moduleName,
                lang,
                continuous,
            });
        } catch {
            requestManualFallback(fallback);
        }
    }, [moduleName, requestManualFallback, resetSession, revokeAudioUrl, stopCapture, stopMediaTracks]);

    const submitManualTranscript = useCallback((value) => {
        const transcript = String(value || '').trim();
        if (!transcript) return;
        setManualFallback(null);
        setFinalText(transcript);
        setInterimText('');
        setDurationMs(0);
        setPhase('done');
        finalizeCallbackRef.current?.({
            transcript,
            durationMs: 0,
            confidence: 0,
            alternatives: [],
        });
        recordCapabilityEvent('speech_manual_transcript_submitted', {
            module: moduleName,
            chars: transcript.length,
        });
    }, [moduleName]);

    return {
        phase,
        interimText,
        finalText,
        error,
        audioUrl,
        durationMs,
        manualFallback,
        confidence,
        alternatives,
        setError,
        startCapture,
        stopCapture,
        resetSession,
        submitManualTranscript,
    };
}

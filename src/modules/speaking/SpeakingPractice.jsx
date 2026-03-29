// SpeakingPractice.jsx — Interactive speaking practice with recording + scoring
// Features: Mic recording, MediaRecorder playback, Web Speech transcription,
//           word-level diff, WPM/accuracy scoring, IELTS band estimation
// Used by: IELTSSimulator speaking tab + standalone speaking practice

import { useState, useRef, useCallback, useEffect } from 'react';
import { diffWords, calculateAccuracy, assessFluency, estimateBandScore, STATUS_COLORS } from '../../utils/speakingUtils';
import { speakText as speakTextUtil } from '../../utils/speakText';

// ============================================================
// SpeakingPractice Component
// ============================================================
export default function SpeakingPractice({
    question,           // The question or prompt to answer
    modelAnswer = '',   // Model answer to compare against (optional)
    prepTime = 0,       // Preparation time in seconds (0 = no prep phase)
    speakTime = 120,    // Max speaking time in seconds
    part = 1,           // IELTS part number (1, 2, or 3)
    onComplete,         // Callback with results
}) {
    // States
    const [phase, setPhase] = useState(prepTime > 0 ? 'prep' : 'ready'); // prep | ready | recording | processing | results
    const [timer, setTimer] = useState(prepTime > 0 ? prepTime : speakTime);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [audioURL, setAudioURL] = useState(null);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isSpeakingModel, setIsSpeakingModel] = useState(false);

    // Refs
    const recognitionRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);
    const audioRef = useRef(null);
    const streamRef = useRef(null);

    // ============================================================
    // Timer logic
    // ============================================================
    useEffect(() => {
        if (phase === 'prep' || phase === 'recording') {
            timerRef.current = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        if (phase === 'prep') {
                            setPhase('ready');
                            setTimer(speakTime);
                        } else if (phase === 'recording') {
                            stopRecording();
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [phase]);

    // ============================================================
    // Start recording
    // ============================================================
    const startRecording = useCallback(async () => {
        setError(null);
        setTranscript('');
        setInterimTranscript('');
        setAudioURL(null);
        setResults(null);
        audioChunksRef.current = [];

        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setError('Your browser does not support Speech Recognition. Please use Chrome or Edge.');
            return;
        }

        try {
            // Start MediaRecorder for audio playback
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const url = URL.createObjectURL(audioBlob);
                setAudioURL(url);
            };

            mediaRecorder.start(100); // Collect data every 100ms

            // Start Web Speech Recognition
            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 3;

            let finalText = '';

            recognition.onresult = (event) => {
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const result = event.results[i];
                    if (result.isFinal) {
                        finalText += result[0].transcript + ' ';
                        setTranscript(finalText.trim());
                    } else {
                        interim += result[0].transcript;
                    }
                }
                setInterimTranscript(interim);
            };

            recognition.onerror = (e) => {
                if (e.error !== 'no-speech' && e.error !== 'aborted') {
                    console.warn('Speech recognition error:', e.error);
                }
            };

            recognition.onend = () => {
                // Auto-restart if still recording
                if (phase === 'recording') {
                    try { recognition.start(); } catch (e) { /* already started */ }
                }
            };

            recognition.start();
            startTimeRef.current = Date.now();
            setPhase('recording');
            setTimer(speakTime);
        } catch (err) {
            setError('Microphone access denied. Please allow microphone access in your browser settings.');
        }
    }, [speakTime]);

    // ============================================================
    // Stop recording + process results
    // ============================================================
    const stopRecording = useCallback(() => {
        clearInterval(timerRef.current);
        const duration = Date.now() - (startTimeRef.current || Date.now());

        // Stop recognition
        if (recognitionRef.current) {
            recognitionRef.current.onend = null; // Prevent auto-restart
            try { recognitionRef.current.stop(); } catch (e) { /* */ }
        }

        // Stop MediaRecorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        // Stop mic stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }

        setPhase('processing');

        // Process after a short delay to let final transcript settle
        setTimeout(() => {
            const finalTranscript = transcript || '';
            const words = finalTranscript.split(/\s+/).filter(Boolean);
            const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;

            // Diff against model answer if provided
            let diffs = [];
            let accuracy = 0;
            if (modelAnswer && finalTranscript) {
                diffs = diffWords(modelAnswer, finalTranscript);
                accuracy = calculateAccuracy(diffs);
            } else if (finalTranscript) {
                // No model answer — assess based on fluency only
                accuracy = Math.min(100, words.length * 2); // Rough estimate
            }

            const fluency = assessFluency(words.length, duration);
            const band = estimateBandScore({
                accuracy: modelAnswer ? accuracy : Math.min(accuracy, 75),
                wpm: fluency.wpm,
                wordCount: words.length,
                uniqueWords,
            });

            const resultData = {
                transcript: finalTranscript,
                diffs,
                accuracy,
                fluency,
                band,
                wordCount: words.length,
                uniqueWords,
                duration,
            };

            setResults(resultData);
            setPhase('results');
            onComplete?.(resultData);
        }, 500);
    }, [transcript, modelAnswer, onComplete]);

    // ============================================================
    // Play model answer
    // ============================================================
    const playModelAnswer = useCallback((text) => {
        if (isSpeakingModel || !text) return;
        setIsSpeakingModel(true);
        speakTextUtil(text, {
            lang: 'en-US',
            rate: 0.85,
            onEnd: () => setIsSpeakingModel(false),
        });
    }, [isSpeakingModel]);

    // ============================================================
    // Play recording
    // ============================================================
    const playRecording = useCallback(() => {
        if (!audioURL) return;
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current = null;
        }
        const audio = new Audio(audioURL);
        audioRef.current = audio;
        audio.onplay = () => setIsPlaying(true);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        audio.play();
    }, [audioURL]);

    // ============================================================
    // Reset
    // ============================================================
    const reset = () => {
        setPhase(prepTime > 0 ? 'prep' : 'ready');
        setTimer(prepTime > 0 ? prepTime : speakTime);
        setTranscript('');
        setInterimTranscript('');
        setAudioURL(null);
        setResults(null);
        setError(null);
    };

    // Format timer
    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // ============================================================
    // Render
    // ============================================================
    return (
        <div style={{ padding: '16px', background: 'var(--color-container-bg)', borderRadius: '16px', border: '2px solid var(--color-input-border)', marginBottom: '12px', boxShadow: 'var(--color-container-shadow)' }}>
            {/* Question */}
            <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--color-text)', margin: '0 0 12px', lineHeight: 1.6 }}>
                Q: {question}
            </p>

            {/* Error */}
            {error && (
                <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px', color: '#FCA5A5', fontSize: '0.85rem' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* === PREP PHASE === */}
            {phase === 'prep' && (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📝</div>
                    <p style={{ color: 'var(--color-text)', fontSize: '0.9rem', marginBottom: '8px' }}>Preparation Time</p>
                    <div style={{
                        fontSize: '2.5rem', fontWeight: 700, color: timer <= 10 ? '#FB7185' : '#818CF8',
                        fontFamily: 'monospace', transition: 'color 0.3s',
                    }}>
                        {formatTime(timer)}
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: '8px 0 0' }}>
                        Take notes and organize your thoughts
                    </p>
                    <button onClick={() => { clearInterval(timerRef.current); setPhase('ready'); setTimer(speakTime); }}
                        style={{ marginTop: '16px', padding: '8px 20px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(129,140,248,0.2)', color: '#C7D2FE', cursor: 'pointer', fontSize: '0.85rem' }}>
                        Skip → Start Speaking
                    </button>
                </div>
            )}

            {/* === READY PHASE === */}
            {phase === 'ready' && (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                    <button onClick={startRecording}
                        style={{
                            width: '80px', height: '80px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #EF4444, #DC2626)', color: '#fff', fontSize: '2rem',
                            boxShadow: '0 4px 20px rgba(239,68,68,0.4)', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto',
                        }}>
                        🎤
                    </button>
                    <p style={{ color: 'var(--color-text)', fontSize: '0.85rem', marginTop: '12px' }}>
                        Tap to start recording your answer
                    </p>
                    {modelAnswer && (
                        <button onClick={() => playModelAnswer(modelAnswer)}
                            disabled={isSpeakingModel}
                            style={{ marginTop: '8px', padding: '6px 16px', borderRadius: '8px', border: '1px solid rgba(129,140,248,0.3)', background: 'rgba(129,140,248,0.15)', color: '#A5B4FC', cursor: 'pointer', fontSize: '0.8rem' }}>
                            {isSpeakingModel ? '🔊 Playing...' : '🔊 Listen to Model Answer'}
                        </button>
                    )}
                </div>
            )}

            {/* === RECORDING PHASE === */}
            {phase === 'recording' && (
                <div style={{ textAlign: 'center', padding: '12px' }}>
                    {/* Timer */}
                    <div style={{
                        fontSize: '2rem', fontWeight: 700, fontFamily: 'monospace',
                        color: timer <= 15 ? '#FB7185' : '#22C55E',
                        marginBottom: '12px', transition: 'color 0.3s',
                    }}>
                        ● {formatTime(timer)}
                    </div>

                    {/* Recording indicator */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: '20px', padding: '6px 16px', marginBottom: '12px',
                    }}>
                        <div style={{
                            width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444',
                            animation: 'pulse 1.5s infinite',
                        }} />
                        <span style={{ color: '#FCA5A5', fontSize: '0.8rem', fontWeight: 600 }}>Recording...</span>
                    </div>

                    {/* Live transcript */}
                    {(transcript || interimTranscript) && (
                        <div style={{
                            background: 'rgba(15,23,42,0.7)', borderRadius: '10px', padding: '12px',
                            textAlign: 'left', marginBottom: '12px', fontSize: '0.85rem', lineHeight: 1.7,
                            border: '1px solid var(--color-input-border)', minHeight: '60px',
                        }}>
                            <span style={{ color: 'var(--color-text)' }}>{transcript}</span>
                            <span style={{ color: '#64748B', fontStyle: 'italic' }}>{interimTranscript}</span>
                        </div>
                    )}

                    {/* Stop button */}
                    <button onClick={stopRecording}
                        style={{
                            padding: '10px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #EF4444, #B91C1C)', color: '#fff',
                            fontSize: '0.9rem', fontWeight: 600, boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
                        }}>
                        ■ Stop Recording
                    </button>
                </div>
            )}

            {/* === PROCESSING === */}
            {phase === 'processing' && (
                <div style={{ textAlign: 'center', padding: '24px', color: '#94A3B8' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px', animation: 'spin 2s linear infinite' }}>⏳</div>
                    Analyzing your speech...
                </div>
            )}

            {/* === RESULTS PHASE === */}
            {phase === 'results' && results && (
                <div>
                    {/* Score Dashboard */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                        {/* Accuracy */}
                        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: results.accuracy >= 70 ? '#22C55E' : results.accuracy >= 50 ? '#F59E0B' : '#EF4444' }}>
                                {results.accuracy}%
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>Accuracy</div>
                        </div>

                        {/* WPM */}
                        <div style={{ background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#818CF8' }}>
                                {results.fluency.wpm}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>WPM</div>
                        </div>

                        {/* Band */}
                        <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: '12px', padding: '12px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#FBBF24' }}>
                                {results.band.overall}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '2px' }}>Band Est.</div>
                        </div>
                    </div>

                    {/* Sub-scores */}
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        {[
                            { label: 'Pronunciation', score: results.band.pronunciation, color: '#22C55E' },
                            { label: 'Fluency', score: results.band.fluency, color: '#818CF8' },
                            { label: 'Vocabulary', score: results.band.vocabulary, color: '#FBBF24' },
                        ].map(s => (
                            <div key={s.label} style={{ fontSize: '0.75rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: s.color, fontWeight: 700 }}>{s.score}</span> {s.label}
                            </div>
                        ))}
                        <div style={{ fontSize: '0.75rem', color: '#CBD5E1' }}>
                            📊 {results.wordCount} words · {Math.round(results.duration / 1000)}s
                        </div>
                    </div>

                    {/* Fluency feedback */}
                    <div style={{
                        background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.2)',
                        borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.82rem', color: '#C7D2FE',
                    }}>
                        💡 {results.fluency.feedback}
                    </div>

                    {/* Word-level diff (if model answer exists) */}
                    {results.diffs.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '8px' }}>Word-level Analysis:</p>
                            <div style={{
                                background: 'rgba(15,23,42,0.6)', borderRadius: '10px', padding: '12px',
                                display: 'flex', flexWrap: 'wrap', gap: '4px', lineHeight: 2,
                            }}>
                                {results.diffs.map((d, i) => (
                                    <span key={i} title={d.status === 'perfect' ? 'Perfect!' : d.status === 'close' ? `Close — you said "${d.spoken}"` : d.status === 'wrong' ? `Wrong — you said "${d.spoken}"` : 'Not spoken'}
                                        style={{
                                            padding: '2px 6px', borderRadius: '4px', fontSize: '0.82rem', fontWeight: 500,
                                            background: `${STATUS_COLORS[d.status]}22`,
                                            color: STATUS_COLORS[d.status],
                                            borderBottom: `2px solid ${STATUS_COLORS[d.status]}`,
                                            textDecoration: d.status === 'missing' ? 'line-through' : 'none',
                                            opacity: d.status === 'missing' ? 0.5 : 1,
                                        }}>
                                        {d.word}
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.7rem' }}>
                                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                                    <span key={status} style={{ color, display: 'flex', alignItems: 'center', gap: '3px' }}>
                                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: color, display: 'inline-block' }} />
                                        {status}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Your transcript */}
                    <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '4px' }}>Your Answer:</p>
                        <div style={{ background: 'var(--color-transcript-bg)', borderRadius: '10px', padding: '12px', fontSize: '0.85rem', color: 'var(--color-transcript-text)', lineHeight: 1.7 }}>
                            {results.transcript || <span style={{ color: '#64748B', fontStyle: 'italic' }}>No speech detected</span>}
                        </div>
                    </div>

                    {/* Audio playback + actions */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {audioURL && (
                            <button onClick={playRecording}
                                style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(129,140,248,0.3)', background: 'rgba(129,140,248,0.15)', color: '#A5B4FC', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}>
                                {isPlaying ? '🔊 Playing...' : '🔊 Play Recording'}
                            </button>
                        )}
                        {modelAnswer && (
                            <button onClick={() => playModelAnswer(modelAnswer)}
                                disabled={isSpeakingModel}
                                style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid rgba(34,197,94,0.3)', background: 'rgba(34,197,94,0.15)', color: '#86EFAC', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}>
                                {isSpeakingModel ? '🔊 Playing...' : '💡 Model Answer'}
                            </button>
                        )}
                        <button onClick={reset}
                            style={{ padding: '8px 16px', borderRadius: '10px', border: '2px solid var(--color-input-border)', background: 'var(--color-option-bg)', color: 'var(--color-option-text)', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500 }}>
                            🔄 Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* CSS animation for recording pulse */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

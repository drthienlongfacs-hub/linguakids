// ShadowingEngine.jsx — Pro-level shadowing like Elsa Speak / Lora
// Features: Word-level diff highlighting, pronunciation scoring, waveform,
//           adjustable playback speed, multiple attempts, progress tracking
// Works with: Web Speech API (SpeechRecognition + SpeechSynthesis)
// Supports: English (en-US) and Chinese Mandarin (zh-CN)

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import CapabilityNotice from '../../components/CapabilityNotice';
import ManualTranscriptFallback from '../../components/ManualTranscriptFallback';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';
import { recordCapabilityEvent } from '../../services/capabilityService';

// ============================================================
// Levenshtein distance for word-level similarity scoring
// ============================================================
function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) d[i][0] = i;
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            d[i][j] = Math.min(
                d[i - 1][j] + 1,
                d[i][j - 1] + 1,
                d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
            );
    return d[m][n];
}

// Word-level similarity (0-100)
function wordSimilarity(target, spoken) {
    if (!target || !spoken) return 0;
    const t = target.toLowerCase().trim();
    const s = spoken.toLowerCase().trim();
    if (t === s) return 100;
    const dist = levenshtein(t, s);
    const maxLen = Math.max(t.length, s.length);
    return Math.round((1 - dist / maxLen) * 100);
}

// Diff words: match target words to spoken words
function diffWords(targetText, spokenText, lang = 'en') {
    const normalize = (text) => {
        if (lang === 'cn') {
            // Chinese: split by character (each char = word)
            return text.replace(/[\s。，！？、]/g, '').split('');
        }
        return text.toLowerCase().replace(/[^a-z0-9\s'-]/g, '').split(/\s+/).filter(Boolean);
    };

    const targetWords = normalize(targetText);
    const spokenWords = normalize(spokenText);

    return targetWords.map((tw, idx) => {
        // Find best match in spoken words
        let bestScore = 0;
        let bestMatch = '';

        for (const sw of spokenWords) {
            const score = wordSimilarity(tw, sw);
            if (score > bestScore) {
                bestScore = score;
                bestMatch = sw;
            }
        }

        // Also check exact position match
        if (idx < spokenWords.length) {
            const posScore = wordSimilarity(tw, spokenWords[idx]);
            if (posScore > bestScore) {
                bestScore = posScore;
                bestMatch = spokenWords[idx];
            }
        }

        return {
            word: tw,
            spoken: bestMatch,
            score: bestScore,
            status: bestScore >= 90 ? 'perfect' : bestScore >= 60 ? 'close' : bestScore >= 30 ? 'wrong' : 'missing',
        };
    });
}

// Overall accuracy from word diffs
function calculateAccuracy(diffs) {
    if (!diffs.length) return 0;
    const total = diffs.reduce((sum, d) => sum + d.score, 0);
    return Math.round(total / diffs.length);
}

// Status colors
const STATUS_COLORS = {
    perfect: '#22C55E',  // green
    close: '#F59E0B',    // amber
    wrong: '#EF4444',    // red
    missing: '#9CA3AF',  // gray
};

// ============================================================
// ShadowingEngine Component
// ============================================================
export default function ShadowingEngine({
    text,          // Target sentence to shadow
    textVi,        // Vietnamese translation (optional)
    pinyin,        // Pinyin for Chinese (optional)
    lang = 'en',   // 'en' or 'cn'
    onComplete,    // Callback({ accuracy, attempts })
    showTranslation = true,
}) {
    const [state, setState] = useState('idle'); // idle | playing | recording | processing | result
    const [interim, setInterim] = useState('');
    const [finalText, setFinalText] = useState('');
    const [wordDiffs, setWordDiffs] = useState([]);
    const [accuracy, setAccuracy] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [bestScore, setBestScore] = useState(0);
    const [speed, setSpeed] = useState(0.85);
    const [error, setError] = useState('');
    const [waveAmplitude, setWaveAmplitude] = useState(0);
    const [revealIdx, setRevealIdx] = useState(-1); // slow-reveal word index
    const [manualTranscript, setManualTranscript] = useState('');
    const [manualPrompt, setManualPrompt] = useState('');
    const { readiness } = useDeviceCapabilities();

    const recRef = useRef(null);
    const timeoutRef = useRef(null);
    const analyserRef = useRef(null);
    const frameRef = useRef(null);
    const revealTimerRef = useRef(null);

    // Parse words for slow-reveal
    const words = useMemo(() => {
        if (lang === 'cn') return text.replace(/[\s。，！？、]/g, '').split('');
        return text.split(/\s+/).filter(Boolean);
    }, [text, lang]);

    // Cleanup
    useEffect(() => {
        return () => {
            recRef.current?.abort();
            clearTimeout(timeoutRef.current);
            clearInterval(revealTimerRef.current);
            cancelAnimationFrame(frameRef.current);
            window.speechSynthesis.cancel();
        };
    }, []);

    // ====== TTS Playback with speed control ======
    const playModel = useCallback(() => {
        window.speechSynthesis.cancel();
        setState('playing');
        const u = new SpeechSynthesisUtterance(text);
        u.lang = lang === 'cn' ? 'zh-CN' : 'en-US';
        u.rate = speed;
        u.pitch = 1;

        const voices = window.speechSynthesis.getVoices();
        const targetLang = lang === 'cn' ? 'zh' : 'en';
        const voice = voices.find(v => v.lang.startsWith(targetLang)) || voices[0];
        if (voice) u.voice = voice;

        u.onend = () => { setState('idle'); clearInterval(revealTimerRef.current); setRevealIdx(-1); };
        u.onerror = () => { setState('idle'); clearInterval(revealTimerRef.current); setRevealIdx(-1); };
        window.speechSynthesis.speak(u);

        // Slow-reveal: estimate word timing and highlight sequentially
        const totalDuration = (text.length / (speed * 12)) * 1000; // rough ms estimate
        const perWord = totalDuration / Math.max(words.length, 1);
        let idx = 0;
        setRevealIdx(0);
        revealTimerRef.current = setInterval(() => {
            idx++;
            if (idx >= words.length) {
                clearInterval(revealTimerRef.current);
                setRevealIdx(-1);
            } else {
                setRevealIdx(idx);
            }
        }, perWord);
    }, [text, lang, speed, words]);

    // ====== Waveform visualization during recording ======
    const startWaveform = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            analyserRef.current = { analyser, ctx, stream };

            const data = new Uint8Array(analyser.frequencyBinCount);
            const tick = () => {
                analyser.getByteFrequencyData(data);
                const avg = data.reduce((a, b) => a + b, 0) / data.length;
                setWaveAmplitude(avg / 128); // 0-2 range
                frameRef.current = requestAnimationFrame(tick);
            };
            tick();
        } catch { /* fail silently */ }
    }, []);

    const stopWaveform = useCallback(() => {
        cancelAnimationFrame(frameRef.current);
        setWaveAmplitude(0);
        if (analyserRef.current) {
            analyserRef.current.stream.getTracks().forEach(t => t.stop());
            analyserRef.current.ctx.close();
            analyserRef.current = null;
        }
    }, []);

    const applyTranscript = useCallback((spokenText) => {
        setState('processing');
        const diffs = diffWords(text, spokenText, lang);
        const acc = calculateAccuracy(diffs);

        setFinalText(spokenText);
        setWordDiffs(diffs);
        setAccuracy(acc);
        setAttempts(previous => previous + 1);
        if (acc > bestScore) {
            setBestScore(acc);
        }

        setTimeout(() => setState('result'), 200);
    }, [text, lang, bestScore]);

    const requestTypedFallback = useCallback((message) => {
        stopWaveform();
        setManualPrompt(message);
        setManualTranscript('');
        setState('manual');
        recordCapabilityEvent('speech_input_fallback_triggered', {
            module: 'ShadowingEngine',
            lang,
        });
        return true;
    }, [lang, stopWaveform]);

    // ====== Speech Recognition ======
    const startRecording = useCallback(async () => {
        setError('');
        setInterim('');
        setFinalText('');
        setWordDiffs([]);
        setState('recording');

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            requestTypedFallback('Thiết bị chưa hỗ trợ nhận diện giọng nói. Hãy nhập câu vừa nói để tiếp tục chấm điểm:');
            return;
        }

        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            requestTypedFallback('Micro chưa sẵn sàng. Hãy nhập câu vừa nói để tiếp tục chấm điểm:');
            return;
        }

        const rec = new SR();
        rec.lang = lang === 'cn' ? 'zh-CN' : 'en-US';
        rec.interimResults = true;
        rec.continuous = true;
        rec.maxAlternatives = 3;
        recordCapabilityEvent('speech_input_started', {
            module: 'ShadowingEngine',
            lang,
        });

        let fullTranscript = '';

        rec.onresult = (e) => {
            let interimResult = '';
            let finalResult = '';

            for (let i = 0; i < e.results.length; i++) {
                if (e.results[i].isFinal) {
                    finalResult += e.results[i][0].transcript;
                } else {
                    interimResult += e.results[i][0].transcript;
                }
            }

            if (finalResult) {
                fullTranscript = finalResult;
                setFinalText(finalResult);
                setInterim('');
            } else {
                setInterim(interimResult);
            }
        };

        rec.onerror = (e) => {
            clearTimeout(timeoutRef.current);
            stopWaveform();
            if (e.error !== 'aborted') {
                if (e.error === 'not-allowed' || e.error === 'audio-capture' || e.error === 'service-not-allowed') {
                    requestTypedFallback('Không truy cập được micro. Hãy nhập câu vừa nói để tiếp tục chấm điểm:');
                    return;
                }

                recordCapabilityEvent('speech_input_error', {
                    module: 'ShadowingEngine',
                    lang,
                    error: e.error,
                });
                const msgs = {
                    'no-speech': 'Không nghe thấy giọng nói. Hãy thử lại hoặc nhập câu bằng tay.',
                    'network': 'Lỗi mạng khi nhận diện. Hãy thử lại hoặc nhập câu bằng tay.',
                };
                setError(msgs[e.error] || `Error: ${e.error}`);
                setState('idle');
            }
        };

        rec.onend = () => {
            clearTimeout(timeoutRef.current);
            stopWaveform();

            if (fullTranscript) {
                recordCapabilityEvent('speech_input_result', {
                    module: 'ShadowingEngine',
                    lang,
                    chars: fullTranscript.trim().length,
                });
                applyTranscript(fullTranscript);
            } else if (state === 'recording') {
                setError('No speech detected. Speak clearly!');
                setState('idle');
            }
        };

        recRef.current = rec;
        rec.start();
        startWaveform();

        // Auto-stop after 15 seconds
        timeoutRef.current = setTimeout(() => {
            recRef.current?.stop();
        }, 15000);
    }, [startWaveform, stopWaveform, state, applyTranscript, requestTypedFallback, lang]);

    const stopRecording = useCallback(() => {
        clearTimeout(timeoutRef.current);
        recRef.current?.stop();
    }, []);

    // ====== Grade emoji ======
    const gradeEmoji = accuracy >= 90 ? '🌟' : accuracy >= 75 ? '👍' : accuracy >= 50 ? '💪' : '🔄';
    const gradeLabel = accuracy >= 90 ? 'Excellent!' : accuracy >= 75 ? 'Good job!' : accuracy >= 50 ? 'Not bad!' : 'Try again!';
    const submitManualTranscript = () => {
        if (!manualTranscript.trim()) return;
        setState('processing');
        recordCapabilityEvent('speech_input_manual_submitted', {
            module: 'ShadowingEngine',
            lang,
            chars: manualTranscript.trim().length,
        });
        applyTranscript(manualTranscript.trim());
    };

    const cancelManualTranscript = () => {
        setManualPrompt('');
        setManualTranscript('');
        setState('idle');
    };

    return (
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
            {/* ===== Target Sentence ===== */}
            <div style={{
                background: 'var(--color-surface)', borderRadius: '16px', padding: '20px',
                marginBottom: '16px', textAlign: 'center',
            }}>
                <p style={{ fontSize: lang === 'cn' ? '1.5rem' : '1.15rem', fontWeight: 600, margin: '0 0 6px', lineHeight: 1.6 }}>
                    {state === 'playing' && revealIdx >= 0 ? (
                        words.map((w, i) => (
                            <span key={i} className={`shadow-word ${i < revealIdx ? 'shadow-word--revealed' : i === revealIdx ? 'shadow-word--current' : 'shadow-word--hidden'}`}>
                                {w}{lang !== 'cn' ? ' ' : ''}
                            </span>
                        ))
                    ) : text}
                </p>
                {pinyin && <p style={{ fontSize: '0.9rem', color: '#8B5CF6', margin: '0 0 4px' }}>{pinyin}</p>}
                {textVi && showTranslation && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0 }}>🇻🇳 {textVi}</p>
                )}
            </div>

            {/* ===== Speed Control ===== */}
            <CapabilityNotice
                icon="🎙️"
                title="Speech capture mode"
                badge={readiness.speechInput.badge}
                tone={readiness.speechInput.status === 'supported' ? 'success' : 'warn'}
                summary={readiness.speechInput.summary}
                compact
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>🐢</span>
                {[0.6, 0.75, 0.85, 1.0].map(s => (
                    <button key={s} onClick={() => setSpeed(s)}
                        style={{
                            padding: '3px 10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                            fontSize: '0.7rem', fontWeight: speed === s ? 700 : 400,
                            background: speed === s ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: speed === s ? '#fff' : 'var(--color-text)',
                        }}>
                        {s}x
                    </button>
                ))}
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>🐇</span>
            </div>

            {/* ===== Waveform / Recording indicator ===== */}
            {state === 'recording' && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px',
                    height: '50px', marginBottom: '12px',
                }}>
                    {Array.from({ length: 20 }, (_, i) => {
                        const h = Math.max(4, waveAmplitude * 25 * (0.5 + Math.sin(i * 0.7 + Date.now() * 0.003) * 0.5));
                        return (
                            <div key={i} style={{
                                width: '4px', borderRadius: '2px',
                                height: `${h}px`,
                                background: `hsl(${220 + i * 6}, 80%, 60%)`,
                                transition: 'height 0.1s',
                            }} />
                        );
                    })}
                </div>
            )}

            {/* ===== Interim text (real-time) ===== */}
            {interim && state === 'recording' && (
                <div style={{
                    padding: '10px 16px', borderRadius: '10px', marginBottom: '12px',
                    background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.3)',
                    fontSize: '0.9rem', color: '#6366F1', fontStyle: 'italic', textAlign: 'center',
                }}>
                    ✏️ {interim}...
                </div>
            )}

            {/* ===== Action Buttons ===== */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
                <button onClick={playModel} disabled={state === 'recording' || state === 'playing'}
                    style={{
                        padding: '12px 20px', borderRadius: '24px', border: 'none', cursor: 'pointer',
                        background: state === 'playing' ? '#8B5CF6' : 'var(--color-surface)',
                        color: state === 'playing' ? '#fff' : 'var(--color-text)',
                        fontSize: '0.9rem', fontWeight: 600, opacity: state === 'recording' ? 0.5 : 1,
                        transition: 'all 0.2s',
                    }}>
                    {state === 'playing' ? '🔊 Playing...' : '🔊 Listen'}
                </button>

                {state !== 'recording' ? (
                    <button onClick={startRecording} disabled={state === 'playing' || state === 'processing'}
                        style={{
                            padding: '12px 24px', borderRadius: '24px', border: 'none', cursor: 'pointer',
                            background: 'linear-gradient(135deg, #EF4444, #DC2626)',
                            color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                            opacity: state === 'playing' ? 0.5 : 1,
                            boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                            transition: 'all 0.2s',
                        }}>
                        🎙️ Record
                    </button>
                ) : (
                    <button onClick={stopRecording}
                        style={{
                            padding: '12px 24px', borderRadius: '24px', border: 'none', cursor: 'pointer',
                            background: '#1F2937', color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                            animation: 'pulse 1.5s infinite',
                        }}>
                        ⏹️ Stop
                    </button>
                )}
            </div>

            {/* ===== Error ===== */}
            {error && (
                <div style={{
                    textAlign: 'center', padding: '10px', borderRadius: '10px',
                    background: '#FEF2F2', color: '#DC2626', fontSize: '0.85rem', marginBottom: '12px',
                }}>
                    ⚠️ {error}
                </div>
            )}

            {state === 'manual' && (
                <ManualTranscriptFallback
                    title="Manual transcript fallback"
                    description={manualPrompt || 'Speech capture is unavailable on this device. Type what you said to keep the shadowing loop active.'}
                    value={manualTranscript}
                    onChange={setManualTranscript}
                    onSubmit={submitManualTranscript}
                    onCancel={cancelManualTranscript}
                    placeholder="Type what you just said..."
                    submitLabel="Score This Attempt"
                    cancelLabel="Cancel"
                />
            )}

            {/* ===== RESULT: Word-by-Word Diff ===== */}
            {state === 'result' && wordDiffs.length > 0 && (
                <div style={{
                    background: 'var(--color-surface)', borderRadius: '16px', padding: '20px',
                    marginBottom: '16px',
                }}>
                    {/* Score header */}
                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '2.5rem' }}>{gradeEmoji}</span>
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, margin: '4px 0 2px', color: accuracy >= 75 ? '#059669' : '#DC2626' }}>
                            {accuracy}%
                        </p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0 }}>{gradeLabel}</p>
                        {attempts > 1 && (
                            <p style={{ fontSize: '0.75rem', color: '#8B5CF6', margin: '4px 0 0' }}>
                                Best: {bestScore}% · Attempt #{attempts}
                            </p>
                        )}
                    </div>

                    {/* Word-by-word diff */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '12px' }}>
                        {wordDiffs.map((d, i) => (
                            <span key={i} style={{
                                display: 'inline-block', padding: '4px 10px', borderRadius: '8px',
                                fontSize: lang === 'cn' ? '1.2rem' : '0.9rem', fontWeight: 600,
                                background: `${STATUS_COLORS[d.status]}15`,
                                color: STATUS_COLORS[d.status],
                                border: `1.5px solid ${STATUS_COLORS[d.status]}40`,
                                position: 'relative',
                            }}>
                                {d.word}
                                {d.status === 'perfect' && <span style={{ position: 'absolute', top: '-6px', right: '-4px', fontSize: '0.6rem' }}>✓</span>}
                            </span>
                        ))}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
                        <span><span style={{ color: STATUS_COLORS.perfect }}>●</span> Perfect</span>
                        <span><span style={{ color: STATUS_COLORS.close }}>●</span> Close</span>
                        <span><span style={{ color: STATUS_COLORS.wrong }}>●</span> Wrong</span>
                        <span><span style={{ color: STATUS_COLORS.missing }}>●</span> Missing</span>
                    </div>

                    {/* Your speech */}
                    <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(99,102,241,0.05)', fontSize: '0.85rem' }}>
                        <strong>You said:</strong> {finalText || '(no speech detected)'}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <button onClick={() => { setState('idle'); setWordDiffs([]); }}
                            style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer', fontWeight: 600 }}>
                            🔄 Retry
                        </button>
                        {onComplete && (
                            <button onClick={() => onComplete({ accuracy, attempts, bestScore })}
                                style={{ flex: 1, padding: '10px', borderRadius: '20px', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                                Next →
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Processing state */}
            {state === 'processing' && (
                <div style={{ textAlign: 'center', padding: '20px', color: '#6366F1' }}>
                    <div style={{ fontSize: '1.5rem', animation: 'spin 1s linear infinite' }}>⏳</div>
                    <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Analyzing pronunciation...</p>
                </div>
            )}
        </div>
    );
}

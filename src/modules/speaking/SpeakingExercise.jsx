// SpeakingExercise.jsx — Extracted to fix React hooks violation
// (Previously inline in SpeakingHub, hooks were called after conditional return)
import { useState, useRef, useCallback, useEffect } from 'react';
import CapabilityNotice from '../../components/CapabilityNotice';
import ManualTranscriptFallback from '../../components/ManualTranscriptFallback';
import { useGame } from '../../context/GameStateContext';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';
import { recordCapabilityEvent } from '../../services/capabilityService';
import { analyzeSpeakingAttempt, buildSpeakingRecap } from '../../services/speakingAnalyticsService';
import { speakText as speakTextUtil } from '../../utils/speakText';

function normalizeTemplateText(text) {
    return String(text || '')
        .replace(/[_\uFF3F]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function countUnits(text, lang = 'en') {
    const value = String(text || '').trim();
    if (!value) return 0;
    if (lang === 'cn') {
        return value.replace(/[，。！？、\s]/g, '').length;
    }
    return value.split(/\s+/).filter(Boolean).length;
}

function estimateExpectedTokens({ targetText, sampleAnswer, lessonType, part, lang }) {
    const targetCount = countUnits(targetText, lang);
    if (targetCount > 0) {
        return lang === 'cn'
            ? Math.max(2, targetCount)
            : Math.max(3, targetCount - 1);
    }

    const sampleCount = countUnits(sampleAnswer, lang);
    if (sampleCount > 0) {
        return sampleCount;
    }

    if (part === 2) return lang === 'cn' ? 18 : 40;
    if (part === 3) return lang === 'cn' ? 10 : 18;
    if (part === 1) return lang === 'cn' ? 6 : 8;
    if (lessonType === 'conversation') return lang === 'cn' ? 4 : 6;
    return lang === 'cn' ? 3 : 4;
}

export default function SpeakingExercise({ lesson, onBack, adult }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [recState, setRecState] = useState('idle');
    const [interimText, setInterimText] = useState('');
    const [finalText, setFinalText] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [scores, setScores] = useState([]);
    const [analysis, setAnalysis] = useState(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [prepPhase, setPrepPhase] = useState(lesson.prepTime > 0);
    const [prepTimer, setPrepTimer] = useState(lesson.prepTime || 0);
    const [manualTranscript, setManualTranscript] = useState('');
    const [manualPrompt, setManualPrompt] = useState('');
    const recognitionRef = useRef(null);
    const timeoutRef = useRef(null);
    const prepTimerRef = useRef(null);
    const voicesRef = useRef([]);
    const recordingStartedAtRef = useRef(0);
    const { updateSkillScore, addSpeakingRecap } = useGame();
    const { readiness } = useDeviceCapabilities();

    const items = lesson.type === 'ielts_speaking'
        ? (lesson.questions || [{ question: lesson.cueCard?.topic || '' }])
        : (lesson.sentences || lesson.prompts || []);
    const current = items[currentIdx];
    const lessonLang = lesson.lang === 'cn' ? 'cn' : 'en';
    const langCode = lessonLang === 'cn' ? 'zh-CN' : 'en-US';
    const promptText = current?.question || current?.text || lesson.cueCard?.topic || '';
    const promptTranslation = current?.textVi || current?.questionVi || '';
    const sampleAnswer = normalizeTemplateText(current?.sampleAnswer || lesson.sampleAnswer || '');
    const samplePinyin = current?.samplePinyin || '';

    // Pre-load voices on mount (Chrome loads them async)
    useEffect(() => {
        const loadVoices = () => { voicesRef.current = window.speechSynthesis.getVoices(); };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    // Prep timer countdown for Part 2
    useEffect(() => {
        if (prepPhase && prepTimer > 0) {
            prepTimerRef.current = setInterval(() => {
                setPrepTimer(prev => {
                    if (prev <= 1) { clearInterval(prepTimerRef.current); setPrepPhase(false); return 0; }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(prepTimerRef.current);
    }, [prepPhase, prepTimer]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
            clearTimeout(timeoutRef.current);
            clearInterval(prepTimerRef.current);
            window.speechSynthesis.cancel();
        };
    }, []);

    const scoreTranscript = useCallback((spokenText, durationMs = 0) => {
        const targetText = current?.text || '';
        const promptContext = current?.question || current?.text || lesson.cueCard?.topic || '';
        const cleanedSampleAnswer = normalizeTemplateText(current?.sampleAnswer || lesson.sampleAnswer || '');
        const analytics = analyzeSpeakingAttempt({
            spokenText,
            lang: lessonLang,
            durationMs,
            targetText,
            promptText: promptContext,
            sampleAnswer: cleanedSampleAnswer,
            tip: current?.tip || current?.tipVi || '',
            expectedMinTokens: estimateExpectedTokens({
                targetText,
                sampleAnswer: cleanedSampleAnswer,
                lessonType: lesson.type,
                part: lesson.part,
                lang: lessonLang,
            }),
        });

        setAnalysis(analytics);
        setFinalText(spokenText);
        setScores(prev => [...prev, analytics.overallScore]);
        updateSkillScore('speaking', analytics.overallScore);
        addSpeakingRecap(buildSpeakingRecap({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            lang: lessonLang,
            promptText: promptContext,
            targetText,
            transcript: spokenText,
            analytics,
            source: lesson.type === 'ielts_speaking'
                ? `ielts_part_${lesson.part || 0}`
                : lesson.type || 'speaking',
        }));

        setTimeout(() => {
            setRecState('done');
            setShowResult(true);
        }, 300);
    }, [
        addSpeakingRecap,
        current,
        lesson.cueCard?.topic,
        lesson.id,
        lesson.part,
        lesson.sampleAnswer,
        lesson.title,
        lesson.type,
        lessonLang,
        updateSkillScore,
    ]);

    const requestTypedFallback = useCallback((message) => {
        setManualPrompt(message);
        setManualTranscript('');
        setAnalysis(null);
        recordingStartedAtRef.current = 0;
        setRecState('manual');
        recordCapabilityEvent('speech_input_fallback_triggered', {
            module: 'SpeakingExercise',
            lessonId: lesson.id,
            lang: langCode,
        });
    }, [langCode, lesson.id]);

    const speakText = useCallback((text) => {
        setIsSpeaking(true);
        speakTextUtil(text, {
            lang: langCode,
            rate: 0.85,
            onEnd: () => setIsSpeaking(false),
        });
    }, [langCode]);

    const startRecording = useCallback(async () => {
        setErrorMsg('');
        setInterimText('');
        setFinalText('');
        setShowResult(false);
        setAnalysis(null);
        setManualPrompt('');
        setManualTranscript('');
        recordingStartedAtRef.current = 0;

        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            requestTypedFallback(adult
                ? 'Speech recognition is unavailable. Type what you said to continue scoring:'
                : 'Thiết bị chưa hỗ trợ nhận diện giọng nói. Hãy nhập câu con vừa nói để tiếp tục chấm điểm:');
            return;
        }

        setRecState('requesting');
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            requestTypedFallback(adult
                ? 'Microphone is unavailable. Type what you said to continue scoring:'
                : 'Micro chưa sẵn sàng. Hãy nhập câu con vừa nói để tiếp tục chấm điểm:');
            return;
        }

        const rec = new SR();
        rec.lang = langCode;
        rec.interimResults = true;
        rec.continuous = true;
        rec.maxAlternatives = 3;
        recordCapabilityEvent('speech_input_started', {
            module: 'SpeakingExercise',
            lessonId: lesson.id,
            lang: langCode,
        });

        let fullTranscript = '';

        rec.onresult = (e) => {
            let interim = '';
            let final = '';
            for (let i = 0; i < e.results.length; i++) {
                if (e.results[i].isFinal) final += e.results[i][0].transcript;
                else interim += e.results[i][0].transcript;
            }
            if (final) {
                fullTranscript = final;
                setFinalText(final);
                setInterimText('');
            } else {
                setInterimText(interim);
            }
        };

        rec.onerror = (e) => {
            clearTimeout(timeoutRef.current);
            if (e.error === 'aborted') return;
            if (e.error === 'not-allowed' || e.error === 'audio-capture' || e.error === 'service-not-allowed') {
                requestTypedFallback(adult
                    ? 'Microphone is blocked. Type what you said to continue scoring:'
                    : 'Không truy cập được micro. Hãy nhập câu con vừa nói để tiếp tục chấm điểm:');
                return;
            }
            recordCapabilityEvent('speech_input_error', {
                module: 'SpeakingExercise',
                lessonId: lesson.id,
                lang: langCode,
                error: e.error,
            });
            setRecState('error');
            const msgs = {
                'not-allowed': adult ? 'Microphone blocked. Check settings.' : 'Micro bị chặn!',
                'no-speech': adult ? 'No speech detected. Speak louder.' : 'Không nghe thấy. Nói to hơn nhé!',
                'audio-capture': adult ? 'No microphone found.' : 'Không tìm thấy micro!',
                'network': adult ? 'Network error. Check connection.' : 'Lỗi mạng!',
            };
            setErrorMsg(msgs[e.error] || `Error: ${e.error}`);
        };

        rec.onend = () => {
            clearTimeout(timeoutRef.current);
            if (fullTranscript) {
                setRecState('processing');
                recordCapabilityEvent('speech_input_result', {
                    module: 'SpeakingExercise',
                    lessonId: lesson.id,
                    lang: langCode,
                    chars: fullTranscript.trim().length,
                });
                scoreTranscript(fullTranscript, Date.now() - recordingStartedAtRef.current);
            } else {
                setRecState('error');
                setErrorMsg(adult ? 'No speech detected. Tap Record and speak clearly.' : 'Không nghe thấy. Nhấn Ghi âm và nói rõ ràng!');
            }
        };

        recognitionRef.current = rec;
        try {
            rec.start();
            recordingStartedAtRef.current = Date.now();
            setRecState('listening');
            timeoutRef.current = setTimeout(() => { recognitionRef.current?.stop(); }, 15000);
        } catch {
            setRecState('error');
            setErrorMsg(adult ? 'Failed to start. Try again.' : 'Không bắt đầu được. Thử lại!');
        }
    }, [adult, requestTypedFallback, scoreTranscript, langCode, lesson.id]);

    const stopRecording = useCallback(() => {
        clearTimeout(timeoutRef.current);
        recognitionRef.current?.stop();
    }, []);

    const handleNext = () => {
        if (currentIdx + 1 >= items.length) setCurrentIdx(0);
        else setCurrentIdx(i => i + 1);
        setShowResult(false);
        setFinalText('');
        setInterimText('');
        setRecState('idle');
        setErrorMsg('');
        setAnalysis(null);
        setManualPrompt('');
        setManualTranscript('');
    };

    const retryRecording = () => {
        setRecState('idle');
        setErrorMsg('');
        setFinalText('');
        setInterimText('');
        setShowResult(false);
        setAnalysis(null);
        setManualPrompt('');
        setManualTranscript('');
        recordingStartedAtRef.current = 0;
    };

    const submitManualTranscript = () => {
        if (!manualTranscript.trim()) return;
        setRecState('processing');
        recordCapabilityEvent('speech_input_manual_submitted', {
            module: 'SpeakingExercise',
            lessonId: lesson.id,
            lang: langCode,
            chars: manualTranscript.trim().length,
        });
        scoreTranscript(manualTranscript.trim(), 0);
    };

    const cancelManualTranscript = () => {
        setManualPrompt('');
        setManualTranscript('');
        setAnalysis(null);
        setRecState('idle');
    };

    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const latestScore = analysis?.overallScore ?? scores[scores.length - 1] ?? 0;

    const statusConfig = {
        idle: { label: adult ? 'Tap Record to start' : 'Nhấn Ghi âm để bắt đầu', color: '#94A3B8' },
        requesting: { label: adult ? 'Requesting microphone...' : 'Đang xin quyền micro...', color: '#F59E0B' },
        listening: { label: adult ? '🔴 Listening... Speak now!' : '🔴 Đang nghe... Nói đi!', color: '#EF4444' },
        processing: { label: adult ? 'Processing...' : 'Đang xử lý...', color: '#6366F1' },
        done: { label: adult ? 'Result ready' : 'Có kết quả', color: '#10B981' },
        manual: { label: adult ? 'Manual transcript mode' : 'Chế độ nhập câu thủ công', color: '#B45309' },
        error: { label: errorMsg || 'Error', color: '#EF4444' },
    };
    const status = statusConfig[recState];

    return (
        <div className="speaking-exercise page">
            <div className="ll-header">
                <button className="ll-back" onClick={onBack}>←</button>
                <div className="ll-title-group">
                    <h2 className="ll-title">{lesson.emoji} {lesson.title}</h2>
                    <div className="ll-meta">
                        <span className="ll-badge level">{lesson.level}</span>
                        <span className="ll-badge topic">{lesson.type === 'shadowing' ? 'Shadowing' : lesson.type === 'ielts_speaking' ? `Part ${lesson.part}` : lesson.type}</span>
                        {scores.length > 0 && <span className="ll-badge duration">Avg: {avgScore}%</span>}
                    </div>
                </div>
            </div>

            <div className="sp-progress">
                <span>Câu {currentIdx + 1} / {items.length}</span>
                <div className="dictation-progress-bar"><div className="dictation-progress-fill" style={{ width: `${((currentIdx + 1) / items.length) * 100}%` }} /></div>
            </div>

            {/* IELTS Part 2: Prep Phase with Timer */}
            {prepPhase && lesson.part === 2 && lesson.cueCard && (
                <div style={{ textAlign: 'center', padding: '24px 16px', background: 'rgba(99,102,241,0.08)', borderRadius: '16px', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '16px' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📝</div>
                    <p style={{ color: '#C7D2FE', fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>
                        {adult ? 'Preparation Time' : 'Thời gian chuẩn bị'}
                    </p>
                    <div style={{ fontSize: '3rem', fontWeight: 700, color: prepTimer <= 10 ? '#FB7185' : '#818CF8', fontFamily: 'monospace' }}>
                        {Math.floor(prepTimer / 60)}:{(prepTimer % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="sp-cue-card" style={{ textAlign: 'left' }}>
                        <h3>📋 Cue Card</h3>
                        <p className="sp-cue-topic">{lesson.cueCard.topic}</p>
                        <ul>{lesson.cueCard.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                    </div>
                    <button onClick={() => { clearInterval(prepTimerRef.current); setPrepPhase(false); setPrepTimer(0); }}
                        style={{ marginTop: '16px', padding: '10px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(129,140,248,0.2)', color: '#C7D2FE', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
                        {adult ? 'Skip → Start Speaking' : 'Bỏ qua → Bắt đầu nói'}
                    </button>
                </div>
            )}

            {/* Current sentence/question */}
            <div className="sp-sentence-card">
                <CapabilityNotice
                    icon="🎙️"
                    title={adult ? 'Speech capture mode' : 'Chế độ nhận diện giọng nói'}
                    badge={readiness.speechInput.badge}
                    tone={readiness.speechInput.status === 'supported' ? 'success' : 'warn'}
                    summary={readiness.speechInput.summary}
                    compact
                />
                <p className="sp-sentence-text">{promptText}</p>
                {promptTranslation && <p className="sp-sentence-vi">🇻🇳 {promptTranslation}</p>}
                {current?.pinyin && <p style={{ color: '#8B5CF6', fontSize: '0.9rem', margin: '4px 0' }}>{current.pinyin}</p>}
                {(current?.tip || current?.tipVi) && <p className="sp-tip">💡 {current?.tip || current?.tipVi}</p>}
                {sampleAnswer && !current?.text && (
                    <div style={{
                        marginTop: '12px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(59,130,246,0.08)',
                        border: '1px solid rgba(59,130,246,0.18)',
                    }}>
                        <strong style={{ display: 'block', marginBottom: '4px', color: '#1D4ED8', fontSize: '0.82rem' }}>
                            {adult ? 'Suggested response frame' : 'Khung trả lời gợi ý'}
                        </strong>
                        <p style={{ margin: 0, fontSize: '0.92rem', lineHeight: 1.5 }}>{sampleAnswer}</p>
                        {samplePinyin && (
                            <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#8B5CF6' }}>
                                {samplePinyin}
                            </p>
                        )}
                    </div>
                )}
                {!(window.SpeechRecognition || window.webkitSpeechRecognition) && (
                    <p style={{
                        margin: '8px 0 0',
                        fontSize: '0.8rem',
                        color: '#B45309',
                        background: 'rgba(245,158,11,0.12)',
                        border: '1px solid rgba(245,158,11,0.24)',
                        borderRadius: '10px',
                        padding: '8px 12px',
                    }}>
                        Thiết bị chưa có nhận diện giọng nói trực tiếp. Nhấn Ghi âm để chuyển sang chế độ nhập câu và vẫn nhận điểm.
                    </p>
                )}

                {/* Status Indicator */}
                <div className="sp-status" style={{
                    padding: '10px 16px', margin: '12px 0', borderRadius: '10px',
                    background: `${status.color}15`, border: `1px solid ${status.color}30`,
                    color: status.color, fontSize: '0.9rem', fontWeight: 600,
                    textAlign: 'center', transition: 'all 0.3s ease',
                    animation: recState === 'listening' ? 'pulse 1.5s infinite' : 'none'
                }}>
                    {status.label}
                </div>

                {/* Interim text */}
                {interimText && recState === 'listening' && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '10px',
                        background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.3)',
                        color: '#A5B4FC', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '12px'
                    }}>
                        ✏️ {interimText}...
                    </div>
                )}

                <div className="sp-controls">
                    <button className="dict-play-btn"
                        onClick={() => speakText(current?.text || current?.question)}
                        disabled={isSpeaking || recState === 'listening'}
                        style={{ opacity: (isSpeaking || recState === 'listening') ? 0.5 : 1 }}>
                        {isSpeaking ? '🔊 ...' : '🔊'} {adult ? 'Listen' : 'Nghe mẫu'}
                    </button>

                    {recState === 'idle' || recState === 'done' || recState === 'error' ? (
                        <button className="sp-record-btn" onClick={startRecording}>
                            🎙️ {adult ? 'Record' : 'Ghi âm'}
                        </button>
                    ) : recState === 'listening' ? (
                        <button className="sp-record-btn recording" onClick={stopRecording}>
                            ⏹️ {adult ? 'Stop' : 'Dừng'}
                        </button>
                    ) : (
                        <button className="sp-record-btn" disabled style={{ opacity: 0.5 }}>
                            ⏳ {adult ? 'Wait...' : 'Đợi...'}
                        </button>
                    )}
                </div>

                {/* Error with retry */}
                {recState === 'error' && errorMsg && (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                        <button className="dictation-next-btn" onClick={retryRecording} style={{ marginTop: '8px' }}>
                            🔄 {adult ? 'Try Again' : 'Thử lại'}
                        </button>
                    </div>
                )}

                {recState === 'manual' && (
                    <ManualTranscriptFallback
                        title={adult ? 'Manual transcript fallback' : 'Nhập câu để tiếp tục chấm điểm'}
                        description={manualPrompt || (adult
                            ? 'Speech capture is unavailable on this device. Type what you said to keep practicing.'
                            : 'Thiết bị chưa thu giọng nói ổn định. Hãy nhập câu vừa nói để vẫn tiếp tục chấm điểm.')}
                        value={manualTranscript}
                        onChange={setManualTranscript}
                        onSubmit={submitManualTranscript}
                        onCancel={cancelManualTranscript}
                        placeholder={adult ? 'Type your response here...' : 'Nhập câu vừa nói ở đây...'}
                        submitLabel={adult ? 'Score This Attempt' : 'Chấm lần nói này'}
                        cancelLabel={adult ? 'Cancel' : 'Hủy'}
                    />
                )}

                {showResult && (
                    <div className="sp-result">
                        <div className={`dictation-accuracy ${latestScore >= 80 ? 'good' : latestScore >= 50 ? 'ok' : 'poor'}`}>
                            {latestScore}% {adult ? 'Coaching Score' : 'Điểm coaching'}
                        </div>
                        <div className="sp-your-speech">
                            <strong>{adult ? 'Your speech:' : 'Bạn nói:'}</strong>
                            <p>{finalText || '(Could not detect speech)'}</p>
                        </div>
                        {analysis?.metrics?.length > 0 && (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: '8px',
                                marginTop: '12px',
                            }}>
                                {analysis.metrics.map((metric) => (
                                    <div
                                        key={metric.key}
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: '12px',
                                            background: 'rgba(15,23,42,0.04)',
                                            border: '1px solid rgba(148,163,184,0.22)',
                                        }}
                                    >
                                        <div style={{ fontSize: '0.76rem', color: '#64748B', marginBottom: '4px' }}>
                                            {metric.label}
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                                            {metric.score}%
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', lineHeight: 1.4 }}>
                                            {metric.insight}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {analysis?.recommendations?.length > 0 && (
                            <div style={{
                                marginTop: '12px',
                                padding: '12px 14px',
                                borderRadius: '12px',
                                background: 'rgba(34,197,94,0.08)',
                                border: '1px solid rgba(34,197,94,0.2)',
                            }}>
                                <strong style={{ display: 'block', marginBottom: '6px' }}>
                                    {adult ? 'Next-step coaching' : 'Gợi ý cải thiện'}
                                </strong>
                                <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.5 }}>
                                    {analysis.recommendations.map((recommendation) => (
                                        <li key={recommendation}>{recommendation}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {analysis?.note && (
                            <p style={{ marginTop: '12px', fontSize: '0.75rem', color: '#64748B', lineHeight: 1.45 }}>
                                {analysis.note}
                            </p>
                        )}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button className="dict-play-btn" onClick={startRecording} style={{ flex: 1 }}>
                                🔄 {adult ? 'Try Again' : 'Thử lại'}
                            </button>
                            <button className="dictation-next-btn" onClick={handleNext} style={{ flex: 1 }}>
                                {currentIdx + 1 >= items.length ? '🔁 Làm lại' : '→ Câu tiếp'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

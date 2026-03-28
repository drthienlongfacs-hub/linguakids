// SpeakingExercise.jsx — Extracted to fix React hooks violation
// (Previously inline in SpeakingHub, hooks were called after conditional return)
import { useState, useRef, useCallback, useEffect } from 'react';

export default function SpeakingExercise({ lesson, onBack, adult }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [recState, setRecState] = useState('idle');
    const [interimText, setInterimText] = useState('');
    const [finalText, setFinalText] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [scores, setScores] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [prepPhase, setPrepPhase] = useState(lesson.prepTime > 0);
    const [prepTimer, setPrepTimer] = useState(lesson.prepTime || 0);
    const recognitionRef = useRef(null);
    const timeoutRef = useRef(null);
    const prepTimerRef = useRef(null);
    const voicesRef = useRef([]);

    const items = lesson.type === 'ielts_speaking'
        ? (lesson.questions || [{ question: lesson.cueCard?.topic || '' }])
        : (lesson.sentences || lesson.prompts || []);
    const current = items[currentIdx];

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

    const langCode = lesson.lang === 'cn' ? 'zh-CN' : 'en-US';
    const isChinese = langCode.startsWith('zh');

    const scoreTranscript = useCallback((spokenText) => {
        const original = (current?.text || current?.question || '')
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fff\s]/g, '');
        const spoken = String(spokenText || '')
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fff\s]/g, '');
        const origWords = isChinese
            ? original.replace(/\s/g, '').split('').filter(Boolean)
            : original.split(/\s+/).filter(Boolean);
        const spokenWords = isChinese
            ? spoken.replace(/\s/g, '').split('').filter(Boolean)
            : spoken.split(/\s+/).filter(Boolean);

        let matched = 0;
        for (const unit of origWords) {
            if (spokenWords.includes(unit)) {
                matched++;
            }
        }

        const accuracy = Math.round((matched / Math.max(origWords.length, 1)) * 100);
        setFinalText(spokenText);
        setScores(prev => [...prev, accuracy]);
        setTimeout(() => {
            setRecState('done');
            setShowResult(true);
        }, 300);
    }, [current, isChinese]);

    const requestTypedFallback = useCallback((message) => {
        const typed = prompt(message);
        if (typed && typed.trim()) {
            setRecState('processing');
            scoreTranscript(typed.trim());
            return;
        }

        setRecState('idle');
    }, [scoreTranscript]);

    const speakText = useCallback((text) => {
        window.speechSynthesis.cancel();
        setIsSpeaking(true);
        const u = new SpeechSynthesisUtterance(text);
        u.lang = langCode;
        u.rate = 0.85;
        const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
        const v = voices.find(v => v.lang === langCode) || voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
        if (v) u.voice = v;
        u.onend = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
    }, [langCode]);

    const startRecording = useCallback(async () => {
        setErrorMsg('');
        setInterimText('');
        setFinalText('');
        setShowResult(false);

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
                scoreTranscript(fullTranscript);
            } else {
                setRecState('error');
                setErrorMsg(adult ? 'No speech detected. Tap Record and speak clearly.' : 'Không nghe thấy. Nhấn Ghi âm và nói rõ ràng!');
            }
        };

        recognitionRef.current = rec;
        try {
            rec.start();
            setRecState('listening');
            timeoutRef.current = setTimeout(() => { recognitionRef.current?.stop(); }, 15000);
        } catch {
            setRecState('error');
            setErrorMsg(adult ? 'Failed to start. Try again.' : 'Không bắt đầu được. Thử lại!');
        }
    }, [adult, requestTypedFallback, scoreTranscript, langCode]);

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
    };

    const retryRecording = () => {
        setRecState('idle');
        setErrorMsg('');
        setFinalText('');
        setInterimText('');
        setShowResult(false);
    };

    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const statusConfig = {
        idle: { label: adult ? 'Tap Record to start' : 'Nhấn Ghi âm để bắt đầu', color: '#94A3B8' },
        requesting: { label: adult ? 'Requesting microphone...' : 'Đang xin quyền micro...', color: '#F59E0B' },
        listening: { label: adult ? '🔴 Listening... Speak now!' : '🔴 Đang nghe... Nói đi!', color: '#EF4444' },
        processing: { label: adult ? 'Processing...' : 'Đang xử lý...', color: '#6366F1' },
        done: { label: adult ? 'Result ready' : 'Có kết quả', color: '#10B981' },
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
                <p className="sp-sentence-text">{current?.text || current?.question}</p>
                {current?.textVi && <p className="sp-sentence-vi">🇻🇳 {current.textVi}</p>}
                {current?.pinyin && <p style={{ color: '#8B5CF6', fontSize: '0.9rem', margin: '4px 0' }}>{current.pinyin}</p>}
                {current?.tip && <p className="sp-tip">💡 {current.tip}</p>}
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

                {showResult && (
                    <div className="sp-result">
                        <div className={`dictation-accuracy ${scores[scores.length - 1] >= 80 ? 'good' : scores[scores.length - 1] >= 50 ? 'ok' : 'poor'}`}>
                            {scores[scores.length - 1]}% Match
                        </div>
                        <div className="sp-your-speech">
                            <strong>{adult ? 'Your speech:' : 'Bạn nói:'}</strong>
                            <p>{finalText || '(Could not detect speech)'}</p>
                        </div>
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

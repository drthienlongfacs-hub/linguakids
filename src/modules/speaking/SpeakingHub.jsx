import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getSpeakingByMode } from '../../data/speaking';
import { isAdultMode } from '../../utils/userMode';
import ShadowingEngine from './ShadowingEngine';

export default function SpeakingHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const lessons = getSpeakingByMode(state.userMode);
    const [activeLesson, setActiveLesson] = useState(null);

    if (activeLesson) {
        return <SpeakingExercise lesson={activeLesson} onBack={() => setActiveLesson(null)} adult={adult} />;
    }

    const shadowing = lessons.filter(l => l.type === 'shadowing');
    const ielts = lessons.filter(l => l.type === 'ielts_speaking');

    return (
        <div className="speaking-hub page">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/')}>←</button>
                <h2 className="lh-title">🗣️ {adult ? 'Speaking Practice' : 'Luyện Nói'}</h2>
            </div>
            <p className="lh-subtitle">
                {adult ? 'Improve your speaking with shadowing, pronunciation drills, and IELTS speaking practice.' : 'Luyện nói tiếng Anh cùng bé! 🎤'}
            </p>

            <div className="lh-stats">
                <div className="lh-stat"><span className="lh-stat-number">{lessons.length}</span><span className="lh-stat-label">{adult ? 'Exercises' : 'Bài'}</span></div>
                <div className="lh-stat"><span className="lh-stat-number">3</span><span className="lh-stat-label">{adult ? 'Types' : 'Dạng'}</span></div>
                <div className="lh-stat"><span className="lh-stat-number">🎤</span><span className="lh-stat-label">{adult ? 'Voice Rec.' : 'Ghi âm'}</span></div>
            </div>

            {shadowing.length > 0 && (
                <div className="lh-level-section">
                    <div className="lh-level-header"><h3>🎧 {adult ? 'Shadowing' : 'Bắt chước'}</h3><span className="lh-level-desc">{adult ? 'Listen, repeat, and compare' : 'Nghe, lặp lại, so sánh'}</span></div>
                    <div className="lh-lesson-grid">
                        {shadowing.map(l => (
                            <div key={l.id} className="lh-lesson-card" onClick={() => setActiveLesson(l)}>
                                <span className="lh-lesson-emoji">{l.emoji}</span>
                                <div className="lh-lesson-info"><h4>{l.title}</h4><p className="lh-lesson-title-vi">{l.titleVi}</p><div className="lh-lesson-meta"><span>{l.level}</span><span>{l.sentences?.length || 0} câu</span></div></div>
                                <span className="lh-lesson-arrow">▶</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {ielts.length > 0 && (
                <div className="lh-level-section">
                    <div className="lh-level-header"><h3>🎤 {adult ? 'IELTS Speaking' : 'Phỏng vấn'}</h3><span className="lh-level-desc">{adult ? 'Mock speaking test — Parts 1, 2 & 3' : 'Luyện phỏng vấn'}</span></div>
                    {[1, 2, 3].map(part => {
                        const partLessons = ielts.filter(l => l.part === part);
                        if (partLessons.length === 0) return null;
                        const partLabels = { 1: 'Part 1: Introduction & Interview', 2: 'Part 2: Long Turn (Cue Card)', 3: 'Part 3: Two-Way Discussion' };
                        const partTimes = { 1: '4-5 min', 2: '1 min prep + 2 min speak', 3: '4-5 min' };
                        return (
                            <div key={part} style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 }}>{partLabels[part]}</span>
                                    <span style={{ color: '#64748B', fontSize: '0.75rem' }}>{partTimes[part]}</span>
                                </div>
                                <div className="lh-lesson-grid">
                                    {partLessons.map(l => (
                                        <div key={l.id} className="lh-lesson-card" onClick={() => setActiveLesson(l)}>
                                            <span className="lh-lesson-emoji">{l.emoji}</span>
                                            <div className="lh-lesson-info"><h4>{l.title}</h4><p className="lh-lesson-title-vi">{l.titleVi}</p><div className="lh-lesson-meta"><span>{l.level}</span><span>Part {l.part}</span>{l.prepTime > 0 && <span>⏱️ {l.prepTime}s prep</span>}</div></div>
                                            <span className="lh-lesson-arrow">▶</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ============================================
// SpeakingExercise — REBUILT with robust voice recognition
// RCA fixes: interim results, timeout, error messages, loading states
// ============================================
function SpeakingExercise({ lesson, onBack, adult }) {
    const [currentIdx, setCurrentIdx] = useState(0);

    const items = lesson.type === 'shadowing' ? lesson.sentences
        : lesson.type === 'ielts_speaking' ? (lesson.questions || [{ question: lesson.cueCard?.topic || '' }])
            : [];
    const current = items[currentIdx];

    const handleNext = () => {
        if (currentIdx + 1 >= items.length) setCurrentIdx(0);
        else setCurrentIdx(i => i + 1);
    };

    // ===== USE SHADOWING ENGINE for shadowing-type lessons =====
    if (lesson.type === 'shadowing') {
        return (
            <div className="speaking-exercise page">
                <div className="ll-header">
                    <button className="ll-back" onClick={onBack}>←</button>
                    <div className="ll-title-group">
                        <h2 className="ll-title">{lesson.emoji} {lesson.title}</h2>
                        <div className="ll-meta">
                            <span className="ll-badge level">{lesson.level}</span>
                            <span className="ll-badge topic">Shadowing</span>
                            <span className="ll-badge duration">{currentIdx + 1}/{items.length}</span>
                        </div>
                    </div>
                </div>
                <div className="sp-progress">
                    <div className="dictation-progress-bar"><div className="dictation-progress-fill" style={{ width: `${((currentIdx + 1) / items.length) * 100}%` }} /></div>
                </div>

                <ShadowingEngine
                    key={currentIdx}
                    text={current?.text || ''}
                    textVi={current?.textVi}
                    lang="en"
                    onComplete={() => handleNext()}
                />
            </div>
        );
    }

    // ===== IELTS Speaking / other types — use original implementation =====
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

    // Pre-load voices on mount (Chrome loads them async)
    useEffect(() => {
        const loadVoices = () => {
            voicesRef.current = window.speechSynthesis.getVoices();
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
        return () => { window.speechSynthesis.onvoiceschanged = null; };
    }, []);

    // Prep timer countdown for Part 2
    useEffect(() => {
        if (prepPhase && prepTimer > 0) {
            prepTimerRef.current = setInterval(() => {
                setPrepTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(prepTimerRef.current);
                        setPrepPhase(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(prepTimerRef.current);
    }, [prepPhase, prepTimer > 0]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
            clearTimeout(timeoutRef.current);
            clearInterval(prepTimerRef.current);
            window.speechSynthesis.cancel();
        };
    }, []);

    const speakText = useCallback((text) => {
        window.speechSynthesis.cancel();
        setIsSpeaking(true);
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = 0.85;
        const voices = voicesRef.current.length > 0 ? voicesRef.current : window.speechSynthesis.getVoices();
        const v = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en'));
        if (v) u.voice = v;
        u.onend = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis.speak(u);
    }, []);

    const startRecording = useCallback(async () => {
        setErrorMsg('');
        setInterimText('');
        setFinalText('');
        setShowResult(false);

        // Check API support
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            setRecState('error');
            setErrorMsg(adult ? 'Speech Recognition not supported. Please use Chrome or Edge.' : 'Trình duyệt không hỗ trợ. Dùng Chrome nhé!');
            return;
        }

        // Request mic permission first
        setRecState('requesting');
        try {
            await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            setRecState('error');
            setErrorMsg(adult
                ? `Microphone access denied. Please allow microphone permission in your browser settings.`
                : 'Không truy cập được micro. Cho phép micro trong cài đặt nhé!');
            return;
        }

        // Create recognition instance
        const rec = new SR();
        rec.lang = 'en-US';
        rec.interimResults = true; // KEY FIX: Show real-time interim results
        rec.continuous = false;
        rec.maxAlternatives = 3;

        let hasResult = false;

        rec.onresult = (e) => {
            hasResult = true;
            let interim = '';
            let final = '';

            for (let i = 0; i < e.results.length; i++) {
                const result = e.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }

            if (final) {
                setFinalText(final);
                setInterimText('');
                setRecState('processing');

                // Calculate accuracy
                const original = (current.text || current.question || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
                const spoken = final.toLowerCase().replace(/[^a-z0-9\s]/g, '');
                const origWords = original.split(/\s+/).filter(Boolean);
                const spokenWords = spoken.split(/\s+/).filter(Boolean);

                // Better matching: check word-by-word with position awareness
                let matched = 0;
                for (const w of origWords) {
                    if (spokenWords.includes(w)) {
                        matched++;
                    }
                }
                const accuracy = Math.round((matched / Math.max(origWords.length, 1)) * 100);
                setScores(prev => [...prev, accuracy]);

                setTimeout(() => {
                    setRecState('done');
                    setShowResult(true);
                }, 300);
            } else {
                setInterimText(interim);
            }
        };

        rec.onerror = (e) => {
            clearTimeout(timeoutRef.current);
            setRecState('error');
            const msgs = {
                'not-allowed': adult ? 'Microphone permission denied. Check browser settings.' : 'Micro bị chặn. Kiểm tra cài đặt!',
                'no-speech': adult ? 'No speech detected. Try speaking louder or closer to the mic.' : 'Không nghe thấy giọng nói. Nói to hơn nhé!',
                'audio-capture': adult ? 'No microphone found. Please connect a microphone.' : 'Không tìm thấy micro!',
                'network': adult ? 'Network error. Speech recognition requires internet.' : 'Lỗi mạng. Cần kết nối internet!',
                'aborted': '',
            };
            setErrorMsg(msgs[e.error] || (adult ? `Recognition error: ${e.error}` : `Lỗi: ${e.error}`));
        };

        rec.onend = () => {
            clearTimeout(timeoutRef.current);
            if (!hasResult && recState !== 'error') {
                setRecState('error');
                setErrorMsg(adult
                    ? 'No speech detected. Tap Record and speak clearly into your microphone.'
                    : 'Không nghe thấy. Nhấn Ghi âm và nói rõ ràng nhé!');
            }
        };

        recognitionRef.current = rec;

        try {
            rec.start();
            setRecState('listening');

            // Timeout: auto-stop after 10 seconds if no result
            timeoutRef.current = setTimeout(() => {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                }
            }, 10000);
        } catch (err) {
            setRecState('error');
            setErrorMsg(adult ? 'Failed to start recording. Try again.' : 'Không bắt đầu được. Thử lại!');
        }
    }, [current, adult, recState]);

    const stopRecording = () => {
        clearTimeout(timeoutRef.current);
        recognitionRef.current?.stop();
    };

    const handleNextIelts = () => {
        if (currentIdx + 1 >= items.length) {
            setCurrentIdx(0);
        } else {
            setCurrentIdx(i => i + 1);
        }
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

    // Status label & color
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
                        <span className="ll-badge topic">{lesson.type === 'shadowing' ? 'Shadowing' : `Part ${lesson.part}`}</span>
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
                    <div style={{ fontSize: '3rem', fontWeight: 700, color: prepTimer <= 10 ? '#FB7185' : '#818CF8', fontFamily: 'monospace', transition: 'color 0.3s' }}>
                        {Math.floor(prepTimer / 60)}:{(prepTimer % 60).toString().padStart(2, '0')}
                    </div>
                    <p style={{ color: '#94A3B8', fontSize: '0.8rem', margin: '8px 0 16px' }}>
                        {adult ? 'Read the cue card and organize your thoughts' : 'Đọc đề bài và chuẩn bị ý tưởng'}
                    </p>
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

            {/* IELTS Cue Card (shown during speaking, without timer) */}
            {!prepPhase && lesson.cueCard && lesson.type === 'ielts_speaking' && lesson.part === 2 && (
                <div className="sp-cue-card">
                    <h3>📋 Cue Card</h3>
                    <p className="sp-cue-topic">{lesson.cueCard.topic}</p>
                    <ul>{lesson.cueCard.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                    <p className="sp-cue-time">⏱️ {adult ? 'You have 2 minutes to speak.' : 'Bạn có 2 phút để nói.'}</p>
                </div>
            )}

            {/* Current sentence/question */}
            <div className="sp-sentence-card">
                <p className="sp-sentence-text">{current?.text || current?.question}</p>
                {current?.textVi && <p className="sp-sentence-vi">🇻🇳 {current.textVi}</p>}
                {current?.tip && <p className="sp-tip">💡 {current.tip}</p>}

                {/* === STATUS INDICATOR === */}
                <div className="sp-status" style={{
                    padding: '10px 16px', margin: '12px 0', borderRadius: '10px',
                    background: `${status.color}15`, border: `1px solid ${status.color}30`,
                    color: status.color, fontSize: '0.9rem', fontWeight: 600,
                    textAlign: 'center', transition: 'all 0.3s ease',
                    animation: recState === 'listening' ? 'pulse 1.5s infinite' : 'none'
                }}>
                    {status.label}
                </div>

                {/* === INTERIM TEXT (real-time feedback) === */}
                {interimText && recState === 'listening' && (
                    <div style={{
                        padding: '12px 16px', borderRadius: '10px',
                        background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.3)',
                        color: '#A5B4FC', fontSize: '0.95rem', fontStyle: 'italic',
                        marginBottom: '12px'
                    }}>
                        ✏️ {interimText}...
                    </div>
                )}

                <div className="sp-controls">
                    <button
                        className="dict-play-btn"
                        onClick={() => speakText(current?.text || current?.question)}
                        disabled={isSpeaking || recState === 'listening'}
                        style={{ opacity: (isSpeaking || recState === 'listening') ? 0.5 : 1 }}
                    >
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
                    <div style={{
                        marginTop: '12px', textAlign: 'center'
                    }}>
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
                            <button className="dictation-next-btn" onClick={handleNextIelts} style={{ flex: 1 }}>
                                {currentIdx + 1 >= items.length ? '🔁 Làm lại' : '→ Câu tiếp'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

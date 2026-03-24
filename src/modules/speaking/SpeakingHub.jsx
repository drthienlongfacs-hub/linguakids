import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getSpeakingByMode } from '../../data/speaking';
import { isAdultMode } from '../../utils/userMode';

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
                <div className="lh-level-section reveal">
                    <div className="lh-level-header">
                        <h3>🎧 {adult ? 'Shadowing' : 'Bắt chước'}</h3>
                        <span className="lh-level-desc">{adult ? 'Listen → Repeat → Compare' : 'Nghe → Lặp lại → So sánh'}</span>
                    </div>
                    <div className="lh-lesson-grid">
                        {shadowing.map(l => (
                            <div key={l.id} className="lh-lesson-card" onClick={() => setActiveLesson(l)}>
                                <span className="lh-lesson-emoji">{l.emoji}</span>
                                <div className="lh-lesson-info">
                                    <h4>{l.title}</h4>
                                    <p className="lh-lesson-title-vi">{l.titleVi}</p>
                                    <div className="lh-lesson-meta">
                                        <span style={{ background: '#6366F115', color: '#6366F1', padding: '2px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700 }}>{l.level}</span>
                                        <span>{l.sentences?.length || 0} {adult ? 'sentences' : 'câu'}</span>
                                    </div>
                                </div>
                                <span className="lh-lesson-arrow">▶</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {ielts.length > 0 && (
                <div className="lh-level-section reveal">
                    <div className="lh-level-header">
                        <h3>🎤 {adult ? 'IELTS Speaking' : 'Phỏng vấn'}</h3>
                        <span className="lh-level-desc">{adult ? 'Mock speaking test practice' : 'Luyện phỏng vấn'}</span>
                    </div>
                    <div className="lh-lesson-grid">
                        {ielts.map(l => (
                            <div key={l.id} className="lh-lesson-card" onClick={() => setActiveLesson(l)}>
                                <span className="lh-lesson-emoji">{l.emoji}</span>
                                <div className="lh-lesson-info">
                                    <h4>{l.title}</h4>
                                    <p className="lh-lesson-title-vi">{l.titleVi}</p>
                                    <div className="lh-lesson-meta">
                                        <span style={{ background: '#EC489915', color: '#EC4899', padding: '2px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700 }}>{l.level}</span>
                                        <span>Part {l.part}</span>
                                    </div>
                                </div>
                                <span className="lh-lesson-arrow">▶</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Shadowing Method */}
            <div className="lh-method">
                <h3>📖 {adult ? 'Shadowing Method' : 'Phương pháp Shadowing'}</h3>
                <div className="lh-method-steps">
                    <div className="lh-method-step"><span className="step-icon">🔊</span><div><strong>{adult ? '1. Listen to model' : '1. Nghe mẫu'}</strong><p>{adult ? 'Hear the native speaker' : 'Nghe phát âm chuẩn'}</p></div></div>
                    <div className="lh-method-step"><span className="step-icon">🎙️</span><div><strong>{adult ? '2. Record yourself' : '2. Ghi âm'}</strong><p>{adult ? 'Speak the same sentence' : 'Nói lại câu đó'}</p></div></div>
                    <div className="lh-method-step"><span className="step-icon">📊</span><div><strong>{adult ? '3. Compare & improve' : '3. So sánh'}</strong><p>{adult ? 'See your accuracy score' : 'Xem điểm chính xác'}</p></div></div>
                </div>
            </div>
        </div>
    );
}

// Speaking Exercise Component — Shadowing + IELTS with tempo control
function SpeakingExercise({ lesson, onBack, adult }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedText, setRecordedText] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [scores, setScores] = useState([]);
    const [tempo, setTempo] = useState(1);
    const [ieltsPrepTime, setIeltsPrepTime] = useState(null); // countdown seconds
    const [ieltsSpeakTime, setIeltsSpeakTime] = useState(null);
    const recognitionRef = useRef(null);
    const timerRef = useRef(null);

    const tempoOptions = [
        { rate: 0.6, label: '🐢 Slow' },
        { rate: 1, label: '🏃 Normal' },
        { rate: 1.4, label: '🚀 Fast' },
    ];

    const items = lesson.type === 'shadowing' ? lesson.sentences
        : lesson.type === 'ielts_speaking' ? (lesson.questions || [{ question: lesson.cueCard?.topic || '' }])
            : [];
    const current = items[currentIdx];

    const speakText = useCallback((text) => {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US'; u.rate = tempo;
        const allVoices = window.speechSynthesis.getVoices();
        const enVoice = allVoices.find(voice => voice.lang.startsWith('en-US')) || allVoices.find(voice => voice.lang.startsWith('en'));
        if (enVoice) u.voice = enVoice;
        window.speechSynthesis.speak(u);
    }, [tempo]);

    // IELTS Part 2 Timer
    const startIeltsTimer = useCallback(() => {
        // 60s prep → 120s speak
        setIeltsPrepTime(60);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setIeltsPrepTime(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setIeltsSpeakTime(120);
                    timerRef.current = setInterval(() => {
                        setIeltsSpeakTime(prev2 => {
                            if (prev2 <= 1) {
                                clearInterval(timerRef.current);
                                return 0;
                            }
                            return prev2 - 1;
                        });
                    }, 1000);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert(adult ? 'Speech Recognition not supported. Use Chrome.' : 'Trình duyệt không hỗ trợ. Hãy dùng Chrome.');
            return;
        }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
        rec.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setRecordedText(transcript);
            setIsRecording(false);
            const original = (current.text || current.question || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
            const spoken = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            const origWords = original.split(/\s+/);
            const spokenWords = spoken.split(/\s+/);
            const matched = origWords.filter(w => spokenWords.includes(w)).length;
            const accuracy = Math.round((matched / Math.max(origWords.length, 1)) * 100);
            setScores(prev => [...prev, accuracy]);
            setShowResult(true);
        };
        rec.onerror = () => setIsRecording(false);
        rec.onend = () => setIsRecording(false);
        recognitionRef.current = rec;
        rec.start();
        setIsRecording(true);
        setRecordedText('');
        setShowResult(false);
    };

    const stopRecording = () => {
        recognitionRef.current?.stop();
        setIsRecording(false);
    };

    const handleNext = () => {
        if (currentIdx + 1 >= items.length) {
            setCurrentIdx(0);
            setShowResult(false);
            setRecordedText('');
        } else {
            setCurrentIdx(i => i + 1);
            setShowResult(false);
            setRecordedText('');
        }
    };

    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const lastScore = scores.length > 0 ? scores[scores.length - 1] : null;

    const formatTimer = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

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

            {/* Progress bar */}
            <div className="sp-progress">
                <span>{adult ? `Sentence ${currentIdx + 1} / ${items.length}` : `Câu ${currentIdx + 1} / ${items.length}`}</span>
                <div className="dictation-progress-bar"><div className="dictation-progress-fill" style={{ width: `${((currentIdx + 1) / items.length) * 100}%` }} /></div>
            </div>

            {/* Tempo Control */}
            <div style={{
                display: 'flex', gap: '6px', justifyContent: 'center', margin: '12px 0',
            }}>
                {tempoOptions.map(t => (
                    <button key={t.rate} onClick={() => setTempo(t.rate)} style={{
                        padding: '6px 14px', borderRadius: 'var(--radius-full)',
                        border: tempo === t.rate ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                        background: tempo === t.rate ? 'var(--color-primary)' : 'white',
                        color: tempo === t.rate ? 'white' : 'var(--color-text)',
                        fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.8rem',
                        cursor: 'pointer', transition: 'all var(--transition-fast)',
                    }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {/* IELTS Part 2 Timer */}
            {lesson.cueCard && lesson.type === 'ielts_speaking' && lesson.part === 2 && (
                <div className="sp-cue-card glass-card" style={{ marginBottom: '16px' }}>
                    <h3>📋 Cue Card</h3>
                    <p className="sp-cue-topic">{lesson.cueCard.topic}</p>
                    <ul>{lesson.cueCard.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                    {ieltsPrepTime === null && ieltsSpeakTime === null && (
                        <button onClick={startIeltsTimer} style={{
                            padding: '10px 20px', borderRadius: 'var(--radius-full)',
                            background: 'var(--gradient-speaking)', color: 'white',
                            fontFamily: 'var(--font-display)', fontWeight: 700, border: 'none',
                            cursor: 'pointer', fontSize: '0.9rem', marginTop: '12px',
                        }}>
                            ⏱️ {adult ? 'Start Timer (1min + 2min)' : 'Bắt đầu hẹn giờ'}
                        </button>
                    )}
                    {ieltsPrepTime > 0 && (
                        <div style={{
                            textAlign: 'center', padding: '12px', marginTop: '12px',
                            background: '#FEF3C7', borderRadius: 'var(--radius-lg)',
                            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem',
                            color: '#92400E',
                        }}>
                            📝 {adult ? 'Preparation' : 'Chuẩn bị'}: {formatTimer(ieltsPrepTime)}
                        </div>
                    )}
                    {ieltsSpeakTime !== null && ieltsSpeakTime > 0 && (
                        <div style={{
                            textAlign: 'center', padding: '12px', marginTop: '12px',
                            background: ieltsSpeakTime > 30 ? '#DCFCE7' : '#FEE2E2',
                            borderRadius: 'var(--radius-lg)',
                            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem',
                            color: ieltsSpeakTime > 30 ? '#166534' : '#991B1B',
                        }}>
                            🎙️ {adult ? 'Speaking' : 'Nói'}: {formatTimer(ieltsSpeakTime)}
                        </div>
                    )}
                    {ieltsSpeakTime === 0 && (
                        <div style={{
                            textAlign: 'center', padding: '12px', marginTop: '12px',
                            background: '#DBEAFE', borderRadius: 'var(--radius-lg)',
                            fontFamily: 'var(--font-display)', fontWeight: 700,
                            color: '#1E40AF',
                        }}>
                            ✅ {adult ? 'Time is up!' : 'Hết giờ!'}
                        </div>
                    )}
                </div>
            )}

            {/* Current sentence/question */}
            <div className="sp-sentence-card glass-card" style={{ padding: '20px', marginBottom: '16px' }}>
                <p className="sp-sentence-text">{current?.text || current?.question}</p>
                {current?.textVi && <p className="sp-sentence-vi">🇻🇳 {current.textVi}</p>}
                {current?.tip && <p className="sp-tip">💡 {current.tip}</p>}

                <div className="sp-controls">
                    <button className="dict-play-btn" onClick={() => speakText(current?.text || current?.question)}>
                        🔊 {adult ? `Listen (${tempo}x)` : 'Nghe mẫu'}
                    </button>
                    {!isRecording ? (
                        <button className="sp-record-btn" onClick={startRecording}>
                            🎙️ {adult ? 'Record' : 'Ghi âm'}
                        </button>
                    ) : (
                        <button className="sp-record-btn recording" onClick={stopRecording}>
                            ⏹️ {adult ? 'Stop' : 'Dừng'}
                        </button>
                    )}
                </div>

                {/* Recording Waveform */}
                {isRecording && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: '3px', height: '32px', marginTop: '12px',
                    }}>
                        {Array.from({ length: 16 }, (_, i) => (
                            <div key={i} style={{
                                width: '4px', borderRadius: '4px',
                                background: 'var(--gradient-speaking)',
                                animation: `waveBar 0.6s ease-in-out ${i * 0.05}s infinite alternate`,
                                height: `${8 + Math.random() * 24}px`,
                            }} />
                        ))}
                    </div>
                )}

                {showResult && (
                    <div className="sp-result" style={{ marginTop: '16px' }}>
                        {/* Score bar visual */}
                        <div style={{
                            height: '12px', borderRadius: '99px', background: '#F1F5F9',
                            overflow: 'hidden', marginBottom: '8px',
                        }}>
                            <div style={{
                                height: '100%', borderRadius: '99px',
                                width: `${lastScore}%`,
                                background: lastScore >= 80 ? '#10B981' : lastScore >= 50 ? '#F59E0B' : '#EF4444',
                                transition: 'width 0.8s ease',
                            }} />
                        </div>
                        <div className={`dictation-accuracy ${lastScore >= 80 ? 'good' : lastScore >= 50 ? 'ok' : 'poor'}`}>
                            {lastScore}% Match
                        </div>
                        <div className="sp-your-speech">
                            <strong>{adult ? 'Your speech:' : 'Bạn nói:'}</strong>
                            <p>{recordedText || (adult ? '(Could not detect speech)' : '(Không nhận diện được)')}</p>
                        </div>
                        <button className="dictation-next-btn" onClick={handleNext}>
                            {currentIdx + 1 >= items.length ? (adult ? '🔁 Restart' : '🔁 Làm lại') : (adult ? '→ Next' : '→ Câu tiếp')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

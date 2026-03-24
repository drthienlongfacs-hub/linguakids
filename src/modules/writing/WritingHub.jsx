import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { WRITING_PROMPTS, SENTENCE_EXERCISES } from '../../data/writing';
import { isAdultMode } from '../../utils/userMode';

export default function WritingHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const [activeItem, setActiveItem] = useState(null);
    const [activeType, setActiveType] = useState(null);

    if (activeItem && activeType === 'essay') return <WritingExercise prompt={activeItem} onBack={() => { setActiveItem(null); setActiveType(null); }} adult={adult} />;
    if (activeItem && activeType === 'sentence') return <SentenceExercise exercise={activeItem} onBack={() => { setActiveItem(null); setActiveType(null); }} adult={adult} />;

    return (
        <div className="writing-hub page">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/')}>←</button>
                <h2 className="lh-title">✍️ {adult ? 'Writing Practice' : 'Luyện Viết'}</h2>
            </div>
            <p className="lh-subtitle">{adult ? 'Practice IELTS Task 1 & 2, email writing, and grammar exercises.' : 'Luyện viết tiếng Anh!'}</p>

            <div className="lh-stats">
                <div className="lh-stat"><span className="lh-stat-number">{WRITING_PROMPTS.length}</span><span className="lh-stat-label">{adult ? 'Prompts' : 'Đề bài'}</span></div>
                <div className="lh-stat"><span className="lh-stat-number">{SENTENCE_EXERCISES.length}</span><span className="lh-stat-label">{adult ? 'Grammar Sets' : 'Bài ngữ pháp'}</span></div>
                <div className="lh-stat"><span className="lh-stat-number">4</span><span className="lh-stat-label">{adult ? 'Criteria' : 'Tiêu chí'}</span></div>
            </div>

            <div className="lh-level-section">
                <div className="lh-level-header"><h3>📝 {adult ? 'Essay & Report Writing' : 'Viết bài'}</h3></div>
                <div className="lh-lesson-grid">
                    {WRITING_PROMPTS.map((p, i) => (
                        <div key={p.id} className="lh-lesson-card reveal" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => { setActiveItem(p); setActiveType('essay'); }}>
                            <span className="lh-lesson-emoji">{p.emoji}</span>
                            <div className="lh-lesson-info"><h4>{p.title}</h4><p className="lh-lesson-title-vi">{p.examType}</p><div className="lh-lesson-meta">
                                <span style={{ background: '#8B5CF615', color: '#8B5CF6', padding: '2px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700 }}>{p.level}</span>
                                <span>≥{p.minWords} {adult ? 'words' : 'từ'}</span><span>⏱️ {Math.round(p.timeLimit / 60)}'</span>
                            </div></div>
                            <span className="lh-lesson-arrow">▶</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lh-level-section">
                <div className="lh-level-header"><h3>🔧 {adult ? 'Sentence Clinic' : 'Sửa câu'}</h3></div>
                <div className="lh-lesson-grid">
                    {SENTENCE_EXERCISES.map(e => (
                        <div key={e.id} className="lh-lesson-card" onClick={() => { setActiveItem(e); setActiveType('sentence'); }}>
                            <span className="lh-lesson-emoji">🔧</span>
                            <div className="lh-lesson-info"><h4>{e.title}</h4><p className="lh-lesson-title-vi">{e.titleVi}</p><div className="lh-lesson-meta"><span>{e.level}</span><span>{e.exercises.length} câu</span></div></div>
                            <span className="lh-lesson-arrow">▶</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function WritingExercise({ prompt, onBack, adult }) {
    const [essay, setEssay] = useState('');
    const [timeLeft, setTimeLeft] = useState(prompt.timeLimit);
    const [showModel, setShowModel] = useState(false);
    const [showScoring, setShowScoring] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
        return () => clearInterval(timerRef.current);
    }, []);

    const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0;
    const minMet = wordCount >= prompt.minWords;
    const mm = Math.floor(timeLeft / 60);
    const ss = timeLeft % 60;

    const getScore = () => {
        const len = Math.min(wordCount / prompt.minWords, 1) * 25;
        const variety = new Set(essay.toLowerCase().split(/\s+/)).size;
        const lexical = Math.min(variety / (prompt.minWords * 0.4), 1) * 25;
        const sentences = essay.split(/[.!?]+/).filter(s => s.trim()).length;
        const coherence = Math.min(sentences / 5, 1) * 25;
        const grammar = Math.min(wordCount / prompt.minWords, 1) * 25;
        return { task: Math.round(len), coherence: Math.round(coherence), lexical: Math.round(lexical), grammar: Math.round(grammar), total: Math.round((len + coherence + lexical + grammar) / 4) };
    };

    return (
        <div className="writing-exercise page">
            <div className="ll-header">
                <button className="ll-back" onClick={onBack}>←</button>
                <div className="ll-title-group">
                    <h2 className="ll-title">{prompt.emoji} {prompt.title}</h2>
                    <div className="ll-meta"><span className="ll-badge level">{prompt.examType}</span><span className={`ll-badge duration ${timeLeft < 120 ? 'warning' : ''}`}>⏱️ {mm}:{ss.toString().padStart(2, '0')}</span></div>
                </div>
            </div>

            <div className="sp-sentence-card">
                <p className="sp-sentence-text" style={{ fontSize: '1rem', lineHeight: 1.6 }}>{prompt.prompt}</p>
                {prompt.promptVi && <p className="sp-sentence-vi">🇻🇳 {prompt.promptVi}</p>}
            </div>

            {prompt.tips && (
                <div className="ll-instructions" style={{ marginTop: 12 }}>
                    <h3>💡 Tips</h3>
                    <ul style={{ paddingLeft: 16, marginTop: 6 }}>{prompt.tips.map((t, i) => <li key={i} style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: 4 }}>{t}</li>)}</ul>
                </div>
            )}

            <div style={{ position: 'relative', marginTop: 16 }}>
                <textarea className="dictation-input" rows={10} value={essay} onChange={e => setEssay(e.target.value)} placeholder={adult ? 'Write your essay here...' : 'Viết bài ở đây...'} style={{ minHeight: 200 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.85rem', color: minMet ? '#10B981' : 'var(--color-text-light)' }}>
                    <span>{wordCount} / {prompt.minWords} {adult ? 'words' : 'từ'} {minMet ? '✓' : ''}</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="quiz-submit-btn" onClick={() => setShowScoring(true)} disabled={!essay.trim()} style={{ flex: 1 }}>📊 {adult ? 'Score My Essay' : 'Chấm điểm'}</button>
                {prompt.modelAnswer && <button className="quiz-next-btn" onClick={() => setShowModel(!showModel)} style={{ flex: 1 }}>{showModel ? '🙈 Ẩn' : '📖 Bài mẫu'}</button>}
            </div>

            {showScoring && (
                <div className="sp-scoring" style={{ marginTop: 16 }}>
                    <h3 style={{ marginBottom: 12 }}>📊 {adult ? 'Estimated Score' : 'Điểm ước tính'}</h3>
                    {prompt.criteria?.map((c, i) => {
                        const s = getScore();
                        const val = i === 0 ? s.task : i === 1 ? s.coherence : i === 2 ? s.lexical : s.grammar;
                        return (
                            <div key={i} style={{ marginBottom: 10 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                                    <span style={{ fontWeight: 600 }}>{c.name}</span><span>{val}/25</span>
                                </div>
                                <div className="dictation-progress-bar"><div className="dictation-progress-fill" style={{ width: `${(val / 25) * 100}%`, background: val >= 18 ? '#10B981' : val >= 12 ? '#F59E0B' : '#EF4444' }} /></div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: 2 }}>{c.description}</p>
                            </div>
                        );
                    })}
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <span style={{ fontSize: '2rem', fontWeight: 800, color: '#6366F1' }}>~Band {Math.round(getScore().total / 25 * 4 + 4)}.0</span>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{adult ? 'Estimated IELTS band (simplified scoring)' : 'Điểm IELTS ước tính'}</p>
                    </div>
                </div>
            )}

            {showModel && prompt.modelAnswer && (
                <div className="reading-passage-container" style={{ marginTop: 16 }}>
                    <h3 style={{ marginBottom: 8 }}>📖 {adult ? 'Model Answer' : 'Bài mẫu'}</h3>
                    <div className="reading-passage" style={{ fontSize: '0.9rem', lineHeight: 1.7 }}>{prompt.modelAnswer}</div>
                </div>
            )}
        </div>
    );
}

function SentenceExercise({ exercise, onBack, adult }) {
    const [idx, setIdx] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    const item = exercise.exercises[idx];

    const check = () => {
        const target = (item.correct || item.target || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
        const user = userAnswer.toLowerCase().replace(/[^a-z0-9\s]/g, '');
        if (target.includes(user) || user.includes(target) || levenshtein(target, user) < 5) setScore(s => s + 1);
        setShowAnswer(true);
    };

    const next = () => {
        if (idx + 1 >= exercise.exercises.length) { setDone(true); return; }
        setIdx(i => i + 1); setUserAnswer(''); setShowAnswer(false);
    };

    if (done) {
        const pct = Math.round((score / exercise.exercises.length) * 100);
        return (
            <div className="page"><div className="ll-header"><button className="ll-back" onClick={onBack}>←</button><h2 className="ll-title">🔧 {exercise.title}</h2></div>
                <div className="quiz-complete"><div className="quiz-score-card"><h3>Results</h3><div className="quiz-final-score"><span className="score-circle" style={{ background: `conic-gradient(${pct >= 70 ? '#4ade80' : '#fbbf24'} ${pct * 3.6}deg, #334155 0deg)` }}><span className="score-inner">{pct}%</span></span></div><p className="quiz-score-text">{score}/{exercise.exercises.length}</p></div></div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="ll-header"><button className="ll-back" onClick={onBack}>←</button><div className="ll-title-group"><h2 className="ll-title">🔧 {exercise.title}</h2><div className="ll-meta"><span className="ll-badge level">{exercise.level}</span></div></div></div>
            <div className="sp-progress"><span>Câu {idx + 1}/{exercise.exercises.length}</span><div className="dictation-progress-bar"><div className="dictation-progress-fill" style={{ width: `${((idx + 1) / exercise.exercises.length) * 100}%` }} /></div></div>

            <div className="sp-sentence-card" style={{ marginTop: 16 }}>
                {exercise.type === 'error_correction' && (
                    <>
                        <p className="sp-tip">❌ Tìm và sửa lỗi sai:</p>
                        <p className="sp-sentence-text" style={{ color: '#EF4444' }}>{item.sentence}</p>
                    </>
                )}
                {exercise.type === 'transformation' && (
                    <>
                        <p className="sp-tip">🔄 Chuyển đổi câu: {item.hint}</p>
                        <p className="sp-sentence-text">{item.original}</p>
                    </>
                )}

                <input className={`gap-input ${showAnswer ? 'correct' : ''}`} value={userAnswer} onChange={e => setUserAnswer(e.target.value)} placeholder={adult ? 'Type the correct sentence...' : 'Gõ câu đúng...'} disabled={showAnswer} style={{ marginTop: 12 }} onKeyDown={e => e.key === 'Enter' && !showAnswer && userAnswer.trim() && check()} />

                {showAnswer && (
                    <div style={{ marginTop: 12 }}>
                        <p className="gap-answer">✅ {item.correct || item.target}</p>
                        {item.rule && <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: 4 }}>📖 {item.rule}</p>}
                    </div>
                )}

                <div style={{ marginTop: 16 }}>
                    {!showAnswer ? <button className="quiz-submit-btn" onClick={check} disabled={!userAnswer.trim()}>Kiểm tra</button>
                        : <button className="quiz-next-btn" onClick={next}>{idx + 1 >= exercise.exercises.length ? '🏁 Kết quả' : '→ Câu tiếp'}</button>}
                </div>
            </div>
        </div>
    );
}

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    return dp[m][n];
}

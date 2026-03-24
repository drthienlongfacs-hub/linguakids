import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { GRAMMAR_TOPICS } from '../../data/grammar';
import { isAdultMode } from '../../utils/userMode';

export default function GrammarHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const [activeTopic, setActiveTopic] = useState(null);

    if (activeTopic) return <GrammarLesson topic={activeTopic} onBack={() => setActiveTopic(null)} adult={adult} />;

    return (
        <div className="grammar-hub page">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/')}>←</button>
                <h2 className="lh-title">📐 {adult ? 'Grammar Practice' : 'Ngữ pháp'}</h2>
            </div>
            <p className="lh-subtitle">{adult ? 'Master essential grammar for IELTS Band 7+. Each topic includes rules, examples, and exercises.' : 'Học ngữ pháp tiếng Anh!'}</p>

            <div className="lh-stats">
                <div className="lh-stat"><span className="lh-stat-number">{GRAMMAR_TOPICS.length}</span><span className="lh-stat-label">{adult ? 'Topics' : 'Chủ đề'}</span></div>
                <div className="lh-stat"><span className="lh-stat-number">{GRAMMAR_TOPICS.reduce((s, t) => s + (t.exercises?.length || 0), 0)}</span><span className="lh-stat-label">{adult ? 'Exercises' : 'Bài tập'}</span></div>
                <div className="lh-stat"><span className="lh-stat-number">B1-B2</span><span className="lh-stat-label">Levels</span></div>
            </div>

            <div className="lh-lesson-grid">
                {GRAMMAR_TOPICS.map((t, i) => (
                    <div key={t.id} className="lh-lesson-card reveal" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => setActiveTopic(t)}>
                        <span className="lh-lesson-emoji">{t.emoji}</span>
                        <div className="lh-lesson-info">
                            <h4>{t.title}</h4>
                            <p className="lh-lesson-title-vi">{t.titleVi}</p>
                            <div className="lh-lesson-meta">
                                <span style={{
                                    background: t.level === 'B1' ? '#F59E0B15' : '#8B5CF615',
                                    color: t.level === 'B1' ? '#F59E0B' : '#8B5CF6',
                                    padding: '2px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                                }}>{t.level}</span>
                                <span>{t.sections?.length || 0} {adult ? 'sections' : 'phần'}</span>
                                <span>{t.exercises?.length || 0} {adult ? 'exercises' : 'bài'}</span>
                            </div>
                        </div>
                        <span className="lh-lesson-arrow">▶</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GrammarLesson({ topic, onBack, adult }) {
    const [tab, setTab] = useState('learn');
    const [exIdx, setExIdx] = useState(0);
    const [answer, setAnswer] = useState(null);
    const [gapInput, setGapInput] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    const exercises = topic.exercises || [];
    const ex = exercises[exIdx];

    const checkAnswer = () => {
        let correct = false;
        if (ex.type === 'gap_fill') correct = gapInput.trim().toLowerCase() === ex.answer.toLowerCase();
        else if (ex.type === 'mcq') correct = answer === ex.correct;
        else if (ex.type === 'error_correction') correct = gapInput.trim().toLowerCase().includes(ex.correct.toLowerCase().substring(0, 20));
        else if (ex.type === 'transformation') correct = gapInput.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').includes(ex.target.toLowerCase().replace(/[^a-z0-9\s]/g, '').substring(0, 20));
        if (correct) setScore(s => s + 1);
        setShowResult(true);
    };

    const nextEx = () => {
        if (exIdx + 1 >= exercises.length) { setDone(true); return; }
        setExIdx(i => i + 1); setAnswer(null); setGapInput(''); setShowResult(false);
    };

    return (
        <div className="grammar-lesson page">
            <div className="ll-header">
                <button className="ll-back" onClick={onBack}>←</button>
                <div className="ll-title-group">
                    <h2 className="ll-title">{topic.emoji} {topic.title}</h2>
                    <div className="ll-meta"><span className="ll-badge level">{topic.level}</span></div>
                </div>
            </div>

            <div className="ll-tabs">
                <button className={`ll-tab ${tab === 'learn' ? 'active' : ''}`} onClick={() => setTab('learn')}>📖 {adult ? 'Learn' : 'Học'}</button>
                <button className={`ll-tab ${tab === 'practice' ? 'active' : ''}`} onClick={() => setTab('practice')}>✏️ {adult ? 'Practice' : 'Luyện tập'}</button>
            </div>

            {tab === 'learn' && (
                <div className="grammar-learn">
                    <p style={{ color: 'var(--color-text-light)', marginBottom: 16, fontSize: '0.9rem' }}>{topic.summary}</p>
                    {topic.sections.map((sec, i) => (
                        <div key={i} className="grammar-section">
                            <h3 className="gs-name">{sec.name}</h3>
                            <div className="gs-rule"><strong>📐 Rule:</strong> {sec.rule}</div>
                            {sec.formula && <div className="gs-formula">📝 {sec.formula}</div>}
                            {sec.signalWords && <div className="gs-signals">🔑 Signal words: <em>{sec.signalWords.join(', ')}</em></div>}
                            <div className="gs-examples">
                                {sec.examples.map((ex, j) => (
                                    <div key={j} className="gs-example">
                                        <p className="gs-en">{ex.en}</p>
                                        <p className="gs-vi">🇻🇳 {ex.vi}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button className="ll-done-btn" onClick={() => setTab('practice')}>→ {adult ? 'Practice Exercises' : 'Luyện tập'}</button>
                </div>
            )}

            {tab === 'practice' && !done && exercises.length > 0 && (
                <div className="listening-quiz">
                    <div className="quiz-header"><span className="quiz-progress-text">Câu {exIdx + 1}/{exercises.length}</span><div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${((exIdx + 1) / exercises.length) * 100}%` }} /></div></div>
                    <div className="quiz-question-card">
                        <div className="quiz-type-badge">{ex.type === 'mcq' ? '📋 MCQ' : ex.type === 'gap_fill' ? '✏️ Gap Fill' : ex.type === 'error_correction' ? '❌ Error Correction' : '🔄 Transformation'}</div>
                        <h4 className="quiz-question-text">{ex.question || ex.sentence || ex.original}</h4>
                        {ex.hint && !showResult && <p className="gap-hint">💡 {ex.hint}</p>}

                        {ex.type === 'mcq' && <div className="quiz-options">{ex.options.map((o, i) => (<button key={i} className={`quiz-option ${answer === i ? 'selected' : ''} ${showResult ? (i === ex.correct ? 'correct' : answer === i ? 'incorrect' : '') : ''}`} onClick={() => !showResult && setAnswer(i)} disabled={showResult}><span className="option-letter">{String.fromCharCode(65 + i)}</span>{o}</button>))}</div>}

                        {(ex.type === 'gap_fill' || ex.type === 'error_correction' || ex.type === 'transformation') && (
                            <div className="quiz-gap-fill">
                                <input className={`gap-input ${showResult ? (score > 0 ? 'correct' : 'incorrect') : ''}`} value={gapInput} onChange={e => setGapInput(e.target.value)} disabled={showResult} placeholder="Type your answer..." onKeyDown={e => e.key === 'Enter' && !showResult && gapInput.trim() && checkAnswer()} />
                                {showResult && <p className="gap-answer">✅ {ex.answer || ex.correct || ex.target}</p>}
                                {showResult && ex.rule && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: 4 }}>📖 {ex.rule}</p>}
                            </div>
                        )}

                        {showResult && <div className={`quiz-feedback ${(ex.type === 'mcq' ? answer === ex.correct : true) ? 'correct' : 'incorrect'}`}>{score > 0 ? '✅' : '❌'}</div>}
                    </div>
                    <div className="quiz-actions">{!showResult ? <button className="quiz-submit-btn" onClick={checkAnswer} disabled={answer === null && !gapInput.trim()}>Kiểm tra</button> : <button className="quiz-next-btn" onClick={nextEx}>{exIdx + 1 >= exercises.length ? '🏁 Kết quả' : '→ Tiếp'}</button>}</div>
                </div>
            )}

            {tab === 'practice' && done && (
                <div className="quiz-complete"><div className="quiz-score-card"><h3>Grammar Score</h3><div className="quiz-final-score"><span className="score-circle" style={{ background: `conic-gradient(${Math.round((score / exercises.length) * 100) >= 70 ? '#4ade80' : '#fbbf24'} ${Math.round((score / exercises.length) * 100) * 3.6}deg, #334155 0deg)` }}><span className="score-inner">{Math.round((score / exercises.length) * 100)}%</span></span></div><p className="quiz-score-text">{score}/{exercises.length}</p></div></div>
            )}
        </div>
    );
}

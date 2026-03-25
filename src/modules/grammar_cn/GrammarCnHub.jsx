import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { GRAMMAR_CN_TOPICS, getCnGrammarByMode } from '../../data/grammar_cn';
import { isAdultMode } from '../../utils/userMode';

export default function GrammarCnHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const topics = getCnGrammarByMode(state.userMode);
    const [activeTopic, setActiveTopic] = useState(null);

    if (activeTopic) return <GrammarCnLesson topic={activeTopic} onBack={() => setActiveTopic(null)} adult={adult} />;

    return (
        <div className="grammar-hub page">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/chinese')}>←</button>
                <h2 className="lh-title">📐 {adult ? '语法 Grammar' : 'Ngữ pháp 语法'}</h2>
            </div>
            <p className="lh-subtitle">{adult ? 'Master essential Chinese grammar patterns with clear rules, examples, and practice exercises.' : 'Học ngữ pháp tiếng Trung cơ bản! 🇨🇳'}</p>

            <div className="lh-stats">
                <div className="lh-stat"><span className="lh-stat-number">{topics.length}</span><span className="lh-stat-label">{adult ? 'Topics' : 'Chủ đề'}</span></div>
                <div className="lh-stat"><span className="lh-stat-number">{topics.reduce((s, t) => s + (t.exercises?.length || 0), 0)}</span><span className="lh-stat-label">{adult ? 'Exercises' : 'Bài tập'}</span></div>
            </div>

            <div className="lh-lesson-grid">
                {topics.map(t => (
                    <div key={t.id} className="lh-lesson-card" onClick={() => setActiveTopic(t)}>
                        <span className="lh-lesson-emoji">{t.emoji}</span>
                        <div className="lh-lesson-info">
                            <h4>{t.title}</h4>
                            <p className="lh-lesson-title-vi">{t.titleVi}</p>
                            <div className="lh-lesson-meta"><span>{t.level}</span><span>{t.sections?.length || 0} phần</span><span>{t.exercises?.length || 0} bài tập</span></div>
                        </div>
                        <span className="lh-lesson-arrow">▶</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function GrammarCnLesson({ topic, onBack, adult }) {
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
        if (ex.type === 'gap_fill') {
            const ans = ex.answer.toLowerCase().split('/').map(a => a.trim());
            correct = ans.some(a => gapInput.trim().toLowerCase() === a);
        } else if (ex.type === 'mcq') correct = answer === ex.correct;
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
                <button className={`ll-tab ${tab === 'learn' ? 'active' : ''}`} onClick={() => setTab('learn')}>📖 Học</button>
                <button className={`ll-tab ${tab === 'practice' ? 'active' : ''}`} onClick={() => setTab('practice')}>✏️ Luyện tập</button>
            </div>

            {tab === 'learn' && (
                <div className="grammar-learn">
                    <p style={{ color: 'var(--color-text-light)', marginBottom: 16, fontSize: '0.9rem' }}>{topic.summary}</p>
                    {topic.sections.map((sec, i) => (
                        <div key={i} className="grammar-section">
                            <h3 className="gs-name">{sec.name}</h3>
                            <div className="gs-rule"><strong>📐 Quy tắc:</strong> {sec.rule}</div>
                            {sec.formula && <div className="gs-formula">📝 {sec.formula}</div>}
                            <div className="gs-examples">
                                {sec.examples.map((ex, j) => (
                                    <div key={j} className="gs-example">
                                        <p className="gs-en" style={{ fontSize: '1.1rem' }}>{ex.cn}</p>
                                        {ex.pinyin && <p style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontStyle: 'italic' }}>{ex.pinyin}</p>}
                                        <p className="gs-vi">🇻🇳 {ex.vi}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button className="ll-done-btn" onClick={() => setTab('practice')}>→ Luyện tập</button>
                </div>
            )}

            {tab === 'practice' && !done && exercises.length > 0 && (
                <div className="listening-quiz">
                    <div className="quiz-header"><span className="quiz-progress-text">Câu {exIdx + 1}/{exercises.length}</span><div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${((exIdx + 1) / exercises.length) * 100}%` }} /></div></div>
                    <div className="quiz-question-card">
                        <div className="quiz-type-badge">{ex.type === 'mcq' ? '📋 MCQ' : '✏️ Điền từ'}</div>
                        <h4 className="quiz-question-text">{ex.question}</h4>
                        {ex.hint && !showResult && <p className="gap-hint">💡 {ex.hint}</p>}

                        {ex.type === 'mcq' && <div className="quiz-options">{ex.options.map((o, i) => (<button key={i} className={`quiz-option ${answer === i ? 'selected' : ''} ${showResult ? (i === ex.correct ? 'correct' : answer === i ? 'incorrect' : '') : ''}`} onClick={() => !showResult && setAnswer(i)} disabled={showResult}><span className="option-letter">{String.fromCharCode(65 + i)}</span>{o}</button>))}</div>}

                        {ex.type === 'gap_fill' && (
                            <div className="quiz-gap-fill">
                                <input className={`gap-input ${showResult ? (gapInput.trim().toLowerCase() === ex.answer.split('/')[0].trim().toLowerCase() ? 'correct' : 'incorrect') : ''}`} value={gapInput} onChange={e => setGapInput(e.target.value)} disabled={showResult} placeholder="Nhập câu trả lời..." onKeyDown={e => e.key === 'Enter' && !showResult && gapInput.trim() && checkAnswer()} />
                                {showResult && <p className="gap-answer">✅ {ex.answer}</p>}
                            </div>
                        )}
                    </div>
                    <div className="quiz-actions">{!showResult ? <button className="quiz-submit-btn" onClick={checkAnswer} disabled={answer === null && !gapInput.trim()}>Kiểm tra</button> : <button className="quiz-next-btn" onClick={nextEx}>{exIdx + 1 >= exercises.length ? '🏁 Kết quả' : '→ Tiếp'}</button>}</div>
                </div>
            )}

            {tab === 'practice' && done && (
                <div className="quiz-complete"><div className="quiz-score-card"><h3>Kết quả Ngữ pháp</h3><div className="quiz-final-score"><span className="score-circle" style={{ background: `conic-gradient(${Math.round((score / exercises.length) * 100) >= 70 ? '#4ade80' : '#fbbf24'} ${Math.round((score / exercises.length) * 100) * 3.6}deg, #334155 0deg)` }}><span className="score-inner">{Math.round((score / exercises.length) * 100)}%</span></span></div><p className="quiz-score-text">{score}/{exercises.length}</p></div></div>
            )}
        </div>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getReadingByMode } from '../../data/reading';
import { isAdultMode } from '../../utils/userMode';

export default function ReadingHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const passages = getReadingByMode(state.userMode);
    const [activePassage, setActivePassage] = useState(null);

    if (activePassage) {
        return <ReadingExercise passage={activePassage} onBack={() => setActivePassage(null)} adult={adult} />;
    }

    return (
        <div className="reading-hub page">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/')}>←</button>
                <h2 className="lh-title">📖 {adult ? 'Reading Practice' : 'Luyện Đọc'}</h2>
            </div>
            <p className="lh-subtitle">{adult ? 'Build comprehension with academic and professional passages.' : 'Đọc hiểu tiếng Anh qua các bài đọc thú vị! 📚'}</p>

            <div className="lh-stats">
                <div className="lh-stat"><span className="lh-stat-number">{passages.length}</span><span className="lh-stat-label">{adult ? 'Passages' : 'Bài đọc'}</span></div>
                <div className="lh-stat"><span className="lh-stat-number">6</span><span className="lh-stat-label">{adult ? 'Q-types' : 'Dạng câu hỏi'}</span></div>
                <div className="lh-stat"><span className="lh-stat-number">A1-B2</span><span className="lh-stat-label">Levels</span></div>
            </div>

            <div className="lh-lesson-grid">
                {passages.map((p, i) => (
                    <div key={p.id} className="lh-lesson-card reveal" style={{ animationDelay: `${i * 0.06}s` }} onClick={() => setActivePassage(p)}>
                        <span className="lh-lesson-emoji">{p.emoji}</span>
                        <div className="lh-lesson-info">
                            <h4>{p.title}</h4>
                            <p className="lh-lesson-title-vi">{p.titleVi}</p>
                            <div className="lh-lesson-meta">
                                <span style={{
                                    background: p.level === 'A1' ? '#10B98115' : p.level === 'A2' ? '#F59E0B15' : '#6366F115',
                                    color: p.level === 'A1' ? '#10B981' : p.level === 'A2' ? '#F59E0B' : '#6366F1',
                                    padding: '2px 8px', borderRadius: '99px', fontSize: '0.7rem', fontWeight: 700,
                                }}>{p.level}</span>
                                <span>{p.wordCount} {adult ? 'words' : 'từ'}</span>
                                <span>⏱️ {p.readingTime}</span>
                                <span>📝 {p.quiz.length} {adult ? 'Q' : 'câu'}</span>
                            </div>
                        </div>
                        <span className="lh-lesson-arrow">▶</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ReadingExercise({ passage, onBack, adult }) {
    const [tab, setTab] = useState('read');
    const [showVocab, setShowVocab] = useState(false);
    const [selectedWord, setSelectedWord] = useState(null);
    // Quiz state
    const [quizIdx, setQuizIdx] = useState(0);
    const [answer, setAnswer] = useState(null);
    const [gapInput, setGapInput] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);

    const handleWordClick = (word) => {
        const clean = word.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
        const found = passage.vocabulary.find(v => v.word.toLowerCase() === clean);
        setSelectedWord(found || { word: clean, meaning: '(not in vocabulary list)', example: '' });
    };

    const handleQuizSubmit = () => {
        const q = passage.quiz[quizIdx];
        let correct = false;
        if (q.type === 'mcq') correct = answer === q.correct;
        else if (q.type === 'gap_fill') correct = gapInput.trim().toLowerCase() === q.answer.toLowerCase();
        else if (q.type === 'true_false') correct = answer === q.answer;
        if (correct) setScore(s => s + 1);
        setShowAnswer(true);
    };

    const nextQuestion = () => {
        if (quizIdx + 1 >= passage.quiz.length) { setQuizDone(true); return; }
        setQuizIdx(i => i + 1);
        setAnswer(null); setGapInput(''); setShowAnswer(false);
    };

    const q = passage.quiz[quizIdx];
    const pct = quizDone ? Math.round((score / passage.quiz.length) * 100) : 0;

    return (
        <div className="reading-exercise page">
            <div className="ll-header">
                <button className="ll-back" onClick={onBack}>←</button>
                <div className="ll-title-group">
                    <h2 className="ll-title">{passage.emoji} {passage.title}</h2>
                    <div className="ll-meta"><span className="ll-badge level">{passage.level}</span><span className="ll-badge duration">{passage.wordCount} words</span><span className="ll-badge topic">{passage.topic}</span></div>
                </div>
            </div>

            <div className="ll-tabs">
                <button className={`ll-tab ${tab === 'read' ? 'active' : ''}`} onClick={() => setTab('read')}>📖 {adult ? 'Read' : 'Đọc'}</button>
                <button className={`ll-tab ${tab === 'quiz' ? 'active' : ''}`} onClick={() => setTab('quiz')}>📝 Quiz</button>
                <button className={`ll-tab ${tab === 'vocab' ? 'active' : ''}`} onClick={() => setTab('vocab')}>📚 {adult ? 'Vocab' : 'Từ vựng'}</button>
            </div>

            {tab === 'read' && (
                <div className="reading-passage-container">
                    <div className="ll-instructions"><h3>📖 {adult ? 'Read the passage' : 'Đọc bài'}</h3><p>{adult ? 'Tap any word to see its meaning.' : 'Chạm vào từ để xem nghĩa.'}</p></div>
                    <div className="reading-passage">
                        {passage.passage.split(/\s+/).map((word, i) => (
                            <span key={i} className="reading-word" onClick={() => handleWordClick(word)}>{word} </span>
                        ))}
                    </div>
                    {selectedWord && (
                        <div className="reading-word-popup">
                            <div className="rwp-word">{selectedWord.word}</div>
                            <div className="rwp-meaning">🇻🇳 {selectedWord.meaning}</div>
                            {selectedWord.example && <div className="rwp-example">💬 {selectedWord.example}</div>}
                            <button className="rwp-close" onClick={() => setSelectedWord(null)}>✕</button>
                            <button className="vocab-speak-btn" onClick={() => { const u = new SpeechSynthesisUtterance(selectedWord.word); u.lang = 'en-US'; window.speechSynthesis.speak(u); }}>🔊</button>
                        </div>
                    )}
                    <button className="ll-done-btn" onClick={() => setTab('quiz')}>✅ {adult ? 'Done reading → Quiz' : 'Đọc xong → Quiz'}</button>
                </div>
            )}

            {tab === 'quiz' && !quizDone && (
                <div className="listening-quiz">
                    <div className="quiz-header"><span className="quiz-progress-text">Câu {quizIdx + 1} / {passage.quiz.length}</span><div className="quiz-progress-bar"><div className="quiz-progress-fill" style={{ width: `${((quizIdx + 1) / passage.quiz.length) * 100}%` }} /></div></div>
                    <div className="quiz-question-card">
                        <div className="quiz-type-badge">{q.type === 'mcq' ? '📋 MCQ' : q.type === 'gap_fill' ? '✏️ Gap Fill' : '✓✗ True/False'}</div>
                        <h4 className="quiz-question-text">{q.question}</h4>
                        {q.type === 'mcq' && <div className="quiz-options">{q.options.map((o, i) => (<button key={i} className={`quiz-option ${answer === i ? 'selected' : ''} ${showAnswer ? (i === q.correct ? 'correct' : answer === i ? 'incorrect' : '') : ''}`} onClick={() => !showAnswer && setAnswer(i)} disabled={showAnswer}><span className="option-letter">{String.fromCharCode(65 + i)}</span>{o}</button>))}</div>}
                        {q.type === 'gap_fill' && <div className="quiz-gap-fill"><input className={`gap-input ${showAnswer ? (gapInput.trim().toLowerCase() === q.answer.toLowerCase() ? 'correct' : 'incorrect') : ''}`} value={gapInput} onChange={e => setGapInput(e.target.value)} disabled={showAnswer} placeholder="Điền từ..." />{q.hint && !showAnswer && <p className="gap-hint">💡 {q.hint}</p>}{showAnswer && gapInput.trim().toLowerCase() !== q.answer.toLowerCase() && <p className="gap-answer">✅ {q.answer}</p>}</div>}
                        {q.type === 'true_false' && <div className="quiz-tf">{[true, false].map(v => (<button key={String(v)} className={`quiz-tf-btn ${answer === v ? 'selected' : ''} ${showAnswer ? (v === q.answer ? 'correct' : answer === v ? 'incorrect' : '') : ''}`} onClick={() => !showAnswer && setAnswer(v)} disabled={showAnswer}>{v ? '✓ TRUE' : '✗ FALSE'}</button>))}</div>}
                        {showAnswer && <div className={`quiz-feedback ${(q.type === 'mcq' ? answer === q.correct : q.type === 'true_false' ? answer === q.answer : gapInput.trim().toLowerCase() === q.answer.toLowerCase()) ? 'correct' : 'incorrect'}`}>{(q.type === 'mcq' ? answer === q.correct : q.type === 'true_false' ? answer === q.answer : gapInput.trim().toLowerCase() === q.answer.toLowerCase()) ? '✅ Chính xác!' : '❌ Chưa đúng!'}{q.explanation && <p className="feedback-exp">{q.explanation}</p>}</div>}
                    </div>
                    <div className="quiz-actions">{!showAnswer ? <button className="quiz-submit-btn" onClick={handleQuizSubmit} disabled={answer === null && !gapInput.trim()}>Kiểm tra</button> : <button className="quiz-next-btn" onClick={nextQuestion}>{quizIdx + 1 >= passage.quiz.length ? '🏁 Xem kết quả' : '→ Câu tiếp'}</button>}</div>
                </div>
            )}

            {tab === 'quiz' && quizDone && (
                <div className="quiz-complete"><div className="quiz-score-card"><h3>📝 Reading Quiz Results</h3><div className="quiz-final-score"><span className="score-circle" style={{ background: `conic-gradient(${pct >= 70 ? '#4ade80' : '#fbbf24'} ${pct * 3.6}deg, #334155 0deg)` }}><span className="score-inner">{pct}%</span></span></div><p className="quiz-score-text">{score} / {passage.quiz.length} đúng</p><div className="quiz-rating">{pct >= 80 ? '🌟 Xuất sắc!' : pct >= 60 ? '👏 Tốt!' : '📚 Đọc lại nhé!'}</div></div></div>
            )}

            {tab === 'vocab' && (
                <div className="ll-vocab-tab">
                    <div className="vocab-grid">{passage.vocabulary.map((v, i) => (
                        <div key={i} className="vocab-card"><div className="vocab-word">{v.word}</div><div className="vocab-meaning">🇻🇳 {v.meaning}</div>{v.example && <div className="vocab-example">💬 {v.example}</div>}<button className="vocab-speak-btn" onClick={() => { const u = new SpeechSynthesisUtterance(v.word); u.lang = 'en-US'; window.speechSynthesis.speak(u); }}>🔊</button></div>
                    ))}</div>
                </div>
            )}
        </div>
    );
}

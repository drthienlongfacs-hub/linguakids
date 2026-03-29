import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getReadingByMode } from '../../data/reading';
import { isAdultMode } from '../../utils/userMode';
import { fetchWordDetail } from '../../services/dictionaryService';
import { speakText } from '../../utils/speakText';

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
            <p className="lh-subtitle">{adult ? 'Build comprehension with academic and professional passages. Tap any word to get instant definitions.' : 'Đọc hiểu tiếng Anh qua các bài đọc thú vị! Chạm từ để xem nghĩa 📚'}</p>

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
    const [selectedWord, setSelectedWord] = useState(null);
    const [wordDetail, setWordDetail] = useState(null);
    const [loadingWord, setLoadingWord] = useState(false);

    // Reading speed tracker
    const [readingStartTime, setReadingStartTime] = useState(null);
    const [readingWPM, setReadingWPM] = useState(null);
    const [readingDone, setReadingDone] = useState(false);

    // Quiz state
    const [quizIdx, setQuizIdx] = useState(0);
    const [answer, setAnswer] = useState(null);
    const [gapInput, setGapInput] = useState('');
    const [showAnswer, setShowAnswer] = useState(false);
    const [score, setScore] = useState(0);
    const [quizDone, setQuizDone] = useState(false);

    // Start reading timer when read tab opens
    useEffect(() => {
        if (tab === 'read' && !readingStartTime && !readingDone) {
            setReadingStartTime(Date.now());
        }
    }, [tab, readingStartTime, readingDone]);

    // Tap-to-define with FreeDictionaryAPI
    const handleWordClick = useCallback(async (word) => {
        const clean = word.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
        if (!clean || clean.length < 2) return;

        // First check local vocabulary
        const found = passage.vocabulary.find(v => v.word.toLowerCase() === clean);
        setSelectedWord(clean);
        setWordDetail(found ? { word: clean, meaning: found.meaning, example: found.example, local: true } : null);

        // Then fetch from API for richer data
        setLoadingWord(true);
        try {
            const detail = await fetchWordDetail(clean);
            if (detail) {
                setWordDetail(prev => ({
                    word: clean,
                    meaning: found?.meaning || detail.meanings?.[0]?.definitions?.[0]?.definition || '',
                    example: found?.example || detail.meanings?.[0]?.definitions?.[0]?.example || '',
                    phonetic: detail.phonetic || '',
                    audio: detail.audio || '',
                    partOfSpeech: detail.meanings?.[0]?.partOfSpeech || '',
                    definitions: detail.meanings?.slice(0, 2).map(m => ({
                        pos: m.partOfSpeech,
                        def: m.definitions?.[0]?.definition || '',
                    })) || [],
                    local: !!found,
                }));
            }
        } catch { /* use local data */ }
        setLoadingWord(false);
    }, [passage.vocabulary]);

    const handleFinishReading = () => {
        if (readingStartTime) {
            const elapsedMin = (Date.now() - readingStartTime) / 60000;
            const wpm = Math.round((passage.wordCount || 200) / Math.max(elapsedMin, 0.1));
            setReadingWPM(wpm);
            setReadingDone(true);
        }
        setTab('quiz');
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

    // WPM Assessment
    const wpmLabel = readingWPM >= 250 ? 'Fast reader!' : readingWPM >= 150 ? 'Good pace' : readingWPM >= 80 ? 'Careful reader' : 'Take your time';

    return (
        <div className="reading-exercise page">
            <div className="ll-header">
                <button className="ll-back" onClick={onBack}>←</button>
                <div className="ll-title-group">
                    <h2 className="ll-title">{passage.emoji} {passage.title}</h2>
                    <div className="ll-meta">
                        <span className="ll-badge level">{passage.level}</span>
                        <span className="ll-badge duration">{passage.wordCount} words</span>
                        <span className="ll-badge topic">{passage.topic}</span>
                    </div>
                </div>
            </div>

            <div className="ll-tabs">
                <button className={`ll-tab ${tab === 'read' ? 'active' : ''}`} onClick={() => setTab('read')}>📖 {adult ? 'Read' : 'Đọc'}</button>
                <button className={`ll-tab ${tab === 'quiz' ? 'active' : ''}`} onClick={() => setTab('quiz')}>📝 Quiz</button>
                <button className={`ll-tab ${tab === 'vocab' ? 'active' : ''}`} onClick={() => setTab('vocab')}>📚 {adult ? 'Vocab' : 'Từ vựng'}</button>
            </div>

            {tab === 'read' && (
                <div className="reading-passage-container">
                    <div className="ll-instructions">
                        <h3>📖 {adult ? 'Read the passage' : 'Đọc bài'}</h3>
                        <p>{adult ? 'Tap any word for instant definition with IPA pronunciation.' : 'Chạm vào từ để xem nghĩa và phiên âm IPA.'}</p>
                    </div>

                    {/* Reading Timer */}
                    {readingStartTime && !readingDone && (
                        <ReadingTimer startTime={readingStartTime} />
                    )}

                    <div className="reading-passage">
                        {passage.passage.split(/\s+/).map((word, i) => (
                            <span key={i} className={`reading-word ${selectedWord === word.replace(/[^a-zA-Z'-]/g, '').toLowerCase() ? 'reading-word--active' : ''}`}
                                onClick={() => handleWordClick(word)}>{word} </span>
                        ))}
                    </div>

                    {/* Enhanced Word Popup with API data */}
                    {selectedWord && (
                        <div className="reading-word-popup reading-word-popup--enhanced">
                            <button className="rwp-close" onClick={() => { setSelectedWord(null); setWordDetail(null); }}>✕</button>
                            <div className="rwp-word">{selectedWord}</div>

                            {loadingWord && <div className="rwp-loading">⏳ Loading...</div>}

                            {wordDetail && (
                                <>
                                    {wordDetail.phonetic && (
                                        <div className="rwp-phonetic">
                                            <span className="rwp-ipa">/{wordDetail.phonetic}/</span>
                                            {wordDetail.partOfSpeech && <span className="rwp-pos">{wordDetail.partOfSpeech}</span>}
                                        </div>
                                    )}
                                    <div className="rwp-meaning">🇻🇳 {wordDetail.meaning}</div>
                                    {wordDetail.definitions?.map((d, i) => (
                                        <div key={i} className="rwp-definition">
                                            <span className="rwp-def-pos">{d.pos}</span>
                                            <span className="rwp-def-text">{d.def}</span>
                                        </div>
                                    ))}
                                    {wordDetail.example && <div className="rwp-example">💬 {wordDetail.example}</div>}
                                </>
                            )}

                            <div className="rwp-actions">
                                <button className="vocab-speak-btn" onClick={() => {
                                    if (wordDetail?.audio) { new Audio(wordDetail.audio).play(); }
                                    else { speakText(selectedWord, { lang: 'en-US' }); }
                                }}>🔊 {adult ? 'Listen' : 'Nghe'}</button>
                            </div>
                        </div>
                    )}

                    <button className="ll-done-btn" onClick={handleFinishReading}>
                        ✅ {adult ? 'Done reading → Quiz' : 'Đọc xong → Quiz'}
                    </button>
                </div>
            )}

            {tab === 'quiz' && !quizDone && (
                <div className="listening-quiz">
                    {/* WPM result banner */}
                    {readingWPM && (
                        <div className="reading-wpm-banner">
                            <span className="wpm-icon">⚡</span>
                            <span className="wpm-value">{readingWPM} WPM</span>
                            <span className="wpm-label">{wpmLabel}</span>
                        </div>
                    )}

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
                        <div key={i} className="vocab-card"><div className="vocab-word">{v.word}</div><div className="vocab-meaning">🇻🇳 {v.meaning}</div>{v.example && <div className="vocab-example">💬 {v.example}</div>}<button className="vocab-speak-btn" onClick={() => { speakText(v.word, { lang: 'en-US' }); }}>🔊</button></div>
                    ))}</div>
                </div>
            )}
        </div>
    );
}

// Live reading timer component
function ReadingTimer({ startTime }) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;

    return (
        <div className="reading-timer">
            <span className="reading-timer-icon">⏱️</span>
            <span className="reading-timer-value">{mins}:{secs.toString().padStart(2, '0')}</span>
        </div>
    );
}

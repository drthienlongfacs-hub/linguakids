import { useState } from 'react';

// Quiz component supporting MCQ, Gap-fill, True/False
export default function ListeningQuiz({ quiz, lessonTitle, onComplete }) {
    const [currentQ, setCurrentQ] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [gapInput, setGapInput] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [score, setScore] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [answers, setAnswers] = useState([]);

    const question = quiz[currentQ];

    const handleSubmit = () => {
        let correct = false;

        if (question.type === 'mcq') {
            correct = selectedAnswer === question.correct;
        } else if (question.type === 'gap_fill') {
            correct = gapInput.trim().toLowerCase() === question.answer.toLowerCase();
        } else if (question.type === 'true_false') {
            correct = selectedAnswer === question.answer;
        }

        setIsCorrect(correct);
        setShowResult(true);
        if (correct) setScore(s => s + 1);
        setAnswers(prev => [...prev, { question: currentQ, correct, userAnswer: selectedAnswer ?? gapInput }]);
    };

    const handleNext = () => {
        if (currentQ + 1 >= quiz.length) {
            setIsFinished(true);
            onComplete?.({ score: score + (isCorrect ? 0 : 0), total: quiz.length }); // score already updated
        } else {
            setCurrentQ(currentQ + 1);
            setSelectedAnswer(null);
            setGapInput('');
            setShowResult(false);
            setIsCorrect(false);
        }
    };

    if (isFinished) {
        const pct = Math.round((score / quiz.length) * 100);
        return (
            <div className="quiz-complete">
                <div className="quiz-score-card">
                    <h3>📝 Kết quả Quiz</h3>
                    <div className="quiz-final-score">
                        <span className="score-circle" style={{
                            background: `conic-gradient(${pct >= 70 ? '#4ade80' : pct >= 40 ? '#fbbf24' : '#f87171'} ${pct * 3.6}deg, #334155 0deg)`
                        }}>
                            <span className="score-inner">{pct}%</span>
                        </span>
                    </div>
                    <p className="quiz-score-text">{score} / {quiz.length} câu đúng</p>
                    <div className="quiz-rating">
                        {pct >= 90 ? '🌟 Band 7+! Xuất sắc!' :
                            pct >= 70 ? '👏 Band 6! Tốt lắm!' :
                                pct >= 50 ? '💪 Band 5 — Cần cải thiện!' :
                                    '📚 Dưới Band 5 — Nghe lại bài nhé!'}
                    </div>

                    {/* Review incorrect answers */}
                    <div className="quiz-review">
                        {answers.filter(a => !a.correct).map((a, i) => {
                            const q = quiz[a.question];
                            return (
                                <div key={i} className="quiz-review-item">
                                    <p className="review-q">❌ {q.question}</p>
                                    {q.explanation && <p className="review-exp">💡 {q.explanation}</p>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="listening-quiz">
            <div className="quiz-header">
                <span className="quiz-progress-text">Câu {currentQ + 1} / {quiz.length}</span>
                <div className="quiz-progress-bar">
                    <div className="quiz-progress-fill" style={{ width: `${((currentQ + 1) / quiz.length) * 100}%` }} />
                </div>
            </div>

            <div className="quiz-question-card">
                <div className="quiz-type-badge">
                    {question.type === 'mcq' ? '📋 Multiple Choice' :
                        question.type === 'gap_fill' ? '✏️ Gap Fill' :
                            '✓✗ True / False'}
                </div>

                <h4 className="quiz-question-text">{question.question}</h4>

                {/* MCQ */}
                {question.type === 'mcq' && (
                    <div className="quiz-options">
                        {question.options.map((opt, idx) => (
                            <button
                                key={idx}
                                className={`quiz-option ${selectedAnswer === idx ? 'selected' : ''} ${showResult ? (idx === question.correct ? 'correct' : selectedAnswer === idx ? 'incorrect' : '') : ''
                                    }`}
                                onClick={() => !showResult && setSelectedAnswer(idx)}
                                disabled={showResult}
                            >
                                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                                {opt}
                            </button>
                        ))}
                    </div>
                )}

                {/* Gap Fill */}
                {question.type === 'gap_fill' && (
                    <div className="quiz-gap-fill">
                        <input
                            type="text"
                            className={`gap-input ${showResult ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
                            value={gapInput}
                            onChange={e => setGapInput(e.target.value)}
                            placeholder="Điền từ còn thiếu..."
                            disabled={showResult}
                            onKeyDown={e => e.key === 'Enter' && !showResult && gapInput.trim() && handleSubmit()}
                        />
                        {question.hint && !showResult && (
                            <p className="gap-hint">💡 Gợi ý: {question.hint}</p>
                        )}
                        {showResult && !isCorrect && (
                            <p className="gap-answer">✅ Đáp án: <strong>{question.answer}</strong></p>
                        )}
                    </div>
                )}

                {/* True/False */}
                {question.type === 'true_false' && (
                    <div className="quiz-tf">
                        {[true, false].map(val => (
                            <button
                                key={String(val)}
                                className={`quiz-tf-btn ${selectedAnswer === val ? 'selected' : ''} ${showResult ? (val === question.answer ? 'correct' : selectedAnswer === val ? 'incorrect' : '') : ''
                                    }`}
                                onClick={() => !showResult && setSelectedAnswer(val)}
                                disabled={showResult}
                            >
                                {val ? '✓ TRUE' : '✗ FALSE'}
                            </button>
                        ))}
                    </div>
                )}

                {/* Result feedback */}
                {showResult && (
                    <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
                        {isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng!'}
                        {question.explanation && <p className="feedback-exp">{question.explanation}</p>}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="quiz-actions">
                {!showResult ? (
                    <button
                        className="quiz-submit-btn"
                        onClick={handleSubmit}
                        disabled={selectedAnswer === null && !gapInput.trim()}
                    >
                        Kiểm tra
                    </button>
                ) : (
                    <button className="quiz-next-btn" onClick={handleNext}>
                        {currentQ + 1 >= quiz.length ? '🏁 Xem kết quả' : '→ Câu tiếp'}
                    </button>
                )}
            </div>
        </div>
    );
}

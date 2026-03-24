// DailyReview — Spaced Repetition Review Queue
// Shows words due for review, flashcard + speak practice, SM-2 scoring
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { useSpeech } from '../hooks/useSpeech';
import { ALL_ENGLISH_WORDS } from '../data/english';
import StarBurst from '../components/StarBurst';

export default function DailyReview() {
    const navigate = useNavigate();
    const { getWordsForReview, reviewWord, addXP, recordDailyActivity, state } = useGame();
    const { speakEnglish, isSpeaking, startListening, isListening, checkPronunciation } = useSpeech();

    const reviewWords = getWordsForReview();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [speakResult, setSpeakResult] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [reviewedCount, setReviewedCount] = useState(0);

    // No words to review
    if (reviewWords.length === 0 && !completed) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '80px' }}>
                <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
                    Không có từ nào cần ôn tập!
                </h2>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '32px', lineHeight: 1.6 }}>
                    Con giỏi lắm! Hãy học thêm từ mới<br />rồi quay lại ôn tập nhé! 🌟
                </p>
                <button className="btn btn--primary btn--large" onClick={() => navigate('/')}>
                    🏠 Về trang chủ
                </button>
            </div>
        );
    }

    if (completed) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '60px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🏆</div>
                <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
                    Ôn tập xong rồi!
                </h2>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '24px', lineHeight: 1.6 }}>
                    Con đã ôn <strong>{reviewedCount} từ</strong> hôm nay!<br />
                    Trí nhớ con mạnh hơn rồi 💪🧠
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                    <button className="btn btn--success btn--large btn--block" onClick={() => navigate('/english')}>
                        📚 Học từ mới
                    </button>
                    <button className="btn btn--primary btn--block" onClick={() => navigate('/')}>
                        🏠 Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const currentWord = reviewWords[currentIndex];
    // Find full word data from english.js
    const wordData = ALL_ENGLISH_WORDS.find(w =>
        w.word.toLowerCase() === currentWord.word.toLowerCase()
    );
    const wordDisplay = wordData || { word: currentWord.word, emoji: '📝', vietnamese: '', example: '', exampleVi: '' };
    const progress = ((currentIndex + 1) / reviewWords.length) * 100;

    const handleFlip = () => {
        setFlipped(!flipped);
        if (!flipped) speakEnglish(wordDisplay.word);
    };

    const handleListen = () => speakEnglish(wordDisplay.word);

    const handleSpeak = () => {
        setSpeakResult(null);
        startListening('en-US', (results) => {
            const result = checkPronunciation(results, wordDisplay.word);
            setSpeakResult(result);

            // SM-2: convert score to quality 0-5
            let quality;
            if (result.score >= 90) quality = 5;
            else if (result.score >= 75) quality = 4;
            else if (result.score >= 60) quality = 3;
            else if (result.score >= 40) quality = 2;
            else quality = 1;

            // Update SM-2 data
            reviewWord(currentWord.word, currentWord.lang, quality);
            recordDailyActivity('review');

            if (result.score >= 60) {
                addXP(3);
                setCelebration(c => c + 1);
            }
        });
    };

    const handleNext = () => {
        setReviewedCount(r => r + 1);

        if (currentIndex >= reviewWords.length - 1) {
            setCelebration(c => c + 1);
            setCompleted(true);
            addXP(15); // Bonus for completing review
            return;
        }

        setCurrentIndex(prev => prev + 1);
        setFlipped(false);
        setSpeakResult(null);
    };

    const isLast = currentIndex >= reviewWords.length - 1;

    return (
        <div className="page">
            <StarBurst trigger={celebration} />

            {/* Header */}
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">🧠 Ôn tập hôm nay</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {/* Progress */}
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, #8B5CF6, #EC4899)',
                    }} />
                </div>
                <span className="lesson-progress__text">{currentIndex + 1}/{reviewWords.length}</span>
            </div>

            {/* Review Flashcard */}
            <div className="flashcard-container" onClick={handleFlip}>
                <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
                    <div className="flashcard-face flashcard-front">
                        <div style={{
                            position: 'absolute', top: '12px', right: '16px',
                            background: '#8B5CF6', color: 'white', borderRadius: '20px',
                            padding: '2px 10px', fontSize: '0.7rem', fontWeight: 700,
                        }}>
                            🧠 ÔN TẬP
                        </div>
                        <div className="flashcard-emoji">{wordDisplay.emoji}</div>
                        <div className="flashcard-word" style={{ color: '#8B5CF6' }}>{wordDisplay.word}</div>
                        <div className="flashcard-translation">{wordDisplay.vietnamese}</div>
                        <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                            👆 Nhấn để xem thêm
                        </p>
                    </div>
                    <div className="flashcard-face flashcard-back">
                        <div className="flashcard-emoji">{wordDisplay.emoji}</div>
                        <div className="flashcard-word">{wordDisplay.word}</div>
                        <div className="flashcard-translation">{wordDisplay.vietnamese}</div>
                        {wordDisplay.example && (
                            <div style={{
                                marginTop: '14px', padding: '10px 14px',
                                background: 'rgba(139,92,246,0.08)', borderRadius: '12px',
                                borderLeft: '4px solid #8B5CF6', textAlign: 'left',
                            }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', color: '#8B5CF6' }}>
                                    💬 {wordDisplay.example}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '3px', fontStyle: 'italic' }}>
                                    {wordDisplay.exampleVi}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Audio & Speaking */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
                <button className="btn btn--english btn--icon" onClick={(e) => { e.stopPropagation(); handleListen(); }} disabled={isSpeaking}>
                    🔊
                </button>
                <button className={`mic-button ${isListening ? 'listening' : ''}`} onClick={(e) => { e.stopPropagation(); handleSpeak(); }} disabled={isListening}>
                    🎤
                </button>
            </div>

            {/* Speaking result */}
            {speakResult && (
                <div className="animate-pop-in" style={{
                    textAlign: 'center', marginTop: '14px', padding: '10px',
                    borderRadius: 'var(--radius-lg)',
                    background: speakResult.score >= 60 ? '#ECFDF5' : '#FFF8F0',
                    border: `2px solid ${speakResult.score >= 60 ? 'var(--color-success)' : 'var(--color-xp)'}`,
                }}>
                    <span style={{ fontSize: '1.3rem' }}>
                        {speakResult.score >= 80 ? '🌟' : speakResult.score >= 60 ? '👍' : '💪'}
                    </span>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: '4px', fontSize: '0.9rem' }}>
                        {speakResult.score >= 80 ? 'Phát âm tuyệt vời!' : speakResult.score >= 60 ? 'Giỏi lắm!' : 'Cố lên, thử lại!'}
                    </p>
                </div>
            )}

            {/* Next */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button className="btn btn--primary btn--large btn--block" onClick={handleNext}>
                    {isLast ? '🎉 Hoàn thành ôn tập!' : 'Từ tiếp theo ▶️'}
                </button>
            </div>
        </div>
    );
}

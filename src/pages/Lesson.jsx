// Lesson page — English flashcard + speaking practice
import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ENGLISH_TOPICS } from '../data/english';
import { useGame } from '../context/GameStateContext';
import { useSpeech } from '../hooks/useSpeech';
import StarBurst from '../components/StarBurst';

export default function Lesson() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { addXP, learnWord, state } = useGame();
    const { speakEnglish, speakVietnamese, isSpeaking, startListening, isListening, transcript, checkPronunciation } = useSpeech();

    const topic = ENGLISH_TOPICS.find(t => t.id === topicId);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [celebration, setCelebration] = useState(0);
    const [speakResult, setSpeakResult] = useState(null);
    const [showComplete, setShowComplete] = useState(false);

    if (!topic) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <p>Không tìm thấy chủ đề 😔</p>
                <button className="btn btn--primary" onClick={() => navigate('/english')}>Quay lại</button>
            </div>
        );
    }

    const word = topic.words[currentIndex];
    const isLastWord = currentIndex === topic.words.length - 1;
    const progress = ((currentIndex + 1) / topic.words.length) * 100;

    const handleFlip = () => {
        setFlipped(!flipped);
        if (!flipped) {
            speakEnglish(word.word);
        }
    };

    const handleListen = () => {
        speakEnglish(word.word);
    };

    const handleSpeak = () => {
        setSpeakResult(null);
        startListening('en-US', (results) => {
            const result = checkPronunciation(results[0], word.word);
            setSpeakResult(result);
            if (result.score >= 60) {
                addXP(5);
                setCelebration(c => c + 1);
            }
        });
    };

    const handleNext = () => {
        learnWord(word.word, 'en');

        if (isLastWord) {
            addXP(20); // Bonus for completing topic
            setCelebration(c => c + 1);
            setShowComplete(true);
            return;
        }

        setCurrentIndex(prev => prev + 1);
        setFlipped(false);
        setSpeakResult(null);
    };

    if (showComplete) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '60px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '6rem', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                    Tuyệt vời!
                </h2>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '32px', fontSize: '1.1rem' }}>
                    Con đã học xong chủ đề <strong>{topic.title}</strong>!<br />
                    {topic.words.length} từ mới · +20 XP 🌟
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                    <button className="btn btn--success btn--block btn--large" onClick={() => navigate('/english')}>
                        📚 Học chủ đề khác
                    </button>
                    <button className="btn btn--game btn--block" onClick={() => navigate(`/game/quiz/en`)}>
                        🎮 Chơi trò chơi ôn tập
                    </button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>
                        🏠 Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <StarBurst trigger={celebration} />

            {/* Header */}
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/english')}>←</button>
                <h2 className="page-header__title">{topic.emoji} {topic.title}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {/* Progress */}
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${progress}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{currentIndex + 1}/{topic.words.length}</span>
            </div>

            {/* Flashcard */}
            <div className="flashcard-container" onClick={handleFlip}>
                <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
                    <div className="flashcard-face flashcard-front">
                        <div className="flashcard-emoji">{word.emoji}</div>
                        <div className="flashcard-word" style={{ color: 'var(--color-english)' }}>{word.word}</div>
                        <div className="flashcard-translation">{word.vietnamese}</div>
                        <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                            👆 Nhấn để lật thẻ
                        </p>
                    </div>
                    <div className="flashcard-face flashcard-back">
                        <div className="flashcard-emoji">{word.emoji}</div>
                        <div className="flashcard-word">{word.word}</div>
                        <div className="flashcard-translation">{word.vietnamese}</div>
                        {word.example && (
                            <div style={{
                                marginTop: '16px', padding: '12px 16px',
                                background: 'rgba(59,130,246,0.08)', borderRadius: '12px',
                                borderLeft: '4px solid var(--color-english)',
                                textAlign: 'left',
                            }}>
                                <div style={{
                                    fontFamily: 'var(--font-display)', fontWeight: 700,
                                    fontSize: '1rem', color: 'var(--color-english)',
                                    lineHeight: 1.4,
                                }}>
                                    💬 {word.example}
                                </div>
                                <div style={{
                                    fontSize: '0.85rem', color: 'var(--color-text-light)',
                                    marginTop: '4px', fontStyle: 'italic',
                                }}>
                                    {word.exampleVi}
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); speakEnglish(word.example); }}
                                    disabled={isSpeaking}
                                    style={{
                                        marginTop: '8px', background: 'var(--color-english)',
                                        color: 'white', border: 'none', borderRadius: '20px',
                                        padding: '4px 14px', fontSize: '0.8rem', cursor: 'pointer',
                                    }}
                                >
                                    🔊 Nghe câu ví dụ
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Audio & Speaking buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '24px' }}>
                <button
                    className="btn btn--english btn--icon"
                    onClick={(e) => { e.stopPropagation(); handleListen(); }}
                    disabled={isSpeaking}
                    title="Nghe phát âm"
                >
                    🔊
                </button>
                <button
                    className={`mic-button ${isListening ? 'listening' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleSpeak(); }}
                    disabled={isListening}
                    title="Nói theo"
                >
                    🎤
                </button>
            </div>

            {/* Speaking result */}
            {speakResult && (
                <div className="animate-pop-in" style={{
                    textAlign: 'center',
                    marginTop: '16px',
                    padding: '12px',
                    borderRadius: 'var(--radius-lg)',
                    background: speakResult.score >= 60 ? '#ECFDF5' : '#FFF8F0',
                    border: `2px solid ${speakResult.score >= 60 ? 'var(--color-success)' : 'var(--color-xp)'}`,
                }}>
                    <span style={{ fontSize: '1.5rem' }}>
                        {speakResult.score >= 80 ? '🌟' : speakResult.score >= 60 ? '👍' : '💪'}
                    </span>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: '4px' }}>
                        {speakResult.score >= 80
                            ? 'Xuất sắc! Phát âm rất tốt!'
                            : speakResult.score >= 60
                                ? 'Giỏi lắm! Gần đúng rồi!'
                                : 'Cố lên! Thử lại nào!'}
                    </p>
                    {transcript && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            Con nói: "{transcript}"
                        </p>
                    )}
                </div>
            )}

            {/* Next button */}
            <div style={{ marginTop: '24px', textAlign: 'center' }}>
                <button className="btn btn--primary btn--large btn--block" onClick={handleNext}>
                    {isLastWord ? '🎉 Hoàn thành!' : 'Tiếp theo ▶️'}
                </button>
            </div>
        </div>
    );
}

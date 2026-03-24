// LessonChinese — Chinese character flashcard + pinyin + tone + speaking
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CHINESE_TOPICS, TONE_COLORS } from '../data/chinese';
import { useGame } from '../context/GameStateContext';
import { useSpeech } from '../hooks/useSpeech';
import StarBurst from '../components/StarBurst';

export default function LessonChinese() {
    const { topicId } = useParams();
    const navigate = useNavigate();
    const { addXP, learnWord, state } = useGame();
    const { speakChinese, isSpeaking, startListening, isListening, transcript, checkPronunciation } = useSpeech();

    const topic = CHINESE_TOPICS.find(t => t.id === topicId);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [celebration, setCelebration] = useState(0);
    const [speakResult, setSpeakResult] = useState(null);
    const [showComplete, setShowComplete] = useState(false);

    if (!topic) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <p>Không tìm thấy chủ đề 😔</p>
                <button className="btn btn--primary" onClick={() => navigate('/chinese')}>Quay lại</button>
            </div>
        );
    }

    const word = topic.words[currentIndex];
    const isLastWord = currentIndex === topic.words.length - 1;
    const progress = ((currentIndex + 1) / topic.words.length) * 100;

    const handleFlip = () => {
        setFlipped(!flipped);
        if (!flipped) {
            speakChinese(word.character);
        }
    };

    const handleListen = () => {
        speakChinese(word.character);
    };

    const handleSpeak = () => {
        setSpeakResult(null);
        startListening('zh-CN', (results) => {
            const result = checkPronunciation(results[0], word.character);
            setSpeakResult(result);
            if (result.score >= 60) {
                addXP(5);
                setCelebration(c => c + 1);
            }
        });
    };

    const handleNext = () => {
        learnWord(word.character, 'cn');
        if (isLastWord) {
            addXP(20);
            setCelebration(c => c + 1);
            setShowComplete(true);
            return;
        }
        setCurrentIndex(prev => prev + 1);
        setFlipped(false);
        setSpeakResult(null);
    };

    // Render pinyin with tone colors
    const renderPinyin = (pinyin, tones) => {
        const syllables = pinyin.split(' ');
        return syllables.map((s, i) => (
            <span key={i} style={{
                color: TONE_COLORS[tones[i]] || TONE_COLORS[0],
                fontWeight: 700,
                fontSize: '1.4rem',
                margin: '0 2px',
            }}>
                {s}
            </span>
        ));
    };

    if (showComplete) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '60px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '6rem', marginBottom: '16px' }}>🐉</div>
                <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                    棒极了! Tuyệt vời!
                </h2>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '32px', fontSize: '1.1rem' }}>
                    Con đã học xong chủ đề <strong>{topic.title}</strong>!<br />
                    {topic.words.length} từ mới · +20 XP 🌟
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                    <button className="btn btn--chinese btn--block btn--large" onClick={() => navigate('/chinese')}>
                        📚 Học chủ đề khác
                    </button>
                    <button className="btn btn--game btn--block" onClick={() => navigate(`/game/quiz/cn`)}>
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
                <button className="page-header__back" onClick={() => navigate('/chinese')}>←</button>
                <h2 className="page-header__title">{topic.emoji} {topic.title}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {/* Progress */}
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${progress}%`, background: 'var(--gradient-chinese)' }} />
                </div>
                <span className="lesson-progress__text">{currentIndex + 1}/{topic.words.length}</span>
            </div>

            {/* Flashcard */}
            <div className="flashcard-container" onClick={handleFlip}>
                <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
                    <div className="flashcard-face flashcard-front" style={{ border: '3px solid var(--color-chinese-light)' }}>
                        <div className="flashcard-emoji">{word.emoji}</div>
                        <div style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '3rem',
                            fontWeight: 700,
                            color: 'var(--color-chinese)',
                            marginBottom: '8px',
                        }}>
                            {word.character}
                        </div>
                        <div style={{ marginBottom: '8px' }}>
                            {renderPinyin(word.pinyin, word.tones)}
                        </div>
                        <div className="flashcard-translation">{word.vietnamese}</div>
                        <p style={{ marginTop: '12px', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                            👆 Nhấn để lật thẻ
                        </p>
                    </div>
                    <div className="flashcard-face flashcard-back" style={{ background: 'var(--gradient-chinese)' }}>
                        <div className="flashcard-emoji">{word.emoji}</div>
                        <div style={{ fontSize: '3rem', fontWeight: 700 }}>{word.character}</div>
                        <div style={{ fontSize: '1.3rem', marginTop: '8px', opacity: 0.9 }}>{word.pinyin}</div>
                        <div style={{ fontSize: '1.1rem', marginTop: '8px', opacity: 0.8 }}>{word.vietnamese}</div>
                    </div>
                </div>
            </div>

            {/* Tone legend */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginTop: '16px',
                flexWrap: 'wrap',
            }}>
                {word.tones.filter((v, i, a) => a.indexOf(v) === i).map(t => (
                    <span key={t} style={{
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        borderRadius: '99px',
                        background: `${TONE_COLORS[t]}15`,
                        color: TONE_COLORS[t],
                        fontWeight: 600,
                        fontFamily: 'var(--font-display)',
                    }}>
                        Thanh {t === 0 ? 'nhẹ' : t}
                    </span>
                ))}
            </div>

            {/* Audio & Speaking */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
                <button
                    className="btn btn--chinese btn--icon"
                    onClick={(e) => { e.stopPropagation(); handleListen(); }}
                    disabled={isSpeaking}
                >
                    🔊
                </button>
                <button
                    className={`mic-button ${isListening ? 'listening' : ''}`}
                    onClick={(e) => { e.stopPropagation(); handleSpeak(); }}
                    disabled={isListening}
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
                        {speakResult.score >= 80 ? '🐉' : speakResult.score >= 60 ? '👍' : '💪'}
                    </span>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginTop: '4px' }}>
                        {speakResult.score >= 80
                            ? '棒极了! Phát âm rất tốt!'
                            : speakResult.score >= 60
                                ? '很好! Gần đúng rồi!'
                                : '加油! Cố lên nào!'}
                    </p>
                </div>
            )}

            {/* Next */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button className="btn btn--chinese btn--large btn--block" onClick={handleNext}>
                    {isLastWord ? '🐉 Hoàn thành!' : 'Tiếp theo ▶️'}
                </button>
            </div>
        </div>
    );
}

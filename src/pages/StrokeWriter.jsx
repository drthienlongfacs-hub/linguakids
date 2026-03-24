// StrokeWriter — Chinese character stroke order practice
// Uses HanziWriter (MIT license open-source) for animation + quiz
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HanziWriter from 'hanzi-writer';
import { useGame } from '../context/GameStateContext';
import { useSpeech } from '../hooks/useSpeech';
import StarBurst from '../components/StarBurst';

const CHARACTERS = [
    { char: '一', pinyin: 'yī', meaning: 'một', strokes: 1 },
    { char: '二', pinyin: 'èr', meaning: 'hai', strokes: 2 },
    { char: '三', pinyin: 'sān', meaning: 'ba', strokes: 3 },
    { char: '人', pinyin: 'rén', meaning: 'người', strokes: 2 },
    { char: '大', pinyin: 'dà', meaning: 'lớn', strokes: 3 },
    { char: '小', pinyin: 'xiǎo', meaning: 'nhỏ', strokes: 3 },
    { char: '口', pinyin: 'kǒu', meaning: 'miệng', strokes: 3 },
    { char: '日', pinyin: 'rì', meaning: 'ngày/mặt trời', strokes: 4 },
    { char: '月', pinyin: 'yuè', meaning: 'tháng/mặt trăng', strokes: 4 },
    { char: '水', pinyin: 'shuǐ', meaning: 'nước', strokes: 4 },
    { char: '火', pinyin: 'huǒ', meaning: 'lửa', strokes: 4 },
    { char: '山', pinyin: 'shān', meaning: 'núi', strokes: 3 },
    { char: '木', pinyin: 'mù', meaning: 'cây/gỗ', strokes: 4 },
    { char: '手', pinyin: 'shǒu', meaning: 'tay', strokes: 4 },
    { char: '心', pinyin: 'xīn', meaning: 'trái tim', strokes: 4 },
    { char: '你', pinyin: 'nǐ', meaning: 'bạn', strokes: 7 },
    { char: '我', pinyin: 'wǒ', meaning: 'tôi', strokes: 7 },
    { char: '好', pinyin: 'hǎo', meaning: 'tốt/khỏe', strokes: 6 },
    { char: '爱', pinyin: 'ài', meaning: 'yêu', strokes: 10 },
    { char: '家', pinyin: 'jiā', meaning: 'nhà/gia đình', strokes: 10 },
];

export default function StrokeWriter() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const { speakChinese } = useSpeech();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [mode, setMode] = useState('learn'); // learn | quiz
    const [quizResult, setQuizResult] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const writerRef = useRef(null);
    const containerRef = useRef(null);

    const char = CHARACTERS[currentIndex];

    // Initialize HanziWriter
    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous
        containerRef.current.innerHTML = '';
        setQuizResult(null);
        setMistakes(0);

        const size = Math.min(280, window.innerWidth - 80);

        const writer = HanziWriter.create(containerRef.current, char.char, {
            width: size,
            height: size,
            padding: 15,
            showOutline: true,
            showCharacter: mode === 'learn',
            strokeColor: '#6C63FF',
            outlineColor: '#DDD',
            highlightColor: '#3B82F6',
            strokeAnimationSpeed: 1,
            delayBetweenStrokes: 300,
            drawingWidth: 20,
            showHintAfterMisses: mode === 'quiz' ? 3 : 1,
            highlightOnComplete: true,
            charDataLoader: (char) => {
                return fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${char}.json`)
                    .then(r => r.json());
            },
        });

        writerRef.current = writer;

        // Auto-animate in learn mode
        if (mode === 'learn') {
            setTimeout(() => writer.animateCharacter(), 500);
        } else {
            // Quiz mode
            writer.quiz({
                onMistake: (data) => {
                    setMistakes(m => m + 1);
                },
                onComplete: (data) => {
                    const perfect = data.totalMistakes === 0;
                    setQuizResult(perfect ? 'perfect' : 'good');
                    addXP(perfect ? 15 : 5);
                    setCelebration(c => c + 1);
                },
            });
        }

        return () => {
            if (containerRef.current) containerRef.current.innerHTML = '';
        };
    }, [currentIndex, mode, char.char]);

    const handleAnimate = () => {
        writerRef.current?.animateCharacter();
    };

    const handleQuiz = () => {
        setMode('quiz');
    };

    const handleNext = () => {
        if (currentIndex + 1 < CHARACTERS.length) {
            setCurrentIndex(i => i + 1);
            setMode('learn');
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(i => i - 1);
            setMode('learn');
        }
    };

    const progress = ((currentIndex + 1) / CHARACTERS.length) * 100;

    return (
        <div className="page">
            <StarBurst trigger={celebration} />

            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">✍️ Viết chữ Hán</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${progress}%`, background: 'var(--gradient-chinese)' }} />
                </div>
                <span className="lesson-progress__text">{currentIndex + 1}/{CHARACTERS.length}</span>
            </div>

            {/* Character info */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '4px' }}>{char.char}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-chinese)' }}>
                    {char.pinyin}
                </div>
                <div style={{ fontSize: '0.95rem', color: 'var(--color-text-light)' }}>
                    {char.meaning} · {char.strokes} nét
                </div>
                <button style={{
                    marginTop: '8px', background: 'none', border: '2px solid var(--color-chinese-light)',
                    borderRadius: 'var(--radius-full)', padding: '6px 16px', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-chinese)',
                }} onClick={() => speakChinese(char.char)}>
                    🔊 Nghe phát âm
                </button>
            </div>

            {/* Writer canvas */}
            <div style={{
                display: 'flex', justifyContent: 'center', marginBottom: '16px',
            }}>
                <div ref={containerRef} style={{
                    background: 'white',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-lg)',
                    border: mode === 'quiz' ? '3px solid var(--color-primary)' : '3px solid var(--color-border)',
                    overflow: 'hidden',
                    touchAction: 'none',
                }} />
            </div>

            {/* Mode indicator */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                {mode === 'learn' ? (
                    <p style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                        👀 Xem cách viết → nhấn ✍️ để luyện tập
                    </p>
                ) : quizResult ? (
                    <div className="animate-pop-in" style={{
                        fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700,
                        color: quizResult === 'perfect' ? 'var(--color-success)' : 'var(--color-primary)',
                    }}>
                        {quizResult === 'perfect' ? '🌟 Hoàn hảo! +15 XP' : `👍 Tốt lắm! +5 XP (${mistakes} lỗi)`}
                    </div>
                ) : (
                    <p style={{ fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontSize: '0.95rem', fontWeight: 700 }}>
                        ✍️ Dùng ngón tay viết theo thứ tự nét!
                    </p>
                )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {mode === 'learn' && (
                    <>
                        <button className="btn btn--outline" onClick={handleAnimate} style={{ flex: 1 }}>
                            🔄 Xem lại
                        </button>
                        <button className="btn btn--primary" onClick={handleQuiz} style={{ flex: 1 }}>
                            ✍️ Luyện viết
                        </button>
                    </>
                )}
                {(mode === 'quiz' && quizResult) && (
                    <>
                        <button className="btn btn--outline" onClick={() => setMode('learn')} style={{ flex: 1 }}>
                            👀 Xem lại
                        </button>
                        <button className="btn btn--primary" onClick={handleNext}
                            disabled={currentIndex + 1 >= CHARACTERS.length} style={{ flex: 1 }}>
                            ▶️ Chữ tiếp
                        </button>
                    </>
                )}
            </div>

            {/* Character grid navigation */}
            <div style={{ marginTop: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px', fontSize: '1rem' }}>
                    📚 Bộ chữ ({CHARACTERS.length} chữ)
                </h3>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px',
                }}>
                    {CHARACTERS.map((c, i) => (
                        <button key={c.char} onClick={() => { setCurrentIndex(i); setMode('learn'); }}
                            style={{
                                padding: '10px 4px', borderRadius: 'var(--radius-md)',
                                border: i === currentIndex ? '2px solid var(--color-primary)' : '2px solid var(--color-border)',
                                background: i === currentIndex ? '#F0F0FF' : 'white',
                                fontFamily: 'var(--font-display)', fontWeight: 700,
                                fontSize: '1.3rem', cursor: 'pointer',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                            }}>
                            <span>{c.char}</span>
                            <span style={{ fontSize: '0.6rem', color: 'var(--color-text-light)' }}>{c.pinyin}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

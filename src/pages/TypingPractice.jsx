// TypingPractice — Speed typing game for vocabulary reinforcement
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_ENGLISH_WORDS } from '../data/english';
import { ALL_CHINESE_WORDS } from '../data/chinese';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const TOTAL_WORDS = 10;

export default function TypingPractice() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const isEnglish = lang === 'en';
    const allWords = isEnglish ? ALL_ENGLISH_WORDS : ALL_CHINESE_WORDS;

    const [words, setWords] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(0);
    const [timer, setTimer] = useState(0);
    const [started, setStarted] = useState(false);
    const [complete, setComplete] = useState(false);
    const [celebration, setCelebration] = useState(0);
    const [results, setResults] = useState([]);

    useEffect(() => {
        const selected = shuffle(allWords).slice(0, TOTAL_WORDS);
        setWords(selected);
    }, []);

    // Timer
    useEffect(() => {
        if (!started || complete) return;
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [started, complete]);

    const currentWord = words[currentIdx];

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!currentWord) return;
        if (!started) setStarted(true);

        const target = isEnglish ? currentWord.word : currentWord.character;
        const correct = input.trim().toLowerCase() === target.toLowerCase();

        setResults(prev => [...prev, { word: target, typed: input.trim(), correct }]);

        if (correct) {
            setScore(s => s + 1);
            addXP(5);
            setCelebration(c => c + 1);
        }

        if (currentIdx + 1 >= TOTAL_WORDS) {
            setComplete(true);
        } else {
            setCurrentIdx(i => i + 1);
        }
        setInput('');
    }, [input, currentWord, currentIdx, isEnglish, started]);

    if (words.length === 0) return null;

    if (complete) {
        const pct = Math.round((score / TOTAL_WORDS) * 100);
        const wpm = timer > 0 ? Math.round((TOTAL_WORDS / timer) * 60) : 0;
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '12px' }}>{pct >= 80 ? '🏆' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>{pct >= 80 ? 'Xuất sắc!' : 'Cố lên!'}</h2>
                <p style={{ color: 'var(--color-text-light)', margin: '8px 0' }}>
                    Đúng {score}/{TOTAL_WORDS} ({pct}%) · ⏱️ {timer}s · {wpm} từ/phút
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '16px' }}>
                    +{score * 5} XP ⭐
                </p>

                {/* Results breakdown */}
                <div style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto 24px' }}>
                    {results.map((r, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
                            borderRadius: 'var(--radius-md)', marginBottom: '4px',
                            background: r.correct ? '#ECFDF520' : '#FFF1F220',
                            border: `1px solid ${r.correct ? '#22C55E33' : '#EF444433'}`,
                        }}>
                            <span style={{ fontWeight: 700 }}>{r.word}</span>
                            <span style={{ color: r.correct ? 'var(--color-success)' : 'var(--color-error)' }}>
                                {r.correct ? '✅' : `❌ ${r.typed}`}
                            </span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => window.location.reload()}>🔄 Chơi lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>🎮 Trò chơi khác</button>
                </div>
            </div>
        );
    }

    const progress = ((currentIdx) / TOTAL_WORDS) * 100;

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">⌨️ Gõ nhanh {isEnglish ? '🇬🇧' : '🇨🇳'}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{
                        width: `${progress}%`,
                        background: isEnglish ? 'var(--gradient-english)' : 'var(--gradient-chinese)',
                    }} />
                </div>
                <span className="lesson-progress__text">{currentIdx + 1}/{TOTAL_WORDS}</span>
            </div>

            {started && (
                <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                    ⏱️ {timer}s · ✅ {score}/{currentIdx}
                </div>
            )}

            {/* Word to type */}
            <div style={{
                textAlign: 'center', margin: '24px 0',
                padding: '24px', borderRadius: 'var(--radius-lg)',
                background: 'var(--color-card)', boxShadow: 'var(--shadow-md)',
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{currentWord.emoji}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--color-text-light)', marginBottom: '8px' }}>
                    {currentWord.vietnamese}
                </div>
                {!isEnglish && currentWord.pinyin && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{currentWord.pinyin}</div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={isEnglish ? 'Type the word...' : '输入汉字...'}
                    autoFocus
                    autoComplete="off"
                    style={{
                        flex: 1, padding: '14px 18px', borderRadius: 'var(--radius-lg)',
                        border: '2px solid var(--color-border)', background: 'var(--color-card)',
                        fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600,
                        color: 'var(--color-text)', outline: 'none',
                        transition: 'border-color var(--transition-fast)',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                />
                <button type="submit" className="btn btn--primary btn--large" disabled={!input.trim()}>
                    ➤
                </button>
            </form>

            <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.8rem', marginTop: '12px' }}>
                💡 Nhìn emoji + nghĩa VN → gõ từ {isEnglish ? 'tiếng Anh' : 'tiếng Trung'}
            </p>
        </div>
    );
}

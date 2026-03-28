// Memory Match Game — flip cards to match emoji ↔ word
// Now with difficulty selector, timer, and best-time tracking
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_ENGLISH_WORDS } from '../data/english';
import { ALL_CHINESE_WORDS } from '../data/chinese';
import { useGame } from '../context/GameStateContext';
import { usePracticeLexicon } from '../hooks/usePracticeLexicon';
import { isAdultMode } from '../utils/userMode';
import StarBurst from '../components/StarBurst';

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const DIFFICULTIES = [
    { key: 'easy', label: '😊 Dễ', pairs: 6, color: '#10B981' },
    { key: 'medium', label: '💪 Vừa', pairs: 8, color: '#F59E0B' },
    { key: 'hard', label: '🔥 Khó', pairs: 10, color: '#EF4444' },
];

export default function MemoryGame() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { addXP, recordGame, state } = useGame();
    const adult = isAdultMode(state.userMode);
    const [difficulty, setDifficulty] = useState(null);
    const [cards, setCards] = useState([]);
    const [flippedIds, setFlippedIds] = useState([]);
    const [matchedIds, setMatchedIds] = useState([]);
    const [celebration, setCelebration] = useState(0);
    const [moves, setMoves] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef(null);

    const isEnglish = lang === 'en';
    const { items: allWords, loading: lexiconLoading, sourceLabel } = usePracticeLexicon({
        lang,
        adult,
        fallbackEnglish: ALL_ENGLISH_WORDS,
        fallbackChinese: ALL_CHINESE_WORDS,
    });

    const bestKey = `memory-best-${lang}-${difficulty?.key || 'easy'}`;
    const bestTime = parseInt(localStorage.getItem(bestKey) || '9999', 10);

    // Start game with chosen difficulty
    const startGame = (diff) => {
        setDifficulty(diff);
        setMoves(0);
        setMatchedIds([]);
        setFlippedIds([]);
        setGameComplete(false);
        setElapsed(0);

        const selected = shuffle(allWords).slice(0, diff.pairs);
        const pairs = selected.flatMap((w, i) => [
            { id: `emoji-${i}`, pairId: i, type: 'emoji', display: w.emoji, text: '' },
            { id: `word-${i}`, pairId: i, type: 'word', display: isEnglish ? w.word : w.character, text: isEnglish ? '' : w.pinyin || '' },
        ]);
        setCards(shuffle(pairs));

        // Start timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    };

    useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

    const handleCardClick = (card) => {
        if (flippedIds.length >= 2) return;
        if (flippedIds.includes(card.id)) return;
        if (matchedIds.includes(card.id)) return;

        const newFlipped = [...flippedIds, card.id];
        setFlippedIds(newFlipped);

        if (newFlipped.length === 2) {
            setMoves(m => m + 1);
            const [first, second] = newFlipped.map(id => cards.find(c => c.id === id));

            if (first.pairId === second.pairId && first.type !== second.type) {
                setTimeout(() => {
                    const newMatched = [...matchedIds, first.id, second.id];
                    setMatchedIds(newMatched);
                    setFlippedIds([]);
                    addXP(5);
                    setCelebration(c => c + 1);

                    if (newMatched.length === cards.length) {
                        setGameComplete(true);
                        if (timerRef.current) clearInterval(timerRef.current);
                        recordGame(moves + 1 <= difficulty.pairs + 4);
                        // Save best time
                        if (elapsed < bestTime) {
                            localStorage.setItem(bestKey, String(elapsed));
                        }
                    }
                }, 600);
            } else {
                setTimeout(() => setFlippedIds([]), 1000);
            }
        }
    };

    // ─── Difficulty Selector ───
    if (!difficulty) {
        if (lexiconLoading || !allWords.length) {
            return (
                <div className="page" style={{ textAlign: 'center', paddingTop: '60px' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🃏</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                        Lật Thẻ {isEnglish ? '🇬🇧' : '🇨🇳'}
                    </h2>
                    <p style={{ color: 'var(--color-text-light)' }}>
                        {adult ? 'Đang tải ngân hàng dữ liệu chuẩn...' : 'Đang chuẩn bị...'}
                    </p>
                </div>
            );
        }

        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '60px' }}>
                <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🃏</div>
                <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                    Lật Thẻ {isEnglish ? '🇬🇧' : '🇨🇳'}
                </h2>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '32px' }}>
                    Ghép emoji với từ vựng! Chọn độ khó:
                </p>
                <div style={{ marginBottom: '16px', fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                    {sourceLabel === 'standard' ? 'Nguồn: Standard lexicon' : 'Nguồn: Curriculum'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '300px', margin: '0 auto' }}>
                    {DIFFICULTIES.map(d => (
                        <button
                            key={d.key}
                            className="glass-card"
                            onClick={() => startGame(d)}
                            style={{
                                padding: '18px 24px', textAlign: 'left', cursor: 'pointer',
                                border: `2px solid ${d.color}33`, display: 'flex', alignItems: 'center',
                                gap: '16px', transition: 'var(--transition-normal)',
                            }}
                        >
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '14px',
                                background: `${d.color}15`, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0,
                            }}>
                                {d.label.split(' ')[0]}
                            </div>
                            <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: d.color }}>
                                    {d.label.split(' ')[1]}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                    {d.pairs} cặp thẻ
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
                <button className="btn btn--outline" onClick={() => navigate('/games')} style={{ marginTop: '24px' }}>
                    ← Trò chơi khác
                </button>
            </div>
        );
    }

    // ─── Game Complete ───
    if (gameComplete) {
        const isNewBest = elapsed < bestTime || bestTime >= 9999;
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '60px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '6rem', marginBottom: '16px' }}>{isNewBest ? '🥇' : '🏆'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                    {isNewBest ? 'Kỷ lục mới!' : 'Giỏi quá!'}
                </h2>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '8px', fontSize: '1.1rem' }}>
                    {difficulty.label} · {cards.length / 2} cặp thẻ
                </p>
                <div style={{
                    display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '24px',
                    fontFamily: 'var(--font-display)', fontSize: '1.2rem',
                }}>
                    <div>
                        <div style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>{moves}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Lượt</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', color: 'var(--color-xp)' }}>{elapsed}s</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Thời gian</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '2rem', color: 'var(--color-success)' }}>+{(cards.length / 2) * 5}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>XP ⭐</div>
                    </div>
                </div>
                {isNewBest && (
                    <div className="animate-pop-in" style={{
                        background: '#FFF7ED', border: '2px solid #F59E0B', borderRadius: 'var(--radius-lg)',
                        padding: '10px 20px', marginBottom: '20px', display: 'inline-block',
                    }}>
                        🏅 Kỷ lục: <strong>{elapsed}s</strong> (trước: {bestTime >= 9999 ? '--' : bestTime + 's'})
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => startGame(difficulty)}>
                        🔄 Chơi lại
                    </button>
                    <button className="btn btn--outline btn--block" onClick={() => setDifficulty(null)}>
                        🎚️ Đổi độ khó
                    </button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>
                        🎮 Trò chơi khác
                    </button>
                </div>
            </div>
        );
    }

    // ─── Game Board ───
    return (
        <div className="page">
            <StarBurst trigger={celebration} />

            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">
                    🃏 Lật Thẻ {isEnglish ? '🇬🇧' : '🇨🇳'}
                </h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {/* Stats bar */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '16px',
                fontFamily: 'var(--font-display)', flexWrap: 'wrap',
            }}>
                <span style={{
                    background: `${difficulty.color}15`, color: difficulty.color,
                    padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.85rem', fontWeight: 700,
                }}>
                    {difficulty.label}
                </span>
                <span style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                    ⏱️ {elapsed}s
                </span>
                <span style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                    Lượt: {moves} · Ghép: {matchedIds.length / 2}/{cards.length / 2}
                </span>
                <span style={{ color: 'var(--color-text-light)', fontSize: '0.82rem' }}>
                    {sourceLabel === 'standard' ? 'Standard lexicon' : 'Curriculum'}
                </span>
            </div>

            <div className="memory-grid">
                {cards.map(card => {
                    const isFlipped = flippedIds.includes(card.id);
                    const isMatched = matchedIds.includes(card.id);

                    return (
                        <div
                            key={card.id}
                            className={`memory-card ${isFlipped || isMatched ? 'revealed' : ''} ${isMatched ? 'matched' : ''}`}
                            onClick={() => !isFlipped && !isMatched && handleCardClick(card)}
                        >
                            <div className="memory-card-inner">
                                <div className="memory-card-face memory-card-front">❓</div>
                                <div className="memory-card-face memory-card-back">
                                    <span>{card.display}</span>
                                    {card.text && <span className="card-text">{card.text}</span>}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

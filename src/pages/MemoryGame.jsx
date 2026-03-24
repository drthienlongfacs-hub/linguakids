// Memory Match Game — flip cards to match emoji ↔ word
import { useState, useEffect } from 'react';
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

export default function MemoryGame() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { addXP, recordGame, state } = useGame();
    const [cards, setCards] = useState([]);
    const [flippedIds, setFlippedIds] = useState([]);
    const [matchedIds, setMatchedIds] = useState([]);
    const [celebration, setCelebration] = useState(0);
    const [moves, setMoves] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);

    const isEnglish = lang === 'en';
    const allWords = isEnglish ? ALL_ENGLISH_WORDS : ALL_CHINESE_WORDS;

    useEffect(() => {
        // Pick 6 random words and create pairs
        const selected = shuffle(allWords).slice(0, 6);
        const pairs = selected.flatMap((w, i) => [
            {
                id: `emoji-${i}`,
                pairId: i,
                type: 'emoji',
                display: w.emoji,
                text: '',
            },
            {
                id: `word-${i}`,
                pairId: i,
                type: 'word',
                display: isEnglish ? w.word : w.character,
                text: isEnglish ? '' : w.pinyin || '',
            },
        ]);
        setCards(shuffle(pairs));
    }, []);

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
                // Match!
                setTimeout(() => {
                    setMatchedIds(prev => [...prev, first.id, second.id]);
                    setFlippedIds([]);
                    addXP(5);
                    setCelebration(c => c + 1);

                    // Check game complete
                    if (matchedIds.length + 2 === cards.length) {
                        setGameComplete(true);
                        recordGame(moves + 1 <= 10);
                    }
                }, 600);
            } else {
                // No match — flip back
                setTimeout(() => setFlippedIds([]), 1000);
            }
        }
    };

    if (gameComplete) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '60px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '6rem', marginBottom: '16px' }}>🏆</div>
                <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                    Giỏi quá!
                </h2>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '8px', fontSize: '1.1rem' }}>
                    Con đã ghép hết {cards.length / 2} cặp thẻ!
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '32px' }}>
                    {moves} lượt · +{(cards.length / 2) * 5} XP ⭐
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => window.location.reload()}>
                        🔄 Chơi lại
                    </button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>
                        🎮 Trò chơi khác
                    </button>
                </div>
            </div>
        );
    }

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

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-light)' }}>
                    Lượt: {moves} · Ghép: {matchedIds.length / 2}/{cards.length / 2}
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

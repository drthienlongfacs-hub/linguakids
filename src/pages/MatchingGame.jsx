// MatchingGame — Match words to their Vietnamese translations
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_ENGLISH_WORDS } from '../data/english';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

function shuffle(arr) {
    const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a;
}

const PAIRS = 6;

export default function MatchingGame() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [words, setWords] = useState([]);
    const [selected, setSelected] = useState(null);
    const [matched, setMatched] = useState(new Set());
    const [wrong, setWrong] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [timer, setTimer] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const picked = shuffle(ALL_ENGLISH_WORDS).slice(0, PAIRS);
        const left = picked.map((w, i) => ({ id: `en-${i}`, text: w.word, emoji: w.emoji, pairId: i, type: 'en' }));
        const right = picked.map((w, i) => ({ id: `vi-${i}`, text: w.vietnamese, emoji: w.emoji, pairId: i, type: 'vi' }));
        setWords(shuffle([...left, ...right]));
    }, []);

    useEffect(() => {
        if (!started || matched.size >= PAIRS * 2) return;
        const interval = setInterval(() => setTimer(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [started, matched.size]);

    const handleClick = (item) => {
        if (matched.has(item.id) || wrong) return;
        if (!started) setStarted(true);

        if (!selected) {
            setSelected(item);
        } else if (selected.id === item.id) {
            setSelected(null);
        } else if (selected.pairId === item.pairId && selected.type !== item.type) {
            // Match!
            setMatched(prev => new Set([...prev, selected.id, item.id]));
            setSelected(null);
            setCelebration(c => c + 1);
            addXP(10);
        } else {
            // Wrong
            setWrong(item.id);
            setTimeout(() => { setWrong(null); setSelected(null); }, 600);
        }
    };

    const complete = matched.size >= PAIRS * 2;

    if (complete) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '12px' }}>🎉</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Hoàn thành!</h2>
                <p style={{ color: 'var(--color-text-light)', margin: '8px 0' }}>
                    ⏱️ {timer}s · +{PAIRS * 10} XP ⭐
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '20px auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => window.location.reload()}>🔄 Chơi lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>🎮 Trò chơi khác</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🔗 Ghép đôi</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {started && (
                <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                    ⏱️ {timer}s · ✅ {matched.size / 2}/{PAIRS}
                </div>
            )}

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px',
                maxWidth: '450px', margin: '16px auto',
            }}>
                {words.map(item => {
                    const isMatched = matched.has(item.id);
                    const isSelected = selected?.id === item.id;
                    const isWrong = wrong === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleClick(item)}
                            disabled={isMatched}
                            style={{
                                padding: '14px 8px', border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                background: isMatched ? '#22C55E20' : isSelected ? '#3B82F620' : isWrong ? '#EF444420' : 'var(--color-card)',
                                border: isMatched ? '2px solid #22C55E' : isSelected ? '2px solid #3B82F6' : isWrong ? '2px solid #EF4444' : '2px solid var(--color-border)',
                                cursor: isMatched ? 'default' : 'pointer',
                                opacity: isMatched ? 0.6 : 1,
                                transition: 'all 0.2s',
                                textAlign: 'center',
                            }}
                        >
                            <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>{item.emoji}</div>
                            <div style={{
                                fontFamily: 'var(--font-display)', fontWeight: 700,
                                fontSize: item.type === 'vi' ? '0.75rem' : '0.85rem',
                                color: isMatched ? '#22C55E' : isSelected ? '#3B82F6' : 'var(--color-text)',
                            }}>
                                {item.text}
                            </div>
                        </button>
                    );
                })}
            </div>

            <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.8rem' }}>
                💡 Chọn 2 thẻ có cùng nghĩa (EN ↔ VN) để ghép đôi
            </p>
        </div>
    );
}

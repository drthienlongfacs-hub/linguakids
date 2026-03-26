// DailyChallenge — Daily streak challenge with random mini-games
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { ALL_ENGLISH_WORDS } from '../data/english';
import StarBurst from '../components/StarBurst';

function shuffle(arr) {
    const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a;
}

const TOTAL_Q = 5;

export default function DailyChallenge() {
    const navigate = useNavigate();
    const { addXP, recordDailyActivity, state } = useGame();
    const [qIdx, setQIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);

    const today = new Date().toISOString().slice(0, 10);
    const alreadyDone = state.lastDailyChallenge === today;

    const questions = useMemo(() => {
        const words = shuffle(ALL_ENGLISH_WORDS).slice(0, TOTAL_Q);
        return words.map(w => {
            const wrongAnswers = shuffle(ALL_ENGLISH_WORDS.filter(x => x.word !== w.word)).slice(0, 3).map(x => x.vietnamese);
            const options = shuffle([w.vietnamese, ...wrongAnswers]);
            return { word: w.word, emoji: w.emoji, correct: w.vietnamese, options };
        });
    }, []);

    const handleAnswer = (option) => {
        if (selected) return;
        const q = questions[qIdx];
        const correct = option === q.correct;
        setSelected(option);
        if (correct) {
            setScore(s => s + 1);
            addXP(10);
            setCelebration(c => c + 1);
        }
        setTimeout(() => {
            setSelected(null);
            if (qIdx + 1 >= TOTAL_Q) {
                setComplete(true);
                recordDailyActivity?.();
            } else {
                setQIdx(i => i + 1);
            }
        }, 800);
    };

    if (alreadyDone && !complete) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '80px' }}>
                <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Thử thách hôm nay đã hoàn thành!</h2>
                <p style={{ color: 'var(--color-text-light)', margin: '12px 0' }}>Quay lại vào ngày mai nhé 💪</p>
                <button className="btn btn--primary btn--large" onClick={() => navigate('/')}>🏠 Trang chủ</button>
            </div>
        );
    }

    if (complete) {
        const pct = Math.round((score / TOTAL_Q) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '12px' }}>{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Thử thách hôm nay</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', margin: '8px 0' }}>
                    {score}/{TOTAL_Q} ({pct}%)
                </p>
                <p style={{ color: 'var(--color-text-light)' }}>+{score * 10} XP ⭐</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '20px auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => navigate('/')}>🏠 Trang chủ</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>🎮 Trò chơi</button>
                </div>
            </div>
        );
    }

    const q = questions[qIdx];
    if (!q) return null;

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">🎯 Thử thách hôm nay</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(qIdx / TOTAL_Q) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{qIdx + 1}/{TOTAL_Q}</span>
            </div>

            <div style={{ textAlign: 'center', margin: '24px 0', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{q.emoji}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>{q.word}</div>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginTop: '4px' }}>Nghĩa của từ này?</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {q.options.map((opt, i) => {
                    const isCorrect = opt === q.correct;
                    const isSelected = selected === opt;
                    const showColor = selected !== null;
                    return (
                        <button key={i} onClick={() => handleAnswer(opt)} disabled={!!selected}
                            style={{
                                padding: '16px 12px', border: 'none', borderRadius: 'var(--radius-lg)',
                                background: showColor ? (isCorrect ? '#22C55E20' : isSelected ? '#EF444420' : 'var(--color-card)') : 'var(--color-card)',
                                border: showColor ? (isCorrect ? '2px solid #22C55E' : isSelected ? '2px solid #EF4444' : '2px solid var(--color-border)') : '2px solid var(--color-border)',
                                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '0.95rem',
                                color: 'var(--color-text)', cursor: selected ? 'default' : 'pointer', transition: 'all 0.2s',
                            }}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// CollocationTrainer — Learn common English word combinations
// make/do/take/have/get — the most confusing collocations for VN learners
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const EXERCISES = [
    { sentence: '___ a decision', answer: 'make', options: ['make', 'do', 'take', 'have'], vi: 'đưa ra quyết định', group: 'MAKE' },
    { sentence: '___ homework', answer: 'do', options: ['make', 'do', 'take', 'have'], vi: 'làm bài tập', group: 'DO' },
    { sentence: '___ a photo', answer: 'take', options: ['make', 'do', 'take', 'have'], vi: 'chụp ảnh', group: 'TAKE' },
    { sentence: '___ a shower', answer: 'take', options: ['make', 'do', 'take', 'have'], vi: 'tắm', group: 'TAKE' },
    { sentence: '___ breakfast', answer: 'have', options: ['make', 'do', 'take', 'have'], vi: 'ăn sáng', group: 'HAVE' },
    { sentence: '___ a mistake', answer: 'make', options: ['make', 'do', 'take', 'have'], vi: 'phạm lỗi', group: 'MAKE' },
    { sentence: '___ the dishes', answer: 'do', options: ['make', 'do', 'take', 'have'], vi: 'rửa chén', group: 'DO' },
    { sentence: '___ a nap', answer: 'take', options: ['make', 'do', 'take', 'have'], vi: 'ngủ trưa', group: 'TAKE' },
    { sentence: '___ progress', answer: 'make', options: ['make', 'do', 'take', 'have'], vi: 'tiến bộ', group: 'MAKE' },
    { sentence: '___ a good time', answer: 'have', options: ['make', 'do', 'take', 'have'], vi: 'vui vẻ', group: 'HAVE' },
    { sentence: '___ your best', answer: 'do', options: ['make', 'do', 'take', 'get'], vi: 'cố gắng hết sức', group: 'DO' },
    { sentence: '___ a conversation', answer: 'have', options: ['make', 'do', 'take', 'have'], vi: 'trò chuyện', group: 'HAVE' },
    { sentence: '___ an appointment', answer: 'make', options: ['make', 'do', 'take', 'have'], vi: 'đặt lịch hẹn', group: 'MAKE' },
    { sentence: '___ exercise', answer: 'do', options: ['make', 'do', 'take', 'get'], vi: 'tập thể dục', group: 'DO' },
    { sentence: '___ advantage of', answer: 'take', options: ['make', 'do', 'take', 'have'], vi: 'lợi dụng', group: 'TAKE' },
    { sentence: '___ a complaint', answer: 'make', options: ['make', 'do', 'take', 'have'], vi: 'khiếu nại', group: 'MAKE' },
    { sentence: '___ a break', answer: 'take', options: ['make', 'do', 'take', 'have'], vi: 'nghỉ giải lao', group: 'TAKE' },
    { sentence: '___ a dream', answer: 'have', options: ['make', 'do', 'take', 'have'], vi: 'mơ', group: 'HAVE' },
    { sentence: '___ research', answer: 'do', options: ['make', 'do', 'take', 'get'], vi: 'nghiên cứu', group: 'DO' },
    { sentence: '___ a promise', answer: 'make', options: ['make', 'do', 'take', 'have'], vi: 'hứa', group: 'MAKE' },
];

const GROUP_COLORS = { MAKE: '#3B82F6', DO: '#22C55E', TAKE: '#F59E0B', HAVE: '#8B5CF6' };
function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
const TOTAL = 10;

export default function CollocationTrainer() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [exercises] = useState(() => shuffle(EXERCISES).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);

    const ex = exercises[idx];

    const handleSelect = (opt) => {
        setSelected(opt);
        if (opt === ex.answer) { setScore(s => s + 1); addXP(10); setCelebration(c => c + 1); }
    };

    const next = () => {
        if (idx + 1 >= TOTAL) setComplete(true);
        else { setIdx(i => i + 1); setSelected(null); }
    };

    if (complete) {
        const pct = Math.round((score / TOTAL) * 100);
        const groupStats = exercises.reduce((acc, ex, i) => {
            if (i < TOTAL) { acc[ex.group] = acc[ex.group] || { total: 0, correct: 0 }; acc[ex.group].total++; }
            return acc;
        }, {});
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🤝' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Collocation Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
                    {Object.entries(GROUP_COLORS).map(([g, c]) => (
                        <span key={g} style={{ padding: '4px 10px', borderRadius: 'var(--radius-full)', background: `${c}15`, color: c, fontWeight: 700, fontSize: '0.75rem' }}>{g}</span>
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🤝 Collocations</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            <div style={{ margin: '16px 0', padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.8 }}>
                    <span style={{ display: 'inline-block', minWidth: '80px', borderBottom: `3px solid ${GROUP_COLORS[ex.group]}`, color: selected ? (selected === ex.answer ? '#22C55E' : '#EF4444') : GROUP_COLORS[ex.group], fontWeight: 900, fontSize: '1.5rem' }}>
                        {selected || '___'}
                    </span>
                    {' '}{ex.sentence.replace('___ ', '')}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '6px' }}>🇻🇳 {ex.vi}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {ex.options.map((opt, i) => {
                    const isCorrect = opt === ex.answer;
                    const isSelected = selected === opt;
                    let bg = 'var(--color-card)', border = `2px solid ${GROUP_COLORS[opt.toUpperCase()] || 'var(--color-border)'}30`;
                    if (selected !== null) {
                        if (isCorrect) { bg = '#22C55E15'; border = '2px solid #22C55E'; }
                        else if (isSelected) { bg = '#EF444415'; border = '2px solid #EF4444'; }
                    }
                    return (
                        <button key={i} onClick={() => !selected && handleSelect(opt)} disabled={selected !== null}
                            style={{ padding: '16px', borderRadius: 'var(--radius-lg)', border, background: bg, cursor: selected ? 'default' : 'pointer', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-text)', textTransform: 'uppercase' }}>
                            {selected !== null && isCorrect && '✅ '}{selected !== null && isSelected && !isCorrect && '❌ '}{opt}
                        </button>
                    );
                })}
            </div>

            {selected !== null && (
                <div style={{ marginTop: '8px' }}>
                    <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: `${GROUP_COLORS[ex.group]}10`, fontSize: '0.8rem', color: GROUP_COLORS[ex.group], fontWeight: 700 }}>📐 Group: {ex.group} — {ex.answer} {ex.sentence.replace('___ ', '')}</div>
                    <button className="btn btn--primary btn--block" style={{ marginTop: '8px' }} onClick={next}>
                        {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Câu tiếp'}
                    </button>
                </div>
            )}
        </div>
    );
}

// PassiveVoiceTrainer — Transform active sentences to passive and vice versa
// Essential B1-B2 skill for academic and professional English
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const EXERCISES = [
    { active: 'The teacher explains the lessons.', passive: 'The lessons are explained by the teacher.', tense: 'Present Simple', vi: 'Giáo viên giải thích bài.', direction: 'active→passive' },
    { active: 'They are building a new hospital.', passive: 'A new hospital is being built.', tense: 'Present Progressive', vi: 'Họ đang xây bệnh viện mới.', direction: 'active→passive' },
    { active: 'Someone stole my bicycle yesterday.', passive: 'My bicycle was stolen yesterday.', tense: 'Past Simple', vi: 'Ai đó đã lấy cắp xe đạp tôi.', direction: 'active→passive' },
    { active: 'The company will launch a new product.', passive: 'A new product will be launched by the company.', tense: 'Future Simple', vi: 'Công ty sẽ ra mắt sản phẩm mới.', direction: 'active→passive' },
    { active: 'They have completed the project.', passive: 'The project has been completed.', tense: 'Present Perfect', vi: 'Họ đã hoàn thành dự án.', direction: 'active→passive' },
    { active: 'People speak English worldwide.', passive: 'English is spoken worldwide.', tense: 'Present Simple', vi: 'Mọi người nói tiếng Anh toàn cầu.', direction: 'active→passive' },
    { active: 'The chef cooked a delicious meal.', passive: 'A delicious meal was cooked by the chef.', tense: 'Past Simple', vi: 'Đầu bếp đã nấu bữa ngon.', direction: 'active→passive' },
    { active: 'We must finish the report today.', passive: 'The report must be finished today.', tense: 'Modal', vi: 'Chúng ta phải hoàn thành báo cáo hôm nay.', direction: 'active→passive' },
    { active: 'They had repaired the road before winter.', passive: 'The road had been repaired before winter.', tense: 'Past Perfect', vi: 'Họ đã sửa đường trước mùa đông.', direction: 'active→passive' },
    { active: 'The students can solve these problems.', passive: 'These problems can be solved by the students.', tense: 'Modal', vi: 'Học sinh có thể giải bài này.', direction: 'active→passive' },
];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
const TOTAL = 6;
const TENSE_COLORS = { 'Present Simple': '#3B82F6', 'Present Progressive': '#22C55E', 'Past Simple': '#F59E0B', 'Future Simple': '#8B5CF6', 'Present Perfect': '#EC4899', 'Past Perfect': '#0891B2', 'Modal': '#6366F1' };

export default function PassiveVoiceTrainer() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [exercises] = useState(() => shuffle(EXERCISES).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState('learn'); // learn | quiz
    const [input, setInput] = useState('');
    const [checked, setChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);

    const ex = exercises[idx];

    const normalize = (s) => s.trim().toLowerCase().replace(/[.!?]+$/, '');
    const handleCheck = () => {
        setChecked(true);
        if (normalize(input) === normalize(ex.passive)) { setScore(s => s + 1); addXP(15); setCelebration(c => c + 1); }
    };

    const next = () => {
        if (idx + 1 >= TOTAL) setComplete(true);
        else { setIdx(i => i + 1); setPhase('learn'); setInput(''); setChecked(false); }
    };

    if (complete) {
        const pct = Math.round((score / TOTAL) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🏆' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Passive Voice Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    const isCorrect = normalize(input) === normalize(ex.passive);

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🔄 Passive Voice</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            {phase === 'learn' ? (
                <div style={{ marginTop: '16px' }}>
                    <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: TENSE_COLORS[ex.tense] || '#6366F1', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: `${TENSE_COLORS[ex.tense] || '#6366F1'}15` }}>{ex.tense}</span>
                        <div style={{ marginTop: '8px' }}>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: 600 }}>🔵 Active:</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>{ex.active}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: 600 }}>🔴 Passive:</div>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>{ex.passive}</div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '6px' }}>🇻🇳 {ex.vi}</div>
                    </div>
                    <button className="btn btn--primary btn--block btn--large" style={{ marginTop: '12px' }} onClick={() => setPhase('quiz')}>🧠 Tự viết</button>
                </div>
            ) : (
                <div style={{ marginTop: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: TENSE_COLORS[ex.tense] || '#6366F1' }}>{ex.tense}</span>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginTop: '6px' }}>🔵 {ex.active}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '4px' }}>➡️ Viết dạng bị động (Passive):</div>
                    </div>

                    <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type the passive form..." disabled={checked}
                        onKeyDown={e => e.key === 'Enter' && input.trim() && !checked && handleCheck()}
                        style={{
                            width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)', fontSize: '0.95rem', fontWeight: 700,
                            border: `2px solid ${checked ? (isCorrect ? '#22C55E' : '#EF4444') : 'var(--color-border)'}`,
                            background: 'var(--color-card)', color: 'var(--color-text)', outline: 'none',
                        }} />

                    {!checked && <button className="btn btn--primary btn--block" style={{ marginTop: '8px' }} onClick={handleCheck} disabled={!input.trim()}>✅ Kiểm tra</button>}

                    {checked && (
                        <div style={{ marginTop: '8px', padding: '12px', borderRadius: 'var(--radius-lg)', background: `${isCorrect ? '#22C55E' : '#EF4444'}10`, border: `2px solid ${isCorrect ? '#22C55E' : '#EF4444'}` }}>
                            <div style={{ fontWeight: 700, color: isCorrect ? '#22C55E' : '#EF4444' }}>{isCorrect ? '✅ Hoàn hảo!' : '❌ Chưa đúng'}</div>
                            {!isCorrect && <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Đáp án: <strong style={{ color: '#22C55E' }}>{ex.passive}</strong></div>}
                            <button className="btn btn--primary btn--block" style={{ marginTop: '8px' }} onClick={next}>
                                {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Câu tiếp'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

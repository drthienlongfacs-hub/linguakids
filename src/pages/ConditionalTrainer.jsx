// ConditionalTrainer — Master if-clauses (Type 0/1/2/3 + Mixed)
// Essential B1-C1 grammar for expressing conditions and hypotheticals
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const EXERCISES = [
    { sentence: 'If you heat water to 100°C, it ___ (boil).', answer: 'boils', type: 'Type 0', vi: 'Nếu bạn đun nước 100°C, nó sôi.', rule: 'Type 0 (Fact): If + Present → Present. Sự thật hiển nhiên.' },
    { sentence: 'If it rains tomorrow, I ___ (stay) at home.', answer: 'will stay', type: 'Type 1', vi: 'Nếu mai mưa, tôi sẽ ở nhà.', rule: 'Type 1 (Real): If + Present → will + V. Có thể xảy ra.' },
    { sentence: 'If I were you, I ___ (accept) the offer.', answer: 'would accept', type: 'Type 2', vi: 'Nếu tôi là bạn, tôi sẽ chấp nhận.', rule: 'Type 2 (Unreal): If + Past → would + V. Giả định hiện tại.' },
    { sentence: 'If she had studied harder, she ___ (pass) the exam.', answer: 'would have passed', type: 'Type 3', vi: 'Nếu cô ấy học chăm hơn, cô ấy đã đỗ.', rule: 'Type 3 (Past Unreal): If + had V3 → would have V3. Giả định quá khứ.' },
    { sentence: 'If you ___ (not/water) plants, they die.', answer: "don't water", type: 'Type 0', vi: 'Nếu bạn không tưới cây, chúng chết.', rule: 'Type 0: If + Present → Present. Quy luật tự nhiên.' },
    { sentence: 'If I ___ (win) the lottery, I would travel the world.', answer: 'won', type: 'Type 2', vi: 'Nếu tôi trúng số, tôi sẽ đi du lịch.', rule: 'Type 2: If + V2/Ved → would + V. Ước muốn phi thực tế.' },
    { sentence: 'If you finish early, you ___ (can/leave).', answer: 'can leave', type: 'Type 1', vi: 'Nếu bạn xong sớm, bạn có thể về.', rule: 'Type 1: If + Present → can/may + V. Điều kiện có thể.' },
    { sentence: 'If they had arrived on time, they ___ (not/miss) the flight.', answer: "wouldn't have missed", type: 'Type 3', vi: 'Nếu họ đến đúng giờ, họ đã không lỡ.', rule: 'Type 3: If + had V3 → would(n\'t) have V3. Tiếc nuối.' },
    { sentence: 'If I ___ (be) taller, I would play basketball.', answer: 'were', type: 'Type 2', vi: 'Nếu tôi cao hơn, tôi sẽ chơi bóng rổ.', rule: 'Type 2: Dùng "were" cho MỌI ngôi (I/he/she were).' },
    { sentence: 'If she calls, ___ (tell) her I am busy.', answer: 'tell', type: 'Type 1', vi: 'Nếu cô ấy gọi, nói tôi bận.', rule: 'Type 1: If + Present → Imperative (mệnh lệnh).' },
    { sentence: 'If I had known about the party, I ___ (come).', answer: 'would have come', type: 'Type 3', vi: 'Nếu tôi biết về tiệc, tôi đã đến.', rule: 'Type 3: Hối tiếc về quá khứ.' },
    { sentence: 'If you mix blue and yellow, you ___ (get) green.', answer: 'get', type: 'Type 0', vi: 'Nếu trộn xanh dương và vàng, bạn được xanh lá.', rule: 'Type 0: Sự thật khoa học.' },
];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
const TOTAL = 8;
const TYPE_COLORS = { 'Type 0': '#94A3B8', 'Type 1': '#22C55E', 'Type 2': '#F59E0B', 'Type 3': '#EF4444' };

export default function ConditionalTrainer() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [exercises] = useState(() => shuffle(EXERCISES).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [input, setInput] = useState('');
    const [checked, setChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);

    const ex = exercises[idx];

    const normalize = (s) => s.trim().toLowerCase().replace(/['']/g, "'");
    const handleCheck = () => {
        setChecked(true);
        if (normalize(input) === normalize(ex.answer)) { setScore(s => s + 1); addXP(15); setCelebration(c => c + 1); }
    };

    const next = () => {
        if (idx + 1 >= TOTAL) setComplete(true);
        else { setIdx(i => i + 1); setInput(''); setChecked(false); }
    };

    if (complete) {
        const pct = Math.round((score / TOTAL) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🏆' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Conditional Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    const isCorrect = normalize(input) === normalize(ex.answer);

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🔀 Conditionals</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            <div style={{ margin: '16px 0', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: TYPE_COLORS[ex.type], padding: '2px 8px', borderRadius: 'var(--radius-full)', background: `${TYPE_COLORS[ex.type]}15`, border: `1px solid ${TYPE_COLORS[ex.type]}30` }}>{ex.type}</span>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, lineHeight: 1.8, marginTop: '8px' }}>{ex.sentence}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '4px' }}>🇻🇳 {ex.vi}</div>
            </div>

            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type the correct form..." disabled={checked}
                onKeyDown={e => e.key === 'Enter' && input.trim() && !checked && handleCheck()}
                style={{
                    width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)', fontSize: '1.1rem', fontWeight: 700,
                    border: `2px solid ${checked ? (isCorrect ? '#22C55E' : '#EF4444') : 'var(--color-border)'}`,
                    background: 'var(--color-card)', color: 'var(--color-text)', outline: 'none',
                    textAlign: 'center', fontFamily: 'var(--font-display)',
                }} />

            {!checked && <button className="btn btn--primary btn--block" style={{ marginTop: '8px' }} onClick={handleCheck} disabled={!input.trim()}>✅ Kiểm tra</button>}

            {checked && (
                <div style={{ marginTop: '8px', padding: '12px', borderRadius: 'var(--radius-lg)', background: `${isCorrect ? '#22C55E' : '#EF4444'}10`, border: `2px solid ${isCorrect ? '#22C55E' : '#EF4444'}` }}>
                    <div style={{ fontWeight: 700, color: isCorrect ? '#22C55E' : '#EF4444' }}>{isCorrect ? '✅ Chính xác!' : '❌ Chưa đúng'}</div>
                    {!isCorrect && <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>Đáp án: <strong style={{ color: '#22C55E' }}>{ex.answer}</strong></div>}
                    <div style={{ fontSize: '0.75rem', color: TYPE_COLORS[ex.type], marginTop: '6px', padding: '8px', borderRadius: 'var(--radius-md)', background: `${TYPE_COLORS[ex.type]}08` }}>📐 {ex.rule}</div>
                    <button className="btn btn--primary btn--block" style={{ marginTop: '8px' }} onClick={next}>
                        {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Câu tiếp'}
                    </button>
                </div>
            )}
        </div>
    );
}

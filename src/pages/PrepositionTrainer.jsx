// PrepositionTrainer — Master English prepositions (in/on/at/by/with/for/to)
// One of the hardest aspects for Vietnamese speakers learning English
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const EXERCISES = [
    { sentence: 'She arrived ___ the airport on time.', answer: 'at', options: ['at', 'in', 'on', 'to'], vi: 'Cô ấy tới sân bay đúng giờ.', rule: 'AT + điểm cụ thể (airport, station, door)' },
    { sentence: 'I was born ___ 1995.', answer: 'in', options: ['in', 'on', 'at', 'by'], vi: 'Tôi sinh năm 1995.', rule: 'IN + năm, tháng, mùa, thế kỷ' },
    { sentence: 'The meeting is ___ Monday.', answer: 'on', options: ['on', 'in', 'at', 'for'], vi: 'Cuộc họp vào thứ Hai.', rule: 'ON + ngày, thứ, ngày tháng' },
    { sentence: 'She is interested ___ learning Chinese.', answer: 'in', options: ['in', 'on', 'at', 'for'], vi: 'Cô ấy thích học tiếng Trung.', rule: 'interested IN something' },
    { sentence: 'He depends ___ his parents for money.', answer: 'on', options: ['on', 'in', 'at', 'by'], vi: 'Anh ấy phụ thuộc bố mẹ về tiền.', rule: 'depend ON someone' },
    { sentence: 'I am really good ___ cooking.', answer: 'at', options: ['at', 'in', 'on', 'for'], vi: 'Tôi giỏi nấu ăn.', rule: 'good AT doing something' },
    { sentence: 'She apologized ___ being late.', answer: 'for', options: ['for', 'to', 'at', 'about'], vi: 'Cô ấy xin lỗi vì đến muộn.', rule: 'apologize FOR something' },
    { sentence: 'The book was written ___ a famous author.', answer: 'by', options: ['by', 'with', 'from', 'for'], vi: 'Sách được viết bởi tác giả nổi tiếng.', rule: 'passive: BY + agent (người thực hiện)' },
    { sentence: 'I dream ___ traveling the world.', answer: 'of', options: ['of', 'about', 'for', 'in'], vi: 'Tôi mơ đi vòng quanh thế giới.', rule: 'dream OF doing something' },
    { sentence: 'They congratulated her ___ her success.', answer: 'on', options: ['on', 'for', 'at', 'in'], vi: 'Họ chúc mừng cô ấy thành công.', rule: 'congratulate ON achievement' },
    { sentence: 'He suffers ___ asthma.', answer: 'from', options: ['from', 'of', 'with', 'by'], vi: 'Anh ấy bị hen suyễn.', rule: 'suffer FROM illness' },
    { sentence: 'She was sitting ___ the bus stop.', answer: 'at', options: ['at', 'on', 'in', 'by'], vi: 'Cô ấy đang ngồi ở trạm xe buýt.', rule: 'AT + điểm chờ (bus stop, entrance)' },
    { sentence: 'I will be there ___ 5 minutes.', answer: 'in', options: ['in', 'at', 'on', 'for'], vi: 'Tôi sẽ tới sau 5 phút.', rule: 'IN + khoảng thời gian tương lai' },
    { sentence: 'He is responsible ___ the project.', answer: 'for', options: ['for', 'of', 'to', 'with'], vi: 'Anh ấy chịu trách nhiệm dự án.', rule: 'responsible FOR something' },
    { sentence: 'She insisted ___ paying the bill.', answer: 'on', options: ['on', 'in', 'at', 'for'], vi: 'Cô ấy kiên quyết trả hóa đơn.', rule: 'insist ON doing something' },
    { sentence: 'The show starts ___ 8 PM.', answer: 'at', options: ['at', 'in', 'on', 'by'], vi: 'Buổi diễn bắt đầu lúc 8h tối.', rule: 'AT + giờ cụ thể' },
    { sentence: 'I look forward ___ hearing from you.', answer: 'to', options: ['to', 'for', 'at', 'on'], vi: 'Tôi mong nhận được tin bạn.', rule: 'look forward TO + Ving' },
    { sentence: 'She is married ___ a doctor.', answer: 'to', options: ['to', 'with', 'by', 'for'], vi: 'Cô ấy lấy bác sĩ.', rule: 'married TO someone' },
    { sentence: 'The city was famous ___ its cuisine.', answer: 'for', options: ['for', 'of', 'in', 'by'], vi: 'Thành phố nổi tiếng về ẩm thực.', rule: 'famous FOR something' },
    { sentence: 'He agreed ___ the proposal.', answer: 'to', options: ['to', 'with', 'on', 'for'], vi: 'Anh ấy đồng ý đề xuất.', rule: 'agree TO proposal/plan' },
];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
const TOTAL = 8;

export default function PrepositionTrainer() {
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
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '📍' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Preposition Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    const parts = ex.sentence.split('___');

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">📍 Prepositions</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            <div style={{ margin: '16px 0', padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.8 }}>
                    {parts[0]}
                    <span style={{ display: 'inline-block', minWidth: '50px', borderBottom: '3px solid var(--color-primary)', color: selected ? (selected === ex.answer ? '#22C55E' : '#EF4444') : 'var(--color-primary)', fontWeight: 800, fontSize: '1.2rem' }}>
                        {selected || '___'}
                    </span>
                    {parts[1]}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '6px' }}>🇻🇳 {ex.vi}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {ex.options.map((opt, i) => {
                    const isCorrect = opt === ex.answer;
                    const isSelected = selected === opt;
                    let bg = 'var(--color-card)', border = '2px solid var(--color-border)';
                    if (selected !== null) {
                        if (isCorrect) { bg = '#22C55E15'; border = '2px solid #22C55E'; }
                        else if (isSelected) { bg = '#EF444415'; border = '2px solid #EF4444'; }
                    }
                    return (
                        <button key={i} onClick={() => !selected && handleSelect(opt)} disabled={selected !== null}
                            style={{ padding: '14px', borderRadius: 'var(--radius-lg)', border, background: bg, cursor: selected ? 'default' : 'pointer', fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>
                            {selected !== null && isCorrect && '✅ '}{selected !== null && isSelected && !isCorrect && '❌ '}{opt}
                        </button>
                    );
                })}
            </div>

            {selected !== null && (
                <div style={{ marginTop: '8px' }}>
                    <div style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', fontSize: '0.8rem', color: 'var(--color-primary)' }}>📐 {ex.rule}</div>
                    <button className="btn btn--primary btn--block" style={{ marginTop: '8px' }} onClick={next}>
                        {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Câu tiếp'}
                    </button>
                </div>
            )}
        </div>
    );
}

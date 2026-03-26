// ArticleTrainer — Master a/an/the/∅ (zero article) usage
// Vietnamese has NO articles — this is one of the hardest concepts for VN learners
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const EXERCISES = [
    { sentence: 'I need ___ umbrella because it is raining.', answer: 'an', options: ['a', 'an', 'the', '—'], vi: 'Tôi cần cây dù vì trời đang mưa.', rule: 'AN + nguyên âm (umbrella bắt đầu bằng U)' },
    { sentence: '___ sun rises in the east.', answer: 'The', options: ['A', 'An', 'The', '—'], vi: 'Mặt trời mọc ở phía Đông.', rule: 'THE + vật duy nhất (sun, moon, earth)' },
    { sentence: 'She is ___ honest person.', answer: 'an', options: ['a', 'an', 'the', '—'], vi: 'Cô ấy là người trung thực.', rule: 'AN + "H" câm (honest = /ˈɒnɪst/)' },
    { sentence: 'I love ___ music.', answer: '—', options: ['a', 'an', 'the', '—'], vi: 'Tôi yêu âm nhạc.', rule: 'Không mạo từ + khái niệm chung (music, love, art)' },
    { sentence: 'He bought ___ new car yesterday.', answer: 'a', options: ['a', 'an', 'the', '—'], vi: 'Anh ấy mua xe mới hôm qua.', rule: 'A + danh từ đếm được, lần đầu nhắc đến' },
    { sentence: '___ car he bought is very fast.', answer: 'The', options: ['A', 'An', 'The', '—'], vi: 'Chiếc xe anh mua rất nhanh.', rule: 'THE + đã biết/đã nhắc đến trước đó' },
    { sentence: 'She plays ___ piano beautifully.', answer: 'the', options: ['a', 'an', 'the', '—'], vi: 'Cô ấy chơi piano hay.', rule: 'THE + nhạc cụ (play the piano/guitar/violin)' },
    { sentence: 'I go to ___ school every day.', answer: '—', options: ['a', 'an', 'the', '—'], vi: 'Tôi đi học mỗi ngày.', rule: 'Không mạo từ + go to school (mục đích)' },
    { sentence: '___ water in this bottle is cold.', answer: 'The', options: ['A', 'An', 'The', '—'], vi: 'Nước trong chai này lạnh.', rule: 'THE + xác định cụ thể (water IN this bottle)' },
    { sentence: 'He wants to become ___ engineer.', answer: 'an', options: ['a', 'an', 'the', '—'], vi: 'Anh ấy muốn trở thành kỹ sư.', rule: 'AN + nghề nghiệp bắt đầu nguyên âm' },
    { sentence: '___ life is beautiful.', answer: '—', options: ['A', 'An', 'The', '—'], vi: 'Cuộc sống thật đẹp.', rule: 'Không mạo từ + khái niệm trừu tượng chung' },
    { sentence: 'I saw ___ interesting movie last night.', answer: 'an', options: ['a', 'an', 'the', '—'], vi: 'Tôi xem phim hay tối qua.', rule: 'AN + adj bắt đầu nguyên âm (interesting)' },
    { sentence: 'Can you pass me ___ salt?', answer: 'the', options: ['a', 'an', 'the', '—'], vi: 'Đưa tôi muối được không?', rule: 'THE + cả hai biết vật đang nói đến' },
    { sentence: 'She is ___ doctor at the local hospital.', answer: 'a', options: ['a', 'an', 'the', '—'], vi: 'Cô ấy là bác sĩ ở bệnh viện.', rule: 'A + nghề nghiệp bắt đầu phụ âm' },
    { sentence: 'They went to ___ Paris for vacation.', answer: '—', options: ['a', 'an', 'the', '—'], vi: 'Họ đi Paris nghỉ mát.', rule: 'Không mạo từ + tên thành phố, quốc gia' },
];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
const TOTAL = 8;

export default function ArticleTrainer() {
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
        const correct = opt.toLowerCase() === ex.answer.toLowerCase();
        if (correct) { setScore(s => s + 1); addXP(10); setCelebration(c => c + 1); }
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
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🏆' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Article Master</h2>
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
                <h2 className="page-header__title">📌 Articles a/an/the</h2>
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
                    <span style={{ display: 'inline-block', minWidth: '40px', borderBottom: '3px solid var(--color-primary)', color: selected ? (selected.toLowerCase() === ex.answer.toLowerCase() ? '#22C55E' : '#EF4444') : 'var(--color-primary)', fontWeight: 800, fontSize: '1.2rem' }}>
                        {selected || '___'}
                    </span>
                    {parts[1]}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '6px' }}>🇻🇳 {ex.vi}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {ex.options.map((opt, i) => {
                    const isCorrect = opt.toLowerCase() === ex.answer.toLowerCase();
                    const isSelected = selected === opt;
                    let bg = 'var(--color-card)', border = '2px solid var(--color-border)';
                    if (selected !== null) {
                        if (isCorrect) { bg = '#22C55E15'; border = '2px solid #22C55E'; }
                        else if (isSelected) { bg = '#EF444415'; border = '2px solid #EF4444'; }
                    }
                    return (
                        <button key={i} onClick={() => !selected && handleSelect(opt)} disabled={selected !== null}
                            style={{ padding: '14px', borderRadius: 'var(--radius-lg)', border, background: bg, cursor: selected ? 'default' : 'pointer', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-text)' }}>
                            {selected !== null && isCorrect && '✅ '}{selected !== null && isSelected && !isCorrect && '❌ '}{opt === '—' ? '∅ (none)' : opt}
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

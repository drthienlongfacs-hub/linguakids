// VocabInContext — Learn words through real sentences and fill-in-the-blank
// Simulates immersive contextual learning (like a native teacher's approach)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const EXERCISES = [
    { sentence: 'The weather today is absolutely ___.', blank: 'gorgeous', options: ['gorgeous', 'terrible', 'boring', 'fast'], vi: 'Thời tiết hôm nay thật ___.', viAnswer: 'tuyệt đẹp', context: 'Use positive adjective for great weather' },
    { sentence: 'She ___ her coffee while reading the morning news.', blank: 'sipped', options: ['sipped', 'threw', 'kicked', 'drove'], vi: 'Cô ấy ___ cà phê trong khi đọc tin sáng.', viAnswer: 'nhấp', context: 'Gentle drinking action' },
    { sentence: 'The project deadline has been ___ to next Friday.', blank: 'extended', options: ['shortened', 'extended', 'cancelled', 'forgotten'], vi: 'Hạn chót dự án đã được ___ đến thứ Sáu tới.', viAnswer: 'gia hạn', context: 'Made longer in time' },
    { sentence: 'I ___ apologize for the inconvenience caused.', blank: 'sincerely', options: ['barely', 'sincerely', 'never', 'hardly'], vi: 'Tôi ___ xin lỗi vì sự bất tiện.', viAnswer: 'thành thật', context: 'Formal apology adverb' },
    { sentence: 'The doctor recommended that I ___ more water daily.', blank: 'drink', options: ['drink', 'ate', 'slept', 'drove'], vi: 'Bác sĩ khuyên tôi nên ___ nhiều nước hơn mỗi ngày.', viAnswer: 'uống', context: 'Recommend + bare infinitive' },
    { sentence: 'Despite the challenges, the team remained ___ throughout.', blank: 'optimistic', options: ['pessimistic', 'optimistic', 'angry', 'confused'], vi: 'Dù có khó khăn, đội vẫn ___ xuyên suốt.', viAnswer: 'lạc quan', context: 'Positive attitude word' },
    { sentence: 'The restaurant offers a wide ___ of vegetarian dishes.', blank: 'variety', options: ['number', 'variety', 'piece', 'couple'], vi: 'Nhà hàng cung cấp đa ___ các món chay.', viAnswer: 'dạng', context: 'Selection/range noun' },
    { sentence: 'He managed to ___ enough money to buy a new car.', blank: 'save', options: ['waste', 'save', 'lose', 'spend'], vi: 'Anh ấy đã ___ đủ tiền để mua xe mới.', viAnswer: 'tiết kiệm', context: 'Keep money for future use' },
    { sentence: 'The new policy will ___ into effect next month.', blank: 'come', options: ['go', 'come', 'run', 'walk'], vi: 'Chính sách mới sẽ ___ hiệu lực tháng tới.', viAnswer: 'có', context: 'Phrasal: come into effect' },
    { sentence: 'Learning a language requires ___ and dedication.', blank: 'patience', options: ['speed', 'patience', 'luck', 'money'], vi: 'Học ngôn ngữ cần ___ và cống hiến.', viAnswer: 'kiên nhẫn', context: 'Quality needed for long-term goals' },
    { sentence: 'The sunset over the ocean was truly ___.', blank: 'breathtaking', options: ['boring', 'breathtaking', 'ordinary', 'simple'], vi: 'Hoàng hôn trên biển thật ___.', viAnswer: 'ngoạn mục', context: 'Extremely beautiful' },
    { sentence: 'She ___ a compromise that satisfied both parties.', blank: 'proposed', options: ['rejected', 'proposed', 'ignored', 'forgot'], vi: 'Cô ấy ___ một thỏa hiệp làm hài lòng cả hai bên.', viAnswer: 'đề xuất', context: 'Formally suggest a plan' },
];

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
const TOTAL = 8;

export default function VocabInContext() {
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
        if (opt === ex.blank) { setScore(s => s + 1); addXP(10); setCelebration(c => c + 1); }
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
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Context Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    // Highlight blank in sentence
    const parts = ex.sentence.split('___');

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">📝 Vocab in Context</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            <div style={{ margin: '20px 0', padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.8 }}>
                    {parts[0]}
                    <span style={{ display: 'inline-block', minWidth: '100px', borderBottom: '3px solid var(--color-primary)', color: selected ? (selected === ex.blank ? '#22C55E' : '#EF4444') : 'var(--color-primary)', fontWeight: 800 }}>
                        {selected || '___'}
                    </span>
                    {parts[1]}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '8px' }}>{ex.vi.replace('___', selected ? (selected === ex.blank ? ex.viAnswer : '❌') : '___')}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', marginTop: '4px', fontStyle: 'italic' }}>💡 {ex.context}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {ex.options.map((opt, i) => {
                    const isCorrect = opt === ex.blank;
                    const isSelected = selected === opt;
                    let bg = 'var(--color-card)', border = '2px solid var(--color-border)';
                    if (selected !== null) {
                        if (isCorrect) { bg = '#22C55E15'; border = '2px solid #22C55E'; }
                        else if (isSelected) { bg = '#EF444415'; border = '2px solid #EF4444'; }
                    }
                    return (
                        <button key={i} onClick={() => !selected && handleSelect(opt)} disabled={selected !== null}
                            style={{ padding: '14px', borderRadius: 'var(--radius-lg)', border, background: bg, cursor: selected ? 'default' : 'pointer', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                            {selected !== null && isCorrect && '✅ '}{selected !== null && isSelected && !isCorrect && '❌ '}{opt}
                        </button>
                    );
                })}
            </div>

            {selected !== null && (
                <button className="btn btn--primary btn--block" style={{ marginTop: '12px' }} onClick={next}>
                    {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Câu tiếp'}
                </button>
            )}
        </div>
    );
}

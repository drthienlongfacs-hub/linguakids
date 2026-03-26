// PhrasalVerbTrainer — Master common phrasal verbs through context quizzes
// Phrasal verbs are KEY to sounding natural in English conversation
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const PHRASAL_VERBS = [
    { verb: 'look up', meaning: 'search for information', vi: 'tra cứu', emoji: '🔍', example: 'I will look up the word in the dictionary.', exampleVi: 'Tôi sẽ tra từ trong từ điển.' },
    { verb: 'give up', meaning: 'stop trying', vi: 'bỏ cuộc', emoji: '🏳️', example: "Never give up on your dreams!", exampleVi: 'Đừng bao giờ bỏ cuộc với ước mơ!' },
    { verb: 'turn down', meaning: 'refuse / reject', vi: 'từ chối', emoji: '👎', example: 'She turned down the job offer.', exampleVi: 'Cô ấy từ chối lời mời việc.' },
    { verb: 'come up with', meaning: 'think of an idea', vi: 'nghĩ ra', emoji: '💡', example: 'He came up with a great plan.', exampleVi: 'Anh ấy nghĩ ra kế hoạch tuyệt vời.' },
    { verb: 'put off', meaning: 'postpone / delay', vi: 'hoãn lại', emoji: '⏰', example: "Don't put off your homework.", exampleVi: 'Đừng hoãn bài tập.' },
    { verb: 'figure out', meaning: 'understand / solve', vi: 'tìm ra / hiểu', emoji: '🧩', example: 'I finally figured out the answer.', exampleVi: 'Cuối cùng tôi tìm ra đáp án.' },
    { verb: 'run into', meaning: 'meet unexpectedly', vi: 'tình cờ gặp', emoji: '🤝', example: 'I ran into my old teacher at the mall.', exampleVi: 'Tôi tình cờ gặp thầy cũ ở trung tâm.' },
    { verb: 'bring up', meaning: 'mention a topic', vi: 'đề cập', emoji: '🗣️', example: "She brought up the issue at the meeting.", exampleVi: 'Cô ấy đề cập vấn đề trong cuộc họp.' },
    { verb: 'break down', meaning: 'stop functioning / collapse', vi: 'hỏng / sụp đổ', emoji: '🔧', example: 'My car broke down on the highway.', exampleVi: 'Xe tôi hỏng trên cao tốc.' },
    { verb: 'get along', meaning: 'have a good relationship', vi: 'hòa hợp', emoji: '🤗', example: 'Do you get along with your colleagues?', exampleVi: 'Bạn có hòa hợp với đồng nghiệp không?' },
    { verb: 'set up', meaning: 'arrange / establish', vi: 'thiết lập', emoji: '⚙️', example: 'We need to set up a meeting.', exampleVi: 'Chúng ta cần thiết lập cuộc họp.' },
    { verb: 'take off', meaning: 'leave the ground / remove', vi: 'cất cánh / cởi bỏ', emoji: '✈️', example: 'The plane took off on time.', exampleVi: 'Máy bay cất cánh đúng giờ.' },
    { verb: 'look forward to', meaning: 'anticipate eagerly', vi: 'mong chờ', emoji: '🤩', example: 'I look forward to seeing you.', exampleVi: 'Tôi mong được gặp bạn.' },
    { verb: 'keep up with', meaning: 'stay at the same level', vi: 'theo kịp', emoji: '🏃', example: 'It is hard to keep up with technology.', exampleVi: 'Khó theo kịp công nghệ.' },
    { verb: 'point out', meaning: 'indicate / mention', vi: 'chỉ ra', emoji: '👉', example: 'She pointed out several errors.', exampleVi: 'Cô ấy chỉ ra vài lỗi.' },
    { verb: 'work out', meaning: 'exercise / solve', vi: 'tập thể dục / giải quyết', emoji: '💪', example: 'I work out three times a week.', exampleVi: 'Tôi tập 3 lần/tuần.' },
    { verb: 'drop off', meaning: 'deliver / decrease', vi: 'thả / giảm', emoji: '📦', example: 'Can you drop off the package?', exampleVi: 'Bạn giao gói hàng được không?' },
    { verb: 'pick up', meaning: 'collect / learn casually', vi: 'đón / học lỏm', emoji: '🚗', example: 'I will pick you up at the station.', exampleVi: 'Tôi sẽ đón bạn ở ga.' },
    { verb: 'carry on', meaning: 'continue', vi: 'tiếp tục', emoji: '▶️', example: 'Please carry on with your work.', exampleVi: 'Vui lòng tiếp tục công việc.' },
    { verb: 'hold on', meaning: 'wait', vi: 'chờ đã', emoji: '✋', example: 'Hold on, I will be right back.', exampleVi: 'Chờ đã, tôi quay lại ngay.' },
];

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
const TOTAL = 8;

export default function PhrasalVerbTrainer() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [items] = useState(() => shuffle(PHRASAL_VERBS).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState('learn');
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);
    const [options, setOptions] = useState([]);

    const current = items[idx];

    const startQuiz = () => {
        const wrong = shuffle(PHRASAL_VERBS.filter(p => p.verb !== current.verb)).slice(0, 3).map(p => p.meaning);
        setOptions(shuffle([current.meaning, ...wrong]));
        setPhase('quiz'); setSelected(null);
    };

    const handleAnswer = (opt) => {
        setSelected(opt);
        if (opt === current.meaning) { setScore(s => s + 1); addXP(10); setCelebration(c => c + 1); }
    };

    const next = () => {
        if (idx + 1 >= TOTAL) setComplete(true);
        else { setIdx(i => i + 1); setPhase('learn'); setSelected(null); }
    };

    if (complete) {
        const pct = Math.round((score / TOTAL) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🏆' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Phrasal Verb Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
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
                <h2 className="page-header__title">🔗 Phrasal Verbs</h2>
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
                    <div style={{ textAlign: 'center', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>{current.emoji}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)' }}>"{current.verb}"</div>
                        <div style={{ fontSize: '0.9rem', marginTop: '8px', fontWeight: 600 }}>🇺🇸 {current.meaning}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '3px' }}>🇻🇳 {current.vi}</div>
                    </div>
                    <div style={{ marginTop: '10px', padding: '12px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', borderLeft: '3px solid var(--color-primary)' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '3px' }}>📝 Ví dụ:</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>"{current.example}"</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{current.exampleVi}</div>
                    </div>
                    <button className="btn btn--primary btn--block btn--large" style={{ marginTop: '14px' }} onClick={startQuiz}>🧠 Kiểm tra</button>
                </div>
            ) : (
                <div style={{ marginTop: '16px' }}>
                    <div style={{ textAlign: 'center', padding: '14px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', marginBottom: '10px' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{current.emoji}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>"{current.verb}" nghĩa là gì?</div>
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {options.map((opt, i) => {
                            const isCorrect = opt === current.meaning;
                            const isSelected = selected === opt;
                            let bg = 'var(--color-card)', border = '2px solid var(--color-border)';
                            if (selected !== null) {
                                if (isCorrect) { bg = '#22C55E15'; border = '2px solid #22C55E'; }
                                else if (isSelected) { bg = '#EF444415'; border = '2px solid #EF4444'; }
                            }
                            return (
                                <button key={i} onClick={() => !selected && handleAnswer(opt)} disabled={selected !== null}
                                    style={{ padding: '14px', borderRadius: 'var(--radius-lg)', border, background: bg, cursor: selected ? 'default' : 'pointer', textAlign: 'left', fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>
                                    {selected !== null && isCorrect && '✅ '}{selected !== null && isSelected && !isCorrect && '❌ '}{opt}
                                </button>
                            );
                        })}
                    </div>
                    {selected !== null && (
                        <button className="btn btn--primary btn--block" style={{ marginTop: '12px' }} onClick={next}>
                            {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Phrasal verb tiếp'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

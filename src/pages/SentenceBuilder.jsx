// SentenceBuilder — Arrange scrambled words into correct English sentences
// Trains word order intuition — critical for non-native speakers
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const SENTENCES = [
    { correct: 'I have been studying English for three years', vi: 'Tôi đã học tiếng Anh được ba năm', level: 'B1' },
    { correct: 'She is the most beautiful person I have ever met', vi: 'Cô ấy là người đẹp nhất tôi từng gặp', level: 'B1' },
    { correct: 'Could you please tell me where the station is', vi: 'Bạn có thể cho tôi biết ga tàu ở đâu không', level: 'B1' },
    { correct: 'If I had more time I would learn Chinese', vi: 'Nếu tôi có nhiều thời gian hơn tôi sẽ học tiếng Trung', level: 'B2' },
    { correct: 'The meeting has been postponed until next week', vi: 'Cuộc họp đã được hoãn đến tuần tới', level: 'B1' },
    { correct: 'He suggested that we should start the project immediately', vi: 'Anh ấy đề nghị chúng tôi nên bắt đầu dự án ngay', level: 'B2' },
    { correct: 'Despite the rain they continued playing football', vi: 'Dù trời mưa họ vẫn tiếp tục chơi bóng', level: 'B1' },
    { correct: 'This is the first time I have visited Japan', vi: 'Đây là lần đầu tiên tôi đến Nhật', level: 'B1' },
    { correct: 'Learning a new language requires patience and dedication', vi: 'Học ngôn ngữ mới cần kiên nhẫn và cống hiến', level: 'B1' },
    { correct: 'The doctor recommended that she should exercise more', vi: 'Bác sĩ khuyên cô ấy nên tập thể dục nhiều hơn', level: 'B1' },
    { correct: 'Not only is he intelligent but he is also hardworking', vi: 'Anh ấy không chỉ thông minh mà còn chăm chỉ', level: 'B2' },
    { correct: 'By the time we arrived the movie had already started', vi: 'Lúc chúng tôi tới phim đã bắt đầu rồi', level: 'B2' },
];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
const TOTAL = 6;

export default function SentenceBuilder() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [sentences] = useState(() => shuffle(SENTENCES).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [pool, setPool] = useState(() => shuffle(SENTENCES[0].correct.split(' ')));
    const [built, setBuilt] = useState([]);
    const [checked, setChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);

    const s = sentences[idx];

    const initSentence = (i) => {
        setIdx(i); setPool(shuffle(sentences[i].correct.split(' '))); setBuilt([]); setChecked(false);
    };

    const addWord = (word, wIdx) => {
        setBuilt(b => [...b, word]);
        setPool(p => p.filter((_, i) => i !== wIdx));
    };

    const removeWord = (word, bIdx) => {
        setPool(p => [...p, word]);
        setBuilt(b => b.filter((_, i) => i !== bIdx));
    };

    const handleCheck = () => {
        setChecked(true);
        if (built.join(' ') === s.correct) { setScore(sc => sc + 1); addXP(15); setCelebration(c => c + 1); }
    };

    const next = () => {
        if (idx + 1 >= TOTAL) setComplete(true);
        else initSentence(idx + 1);
    };

    if (complete) {
        const pct = Math.round((score / TOTAL) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🏗️' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Sentence Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    const isCorrect = built.join(' ') === s.correct;

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🏗️ Sentence Builder</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            <div style={{ margin: '12px 0', padding: '12px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', fontSize: '0.85rem' }}>
                <span style={{ color: 'var(--color-text-light)' }}>🇻🇳 </span>{s.vi}
                <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', marginLeft: '6px' }}>({s.level})</span>
            </div>

            {/* Built sentence area */}
            <div style={{ minHeight: '60px', padding: '12px', borderRadius: 'var(--radius-lg)', background: checked ? (isCorrect ? '#22C55E10' : '#EF444410') : 'var(--color-card)', border: `2px dashed ${checked ? (isCorrect ? '#22C55E' : '#EF4444') : 'var(--color-border)'}`, display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                {built.length === 0 && <span style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>👆 Chạm từ bên dưới để xếp câu...</span>}
                {built.map((word, i) => (
                    <button key={`b-${i}`} onClick={() => !checked && removeWord(word, i)} disabled={checked}
                        style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-primary)', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: checked ? 'default' : 'pointer' }}>{word}</button>
                ))}
            </div>

            {/* Word pool */}
            {!checked && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                    {pool.map((word, i) => (
                        <button key={`p-${i}`} onClick={() => addWord(word, i)}
                            style={{ padding: '8px 14px', borderRadius: 'var(--radius-md)', background: 'var(--color-card)', border: '2px solid var(--color-border)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', color: 'var(--color-text)' }}>{word}</button>
                    ))}
                </div>
            )}

            {!checked && pool.length === 0 && (
                <button className="btn btn--primary btn--block btn--large" style={{ marginTop: '10px' }} onClick={handleCheck}>✅ Kiểm tra</button>
            )}

            {checked && (
                <div style={{ marginTop: '8px', padding: '12px', borderRadius: 'var(--radius-lg)', background: `${isCorrect ? '#22C55E' : '#EF4444'}10`, border: `2px solid ${isCorrect ? '#22C55E' : '#EF4444'}` }}>
                    <div style={{ fontWeight: 700, color: isCorrect ? '#22C55E' : '#EF4444' }}>{isCorrect ? '✅ Hoàn hảo!' : '❌ Thứ tự sai'}</div>
                    {!isCorrect && <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Đúng: <strong style={{ color: '#22C55E' }}>{s.correct}</strong></div>}
                    <button className="btn btn--primary btn--block" style={{ marginTop: '8px' }} onClick={next}>
                        {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Câu tiếp'}
                    </button>
                </div>
            )}
        </div>
    );
}

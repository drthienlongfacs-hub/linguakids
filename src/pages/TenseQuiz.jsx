// TenseQuiz — Master all 12 English tenses through contextual exercises
// Present/Past/Future × Simple/Progressive/Perfect/PerfectProgressive
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const EXERCISES = [
    { sentence: 'She ___ (go) to the gym every morning.', answer: 'goes', tense: 'Present Simple', vi: 'Cô ấy đi gym mỗi sáng.', rule: 'Thói quen → Present Simple (S + V/Vs)' },
    { sentence: 'They ___ (play) football right now.', answer: 'are playing', tense: 'Present Progressive', vi: 'Họ đang chơi bóng bây giờ.', rule: 'Đang xảy ra → Present Progressive (am/is/are + Ving)' },
    { sentence: 'I ___ (finish) my homework already.', answer: 'have finished', tense: 'Present Perfect', vi: 'Tôi đã hoàn thành bài tập rồi.', rule: 'Hoàn thành → Present Perfect (have/has + V3)' },
    { sentence: 'We ___ (wait) for two hours.', answer: 'have been waiting', tense: 'Present Perfect Progressive', vi: 'Chúng tôi đã đợi 2 tiếng.', rule: 'Kéo dài đến giờ → Present Perfect Progressive (have been + Ving)' },
    { sentence: 'He ___ (visit) Paris last summer.', answer: 'visited', tense: 'Past Simple', vi: 'Anh ấy đã thăm Paris hè trước.', rule: 'Quá khứ xong → Past Simple (S + V2/Ved)' },
    { sentence: 'I ___ (study) when you called me.', answer: 'was studying', tense: 'Past Progressive', vi: 'Tôi đang học khi bạn gọi.', rule: 'Đang xảy ra trong QK → Past Progressive (was/were + Ving)' },
    { sentence: 'By the time she arrived, we ___ (leave) already.', answer: 'had left', tense: 'Past Perfect', vi: 'Lúc cô ấy tới, chúng tôi đã đi rồi.', rule: 'Trước 1 mốc QK → Past Perfect (had + V3)' },
    { sentence: 'They ___ (work) for 5 hours before the power went out.', answer: 'had been working', tense: 'Past Perfect Progressive', vi: 'Họ đã làm 5 tiếng trước khi mất điện.', rule: 'Kéo dài trước mốc QK → Past Perfect Progressive (had been + Ving)' },
    { sentence: 'We ___ (travel) to Japan next month.', answer: 'will travel', tense: 'Future Simple', vi: 'Chúng tôi sẽ đi Nhật tháng tới.', rule: 'Tương lai → Future Simple (will + V)' },
    { sentence: 'At 8 PM tonight, I ___ (watch) the new movie.', answer: 'will be watching', tense: 'Future Progressive', vi: 'Lúc 8h tối, tôi sẽ đang xem phim mới.', rule: 'Đang xảy ra ở TL → Future Progressive (will be + Ving)' },
    { sentence: 'By next year, she ___ (complete) her degree.', answer: 'will have completed', tense: 'Future Perfect', vi: 'Đến năm tới, cô ấy sẽ hoàn thành bằng.', rule: 'Hoàn thành trước mốc TL → Future Perfect (will have + V3)' },
    { sentence: 'By 2030, I ___ (live) in this city for ten years.', answer: 'will have been living', tense: 'Future Perfect Progressive', vi: 'Đến 2030, tôi sẽ sống ở TP 10 năm.', rule: 'Kéo dài đến mốc TL → Future Perfect Progressive (will have been + Ving)' },
];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
const TOTAL = 8;

export default function TenseQuiz() {
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

    const handleCheck = () => {
        setChecked(true);
        if (input.trim().toLowerCase() === ex.answer.toLowerCase()) {
            setScore(s => s + 1); addXP(15); setCelebration(c => c + 1);
        }
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
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '⏱️' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Tense Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    const isCorrect = input.trim().toLowerCase() === ex.answer.toLowerCase();

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">⏱️ Tense Quiz</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            <div style={{ margin: '16px 0', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary-light)' }}>{ex.tense}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, lineHeight: 1.8 }}>{ex.sentence}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '4px' }}>🇻🇳 {ex.vi}</div>
            </div>

            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type the correct verb form..." disabled={checked}
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
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '6px', padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)' }}>📐 {ex.rule}</div>
                    <button className="btn btn--primary btn--block" style={{ marginTop: '8px' }} onClick={next}>
                        {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Câu tiếp'}
                    </button>
                </div>
            )}
        </div>
    );
}

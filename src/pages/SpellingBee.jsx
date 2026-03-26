// SpellingBee — Listen to a word and type the spelling correctly
// Uses SpeechSynthesis for audio, checks exact spelling
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const WORDS = [
    { word: 'necessary', level: 'B1', vi: 'cần thiết', tip: 'one C, two Ss' },
    { word: 'beautiful', level: 'A2', vi: 'đẹp', tip: 'beau-ti-ful' },
    { word: 'environment', level: 'B1', vi: 'môi trường', tip: 'en-vi-ron-ment' },
    { word: 'government', level: 'B1', vi: 'chính phủ', tip: 'govern-ment (no "n" before m)' },
    { word: 'restaurant', level: 'A2', vi: 'nhà hàng', tip: 'rest-au-rant' },
    { word: 'temperature', level: 'B1', vi: 'nhiệt độ', tip: 'tem-per-a-ture' },
    { word: 'immediately', level: 'B1', vi: 'ngay lập tức', tip: 'im-me-di-ate-ly' },
    { word: 'accommodation', level: 'B2', vi: 'chỗ ở', tip: 'two Cs, two Ms' },
    { word: 'occasionally', level: 'B2', vi: 'thỉnh thoảng', tip: 'two Cs, one S, double L-Y' },
    { word: 'definitely', level: 'B1', vi: 'chắc chắn', tip: 'de-fi-nite-ly (NOT definately)' },
    { word: 'separate', level: 'B1', vi: 'tách biệt', tip: 'sep-a-rate (NOT sep-e-rate)' },
    { word: 'experience', level: 'B1', vi: 'kinh nghiệm', tip: 'ex-pe-ri-ence' },
    { word: 'professional', level: 'B1', vi: 'chuyên nghiệp', tip: 'pro-fes-sion-al (one F, two Ss)' },
    { word: 'recommendation', level: 'B2', vi: 'đề xuất', tip: 're-com-men-da-tion' },
    { word: 'communication', level: 'B1', vi: 'giao tiếp', tip: 'com-mu-ni-ca-tion' },
    { word: 'unfortunately', level: 'B1', vi: 'đáng tiếc', tip: 'un-for-tu-nate-ly' },
    { word: 'development', level: 'B1', vi: 'phát triển', tip: 'de-vel-op-ment' },
    { word: 'achievement', level: 'B1', vi: 'thành tựu', tip: 'a-chieve-ment (ie not ei)' },
    { word: 'independent', level: 'B1', vi: 'độc lập', tip: 'in-de-pen-dent (NOT -dant)' },
    { word: 'responsibility', level: 'B2', vi: 'trách nhiệm', tip: 're-spon-si-bil-i-ty' },
];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
const TOTAL = 8;

export default function SpellingBee() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [words] = useState(() => shuffle(WORDS).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [input, setInput] = useState('');
    const [checked, setChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);
    const [hintShown, setHintShown] = useState(false);

    const current = words[idx];

    const speak = useCallback((text, rate = 0.7) => {
        window.speechSynthesis?.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US'; u.rate = rate;
        window.speechSynthesis?.speak(u);
    }, []);

    const handleCheck = () => {
        setChecked(true);
        if (input.trim().toLowerCase() === current.word.toLowerCase()) {
            setScore(s => s + 1); addXP(hintShown ? 5 : 15); setCelebration(c => c + 1);
        }
    };

    const next = () => {
        if (idx + 1 >= TOTAL) setComplete(true);
        else { setIdx(i => i + 1); setInput(''); setChecked(false); setHintShown(false); }
    };

    if (complete) {
        const pct = Math.round((score / TOTAL) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🐝' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Spelling Bee Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    const isCorrect = input.trim().toLowerCase() === current.word.toLowerCase();

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🐝 Spelling Bee</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: '#F59E0B' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            <div style={{ margin: '16px 0', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>Level {current.level} • {current.vi}</div>
                <button onClick={() => speak(current.word)}
                    style={{ margin: '12px 0', width: '80px', height: '80px', borderRadius: '50%', border: 'none', background: '#F59E0B', color: 'white', fontSize: '2rem', cursor: 'pointer', boxShadow: '0 0 0 6px #F59E0B30' }}>🔊</button>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Nghe rồi gõ đúng chính tả</div>
                <button onClick={() => speak(current.word, 0.4)} style={{ marginTop: '6px', fontSize: '0.7rem', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '2px 10px', cursor: 'pointer' }}>🐢 Nghe chậm</button>
            </div>

            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type the word..." disabled={checked} autoFocus
                onKeyDown={e => e.key === 'Enter' && input.trim() && !checked && handleCheck()}
                style={{
                    width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)', fontSize: '1.2rem', fontWeight: 700,
                    border: `2px solid ${checked ? (isCorrect ? '#22C55E' : '#EF4444') : 'var(--color-border)'}`,
                    background: 'var(--color-card)', color: 'var(--color-text)', outline: 'none',
                    textAlign: 'center', fontFamily: 'var(--font-display)', letterSpacing: '2px',
                }} />

            {!checked && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="btn btn--outline" onClick={() => setHintShown(true)} style={{ flex: 1 }}>💡 Gợi ý (-10XP)</button>
                    <button className="btn btn--primary" onClick={handleCheck} disabled={!input.trim()} style={{ flex: 1 }}>✅ Kiểm tra</button>
                </div>
            )}

            {hintShown && !checked && (
                <div style={{ marginTop: '6px', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: '#F59E0B10', border: '1px solid #F59E0B30', fontSize: '0.8rem' }}>
                    💡 {current.tip}
                </div>
            )}

            {checked && (
                <div style={{ marginTop: '8px', padding: '12px', borderRadius: 'var(--radius-lg)', background: `${isCorrect ? '#22C55E' : '#EF4444'}10`, border: `2px solid ${isCorrect ? '#22C55E' : '#EF4444'}` }}>
                    <div style={{ fontWeight: 700, color: isCorrect ? '#22C55E' : '#EF4444' }}>{isCorrect ? '✅ Perfect spelling!' : '❌ Sai chính tả'}</div>
                    {!isCorrect && <div style={{ fontSize: '0.9rem', marginTop: '4px' }}>Đáp án: <strong style={{ color: '#22C55E', letterSpacing: '2px' }}>{current.word}</strong></div>}
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '4px' }}>💡 {current.tip}</div>
                    <button className="btn btn--primary btn--block" style={{ marginTop: '8px' }} onClick={next}>
                        {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Từ tiếp'}
                    </button>
                </div>
            )}
        </div>
    );
}

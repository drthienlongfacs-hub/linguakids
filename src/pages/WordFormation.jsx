// WordFormation — Transform words between noun/verb/adj/adv forms
// Critical B1-B2 skill: success → successful → successfully → succeed
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const WORDS = [
    { root: 'success', noun: 'success', verb: 'succeed', adj: 'successful', adv: 'successfully' },
    { root: 'create', noun: 'creation', verb: 'create', adj: 'creative', adv: 'creatively' },
    { root: 'beauty', noun: 'beauty', verb: 'beautify', adj: 'beautiful', adv: 'beautifully' },
    { root: 'decide', noun: 'decision', verb: 'decide', adj: 'decisive', adv: 'decisively' },
    { root: 'educate', noun: 'education', verb: 'educate', adj: 'educational', adv: 'educationally' },
    { root: 'differ', noun: 'difference', verb: 'differ', adj: 'different', adv: 'differently' },
    { root: 'danger', noun: 'danger', verb: 'endanger', adj: 'dangerous', adv: 'dangerously' },
    { root: 'care', noun: 'care', verb: 'care', adj: 'careful', adv: 'carefully' },
    { root: 'comfort', noun: 'comfort', verb: 'comfort', adj: 'comfortable', adv: 'comfortably' },
    { root: 'compete', noun: 'competition', verb: 'compete', adj: 'competitive', adv: 'competitively' },
    { root: 'attract', noun: 'attraction', verb: 'attract', adj: 'attractive', adv: 'attractively' },
    { root: 'imagine', noun: 'imagination', verb: 'imagine', adj: 'imaginative', adv: 'imaginatively' },
    { root: 'communicate', noun: 'communication', verb: 'communicate', adj: 'communicative', adv: 'communicatively' },
    { root: 'economy', noun: 'economy', verb: 'economize', adj: 'economic', adv: 'economically' },
    { root: 'profession', noun: 'profession', verb: 'profess', adj: 'professional', adv: 'professionally' },
];

const FORMS = ['noun', 'verb', 'adj', 'adv'];
const FORM_LABELS = { noun: '📦 Noun', verb: '🏃 Verb', adj: '🎨 Adjective', adv: '⚡ Adverb' };
const FORM_COLORS = { noun: '#3B82F6', verb: '#22C55E', adj: '#F59E0B', adv: '#EF4444' };

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
const TOTAL = 8;

export default function WordFormation() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [words] = useState(() => shuffle(WORDS).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [targetForm] = useState(() => FORMS.map(() => FORMS[Math.floor(Math.random() * FORMS.length)]));
    const [input, setInput] = useState('');
    const [checked, setChecked] = useState(false);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);

    const word = words[idx];
    const askForm = targetForm[idx];
    const correctAnswer = word[askForm];
    // Show a different form as the given word
    const givenForm = FORMS.find(f => f !== askForm) || 'noun';

    const handleCheck = () => {
        setChecked(true);
        if (input.trim().toLowerCase() === correctAnswer.toLowerCase()) {
            setScore(s => s + 1); addXP(10); setCelebration(c => c + 1);
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
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🏆' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Word Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    const isCorrect = input.trim().toLowerCase() === correctAnswer.toLowerCase();

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🔠 Word Forms</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            <div style={{ margin: '16px 0', padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginBottom: '6px' }}>Cho từ ({FORM_LABELS[givenForm]}):</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: FORM_COLORS[givenForm] }}>{word[givenForm]}</div>
                <div style={{ marginTop: '10px', fontSize: '0.85rem' }}>
                    Viết dạng <strong style={{ color: FORM_COLORS[askForm] }}>{FORM_LABELS[askForm]}</strong>:
                </div>
            </div>

            {/* All forms reference */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                {FORMS.map(f => (
                    <div key={f} style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: f === askForm ? `${FORM_COLORS[f]}10` : 'var(--color-surface)', border: `1px solid ${f === askForm ? FORM_COLORS[f] : 'var(--color-border)'}`, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.65rem', color: FORM_COLORS[f], fontWeight: 700 }}>{FORM_LABELS[f]}</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{f === askForm ? (checked ? word[f] : '???') : word[f]}</div>
                    </div>
                ))}
            </div>

            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type the word form..." disabled={checked}
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
                    {!isCorrect && <div style={{ fontSize: '0.85rem' }}>Đáp án: <strong style={{ color: '#22C55E' }}>{correctAnswer}</strong></div>}
                    <button className="btn btn--primary btn--block" style={{ marginTop: '8px' }} onClick={next}>
                        {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Từ tiếp'}
                    </button>
                </div>
            )}
        </div>
    );
}

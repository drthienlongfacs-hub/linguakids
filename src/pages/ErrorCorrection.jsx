// ErrorCorrection — Type a sentence, AI finds and corrects grammar errors
// Simulates a native teacher correcting your writing in real-time
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const EXERCISES = [
    { incorrect: 'She go to school every day.', correct: 'She goes to school every day.', rule: 'Present Simple: he/she/it + V-s/es', errorType: 'Subject-verb agreement' },
    { incorrect: 'I am agree with you.', correct: 'I agree with you.', rule: '"Agree" is a state verb — no continuous', errorType: 'State verb misuse' },
    { incorrect: 'He don\'t like coffee.', correct: "He doesn't like coffee.", rule: 'He/she/it + doesn\'t + V (bare)', errorType: 'Auxiliary verb' },
    { incorrect: 'I have went to Japan last year.', correct: 'I went to Japan last year.', rule: 'Past simple with "last year" — no "have"', errorType: 'Tense confusion' },
    { incorrect: 'She is more taller than me.', correct: 'She is taller than me.', rule: 'One-syllable adj: -er, not "more + -er"', errorType: 'Double comparative' },
    { incorrect: 'I can to swim very well.', correct: 'I can swim very well.', rule: 'Modal verb + bare infinitive (no "to")', errorType: 'Modal + infinitive' },
    { incorrect: 'There is many people in the park.', correct: 'There are many people in the park.', rule: '"People" is plural → "are"', errorType: 'There is/are' },
    { incorrect: 'I am living in Vietnam since 2020.', correct: 'I have been living in Vietnam since 2020.', rule: '"Since" → Present Perfect Continuous', errorType: 'Since/For tense' },
    { incorrect: 'She suggested me to go home.', correct: 'She suggested that I go home.', rule: '"Suggest" + that + subject + bare verb', errorType: 'Suggest pattern' },
    { incorrect: 'I interested in music.', correct: 'I am interested in music.', rule: '"Interested" is adjective — need "am"', errorType: 'Missing "be"' },
    { incorrect: 'He has been to Paris yesterday.', correct: 'He went to Paris yesterday.', rule: '"Yesterday" = past simple, not present perfect', errorType: 'Time marker mismatch' },
    { incorrect: 'The news are very good today.', correct: 'The news is very good today.', rule: '"News" is uncountable → singular verb', errorType: 'Uncountable noun' },
    { incorrect: 'I look forward to hear from you.', correct: 'I look forward to hearing from you.', rule: '"Look forward to" + V-ing', errorType: 'Preposition + gerund' },
    { incorrect: 'She makes me to laugh.', correct: 'She makes me laugh.', rule: '"Make" + object + bare infinitive', errorType: 'Causative verb' },
    { incorrect: 'If I will have time, I will come.', correct: 'If I have time, I will come.', rule: 'Type 1: If + present, will + V', errorType: 'Conditional' },
];

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

const TOTAL = 8;

export default function ErrorCorrection() {
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
        const normalized = input.trim().toLowerCase().replace(/['']/g, "'");
        const target = ex.correct.toLowerCase().replace(/['']/g, "'");
        const isCorrect = normalized === target;
        setChecked(true);
        if (isCorrect) {
            setScore(s => s + 1);
            addXP(10);
            setCelebration(c => c + 1);
        }
    };

    const next = () => {
        if (idx + 1 >= TOTAL) { setComplete(true); }
        else { setIdx(i => i + 1); setInput(''); setChecked(false); }
    };

    if (complete) {
        const pct = Math.round((score / TOTAL) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '12px' }}>{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Sửa lỗi ngữ pháp</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <p style={{ color: 'var(--color-text-light)' }}>+{score * 10} XP ⭐</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>🎮 Trò chơi</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">✏️ Error Correction</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            {/* Error sentence */}
            <div style={{ margin: '20px 0', padding: '20px', borderRadius: 'var(--radius-lg)', background: '#EF444410', border: '2px solid #EF4444', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#EF4444', fontWeight: 700, marginBottom: '6px' }}>❌ Câu SAI — Hãy sửa lại:</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.6, textDecoration: 'line-through', textDecorationColor: '#EF4444' }}>
                    {ex.incorrect}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                    🏷️ {ex.errorType}
                </div>
            </div>

            {/* Input */}
            <div style={{ margin: '12px 0' }}>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Viết lại câu đúng..."
                    rows={2} disabled={checked}
                    style={{
                        width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
                        border: `2px solid ${checked ? (input.trim().toLowerCase() === ex.correct.toLowerCase() ? '#22C55E' : '#EF4444') : 'var(--color-border)'}`,
                        background: 'var(--color-card)', fontFamily: 'var(--font-display)', fontSize: '1rem',
                        fontWeight: 600, color: 'var(--color-text)', resize: 'none', outline: 'none',
                    }}
                />
                {!checked && (
                    <button className="btn btn--primary btn--block btn--large" style={{ marginTop: '8px' }}
                        onClick={handleCheck} disabled={!input.trim()}>✅ Kiểm tra</button>
                )}
            </div>

            {/* Feedback */}
            {checked && (
                <div style={{
                    padding: '16px', borderRadius: 'var(--radius-lg)', marginTop: '8px',
                    background: input.trim().toLowerCase() === ex.correct.toLowerCase() ? '#22C55E10' : '#F59E0B10',
                    border: `2px solid ${input.trim().toLowerCase() === ex.correct.toLowerCase() ? '#22C55E' : '#F59E0B'}`,
                }}>
                    {input.trim().toLowerCase() === ex.correct.toLowerCase() ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22C55E' }}>✅ Chính xác! +10 XP</div>
                        </div>
                    ) : (
                        <div>
                            <div style={{ fontWeight: 700, color: '#EF4444', marginBottom: '6px' }}>❌ Chưa đúng</div>
                            <div style={{ marginBottom: '6px' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>✅ Đáp án: </span>
                                <strong style={{ color: '#22C55E' }}>{ex.correct}</strong>
                            </div>
                        </div>
                    )}
                    <div style={{ marginTop: '8px', padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-card)', borderLeft: '3px solid var(--color-primary)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700 }}>📐 Quy tắc:</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ex.rule}</div>
                    </div>
                    <button className="btn btn--primary btn--block" style={{ marginTop: '10px' }} onClick={next}>
                        {idx + 1 >= TOTAL ? '📊 Xem kết quả' : '➡️ Câu tiếp'}
                    </button>
                </div>
            )}
        </div>
    );
}

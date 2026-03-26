// SentenceTranslation — Practice translating between EN ↔ VN
// Simulates teacher drilling translation accuracy
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const EXERCISES = [
    { en: 'I have been learning English for two years.', vn: 'Tôi đã học tiếng Anh được hai năm.', dir: 'vn→en', hint: 'have been + V-ing + for' },
    { en: 'She is the most talented person I have ever met.', vn: 'Cô ấy là người tài năng nhất tôi từng gặp.', dir: 'vn→en', hint: 'the most + adj + I have ever + V3' },
    { en: 'If I had more money, I would travel around the world.', vn: 'Nếu tôi có nhiều tiền hơn, tôi sẽ đi du lịch vòng quanh thế giới.', dir: 'vn→en', hint: 'If + past simple, would + V' },
    { en: 'The meeting was cancelled because the manager was sick.', vn: 'Cuộc họp bị hủy vì giám đốc bị ốm.', dir: 'en→vn', hint: 'was cancelled = bị hủy' },
    { en: 'Could you please tell me where the nearest hospital is?', vn: 'Bạn có thể cho tôi biết bệnh viện gần nhất ở đâu không?', dir: 'vn→en', hint: 'Could you please tell me + where + S + V' },
    { en: 'I wish I could speak Chinese fluently.', vn: 'Ước gì tôi có thể nói tiếng Trung lưu loát.', dir: 'en→vn', hint: 'I wish + past simple' },
    { en: 'He suggested that we should start the project immediately.', vn: 'Anh ấy đề nghị chúng tôi nên bắt đầu dự án ngay lập tức.', dir: 'vn→en', hint: 'suggested that + S + should + V' },
    { en: 'The food at this restaurant is absolutely delicious.', vn: 'Đồ ăn ở nhà hàng này thật sự ngon tuyệt.', dir: 'en→vn', hint: 'absolutely = thật sự/hoàn toàn' },
    { en: 'Despite the heavy rain, they continued to play football.', vn: 'Mặc dù mưa to, họ vẫn tiếp tục chơi bóng đá.', dir: 'vn→en', hint: 'Despite + N, S + V' },
    { en: 'She has been promoted to manager after working here for five years.', vn: 'Cô ấy được thăng chức giám đốc sau khi làm việc ở đây năm năm.', dir: 'en→vn', hint: 'has been promoted = được thăng chức' },
    { en: 'I am looking forward to hearing from you soon.', vn: 'Tôi mong sớm nhận được hồi âm từ bạn.', dir: 'vn→en', hint: 'look forward to + V-ing' },
    { en: 'This is the first time I have been to Japan.', vn: 'Đây là lần đầu tiên tôi đến Nhật Bản.', dir: 'en→vn', hint: 'the first time + present perfect' },
];

function similarity(target, input) {
    const t = target.toLowerCase().replace(/[^\w\sàáả-ỹ]/g, '').trim();
    const s = input.toLowerCase().replace(/[^\w\sàáả-ỹ]/g, '').trim();
    if (t === s) return 100;
    const tWords = t.split(/\s+/); const sWords = s.split(/\s+/);
    const matched = tWords.filter(w => sWords.includes(w)).length;
    return Math.max(0, Math.round((matched / Math.max(tWords.length, 1)) * 100));
}

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

const TOTAL = 6;

export default function SentenceTranslation() {
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
    const isToEn = ex.dir === 'vn→en';
    const source = isToEn ? ex.vn : ex.en;
    const target = isToEn ? ex.en : ex.vn;

    const handleCheck = () => {
        setChecked(true);
        const sim = similarity(target, input);
        if (sim >= 60) { setScore(s => s + 1); addXP(sim >= 90 ? 15 : 10); setCelebration(c => c + 1); }
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
                <div style={{ fontSize: '5rem' }}>{pct >= 70 ? '🏆' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Translation Master</h2>
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
                <h2 className="page-header__title">🔄 Translation</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            <div style={{ marginTop: '16px', textAlign: 'center', padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '4px' }}>
                    {isToEn ? '🇻🇳 → 🇺🇸 Dịch sang tiếng Anh' : '🇺🇸 → 🇻🇳 Dịch sang tiếng Việt'}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.6 }}>
                    "{source}"
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '6px' }}>💡 Gợi ý: {ex.hint}</div>
            </div>

            <div style={{ margin: '12px 0' }}>
                <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={isToEn ? 'Type your English translation...' : 'Gõ bản dịch tiếng Việt...'}
                    rows={2} disabled={checked}
                    style={{
                        width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)',
                        border: `2px solid ${checked ? (similarity(target, input) >= 60 ? '#22C55E' : '#EF4444') : 'var(--color-border)'}`,
                        background: 'var(--color-card)', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600,
                        color: 'var(--color-text)', resize: 'none', outline: 'none',
                    }}
                />
                {!checked && (
                    <button className="btn btn--primary btn--block btn--large" style={{ marginTop: '8px' }} onClick={handleCheck} disabled={!input.trim()}>✅ Kiểm tra</button>
                )}
            </div>

            {checked && (
                <div style={{ padding: '14px', borderRadius: 'var(--radius-lg)', background: `${similarity(target, input) >= 60 ? '#22C55E' : '#EF4444'}10`, border: `2px solid ${similarity(target, input) >= 60 ? '#22C55E' : '#EF4444'}` }}>
                    <div style={{ fontWeight: 700, color: similarity(target, input) >= 60 ? '#22C55E' : '#EF4444', marginBottom: '6px' }}>
                        {similarity(target, input) >= 60 ? `✅ Tốt! (${similarity(target, input)}% match)` : '❌ Chưa đạt'}
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--color-text-light)' }}>Đáp án: </span>
                        <strong style={{ color: '#22C55E' }}>{target}</strong>
                    </div>
                    <button className="btn btn--primary btn--block" style={{ marginTop: '10px' }} onClick={next}>
                        {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Câu tiếp'}
                    </button>
                </div>
            )}
        </div>
    );
}

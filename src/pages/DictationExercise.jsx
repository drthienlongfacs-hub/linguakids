// DictationExercise — Listen to sentences and type what you hear
// Leverages free SpeechSynthesis API for native-quality audio
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const EN_SENTENCES = [
    { text: 'The weather is beautiful today.', vi: 'Thời tiết hôm nay đẹp.' },
    { text: 'I would like a cup of coffee, please.', vi: 'Xin cho tôi một tách cà phê.' },
    { text: 'She has been studying English for three years.', vi: 'Cô ấy đã học tiếng Anh 3 năm.' },
    { text: 'Can you tell me where the nearest hospital is?', vi: 'Bạn có thể chỉ đường đến bệnh viện gần nhất không?' },
    { text: 'They are planning to visit Vietnam next summer.', vi: 'Họ dự định thăm Việt Nam mùa hè sau.' },
    { text: 'If I had more time, I would learn Chinese.', vi: 'Nếu tôi có thêm thời gian, tôi sẽ học tiếng Trung.' },
    { text: 'The meeting has been postponed until Friday.', vi: 'Cuộc họp đã bị hoãn đến thứ Sáu.' },
    { text: 'Learning a new language opens many doors.', vi: 'Học một ngôn ngữ mới mở ra nhiều cơ hội.' },
    { text: 'Could you please speak more slowly?', vi: 'Bạn có thể nói chậm hơn được không?' },
    { text: 'I enjoy reading books before going to sleep.', vi: 'Tôi thích đọc sách trước khi ngủ.' },
    { text: 'The children are playing in the garden.', vi: 'Các em đang chơi trong vườn.' },
    { text: 'We need to finish this project by Monday.', vi: 'Chúng tôi cần hoàn thành dự án trước thứ Hai.' },
];

const CN_SENTENCES = [
    { text: '今天天气很好。', pinyin: 'Jīntiān tiānqì hěn hǎo.', vi: 'Hôm nay thời tiết đẹp.' },
    { text: '请给我一杯咖啡。', pinyin: 'Qǐng gěi wǒ yī bēi kāfēi.', vi: 'Xin cho tôi một ly cà phê.' },
    { text: '我学中文三年了。', pinyin: 'Wǒ xué zhōngwén sān nián le.', vi: 'Tôi học tiếng Trung 3 năm rồi.' },
    { text: '你会说英语吗？', pinyin: 'Nǐ huì shuō yīngyǔ ma?', vi: 'Bạn biết nói tiếng Anh không?' },
    { text: '我们明天去公园。', pinyin: 'Wǒmen míngtiān qù gōngyuán.', vi: 'Ngày mai chúng ta đi công viên.' },
    { text: '这个东西多少钱？', pinyin: 'Zhè ge dōngxī duōshǎo qián?', vi: 'Cái này bao nhiêu tiền?' },
    { text: '我很高兴认识你。', pinyin: 'Wǒ hěn gāoxìng rènshi nǐ.', vi: 'Tôi rất vui được gặp bạn.' },
    { text: '请问洗手间在哪里？', pinyin: 'Qǐngwèn xǐshǒujiān zài nǎlǐ?', vi: 'Xin cho hỏi nhà vệ sinh ở đâu?' },
];

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

function similarity(a, b) {
    const la = a.toLowerCase().replace(/[^\w\s\u4e00-\u9fff]/g, '').trim();
    const lb = b.toLowerCase().replace(/[^\w\s\u4e00-\u9fff]/g, '').trim();
    if (la === lb) return 100;
    const len = Math.max(la.length, lb.length);
    if (!len) return 100;
    const dp = Array.from({ length: la.length + 1 }, (_, i) => { const r = Array(lb.length + 1).fill(0); r[0] = i; return r; });
    for (let j = 0; j <= lb.length; j++) dp[0][j] = j;
    for (let i = 1; i <= la.length; i++) for (let j = 1; j <= lb.length; j++)
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (la[i - 1] !== lb[j - 1] ? 1 : 0));
    return Math.max(0, Math.round((1 - dp[la.length][lb.length] / len) * 100));
}

const TOTAL = 5;

export default function DictationExercise() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const isEN = lang !== 'cn';

    const sentences = useMemo(() => shuffle(isEN ? EN_SENTENCES : CN_SENTENCES).slice(0, TOTAL), []);
    const [idx, setIdx] = useState(0);
    const [input, setInput] = useState('');
    const [score, setScore] = useState(null);
    const [results, setResults] = useState([]);
    const [complete, setComplete] = useState(false);
    const [celebration, setCelebration] = useState(0);
    const [speed, setSpeed] = useState(0.8);

    const speak = useCallback((text, rate) => {
        window.speechSynthesis?.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = isEN ? 'en-US' : 'zh-CN';
        u.rate = rate || speed;
        window.speechSynthesis?.speak(u);
    }, [isEN, speed]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const s = sentences[idx];
        const sim = similarity(input, s.text);
        setScore(sim);
        if (sim >= 70) { addXP(sim >= 90 ? 15 : 10); setCelebration(c => c + 1); }
        setResults(prev => [...prev, { target: s.text, typed: input, score: sim }]);
    };

    const next = () => {
        if (idx + 1 >= TOTAL) { setComplete(true); } else { setIdx(i => i + 1); setInput(''); setScore(null); }
    };

    if (complete) {
        const avg = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '12px' }}>{avg >= 80 ? '🎧' : '📝'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Kết quả chính tả</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: avg >= 80 ? '#22C55E' : '#F59E0B' }}>{avg}%</p>
                <div style={{ textAlign: 'left', maxWidth: '450px', margin: '16px auto' }}>
                    {results.map((r, i) => (
                        <div key={i} style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: '6px', background: 'var(--color-card)', border: `1px solid ${r.score >= 80 ? '#22C55E33' : '#F59E0B33'}` }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>✅ {r.target}</div>
                            <div style={{ fontSize: '0.8rem', color: r.score >= 80 ? '#22C55E' : '#EF4444' }}>📝 {r.typed} — {r.score}%</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '12px auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>🎮 Trò chơi</button>
                </div>
            </div>
        );
    }

    const s = sentences[idx];

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🎧 Chính tả {isEN ? '🇬🇧' : '🇨🇳'}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: isEN ? 'var(--gradient-english)' : 'var(--gradient-chinese)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            {/* Listen controls */}
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '12px' }}>
                    <button onClick={() => speak(s.text, 0.6)} className="btn btn--outline" style={{ fontSize: '1.2rem' }}>🐢 Chậm</button>
                    <button onClick={() => speak(s.text, 1.0)} className="btn btn--primary" style={{ fontSize: '1.5rem', padding: '12px 28px' }}>🔊 Nghe</button>
                    <button onClick={() => speak(s.text, 1.2)} className="btn btn--outline" style={{ fontSize: '1.2rem' }}>🐇 Nhanh</button>
                </div>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.8rem' }}>💡 Nghe rồi gõ lại chính xác</p>
                {!isEN && s.pinyin && <p style={{ color: 'var(--color-text-light)', fontSize: '0.75rem' }}>Gợi ý: {s.vi}</p>}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit}>
                <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder={isEN ? 'Type what you hear...' : '输入你听到的...'} rows={3}
                    style={{
                        width: '100%', padding: '14px', borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-border)',
                        background: 'var(--color-card)', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600,
                        color: 'var(--color-text)', resize: 'none', outline: 'none',
                    }}
                />
                {!score && <button type="submit" className="btn btn--primary btn--block btn--large" style={{ marginTop: '8px' }} disabled={!input.trim()}>✅ Kiểm tra</button>}
            </form>

            {/* Score */}
            {score !== null && (
                <div style={{ textAlign: 'center', padding: '16px', borderRadius: 'var(--radius-lg)', marginTop: '12px', background: `${score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'}10`, border: `2px solid ${score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'}` }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: score >= 80 ? '#22C55E' : '#F59E0B' }}>{score >= 90 ? '🌟' : score >= 70 ? '👍' : '💪'} {score}%</div>
                    <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>Đáp án: <strong>{s.text}</strong></div>
                    <button className="btn btn--primary" style={{ marginTop: '12px' }} onClick={next}>{idx + 1 >= TOTAL ? '📊 Xem kết quả' : '➡️ Câu tiếp theo'}</button>
                </div>
            )}
        </div>
    );
}

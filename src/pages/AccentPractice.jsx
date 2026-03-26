// AccentPractice — Practice with different English accents (US, UK, AU)
// Leverages SpeechSynthesis voice selection for accent diversity
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

const ACCENT_PROFILES = [
    { id: 'us', label: 'American 🇺🇸', lang: 'en-US', color: '#3B82F6', voiceHint: ['Samantha', 'Alex', 'Google US', 'Microsoft Mark'] },
    { id: 'uk', label: 'British 🇬🇧', lang: 'en-GB', color: '#EF4444', voiceHint: ['Daniel', 'Google UK', 'Microsoft Hazel', 'Karen'] },
    { id: 'au', label: 'Australian 🇦🇺', lang: 'en-AU', color: '#F59E0B', voiceHint: ['Karen', 'Google AU', 'Tessa'] },
];

const PRACTICE_SENTENCES = [
    { text: 'Can I have a glass of water, please?', vi: 'Cho tôi một ly nước được không?', category: 'daily' },
    { text: 'The meeting has been rescheduled to Friday.', vi: 'Cuộc họp đã dời sang thứ Sáu.', category: 'work' },
    { text: 'I really enjoyed the movie last night.', vi: 'Tôi rất thích bộ phim tối qua.', category: 'casual' },
    { text: 'Could you tell me how to get to the hospital?', vi: 'Bạn có thể chỉ đường đến bệnh viện không?', category: 'travel' },
    { text: 'The weather forecast says it will rain tomorrow.', vi: 'Dự báo thời tiết nói ngày mai sẽ mưa.', category: 'daily' },
    { text: 'I would like to make a reservation for two.', vi: 'Tôi muốn đặt bàn cho hai người.', category: 'restaurant' },
    { text: 'She graduated from university with honours.', vi: 'Cô ấy tốt nghiệp đại học loại xuất sắc.', category: 'academic' },
    { text: 'The children are playing in the park after school.', vi: 'Các em đang chơi trong công viên sau giờ học.', category: 'daily' },
    { text: 'What time does the next train to London depart?', vi: 'Tàu đi London chuyến tiếp khởi hành lúc mấy?', category: 'travel' },
    { text: 'Practice makes perfect, so keep trying!', vi: 'Tập luyện tạo nên hoàn hão, hãy cố gắng!', category: 'motivation' },
];

function getScore(target, spoken) {
    const t = target.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const s = spoken.toLowerCase().replace(/[^\w\s]/g, '').trim();
    if (t === s) return 100;
    const len = Math.max(t.length, s.length);
    if (!len) return 100;
    const dp = Array.from({ length: t.length + 1 }, (_, i) => { const r = Array(s.length + 1).fill(0); r[0] = i; return r; });
    for (let j = 0; j <= s.length; j++) dp[0][j] = j;
    for (let i = 1; i <= t.length; i++) for (let j = 1; j <= s.length; j++)
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (t[i - 1] !== s[j - 1] ? 1 : 0));
    return Math.max(0, Math.round((1 - dp[t.length][s.length] / len) * 100));
}

export default function AccentPractice() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [selectedAccent, setSelectedAccent] = useState(null);
    const [voices, setVoices] = useState([]);
    const [sIdx, setSIdx] = useState(0);
    const [listening, setListening] = useState(false);
    const [spoken, setSpoken] = useState('');
    const [score, setScore] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [results, setResults] = useState([]);
    const [complete, setComplete] = useState(false);
    const recRef = useRef(null);
    const TOTAL = 5;

    useEffect(() => {
        const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() || []);
        loadVoices();
        window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
        return () => window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
    }, []);

    const findVoice = useCallback((accent) => {
        const profile = ACCENT_PROFILES.find(a => a.id === accent);
        if (!profile) return null;
        for (const hint of profile.voiceHint) {
            const v = voices.find(v => v.name.includes(hint));
            if (v) return v;
        }
        return voices.find(v => v.lang.startsWith(profile.lang.split('-')[0]) && v.lang.includes(profile.lang.split('-')[1])) || voices.find(v => v.lang.startsWith('en'));
    }, [voices]);

    const speak = useCallback((text, accent, rate = 0.85) => {
        window.speechSynthesis?.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const voice = findVoice(accent);
        if (voice) u.voice = voice;
        u.lang = ACCENT_PROFILES.find(a => a.id === accent)?.lang || 'en-US';
        u.rate = rate;
        window.speechSynthesis?.speak(u);
    }, [findVoice]);

    const startListening = useCallback(() => {
        if (!SpeechRecognition) return;
        setSpoken(''); setScore(null);
        const rec = new SpeechRecognition();
        rec.lang = ACCENT_PROFILES.find(a => a.id === selectedAccent)?.lang || 'en-US';
        rec.continuous = false; rec.interimResults = false;
        rec.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setSpoken(transcript);
            const s = getScore(PRACTICE_SENTENCES[sIdx].text, transcript);
            setScore(s);
            if (s >= 70) { addXP(s >= 90 ? 15 : 10); setCelebration(c => c + 1); }
            setResults(prev => [...prev, { sentence: PRACTICE_SENTENCES[sIdx].text, spoken: transcript, score: s, accent: selectedAccent }]);
            setListening(false);
        };
        rec.onerror = () => setListening(false);
        rec.onend = () => setListening(false);
        recRef.current = rec;
        rec.start();
        setListening(true);
    }, [selectedAccent, sIdx]);

    const next = () => {
        if (sIdx + 1 >= TOTAL) setComplete(true);
        else { setSIdx(i => i + 1); setSpoken(''); setScore(null); }
    };

    // Accent selection screen
    if (!selectedAccent) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                    <h2 className="page-header__title">🌍 Accent Practice</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '12px', fontSize: '0.9rem' }}>
                    Chọn giọng bản ngữ để luyện tập:
                </p>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {ACCENT_PROFILES.map(accent => {
                        const voice = findVoice(accent.id);
                        return (
                            <button key={accent.id} onClick={() => { setSelectedAccent(accent.id); setSIdx(0); setResults([]); setComplete(false); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '18px', borderRadius: 'var(--radius-lg)',
                                    background: `${accent.color}10`, border: `2px solid ${accent.color}40`,
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                }}
                            >
                                <span style={{ fontSize: '2rem' }}>{accent.label.split(' ')[1]}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: accent.color }}>
                                        {accent.label.split(' ')[0]}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                                        {voice ? `Voice: ${voice.name}` : 'System default'}
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); speak('Hello, how are you today?', accent.id); }}
                                    style={{ padding: '8px 14px', borderRadius: 'var(--radius-full)', background: accent.color, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}>
                                    🔊 Preview
                                </button>
                            </button>
                        );
                    })}
                </div>
                <div style={{ marginTop: '16px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--color-card)', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    💡 <strong>Tip:</strong> Mỗi giọng có cách phát âm, ngữ điệu và nhịp nói khác nhau. Luyện nhiều giọng giúp bạn hiểu native speakers dễ hơn!
                </div>
            </div>
        );
    }

    // Results screen
    if (complete) {
        const avg = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;
        const accent = ACCENT_PROFILES.find(a => a.id === selectedAccent);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '4rem', marginBottom: '12px' }}>{accent?.label.split(' ')[1]}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', color: accent?.color }}>{accent?.label.split(' ')[0]} Accent</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: avg >= 80 ? '#22C55E' : '#F59E0B' }}>{avg}%</p>
                <div style={{ textAlign: 'left', maxWidth: '400px', margin: '12px auto' }}>
                    {results.map((r, i) => (
                        <div key={i} style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: '4px', background: 'var(--color-card)', borderLeft: `3px solid ${r.score >= 80 ? '#22C55E' : '#F59E0B'}` }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.sentence}</div>
                            <div style={{ fontSize: '0.75rem', color: r.score >= 80 ? '#22C55E' : '#EF4444' }}>→ {r.spoken} ({r.score}%)</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '12px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => setSelectedAccent(null)}>🌍 Đổi giọng</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    // Practice screen
    const sentence = PRACTICE_SENTENCES[sIdx];
    const accent = ACCENT_PROFILES.find(a => a.id === selectedAccent);

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => setSelectedAccent(null)}>←</button>
                <h2 className="page-header__title">{accent?.label}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(sIdx / TOTAL) * 100}%`, background: accent?.color }} />
                </div>
                <span className="lesson-progress__text">{sIdx + 1}/{TOTAL}</span>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.6, marginBottom: '8px' }}>
                    "{sentence.text}"
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{sentence.vi}</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                    <button onClick={() => speak(sentence.text, selectedAccent, 0.6)} className="btn btn--outline" style={{ fontSize: '0.8rem' }}>🐢 Chậm</button>
                    <button onClick={() => speak(sentence.text, selectedAccent, 0.85)} className="btn btn--primary">🔊 Nghe {accent?.label.split(' ')[0]}</button>
                    <button onClick={() => speak(sentence.text, selectedAccent, 1.1)} className="btn btn--outline" style={{ fontSize: '0.8rem' }}>🐇 Nhanh</button>
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <button onClick={startListening} disabled={listening}
                    style={{
                        width: '90px', height: '90px', borderRadius: '50%', border: 'none',
                        background: listening ? '#EF4444' : accent?.color,
                        color: 'white', fontSize: '2.2rem', cursor: 'pointer',
                        boxShadow: listening ? '0 0 0 8px #EF444440' : `0 0 0 8px ${accent?.color}30`,
                        animation: listening ? 'pulse 1.2s infinite' : 'none',
                    }}>
                    {listening ? '⏹️' : '🎙️'}
                </button>
                <p style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    {listening ? '🔴 Đang nghe...' : 'Bấm → Nói theo giọng bản ngữ'}
                </p>
            </div>

            {score !== null && (
                <div style={{
                    textAlign: 'center', padding: '16px', borderRadius: 'var(--radius-lg)',
                    background: `${score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'}10`,
                    border: `2px solid ${score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'}`, margin: '12px 0',
                }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: score >= 80 ? '#22C55E' : '#F59E0B' }}>
                        {score >= 90 ? '🌟' : score >= 70 ? '👍' : '💪'} {score}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '4px' }}>Bạn nói: "{spoken}"</div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                        {score < 70 && <button className="btn btn--outline" onClick={startListening}>🔄 Thử lại</button>}
                        <button className="btn btn--primary" onClick={next}>{sIdx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Tiếp'}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

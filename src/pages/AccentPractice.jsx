// AccentPractice — Practice with different English accents + Voice Personalities
// 3 accents (US/UK/AU) × 6 voice types = 18 distinct voice experiences
// Uses platform-aware voice matching for Chrome Android, iOS Safari, macOS, Windows

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';
import {
    ACCENT_PROFILES,
    VOICE_PERSONALITIES,
    DEFAULT_PERSONALITY,
    findPersonalityVoice,
    getPersonalityProsody,
    detectPlatform,
} from '../data/voicePersonalities';

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

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
    { text: 'Practice makes perfect, so keep trying!', vi: 'Tập luyện tạo nên hoàn hảo, hãy cố gắng!', category: 'motivation' },
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
    const [selectedPersonality, setSelectedPersonality] = useState(DEFAULT_PERSONALITY);
    const [voices, setVoices] = useState([]);
    const [step, setStep] = useState('accent'); // accent | personality | practice | results
    const [sIdx, setSIdx] = useState(0);
    const [listening, setListening] = useState(false);
    const [spoken, setSpoken] = useState('');
    const [score, setScore] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [results, setResults] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const recRef = useRef(null);
    const TOTAL = 5;

    useEffect(() => {
        const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() || []);
        loadVoices();
        window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
        const t1 = setTimeout(loadVoices, 500);
        const t2 = setTimeout(loadVoices, 1500);
        return () => {
            window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
            clearTimeout(t1); clearTimeout(t2);
        };
    }, []);

    const platform = detectPlatform();

    const speak = useCallback((text, accentId, personalityId, rateOverride) => {
        window.speechSynthesis?.cancel();
        setIsSpeaking(true);
        const u = new SpeechSynthesisUtterance(text);
        const voice = findPersonalityVoice(voices, accentId || selectedAccent, personalityId || selectedPersonality);
        const prosody = getPersonalityProsody(personalityId || selectedPersonality);
        const accent = ACCENT_PROFILES.find(a => a.id === (accentId || selectedAccent));

        if (voice) {
            u.voice = voice;
            u.lang = voice.lang;
        } else {
            u.lang = accent?.lang || 'en-US';
        }

        u.pitch = prosody.pitch;
        u.rate = rateOverride || prosody.rate;
        u.volume = prosody.volume || 1.0;
        u.onend = () => setIsSpeaking(false);
        u.onerror = () => setIsSpeaking(false);
        window.speechSynthesis?.speak(u);
    }, [voices, selectedAccent, selectedPersonality]);

    const getMatchedVoiceName = useCallback((accentId, personalityId) => {
        const voice = findPersonalityVoice(voices, accentId, personalityId);
        return voice ? voice.name : null;
    }, [voices]);

    const startListening = useCallback(() => {
        if (!SpeechRecognition) return;
        window.speechSynthesis?.cancel();
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
    }, [selectedAccent, sIdx, addXP]);

    const next = () => {
        if (sIdx + 1 >= TOTAL) setStep('results');
        else { setSIdx(i => i + 1); setSpoken(''); setScore(null); }
    };

    // ================================================================
    // STEP 1: ACCENT SELECTION
    // ================================================================
    if (step === 'accent') {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                    <h2 className="page-header__title">🌍 Accent Practice</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '16px', fontSize: '0.9rem' }}>
                    Chọn giọng bản ngữ để luyện tập:
                </p>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {ACCENT_PROFILES.map(accent => {
                        const voiceName = getMatchedVoiceName(accent.id, selectedPersonality);
                        return (
                            <button key={accent.id}
                                onClick={() => { setSelectedAccent(accent.id); setStep('personality'); }}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '18px', borderRadius: 'var(--radius-lg)',
                                    background: `${accent.color}10`, border: `2px solid ${accent.color}40`,
                                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                                }}
                            >
                                <span style={{ fontSize: '2.2rem' }}>{accent.flag}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: accent.color }}>
                                        {accent.label}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                        {accent.descriptionVi}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: voiceName ? accent.color : 'var(--color-text-light)', marginTop: '2px', fontWeight: voiceName ? 600 : 400 }}>
                                        {voiceName ? `🎤 ${voiceName}` : `📱 ${platform}`}
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); speak('Hello, how are you today?', accent.id, selectedPersonality); }}
                                    disabled={isSpeaking}
                                    style={{ padding: '8px 14px', borderRadius: 'var(--radius-full)', background: accent.color, color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', opacity: isSpeaking ? 0.6 : 1 }}>
                                    {isSpeaking ? '🔊...' : '🔊 Preview'}
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

    // ================================================================
    // STEP 2: PERSONALITY SELECTION
    // ================================================================
    if (step === 'personality') {
        const accent = ACCENT_PROFILES.find(a => a.id === selectedAccent);
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => setStep('accent')}>←</button>
                    <h2 className="page-header__title">{accent?.flag} {accent?.label}</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '16px', fontSize: '0.9rem' }}>
                    Chọn kiểu giọng nói:
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {VOICE_PERSONALITIES.map(p => {
                        const voiceName = getMatchedVoiceName(selectedAccent, p.id);
                        const isSelected = selectedPersonality === p.id;
                        return (
                            <button key={p.id}
                                onClick={() => setSelectedPersonality(p.id)}
                                style={{
                                    padding: '14px 12px', borderRadius: 'var(--radius-md)',
                                    background: isSelected ? `${p.color}18` : 'var(--color-card)',
                                    border: `2px solid ${isSelected ? p.color : 'var(--color-border)'}`,
                                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                                    boxShadow: isSelected ? `0 2px 12px ${p.color}30` : 'var(--shadow-sm)',
                                }}
                            >
                                <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{p.emoji}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: isSelected ? p.color : 'var(--color-text)' }}>
                                    {p.labelVi}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', marginTop: '2px', lineHeight: 1.3 }}>
                                    {p.descriptionVi}
                                </div>
                                <div style={{ fontSize: '0.6rem', color: p.color, marginTop: '4px', fontWeight: 600 }}>
                                    {p.gender === 'male' ? '♂ Nam' : '♀ Nữ'} · {voiceName ? voiceName.split(' ').slice(0, 2).join(' ') : 'Auto'}
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); speak('This is how I sound when speaking naturally.', selectedAccent, p.id); }}
                                    disabled={isSpeaking}
                                    style={{ marginTop: '6px', padding: '4px 10px', borderRadius: 'var(--radius-full)', background: p.color, color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 700, opacity: isSpeaking ? 0.6 : 1 }}>
                                    {isSpeaking ? '🔊' : '▶ Nghe thử'}
                                </button>
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={() => { setSIdx(0); setResults([]); setStep('practice'); }}
                    className="btn btn--primary btn--block"
                    style={{ marginTop: '16px' }}
                >
                    🎯 Bắt đầu luyện tập
                </button>
            </div>
        );
    }

    // ================================================================
    // STEP 3: RESULTS
    // ================================================================
    if (step === 'results') {
        const avg = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;
        const accent = ACCENT_PROFILES.find(a => a.id === selectedAccent);
        const personality = VOICE_PERSONALITIES.find(p => p.id === selectedPersonality);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '40px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>{accent?.flag}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', color: accent?.color }}>{accent?.label}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    {personality?.emoji} {personality?.labelVi}
                </p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: avg >= 80 ? '#22C55E' : avg >= 50 ? '#F59E0B' : '#EF4444', margin: '8px 0' }}>
                    {avg}%
                </p>
                <div style={{ textAlign: 'left', maxWidth: '400px', margin: '12px auto' }}>
                    {results.map((r, i) => (
                        <div key={i} style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: '4px', background: 'var(--color-card)', borderLeft: `3px solid ${r.score >= 80 ? '#22C55E' : r.score >= 50 ? '#F59E0B' : '#EF4444'}` }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.sentence}</div>
                            <div style={{ fontSize: '0.75rem', color: r.score >= 80 ? '#22C55E' : '#EF4444' }}>→ {r.spoken} ({r.score}%)</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '12px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => setStep('accent')}>🌍 Chọn giọng khác</button>
                    <button className="btn btn--outline btn--block" onClick={() => setStep('personality')}>🎭 Đổi kiểu giọng</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    // ================================================================
    // STEP 4: PRACTICE (default)
    // ================================================================
    const sentence = PRACTICE_SENTENCES[sIdx];
    const accent = ACCENT_PROFILES.find(a => a.id === selectedAccent);
    const personality = VOICE_PERSONALITIES.find(p => p.id === selectedPersonality);

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => setStep('personality')}>←</button>
                <h2 className="page-header__title">{accent?.flag} {personality?.emoji} {accent?.label}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(sIdx / TOTAL) * 100}%`, background: accent?.color }} />
                </div>
                <span className="lesson-progress__text">{sIdx + 1}/{TOTAL}</span>
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: `${personality?.color}15`, border: `1px solid ${personality?.color}30`, fontSize: '0.7rem', fontWeight: 600, color: personality?.color, marginBottom: '10px' }}>
                    {personality?.emoji} {personality?.labelVi} · {personality?.gender === 'male' ? '♂' : '♀'}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.6, marginBottom: '8px' }}>
                    "{sentence.text}"
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{sentence.vi}</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => speak(sentence.text, selectedAccent, selectedPersonality, 0.6)}
                        disabled={isSpeaking} className="btn btn--outline" style={{ fontSize: '0.8rem' }}>🐢 Chậm</button>
                    <button onClick={() => speak(sentence.text, selectedAccent, selectedPersonality)}
                        disabled={isSpeaking} className="btn btn--primary">
                        {isSpeaking ? '🔊 Đang phát...' : `🔊 Nghe ${accent?.label}`}
                    </button>
                    <button onClick={() => speak(sentence.text, selectedAccent, selectedPersonality, 1.15)}
                        disabled={isSpeaking} className="btn btn--outline" style={{ fontSize: '0.8rem' }}>🐇 Nhanh</button>
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <button onClick={startListening} disabled={listening || isSpeaking}
                    style={{
                        width: '90px', height: '90px', borderRadius: '50%', border: 'none',
                        background: listening ? '#EF4444' : accent?.color,
                        color: 'white', fontSize: '2.2rem', cursor: 'pointer',
                        boxShadow: listening ? '0 0 0 8px #EF444440' : `0 0 0 8px ${accent?.color}30`,
                        animation: listening ? 'pulse 1.2s infinite' : 'none',
                        opacity: isSpeaking ? 0.4 : 1,
                    }}>
                    {listening ? '⏹️' : '🎙️'}
                </button>
                <p style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    {listening ? '🔴 Đang nghe...' : isSpeaking ? '🔊 Chờ phát xong...' : 'Bấm → Nói theo giọng bản ngữ'}
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

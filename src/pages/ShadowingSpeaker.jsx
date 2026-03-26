// ShadowingSpeaker — Practice mimicking famous speaking styles
// Technique: Listen → Pause → Repeat (Shadowing method used by language schools)
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

const SPEAKERS = [
    {
        id: 'formal', name: 'Professional', nameVi: 'Phong cách chuyên nghiệp', emoji: '👔',
        desc: 'Clear, precise, confident — like a CEO or news anchor',
        descVi: 'Rõ ràng, chính xác, tự tin — như CEO hoặc MC tin tức',
        color: '#3B82F6', rate: 0.9, pitch: 1.0,
        sentences: [
            { text: 'Good morning, everyone. Thank you for joining us today.', vi: 'Chào buổi sáng. Cảm ơn mọi người đã tham dự.' },
            { text: 'I would like to highlight three key points in this presentation.', vi: 'Tôi muốn nhấn mạnh ba điểm chính trong bài thuyết trình.' },
            { text: 'The data clearly shows a significant improvement this quarter.', vi: 'Dữ liệu cho thấy rõ sự cải thiện đáng kể trong quý này.' },
            { text: 'Let me walk you through our strategic plan for the next year.', vi: 'Tôi sẽ trình bày kế hoạch chiến lược cho năm tới.' },
        ],
    },
    {
        id: 'casual', name: 'Friendly Casual', nameVi: 'Phong cách thân thiện', emoji: '😊',
        desc: 'Warm, relaxed, everyday conversation',
        descVi: 'Ấm áp, thoải mái, giao tiếp hàng ngày',
        color: '#10B981', rate: 1.0, pitch: 1.1,
        sentences: [
            { text: "Hey! How's it going? Long time no see!", vi: 'Này! Dạo này thế nào? Lâu lắm rồi không gặp!' },
            { text: "Wanna grab a coffee sometime this week?", vi: 'Tuần này đi uống cà phê nhé?' },
            { text: "That movie was awesome! You should totally watch it.", vi: 'Phim đó hay lắm! Bạn nhất định phải xem.' },
            { text: "No worries at all, take your time.", vi: 'Không lo đâu, từ từ thôi.' },
        ],
    },
    {
        id: 'academic', name: 'Academic', nameVi: 'Phong cách học thuật', emoji: '🎓',
        desc: 'Structured, articulate, like a professor',
        descVi: 'Có cấu trúc, rõ ràng, như giáo sư',
        color: '#8B5CF6', rate: 0.85, pitch: 0.95,
        sentences: [
            { text: 'Research indicates a strong correlation between exercise and cognitive function.', vi: 'Nghiên cứu cho thấy mối tương quan mạnh giữa tập thể dục và chức năng nhận thức.' },
            { text: 'The hypothesis was supported by empirical evidence from multiple studies.', vi: 'Giả thuyết được hỗ trợ bởi bằng chứng thực nghiệm từ nhiều nghiên cứu.' },
            { text: 'In conclusion, further investigation is warranted to validate these findings.', vi: 'Kết luận, cần nghiên cứu thêm để xác nhận các phát hiện này.' },
            { text: 'The methodology employed in this study adheres to established protocols.', vi: 'Phương pháp sử dụng trong nghiên cứu tuân theo quy trình chuẩn.' },
        ],
    },
    {
        id: 'motivational', name: 'Motivational', nameVi: 'Phong cách truyền cảm hứng', emoji: '🔥',
        desc: 'Energetic, passionate, inspiring like TED talks',
        descVi: 'Nhiệt huyết, đam mê, truyền cảm hứng như TED',
        color: '#EF4444', rate: 0.95, pitch: 1.15,
        sentences: [
            { text: "Believe in yourself! You have the power to change the world!", vi: 'Hãy tin vào bản thân! Bạn có sức mạnh thay đổi thế giới!' },
            { text: "Every expert was once a beginner. Keep going!", vi: 'Mọi chuyên gia đều từng là người mới. Tiếp tục nào!' },
            { text: "Don't let fear stop you from chasing your dreams.", vi: 'Đừng để nỗi sợ ngăn bạn theo đuổi ước mơ.' },
            { text: "The only limit is the one you set for yourself.", vi: 'Giới hạn duy nhất là giới hạn bạn tự đặt ra.' },
        ],
    },
    {
        id: 'medical', name: 'Medical', nameVi: 'Phong cách y khoa', emoji: '⚕️',
        desc: 'Clear medical communication, doctor-patient style',
        descVi: 'Giao tiếp y khoa rõ ràng, phong cách bác sĩ-bệnh nhân',
        color: '#0891B2', rate: 0.8, pitch: 1.0,
        sentences: [
            { text: "Your test results look good. Everything is within normal range.", vi: 'Kết quả xét nghiệm tốt. Mọi thứ nằm trong giới hạn bình thường.' },
            { text: "I recommend taking this medication twice daily after meals.", vi: 'Tôi khuyên uống thuốc này hai lần mỗi ngày sau bữa ăn.' },
            { text: "Please schedule a follow-up appointment in two weeks.", vi: 'Vui lòng đặt lịch tái khám sau hai tuần.' },
            { text: "If you experience any side effects, contact us immediately.", vi: 'Nếu có tác dụng phụ, hãy liên hệ chúng tôi ngay.' },
        ],
    },
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

export default function ShadowingSpeaker() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [speakerId, setSpeakerId] = useState(null);
    const [sIdx, setSIdx] = useState(0);
    const [listening, setListening] = useState(false);
    const [spoken, setSpoken] = useState('');
    const [score, setScore] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [results, setResults] = useState([]);
    const [complete, setComplete] = useState(false);

    const speaker = speakerId !== null ? SPEAKERS.find(s => s.id === speakerId) : null;

    const speak = useCallback((text) => {
        if (!speaker) return;
        window.speechSynthesis?.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = speaker.rate;
        u.pitch = speaker.pitch;
        window.speechSynthesis?.speak(u);
    }, [speaker]);

    const startListening = useCallback(() => {
        if (!SpeechRecognition || !speaker) return;
        setSpoken(''); setScore(null);
        const rec = new SpeechRecognition();
        rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = false;
        rec.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setSpoken(transcript);
            const s = getScore(speaker.sentences[sIdx].text, transcript);
            setScore(s);
            if (s >= 70) { addXP(s >= 90 ? 15 : 10); setCelebration(c => c + 1); }
            setResults(prev => [...prev, { text: speaker.sentences[sIdx].text, spoken: transcript, score: s }]);
            setListening(false);
        };
        rec.onerror = () => setListening(false);
        rec.onend = () => setListening(false);
        rec.start();
        setListening(true);
    }, [speaker, sIdx]);

    const next = () => {
        if (sIdx + 1 >= speaker.sentences.length) setComplete(true);
        else { setSIdx(i => i + 1); setSpoken(''); setScore(null); }
    };

    // Speaker selection
    if (!speaker) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                    <h2 className="page-header__title">🎭 Shadowing Practice</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '12px', fontSize: '0.85rem' }}>
                    Chọn phong cách nói để luyện tập shadowing:
                </p>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {SPEAKERS.map(sp => (
                        <button key={sp.id} onClick={() => { setSpeakerId(sp.id); setSIdx(0); setResults([]); setComplete(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '16px', borderRadius: 'var(--radius-lg)',
                                background: `${sp.color}08`, border: `2px solid ${sp.color}30`,
                                cursor: 'pointer', textAlign: 'left',
                            }}>
                            <span style={{ fontSize: '2rem' }}>{sp.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: sp.color }}>{sp.name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{sp.descVi}</div>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: sp.color, fontWeight: 700 }}>{sp.sentences.length} câu</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Results
    if (complete) {
        const avg = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '4rem', marginBottom: '12px' }}>{speaker.emoji}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', color: speaker.color }}>{speaker.name}</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: avg >= 80 ? '#22C55E' : '#F59E0B' }}>{avg}%</p>
                <div style={{ textAlign: 'left', maxWidth: '400px', margin: '12px auto' }}>
                    {results.map((r, i) => (
                        <div key={i} style={{ padding: '8px', borderRadius: 'var(--radius-md)', marginBottom: '4px', background: 'var(--color-card)', borderLeft: `3px solid ${r.score >= 80 ? '#22C55E' : '#F59E0B'}` }}>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{r.text}</div>
                            <div style={{ fontSize: '0.7rem', color: r.score >= 80 ? '#22C55E' : '#EF4444' }}>→ {r.spoken} ({r.score}%)</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '12px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => setSpeakerId(null)}>🎭 Đổi phong cách</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    // Practice
    const sentence = speaker.sentences[sIdx];

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => setSpeakerId(null)}>←</button>
                <h2 className="page-header__title">{speaker.emoji} {speaker.name}</h2>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(sIdx / speaker.sentences.length) * 100}%`, background: speaker.color }} />
                </div>
                <span className="lesson-progress__text">{sIdx + 1}/{speaker.sentences.length}</span>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.6 }}>"{sentence.text}"</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '4px' }}>{sentence.vi}</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                    <button onClick={() => speak(sentence.text)} className="btn btn--primary">🔊 Nghe mẫu</button>
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <button onClick={startListening} disabled={listening}
                    style={{
                        width: '85px', height: '85px', borderRadius: '50%', border: 'none',
                        background: listening ? '#EF4444' : speaker.color,
                        color: 'white', fontSize: '2rem', cursor: 'pointer',
                        boxShadow: listening ? '0 0 0 8px #EF444440' : `0 0 0 8px ${speaker.color}30`,
                        animation: listening ? 'pulse 1.2s infinite' : 'none',
                    }}>
                    {listening ? '⏹️' : '🎙️'}
                </button>
                <p style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    {listening ? '🔴 Đang nghe...' : 'Bấm → Nói giống phong cách mẫu'}
                </p>
            </div>

            {score !== null && (
                <div style={{ textAlign: 'center', padding: '14px', borderRadius: 'var(--radius-lg)', background: `${score >= 80 ? '#22C55E' : '#F59E0B'}10`, border: `2px solid ${score >= 80 ? '#22C55E' : '#F59E0B'}`, margin: '8px 0' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: score >= 80 ? '#22C55E' : '#F59E0B' }}>{score >= 90 ? '🌟' : '👍'} {score}%</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>"{spoken}"</div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
                        {score < 70 && <button className="btn btn--outline" onClick={startListening}>🔄 Lại</button>}
                        <button className="btn btn--primary" onClick={next}>{sIdx + 1 >= speaker.sentences.length ? '📊 Kết quả' : '➡️ Tiếp'}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

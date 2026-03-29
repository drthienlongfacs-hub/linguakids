// SituationalDialogue — Real-life conversation role-play with AI
// User plays one role, AI plays the other — like a 1:1 native teacher
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';
import { speakText } from '../utils/speakText';

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

const SCENARIOS = [
    {
        id: 'restaurant', emoji: '🍽️', title: 'At a Restaurant', titleVi: 'Tại nhà hàng', color: '#EF4444',
        context: 'You are ordering food at a restaurant.',
        contextVi: 'Bạn đang gọi đồ ăn tại nhà hàng.',
        turns: [
            { speaker: 'waiter', text: 'Good evening! Welcome to our restaurant. Table for how many?', vi: 'Chào buổi tối! Chào mừng đến nhà hàng. Bàn cho mấy người?' },
            { speaker: 'you', text: 'Table for two, please.', vi: 'Bàn cho hai người, làm ơn.', hint: 'Table for two' },
            { speaker: 'waiter', text: 'Right this way. Here is the menu. Can I get you something to drink?', vi: 'Mời đi lối này. Đây là menu. Bạn muốn uống gì?' },
            { speaker: 'you', text: 'I would like a glass of water and an orange juice, please.', vi: 'Cho tôi một ly nước và một ly nước cam.', hint: 'water and juice' },
            { speaker: 'waiter', text: 'Are you ready to order your food?', vi: 'Bạn sẵn sàng gọi món chưa?' },
            { speaker: 'you', text: 'Yes, I will have the grilled chicken with salad.', vi: 'Vâng, tôi muốn gà nướng với salad.', hint: 'grilled chicken' },
            { speaker: 'waiter', text: 'Excellent choice! Your order will be ready in about 15 minutes.', vi: 'Lựa chọn tuyệt vời! Món sẽ sẵn sàng trong khoảng 15 phút.' },
        ],
    },
    {
        id: 'doctor', emoji: '🏥', title: 'At the Doctor', titleVi: 'Tại phòng khám', color: '#0891B2',
        context: 'You are visiting a doctor because you feel sick.',
        contextVi: 'Bạn đi khám bác sĩ vì cảm thấy không khỏe.',
        turns: [
            { speaker: 'doctor', text: "Hello! What seems to be the problem today?", vi: 'Xin chào! Hôm nay bạn có vấn đề gì?' },
            { speaker: 'you', text: "I have had a headache and sore throat for three days.", vi: 'Tôi bị đau đầu và đau họng ba ngày rồi.', hint: 'headache, sore throat, three days' },
            { speaker: 'doctor', text: "I see. Do you have any fever or cough?", vi: 'Tôi hiểu. Bạn có sốt hoặc ho không?' },
            { speaker: 'you', text: "Yes, I have a slight fever. About thirty-eight degrees.", vi: 'Có, tôi sốt nhẹ. Khoảng 38 độ.', hint: 'fever, thirty-eight' },
            { speaker: 'doctor', text: "Let me check your throat. It looks like you have the flu. I will prescribe some medicine.", vi: 'Để tôi kiểm tra họng. Có vẻ bạn bị cúm. Tôi sẽ kê thuốc.' },
            { speaker: 'you', text: "Thank you, doctor. How many times should I take the medicine?", vi: 'Cảm ơn bác sĩ. Tôi nên uống thuốc mấy lần?', hint: 'how many times' },
        ],
    },
    {
        id: 'airport', emoji: '✈️', title: 'At the Airport', titleVi: 'Tại sân bay', color: '#6366F1',
        context: 'You are checking in at the airport counter.',
        contextVi: 'Bạn đang check-in tại quầy sân bay.',
        turns: [
            { speaker: 'agent', text: "Good morning. May I see your passport and booking confirmation?", vi: 'Chào buổi sáng. Cho tôi xem hộ chiếu và xác nhận đặt vé?' },
            { speaker: 'you', text: "Here you go. I have a flight to Singapore at ten thirty.", vi: 'Đây ạ. Tôi có chuyến bay đi Singapore lúc 10 rưỡi.', hint: 'flight to Singapore' },
            { speaker: 'agent', text: "Would you like a window or aisle seat?", vi: 'Bạn muốn ghế cửa sổ hay ghế lối đi?' },
            { speaker: 'you', text: "A window seat, please. And can I check in two bags?", vi: 'Ghế cửa sổ, làm ơn. Và tôi có thể ký gửi hai túi không?', hint: 'window seat, two bags' },
            { speaker: 'agent', text: "Your boarding gate is B-twelve. Boarding starts at nine forty-five.", vi: 'Cổng ra máy bay là B-12. Lên máy bay bắt đầu lúc 9:45.' },
            { speaker: 'you', text: "Thank you. Where is the boarding gate?", vi: 'Cảm ơn. Cổng ra máy bay ở đâu?', hint: 'where is the gate' },
        ],
    },
    {
        id: 'hotel', emoji: '🏨', title: 'At the Hotel', titleVi: 'Tại khách sạn', color: '#F59E0B',
        context: 'You are checking into a hotel.',
        contextVi: 'Bạn đang nhận phòng khách sạn.',
        turns: [
            { speaker: 'receptionist', text: "Welcome to Grand Hotel! Do you have a reservation?", vi: 'Chào mừng đến Grand Hotel! Bạn có đặt phòng trước không?' },
            { speaker: 'you', text: "Yes, I booked a room for three nights under my name.", vi: 'Có, tôi đã đặt phòng ba đêm dưới tên tôi.', hint: 'three nights' },
            { speaker: 'receptionist', text: "Your room is on the fifth floor. Breakfast is served from seven to ten.", vi: 'Phòng bạn ở tầng năm. Bữa sáng từ 7 đến 10 giờ.' },
            { speaker: 'you', text: "Is there free wifi in the room? And what is the wifi password?", vi: 'Phòng có wifi miễn phí không? Mật khẩu wifi là gì?', hint: 'free wifi, password' },
        ],
    },
    {
        id: 'shopping', emoji: '🛍️', title: 'Shopping', titleVi: 'Đi mua sắm', color: '#EC4899',
        context: 'You are shopping for clothes.',
        contextVi: 'Bạn đang mua quần áo.',
        turns: [
            { speaker: 'staff', text: "Hi there! Can I help you find something?", vi: 'Xin chào! Tôi có thể giúp bạn tìm gì không?' },
            { speaker: 'you', text: "Yes, I am looking for a blue shirt in size medium.", vi: 'Vâng, tôi đang tìm áo sơ mi xanh cỡ trung bình.', hint: 'blue shirt, medium' },
            { speaker: 'staff', text: "We have this one. Would you like to try it on? The fitting room is over there.", vi: 'Chúng tôi có cái này. Bạn muốn thử không? Phòng thử ở đằng kia.' },
            { speaker: 'you', text: "It fits perfectly. How much does it cost?", vi: 'Vừa vặn lắm. Giá bao nhiêu vậy?', hint: 'how much' },
            { speaker: 'staff', text: "It is twenty-five dollars. Would you like to pay by card or cash?", vi: 'Hai mươi lăm đô la. Bạn muốn trả bằng thẻ hay tiền mặt?' },
            { speaker: 'you', text: "By card, please. Can I have a bag?", vi: 'Bằng thẻ, làm ơn. Cho tôi một túi được không?', hint: 'card, bag' },
        ],
    },
];

function similarity(target, spoken) {
    const t = target.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const s = spoken.toLowerCase().replace(/[^\w\s]/g, '').trim();
    if (t === s) return 100;
    const tWords = t.split(/\s+/); const sWords = s.split(/\s+/);
    const matched = tWords.filter(w => sWords.includes(w)).length;
    return Math.max(0, Math.round((matched / tWords.length) * 100));
}

export default function SituationalDialogue() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [scenarioId, setScenarioId] = useState(null);
    const [turnIdx, setTurnIdx] = useState(0);
    const [listening, setListening] = useState(false);
    const [spoken, setSpoken] = useState('');
    const [score, setScore] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);
    const [totalScore, setTotalScore] = useState(0);
    const [totalTurns, setTotalTurns] = useState(0);

    const scenario = scenarioId ? SCENARIOS.find(s => s.id === scenarioId) : null;

    const speakAI = useCallback((text) => {
        speakText(text, { lang: 'en-US', rate: 0.85 });
    }, []);

    const startListening = useCallback(() => {
        if (!SpeechRecognition || !scenario) return;
        setSpoken(''); setScore(null);
        const rec = new SpeechRecognition();
        rec.lang = 'en-US'; rec.continuous = false; rec.interimResults = false;
        rec.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setSpoken(transcript);
            const turn = scenario.turns[turnIdx];
            const s = similarity(turn.text, transcript);
            setScore(s);
            setTotalScore(prev => prev + s);
            setTotalTurns(prev => prev + 1);
            if (s >= 60) { addXP(s >= 90 ? 15 : 10); setCelebration(c => c + 1); }
            setListening(false);
        };
        rec.onerror = () => setListening(false);
        rec.onend = () => setListening(false);
        rec.start();
        setListening(true);
    }, [scenario, turnIdx]);

    const nextTurn = () => {
        let nextIdx = turnIdx + 1;
        if (nextIdx >= scenario.turns.length) { setComplete(true); return; }
        // Auto-play AI turns
        while (nextIdx < scenario.turns.length && scenario.turns[nextIdx].speaker !== 'you') {
            setTimeout(() => speakAI(scenario.turns[nextIdx].text), 500);
            nextIdx++;
        }
        if (nextIdx >= scenario.turns.length) { setComplete(true); return; }
        setTurnIdx(nextIdx);
        setSpoken(''); setScore(null);
    };

    // Scenario selection
    if (!scenario) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                    <h2 className="page-header__title">🗣️ Role-play 1:1</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '12px' }}>
                    Chọn tình huống để luyện hội thoại 1:1 như giáo viên bản ngữ:
                </p>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {SCENARIOS.map(s => (
                        <button key={s.id} onClick={() => { setScenarioId(s.id); setTurnIdx(0); setComplete(false); setTotalScore(0); setTotalTurns(0); speakAI(s.turns[0]?.text); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '16px', borderRadius: 'var(--radius-lg)',
                                background: `${s.color}08`, border: `2px solid ${s.color}25`,
                                cursor: 'pointer', textAlign: 'left',
                            }}>
                            <span style={{ fontSize: '2rem' }}>{s.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: s.color }}>{s.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{s.contextVi}</div>
                            </div>
                            <span style={{ fontSize: '0.7rem', color: s.color, fontWeight: 700 }}>{s.turns.filter(t => t.speaker === 'you').length} lượt nói</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Complete
    if (complete) {
        const avg = totalTurns ? Math.round(totalScore / totalTurns) : 0;
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '4rem' }}>{scenario.emoji}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>{scenario.title}</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: avg >= 70 ? '#22C55E' : '#F59E0B' }}>{avg}%</p>
                <p style={{ color: 'var(--color-text-light)' }}>Bạn đã hoàn thành hội thoại! 🎉</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => setScenarioId(null)}>🗣️ Tình huống khác</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    const turn = scenario.turns[turnIdx];
    const isUserTurn = turn.speaker === 'you';

    // Auto advance AI turns
    if (!isUserTurn) {
        setTimeout(() => { speakAI(turn.text); nextTurn(); }, 1500);
    }

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => setScenarioId(null)}>←</button>
                <h2 className="page-header__title">{scenario.emoji} {scenario.titleVi}</h2>
            </div>

            {/* Conversation history */}
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                {scenario.turns.slice(0, turnIdx + 1).map((t, i) => (
                    <div key={i} style={{
                        display: 'flex', justifyContent: t.speaker === 'you' ? 'flex-end' : 'flex-start',
                        marginBottom: '6px',
                    }}>
                        <div style={{
                            maxWidth: '80%', padding: '10px 14px', borderRadius: 'var(--radius-lg)',
                            background: t.speaker === 'you' ? 'var(--color-primary)' : 'var(--color-card)',
                            color: t.speaker === 'you' ? 'white' : 'var(--color-text)',
                            fontSize: '0.85rem', lineHeight: 1.5,
                            border: t.speaker !== 'you' ? '1px solid var(--color-border)' : 'none',
                        }}>
                            {i < turnIdx ? t.text : (isUserTurn ? `💬 Your turn: "${t.hint}"` : t.text)}
                        </div>
                    </div>
                ))}
            </div>

            {isUserTurn && (
                <>
                    <div style={{ textAlign: 'center', padding: '12px', background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', marginBottom: '12px', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>💡 Nói:</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{turn.text}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '2px' }}>{turn.vi}</div>
                        <button onClick={() => speakAI(turn.text)} style={{ marginTop: '6px', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.75rem' }}>🔊 Nghe mẫu</button>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <button onClick={startListening} disabled={listening}
                            style={{
                                width: '75px', height: '75px', borderRadius: '50%', border: 'none',
                                background: listening ? '#EF4444' : scenario.color,
                                color: 'white', fontSize: '2rem', cursor: 'pointer',
                                boxShadow: listening ? '0 0 0 6px #EF444440' : `0 0 0 6px ${scenario.color}30`,
                                animation: listening ? 'pulse 1.2s infinite' : 'none',
                            }}>{listening ? '⏹️' : '🎙️'}</button>
                    </div>

                    {score !== null && (
                        <div style={{ textAlign: 'center', padding: '12px', borderRadius: 'var(--radius-lg)', marginTop: '10px', background: `${score >= 70 ? '#22C55E' : '#F59E0B'}10`, border: `2px solid ${score >= 70 ? '#22C55E' : '#F59E0B'}` }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: score >= 70 ? '#22C55E' : '#F59E0B' }}>{score}%</span>
                            <span style={{ fontSize: '0.8rem', marginLeft: '8px' }}>"{spoken}"</span>
                            <div style={{ marginTop: '6px' }}>
                                {score < 60 && <button className="btn btn--outline" onClick={startListening} style={{ marginRight: '6px' }}>🔄 Lại</button>}
                                <button className="btn btn--primary" onClick={nextTurn}>➡️ Tiếp</button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

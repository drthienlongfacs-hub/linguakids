// ConversationTree — Branching dialogue practice with choices
// Like a visual novel but for language learning — empathetic teacher approach
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';
import { speakText } from '../utils/speakText';

const STORIES = [
    {
        id: 'new-friend', title: 'Making a New Friend', titleVi: 'Kết bạn mới', emoji: '🤝', color: '#3B82F6',
        nodes: {
            start: {
                speaker: 'stranger', text: "Hi! I am sitting next to you. Is this seat taken?", vi: 'Xin chào! Tôi ngồi cạnh bạn. Chỗ này có ai chưa?', choices: [
                    { text: "No, please sit down! I am [your name].", next: 'friendly', vi: 'Chưa, mời ngồi! Tôi là [tên bạn].' },
                    { text: "Go ahead. It is free.", next: 'casual', vi: 'Cứ ngồi. Trống mà.' },
                ]
            },
            friendly: {
                speaker: 'stranger', text: "Nice to meet you! I just moved here last week. Do you know any good restaurants around here?", vi: 'Rất vui được gặp! Tôi mới chuyển tới tuần trước. Bạn biết nhà hàng nào ngon gần đây không?', choices: [
                    { text: "Yes! There is an amazing Vietnamese restaurant two blocks away. Would you like to go there together?", next: 'invite', vi: 'Có! Có nhà hàng Việt tuyệt vời cách hai dãy nhà. Bạn muốn đi cùng không?' },
                    { text: "I usually cook at home, but I heard the Italian place on Main Street is nice.", next: 'recommend', vi: 'Tôi thường nấu ở nhà, nhưng nghe nói quán Ý ở Main Street ngon.' },
                ]
            },
            casual: {
                speaker: 'stranger', text: "Thanks! I am new in town. Any tips for someone just arriving?", vi: 'Cảm ơn! Tôi mới tới thành phố. Có lời khuyên gì cho người mới không?', choices: [
                    { text: "The public transport here is really good. You can get anywhere by bus.", next: 'transport', vi: 'Giao thông công cộng ở đây tốt lắm. Bạn có thể đi bus tới mọi nơi.' },
                    { text: "Join the community group on Facebook. People are super helpful there.", next: 'community', vi: 'Tham gia nhóm cộng đồng trên Facebook. Mọi người ở đó rất hay giúp đỡ.' },
                ]
            },
            invite: {
                speaker: 'stranger', text: "That sounds wonderful! I would love that. What time works for you?", vi: 'Nghe tuyệt vời! Mình rất thích. Mấy giờ tiện cho bạn?', choices: [
                    { text: "How about this Saturday at noon? I can show you around the neighborhood too.", next: 'end_great', vi: 'Thứ Bảy trưa nhé? Mình có thể dẫn bạn đi quanh khu này nữa.' },
                ]
            },
            recommend: {
                speaker: 'stranger', text: "That sounds nice! Maybe we can try it together sometime. Can I get your number?", vi: 'Nghe hay! Có thể mình cùng thử bao giờ đó. Cho mình xin số được không?', choices: [
                    { text: "Sure! Here is my number. Just text me anytime you want to hang out.", next: 'end_great', vi: 'Được chứ! Đây là số mình. Nhắn tin bất cứ khi nào muốn đi chơi.' },
                ]
            },
            transport: {
                speaker: 'stranger', text: "Great tip! I was worried about getting around. Is there a monthly pass?", vi: 'Lời khuyên hay! Mình lo lắng về di chuyển. Có vé tháng không?', choices: [
                    { text: "Yes, it costs about thirty dollars a month. You can buy it at any station.", next: 'end_great', vi: 'Có, khoảng 30 đô/tháng. Mua được ở mọi trạm.' },
                ]
            },
            community: {
                speaker: 'stranger', text: "I will definitely join! Thanks for the advice. You are really kind.", vi: 'Chắc chắn mình sẽ tham gia! Cảm ơn lời khuyên. Bạn thật tốt bụng.', choices: [
                    { text: "You are welcome! Welcome to the city. If you need anything, just ask!", next: 'end_great', vi: 'Không có gì! Chào mừng đến thành phố. Cần gì cứ hỏi!' },
                ]
            },
            end_great: { speaker: 'stranger', text: "Thank you so much! You made my day. It is great to meet friendly people like you. See you soon! 😊", vi: 'Cảm ơn rất nhiều! Bạn làm ngày mình vui lên. Thật tuyệt khi gặp người thân thiện như bạn. Hẹn gặp lại! 😊', choices: [] },
        },
    },
    {
        id: 'lost-tourist', title: 'Helping a Lost Tourist', titleVi: 'Giúp du khách lạc đường', emoji: '🗺️', color: '#10B981',
        nodes: {
            start: {
                speaker: 'tourist', text: "Excuse me, I am lost. Can you help me find the train station?", vi: 'Xin lỗi, tôi bị lạc. Bạn có thể giúp tôi tìm ga tàu không?', choices: [
                    { text: "Of course! The station is about a ten-minute walk from here. I can show you the way.", next: 'guide', vi: 'Tất nhiên! Ga tàu cách đây khoảng 10 phút đi bộ. Tôi chỉ đường cho.' },
                    { text: "The station? Let me check on my phone... Yes, go straight and turn left at the traffic light.", next: 'directions', vi: 'Ga tàu? Để tôi xem trên điện thoại... Vâng, đi thẳng rồi rẽ trái ở đèn giao thông.' },
                ]
            },
            guide: {
                speaker: 'tourist', text: "Thank you! You are so kind. By the way, which train goes to the airport?", vi: 'Cảm ơn! Bạn tốt quá. À mà tàu nào đi sân bay vậy?', choices: [
                    { text: "Take the blue line. It is direct to the airport, about forty minutes.", next: 'airport_info', vi: 'Đi tuyến xanh. Đi thẳng ra sân bay, khoảng 40 phút.' },
                    { text: "I am not sure about the exact line, but there are signs inside the station. The staff can help too.", next: 'helpful', vi: 'Tôi không chắc tuyến nào, nhưng bên trong ga có biển chỉ dẫn. Nhân viên cũng giúp được.' },
                ]
            },
            directions: {
                speaker: 'tourist', text: "Go straight and turn left. Got it! Is it far from the traffic light?", vi: 'Đi thẳng rẽ trái. Hiểu rồi! Có xa từ đèn giao thông không?', choices: [
                    { text: "No, just about two hundred meters after the turn. You will see a big sign.", next: 'end_thanks', vi: 'Không, chỉ khoảng 200 mét sau khi rẽ. Bạn sẽ thấy biển lớn.' },
                ]
            },
            airport_info: {
                speaker: 'tourist', text: "Perfect! Do I need to buy the ticket before or can I buy it on the train?", vi: 'Tuyệt! Tôi cần mua vé trước hay có thể mua trên tàu?', choices: [
                    { text: "You should buy it at the ticket machine in the station. You can pay by card or cash.", next: 'end_thanks', vi: 'Bạn nên mua ở máy bán vé trong ga. Có thể trả bằng thẻ hoặc tiền mặt.' },
                ]
            },
            helpful: {
                speaker: 'tourist', text: "Okay, I will ask inside. Thank you for walking me here!", vi: 'Được, tôi sẽ hỏi bên trong. Cảm ơn đã dẫn tôi tới đây!', choices: [
                    { text: "You are welcome! Have a safe trip. Enjoy your time here!", next: 'end_thanks', vi: 'Không có gì! Chúc chuyến đi an toàn. Tận hưởng thời gian ở đây nhé!' },
                ]
            },
            end_thanks: { speaker: 'tourist', text: "You are amazing! I really appreciate your help. I love how friendly people are here. Thank you! 🙏", vi: 'Bạn tuyệt vời! Tôi rất biết ơn sự giúp đỡ. Tôi thích sự thân thiện ở đây. Cảm ơn! 🙏', choices: [] },
        },
    },
    {
        id: 'job-interview', title: 'Job Interview', titleVi: 'Phỏng vấn xin việc', emoji: '💼', color: '#6366F1',
        nodes: {
            start: {
                speaker: 'interviewer', text: "Good morning! Please have a seat. Tell me about yourself.", vi: 'Chào buổi sáng! Mời ngồi. Hãy giới thiệu về bản thân bạn.', choices: [
                    { text: "Thank you. I graduated with a degree in Computer Science and have three years of experience in web development.", next: 'tech', vi: 'Cảm ơn. Tôi tốt nghiệp ngành Khoa học Máy tính và có 3 năm kinh nghiệm phát triển web.' },
                    { text: "I am a marketing professional with five years of experience. I specialize in digital marketing and social media strategy.", next: 'marketing', vi: 'Tôi là chuyên gia marketing với 5 năm kinh nghiệm. Chuyên về digital marketing và chiến lược mạng xã hội.' },
                ]
            },
            tech: {
                speaker: 'interviewer', text: "Impressive! What technologies do you work with?", vi: 'Ấn tượng! Bạn làm việc với những công nghệ nào?', choices: [
                    { text: "I work mainly with React, Node.js, and Python. I also have experience with cloud services like AWS.", next: 'strength', vi: 'Tôi chủ yếu làm React, Node.js và Python. Tôi cũng có kinh nghiệm với dịch vụ đám mây như AWS.' },
                ]
            },
            marketing: {
                speaker: 'interviewer', text: "That sounds great! Can you give me an example of a successful campaign you led?", vi: 'Nghe tuyệt! Bạn có thể cho ví dụ chiến dịch thành công bạn đã dẫn dắt?', choices: [
                    { text: "I led a social media campaign that increased engagement by forty percent and brought in two thousand new customers in three months.", next: 'strength', vi: 'Tôi dẫn dắt chiến dịch MXH tăng tương tác 40% và thu hút 2000 khách mới trong 3 tháng.' },
                ]
            },
            strength: {
                speaker: 'interviewer', text: "Excellent! What would you say is your greatest strength?", vi: 'Xuất sắc! Điểm mạnh lớn nhất của bạn là gì?', choices: [
                    { text: "I am a fast learner and I enjoy solving complex problems. I can adapt quickly to new challenges.", next: 'end_interview', vi: 'Tôi học nhanh và thích giải quyết vấn đề phức tạp. Tôi thích ứng nhanh với thử thách mới.' },
                    { text: "I am a strong communicator. I believe clear communication is the key to successful teamwork.", next: 'end_interview', vi: 'Tôi giao tiếp tốt. Tôi tin rằng giao tiếp rõ ràng là chìa khóa để làm việc nhóm thành công.' },
                ]
            },
            end_interview: { speaker: 'interviewer', text: "Those are great qualities. I am very impressed with your experience. We will get back to you by next week. Thank you for coming in today! 👏", vi: 'Đó là phẩm chất tuyệt vời. Tôi rất ấn tượng với kinh nghiệm của bạn. Chúng tôi sẽ phản hồi tuần tới. Cảm ơn bạn đã đến! 👏', choices: [] },
        },
    },
];

export default function ConversationTree() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [storyId, setStoryId] = useState(null);
    const [nodeId, setNodeId] = useState('start');
    const [history, setHistory] = useState([]);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);

    const story = storyId ? STORIES.find(s => s.id === storyId) : null;

    const speak = useCallback((text) => {
        speakText(text, { lang: 'en-US', rate: 0.85 });
    }, []);

    const handleChoice = (choice) => {
        const node = story.nodes[nodeId];
        setHistory(h => [...h, { speaker: node.speaker, text: node.text }, { speaker: 'you', text: choice.text }]);
        addXP(10); setCelebration(c => c + 1);
        if (choice.next && story.nodes[choice.next]) {
            const nextNode = story.nodes[choice.next];
            setNodeId(choice.next);
            speak(nextNode.text);
            if (nextNode.choices.length === 0) {
                setHistory(h => [...h, { speaker: nextNode.speaker, text: nextNode.text }]);
                setComplete(true);
            }
        }
    };

    // Story selection
    if (!story) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                    <h2 className="page-header__title">🌳 Conversation Tree</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '12px' }}>Chọn tình huống — mỗi lựa chọn dẫn đến kết quả khác nhau:</p>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {STORIES.map(s => (
                        <button key={s.id} onClick={() => { setStoryId(s.id); setNodeId('start'); setHistory([]); setComplete(false); speak(s.nodes.start.text); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '16px', borderRadius: 'var(--radius-lg)',
                                background: `${s.color}08`, border: `2px solid ${s.color}25`,
                                cursor: 'pointer', textAlign: 'left',
                            }}>
                            <span style={{ fontSize: '2rem' }}>{s.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: s.color }}>{s.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{s.titleVi}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Complete
    if (complete) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '30px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '3rem' }}>{story.emoji}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>{story.title} ✅</h2>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem' }}>Bạn hoàn thành hội thoại! +{history.filter(h => h.speaker === 'you').length * 10} XP</p>
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginTop: '12px', textAlign: 'left' }}>
                    {history.map((h, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: h.speaker === 'you' ? 'flex-end' : 'flex-start', marginBottom: '4px' }}>
                            <div style={{
                                maxWidth: '85%', padding: '8px 12px', borderRadius: 'var(--radius-lg)',
                                background: h.speaker === 'you' ? 'var(--color-primary)' : 'var(--color-card)',
                                color: h.speaker === 'you' ? 'white' : 'var(--color-text)', fontSize: '0.8rem',
                                border: h.speaker !== 'you' ? '1px solid var(--color-border)' : 'none',
                            }}>{h.text}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => setStoryId(null)}>🌳 Câu chuyện khác</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    const currentNode = story.nodes[nodeId];

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => setStoryId(null)}>←</button>
                <h2 className="page-header__title">{story.emoji} {story.titleVi}</h2>
            </div>

            {/* Chat history */}
            <div style={{ maxHeight: '180px', overflowY: 'auto', marginBottom: '10px' }}>
                {history.map((h, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: h.speaker === 'you' ? 'flex-end' : 'flex-start', marginBottom: '4px' }}>
                        <div style={{
                            maxWidth: '85%', padding: '8px 12px', borderRadius: 'var(--radius-lg)',
                            background: h.speaker === 'you' ? 'var(--color-primary)' : 'var(--color-card)',
                            color: h.speaker === 'you' ? 'white' : 'var(--color-text)', fontSize: '0.8rem',
                            border: h.speaker !== 'you' ? '1px solid var(--color-border)' : 'none',
                        }}>{h.text}</div>
                    </div>
                ))}
            </div>

            {/* Current prompt */}
            <div style={{ padding: '14px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', border: '1px solid var(--color-border)', marginBottom: '10px' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{currentNode.text}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '4px' }}>{currentNode.vi}</div>
                <button onClick={() => speak(currentNode.text)} style={{ marginTop: '6px', fontSize: '0.7rem', background: story.color, color: 'white', border: 'none', borderRadius: 'var(--radius-full)', padding: '4px 12px', cursor: 'pointer' }}>🔊 Nghe</button>
            </div>

            {/* Choices */}
            <div style={{ display: 'grid', gap: '8px' }}>
                {currentNode.choices.map((choice, i) => (
                    <button key={i} onClick={() => handleChoice(choice)}
                        style={{
                            padding: '12px 14px', borderRadius: 'var(--radius-lg)',
                            background: `${story.color}08`, border: `2px solid ${story.color}25`,
                            cursor: 'pointer', textAlign: 'left', color: 'var(--color-text)',
                        }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{choice.text}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '2px' }}>{choice.vi}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

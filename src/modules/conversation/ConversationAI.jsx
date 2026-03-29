// ConversationAI.jsx — Free-form AI conversation practice
// Uses built-in response templates with contextual matching
// No external AI API needed — smart pattern-matching conversation engine

import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { isAdultMode } from '../../utils/userMode';
import CapabilityNotice from '../../components/CapabilityNotice';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';

const SCENARIOS = [
    {
        id: 'restaurant', emoji: '🍽️', title: 'At a Restaurant', titleVi: 'Tại nhà hàng', lang: 'en',
        systemPrompt: 'You are a friendly waiter at a popular restaurant.',
        starter: "Welcome! I'll be your server today. Would you like to see the menu or do you already know what you'd like?",
        vocabulary: ['menu', 'order', 'appetizer', 'main course', 'dessert', 'bill', 'tip', 'reservation', 'recommend', 'vegetarian'],
        responses: [
            { triggers: ['menu', 'see'], reply: "Of course! Here's our menu. We have pasta, steak, grilled salmon, and a wonderful Caesar salad. Any allergies I should know about?" },
            { triggers: ['recommend', 'suggest', 'what do you'], reply: "I'd recommend our grilled salmon — it's our chef's special today! It comes with roasted vegetables and lemon butter sauce." },
            { triggers: ['order', 'like', 'have', 'want', 'get'], reply: "Great choice! Would you like anything to drink with that? We have fresh juices, coffee, and a selection of wines." },
            { triggers: ['drink', 'water', 'juice', 'coffee', 'wine'], reply: "Perfect! I'll bring that right out. Would you also like to start with an appetizer? Our soup of the day is tomato bisque." },
            { triggers: ['bill', 'check', 'pay'], reply: "Of course! Your total comes to $35.50. Would you like to pay by card or cash?" },
            { triggers: ['dessert', 'sweet'], reply: "We have tiramisu, chocolate lava cake, and fresh fruit. The tiramisu is absolutely delicious!" },
            { triggers: ['thank', 'thanks'], reply: "You're welcome! It was my pleasure serving you. Have a wonderful evening! 😊" },
            { triggers: ['allerg', 'vegetarian', 'vegan', 'gluten'], reply: "Absolutely, we can accommodate that! We have several vegetarian options, and our chef can modify most dishes. Let me highlight those for you." },
            { triggers: ['wait', 'long', 'time'], reply: "I apologize for the wait. Your food should be ready in about 10 minutes. Can I get you some bread while you wait?" },
            { triggers: ['reservation', 'book', 'table'], reply: "I can help with that! For how many people and what date? We have availability this Friday evening." },
        ],
    },
    {
        id: 'airport', emoji: '✈️', title: 'At the Airport', titleVi: 'Tại sân bay', lang: 'en',
        systemPrompt: 'You are a helpful airport check-in agent.',
        starter: "Good morning! Welcome to the check-in counter. May I see your passport and booking confirmation, please?",
        vocabulary: ['boarding pass', 'gate', 'luggage', 'carry-on', 'delay', 'terminal', 'customs', 'immigration', 'aisle seat', 'window seat'],
        responses: [
            { triggers: ['passport', 'booking', 'here', 'yes'], reply: "Thank you! I can see your flight to London, departing at 2:30 PM from Gate B12. Would you like an aisle seat or window seat?" },
            { triggers: ['window', 'aisle', 'seat'], reply: "Done! I've assigned you seat 14A by the window. Do you have any checked luggage today?" },
            { triggers: ['luggage', 'bag', 'suitcase', 'check'], reply: "Please place your bag on the scale. It's 22 kg — within the limit. Here's your luggage tag. Anything else?" },
            { triggers: ['gate', 'where', 'terminal'], reply: "Your gate is B12, in Terminal 2. Go through security, turn right, and it's about a 10-minute walk. Boarding starts at 2:00 PM." },
            { triggers: ['delay', 'late', 'cancel', 'time'], reply: "Let me check... Your flight is currently on schedule. However, I'd recommend being at the gate by 2:00 PM for boarding." },
            { triggers: ['upgrade', 'business', 'first'], reply: "Let me check availability... There is one business class seat available for an additional $350. Would you like to upgrade?" },
            { triggers: ['wifi', 'lounge', 'food'], reply: "Free Wi-Fi is available throughout the terminal. There's a food court near Gate B10, and the business lounge is on the upper level." },
            { triggers: ['thank', 'thanks'], reply: "You're welcome! Have a wonderful flight. Your gate is B12 — enjoy! ✈️" },
        ],
    },
    {
        id: 'doctor', emoji: '🏥', title: 'Doctor Visit', titleVi: 'Khám bệnh', lang: 'en',
        systemPrompt: 'You are a friendly doctor at a clinic.',
        starter: "Hello! I'm Dr. Smith. Please have a seat. What brings you in today?",
        vocabulary: ['symptoms', 'headache', 'fever', 'prescription', 'medicine', 'appointment', 'check-up', 'blood test', 'diagnosis', 'recovery'],
        responses: [
            { triggers: ['headache', 'head', 'pain', 'hurt'], reply: "I see. How long have you been having these headaches? Are they on one side or both sides? Any other symptoms like nausea or sensitivity to light?" },
            { triggers: ['fever', 'temperature', 'hot', 'cold', 'chill'], reply: "Let me take your temperature... It's 38.2°C — a mild fever. Have you been feeling any body aches or fatigue along with it?" },
            { triggers: ['cough', 'throat', 'sore'], reply: "Open your mouth and say 'aah'. Your throat looks a bit red. How long has the cough been going on? Is it dry or productive?" },
            { triggers: ['stomach', 'nausea', 'vomit', 'digest'], reply: "I understand. Have you eaten anything unusual recently? Let me examine your abdomen. Any pain when I press here?" },
            { triggers: ['medicine', 'prescri', 'drug', 'pill'], reply: "I'll prescribe some ibuprofen for the pain and recommend rest. Take it twice daily with food. If symptoms persist after 3 days, come back." },
            { triggers: ['test', 'blood', 'check'], reply: "I think a blood test would be helpful. I'll order a complete blood count. You can go to the lab on the 2nd floor. Results will be ready tomorrow." },
            { triggers: ['day', 'week', 'long', 'since', 'yesterday'], reply: "I see. Given the duration, I'd like to run a few tests to be thorough. It's likely nothing serious, but better to be safe." },
            { triggers: ['thank', 'thanks'], reply: "You're welcome! Remember to drink plenty of fluids and rest. I'll see you for a follow-up next week. Take care! 😊" },
        ],
    },
    {
        id: 'interview', emoji: '💼', title: 'Job Interview', titleVi: 'Phỏng vấn xin việc', lang: 'en',
        systemPrompt: 'You are a hiring manager conducting a job interview.',
        starter: "Hello! Thank you for coming in today. Please, have a seat. Shall we begin? Could you tell me a little about yourself?",
        vocabulary: ['experience', 'qualifications', 'teamwork', 'leadership', 'salary', 'strengths', 'weaknesses', 'motivated', 'deadline', 'responsibilities'],
        responses: [
            { triggers: ['experience', 'work', 'job', 'year', 'company'], reply: "Interesting background! What would you say was your biggest achievement in your previous role?" },
            { triggers: ['achieve', 'accomplish', 'success', 'project'], reply: "That's impressive! Can you tell me about a time you faced a challenge at work and how you handled it?" },
            { triggers: ['challenge', 'difficult', 'problem', 'solve'], reply: "Great problem-solving approach! What are your greatest strengths that you'd bring to this position?" },
            { triggers: ['strength', 'good at', 'skill', 'best'], reply: "Those are valuable qualities! Now, what would you say is an area you're working on improving?" },
            { triggers: ['weakness', 'improve', 'working on', 'learn'], reply: "I appreciate your honesty! Where do you see yourself in five years?" },
            { triggers: ['five year', 'future', 'goal', 'career', 'grow'], reply: "That's a great vision! Do you have any questions about the position or our company?" },
            { triggers: ['salary', 'pay', 'compensation', 'benefit'], reply: "The salary range for this position is $55,000-$70,000, depending on experience. We also offer health insurance, 20 vacation days, and a 401(k) match." },
            { triggers: ['question', 'ask', 'know', 'curious'], reply: "Great questions! We'll be in touch within a week. Thank you so much for your time today — it was wonderful meeting you!" },
            { triggers: ['team', 'collaborat', 'together'], reply: "Teamwork is very important here! We work in cross-functional teams. How would you describe your collaboration style?" },
            { triggers: ['thank', 'thanks', 'pleasure'], reply: "The pleasure is mine! We'll review all candidates this week and get back to you. Best of luck! 🤝" },
        ],
    },
    {
        id: 'hotel', emoji: '🏨', title: 'Hotel Check-in', titleVi: 'Nhận phòng khách sạn', lang: 'en',
        systemPrompt: 'You are a hotel receptionist.',
        starter: "Good evening! Welcome to the Grand Hotel. Do you have a reservation with us?",
        vocabulary: ['reservation', 'check-in', 'check-out', 'room service', 'suite', 'single', 'double', 'breakfast', 'wake-up call', 'parking'],
        responses: [
            { triggers: ['reservation', 'book', 'yes', 'name'], reply: "Let me look that up... Yes, I found it! A double room for 3 nights. Your room is 507 on the 5th floor. Here's your key card." },
            { triggers: ['no reserv', 'walk-in', 'available', 'room'], reply: "Let me check availability. We have a deluxe double room available at $120/night, and a suite at $200/night. Which would you prefer?" },
            { triggers: ['breakfast', 'meal', 'food', 'restaurant'], reply: "Breakfast is included! It's served in the restaurant on the ground floor from 6:30 to 10:00 AM. We also have 24-hour room service." },
            { triggers: ['wifi', 'internet', 'password'], reply: "Free WiFi is available throughout the hotel. The network is 'GrandHotel' and the password is on your key card holder." },
            { triggers: ['check-out', 'leave', 'time'], reply: "Check-out is at 11:00 AM. If you need a late check-out, we can extend to 1:00 PM for a small fee. Just let us know!" },
            { triggers: ['pool', 'gym', 'spa', 'facility'], reply: "The pool and gym are on the 2nd floor, open 6 AM to 10 PM. The spa offers massages by appointment. Shall I book one?" },
            { triggers: ['thank', 'thanks'], reply: "You're welcome! Enjoy your stay. If you need anything, dial 0 on the room phone. Have a wonderful evening! ✨" },
        ],
    },
];

function findBestResponse(userInput, scenario) {
    const input = userInput.toLowerCase();
    let best = null;
    let bestScore = 0;

    for (const r of scenario.responses) {
        const score = r.triggers.reduce((acc, t) => acc + (input.includes(t) ? 1 : 0), 0);
        if (score > bestScore) { bestScore = score; best = r; }
    }

    if (best && bestScore > 0) return best.reply;

    // Fallback generic responses
    const fallbacks = [
        "That's interesting! Could you tell me more?",
        "I understand. Is there anything else I can help you with?",
        "Sure! Let me help you with that.",
        "Great question! Let me think about that for a moment...",
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

export default function ConversationAI() {
    const navigate = useNavigate();
    const { state, dispatch } = useGame();
    const adult = isAdultMode(state.userMode);
    const { readiness } = useDeviceCapabilities();

    const [selectedScenario, setSelectedScenario] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const startScenario = useCallback((scenario) => {
        setSelectedScenario(scenario);
        setMessages([{
            role: 'ai',
            text: scenario.starter,
            time: new Date(),
        }]);
        setTimeout(() => inputRef.current?.focus(), 300);
    }, []);

    const sendMessage = useCallback(() => {
        if (!input.trim() || !selectedScenario) return;

        const userMsg = { role: 'user', text: input.trim(), time: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate typing delay
        const delay = 500 + Math.random() * 1000;
        setTimeout(() => {
            const reply = findBestResponse(userMsg.text, selectedScenario);
            setMessages(prev => [...prev, { role: 'ai', text: reply, time: new Date() }]);
            setIsTyping(false);
            dispatch({ type: 'ADD_XP', payload: 3 });
        }, delay);
    }, [input, selectedScenario, dispatch]);

    // Scenario selection screen
    if (!selectedScenario) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate(-1)}>←</button>
                    <h2 className="page-header__title">💬 {adult ? 'AI Conversation' : 'Hội thoại AI'}</h2>
                </div>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: '20px' }}>
                    {adult ? 'Choose a real-life scenario to practice speaking:' : 'Chọn tình huống thực tế để luyện nói:'}
                </p>
                <CapabilityNotice
                    icon="🧭"
                    title="Conversation engine status"
                    badge={readiness.conversation.badge}
                    tone="info"
                    summary={readiness.conversation.summary}
                />
                <div style={{ display: 'grid', gap: '10px' }}>
                    {SCENARIOS.map(s => (
                        <div key={s.id} className="glass-card" onClick={() => startScenario(s)}
                            style={{ padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'transform 0.2s' }}>
                            <div style={{ fontSize: '2rem' }}>{s.emoji}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{adult ? s.title : s.titleVi}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                    {s.vocabulary.slice(0, 5).join(' · ')}
                                </div>
                            </div>
                            <span style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>▶</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Chat interface
    return (
        <div className="page" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', padding: '0' }}>
            {/* Chat header */}
            <div style={{
                padding: '12px 16px', background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
                <button onClick={() => { setSelectedScenario(null); setMessages([]); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
                <div style={{ fontSize: '1.5rem' }}>{selectedScenario.emoji}</div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{adult ? selectedScenario.title : selectedScenario.titleVi}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-light)' }}>{selectedScenario.systemPrompt}</div>
                </div>
            </div>

            {/* Vocabulary helper */}
            <div style={{
                padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                display: 'flex', gap: '6px', flexWrap: 'wrap', overflowX: 'auto',
            }}>
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', whiteSpace: 'nowrap' }}>Key words:</span>
                {selectedScenario.vocabulary.map((v, i) => (
                    <button key={i} onClick={() => setInput(prev => prev + (prev ? ' ' : '') + v)}
                        style={{
                            padding: '2px 8px', borderRadius: '6px', fontSize: '0.65rem',
                            background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
                            color: '#A5B4FC', cursor: 'pointer', whiteSpace: 'nowrap',
                        }}>{v}</button>
                ))}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
                {messages.map((msg, i) => (
                    <div key={i} style={{
                        display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '10px',
                    }}>
                        <div style={{
                            maxWidth: '80%', padding: '10px 14px', borderRadius: '16px',
                            background: msg.role === 'user'
                                ? 'linear-gradient(135deg, #6366F1, #818CF8)'
                                : 'var(--color-container-bg)',
                            color: msg.role === 'user' ? '#fff' : 'var(--color-text)',
                            fontSize: '0.88rem', lineHeight: 1.6,
                            borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                            borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                        }}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div style={{ display: 'flex', marginBottom: '10px' }}>
                        <div style={{
                            padding: '10px 18px', borderRadius: '16px', borderBottomLeftRadius: '4px',
                            background: 'var(--color-container-bg)', fontSize: '0.88rem',
                        }}>
                            <span className="typing-dots">
                                <span style={{ animationDelay: '0s' }}>•</span>
                                <span style={{ animationDelay: '0.2s' }}>•</span>
                                <span style={{ animationDelay: '0.4s' }}>•</span>
                            </span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div style={{
                padding: '12px 16px', background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)',
                borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px',
            }}>
                <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder={adult ? "Type your response..." : "Nhập câu trả lời..."}
                    style={{
                        flex: 1, padding: '10px 16px', borderRadius: '12px',
                        border: '1px solid var(--color-input-border)', background: 'var(--color-input-bg)',
                        color: 'var(--color-input-text)', fontSize: '0.9rem', outline: 'none',
                    }}
                />
                <button onClick={sendMessage}
                    disabled={!input.trim()}
                    style={{
                        padding: '10px 18px', borderRadius: '12px', border: 'none',
                        background: input.trim() ? 'var(--color-primary)' : 'var(--color-input-bg)',
                        color: '#fff', fontSize: '1rem', cursor: input.trim() ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                    }}>
                    ➤
                </button>
            </div>

            <style>{`
                .typing-dots span {
                    display: inline-block;
                    animation: typingBounce 1.2s infinite;
                    color: var(--color-text-light);
                    font-size: 1.2rem;
                }
                @keyframes typingBounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-4px); }
                }
            `}</style>
        </div>
    );
}

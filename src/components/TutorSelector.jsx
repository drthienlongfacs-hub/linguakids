// TutorSelector.jsx — Track D: Character/Mascot System
// 3 AI tutor personalities inspired by Khan Kids character system
// Each mascot has unique personality, speech patterns, and specialization

import { useState, useCallback } from 'react';
import { isAdultMode } from '../utils/userMode';

const TUTORS = [
    {
        id: 'milo',
        name: 'Milo',
        emoji: '🐻',
        personality: 'Patient & Warm',
        personalityVi: 'Kiên nhẫn & Ấm áp',
        specialization: 'Phonics, Early Reading',
        specializationVi: 'Ngữ âm, Đọc sớm',
        description: 'Perfect for beginners! Milo speaks slowly, uses simple words, and gives lots of encouragement.',
        descriptionVi: 'Hoàn hảo cho người mới! Milo nói chậm rãi, dùng từ đơn giản và động viên rất nhiều.',
        color: '#D97706',
        bgGradient: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
        voiceRate: 0.85,
        greeting: "Hi there! I'm Milo 🐻 I'll help you learn step by step. Don't worry, we'll go at your pace!",
        greetingVi: "Xin chào! Mình là Milo 🐻 Mình sẽ giúp bạn học từng bước. Đừng lo, mình đi theo nhịp của bạn!",
        encouragements: [
            "Great job! You're doing amazing! 🌟",
            "That's wonderful! Keep it up! ✨",
            "I'm so proud of you! 🎉",
            "You're getting better every day! 💪",
        ],
        encouragementsVi: [
            "Giỏi lắm! Bạn làm tuyệt vời! 🌟",
            "Thật tuyệt! Cố lên nào! ✨",
            "Mình rất tự hào về bạn! 🎉",
            "Bạn tiến bộ mỗi ngày! 💪",
        ],
        corrections: [
            "Almost! Let me help you with that...",
            "That's okay! Let's try again together.",
            "Good try! Here's a little hint...",
        ],
        correctionsVi: [
            "Gần đúng rồi! Để mình giúp bạn nhé...",
            "Không sao! Mình thử lại cùng nhau nha.",
            "Cố gắng tốt lắm! Đây là gợi ý nhỏ...",
        ],
    },
    {
        id: 'luna',
        name: 'Luna',
        emoji: '🦊',
        personality: 'Creative & Playful',
        personalityVi: 'Sáng tạo & Vui nhộn',
        specialization: 'Speaking, Conversation',
        specializationVi: 'Nói, Hội thoại',
        description: 'Fun and energetic! Luna loves creative topics, casual chat, and making learning feel like play.',
        descriptionVi: 'Vui nhộn và năng động! Luna thích chủ đề sáng tạo, trò chuyện thoải mái.',
        color: '#EA580C',
        bgGradient: 'linear-gradient(135deg, #FED7AA, #FDBA74)',
        voiceRate: 1.0,
        greeting: "Hey hey! 🦊 I'm Luna! Let's have some fun learning together. What do you want to talk about?",
        greetingVi: "Hey hey! 🦊 Mình là Luna! Cùng học vui nào. Bạn muốn nói về gì?",
        encouragements: [
            "Awesome sauce! You nailed it! 🔥",
            "Woohoo! That was amazing! 🚀",
            "You're on fire today! 🌈",
            "Look at you go! Super cool! 😎",
        ],
        encouragementsVi: [
            "Tuyệt cú mèo! Bạn làm chuẩn luôn! 🔥",
            "Woohoo! Quá đỉnh! 🚀",
            "Hôm nay bạn xuất sắc lắm! 🌈",
            "Nhìn bạn kìa! Siêu ngầu! 😎",
        ],
        corrections: [
            "Oops! Not quite, but nice try! Let's fix it!",
            "Hmm, close! Here's the fun part — learning from mistakes!",
            "No worries! Everyone stumbles. Let's try a different way!",
        ],
        correctionsVi: [
            "Oops! Chưa đúng lắm, nhưng cố gắng tốt! Sửa nhé!",
            "Hmm, gần đúng! Phần vui nhất — học từ sai lầm!",
            "Không sao! Ai cũng vậy. Thử cách khác nha!",
        ],
    },
    {
        id: 'max',
        name: 'Max',
        emoji: '🦉',
        personality: 'Challenging & Wise',
        personalityVi: 'Thử thách & Thông thái',
        specialization: 'Grammar, Advanced',
        specializationVi: 'Ngữ pháp, Nâng cao',
        description: 'Ready for a challenge? Max uses complex sentences, pushes deeper, and helps you reach new heights.',
        descriptionVi: 'Sẵn sàng thử thách? Max dùng câu phức tạp, đẩy xa hơn, giúp bạn vươn cao.',
        color: '#7C3AED',
        bgGradient: 'linear-gradient(135deg, #DDD6FE, #C4B5FD)',
        voiceRate: 0.95,
        greeting: "Greetings, learner! 🦉 I'm Max. I'll challenge you to think deeper and express yourself precisely. Shall we begin?",
        greetingVi: "Chào người học! 🦉 Mình là Max. Mình sẽ thử thách bạn suy nghĩ sâu hơn. Bắt đầu nhé?",
        encouragements: [
            "Excellent analysis! Your reasoning is impressive. 🧠",
            "Well articulated! That shows real understanding. 📚",
            "Precisely! You're developing strong language skills. 🎯",
            "Remarkable progress! You're ready for the next level. 🏅",
        ],
        encouragementsVi: [
            "Phân tích xuất sắc! Lập luận ấn tượng lắm. 🧠",
            "Diễn đạt rất tốt! Cho thấy hiểu biết thật sự. 📚",
            "Chính xác! Kỹ năng ngôn ngữ phát triển mạnh. 🎯",
            "Tiến bộ vượt bậc! Sẵn sàng cho level tiếp theo. 🏅",
        ],
        corrections: [
            "Interesting attempt. Consider this perspective...",
            "Almost there. Let's refine your approach.",
            "A common mistake. Here's the grammatical rule...",
        ],
        correctionsVi: [
            "Cách tiếp cận thú vị. Hãy xem xét góc nhìn này...",
            "Gần đúng rồi. Hãy tinh chỉnh cách tiếp cận.",
            "Lỗi phổ biến. Đây là quy tắc ngữ pháp...",
        ],
    },
];

export { TUTORS };

export default function TutorSelector({ currentTutorId, onSelect, isAdult = false }) {
    const [expanded, setExpanded] = useState(false);
    const currentTutor = TUTORS.find(t => t.id === currentTutorId) || TUTORS[0];

    const handleSelect = useCallback((tutor) => {
        onSelect?.(tutor);
        setExpanded(false);
    }, [onSelect]);

    // Compact mode: show current tutor as pill
    if (!expanded) {
        return (
            <button onClick={() => setExpanded(true)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '4px 10px', borderRadius: '20px',
                    border: `2px solid ${currentTutor.color}`,
                    background: `${currentTutor.color}15`, cursor: 'pointer',
                    fontSize: '0.78rem', fontWeight: 600, color: currentTutor.color,
                    transition: 'all 0.2s',
                }}>
                <span>{currentTutor.emoji}</span>
                <span>{currentTutor.name}</span>
                <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>▼</span>
            </button>
        );
    }

    // Expanded mode: show all tutors
    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9998,
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.15s ease',
        }} onClick={() => setExpanded(false)}>
            <div style={{
                width: 'min(90vw, 400px)', background: 'var(--color-card)', borderRadius: '20px',
                padding: '20px', boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
                animation: 'slideDown 0.2s ease',
            }} onClick={e => e.stopPropagation()}>
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                        {isAdult ? 'Choose Your Tutor' : 'Chọn Gia Sư'}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
                        {isAdult ? 'Each tutor has a unique teaching style' : 'Mỗi gia sư có phong cách dạy riêng'}
                    </p>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                    {TUTORS.map(tutor => {
                        const isActive = tutor.id === currentTutorId;
                        return (
                            <div key={tutor.id} onClick={() => handleSelect(tutor)}
                                style={{
                                    padding: '14px', borderRadius: '14px', cursor: 'pointer',
                                    background: isActive ? tutor.bgGradient : 'var(--color-bg)',
                                    border: isActive ? `2px solid ${tutor.color}` : '1px solid var(--color-border)',
                                    transition: 'all 0.2s', display: 'flex', gap: '12px', alignItems: 'flex-start',
                                }}>
                                {/* Avatar */}
                                <div style={{
                                    fontSize: '2.2rem', width: '48px', height: '48px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '50%', background: isActive ? '#fff' : tutor.bgGradient,
                                    flexShrink: 0, boxShadow: isActive ? `0 2px 8px ${tutor.color}33` : 'none',
                                }}>
                                    {tutor.emoji}
                                </div>
                                {/* Info */}
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{tutor.name}</span>
                                        {isActive && <span style={{
                                            padding: '1px 6px', borderRadius: '6px', fontSize: '0.55rem',
                                            background: tutor.color, color: '#fff', fontWeight: 700,
                                        }}>ACTIVE</span>}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: tutor.color, fontWeight: 600, marginTop: '2px' }}>
                                        {isAdult ? tutor.personality : tutor.personalityVi} · {isAdult ? tutor.specialization : tutor.specializationVi}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '4px', lineHeight: 1.4 }}>
                                        {isAdult ? tutor.description : tutor.descriptionVi}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}

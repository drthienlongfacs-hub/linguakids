import { useState, useEffect } from 'react';

const EXPRESSIONS = ['🐼', '🐼'];
const SPEECH_BUBBLES = [
    'Chào bạn nhỏ! Hôm nay mình học gì nào? 🎉',
    'Bạn giỏi lắm! Tiếp tục nào! 💪',
    'Mỗi ngày một chút, giỏi hơn rất nhiều! ✨',
    'Wow, bạn thật tuyệt vời! 🌟',
    'Cùng khám phá ngôn ngữ mới nhé! 🚀',
    'Bạn là ngôi sao sáng nhất! ⭐',
];

export default function MascotBuddy({ message, mood = 'happy' }) {
    const [currentSpeech, setCurrentSpeech] = useState(
        message || SPEECH_BUBBLES[0]
    );
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (message) {
            setCurrentSpeech(message);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 500);
        }
    }, [message]);

    const randomSpeech = () => {
        const idx = Math.floor(Math.random() * SPEECH_BUBBLES.length);
        setCurrentSpeech(SPEECH_BUBBLES[idx]);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 500);
    };

    return (
        <div className="mascot" onClick={randomSpeech} style={{ cursor: 'pointer' }}>
            <div className={`mascot__character ${isAnimating ? 'animate-pop-in' : ''}`}>
                🐼
            </div>
            <div className={`mascot__speech ${isAnimating ? 'animate-pop-in' : ''}`}>
                {currentSpeech}
            </div>
        </div>
    );
}

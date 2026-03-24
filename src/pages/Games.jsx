import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

const SECTIONS = [
    {
        title: '🎤 Luyện câu giao tiếp (300+ câu)',
        desc: 'Nghe → Nói theo → Phân tích từng từ kiểu ELSA!',
        items: [
            { id: 'phrases-en', title: '🎤 300+ câu Tiếng Anh', desc: '20 chủ đề giao tiếp thực tế', emoji: '🇬🇧', path: '/phrases/en' },
            { id: 'phrases-cn', title: '🎤 300+ câu Tiếng Trung', desc: '20 chủ đề giao tiếp thực tế', emoji: '🇨🇳', path: '/phrases/cn' },
        ],
    },
    {
        title: '📖 Truyện tương tác',
        desc: 'Đọc, nghe và nói theo câu chuyện',
        items: [
            { id: 'story-en', title: '📖 Truyện Tiếng Anh', desc: 'The Lost Puppy, The Magic Garden...', emoji: '📚', path: '/stories/en' },
            { id: 'story-cn', title: '📖 Truyện Tiếng Trung', desc: '小猫咪 — Chú mèo nhỏ...', emoji: '🐉', path: '/stories/cn' },
        ],
    },
    {
        title: '💬 Hội thoại & Luyện nói',
        desc: 'Role-play tình huống thực tế',
        items: [
            { id: 'conv-en', title: '💬 Hội thoại Tiếng Anh', desc: 'Gặp bạn, nhà hàng, trường học...', emoji: '🗣️', path: '/conversations/en' },
            { id: 'conv-cn', title: '💬 Hội thoại Tiếng Trung', desc: 'Gặp bạn, đồ ăn, gia đình...', emoji: '🐲', path: '/conversations/cn' },
        ],
    },
    {
        title: '✍️ Viết & Ghép câu',
        desc: 'Luyện viết chữ và xây dựng câu',
        items: [
            { id: 'stroke', title: '✍️ Viết chữ Hán', desc: '20 chữ cơ bản — viết bằng ngón tay', emoji: '🖊️', path: '/game/stroke' },
            { id: 'sentence-en', title: '📝 Ghép câu Tiếng Anh', desc: 'Sắp xếp từ thành câu', emoji: '🧩', path: '/game/sentence/en' },
            { id: 'sentence-cn', title: '📝 Ghép câu Tiếng Trung', desc: 'Xếp chữ Hán thành câu', emoji: '🀄', path: '/game/sentence/cn' },
        ],
    },
    {
        title: '🎮 Trò chơi ôn tập',
        desc: 'Luyện từ vựng qua trò chơi',
        items: [
            { id: 'quiz-en', title: '🧠 Đố Vui 🇬🇧', desc: 'Nghe và chọn đáp án', emoji: '🎯', path: '/game/quiz/en' },
            { id: 'quiz-cn', title: '🧠 Đố Vui 🇨🇳', desc: 'Nghe và chọn chữ Hán', emoji: '🎧', path: '/game/quiz/cn' },
            { id: 'memory-en', title: '🃏 Lật Thẻ 🇬🇧', desc: 'Ghép từ với hình ảnh', emoji: '🃏', path: '/game/memory/en' },
            { id: 'memory-cn', title: '🃏 Lật Thẻ 🇨🇳', desc: 'Ghép chữ Hán với hình', emoji: '🀄', path: '/game/memory/cn' },
        ],
    },
];

export default function Games() {
    const navigate = useNavigate();
    const { state } = useGame();

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">🎮 Học & Chơi</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {SECTIONS.map((section, si) => (
                <div key={si} style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '4px' }}>
                        {section.title}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                        {section.desc}
                    </p>
                    {section.items.map((game, i) => (
                        <div
                            key={game.id}
                            className={`game-card animate-slide-up delay-${(i % 5) + 1}`}
                            onClick={() => navigate(game.path)}
                        >
                            <div className="game-card__icon">{game.emoji}</div>
                            <div className="game-card__info">
                                <div className="game-card__title">{game.title}</div>
                                <div className="game-card__desc">{game.desc}</div>
                            </div>
                            <div style={{ fontSize: '1.3rem', color: 'var(--color-text-light)' }}>▶️</div>
                        </div>
                    ))}
                </div>
            ))}

            <div style={{
                textAlign: 'center', padding: '16px', background: 'white',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
                    Đã chơi: {state.gamesPlayed} · Tuyệt đối: {state.perfectQuizzes} 💯
                </p>
            </div>
        </div>
    );
}

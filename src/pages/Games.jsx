import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

const GAMES = [
    {
        id: 'conv-en',
        title: '💬 Hội thoại Tiếng Anh',
        desc: 'Nói chuyện theo tình huống thực tế (ELSA style)',
        emoji: '🗣️',
        path: '/conversations/en',
    },
    {
        id: 'conv-cn',
        title: '💬 Hội thoại Tiếng Trung',
        desc: 'Luyện nói tiếng Trung giao tiếp',
        emoji: '🐲',
        path: '/conversations/cn',
    },
    {
        id: 'sentence-en',
        title: '📝 Ghép câu Tiếng Anh',
        desc: 'Sắp xếp từ thành câu hoàn chỉnh',
        emoji: '🧩',
        path: '/game/sentence/en',
    },
    {
        id: 'sentence-cn',
        title: '📝 Ghép câu Tiếng Trung',
        desc: 'Xếp chữ Hán thành câu đúng',
        emoji: '🀄',
        path: '/game/sentence/cn',
    },
    {
        id: 'quiz-en',
        title: '🧠 Đố Vui Tiếng Anh',
        desc: 'Nghe và chọn đáp án đúng',
        emoji: '🎯',
        path: '/game/quiz/en',
    },
    {
        id: 'quiz-cn',
        title: '🧠 Đố Vui Tiếng Trung',
        desc: 'Nghe và chọn chữ Hán đúng',
        emoji: '🎧',
        path: '/game/quiz/cn',
    },
    {
        id: 'memory-en',
        title: '🃏 Lật Thẻ Nhớ 🇬🇧',
        desc: 'Ghép từ tiếng Anh với hình ảnh',
        emoji: '🃏',
        path: '/game/memory/en',
    },
    {
        id: 'memory-cn',
        title: '🃏 Lật Thẻ Nhớ 🇨🇳',
        desc: 'Ghép chữ Hán với hình ảnh',
        emoji: '🀄',
        path: '/game/memory/cn',
    },
];

export default function Games() {
    const navigate = useNavigate();
    const { state } = useGame();

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">🎮 Trò chơi & Luyện tập</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <p style={{
                textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '20px',
                fontFamily: 'var(--font-display)', fontSize: '1.05rem',
            }}>
                Vừa chơi vừa học — vui lắm nè! 🎉
            </p>

            {GAMES.map((game, i) => (
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

            <div style={{
                marginTop: '24px', textAlign: 'center', padding: '16px',
                background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)',
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem' }}>
                    Đã chơi: {state.gamesPlayed} trận · Tuyệt đối: {state.perfectQuizzes} lần 💯
                </p>
            </div>
        </div>
    );
}

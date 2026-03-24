import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

const GAMES = [
    {
        id: 'memory-en',
        title: 'Lật Thẻ Nhớ 🇬🇧',
        desc: 'Ghép từ tiếng Anh với hình ảnh',
        emoji: '🃏',
        path: '/game/memory/en',
        gradient: 'var(--gradient-english)',
    },
    {
        id: 'memory-cn',
        title: 'Lật Thẻ Nhớ 🇨🇳',
        desc: 'Ghép chữ Hán với hình ảnh',
        emoji: '🀄',
        path: '/game/memory/cn',
        gradient: 'var(--gradient-chinese)',
    },
    {
        id: 'quiz-en',
        title: 'Đố Vui Tiếng Anh',
        desc: 'Nghe và chọn đáp án đúng',
        emoji: '🧠',
        path: '/game/quiz/en',
        gradient: 'var(--gradient-english)',
    },
    {
        id: 'quiz-cn',
        title: 'Đố Vui Tiếng Trung',
        desc: 'Nghe và chọn chữ Hán đúng',
        emoji: '🐲',
        path: '/game/quiz/cn',
        gradient: 'var(--gradient-chinese)',
    },
];

export default function Games() {
    const navigate = useNavigate();
    const { state } = useGame();

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">🎮 Trò chơi</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <p style={{
                textAlign: 'center',
                color: 'var(--color-text-light)',
                marginBottom: '24px',
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem'
            }}>
                Vừa chơi vừa học — vui lắm nè! 🎉
            </p>

            {GAMES.map((game, i) => (
                <div
                    key={game.id}
                    className={`game-card animate-slide-up delay-${i + 1}`}
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

            {/* Stats */}
            <div style={{
                marginTop: '32px',
                textAlign: 'center',
                padding: '16px',
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>
                    Đã chơi: {state.gamesPlayed} trận
                </p>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                    Điểm tuyệt đối: {state.perfectQuizzes} lần 💯
                </p>
            </div>
        </div>
    );
}

import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { isAdultMode } from '../utils/userMode';

const SECTIONS = [
    {
        title: '🎤 Phrase Practice',
        titleVi: '🎤 Luyện câu giao tiếp (300+ câu)',
        desc: 'Listen → Repeat → word-by-word analysis like ELSA!',
        descVi: 'Nghe → Nói theo → Phân tích từng từ!',
        items: [
            { id: 'phrases-en', title: 'English Phrases', titleVi: '🎤 300+ câu Tiếng Anh', desc: '20 real-world topics', descVi: '20 chủ đề giao tiếp', emoji: '🇬🇧', path: '/phrases/en', color: '#3B82F6' },
            { id: 'phrases-cn', title: 'Chinese Phrases', titleVi: '🎤 300+ câu Tiếng Trung', desc: '20 conversation topics', descVi: '20 chủ đề giao tiếp', emoji: '🇨🇳', path: '/phrases/cn', color: '#EF4444' },
        ],
    },
    {
        title: '📖 Interactive Stories',
        titleVi: '📖 Truyện tương tác',
        desc: 'Read, listen, and speak along',
        descVi: 'Đọc, nghe và nói theo câu chuyện',
        items: [
            { id: 'story-en', title: 'English Stories', titleVi: '📖 Truyện Tiếng Anh', desc: 'The Lost Puppy, Magic Garden...', descVi: 'Chú chó lạc, Khu vườn phép thuật...', emoji: '📚', path: '/stories/en', color: '#10B981' },
            { id: 'story-cn', title: 'Chinese Stories', titleVi: '📖 Truyện Tiếng Trung', desc: '小猫咪 — Little Kitten...', descVi: '小猫咪 — Chú mèo nhỏ...', emoji: '🐉', path: '/stories/cn', color: '#F59E0B' },
        ],
    },
    {
        title: '💬 Conversation & Speaking',
        titleVi: '💬 Hội thoại & Luyện nói',
        desc: 'Real-life role-play scenarios',
        descVi: 'Role-play tình huống thực tế',
        items: [
            { id: 'conv-en', title: 'English Conversations', titleVi: '💬 Hội thoại Tiếng Anh', desc: 'Meeting friends, restaurant, school...', descVi: 'Gặp bạn, nhà hàng, trường học...', emoji: '🗣️', path: '/conversations/en', color: '#6366F1' },
            { id: 'conv-cn', title: 'Chinese Conversations', titleVi: '💬 Hội thoại Tiếng Trung', desc: 'Meeting friends, food, family...', descVi: 'Gặp bạn, đồ ăn, gia đình...', emoji: '🐲', path: '/conversations/cn', color: '#EC4899' },
        ],
    },
    {
        title: '✍️ Writing & Sentence Building',
        titleVi: '✍️ Viết & Ghép câu',
        desc: 'Practice writing and sentence construction',
        descVi: 'Luyện viết chữ và xây dựng câu',
        items: [
            { id: 'stroke', title: 'Hanzi Writing', titleVi: '✍️ Viết chữ Hán', desc: '20 basic characters', descVi: '20 chữ cơ bản — viết bằng ngón tay', emoji: '🖊️', path: '/game/stroke', color: '#8B5CF6' },
            { id: 'sentence-en', title: 'English Sentences', titleVi: '📝 Ghép câu Tiếng Anh', desc: 'Arrange words', descVi: 'Sắp xếp từ thành câu', emoji: '🧩', path: '/game/sentence/en', color: '#3B82F6' },
            { id: 'sentence-cn', title: 'Chinese Sentences', titleVi: '📝 Ghép câu Tiếng Trung', desc: 'Arrange characters', descVi: 'Xếp chữ Hán thành câu', emoji: '🀄', path: '/game/sentence/cn', color: '#EF4444' },
        ],
    },
    {
        title: '🎮 Review Games',
        titleVi: '🎮 Trò chơi ôn tập',
        desc: 'Practice vocabulary through fun games',
        descVi: 'Luyện từ vựng qua trò chơi',
        items: [
            { id: 'quiz-en', title: 'English Quiz', titleVi: '🧠 Đố Vui 🇬🇧', desc: 'Listen and choose', descVi: 'Nghe và chọn đáp án', emoji: '🎯', path: '/game/quiz/en', color: '#10B981' },
            { id: 'quiz-cn', title: 'Chinese Quiz', titleVi: '🧠 Đố Vui 🇨🇳', desc: 'Listen and match', descVi: 'Nghe và chọn chữ Hán', emoji: '🎧', path: '/game/quiz/cn', color: '#F59E0B' },
            { id: 'memory-en', title: 'English Memory', titleVi: '🃏 Lật Thẻ 🇬🇧', desc: 'Match words with images', descVi: 'Ghép từ với hình ảnh', emoji: '🃏', path: '/game/memory/en', color: '#6366F1' },
            { id: 'memory-cn', title: 'Chinese Memory', titleVi: '🃏 Lật Thẻ 🇨🇳', desc: 'Match characters', descVi: 'Ghép chữ Hán với hình', emoji: '🀄', path: '/game/memory/cn', color: '#EC4899' },
            { id: 'typing-en', title: 'Typing EN', titleVi: '⌨️ Gõ nhanh 🇬🇧', desc: 'Type words fast', descVi: 'Gõ từ nhanh, tính WPM', emoji: '⌨️', path: '/typing/en', color: '#0891B2' },
            { id: 'typing-cn', title: 'Typing CN', titleVi: '⌨️ Gõ nhanh 🇨🇳', desc: 'Type characters', descVi: 'Gõ chữ Hán nhanh', emoji: '⌨️', path: '/typing/cn', color: '#DC2626' },
            { id: 'matching', title: 'Matching', titleVi: '🔗 Ghép đôi EN↔VN', desc: 'Match translations', descVi: 'Nối từ EN với nghĩa VN', emoji: '🔗', path: '/matching', color: '#7C3AED' },
        ],
    },
    {
        title: '🤖 AI Conversation',
        titleVi: '🤖 Hội thoại AI',
        desc: 'Practice with AI in real-life scenarios',
        descVi: 'Luyện tập với AI trong tình huống thực tế',
        items: [
            { id: 'conv-ai', title: 'AI Chat Practice', titleVi: '🤖 Trò chuyện AI', desc: 'Restaurant, Airport, Doctor, Interview, Hotel', descVi: 'Nhà hàng, Sân bay, Bệnh viện, Phỏng vấn, Khách sạn', emoji: '💬', path: '/conversation-ai', color: '#8B5CF6' },
        ],
    },
    {
        title: '📝 Fill in the Blank',
        titleVi: '📝 Điền vào chỗ trống',
        desc: 'Grammar exercises — A1 to B2',
        descVi: 'Bài tập ngữ pháp — A1 đến B2',
        items: [
            { id: 'cloze-en', title: 'English Cloze', titleVi: '📝 Điền khuyết 🇬🇧', desc: '40+ exercises, A1→B2', descVi: '40+ bài, A1→B2', emoji: '🇬🇧', path: '/cloze/en', color: '#3B82F6' },
            { id: 'cloze-cn', title: 'Chinese Cloze', titleVi: '📝 Điền khuyết 🇨🇳', desc: '15+ exercises, HSK1→3', descVi: '15+ bài, HSK1→3', emoji: '🇨🇳', path: '/cloze/cn', color: '#EF4444' },
        ],
    },
];

export default function Games() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">🎮 {adult ? 'Learn & Play' : 'Học & Chơi'}</h2>
                <div className="home-hero__badges">
                    <div className="coin-badge">🪙 {state.coins || 0}</div>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
            </div>

            {SECTIONS.map((section, si) => (
                <div key={si} className="reveal" style={{ marginBottom: '24px', animationDelay: `${si * 0.08}s` }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '4px' }}>
                        {adult ? section.title : section.titleVi}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                        {adult ? section.desc : section.descVi}
                    </p>
                    {section.items.map((game, i) => (
                        <div
                            key={game.id}
                            className="game-card glass-card"
                            onClick={() => navigate(game.path)}
                            style={{
                                borderLeft: `4px solid ${game.color}`,
                                marginBottom: '8px',
                            }}
                        >
                            <div className="game-card__icon" style={{
                                background: `${game.color}12`,
                                borderRadius: 'var(--radius-md)',
                                width: '44px', height: '44px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.4rem',
                            }}>{game.emoji}</div>
                            <div className="game-card__info">
                                <div className="game-card__title">{adult ? game.title : game.titleVi}</div>
                                <div className="game-card__desc">{adult ? game.desc : game.descVi}</div>
                            </div>
                            <div style={{ fontSize: '1.3rem', color: game.color }}>▶️</div>
                        </div>
                    ))}
                </div>
            ))}

            {/* Stats card */}
            <div className="glass-card" style={{
                textAlign: 'center', padding: '20px', marginBottom: '80px',
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
                <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
                    {adult ? 'Played' : 'Đã chơi'}: {state.gamesPlayed} · {adult ? 'Perfect' : 'Tuyệt đối'}: {state.perfectQuizzes} 💯
                </p>
            </div>
        </div>
    );
}

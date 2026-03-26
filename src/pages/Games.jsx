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
            { id: 'pronun-en', title: 'Pronunciation Lab EN', titleVi: '🎙️ Luyện phát âm 🇬🇧', desc: 'AI scores your pronunciation', descVi: 'AI chấm điểm phát âm', emoji: '🎙️', path: '/pronunciation/en', color: '#0891B2' },
            { id: 'pronun-cn', title: 'Pronunciation Lab CN', titleVi: '🎙️ Luyện phát âm 🇨🇳', desc: 'Practice tones + characters', descVi: 'Luyện thanh điệu + chữ Hán', emoji: '🎙️', path: '/pronunciation/cn', color: '#DC2626' },
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
            { id: 'grammar', title: 'Grammar Explainer', titleVi: '📚 Ngữ pháp A1→B2', desc: '8 lessons + quiz', descVi: '8 bài với công thức + quiz', emoji: '📐', path: '/grammar-explainer', color: '#7C3AED' },
            { id: 'dictation-en', title: 'Dictation EN', titleVi: '🎧 Chính tả 🇬🇧', desc: 'Listen & type', descVi: 'Nghe câu → gõ lại', emoji: '🎧', path: '/dictation/en', color: '#0891B2' },
            { id: 'dictation-cn', title: 'Dictation CN', titleVi: '🎧 Chính tả 🇨🇳', desc: 'Listen & type', descVi: 'Nghe câu → gõ lại', emoji: '🎧', path: '/dictation/cn', color: '#DC2626' },
        ],
    },
    {
        title: '🎓 AI Teacher Suite',
        titleVi: '🎓 Giáo viên AI',
        desc: 'Native-teacher-level practice tools',
        descVi: 'Công cụ luyện tập như giáo viên bản ngữ',
        items: [
            { id: 'reading', title: 'Reading Comprehension', titleVi: '📖 Đọc hiểu A2→B2', desc: '4 passages + questions', descVi: '4 bài đọc + câu hỏi', emoji: '📖', path: '/reading', color: '#10B981' },
            { id: 'accent', title: 'Accent Practice', titleVi: '🌍 Luyện giọng US/UK/AU', desc: '3 accents × 10 sentences', descVi: '3 giọng × 10 câu', emoji: '🌍', path: '/accent-practice', color: '#3B82F6' },
            { id: 'shadowing', title: 'Shadowing Speaker', titleVi: '🎭 Shadowing 5 phong cách', desc: 'Professional, casual, academic...', descVi: 'Chuyên nghiệp, thường ngày, học thuật...', emoji: '🎭', path: '/shadowing', color: '#EF4444' },
            { id: 'roleplay', title: 'Role-play 1:1', titleVi: '🗣️ Hội thoại tình huống', desc: '5 real-life scenarios', descVi: '5 tình huống thực tế', emoji: '🗣️', path: '/roleplay', color: '#6366F1' },
            { id: 'error-correction', title: 'Error Correction', titleVi: '✏️ Sửa lỗi ngữ pháp', desc: '15 common mistakes', descVi: '15 lỗi thường gặp + giải thích', emoji: '✏️', path: '/error-correction', color: '#F59E0B' },
            { id: 'idiom', title: 'Idiom Trainer', titleVi: '🎭 20 thành ngữ', desc: 'Learn & quiz idioms', descVi: 'Học & đố thành ngữ', emoji: '🎭', path: '/idiom-trainer', color: '#8B5CF6' },
            { id: 'listening', title: 'Listening', titleVi: '🎧 Nghe hiểu A2→B2', desc: '5 passages + quiz', descVi: '5 bài nghe + câu hỏi', emoji: '🎧', path: '/listening', color: '#0891B2' },
            { id: 'translation', title: 'Translation', titleVi: '🔄 Dịch EN↔VN', desc: '12 bilingual exercises', descVi: '12 bài dịch song ngữ', emoji: '🔄', path: '/translation', color: '#DC2626' },
            { id: 'tone-drill', title: 'Tone Drill', titleVi: '🏮 Luyện thanh điệu', desc: '20 Chinese tone exercises', descVi: '20 bài luyện 4 thanh', emoji: '🏮', path: '/tone-drill', color: '#DC2626' },
            { id: 'conv-tree', title: 'Conversation Tree', titleVi: '🌳 Hội thoại phân nhánh', desc: '3 stories with choices', descVi: '3 câu chuyện nhiều lựa chọn', emoji: '🌳', path: '/conversation-tree', color: '#10B981' },
            { id: 'vocab-ctx', title: 'Vocab in Context', titleVi: '📝 Từ vựng ngữ cảnh', desc: '12 fill-in-the-blank', descVi: '12 bài điền từ trong câu', emoji: '📝', path: '/vocab-context', color: '#0891B2' },
            { id: 'phrasal', title: 'Phrasal Verbs', titleVi: '🔗 Cụm động từ', desc: '20 essential verbs', descVi: '20 cụm động từ thiết yếu', emoji: '🔗', path: '/phrasal-verbs', color: '#7C3AED' },
            { id: 'minimal', title: 'Minimal Pairs', titleVi: '👂 Phân biệt âm', desc: '15 sound pairs', descVi: '15 cặp âm dễ nhầm', emoji: '👂', path: '/minimal-pairs', color: '#0891B2' },
            { id: 'word-form', title: 'Word Forms', titleVi: '🔠 Biến đổi từ', desc: 'noun↔verb↔adj↔adv', descVi: 'Danh↔Động↔Tính↔Trạng', emoji: '🔠', path: '/word-formation', color: '#6366F1' },
            { id: 'spelling', title: 'Spelling Bee', titleVi: '🐝 Chính tả', desc: '20 tricky words', descVi: '20 từ hay viết sai', emoji: '🐝', path: '/spelling-bee', color: '#F59E0B' },
            { id: 'sentence', title: 'Sentence Builder', titleVi: '🏗️ Xếp câu', desc: '12 scrambled sentences', descVi: '12 câu xáo trộn', emoji: '🏗️', path: '/sentence-builder', color: '#10B981' },
            { id: 'study-stats', title: 'Study Statistics', titleVi: '📊 Thống kê học tập', desc: 'XP, milestones, skills', descVi: 'XP, cột mốc, kỹ năng', emoji: '📊', path: '/study-stats', color: '#F59E0B' },
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

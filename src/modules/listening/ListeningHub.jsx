import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getLessonsByMode } from '../../data/listening';
import { isAdultMode } from '../../utils/userMode';

// Entry point for the Listening module
export default function ListeningHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const lessons = getLessonsByMode(state.userMode);

    // Group by level
    const levels = {};
    lessons.forEach(l => {
        if (!levels[l.level]) levels[l.level] = [];
        levels[l.level].push(l);
    });

    const levelOrder = adult
        ? ['B2', 'B1', 'A2', 'A1']  // Show advanced first for adults
        : ['A1', 'A2', 'B1'];       // Show beginner first for kids

    const levelLabels = {
        'A1': { label: '🌱 Cơ bản', desc: 'Beginner — Daily topics' },
        'A2': { label: '🌿 Sơ cấp', desc: 'Elementary — Simple conversations' },
        'B1': { label: '🌳 Trung cấp', desc: 'Intermediate — Professional topics' },
        'B2': { label: '🌲 Cao cấp', desc: 'Upper-Intermediate — Academic content' },
        'C1': { label: '🏔️ Nâng cao', desc: 'Advanced — Complex lectures' },
    };

    return (
        <div className="listening-hub">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/')}>←</button>
                <h2 className="lh-title">🎧 {adult ? 'Listening Practice' : 'Luyện Nghe'}</h2>
            </div>

            <p className="lh-subtitle">
                {adult
                    ? 'Build your listening skills with structured exercises. Each lesson includes audio, dictation, quiz, and vocabulary.'
                    : 'Luyện nghe tiếng Anh qua các bài nghe sinh động! 🎵'}
            </p>

            {/* Stats bar */}
            <div className="lh-stats">
                <div className="lh-stat">
                    <span className="lh-stat-number">{lessons.length}</span>
                    <span className="lh-stat-label">{adult ? 'Lessons' : 'Bài'}</span>
                </div>
                <div className="lh-stat">
                    <span className="lh-stat-number">4</span>
                    <span className="lh-stat-label">{adult ? 'Activities/lesson' : 'Bài tập/bài'}</span>
                </div>
                <div className="lh-stat">
                    <span className="lh-stat-number">3</span>
                    <span className="lh-stat-label">{adult ? 'Question types' : 'Dạng câu hỏi'}</span>
                </div>
            </div>

            {/* Lessons by level */}
            {levelOrder.filter(l => levels[l]).map(level => (
                <div key={level} className="lh-level-section">
                    <div className="lh-level-header">
                        <h3>{levelLabels[level]?.label || level}</h3>
                        <span className="lh-level-desc">{levelLabels[level]?.desc}</span>
                    </div>
                    <div className="lh-lesson-grid">
                        {levels[level].map(lesson => (
                            <div
                                key={lesson.id}
                                className="lh-lesson-card"
                                onClick={() => navigate(`/listening/${lesson.id}`)}
                            >
                                <span className="lh-lesson-emoji">{lesson.emoji}</span>
                                <div className="lh-lesson-info">
                                    <h4>{lesson.title}</h4>
                                    <p className="lh-lesson-title-vi">{lesson.titleVi}</p>
                                    <div className="lh-lesson-meta">
                                        <span>⏱️ {lesson.duration}</span>
                                        <span>📝 {lesson.quiz.length} câu</span>
                                        <span>📚 {lesson.vocabulary.length} từ mới</span>
                                    </div>
                                </div>
                                <span className="lh-lesson-arrow">▶</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Method explanation */}
            <div className="lh-method">
                <h3>{adult ? '📖 Learning Method' : '📖 Phương pháp học'}</h3>
                <div className="lh-method-steps">
                    <div className="lh-method-step">
                        <span className="step-icon">🎧</span>
                        <div>
                            <strong>{adult ? 'Step 1: Listen' : 'Bước 1: Nghe'}</strong>
                            <p>{adult ? 'Listen with transcript, then without' : 'Nghe có transcript, rồi tắt đi'}</p>
                        </div>
                    </div>
                    <div className="lh-method-step">
                        <span className="step-icon">✏️</span>
                        <div>
                            <strong>{adult ? 'Step 2: Dictation' : 'Bước 2: Chính tả'}</strong>
                            <p>{adult ? 'Type what you hear — builds active listening' : 'Gõ lại những gì nghe được'}</p>
                        </div>
                    </div>
                    <div className="lh-method-step">
                        <span className="step-icon">📝</span>
                        <div>
                            <strong>{adult ? 'Step 3: Quiz' : 'Bước 3: Trắc nghiệm'}</strong>
                            <p>{adult ? 'IELTS-format questions test comprehension' : 'Kiểm tra hiểu bài'}</p>
                        </div>
                    </div>
                    <div className="lh-method-step">
                        <span className="step-icon">📚</span>
                        <div>
                            <strong>{adult ? 'Step 4: Vocabulary' : 'Bước 4: Từ vựng'}</strong>
                            <p>{adult ? 'Learn key words from the lesson' : 'Học từ mới trong bài'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

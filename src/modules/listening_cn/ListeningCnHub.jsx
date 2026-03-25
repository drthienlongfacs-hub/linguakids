import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getCnLessonsByMode } from '../../data/listening_cn';
import { isAdultMode } from '../../utils/userMode';

export default function ListeningCnHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const lessons = getCnLessonsByMode(state.userMode);

    const levels = {};
    lessons.forEach(l => {
        if (!levels[l.level]) levels[l.level] = [];
        levels[l.level].push(l);
    });

    const levelOrder = adult ? ['B1', 'A2', 'A1'] : ['A1', 'A2'];

    const levelLabels = {
        'A1': { label: '🌱 HSK 1', desc: 'Cơ bản — Chủ đề hàng ngày' },
        'A2': { label: '🌿 HSK 2-3', desc: 'Sơ cấp — Giao tiếp đơn giản' },
        'B1': { label: '🌳 HSK 3-4', desc: 'Trung cấp — Du lịch & Công việc' },
    };

    return (
        <div className="listening-hub">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/chinese')}>←</button>
                <h2 className="lh-title">🎧 {adult ? 'Chinese Listening 听力练习' : 'Luyện Nghe 听力'}</h2>
            </div>

            <p className="lh-subtitle">
                {adult
                    ? 'Practice Chinese listening with HSK-style exercises. Each lesson includes transcript, vocabulary, and quiz.'
                    : 'Luyện nghe tiếng Trung qua các bài nghe sinh động! 🎵'}
            </p>

            <div className="lh-stats">
                <div className="lh-stat">
                    <span className="lh-stat-number">{lessons.length}</span>
                    <span className="lh-stat-label">{adult ? 'Lessons' : 'Bài'}</span>
                </div>
                <div className="lh-stat">
                    <span className="lh-stat-number">3</span>
                    <span className="lh-stat-label">{adult ? 'Question types' : 'Dạng câu hỏi'}</span>
                </div>
            </div>

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
                                onClick={() => navigate(`/listening-cn/${lesson.id}`)}
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

            <div className="lh-method">
                <h3>📖 {adult ? 'Learning Method 学习方法' : 'Phương pháp học 学习方法'}</h3>
                <div className="lh-method-steps">
                    <div className="lh-method-step">
                        <span className="step-icon">🎧</span>
                        <div>
                            <strong>Bước 1: Nghe 听</strong>
                            <p>Nghe với phiên âm pinyin, rồi nghe lại không có phiên âm</p>
                        </div>
                    </div>
                    <div className="lh-method-step">
                        <span className="step-icon">📖</span>
                        <div>
                            <strong>Bước 2: Đọc 读</strong>
                            <p>Đọc transcript tiếng Trung và đối chiếu bản dịch</p>
                        </div>
                    </div>
                    <div className="lh-method-step">
                        <span className="step-icon">📝</span>
                        <div>
                            <strong>Bước 3: Kiểm tra 测试</strong>
                            <p>Trả lời câu hỏi để kiểm tra khả năng nghe hiểu</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

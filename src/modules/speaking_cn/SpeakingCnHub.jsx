import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getCnSpeakingByMode } from '../../data/speaking_cn';
import { isAdultMode } from '../../utils/userMode';

export default function SpeakingCnHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const lessons = getCnSpeakingByMode(state.userMode);

    const typeLabels = {
        tone_drill: { icon: '🎵', label: 'Luyện thanh điệu' },
        shadowing: { icon: '🔁', label: 'Shadowing (Nhại theo)' },
        conversation: { icon: '💬', label: 'Hội thoại' },
    };

    const grouped = {};
    lessons.forEach(l => {
        if (!grouped[l.type]) grouped[l.type] = [];
        grouped[l.type].push(l);
    });

    return (
        <div className="listening-hub">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/chinese')}>←</button>
                <h2 className="lh-title">🗣️ {adult ? 'Chinese Speaking 口语练习' : 'Luyện Nói 口语'}</h2>
            </div>

            <p className="lh-subtitle">
                {adult
                    ? 'Master Chinese pronunciation with tone drills, shadowing, and conversation practice.'
                    : 'Luyện phát âm tiếng Trung và nói theo mẫu! 🎤'}
            </p>

            <div className="lh-stats">
                <div className="lh-stat">
                    <span className="lh-stat-number">{lessons.length}</span>
                    <span className="lh-stat-label">{adult ? 'Lessons' : 'Bài'}</span>
                </div>
                <div className="lh-stat">
                    <span className="lh-stat-number">4</span>
                    <span className="lh-stat-label">{adult ? 'Tones' : 'Thanh điệu'}</span>
                </div>
            </div>

            {Object.entries(grouped).map(([type, items]) => (
                <div key={type} className="lh-level-section">
                    <div className="lh-level-header">
                        <h3>{typeLabels[type]?.icon} {typeLabels[type]?.label || type}</h3>
                    </div>
                    <div className="lh-lesson-grid">
                        {items.map(lesson => (
                            <div
                                key={lesson.id}
                                className="lh-lesson-card"
                                onClick={() => navigate(`/speaking-cn/${lesson.id}`)}
                            >
                                <span className="lh-lesson-emoji">{lesson.emoji}</span>
                                <div className="lh-lesson-info">
                                    <h4>{lesson.title}</h4>
                                    <p className="lh-lesson-title-vi">{lesson.titleVi}</p>
                                    <div className="lh-lesson-meta">
                                        <span>📊 {lesson.level}</span>
                                        <span>
                                            {lesson.type === 'tone_drill' && `${lesson.drills?.length || 0} thanh + ${lesson.tonePairs?.length || 0} cặp`}
                                            {lesson.type === 'shadowing' && `${lesson.sentences?.length || 0} câu`}
                                            {lesson.type === 'conversation' && `${lesson.prompts?.length || 0} câu hỏi`}
                                        </span>
                                    </div>
                                </div>
                                <span className="lh-lesson-arrow">▶</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="lh-method">
                <h3>📖 Phương pháp luyện nói tiếng Trung</h3>
                <div className="lh-method-steps">
                    <div className="lh-method-step">
                        <span className="step-icon">🎵</span>
                        <div>
                            <strong>Luyện thanh điệu 声调</strong>
                            <p>Nắm vững 4 thanh — nền tảng của tiếng Trung</p>
                        </div>
                    </div>
                    <div className="lh-method-step">
                        <span className="step-icon">🔁</span>
                        <div>
                            <strong>Shadowing 跟读</strong>
                            <p>Nghe và nhại theo — cải thiện ngữ điệu tự nhiên</p>
                        </div>
                    </div>
                    <div className="lh-method-step">
                        <span className="step-icon">💬</span>
                        <div>
                            <strong>Hội thoại 对话</strong>
                            <p>Trả lời câu hỏi — luyện phản xạ giao tiếp</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

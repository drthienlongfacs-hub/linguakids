import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getLessonsByMode } from '../../data/listening';
import { isAdultMode } from '../../utils/userMode';
import CapabilityNotice from '../../components/CapabilityNotice';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';

// Premium Listening Hub with difficulty filter + progress tracking
export default function ListeningHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const { readiness } = useDeviceCapabilities();
    const lessons = getLessonsByMode(state.userMode);
    const totalSegments = lessons.reduce((sum, lesson) => sum + (lesson.segments?.length || 0), 0);
    const totalVocabulary = lessons.reduce((sum, lesson) => sum + (lesson.vocabulary?.length || 0), 0);
    const totalQuizItems = lessons.reduce((sum, lesson) => sum + (lesson.quiz?.length || 0), 0);
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');

    // Group by level
    const levels = {};
    lessons.forEach(l => {
        if (!levels[l.level]) levels[l.level] = [];
        levels[l.level].push(l);
    });

    const levelOrder = adult
        ? ['B2', 'B1', 'A2', 'A1']
        : ['A1', 'A2', 'B1'];

    const levelLabels = {
        'A1': { label: '🌱 Cơ bản', desc: 'Beginner — Daily topics', difficulty: 'easy', color: '#10B981' },
        'A2': { label: '🌿 Sơ cấp', desc: 'Elementary — Simple conversations', difficulty: 'medium', color: '#F59E0B' },
        'B1': { label: '🌳 Trung cấp', desc: 'Intermediate — Professional topics', difficulty: 'hard', color: '#EF4444' },
        'B2': { label: '🌲 Cao cấp', desc: 'Upper-Intermediate — Academic content', difficulty: 'hard', color: '#8B5CF6' },
        'C1': { label: '🏔️ Nâng cao', desc: 'Advanced — Complex lectures', difficulty: 'hard', color: '#6366F1' },
    };

    const difficultyFilters = [
        { id: 'all', label: adult ? 'All' : 'Tất cả', emoji: '📚' },
        { id: 'easy', label: adult ? 'Easy' : 'Dễ', emoji: '🌱' },
        { id: 'medium', label: adult ? 'Medium' : 'Vừa', emoji: '🌿' },
        { id: 'hard', label: adult ? 'Hard' : 'Khó', emoji: '🌳' },
    ];

    const filteredLevelOrder = selectedDifficulty === 'all'
        ? levelOrder
        : levelOrder.filter(l => levelLabels[l]?.difficulty === selectedDifficulty);

    return (
        <div className="listening-hub">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/')}>←</button>
                <h2 className="lh-title">🎧 {adult ? 'Listening Practice' : 'Luyện Nghe'}</h2>
            </div>

            <p className="lh-subtitle">
                {adult
                    ? 'Build your listening skills with structured exercises. Each lesson includes audio, dictation, quiz, and vocabulary.'
                    : `Luyện nghe tiếng Anh với ${totalSegments} đoạn audio giả lập, ${totalVocabulary} từ vựng và ${totalQuizItems} câu kiểm tra.`}
            </p>

            <CapabilityNotice
                icon="🎛️"
                title="Listening rail status"
                badge={readiness.listening.badge}
                tone="warn"
                summary="Hiện tại toàn bộ rail nghe vẫn ưu tiên browser TTS nếu lesson chưa có controlled audio pack. Đây là lớp chuyển tiếp trước khi thay dần bằng audio asset riêng."
                compact
            />

            {/* Stats bar */}
            <div className="lh-stats">
                <div className="lh-stat">
                    <span className="lh-stat-number">{lessons.length}</span>
                    <span className="lh-stat-label">{adult ? 'Lessons' : 'Bài'}</span>
                </div>
                <div className="lh-stat">
                    <span className="lh-stat-number">{totalSegments}</span>
                    <span className="lh-stat-label">{adult ? 'Segments' : 'Đoạn nghe'}</span>
                </div>
                <div className="lh-stat">
                    <span className="lh-stat-number">{totalVocabulary}</span>
                    <span className="lh-stat-label">{adult ? 'Vocab' : 'Từ mới'}</span>
                </div>
            </div>

            {/* Difficulty Filter */}
            <div style={{
                display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto',
                padding: '4px 0', scrollbarWidth: 'none',
            }}>
                {difficultyFilters.map(f => (
                    <button
                        key={f.id}
                        onClick={() => setSelectedDifficulty(f.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: 'var(--radius-full)',
                            border: selectedDifficulty === f.id
                                ? '2px solid var(--color-primary)'
                                : '2px solid var(--color-border)',
                            background: selectedDifficulty === f.id
                                ? 'var(--color-primary)' : 'white',
                            color: selectedDifficulty === f.id ? 'white' : 'var(--color-text)',
                            fontFamily: 'var(--font-display)', fontWeight: 600,
                            fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap',
                            transition: 'all var(--transition-fast)',
                        }}
                    >
                        {f.emoji} {f.label}
                    </button>
                ))}
            </div>

            {/* Lessons by level */}
            {filteredLevelOrder.filter(l => levels[l]).map(level => (
                <div key={level} className="lh-level-section reveal">
                    <div className="lh-level-header">
                        <h3>{levelLabels[level]?.label || level}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                fontSize: '0.7rem', fontWeight: 700,
                                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                                background: `${levelLabels[level]?.color}15`,
                                color: levelLabels[level]?.color,
                                border: `1px solid ${levelLabels[level]?.color}30`,
                            }}>
                                {levelLabels[level]?.difficulty?.toUpperCase()}
                            </span>
                            <span className="lh-level-desc">{levelLabels[level]?.desc}</span>
                        </div>
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
                                        <span>📝 {lesson.quiz.length} {adult ? 'Q' : 'câu'}</span>
                                        <span>📚 {lesson.vocabulary.length} {adult ? 'words' : 'từ'}</span>
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

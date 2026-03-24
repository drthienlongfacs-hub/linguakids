import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LISTENING_LESSONS } from '../../data/listening';
import ListeningPlayer from './ListeningPlayer';
import DictationExercise from './DictationExercise';
import ListeningQuiz from './ListeningQuiz';

// Full Listening Lesson experience: 3 tabs — Listen, Dictation, Quiz
export default function ListeningLesson() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const lesson = LISTENING_LESSONS.find(l => l.id === lessonId);
    const [activeTab, setActiveTab] = useState('listen');
    const [completedTabs, setCompletedTabs] = useState([]);

    if (!lesson) {
        return (
            <div className="listening-lesson-page">
                <p>Không tìm thấy bài học.</p>
                <button onClick={() => navigate('/listening')}>← Quay lại</button>
            </div>
        );
    }

    const tabs = [
        { id: 'listen', label: '🎧 Nghe', icon: '🎧' },
        { id: 'dictation', label: '✏️ Chính tả', icon: '✏️' },
        { id: 'quiz', label: '📝 Quiz', icon: '📝' },
        { id: 'vocab', label: '📚 Từ vựng', icon: '📚' },
    ];

    const markComplete = (tab) => {
        if (!completedTabs.includes(tab)) {
            setCompletedTabs(prev => [...prev, tab]);
        }
    };

    return (
        <div className="listening-lesson-page">
            {/* Header */}
            <div className="ll-header">
                <button className="ll-back" onClick={() => navigate('/listening')}>
                    ←
                </button>
                <div className="ll-title-group">
                    <h2 className="ll-title">{lesson.emoji} {lesson.title}</h2>
                    <div className="ll-meta">
                        <span className="ll-badge level">{lesson.level}</span>
                        <span className="ll-badge duration">⏱️ {lesson.duration}</span>
                        <span className="ll-badge topic">{lesson.topic}</span>
                    </div>
                </div>
            </div>

            {/* Tab navigation */}
            <div className="ll-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`ll-tab ${activeTab === tab.id ? 'active' : ''} ${completedTabs.includes(tab.id) ? 'completed' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        {tab.label}
                        {completedTabs.includes(tab.id) && ' ✓'}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="ll-content">
                {activeTab === 'listen' && (
                    <div className="ll-listen-tab">
                        <div className="ll-instructions">
                            <h3>🎧 Bước 1: Nghe bài</h3>
                            <p>Nghe toàn bộ bài, dùng transcript nếu cần. Thử tắt transcript sau khi nghe quen.</p>
                        </div>
                        <ListeningPlayer
                            segments={lesson.segments}
                            onSegmentChange={() => { }}
                        />
                        <button
                            className="ll-done-btn"
                            onClick={() => { markComplete('listen'); setActiveTab('dictation'); }}
                        >
                            Đã nghe xong → Chuyển sang Chính tả ✏️
                        </button>
                    </div>
                )}

                {activeTab === 'dictation' && (
                    <div className="ll-dictation-tab">
                        <div className="ll-instructions">
                            <h3>✏️ Bước 2: Chính tả (Dictation)</h3>
                            <p>Nghe từng đoạn và gõ lại. Đây là cách luyện nghe hiệu quả nhất!</p>
                        </div>
                        <DictationExercise
                            segments={lesson.segments}
                            onComplete={() => { markComplete('dictation'); setActiveTab('quiz'); }}
                        />
                    </div>
                )}

                {activeTab === 'quiz' && (
                    <div className="ll-quiz-tab">
                        <div className="ll-instructions">
                            <h3>📝 Bước 3: Kiểm tra hiểu bài</h3>
                            <p>Trả lời câu hỏi dựa trên những gì bạn đã nghe. Format giống IELTS Listening.</p>
                        </div>
                        <ListeningQuiz
                            quiz={lesson.quiz}
                            lessonTitle={lesson.title}
                            onComplete={() => markComplete('quiz')}
                        />
                    </div>
                )}

                {activeTab === 'vocab' && (
                    <div className="ll-vocab-tab">
                        <div className="ll-instructions">
                            <h3>📚 Bước 4: Từ vựng</h3>
                            <p>Học các từ mới xuất hiện trong bài nghe.</p>
                        </div>
                        <div className="vocab-grid">
                            {lesson.vocabulary.map((v, i) => (
                                <div key={i} className="vocab-card">
                                    <div className="vocab-word">{v.word}</div>
                                    <div className="vocab-meaning">🇻🇳 {v.meaning}</div>
                                    {v.example && <div className="vocab-example">💬 {v.example}</div>}
                                    <button
                                        className="vocab-speak-btn"
                                        onClick={() => {
                                            const u = new SpeechSynthesisUtterance(v.word);
                                            u.lang = 'en-US';
                                            window.speechSynthesis.speak(u);
                                        }}
                                    >
                                        🔊
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            className="ll-done-btn"
                            onClick={() => markComplete('vocab')}
                        >
                            ✅ Đã học xong từ vựng
                        </button>
                    </div>
                )}
            </div>

            {/* Completion status */}
            {completedTabs.length === 4 && (
                <div className="ll-complete-banner">
                    <span>🎉 Hoàn thành bài học!</span>
                    <button onClick={() => navigate('/listening')}>→ Bài tiếp theo</button>
                </div>
            )}
        </div>
    );
}

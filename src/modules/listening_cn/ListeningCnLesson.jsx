import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LISTENING_CN_LESSONS } from '../../data/listening_cn';
import ListeningPlayer from '../listening/ListeningPlayer';
import DictationExercise from '../listening/DictationExercise';
import ListeningQuiz from '../listening/ListeningQuiz';

export default function ListeningCnLesson() {
    const { lessonId } = useParams();
    const navigate = useNavigate();
    const lesson = LISTENING_CN_LESSONS.find(item => item.id === lessonId);
    const [activeTab, setActiveTab] = useState('listen');
    const [completedTabs, setCompletedTabs] = useState([]);

    if (!lesson) {
        return (
            <div className="listening-lesson-page">
                <p>Không tìm thấy bài nghe tiếng Trung.</p>
                <button onClick={() => navigate('/listening-cn')}>← Quay lại</button>
            </div>
        );
    }

    const tabs = [
        { id: 'listen', label: '🎧 Nghe' },
        { id: 'dictation', label: '✏️ Chính tả' },
        { id: 'quiz', label: '📝 Quiz' },
        { id: 'vocab', label: '📚 Từ vựng' },
    ];

    const markComplete = (tab) => {
        if (!completedTabs.includes(tab)) {
            setCompletedTabs(prev => [...prev, tab]);
        }
    };

    return (
        <div className="listening-lesson-page">
            <div className="ll-header">
                <button className="ll-back" onClick={() => navigate('/listening-cn')}>
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

            <div className="ll-content">
                {activeTab === 'listen' && (
                    <div className="ll-listen-tab">
                        <div className="ll-instructions">
                            <h3>🎧 Bước 1: Nghe bài</h3>
                            <p>Nghe với pinyin trước, sau đó tắt pinyin để tăng khả năng xử lý tiếng Trung thật.</p>
                        </div>
                        <ListeningPlayer
                            segments={lesson.segments}
                            langCode="zh-CN"
                            showPinyin
                            onSegmentChange={() => {}}
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
                            <h3>✏️ Bước 2: Chính tả</h3>
                            <p>Nghe từng đoạn tiếng Trung rồi gõ lại. Hệ thống sẽ chấm theo ký tự thực tế.</p>
                        </div>
                        <DictationExercise
                            segments={lesson.segments}
                            lang="cn"
                            onComplete={() => { markComplete('dictation'); setActiveTab('quiz'); }}
                        />
                    </div>
                )}

                {activeTab === 'quiz' && (
                    <div className="ll-quiz-tab">
                        <div className="ll-instructions">
                            <h3>📝 Bước 3: Kiểm tra hiểu bài</h3>
                            <p>Trả lời câu hỏi dựa trên nội dung vừa nghe để kiểm tra khả năng nghe hiểu.</p>
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
                            <p>Ôn lại cụm từ trọng tâm trước khi chuyển sang bài khác.</p>
                        </div>
                        <div className="vocab-grid">
                            {lesson.vocabulary.map((item, index) => (
                                <div key={`${item.word}-${index}`} className="vocab-card">
                                    <div className="vocab-word">{item.word}</div>
                                    {item.pinyin && (
                                        <div className="vocab-meaning" style={{ color: '#8B5CF6' }}>
                                            {item.pinyin}
                                        </div>
                                    )}
                                    <div className="vocab-meaning">🇻🇳 {item.meaning}</div>
                                    {item.example && <div className="vocab-example">💬 {item.example}</div>}
                                    <button
                                        className="vocab-speak-btn"
                                        onClick={() => {
                                            const utterance = new SpeechSynthesisUtterance(item.word);
                                            utterance.lang = 'zh-CN';
                                            const voices = window.speechSynthesis.getVoices();
                                            const voice = voices.find(entry => entry.lang.startsWith('zh'));
                                            if (voice) {
                                                utterance.voice = voice;
                                                utterance.lang = voice.lang;
                                            }
                                            window.speechSynthesis.speak(utterance);
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

            {completedTabs.length === 4 && (
                <div className="ll-complete-banner">
                    <span>🎉 Hoàn thành bài nghe tiếng Trung!</span>
                    <button onClick={() => navigate('/listening-cn')}>→ Chọn bài khác</button>
                </div>
            )}
        </div>
    );
}

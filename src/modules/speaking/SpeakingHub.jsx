import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getSpeakingByMode } from '../../data/speaking';
import { isAdultMode } from '../../utils/userMode';

export default function SpeakingHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const lessons = getSpeakingByMode(state.userMode);
    const [activeLesson, setActiveLesson] = useState(null);

    if (activeLesson) {
        return <SpeakingExercise lesson={activeLesson} onBack={() => setActiveLesson(null)} adult={adult} />;
    }

    const shadowing = lessons.filter(l => l.type === 'shadowing');
    const ielts = lessons.filter(l => l.type === 'ielts_speaking');

    return (
        <div className="speaking-hub page">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/')}>←</button>
                <h2 className="lh-title">🗣️ {adult ? 'Speaking Practice' : 'Luyện Nói'}</h2>
            </div>
            <p className="lh-subtitle">
                {adult ? 'Improve your speaking with shadowing, pronunciation drills, and IELTS speaking practice.' : 'Luyện nói tiếng Anh cùng bé! 🎤'}
            </p>

            <div className="lh-stats">
                <div className="lh-stat"><span className="lh-stat-number">{lessons.length}</span><span className="lh-stat-label">{adult ? 'Exercises' : 'Bài'}</span></div>
                <div className="lh-stat"><span className="lh-stat-number">3</span><span className="lh-stat-label">{adult ? 'Types' : 'Dạng'}</span></div>
                <div className="lh-stat"><span className="lh-stat-number">🎤</span><span className="lh-stat-label">{adult ? 'Voice Rec.' : 'Ghi âm'}</span></div>
            </div>

            {shadowing.length > 0 && (
                <div className="lh-level-section">
                    <div className="lh-level-header"><h3>🎧 {adult ? 'Shadowing' : 'Bắt chước'}</h3><span className="lh-level-desc">{adult ? 'Listen, repeat, and compare' : 'Nghe, lặp lại, so sánh'}</span></div>
                    <div className="lh-lesson-grid">
                        {shadowing.map(l => (
                            <div key={l.id} className="lh-lesson-card" onClick={() => setActiveLesson(l)}>
                                <span className="lh-lesson-emoji">{l.emoji}</span>
                                <div className="lh-lesson-info"><h4>{l.title}</h4><p className="lh-lesson-title-vi">{l.titleVi}</p><div className="lh-lesson-meta"><span>{l.level}</span><span>{l.sentences?.length || 0} câu</span></div></div>
                                <span className="lh-lesson-arrow">▶</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {ielts.length > 0 && (
                <div className="lh-level-section">
                    <div className="lh-level-header"><h3>🎤 {adult ? 'IELTS Speaking' : 'Phỏng vấn'}</h3><span className="lh-level-desc">{adult ? 'Mock speaking test practice' : 'Luyện phỏng vấn'}</span></div>
                    <div className="lh-lesson-grid">
                        {ielts.map(l => (
                            <div key={l.id} className="lh-lesson-card" onClick={() => setActiveLesson(l)}>
                                <span className="lh-lesson-emoji">{l.emoji}</span>
                                <div className="lh-lesson-info"><h4>{l.title}</h4><p className="lh-lesson-title-vi">{l.titleVi}</p><div className="lh-lesson-meta"><span>{l.level}</span><span>Part {l.part}</span></div></div>
                                <span className="lh-lesson-arrow">▶</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Speaking Exercise Component — handles both Shadowing & IELTS
function SpeakingExercise({ lesson, onBack, adult }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedText, setRecordedText] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [scores, setScores] = useState([]);
    const recognitionRef = useRef(null);

    const items = lesson.type === 'shadowing' ? lesson.sentences
        : lesson.type === 'ielts_speaking' ? (lesson.questions || [{ question: lesson.cueCard?.topic || '' }])
            : [];
    const current = items[currentIdx];

    const speakText = useCallback((text) => {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US'; u.rate = 0.9;
        const allVoices = window.speechSynthesis.getVoices();
        const enVoice = allVoices.find(voice => voice.lang.startsWith('en-US')) || allVoices.find(voice => voice.lang.startsWith('en'));
        if (enVoice) u.voice = enVoice;
        window.speechSynthesis.speak(u);
    }, []);

    const startRecording = () => {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            alert('Speech Recognition not supported on this browser. Use Chrome.');
            return;
        }
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const rec = new SR();
        rec.lang = 'en-US'; rec.interimResults = false; rec.maxAlternatives = 1;
        rec.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setRecordedText(transcript);
            setIsRecording(false);
            // Score comparison
            const original = (current.text || current.question || '').toLowerCase().replace(/[^a-z0-9\s]/g, '');
            const spoken = transcript.toLowerCase().replace(/[^a-z0-9\s]/g, '');
            const origWords = original.split(/\s+/);
            const spokenWords = spoken.split(/\s+/);
            const matched = origWords.filter(w => spokenWords.includes(w)).length;
            const accuracy = Math.round((matched / Math.max(origWords.length, 1)) * 100);
            setScores(prev => [...prev, accuracy]);
            setShowResult(true);
        };
        rec.onerror = () => setIsRecording(false);
        rec.onend = () => setIsRecording(false);
        recognitionRef.current = rec;
        rec.start();
        setIsRecording(true);
        setRecordedText('');
        setShowResult(false);
    };

    const stopRecording = () => {
        recognitionRef.current?.stop();
        setIsRecording(false);
    };

    const handleNext = () => {
        if (currentIdx + 1 >= items.length) {
            setCurrentIdx(0);
            setShowResult(false);
            setRecordedText('');
        } else {
            setCurrentIdx(i => i + 1);
            setShowResult(false);
            setRecordedText('');
        }
    };

    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    return (
        <div className="speaking-exercise page">
            <div className="ll-header">
                <button className="ll-back" onClick={onBack}>←</button>
                <div className="ll-title-group">
                    <h2 className="ll-title">{lesson.emoji} {lesson.title}</h2>
                    <div className="ll-meta">
                        <span className="ll-badge level">{lesson.level}</span>
                        <span className="ll-badge topic">{lesson.type === 'shadowing' ? 'Shadowing' : `Part ${lesson.part}`}</span>
                        {scores.length > 0 && <span className="ll-badge duration">Avg: {avgScore}%</span>}
                    </div>
                </div>
            </div>

            <div className="sp-progress">
                <span>Câu {currentIdx + 1} / {items.length}</span>
                <div className="dictation-progress-bar"><div className="dictation-progress-fill" style={{ width: `${((currentIdx + 1) / items.length) * 100}%` }} /></div>
            </div>

            {/* IELTS Cue Card */}
            {lesson.cueCard && lesson.type === 'ielts_speaking' && lesson.part === 2 && (
                <div className="sp-cue-card">
                    <h3>📋 Cue Card</h3>
                    <p className="sp-cue-topic">{lesson.cueCard.topic}</p>
                    <ul>{lesson.cueCard.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
                    <p className="sp-cue-time">⏱️ You have 1 minute to prepare and 2 minutes to speak.</p>
                </div>
            )}

            {/* Current sentence/question */}
            <div className="sp-sentence-card">
                <p className="sp-sentence-text">{current?.text || current?.question}</p>
                {current?.textVi && <p className="sp-sentence-vi">🇻🇳 {current.textVi}</p>}
                {current?.tip && <p className="sp-tip">💡 {current.tip}</p>}

                <div className="sp-controls">
                    <button className="dict-play-btn" onClick={() => speakText(current?.text || current?.question)}>
                        🔊 {adult ? 'Listen' : 'Nghe mẫu'}
                    </button>
                    {!isRecording ? (
                        <button className="sp-record-btn" onClick={startRecording}>
                            🎙️ {adult ? 'Record' : 'Ghi âm'}
                        </button>
                    ) : (
                        <button className="sp-record-btn recording" onClick={stopRecording}>
                            ⏹️ {adult ? 'Stop' : 'Dừng'}
                        </button>
                    )}
                </div>

                {showResult && (
                    <div className="sp-result">
                        <div className={`dictation-accuracy ${scores[scores.length - 1] >= 80 ? 'good' : scores[scores.length - 1] >= 50 ? 'ok' : 'poor'}`}>
                            {scores[scores.length - 1]}% Match
                        </div>
                        <div className="sp-your-speech">
                            <strong>{adult ? 'Your speech:' : 'Bạn nói:'}</strong>
                            <p>{recordedText || '(Could not detect speech)'}</p>
                        </div>
                        <button className="dictation-next-btn" onClick={handleNext}>
                            {currentIdx + 1 >= items.length ? '🔁 Làm lại' : '→ Câu tiếp'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

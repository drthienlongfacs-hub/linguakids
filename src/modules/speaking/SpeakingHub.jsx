import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getSpeakingByMode } from '../../data/speaking';
import { isAdultMode } from '../../utils/userMode';
import ShadowingEngine from './ShadowingEngine';
import SpeakingExercise from './SpeakingExercise';

export default function SpeakingHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const lessons = getSpeakingByMode(state.userMode);
    const [activeLesson, setActiveLesson] = useState(null);
    const [currentIdx, setCurrentIdx] = useState(0);

    // ===== Shadowing lesson → use ShadowingEngine =====
    if (activeLesson && activeLesson.type === 'shadowing') {
        const items = activeLesson.sentences || [];
        const current = items[currentIdx];
        const handleNext = () => {
            if (currentIdx + 1 >= items.length) { setCurrentIdx(0); setActiveLesson(null); }
            else setCurrentIdx(i => i + 1);
        };
        return (
            <div className="speaking-exercise page">
                <div className="ll-header">
                    <button className="ll-back" onClick={() => { setActiveLesson(null); setCurrentIdx(0); }}>←</button>
                    <div className="ll-title-group">
                        <h2 className="ll-title">{activeLesson.emoji} {activeLesson.title}</h2>
                        <div className="ll-meta">
                            <span className="ll-badge level">{activeLesson.level}</span>
                            <span className="ll-badge topic">Shadowing</span>
                            <span className="ll-badge duration">{currentIdx + 1}/{items.length}</span>
                        </div>
                    </div>
                </div>
                <div className="sp-progress">
                    <div className="dictation-progress-bar"><div className="dictation-progress-fill" style={{ width: `${((currentIdx + 1) / items.length) * 100}%` }} /></div>
                </div>
                <ShadowingEngine
                    key={currentIdx}
                    text={current?.text || ''}
                    textVi={current?.textVi}
                    lang="en"
                    onComplete={() => handleNext()}
                />
            </div>
        );
    }

    // ===== IELTS / other speaking → use SpeakingExercise =====
    if (activeLesson) {
        return <SpeakingExercise lesson={activeLesson} onBack={() => setActiveLesson(null)} adult={adult} />;
    }

    // ===== Lesson list =====
    const shadowing = lessons.filter(l => l.type === 'shadowing');
    const ielts = lessons.filter(l => l.type === 'ielts_speaking');
    const pronunciation = lessons.filter(l => l.type === 'pronunciation');

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
                            <div key={l.id} className="lh-lesson-card" onClick={() => { setActiveLesson(l); setCurrentIdx(0); }}>
                                <span className="lh-lesson-emoji">{l.emoji}</span>
                                <div className="lh-lesson-info"><h4>{l.title}</h4><p className="lh-lesson-title-vi">{l.titleVi}</p><div className="lh-lesson-meta"><span>{l.level}</span><span>{l.sentences?.length || 0} câu</span></div></div>
                                <span className="lh-lesson-arrow">▶</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {pronunciation.length > 0 && (
                <div className="lh-level-section">
                    <div className="lh-level-header"><h3>🎯 {adult ? 'Pronunciation' : 'Phát âm'}</h3><span className="lh-level-desc">{adult ? 'Practice individual sounds' : 'Luyện phát âm từng âm'}</span></div>
                    <div className="lh-lesson-grid">
                        {pronunciation.map(l => (
                            <div key={l.id} className="lh-lesson-card" onClick={() => { setActiveLesson(l); setCurrentIdx(0); }}>
                                <span className="lh-lesson-emoji">{l.emoji}</span>
                                <div className="lh-lesson-info"><h4>{l.title}</h4><p className="lh-lesson-title-vi">{l.titleVi}</p><div className="lh-lesson-meta"><span>{l.level}</span></div></div>
                                <span className="lh-lesson-arrow">▶</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {ielts.length > 0 && (
                <div className="lh-level-section">
                    <div className="lh-level-header"><h3>🎤 {adult ? 'IELTS Speaking' : 'Phỏng vấn'}</h3><span className="lh-level-desc">{adult ? 'Mock speaking test — Parts 1, 2 & 3' : 'Luyện phỏng vấn'}</span></div>
                    {[1, 2, 3].map(part => {
                        const partLessons = ielts.filter(l => l.part === part);
                        if (partLessons.length === 0) return null;
                        const partLabels = { 1: 'Part 1: Introduction & Interview', 2: 'Part 2: Long Turn (Cue Card)', 3: 'Part 3: Two-Way Discussion' };
                        return (
                            <div key={part} style={{ marginBottom: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <span style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: 600 }}>{partLabels[part]}</span>
                                </div>
                                <div className="lh-lesson-grid">
                                    {partLessons.map(l => (
                                        <div key={l.id} className="lh-lesson-card" onClick={() => { setActiveLesson(l); setCurrentIdx(0); }}>
                                            <span className="lh-lesson-emoji">{l.emoji}</span>
                                            <div className="lh-lesson-info"><h4>{l.title}</h4><p className="lh-lesson-title-vi">{l.titleVi}</p><div className="lh-lesson-meta"><span>{l.level}</span><span>Part {l.part}</span></div></div>
                                            <span className="lh-lesson-arrow">▶</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

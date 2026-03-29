import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getSpeakingByMode } from '../../data/speaking';
import { isAdultMode } from '../../utils/userMode';
import ShadowingEngine from './ShadowingEngine';
import SpeakingExercise from './SpeakingExercise';
import CapabilityNotice from '../../components/CapabilityNotice';
import { useDeviceCapabilities } from '../../hooks/useDeviceCapabilities';

export default function SpeakingHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const { readiness } = useDeviceCapabilities();
    const lessons = getSpeakingByMode(state.userMode);
    const shadowingLessons = lessons.filter(l => l.type === 'shadowing');
    const totalShadowingSentences = shadowingLessons.reduce(
        (sum, lesson) => sum + (lesson.sentences?.length || 0),
        0
    );
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
    const shadowing = shadowingLessons;
    const ielts = lessons.filter(l => l.type === 'ielts_speaking');
    const pronunciation = lessons.filter(l => l.type === 'pronunciation');
    const stats = adult
        ? [
            { value: lessons.length, label: 'Exercises' },
            { value: shadowing.length, label: 'Shadowing Sets' },
            { value: '🎤', label: 'Voice Rec.' },
        ]
        : [
            { value: lessons.length, label: 'Chủ đề' },
            { value: totalShadowingSentences, label: 'Câu nói' },
            { value: 'A1-A2', label: 'Khung CEFR' },
        ];

    return (
        <div className="speaking-hub page">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/')}>←</button>
                <h2 className="lh-title">🗣️ {adult ? 'Speaking Practice' : 'Luyện Nói'}</h2>
            </div>
            <p className="lh-subtitle">
                {adult
                    ? 'Improve your speaking with shadowing, pronunciation drills, and IELTS speaking practice.'
                    : `Luyện nói tiếng Anh cùng bé với ${totalShadowingSentences} câu shadowing theo CEFR A1-A2 và Cambridge YLE.`}
            </p>

            <CapabilityNotice
                icon="🎙️"
                title={adult ? 'Speech capture status' : 'Trạng thái nhận diện giọng nói'}
                badge={readiness.speechInput.badge}
                tone={readiness.speechInput.status === 'supported' ? 'success' : 'warn'}
                summary={readiness.speechInput.summary}
                compact
            />

            <div className="lh-stats">
                {stats.map(stat => (
                    <div key={stat.label} className="lh-stat">
                        <span className="lh-stat-number">{stat.value}</span>
                        <span className="lh-stat-label">{stat.label}</span>
                    </div>
                ))}
            </div>

            {!adult && (
                <div className="lh-curriculum-note">
                    <div className="lh-curriculum-copy">
                        <strong>Khung bài nói chuẩn</strong>
                        <p>
                            Bộ câu được biên soạn lại theo nhóm chủ đề Starters/Movers và descriptor nói A1-A2,
                            ưu tiên câu ngắn, tần suất cao, phù hợp trẻ em.
                        </p>
                    </div>
                    <div className="lh-curriculum-kpi">
                        <strong>{totalShadowingSentences}</strong>
                        <span>câu đang dùng</span>
                    </div>
                </div>
            )}

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

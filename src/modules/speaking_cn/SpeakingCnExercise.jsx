// SpeakingCnExercise — CN Speaking exercise page (route: /speaking-cn/:lessonId)
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { getCnSpeakingByMode } from '../../data/speaking_cn';
import { isAdultMode } from '../../utils/userMode';
import ShadowingEngine from '../speaking/ShadowingEngine';
import SpeakingExercise from '../speaking/SpeakingExercise';

function flattenToneDrillLesson(lesson) {
    const drills = (lesson.drills || []).map((drill, index) => ({
        id: `drill-${index}-${drill.char}-${drill.pinyin}`,
        text: drill.char,
        pinyin: drill.pinyin,
        textVi: drill.meaning,
        note: drill.tip,
    }));

    const tonePairs = (lesson.tonePairs || []).flatMap((pairGroup, groupIndex) => (
        (pairGroup.words || []).map((word, wordIndex) => ({
            id: `tone-pair-${groupIndex}-${wordIndex}-${word.chars}`,
            text: word.chars,
            pinyin: word.pinyin,
            textVi: word.meaning,
            note: `Luyện cặp thanh ${pairGroup.pair}`,
        }))
    ));

    return [...drills, ...tonePairs];
}

export default function SpeakingCnExercise() {
    const navigate = useNavigate();
    const { lessonId } = useParams();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const lessons = getCnSpeakingByMode(state.userMode);
    const lesson = lessons.find(l => l.id === lessonId);
    const [currentIdx, setCurrentIdx] = useState(0);

    if (!lesson) {
        return (
            <div className="page" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '2rem' }}>😕</p>
                <p>Bài học không tìm thấy</p>
                <button className="dictation-next-btn" onClick={() => navigate('/speaking-cn')}>← Quay lại</button>
            </div>
        );
    }

    if (lesson.type === 'tone_drill') {
        const items = flattenToneDrillLesson(lesson);
        const current = items[currentIdx];
        const handleNext = () => {
            if (currentIdx + 1 >= items.length) { setCurrentIdx(0); navigate('/speaking-cn'); }
            else setCurrentIdx(i => i + 1);
        };

        return (
            <div className="speaking-exercise page">
                <div className="ll-header">
                    <button className="ll-back" onClick={() => navigate('/speaking-cn')}>←</button>
                    <div className="ll-title-group">
                        <h2 className="ll-title">{lesson.emoji} {lesson.title}</h2>
                        <div className="ll-meta">
                            <span className="ll-badge level">{lesson.level}</span>
                            <span className="ll-badge topic">Tone Drill 声调</span>
                            <span className="ll-badge duration">{currentIdx + 1}/{items.length}</span>
                        </div>
                    </div>
                </div>
                <div className="sp-progress">
                    <div className="dictation-progress-bar"><div className="dictation-progress-fill" style={{ width: `${((currentIdx + 1) / items.length) * 100}%` }} /></div>
                </div>
                {current?.note && (
                    <div style={{
                        marginBottom: '12px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(245,158,11,0.08)',
                        border: '1px solid rgba(245,158,11,0.2)',
                        fontSize: '0.85rem',
                        lineHeight: 1.45,
                    }}>
                        <strong style={{ display: 'block', marginBottom: '4px' }}>Gợi ý thanh điệu</strong>
                        {current.note}
                    </div>
                )}
                <ShadowingEngine
                    key={current?.id || currentIdx}
                    text={current?.text || ''}
                    textVi={current?.textVi}
                    pinyin={current?.pinyin}
                    lang="cn"
                    onComplete={handleNext}
                />
            </div>
        );
    }

    // Shadowing → use ShadowingEngine
    if (lesson.type === 'shadowing') {
        const items = lesson.sentences || [];
        const current = items[currentIdx];
        const handleNext = () => {
            if (currentIdx + 1 >= items.length) { setCurrentIdx(0); navigate('/speaking-cn'); }
            else setCurrentIdx(i => i + 1);
        };
        return (
            <div className="speaking-exercise page">
                <div className="ll-header">
                    <button className="ll-back" onClick={() => navigate('/speaking-cn')}>←</button>
                    <div className="ll-title-group">
                        <h2 className="ll-title">{lesson.emoji} {lesson.title}</h2>
                        <div className="ll-meta">
                            <span className="ll-badge level">{lesson.level}</span>
                            <span className="ll-badge topic">Shadowing 跟读</span>
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
                    pinyin={current?.pinyin}
                    lang="cn"
                    onComplete={() => handleNext()}
                />
            </div>
        );
    }

    // Tone drill / conversation → use SpeakingExercise (supports zh-CN)
    const enrichedLesson = { ...lesson, lang: 'cn' };
    return <SpeakingExercise lesson={enrichedLesson} onBack={() => navigate('/speaking-cn')} adult={adult} />;
}

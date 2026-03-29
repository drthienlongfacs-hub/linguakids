// VideoLesson.jsx — Interactive Video Learning Hub (Track B)
// 120+ curated YouTube videos across 4 CEFR levels
// Pattern: Browse Level → Category → Video → Watch → Quiz → XP

import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { isAdultMode } from '../utils/userMode';
import CelebrationOverlay from '../components/CelebrationOverlay';

// Import curriculum data
import { LEVEL_1_KIDS } from '../data/videoCurriculum';
import { LEVEL_2_BEGINNER } from '../data/videoCurriculumL2';
import { LEVEL_3_INTERMEDIATE, LEVEL_4_ADVANCED } from '../data/videoCurriculumL3L4';

const ALL_LEVELS = [LEVEL_1_KIDS, LEVEL_2_BEGINNER, LEVEL_3_INTERMEDIATE, LEVEL_4_ADVANCED];

// Count total videos across all levels
const totalVideos = ALL_LEVELS.reduce((a, lv) => a + lv.categories.reduce((b, c) => b + c.videos.length, 0), 0);
const totalQuizzes = ALL_LEVELS.reduce((a, lv) => a + lv.categories.reduce((b, c) => b + c.videos.reduce((d, v) => d + (v.quiz?.length || 0), 0), 0), 0);

export default function VideoLesson() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);

    const [selectedLevel, setSelectedLevel] = useState(null);
    const [selectedCat, setSelectedCat] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);
    const [quizMode, setQuizMode] = useState(false);
    const [quizIdx, setQuizIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(null);
    const [quizDone, setQuizDone] = useState(false);
    const [celebration, setCelebration] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const iframeRef = useRef(null);

    const startQuiz = useCallback(() => {
        setQuizMode(true); setQuizIdx(0); setScore(0); setAnswered(null); setQuizDone(false);
    }, []);

    const answerQuiz = useCallback((optIdx) => {
        if (answered !== null) return;
        const correct = optIdx === activeVideo.quiz[quizIdx].answer;
        setAnswered(optIdx);
        if (correct) setScore(s => s + 1);
        setTimeout(() => {
            if (quizIdx + 1 < activeVideo.quiz.length) {
                setQuizIdx(i => i + 1); setAnswered(null);
            } else {
                setQuizDone(true);
                const finalScore = correct ? score + 1 : score;
                const pct = finalScore / activeVideo.quiz.length;
                if (pct === 1) setCelebration({ type: 'perfect' });
                else if (pct >= 0.7) setCelebration({ type: 'correct' });
            }
        }, 1200);
    }, [answered, quizIdx, activeVideo, score]);

    // ============ SEARCH across all levels ============
    const searchResults = searchQuery.trim().length >= 2 ? ALL_LEVELS.flatMap(lv =>
        lv.categories.flatMap(cat =>
            cat.videos.filter(v => {
                const q = searchQuery.toLowerCase();
                return v.title.toLowerCase().includes(q) || v.titleVi.toLowerCase().includes(q) ||
                    (v.channel || '').toLowerCase().includes(q) || cat.title.toLowerCase().includes(q);
            }).map(v => ({ ...v, levelTitle: lv.title, catTitle: cat.title, catIcon: cat.icon, levelColor: lv.color }))
        )
    ).slice(0, 20) : [];

    // ============ LEVEL BROWSER ============
    if (!selectedLevel && !searchQuery.trim()) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate(-1)}>←</button>
                    <h2 className="page-header__title">🎬 {adult ? 'Video Library' : 'Thư viện Video'}</h2>
                </div>
                {/* Search bar */}
                <div style={{ position: 'relative', marginBottom: '14px' }}>
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder={adult ? '🔍 Search videos, channels...' : '🔍 Tìm video, kênh...'}
                        style={{
                            width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--color-border)',
                            background: 'var(--color-bg)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
                        }} />
                </div>
                {/* Stats */}
                <div style={{
                    display: 'flex', justifyContent: 'space-around', padding: '12px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff', marginBottom: '14px',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{totalVideos}</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{adult ? 'Videos' : 'Video'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{totalQuizzes}</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{adult ? 'Quizzes' : 'Câu hỏi'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>4</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{adult ? 'Levels' : 'Cấp độ'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>15+</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{adult ? 'Channels' : 'Kênh'}</div>
                    </div>
                </div>
                {/* Levels */}
                <div style={{ display: 'grid', gap: '10px' }}>
                    {ALL_LEVELS.map(lv => {
                        const vCount = lv.categories.reduce((a, c) => a + c.videos.length, 0);
                        return (
                            <div key={lv.id} className="glass-card" onClick={() => setSelectedLevel(lv)}
                                style={{ padding: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: `4px solid ${lv.color}` }}>
                                <div style={{ fontSize: '2rem' }}>{lv.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{adult ? lv.title : lv.titleVi}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                        {lv.level} · {lv.ageRange} · {vCount} {adult ? 'videos' : 'video'} · {lv.categories.length} {adult ? 'topics' : 'chủ đề'}
                                    </div>
                                </div>
                                <span style={{ fontSize: '1.2rem', color: lv.color }}>▶</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ============ SEARCH RESULTS ============
    if (searchQuery.trim().length >= 2) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => setSearchQuery('')}>←</button>
                    <h2 className="page-header__title">🔍 {searchResults.length} {adult ? 'results' : 'kết quả'}</h2>
                </div>
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }} />
                <div style={{ display: 'grid', gap: '8px' }}>
                    {searchResults.map(v => (
                        <div key={v.id} className="glass-card" onClick={() => { setActiveVideo(v); setQuizMode(false); setQuizDone(false); setSearchQuery(''); }}
                            style={{ padding: '12px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <div style={{ width: '48px', height: '36px', borderRadius: '6px', background: `${v.levelColor}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{v.catIcon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adult ? v.title : v.titleVi}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)' }}>{v.channel} · {v.levelTitle} · {v.catTitle}</div>
                            </div>
                        </div>
                    ))}
                    {searchResults.length === 0 && <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.82rem', padding: '20px' }}>{adult ? 'No videos found' : 'Không tìm thấy video'}</p>}
                </div>
            </div>
        );
    }

    // ============ CATEGORY BROWSER ============
    if (selectedLevel && !selectedCat) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => setSelectedLevel(null)}>←</button>
                    <h2 className="page-header__title">{selectedLevel.icon} {adult ? selectedLevel.title : selectedLevel.titleVi}</h2>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                    {selectedLevel.level} · {selectedLevel.ageRange}
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {selectedLevel.categories.map(cat => (
                        <div key={cat.id} className="glass-card" onClick={() => setSelectedCat(cat)}
                            style={{ padding: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', borderLeft: `4px solid ${cat.color}` }}>
                            <div style={{ fontSize: '1.8rem' }}>{cat.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{adult ? cat.title : cat.titleVi}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                    {cat.videos.length} {adult ? 'videos' : 'video'}
                                </div>
                            </div>
                            <span style={{ fontSize: '1rem', color: cat.color }}>▶</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ============ VIDEO LIST ============
    if (selectedCat && !activeVideo) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => setSelectedCat(null)}>←</button>
                    <h2 className="page-header__title">{selectedCat.icon} {adult ? selectedCat.title : selectedCat.titleVi}</h2>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                    {selectedCat.videos.map((v, idx) => (
                        <div key={v.id} className="glass-card" onClick={() => { setActiveVideo(v); setQuizMode(false); setQuizDone(false); }}
                            style={{ padding: '12px', cursor: 'pointer', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{
                                width: '70px', height: '48px', borderRadius: '8px', flexShrink: 0,
                                background: `linear-gradient(135deg, ${selectedCat.color}22, ${selectedCat.color}44)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', position: 'relative',
                            }}>
                                ▶
                                <span style={{ position: 'absolute', bottom: '2px', right: '4px', fontSize: '0.5rem', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '1px 4px', borderRadius: '3px' }}>{v.duration}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{adult ? v.title : v.titleVi}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                    {v.channel} · {v.quiz?.length || 0} {adult ? 'quiz' : 'câu hỏi'}
                                </div>
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', fontWeight: 600 }}>#{idx + 1}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ============ VIDEO PLAYER + QUIZ ============
    if (!activeVideo) return null;
    return (
        <div className="page" style={{ padding: '0' }}>
            <div style={{ padding: '10px 16px', background: 'var(--color-card)', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid var(--color-border)' }}>
                <button onClick={() => { setActiveVideo(null); setQuizMode(false); }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1.2rem', cursor: 'pointer' }}>←</button>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adult ? activeVideo.title : activeVideo.titleVi}</div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--color-text-light)' }}>{activeVideo.channel} · {activeVideo.duration}</div>
                </div>
            </div>

            {!quizMode && (
                <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: '#000' }}>
                    <iframe ref={iframeRef}
                        src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?rel=0&modestbranding=1`}
                        title={activeVideo.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
            )}

            {!quizMode && !quizDone && activeVideo.quiz?.length > 0 && (
                <div style={{ padding: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                        {adult ? '👆 Watch the video, then take the quiz!' : '👆 Xem video, rồi làm quiz!'}
                    </p>
                    <button onClick={startQuiz} style={{
                        padding: '12px 32px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #4F46E5, #6366F1)', color: '#fff',
                        fontSize: '0.95rem', fontWeight: 700, boxShadow: '0 4px 12px rgba(79,70,229,0.3)',
                    }}>📝 {adult ? 'Take Quiz' : 'Làm Quiz'} ({activeVideo.quiz.length} {adult ? 'Q' : 'câu'})</button>
                </div>
            )}

            {quizMode && !quizDone && (
                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                        {activeVideo.quiz.map((_, i) => (
                            <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < quizIdx ? '#22C55E' : i === quizIdx ? 'var(--color-primary)' : 'var(--color-border)', transition: 'background 0.3s' }} />
                        ))}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '4px', fontWeight: 600 }}>
                        {adult ? `Question ${quizIdx + 1}/${activeVideo.quiz.length}` : `Câu ${quizIdx + 1}/${activeVideo.quiz.length}`}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.4 }}>
                        {adult ? activeVideo.quiz[quizIdx].q : activeVideo.quiz[quizIdx].qVi}
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {activeVideo.quiz[quizIdx].options.map((opt, oi) => {
                            const isCorrect = oi === activeVideo.quiz[quizIdx].answer;
                            const isChosen = answered === oi;
                            let bg = 'var(--color-card)', border = '1px solid var(--color-border)';
                            if (answered !== null) {
                                if (isCorrect) { bg = 'rgba(34,197,94,0.15)'; border = '2px solid #22C55E'; }
                                else if (isChosen) { bg = 'rgba(239,68,68,0.1)'; border = '2px solid #EF4444'; }
                            }
                            return (
                                <button key={oi} onClick={() => answerQuiz(oi)} disabled={answered !== null}
                                    style={{ padding: '12px 16px', borderRadius: '12px', border, background: bg, fontSize: '0.9rem', fontWeight: 600, cursor: answered !== null ? 'default' : 'pointer', color: 'var(--color-text)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: answered !== null && isCorrect ? '#22C55E' : answered !== null && isChosen ? '#EF4444' : 'var(--color-bg)', color: answered !== null && (isCorrect || isChosen) ? '#fff' : 'var(--color-text)', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                                        {answered !== null && isCorrect ? '✓' : answered !== null && isChosen ? '✗' : String.fromCharCode(65 + oi)}
                                    </span>
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {quizDone && (
                <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{score === activeVideo.quiz.length ? '🏆' : score >= activeVideo.quiz.length * 0.7 ? '⭐' : '💪'}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>{score}/{activeVideo.quiz.length} {adult ? 'Correct!' : 'Đúng!'}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginBottom: '16px' }}>+{Math.round((score / activeVideo.quiz.length) * 15)} XP</div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button onClick={() => { setQuizMode(false); setQuizDone(false); }}
                            style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                            🔄 {adult ? 'Watch Again' : 'Xem lại'}
                        </button>
                        <button onClick={() => { setActiveVideo(null); setQuizMode(false); setQuizDone(false); }}
                            style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                            ➡️ {adult ? 'Next Video' : 'Video tiếp'}
                        </button>
                    </div>
                </div>
            )}

            {celebration && <CelebrationOverlay type={celebration.type} onDone={() => setCelebration(null)} />}
        </div>
    );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import CelebrationOverlay from '../components/CelebrationOverlay';
import { useGame } from '../context/GameStateContext';
import {
    flattenPublicVideoLessons,
    formatVideoLessonDuration,
    getCanonicalPosterSource,
    getCanonicalVideoSource,
    getLessonCaptionTrack,
    getLessonFocusVocabulary,
    getLessonObjectives,
    getLessonPracticeBlocks,
    getLessonQuizQuestions,
    getLessonReviewBadge,
    getLessonScriptSegments,
    getLessonSubtitleLabel,
    getLessonSubtitleVariant,
    getPublicVideoLevels,
    getVideoReferenceLink,
    loadVideoLessonManifest,
    loadVideoLessonOps,
} from '../services/videoLessonManifestService';
import { recordVideoLessonTelemetry } from '../services/videoLessonTelemetryService';
import { getRuntimeMode } from '../utils/runtimeMode';
import { isAdultMode } from '../utils/userMode';

function LoadingState({ adult }) {
    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" type="button">←</button>
                <h2 className="page-header__title">🎬 {adult ? 'Video Library' : 'Thu vien Video'}</h2>
            </div>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '12px' }}>🎬</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}>
                    {adult ? 'Loading approved video manifest...' : 'Dang tai manifest video da kiem duyet...'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                    {adult ? 'Only public, in-app compatible lessons will be shown.' : 'Chi nhung lesson public va phat duoc trong app moi duoc hien.'}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ adult, hiddenCount, runtimeMode, onBack, opsSummary, onOpenReviewQueue }) {
    const runtimeLabel = runtimeMode === 'standalone_pwa'
        ? (adult ? 'standalone PWA' : 'PWA doc lap')
        : (adult ? 'browser tab' : 'trinh duyet');

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" type="button" onClick={onBack}>←</button>
                <h2 className="page-header__title">🎬 {adult ? 'Video Library' : 'Thu vien Video'}</h2>
            </div>
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>🛡️</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '8px' }}>
                    {adult ? 'No public video lessons are approved yet' : 'Chua co video lesson public dat chuan'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', lineHeight: 1.6 }}>
                    {adult
                        ? `The old YouTube embeds were retired. Lessons stay hidden until a licensed or CC replacement can stream inside the app on ${runtimeLabel}.`
                        : `YouTube embed cu da duoc rut khoi public. Lesson se duoc mo lai khi co nguon hop le, phat duoc ngay trong ${runtimeLabel}.`}
                </div>
                <div style={{
                    marginTop: '16px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: 'rgba(79,70,229,0.08)',
                    color: 'var(--color-text)',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                }}>
                    <strong>{adult ? 'Hidden lessons:' : 'Lesson dang an:'}</strong> {hiddenCount}
                    <br />
                    <strong>{adult ? 'Candidate:' : 'Ung vien:'}</strong> {opsSummary?.statusCounts?.candidate || 0}
                    <br />
                    <strong>{adult ? 'Review queue:' : 'Hang duyet:'}</strong> {opsSummary?.statusCounts?.review_queue || 0}
                    <br />
                    <strong>{adult ? 'Blocked:' : 'Bi chan:'}</strong> {opsSummary?.statusCounts?.blocked || 0}
                    <br />
                    <strong>{adult ? 'Release policy:' : 'Chinh sach release:'}</strong>{' '}
                    {adult
                        ? 'Only approved CDN-backed videos can be public.'
                        : 'Chi video da duoc kiem duyet va host tren CDN moi duoc public.'}
                </div>
                <button
                    type="button"
                    onClick={onOpenReviewQueue}
                    style={{
                        marginTop: '14px',
                        padding: '10px 16px',
                        borderRadius: '12px',
                        border: 'none',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    {adult ? 'Open Review Queue' : 'Mo hang duyet'}
                </button>
            </div>
        </div>
    );
}

function formatQuizCount(adult, count) {
    return adult ? `${count} quiz` : `${count} cau hoi`;
}

const STAGE_LABELS = {
    preview: { en: 'Preview', vi: 'Du doan' },
    while_watch: { en: 'While Watching', vi: 'Luc xem' },
    notice: { en: 'Notice', vi: 'Nhan ra' },
    detail: { en: 'Detail', vi: 'Chi tiet' },
    retrieve: { en: 'Retrieve', vi: 'Goi lai' },
    transfer: { en: 'Transfer', vi: 'Van dung' },
};

function getStageLabel(stage, adult) {
    const label = STAGE_LABELS[stage];
    if (!label) {
        return adult ? 'Practice' : 'Luyen tap';
    }

    return adult ? label.en : label.vi;
}

function getLocalizedLine(entry, adult) {
    if (!entry) return '';
    return adult ? (entry.en || entry.vi || '') : (entry.vi || entry.en || '');
}

export default function VideoLesson() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const runtimeMode = getRuntimeMode();

    const [manifestState, setManifestState] = useState({
        status: 'loading',
        manifest: null,
        error: null,
    });
    const [opsState, setOpsState] = useState({
        status: 'loading',
        ops: null,
        error: null,
    });
    const [selectedLevelId, setSelectedLevelId] = useState(null);
    const [selectedCatId, setSelectedCatId] = useState(null);
    const [activeVideoId, setActiveVideoId] = useState(null);
    const [quizMode, setQuizMode] = useState(false);
    const [quizIdx, setQuizIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [answered, setAnswered] = useState(null);
    const [quizDone, setQuizDone] = useState(false);
    const [celebration, setCelebration] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sourceStatus, setSourceStatus] = useState('idle');
    const [sourceError, setSourceError] = useState(null);
    const [subtitleViewMode, setSubtitleViewMode] = useState('dual');
    const videoRef = useRef(null);

    useEffect(() => {
        let active = true;

        loadVideoLessonManifest()
            .then((manifest) => {
                if (!active) return;
                setManifestState({
                    status: 'ready',
                    manifest,
                    error: null,
                });
            })
            .catch((error) => {
                if (!active) return;
                setManifestState({
                    status: 'error',
                    manifest: null,
                    error,
                });
            });

        loadVideoLessonOps()
            .then((ops) => {
                if (!active) return;
                setOpsState({
                    status: 'ready',
                    ops,
                    error: null,
                });
            })
            .catch((error) => {
                if (!active) return;
                setOpsState({
                    status: 'error',
                    ops: null,
                    error,
                });
            });

        return () => {
            active = false;
        };
    }, []);

    const publicLevels = useMemo(
        () => getPublicVideoLevels(manifestState.manifest),
        [manifestState.manifest]
    );
    const publicVideos = useMemo(
        () => flattenPublicVideoLessons(manifestState.manifest),
        [manifestState.manifest]
    );

    const selectedLevel = useMemo(
        () => publicLevels.find((level) => level.id === selectedLevelId) || null,
        [publicLevels, selectedLevelId]
    );
    const selectedCat = useMemo(
        () => selectedLevel?.categories.find((category) => category.id === selectedCatId) || null,
        [selectedLevel, selectedCatId]
    );
    const activeVideo = useMemo(
        () => publicVideos.find((video) => video.id === activeVideoId) || null,
        [publicVideos, activeVideoId]
    );
    const activeQuizQuestions = useMemo(
        () => getLessonQuizQuestions(activeVideo),
        [activeVideo]
    );
    const activeObjectives = useMemo(
        () => getLessonObjectives(activeVideo),
        [activeVideo]
    );
    const activeVocabulary = useMemo(
        () => getLessonFocusVocabulary(activeVideo),
        [activeVideo]
    );
    const activeScriptSegments = useMemo(
        () => getLessonScriptSegments(activeVideo),
        [activeVideo]
    );
    const activePracticeBlocks = useMemo(
        () => getLessonPracticeBlocks(activeVideo),
        [activeVideo]
    );

    const totalVideos = publicVideos.length;
    const totalQuizzes = publicVideos.reduce((sum, video) => sum + getLessonQuizQuestions(video).length, 0);
    const hiddenCount = manifestState.manifest?.summary?.hiddenLessonCount || 0;

    const searchResults = useMemo(() => {
        if (searchQuery.trim().length < 2) {
            return [];
        }

        const q = searchQuery.toLowerCase();
        return publicVideos
            .filter((video) => (
                video.title.toLowerCase().includes(q)
                || video.titleVi.toLowerCase().includes(q)
                || (video.channel || '').toLowerCase().includes(q)
                || video.category.title.toLowerCase().includes(q)
                || video.level.title.toLowerCase().includes(q)
            ))
            .slice(0, 20);
    }, [publicVideos, searchQuery]);

    function openVideo(video) {
        setSelectedLevelId(video.level.id);
        setSelectedCatId(video.category.id);
        setActiveVideoId(video.id);
        setQuizMode(false);
        setQuizIdx(0);
        setScore(0);
        setAnswered(null);
        setQuizDone(false);
        setSourceError(null);
        setSourceStatus(getCanonicalVideoSource(video) ? 'loading' : 'source_error');
        setSubtitleViewMode('dual');
        recordVideoLessonTelemetry('public_lesson_open', { lessonId: video.id });
    }

    function startQuiz() {
        if (sourceStatus !== 'playable' || activeQuizQuestions.length === 0) {
            return;
        }

        setQuizMode(true);
        setQuizIdx(0);
        setScore(0);
        setAnswered(null);
        setQuizDone(false);
        recordVideoLessonTelemetry('quiz_start', { lessonId: activeVideo?.id || null });
    }

    function answerQuiz(optIdx) {
        if (activeQuizQuestions.length === 0 || answered !== null) {
            return;
        }

        const correct = optIdx === activeQuizQuestions[quizIdx].answer;
        setAnswered(optIdx);
        if (correct) {
            setScore((value) => value + 1);
        }

        window.setTimeout(() => {
            if (quizIdx + 1 < activeQuizQuestions.length) {
                setQuizIdx((value) => value + 1);
                setAnswered(null);
                return;
            }

            setQuizDone(true);
            const finalScore = correct ? score + 1 : score;
            const pct = finalScore / activeQuizQuestions.length;
            recordVideoLessonTelemetry('quiz_complete', {
                lessonId: activeVideo?.id || null,
                score: finalScore,
                total: activeQuizQuestions.length,
            });
            if (pct === 1) {
                setCelebration({ type: 'perfect' });
            } else if (pct >= 0.7) {
                setCelebration({ type: 'correct' });
            }
        }, 1400);
    }

    function resetToVideo() {
        setQuizMode(false);
        setQuizDone(false);
        setAnswered(null);
        setQuizIdx(0);
    }

    const routeState = useMemo(() => {
        if (manifestState.status === 'loading') {
            return 'loading';
        }
        if (manifestState.status === 'error') {
            return 'error';
        }
        if (publicLevels.length === 0) {
            return 'empty';
        }
        return 'ready';
    }, [manifestState.status, publicLevels.length]);

    if (routeState === 'loading') {
        return <LoadingState adult={adult} />;
    }

    if (routeState === 'error') {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" type="button" onClick={() => navigate(-1)}>←</button>
                    <h2 className="page-header__title">🎬 {adult ? 'Video Library' : 'Thu vien Video'}</h2>
                </div>
                <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.8rem', marginBottom: '12px' }}>⚠️</div>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: '8px' }}>
                        {adult ? 'Could not load the video manifest' : 'Khong tai duoc manifest video'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginBottom: '14px' }}>
                        {manifestState.error?.message || (adult ? 'Unknown error' : 'Loi khong xac dinh')}
                    </div>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        style={{
                            padding: '10px 18px',
                            borderRadius: '12px',
                            border: 'none',
                            background: 'var(--color-primary)',
                            color: '#fff',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        {adult ? 'Reload' : 'Tai lai'}
                    </button>
                </div>
            </div>
        );
    }

    if (routeState === 'empty') {
        return (
            <EmptyState
                adult={adult}
                hiddenCount={hiddenCount}
                runtimeMode={runtimeMode}
                onBack={() => navigate(-1)}
                opsSummary={opsState.ops?.summary || null}
                onOpenReviewQueue={() => navigate('/video-lessons-review')}
            />
        );
    }

    if (searchQuery.trim().length >= 2) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" type="button" onClick={() => setSearchQuery('')}>←</button>
                    <h2 className="page-header__title">🔍 {searchResults.length} {adult ? 'results' : 'ket qua'}</h2>
                </div>
                <input
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    autoFocus
                    style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)',
                        fontSize: '0.85rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                        marginBottom: '12px',
                    }}
                />
                <div style={{ display: 'grid', gap: '8px' }}>
                    {searchResults.map((video) => (
                        <button
                            key={video.id}
                            type="button"
                            className="glass-card"
                            onClick={() => {
                                openVideo(video);
                                setSearchQuery('');
                            }}
                            style={{
                                padding: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                gap: '10px',
                                alignItems: 'center',
                                border: 'none',
                                textAlign: 'left',
                            }}
                        >
                            <div
                                style={{
                                    width: '48px',
                                    height: '36px',
                                    borderRadius: '6px',
                                    background: `${video.level.color}22`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    flexShrink: 0,
                                }}
                            >
                                {video.category.icon}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontWeight: 700,
                                        fontSize: '0.82rem',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {adult ? video.title : video.titleVi}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)' }}>
                                    {video.channel} · {video.level.title} · {video.category.title}
                                </div>
                            </div>
                        </button>
                    ))}
                    {searchResults.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.82rem', padding: '20px' }}>
                            {adult ? 'No public videos found' : 'Khong tim thay video public'}
                        </p>
                    ) : null}
                </div>
            </div>
        );
    }

    if (!selectedLevel) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" type="button" onClick={() => navigate(-1)}>←</button>
                    <h2 className="page-header__title">🎬 {adult ? 'Video Library' : 'Thu vien Video'}</h2>
                </div>
                <div style={{ position: 'relative', marginBottom: '14px' }}>
                    <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={adult ? '🔍 Search approved lessons...' : '🔍 Tim lesson da kiem duyet...'}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-bg)',
                            fontSize: '0.85rem',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    padding: '12px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                    color: '#fff',
                    marginBottom: '14px',
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{totalVideos}</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{adult ? 'Public videos' : 'Video public'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{totalQuizzes}</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{adult ? 'Quiz items' : 'Cau hoi'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{publicLevels.length}</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{adult ? 'Levels' : 'Cap do'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{hiddenCount}</div>
                        <div style={{ fontSize: '0.6rem', opacity: 0.8 }}>{adult ? 'Hidden' : 'Dang an'}</div>
                    </div>
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {publicLevels.map((level) => {
                        const levelVideoCount = level.categories.reduce((sum, category) => sum + category.lessons.length, 0);
                        return (
                            <button
                                key={level.id}
                                type="button"
                                className="glass-card"
                                onClick={() => setSelectedLevelId(level.id)}
                                style={{
                                    padding: '16px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    borderLeft: `4px solid ${level.color}`,
                                    borderTop: 'none',
                                    borderRight: 'none',
                                    borderBottom: 'none',
                                    textAlign: 'left',
                                }}
                            >
                                <div style={{ fontSize: '2rem' }}>{level.icon}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{adult ? level.title : level.titleVi}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                        {level.level} · {level.ageRange} · {levelVideoCount} {adult ? 'public videos' : 'video public'}
                                    </div>
                                </div>
                                <span style={{ fontSize: '1.2rem', color: level.color }}>▶</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    if (!selectedCat) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" type="button" onClick={() => setSelectedLevelId(null)}>←</button>
                    <h2 className="page-header__title">{selectedLevel.icon} {adult ? selectedLevel.title : selectedLevel.titleVi}</h2>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                    {selectedLevel.level} · {selectedLevel.ageRange}
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {selectedLevel.categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            className="glass-card"
                            onClick={() => setSelectedCatId(category.id)}
                            style={{
                                padding: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                borderLeft: `4px solid ${category.color}`,
                                borderTop: 'none',
                                borderRight: 'none',
                                borderBottom: 'none',
                                textAlign: 'left',
                            }}
                        >
                            <div style={{ fontSize: '1.8rem' }}>{category.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{adult ? category.title : category.titleVi}</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                    {category.lessons.length} {adult ? 'public videos' : 'video public'}
                                </div>
                            </div>
                            <span style={{ fontSize: '1rem', color: category.color }}>▶</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (!activeVideo) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" type="button" onClick={() => setSelectedCatId(null)}>←</button>
                    <h2 className="page-header__title">{selectedCat.icon} {adult ? selectedCat.title : selectedCat.titleVi}</h2>
                </div>
                <div style={{ display: 'grid', gap: '8px' }}>
                    {selectedCat.lessons.map((lesson, index) => (
                        <button
                            key={lesson.id}
                            type="button"
                            className="glass-card"
                            onClick={() => openVideo({ ...lesson, level: selectedLevel, category: selectedCat })}
                            style={{
                                padding: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                gap: '12px',
                                alignItems: 'center',
                                border: 'none',
                                textAlign: 'left',
                            }}
                        >
                            <div style={{
                                width: '70px',
                                height: '48px',
                                borderRadius: '8px',
                                flexShrink: 0,
                                background: `linear-gradient(135deg, ${selectedCat.color}22, ${selectedCat.color}44)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.3rem',
                                position: 'relative',
                            }}>
                                ▶
                                <span style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    right: '4px',
                                    fontSize: '0.5rem',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: '#fff',
                                    padding: '1px 4px',
                                    borderRadius: '3px',
                                }}
                                >
                                    {formatVideoLessonDuration(lesson.durationSeconds)}
                                </span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{adult ? lesson.title : lesson.titleVi}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                    {lesson.channel} · {formatQuizCount(adult, getLessonQuizQuestions(lesson).length)}
                                </div>
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', fontWeight: 600 }}>#{index + 1}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    const canonicalSrc = getCanonicalVideoSource(activeVideo);
    const posterSrc = getCanonicalPosterSource(activeVideo);
    const referenceLink = getVideoReferenceLink(activeVideo);
    const currentQuestion = activeQuizQuestions[quizIdx] || null;
    const sourceVerification = activeVideo.sourceVerification || null;
    const subtitleVariant = getLessonSubtitleVariant(activeVideo);
    const subtitleLabel = getLessonSubtitleLabel(activeVideo);
    const reviewBadge = getLessonReviewBadge(activeVideo);
    const captionTrackEn = getLessonCaptionTrack(activeVideo, 'en');
    const captionTrackVi = getLessonCaptionTrack(activeVideo, 'vi');

    return (
        <div className="page" style={{ padding: '0' }}>
            <div style={{
                padding: '10px 16px',
                background: 'var(--color-card)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderBottom: '1px solid var(--color-border)',
            }}>
                <button
                    type="button"
                    onClick={() => {
                        setActiveVideoId(null);
                        resetToVideo();
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--color-text)', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                    ←
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {adult ? activeVideo.title : activeVideo.titleVi}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: 'var(--color-text-light)' }}>
                        {activeVideo.channel} · {formatVideoLessonDuration(activeVideo.durationSeconds)}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        <span style={{
                            padding: '4px 8px',
                            borderRadius: '999px',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            background: reviewBadge.tone === 'approved' ? 'rgba(34,197,94,0.14)' : 'rgba(245,158,11,0.14)',
                            color: reviewBadge.tone === 'approved' ? '#166534' : '#92400E',
                        }}
                        >
                            {reviewBadge.label}
                        </span>
                        <span style={{
                            padding: '4px 8px',
                            borderRadius: '999px',
                            fontSize: '0.62rem',
                            fontWeight: 700,
                            background: 'rgba(79,70,229,0.12)',
                            color: 'var(--color-primary)',
                        }}
                        >
                            {subtitleLabel}
                        </span>
                    </div>
                </div>
            </div>

            {!quizMode ? (
                <div style={{ padding: '16px', display: 'grid', gap: '16px' }}>
                    <div style={{ position: 'relative', borderRadius: '18px', overflow: 'hidden', background: '#000' }}>
                        {canonicalSrc ? (
                            <video
                                ref={videoRef}
                                controls
                                playsInline
                                preload="metadata"
                                poster={posterSrc || undefined}
                                style={{ width: '100%', display: 'block', background: '#000' }}
                                onLoadStart={() => {
                                    setSourceStatus('loading');
                                    setSourceError(null);
                                }}
                                onCanPlay={() => {
                                    setSourceStatus('playable');
                                    setSourceError(null);
                                    recordVideoLessonTelemetry('video_source_playable', { lessonId: activeVideo.id });
                                }}
                                onError={() => {
                                    setSourceStatus('source_error');
                                    setSourceError(adult ? 'Could not play the canonical in-app source.' : 'Khong phat duoc nguon video chuan trong app.');
                                    recordVideoLessonTelemetry('video_source_error', { lessonId: activeVideo.id });
                                }}
                            >
                                <source src={canonicalSrc} type={activeVideo.playback?.canonical?.mimeType || 'video/mp4'} />
                                {captionTrackEn ? (
                                    <track
                                        kind="subtitles"
                                        srcLang="en"
                                        label="English"
                                        src={captionTrackEn}
                                    />
                                ) : null}
                                {captionTrackVi ? (
                                    <track
                                        kind="subtitles"
                                        srcLang="vi"
                                        label="Tieng Viet"
                                        src={captionTrackVi}
                                    />
                                ) : null}
                            </video>
                        ) : (
                            <div style={{ padding: '28px 20px', textAlign: 'center', color: '#fff' }}>
                                <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⚠️</div>
                                <div style={{ fontWeight: 700, marginBottom: '6px' }}>
                                    {adult ? 'Canonical source missing' : 'Thieu nguon phat chuan'}
                                </div>
                                <div style={{ fontSize: '0.82rem', opacity: 0.85 }}>
                                    {adult ? 'This lesson cannot unlock the quiz until the approved video source is restored.' : 'Lesson nay khong duoc mo quiz neu nguon video chuan chua san sang.'}
                                </div>
                            </div>
                        )}
                    </div>

                    {sourceStatus === 'loading' ? (
                        <div className="glass-card" style={{ padding: '14px', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                            {adult ? 'Checking in-app playback compatibility...' : 'Dang kiem tra kha nang phat trong app...'}
                        </div>
                    ) : null}

                    {sourceStatus === 'source_error' ? (
                        <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #EF4444' }}>
                            <div style={{ fontWeight: 800, marginBottom: '6px' }}>
                                {adult ? 'Source error' : 'Loi nguon phat'}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', lineHeight: 1.55 }}>
                                {sourceError || (adult ? 'The approved in-app source failed to play.' : 'Nguon video chuan trong app dang loi.')}
                            </div>
                            {referenceLink ? (
                                <a
                                    href={referenceLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        display: 'inline-flex',
                                        marginTop: '12px',
                                        padding: '10px 14px',
                                        borderRadius: '12px',
                                        background: 'rgba(239,68,68,0.12)',
                                        color: 'var(--color-text)',
                                        textDecoration: 'none',
                                        fontWeight: 700,
                                    }}
                                >
                                    {adult ? 'Open reference source' : 'Mo nguon tham chieu'}
                                </a>
                            ) : null}
                        </div>
                    ) : null}

                    {activeObjectives.length > 0 ? (
                        <div className="glass-card" style={{ padding: '14px' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '8px', fontWeight: 700 }}>
                                {adult ? 'Learning goals' : 'Muc tieu hoc'}
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {activeObjectives.map((objective, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            display: 'flex',
                                            gap: '10px',
                                            alignItems: 'flex-start',
                                            fontSize: '0.82rem',
                                            lineHeight: 1.55,
                                        }}
                                    >
                                        <span style={{ color: 'var(--color-primary)', fontWeight: 800 }}>{index + 1}.</span>
                                        <span>{getLocalizedLine(objective, adult)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {activeVocabulary.length > 0 ? (
                        <div className="glass-card" style={{ padding: '14px' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '8px', fontWeight: 700 }}>
                                {adult ? 'Focus vocabulary' : 'Tu khoa trong tam'}
                            </div>
                            <div style={{ display: 'grid', gap: '8px' }}>
                                {activeVocabulary.slice(0, 6).map((entry) => (
                                    <div
                                        key={entry.term}
                                        style={{
                                            padding: '10px 12px',
                                            borderRadius: '12px',
                                            background: 'rgba(79,70,229,0.06)',
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                                            {adult ? entry.term : entry.meaningVi || entry.term}
                                        </div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                            {adult ? entry.meaningVi : entry.term}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {activeScriptSegments.length > 0 ? (
                        <div className="glass-card" style={{ padding: '14px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', fontWeight: 700 }}>
                                    {adult ? 'Bilingual study script' : 'Script hoc song ngu'}
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                    {[
                                        { id: 'en', label: 'EN only' },
                                        { id: 'vi', label: 'VI only' },
                                        { id: 'dual', label: 'EN + VI' },
                                    ].map((mode) => (
                                        <button
                                            key={mode.id}
                                            type="button"
                                            onClick={() => {
                                                setSubtitleViewMode(mode.id);
                                                recordVideoLessonTelemetry('subtitle_toggle', {
                                                    lessonId: activeVideo.id,
                                                    mode: mode.id,
                                                });
                                            }}
                                            style={{
                                                padding: '6px 10px',
                                                borderRadius: '999px',
                                                border: '1px solid var(--color-border)',
                                                background: subtitleViewMode === mode.id ? 'var(--color-primary)' : 'var(--color-card)',
                                                color: subtitleViewMode === mode.id ? '#fff' : 'var(--color-text)',
                                                fontSize: '0.68rem',
                                                fontWeight: 700,
                                                cursor: 'pointer',
                                            }}
                                        >
                                            {mode.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {activeScriptSegments.map((segment) => (
                                    <div
                                        key={segment.id}
                                        style={{
                                            padding: '12px',
                                            borderRadius: '12px',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-bg)',
                                        }}
                                    >
                                        <div style={{ fontSize: '0.68rem', color: 'var(--color-text-light)', fontWeight: 700, marginBottom: '6px' }}>
                                            {getLocalizedLine({
                                                en: segment.label || getStageLabel(segment.phase, true),
                                                vi: segment.labelVi || getStageLabel(segment.phase, false),
                                            }, adult)}
                                        </div>
                                        {subtitleViewMode !== 'vi' ? (
                                            <div style={{ fontSize: '0.82rem', lineHeight: 1.55, fontWeight: 600 }}>
                                                {segment.en}
                                            </div>
                                        ) : null}
                                        {subtitleViewMode !== 'en' ? (
                                            <div style={{ fontSize: '0.78rem', lineHeight: 1.55, color: subtitleViewMode === 'dual' ? 'var(--color-text-light)' : 'var(--color-text)', marginTop: subtitleViewMode === 'dual' ? '4px' : '0' }}>
                                                {segment.vi}
                                            </div>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    <div className="glass-card" style={{ padding: '14px' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '6px', fontWeight: 700 }}>
                            {adult ? 'Source review' : 'Kiem duyet nguon'}
                        </div>
                        <div style={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
                            <strong>{adult ? 'Source:' : 'Nguon:'}</strong> {activeVideo.attribution?.sourceName || activeVideo.channel || '--'}
                            <br />
                            <strong>{adult ? 'License:' : 'Giay phep:'}</strong> {activeVideo.attribution?.licenseLabel || (adult ? 'Pending approval' : 'Dang cho duyet')}
                            <br />
                            <strong>{adult ? 'Review status:' : 'Trang thai duyet:'}</strong>{' '}
                            {sourceVerification?.manualReviewStatus || (adult ? 'Pending' : 'Dang cho')}
                            <br />
                            <strong>{adult ? 'Review badge:' : 'Huy hieu duyet:'}</strong>{' '}
                            {reviewBadge.label}
                            <br />
                            <strong>{adult ? 'Content match:' : 'Do khop noi dung:'}</strong>{' '}
                            {sourceVerification?.contentMatchStatus || (adult ? 'Unverified' : 'Chua xac minh')}
                            <br />
                            <strong>{adult ? 'Subtitle mode:' : 'Che do phu de:'}</strong>{' '}
                            {subtitleVariant === 'exact_timed'
                                ? (adult ? 'Exact timed subtitles' : 'Phu de dong bo theo thoi gian')
                                : (adult ? 'Companion learning script' : 'Script dong hanh de hoc')}
                            <br />
                            <strong>{adult ? 'Reviewed by:' : 'Nguoi duyet:'}</strong>{' '}
                            {sourceVerification?.reviewedBy || activeVideo.attribution?.reviewedBy || '--'}
                        </div>
                    </div>

                    {activePracticeBlocks ? (
                        <div className="glass-card" style={{ padding: '14px' }}>
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '8px', fontWeight: 700 }}>
                                {adult ? 'Memory loop' : 'Vong lap tri nho'}
                            </div>
                            <div style={{ display: 'grid', gap: '10px' }}>
                                {Array.isArray(activePracticeBlocks.beforeWatch) && activePracticeBlocks.beforeWatch.length > 0 ? (
                                    <div>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 700, marginBottom: '4px' }}>
                                            {adult ? 'Before watching' : 'Truoc khi xem'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', lineHeight: 1.55 }}>
                                            {getLocalizedLine(activePracticeBlocks.beforeWatch[0], adult)}
                                        </div>
                                    </div>
                                ) : null}
                                {Array.isArray(activePracticeBlocks.afterWatch) && activePracticeBlocks.afterWatch.length > 0 ? (
                                    <div>
                                        <div style={{ fontSize: '0.68rem', fontWeight: 700, marginBottom: '4px' }}>
                                            {adult ? 'After watching' : 'Sau khi xem'}
                                        </div>
                                        <div style={{ display: 'grid', gap: '4px' }}>
                                            {activePracticeBlocks.afterWatch.map((entry, index) => (
                                                <div key={index} style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', lineHeight: 1.55 }}>
                                                    {getLocalizedLine(entry, adult)}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                                {Array.isArray(activePracticeBlocks.memoryPlan) && activePracticeBlocks.memoryPlan.length > 0 ? (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', lineHeight: 1.55 }}>
                                        <strong>{adult ? 'Spaced review:' : 'On cach quang:'}</strong>{' '}
                                        {getLocalizedLine(activePracticeBlocks.memoryPlan[0], adult)}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    {activeQuizQuestions.length > 0 ? (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                                {sourceStatus === 'playable'
                                    ? (adult ? 'Watch the approved in-app video, then move through preview, detail, retrieval, and transfer questions.' : 'Xem video da kiem duyet trong app roi di qua cac cau hoi du doan, chi tiet, goi lai va van dung.')
                                    : (adult ? 'Quiz stays locked until the canonical source is playable.' : 'Quiz chi mo khi nguon video chuan phat duoc.')}
                            </p>
                            <button
                                type="button"
                                onClick={startQuiz}
                                disabled={sourceStatus !== 'playable'}
                                style={{
                                    padding: '12px 32px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    cursor: sourceStatus === 'playable' ? 'pointer' : 'not-allowed',
                                    background: sourceStatus === 'playable'
                                        ? 'linear-gradient(135deg, #4F46E5, #6366F1)'
                                        : 'linear-gradient(135deg, #9CA3AF, #6B7280)',
                                    color: '#fff',
                                    fontSize: '0.95rem',
                                    fontWeight: 700,
                                    boxShadow: sourceStatus === 'playable'
                                        ? '0 4px 12px rgba(79,70,229,0.3)'
                                        : 'none',
                                    opacity: sourceStatus === 'playable' ? 1 : 0.7,
                                }}
                            >
                                📝 {adult ? 'Take Quiz' : 'Lam Quiz'} ({activeQuizQuestions.length} {adult ? 'Q' : 'cau'})
                            </button>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {quizMode && !quizDone && currentQuestion ? (
                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                        {activeQuizQuestions.map((_, index) => (
                            <div
                                key={index}
                                style={{
                                    flex: 1,
                                    height: '4px',
                                    borderRadius: '2px',
                                    background: index < quizIdx
                                        ? '#22C55E'
                                        : index === quizIdx
                                            ? 'var(--color-primary)'
                                            : 'var(--color-border)',
                                    transition: 'background 0.3s',
                                }}
                            />
                        ))}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '4px', fontWeight: 700 }}>
                        {getStageLabel(currentQuestion.stage, adult)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '8px', fontWeight: 600 }}>
                        {adult ? `Question ${quizIdx + 1}/${activeQuizQuestions.length}` : `Cau ${quizIdx + 1}/${activeQuizQuestions.length}`}
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', lineHeight: 1.4 }}>
                        {adult ? currentQuestion.q : currentQuestion.qVi}
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {currentQuestion.options.map((option, optionIndex) => {
                            const isCorrect = optionIndex === currentQuestion.answer;
                            const isChosen = answered === optionIndex;
                            let background = 'var(--color-card)';
                            let border = '1px solid var(--color-border)';

                            if (answered !== null) {
                                if (isCorrect) {
                                    background = 'rgba(34,197,94,0.15)';
                                    border = '2px solid #22C55E';
                                } else if (isChosen) {
                                    background = 'rgba(239,68,68,0.1)';
                                    border = '2px solid #EF4444';
                                }
                            }

                            return (
                                <button
                                    key={optionIndex}
                                    type="button"
                                    onClick={() => answerQuiz(optionIndex)}
                                    disabled={answered !== null}
                                    style={{
                                        padding: '12px 16px',
                                        borderRadius: '12px',
                                        border,
                                        background,
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        cursor: answered !== null ? 'default' : 'pointer',
                                        color: 'var(--color-text)',
                                        textAlign: 'left',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                    }}
                                >
                                    <span
                                        style={{
                                            width: '28px',
                                            height: '28px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: answered !== null && isCorrect
                                                ? '#22C55E'
                                                : answered !== null && isChosen
                                                    ? '#EF4444'
                                                    : 'var(--color-bg)',
                                            color: answered !== null && (isCorrect || isChosen)
                                                ? '#fff'
                                                : 'var(--color-text)',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {answered !== null && isCorrect
                                            ? '✓'
                                            : answered !== null && isChosen
                                                ? '✗'
                                                : String.fromCharCode(65 + optionIndex)}
                                    </span>
                                    {adult ? option.en : option.vi || option.en}
                                </button>
                            );
                        })}
                    </div>
                    {answered !== null ? (
                        <div
                            className="glass-card"
                            style={{
                                padding: '12px',
                                marginTop: '12px',
                                borderLeft: `4px solid ${answered === currentQuestion.answer ? '#22C55E' : '#EF4444'}`,
                            }}
                        >
                            <div style={{ fontWeight: 700, marginBottom: '4px' }}>
                                {answered === currentQuestion.answer
                                    ? (adult ? 'Correct focus' : 'Dung trong tam')
                                    : (adult ? 'Review this clue' : 'Xem lai dau hieu nay')}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', lineHeight: 1.55 }}>
                                {adult
                                    ? (currentQuestion.explanation || currentQuestion.q)
                                    : (currentQuestion.explanationVi || currentQuestion.qVi)}
                            </div>
                        </div>
                    ) : null}
                </div>
            ) : null}

            {quizDone ? (
                <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '8px' }}>
                        {score === activeQuizQuestions.length ? '🏆' : score >= activeQuizQuestions.length * 0.7 ? '⭐' : '💪'}
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>
                        {score}/{activeQuizQuestions.length} {adult ? 'Correct!' : 'Dung!'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginBottom: '16px' }}>
                        +{Math.round((score / activeQuizQuestions.length) * 15)} XP
                    </div>
                    {Array.isArray(activePracticeBlocks?.shadowing) && activePracticeBlocks.shadowing.length > 0 ? (
                        <div
                            className="glass-card"
                            style={{
                                padding: '14px',
                                textAlign: 'left',
                                marginBottom: '16px',
                            }}
                        >
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '6px', fontWeight: 700 }}>
                                {adult ? 'Say it again from memory' : 'Noi lai tu tri nho'}
                            </div>
                            <div style={{ fontSize: '0.82rem', lineHeight: 1.55, fontWeight: 600 }}>
                                {activePracticeBlocks.shadowing[0].en}
                            </div>
                            <div style={{ fontSize: '0.78rem', lineHeight: 1.55, color: 'var(--color-text-light)', marginTop: '4px' }}>
                                {activePracticeBlocks.shadowing[0].vi}
                            </div>
                        </div>
                    ) : null}
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                            type="button"
                            onClick={resetToVideo}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: '1px solid var(--color-border)',
                                background: 'var(--color-bg)',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                            }}
                        >
                            🔄 {adult ? 'Watch Again' : 'Xem lai'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setActiveVideoId(null);
                                resetToVideo();
                            }}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'var(--color-primary)',
                                color: '#fff',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                            }}
                        >
                            ➡️ {adult ? 'Next Video' : 'Video tiep'}
                        </button>
                    </div>
                </div>
            ) : null}

            {celebration ? <CelebrationOverlay type={celebration.type} onDone={() => setCelebration(null)} /> : null}
        </div>
    );
}

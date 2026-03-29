import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CapabilityNotice from '../components/CapabilityNotice';
import ManualTranscriptFallback from '../components/ManualTranscriptFallback';
import SpeakingCoachPanel from '../components/SpeakingCoachPanel';
import {
    getFreeSpeakingPromptClipId,
    getFreeSpeakingStarterClipId,
} from '../data/freeSpeakingCoachAudioContent';
import { SPEAKING_UI_THEME } from '../data/speakingUiTheme';
import { useGame } from '../context/GameStateContext';
import { useSpeechPracticeSession } from '../hooks/useSpeechPracticeSession';
import { useDeviceCapabilities } from '../hooks/useDeviceCapabilities';
import {
    buildFreeSpeakingSummary,
    getFreeSpeakingScenarios,
    resolveCoachReply,
} from '../services/freeSpeakingCoachService';
import { suggestEnglishFromVietnamese } from '../services/freeSpeakingTranslationHelper';
import {
    getFreeSpeakingAudioClip,
    getFreeSpeakingAudioEntry,
    loadFreeSpeakingAudioManifest,
    loadFreeSpeakingAudioQA,
} from '../services/freeSpeakingAudioService';
import { analyzeSpeakingAttempt } from '../services/speakingAnalyticsService';
import { speakText } from '../utils/speakText';

function metricColor(score) {
    if (score >= 85) return '#16A34A';
    if (score >= 70) return '#2563EB';
    if (score >= 55) return '#D97706';
    return '#DC2626';
}

function buildFallbackCopy(lang = 'en') {
    if (lang === 'cn') {
        return {
            title: '输入你刚才说的话',
            description: '当前设备无法稳定识别语音。请输入你刚才说的内容，系统仍会给你结构化反馈。',
        };
    }

    return {
        title: 'Type what you just said',
        description: 'Speech recognition is unavailable on this device right now. Type your answer to keep the coaching flow going.',
    };
}

const pageCardStyle = {
    padding: '16px',
    borderRadius: '22px',
    background: SPEAKING_UI_THEME.panelSurfaceRaised,
    border: `1px solid ${SPEAKING_UI_THEME.border}`,
    boxShadow: '0 18px 40px rgba(2, 6, 23, 0.28)',
};

const sectionTitleStyle = {
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    fontSize: '1rem',
    color: SPEAKING_UI_THEME.textStrong,
};

const primaryButtonStyle = {
    padding: '12px 16px',
    borderRadius: '16px',
    border: 'none',
    background: `linear-gradient(135deg, ${SPEAKING_UI_THEME.primarySurface}, ${SPEAKING_UI_THEME.primarySurfaceAlt})`,
    color: SPEAKING_UI_THEME.primaryText,
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 12px 30px rgba(79, 70, 229, 0.28)',
};

const secondaryButtonStyle = {
    padding: '12px 16px',
    borderRadius: '16px',
    border: `1px solid ${SPEAKING_UI_THEME.secondaryBorder}`,
    background: SPEAKING_UI_THEME.secondarySurface,
    color: SPEAKING_UI_THEME.secondaryText,
    fontFamily: 'var(--font-display)',
    fontWeight: 800,
    cursor: 'pointer',
};

function getTabStyle(isActive) {
    return {
        flex: 1,
        padding: '12px 14px',
        borderRadius: '16px',
        border: `1px solid ${isActive ? SPEAKING_UI_THEME.accentStrong : SPEAKING_UI_THEME.borderSoft}`,
        background: isActive ? SPEAKING_UI_THEME.accentSurface : SPEAKING_UI_THEME.panelSurfaceMuted,
        color: isActive ? SPEAKING_UI_THEME.accentText : SPEAKING_UI_THEME.textMuted,
        fontFamily: 'var(--font-display)',
        fontWeight: 800,
        cursor: 'pointer',
    };
}

function getScenarioCardStyle() {
    return {
        ...pageCardStyle,
        padding: '18px',
        textAlign: 'left',
        cursor: 'pointer',
        width: '100%',
    };
}

function getTimelineBubbleStyle(role) {
    if (role === 'user') {
        return {
            marginLeft: '18%',
            marginRight: 0,
            padding: '11px 13px',
            borderRadius: '18px',
            background: `linear-gradient(135deg, ${SPEAKING_UI_THEME.primarySurface}, ${SPEAKING_UI_THEME.primarySurfaceAlt})`,
            color: SPEAKING_UI_THEME.userBubbleText,
            lineHeight: 1.55,
            fontSize: '0.83rem',
            border: `1px solid ${SPEAKING_UI_THEME.accentStrong}`,
        };
    }

    return {
        marginLeft: 0,
        marginRight: '18%',
        padding: '11px 13px',
        borderRadius: '18px',
        background: SPEAKING_UI_THEME.coachBubbleSurface,
        color: SPEAKING_UI_THEME.coachBubbleText,
        lineHeight: 1.55,
        fontSize: '0.83rem',
        border: `1px solid ${SPEAKING_UI_THEME.border}`,
    };
}

function buildSourceBadge(playbackMode, hasControlledAudio) {
    if (playbackMode === 'controlled') return 'Studio coach audio';
    if (playbackMode === 'browser') return 'Browser fallback';
    return hasControlledAudio ? 'Studio coach ready' : 'Browser coach audio';
}

export default function FreeSpeakingCoach() {
    const navigate = useNavigate();
    const { state, addXP, addSpeakingRecap, updateSkillScore } = useGame();
    useDeviceCapabilities();
    const [activeLang, setActiveLang] = useState('en');
    const [activeScenario, setActiveScenario] = useState(null);
    const [turnIndex, setTurnIndex] = useState(0);
    const [messages, setMessages] = useState([]);
    const [turnResults, setTurnResults] = useState([]);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [currentCoachReply, setCurrentCoachReply] = useState('');
    const [currentCoachReplyClipId, setCurrentCoachReplyClipId] = useState('');
    const [sessionSummary, setSessionSummary] = useState(null);
    const [handsFree, setHandsFree] = useState(false);
    const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
    const [typedTranscript, setTypedTranscript] = useState('');
    const [voicePackManifest, setVoicePackManifest] = useState(null);
    const [voicePackQA, setVoicePackQA] = useState(null);
    const [voicePackStatus, setVoicePackStatus] = useState('loading');
    const [coachPlaybackMode, setCoachPlaybackMode] = useState('idle');
    const [helperDraft, setHelperDraft] = useState('');
    const audioRef = useRef(null);
    const chatEndRef = useRef(null);
    const {
        phase,
        interimText,
        finalText,
        audioUrl,
        manualFallback,
        startCapture,
        stopCapture,
        resetSession,
        submitManualTranscript,
    } = useSpeechPracticeSession('FreeSpeakingCoach');

    const scenarios = useMemo(() => getFreeSpeakingScenarios(activeLang), [activeLang]);
    const currentTurn = activeScenario?.turns?.[turnIndex] || null;
    const activeAudioEntry = activeScenario ? getFreeSpeakingAudioEntry(voicePackManifest, activeScenario.id) : null;
    const studioAudioReady = !!activeAudioEntry;
    buildSourceBadge(coachPlaybackMode, studioAudioReady);
    const helperSuggestion = useMemo(() => (
        activeScenario?.lang === 'en'
            ? suggestEnglishFromVietnamese({ text: helperDraft, turn: currentTurn })
            : null
    ), [activeScenario?.lang, currentTurn, helperDraft]);

    useEffect(() => {
        let active = true;
        loadFreeSpeakingAudioManifest()
            .then((manifest) => {
                if (!active) return;
                setVoicePackManifest(manifest);
                setVoicePackStatus('ready');
            })
            .catch(() => {
                if (!active) return;
                setVoicePackManifest(null);
                setVoicePackStatus('missing');
            });

        return () => {
            active = false;
        };
    }, []);

    useEffect(() => {
        let active = true;
        loadFreeSpeakingAudioQA()
            .then((qa) => {
                if (!active) return;
                setVoicePackQA(qa);
            })
            .catch(() => {
                if (!active) return;
                setVoicePackQA(null);
            });

        return () => {
            active = false;
        };
    }, []);

    const stopCoachPlayback = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        window.speechSynthesis?.cancel();
        setIsCoachSpeaking(false);
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, currentAnalysis, interimText, phase]);

    useEffect(() => () => {
        stopCoachPlayback();
        resetSession();
    }, [resetSession, stopCoachPlayback]);

    const startTurnCapture = useCallback(() => {
        if (!activeScenario || !currentTurn) return;
        startCapture({
            lang: activeScenario.coachVoiceLang,
            continuous: true,
            interimResults: true,
            maxAlternatives: 3,
            autoStopOnEnd: true,
            autoStopOnSilence: true,
            silenceMs: 2000,
            fallback: buildFallbackCopy(activeScenario.lang),
            onFinalize: ({ transcript, durationMs }) => {
                if (!activeScenario || !currentTurn) return;

                const sampleAnswer = [currentTurn.tip, ...(currentTurn.targetVocabulary || [])].join(' ');
                const analysis = analyzeSpeakingAttempt({
                    spokenText: transcript,
                    lang: activeScenario.lang,
                    durationMs,
                    promptText: currentTurn.prompt,
                    sampleAnswer,
                    tip: currentTurn.tip,
                    expectedMinTokens: currentTurn.expectedMinTokens || (activeScenario.lang === 'cn' ? 8 : 12),
                });
                const coachReplyDecision = resolveCoachReply({
                    scenario: activeScenario,
                    turnIndex,
                    transcript,
                });
                const nextResult = {
                    turnId: currentTurn.id,
                    prompt: currentTurn.prompt,
                    transcript,
                    coachReply: coachReplyDecision.text,
                    coachReplyClipId: coachReplyDecision.clipId,
                    analysis,
                };

                setCurrentAnalysis(analysis);
                setCurrentCoachReply(coachReplyDecision.text);
                setCurrentCoachReplyClipId(coachReplyDecision.clipId);
                setTurnResults((previous) => [...previous, nextResult]);
                setMessages((previous) => [
                    ...previous,
                    { role: 'user', text: transcript },
                    { role: 'coach', text: coachReplyDecision.text },
                ]);
                updateSkillScore('speaking', analysis.overallScore);
                addXP(analysis.overallScore >= 85 ? 18 : analysis.overallScore >= 70 ? 12 : 6);
            },
        });
    }, [activeScenario, addXP, currentTurn, startCapture, turnIndex, updateSkillScore]);

    const queueHandsFreeCapture = useCallback(() => {
        if (!handsFree || !currentTurn) return;

        window.setTimeout(() => {
            startTurnCapture();
        }, 260);
    }, [currentTurn, handsFree, startTurnCapture]);

    const tryPlayCoachClip = useCallback(async (clipId, onEnd) => {
        if (!activeScenario || !clipId) return false;
        const src = getFreeSpeakingAudioClip(voicePackManifest, activeScenario.id, clipId);
        if (!src) return false;

        stopCoachPlayback();
        const audio = new Audio(src);
        audio.preload = 'auto';
        audioRef.current = audio;
        setCoachPlaybackMode('controlled');
        setIsCoachSpeaking(true);

        audio.onended = () => {
            if (audioRef.current === audio) {
                audioRef.current = null;
            }
            setIsCoachSpeaking(false);
            onEnd?.();
        };
        audio.onerror = () => {
            if (audioRef.current === audio) {
                audioRef.current = null;
            }
            setIsCoachSpeaking(false);
            setCoachPlaybackMode('browser');
        };

        try {
            await audio.play();
            return true;
        } catch {
            if (audioRef.current === audio) {
                audio.pause();
                audio.src = '';
                audioRef.current = null;
            }
            setIsCoachSpeaking(false);
            setCoachPlaybackMode('browser');
            return false;
        }
    }, [activeScenario, stopCoachPlayback, voicePackManifest]);

    const playCoachVoice = useCallback((text, { clipId = '', autoRecord = false } = {}) => {
        if (!activeScenario || !text) return;

        const handlePlaybackEnd = () => {
            setIsCoachSpeaking(false);
            if (autoRecord) {
                queueHandsFreeCapture();
            }
        };

        void (async () => {
            const playedStudio = clipId ? await tryPlayCoachClip(clipId, handlePlaybackEnd) : false;
            if (!playedStudio) {
                setCoachPlaybackMode('browser');
                setIsCoachSpeaking(true);
                speakText(text, {
                    lang: activeScenario.coachVoiceLang,
                    rate: activeScenario.lang === 'cn' ? 0.92 : 0.98,
                    pitch: 1,
                    onEnd: handlePlaybackEnd,
                });
            }
        })();
    }, [activeScenario, queueHandsFreeCapture, tryPlayCoachClip]);

    const startScenario = useCallback((scenario) => {
        stopCoachPlayback();
        setCoachPlaybackMode('idle');
        setActiveScenario(scenario);
        setTurnIndex(0);
        setTurnResults([]);
        setCurrentAnalysis(null);
        setCurrentCoachReply('');
        setCurrentCoachReplyClipId('');
        setSessionSummary(null);
        setTypedTranscript('');
        setHelperDraft('');
        resetSession();
        setMessages([
            { role: 'coach', text: scenario.starter },
            { role: 'coach', text: scenario.turns[0].prompt },
        ]);
    }, [resetSession, stopCoachPlayback]);

    const beginTurn = useCallback(() => {
        if (!activeScenario || !currentTurn) return;
        stopCoachPlayback();
        setCurrentAnalysis(null);
        setCurrentCoachReply('');
        setCurrentCoachReplyClipId('');
        setTypedTranscript('');
        setHelperDraft('');
        startTurnCapture();
    }, [activeScenario, currentTurn, startTurnCapture, stopCoachPlayback]);

    const retryTurn = useCallback(() => {
        if (!activeScenario || !currentTurn) return;
        stopCoachPlayback();
        setCurrentAnalysis(null);
        setCurrentCoachReply('');
        setCurrentCoachReplyClipId('');
        setTypedTranscript('');
        setHelperDraft('');
        setTurnResults((previous) => previous.slice(0, -1));
        setMessages((previous) => previous.slice(0, -2));
        resetSession();
    }, [activeScenario, currentTurn, resetSession, stopCoachPlayback]);

    const goNextTurn = useCallback(() => {
        if (!activeScenario) return;

        if (turnIndex + 1 >= activeScenario.turns.length) {
            const summary = buildFreeSpeakingSummary({
                scenario: activeScenario,
                turnResults,
            });
            setSessionSummary(summary);
            addSpeakingRecap({
                id: `free-speaking-${Date.now()}`,
                createdAt: new Date().toISOString(),
                lessonId: activeScenario.id,
                lessonTitle: activeScenario.title,
                lang: activeScenario.lang,
                promptText: activeScenario.starter,
                targetText: '',
                transcript: summary.transcriptBundle,
                source: 'free_speaking_coach',
                overallScore: summary.overallScore,
                analysisType: 'free_speaking_session',
                metrics: summary.metrics,
                recommendations: summary.priorities.length > 0
                    ? summary.priorities
                    : ['Keep practicing with one longer answer and one stronger example next time.'],
                note: 'Session summary aggregated from guided speaking turns. It is transcript-based coaching, not model-based conversational AI scoring. · Tổng kết này được gộp từ các lượt nói đã hoàn thành. Đây là coaching dựa trên transcript, không phải chấm hội thoại bằng mô hình AI.',
                coachModel: 'guided_free_speaking_coach',
                evidenceLevel: 'Prompt-aligned transcript coaching · Huấn luyện dựa trên transcript và mức độ bám sát câu hỏi',
                strengths: summary.strengths,
                risks: summary.priorities,
                transcriptStats: {
                    tokenCount: summary.totalWords,
                    uniqueTokens: summary.uniqueWords,
                    wpm: 0,
                    lexicalDiversity: summary.totalWords > 0 ? summary.uniqueWords / summary.totalWords : 0,
                },
                signalBreakdown: {
                    fillerCount: 0,
                    fillerRatio: 0,
                    sentenceCount: activeScenario.turns.length,
                    promptCoverage: summary.vocabularyProgress,
                    sampleCoverage: 0,
                    contentDensity: summary.totalWords > 0 ? summary.uniqueWords / summary.totalWords : 0,
                    contentTokenCount: summary.uniqueWords,
                },
            });
            return;
        }

        const nextIndex = turnIndex + 1;
        const nextTurn = activeScenario.turns[nextIndex];
        setTurnIndex(nextIndex);
        setCurrentAnalysis(null);
        setCurrentCoachReply('');
        setCurrentCoachReplyClipId('');
        setTypedTranscript('');
        setHelperDraft('');
        resetSession();
        setMessages((previous) => [...previous, { role: 'coach', text: nextTurn.prompt }]);
        if (handsFree) {
            window.setTimeout(() => {
                playCoachVoice(nextTurn.prompt, {
                    clipId: getFreeSpeakingPromptClipId(nextTurn.id),
                    autoRecord: true,
                });
            }, 200);
        }
    }, [activeScenario, addSpeakingRecap, handsFree, playCoachVoice, resetSession, turnIndex, turnResults]);

    const leaveScenario = useCallback(() => {
        stopCoachPlayback();
        resetSession();
        setCoachPlaybackMode('idle');
        setActiveScenario(null);
        setTurnIndex(0);
        setMessages([]);
        setTurnResults([]);
        setCurrentAnalysis(null);
        setCurrentCoachReply('');
        setCurrentCoachReplyClipId('');
        setSessionSummary(null);
        setTypedTranscript('');
        setHelperDraft('');
    }, [resetSession, stopCoachPlayback]);

    if (!activeScenario) {
        return (
            <div className="page" style={{ color: SPEAKING_UI_THEME.textBody }}>
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                    <h2 className="page-header__title">🧠 Free Speaking Coach</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>

                <div style={{ ...pageCardStyle, marginBottom: '12px' }}>
                    <div style={sectionTitleStyle}>Guided open speaking · Luyện nói tự do có hướng dẫn</div>
                    <p style={{ margin: '8px 0 0', color: SPEAKING_UI_THEME.textMuted, fontSize: '0.84rem', lineHeight: 1.65 }}>
                        Guided free speaking with studio coach audio, turn-by-turn capture, and transcript-driven feedback.
                    </p>
                    <p style={{ margin: '4px 0 0', color: SPEAKING_UI_THEME.textSoft, fontSize: '0.78rem', lineHeight: 1.55, fontStyle: 'italic' }}>
                        Luyện nói tự do có audio huấn luyện viên, ghi âm từng lượt, phản hồi dựa trên bản ghi.
                    </p>
                </div>

                <CapabilityNotice
                    icon="🎧"
                    title="Coach audio"
                    badge={voicePackStatus === 'ready' ? 'Studio audio verified' : 'Browser fallback only'}
                    tone={voicePackStatus === 'ready' ? 'success' : 'warn'}
                    summary={voicePackStatus === 'ready'
                        ? `Controlled coach audio is available for every guided scenario in this module. QA coverage: ${voicePackQA?.summary?.clipCount || 0} clips, ${voicePackQA?.summary?.missingFiles || 0} missing.`
                        : 'Coach audio pack is unavailable, so prompt playback will fall back to browser TTS and may vary by device.'}
                    bullets={[
                        'Prompt and coach follow-up playback prefer controlled audio assets.',
                        'Speech capture still depends on browser STT or typed fallback.',
                        'Session recap only reflects real turns you completed in this coach.',
                    ]}
                />

                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    {[
                        { id: 'en', label: 'English Coach' },
                        { id: 'cn', label: '中文口语' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveLang(tab.id)}
                            style={getTabStyle(activeLang === tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gap: '12px' }}>
                    {scenarios.map((scenario) => {
                        const scenarioQA = voicePackQA?.scenarios?.[scenario.id];
                        return (
                            <button
                                key={scenario.id}
                                onClick={() => startScenario(scenario)}
                                style={getScenarioCardStyle()}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                    <div style={{ fontSize: '2rem', lineHeight: 1 }}>{scenario.emoji}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.98rem', color: SPEAKING_UI_THEME.textStrong }}>
                                            {scenario.lang === 'cn' ? scenario.titleVi : scenario.title}
                                        </div>
                                        <div style={{ marginTop: '6px', fontSize: '0.78rem', color: SPEAKING_UI_THEME.textMuted, lineHeight: 1.6 }}>
                                            {scenario.lang === 'cn' ? scenario.descriptionVi : scenario.description}
                                        </div>
                                        <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '999px',
                                                fontSize: '0.68rem',
                                                background: SPEAKING_UI_THEME.successSurface,
                                                border: `1px solid ${SPEAKING_UI_THEME.successBorder}`,
                                                color: SPEAKING_UI_THEME.successText,
                                            }}>
                                                {scenario.turns.length} turns
                                            </span>
                                            {scenarioQA && (
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '999px',
                                                    fontSize: '0.68rem',
                                                    background: SPEAKING_UI_THEME.accentSurface,
                                                    border: `1px solid ${SPEAKING_UI_THEME.accentStrong}`,
                                                    color: SPEAKING_UI_THEME.accentText,
                                                }}>
                                                    {scenarioQA.clipCount} coach clips
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '14px' }}>
                                    {scenario.vocabulary.map((item) => (
                                        <span
                                            key={item}
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '999px',
                                                fontSize: '0.68rem',
                                                color: SPEAKING_UI_THEME.neutralChipText,
                                                background: SPEAKING_UI_THEME.neutralChipSurface,
                                                border: `1px solid ${SPEAKING_UI_THEME.neutralChipBorder}`,
                                            }}
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div >
        );
    }

    if (sessionSummary) {
        return (
            <div className="page" style={{ color: SPEAKING_UI_THEME.textBody }}>
                <div className="page-header">
                    <button className="page-header__back" onClick={leaveScenario}>←</button>
                    <h2 className="page-header__title">{activeScenario.emoji} Kết quả · Session Recap</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>

                <div style={{ ...pageCardStyle, textAlign: 'center' }}>
                    <div style={{ fontSize: '2.8rem' }}>{activeScenario.emoji}</div>
                    <div style={{ ...sectionTitleStyle, marginTop: '6px' }}>
                        {activeScenario.lang === 'cn' ? activeScenario.titleVi : activeScenario.title}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '2.2rem', fontWeight: 900, color: metricColor(sessionSummary.overallScore) }}>
                        {sessionSummary.overallScore}%
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '0.8rem', color: SPEAKING_UI_THEME.textMuted }}>
                        {sessionSummary.totalTurns} lượt · {sessionSummary.totalWords} từ · từ vựng {sessionSummary.vocabularyProgress}%
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '0.72rem', color: SPEAKING_UI_THEME.textSoft, fontStyle: 'italic' }}>
                        {sessionSummary.overallScore >= 85 ? 'Xuất sắc! Bạn nói rất tốt!' :
                            sessionSummary.overallScore >= 70 ? 'Tốt lắm! Hãy tiếp tục luyện tập!' :
                                sessionSummary.overallScore >= 55 ? 'Đang tiến bộ! Thêm vài buổi luyện nữa nhé!' :
                                    'Cố gắng thêm! Mỗi lần nói là một lần giỏi hơn!'}
                    </div>
                </div>

                <SpeakingCoachPanel
                    analysis={{
                        overallScore: sessionSummary.overallScore,
                        analysisSummary: 'Tổng kết từ các lượt nói trong buổi luyện tập. · Session recap aggregated from all completed guided speaking turns.',
                        metrics: sessionSummary.metrics,
                        strengths: sessionSummary.strengths,
                        recommendations: sessionSummary.priorities.length > 0
                            ? sessionSummary.priorities
                            : ['Lần sau: trả lời dài hơn với một ví dụ cụ thể và một lý do rõ ràng. · Next round: answer one prompt with a longer example and one clearer reason.'],
                        evidenceLevel: 'Aggregated transcript coaching · Huấn luyện tổng hợp dựa trên transcript',
                        note: 'This summary is built from your completed turns in the guided coach. It does not use model-based conversation AI or acoustic scoring. · Tổng kết này được tạo từ các lượt nói bạn đã hoàn thành trong guided coach. Nó không dùng AI hội thoại theo mô hình hay acoustic scoring.',
                        transcriptStats: {
                            wpm: 0,
                            lexicalDiversity: sessionSummary.totalWords > 0 ? sessionSummary.uniqueWords / sessionSummary.totalWords : 0,
                        },
                        signalBreakdown: {
                            fillerCount: 0,
                            promptCoverage: sessionSummary.vocabularyProgress,
                        },
                        referenceWordFeedback: [],
                    }}
                    title="Tổng kết buổi học · Session coaching summary"
                    transcriptLabel="Bản ghi kết hợp · Combined transcript"
                    transcript={sessionSummary.transcriptBundle}
                    tone="#818CF8"
                />

                <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
                    <button style={{ ...primaryButtonStyle, width: '100%' }} onClick={() => startScenario(activeScenario)}>
                        🔄 Luyện lại · Repeat scenario
                    </button>
                    <button style={{ ...secondaryButtonStyle, width: '100%' }} onClick={leaveScenario}>
                        🧭 Chọn chủ đề khác · Choose another coach
                    </button>
                </div>
            </div>
        );
    }

    const coachAvatar = activeScenario?.emoji || '🧑‍🏫';

    return (
        <div className="page" style={{ color: SPEAKING_UI_THEME.textBody, display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
            {/* Slim header */}
            <div className="page-header" style={{ flexShrink: 0 }}>
                <button className="page-header__back" onClick={leaveScenario}>←</button>
                <h2 className="page-header__title" style={{ fontSize: '0.92rem' }}>
                    {activeScenario.emoji} {activeScenario.lang === 'cn' ? activeScenario.titleVi : activeScenario.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                        onClick={() => setHandsFree((v) => !v)}
                        style={{
                            padding: '6px 10px', borderRadius: '999px',
                            border: `1px solid ${handsFree ? '#22C55E40' : SPEAKING_UI_THEME.borderSoft}`,
                            background: handsFree ? '#22C55E18' : 'transparent',
                            color: handsFree ? '#4ADE80' : SPEAKING_UI_THEME.textSoft,
                            fontSize: '0.68rem', fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        {handsFree ? '🎧 Auto' : '✋ Manual'}
                    </button>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
            </div>

            {/* Chat area — full height, scrollable */}
            <div className="sc-chat-scroll" style={{
                flex: 1, overflowY: 'auto', padding: '12px 4px 100px',
                display: 'flex', flexDirection: 'column', gap: '8px',
            }}>
                {/* Turn progress */}
                <div style={{ textAlign: 'center', fontSize: '0.68rem', color: SPEAKING_UI_THEME.textSoft, padding: '4px 0 8px' }}>
                    Turn {turnIndex + 1} / {activeScenario.turns.length} · {activeScenario.coachName}
                </div>

                {/* Chat messages */}
                {messages.map((message, index) => (
                    <div key={`${message.role}-${index}`} className="sc-bubble-enter" style={{
                        display: 'flex', alignItems: 'flex-end', gap: '8px',
                        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                        animationDelay: `${Math.min(index * 0.08, 0.4)}s`,
                    }}>
                        {message.role === 'coach' && (
                            <div style={{
                                width: '30px', height: '30px', borderRadius: '50%',
                                background: SPEAKING_UI_THEME.coachBubbleSurface,
                                border: `1px solid ${SPEAKING_UI_THEME.border}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.9rem', flexShrink: 0,
                            }}>{coachAvatar}</div>
                        )}
                        <div style={{ ...getTimelineBubbleStyle(message.role), maxWidth: '80%', margin: 0 }}>
                            {message.text}
                        </div>
                        {message.role === 'user' && audioUrl && index === messages.length - 1 && (
                            <button onClick={() => { const a = new Audio(audioUrl); void a.play(); }} style={{
                                background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '2px', flexShrink: 0,
                            }} title="Nghe lại giọng mình">🔊</button>
                        )}
                    </div>
                ))}

                {/* Recording interim */}
                {phase === 'recording' && (
                    <div className="sc-bubble-enter" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: '8px' }}>
                        <div style={{ ...getTimelineBubbleStyle('user'), maxWidth: '80%', margin: 0, opacity: 0.7, fontStyle: 'italic' }}>
                            {interimText || (<span style={{ color: SPEAKING_UI_THEME.interimText }}>
                                <span className="sc-typing-dot" /><span className="sc-typing-dot" /><span className="sc-typing-dot" />
                            </span>)}
                        </div>
                    </div>
                )}

                {/* Processing indicator */}
                {phase === 'processing' && (
                    <div className="sc-bubble-enter" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                        <div style={{
                            width: '30px', height: '30px', borderRadius: '50%',
                            background: SPEAKING_UI_THEME.coachBubbleSurface,
                            border: `1px solid ${SPEAKING_UI_THEME.border}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.9rem', flexShrink: 0,
                        }}>{coachAvatar}</div>
                        <div style={{ ...getTimelineBubbleStyle('coach'), maxWidth: '80%', margin: 0 }}>
                            <span style={{ color: SPEAKING_UI_THEME.textSoft }}>
                                <span className="sc-typing-dot" /><span className="sc-typing-dot" /><span className="sc-typing-dot" />
                            </span>
                        </div>
                    </div>
                )}

                {/* Inline coaching card */}
                {currentAnalysis && (
                    <div className="sc-coach-card" style={{ margin: '4px 0 4px 38px' }}>
                        <SpeakingCoachPanel
                            analysis={currentAnalysis}
                            title="Coach feedback · Phản hồi lượt nói"
                            transcriptLabel="What you said · Điều bạn vừa nói"
                            transcript={finalText}
                            tone={metricColor(currentAnalysis.overallScore)}
                            compact
                            footer={(
                                <>
                                    {currentCoachReply && (
                                        <div style={{
                                            marginTop: '8px', padding: '8px 10px', borderRadius: '12px',
                                            background: SPEAKING_UI_THEME.accentSurface, border: `1px solid ${SPEAKING_UI_THEME.accentStrong}`,
                                            fontSize: '0.74rem', lineHeight: 1.5, color: SPEAKING_UI_THEME.textBody,
                                        }}>
                                            <strong style={{ color: SPEAKING_UI_THEME.accentStrong }}>{activeScenario.coachName}:</strong>{' '}
                                            {currentCoachReply}
                                            {currentCoachReplyClipId && (
                                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', marginLeft: '6px' }}
                                                    onClick={() => playCoachVoice(currentCoachReply, { clipId: currentCoachReplyClipId })}>🔊</button>
                                            )}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                        <button style={{ ...secondaryButtonStyle, flex: 1, padding: '10px', fontSize: '0.78rem', borderRadius: '12px' }}
                                            onClick={retryTurn}>🔄 Thử lại</button>
                                        <button style={{ ...primaryButtonStyle, flex: 2, padding: '10px', fontSize: '0.78rem', borderRadius: '12px' }}
                                            onClick={goNextTurn}>
                                            {turnIndex + 1 >= activeScenario.turns.length ? '📊 Kết quả' : '➡️ Câu tiếp theo'}
                                        </button>
                                    </div>
                                </>
                            )}
                        />
                    </div>
                )}

                {/* Manual fallback */}
                {manualFallback && (
                    <div className="sc-coach-card" style={{ margin: '4px 0 4px 38px' }}>
                        <ManualTranscriptFallback
                            title={manualFallback.title} description={manualFallback.description}
                            value={typedTranscript} onChange={setTypedTranscript}
                            onSubmit={() => submitManualTranscript(typedTranscript)}
                            onCancel={() => { setTypedTranscript(''); resetSession(); }}
                            placeholder={activeScenario.lang === 'cn' ? '请输入你刚才说的话…' : 'Type what you said…'}
                            submitLabel={activeScenario.lang === 'cn' ? '提交内容' : 'Submit'}
                            cancelLabel={activeScenario.lang === 'cn' ? '取消' : 'Cancel'}
                        />
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Fixed bottom action bar */}
            {!currentAnalysis && !manualFallback && (
                <div style={{
                    position: 'fixed', bottom: 0, left: 0, right: 0,
                    padding: '12px 16px', paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
                    background: `linear-gradient(to top, ${SPEAKING_UI_THEME.panelSurface} 80%, transparent)`,
                    zIndex: 10,
                }}>
                    {/* Tip */}
                    {currentTurn && phase !== 'recording' && phase !== 'processing' && (
                        <>
                            {activeScenario.lang === 'en' && (
                                <div style={{
                                    padding: '10px 12px',
                                    borderRadius: '16px',
                                    background: SPEAKING_UI_THEME.panelSurfaceRaised,
                                    border: `1px solid ${SPEAKING_UI_THEME.borderSoft}`,
                                    marginBottom: '10px',
                                }}>
                                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: SPEAKING_UI_THEME.accentText, marginBottom: '6px' }}>
                                        🇻🇳→🇬🇧 Phrase helper · Gõ ý tiếng Việt để lấy câu gợi ý
                                    </div>
                                    <textarea
                                        value={helperDraft}
                                        onChange={(event) => setHelperDraft(event.target.value)}
                                        placeholder="Ví dụ: Hôm nay tôi đi làm và hơi mệt nhưng tôi vẫn hoàn thành việc chính."
                                        rows={2}
                                        style={{
                                            width: '100%',
                                            resize: 'vertical',
                                            borderRadius: '12px',
                                            border: `1px solid ${SPEAKING_UI_THEME.inputBorder}`,
                                            padding: '10px 12px',
                                            fontSize: '0.82rem',
                                            lineHeight: 1.5,
                                            background: SPEAKING_UI_THEME.inputSurface,
                                            color: SPEAKING_UI_THEME.inputText,
                                            outline: 'none',
                                        }}
                                    />
                                    {helperSuggestion?.suggestion && (
                                        <div style={{
                                            marginTop: '8px',
                                            padding: '10px 12px',
                                            borderRadius: '12px',
                                            background: SPEAKING_UI_THEME.accentSurface,
                                            border: `1px solid ${SPEAKING_UI_THEME.accentStrong}`,
                                        }}>
                                            <div style={{ fontSize: '0.7rem', color: SPEAKING_UI_THEME.accentText, marginBottom: '4px' }}>
                                                {helperSuggestion.mode === 'matched'
                                                    ? 'Matched speaking pattern · Mẫu câu khớp'
                                                    : 'Prompt scaffold · Khung trả lời gợi ý'}
                                            </div>
                                            <div style={{ fontSize: '0.82rem', lineHeight: 1.55, color: SPEAKING_UI_THEME.textStrong }}>
                                                {helperSuggestion.suggestion}
                                            </div>
                                            <div style={{ marginTop: '4px', fontSize: '0.68rem', color: SPEAKING_UI_THEME.textSoft, lineHeight: 1.45 }}>
                                                {helperSuggestion.note}
                                            </div>
                                            {helperSuggestion.matchedPatterns?.length > 0 && (
                                                <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {helperSuggestion.matchedPatterns.map((item) => (
                                                        <span
                                                            key={item}
                                                            style={{
                                                                padding: '4px 8px',
                                                                borderRadius: '999px',
                                                                fontSize: '0.66rem',
                                                                color: SPEAKING_UI_THEME.neutralChipText,
                                                                background: SPEAKING_UI_THEME.neutralChipSurface,
                                                                border: `1px solid ${SPEAKING_UI_THEME.neutralChipBorder}`,
                                                            }}
                                                        >
                                                            {item}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                                <button
                                                    style={{ ...secondaryButtonStyle, flex: 1, padding: '10px', fontSize: '0.74rem', borderRadius: '12px' }}
                                                    onClick={() => playCoachVoice(helperSuggestion.suggestion)}
                                                >
                                                    🔊 Nghe câu gợi ý
                                                </button>
                                                <button
                                                    style={{ ...secondaryButtonStyle, flex: 1, padding: '10px', fontSize: '0.74rem', borderRadius: '12px' }}
                                                    onClick={() => setTypedTranscript(helperSuggestion.suggestion)}
                                                >
                                                    📝 Dùng cho nhập tay
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        <div style={{
                            padding: '8px 12px', borderRadius: '14px',
                            background: SPEAKING_UI_THEME.panelSurfaceRaised,
                            border: `1px solid ${SPEAKING_UI_THEME.borderSoft}`,
                            marginBottom: '10px', fontSize: '0.74rem',
                            color: SPEAKING_UI_THEME.textSoft, lineHeight: 1.5,
                        }}>
                            <span style={{ color: SPEAKING_UI_THEME.accentStrong, fontWeight: 700 }}>💡</span>{' '}
                            {currentTurn.tip}
                            {currentTurn.tipVi && (
                                <span style={{ display: 'block', opacity: 0.7, fontStyle: 'italic', marginTop: '2px' }}>{currentTurn.tipVi}</span>
                            )}
                        </div>
                        </>
                    )}

                    {phase === 'recording' && (
                        <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#8B5CF6', fontWeight: 700, marginBottom: '8px' }}>
                            🎙️ Đang lắng nghe... tự dừng sau khoảng 2 giây im lặng · Listening... auto-stop after around 2 seconds of silence
                        </div>
                    )}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button
                            style={{
                                ...secondaryButtonStyle, padding: '12px', borderRadius: '50%',
                                width: '48px', height: '48px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
                            }}
                            onClick={() => playCoachVoice(currentTurn?.prompt || activeScenario.starter, {
                                clipId: currentTurn ? getFreeSpeakingPromptClipId(currentTurn.id) : getFreeSpeakingStarterClipId(),
                            })}
                            disabled={isCoachSpeaking}
                        >🔊</button>

                        {phase !== 'recording' ? (
                            <button style={{
                                ...primaryButtonStyle, flex: 1, padding: '14px', fontSize: '0.92rem', borderRadius: '18px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }} onClick={beginTurn} disabled={phase === 'processing'}>
                                🎙️ {phase === 'processing' ? 'Đang xử lý...' : 'Nói ngay · Speak now'}
                            </button>
                        ) : (
                            <button className="sc-recording-pulse" style={{
                                ...primaryButtonStyle, flex: 1, padding: '14px', fontSize: '0.92rem', borderRadius: '18px',
                                background: 'linear-gradient(135deg, #DC2626, #EF4444)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            }} onClick={stopCapture}>
                                ⏹️ Dừng · Stop
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

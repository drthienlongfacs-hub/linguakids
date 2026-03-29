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
    const { readiness } = useDeviceCapabilities();
    const [activeLang, setActiveLang] = useState('en');
    const [activeScenario, setActiveScenario] = useState(null);
    const [turnIndex, setTurnIndex] = useState(0);
    const [messages, setMessages] = useState([]);
    const [turnResults, setTurnResults] = useState([]);
    const [currentAnalysis, setCurrentAnalysis] = useState(null);
    const [currentTranscript, setCurrentTranscript] = useState('');
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
    const audioRef = useRef(null);
    const {
        phase,
        interimText,
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
    const activeScenarioQA = activeScenario ? voicePackQA?.scenarios?.[activeScenario.id] : null;
    const studioAudioReady = !!activeAudioEntry;
    const outputBadge = buildSourceBadge(coachPlaybackMode, studioAudioReady);

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

    useEffect(() => () => {
        stopCoachPlayback();
        resetSession();
    }, [resetSession, stopCoachPlayback]);

    const startTurnCapture = useCallback(() => {
        if (!activeScenario || !currentTurn) return;
        startCapture({
            lang: activeScenario.coachVoiceLang,
            continuous: false,
            interimResults: true,
            maxAlternatives: 3,
            autoStopOnEnd: true,
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
                setCurrentTranscript(transcript);
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
        setCurrentTranscript('');
        setCurrentCoachReply('');
        setCurrentCoachReplyClipId('');
        setSessionSummary(null);
        setTypedTranscript('');
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
        setCurrentTranscript('');
        setCurrentCoachReply('');
        setCurrentCoachReplyClipId('');
        setTypedTranscript('');
        startTurnCapture();
    }, [activeScenario, currentTurn, startTurnCapture, stopCoachPlayback]);

    const retryTurn = useCallback(() => {
        if (!activeScenario || !currentTurn) return;
        stopCoachPlayback();
        setCurrentAnalysis(null);
        setCurrentTranscript('');
        setCurrentCoachReply('');
        setCurrentCoachReplyClipId('');
        setTypedTranscript('');
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
                note: 'Session summary aggregated from guided speaking turns. It is transcript-based coaching, not model-based conversational AI scoring.',
                coachModel: 'guided_free_speaking_coach',
                evidenceLevel: 'Prompt-aligned transcript coaching',
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
        setCurrentTranscript('');
        setCurrentCoachReply('');
        setCurrentCoachReplyClipId('');
        setTypedTranscript('');
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
        setCurrentTranscript('');
        setCurrentCoachReply('');
        setCurrentCoachReplyClipId('');
        setSessionSummary(null);
        setTypedTranscript('');
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
                    <div style={sectionTitleStyle}>Guided open speaking</div>
                    <p style={{ margin: '8px 0 0', color: SPEAKING_UI_THEME.textMuted, fontSize: '0.84rem', lineHeight: 1.65 }}>
                        Guided free speaking with studio coach audio, turn-by-turn capture, and transcript-driven feedback.
                        This module is structured, evidence-based coaching, not model-based conversational AI scoring.
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
            </div>
        );
    }

    if (sessionSummary) {
        return (
            <div className="page" style={{ color: SPEAKING_UI_THEME.textBody }}>
                <div className="page-header">
                    <button className="page-header__back" onClick={leaveScenario}>←</button>
                    <h2 className="page-header__title">{activeScenario.emoji} Session Recap</h2>
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
                        {sessionSummary.totalTurns} turns · {sessionSummary.totalWords} words · vocab progress {sessionSummary.vocabularyProgress}%
                    </div>
                </div>

                <SpeakingCoachPanel
                    analysis={{
                        overallScore: sessionSummary.overallScore,
                        analysisSummary: 'Session recap aggregated from all completed guided speaking turns.',
                        metrics: sessionSummary.metrics,
                        strengths: sessionSummary.strengths,
                        recommendations: sessionSummary.priorities.length > 0
                            ? sessionSummary.priorities
                            : ['Next round: answer one prompt with a longer example and one clearer reason.'],
                        evidenceLevel: 'Aggregated transcript coaching',
                        note: 'This summary is built from your completed turns in the guided coach. It does not use model-based conversation AI or acoustic scoring.',
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
                    title="Session coaching summary"
                    transcriptLabel="Combined transcript"
                    transcript={sessionSummary.transcriptBundle}
                    tone="#818CF8"
                />

                <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
                    <button style={{ ...primaryButtonStyle, width: '100%' }} onClick={() => startScenario(activeScenario)}>
                        🔄 Repeat scenario
                    </button>
                    <button style={{ ...secondaryButtonStyle, width: '100%' }} onClick={leaveScenario}>
                        🧭 Choose another coach
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page" style={{ color: SPEAKING_UI_THEME.textBody }}>
            <div className="page-header">
                <button className="page-header__back" onClick={leaveScenario}>←</button>
                <h2 className="page-header__title">{activeScenario.emoji} {activeScenario.lang === 'cn' ? activeScenario.titleVi : activeScenario.title}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div style={{ ...pageCardStyle, marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                    <div>
                        <div style={sectionTitleStyle}>
                            {activeScenario.coachName} · {activeScenario.coachRole}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: SPEAKING_UI_THEME.textMuted, marginTop: '6px', lineHeight: 1.5 }}>
                            {activeScenario.targetLength}
                        </div>
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '4px 9px',
                                borderRadius: '999px',
                                background: SPEAKING_UI_THEME.accentSurface,
                                border: `1px solid ${SPEAKING_UI_THEME.accentStrong}`,
                                color: SPEAKING_UI_THEME.accentText,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                            }}>
                                {outputBadge}
                            </span>
                            {activeScenarioQA && (
                                <span style={{
                                    padding: '4px 9px',
                                    borderRadius: '999px',
                                    background: SPEAKING_UI_THEME.successSurface,
                                    border: `1px solid ${SPEAKING_UI_THEME.successBorder}`,
                                    color: SPEAKING_UI_THEME.successText,
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                }}>
                                    {activeScenarioQA.clipCount} verified clips
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setHandsFree((value) => !value)}
                        style={{
                            padding: '10px 14px',
                            borderRadius: '999px',
                            border: `1px solid ${handsFree ? SPEAKING_UI_THEME.successBorder : SPEAKING_UI_THEME.secondaryBorder}`,
                            background: handsFree ? SPEAKING_UI_THEME.successSurface : SPEAKING_UI_THEME.secondarySurface,
                            color: handsFree ? SPEAKING_UI_THEME.successText : SPEAKING_UI_THEME.secondaryText,
                            fontWeight: 800,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {handsFree ? 'Hands-free on' : 'Hands-free off'}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                    {activeScenario.vocabulary.map((item) => (
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
            </div>

            <CapabilityNotice
                icon="🎧"
                title="Coach output"
                badge={outputBadge}
                tone={studioAudioReady ? 'success' : 'warn'}
                summary={studioAudioReady
                    ? `This coach uses controlled audio assets first. Runtime will only fall back to browser TTS if a verified clip fails to load.`
                    : 'Controlled coach audio is unavailable for this scenario right now, so prompt playback will use browser TTS and may sound device-dependent.'}
                compact
            />

            <CapabilityNotice
                icon="🎙️"
                title="Speaking capture"
                badge={readiness.speechInput.badge}
                tone={readiness.speechInput.status === 'supported' ? 'success' : 'warn'}
                summary={readiness.speechInput.summary}
                compact
            />

            <div style={pageCardStyle}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: SPEAKING_UI_THEME.accentStrong, marginBottom: '10px' }}>
                    Turn {turnIndex + 1}/{activeScenario.turns.length}
                </div>
                <div style={{ display: 'grid', gap: '10px', maxHeight: '260px', overflowY: 'auto' }}>
                    {messages.map((message, index) => (
                        <div
                            key={`${message.role}-${index}`}
                            style={getTimelineBubbleStyle(message.role)}
                        >
                            {message.text}
                        </div>
                    ))}
                    {interimText && phase === 'recording' && (
                        <div style={{
                            marginLeft: '18%',
                            padding: '10px 12px',
                            borderRadius: '16px',
                            background: SPEAKING_UI_THEME.interimSurface,
                            color: SPEAKING_UI_THEME.interimText,
                            lineHeight: 1.5,
                            fontSize: '0.82rem',
                            fontStyle: 'italic',
                            border: `1px solid ${SPEAKING_UI_THEME.borderSoft}`,
                        }}>
                            {interimText}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ ...pageCardStyle, marginTop: '12px' }}>
                <div style={sectionTitleStyle}>
                    {currentTurn.prompt}
                </div>
                {currentTurn.promptVi && (
                    <div style={{ marginTop: '6px', fontSize: '0.8rem', color: SPEAKING_UI_THEME.textMuted, lineHeight: 1.5 }}>
                        {currentTurn.promptVi}
                    </div>
                )}
                <div style={{ marginTop: '8px', fontSize: '0.76rem', color: SPEAKING_UI_THEME.textSoft, lineHeight: 1.55 }}>
                    Tip: {currentTurn.tip}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '14px' }}>
                    <button
                        style={secondaryButtonStyle}
                        onClick={() => playCoachVoice(activeScenario.starter, { clipId: getFreeSpeakingStarterClipId() })}
                        disabled={isCoachSpeaking}
                    >
                        {isCoachSpeaking ? '🔊 Coach...' : '🔊 Play intro'}
                    </button>
                    <button
                        style={secondaryButtonStyle}
                        onClick={() => playCoachVoice(currentTurn.prompt, {
                            clipId: getFreeSpeakingPromptClipId(currentTurn.id),
                            autoRecord: true,
                        })}
                        disabled={isCoachSpeaking}
                    >
                        🔊 Play prompt
                    </button>
                    {phase !== 'recording' ? (
                        <button style={primaryButtonStyle} onClick={beginTurn}>
                            🎙️ Speak now
                        </button>
                    ) : (
                        <button style={primaryButtonStyle} onClick={stopCapture}>
                            ⏹️ Stop
                        </button>
                    )}
                    {audioUrl && (
                        <button
                            style={secondaryButtonStyle}
                            onClick={() => {
                                const audio = new Audio(audioUrl);
                                void audio.play();
                            }}
                        >
                            ▶ Nghe lại giọng mình
                        </button>
                    )}
                </div>

                <div style={{ marginTop: '10px', fontSize: '0.76rem', color: SPEAKING_UI_THEME.textMuted, lineHeight: 1.55 }}>
                    {phase === 'recording' && 'Recording in progress. Speak naturally, then stop when you finish.'}
                    {phase === 'processing' && 'Processing transcript and coaching signals...'}
                    {phase === 'done' && currentCoachReply && 'Turn complete. Review the coaching before continuing to the next prompt.'}
                </div>
            </div>

            {manualFallback && (
                <ManualTranscriptFallback
                    title={manualFallback.title}
                    description={manualFallback.description}
                    value={typedTranscript}
                    onChange={setTypedTranscript}
                    onSubmit={() => submitManualTranscript(typedTranscript)}
                    onCancel={() => {
                        setTypedTranscript('');
                        resetSession();
                    }}
                    placeholder={activeScenario.lang === 'cn' ? '请输入你刚才说的话…' : 'Type what you said…'}
                    submitLabel={activeScenario.lang === 'cn' ? '提交内容' : 'Submit transcript'}
                    cancelLabel={activeScenario.lang === 'cn' ? '取消' : 'Cancel'}
                />
            )}

            {currentAnalysis && (
                <SpeakingCoachPanel
                    analysis={currentAnalysis}
                    title="Turn-by-turn coaching"
                    transcriptLabel="Your answer"
                    transcript={currentTranscript}
                    tone="#818CF8"
                    footer={currentCoachReply ? (
                        <div style={{
                            marginTop: '10px',
                            padding: '10px 12px',
                            borderRadius: '14px',
                            background: SPEAKING_UI_THEME.accentSurface,
                            border: `1px solid ${SPEAKING_UI_THEME.accentStrong}`,
                            fontSize: '0.78rem',
                            lineHeight: 1.55,
                            color: SPEAKING_UI_THEME.textBody,
                        }}>
                            <strong style={{ color: SPEAKING_UI_THEME.accentStrong }}>Coach follow-up:</strong> {currentCoachReply}
                            {currentCoachReplyClipId && (
                                <button
                                    style={{ ...secondaryButtonStyle, marginTop: '10px' }}
                                    onClick={() => playCoachVoice(currentCoachReply, { clipId: currentCoachReplyClipId })}
                                >
                                    🔊 Play coach follow-up
                                </button>
                            )}
                        </div>
                    ) : null}
                />
            )}

            {currentAnalysis && (
                <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
                    <button style={{ ...secondaryButtonStyle, width: '100%' }} onClick={retryTurn}>
                        🔄 Retry this turn
                    </button>
                    <button style={{ ...primaryButtonStyle, width: '100%' }} onClick={goNextTurn}>
                        {turnIndex + 1 >= activeScenario.turns.length ? '📊 Finish session' : '➡️ Continue'}
                    </button>
                </div>
            )}

            <div style={{ ...pageCardStyle, marginTop: '12px', background: SPEAKING_UI_THEME.panelSurface }}>
                <div style={{ ...sectionTitleStyle, fontSize: '0.88rem' }}>Release gate applied</div>
                <div style={{ marginTop: '8px', color: SPEAKING_UI_THEME.textMuted, fontSize: '0.76rem', lineHeight: 1.6 }}>
                    This module now ships behind two checks: controlled coach audio coverage and contrast audit for dark-mode speaking surfaces.
                    If either gate fails, the QA script marks the module non-compliant before release.
                </div>
            </div>
        </div>
    );
}

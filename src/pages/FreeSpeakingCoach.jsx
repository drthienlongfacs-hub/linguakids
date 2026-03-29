import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CapabilityNotice from '../components/CapabilityNotice';
import ManualTranscriptFallback from '../components/ManualTranscriptFallback';
import SpeakingCoachPanel from '../components/SpeakingCoachPanel';
import { useGame } from '../context/GameStateContext';
import { getFreeSpeakingScenarios, buildCoachReply, buildFreeSpeakingSummary } from '../services/freeSpeakingCoachService';
import { analyzeSpeakingAttempt } from '../services/speakingAnalyticsService';
import { useSpeechPracticeSession } from '../hooks/useSpeechPracticeSession';
import { useDeviceCapabilities } from '../hooks/useDeviceCapabilities';
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
    const [sessionSummary, setSessionSummary] = useState(null);
    const [handsFree, setHandsFree] = useState(false);
    const [isCoachSpeaking, setIsCoachSpeaking] = useState(false);
    const [typedTranscript, setTypedTranscript] = useState('');
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

    const handleTurnFinalized = useCallback((transcript, durationMs) => {
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
        const coachReply = buildCoachReply({
            scenario: activeScenario,
            turnIndex,
            transcript,
        });
        const nextResult = {
            turnId: currentTurn.id,
            prompt: currentTurn.prompt,
            transcript,
            coachReply,
            analysis,
        };

        setCurrentAnalysis(analysis);
        setCurrentTranscript(transcript);
        setCurrentCoachReply(coachReply);
        setTurnResults((previous) => [...previous, nextResult]);
        setMessages((previous) => [
            ...previous,
            { role: 'user', text: transcript },
            { role: 'coach', text: coachReply },
        ]);
        updateSkillScore('speaking', analysis.overallScore);
        addXP(analysis.overallScore >= 85 ? 18 : analysis.overallScore >= 70 ? 12 : 6);
    }, [activeScenario, addXP, currentTurn, turnIndex, updateSkillScore]);

    const playCoachVoice = useCallback((text, autoRecord = false) => {
        if (!activeScenario || !text) return;
        setIsCoachSpeaking(true);
        speakText(text, {
            lang: activeScenario.coachVoiceLang,
            rate: activeScenario.lang === 'cn' ? 0.82 : 0.9,
            onEnd: () => {
                setIsCoachSpeaking(false);
                if (autoRecord && handsFree) {
                    window.setTimeout(() => {
                        if (currentTurn) {
                            startCapture({
                                lang: activeScenario.coachVoiceLang,
                                continuous: false,
                                interimResults: true,
                                maxAlternatives: 3,
                                autoStopOnEnd: true,
                                fallback: buildFallbackCopy(activeScenario.lang),
                                onFinalize: ({ transcript, durationMs }) => {
                                    handleTurnFinalized(transcript, durationMs);
                                },
                            });
                        }
                    }, 260);
                }
            },
        });
    }, [activeScenario, currentTurn, handleTurnFinalized, handsFree, startCapture]);

    const startScenario = useCallback((scenario) => {
        setActiveScenario(scenario);
        setTurnIndex(0);
        setTurnResults([]);
        setCurrentAnalysis(null);
        setCurrentTranscript('');
        setCurrentCoachReply('');
        setSessionSummary(null);
        setTypedTranscript('');
        resetSession();
        setMessages([
            { role: 'coach', text: scenario.starter },
            { role: 'coach', text: scenario.turns[0].prompt },
        ]);
    }, [resetSession]);

    const beginTurn = useCallback(() => {
        if (!activeScenario || !currentTurn) return;
        setCurrentAnalysis(null);
        setCurrentTranscript('');
        setCurrentCoachReply('');
        setTypedTranscript('');
        startCapture({
            lang: activeScenario.coachVoiceLang,
            continuous: false,
            interimResults: true,
            maxAlternatives: 3,
            autoStopOnEnd: true,
            fallback: buildFallbackCopy(activeScenario.lang),
            onFinalize: ({ transcript, durationMs }) => {
                handleTurnFinalized(transcript, durationMs);
            },
        });
    }, [activeScenario, currentTurn, handleTurnFinalized, startCapture]);

    const retryTurn = useCallback(() => {
        if (!activeScenario || !currentTurn) return;
        setCurrentAnalysis(null);
        setCurrentTranscript('');
        setCurrentCoachReply('');
        setTypedTranscript('');
        setTurnResults((previous) => previous.slice(0, -1));
        setMessages((previous) => previous.slice(0, -2));
        resetSession();
    }, [activeScenario, currentTurn, resetSession]);

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
        setTypedTranscript('');
        resetSession();
        setMessages((previous) => [...previous, { role: 'coach', text: nextTurn.prompt }]);
        if (handsFree) {
            window.setTimeout(() => {
                playCoachVoice(nextTurn.prompt, true);
            }, 200);
        }
    }, [activeScenario, addSpeakingRecap, handsFree, playCoachVoice, resetSession, turnIndex, turnResults]);

    const leaveScenario = useCallback(() => {
        resetSession();
        setActiveScenario(null);
        setTurnIndex(0);
        setMessages([]);
        setTurnResults([]);
        setCurrentAnalysis(null);
        setCurrentTranscript('');
        setCurrentCoachReply('');
        setSessionSummary(null);
        setTypedTranscript('');
    }, [resetSession]);

    if (!activeScenario) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                    <h2 className="page-header__title">🧠 Free Speaking Coach</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>

                <p style={{ color: 'var(--color-text-light)', marginBottom: '14px', fontSize: '0.86rem', lineHeight: 1.55 }}>
                    Guided free speaking inspired by the practice loop used in apps like ELSA Speech Analyzer and Loora:
                    open prompt, spoken response, structured recap, then a tighter next step.
                </p>

                <CapabilityNotice
                    icon="🧭"
                    title="Coach runtime"
                    badge={readiness.speechInput.badge}
                    tone={readiness.speechInput.status === 'supported' ? 'success' : 'warn'}
                    summary="Coach turns run fully inside the app. Speech capture depends on browser STT; if STT is unavailable, the flow degrades to typed transcript so the coaching loop still works."
                    bullets={[
                        'Prompt playback works with browser TTS.',
                        'Turn feedback is transcript-based, not acoustic phoneme scoring.',
                        'Session recap aggregates real turns you completed in this coach.',
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
                            style={{
                                flex: 1,
                                padding: '10px 12px',
                                borderRadius: '14px',
                                border: `2px solid ${activeLang === tab.id ? '#4F46E5' : 'rgba(148,163,184,0.24)'}`,
                                background: activeLang === tab.id ? 'rgba(79,70,229,0.08)' : 'rgba(255,255,255,0.86)',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                    {scenarios.map((scenario) => (
                        <button
                            key={scenario.id}
                            onClick={() => startScenario(scenario)}
                            style={{
                                padding: '16px',
                                borderRadius: '20px',
                                border: '1px solid rgba(148,163,184,0.18)',
                                background: 'rgba(255,255,255,0.92)',
                                boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
                                textAlign: 'left',
                                cursor: 'pointer',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ fontSize: '2rem' }}>{scenario.emoji}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.95rem' }}>
                                        {scenario.lang === 'cn' ? scenario.titleVi : scenario.title}
                                    </div>
                                    <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--color-text-light)', lineHeight: 1.5 }}>
                                        {scenario.lang === 'cn' ? scenario.descriptionVi : scenario.description}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.72rem', color: '#4F46E5', fontWeight: 700 }}>
                                    {scenario.turns.length} turns
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px' }}>
                                {scenario.vocabulary.map((item) => (
                                    <span
                                        key={item}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '999px',
                                            fontSize: '0.68rem',
                                            color: '#4338CA',
                                            background: 'rgba(99,102,241,0.08)',
                                            border: '1px solid rgba(99,102,241,0.18)',
                                        }}
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (sessionSummary) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={leaveScenario}>←</button>
                    <h2 className="page-header__title">{activeScenario.emoji} Session Recap</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>

                <div style={{
                    padding: '18px',
                    borderRadius: '22px',
                    background: 'rgba(255,255,255,0.94)',
                    border: '1px solid rgba(148,163,184,0.18)',
                    boxShadow: '0 18px 50px rgba(15,23,42,0.08)',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '2.8rem' }}>{activeScenario.emoji}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', marginTop: '6px' }}>
                        {activeScenario.lang === 'cn' ? activeScenario.titleVi : activeScenario.title}
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '2.2rem', fontWeight: 900, color: metricColor(sessionSummary.overallScore) }}>
                        {sessionSummary.overallScore}%
                    </div>
                    <div style={{ marginTop: '4px', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
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
                    tone="#4F46E5"
                />

                <div style={{ display: 'grid', gap: '10px', marginTop: '14px' }}>
                    <button className="btn btn--primary btn--block" onClick={() => startScenario(activeScenario)}>
                        🔄 Repeat scenario
                    </button>
                    <button className="btn btn--outline btn--block" onClick={leaveScenario}>
                        🧭 Choose another coach
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={leaveScenario}>←</button>
                <h2 className="page-header__title">{activeScenario.emoji} {activeScenario.lang === 'cn' ? activeScenario.titleVi : activeScenario.title}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div style={{
                padding: '14px 16px',
                borderRadius: '18px',
                background: 'rgba(255,255,255,0.9)',
                border: '1px solid rgba(148,163,184,0.18)',
                marginBottom: '12px',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.92rem' }}>
                            {activeScenario.coachName} · {activeScenario.coachRole}
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            {activeScenario.targetLength}
                        </div>
                    </div>
                    <button
                        onClick={() => setHandsFree((value) => !value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '999px',
                            border: `1px solid ${handsFree ? '#16A34A' : 'rgba(148,163,184,0.24)'}`,
                            background: handsFree ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.8)',
                            fontWeight: 700,
                            cursor: 'pointer',
                        }}
                    >
                        {handsFree ? 'Hands-free on' : 'Hands-free off'}
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
                    {activeScenario.vocabulary.map((item) => (
                        <span
                            key={item}
                            style={{
                                padding: '4px 8px',
                                borderRadius: '999px',
                                fontSize: '0.68rem',
                                color: '#4338CA',
                                background: 'rgba(99,102,241,0.08)',
                                border: '1px solid rgba(99,102,241,0.18)',
                            }}
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            <CapabilityNotice
                icon="🎙️"
                title="Speaking capture"
                badge={readiness.speechInput.badge}
                tone={readiness.speechInput.status === 'supported' ? 'success' : 'warn'}
                summary={readiness.speechInput.summary}
                compact
            />

            <div style={{
                padding: '14px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.92)',
                border: '1px solid rgba(148,163,184,0.18)',
                boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
            }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#4F46E5', marginBottom: '8px' }}>
                    Turn {turnIndex + 1}/{activeScenario.turns.length}
                </div>
                <div style={{ display: 'grid', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                    {messages.map((message, index) => (
                        <div
                            key={`${message.role}-${index}`}
                            style={{
                                marginLeft: message.role === 'user' ? '18%' : 0,
                                marginRight: message.role === 'coach' ? '18%' : 0,
                                padding: '10px 12px',
                                borderRadius: '16px',
                                background: message.role === 'coach'
                                    ? 'rgba(79,70,229,0.08)'
                                    : 'linear-gradient(135deg, #2563EB, #4F46E5)',
                                color: message.role === 'coach' ? 'var(--color-text)' : '#fff',
                                lineHeight: 1.5,
                                fontSize: '0.82rem',
                            }}
                        >
                            {message.text}
                        </div>
                    ))}
                    {interimText && phase === 'recording' && (
                        <div style={{
                            marginLeft: '18%',
                            padding: '10px 12px',
                            borderRadius: '16px',
                            background: 'rgba(59,130,246,0.08)',
                            color: '#1D4ED8',
                            lineHeight: 1.5,
                            fontSize: '0.82rem',
                            fontStyle: 'italic',
                        }}>
                            {interimText}
                        </div>
                    )}
                </div>
            </div>

            <div style={{
                marginTop: '12px',
                padding: '16px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.94)',
                border: '1px solid rgba(148,163,184,0.18)',
            }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.92rem' }}>
                    {currentTurn.prompt}
                </div>
                {currentTurn.promptVi && (
                    <div style={{ marginTop: '4px', fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                        {currentTurn.promptVi}
                    </div>
                )}
                <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#64748B' }}>
                    Tip: {currentTurn.tip}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <button className="btn btn--outline" onClick={() => playCoachVoice(currentTurn.prompt, true)} disabled={isCoachSpeaking}>
                        {isCoachSpeaking ? '🔊 Coach...' : '🔊 Play prompt'}
                    </button>
                    {phase !== 'recording' ? (
                        <button className="btn btn--primary" onClick={beginTurn}>
                            🎙️ Speak now
                        </button>
                    ) : (
                        <button className="btn btn--primary" onClick={stopCapture}>
                            ⏹️ Stop
                        </button>
                    )}
                    {audioUrl && (
                        <button
                            className="btn btn--outline"
                            onClick={() => {
                                const audio = new Audio(audioUrl);
                                void audio.play();
                            }}
                        >
                            ▶ Nghe lại giọng mình
                        </button>
                    )}
                </div>

                <div style={{ marginTop: '8px', fontSize: '0.74rem', color: 'var(--color-text-light)' }}>
                    {phase === 'recording' && 'Recording in progress. Speak naturally and stop when you finish.'}
                    {phase === 'processing' && 'Processing transcript and coaching signals...'}
                    {phase === 'done' && currentCoachReply && 'Turn complete. Review the coaching below before continuing.'}
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
                    tone="#2563EB"
                    footer={currentCoachReply ? (
                        <div style={{
                            marginTop: '10px',
                            padding: '10px 12px',
                            borderRadius: '14px',
                            background: 'rgba(99,102,241,0.08)',
                            border: '1px solid rgba(99,102,241,0.18)',
                            fontSize: '0.78rem',
                            lineHeight: 1.5,
                        }}>
                            <strong>Coach follow-up:</strong> {currentCoachReply}
                        </div>
                    ) : null}
                />
            )}

            {currentAnalysis && (
                <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                    <button className="btn btn--outline btn--block" onClick={retryTurn}>
                        🔄 Retry this turn
                    </button>
                    <button className="btn btn--primary btn--block" onClick={goNextTurn}>
                        {turnIndex + 1 >= activeScenario.turns.length ? '📊 Finish session' : '➡️ Continue'}
                    </button>
                </div>
            )}
        </div>
    );
}

// AccentPractice — Practice with different English accents + Voice Personalities
// Upgraded to prefer controlled studio audio packs on mobile, with browser TTS fallback.

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';
import ManualTranscriptFallback from '../components/ManualTranscriptFallback';
import SpeakingCoachPanel from '../components/SpeakingCoachPanel';
import {
    ACCENT_PROFILES,
    VOICE_PERSONALITIES,
    DEFAULT_PERSONALITY,
    findPersonalityVoice,
    getPersonalityProsody,
    detectPlatform,
} from '../data/voicePersonalities';
import {
    ACCENT_PREVIEW_TEXT,
    PERSONALITY_PREVIEW_TEXT,
    PRACTICE_SENTENCES,
    ACCENT_PRACTICE_TOTAL,
} from '../data/accentPracticeContent';
import {
    getAccentVoicePackClip,
    getAccentVoicePackEntry,
    loadAccentVoicePackManifest,
    loadAccentVoicePackQA,
} from '../services/accentVoicePackService';
import { analyzeSpeakingAttempt } from '../services/speakingAnalyticsService';
import { useSpeechPracticeSession } from '../hooks/useSpeechPracticeSession';

export default function AccentPractice() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [selectedAccent, setSelectedAccent] = useState(null);
    const [selectedPersonality, setSelectedPersonality] = useState(DEFAULT_PERSONALITY);
    const [voices, setVoices] = useState([]);
    const [voicePackManifest, setVoicePackManifest] = useState(null);
    const [voicePackQA, setVoicePackQA] = useState(null);
    const [voicePackStatus, setVoicePackStatus] = useState('loading');
    const [step, setStep] = useState('accent'); // accent | personality | practice | results
    const [sIdx, setSIdx] = useState(0);
    const [spoken, setSpoken] = useState('');
    const [analysis, setAnalysis] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [results, setResults] = useState([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [playbackSource, setPlaybackSource] = useState('idle');
    const [typedTranscript, setTypedTranscript] = useState('');
    const audioRef = useRef(null);
    const TOTAL = ACCENT_PRACTICE_TOTAL;
    const {
        phase: capturePhase,
        interimText,
        audioUrl,
        manualFallback,
        startCapture,
        stopCapture,
        resetSession,
        submitManualTranscript,
    } = useSpeechPracticeSession('AccentPractice');

    useEffect(() => {
        const loadVoices = () => setVoices(window.speechSynthesis?.getVoices() || []);
        loadVoices();
        window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
        const t1 = setTimeout(loadVoices, 500);
        const t2 = setTimeout(loadVoices, 1500);
        return () => {
            window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
            clearTimeout(t1);
            clearTimeout(t2);
        };
    }, []);

    useEffect(() => {
        let active = true;
        loadAccentVoicePackManifest()
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
        loadAccentVoicePackQA()
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

    const platform = detectPlatform();

    const stopPlayback = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    }, []);

    useEffect(() => () => {
        stopPlayback();
        resetSession();
    }, [resetSession, stopPlayback]);

    const tryPlayStudioClip = useCallback(async (accentId, personalityId, clipId, playbackRate = 1) => {
        const src = getAccentVoicePackClip(voicePackManifest, accentId, personalityId, clipId);
        if (!src) return false;

        stopPlayback();
        const audio = new Audio(src);
        audio.preload = 'auto';
        audio.playbackRate = playbackRate;
        audioRef.current = audio;
        setPlaybackSource('controlled');
        setIsSpeaking(true);

        audio.onended = () => {
            if (audioRef.current === audio) audioRef.current = null;
            setIsSpeaking(false);
        };

        audio.onerror = () => {
            if (audioRef.current === audio) audioRef.current = null;
            setIsSpeaking(false);
            setPlaybackSource('browser');
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
            setIsSpeaking(false);
            setPlaybackSource('browser');
            return false;
        }
    }, [voicePackManifest, stopPlayback]);

    const speakBrowser = useCallback((text, accentId, personalityId, rateOverride) => {
        stopPlayback();
        setPlaybackSource('browser');
        setIsSpeaking(true);

        const utterance = new SpeechSynthesisUtterance(text);
        const resolvedAccent = accentId || selectedAccent;
        const resolvedPersonality = personalityId || selectedPersonality;
        const voice = findPersonalityVoice(voices, resolvedAccent, resolvedPersonality);
        const prosody = getPersonalityProsody(resolvedPersonality);
        const accent = ACCENT_PROFILES.find((item) => item.id === resolvedAccent);

        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        } else {
            utterance.lang = accent?.lang || 'en-US';
        }

        utterance.pitch = prosody.pitch;
        utterance.rate = typeof rateOverride === 'number' ? rateOverride : prosody.rate;
        utterance.volume = prosody.volume || 1.0;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        window.speechSynthesis?.speak(utterance);
    }, [voices, selectedAccent, selectedPersonality, stopPlayback]);

    const speak = useCallback((text, accentId, personalityId, rateOverride, clipId) => {
        const resolvedAccent = accentId || selectedAccent;
        const resolvedPersonality = personalityId || selectedPersonality;
        const playbackRate = typeof rateOverride === 'number' ? rateOverride : 1;

        void (async () => {
            const playedStudio = clipId
                ? await tryPlayStudioClip(resolvedAccent, resolvedPersonality, clipId, playbackRate)
                : false;

            if (!playedStudio) {
                speakBrowser(text, resolvedAccent, resolvedPersonality, rateOverride);
            }
        })();
    }, [selectedAccent, selectedPersonality, speakBrowser, tryPlayStudioClip]);

    const getOutputMeta = useCallback((accentId, personalityId) => {
        const packEntry = getAccentVoicePackEntry(voicePackManifest, accentId, personalityId);
        if (packEntry) {
            return {
                label: `Studio · ${packEntry.voiceLabel}`,
                mode: 'controlled',
                voiceLabel: packEntry.voiceLabel,
                variantMode: packEntry.variantMode || 'styled_variant',
            };
        }

        const voice = findPersonalityVoice(voices, accentId, personalityId);
        if (voice) {
            return {
                label: `Browser · ${voice.name}`,
                mode: 'browser',
                voiceLabel: voice.name,
                variantMode: 'browser_fallback',
            };
        }

        return {
            label: `Fallback · ${platform}`,
            mode: 'missing',
            voiceLabel: null,
            variantMode: 'missing',
        };
    }, [platform, voicePackManifest, voices]);

    const browserAudit = useMemo(() => {
        if (!selectedAccent) {
            return { uniqueCount: 0, totalResolved: 0, duplicateCount: 0 };
        }

        const assignments = VOICE_PERSONALITIES
            .map((personality) => findPersonalityVoice(voices, selectedAccent, personality.id)?.name || null)
            .filter(Boolean);
        const uniqueCount = new Set(assignments).size;
        return {
            uniqueCount,
            totalResolved: assignments.length,
            duplicateCount: Math.max(0, assignments.length - uniqueCount),
        };
    }, [selectedAccent, voices]);

    const selectedPackEntry = selectedAccent
        ? getAccentVoicePackEntry(voicePackManifest, selectedAccent, selectedPersonality)
        : null;
    const selectedAccentQA = selectedAccent ? voicePackQA?.accents?.[selectedAccent] : null;

    const handleAttemptFinalized = useCallback((transcript, durationMs) => {
        const sentence = PRACTICE_SENTENCES[sIdx];
        const analytics = analyzeSpeakingAttempt({
            spokenText: transcript,
            lang: 'en',
            durationMs,
            targetText: sentence.text,
            promptText: sentence.text,
            sampleAnswer: sentence.text,
            tip: 'Mirror the full sentence clearly, then compare your pacing against the model.',
            expectedMinTokens: sentence.text.split(/\s+/).filter(Boolean).length,
        });
        const nextScore = analytics.overallScore;

        setSpoken(transcript);
        setAnalysis(analytics);

        if (nextScore >= 70) {
            addXP(nextScore >= 90 ? 15 : 10);
            setCelebration((value) => value + 1);
        }
    }, [addXP, sIdx]);

    const startListening = useCallback(() => {
        stopPlayback();
        setSpoken('');
        setAnalysis(null);
        setTypedTranscript('');
        startCapture({
            lang: ACCENT_PROFILES.find((item) => item.id === selectedAccent)?.lang || 'en-US',
            continuous: false,
            interimResults: true,
            maxAlternatives: 3,
            autoStopOnEnd: true,
            fallback: {
                title: 'Nhập lại câu bạn vừa nói',
                description: 'Nếu browser không chấm nói trực tiếp được, hãy nhập transcript để tiếp tục coaching.',
            },
            onFinalize: ({ transcript, durationMs }) => {
                handleAttemptFinalized(transcript, durationMs);
            },
        });
    }, [handleAttemptFinalized, selectedAccent, startCapture, stopPlayback]);

    const next = () => {
        if (!analysis) return;
        const nextResult = {
            sentence: PRACTICE_SENTENCES[sIdx].text,
            spoken,
            analysis,
            accent: selectedAccent,
            personality: selectedPersonality,
            playbackSource,
        };
        const nextResults = [...results, nextResult];
        setResults(nextResults);

        if (sIdx + 1 >= TOTAL) {
            resetSession();
            setStep('results');
        } else {
            setSIdx((value) => value + 1);
            setSpoken('');
            setAnalysis(null);
            setTypedTranscript('');
            resetSession();
        }
    };

    if (step === 'accent') {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                    <h2 className="page-header__title">🌍 Accent Practice</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '16px', fontSize: '0.9rem' }}>
                    Chọn giọng bản ngữ để luyện tập:
                </p>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {ACCENT_PROFILES.map((accent) => {
                        const outputMeta = getOutputMeta(accent.id, DEFAULT_PERSONALITY);
                        return (
                            <button
                                key={accent.id}
                                onClick={() => { setSelectedAccent(accent.id); setStep('personality'); }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '14px',
                                    padding: '18px',
                                    borderRadius: 'var(--radius-lg)',
                                    background: `${accent.color}10`,
                                    border: `2px solid ${accent.color}40`,
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <span style={{ fontSize: '2.2rem' }}>{accent.flag}</span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: accent.color }}>
                                        {accent.label}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                        {accent.descriptionVi}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: outputMeta.mode === 'controlled' ? accent.color : 'var(--color-text-light)', marginTop: '2px', fontWeight: outputMeta.mode === 'controlled' ? 700 : 500 }}>
                                        {outputMeta.label}
                                    </div>
                                </div>
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        speak(ACCENT_PREVIEW_TEXT, accent.id, DEFAULT_PERSONALITY, 1, 'accent-preview');
                                    }}
                                    disabled={isSpeaking}
                                    style={{
                                        padding: '8px 14px',
                                        borderRadius: 'var(--radius-full)',
                                        background: accent.color,
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        opacity: isSpeaking ? 0.6 : 1,
                                    }}
                                >
                                    {isSpeaking ? '🔊...' : '🔊 Preview'}
                                </button>
                            </button>
                        );
                    })}
                </div>
                <div style={{ marginTop: '16px', padding: '12px', borderRadius: 'var(--radius-md)', background: 'var(--color-card)', fontSize: '0.8rem', color: 'var(--color-text-light)', lineHeight: 1.5 }}>
                    <strong>Nguồn phát hiện tại:</strong> {voicePackStatus === 'ready' ? 'Studio voice pack' : 'Browser TTS fallback'}.
                    {voicePackStatus === 'ready'
                        ? ' Preview trên mobile sẽ ưu tiên audio pack render sẵn để tránh hiện tượng giọng ù, hẹp, hoặc collapse về cùng một voice.'
                        : ' Nếu chưa tải được voice pack, app sẽ rơi về browser TTS nên chất lượng sẽ phụ thuộc voice cài trên thiết bị.'}
                    {voicePackQA?.summary && (
                        <div style={{ marginTop: '6px' }}>
                            QA: {voicePackQA.summary.presetCount} preset, {voicePackQA.summary.distinctSpeakerCount} base speaker, {voicePackQA.summary.distinctPreviewCount} preview output distinct.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (step === 'personality') {
        const accent = ACCENT_PROFILES.find((item) => item.id === selectedAccent);
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => setStep('accent')}>←</button>
                    <h2 className="page-header__title">{accent?.flag} {accent?.label}</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '16px', fontSize: '0.9rem' }}>
                    Chọn kiểu giọng nói:
                </p>

                <div style={{
                    marginBottom: '14px',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: voicePackStatus === 'ready' ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                    border: `1px solid ${voicePackStatus === 'ready' ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.22)'}`,
                    lineHeight: 1.45,
                }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>
                        {voicePackStatus === 'ready' ? 'Studio voice pack active' : 'Browser fallback active'}
                    </strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                        {voicePackStatus === 'ready'
                            ? 'Mỗi preset sẽ ưu tiên voice pack render sẵn. Browser voice chỉ dùng khi asset thiếu.'
                            : `Browser hiện mới resolve được ${browserAudit.uniqueCount}/${browserAudit.totalResolved || VOICE_PERSONALITIES.length} voice unique cho accent này, nên một số preset có thể trùng timbre nếu asset pack chưa sẵn.`}
                    </div>
                    {selectedAccentQA && (
                        <div style={{ fontSize: '0.76rem', color: 'var(--color-text-light)', marginTop: '6px' }}>
                            Audit accent này: {selectedAccentQA.presetCount} preset, {selectedAccentQA.distinctSpeakerCount} base speaker, {selectedAccentQA.distinctPreviewCount} output preview distinct.
                        </div>
                    )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {VOICE_PERSONALITIES.map((personality) => {
                        const outputMeta = getOutputMeta(selectedAccent, personality.id);
                        const isSelected = selectedPersonality === personality.id;
                        return (
                            <button
                                key={personality.id}
                                onClick={() => setSelectedPersonality(personality.id)}
                                style={{
                                    padding: '14px 12px',
                                    borderRadius: 'var(--radius-md)',
                                    background: isSelected ? `${personality.color}18` : 'var(--color-card)',
                                    border: `2px solid ${isSelected ? personality.color : 'var(--color-border)'}`,
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'all 0.2s',
                                    boxShadow: isSelected ? `0 2px 12px ${personality.color}30` : 'var(--shadow-sm)',
                                }}
                            >
                                <div style={{ fontSize: '1.6rem', marginBottom: '4px' }}>{personality.emoji}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', color: isSelected ? personality.color : 'var(--color-text)' }}>
                                    {personality.labelVi}
                                </div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', marginTop: '2px', lineHeight: 1.3 }}>
                                    {personality.descriptionVi}
                                </div>
                                <div style={{ fontSize: '0.6rem', color: personality.color, marginTop: '4px', fontWeight: 700 }}>
                                    {personality.gender === 'male' ? '♂ Nam' : '♀ Nữ'} · {outputMeta.mode === 'controlled' ? outputMeta.voiceLabel : 'Browser'}
                                </div>
                                <div style={{ fontSize: '0.58rem', color: 'var(--color-text-light)', marginTop: '2px', minHeight: '16px' }}>
                                    {outputMeta.label}
                                </div>
                                <div style={{ fontSize: '0.56rem', color: 'var(--color-text-light)', marginTop: '2px', minHeight: '14px' }}>
                                    {outputMeta.variantMode === 'distinct_speaker' && 'Distinct speaker'}
                                    {outputMeta.variantMode === 'styled_variant' && 'Styled studio variant'}
                                    {outputMeta.variantMode === 'browser_fallback' && 'Browser fallback'}
                                </div>
                                <button
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        speak(PERSONALITY_PREVIEW_TEXT, selectedAccent, personality.id, 1, 'personality-preview');
                                    }}
                                    disabled={isSpeaking}
                                    style={{
                                        marginTop: '6px',
                                        padding: '4px 10px',
                                        borderRadius: 'var(--radius-full)',
                                        background: personality.color,
                                        color: 'white',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                        opacity: isSpeaking ? 0.6 : 1,
                                    }}
                                >
                                    {isSpeaking ? '🔊' : '▶ Nghe thử'}
                                </button>
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={() => { setSIdx(0); setResults([]); setScore(null); setStep('practice'); }}
                    className="btn btn--primary btn--block"
                    style={{ marginTop: '16px' }}
                >
                    🎯 Bắt đầu luyện tập
                </button>
            </div>
        );
    }

    if (step === 'results') {
        const avg = results.length ? Math.round(results.reduce((sum, item) => sum + item.score, 0) / results.length) : 0;
        const accent = ACCENT_PROFILES.find((item) => item.id === selectedAccent);
        const personality = VOICE_PERSONALITIES.find((item) => item.id === selectedPersonality);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '40px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>{accent?.flag}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', color: accent?.color }}>{accent?.label}</h2>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    {personality?.emoji} {personality?.labelVi}
                </p>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: avg >= 80 ? '#22C55E' : avg >= 50 ? '#F59E0B' : '#EF4444', margin: '8px 0' }}>
                    {avg}%
                </p>
                <div style={{ textAlign: 'left', maxWidth: '420px', margin: '12px auto' }}>
                    {results.map((item, index) => (
                        <div
                            key={`${item.sentence}-${index}`}
                            style={{
                                padding: '8px 12px',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '4px',
                                background: 'var(--color-card)',
                                borderLeft: `3px solid ${item.score >= 80 ? '#22C55E' : item.score >= 50 ? '#F59E0B' : '#EF4444'}`,
                            }}
                        >
                            <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.sentence}</div>
                            <div style={{ fontSize: '0.75rem', color: item.score >= 80 ? '#22C55E' : '#EF4444' }}>
                                → {item.spoken} ({item.score}%)
                            </div>
                            <div style={{ fontSize: '0.66rem', color: 'var(--color-text-light)' }}>
                                Nguồn mẫu: {item.playbackSource === 'controlled' ? 'Studio voice pack' : 'Browser fallback'}
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '12px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => setStep('accent')}>🌍 Chọn giọng khác</button>
                    <button className="btn btn--outline btn--block" onClick={() => setStep('personality')}>🎭 Đổi kiểu giọng</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    const sentence = PRACTICE_SENTENCES[sIdx];
    const accent = ACCENT_PROFILES.find((item) => item.id === selectedAccent);
    const personality = VOICE_PERSONALITIES.find((item) => item.id === selectedPersonality);

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => setStep('personality')}>←</button>
                <h2 className="page-header__title">{accent?.flag} {personality?.emoji} {accent?.label}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(sIdx / TOTAL) * 100}%`, background: accent?.color }} />
                </div>
                <span className="lesson-progress__text">{sIdx + 1}/{TOTAL}</span>
            </div>

            <div style={{
                marginTop: '12px',
                marginBottom: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: selectedPackEntry ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${selectedPackEntry ? 'rgba(16,185,129,0.18)' : 'rgba(245,158,11,0.22)'}`,
                lineHeight: 1.45,
            }}>
                <strong style={{ display: 'block', marginBottom: '4px' }}>
                    {selectedPackEntry ? 'Studio playback active' : 'Browser playback fallback'}
                </strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    {selectedPackEntry
                        ? `${selectedPackEntry.voiceLabel} dang duoc dung cho preset nay. ${selectedPackEntry.variantMode === 'distinct_speaker' ? 'Preset nay la speaker rieng.' : 'Preset nay la studio style variant tren base speaker hien co.'} Nut cham/nhanh chi doi playback rate tren audio pack, khong doi timbre goc.`
                        : 'Preset nay dang dung browser TTS. Chat luong va do khac biet giua cac voice se phu thuoc cac voice da cai trong may.'}
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 'var(--radius-full)', background: `${personality?.color}15`, border: `1px solid ${personality?.color}30`, fontSize: '0.7rem', fontWeight: 600, color: personality?.color, marginBottom: '10px' }}>
                    {personality?.emoji} {personality?.labelVi} · {personality?.gender === 'male' ? '♂' : '♀'}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.6, marginBottom: '8px' }}>
                    "{sentence.text}"
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{sentence.vi}</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap' }}>
                    <button onClick={() => speak(sentence.text, selectedAccent, selectedPersonality, 0.78, sentence.id)} disabled={isSpeaking} className="btn btn--outline" style={{ fontSize: '0.8rem' }}>🐢 Chậm</button>
                    <button onClick={() => speak(sentence.text, selectedAccent, selectedPersonality, 1, sentence.id)} disabled={isSpeaking} className="btn btn--primary">
                        {isSpeaking ? '🔊 Đang phát...' : `🔊 Nghe ${accent?.label}`}
                    </button>
                    <button onClick={() => speak(sentence.text, selectedAccent, selectedPersonality, 1.15, sentence.id)} disabled={isSpeaking} className="btn btn--outline" style={{ fontSize: '0.8rem' }}>🐇 Nhanh</button>
                </div>
                <div style={{ marginTop: '10px', fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
                    Nguồn mẫu: {playbackSource === 'controlled' ? 'Studio voice pack' : playbackSource === 'browser' ? 'Browser fallback' : selectedPackEntry ? 'Studio voice pack' : 'Browser fallback'}
                </div>
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0' }}>
                <button
                    onClick={startListening}
                    disabled={listening || isSpeaking}
                    style={{
                        width: '90px',
                        height: '90px',
                        borderRadius: '50%',
                        border: 'none',
                        background: listening ? '#EF4444' : accent?.color,
                        color: 'white',
                        fontSize: '2.2rem',
                        cursor: 'pointer',
                        boxShadow: listening ? '0 0 0 8px #EF444440' : `0 0 0 8px ${accent?.color}30`,
                        animation: listening ? 'pulse 1.2s infinite' : 'none',
                        opacity: isSpeaking ? 0.4 : 1,
                    }}
                >
                    {listening ? '⏹️' : '🎙️'}
                </button>
                <p style={{ marginTop: '6px', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    {listening ? '🔴 Đang nghe...' : isSpeaking ? '🔊 Chờ phát xong...' : 'Bấm → Nói theo giọng mẫu'}
                </p>
            </div>

            {score !== null && (
                <div style={{
                    textAlign: 'center',
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: `${score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'}10`,
                    border: `2px solid ${score >= 80 ? '#22C55E' : score >= 50 ? '#F59E0B' : '#EF4444'}`,
                    margin: '12px 0',
                }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: score >= 80 ? '#22C55E' : '#F59E0B' }}>
                        {score >= 90 ? '🌟' : score >= 70 ? '👍' : '💪'} {score}%
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '4px' }}>Bạn nói: "{spoken}"</div>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
                        {score < 70 && <button className="btn btn--outline" onClick={startListening}>🔄 Thử lại</button>}
                        <button className="btn btn--primary" onClick={next}>{sIdx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Tiếp'}</button>
                    </div>
                </div>
            )}
        </div>
    );
}

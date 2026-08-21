// PronunciationLab — Advanced pronunciation practice & assessment
// Upgraded with:
// 1. Hardened speech capture via useSpeechPracticeSession (solves iOS WebKit mic conflict)
// 2. In-App Browser guard (detects Zalo/FB with clear browser escape instructions)
// 3. PronunciationDetail integration (IPA phonetic tips for Vietnamese learners)
// 4. "Tạm thời không thể nói" (Duolingo-style quiet mode fallback)
// 5. Native personality-aware TTS playback

import { useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ALL_ENGLISH_WORDS } from '../data/english';
import { ALL_CHINESE_WORDS } from '../data/chinese';
import { useGame } from '../context/GameStateContext';
import { usePracticeLexicon } from '../hooks/usePracticeLexicon';
import { isAdultMode } from '../utils/userMode';
import StarBurst from '../components/StarBurst';
import PronunciationDetail from '../components/PronunciationDetail';
import ManualTranscriptFallback from '../components/ManualTranscriptFallback';
import { speakText } from '../utils/speakText';
import { analyzeWordByWord, checkWordPronunciation } from '../utils/pronunciationEngine';
import { useSpeechPracticeSession } from '../hooks/useSpeechPracticeSession';
import { getInAppBrowserName } from '../services/capabilityService';

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function scoreColor(score) {
    if (score >= 85) return '#22C55E';
    if (score >= 65) return '#F59E0B';
    if (score >= 40) return '#EF4444';
    return '#94A3B8';
}

function scoreEmoji(score) {
    if (score >= 85) return '🌟';
    if (score >= 65) return '👍';
    if (score >= 40) return '💪';
    return '🔄';
}

const TOTAL = 8;

export default function PronunciationLab() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const isEN = lang !== 'cn';
    const adult = isAdultMode(state.userMode);
    const { items: allWords, loading: lexiconLoading, sourceLabel } = usePracticeLexicon({
        lang,
        adult,
        fallbackEnglish: ALL_ENGLISH_WORDS,
        fallbackChinese: ALL_CHINESE_WORDS,
    });
    const sessionKey = `${lang}:${sourceLabel}:${allWords.length}:${allWords[0]?.id || allWords[0]?.word || allWords[0]?.character || 'empty'}`;

    if (lexiconLoading || allWords.length === 0) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div className="mascot__character" style={{ fontSize: '3rem' }}>🎙️</div>
                <p style={{ fontFamily: 'var(--font-display)', marginTop: '16px' }}>
                    {adult ? 'Đang chuẩn bị phòng luyện phát âm...' : 'Đang chuẩn bị...'}
                </p>
            </div>
        );
    }

    return (
        <PronunciationSession
            key={sessionKey}
            addXP={addXP}
            allWords={allWords}
            isEN={isEN}
            navigate={navigate}
            sourceLabel={sourceLabel}
            state={state}
        />
    );
}

function PronunciationSession({ addXP, allWords, isEN, navigate, sourceLabel, state }) {
    const [words] = useState(() => shuffle(allWords).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [spoken, setSpoken] = useState('');
    const [analysisResult, setAnalysisResult] = useState(null);
    const [results, setResults] = useState([]);
    const [complete, setComplete] = useState(false);
    const [celebration, setCelebration] = useState(0);
    const [quietMode, setQuietMode] = useState(false);
    const [quietCompleted, setQuietCompleted] = useState(false);
    const inAppName = useMemo(() => getInAppBrowserName(), []);

    const {
        phase,
        interimText,
        manualFallback,
        startCapture,
        stopCapture,
        resetSession,
        submitManualTranscript,
    } = useSpeechPracticeSession('PronunciationLab');

    const currentWord = words[idx] || {};
    const target = isEN ? (currentWord.word || '') : (currentWord.character || '');

    const speak = useCallback((text) => {
        speakText(text, {
            lang: isEN ? 'en-US' : 'zh-CN',
            rate: isEN ? 0.88 : 0.75,
        });
    }, [isEN]);

    const handleEvaluation = useCallback((transcriptText, alternativesList = []) => {
        const alts = alternativesList.length > 0
            ? alternativesList
            : [{ text: transcriptText, confidence: 0.8 }];

        const wordAnalysis = analyzeWordByWord(alts, target);
        const singleWordCheck = checkWordPronunciation(alts, target);
        const effectiveScore = Math.max(wordAnalysis.score, singleWordCheck.score);

        const evaluation = {
            ...wordAnalysis,
            score: effectiveScore,
            spoken: transcriptText || singleWordCheck.matched || '',
            target,
            level: effectiveScore >= 85 ? 'perfect' : effectiveScore >= 65 ? 'good' : 'retry',
            label: effectiveScore >= 85 ? '🌟 Tuyệt vời!' : effectiveScore >= 65 ? '👍 Rất tốt!' : '💪 Cần luyện thêm',
            color: scoreColor(effectiveScore),
        };

        setSpoken(transcriptText);
        setAnalysisResult(evaluation);

        if (effectiveScore >= 65) {
            const xpGained = effectiveScore >= 85 ? 15 : 10;
            addXP(xpGained);
            setCelebration((v) => v + 1);
        }

        setResults((prev) => [...prev, {
            target,
            spoken: transcriptText,
            score: effectiveScore,
            meaning: currentWord.vietnamese || '',
        }]);
    }, [addXP, currentWord.vietnamese, target]);

    const handleStartListening = useCallback(() => {
        setAnalysisResult(null);
        setSpoken('');
        startCapture({
            lang: isEN ? 'en-US' : 'zh-CN',
            continuous: false,
            interimResults: true,
            maxAlternatives: 3,
            autoStopOnSilence: true,
            silenceMs: 2200,
            onFinalize: ({ transcript, alternatives }) => {
                if (transcript) {
                    handleEvaluation(transcript, alternatives);
                }
            },
        });
    }, [handleEvaluation, isEN, startCapture]);

    const handleQuietModeSkip = useCallback(() => {
        setQuietCompleted(true);
        addXP(5);
        setResults((prev) => [...prev, {
            target,
            spoken: '(Nghe mẫu)',
            score: 80,
            meaning: currentWord.vietnamese || '',
        }]);
    }, [addXP, currentWord.vietnamese, target]);

    const next = useCallback(() => {
        resetSession();
        if (idx + 1 >= TOTAL) {
            setComplete(true);
        } else {
            setIdx((v) => v + 1);
            setSpoken('');
            setAnalysisResult(null);
            setQuietCompleted(false);
        }
    }, [idx, resetSession]);

    if (complete) {
        const avg = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;
        const perfect = results.filter(r => r.score >= 85).length;
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '40px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '4.5rem', marginBottom: '8px' }}>
                    {avg >= 80 ? '🏆' : avg >= 60 ? '💪' : '📚'}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '4px' }}>
                    Báo cáo Luyện Phát âm
                </h2>
                <p style={{ fontSize: '2.5rem', fontWeight: 800, color: scoreColor(avg), margin: '8px 0' }}>
                    {avg}%
                </p>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem' }}>
                    🌟 {perfect}/{TOTAL} từ đạt chuẩn · +{results.reduce((a, r) => a + (r.score >= 85 ? 15 : r.score >= 65 ? 10 : 5), 0)} XP
                </p>

                <div style={{ textAlign: 'left', maxWidth: '420px', margin: '20px auto' }}>
                    {results.map((r, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '10px 14px', borderRadius: '12px', marginBottom: '6px',
                            background: 'var(--color-card, #fff)', border: `1.5px solid ${scoreColor(r.score)}33`,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        }}>
                            <div>
                                <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{r.target}</span>
                                {r.meaning && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>{r.meaning}</div>}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <span style={{ fontWeight: 800, color: scoreColor(r.score), fontSize: '1.05rem' }}>
                                    {r.score}% {scoreEmoji(r.score)}
                                </span>
                                {r.spoken && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{r.spoken}</div>}
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '320px', margin: '20px auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => window.location.reload()}>
                        🔄 Luyện lại phiên mới
                    </button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>
                        🎮 Về khu trò chơi
                    </button>
                </div>
            </div>
        );
    }

    const isRecording = phase === 'recording';

    return (
        <div className="page" style={{ maxWidth: '640px', margin: '0 auto', paddingBottom: '40px' }}>
            <StarBurst trigger={celebration} />

            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title" style={{ fontSize: '1.2rem', margin: 0 }}>
                    🎙️ Master Phát Âm {isEN ? 'English' : 'Tiếng Trung'}
                </h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {inAppName && (
                <div style={{
                    padding: '10px 14px', borderRadius: '12px', background: '#FEF3C7',
                    border: '1.5px solid #F59E0B', color: '#92400E', fontSize: '0.82rem',
                    marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <div>
                        <strong>Đang mở trong {inAppName}:</strong> Để thu âm giọng nói mượt mà, hãy chạm <strong>⋮</strong> góc trên và chọn <em>"Mở bằng Safari / Chrome"</em>.
                    </div>
                </div>
            )}

            <div className="lesson-progress" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div className="progress-bar" style={{ flex: 1, height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                        className="progress-bar__fill"
                        style={{
                            width: `${((idx + 1) / TOTAL) * 100}%`,
                            height: '100%',
                            background: isEN ? 'linear-gradient(90deg, #3B82F6, #60A5FA)' : 'linear-gradient(90deg, #EF4444, #F87171)',
                            transition: 'width 0.3s ease',
                        }}
                    />
                </div>
                <span className="lesson-progress__text" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-light)' }}>
                    {idx + 1}/{TOTAL}
                </span>
            </div>

            <div style={{
                textAlign: 'center', padding: '24px 20px', borderRadius: '20px',
                background: 'var(--color-card, #ffffff)', boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.05)', marginBottom: '16px',
            }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>{currentWord.emoji || '💬'}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: '#1E1B4B', marginBottom: '4px' }}>
                    {target}
                </div>
                {!isEN && currentWord.pinyin && (
                    <div style={{ color: '#EF4444', fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>
                        {currentWord.pinyin}
                    </div>
                )}
                {currentWord.phonetic && (
                    <div style={{ color: '#6B7280', fontSize: '0.95rem', fontFamily: 'monospace', marginBottom: '4px' }}>
                        /{currentWord.phonetic}/
                    </div>
                )}
                <div style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', marginBottom: '16px' }}>
                    {currentWord.vietnamese}
                </div>

                <button
                    onClick={() => speak(target)}
                    style={{
                        padding: '10px 24px', border: 'none', borderRadius: '30px',
                        background: isEN ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'linear-gradient(135deg, #EF4444, #DC2626)',
                        color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem',
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
                    }}
                >
                    🔊 Nghe phát âm mẫu
                </button>
            </div>

            {!quietMode ? (
                <div style={{ textAlign: 'center', margin: '16px 0' }}>
                    <button
                        onClick={isRecording ? stopCapture : handleStartListening}
                        style={{
                            width: '90px', height: '90px', borderRadius: '50%', border: 'none',
                            background: isRecording ? '#EF4444' : 'linear-gradient(135deg, #10B981, #059669)',
                            color: 'white', fontSize: '2.4rem', cursor: 'pointer',
                            boxShadow: isRecording ? '0 0 0 10px rgba(239, 68, 68, 0.25)' : '0 0 0 10px rgba(16, 185, 129, 0.2)',
                            transition: 'all 0.3s ease',
                            animation: isRecording ? 'pulse 1.2s infinite' : 'none',
                        }}
                        title={isRecording ? 'Bấm để dừng' : 'Bấm để nói'}
                    >
                        {isRecording ? '⏹️' : '🎙️'}
                    </button>

                    <p style={{ marginTop: '10px', fontSize: '0.88rem', fontWeight: 600, color: isRecording ? '#EF4444' : 'var(--color-text-light)' }}>
                        {isRecording ? '🔴 Đang lắng nghe... Hãy phát âm rõ ràng!' : 'Chạm micro để phát âm'}
                    </p>

                    {interimText && (
                        <div style={{
                            padding: '8px 14px', background: '#F3F4F6', borderRadius: '10px',
                            display: 'inline-block', fontSize: '0.88rem', color: '#4B5563', marginTop: '6px',
                        }}>
                            Đang nghe: "<em>{interimText}</em>"
                        </div>
                    )}

                    <div style={{ marginTop: '12px' }}>
                        <button
                            onClick={() => setQuietMode(true)}
                            style={{
                                background: 'none', border: 'none', color: 'var(--color-text-light)',
                                fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline',
                            }}
                        >
                            🔇 Đang ở nơi ồn? Bật chế độ không thể nói
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{
                    padding: '18px', borderRadius: '16px', background: '#F8FAFC',
                    border: '1.5px dashed #CBD5E1', textAlign: 'center', margin: '16px 0',
                }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>🎧</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1E293B', marginBottom: '4px' }}>
                        Chế độ Luyện Nghe & Khẩu hình
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '12px' }}>
                        Bạn đã bật chế độ yên lặng. Hãy bấm nghe mẫu nhiều lần để ghi nhớ ngữ điệu.
                    </p>

                    {!quietCompleted ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                                className="btn btn--primary"
                                onClick={handleQuietModeSkip}
                                style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                            >
                                ✅ Đã nghe kỹ & Tiếp tục (+5 XP)
                            </button>
                            <button
                                className="btn btn--outline"
                                onClick={() => setQuietMode(false)}
                                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                            >
                                🎙️ Bật lại Micro
                            </button>
                        </div>
                    ) : (
                        <button className="btn btn--primary" onClick={next}>
                            ➡️ {idx + 1 >= TOTAL ? 'Xem kết quả' : 'Từ tiếp theo'}
                        </button>
                    )}
                </div>
            )}

            {manualFallback && (
                <ManualTranscriptFallback
                    fallback={manualFallback}
                    onSubmit={submitManualTranscript}
                    onCancel={resetSession}
                />
            )}

            {analysisResult && (
                <div style={{ marginTop: '16px' }}>
                    <PronunciationDetail
                        result={analysisResult}
                        targetWord={target}
                        onPlayback={() => speak(target)}
                    />

                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '16px' }}>
                        {analysisResult.score < 65 && (
                            <button
                                className="btn btn--outline"
                                onClick={handleStartListening}
                                style={{ padding: '10px 20px', fontWeight: 700 }}
                            >
                                🔄 Thử lại
                            </button>
                        )}
                        <button
                            className="btn btn--primary"
                            onClick={next}
                            style={{ padding: '10px 24px', fontWeight: 700 }}
                        >
                            {idx + 1 >= TOTAL ? '📊 Xem tổng kết' : '➡️ Từ tiếp theo'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

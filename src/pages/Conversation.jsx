// Conversation — Interactive dialogue role-play (ELSA Speak style)
// Turn-based conversation with AI characters, speech recognition, color-coded feedback
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ENGLISH_CONVERSATIONS, CHINESE_CONVERSATIONS } from '../data/conversations';
import { useGame } from '../context/GameStateContext';
import { useSpeech } from '../hooks/useSpeech';
import { analyzeWordByWord } from '../utils/pronunciationEngine';
import StarBurst from '../components/StarBurst';

const SPEAKER_INFO = {
    friend: { name: 'Bạn Lily', emoji: '👧', color: '#3B82F6' },
    waiter: { name: 'Phục vụ', emoji: '🧑‍🍳', color: '#F59E0B' },
    teacher: { name: 'Cô giáo', emoji: '👩‍🏫', color: '#8B5CF6' },
    child: { name: 'Con', emoji: '🧒', color: '#10B981' },
};

// Use external engine (Levenshtein + phonetic + multi-alt)
// Removed inline analyzeWordsDetailed — now in pronunciationEngine.js

export default function Conversation() {
    const { lang, convId } = useParams();
    const navigate = useNavigate();
    const { addXP, recordGame, state } = useGame();
    const { speak, speakEnglish, speakChinese, isSpeaking, startListening, isListening, transcript } = useSpeech();

    const isEnglish = lang === 'en';
    const allConvs = isEnglish ? ENGLISH_CONVERSATIONS : CHINESE_CONVERSATIONS;
    const conv = allConvs.find(c => c.id === convId);

    const [step, setStep] = useState(0);
    const [chatHistory, setChatHistory] = useState([]);
    const [waitingForChild, setWaitingForChild] = useState(false);
    const [lastResult, setLastResult] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);
    const [totalScore, setTotalScore] = useState(0);
    const [attempts, setAttempts] = useState(0);

    if (!conv) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <p>Không tìm thấy hội thoại 😔</p>
                <button className="btn btn--primary" onClick={() => navigate(-1)}>Quay lại</button>
            </div>
        );
    }

    const processStep = useCallback((stepIndex) => {
        if (stepIndex >= conv.dialogue.length) {
            setComplete(true);
            const isPerfect = attempts > 0 && totalScore / attempts >= 70;
            recordGame(isPerfect);
            addXP(30);
            setCelebration(c => c + 1);
            return;
        }

        const turn = conv.dialogue[stepIndex];

        if (turn.speaker === 'child') {
            setWaitingForChild(true);
            setChatHistory(prev => [...prev, {
                type: 'prompt',
                text: turn.prompt,
                hint: turn.hint,
            }]);
        } else {
            // NPC speaks
            const info = SPEAKER_INFO[turn.speaker] || SPEAKER_INFO.friend;
            setChatHistory(prev => [...prev, {
                type: 'npc',
                speaker: turn.speaker,
                name: info.name,
                emoji: info.emoji,
                color: info.color,
                text: turn.text,
                pinyin: turn.pinyin,
                vietnamese: turn.vietnamese,
            }]);

            // Auto-play audio
            setTimeout(() => {
                if (isEnglish) speakEnglish(turn.text);
                else speakChinese(turn.text);
            }, 500);

            // Auto-advance to next step after speech
            setTimeout(() => {
                processStep(stepIndex + 1);
            }, turn.text.length * 80 + 2000);
        }
    }, [conv, isEnglish, speakEnglish, speakChinese, addXP, recordGame, totalScore, attempts]);

    // Start conversation
    useEffect(() => {
        processStep(0);
    }, []);

    // Find current child turn index
    const currentChildIdx = conv.dialogue.findIndex((t, i) => i >= step && t.speaker === 'child');

    const handleSpeak = () => {
        setLastResult(null);
        const recognitionLang = isEnglish ? 'en-US' : 'zh-CN';

        startListening(recognitionLang, (results) => {
            // results is now array of {text, confidence}
            const currentTurn = currentChildIdx >= 0 ? conv.dialogue[currentChildIdx] : null;
            if (!currentTurn) return;

            // Use advanced engine with all alternatives
            const result = analyzeWordByWord(results, currentTurn.hint);
            const spokenText = results[0]?.text || results[0] || '';
            setLastResult({ ...result, spoken: spokenText });
            setTotalScore(prev => prev + result.score);
            setAttempts(prev => prev + 1);

            // Add child response to chat with word-level data
            setChatHistory(prev => [...prev, {
                type: 'child',
                text: spokenText,
                result,
            }]);

            if (result.score >= 40) {
                addXP(result.score >= 70 ? 10 : 5);
                if (result.score >= 70) setCelebration(c => c + 1);

                // Advance past this child turn + continue
                setTimeout(() => {
                    setWaitingForChild(false);
                    setLastResult(null);
                    const nextIdx = currentChildIdx + 1;
                    setStep(nextIdx);
                    processStep(nextIdx);
                }, 2000);
            }
        });
    };

    // Replay the last NPC audio
    const handleReplay = () => {
        const lastNpc = [...chatHistory].reverse().find(m => m.type === 'npc');
        if (lastNpc) {
            if (isEnglish) speakEnglish(lastNpc.text);
            else speakChinese(lastNpc.text);
        }
    };

    const handleSkip = () => {
        const currentTurn = conv.dialogue.find((t, i) => i >= step && t.speaker === 'child');
        setChatHistory(prev => [...prev, {
            type: 'child',
            text: currentTurn?.hint || '...',
            result: { score: 0, level: 'skip', color: '#94A3B8', label: '⏭️ Bỏ qua' },
        }]);
        setWaitingForChild(false);
        setLastResult(null);
        const nextStep = step + 1;
        setStep(nextStep);
        processStep(nextStep);
    };

    if (complete) {
        const avgScore = attempts > 0 ? Math.round(totalScore / attempts) : 0;
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '40px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '12px' }}>{avgScore >= 70 ? '🏆' : '🌟'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>
                    {avgScore >= 70 ? 'Tuyệt vời!' : 'Giỏi lắm!'}
                </h2>
                <p style={{ color: 'var(--color-text-light)', margin: '8px 0 24px', fontSize: '1.1rem' }}>
                    Hoàn thành: {conv.title}<br />
                    Điểm trung bình: <strong style={{ color: avgScore >= 70 ? 'var(--color-success)' : 'var(--color-xp)' }}>{avgScore}%</strong> · +30 XP
                </p>

                {/* Score breakdown bar */}
                <div style={{ maxWidth: '300px', margin: '0 auto 24px' }}>
                    <div className="progress-bar" style={{ height: '20px' }}>
                        <div className="progress-bar__fill" style={{
                            width: `${avgScore}%`,
                            background: avgScore >= 70 ? 'var(--gradient-success)' : 'var(--gradient-gold)',
                        }} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => window.location.reload()}>
                        🔄 Luyện lại
                    </button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate(-1)}>
                        📚 Chọn hội thoại khác
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <StarBurst trigger={celebration} />

            {/* Header */}
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate(-1)}>←</button>
                <h2 className="page-header__title">{conv.emoji} {conv.title}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {/* Scenario */}
            <div style={{
                background: isEnglish ? 'var(--color-english-bg)' : 'var(--color-chinese-bg)',
                borderRadius: 'var(--radius-lg)',
                padding: '12px 16px',
                marginBottom: '16px',
                fontSize: '0.9rem',
                color: 'var(--color-text-light)',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                textAlign: 'center',
            }}>
                🎭 {conv.scenario}
            </div>

            {/* Chat history */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '16px',
                maxHeight: '45vh',
                overflowY: 'auto',
                padding: '4px',
            }}>
                {chatHistory.map((msg, i) => {
                    if (msg.type === 'npc') {
                        return (
                            <div key={i} className="animate-slide-up" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: msg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.3rem', flexShrink: 0,
                                }}>
                                    {msg.emoji}
                                </div>
                                <div style={{
                                    background: 'var(--color-card)', borderRadius: '16px 16px 16px 4px', padding: '12px 16px',
                                    boxShadow: 'var(--shadow-sm)', maxWidth: '80%',
                                }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                                        {msg.text}
                                    </div>
                                    {msg.pinyin && <div style={{ fontSize: '0.85rem', color: 'var(--color-chinese)', marginTop: '4px' }}>{msg.pinyin}</div>}
                                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '4px' }}>{msg.vietnamese}</div>
                                </div>
                            </div>
                        );
                    }
                    if (msg.type === 'prompt') {
                        return (
                            <div key={i} className="animate-pop-in" style={{
                                textAlign: 'center', padding: '12px', borderRadius: 'var(--radius-lg)',
                                background: '#F0F0FF', border: '2px dashed var(--color-primary-light)',
                            }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)' }}>
                                    🎤 {msg.text}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                                    💡 Gợi ý: <em>"{msg.hint}"</em>
                                </div>
                            </div>
                        );
                    }
                    if (msg.type === 'child') {
                        return (
                            <div key={i} className="animate-slide-up" style={{
                                display: 'flex', flexDirection: 'row-reverse', gap: '10px', alignItems: 'flex-start'
                            }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.3rem', flexShrink: 0,
                                }}>
                                    🧒
                                </div>
                                <div style={{
                                    background: msg.result?.color ? `${msg.result.color}15` : '#ECFDF5',
                                    border: `2px solid ${msg.result?.color || 'var(--color-success)'}`,
                                    borderRadius: '16px 16px 4px 16px', padding: '12px 16px',
                                    maxWidth: '80%', textAlign: 'right',
                                }}>
                                    {/* Word-by-word colored display */}
                                    {msg.result?.words ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end' }}>
                                            {msg.result.words.map((w, wi) => (
                                                <span key={wi} style={{
                                                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem',
                                                    color: w.color, padding: '2px 6px', borderRadius: '6px',
                                                    background: `${w.color}15`,
                                                }}>{w.word}{w.status === 'perfect' ? '✓' : ''}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                                            {msg.text}
                                        </div>
                                    )}
                                    {msg.result && (
                                        <div style={{
                                            fontSize: '0.85rem', color: msg.result.color, fontWeight: 700,
                                            fontFamily: 'var(--font-display)', marginTop: '4px',
                                        }}>
                                            {msg.result.label} {msg.result.score}%
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>🟢 Đúng · 🟡 Gần · 🔴 Sửa</div>
                                </div>
                            </div>
                        );
                    }
                    return null;
                })}
            </div>

            {/* Speaking controls */}
            {waitingForChild && (
                <div className="animate-pop-in" style={{ textAlign: 'center', marginTop: '16px' }}>
                    <button
                        className={`mic-button ${isListening ? 'listening' : ''}`}
                        onClick={handleSpeak}
                        disabled={isListening || isSpeaking}
                        style={{ margin: '0 auto 12px' }}
                    >
                        🎤
                    </button>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '8px' }}>
                        {isListening ? '🔴 Đang nghe... (nói to rõ)' : '👆 Nhấn để nói'}
                    </p>
                    <button onClick={handleReplay} disabled={isSpeaking} style={{
                        background: 'var(--color-primary)', color: 'white', border: 'none',
                        borderRadius: 'var(--radius-full)', padding: '6px 16px', fontSize: '0.85rem',
                        cursor: 'pointer', marginBottom: '8px',
                    }}>
                        🔊 Nghe lại
                    </button>
                    <button
                        style={{
                            background: 'none', border: 'none', color: 'var(--color-text-light)',
                            fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline',
                        }}
                        onClick={handleSkip}
                    >
                        ⏭️ Bỏ qua
                    </button>
                </div>
            )}
        </div>
    );
}

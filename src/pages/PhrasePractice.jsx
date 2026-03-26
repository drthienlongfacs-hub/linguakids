// PhrasePractice — ELSA-style sentence practice with word-by-word pronunciation feedback
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PHRASE_TOPICS } from '../data/phrases';
import { useGame } from '../context/GameStateContext';
import { useSpeech } from '../hooks/useSpeech';
import StarBurst from '../components/StarBurst';

// Word-by-word comparison (ELSA-style)
function analyzeWords(spoken, target) {
    const spokenWords = spoken.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/);
    const targetWords = target.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/);

    return targetWords.map((tw, i) => {
        const sw = spokenWords[i];
        if (!sw) return { word: tw, status: 'missing', color: '#EF4444' };
        if (sw === tw) return { word: tw, status: 'perfect', color: '#10B981' };
        // Fuzzy: first 2+ chars match
        if (tw.length > 2 && sw.substring(0, Math.ceil(tw.length * 0.6)) === tw.substring(0, Math.ceil(tw.length * 0.6)))
            return { word: tw, status: 'close', color: '#F59E0B' };
        return { word: tw, status: 'wrong', color: '#EF4444' };
    });
}

function scoreFromAnalysis(analysis) {
    if (!analysis.length) return 0;
    const scores = { perfect: 100, close: 60, wrong: 0, missing: 0 };
    const total = analysis.reduce((s, w) => s + (scores[w.status] || 0), 0);
    return Math.round(total / analysis.length);
}

export default function PhrasePractice() {
    const { lang, topicId } = useParams();
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const { speakEnglish, speakChinese, startListening, isListening, isSpeaking } = useSpeech();

    const isEn = lang === 'en';
    const topic = PHRASE_TOPICS.find(t => t.id === topicId);
    const phrases = topic ? (isEn ? topic.phrases.en : topic.phrases.cn) : [];

    const [idx, setIdx] = useState(0);
    const [analysis, setAnalysis] = useState(null);
    const [spoken, setSpoken] = useState('');
    const [score, setScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [attempts, setAttempts] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [showVi, setShowVi] = useState(false);

    if (!topic) return (
        <div className="page" style={{ textAlign: 'center', paddingTop: '80px' }}>
            <button className="btn btn--primary" onClick={() => navigate(-1)}>← Quay lại</button>
        </div>
    );

    const phrase = phrases[idx];
    const total = phrases.length;
    const progress = ((idx + 1) / total) * 100;
    const sentenceText = isEn ? phrase.s : phrase.s;

    const handleListen = () => {
        if (isEn) speakEnglish(sentenceText);
        else speakChinese(sentenceText);
    };

    const handleSpeak = () => {
        setAnalysis(null);
        setSpoken('');
        const recLang = isEn ? 'en-US' : 'zh-CN';
        startListening(recLang, (results) => {
            const text = results[0] || '';
            setSpoken(text);
            const a = analyzeWords(text, sentenceText);
            const s = scoreFromAnalysis(a);
            setAnalysis(a);
            setScore(s);
            setTotalScore(prev => prev + s);
            setAttempts(prev => prev + 1);
            if (s >= 70) { addXP(s >= 90 ? 10 : 5); setCelebration(c => c + 1); }
        });
    };

    const handleNext = () => {
        setAnalysis(null); setSpoken(''); setScore(0); setShowVi(false);
        if (idx + 1 < total) setIdx(i => i + 1);
        else navigate(-1);
    };

    const handleSkip = () => {
        setAnalysis(null); setSpoken(''); setScore(0); setShowVi(false);
        if (idx + 1 < total) setIdx(i => i + 1);
        else navigate(-1);
    };

    // Auto-play on new phrase
    useEffect(() => { setTimeout(handleListen, 500); }, [idx]);

    const avgScore = attempts > 0 ? Math.round(totalScore / attempts) : 0;

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate(-1)}>←</button>
                <h2 className="page-header__title">{topic.emoji} {topic.title}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${progress}%`, background: topic.color }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{total}</span>
            </div>

            {/* Sentence card */}
            <div style={{
                background: 'var(--color-card)', borderRadius: 'var(--radius-xl)', padding: '24px',
                boxShadow: 'var(--shadow-lg)', marginBottom: '16px', textAlign: 'center',
            }}>
                {/* Word-by-word display with colors */}
                {analysis ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '12px' }}>
                        {analysis.map((w, i) => (
                            <span key={i} style={{
                                fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700,
                                color: w.color, padding: '4px 8px', borderRadius: '8px',
                                background: `${w.color}15`, border: `2px solid ${w.color}30`,
                                transition: 'all 0.3s',
                            }}>
                                {w.word}
                                {w.status === 'perfect' && ' ✓'}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '12px' }}>
                        {sentenceText}
                    </p>
                )}

                {/* Pinyin for Chinese */}
                {!isEn && phrase.py && (
                    <p style={{ fontSize: '1rem', color: 'var(--color-chinese)', marginBottom: '8px' }}>{phrase.py}</p>
                )}

                {/* Vietnamese toggle */}
                <button onClick={() => setShowVi(!showVi)} style={{
                    background: 'none', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-full)',
                    padding: '4px 16px', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--color-text-light)',
                }}>
                    {showVi ? `🇻🇳 ${phrase.vi}` : '👁️ Xem nghĩa tiếng Việt'}
                </button>

                {/* Score display */}
                {analysis && (
                    <div className="animate-pop-in" style={{ marginTop: '16px' }}>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700,
                            color: score >= 90 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444',
                        }}>
                            {score}%
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                            {score >= 90 ? '🌟 Xuất sắc!' : score >= 70 ? '👍 Tốt lắm!' : score >= 40 ? '💪 Gần đúng!' : '🔄 Thử lại!'}
                        </p>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            🟢 Đúng &nbsp; 🟡 Gần đúng &nbsp; 🔴 Cần sửa
                        </div>
                        {spoken && (
                            <p style={{ fontSize: '0.8rem', marginTop: '8px', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                                Con nói: "{spoken}"
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button className="btn btn--outline" onClick={handleListen} disabled={isSpeaking}
                    style={{ flex: 1, fontSize: '1rem' }}>
                    🔊 Nghe
                </button>
                <button className={`btn ${isListening ? 'btn--chinese' : 'btn--primary'}`}
                    onClick={handleSpeak} disabled={isListening || isSpeaking}
                    style={{ flex: 1, fontSize: '1rem' }}>
                    {isListening ? '🔴 Đang nghe...' : '🎤 Nói theo'}
                </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                {analysis && score >= 50 && (
                    <button className="btn btn--success btn--block" onClick={handleNext}>
                        ▶️ {idx + 1 < total ? 'Câu tiếp' : 'Hoàn thành!'}
                    </button>
                )}
                {analysis && score < 50 && (
                    <button className="btn btn--primary btn--block" onClick={() => { setAnalysis(null); setSpoken(''); }}>
                        🔄 Thử lại
                    </button>
                )}
                <button style={{
                    background: 'none', border: 'none', color: 'var(--color-text-light)',
                    fontSize: '0.85rem', cursor: 'pointer', padding: '8px',
                }} onClick={handleSkip}>⏭️ Bỏ qua</button>
            </div>
        </div>
    );
}

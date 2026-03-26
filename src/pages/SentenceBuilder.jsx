// SentenceBuilder — Drag words to build sentences (Duolingo-style)
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SENTENCE_EXERCISES } from '../data/conversations';
import { useGame } from '../context/GameStateContext';
import { useGameStore } from '../store/useGameStore';
import { useSpeech } from '../hooks/useSpeech';
import StarBurst from '../components/StarBurst';

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export default function SentenceBuilder() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { addXP, recordGame, state } = useGame();
    const updateSkillScore = useGameStore(s => s.updateSkillScore);
    const { speakEnglish, speakChinese } = useSpeech();

    const isEnglish = lang === 'en';
    const exercises = isEnglish ? SENTENCE_EXERCISES.english : SENTENCE_EXERCISES.chinese;

    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedWords, setSelectedWords] = useState([]);
    const [availableWords, setAvailableWords] = useState([]);
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);

    const total = Math.min(exercises.length, 6); // 6 exercises per round

    useEffect(() => {
        if (currentIndex < total) {
            const ex = exercises[currentIndex];
            setAvailableWords(shuffle([...ex.words, ...ex.distractors]));
            setSelectedWords([]);
            setResult(null);
        }
    }, [currentIndex]);

    const exercise = exercises[currentIndex];

    const handleWordTap = (word, fromSelected) => {
        if (result) return;

        if (fromSelected) {
            setSelectedWords(prev => prev.filter((w, i) => !(w === word && i === prev.indexOf(word))));
            setAvailableWords(prev => [...prev, word]);
        } else {
            setSelectedWords(prev => [...prev, word]);
            setAvailableWords(prev => {
                const idx = prev.indexOf(word);
                return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
            });
        }
    };

    const handleCheck = () => {
        if (!exercise) return;
        const answer = selectedWords.join(' ');
        const correct = answer === exercise.correctSentence;

        setResult(correct ? 'correct' : 'wrong');

        if (correct) {
            setScore(s => s + 1);
            addXP(10);
            setCelebration(c => c + 1);
            // Read the sentence aloud
            if (isEnglish) speakEnglish(exercise.correctSentence);
            else speakChinese(exercise.correctSentence);
        }

        setTimeout(() => {
            if (currentIndex + 1 >= total) {
                const isPerfect = score + (correct ? 1 : 0) === total;
                const pct = Math.round(((score + (correct ? 1 : 0)) / total) * 100);
                recordGame(isPerfect);
                updateSkillScore('grammar', pct);
                setComplete(true);
            } else {
                setCurrentIndex(prev => prev + 1);
            }
        }, correct ? 1500 : 2500);
    };

    const handleShowAnswer = () => {
        if (!exercise) return;
        setSelectedWords(exercise.words);
        setAvailableWords(exercise.distractors);
        setResult('shown');
        if (isEnglish) speakEnglish(exercise.correctSentence);
        else speakChinese(exercise.correctSentence);

        setTimeout(() => {
            if (currentIndex + 1 >= total) {
                recordGame(false);
                setComplete(true);
            } else {
                setCurrentIndex(prev => prev + 1);
            }
        }, 2500);
    };

    if (complete) {
        const pct = Math.round((score / total) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '12px' }}>{pct >= 80 ? '🏆' : '🌟'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>{pct >= 80 ? 'Xuất sắc!' : 'Giỏi lắm!'}</h2>
                <p style={{ color: 'var(--color-text-light)', margin: '8px 0', fontSize: '1.1rem' }}>
                    Đúng {score}/{total} câu ({pct}%)
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '24px' }}>
                    +{score * 10} XP ⭐
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => window.location.reload()}>🔄 Chơi lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>🎮 Trò chơi khác</button>
                </div>
            </div>
        );
    }

    if (!exercise) return null;

    const progress = ((currentIndex + 1) / total) * 100;

    return (
        <div className="page">
            <StarBurst trigger={celebration} />

            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">📝 Ghép câu {isEnglish ? '🇬🇧' : '🇨🇳'}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{
                        width: `${progress}%`,
                        background: isEnglish ? 'var(--gradient-english)' : 'var(--gradient-chinese)',
                    }} />
                </div>
                <span className="lesson-progress__text">{currentIndex + 1}/{total}</span>
            </div>

            {/* Prompt */}
            <div style={{
                textAlign: 'center', margin: '20px 0',
                fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700,
            }}>
                {exercise.prompt}
            </div>

            <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '16px' }}>
                👆 Nhấn vào từ để ghép thành câu đúng
            </p>

            {/* Selected words (answer area) */}
            <div style={{
                minHeight: '70px',
                background: result === 'correct' ? '#ECFDF5' : result === 'wrong' ? '#FFF1F2' : '#F8FAFC',
                border: `2px dashed ${result === 'correct' ? 'var(--color-success)' : result === 'wrong' ? 'var(--color-error)' : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '12px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-normal)',
            }}>
                {selectedWords.length === 0 && (
                    <span style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Ghép câu ở đây...</span>
                )}
                {selectedWords.map((word, i) => (
                    <button key={`s-${i}`} onClick={() => handleWordTap(word, true)} style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid var(--color-primary)',
                        background: 'var(--color-card)',
                        fontFamily: 'var(--font-display)',
                        fontSize: isEnglish ? '1.1rem' : '1.3rem',
                        fontWeight: 700,
                        cursor: result ? 'default' : 'pointer',
                        color: 'var(--color-primary)',
                        transition: 'all var(--transition-fast)',
                    }}>
                        {word}
                    </button>
                ))}
            </div>

            {/* Correct answer (shown on wrong) */}
            {(result === 'wrong' || result === 'shown') && (
                <div className="animate-pop-in" style={{
                    textAlign: 'center', padding: '12px', marginBottom: '16px',
                    borderRadius: 'var(--radius-lg)', background: '#ECFDF5', border: '2px solid var(--color-success)',
                }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Đáp án đúng:</span>
                    <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem',
                        color: 'var(--color-success)', marginTop: '4px',
                    }}>
                        {exercise.correctSentence}
                    </div>
                </div>
            )}

            {/* Available words */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '8px',
                justifyContent: 'center', marginBottom: '24px',
            }}>
                {availableWords.map((word, i) => (
                    <button key={`a-${i}`} onClick={() => handleWordTap(word, false)} style={{
                        padding: '10px 18px',
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid var(--color-border)',
                        background: 'var(--color-card)',
                        fontFamily: 'var(--font-display)',
                        fontSize: isEnglish ? '1.1rem' : '1.3rem',
                        fontWeight: 600,
                        cursor: result ? 'default' : 'pointer',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'all var(--transition-fast)',
                    }}>
                        {word}
                    </button>
                ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
                {!result && (
                    <>
                        <button className="btn btn--primary btn--block btn--large" onClick={handleCheck}
                            disabled={selectedWords.length === 0}>
                            ✅ Kiểm tra
                        </button>
                        <button className="btn btn--outline" onClick={handleShowAnswer}
                            style={{ minWidth: '56px' }} title="Xem đáp án">
                            💡
                        </button>
                    </>
                )}
                {result === 'correct' && (
                    <div style={{ textAlign: 'center', width: '100%', fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-success)', fontWeight: 700 }}>
                        ✅ Đúng rồi! +10 XP
                    </div>
                )}
            </div>
        </div>
    );
}

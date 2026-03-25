// Quiz Game — listen to word and pick correct image/translation
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ALL_ENGLISH_WORDS } from '../data/english';
import { ALL_CHINESE_WORDS } from '../data/chinese';
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

const TOTAL_QUESTIONS = 8;

export default function QuizGame() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { addXP, recordGame, state } = useGame();
    const updateSkillScore = useGameStore(s => s.updateSkillScore);
    const { speakEnglish, speakChinese } = useSpeech();

    const isEnglish = lang === 'en';
    const allWords = isEnglish ? ALL_ENGLISH_WORDS : ALL_CHINESE_WORDS;

    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [gameComplete, setGameComplete] = useState(false);

    // Generate questions on mount
    useEffect(() => {
        const shuffled = shuffle(allWords);
        const qs = shuffled.slice(0, TOTAL_QUESTIONS).map(correctWord => {
            // Pick 3 wrong options
            const wrongs = shuffle(allWords.filter(w =>
                isEnglish ? w.word !== correctWord.word : w.character !== correctWord.character
            )).slice(0, 3);

            const options = shuffle([correctWord, ...wrongs]);
            return { correct: correctWord, options };
        });
        setQuestions(qs);
    }, []);

    const currentQuestion = questions[currentQ];

    const playSound = useCallback(() => {
        if (!currentQuestion) return;
        if (isEnglish) {
            speakEnglish(currentQuestion.correct.word);
        } else {
            speakChinese(currentQuestion.correct.character);
        }
    }, [currentQuestion, isEnglish, speakEnglish, speakChinese]);

    // Auto-play sound for each question
    useEffect(() => {
        if (currentQuestion) {
            const timer = setTimeout(playSound, 400);
            return () => clearTimeout(timer);
        }
    }, [currentQ, questions]);

    const handleSelect = (option) => {
        if (selected !== null) return; // Already selected

        const correct = isEnglish
            ? option.word === currentQuestion.correct.word
            : option.character === currentQuestion.correct.character;

        setSelected(isEnglish ? option.word : option.character);
        setIsCorrect(correct);

        if (correct) {
            setScore(s => s + 1);
            addXP(5);
            setCelebration(c => c + 1);
        }

        // Auto-advance after delay
        setTimeout(() => {
            if (currentQ + 1 >= questions.length) {
                const isPerfect = score + (correct ? 1 : 0) === TOTAL_QUESTIONS;
                const pct = Math.round(((score + (correct ? 1 : 0)) / TOTAL_QUESTIONS) * 100);
                recordGame(isPerfect);
                updateSkillScore('vocabulary', pct);
                setGameComplete(true);
            } else {
                setCurrentQ(q => q + 1);
                setSelected(null);
                setIsCorrect(null);
            }
        }, 1200);
    };

    if (questions.length === 0) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div className="mascot__character">🐼</div>
                <p style={{ fontFamily: 'var(--font-display)', marginTop: '16px' }}>Đang chuẩn bị...</p>
            </div>
        );
    }

    if (gameComplete) {
        const pct = Math.round((score / TOTAL_QUESTIONS) * 100);
        const isPerfect = score === TOTAL_QUESTIONS;
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '60px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '6rem', marginBottom: '16px' }}>
                    {isPerfect ? '🏆' : pct >= 60 ? '🌟' : '💪'}
                </div>
                <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                    {isPerfect ? 'Hoàn hảo!' : pct >= 60 ? 'Giỏi lắm!' : 'Cố lên nào!'}
                </h2>
                <p style={{ color: 'var(--color-text-light)', marginBottom: '8px', fontSize: '1.1rem' }}>
                    Đúng {score}/{TOTAL_QUESTIONS} câu ({pct}%)
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: 'var(--color-primary)', marginBottom: '32px' }}>
                    +{score * 5} XP ⭐
                    {isPerfect && ' · 💯 Tuyệt đối!'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => window.location.reload()}>
                        🔄 Chơi lại
                    </button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>
                        🎮 Trò chơi khác
                    </button>
                </div>
            </div>
        );
    }

    const progress = ((currentQ + 1) / TOTAL_QUESTIONS) * 100;

    return (
        <div className="page">
            <StarBurst trigger={celebration} />

            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">
                    🧠 Đố Vui {isEnglish ? '🇬🇧' : '🇨🇳'}
                </h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {/* Progress */}
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{
                        width: `${progress}%`,
                        background: isEnglish ? 'var(--gradient-english)' : 'var(--gradient-chinese)',
                    }} />
                </div>
                <span className="lesson-progress__text">{currentQ + 1}/{TOTAL_QUESTIONS}</span>
            </div>

            {/* Question */}
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: 'var(--color-text-light)', marginBottom: '16px' }}>
                    🔊 Nghe và chọn đáp án đúng!
                </p>

                {/* Big play button */}
                <button
                    className="btn btn--primary btn--large"
                    onClick={playSound}
                    style={{ fontSize: '1.5rem', padding: '16px 48px' }}
                >
                    🔊 Nghe lại
                </button>

                {/* Show the Vietnamese meaning as hint */}
                <p style={{
                    marginTop: '16px',
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                }}>
                    "{currentQuestion.correct.vietnamese}"
                </p>
            </div>

            {/* Options */}
            <div className="quiz-options">
                {currentQuestion.options.map((option, i) => {
                    const optKey = isEnglish ? option.word : option.character;
                    const correctKey = isEnglish ? currentQuestion.correct.word : currentQuestion.correct.character;

                    let className = 'quiz-option';
                    if (selected !== null) {
                        if (optKey === correctKey) className += ' correct';
                        else if (optKey === selected) className += ' wrong';
                    }

                    return (
                        <button
                            key={i}
                            className={className}
                            onClick={() => handleSelect(option)}
                            disabled={selected !== null}
                        >
                            <span className="option-emoji">{option.emoji}</span>
                            <span>{isEnglish ? option.word : option.character}</span>
                            {!isEnglish && option.pinyin && (
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                                    {option.pinyin}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Result feedback */}
            {selected !== null && (
                <div className="animate-pop-in" style={{
                    textAlign: 'center',
                    marginTop: '16px',
                    fontSize: '1.3rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    color: isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                }}>
                    {isCorrect ? '✅ Đúng rồi! Giỏi lắm!' : '❌ Chưa đúng — cố lên!'}
                </div>
            )}
        </div>
    );
}

// DailyChallenge — deterministic daily challenge backed by the standard practice bank
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { ALL_ENGLISH_WORDS } from '../data/english';
import { usePracticeLexicon } from '../hooks/usePracticeLexicon';
import { isAdultMode } from '../utils/userMode';
import StarBurst from '../components/StarBurst';

const TOTAL_Q = 5;

function hashString(input) {
    let hash = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

function createRng(seed) {
    let value = seed >>> 0;
    return () => {
        value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
        return value / 4294967296;
    };
}

function seededShuffle(items, seed) {
    const rng = createRng(seed);
    const array = [...items];
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rng() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function buildDailyQuestions(words, todayKey) {
    const picked = seededShuffle(words, hashString(`challenge:${todayKey}:words`)).slice(0, TOTAL_Q);
    return picked.map((word, index) => {
        const distractors = seededShuffle(
            words.filter((candidate) => candidate.word !== word.word),
            hashString(`challenge:${todayKey}:options:${index}:${word.word}`)
        ).slice(0, 3).map((candidate) => candidate.vietnamese);

        const options = seededShuffle(
            [word.vietnamese, ...distractors],
            hashString(`challenge:${todayKey}:shuffle:${index}:${word.word}`)
        );

        return {
            word: word.word,
            emoji: word.emoji,
            correct: word.vietnamese,
            options,
        };
    });
}

export default function DailyChallenge() {
    const navigate = useNavigate();
    const { addXP, completeDailyChallenge, recordDailyActivity, state } = useGame();
    const adult = isAdultMode(state.userMode);
    const today = new Date().toISOString().slice(0, 10);
    const alreadyDone = state.lastDailyChallenge === today;
    const { items: practiceWords, loading, sourceLabel } = usePracticeLexicon({
        lang: 'en',
        adult,
        fallbackEnglish: ALL_ENGLISH_WORDS,
        fallbackChinese: [],
    });

    if (loading || !practiceWords.length) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '80px' }}>
                <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🎯</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Thử thách hôm nay</h2>
                <p style={{ color: 'var(--color-text-light)', marginTop: '12px' }}>
                    {adult ? 'Đang tải ngân hàng dữ liệu chuẩn...' : 'Đang chuẩn bị...'}
                </p>
            </div>
        );
    }

    if (alreadyDone) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '80px' }}>
                <div style={{ fontSize: '5rem', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Thử thách hôm nay đã hoàn thành!</h2>
                <p style={{ color: 'var(--color-text-light)', margin: '12px 0' }}>Quay lại vào ngày mai nhé 💪</p>
                <button className="btn btn--primary btn--large" onClick={() => navigate('/')}>🏠 Trang chủ</button>
            </div>
        );
    }

    const sessionKey = `${today}:${sourceLabel}:${practiceWords.length}:${practiceWords[0]?.id || practiceWords[0]?.word || 'empty'}`;

    return (
        <DailyChallengeSession
            key={sessionKey}
            addXP={addXP}
            adult={adult}
            completeDailyChallenge={completeDailyChallenge}
            navigate={navigate}
            questions={buildDailyQuestions(practiceWords, today)}
            recordDailyActivity={recordDailyActivity}
            sourceLabel={sourceLabel}
            state={state}
            today={today}
        />
    );
}

function DailyChallengeSession({
    addXP,
    adult,
    completeDailyChallenge,
    navigate,
    questions,
    recordDailyActivity,
    sourceLabel,
    state,
    today,
}) {
    const [qIdx, setQIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);

    const question = questions[qIdx];

    function handleAnswer(option) {
        if (selected) return;
        const correct = option === question.correct;
        setSelected(option);
        if (correct) {
            setScore((value) => value + 1);
            addXP(10);
            setCelebration((value) => value + 1);
        }
        setTimeout(() => {
            setSelected(null);
            if (qIdx + 1 >= TOTAL_Q) {
                setComplete(true);
                recordDailyActivity?.();
                completeDailyChallenge(today);
            } else {
                setQIdx((value) => value + 1);
            }
        }, 800);
    }

    if (complete) {
        const pct = Math.round((score / TOTAL_Q) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '12px' }}>{pct >= 80 ? '🏆' : pct >= 50 ? '💪' : '📚'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Thử thách hôm nay</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-primary)', margin: '8px 0' }}>
                    {score}/{TOTAL_Q} ({pct}%)
                </p>
                <p style={{ color: 'var(--color-text-light)' }}>+{score * 10} XP ⭐</p>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.82rem' }}>
                    {sourceLabel === 'standard' ? 'Nguồn: Standard lexicon' : 'Nguồn: Curriculum'}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '20px auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => navigate('/')}>🏠 Trang chủ</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>🎮 Trò chơi</button>
                </div>
            </div>
        );
    }

    if (!question) return null;

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">🎯 Thử thách hôm nay</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(qIdx / TOTAL_Q) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{qIdx + 1}/{TOTAL_Q}</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                {sourceLabel === 'standard' ? 'Nguồn: Standard lexicon' : 'Nguồn: Curriculum'}
            </div>

            <div style={{ textAlign: 'center', margin: '24px 0', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{question.emoji}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>{question.word}</div>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginTop: '4px' }}>
                    {adult && sourceLabel === 'standard' ? 'Gloss phù hợp nhất của từ này?' : 'Nghĩa của từ này?'}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {question.options.map((option, index) => {
                    const isCorrect = option === question.correct;
                    const isSelected = selected === option;
                    const showColor = selected !== null;
                    return (
                        <button
                            key={index}
                            onClick={() => handleAnswer(option)}
                            disabled={Boolean(selected)}
                            style={{
                                padding: '16px 12px',
                                borderRadius: 'var(--radius-lg)',
                                background: showColor ? (isCorrect ? '#22C55E20' : isSelected ? '#EF444420' : 'var(--color-card)') : 'var(--color-card)',
                                border: showColor ? (isCorrect ? '2px solid #22C55E' : isSelected ? '2px solid #EF4444' : '2px solid var(--color-border)') : '2px solid var(--color-border)',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                color: 'var(--color-text)',
                                cursor: selected ? 'default' : 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

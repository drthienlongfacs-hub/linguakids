// TeacherLessons.jsx — "Bài của Cô" Learning Section
// Integrates teacher's 18 chapters into interactive exercises
// Data mined from PPTX lesson files → teacherLessons.js

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEACHER_CURRICULUM, generateFlashcards, generateListenQuiz, generateSentenceBuild, getChapter } from '../data/teacherLessons';
import { useSpeech } from '../hooks/useSpeech';
import { useGame } from '../context/GameStateContext';

// ================================================================
// CHAPTER LIST VIEW (Step 1)
// ================================================================

function ChapterList({ chapters, onSelect }) {
    const categories = [
        { id: 'foundation', label: '🏗️ Nền tảng', color: '#3B82F6' },
        { id: 'sentence_pattern', label: '💬 Mẫu câu', color: '#10B981' },
        { id: 'vocabulary', label: '📖 Từ vựng', color: '#F59E0B' },
        { id: 'grammar', label: '📐 Ngữ pháp', color: '#8B5CF6' },
    ];

    return (
        <div>
            <div style={{
                textAlign: 'center', padding: '20px 16px 10px',
            }}>
                <h1 style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.6rem',
                    margin: 0, color: 'var(--color-text)',
                }}>
                    📚 Bài của Cô
                </h1>
                <p style={{
                    fontFamily: 'var(--font-body)', color: 'var(--color-text-light)',
                    fontSize: '0.9rem', margin: '4px 0 0',
                }}>
                    Luyện tập theo bài cô dạy trên lớp
                </p>
            </div>

            {categories.map(cat => {
                const catChapters = chapters.filter(c => c.category === cat.id);
                if (catChapters.length === 0) return null;

                return (
                    <div key={cat.id} style={{ padding: '8px 16px' }}>
                        <h3 style={{
                            fontFamily: 'var(--font-display)', fontSize: '1rem',
                            color: cat.color, margin: '10px 0 8px',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            {cat.label}
                            <span style={{
                                fontSize: '0.75rem', background: `${cat.color}20`,
                                color: cat.color, padding: '2px 8px', borderRadius: '10px',
                            }}>
                                {catChapters.length}
                            </span>
                        </h3>

                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                            gap: '10px',
                        }}>
                            {catChapters.map(ch => (
                                <button
                                    key={ch.id}
                                    onClick={() => onSelect(ch)}
                                    style={{
                                        background: 'var(--color-card-bg)',
                                        border: `2px solid ${cat.color}30`,
                                        borderRadius: '14px',
                                        padding: '14px 10px',
                                        cursor: 'pointer',
                                        textAlign: 'center',
                                        transition: 'all 0.2s',
                                        display: 'flex', flexDirection: 'column',
                                        alignItems: 'center', gap: '6px',
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.borderColor = cat.color;
                                        e.currentTarget.style.transform = 'translateY(-2px)';
                                        e.currentTarget.style.boxShadow = `0 4px 12px ${cat.color}30`;
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.borderColor = `${cat.color}30`;
                                        e.currentTarget.style.transform = 'none';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <span style={{ fontSize: '1.8rem' }}>{ch.emoji}</span>
                                    <span style={{
                                        fontFamily: 'var(--font-display)', fontSize: '0.8rem',
                                        fontWeight: 600, color: 'var(--color-text)',
                                    }}>
                                        {ch.titleVi}
                                    </span>
                                    <span style={{
                                        fontFamily: 'var(--font-body)', fontSize: '0.7rem',
                                        color: 'var(--color-text-light)',
                                    }}>
                                        {ch.items.length} từ
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ================================================================
// EXERCISE MODE SELECTOR (Step 2)
// ================================================================

function ExerciseSelector({ chapter, onSelect, onBack }) {
    const modes = [
        { id: 'flashcard', emoji: '🃏', label: 'Flashcard', labelVi: 'Thẻ ghi nhớ', desc: 'Nghe & nhìn từ vựng', color: '#3B82F6' },
        { id: 'listen', emoji: '👂', label: 'Listen & Choose', labelVi: 'Nghe & Chọn', desc: 'Nghe rồi chọn đáp án đúng', color: '#10B981' },
        { id: 'speak', emoji: '🎙️', label: 'Say It', labelVi: 'Nói theo', desc: 'Nghe → Lặp lại → Chấm điểm', color: '#F59E0B' },
        {
            id: 'build', emoji: '✍️', label: 'Build Sentence', labelVi: 'Xếp câu', desc: 'Sắp xếp từ thành câu đúng', color: '#8B5CF6',
            disabled: chapter.category !== 'sentence_pattern'
        },
    ];

    return (
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={onBack} style={{
                background: 'var(--color-card-bg)', border: 'none', borderRadius: '50%',
                width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}>←</button>

            <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <span style={{ fontSize: '2.5rem' }}>{chapter.emoji}</span>
                <h2 style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.3rem',
                    margin: '8px 0 4px', color: 'var(--color-text)',
                }}>
                    {chapter.titleVi}
                </h2>
                <p style={{
                    fontFamily: 'var(--font-body)', color: 'var(--color-text-light)',
                    fontSize: '0.85rem', margin: 0,
                }}>
                    {chapter.title} · {chapter.items.length} từ
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                {modes.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => !mode.disabled && onSelect(mode.id)}
                        disabled={mode.disabled}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '14px',
                            padding: '16px', borderRadius: '16px',
                            background: mode.disabled ? 'var(--color-card-bg)' : 'var(--color-card-bg)',
                            border: `2px solid ${mode.disabled ? '#e5e7eb' : mode.color + '40'}`,
                            cursor: mode.disabled ? 'not-allowed' : 'pointer',
                            opacity: mode.disabled ? 0.4 : 1,
                            textAlign: 'left', transition: 'all 0.2s',
                        }}
                    >
                        <span style={{
                            fontSize: '2rem', width: '48px', height: '48px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: `${mode.color}15`, borderRadius: '12px',
                        }}>{mode.emoji}</span>
                        <div>
                            <div style={{
                                fontFamily: 'var(--font-display)', fontWeight: 600,
                                fontSize: '0.95rem', color: 'var(--color-text)',
                            }}>{mode.labelVi}</div>
                            <div style={{
                                fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                                color: 'var(--color-text-light)',
                            }}>{mode.desc}</div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ================================================================
// FLASHCARD EXERCISE
// ================================================================

function FlashcardExercise({ chapter, onBack }) {
    const { speak } = useSpeech();
    const cards = useMemo(() => generateFlashcards(chapter), [chapter]);
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const current = cards[idx];
    const progress = ((idx + 1) / cards.length) * 100;

    const playAudio = useCallback(() => {
        if (current) speak(current.front, 'en-US', { rate: 0.85, pitch: 1.0 });
    }, [current, speak]);

    // Auto-play audio on new card
    useEffect(() => {
        const timer = setTimeout(() => playAudio(), 300);
        return () => clearTimeout(timer);
    }, [idx]); // eslint-disable-line

    const next = () => { setFlipped(false); setIdx(i => Math.min(i + 1, cards.length - 1)); };
    const prev = () => { setFlipped(false); setIdx(i => Math.max(i - 1, 0)); };

    return (
        <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <button onClick={onBack} style={{
                    background: 'var(--color-card-bg)', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem',
                }}>←</button>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: 'var(--color-text)' }}>
                    {chapter.emoji} {chapter.titleVi}
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    {idx + 1}/{cards.length}
                </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', marginBottom: '20px' }}>
                <div style={{
                    height: '100%', width: `${progress}%`,
                    background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                    borderRadius: '3px', transition: 'width 0.3s',
                }} />
            </div>

            {/* Card */}
            <div
                onClick={() => setFlipped(!flipped)}
                style={{
                    background: 'var(--color-card-bg)',
                    borderRadius: '20px',
                    padding: '40px 24px',
                    textAlign: 'center',
                    minHeight: '180px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '2px solid transparent',
                    transition: 'all 0.3s',
                }}
            >
                <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: flipped ? '1.1rem' : '1.8rem',
                    fontWeight: 700,
                    color: flipped ? 'var(--color-text-light)' : 'var(--color-text)',
                    marginBottom: '12px',
                }}>
                    {current?.front}
                </div>

                <button
                    onClick={(e) => { e.stopPropagation(); playAudio(); }}
                    style={{
                        background: '#3B82F6', color: 'white', border: 'none',
                        borderRadius: '25px', padding: '10px 24px',
                        cursor: 'pointer', fontSize: '1rem',
                        fontFamily: 'var(--font-display)',
                        display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                >
                    🔊 Nghe
                </button>

                <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                    color: 'var(--color-text-light)', margin: '12px 0 0',
                }}>
                    Chạm thẻ để lật
                </p>
            </div>

            {/* Navigation */}
            <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: '20px', gap: '12px',
            }}>
                <button onClick={prev} disabled={idx === 0} style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: idx === 0 ? '#f3f4f6' : 'var(--color-card-bg)',
                    border: '2px solid #e5e7eb', cursor: idx === 0 ? 'default' : 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: '0.9rem',
                    opacity: idx === 0 ? 0.4 : 1,
                }}>
                    ◀ Trước
                </button>
                <button onClick={next} disabled={idx === cards.length - 1} style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: idx === cards.length - 1 ? '#f3f4f6' : '#3B82F6',
                    color: idx === cards.length - 1 ? '#9ca3af' : 'white',
                    border: 'none', cursor: idx === cards.length - 1 ? 'default' : 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: '0.9rem',
                    opacity: idx === cards.length - 1 ? 0.4 : 1,
                }}>
                    Tiếp ▶
                </button>
            </div>
        </div>
    );
}

// ================================================================
// LISTEN & CHOOSE QUIZ
// ================================================================

function ListenQuiz({ chapter, onBack }) {
    const { speak } = useSpeech();
    const questions = useMemo(() => generateListenQuiz(chapter, 8), [chapter]);
    const [qIdx, setQIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    const current = questions[qIdx];

    const playAudio = useCallback(() => {
        if (current) speak(current.audio, 'en-US', { rate: 0.82, pitch: 1.0 });
    }, [current, speak]);

    useEffect(() => {
        const timer = setTimeout(() => playAudio(), 400);
        return () => clearTimeout(timer);
    }, [qIdx]); // eslint-disable-line

    const handleSelect = (option) => {
        if (selected) return;
        setSelected(option);
        const correct = option === current.answer;
        if (correct) setScore(s => s + 1);
        setTimeout(() => {
            if (qIdx < questions.length - 1) {
                setQIdx(i => i + 1);
                setSelected(null);
            } else {
                setDone(true);
            }
        }, 1200);
    };

    if (done) {
        const pct = Math.round((score / questions.length) * 100);
        return (
            <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginTop: '40px' }}>{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)' }}>
                    {pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Tốt lắm!' : 'Cố gắng thêm!'}
                </h2>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.2rem', color: 'var(--color-text)' }}>
                    {score}/{questions.length} câu đúng ({pct}%)
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                    <button onClick={onBack} style={{
                        padding: '12px 24px', borderRadius: '12px',
                        background: 'var(--color-card-bg)', border: '2px solid #e5e7eb',
                        cursor: 'pointer', fontFamily: 'var(--font-display)',
                    }}>← Quay lại</button>
                    <button onClick={() => { setQIdx(0); setSelected(null); setScore(0); setDone(false); }} style={{
                        padding: '12px 24px', borderRadius: '12px',
                        background: '#3B82F6', color: 'white', border: 'none',
                        cursor: 'pointer', fontFamily: 'var(--font-display)',
                    }}>🔄 Làm lại</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <button onClick={onBack} style={{
                    background: 'var(--color-card-bg)', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem',
                }}>←</button>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                    👂 Nghe & Chọn
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    {qIdx + 1}/{questions.length}
                </span>
            </div>

            <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', marginBottom: '20px' }}>
                <div style={{
                    height: '100%', width: `${((qIdx + 1) / questions.length) * 100}%`,
                    background: 'linear-gradient(90deg, #10B981, #3B82F6)',
                    borderRadius: '3px', transition: 'width 0.3s',
                }} />
            </div>

            {/* Play button */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <button onClick={playAudio} style={{
                    background: '#10B981', color: 'white', border: 'none',
                    borderRadius: '50%', width: '72px', height: '72px',
                    fontSize: '2rem', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                }}>
                    🔊
                </button>
                <p style={{
                    fontFamily: 'var(--font-body)', color: 'var(--color-text-light)',
                    fontSize: '0.85rem', margin: '8px 0 0',
                }}>Nhấn để nghe lại</p>
            </div>

            {/* Options grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {current?.options.map((opt, i) => {
                    const isCorrect = opt === current.answer;
                    const isSelected = selected === opt;
                    let bg = 'var(--color-card-bg)';
                    let borderColor = '#e5e7eb';
                    if (selected) {
                        if (isCorrect) { bg = '#D1FAE5'; borderColor = '#10B981'; }
                        else if (isSelected) { bg = '#FEE2E2'; borderColor = '#EF4444'; }
                    }
                    return (
                        <button
                            key={i}
                            onClick={() => handleSelect(opt)}
                            style={{
                                padding: '16px 12px', borderRadius: '14px',
                                background: bg, border: `2px solid ${borderColor}`,
                                cursor: selected ? 'default' : 'pointer',
                                fontFamily: 'var(--font-display)', fontSize: '0.9rem',
                                fontWeight: 600, color: 'var(--color-text)',
                                transition: 'all 0.2s',
                            }}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ================================================================
// SAY IT (Pronunciation Practice)
// ================================================================

function SayItExercise({ chapter, onBack }) {
    const { speak, startListening, stopListening, isListening, transcript } = useSpeech();
    const items = useMemo(() => {
        return [...chapter.items]
            .filter(i => i.length > 2)
            .sort(() => Math.random() - 0.5)
            .slice(0, 8);
    }, [chapter]);
    const [idx, setIdx] = useState(0);
    const [result, setResult] = useState(null);

    const current = items[idx];
    const progress = ((idx + 1) / items.length) * 100;

    const playModel = useCallback(() => {
        if (current) speak(current, 'en-US', { rate: 0.82, pitch: 1.0 });
    }, [current, speak]);

    useEffect(() => {
        const timer = setTimeout(() => playModel(), 300);
        return () => clearTimeout(timer);
    }, [idx]); // eslint-disable-line

    useEffect(() => {
        if (transcript && current) {
            const match = transcript.toLowerCase().trim() === current.toLowerCase().replace(/[.!?]/g, '').trim();
            setResult(match ? 'correct' : 'try-again');
        }
    }, [transcript, current]);

    const handleMic = () => {
        if (isListening) { stopListening(); }
        else { setResult(null); startListening('en-US'); }
    };

    const next = () => { setResult(null); setIdx(i => Math.min(i + 1, items.length - 1)); };

    return (
        <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <button onClick={onBack} style={{
                    background: 'var(--color-card-bg)', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem',
                }}>←</button>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                    🎙️ Nói theo
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    {idx + 1}/{items.length}
                </span>
            </div>

            <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', marginBottom: '20px' }}>
                <div style={{
                    height: '100%', width: `${progress}%`,
                    background: 'linear-gradient(90deg, #F59E0B, #EF4444)',
                    borderRadius: '3px', transition: 'width 0.3s',
                }} />
            </div>

            {/* Word display */}
            <div style={{
                background: 'var(--color-card-bg)', borderRadius: '20px',
                padding: '30px 20px', textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                marginBottom: '20px',
            }}>
                <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.6rem',
                    fontWeight: 700, color: 'var(--color-text)', marginBottom: '12px',
                }}>
                    &ldquo;{current}&rdquo;
                </div>
                <button onClick={playModel} style={{
                    background: '#F59E0B', color: 'white', border: 'none',
                    borderRadius: '20px', padding: '8px 20px',
                    cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.85rem',
                }}>
                    🔊 Nghe mẫu
                </button>
            </div>

            {/* Mic button */}
            <div style={{ textAlign: 'center' }}>
                <button onClick={handleMic} style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: isListening ? '#EF4444' : '#3B82F6',
                    color: 'white', border: 'none', fontSize: '2rem',
                    cursor: 'pointer',
                    boxShadow: isListening ? '0 0 0 8px rgba(239,68,68,0.2)' : '0 4px 16px rgba(59,130,246,0.3)',
                    animation: isListening ? 'pulse 1s infinite' : 'none',
                }}>
                    🎙️
                </button>
                <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                    color: 'var(--color-text-light)', margin: '8px 0',
                }}>
                    {isListening ? 'Đang nghe...' : 'Nhấn & Nói'}
                </p>

                {result === 'correct' && (
                    <div style={{
                        background: '#D1FAE5', color: '#065F46', borderRadius: '12px',
                        padding: '12px', fontFamily: 'var(--font-display)', fontWeight: 600,
                    }}>✅ Tuyệt vời! Phát âm đúng!</div>
                )}
                {result === 'try-again' && (
                    <div style={{
                        background: '#FEF3C7', color: '#92400E', borderRadius: '12px',
                        padding: '12px', fontFamily: 'var(--font-body)',
                    }}>
                        🔄 Bạn nói: &ldquo;{transcript}&rdquo; — Thử lại nhé!
                    </div>
                )}
            </div>

            {/* Next button */}
            {idx < items.length - 1 && (
                <button onClick={next} style={{
                    width: '100%', padding: '14px', borderRadius: '12px',
                    background: '#3B82F6', color: 'white', border: 'none',
                    cursor: 'pointer', fontFamily: 'var(--font-display)',
                    fontSize: '1rem', marginTop: '20px',
                }}>
                    Tiếp ▶
                </button>
            )}
        </div>
    );
}

// ================================================================
// SENTENCE BUILD EXERCISE
// ================================================================

function SentenceBuildExercise({ chapter, onBack }) {
    const { speak } = useSpeech();
    const exercises = useMemo(() => generateSentenceBuild(chapter, 6), [chapter]);
    const [eIdx, setEIdx] = useState(0);
    const [placed, setPlaced] = useState([]);
    const [result, setResult] = useState(null);

    const current = exercises[eIdx];
    const available = current ? current.words.filter(w => !placed.includes(w)) : [];

    const addWord = (word) => {
        const newPlaced = [...placed, word];
        setPlaced(newPlaced);

        // Check if complete
        if (newPlaced.length === current.answer.length) {
            const correct = newPlaced.join(' ').toLowerCase() === current.answer.join(' ').toLowerCase();
            setResult(correct ? 'correct' : 'wrong');
            if (correct) speak(current.sentence, 'en-US', { rate: 0.85 });
        }
    };

    const reset = () => { setPlaced([]); setResult(null); };
    const next = () => {
        setPlaced([]); setResult(null);
        setEIdx(i => Math.min(i + 1, exercises.length - 1));
    };

    if (!current) return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Chương này không có mẫu câu để xếp.</p>
            <button onClick={onBack}>← Quay lại</button>
        </div>
    );

    return (
        <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <button onClick={onBack} style={{
                    background: 'var(--color-card-bg)', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem',
                }}>←</button>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
                    ✍️ Xếp câu
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    {eIdx + 1}/{exercises.length}
                </span>
            </div>

            {/* Drop zone */}
            <div style={{
                background: 'var(--color-card-bg)', borderRadius: '16px',
                padding: '20px', minHeight: '60px', marginBottom: '16px',
                border: '2px dashed #d1d5db', textAlign: 'center',
                display: 'flex', flexWrap: 'wrap', gap: '8px',
                justifyContent: 'center', alignItems: 'center',
            }}>
                {placed.length === 0 ? (
                    <span style={{ color: 'var(--color-text-light)', fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
                        Chạm từ bên dưới để xếp câu
                    </span>
                ) : (
                    placed.map((w, i) => (
                        <span key={i} style={{
                            background: result === 'correct' ? '#D1FAE5' : result === 'wrong' ? '#FEE2E2' : '#EFF6FF',
                            padding: '8px 14px', borderRadius: '10px',
                            fontFamily: 'var(--font-display)', fontWeight: 600,
                            fontSize: '1rem', color: 'var(--color-text)',
                        }}>{w}</span>
                    ))
                )}
            </div>

            {/* Word bank */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center',
                marginBottom: '16px',
            }}>
                {available.map((word, i) => (
                    <button
                        key={i}
                        onClick={() => addWord(word)}
                        disabled={!!result}
                        style={{
                            padding: '10px 18px', borderRadius: '12px',
                            background: '#8B5CF6', color: 'white', border: 'none',
                            cursor: result ? 'default' : 'pointer',
                            fontFamily: 'var(--font-display)', fontSize: '0.95rem',
                            fontWeight: 600, opacity: result ? 0.5 : 1,
                        }}
                    >{word}</button>
                ))}
            </div>

            {/* Result & controls */}
            {result === 'correct' && (
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <div style={{
                        background: '#D1FAE5', color: '#065F46', borderRadius: '12px',
                        padding: '12px', fontFamily: 'var(--font-display)', fontWeight: 600,
                    }}>✅ Đúng rồi!</div>
                </div>
            )}
            {result === 'wrong' && (
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <div style={{
                        background: '#FEE2E2', color: '#991B1B', borderRadius: '12px',
                        padding: '12px', fontFamily: 'var(--font-body)',
                    }}>❌ Câu đúng: &ldquo;{current.sentence}&rdquo;</div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={reset} style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: 'var(--color-card-bg)', border: '2px solid #e5e7eb',
                    cursor: 'pointer', fontFamily: 'var(--font-display)',
                }}>🔄 Làm lại</button>
                {eIdx < exercises.length - 1 && (
                    <button onClick={next} style={{
                        flex: 1, padding: '12px', borderRadius: '12px',
                        background: '#8B5CF6', color: 'white', border: 'none',
                        cursor: 'pointer', fontFamily: 'var(--font-display)',
                    }}>Tiếp ▶</button>
                )}
            </div>
        </div>
    );
}

// ================================================================
// MAIN COMPONENT — ORCHESTRATOR
// ================================================================

export default function TeacherLessons() {
    const [step, setStep] = useState('chapters'); // chapters | exercises | playing
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [exerciseMode, setExerciseMode] = useState(null);
    const navigate = useNavigate();

    const handleSelectChapter = (ch) => {
        setSelectedChapter(ch);
        setStep('exercises');
    };

    const handleSelectExercise = (mode) => {
        setExerciseMode(mode);
        setStep('playing');
    };

    const goBackToChapters = () => {
        setStep('chapters');
        setSelectedChapter(null);
        setExerciseMode(null);
    };

    const goBackToExercises = () => {
        setStep('exercises');
        setExerciseMode(null);
    };

    if (step === 'chapters') {
        return <ChapterList chapters={TEACHER_CURRICULUM.chapters} onSelect={handleSelectChapter} />;
    }

    if (step === 'exercises' && selectedChapter) {
        return <ExerciseSelector chapter={selectedChapter} onSelect={handleSelectExercise} onBack={goBackToChapters} />;
    }

    if (step === 'playing' && selectedChapter && exerciseMode) {
        switch (exerciseMode) {
            case 'flashcard':
                return <FlashcardExercise chapter={selectedChapter} onBack={goBackToExercises} />;
            case 'listen':
                return <ListenQuiz chapter={selectedChapter} onBack={goBackToExercises} />;
            case 'speak':
                return <SayItExercise chapter={selectedChapter} onBack={goBackToExercises} />;
            case 'build':
                return <SentenceBuildExercise chapter={selectedChapter} onBack={goBackToExercises} />;
            default:
                return null;
        }
    }

    return null;
}

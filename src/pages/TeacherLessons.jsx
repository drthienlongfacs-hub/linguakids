// TeacherLessons.jsx — "Bài của Cô" Learning Section (v2.0)
// Fully polished: VN translations, completion tracking, voice personalities
// Data mined from 19 lesson files → teacherLessons.js

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TEACHER_CURRICULUM, generateFlashcards, generateListenQuiz, generateSentenceBuild } from '../data/teacherLessons';
import { useSpeech } from '../hooks/useSpeech';

// ================================================================
// PROGRESS TRACKING (localStorage)
// ================================================================
const STORAGE_KEY = 'linguakids_teacher_progress';

function loadProgress() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch { return {}; }
}

function saveChapterProgress(chapterId, exerciseType, score, total) {
    const progress = loadProgress();
    if (!progress[chapterId]) progress[chapterId] = {};
    const prev = progress[chapterId][exerciseType] || { best: 0, attempts: 0 };
    progress[chapterId][exerciseType] = {
        best: Math.max(prev.best, score),
        last: score,
        total,
        attempts: prev.attempts + 1,
        lastDate: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return progress;
}

function getChapterCompletion(chapterId) {
    const progress = loadProgress();
    const ch = progress[chapterId];
    if (!ch) return 0;
    const types = Object.keys(ch);
    if (types.length === 0) return 0;
    const avgBest = types.reduce((sum, t) => sum + (ch[t].best / ch[t].total), 0) / types.length;
    return Math.round(avgBest * 100);
}

// ================================================================
// CHAPTER LIST VIEW 
// ================================================================

function ChapterList({ chapters, onSelect }) {
    const navigate = useNavigate();
    const categories = [
        { id: 'foundation', label: '🏗️ Nền tảng', color: '#3B82F6' },
        { id: 'sentence_pattern', label: '💬 Mẫu câu', color: '#10B981' },
        { id: 'vocabulary', label: '📖 Từ vựng', color: '#F59E0B' },
        { id: 'grammar', label: '📐 Ngữ pháp', color: '#8B5CF6' },
    ];

    const totalItems = chapters.reduce((sum, ch) => sum + ch.items.length, 0);
    const overallProgress = Math.round(
        chapters.reduce((sum, ch) => sum + getChapterCompletion(ch.id), 0) / chapters.length
    );

    return (
        <div style={{ paddingBottom: '80px' }}>
            <div style={{ textAlign: 'center', padding: '20px 16px 6px' }}>
                <button onClick={() => navigate(-1)} style={{
                    position: 'absolute', left: '16px', top: '16px',
                    background: 'var(--color-card-bg)', border: 'none', borderRadius: '50%',
                    width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}>←</button>
                <h1 style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.6rem',
                    margin: 0, color: 'var(--color-text)',
                }}>📚 Bài của Cô</h1>
                <p style={{
                    fontFamily: 'var(--font-body)', color: 'var(--color-text-light)',
                    fontSize: '0.85rem', margin: '4px 0 0',
                }}>
                    {chapters.length} chương · {totalItems} từ vựng · Luyện tập theo bài cô dạy trên lớp
                </p>
                {/* Overall progress bar */}
                {overallProgress > 0 && (
                    <div style={{ maxWidth: '300px', margin: '10px auto 0' }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem',
                            fontFamily: 'var(--font-body)', color: 'var(--color-text-light)', marginBottom: '4px',
                        }}>
                            <span>Tiến độ tổng</span>
                            <span>{overallProgress}%</span>
                        </div>
                        <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px' }}>
                            <div style={{
                                height: '100%', width: `${overallProgress}%`,
                                background: 'linear-gradient(90deg, #10B981, #3B82F6)',
                                borderRadius: '4px', transition: 'width 0.5s',
                            }} />
                        </div>
                    </div>
                )}
            </div>

            {categories.map(cat => {
                const catChapters = chapters.filter(c => c.category === cat.id);
                if (catChapters.length === 0) return null;
                return (
                    <div key={cat.id} style={{ padding: '6px 16px' }}>
                        <h3 style={{
                            fontFamily: 'var(--font-display)', fontSize: '0.95rem',
                            color: cat.color, margin: '10px 0 8px',
                            display: 'flex', alignItems: 'center', gap: '6px',
                        }}>
                            {cat.label}
                            <span style={{
                                fontSize: '0.7rem', background: `${cat.color}15`,
                                color: cat.color, padding: '2px 8px', borderRadius: '10px',
                                fontWeight: 700,
                            }}>{catChapters.length}</span>
                        </h3>
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                            gap: '10px',
                        }}>
                            {catChapters.map(ch => {
                                const completion = getChapterCompletion(ch.id);
                                return (
                                    <button key={ch.id} onClick={() => onSelect(ch)} style={{
                                        background: 'var(--color-card-bg)',
                                        border: `2px solid ${completion === 100 ? '#10B981' : cat.color + '20'}`,
                                        borderRadius: '14px', padding: '14px 8px', cursor: 'pointer',
                                        textAlign: 'center', transition: 'all 0.2s', position: 'relative',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                    }}
                                        onMouseEnter={e => {
                                            e.currentTarget.style.borderColor = cat.color;
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = `0 4px 12px ${cat.color}25`;
                                        }}
                                        onMouseLeave={e => {
                                            e.currentTarget.style.borderColor = completion === 100 ? '#10B981' : `${cat.color}20`;
                                            e.currentTarget.style.transform = 'none';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}>
                                        {completion === 100 && (
                                            <span style={{ position: 'absolute', top: 6, right: 6, fontSize: '0.8rem' }}>✅</span>
                                        )}
                                        <span style={{ fontSize: '1.6rem' }}>{ch.emoji}</span>
                                        <span style={{
                                            fontFamily: 'var(--font-display)', fontSize: '0.78rem',
                                            fontWeight: 600, color: 'var(--color-text)', lineHeight: 1.2,
                                        }}>{ch.titleVi}</span>
                                        <span style={{
                                            fontFamily: 'var(--font-body)', fontSize: '0.65rem',
                                            color: 'var(--color-text-light)',
                                        }}>{ch.items.length} từ</span>
                                        {/* Mini progress bar */}
                                        {completion > 0 && (
                                            <div style={{
                                                width: '100%', height: '4px', background: '#e5e7eb',
                                                borderRadius: '2px', marginTop: '2px',
                                            }}>
                                                <div style={{
                                                    height: '100%', width: `${completion}%`,
                                                    background: completion === 100 ? '#10B981' : cat.color,
                                                    borderRadius: '2px',
                                                }} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ================================================================
// EXERCISE MODE SELECTOR
// ================================================================

function ExerciseSelector({ chapter, onSelect, onBack }) {
    const completion = getChapterCompletion(chapter.id);
    const progress = loadProgress()[chapter.id] || {};

    const modes = [
        { id: 'flashcard', emoji: '🃏', label: 'Thẻ ghi nhớ', desc: 'Nghe, nhìn, lật thẻ Anh-Việt', color: '#3B82F6' },
        { id: 'listen', emoji: '👂', label: 'Nghe & Chọn', desc: 'Nghe phát âm → chọn đáp án đúng', color: '#10B981' },
        { id: 'speak', emoji: '🎙️', label: 'Nói theo', desc: 'Nghe mẫu → Nói → Chấm điểm phát âm', color: '#F59E0B' },
        {
            id: 'build', emoji: '✍️', label: 'Xếp câu', desc: 'Kéo từ xếp thành câu đúng thứ tự',
            color: '#8B5CF6', disabled: chapter.category !== 'sentence_pattern'
        },
    ];

    return (
        <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
            <button onClick={onBack} style={{
                background: 'var(--color-card-bg)', border: 'none', borderRadius: '50%',
                width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>←</button>
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
                <span style={{ fontSize: '2.5rem' }}>{chapter.emoji}</span>
                <h2 style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.3rem',
                    margin: '6px 0 2px', color: 'var(--color-text)',
                }}>{chapter.titleVi}</h2>
                <p style={{
                    fontFamily: 'var(--font-body)', color: 'var(--color-text-light)',
                    fontSize: '0.85rem', margin: 0,
                }}>{chapter.title} · {chapter.items.length} từ</p>
                {completion > 0 && (
                    <div style={{
                        display: 'inline-block', marginTop: '8px', padding: '4px 14px',
                        background: completion === 100 ? '#D1FAE5' : '#EFF6FF',
                        color: completion === 100 ? '#065F46' : '#1E40AF',
                        borderRadius: '12px', fontSize: '0.8rem',
                        fontFamily: 'var(--font-display)', fontWeight: 600,
                    }}>
                        {completion === 100 ? '✅ Hoàn thành!' : `📊 ${completion}% hoàn thành`}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
                {modes.map(mode => {
                    const modeProg = progress[mode.id];
                    return (
                        <button key={mode.id} onClick={() => !mode.disabled && onSelect(mode.id)}
                            disabled={mode.disabled} style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '14px 16px', borderRadius: '16px',
                                background: 'var(--color-card-bg)',
                                border: `2px solid ${mode.disabled ? '#e5e7eb' : mode.color + '30'}`,
                                cursor: mode.disabled ? 'not-allowed' : 'pointer',
                                opacity: mode.disabled ? 0.35 : 1, textAlign: 'left',
                                transition: 'all 0.2s',
                            }}>
                            <span style={{
                                fontSize: '1.8rem', width: '44px', height: '44px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: `${mode.color}12`, borderRadius: '12px', flexShrink: 0,
                            }}>{mode.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontFamily: 'var(--font-display)', fontWeight: 600,
                                    fontSize: '0.92rem', color: 'var(--color-text)',
                                }}>{mode.label}</div>
                                <div style={{
                                    fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                                    color: 'var(--color-text-light)',
                                }}>{mode.desc}</div>
                            </div>
                            {modeProg && (
                                <span style={{
                                    fontSize: '0.7rem', fontFamily: 'var(--font-display)',
                                    color: modeProg.best === modeProg.total ? '#10B981' : '#6B7280',
                                    background: modeProg.best === modeProg.total ? '#D1FAE5' : '#F3F4F6',
                                    padding: '3px 8px', borderRadius: '8px', fontWeight: 600,
                                }}>
                                    {modeProg.best === modeProg.total ? '✅' : `${Math.round(modeProg.best / modeProg.total * 100)}%`}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ================================================================
// FLASHCARD EXERCISE — EN front, VN back
// ================================================================

function FlashcardExercise({ chapter, onBack, onComplete }) {
    const { speak } = useSpeech();
    const cards = useMemo(() => generateFlashcards(chapter), [chapter]);
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [known, setKnown] = useState(new Set());

    const current = cards[idx];
    const progress = ((idx + 1) / cards.length) * 100;

    const playAudio = useCallback(() => {
        if (current) speak(current.en, 'en-US', { rate: 0.82, pitch: 1.0 });
    }, [current, speak]);

    useEffect(() => {
        setFlipped(false);
        const timer = setTimeout(() => playAudio(), 300);
        return () => clearTimeout(timer);
    }, [idx]); // eslint-disable-line

    const markKnown = () => {
        setKnown(prev => new Set([...prev, idx]));
        if (idx < cards.length - 1) {
            setIdx(i => i + 1);
        } else {
            const score = known.size + 1;
            saveChapterProgress(chapter.id, 'flashcard', score, cards.length);
            onComplete(score, cards.length);
        }
    };

    const next = () => setIdx(i => Math.min(i + 1, cards.length - 1));
    const prev = () => setIdx(i => Math.max(i - 1, 0));

    return (
        <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <button onClick={onBack} style={{
                    background: 'var(--color-card-bg)', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem',
                }}>←</button>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-text)' }}>
                    {chapter.emoji} {chapter.titleVi}
                </span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    {idx + 1}/{cards.length}
                </span>
            </div>
            {/* Progress */}
            <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', marginBottom: '16px' }}>
                <div style={{
                    height: '100%', width: `${progress}%`,
                    background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                    borderRadius: '3px', transition: 'width 0.3s',
                }} />
            </div>

            {/* Card */}
            <div onClick={() => setFlipped(!flipped)} style={{
                background: 'var(--color-card-bg)', borderRadius: '20px',
                padding: '32px 24px', textAlign: 'center', minHeight: '200px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                border: flipped ? '2px solid #10B981' : '2px solid transparent',
                transition: 'all 0.3s',
            }}>
                {!flipped ? (
                    <>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontSize: '1.7rem',
                            fontWeight: 700, color: 'var(--color-text)', marginBottom: '14px',
                            lineHeight: 1.3,
                        }}>{current?.en}</div>
                        <button onClick={(e) => { e.stopPropagation(); playAudio(); }} style={{
                            background: '#3B82F6', color: 'white', border: 'none',
                            borderRadius: '25px', padding: '10px 24px', cursor: 'pointer',
                            fontSize: '0.95rem', fontFamily: 'var(--font-display)',
                            display: 'flex', alignItems: 'center', gap: '6px',
                            boxShadow: '0 2px 8px rgba(59,130,246,0.3)',
                        }}>🔊 Nghe</button>
                        <p style={{
                            fontFamily: 'var(--font-body)', fontSize: '0.75rem',
                            color: 'var(--color-text-light)', margin: '10px 0 0', opacity: 0.7,
                        }}>👆 Chạm thẻ để xem nghĩa tiếng Việt</p>
                    </>
                ) : (
                    <>
                        <div style={{
                            fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                            color: 'var(--color-text-light)', marginBottom: '8px',
                        }}>{current?.en}</div>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontSize: '1.5rem',
                            fontWeight: 700, color: '#10B981', marginBottom: '14px',
                            lineHeight: 1.3,
                        }}>🇻🇳 {current?.vi || '—'}</div>
                        <button onClick={(e) => { e.stopPropagation(); markKnown(); }} style={{
                            background: '#10B981', color: 'white', border: 'none',
                            borderRadius: '25px', padding: '10px 20px', cursor: 'pointer',
                            fontSize: '0.85rem', fontFamily: 'var(--font-display)',
                        }}>✅ Đã thuộc</button>
                    </>
                )}
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', gap: '10px' }}>
                <button onClick={prev} disabled={idx === 0} style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: idx === 0 ? '#f3f4f6' : 'var(--color-card-bg)',
                    border: '2px solid #e5e7eb', cursor: idx === 0 ? 'default' : 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: '0.85rem',
                    opacity: idx === 0 ? 0.4 : 1,
                }}>◀ Trước</button>
                <button onClick={next} disabled={idx === cards.length - 1} style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: idx === cards.length - 1 ? '#f3f4f6' : '#3B82F6',
                    color: idx === cards.length - 1 ? '#9ca3af' : 'white',
                    border: 'none', cursor: idx === cards.length - 1 ? 'default' : 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: '0.85rem',
                    opacity: idx === cards.length - 1 ? 0.4 : 1,
                }}>Tiếp ▶</button>
            </div>
            <p style={{
                textAlign: 'center', fontFamily: 'var(--font-body)',
                fontSize: '0.75rem', color: '#10B981', margin: '8px 0 0',
            }}>💚 Đã thuộc: {known.size}/{cards.length}</p>
        </div>
    );
}

// ================================================================
// LISTEN & CHOOSE QUIZ — with VN hints
// ================================================================

function ListenQuiz({ chapter, onBack, onComplete }) {
    const { speak } = useSpeech();
    const questions = useMemo(() => generateListenQuiz(chapter, 8), [chapter]);
    const [qIdx, setQIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [done, setDone] = useState(false);

    const current = questions[qIdx];

    const playAudio = useCallback(() => {
        if (current) speak(current.audio, 'en-US', { rate: 0.8, pitch: 1.0 });
    }, [current, speak]);

    useEffect(() => {
        setSelected(null);
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
            } else {
                const finalScore = correct ? score + 1 : score;
                saveChapterProgress(chapter.id, 'listen', finalScore, questions.length);
                setDone(true);
            }
        }, 1500);
    };

    if (done) {
        const pct = Math.round((score / questions.length) * 100);
        return <ResultScreen emoji={pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
            title={pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Tốt lắm!' : 'Cố gắng thêm!'}
            score={score} total={questions.length} onBack={onBack}
            onRetry={() => { setQIdx(0); setSelected(null); setScore(0); setDone(false); }}
            onComplete={() => onComplete(score, questions.length)} />;
    }

    return (
        <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
            <ExerciseHeader icon="👂" title="Nghe & Chọn" chapter={chapter} current={qIdx + 1}
                total={questions.length} onBack={onBack} color="#10B981" />

            {/* Play button */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button onClick={playAudio} style={{
                    background: 'linear-gradient(135deg, #10B981, #059669)', color: 'white', border: 'none',
                    borderRadius: '50%', width: '72px', height: '72px', fontSize: '2rem', cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
                }}>🔊</button>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-light)', fontSize: '0.8rem', margin: '6px 0 0' }}>
                    Nhấn để nghe lại
                </p>
                {/* Show Vietnamese hint after selection */}
                {selected && current.audioVi && (
                    <div style={{
                        marginTop: '8px', padding: '6px 16px', borderRadius: '10px',
                        background: '#F0FDF4', display: 'inline-block',
                        fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: '#065F46',
                    }}>🇻🇳 {current.audioVi}</div>
                )}
            </div>

            {/* Options grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {current?.options.map((opt, i) => {
                    const isCorrect = opt === current.answer;
                    const isSelected = selected === opt;
                    let bg = 'var(--color-card-bg)';
                    let borderColor = '#e5e7eb';
                    let textColor = 'var(--color-text)';
                    if (selected) {
                        if (isCorrect) { bg = '#D1FAE5'; borderColor = '#10B981'; textColor = '#065F46'; }
                        else if (isSelected) { bg = '#FEE2E2'; borderColor = '#EF4444'; textColor = '#991B1B'; }
                    }
                    const optVi = current.optionsVi?.[i];
                    return (
                        <button key={i} onClick={() => handleSelect(opt)} style={{
                            padding: '14px 10px', borderRadius: '14px',
                            background: bg, border: `2px solid ${borderColor}`,
                            cursor: selected ? 'default' : 'pointer',
                            fontFamily: 'var(--font-display)', fontSize: '0.85rem',
                            fontWeight: 600, color: textColor, transition: 'all 0.2s',
                        }}>
                            <div>{opt}</div>
                            {selected && optVi && (
                                <div style={{ fontSize: '0.7rem', fontWeight: 400, color: '#6B7280', marginTop: '3px' }}>
                                    {optVi}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ================================================================
// SAY IT (Pronunciation Practice) — with voice personality
// ================================================================

function SayItExercise({ chapter, onBack, onComplete }) {
    const { speak, startListening, stopListening, isListening, transcript } = useSpeech();
    const items = useMemo(() => {
        return [...chapter.items]
            .filter(i => i.en.length > 2)
            .sort(() => Math.random() - 0.5)
            .slice(0, 8);
    }, [chapter]);
    const [idx, setIdx] = useState(0);
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);
    const prevTranscriptRef = useRef('');

    const current = items[idx];
    const progress = ((idx + 1) / items.length) * 100;

    const playModel = useCallback(() => {
        if (current) speak(current.en, 'en-US', { rate: 0.8, pitch: 1.0 });
    }, [current, speak]);

    useEffect(() => {
        setResult(null);
        prevTranscriptRef.current = '';
        const timer = setTimeout(() => playModel(), 300);
        return () => clearTimeout(timer);
    }, [idx]); // eslint-disable-line

    useEffect(() => {
        if (transcript && current && transcript !== prevTranscriptRef.current) {
            prevTranscriptRef.current = transcript;
            const expected = current.en.toLowerCase().replace(/[.!?,]/g, '').trim();
            const spoken = transcript.toLowerCase().replace(/[.!?,]/g, '').trim();
            // Fuzzy match: at least 60% of words match
            const expectedWords = expected.split(' ');
            const spokenWords = spoken.split(' ');
            const matchCount = expectedWords.filter(w => spokenWords.includes(w)).length;
            const similarity = matchCount / expectedWords.length;

            if (similarity >= 0.6) {
                setResult('correct');
                setScore(s => s + 1);
            } else {
                setResult('try-again');
            }
        }
    }, [transcript, current]);

    const handleMic = () => {
        if (isListening) { stopListening(); }
        else { setResult(null); startListening('en-US'); }
    };

    const next = () => {
        if (idx < items.length - 1) {
            setIdx(i => i + 1);
        } else {
            saveChapterProgress(chapter.id, 'speak', score, items.length);
            onComplete(score, items.length);
        }
    };

    return (
        <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
            <ExerciseHeader icon="🎙️" title="Nói theo" chapter={chapter}
                current={idx + 1} total={items.length} onBack={onBack} color="#F59E0B" />

            {/* Word display */}
            <div style={{
                background: 'var(--color-card-bg)', borderRadius: '20px',
                padding: '28px 20px', textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '16px',
            }}>
                <div style={{
                    fontFamily: 'var(--font-display)', fontSize: '1.5rem',
                    fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px',
                }}>&ldquo;{current?.en}&rdquo;</div>
                {current?.vi && (
                    <div style={{
                        fontFamily: 'var(--font-body)', fontSize: '0.85rem',
                        color: '#10B981', marginBottom: '12px',
                    }}>🇻🇳 {current.vi}</div>
                )}
                <button onClick={playModel} style={{
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', border: 'none',
                    borderRadius: '20px', padding: '8px 20px', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: '0.85rem',
                }}>🔊 Nghe mẫu</button>
            </div>

            {/* Mic */}
            <div style={{ textAlign: 'center' }}>
                <button onClick={handleMic} style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: isListening ? '#EF4444' : 'linear-gradient(135deg, #3B82F6, #2563EB)',
                    color: 'white', border: 'none', fontSize: '2rem', cursor: 'pointer',
                    boxShadow: isListening ? '0 0 0 8px rgba(239,68,68,0.2)' : '0 4px 16px rgba(59,130,246,0.3)',
                    animation: isListening ? 'pulse 1s infinite' : 'none',
                }}>🎙️</button>
                <p style={{
                    fontFamily: 'var(--font-body)', fontSize: '0.8rem',
                    color: 'var(--color-text-light)', margin: '6px 0',
                }}>{isListening ? '🔴 Đang nghe...' : 'Nhấn & Nói'}</p>

                {result === 'correct' && (
                    <div style={{
                        background: '#D1FAE5', color: '#065F46', borderRadius: '12px',
                        padding: '12px', fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '8px',
                    }}>✅ Tuyệt vời! Phát âm đúng!</div>
                )}
                {result === 'try-again' && (
                    <div style={{
                        background: '#FEF3C7', color: '#92400E', borderRadius: '12px',
                        padding: '12px', fontFamily: 'var(--font-body)', marginBottom: '8px',
                    }}>
                        🔄 Bạn nói: &ldquo;{transcript}&rdquo;<br />
                        <span style={{ fontSize: '0.8rem' }}>Thử lại nhé!</span>
                    </div>
                )}
            </div>

            <button onClick={next} style={{
                width: '100%', padding: '14px', borderRadius: '12px',
                background: '#3B82F6', color: 'white', border: 'none',
                cursor: 'pointer', fontFamily: 'var(--font-display)', fontSize: '0.95rem', marginTop: '12px',
            }}>
                {idx < items.length - 1 ? 'Tiếp ▶' : '🏁 Hoàn thành'}
            </button>
        </div>
    );
}

// ================================================================
// SENTENCE BUILD EXERCISE — with VN translation
// ================================================================

function SentenceBuildExercise({ chapter, onBack, onComplete }) {
    const { speak } = useSpeech();
    const exercises = useMemo(() => generateSentenceBuild(chapter, 6), [chapter]);
    const [eIdx, setEIdx] = useState(0);
    const [placed, setPlaced] = useState([]);
    const [result, setResult] = useState(null);
    const [score, setScore] = useState(0);

    const current = exercises[eIdx];
    const available = current ? current.words.filter((w, i) => {
        // Count how many times this word appears in placed
        const placedCount = placed.filter(p => p === w).length;
        const totalCount = current.words.filter(cw => cw === w).length;
        // Only show if not all instances are placed
        const availableInstances = current.words.slice(0, current.words.indexOf(w, placed.filter(p => p === w).length)).length;
        return placedCount < current.words.filter(cw => cw === w).length;
    }) : [];

    // Simpler approach: track indices
    const [placedIndices, setPlacedIndices] = useState([]);
    const availableWords = current ? current.words.map((w, i) => ({ word: w, idx: i })).filter(({ idx }) => !placedIndices.includes(idx)) : [];
    const placedWords = placedIndices.map(i => current?.words[i] || '');

    const addWord = (wordIdx) => {
        const newPlaced = [...placedIndices, wordIdx];
        setPlacedIndices(newPlaced);

        if (newPlaced.length === current.answer.length) {
            const builtSentence = newPlaced.map(i => current.words[i]).join(' ').toLowerCase();
            const correctSentence = current.answer.join(' ').toLowerCase();
            const correct = builtSentence === correctSentence;
            setResult(correct ? 'correct' : 'wrong');
            if (correct) {
                setScore(s => s + 1);
                speak(current.sentence, 'en-US', { rate: 0.85 });
            }
        }
    };

    const reset = () => { setPlacedIndices([]); setResult(null); };
    const next = () => {
        setPlacedIndices([]); setResult(null);
        if (eIdx < exercises.length - 1) {
            setEIdx(i => i + 1);
        } else {
            saveChapterProgress(chapter.id, 'build', score, exercises.length);
            onComplete(score, exercises.length);
        }
    };

    if (!current || exercises.length === 0) return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text-light)' }}>
                Chương này không đủ mẫu câu để tạo bài xếp câu.
            </p>
            <button onClick={onBack} style={{
                padding: '12px 24px', borderRadius: '12px', background: '#3B82F6',
                color: 'white', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-display)',
            }}>← Quay lại</button>
        </div>
    );

    return (
        <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto' }}>
            <ExerciseHeader icon="✍️" title="Xếp câu" chapter={chapter}
                current={eIdx + 1} total={exercises.length} onBack={onBack} color="#8B5CF6" />

            {/* Vietnamese hint */}
            {current.sentenceVi && (
                <div style={{
                    textAlign: 'center', marginBottom: '12px', padding: '8px 16px',
                    background: '#F0FDF4', borderRadius: '12px',
                    fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#065F46',
                }}>🇻🇳 Gợi ý: {current.sentenceVi}</div>
            )}

            {/* Drop zone */}
            <div style={{
                background: 'var(--color-card-bg)', borderRadius: '16px',
                padding: '18px', minHeight: '56px', marginBottom: '14px',
                border: result === 'correct' ? '2px solid #10B981' : result === 'wrong' ? '2px solid #EF4444' : '2px dashed #d1d5db',
                textAlign: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px',
                justifyContent: 'center', alignItems: 'center',
            }}>
                {placedIndices.length === 0 ? (
                    <span style={{ color: 'var(--color-text-light)', fontFamily: 'var(--font-body)', fontSize: '0.82rem' }}>
                        👇 Chạm từ bên dưới để xếp câu
                    </span>
                ) : (
                    placedWords.map((w, i) => (
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
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '14px' }}>
                {availableWords.map(({ word, idx: wordIdx }) => (
                    <button key={wordIdx} onClick={() => addWord(wordIdx)} disabled={!!result} style={{
                        padding: '10px 18px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', color: 'white', border: 'none',
                        cursor: result ? 'default' : 'pointer',
                        fontFamily: 'var(--font-display)', fontSize: '0.92rem',
                        fontWeight: 600, opacity: result ? 0.5 : 1, transition: 'all 0.15s',
                    }}>{word}</button>
                ))}
            </div>

            {/* Result */}
            {result === 'correct' && (
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <div style={{
                        background: '#D1FAE5', color: '#065F46', borderRadius: '12px',
                        padding: '12px', fontFamily: 'var(--font-display)', fontWeight: 600,
                    }}>✅ Đúng rồi!</div>
                </div>
            )}
            {result === 'wrong' && (
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
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
                <button onClick={next} style={{
                    flex: 1, padding: '12px', borderRadius: '12px',
                    background: '#8B5CF6', color: 'white', border: 'none',
                    cursor: 'pointer', fontFamily: 'var(--font-display)',
                }}>{eIdx < exercises.length - 1 ? 'Tiếp ▶' : '🏁 Hoàn thành'}</button>
            </div>
        </div>
    );
}

// ================================================================
// SHARED COMPONENTS
// ================================================================

function ExerciseHeader({ icon, title, chapter, current, total, onBack, color }) {
    const progress = (current / total) * 100;
    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <button onClick={onBack} style={{
                    background: 'var(--color-card-bg)', border: 'none', borderRadius: '50%',
                    width: '36px', height: '36px', cursor: 'pointer', fontSize: '1rem',
                }}>←</button>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem' }}>
                    {icon} {title}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    {current}/{total}
                </span>
            </div>
            <div style={{ height: '6px', background: '#e5e7eb', borderRadius: '3px', marginBottom: '16px' }}>
                <div style={{
                    height: '100%', width: `${progress}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                    borderRadius: '3px', transition: 'width 0.3s',
                }} />
            </div>
        </>
    );
}

function ResultScreen({ emoji, title, score, total, onBack, onRetry, onComplete }) {
    const pct = Math.round((score / total) * 100);
    return (
        <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginTop: '40px' }}>{emoji}</div>
            <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text)', margin: '8px 0' }}>{title}</h2>
            <div style={{
                fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700,
                color: pct >= 80 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444',
            }}>{pct}%</div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--color-text-light)' }}>
                {score}/{total} câu đúng
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                <button onClick={onBack} style={{
                    padding: '12px 24px', borderRadius: '12px',
                    background: 'var(--color-card-bg)', border: '2px solid #e5e7eb',
                    cursor: 'pointer', fontFamily: 'var(--font-display)',
                }}>← Quay lại</button>
                <button onClick={onRetry} style={{
                    padding: '12px 24px', borderRadius: '12px',
                    background: '#3B82F6', color: 'white', border: 'none',
                    cursor: 'pointer', fontFamily: 'var(--font-display)',
                }}>🔄 Làm lại</button>
            </div>
        </div>
    );
}

// ================================================================
// MAIN ORCHESTRATOR
// ================================================================

export default function TeacherLessons() {
    const [step, setStep] = useState('chapters');
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [exerciseMode, setExerciseMode] = useState(null);
    const [completionResult, setCompletionResult] = useState(null);

    const handleSelectChapter = (ch) => { setSelectedChapter(ch); setStep('exercises'); };
    const handleSelectExercise = (mode) => { setExerciseMode(mode); setStep('playing'); };
    const goBackToChapters = () => { setStep('chapters'); setSelectedChapter(null); setExerciseMode(null); setCompletionResult(null); };
    const goBackToExercises = () => { setStep('exercises'); setExerciseMode(null); setCompletionResult(null); };

    const handleComplete = (score, total) => {
        setCompletionResult({ score, total });
        setStep('result');
    };

    if (step === 'chapters') {
        return <ChapterList chapters={TEACHER_CURRICULUM.chapters} onSelect={handleSelectChapter} />;
    }
    if (step === 'exercises' && selectedChapter) {
        return <ExerciseSelector chapter={selectedChapter} onSelect={handleSelectExercise} onBack={goBackToChapters} />;
    }
    if (step === 'playing' && selectedChapter && exerciseMode) {
        const props = { chapter: selectedChapter, onBack: goBackToExercises, onComplete: handleComplete };
        switch (exerciseMode) {
            case 'flashcard': return <FlashcardExercise {...props} />;
            case 'listen': return <ListenQuiz {...props} />;
            case 'speak': return <SayItExercise {...props} />;
            case 'build': return <SentenceBuildExercise {...props} />;
            default: return null;
        }
    }
    if (step === 'result' && completionResult) {
        const { score, total } = completionResult;
        const pct = Math.round((score / total) * 100);
        return <ResultScreen
            emoji={pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
            title={pct >= 80 ? 'Xuất sắc!' : pct >= 50 ? 'Tốt lắm!' : 'Cố gắng thêm nhé!'}
            score={score} total={total}
            onBack={goBackToExercises}
            onRetry={() => { setCompletionResult(null); setStep('playing'); }}
        />;
    }
    return null;
}

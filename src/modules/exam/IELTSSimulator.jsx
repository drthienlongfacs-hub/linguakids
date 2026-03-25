import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IELTS_READING_PASSAGES, IELTS_WRITING, IELTS_SPEAKING } from '../../data/ielts_content';
import { useGameStore } from '../../store/useGameStore';
import SpeakingPractice from '../speaking/SpeakingPractice';

const TABS = ['Reading', 'Writing', 'Speaking'];

export default function IELTSSimulator() {
    const navigate = useNavigate();
    const { addXP } = useGameStore();
    const [activeTab, setActiveTab] = useState(0);
    const [selectedPassage, setSelectedPassage] = useState(null);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);

    // Timer
    useEffect(() => {
        let interval;
        if (timerActive && timer > 0) {
            interval = setInterval(() => setTimer(t => t - 1), 1000);
        } else if (timer === 0 && timerActive) {
            setTimerActive(false);
            setShowResults(true);
        }
        return () => clearInterval(interval);
    }, [timerActive, timer]);

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const startReading = (passage) => {
        setSelectedPassage(passage);
        setAnswers({});
        setShowResults(false);
        setTimer(20 * 60); // 20 minutes per passage
        setTimerActive(true);
    };

    const setAnswer = (qIdx, itemIdx, value) => {
        setAnswers(prev => ({ ...prev, [`${qIdx}-${itemIdx}`]: value }));
    };

    const calculateScore = useCallback(() => {
        if (!selectedPassage) return { correct: 0, total: 0, band: 0 };
        let correct = 0, total = 0;
        selectedPassage.questions.forEach((qGroup, qIdx) => {
            qGroup.items.forEach((item, itemIdx) => {
                total++;
                const userAns = answers[`${qIdx}-${itemIdx}`];
                if (qGroup.type === 'tfng') {
                    if (userAns?.toLowerCase() === item.answer) correct++;
                } else if (qGroup.type === 'mcq') {
                    if (parseInt(userAns) === item.correct) correct++;
                } else if (qGroup.type === 'gap_fill') {
                    if (userAns?.toLowerCase().trim() === item.answer.toLowerCase()) correct++;
                } else if (qGroup.type === 'matching_headings') {
                    if (parseInt(userAns) === item.correct) correct++;
                }
            });
        });
        const pct = total > 0 ? correct / total : 0;
        const band = pct >= 0.9 ? 9 : pct >= 0.8 ? 8 : pct >= 0.7 ? 7.5 : pct >= 0.6 ? 7 : pct >= 0.5 ? 6.5 : pct >= 0.4 ? 6 : 5.5;
        return { correct, total, band, percentage: Math.round(pct * 100) };
    }, [selectedPassage, answers]);

    const submitTest = () => {
        setTimerActive(false);
        setShowResults(true);
        const score = calculateScore();
        addXP(score.correct * 15);
    };

    // ===== READING TAB =====
    const renderReading = () => {
        if (selectedPassage && !showResults) {
            return (
                <div>
                    {/* Timer Bar */}
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
                        padding: '10px 16px', background: timer < 120 ? '#FEF2F2' : 'var(--color-surface)', borderRadius: '12px'
                    }}>
                        <span style={{ fontWeight: 700 }}>⏱️ {formatTime(timer)}</span>
                        <button onClick={submitTest} style={{
                            padding: '6px 20px', borderRadius: '20px', border: 'none',
                            background: '#3B82F6', color: '#fff', cursor: 'pointer', fontWeight: 600
                        }}>Submit</button>
                    </div>

                    {/* Passage */}
                    <div style={{
                        background: 'var(--color-surface)', borderRadius: '12px', padding: '20px', marginBottom: '16px',
                        maxHeight: '300px', overflowY: 'auto', fontSize: '0.9rem', lineHeight: 1.8
                    }}>
                        <h3 style={{ marginTop: 0 }}>{selectedPassage.title}</h3>
                        {selectedPassage.passage.split('\n\n').map((para, i) => (
                            <p key={i} style={{ textAlign: 'justify' }}>{para}</p>
                        ))}
                    </div>

                    {/* Questions */}
                    {selectedPassage.questions.map((qGroup, qIdx) => (
                        <div key={qIdx} style={{ marginBottom: '20px', background: 'var(--color-surface)', borderRadius: '12px', padding: '16px' }}>
                            <h4 style={{ margin: '0 0 12px', color: '#3B82F6' }}>
                                {qGroup.type === 'tfng' && '📋 True / False / Not Given'}
                                {qGroup.type === 'mcq' && '🔘 Multiple Choice'}
                                {qGroup.type === 'gap_fill' && '✏️ Gap Fill'}
                                {qGroup.type === 'matching_headings' && '🔗 Matching Headings'}
                            </h4>
                            {qGroup.items.map((item, itemIdx) => (
                                <div key={itemIdx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid var(--color-border)' }}>
                                    {qGroup.type === 'tfng' && (
                                        <>
                                            <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>{itemIdx + 1}. {item.statement}</p>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {['true', 'false', 'not given'].map(opt => (
                                                    <button key={opt} onClick={() => setAnswer(qIdx, itemIdx, opt)}
                                                        style={{
                                                            padding: '4px 14px', borderRadius: '14px', border: '1px solid var(--color-border)',
                                                            cursor: 'pointer', fontSize: '0.8rem',
                                                            background: answers[`${qIdx}-${itemIdx}`] === opt ? '#3B82F6' : 'transparent',
                                                            color: answers[`${qIdx}-${itemIdx}`] === opt ? '#fff' : 'var(--color-text)',
                                                        }}>
                                                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    {qGroup.type === 'mcq' && (
                                        <>
                                            <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600 }}>{item.question}</p>
                                            {item.options.map((opt, oIdx) => (
                                                <label key={oIdx} style={{ display: 'block', padding: '6px 0', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                    <input type="radio" name={`q-${qIdx}-${itemIdx}`} value={oIdx}
                                                        checked={answers[`${qIdx}-${itemIdx}`] === String(oIdx)}
                                                        onChange={() => setAnswer(qIdx, itemIdx, String(oIdx))}
                                                        style={{ marginRight: '8px' }} />
                                                    {String.fromCharCode(65 + oIdx)}) {opt}
                                                </label>
                                            ))}
                                        </>
                                    )}
                                    {qGroup.type === 'gap_fill' && (
                                        <>
                                            <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>{itemIdx + 1}. {item.sentence}</p>
                                            <input type="text" placeholder="Your answer..."
                                                value={answers[`${qIdx}-${itemIdx}`] || ''}
                                                onChange={(e) => setAnswer(qIdx, itemIdx, e.target.value)}
                                                style={{
                                                    width: '100%', maxWidth: '200px', padding: '6px 12px', borderRadius: '8px',
                                                    border: '1px solid var(--color-border)', fontSize: '0.85rem'
                                                }} />
                                        </>
                                    )}
                                    {qGroup.type === 'matching_headings' && (
                                        <>
                                            <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>Paragraph {item.paragraph}:</p>
                                            <select value={answers[`${qIdx}-${itemIdx}`] || ''} onChange={(e) => setAnswer(qIdx, itemIdx, e.target.value)}
                                                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.85rem' }}>
                                                <option value="">-- Select heading --</option>
                                                {item.options.map((opt, oIdx) => (
                                                    <option key={oIdx} value={oIdx}>{opt}</option>
                                                ))}
                                            </select>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            );
        }

        if (showResults && selectedPassage) {
            const score = calculateScore();
            return (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <h2 style={{ fontSize: '3rem', margin: '0 0 8px' }}>
                        {score.band >= 7.5 ? '🎉' : score.band >= 6.5 ? '👍' : '💪'}
                    </h2>
                    <h3>Band {score.band}</h3>
                    <p style={{ fontSize: '1.2rem' }}>{score.correct}/{score.total} correct ({score.percentage}%)</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                        <button onClick={() => { setShowResults(false); setSelectedPassage(null); }}
                            style={{
                                padding: '10px 24px', borderRadius: '20px', border: '1px solid var(--color-border)',
                                cursor: 'pointer', background: 'transparent'
                            }}>
                            Try Another
                        </button>
                        <button onClick={() => { setShowResults(false); startReading(selectedPassage); }}
                            style={{
                                padding: '10px 24px', borderRadius: '20px', border: 'none',
                                background: '#3B82F6', color: '#fff', cursor: 'pointer'
                            }}>
                            Retry
                        </button>
                    </div>

                    {/* Answer Review */}
                    <div style={{ textAlign: 'left', marginTop: '24px' }}>
                        <h4>Answer Review</h4>
                        {selectedPassage.questions.map((qGroup, qIdx) =>
                            qGroup.items.map((item, itemIdx) => {
                                const userAns = answers[`${qIdx}-${itemIdx}`] || '(not answered)';
                                let correctAns, isCorrect;
                                if (qGroup.type === 'tfng') {
                                    correctAns = item.answer;
                                    isCorrect = userAns.toLowerCase() === item.answer;
                                } else if (qGroup.type === 'mcq') {
                                    correctAns = item.options[item.correct];
                                    isCorrect = parseInt(userAns) === item.correct;
                                } else if (qGroup.type === 'gap_fill') {
                                    correctAns = item.answer;
                                    isCorrect = userAns.toLowerCase().trim() === item.answer.toLowerCase();
                                } else {
                                    correctAns = item.options?.[item.correct] || '';
                                    isCorrect = parseInt(userAns) === item.correct;
                                }
                                return (
                                    <div key={`${qIdx}-${itemIdx}`} style={{
                                        padding: '10px', marginBottom: '8px', borderRadius: '8px',
                                        background: isCorrect ? '#F0FDF4' : '#FEF2F2',
                                        borderLeft: `4px solid ${isCorrect ? '#22C55E' : '#EF4444'}`,
                                    }}>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            {isCorrect ? '✅' : '❌'} {item.statement || item.question || item.sentence}
                                        </div>
                                        {!isCorrect && (
                                            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                                                Your answer: {userAns} → Correct: {correctAns}
                                                {item.explanation && <span> — {item.explanation}</span>}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            );
        }

        // Passage selection
        return (
            <div>
                <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '16px' }}>
                    Select a passage to begin a timed reading test (20 minutes)
                </p>
                {IELTS_READING_PASSAGES.map(p => (
                    <div key={p.id} className="topic-card" onClick={() => startReading(p)}
                        style={{ cursor: 'pointer', padding: '16px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>📖 {p.title}</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                                    {p.wordCount} words · {p.difficulty} · {p.questions.reduce((s, q) => s + q.items.length, 0)} questions
                                </p>
                            </div>
                            <span style={{ fontSize: '1.5rem' }}>→</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // ===== WRITING TAB =====
    const renderWriting = () => (
        <div>
            <h3 style={{ margin: '0 0 12px' }}>✍️ Task 1 — Data Description</h3>
            {IELTS_WRITING.task1.map(t => (
                <details key={t.id} style={{ marginBottom: '12px', background: 'var(--color-surface)', borderRadius: '12px', padding: '16px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600 }}>📊 {t.title} (Band {t.band})</summary>
                    <p style={{ fontSize: '0.85rem', fontStyle: 'italic', margin: '8px 0' }}>{t.instruction}</p>
                    <p style={{ fontSize: '0.8rem', background: '#F3F4F6', padding: '8px', borderRadius: '6px' }}>Data: {t.dataDescription}</p>
                    <div style={{ marginTop: '12px' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#059669' }}>Model Answer ({t.wordCount} words)</h4>
                        {t.modelAnswer.split('\n\n').map((p, i) => (
                            <p key={i} style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>{p}</p>
                        ))}
                    </div>
                </details>
            ))}

            <h3 style={{ margin: '20px 0 12px' }}>📝 Task 2 — Essay</h3>
            {IELTS_WRITING.task2.map(t => (
                <details key={t.id} style={{ marginBottom: '12px', background: 'var(--color-surface)', borderRadius: '12px', padding: '16px' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600 }}>📄 {t.title}</summary>
                    <p style={{
                        fontSize: '0.85rem', fontStyle: 'italic', margin: '8px 0', padding: '12px',
                        background: '#FEF3C7', borderRadius: '8px'
                    }}>{t.prompt}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '8px 0' }}>
                        {t.keyVocabulary.map(v => (
                            <span key={v} style={{
                                padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem',
                                background: '#DBEAFE', color: '#1E40AF'
                            }}>{v}</span>
                        ))}
                    </div>
                    <div style={{ marginTop: '12px' }}>
                        <h4 style={{ fontSize: '0.9rem', color: '#059669' }}>Band 7 Model</h4>
                        {t.modelEssay.band7.split('\n\n').map((p, i) => (
                            <p key={i} style={{ fontSize: '0.85rem', lineHeight: 1.7 }}>{p}</p>
                        ))}
                    </div>
                </details>
            ))}
        </div>
    );

    // ===== SPEAKING TAB =====
    const renderSpeaking = () => (
        <div>
            {/* Part 1 — Interactive Interview Questions */}
            <h3 style={{ margin: '0 0 12px', color: '#F1F5F9' }}>🗣️ Part 1 — Interview Questions</h3>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '16px' }}>
                Tap 🎤 to record your answer. Your speech will be analyzed for pronunciation, fluency, and vocabulary.
            </p>
            {IELTS_SPEAKING.part1.map((set, idx) => (
                <details key={idx} style={{ marginBottom: '12px', background: 'rgba(30,41,59,0.7)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#E2E8F0', fontSize: '0.95rem' }}>💬 {set.topic}</summary>
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {set.questions.map((q, qIdx) => (
                            <SpeakingPractice
                                key={`p1-${idx}-${qIdx}`}
                                question={q}
                                modelAnswer={set.sampleAnswers[qIdx]}
                                part={1}
                                speakTime={60}
                            />
                        ))}
                    </div>
                </details>
            ))}

            {/* Part 2 — Interactive Cue Cards */}
            <h3 style={{ margin: '20px 0 12px', color: '#F1F5F9' }}>🎤 Part 2 — Cue Cards</h3>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '16px' }}>
                1 minute preparation + 2 minutes speaking. Full IELTS simulation.
            </p>
            {IELTS_SPEAKING.part2.map(card => (
                <details key={card.id} style={{ marginBottom: '12px', background: 'rgba(30,41,59,0.7)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#E2E8F0', fontSize: '0.95rem' }}>🃏 {card.cueCard}</summary>
                    <div style={{ background: 'rgba(251,191,36,0.08)', padding: '12px', borderRadius: '10px', margin: '12px 0', border: '1px solid rgba(251,191,36,0.2)' }}>
                        <p style={{ margin: '0 0 6px', fontWeight: 600, fontSize: '0.85rem', color: '#FCD34D' }}>You should say:</p>
                        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#E2E8F0' }}>
                            {card.points.map((p, i) => <li key={i} style={{ marginBottom: '4px' }}>{p}</li>)}
                        </ul>
                    </div>
                    <SpeakingPractice
                        question={card.cueCard}
                        modelAnswer={card.sampleAnswer}
                        prepTime={card.thinkTime}
                        speakTime={card.speakTime}
                        part={2}
                    />
                </details>
            ))}

            {/* Part 3 — Interactive Discussion */}
            <h3 style={{ margin: '20px 0 12px', color: '#F1F5F9' }}>🎯 Part 3 — Discussion Topics</h3>
            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '16px' }}>
                Advanced discussion questions. Aim for 2+ minutes per response.
            </p>
            {IELTS_SPEAKING.part3.map((set, idx) => (
                <details key={idx} style={{ marginBottom: '12px', background: 'rgba(30,41,59,0.7)', borderRadius: '14px', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#E2E8F0', fontSize: '0.95rem' }}>🧠 {set.topic}</summary>
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {set.questions.map((q, qIdx) => (
                            <SpeakingPractice
                                key={`p3-${idx}-${qIdx}`}
                                question={q}
                                part={3}
                                speakTime={120}
                            />
                        ))}
                    </div>
                </details>
            ))}
        </div>
    );

    return (
        <div className="module-hub" style={{ padding: '20px' }}>
            <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
            <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>🎯 IELTS Simulator</h1>
            <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Practice with real IELTS-format questions
            </p>

            {/* Tab Bar */}
            <div style={{
                display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '20px',
                background: 'var(--color-surface)', borderRadius: '16px', padding: '4px', maxWidth: '360px', margin: '0 auto 20px'
            }}>
                {TABS.map((tab, i) => (
                    <button key={tab} onClick={() => { setActiveTab(i); setSelectedPassage(null); setShowResults(false); }}
                        style={{
                            flex: 1, padding: '8px 0', borderRadius: '12px', border: 'none', cursor: 'pointer',
                            fontWeight: activeTab === i ? 700 : 400, fontSize: '0.85rem',
                            background: activeTab === i ? 'var(--color-primary)' : 'transparent',
                            color: activeTab === i ? '#fff' : 'var(--color-text)',
                        }}>
                        {['📖', '✍️', '🗣️'][i]} {tab}
                    </button>
                ))}
            </div>

            {activeTab === 0 && renderReading()}
            {activeTab === 1 && renderWriting()}
            {activeTab === 2 && renderSpeaking()}
        </div>
    );
}

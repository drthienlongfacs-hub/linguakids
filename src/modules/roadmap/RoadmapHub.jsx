import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import { EXAM_TARGETS, getRoadmap, getTodayTasks, getTotalXPForWeek } from '../../data/studyPlan';
import { isAdultMode } from '../../utils/userMode';

export default function RoadmapHub() {
    const navigate = useNavigate();
    const { userMode, examTarget, roadmapWeek, completedRoadmapTasks = [], setExamTarget, setRoadmapWeek, completeRoadmapTask } = useGameStore();
    const isAdult = isAdultMode(userMode);
    const [selectedWeek, setSelectedWeek] = useState(roadmapWeek || 1);
    const [dayOfWeek, setDayOfWeek] = useState(() => {
        const d = new Date().getDay();
        return d === 0 ? 5 : Math.min(d, 5); // Mon=1..Fri=5
    });

    const roadmap = useMemo(() => getRoadmap(examTarget), [examTarget]);
    const weekData = roadmap.find(w => w.week === selectedWeek);
    const dayTasks = weekData?.days?.[dayOfWeek - 1]?.tasks || [];

    // If no exam target selected, show selection screen
    if (!examTarget) {
        return (
            <div className="module-hub" style={{ padding: '20px' }}>
                <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>🗺️ Learning Roadmap</h1>
                <p style={{ textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '32px', fontSize: '0.95rem' }}>
                    Choose your exam target to start a structured study plan
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '440px', margin: '0 auto' }}>
                    {Object.values(EXAM_TARGETS).map(target => (
                        <div key={target.id} className="topic-card" onClick={() => setExamTarget(target.id)}
                            style={{ cursor: 'pointer', padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <span style={{ fontSize: '2.5rem' }}>{target.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{target.name}</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                                    {target.description}
                                </p>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.8rem' }}>
                                    <span>📅 {target.totalWeeks} weeks</span>
                                    <span>⏰ {target.dailyHours}h/day</span>
                                    <span>🏷️ CEFR {target.cefr}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const target = EXAM_TARGETS[examTarget];
    const totalWeeks = target.totalWeeks;
    const weekXP = getTotalXPForWeek(weekData);
    const completedThisWeek = completedRoadmapTasks.filter(t => t.week === selectedWeek).length;
    const totalTasksThisWeek = weekData?.days?.reduce((s, d) => s + d.tasks.length, 0) || 0;
    const weekProgress = totalTasksThisWeek > 0 ? Math.round((completedThisWeek / totalTasksThisWeek) * 100) : 0;

    const isTaskCompleted = (weekNum, dayNum, taskIdx) =>
        completedRoadmapTasks.some(t => t.week === weekNum && t.day === dayNum && t.taskIdx === taskIdx);

    const handleTaskClick = (task, taskIdx) => {
        // Mark as completed and navigate
        if (!isTaskCompleted(selectedWeek, dayOfWeek, taskIdx)) {
            completeRoadmapTask({ week: selectedWeek, day: dayOfWeek, taskIdx, type: task.type, xp: task.xp });
        }
        // Vocab tasks with a topic → navigate directly to the lesson page
        if (task.type === 'vocab' && task.topic) {
            navigate(`/lesson/en/${task.topic}`);
        } else {
            navigate(task.module);
        }
    };

    const typeColors = {
        vocab: '#3B82F6', grammar: '#8B5CF6', listening: '#F59E0B',
        reading: '#10B981', writing: '#EF4444', speaking: '#EC4899',
        exam: '#F97316', review: '#6B7280',
    };

    const typeEmojis = {
        vocab: '📚', grammar: '📐', listening: '🎧',
        reading: '📖', writing: '✍️', speaking: '🗣️',
        exam: '📝', review: '🔄',
    };

    return (
        <div className="module-hub" style={{ padding: '20px' }}>
            <button className="back-button" onClick={() => navigate(-1)}>← Back</button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h1 style={{ marginBottom: '4px' }}>{target.emoji} {target.name} Roadmap</h1>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', margin: 0 }}>
                    Week {selectedWeek} of {totalWeeks} — {weekData?.title}
                </p>
                <button onClick={() => { setExamTarget(null); setRoadmapWeek(1); }}
                    style={{
                        marginTop: '8px', fontSize: '0.75rem', padding: '4px 12px', borderRadius: '12px',
                        border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer',
                        color: 'var(--color-text-light)'
                    }}>
                    Change Target
                </button>
            </div>

            {/* Week Timeline */}
            <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', padding: '8px 0', marginBottom: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {Array.from({ length: totalWeeks }, (_, i) => {
                    const wk = i + 1;
                    const isActive = wk === selectedWeek;
                    const isPast = wk < (roadmapWeek || 1);
                    const isCurrent = wk === (roadmapWeek || 1);
                    return (
                        <button key={wk} onClick={() => setSelectedWeek(wk)}
                            style={{
                                width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                                cursor: 'pointer', fontSize: '0.75rem', fontWeight: isActive ? 700 : 500,
                                background: isActive ? 'var(--color-primary)' : isPast ? '#86EFAC' : isCurrent ? '#FDE68A' : 'var(--color-surface)',
                                color: isActive ? '#fff' : 'var(--color-text)',
                                boxShadow: isActive ? '0 2px 8px rgba(59,130,246,0.3)' : 'none',
                                transition: 'all 0.2s',
                            }}>
                            {wk}
                        </button>
                    );
                })}
            </div>

            {/* Week Progress Bar */}
            <div style={{ maxWidth: '440px', margin: '0 auto 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                    <span>Week {selectedWeek} Progress</span>
                    <span>{completedThisWeek}/{totalTasksThisWeek} tasks · {weekXP} XP</span>
                </div>
                <div style={{ height: '8px', borderRadius: '4px', background: 'var(--color-surface)', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%', width: `${weekProgress}%`, borderRadius: '4px',
                        background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', transition: 'width 0.5s'
                    }} />
                </div>
            </div>

            {/* Focus Skills */}
            {weekData?.focus && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
                    {weekData.focus.map(skill => (
                        <span key={skill} style={{
                            padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                            background: typeColors[skill] || '#6B7280', color: '#fff',
                        }}>
                            {typeEmojis[skill] || '📌'} {skill.charAt(0).toUpperCase() + skill.slice(1)}
                        </span>
                    ))}
                </div>
            )}

            {/* Day Tabs */}
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                    <button key={d} onClick={() => setDayOfWeek(i + 1)}
                        style={{
                            padding: '6px 14px', borderRadius: '16px', border: 'none', cursor: 'pointer',
                            fontWeight: dayOfWeek === i + 1 ? 700 : 400, fontSize: '0.8rem',
                            background: dayOfWeek === i + 1 ? 'var(--color-primary)' : 'var(--color-surface)',
                            color: dayOfWeek === i + 1 ? '#fff' : 'var(--color-text)',
                        }}>
                        {d}
                    </button>
                ))}
            </div>

            {/* Daily Tasks */}
            <div style={{ maxWidth: '440px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {dayTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-light)' }}>
                        <span style={{ fontSize: '3rem' }}>🎉</span>
                        <p>No tasks for this day. Enjoy your rest!</p>
                    </div>
                ) : dayTasks.map((task, idx) => {
                    const done = isTaskCompleted(selectedWeek, dayOfWeek, idx);
                    return (
                        <div key={idx} className="topic-card" onClick={() => handleTaskClick(task, idx)}
                            style={{
                                cursor: 'pointer', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                                opacity: done ? 0.6 : 1, textDecoration: done ? 'none' : 'none',
                                borderLeft: `4px solid ${typeColors[task.type] || '#ccc'}`,
                            }}>
                            {/* Checkbox */}
                            <div style={{
                                width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                                border: done ? 'none' : '2px solid var(--color-border)',
                                background: done ? '#22C55E' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '0.8rem',
                            }}>
                                {done ? '✓' : ''}
                            </div>
                            {/* Task info */}
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                                    {typeEmojis[task.type]} {task.label}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                    ⏱️ {task.duration} min · ⭐ {task.xp} XP
                                </div>
                            </div>
                            {/* Arrow */}
                            <span style={{ color: 'var(--color-text-light)', fontSize: '1.2rem' }}>→</span>
                        </div>
                    );
                })}
            </div>

            {/* Week Summary */}
            {weekProgress === 100 && (
                <div style={{
                    textAlign: 'center', marginTop: '24px', padding: '16px', background: '#ECFDF5',
                    borderRadius: '12px', maxWidth: '440px', margin: '24px auto 0'
                }}>
                    <span style={{ fontSize: '2rem' }}>🏆</span>
                    <p style={{ fontWeight: 700, margin: '8px 0 4px' }}>Week {selectedWeek} Complete!</p>
                    <p style={{ fontSize: '0.85rem', color: '#059669' }}>
                        {selectedWeek < totalWeeks
                            ? `Ready for Week ${selectedWeek + 1}? Keep the momentum!`
                            : 'You have completed the entire roadmap! Time to take the real exam! 💪'}
                    </p>
                    {selectedWeek < totalWeeks && (
                        <button onClick={() => { setRoadmapWeek(selectedWeek + 1); setSelectedWeek(selectedWeek + 1); }}
                            style={{
                                marginTop: '8px', padding: '8px 24px', borderRadius: '20px', border: 'none',
                                background: 'var(--color-primary)', color: '#fff', cursor: 'pointer', fontWeight: 600
                            }}>
                            Start Week {selectedWeek + 1} →
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

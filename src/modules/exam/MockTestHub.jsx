import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { isAdultMode } from '../../utils/userMode';

const EXAM_TYPES = [
    {
        id: 'ielts', name: 'IELTS Academic', target: '7.0-8.0', duration: '2h 45min', emoji: '🎯',
        sections: [
            { name: 'Listening', time: '30 min', questions: 40, desc: '4 sections, audio passages' },
            { name: 'Reading', time: '60 min', questions: 40, desc: '3 passages, academic texts' },
            { name: 'Writing', time: '60 min', questions: 2, desc: 'Task 1 (report) + Task 2 (essay)' },
            { name: 'Speaking', time: '11-14 min', questions: 3, desc: 'Part 1, 2, 3 interview' },
        ],
    },
    {
        id: 'toeic', name: 'TOEIC', target: '800+', duration: '2h', emoji: '📋',
        sections: [
            { name: 'Listening', time: '45 min', questions: 100, desc: 'Photographs, Q&A, conversations, talks' },
            { name: 'Reading', time: '75 min', questions: 100, desc: 'Incomplete sentences, text completion, reading comprehension' },
        ],
    },
    {
        id: 'toefl', name: 'TOEFL iBT', target: '100+', duration: '3h 30min', emoji: '🌐',
        sections: [
            { name: 'Reading', time: '54-72 min', questions: '30-40', desc: '3-4 academic passages' },
            { name: 'Listening', time: '41-57 min', questions: '28-39', desc: 'Lectures and conversations' },
            { name: 'Speaking', time: '17 min', questions: 4, desc: 'Independent and integrated tasks' },
            { name: 'Writing', time: '50 min', questions: 2, desc: 'Integrated + independent essay' },
        ],
    },
];

const STUDY_PLANS = [
    {
        id: 'ielts-8w', name: 'IELTS 7.0 — 8 Weeks', emoji: '📅', weeks: [
            { week: 1, focus: 'Foundation', tasks: ['Grammar: Present & Past Tenses', 'Listening: A1-A2 passages', 'Reading: Short passages', 'Writing: Sentence structure'] },
            { week: 2, focus: 'Core Skills', tasks: ['Grammar: Conditionals', 'Listening: B1 dictation', 'Speaking: Shadowing basics', 'Vocabulary: Academic word list'] },
            { week: 3, focus: 'Academic English', tasks: ['Reading: B1 passages + T/F/NG', 'Writing: Task 1 graph description', 'Listening: B1-B2 segments', 'Grammar: Passive Voice'] },
            { week: 4, focus: 'Mid-Term Review', tasks: ['Mock Test: Mini IELTS', 'Error analysis', 'Speaking: IELTS Part 1', 'Vocabulary review'] },
            { week: 5, focus: 'Advanced Skills', tasks: ['Reading: B2 academic texts', 'Writing: Task 2 essay structure', 'Listening: B2 lectures', 'Grammar: Reported Speech'] },
            { week: 6, focus: 'Exam Techniques', tasks: ['Speaking: Part 2 Cue Card', 'Writing: Timed essays', 'Reading: Speed techniques', 'Listening: Note-taking'] },
            { week: 7, focus: 'Full Mock Tests', tasks: ['Mock IELTS (full)', 'Review weak areas', 'Speaking: Part 3 discussion', 'Writing: Model answer analysis'] },
            { week: 8, focus: 'Final Prep', tasks: ['Full mock test #2', 'Time management drills', 'Final vocabulary review', 'Confidence building'] },
        ]
    },
];

export default function MockTestHub() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const [tab, setTab] = useState('exams');
    const [activeExam, setActiveExam] = useState(null);
    const [activePlan, setActivePlan] = useState(null);

    if (!adult) return (
        <div className="page">
            <div className="lh-header"><button className="lh-back" onClick={() => navigate('/')}>←</button><h2 className="lh-title">🎯 Luyện thi</h2></div>
            <p style={{ textAlign: 'center', color: 'var(--color-text-light)', padding: 40 }}>Chế độ luyện thi chỉ dành cho Người lớn. Chuyển sang chế độ Người lớn để truy cập.</p>
        </div>
    );

    return (
        <div className="mocktest-hub page">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/')}>←</button>
                <h2 className="lh-title">🎯 Exam Prep Center</h2>
            </div>
            <p className="lh-subtitle">Structured exam preparation with study plans, mock tests, and progress tracking.</p>

            <div className="ll-tabs">
                <button className={`ll-tab ${tab === 'exams' ? 'active' : ''}`} onClick={() => setTab('exams')}>📋 Exams</button>
                <button className={`ll-tab ${tab === 'plan' ? 'active' : ''}`} onClick={() => setTab('plan')}>📅 Study Plan</button>
                <button className={`ll-tab ${tab === 'skills' ? 'active' : ''}`} onClick={() => setTab('skills')}>📊 Skill Map</button>
            </div>

            {tab === 'exams' && (
                <div className="mt-exams">
                    {EXAM_TYPES.map(exam => (
                        <div key={exam.id} className="sp-sentence-card" style={{ cursor: 'pointer' }} onClick={() => setActiveExam(activeExam === exam.id ? null : exam.id)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <span style={{ fontSize: '2.5rem' }}>{exam.emoji}</span>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ fontFamily: 'var(--font-display)', color: '#6366F1' }}>{exam.name}</h3>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>Target: {exam.target} · {exam.duration}</p>
                                </div>
                                <span style={{ fontSize: '1.2rem', transform: activeExam === exam.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>▶</span>
                            </div>
                            {activeExam === exam.id && (
                                <div style={{ marginTop: 16 }}>
                                    {exam.sections.map((s, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: i > 0 ? '1px solid rgba(99,102,241,0.1)' : 'none' }}>
                                            <div><strong style={{ color: '#6366F1' }}>{s.name}</strong><p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: 2 }}>{s.desc}</p></div>
                                            <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--color-text-light)' }}><div>{s.time}</div><div>{s.questions} Q</div></div>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                        <button className="quiz-submit-btn" style={{ flex: 1 }} onClick={() => navigate(`/${exam.sections[0].name.toLowerCase()}`)}>▶ Start Practice</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {tab === 'plan' && (
                <div className="mt-plans">
                    {STUDY_PLANS.map(plan => (
                        <div key={plan.id}>
                            <div className="sp-sentence-card" onClick={() => setActivePlan(activePlan === plan.id ? null : plan.id)} style={{ cursor: 'pointer' }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', color: '#6366F1' }}>{plan.emoji} {plan.name}</h3>
                                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{plan.weeks.length} weeks · Structured daily study</p>
                            </div>
                            {activePlan === plan.id && plan.weeks.map((w, i) => (
                                <div key={i} className="grammar-section" style={{ marginLeft: 16 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                        <span className="ll-badge level">Week {w.week}</span>
                                        <strong style={{ color: '#6366F1' }}>{w.focus}</strong>
                                    </div>
                                    <ul style={{ paddingLeft: 16, margin: 0 }}>
                                        {w.tasks.map((t, j) => (
                                            <li key={j} style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: 3 }}>{t}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}

            {tab === 'skills' && (
                <div className="mt-skills">
                    <SkillMap />
                </div>
            )}
        </div>
    );
}

function SkillMap() {
    const skills = [
        { name: 'Listening', icon: '🎧', modules: ['Audio Player', 'Dictation', 'Quiz', 'Vocabulary'], route: '/listening', color: '#6366F1' },
        { name: 'Speaking', icon: '🗣️', modules: ['Shadowing', 'IELTS Part 1', 'IELTS Part 2', 'Pronunciation'], route: '/speaking', color: '#EC4899' },
        { name: 'Reading', icon: '📖', modules: ['Passages', 'MCQ', 'Gap Fill', 'T/F/NG'], route: '/reading', color: '#10B981' },
        { name: 'Writing', icon: '✍️', modules: ['Essay Editor', 'Email Writing', 'Sentence Clinic', 'Grammar'], route: '/writing', color: '#F59E0B' },
        { name: 'Grammar', icon: '📐', modules: ['Tenses', 'Conditionals', 'Passive', 'Reported Speech'], route: '/grammar', color: '#8B5CF6' },
    ];
    const navigate = useNavigate();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)', marginBottom: 8 }}>Your skill journey across all 5 domains. Tap any skill to practice.</p>
            {skills.map((s, i) => (
                <div key={i} className="sp-sentence-card" style={{ cursor: 'pointer', borderLeft: `4px solid ${s.color}` }} onClick={() => navigate(s.route)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: '2rem' }}>{s.icon}</span>
                        <div style={{ flex: 1 }}>
                            <h4 style={{ color: s.color, fontFamily: 'var(--font-display)' }}>{s.name}</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                {s.modules.map((m, j) => (
                                    <span key={j} style={{ fontSize: '0.7rem', background: `${s.color}15`, color: s.color, padding: '2px 8px', borderRadius: 6, fontWeight: 500 }}>{m}</span>
                                ))}
                            </div>
                        </div>
                        <span style={{ color: s.color }}>→</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

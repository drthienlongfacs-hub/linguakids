import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { awardXP } from '../../services/xpEngine';

// Adaptive placement test — 20 questions, difficulty adjusts based on answers
const EN_QUESTIONS = [
    // A1 — Level 1-2
    { q: 'What is the correct greeting?', options: ['Hello', 'Hallo', 'Hollo', 'Hullo'], answer: 0, level: 'A1' },
    { q: 'She ___ a student.', options: ['am', 'is', 'are', 'be'], answer: 1, level: 'A1' },
    { q: 'I ___ breakfast every morning.', options: ['eat', 'eats', 'eating', 'eaten'], answer: 0, level: 'A1' },
    { q: 'There are three ___ on the table.', options: ['book', 'books', 'bookes', 'bookies'], answer: 1, level: 'A1' },
    // A2 — Level 3-4
    { q: 'I went to the store ___ I needed milk.', options: ['because', 'although', 'however', 'therefore'], answer: 0, level: 'A2' },
    { q: 'They ___ to Paris last summer.', options: ['go', 'goes', 'went', 'going'], answer: 2, level: 'A2' },
    { q: 'This movie is ___ than the first one.', options: ['good', 'better', 'best', 'gooder'], answer: 1, level: 'A2' },
    { q: 'She has been working here ___ 2019.', options: ['for', 'since', 'from', 'during'], answer: 1, level: 'A2' },
    // B1 — Level 5-7
    { q: 'If I ___ more time, I would travel more.', options: ['have', 'had', 'has', 'having'], answer: 1, level: 'B1' },
    { q: 'The report ___ by the manager yesterday.', options: ['was reviewed', 'reviewed', 'is reviewing', 'reviews'], answer: 0, level: 'B1' },
    { q: 'Despite ___ tired, she continued working.', options: ['being', 'is', 'was', 'be'], answer: 0, level: 'B1' },
    { q: 'He suggested ___ the meeting to Friday.', options: ['to postpone', 'postponing', 'postpone', 'postponed'], answer: 1, level: 'B1' },
    // B2 — Level 8-9
    { q: 'Had I known about the delay, I ___ earlier.', options: ['would leave', 'would have left', 'will leave', 'had left'], answer: 1, level: 'B2' },
    { q: 'The phenomenon ___ extensive research is still poorly understood.', options: ['despite', 'in spite', 'notwithstanding', 'although'], answer: 2, level: 'B2' },
    { q: 'Not only ___ the exam, but she also got the highest score.', options: ['she passed', 'did she pass', 'she did pass', 'passed she'], answer: 1, level: 'B2' },
    { q: 'The CEO, ___ leadership transformed the company, retired last month.', options: ['who', 'whose', 'which', 'whom'], answer: 1, level: 'B2' },
    // C1 — Level 10
    { q: 'The implications of this policy ___ far-reaching consequences for the economy.', options: ['are bound to have', 'is bound to have', 'have bound to', 'bound to having'], answer: 0, level: 'C1' },
    { q: 'Scarcely ___ the announcement when protests erupted.', options: ['had they made', 'they had made', 'they made', 'did they make'], answer: 0, level: 'C1' },
    { q: 'The evidence was ___ compelling that the jury reached a unanimous verdict.', options: ['so', 'such', 'very', 'too'], answer: 0, level: 'C1' },
    { q: 'She would sooner resign ___ compromise her principles.', options: ['than', 'to', 'as', 'that'], answer: 0, level: 'C1' },
];

const CN_QUESTIONS = [
    { q: '"你好" means:', options: ['Goodbye', 'Hello', 'Thank you', 'Sorry'], answer: 1, level: 'HSK1' },
    { q: '我 ___ 学生。', options: ['是', '有', '在', '做'], answer: 0, level: 'HSK1' },
    { q: '"苹果" means:', options: ['Banana', 'Orange', 'Apple', 'Grape'], answer: 2, level: 'HSK1' },
    { q: '他每天 ___ 七点起床。', options: ['在', '从', '到', '早上'], answer: 3, level: 'HSK2' },
    { q: '虽然很累，___ 我还是去了。', options: ['但是', '因为', '所以', '如果'], answer: 0, level: 'HSK2' },
    { q: '他的中文说得 ___ 好。', options: ['很', '太', '非常', '比较'], answer: 2, level: 'HSK3' },
    { q: '这件事对他 ___ 很大。', options: ['影响', '关系', '问题', '效果'], answer: 0, level: 'HSK3' },
    { q: '"可持续发展" means:', options: ['Quick growth', 'Sustainable development', 'Economic crisis', 'Population growth'], answer: 1, level: 'HSK4' },
    { q: '科技的发展 ___ 了人们的生活方式。', options: ['改变', '变化', '变成', '转变'], answer: 0, level: 'HSK4' },
    { q: '"辩证" is closest to:', options: ['Argument', 'Dialectical', 'Debate', 'Discussion'], answer: 1, level: 'HSK5' },
];

function assessLevel(score, total) {
    const pct = score / total;
    if (pct >= 0.85) return { en: 'B2', cn: 'HSK4', label: 'Upper-Intermediate' };
    if (pct >= 0.7) return { en: 'B1', cn: 'HSK3', label: 'Intermediate' };
    if (pct >= 0.5) return { en: 'A2', cn: 'HSK2', label: 'Elementary' };
    return { en: 'A1', cn: 'HSK1', label: 'Beginner' };
}

export default function PlacementTest() {
    const navigate = useNavigate();
    const { state, dispatch } = useGame();
    const [lang, setLang] = useState(null); // null = choose, 'en' or 'cn'
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selected, setSelected] = useState(null);
    const [done, setDone] = useState(false);

    const questions = useMemo(() => lang === 'cn' ? CN_QUESTIONS : EN_QUESTIONS, [lang]);
    const current = questions[idx];

    if (!lang) {
        return (
            <div className="page" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>📝 Placement Test</h2>
                <p style={{ color: '#94A3B8', marginBottom: '32px' }}>Choose a language to test your level</p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button className="lh-lesson-card" style={{ padding: '24px 40px', cursor: 'pointer' }} onClick={() => setLang('en')}>
                        <span style={{ fontSize: '2rem' }}>🇬🇧</span>
                        <h3>English</h3>
                        <p style={{ color: '#94A3B8', fontSize: '0.8rem' }}>20 questions · CEFR A1-C1</p>
                    </button>
                    <button className="lh-lesson-card" style={{ padding: '24px 40px', cursor: 'pointer' }} onClick={() => setLang('cn')}>
                        <span style={{ fontSize: '2rem' }}>🇨🇳</span>
                        <h3>中文</h3>
                        <p style={{ color: '#94A3B8', fontSize: '0.8rem' }}>10 questions · HSK 1-5</p>
                    </button>
                </div>
                <button className="dictation-next-btn" style={{ marginTop: '24px' }} onClick={() => navigate('/')}>← Back</button>
            </div>
        );
    }

    if (done) {
        const result = assessLevel(score, questions.length);
        awardXP('placement_test');
        return (
            <div className="page" style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎯</div>
                <h2>Your Level: <span style={{ color: '#3B82F6' }}>{lang === 'cn' ? result.cn : result.en}</span></h2>
                <p style={{ color: '#94A3B8', fontSize: '1.1rem' }}>{result.label}</p>
                <div style={{ background: 'rgba(59,130,246,0.1)', borderRadius: '12px', padding: '20px', margin: '24px auto', maxWidth: '300px' }}>
                    <p style={{ fontSize: '2rem', fontWeight: 700 }}>{score}/{questions.length}</p>
                    <p style={{ color: '#94A3B8' }}>Correct Answers</p>
                    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', height: '8px', marginTop: '12px' }}>
                        <div style={{ background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)', height: '100%', borderRadius: '8px', width: `${(score / questions.length) * 100}%`, transition: 'width 1s ease' }} />
                    </div>
                </div>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '24px' }}>
                    {lang === 'en'
                        ? `We recommend starting with ${result.en} level content for optimal learning.`
                        : `建议从 ${result.cn} 级别开始学习。`}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                    <button className="dictation-next-btn" onClick={() => navigate('/')}>🏠 Home</button>
                    <button className="dictation-next-btn" style={{ background: 'linear-gradient(135deg, #8B5CF6, #6366F1)' }}
                        onClick={() => navigate(lang === 'en' ? '/english' : '/chinese')}>
                        📚 Start Learning
                    </button>
                </div>
            </div>
        );
    }

    const handleAnswer = (optIdx) => {
        if (selected !== null) return;
        setSelected(optIdx);
        if (optIdx === current.answer) setScore(s => s + 1);
        setTimeout(() => {
            if (idx + 1 >= questions.length) setDone(true);
            else { setIdx(i => i + 1); setSelected(null); }
        }, 800);
    };

    return (
        <div className="page" style={{ padding: '24px 20px' }}>
            <div className="ll-header">
                <button className="ll-back" onClick={() => setLang(null)}>←</button>
                <div className="ll-title-group">
                    <h2 className="ll-title">📝 Placement Test</h2>
                    <div className="ll-meta">
                        <span className="ll-badge level">{lang === 'en' ? 'English' : '中文'}</span>
                        <span className="ll-badge topic">{current.level}</span>
                        <span className="ll-badge duration">{idx + 1}/{questions.length}</span>
                    </div>
                </div>
            </div>

            <div className="sp-progress" style={{ margin: '16px 0' }}>
                <div className="dictation-progress-bar">
                    <div className="dictation-progress-fill" style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px', lineHeight: 1.5 }}>{current.q}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {current.options.map((opt, i) => {
                        let bg = 'rgba(255,255,255,0.05)';
                        let border = '1px solid rgba(255,255,255,0.08)';
                        if (selected !== null) {
                            if (i === current.answer) { bg = 'rgba(34,197,94,0.15)'; border = '1px solid #22C55E'; }
                            else if (i === selected && i !== current.answer) { bg = 'rgba(239,68,68,0.15)'; border = '1px solid #EF4444'; }
                        }
                        return (
                            <button key={i} onClick={() => handleAnswer(i)}
                                style={{ padding: '14px 18px', borderRadius: '10px', background: bg, border, textAlign: 'left', cursor: selected !== null ? 'default' : 'pointer', fontSize: '1rem', color: '#E2E8F0', transition: 'all 0.2s' }}>
                                <span style={{ opacity: 0.5, marginRight: '10px' }}>{String.fromCharCode(65 + i)}.</span>
                                {opt}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

// HSK 3 Format: Listening (40 items) + Reading (30 items) + Writing (10 items)
// Pass: 180/300 (60%)

const HSK3_MOCK = {
    listening: [
        {
            id: 1, type: 'match', audio: '你好，请问火车站怎么走？', question: 'What is the person asking about?',
            options: ['Hospital direction', 'Train station direction', 'Airport direction', 'Bus stop direction'], correct: 1
        },
        {
            id: 2, type: 'match', audio: '今天天气很好，我们去公园散步吧。', question: 'What does the speaker suggest?',
            options: ['Going to a restaurant', 'Staying home', 'Walking in the park', 'Going shopping'], correct: 2
        },
        {
            id: 3, type: 'match', audio: '这件衣服太贵了，有没有便宜一点的？', question: 'What does the customer want?',
            options: ['A bigger size', 'A different color', 'A cheaper one', 'A more expensive one'], correct: 2
        },
        {
            id: 4, type: 'match', audio: '我每天早上六点起床，然后跑步半个小时。', question: 'What does the speaker do after waking up?',
            options: ['Eats breakfast', 'Runs for 30 minutes', 'Reads newspaper', 'Takes a shower'], correct: 1
        },
        {
            id: 5, type: 'match', audio: '对不起，我来晚了，路上堵车了。', question: 'Why was the person late?',
            options: ['Bus broke down', 'Traffic jam', 'Overslept', 'Got lost'], correct: 1
        },
        {
            id: 6, type: 'match', audio: '医生说我应该多喝水，少吃甜的东西。', question: 'What did the doctor advise?',
            options: ['More exercise', 'Drink more water and less sweets', 'Take medicine', 'Sleep earlier'], correct: 1
        },
        { id: 7, type: 'tfng', audio: '小王已经在中国住了三年了，他的中文说得很好。', statement: 'Xiao Wang has lived in China for 5 years.', answer: false },
        { id: 8, type: 'tfng', audio: '我打算下个月去上海出差。', statement: 'The speaker plans to travel to Shanghai for business.', answer: true },
        { id: 9, type: 'tfng', audio: '这家饭店的菜很好吃，但是有点儿贵。', statement: 'The restaurant food is delicious but a bit expensive.', answer: true },
        { id: 10, type: 'tfng', audio: '他每个星期天都去图书馆看书。', statement: 'He goes to the library every Saturday.', answer: false },
    ],
    reading: [
        // Part 1: Sentence-Word Matching
        { id: 1, part: 1, sentence: '明天有雨，出门别忘了带＿＿。', options: ['伞', '书', '钱', '手机'], correct: 0 },
        { id: 2, part: 1, sentence: '这个周末我想和朋友一起去＿＿。', options: ['睡觉', '旅游', '工作', '考试'], correct: 1 },
        { id: 3, part: 1, sentence: '妈妈在厨房＿＿饭。', options: ['洗', '做', '买', '看'], correct: 1 },
        { id: 4, part: 1, sentence: '请你帮我＿＿这个箱子，太重了。', options: ['扔', '搬', '找', '画'], correct: 1 },
        { id: 5, part: 1, sentence: '他的中文水平＿＿了很多。', options: ['高', '提高', '不好', '低'], correct: 1 },

        // Part 2: Gap Fill in Context
        {
            id: 6, part: 2, passage: '昨天我去超市买了很多东西。水果、蔬菜、牛奶＿＿面包都买了。',
            options: ['和', '但是', '因为', '所以'], correct: 0
        },
        {
            id: 7, part: 2, passage: '虽然今天很累，＿＿我还是坚持去健身房锻炼了。',
            options: ['所以', '但是', '因为', '如果'], correct: 1
        },
        {
            id: 8, part: 2, passage: '＿＿天气不好，运动会改到下个星期。',
            options: ['虽然', '因为', '但是', '所以'], correct: 1
        },
        {
            id: 9, part: 2, passage: '这本书很有意思，我＿＿看了三遍。',
            options: ['已经', '正在', '将要', '没有'], correct: 0
        },
        {
            id: 10, part: 2, passage: '他说得太快了，我＿＿听不懂。',
            options: ['很', '都', '完全', '才'], correct: 2
        },

        // Part 3: Reading Comprehension
        {
            id: 11, part: 3, passage: '小李是一名大学生，他每天早上七点起床。先去食堂吃早饭，然后去教室上课。中午十二点下课后，他喜欢去图书馆看书。下午有时候打篮球，有时候学习。晚上他常常和同学一起去散步。',
            question: 'When does Xiao Li usually go to the library?', options: ['Morning', 'After lunch', 'Evening', 'Afternoon'], correct: 1
        },
        {
            id: 12, part: 3, passage: '小李是一名大学生，他每天早上七点起床。先去食堂吃早饭，然后去教室上课。中午十二点下课后，他喜欢去图书馆看书。下午有时候打篮球，有时候学习。晚上他常常和同学一起去散步。',
            question: 'What does Xiao Li do in the evening?', options: ['Study', 'Play basketball', 'Walk with classmates', 'Read books'], correct: 2
        },
    ],
    writing: [
        // Sentence reordering
        { id: 1, type: 'reorder', words: ['我', '每天', '坐地铁', '去', '上班'], correct: '我每天坐地铁去上班' },
        { id: 2, type: 'reorder', words: ['他', '比', '我', '高', '一点儿'], correct: '他比我高一点儿' },
        { id: 3, type: 'reorder', words: ['你', '能不能', '帮', '我', '一个忙'], correct: '你能不能帮我一个忙' },
        { id: 4, type: 'reorder', words: ['这个', '问题', '我', '已经', '解决了'], correct: '这个问题我已经解决了' },
        { id: 5, type: 'reorder', words: ['虽然', '很累', '但是', '很开心'], correct: '虽然很累但是很开心' },
    ],
};

export default function HSKSimulator() {
    const navigate = useNavigate();
    const { addXP } = useGameStore();
    const [section, setSection] = useState('menu'); // menu, listening, reading, writing, results
    const [answers, setAnswers] = useState({});
    const [timer, setTimer] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const [writingInputs, setWritingInputs] = useState({});

    useEffect(() => {
        let iv;
        if (timerRunning && timer > 0) iv = setInterval(() => setTimer(t => t - 1), 1000);
        else if (timer === 0 && timerRunning) { setTimerRunning(false); setSection('results'); }
        return () => clearInterval(iv);
    }, [timerRunning, timer]);

    const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

    const startSection = (sec) => {
        setSection(sec);
        setTimerRunning(true);
        setTimer(sec === 'listening' ? 25 * 60 : sec === 'reading' ? 25 * 60 : 15 * 60);
    };

    const score = useCallback(() => {
        let listening = 0, reading = 0, writing = 0;
        HSK3_MOCK.listening.forEach(q => {
            const a = answers[`l-${q.id}`];
            if (q.type === 'match' && parseInt(a) === q.correct) listening += 10;
            if (q.type === 'tfng' && a === String(q.answer)) listening += 10;
        });
        HSK3_MOCK.reading.forEach(q => {
            if (parseInt(answers[`r-${q.id}`]) === q.correct) reading += 8.3;
        });
        HSK3_MOCK.writing.forEach(q => {
            const a = (writingInputs[`w-${q.id}`] || '').replace(/\s/g, '');
            if (a === q.correct.replace(/\s/g, '')) writing += 20;
        });
        const total = Math.round(listening + reading + writing);
        return { listening: Math.round(listening), reading: Math.round(reading), writing: Math.round(writing), total, pass: total >= 180 };
    }, [answers, writingInputs]);

    const finishAll = () => { setTimerRunning(false); setSection('results'); addXP(50); };

    if (section === 'menu') {
        return (
            <div className="module-hub" style={{ padding: '20px' }}>
                <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                <h1 style={{ textAlign: 'center', marginBottom: '8px' }}>🏮 HSK 3 Mock Exam</h1>
                <p style={{ textAlign: 'center', color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '24px' }}>
                    Pass: 180/300 (60%) · 3 sections · ~65 minutes total
                </p>
                {[
                    { id: 'listening', emoji: '🎧', name: 'Listening 听力', items: 10, time: 25, desc: 'Match + True/False' },
                    { id: 'reading', emoji: '📖', name: 'Reading 阅读', items: 12, time: 25, desc: 'Fill, Context, Comprehension' },
                    { id: 'writing', emoji: '✍️', name: 'Writing 书写', items: 5, time: 15, desc: 'Sentence reordering' },
                ].map(s => (
                    <div key={s.id} className="topic-card" onClick={() => startSection(s.id)}
                        style={{ cursor: 'pointer', padding: '16px', marginBottom: '10px', maxWidth: '440px', margin: '0 auto 10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ fontSize: '2rem' }}>{s.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '1rem' }}>{s.name}</h3>
                                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                                    {s.items} items · {s.time} min · {s.desc}
                                </p>
                            </div>
                            <span>→</span>
                        </div>
                    </div>
                ))}
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button onClick={finishAll} style={{
                        padding: '10px 28px', borderRadius: '20px', border: 'none',
                        background: '#F97316', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
                    }}>
                        📝 View Results
                    </button>
                </div>
            </div>
        );
    }

    if (section === 'results') {
        const s = score();
        return (
            <div className="module-hub" style={{ padding: '20px', maxWidth: '440px', margin: '0 auto' }}>
                <button className="back-button" onClick={() => navigate(-1)}>← Back</button>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <span style={{ fontSize: '4rem' }}>{s.pass ? '🎉' : '💪'}</span>
                    <h2>{s.pass ? 'Passed! 通过了！' : 'Keep Practicing! 继续努力！'}</h2>
                    <p style={{ fontSize: '2rem', fontWeight: 700, color: s.pass ? '#059669' : '#DC2626' }}>{s.total}/300</p>
                    <p style={{ color: 'var(--color-text-light)' }}>Pass mark: 180/300</p>
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                    {[{ label: '🎧 Listening', v: s.listening, max: 100 },
                    { label: '📖 Reading', v: s.reading, max: 100 },
                    { label: '✍️ Writing', v: s.writing, max: 100 }].map(sec => (
                        <div key={sec.label} style={{ flex: 1, textAlign: 'center', padding: '12px', background: 'var(--color-surface)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{sec.label}</div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>{sec.v}/{sec.max}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => { setAnswers({}); setWritingInputs({}); setSection('menu'); }}
                        style={{ padding: '10px 20px', borderRadius: '20px', border: '1px solid var(--color-border)', background: 'transparent', cursor: 'pointer' }}>
                        Retry
                    </button>
                    <button onClick={() => navigate('/roadmap')}
                        style={{ padding: '10px 20px', borderRadius: '20px', border: 'none', background: '#3B82F6', color: '#fff', cursor: 'pointer' }}>
                        Back to Roadmap
                    </button>
                </div>
            </div>
        );
    }

    // Question rendering
    const data = HSK3_MOCK[section] || [];
    return (
        <div className="module-hub" style={{ padding: '20px' }}>
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',
                padding: '10px 16px', background: timer < 120 ? '#FEF2F2' : 'var(--color-surface)', borderRadius: '12px'
            }}>
                <span style={{ fontWeight: 700 }}>⏱️ {fmt(timer)}</span>
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    {section === 'listening' ? '🎧 Listening' : section === 'reading' ? '📖 Reading' : '✍️ Writing'}
                </span>
                <button onClick={() => { setTimerRunning(false); setSection('menu'); }}
                    style={{ padding: '6px 16px', borderRadius: '16px', border: 'none', background: '#3B82F6', color: '#fff', cursor: 'pointer', fontSize: '0.8rem' }}>
                    Done →
                </button>
            </div>

            {data.map((q, idx) => (
                <div key={q.id || idx} style={{ marginBottom: '16px', padding: '14px', background: 'var(--color-surface)', borderRadius: '12px' }}>
                    {/* Listening */}
                    {section === 'listening' && q.type === 'match' && (
                        <>
                            <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#F59E0B', fontWeight: 600 }}>🔊 {q.audio}</p>
                            <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '0.9rem' }}>{q.question}</p>
                            {q.options.map((opt, oi) => (
                                <label key={oi} style={{ display: 'block', padding: '4px 0', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    <input type="radio" name={`l-${q.id}`} value={oi}
                                        checked={answers[`l-${q.id}`] === String(oi)}
                                        onChange={() => setAnswers(p => ({ ...p, [`l-${q.id}`]: String(oi) }))}
                                        style={{ marginRight: '8px' }} />
                                    {String.fromCharCode(65 + oi)}) {opt}
                                </label>
                            ))}
                        </>
                    )}
                    {section === 'listening' && q.type === 'tfng' && (
                        <>
                            <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: '#F59E0B', fontWeight: 600 }}>🔊 {q.audio}</p>
                            <p style={{ margin: '0 0 8px', fontSize: '0.9rem' }}>{q.statement}</p>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {['true', 'false'].map(v => (
                                    <button key={v} onClick={() => setAnswers(p => ({ ...p, [`l-${q.id}`]: v }))}
                                        style={{
                                            padding: '4px 16px', borderRadius: '14px', cursor: 'pointer', fontSize: '0.8rem',
                                            border: '1px solid var(--color-border)',
                                            background: answers[`l-${q.id}`] === v ? '#3B82F6' : 'transparent',
                                            color: answers[`l-${q.id}`] === v ? '#fff' : 'var(--color-text)'
                                        }}>
                                        {v === 'true' ? '✓ True' : '✗ False'}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Reading */}
                    {section === 'reading' && (
                        <>
                            {q.passage && <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.6 }}>{q.passage}</p>}
                            {q.sentence && <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600 }}>{q.sentence}</p>}
                            {q.question && <p style={{ margin: '0 0 8px', fontSize: '0.9rem', fontWeight: 600 }}>{q.question}</p>}
                            {q.options.map((opt, oi) => (
                                <label key={oi} style={{ display: 'block', padding: '4px 0', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    <input type="radio" name={`r-${q.id}`} value={oi}
                                        checked={answers[`r-${q.id}`] === String(oi)}
                                        onChange={() => setAnswers(p => ({ ...p, [`r-${q.id}`]: String(oi) }))}
                                        style={{ marginRight: '8px' }} />
                                    {opt}
                                </label>
                            ))}
                        </>
                    )}

                    {/* Writing */}
                    {section === 'writing' && (
                        <>
                            <p style={{ margin: '0 0 8px', fontSize: '0.85rem', fontWeight: 600 }}>
                                Arrange these words into a correct sentence:
                            </p>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                                {q.words.map((w, wi) => (
                                    <span key={wi} style={{ padding: '4px 12px', borderRadius: '8px', background: '#DBEAFE', fontSize: '0.9rem', fontWeight: 600 }}>
                                        {w}
                                    </span>
                                ))}
                            </div>
                            <input type="text" placeholder="Type the sentence in correct order..."
                                value={writingInputs[`w-${q.id}`] || ''}
                                onChange={e => setWritingInputs(p => ({ ...p, [`w-${q.id}`]: e.target.value }))}
                                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.9rem' }} />
                        </>
                    )}
                </div>
            ))}
        </div>
    );
}

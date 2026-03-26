// ListeningComprehension — Listen to audio passages and answer questions
// Uses SpeechSynthesis for realistic listening practice at various speeds
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const PASSAGES = [
    {
        id: 1, title: 'Job Interview', titleVi: 'Phỏng vấn xin việc', emoji: '💼', level: 'A2',
        text: "Hello, my name is Sarah. I am applying for the marketing position. I graduated from university last year with a degree in business. During my studies, I worked part-time at a small company. I learned a lot about social media and online advertising. I am a hard worker and I enjoy working in a team. I believe I can bring fresh ideas to your company.",
        questions: [
            { q: 'What position is Sarah applying for?', opts: ['Marketing', 'Finance', 'Engineering', 'Design'], answer: 0 },
            { q: 'When did Sarah graduate?', opts: ['Two years ago', 'Last year', 'This year', 'Three years ago'], answer: 1 },
            { q: 'What did Sarah learn during her part-time job?', opts: ['Cooking', 'Social media and advertising', 'Programming', 'Teaching'], answer: 1 },
        ],
    },
    {
        id: 2, title: 'Weather Report', titleVi: 'Dự báo thời tiết', emoji: '🌦️', level: 'A2',
        text: "Good morning! Here is today's weather forecast. It will be sunny this morning with temperatures around twenty-five degrees. However, clouds will move in this afternoon, and there is a sixty percent chance of rain by evening. Tomorrow will be cooler, with temperatures dropping to about twenty degrees. We recommend bringing an umbrella if you are going out this afternoon.",
        questions: [
            { q: 'What will the morning weather be like?', opts: ['Rainy', 'Cloudy', 'Sunny', 'Snowy'], answer: 2 },
            { q: 'What is the chance of rain by evening?', opts: ['30%', '40%', '50%', '60%'], answer: 3 },
            { q: 'What should people bring this afternoon?', opts: ['Sunglasses', 'A jacket', 'An umbrella', 'A hat'], answer: 2 },
        ],
    },
    {
        id: 3, title: 'Travel Planning', titleVi: 'Lên kế hoạch du lịch', emoji: '✈️', level: 'B1',
        text: "My family is planning a trip to Japan next month. We will fly from Ho Chi Minh City to Tokyo. The flight takes about five hours. We booked a hotel near Shinjuku station. We plan to visit the famous temples in Kyoto, try traditional Japanese food, and see Mount Fuji. The total cost for the trip is about two thousand dollars for four people. We are very excited about this adventure.",
        questions: [
            { q: 'Where are they flying to?', opts: ['Seoul', 'Beijing', 'Tokyo', 'Singapore'], answer: 2 },
            { q: 'How long is the flight?', opts: ['3 hours', '5 hours', '7 hours', '10 hours'], answer: 1 },
            { q: 'What is the total trip cost?', opts: ['$1000', '$1500', '$2000', '$3000'], answer: 2 },
        ],
    },
    {
        id: 4, title: 'Health Advice', titleVi: 'Lời khuyên sức khỏe', emoji: '⚕️', level: 'B1',
        text: "Doctor Lee recommends that adults exercise at least thirty minutes a day, five times a week. Regular exercise helps reduce stress, improves heart health, and strengthens bones. She also suggests drinking eight glasses of water daily and eating five servings of fruits and vegetables. Getting seven to eight hours of sleep is equally important. Small changes in daily habits can make a big difference in your overall health.",
        questions: [
            { q: 'How many minutes of exercise does the doctor recommend?', opts: ['15 minutes', '20 minutes', '30 minutes', '45 minutes'], answer: 2 },
            { q: 'How many glasses of water daily?', opts: ['4', '6', '8', '10'], answer: 2 },
            { q: 'How many hours of sleep are recommended?', opts: ['5-6', '6-7', '7-8', '9-10'], answer: 2 },
        ],
    },
    {
        id: 5, title: 'Technology News', titleVi: 'Tin công nghệ', emoji: '📱', level: 'B2',
        text: "A new study from Stanford University shows that artificial intelligence is transforming healthcare. AI systems can now detect diseases from medical images with ninety-five percent accuracy. This is often better than human doctors. The technology is especially useful in rural areas where there are not enough specialists. However, experts warn that AI should assist doctors, not replace them. Patient privacy and data security remain important concerns as this technology develops.",
        questions: [
            { q: 'What accuracy can AI detect diseases?', opts: ['85%', '90%', '95%', '99%'], answer: 2 },
            { q: 'Where is AI especially useful?', opts: ['Big cities', 'Rural areas', 'Hospitals only', 'Schools'], answer: 1 },
            { q: 'What are concerns about AI in healthcare?', opts: ['Cost', 'Speed', 'Privacy and security', 'Design'], answer: 2 },
        ],
    },
];

export default function ListeningComprehension() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [passageIdx, setPassageIdx] = useState(0);
    const [phase, setPhase] = useState('listen'); // listen | quiz | results
    const [qIdx, setQIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [speed, setSpeed] = useState(0.85);
    const [complete, setComplete] = useState(false);
    const [allResults, setAllResults] = useState([]);

    const passage = PASSAGES[passageIdx];

    const speak = useCallback((text, rate) => {
        window.speechSynthesis?.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US'; u.rate = rate || speed;
        window.speechSynthesis?.speak(u);
    }, [speed]);

    const handleAnswer = (idx) => {
        setSelected(idx);
        const correct = idx === passage.questions[qIdx].answer;
        if (correct) { setScore(s => s + 1); addXP(10); setCelebration(c => c + 1); }
        setAllResults(prev => [...prev, { q: passage.questions[qIdx].q, correct }]);
    };

    const nextQuestion = () => {
        if (qIdx + 1 >= passage.questions.length) {
            if (passageIdx + 1 >= PASSAGES.length) setComplete(true);
            else { setPassageIdx(i => i + 1); setPhase('listen'); setQIdx(0); setSelected(null); }
        } else { setQIdx(i => i + 1); setSelected(null); }
    };

    if (complete) {
        const total = PASSAGES.reduce((a, p) => a + p.questions.length, 0);
        const pct = Math.round((score / total) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '🏆' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Listening Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{total} ({pct}%)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🎧 Listening</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(passageIdx / PASSAGES.length) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{passageIdx + 1}/{PASSAGES.length}</span>
            </div>

            {phase === 'listen' ? (
                <div style={{ marginTop: '16px' }}>
                    <div style={{ textAlign: 'center', padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{passage.emoji}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>{passage.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{passage.titleVi} • Level {passage.level}</div>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '12px' }}>
                            <button onClick={() => { setSpeed(0.6); speak(passage.text, 0.6); }} className="btn btn--outline" style={{ fontSize: '0.75rem' }}>🐢 Chậm</button>
                            <button onClick={() => { setSpeed(0.85); speak(passage.text, 0.85); }} className="btn btn--primary">🔊 Nghe</button>
                            <button onClick={() => { setSpeed(1.1); speak(passage.text, 1.1); }} className="btn btn--outline" style={{ fontSize: '0.75rem' }}>🐇 Nhanh</button>
                        </div>
                    </div>
                    <div style={{ marginTop: '10px', padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface)', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                        💡 Nghe kỹ rồi bấm "Trả lời" để kiểm tra hiểu!
                    </div>
                    <button className="btn btn--primary btn--block btn--large" style={{ marginTop: '12px' }} onClick={() => { window.speechSynthesis?.cancel(); setPhase('quiz'); setQIdx(0); setSelected(null); }}>
                        📝 Trả lời câu hỏi
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: '16px' }}>
                    <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', marginBottom: '12px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '4px' }}>
                            Câu {qIdx + 1}/{passage.questions.length} • {passage.title}
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
                            {passage.questions[qIdx].q}
                        </div>
                        <button onClick={() => speak(passage.text)} style={{ marginTop: '6px', fontSize: '0.7rem', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '3px 10px', cursor: 'pointer', color: 'var(--color-text-light)' }}>🔊 Nghe lại</button>
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {passage.questions[qIdx].opts.map((opt, i) => {
                            const isCorrect = i === passage.questions[qIdx].answer;
                            const isSelected = selected === i;
                            let bg = 'var(--color-card)';
                            let border = '2px solid var(--color-border)';
                            if (selected !== null) {
                                if (isCorrect) { bg = '#22C55E15'; border = '2px solid #22C55E'; }
                                else if (isSelected) { bg = '#EF444415'; border = '2px solid #EF4444'; }
                            }
                            return (
                                <button key={i} onClick={() => selected === null && handleAnswer(i)} disabled={selected !== null}
                                    style={{ padding: '14px', borderRadius: 'var(--radius-lg)', border, background: bg, cursor: selected ? 'default' : 'pointer', textAlign: 'left', fontSize: '0.9rem', fontWeight: 600 }}>
                                    {selected !== null && isCorrect && '✅ '}
                                    {selected !== null && isSelected && !isCorrect && '❌ '}
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    {selected !== null && (
                        <button className="btn btn--primary btn--block" style={{ marginTop: '12px' }} onClick={nextQuestion}>
                            ➡️ {qIdx + 1 >= passage.questions.length ? (passageIdx + 1 >= PASSAGES.length ? 'Kết quả' : 'Bài tiếp') : 'Câu tiếp'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

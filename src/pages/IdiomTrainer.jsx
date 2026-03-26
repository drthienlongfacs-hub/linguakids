// IdiomTrainer — Learn English idioms with visual meanings and quizzes
// Simulates a teacher explaining idioms through context and examples
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const IDIOMS = [
    { idiom: 'Break the ice', meaning: 'Start a conversation in a social setting', vi: 'Phá băng / Bắt chuyện', emoji: '🧊', example: 'She told a joke to break the ice at the party.', exampleVi: 'Cô ấy kể chuyện cười để phá băng ở tiệc.' },
    { idiom: 'Hit the nail on the head', meaning: 'To be exactly right', vi: 'Nói trúng vấn đề', emoji: '🔨', example: 'You hit the nail on the head with that analysis.', exampleVi: 'Bạn nói trúng vấn đề với phân tích đó.' },
    { idiom: 'Spill the beans', meaning: 'To reveal a secret', vi: 'Tiết lộ bí mật', emoji: '🫘', example: 'Who spilled the beans about the surprise party?', exampleVi: 'Ai đã tiết lộ bí mật về tiệc bất ngờ?' },
    { idiom: 'Cost an arm and a leg', meaning: 'Very expensive', vi: 'Đắt cắt cổ', emoji: '💰', example: 'That designer bag costs an arm and a leg.', exampleVi: 'Túi hàng hiệu đó đắt cắt cổ.' },
    { idiom: 'Piece of cake', meaning: 'Very easy', vi: 'Dễ như ăn kẹo', emoji: '🍰', example: 'The exam was a piece of cake.', exampleVi: 'Bài thi dễ như ăn kẹo.' },
    { idiom: 'Under the weather', meaning: 'Feeling sick or unwell', vi: 'Không khỏe', emoji: '🤒', example: 'I am feeling under the weather today.', exampleVi: 'Hôm nay tôi không được khỏe.' },
    { idiom: 'On the same page', meaning: 'In agreement', vi: 'Đồng quan điểm', emoji: '📖', example: 'Let us make sure we are on the same page.', exampleVi: 'Hãy đảm bảo chúng ta đồng quan điểm.' },
    { idiom: 'The elephant in the room', meaning: 'An obvious problem nobody wants to discuss', vi: 'Vấn đề hiển nhiên không ai muốn nói', emoji: '🐘', example: 'We need to address the elephant in the room.', exampleVi: 'Chúng ta cần giải quyết vấn đề hiển nhiên.' },
    { idiom: 'Barking up the wrong tree', meaning: 'Making a wrong assumption', vi: 'Hiểu sai vấn đề', emoji: '🌳', example: 'If you think I did it, you are barking up the wrong tree.', exampleVi: 'Nếu bạn nghĩ tôi làm, bạn hiểu sai rồi.' },
    { idiom: 'When pigs fly', meaning: 'Something that will never happen', vi: 'Không bao giờ xảy ra', emoji: '🐷', example: 'He will clean his room when pigs fly.', exampleVi: 'Anh ấy dọn phòng khi trái đất quay ngược.' },
    { idiom: 'Blessing in disguise', meaning: 'Something bad that turns out good', vi: 'Trong rủi có may', emoji: '🎭', example: 'Losing that job was a blessing in disguise.', exampleVi: 'Mất việc hóa ra lại là may.' },
    { idiom: 'Once in a blue moon', meaning: 'Very rarely', vi: 'Hiếm khi', emoji: '🌙', example: 'I only eat fast food once in a blue moon.', exampleVi: 'Tôi hiếm khi ăn đồ ăn nhanh.' },
    { idiom: 'Beat around the bush', meaning: 'Avoid talking about what is important', vi: 'Vòng vo tam quốc', emoji: '🌿', example: 'Stop beating around the bush and tell me the truth.', exampleVi: 'Đừng vòng vo nữa, nói thật đi.' },
    { idiom: 'Bite off more than you can chew', meaning: 'Take on more than you can handle', vi: 'Ôm đồm quá sức', emoji: '🦷', example: 'I bit off more than I could chew with this project.', exampleVi: 'Tôi ôm đồm quá sức với dự án này.' },
    { idiom: 'Get out of hand', meaning: 'Become uncontrollable', vi: 'Mất kiểm soát', emoji: '🙌', example: 'The situation got out of hand quickly.', exampleVi: 'Tình huống nhanh chóng mất kiểm soát.' },
    { idiom: 'Miss the boat', meaning: 'Miss an opportunity', vi: 'Bỏ lỡ cơ hội', emoji: '🚢', example: 'Apply now or you will miss the boat.', exampleVi: 'Nộp đơn ngay kẻo bỏ lỡ cơ hội.' },
    { idiom: 'A penny for your thoughts', meaning: 'What are you thinking about?', vi: 'Bạn đang nghĩ gì vậy?', emoji: '🪙', example: 'You look quiet — a penny for your thoughts?', exampleVi: 'Bạn im lặng thế — đang nghĩ gì vậy?' },
    { idiom: 'Go the extra mile', meaning: 'Make more effort than expected', vi: 'Nỗ lực hơn mong đợi', emoji: '🏃', example: 'She always goes the extra mile for her students.', exampleVi: 'Cô ấy luôn nỗ lực hơn cho học sinh.' },
    { idiom: 'No pain, no gain', meaning: 'Hard work is necessary for success', vi: 'Có công mài sắt có ngày nên kim', emoji: '💪', example: 'No pain, no gain — keep practicing!', exampleVi: 'Có công mài sắt — cứ luyện tập!' },
    { idiom: 'Take it with a grain of salt', meaning: 'Do not take it too seriously', vi: 'Đừng tin hoàn toàn', emoji: '🧂', example: 'Take online reviews with a grain of salt.', exampleVi: 'Đừng tin hoàn toàn đánh giá online.' },
];

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

const TOTAL = 8;

export default function IdiomTrainer() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [idioms] = useState(() => shuffle(IDIOMS).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState('learn'); // learn | quiz
    const [selected, setSelected] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [score, setScore] = useState(0);
    const [complete, setComplete] = useState(false);
    const [options, setOptions] = useState([]);

    const current = idioms[idx];

    const startQuiz = () => {
        const wrong = shuffle(IDIOMS.filter(i => i.idiom !== current.idiom)).slice(0, 3).map(i => i.meaning);
        setOptions(shuffle([current.meaning, ...wrong]));
        setPhase('quiz');
        setSelected(null);
    };

    const handleAnswer = (opt) => {
        setSelected(opt);
        if (opt === current.meaning) {
            setScore(s => s + 1);
            addXP(10);
            setCelebration(c => c + 1);
        }
    };

    const next = () => {
        if (idx + 1 >= TOTAL) { setComplete(true); }
        else { setIdx(i => i + 1); setPhase('learn'); setSelected(null); }
    };

    if (complete) {
        const pct = Math.round((score / TOTAL) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '12px' }}>{pct >= 80 ? '🏆' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Idiom Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện idiom khác</button>
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
                <h2 className="page-header__title">🎭 Idiom Trainer</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            {phase === 'learn' ? (
                <div style={{ marginTop: '20px' }}>
                    <div style={{ textAlign: 'center', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{current.emoji}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                            "{current.idiom}"
                        </div>
                        <div style={{ fontSize: '0.9rem', marginTop: '8px', fontWeight: 600 }}>
                            🇺🇸 {current.meaning}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            🇻🇳 {current.vi}
                        </div>
                    </div>
                    <div style={{ marginTop: '12px', padding: '14px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)', borderLeft: '3px solid var(--color-primary)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '4px' }}>📝 Ví dụ:</div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>"{current.example}"</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{current.exampleVi}</div>
                    </div>
                    <button className="btn btn--primary btn--block btn--large" style={{ marginTop: '16px' }} onClick={startQuiz}>
                        🧠 Kiểm tra
                    </button>
                </div>
            ) : (
                <div style={{ marginTop: '20px' }}>
                    <div style={{ textAlign: 'center', padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', marginBottom: '12px' }}>
                        <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>{current.emoji}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>"{current.idiom}" nghĩa là gì?</div>
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {options.map((opt, i) => {
                            const isCorrect = opt === current.meaning;
                            const isSelected = selected === opt;
                            let bg = 'var(--color-card)';
                            let border = '2px solid var(--color-border)';
                            if (selected !== null) {
                                if (isCorrect) { bg = '#22C55E15'; border = '2px solid #22C55E'; }
                                else if (isSelected) { bg = '#EF444415'; border = '2px solid #EF4444'; }
                            }
                            return (
                                <button key={i} onClick={() => !selected && handleAnswer(opt)}
                                    disabled={selected !== null}
                                    style={{
                                        padding: '14px', borderRadius: 'var(--radius-lg)', border, background: bg,
                                        cursor: selected ? 'default' : 'pointer', textAlign: 'left',
                                        fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)',
                                    }}>
                                    {selected !== null && isCorrect && '✅ '}
                                    {selected !== null && isSelected && !isCorrect && '❌ '}
                                    {opt}
                                </button>
                            );
                        })}
                    </div>
                    {selected !== null && (
                        <button className="btn btn--primary btn--block" style={{ marginTop: '12px' }} onClick={next}>
                            {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Idiom tiếp'}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

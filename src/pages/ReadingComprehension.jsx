// ReadingComprehension — Read passages and answer comprehension questions
// Native teacher level reading practice with bilingual support
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const PASSAGES = [
    {
        id: 1, level: 'A2', emoji: '☕',
        title: 'A Morning Routine',
        text: 'Sarah wakes up at 6:30 every morning. First, she brushes her teeth and takes a shower. Then she makes breakfast — usually toast with eggs and a cup of coffee. After breakfast, she checks her email and gets dressed for work. She leaves the house at 8:00 and walks to the bus stop. The bus takes about 20 minutes to reach her office. She enjoys listening to podcasts during the ride. Her workday starts at 8:30.',
        textVi: 'Sarah thức dậy lúc 6:30 mỗi sáng. Đầu tiên, cô đánh răng và tắm. Sau đó cô làm bữa sáng — thường là bánh mì nướng với trứng và cà phê. Sau bữa sáng, cô kiểm tra email và mặc đồ đi làm. Cô rời nhà lúc 8:00 và đi bộ ra trạm xe buýt. Xe buýt mất khoảng 20 phút đến văn phòng. Cô thích nghe podcast trên đường đi. Ngày làm việc bắt đầu lúc 8:30.',
        questions: [
            { q: 'What time does Sarah wake up?', options: ['6:00', '6:30', '7:00', '7:30'], answer: '6:30' },
            { q: 'What does she eat for breakfast?', options: ['Cereal', 'Toast with eggs', 'Rice', 'Sandwich'], answer: 'Toast with eggs' },
            { q: 'How does she get to work?', options: ['By car', 'By bicycle', 'By bus', 'By train'], answer: 'By bus' },
        ],
    },
    {
        id: 2, level: 'B1', emoji: '🌍',
        title: 'Climate Change',
        text: 'Climate change is one of the biggest challenges facing our planet. Global temperatures have risen by approximately 1.1 degrees Celsius since the industrial revolution. This warming is primarily caused by human activities, particularly the burning of fossil fuels like coal, oil, and gas. The effects include rising sea levels, more frequent extreme weather events, and loss of biodiversity. Scientists say we need to reduce carbon emissions by 50% before 2030 to avoid the worst impacts. Renewable energy sources such as solar and wind power are important solutions.',
        textVi: 'Biến đổi khí hậu là một trong những thách thức lớn nhất đối với hành tinh. Nhiệt độ toàn cầu đã tăng khoảng 1,1 độ C kể từ cuộc cách mạng công nghiệp. Sự ấm lên này chủ yếu do hoạt động con người, đặc biệt là đốt nhiên liệu hóa thạch. Hệ quả bao gồm mực nước biển dâng, thời tiết cực đoan và mất đa dạng sinh học. Các nhà khoa học cho biết cần giảm 50% lượng khí thải carbon trước năm 2030.',
        questions: [
            { q: 'How much has global temperature risen?', options: ['0.5°C', '1.1°C', '2.0°C', '3.5°C'], answer: '1.1°C' },
            { q: 'What is the main cause of warming?', options: ['Volcanoes', 'Solar activity', 'Burning fossil fuels', 'Deforestation'], answer: 'Burning fossil fuels' },
            { q: 'By when should emissions be cut 50%?', options: ['2025', '2030', '2040', '2050'], answer: '2030' },
        ],
    },
    {
        id: 3, level: 'A2', emoji: '🏥',
        title: 'At the Doctor\'s Office',
        text: 'Tom has had a headache and a sore throat for three days. He decided to visit his doctor, Dr. Lee. At the clinic, the nurse took his temperature — it was 38.5 degrees. Dr. Lee examined him and said he had the flu. She prescribed some medicine and told him to rest at home for a few days. "Drink plenty of water and get enough sleep," she advised. Tom thanked her and went to the pharmacy to buy his medicine. He felt better after two days.',
        textVi: 'Tom bị đau đầu và đau họng ba ngày rồi. Anh quyết định đi khám bác sĩ Lee. Tại phòng khám, y tá đo nhiệt — 38,5 độ. Bác sĩ Lee khám và nói anh bị cúm. Cô kê đơn thuốc và dặn nghỉ ngơi ở nhà vài ngày. "Uống nhiều nước và ngủ đủ giấc," cô khuyên. Tom cảm ơn và đi hiệu thuốc mua thuốc. Anh khỏe hơn sau hai ngày.',
        questions: [
            { q: 'How long has Tom been sick?', options: ['1 day', '2 days', '3 days', '1 week'], answer: '3 days' },
            { q: 'What was his temperature?', options: ['37.0°', '37.5°', '38.0°', '38.5°'], answer: '38.5°' },
            { q: 'What did Dr. Lee diagnose?', options: ['Cold', 'Flu', 'Allergies', 'COVID'], answer: 'Flu' },
        ],
    },
    {
        id: 4, level: 'B2', emoji: '🤖',
        title: 'Artificial Intelligence in Education',
        text: 'Artificial intelligence is transforming education in significant ways. AI-powered language learning apps now provide personalized feedback on pronunciation and grammar, simulating the experience of a private tutor. Adaptive learning systems adjust difficulty levels based on student performance, ensuring each learner progresses at their own pace. Chatbots serve as 24/7 study companions, answering questions and explaining concepts. However, experts warn that AI should complement, not replace, human teachers. The human elements of empathy, creativity, and social interaction remain essential for effective education.',
        textVi: 'Trí tuệ nhân tạo đang thay đổi giáo dục đáng kể. Ứng dụng học ngôn ngữ dùng AI cung cấp phản hồi cá nhân về phát âm và ngữ pháp, mô phỏng trải nghiệm gia sư riêng. Hệ thống học thích ứng điều chỉnh độ khó theo kết quả học sinh. Chatbot đóng vai trò bạn học 24/7. Tuy nhiên, chuyên gia cảnh báo AI nên bổ sung chứ không thay thế giáo viên.',
        questions: [
            { q: 'What can AI-powered apps simulate?', options: ['Classroom', 'Private tutor', 'Library', 'Playground'], answer: 'Private tutor' },
            { q: 'What do adaptive systems adjust?', options: ['Schedule', 'Difficulty levels', 'Teachers', 'Languages'], answer: 'Difficulty levels' },
            { q: 'Should AI replace teachers, according to experts?', options: ['Yes', 'No, it should complement them', 'Sometimes', 'Only for adults'], answer: 'No, it should complement them' },
        ],
    },
];

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

export default function ReadingComprehension() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [passageIdx, setPassageIdx] = useState(null);
    const [showVi, setShowVi] = useState(false);
    const [qIdx, setQIdx] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selected, setSelected] = useState(null);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);

    const passage = passageIdx !== null ? PASSAGES[passageIdx] : null;

    const handleAnswer = (option) => {
        if (selected) return;
        setSelected(option);
        const q = passage.questions[qIdx];
        const correct = option === q.answer;
        if (correct) { addXP(10); setCelebration(c => c + 1); }
        setAnswers(prev => [...prev, correct]);
        setTimeout(() => {
            setSelected(null);
            if (qIdx + 1 >= passage.questions.length) {
                setComplete(true);
            } else {
                setQIdx(i => i + 1);
            }
        }, 1000);
    };

    if (passageIdx === null) {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                    <h2 className="page-header__title">📖 Reading Comprehension</h2>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {PASSAGES.map((p, i) => (
                        <button key={p.id} onClick={() => setPassageIdx(i)} style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '16px',
                            borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', border: '1px solid var(--color-border)',
                            cursor: 'pointer', textAlign: 'left',
                        }}>
                            <span style={{ fontSize: '1.8rem' }}>{p.emoji}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{p.title}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{p.questions.length} questions</div>
                            </div>
                            <span style={{
                                padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.75rem',
                                background: p.level === 'A2' ? '#22C55E20' : p.level === 'B1' ? '#F59E0B20' : '#EF444420',
                                color: p.level === 'A2' ? '#22C55E' : p.level === 'B1' ? '#F59E0B' : '#EF4444',
                            }}>{p.level}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (complete) {
        const score = answers.filter(Boolean).length;
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '4rem', marginBottom: '12px' }}>{score === passage.questions.length ? '🏆' : '📖'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>{passage.title}</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: score >= 2 ? '#22C55E' : '#F59E0B' }}>{score}/{passage.questions.length}</p>
                <p style={{ color: 'var(--color-text-light)' }}>+{score * 10} XP ⭐</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => { setPassageIdx(null); setQIdx(0); setAnswers([]); setComplete(false); }}>📖 Chọn bài khác</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>🎮 Trò chơi</button>
                </div>
            </div>
        );
    }

    const q = passage.questions[qIdx];

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => { setPassageIdx(null); setQIdx(0); setAnswers([]); }}>←</button>
                <h2 className="page-header__title">{passage.emoji} {passage.title}</h2>
            </div>

            {/* Reading */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)', marginBottom: '16px', lineHeight: 1.7, fontSize: '0.95rem' }}>
                {passage.text}
                <button onClick={() => setShowVi(!showVi)} style={{
                    display: 'block', marginTop: '10px', padding: '6px 14px', borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                }}>
                    {showVi ? '🇬🇧 Ẩn bản dịch' : '🇻🇳 Xem bản dịch'}
                </button>
                {showVi && <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--color-text-light)', fontStyle: 'italic', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>{passage.textVi}</div>}
            </div>

            {/* Question */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #3B82F610, #8B5CF610)', border: '1px solid var(--color-border)' }}>
                <p style={{ fontWeight: 700, marginBottom: '12px', fontSize: '0.95rem' }}>❓ {q.q}</p>
                <div style={{ display: 'grid', gap: '8px' }}>
                    {q.options.map(opt => {
                        const isCorrect = opt === q.answer;
                        const isSelected = selected === opt;
                        return (
                            <button key={opt} onClick={() => handleAnswer(opt)} disabled={!!selected}
                                style={{
                                    padding: '12px 16px', border: 'none', borderRadius: 'var(--radius-md)',
                                    background: selected ? (isCorrect ? '#22C55E20' : isSelected ? '#EF444420' : 'var(--color-card)') : 'var(--color-card)',
                                    border: selected ? (isCorrect ? '2px solid #22C55E' : isSelected ? '2px solid #EF4444' : '2px solid var(--color-border)') : '2px solid var(--color-border)',
                                    textAlign: 'left', fontWeight: 600, cursor: selected ? 'default' : 'pointer', color: 'var(--color-text)',
                                }}
                            >{opt}</button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

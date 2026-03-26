// GrammarExplainer — Interactive grammar lesson cards with examples and quiz
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';

const GRAMMAR_LESSONS = [
    {
        id: 'present-simple', title: 'Present Simple', titleVi: 'Thì Hiện tại đơn', emoji: '⏰', level: 'A1',
        rule: 'Subject + V(s/es) + Object',
        explanation: 'Dùng để diễn tả thói quen, sự thật, hoặc hành động lặp đi lặp lại.',
        examples: [
            { en: 'She reads books every day.', vi: 'Cô ấy đọc sách mỗi ngày.', highlight: 'reads' },
            { en: 'The sun rises in the east.', vi: 'Mặt trời mọc ở phía đông.', highlight: 'rises' },
            { en: 'I don\'t like spicy food.', vi: 'Tôi không thích đồ ăn cay.', highlight: 'don\'t like' },
        ],
        quiz: { question: 'She ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], answer: 'goes' },
    },
    {
        id: 'present-continuous', title: 'Present Continuous', titleVi: 'Thì Hiện tại tiếp diễn', emoji: '🔄', level: 'A1',
        rule: 'Subject + am/is/are + V-ing',
        explanation: 'Dùng để diễn tả hành động đang xảy ra tại thời điểm nói.',
        examples: [
            { en: 'I am studying English now.', vi: 'Tôi đang học tiếng Anh.', highlight: 'am studying' },
            { en: 'They are playing soccer.', vi: 'Họ đang chơi bóng đá.', highlight: 'are playing' },
            { en: 'She is not sleeping.', vi: 'Cô ấy không đang ngủ.', highlight: 'is not sleeping' },
        ],
        quiz: { question: 'They ___ dinner right now.', options: ['eat', 'eats', 'are eating', 'ate'], answer: 'are eating' },
    },
    {
        id: 'past-simple', title: 'Past Simple', titleVi: 'Thì Quá khứ đơn', emoji: '⏪', level: 'A2',
        rule: 'Subject + V(ed/irregular) + Object',
        explanation: 'Dùng để diễn tả hành động đã hoàn thành trong quá khứ.',
        examples: [
            { en: 'I visited Paris last summer.', vi: 'Tôi đã thăm Paris mùa hè trước.', highlight: 'visited' },
            { en: 'She wrote a letter yesterday.', vi: 'Cô ấy đã viết thư hôm qua.', highlight: 'wrote' },
            { en: 'We didn\'t watch TV last night.', vi: 'Chúng tôi không xem TV tối qua.', highlight: 'didn\'t watch' },
        ],
        quiz: { question: 'He ___ to Japan last year.', options: ['go', 'goes', 'went', 'going'], answer: 'went' },
    },
    {
        id: 'present-perfect', title: 'Present Perfect', titleVi: 'Thì Hiện tại hoàn thành', emoji: '✅', level: 'B1',
        rule: 'Subject + have/has + V(past participle)',
        explanation: 'Dùng để diễn tả hành động đã xảy ra nhưng có liên quan đến hiện tại.',
        examples: [
            { en: 'I have lived here for 5 years.', vi: 'Tôi đã sống ở đây 5 năm.', highlight: 'have lived' },
            { en: 'She has already finished her work.', vi: 'Cô ấy đã hoàn thành công việc.', highlight: 'has finished' },
            { en: 'Have you ever been to Japan?', vi: 'Bạn đã từng đến Nhật Bản chưa?', highlight: 'Have you been' },
        ],
        quiz: { question: 'I ___ this movie three times.', options: ['see', 'saw', 'have seen', 'seeing'], answer: 'have seen' },
    },
    {
        id: 'conditionals', title: 'Conditionals', titleVi: 'Câu điều kiện', emoji: '🔀', level: 'B2',
        rule: 'If + condition → result',
        explanation: 'Câu điều kiện diễn tả tình huống giả định và kết quả.',
        examples: [
            { en: 'If it rains, I will stay home.', vi: 'Nếu trời mưa, tôi sẽ ở nhà. (Type 1)', highlight: 'If...will' },
            { en: 'If I had money, I would travel.', vi: 'Nếu tôi có tiền, tôi sẽ đi du lịch. (Type 2)', highlight: 'If...would' },
            { en: 'If I had studied, I would have passed.', vi: 'Nếu tôi đã học, tôi đã đỗ. (Type 3)', highlight: 'If had...would have' },
        ],
        quiz: { question: 'If I ___ rich, I would buy a house.', options: ['am', 'was', 'were', 'be'], answer: 'were' },
    },
    {
        id: 'passive-voice', title: 'Passive Voice', titleVi: 'Câu bị động', emoji: '↩️', level: 'B1',
        rule: 'Subject + be + V(past participle) + by agent',
        explanation: 'Dùng khi muốn nhấn mạnh đối tượng bị tác động thay vì người thực hiện.',
        examples: [
            { en: 'The cake was made by my mom.', vi: 'Bánh được làm bởi mẹ tôi.', highlight: 'was made' },
            { en: 'English is spoken worldwide.', vi: 'Tiếng Anh được nói trên toàn thế giới.', highlight: 'is spoken' },
            { en: 'The letter has been sent.', vi: 'Thư đã được gửi.', highlight: 'has been sent' },
        ],
        quiz: { question: 'The book ___ by millions of people.', options: ['read', 'reads', 'is read', 'reading'], answer: 'is read' },
    },
    {
        id: 'reported-speech', title: 'Reported Speech', titleVi: 'Câu tường thuật', emoji: '🗨️', level: 'B2',
        rule: 'Subject + said (that) + clause (tense shift)',
        explanation: 'Dùng để thuật lại lời nói của người khác, thường lùi thì.',
        examples: [
            { en: '"I am happy" → She said she was happy.', vi: '"Tôi vui" → Cô ấy nói cô ấy vui.', highlight: 'said...was' },
            { en: '"I will come" → He said he would come.', vi: '"Tôi sẽ đến" → Anh ấy nói sẽ đến.', highlight: 'said...would' },
            { en: '"I have finished" → She said she had finished.', vi: '"Tôi đã xong" → Cô ấy nói đã xong.', highlight: 'said...had' },
        ],
        quiz: { question: '"I like pizza" → He said he ___ pizza.', options: ['likes', 'liked', 'like', 'liking'], answer: 'liked' },
    },
    {
        id: 'relative-clauses', title: 'Relative Clauses', titleVi: 'Mệnh đề quan hệ', emoji: '🔗', level: 'B1',
        rule: 'Noun + who/which/that/where + clause',
        explanation: 'Dùng để bổ sung thông tin cho danh từ đứng trước.',
        examples: [
            { en: 'The man who lives next door is friendly.', vi: 'Người đàn ông sống cạnh nhà rất thân thiện.', highlight: 'who lives' },
            { en: 'The book which I bought is interesting.', vi: 'Cuốn sách mà tôi mua rất hay.', highlight: 'which I bought' },
            { en: 'The city where I was born is beautiful.', vi: 'Thành phố nơi tôi sinh ra rất đẹp.', highlight: 'where I was born' },
        ],
        quiz: { question: 'The girl ___ is singing is my sister.', options: ['who', 'which', 'where', 'when'], answer: 'who' },
    },
];

export default function GrammarExplainer() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [quizAnswer, setQuizAnswer] = useState(null);
    const [celebration, setCelebration] = useState(0);

    const lesson = selectedLesson !== null ? GRAMMAR_LESSONS[selectedLesson] : null;

    const handleQuiz = (option) => {
        if (quizAnswer) return;
        setQuizAnswer(option);
        if (option === lesson.quiz.answer) {
            addXP(10);
            setCelebration(c => c + 1);
        }
    };

    if (lesson) {
        return (
            <div className="page">
                <StarBurst trigger={celebration} />
                <div className="page-header">
                    <button className="page-header__back" onClick={() => { setSelectedLesson(null); setQuizAnswer(null); }}>←</button>
                    <h2 className="page-header__title">{lesson.emoji} {lesson.titleVi}</h2>
                </div>

                {/* Rule card */}
                <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)', marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '4px' }}>📐 Công thức</div>
                    <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
                        {lesson.rule}
                    </div>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', lineHeight: 1.5 }}>{lesson.explanation}</p>
                </div>

                {/* Examples */}
                <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '8px' }}>📝 Ví dụ</h3>
                    {lesson.examples.map((ex, i) => (
                        <div key={i} style={{
                            padding: '12px 16px', borderRadius: 'var(--radius-md)',
                            background: 'var(--color-card)', marginBottom: '8px', borderLeft: '4px solid var(--color-primary)',
                        }}>
                            <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                                {ex.en.split(ex.highlight).map((part, j, arr) => (
                                    <span key={j}>
                                        {part}
                                        {j < arr.length - 1 && <span style={{ color: 'var(--color-primary)', fontWeight: 800, textDecoration: 'underline' }}>{ex.highlight}</span>}
                                    </span>
                                ))}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>{ex.vi}</div>
                        </div>
                    ))}
                </div>

                {/* Quiz */}
                <div style={{ padding: '20px', borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, #3B82F610, #8B5CF610)', border: '1px solid var(--color-border)' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '12px' }}>🧠 Quiz nhanh</h3>
                    <p style={{ fontWeight: 600, marginBottom: '12px' }}>{lesson.quiz.question}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {lesson.quiz.options.map(opt => {
                            const isCorrect = opt === lesson.quiz.answer;
                            const isSelected = quizAnswer === opt;
                            return (
                                <button key={opt} onClick={() => handleQuiz(opt)} disabled={!!quizAnswer}
                                    style={{
                                        padding: '12px', border: 'none', borderRadius: 'var(--radius-md)',
                                        background: quizAnswer ? (isCorrect ? '#22C55E20' : isSelected ? '#EF444420' : 'var(--color-card)') : 'var(--color-card)',
                                        border: quizAnswer ? (isCorrect ? '2px solid #22C55E' : isSelected ? '2px solid #EF4444' : '2px solid var(--color-border)') : '2px solid var(--color-border)',
                                        fontWeight: 600, cursor: quizAnswer ? 'default' : 'pointer',
                                        color: 'var(--color-text)', transition: 'all 0.2s',
                                    }}
                                >{opt}</button>
                            );
                        })}
                    </div>
                    {quizAnswer && (
                        <div style={{ marginTop: '12px', textAlign: 'center', fontWeight: 700, color: quizAnswer === lesson.quiz.answer ? '#22C55E' : '#EF4444' }}>
                            {quizAnswer === lesson.quiz.answer ? '✅ Chính xác! +10 XP' : `❌ Đáp án đúng: ${lesson.quiz.answer}`}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">📚 Giải thích Ngữ pháp</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div style={{ display: 'grid', gap: '10px' }}>
                {GRAMMAR_LESSONS.map((lesson, i) => (
                    <button key={lesson.id} onClick={() => setSelectedLesson(i)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '16px', borderRadius: 'var(--radius-lg)',
                            background: 'var(--color-card)', border: '1px solid var(--color-border)',
                            cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                        }}
                    >
                        <span style={{ fontSize: '1.8rem' }}>{lesson.emoji}</span>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{lesson.title}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{lesson.titleVi}</div>
                        </div>
                        <span style={{
                            padding: '4px 10px', borderRadius: 'var(--radius-full)',
                            background: lesson.level === 'A1' ? '#22C55E20' : lesson.level === 'A2' ? '#3B82F620' : lesson.level === 'B1' ? '#F59E0B20' : '#EF444420',
                            color: lesson.level === 'A1' ? '#22C55E' : lesson.level === 'A2' ? '#3B82F6' : lesson.level === 'B1' ? '#F59E0B' : '#EF4444',
                            fontWeight: 700, fontSize: '0.75rem',
                        }}>{lesson.level}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ClozeExercise.jsx — Fill-in-the-blank exercises
// Core exercise type used by Duolingo, Busuu, every major language app
// Supports: single blank, multi-blank, hints, timer, scoring

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../../context/GameStateContext';
import { isAdultMode } from '../../utils/userMode';

// Built-in exercise bank — expandable via data files
const CLOZE_BANK = {
    en: [
        // A1
        { sentence: 'I ___ a student.', answer: 'am', options: ['am', 'is', 'are', 'be'], level: 'A1', topic: 'be verb' },
        { sentence: 'She ___ to school every day.', answer: 'goes', options: ['goes', 'go', 'going', 'went'], level: 'A1', topic: 'present simple' },
        { sentence: 'They ___ playing in the park.', answer: 'are', options: ['are', 'is', 'am', 'was'], level: 'A1', topic: 'present continuous' },
        { sentence: 'My mother ___ breakfast at 7 AM.', answer: 'makes', options: ['makes', 'make', 'making', 'made'], level: 'A1', topic: 'present simple' },
        { sentence: 'We ___ three cats at home.', answer: 'have', options: ['have', 'has', 'having', 'had'], level: 'A1', topic: 'have' },
        { sentence: 'The book is ___ the table.', answer: 'on', options: ['on', 'in', 'at', 'under'], level: 'A1', topic: 'prepositions' },
        { sentence: '___ you like ice cream?', answer: 'Do', options: ['Do', 'Does', 'Are', 'Is'], level: 'A1', topic: 'questions' },
        { sentence: 'He ___ not like vegetables.', answer: 'does', options: ['does', 'do', 'is', 'are'], level: 'A1', topic: 'negatives' },
        { sentence: 'There ___ many people here.', answer: 'are', options: ['are', 'is', 'am', 'be'], level: 'A1', topic: 'there is/are' },
        { sentence: 'I ___ English every day.', answer: 'study', options: ['study', 'studies', 'studying', 'studied'], level: 'A1', topic: 'present simple' },

        // A2
        { sentence: 'I have ___ been to Japan.', answer: 'never', options: ['never', 'ever', 'already', 'yet'], level: 'A2', topic: 'adverbs' },
        { sentence: 'She is ___ than her brother.', answer: 'taller', options: ['taller', 'tall', 'tallest', 'more tall'], level: 'A2', topic: 'comparatives' },
        { sentence: 'We ___ dinner when the phone rang.', answer: 'were having', options: ['were having', 'had', 'have', 'are having'], level: 'A2', topic: 'past continuous' },
        { sentence: 'You should ___ more water.', answer: 'drink', options: ['drink', 'drinks', 'drinking', 'drank'], level: 'A2', topic: 'modals' },
        { sentence: 'If it rains, I ___ stay home.', answer: 'will', options: ['will', 'would', 'can', 'am'], level: 'A2', topic: 'conditionals' },
        { sentence: 'He ___ lived here since 2020.', answer: 'has', options: ['has', 'have', 'had', 'is'], level: 'A2', topic: 'present perfect' },
        { sentence: 'They arrived ___ the airport at noon.', answer: 'at', options: ['at', 'in', 'on', 'to'], level: 'A2', topic: 'prepositions' },
        { sentence: 'This is the ___ movie I have ever seen.', answer: 'best', options: ['best', 'better', 'good', 'most good'], level: 'A2', topic: 'superlatives' },
        { sentence: 'I am looking ___ my keys.', answer: 'for', options: ['for', 'at', 'after', 'up'], level: 'A2', topic: 'phrasal verbs' },
        { sentence: 'She ___ to London last summer.', answer: 'went', options: ['went', 'goes', 'going', 'gone'], level: 'A2', topic: 'past simple' },

        // B1
        { sentence: 'By the time we arrived, the movie ___ already started.', answer: 'had', options: ['had', 'has', 'have', 'was'], level: 'B1', topic: 'past perfect' },
        { sentence: 'I wish I ___ more free time.', answer: 'had', options: ['had', 'have', 'has', 'would have'], level: 'B1', topic: 'wishes' },
        { sentence: 'The report ___ be submitted by Friday.', answer: 'must', options: ['must', 'can', 'may', 'should'], level: 'B1', topic: 'obligation' },
        { sentence: 'She asked me ___ I could help her.', answer: 'whether', options: ['whether', 'that', 'what', 'which'], level: 'B1', topic: 'reported speech' },
        { sentence: 'Despite ___ tired, he continued working.', answer: 'being', options: ['being', 'to be', 'been', 'was'], level: 'B1', topic: 'gerunds' },
        { sentence: 'The house ___ built in 1990.', answer: 'was', options: ['was', 'is', 'has', 'were'], level: 'B1', topic: 'passive voice' },
        { sentence: 'If I ___ you, I would accept the offer.', answer: 'were', options: ['were', 'am', 'was', 'be'], level: 'B1', topic: 'conditionals' },
        { sentence: 'Not only ___ he smart, but also hardworking.', answer: 'is', options: ['is', 'does', 'was', 'has'], level: 'B1', topic: 'inversion' },
        { sentence: 'The meeting has been ___ until next week.', answer: 'postponed', options: ['postponed', 'postpone', 'postponing', 'to postpone'], level: 'B1', topic: 'passive' },
        { sentence: 'She recommended ___ we leave early.', answer: 'that', options: ['that', 'to', 'for', 'if'], level: 'B1', topic: 'subjunctive' },

        // B2
        { sentence: 'Had I known about the delay, I ___ have left earlier.', answer: 'would', options: ['would', 'could', 'should', 'will'], level: 'B2', topic: 'conditionals 3' },
        { sentence: 'The data ___ to suggest a significant correlation.', answer: 'appears', options: ['appears', 'appear', 'appearing', 'appeared'], level: 'B2', topic: 'academic' },
        { sentence: 'Under no circumstances ___ this information be shared.', answer: 'should', options: ['should', 'can', 'will', 'must'], level: 'B2', topic: 'inversion' },
        { sentence: 'The phenomenon can be ___ to several factors.', answer: 'attributed', options: ['attributed', 'contributed', 'distributed', 'constituted'], level: 'B2', topic: 'collocations' },
        { sentence: 'It is ___ that more research is needed.', answer: 'evident', options: ['evident', 'evidence', 'evidently', 'evidential'], level: 'B2', topic: 'academic vocab' },
        { sentence: 'The results are ___ with previous findings.', answer: 'consistent', options: ['consistent', 'consisting', 'consisted', 'consist'], level: 'B2', topic: 'academic' },
        { sentence: 'She managed to ___ the challenges successfully.', answer: 'overcome', options: ['overcome', 'overcoming', 'overcame', 'overcomes'], level: 'B2', topic: 'infinitives' },
        { sentence: 'The project is ___ to be completed by March.', answer: 'expected', options: ['expected', 'expecting', 'expect', 'expects'], level: 'B2', topic: 'passive' },
        { sentence: 'We need to take into ___ all the variables.', answer: 'account', options: ['account', 'consideration', 'mind', 'view'], level: 'B2', topic: 'collocations' },
        { sentence: 'The policy aims to ___ economic growth.', answer: 'foster', options: ['foster', 'fostering', 'fostered', 'fosters'], level: 'B2', topic: 'academic vocab' },
    ],
    cn: [
        { sentence: '我___中国人。', answer: '是', options: ['是', '有', '在', '了'], level: 'HSK1', topic: '是 sentence' },
        { sentence: '他___说中文。', answer: '会', options: ['会', '是', '有', '在'], level: 'HSK1', topic: 'modal verbs' },
        { sentence: '我想___一杯咖啡。', answer: '喝', options: ['喝', '吃', '看', '听'], level: 'HSK1', topic: 'verbs' },
        { sentence: '她每天___上学。', answer: '都', options: ['都', '很', '也', '太'], level: 'HSK1', topic: 'adverbs' },
        { sentence: '这个苹果___好吃。', answer: '很', options: ['很', '都', '也', '没'], level: 'HSK1', topic: 'degree adverbs' },
        { sentence: '你___几个人？', answer: '家有', options: ['家有', '有家', '是有', '去有'], level: 'HSK1', topic: 'measure words' },
        { sentence: '昨天我___去了超市。', answer: '没', options: ['没', '不', '别', '了'], level: 'HSK2', topic: 'negation' },
        { sentence: '她___在看书呢。', answer: '正', options: ['正', '已', '就', '才'], level: 'HSK2', topic: 'progressive' },
        { sentence: '___你帮帮我吗？', answer: '能', options: ['能', '是', '有', '在'], level: 'HSK2', topic: 'requests' },
        { sentence: '我___来过这里。', answer: '以前', options: ['以前', '以后', '刚才', '马上'], level: 'HSK2', topic: 'time words' },
        { sentence: '如果明天___雨，我就不去了。', answer: '下', options: ['下', '上', '大', '小'], level: 'HSK3', topic: 'conditionals' },
        { sentence: '他的汉语说___很好。', answer: '得', options: ['得', '的', '地', '了'], level: 'HSK3', topic: 'complement' },
        { sentence: '这本书___我看完了。', answer: '被', options: ['被', '把', '让', '给'], level: 'HSK3', topic: 'passive' },
        { sentence: '她___学习___工作。', answer: '一边...一边', options: ['一边...一边', '又...又', '不但...而且', '虽然...但是'], level: 'HSK3', topic: 'correlatives' },
        { sentence: '___他很忙，___他还是来了。', answer: '虽然...但是', options: ['虽然...但是', '因为...所以', '如果...就', '不但...而且'], level: 'HSK3', topic: 'conjunctions' },
    ],
};

export default function ClozeExercise() {
    const { lang: urlLang, level: urlLevel } = useParams();
    const lang = urlLang || 'en';
    const level = urlLevel || null;
    const navigate = useNavigate();
    const { state, dispatch } = useGame();
    const adult = isAdultMode(state.userMode);

    const exercises = useMemo(() => {
        let pool = CLOZE_BANK[lang] || CLOZE_BANK.en;
        if (level) pool = pool.filter(e => e.level === level);
        // Shuffle
        return [...pool].sort(() => Math.random() - 0.5);
    }, [lang, level]);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [selected, setSelected] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [streak, setStreak] = useState(0);
    const inputRef = useRef(null);

    const current = exercises[currentIdx];
    const isComplete = currentIdx >= exercises.length;

    const handleSelect = useCallback((option) => {
        if (showResult) return;
        setSelected(option);
        setShowResult(true);
        const isCorrect = option === current.answer;
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1,
        }));
        setStreak(prev => isCorrect ? prev + 1 : 0);
        if (isCorrect) {
            dispatch({ type: 'ADD_XP', payload: 5 + Math.min(streak, 5) });
        }
    }, [showResult, current, streak, dispatch]);

    const handleNext = useCallback(() => {
        setCurrentIdx(prev => prev + 1);
        setSelected(null);
        setShowResult(false);
    }, []);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Enter' && showResult) handleNext();
            if (!showResult && current) {
                const idx = parseInt(e.key) - 1;
                if (idx >= 0 && idx < current.options.length) {
                    handleSelect(current.options[idx]);
                }
            }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [showResult, handleNext, handleSelect, current]);

    if (isComplete || !current) {
        const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
        return (
            <div className="page" style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                    {adult ? 'Exercise Complete!' : 'Hoàn thành!'}
                </h2>
                <div className="glass-card" style={{ display: 'inline-block', padding: '20px 40px', margin: '16px 0' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#EF4444' }}>
                        {pct}%
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                        {score.correct}/{score.total} {adult ? 'correct' : 'đúng'}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                    <button className="btn-primary" onClick={() => { setCurrentIdx(0); setScore({ correct: 0, total: 0 }); setStreak(0); setSelected(null); setShowResult(false); }}>
                        {adult ? '🔄 Retry' : '🔄 Làm lại'}
                    </button>
                    <button className="btn-secondary" onClick={() => navigate(-1)}>
                        {adult ? '← Back' : '← Quay lại'}
                    </button>
                </div>
            </div>
        );
    }

    // Render sentence with blank
    const parts = current.sentence.split('___');

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate(-1)}>←</button>
                <h2 className="page-header__title">
                    {adult ? '📝 Fill in the Blank' : '📝 Điền vào chỗ trống'}
                </h2>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    {currentIdx + 1}/{exercises.length}
                </div>
            </div>

            {/* Progress bar */}
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginBottom: '24px' }}>
                <div style={{ height: '100%', width: `${((currentIdx) / exercises.length) * 100}%`, background: 'var(--color-primary)', borderRadius: '2px', transition: 'width 0.3s' }} />
            </div>

            {/* Streak indicator */}
            {streak >= 2 && (
                <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700 }}>
                    🔥 {streak} streak! +{Math.min(streak, 5)} bonus XP
                </div>
            )}

            {/* Level & topic badges */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', justifyContent: 'center' }}>
                <span style={{ padding: '2px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}>
                    {current.level}
                </span>
                <span style={{ padding: '2px 10px', borderRadius: '8px', fontSize: '0.7rem', background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-light)' }}>
                    {current.topic}
                </span>
            </div>

            {/* Sentence with blank */}
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', marginBottom: '24px', fontSize: lang === 'cn' ? '1.4rem' : '1.15rem', lineHeight: 1.8, fontWeight: 600 }}>
                {parts[0]}
                <span style={{
                    display: 'inline-block', minWidth: '80px', padding: '4px 16px',
                    borderBottom: showResult ? 'none' : '3px solid var(--color-primary)',
                    background: showResult ? (selected === current.answer ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)') : 'rgba(129,140,248,0.1)',
                    borderRadius: '8px', margin: '0 4px',
                    color: showResult ? (selected === current.answer ? '#22C55E' : '#EF4444') : 'var(--color-primary)',
                    fontWeight: 800, transition: 'all 0.3s',
                }}>
                    {showResult ? current.answer : selected || '___'}
                </span>
                {parts[1]}
            </div>

            {/* Options grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {current.options.map((opt, i) => {
                    let bg = 'rgba(255,255,255,0.06)';
                    let border = '1px solid rgba(255,255,255,0.1)';
                    let color = 'var(--color-text)';

                    if (showResult) {
                        if (opt === current.answer) {
                            bg = 'rgba(34,197,94,0.2)'; border = '2px solid #22C55E'; color = '#22C55E';
                        } else if (opt === selected) {
                            bg = 'rgba(239,68,68,0.2)'; border = '2px solid #EF4444'; color = '#EF4444';
                        } else {
                            bg = 'rgba(255,255,255,0.03)'; color = 'var(--color-text-light)';
                        }
                    }

                    return (
                        <button key={i} onClick={() => handleSelect(opt)}
                            disabled={showResult}
                            style={{
                                padding: '14px 16px', borderRadius: '12px', background: bg,
                                border, color, fontSize: lang === 'cn' ? '1.1rem' : '0.95rem',
                                fontWeight: 600, cursor: showResult ? 'default' : 'pointer',
                                transition: 'all 0.2s', textAlign: 'center',
                                opacity: showResult && opt !== current.answer && opt !== selected ? 0.4 : 1,
                            }}>
                            <span style={{ fontSize: '0.65rem', opacity: 0.5, marginRight: '6px' }}>{i + 1}</span>
                            {opt}
                            {showResult && opt === current.answer && ' ✓'}
                        </button>
                    );
                })}
            </div>

            {/* Next button */}
            {showResult && (
                <div style={{ textAlign: 'center' }}>
                    <button className="btn-primary" onClick={handleNext}
                        style={{ padding: '12px 40px', fontSize: '1rem', borderRadius: '12px' }}>
                        {currentIdx + 1 >= exercises.length
                            ? (adult ? '🏁 See Results' : '🏁 Xem kết quả')
                            : (adult ? 'Next →' : 'Tiếp →')}
                    </button>
                    <p style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '6px' }}>
                        {adult ? 'Press Enter ↵' : 'Nhấn Enter ↵'}
                    </p>
                </div>
            )}

            {/* Score bar */}
            <div style={{
                position: 'fixed', bottom: '70px', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(8px)',
                padding: '8px 20px', borderRadius: '20px', fontSize: '0.8rem',
                display: 'flex', gap: '16px', border: '1px solid rgba(255,255,255,0.1)',
            }}>
                <span>✅ {score.correct}</span>
                <span>❌ {score.total - score.correct}</span>
                <span>📊 {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%</span>
            </div>
        </div>
    );
}

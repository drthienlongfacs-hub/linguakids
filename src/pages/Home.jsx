import { Link } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import { useGame } from '../context/GameStateContext';
import MascotBuddy from '../components/MascotBuddy';
const WordOfDay = lazy(() => import('../components/WordOfDay'));
import { isAdultMode } from '../utils/userMode';
import { getDailyQuote, getDailyFallbackQuote } from '../services/quoteService';
import { getXPData } from '../services/xpEngine';

const LEARNING_TIPS = [
    { emoji: '💡', en: 'Review words before bed — your brain consolidates memories during sleep!', vi: 'Ôn từ trước khi ngủ — não ghi nhớ tốt hơn khi ngủ!' },
    { emoji: '🎧', en: 'Shadowing improves pronunciation by 40% in 8 weeks.', vi: 'Bắt chước (shadowing) cải thiện phát âm 40% trong 8 tuần!' },
    { emoji: '📖', en: 'Reading 15 min daily expands vocabulary 3x faster.', vi: 'Đọc 15 phút mỗi ngày giúp mở rộng từ vựng gấp 3!' },
    { emoji: '🗣️', en: 'Active recall is 5x more effective than passive reading.', vi: 'Nhớ chủ động hiệu quả gấp 5 lần đọc thầm!' },
    { emoji: '🔥', en: 'Consistency beats intensity. 15 min/day > 2 hours/week.', vi: '15 phút mỗi ngày tốt hơn 2 giờ mỗi tuần!' },
    { emoji: '🧠', en: 'FSRS gives 90%+ retention vs 20% cramming.', vi: 'Ôn giãn cách (FSRS) giúp nhớ 90% so với 20% nhồi!' },
];

export default function Home() {
    const { state, currentLevel, levelProgress, nextLevel, getDailyStats, toggleMode, modeConfig } = useGame();
    const dailyStats = getDailyStats();
    const isAdult = isAdultMode(state.userMode);
    const xpData = getXPData();

    // Live daily quote from Quotable API
    const [dailyQuote, setDailyQuote] = useState(null);
    useEffect(() => {
        getDailyQuote().then(setDailyQuote).catch(() => { });
    }, []);

    // Dark mode toggle
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('linguakids-dark');
        if (saved !== null) return saved === 'true';
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches || false;
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark-mode', isDark);
        localStorage.setItem('linguakids-dark', String(isDark));
    }, [isDark]);

    const greetingByTime = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Chào buổi sáng';
        if (h < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    const userName = isAdult
        ? (state.childName || 'bạn')
        : (state.childName || 'bạn nhỏ');

    // SVG circular progress ring
    const radius = 32, stroke = 6;
    const normalizedRadius = radius - stroke / 2;
    const circumference = 2 * Math.PI * normalizedRadius;
    const strokeDashoffset = circumference - (dailyStats.progress / 100) * circumference;

    const skills = [
        { to: '/placement', icon: '📝', title: isAdult ? 'Placement Test' : 'Kiểm tra trình độ', desc: isAdult ? `Level ${xpData.level} · ${xpData.totalXP} XP` : 'Kiểm tra trình độ A1→C1', theme: 'exam' },
        { to: '/english', icon: '🇬🇧', title: isAdult ? 'English' : 'Tiếng Anh', desc: `${state.englishWordsLearned} từ đã học`, theme: 'english' },
        { to: '/chinese', icon: '🇨🇳', title: isAdult ? '中文 Chinese' : 'Tiếng Trung', desc: `${state.chineseWordsLearned} từ đã học`, theme: 'chinese' },
        { to: '/listening', icon: '🎧', title: isAdult ? 'Listening Practice' : 'Luyện Nghe', desc: isAdult ? 'Audio, dictation, IELTS quiz' : 'Nghe, chính tả, trắc nghiệm', theme: 'listening' },
        { to: '/speaking', icon: '🗣️', title: isAdult ? 'Speaking Practice' : 'Luyện Nói', desc: isAdult ? 'Shadowing, IELTS speaking' : 'Bắt chước, ghi âm', theme: 'speaking' },
        { to: '/reading', icon: '📖', title: isAdult ? 'Reading Practice' : 'Luyện Đọc', desc: isAdult ? 'Passages, vocabulary' : 'Bài đọc, từ vựng', theme: 'reading' },
        { to: '/writing', icon: '✍️', title: isAdult ? 'Writing Practice' : 'Luyện Viết', desc: isAdult ? 'Essays, grammar clinic' : 'Viết bài, sửa câu', theme: 'writing' },
        { to: '/grammar', icon: '📐', title: isAdult ? 'Grammar' : 'Ngữ pháp', desc: isAdult ? 'Tenses, conditionals, passive' : 'Thì, câu điều kiện', theme: 'grammar' },
        { to: '/games', icon: isAdult ? '🧩' : '🎮', title: isAdult ? 'Luyện tập' : 'Trò chơi', desc: isAdult ? 'Quiz, ghép câu, viết chữ' : 'Vừa chơi vừa học!', theme: 'games' },
        { to: '/vocabulary', icon: '📊', title: isAdult ? 'Vocabulary' : 'Từ vựng', desc: isAdult ? 'FSRS review, mastery tracking' : 'Ôn tập, theo dõi từ vựng', theme: 'vocabulary' },
    ];

    if (isAdult) {
        skills.push(
            { to: '/roadmap', icon: '🗺️', title: 'Study Roadmap', desc: 'IELTS 7.5 & HSK 3 plan', theme: 'roadmap' },
            { to: '/conversation-ai', icon: '🤖', title: 'AI Conversation', desc: '5 real-life scenarios', theme: 'writing' },
            { to: '/cloze/en', icon: '📝', title: 'Fill in Blanks', desc: 'Grammar A1→B2', theme: 'grammar' },
            { to: '/ielts-sim', icon: '🎯', title: 'IELTS Simulator', desc: 'Reading, Writing, Speaking', theme: 'exam' },
            { to: '/hsk-sim', icon: '🏮', title: 'HSK 3 Mock Exam', desc: 'Listening, Reading, Writing', theme: 'exam' },
            { to: '/exam-prep', icon: '📊', title: 'Exam Prep Center', desc: 'IELTS · TOEIC · TOEFL', theme: 'exam' },
        );
    }

    return (
        <div className="page">
            {/* Premium Hero Header */}
            <div className="home-hero">
                <div className="streak-display">
                    <span className="streak-fire" style={{ fontSize: state.streak >= 7 ? '1.5rem' : '1.2rem' }}>
                        {state.streak >= 7 ? '🔥🔥' : '🔥'}
                    </span>
                    <span>{state.streak} ngày</span>
                </div>
                <button className="mode-toggle" onClick={toggleMode} title="Chuyển chế độ">
                    {isAdult ? '🧒 Chế độ Bé' : '🧑 Người lớn'}
                </button>
                <button
                    className="mode-toggle"
                    onClick={() => setIsDark(d => !d)}
                    title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
                    style={{ marginLeft: '6px' }}
                >
                    {isDark ? '☀️' : '🌙'}
                </button>
                <Link to="/settings" className="mode-toggle" title="Cài đặt" style={{ marginLeft: '6px' }}>
                    ⚙️
                </Link>
                <div className="home-hero__badges">
                    <div className="coin-badge">🪙 {state.xp}</div>
                    <div className="xp-badge">⭐ {state.xp} XP</div>
                </div>
            </div>

            {/* Level bar with glassmorphism */}
            <div className="level-badge glass-card" style={{ marginBottom: '16px', padding: '10px 16px' }}>
                <div className="level-badge__icon">{currentLevel.emoji}</div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                        {currentLevel.title}
                    </div>
                    <div className="progress-bar" style={{ height: '8px', marginTop: '4px' }}>
                        <div className="progress-bar__fill" style={{ width: `${levelProgress}%` }} />
                    </div>
                </div>
                {nextLevel && (
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', textAlign: 'right' }}>
                        {nextLevel.emoji}<br />{state.xp}/{nextLevel.xpNeeded}
                    </div>
                )}
            </div>

            {/* Daily Challenge banner */}
            <Link to="/daily-challenge" style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 16px', borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, #F59E0B20, #EF444420)',
                border: '1px solid #F59E0B40', marginBottom: '16px',
                textDecoration: 'none', color: 'var(--color-text)',
                transition: 'transform var(--transition-fast)',
            }}>
                <span style={{ fontSize: '1.8rem' }}>🎯</span>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
                        Thử thách hôm nay
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        Hoàn thành 5 câu hỏi → +50 XP ⭐
                    </div>
                </div>
                <span style={{ marginLeft: 'auto', fontSize: '1.2rem' }}>➤</span>
            </Link>

            {/* 🎓 AI Teacher Suite — prominent access */}
            <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    🎓 AI Teacher Suite
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', fontWeight: 400 }}>— Giáo viên AI</span>
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                        { emoji: '🎙️', title: 'Phát âm', desc: 'AI chấm điểm', path: '/pronunciation/en', bg: 'linear-gradient(135deg, #0891B220, #06B6D420)' },
                        { emoji: '📐', title: 'Ngữ pháp', desc: '8 bài A1→B2', path: '/grammar-explainer', bg: 'linear-gradient(135deg, #7C3AED20, #8B5CF620)' },
                        { emoji: '🎧', title: 'Chính tả', desc: 'Nghe → Gõ', path: '/dictation/en', bg: 'linear-gradient(135deg, #3B82F620, #6366F120)' },
                        { emoji: '📖', title: 'Đọc hiểu', desc: '4 bài A2→B2', path: '/reading', bg: 'linear-gradient(135deg, #10B98120, #22C55E20)' },
                        { emoji: '📊', title: 'Thống kê', desc: 'XP & kỹ năng', path: '/study-stats', bg: 'linear-gradient(135deg, #F59E0B20, #EAB30820)' },
                        { emoji: '🎮', title: 'Trò chơi', desc: '12 loại game', path: '/games', bg: 'linear-gradient(135deg, #EC489920, #F4389920)' },
                    ].map(item => (
                        <Link key={item.path} to={item.path} style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 14px', borderRadius: 'var(--radius-lg)',
                            background: item.bg, border: '1px solid var(--color-border)',
                            textDecoration: 'none', color: 'var(--color-text)',
                            transition: 'transform 0.15s',
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>{item.emoji}</span>
                            <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}>{item.title}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)' }}>{item.desc}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Word of the Day */}
            <Suspense fallback={null}>
                <WordOfDay />
            </Suspense>

            {/* Mascot — hidden in adult mode */}
            {!isAdult && <MascotBuddy message={`${greetingByTime()}, ${userName}! 🎉`} />}

            {/* Adult mode greeting */}
            {isAdult && (
                <div style={{
                    textAlign: 'center', margin: '16px 0',
                    fontFamily: 'var(--font-display)', fontSize: '1.2rem',
                    color: 'var(--color-text)',
                }}>
                    {greetingByTime()}, {userName}! 👋
                </div>
            )}

            {/* Daily Progress Card — Premium */}
            <div className={`daily-progress-card ${isAdult ? 'daily-progress-card--adult' : 'daily-progress-card--kids'}`}>
                <div style={{ position: 'relative', width: radius * 2, height: radius * 2, flexShrink: 0 }}>
                    <svg width={radius * 2} height={radius * 2} style={{ transform: 'rotate(-90deg)' }}>
                        <circle stroke={isAdult ? 'rgba(148,163,184,0.15)' : '#E5E7EB'} fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius} />
                        <circle
                            stroke={dailyStats.goalReached ? '#10B981' : (isAdult ? '#818CF8' : '#8B5CF6')}
                            fill="transparent" strokeWidth={stroke} r={normalizedRadius} cx={radius} cy={radius}
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                    </svg>
                    <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: dailyStats.goalReached ? '1.3rem' : '0.85rem', fontWeight: 700,
                        color: dailyStats.goalReached ? '#10B981' : (isAdult ? '#818CF8' : '#8B5CF6'),
                    }}>
                        {dailyStats.goalReached ? '✓' : `${dailyStats.totalToday}/${dailyStats.goal}`}
                    </div>
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: isAdult ? 'var(--color-text)' : '#1E1B4B' }}>
                        {dailyStats.goalReached
                            ? (isAdult ? 'Đã đạt mục tiêu! ✓' : 'Đạt mục tiêu hôm nay! 🎉')
                            : 'Mục tiêu hôm nay'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                        {dailyStats.wordsLearned} từ mới · {dailyStats.wordsReviewed} ôn tập
                    </div>
                </div>
            </div>

            {/* Review card — show if words due */}
            {dailyStats.wordsForReview > 0 && (
                <Link to="/review" style={{ textDecoration: 'none' }}>
                    <div className="animate-pop-in" style={{
                        background: isAdult
                            ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                            : 'linear-gradient(135deg, #7C3AED, #EC4899)',
                        borderRadius: 'var(--radius-xl)', padding: '14px 20px', marginBottom: '16px',
                        display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer',
                        color: 'white', boxShadow: isAdult ? '0 4px 12px rgba(99,102,241,0.3)' : '0 4px 12px rgba(124,58,237,0.3)',
                    }}>
                        <div style={{ fontSize: '2rem' }}>{isAdult ? '📝' : '🧠'}</div>
                        <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>
                                {isAdult ? 'Ôn tập' : 'Ôn tập ngay!'}
                            </div>
                            <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                                {dailyStats.wordsForReview} từ cần ôn hôm nay
                            </div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.3rem' }}>▶️</div>
                    </div>
                </Link>
            )}

            {/* Weak Area Recommendation */}
            {(() => {
                const skillMap = {
                    listening: { icon: '🎧', title: isAdult ? 'Listening' : 'Nghe', to: '/listening' },
                    reading: { icon: '📖', title: isAdult ? 'Reading' : 'Đọc', to: '/reading' },
                    writing: { icon: '✍️', title: isAdult ? 'Writing' : 'Viết', to: '/writing' },
                    speaking: { icon: '🗣️', title: isAdult ? 'Speaking' : 'Nói', to: '/speaking' },
                    grammar: { icon: '📐', title: isAdult ? 'Grammar' : 'Ngữ pháp', to: '/grammar' },
                    vocabulary: { icon: '📚', title: isAdult ? 'Vocabulary' : 'Từ vựng', to: '/vocabulary' },
                };
                const scores = state.skillScores || {};
                const entries = Object.entries(scores).filter(([k]) => skillMap[k]);
                if (entries.length === 0) return null;
                const [weakKey, weakVal] = entries.reduce((min, cur) => cur[1] < min[1] ? cur : min);
                const weak = skillMap[weakKey];
                if (!weak || weakVal >= 80) return null; // Don't show if all scores are high

                // Show placement test CTA if not completed
                if (!state.placementCompleted) {
                    return (
                        <Link to="/placement" style={{ textDecoration: 'none' }}>
                            <div className="glass-card animate-pop-in" style={{
                                padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                                cursor: 'pointer', border: '1.5px solid rgba(99,102,241,0.3)',
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
                            }}>
                                <div style={{ fontSize: '1.6rem' }}>📝</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {isAdult ? 'Take your Placement Test' : 'Kiểm tra trình độ'}
                                    </div>
                                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                                        {isAdult ? 'Get personalized content for your level' : 'Để nhận nội dung phù hợp với bạn'}
                                    </div>
                                </div>
                                <div style={{ fontSize: '1.1rem' }}>→</div>
                            </div>
                        </Link>
                    );
                }

                return (
                    <Link to={weak.to} style={{ textDecoration: 'none' }}>
                        <div className="glass-card animate-pop-in" style={{
                            padding: '14px 18px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px',
                            cursor: 'pointer', border: '1.5px solid rgba(245,158,11,0.3)',
                            background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(249,115,22,0.05))',
                        }}>
                            <div style={{ fontSize: '1.6rem' }}>{weak.icon}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {isAdult ? `Focus: ${weak.title}` : `Cần luyện: ${weak.title}`}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                                    {isAdult
                                        ? `Your weakest area — score ${weakVal}%`
                                        : `Kỹ năng yếu nhất — ${weakVal}%`}
                                </div>
                            </div>
                            <div style={{ fontSize: '1.1rem' }}>→</div>
                        </div>
                    </Link>
                );
            })()}

            {/* Daily Tip + Live Quote */}
            {(() => {
                const tip = LEARNING_TIPS[Math.floor(Date.now() / 86400000) % LEARNING_TIPS.length];
                return (
                    <>
                        {dailyQuote && (
                            <div className="daily-tip-card glass-card" style={{ marginBottom: 8 }}>
                                <span className="daily-tip-emoji">💬</span>
                                <div className="daily-tip-text">
                                    <strong>{isAdult ? 'Quote of the Day' : 'Câu nói hay'}</strong>
                                    <p>"{dailyQuote.content}"</p>
                                    <p style={{ fontSize: '0.72rem', fontStyle: 'italic', opacity: 0.7, marginTop: 2 }}>— {dailyQuote.author}</p>
                                </div>
                            </div>
                        )}
                        <div className="daily-tip-card glass-card">
                            <span className="daily-tip-emoji">{tip.emoji}</span>
                            <div className="daily-tip-text">
                                <strong>{isAdult ? 'Learning Tip' : 'Mẹo học tập'}</strong>
                                <p>{isAdult ? tip.en : tip.vi}</p>
                            </div>
                        </div>
                    </>
                );
            })()}

            {/* Section Title */}
            <h2 className="section-title">
                <span className="section-title__emoji">📚</span>
                {isAdult ? 'Chọn kỹ năng' : 'Hôm nay học gì nào?'}
            </h2>

            {/* Premium Skills Grid with Scroll Reveal */}
            <div className="skills-grid">
                {skills.map((skill, i) => (
                    <Link key={skill.to} to={skill.to} style={{ textDecoration: 'none' }}>
                        <div className={`skill-card skill-card--${skill.theme} reveal`} style={{ animationDelay: `${i * 0.06}s` }}>
                            <div className="skill-card__icon">{skill.icon}</div>
                            <div className="skill-card__info">
                                <div className="skill-card__title" style={{ color: 'var(--color-text)' }}>{skill.title}</div>
                                <div className="skill-card__desc">{skill.desc}</div>
                            </div>
                            <div className="skill-card__arrow">→</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Stats mini-row */}
            <div className="stats-row" style={{ marginTop: '24px' }}>
                <div className="stat-card glass-card">
                    <div className="stat-card__value">{state.wordsLearned.length}</div>
                    <div className="stat-card__label">Từ đã học</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-card__value">{state.gamesPlayed}</div>
                    <div className="stat-card__label">{isAdult ? 'Bài tập' : 'Trận chơi'}</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-card__value">{state.unlockedBadges?.length || 0}</div>
                    <div className="stat-card__label">{isAdult ? 'Thành tích' : 'Huy chương'}</div>
                </div>
            </div>
        </div>
    );
}

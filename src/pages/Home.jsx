import { Link } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import MascotBuddy from '../components/MascotBuddy';
import { isAdultMode } from '../utils/userMode';

export default function Home() {
    const { state, currentLevel, levelProgress, nextLevel, getDailyStats, toggleMode, modeConfig } = useGame();
    const dailyStats = getDailyStats();
    const isAdult = isAdultMode(state.userMode);

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
        { to: '/english', icon: '🇬🇧', title: isAdult ? 'English' : 'Tiếng Anh', desc: `${state.englishWordsLearned} từ đã học`, theme: 'english' },
        { to: '/chinese', icon: '🇨🇳', title: isAdult ? '中文 Chinese' : 'Tiếng Trung', desc: `${state.chineseWordsLearned} từ đã học`, theme: 'chinese' },
        { to: '/listening', icon: '🎧', title: isAdult ? 'Listening Practice' : 'Luyện Nghe', desc: isAdult ? 'Audio, dictation, IELTS quiz' : 'Nghe, chính tả, trắc nghiệm', theme: 'listening' },
        { to: '/speaking', icon: '🗣️', title: isAdult ? 'Speaking Practice' : 'Luyện Nói', desc: isAdult ? 'Shadowing, IELTS speaking' : 'Bắt chước, ghi âm', theme: 'speaking' },
        { to: '/reading', icon: '📖', title: isAdult ? 'Reading Practice' : 'Luyện Đọc', desc: isAdult ? 'Passages, vocabulary' : 'Bài đọc, từ vựng', theme: 'reading' },
        { to: '/writing', icon: '✍️', title: isAdult ? 'Writing Practice' : 'Luyện Viết', desc: isAdult ? 'Essays, grammar clinic' : 'Viết bài, sửa câu', theme: 'writing' },
        { to: '/grammar', icon: '📐', title: isAdult ? 'Grammar' : 'Ngữ pháp', desc: isAdult ? 'Tenses, conditionals, passive' : 'Thì, câu điều kiện', theme: 'grammar' },
        { to: '/games', icon: isAdult ? '🧩' : '🎮', title: isAdult ? 'Luyện tập' : 'Trò chơi', desc: isAdult ? 'Quiz, ghép câu, viết chữ' : 'Vừa chơi vừa học!', theme: 'games' },
    ];

    if (isAdult) {
        skills.push(
            { to: '/roadmap', icon: '🗺️', title: 'Study Roadmap', desc: 'IELTS 7.5 & HSK 3 plan', theme: 'roadmap' },
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

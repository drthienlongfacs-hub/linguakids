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

    return (
        <div className="page">
            {/* Header with streak, XP & mode toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div className="streak-display">
                    <span className="streak-fire" style={{ fontSize: state.streak >= 7 ? '1.5rem' : '1.2rem' }}>
                        {state.streak >= 7 ? '🔥🔥' : '🔥'}
                    </span>
                    <span>{state.streak} ngày</span>
                </div>
                <button className="mode-toggle" onClick={toggleMode} title="Chuyển chế độ">
                    {isAdult ? '🧒 Chế độ Bé' : '🧑 Người lớn'}
                </button>
                <div className="xp-badge">⭐ {state.xp} XP</div>
            </div>

            {/* Level bar */}
            <div className="level-badge" style={{ marginBottom: '16px' }}>
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

            {/* Daily Progress Card */}
            <div style={{
                background: isAdult
                    ? 'rgba(99, 102, 241, 0.1)'
                    : 'linear-gradient(135deg, #EEF2FF, #FDF4FF)',
                borderRadius: '16px', padding: '16px',
                marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '16px',
                border: isAdult ? '1px solid rgba(129, 140, 248, 0.2)' : '2px solid #E0E7FF',
            }}>
                {/* Circular progress */}
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
                        borderRadius: '16px', padding: '14px 20px', marginBottom: '16px',
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

            {/* Language cards */}
            <h2 style={{ textAlign: 'center', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                {isAdult ? 'Chọn ngôn ngữ' : 'Hôm nay học gì nào? 📚'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* English card */}
                <Link to="/english" style={{ textDecoration: 'none' }}>
                    <div className="card card--english" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3.5rem' }}>🇬🇧</div>
                        <div>
                            <h3 style={{ color: 'var(--color-english)', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                                {isAdult ? 'English' : 'Tiếng Anh'}
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>
                                {state.englishWordsLearned} từ đã học
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>▶️</div>
                    </div>
                </Link>

                {/* Chinese card */}
                <Link to="/chinese" style={{ textDecoration: 'none' }}>
                    <div className="card card--chinese" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3.5rem' }}>🇨🇳</div>
                        <div>
                            <h3 style={{ color: 'var(--color-chinese)', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                                {isAdult ? '中文 Chinese' : 'Tiếng Trung'}
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>
                                {state.chineseWordsLearned} từ đã học
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>▶️</div>
                    </div>
                </Link>

                {/* Listening card — NEW */}
                <Link to="/listening" style={{ textDecoration: 'none' }}>
                    <div className="card card--listening" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3.5rem' }}>🎧</div>
                        <div>
                            <h3 style={{ color: '#6366F1', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                                {isAdult ? 'Listening Practice' : 'Luyện Nghe'}
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>
                                {isAdult ? 'Audio, dictation, IELTS quiz' : 'Nghe, chính tả, trắc nghiệm'}
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>▶️</div>
                    </div>
                </Link>

                {/* Speaking card */}
                <Link to="/speaking" style={{ textDecoration: 'none' }}>
                    <div className="card card--speaking" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3.5rem' }}>🗣️</div>
                        <div>
                            <h3 style={{ color: '#EC4899', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                                {isAdult ? 'Speaking Practice' : 'Luyện Nói'}
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>
                                {isAdult ? 'Shadowing, IELTS speaking, voice recording' : 'Bắt chước, ghi âm, phỏng vấn'}
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>▶️</div>
                    </div>
                </Link>

                {/* Reading card */}
                <Link to="/reading" style={{ textDecoration: 'none' }}>
                    <div className="card card--reading" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3.5rem' }}>📖</div>
                        <div>
                            <h3 style={{ color: '#10B981', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                                {isAdult ? 'Reading Practice' : 'Luyện Đọc'}
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>
                                {isAdult ? 'Passages, IELTS questions, vocabulary' : 'Bài đọc, trắc nghiệm, từ vựng'}
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>▶️</div>
                    </div>
                </Link>

                {/* Writing card */}
                <Link to="/writing" style={{ textDecoration: 'none' }}>
                    <div className="card card--writing" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3.5rem' }}>✍️</div>
                        <div>
                            <h3 style={{ color: '#F59E0B', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                                {isAdult ? 'Writing Practice' : 'Luyện Viết'}
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>
                                {isAdult ? 'IELTS essays, email, grammar clinic' : 'Viết bài, sửa câu'}
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>▶️</div>
                    </div>
                </Link>

                {/* Grammar card */}
                <Link to="/grammar" style={{ textDecoration: 'none' }}>
                    <div className="card card--grammar" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3.5rem' }}>📐</div>
                        <div>
                            <h3 style={{ color: '#8B5CF6', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                                {isAdult ? 'Grammar' : 'Ngữ pháp'}
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>
                                {isAdult ? 'Tenses, conditionals, passive, reported speech' : 'Thì, câu điều kiện, bị động'}
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>▶️</div>
                    </div>
                </Link>

                {/* Exam Prep card — adults only */}
                {isAdult && (
                    <Link to="/exam-prep" style={{ textDecoration: 'none' }}>
                        <div className="card card--exam" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                            <div style={{ fontSize: '3.5rem' }}>🎯</div>
                            <div>
                                <h3 style={{ color: '#EF4444', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                                    Exam Prep Center
                                </h3>
                                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>
                                    IELTS · TOEIC · TOEFL — Study plans & mock tests
                                </p>
                            </div>
                            <div style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>▶️</div>
                        </div>
                    </Link>
                )}

                {/* Games card */}
                <Link to="/games" style={{ textDecoration: 'none' }}>
                    <div className="card card--game" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3.5rem' }}>{isAdult ? '🧩' : '🎮'}</div>
                        <div>
                            <h3 style={{ color: '#8B5CF6', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                                {isAdult ? 'Luyện tập' : 'Trò chơi'}
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>
                                {isAdult ? 'Quiz, ghép câu, viết chữ' : 'Vừa chơi vừa học nào!'}
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>▶️</div>
                    </div>
                </Link>
            </div>

            {/* Stats mini-row */}
            <div className="stats-row" style={{ marginTop: '24px' }}>
                <div className="stat-card">
                    <div className="stat-card__value">{state.wordsLearned.length}</div>
                    <div className="stat-card__label">Từ đã học</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__value">{state.gamesPlayed}</div>
                    <div className="stat-card__label">{isAdult ? 'Bài tập' : 'Trận chơi'}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__value">{state.unlockedBadges?.length || 0}</div>
                    <div className="stat-card__label">{isAdult ? 'Thành tích' : 'Huy chương'}</div>
                </div>
            </div>
        </div>
    );
}

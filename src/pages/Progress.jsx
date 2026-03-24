// Progress — Premium Parent Dashboard + Analytics
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { isAdultMode } from '../utils/userMode';

export default function Progress() {
    const navigate = useNavigate();
    const {
        state,
        currentLevel,
        nextLevel,
        levelProgress,
        unlockedBadges,
        lockedBadges,
        levels,
        modeConfig,
    } = useGame();

    const isAdult = isAdultMode(state.userMode);

    // Generate last 7 days for streak calendar
    const streakCalendar = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
        const isToday = i === 6;
        const isActive = i >= 7 - state.streak;
        return { dayName, isToday, isActive, date: d.getDate() };
    });

    // CEFR Level Estimator
    const totalWords = state.wordsLearned.length;
    const quizzes = state.gamesPlayed;
    const cefrLevel = totalWords >= 150 && quizzes >= 30 ? 'A2'
        : totalWords >= 80 && quizzes >= 15 ? 'A1'
            : totalWords >= 30 ? 'Pre-A1'
                : 'Starter';

    const cefrColors = {
        'Starter': '#94A3B8',
        'Pre-A1': '#F59E0B',
        'A1': '#3B82F6',
        'A2': '#10B981',
    };

    // Skill breakdown (approximate from data)
    const skills = [
        { name: isAdult ? 'Vocabulary' : 'Từ vựng', value: Math.min(100, totalWords / 1.5), emoji: '📚', color: '#3B82F6' },
        { name: isAdult ? 'Listening' : 'Nghe', value: Math.min(100, quizzes * 3), emoji: '🎧', color: '#6366F1' },
        { name: isAdult ? 'Speaking' : 'Nói', value: Math.min(100, quizzes * 2), emoji: '🗣️', color: '#EC4899' },
        { name: isAdult ? 'Reading' : 'Đọc', value: Math.min(100, totalWords / 2), emoji: '📖', color: '#10B981' },
        { name: isAdult ? 'Grammar' : 'Ngữ pháp', value: Math.min(100, quizzes * 4), emoji: '📐', color: '#8B5CF6' },
    ];

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">📊 {isAdult ? 'Dashboard' : 'Tiến bộ'}</h2>
                <div className="home-hero__badges">
                    <div className="coin-badge">🪙 {state.coins || 0}</div>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
            </div>

            {/* CEFR Level Estimator */}
            <div className="glass-card" style={{
                padding: '20px', textAlign: 'center', marginBottom: '16px',
                background: `linear-gradient(135deg, ${cefrColors[cefrLevel]}22, ${cefrColors[cefrLevel]}08)`,
                border: `2px solid ${cefrColors[cefrLevel]}33`,
            }}>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-light)', marginBottom: '8px' }}>
                    {isAdult ? 'ESTIMATED CEFR LEVEL' : 'CẤP ĐỘ ƯỚC TÍNH'}
                </div>
                <div style={{
                    fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 700,
                    color: cefrColors[cefrLevel],
                }}>
                    {cefrLevel}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                    {totalWords} {isAdult ? 'words' : 'từ'} · {quizzes} {isAdult ? 'quizzes' : 'bài tập'}
                </div>
            </div>

            {/* Level display */}
            <div className="glass-card" style={{
                padding: '24px', textAlign: 'center', marginBottom: '16px',
            }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>{currentLevel.emoji}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                    {currentLevel.title}
                </h3>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '12px' }}>
                    {isAdult ? `Level ${currentLevel.level}` : `Cấp ${currentLevel.level}`} · {state.xp} XP
                </p>
                {nextLevel && (
                    <>
                        <div className="progress-bar" style={{ height: '10px' }}>
                            <div className="progress-bar__fill" style={{ width: `${levelProgress}%` }} />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '8px' }}>
                            {isAdult
                                ? `${nextLevel.xpNeeded - state.xp} XP to ${nextLevel.title}`
                                : `Còn ${nextLevel.xpNeeded - state.xp} XP để lên ${nextLevel.emoji} ${nextLevel.title}`}
                        </p>
                    </>
                )}
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card glass-card">
                    <div className="stat-card__value">{state.englishWordsLearned}</div>
                    <div className="stat-card__label">🇬🇧 {isAdult ? 'English' : 'Anh'}</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-card__value">{state.chineseWordsLearned}</div>
                    <div className="stat-card__label">🇨🇳 {isAdult ? 'Chinese' : 'Trung'}</div>
                </div>
                <div className="stat-card glass-card">
                    <div className="stat-card__value">{state.coins || 0}</div>
                    <div className="stat-card__label">🪙 {isAdult ? 'Coins' : 'Xu'}</div>
                </div>
            </div>

            {/* Skill Breakdown — Bar Chart */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '12px' }}>
                    {isAdult ? '📊 Skill Breakdown' : '📊 Kỹ năng'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {skills.map(s => (
                        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '1.2rem', width: '28px', textAlign: 'center' }}>{s.emoji}</span>
                            <span style={{ width: '70px', fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text)' }}>{s.name}</span>
                            <div style={{ flex: 1, height: '12px', borderRadius: '99px', background: '#F1F5F9', overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%', borderRadius: '99px', background: s.color,
                                    width: `${Math.max(4, s.value)}%`, transition: 'width 0.8s ease',
                                }} />
                            </div>
                            <span style={{ width: '36px', fontSize: '0.75rem', fontWeight: 700, color: s.color, textAlign: 'right' }}>
                                {Math.round(s.value)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Streak calendar */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="streak-fire" style={{ fontSize: state.streak >= 7 ? '1.5rem' : '1.2rem' }}>
                        {state.streak >= 7 ? '🔥🔥' : '🔥'}
                    </span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                        {state.streak} {isAdult ? 'day streak' : 'ngày liên tiếp'}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {streakCalendar.map((day, i) => (
                        <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{
                                fontSize: '0.7rem', fontWeight: 600,
                                color: day.isToday ? 'var(--color-primary)' : 'var(--color-text-light)',
                                marginBottom: '6px',
                            }}>
                                {day.dayName}
                            </div>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto', fontSize: '0.85rem', fontWeight: 700,
                                background: day.isActive
                                    ? 'var(--gradient-gold)'
                                    : day.isToday ? '#F0F0FF' : '#F5F5F5',
                                color: day.isActive ? 'white' : 'var(--color-text-light)',
                                border: day.isToday && !day.isActive ? '2px solid var(--color-primary)' : 'none',
                            }}>
                                {day.isActive ? '🔥' : day.date}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Badges */}
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px' }}>
                🏅 {isAdult ? 'Achievements' : 'Huy chương'} ({unlockedBadges.length}/{unlockedBadges.length + lockedBadges.length})
            </h3>
            <div className="badge-grid">
                {unlockedBadges.map(badge => (
                    <div key={badge.id} className="badge-item unlocked">
                        <div className="badge-item__icon">{badge.emoji}</div>
                        <div className="badge-item__name">{badge.title}</div>
                    </div>
                ))}
                {lockedBadges.map(badge => (
                    <div key={badge.id} className="badge-item locked">
                        <div className="badge-item__icon">🔒</div>
                        <div className="badge-item__name">{badge.title}</div>
                    </div>
                ))}
            </div>

            {/* Level roadmap */}
            <h3 style={{ fontFamily: 'var(--font-display)', marginTop: '32px', marginBottom: '16px' }}>
                🗺️ {isAdult ? 'Journey Map' : 'Hành trình'}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {levels.map((lvl) => {
                    const isCurrentLevel = lvl.level === currentLevel.level;
                    const isUnlocked = state.xp >= lvl.xpNeeded;
                    return (
                        <div key={lvl.level} className="glass-card" style={{
                            display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
                            background: isCurrentLevel ? '#F0F0FF' : undefined,
                            border: isCurrentLevel ? '2px solid var(--color-primary)' : undefined,
                            opacity: isUnlocked ? 1 : 0.5,
                        }}>
                            <span style={{ fontSize: '1.5rem' }}>{isUnlocked ? lvl.emoji : '🔒'}</span>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                                    {lvl.title}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                                    {lvl.xpNeeded} XP
                                </div>
                            </div>
                            {isCurrentLevel && (
                                <span style={{
                                    fontSize: '0.7rem', fontWeight: 700, color: 'var(--color-primary)',
                                    background: '#E8E5FF', padding: '4px 8px', borderRadius: '99px',
                                }}>
                                    {isAdult ? 'Current' : 'Hiện tại'}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Progress — Parent dashboard + achievements
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

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
    } = useGame();

    // Generate last 7 days for streak calendar
    const streakCalendar = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
        const isToday = i === 6;
        const isActive = i >= 7 - state.streak;
        return { dayName, isToday, isActive, date: d.getDate() };
    });

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">📊 Tiến bộ</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {/* Level display */}
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '24px',
            }}>
                <div style={{ fontSize: '4rem', marginBottom: '8px' }}>{currentLevel.emoji}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem' }}>
                    {currentLevel.title}
                </h3>
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '12px' }}>
                    Cấp {currentLevel.level} · {state.xp} XP
                </p>
                {nextLevel && (
                    <>
                        <div className="progress-bar">
                            <div className="progress-bar__fill" style={{ width: `${levelProgress}%` }} />
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '8px' }}>
                            Còn {nextLevel.xpNeeded - state.xp} XP để lên {nextLevel.emoji} {nextLevel.title}
                        </p>
                    </>
                )}
            </div>

            {/* Stats */}
            <div className="stats-row">
                <div className="stat-card">
                    <div className="stat-card__value">{state.englishWordsLearned}</div>
                    <div className="stat-card__label">🇬🇧 English</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__value">{state.chineseWordsLearned}</div>
                    <div className="stat-card__label">🇨🇳 中文</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__value">{state.wordsLearned.length}</div>
                    <div className="stat-card__label">📚 Tổng từ</div>
                </div>
            </div>

            {/* Streak calendar */}
            <div style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: '16px',
                boxShadow: 'var(--shadow-sm)',
                marginBottom: '24px',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <span className="streak-fire">🔥</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                        {state.streak} ngày liên tiếp
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    {streakCalendar.map((day, i) => (
                        <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: day.isToday ? 'var(--color-primary)' : 'var(--color-text-light)',
                                marginBottom: '6px',
                            }}>
                                {day.dayName}
                            </div>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                background: day.isActive
                                    ? 'var(--gradient-gold)'
                                    : day.isToday
                                        ? '#F0F0FF'
                                        : '#F5F5F5',
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
                🏅 Huy chương ({unlockedBadges.length}/{unlockedBadges.length + lockedBadges.length})
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
                🗺️ Hành trình
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {levels.map((lvl) => {
                    const isCurrentLevel = lvl.level === currentLevel.level;
                    const isUnlocked = state.xp >= lvl.xpNeeded;
                    return (
                        <div key={lvl.level} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 16px',
                            borderRadius: 'var(--radius-md)',
                            background: isCurrentLevel ? '#F0F0FF' : 'white',
                            border: isCurrentLevel ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
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
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    color: 'var(--color-primary)',
                                    background: '#E8E5FF',
                                    padding: '4px 8px',
                                    borderRadius: '99px',
                                }}>
                                    Hiện tại
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

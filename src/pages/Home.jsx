import { Link } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import MascotBuddy from '../components/MascotBuddy';

export default function Home() {
    const { state, currentLevel, levelProgress, nextLevel } = useGame();

    const greetingByTime = () => {
        const h = new Date().getHours();
        if (h < 12) return 'Chào buổi sáng';
        if (h < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    const childName = state.childName || 'bạn nhỏ';

    return (
        <div className="page">
            {/* Header with streak & XP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div className="streak-display">
                    <span className="streak-fire">🔥</span>
                    <span>{state.streak} ngày</span>
                </div>
                <div className="xp-badge">
                    ⭐ {state.xp} XP
                </div>
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

            {/* Mascot */}
            <MascotBuddy message={`${greetingByTime()}, ${childName}! 🎉`} />

            {/* Language cards */}
            <h2 style={{ textAlign: 'center', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
                Hôm nay học gì nào? 📚
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* English card */}
                <Link to="/english" style={{ textDecoration: 'none' }}>
                    <div className="card card--english" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3.5rem' }}>🇬🇧</div>
                        <div>
                            <h3 style={{ color: 'var(--color-english)', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                                Tiếng Anh
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
                                Tiếng Trung
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>
                                {state.chineseWordsLearned} từ đã học
                            </p>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '1.5rem' }}>▶️</div>
                    </div>
                </Link>

                {/* Games card */}
                <Link to="/games" style={{ textDecoration: 'none' }}>
                    <div className="card card--game" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                        <div style={{ fontSize: '3.5rem' }}>🎮</div>
                        <div>
                            <h3 style={{ color: '#8B5CF6', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                                Trò chơi
                            </h3>
                            <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginTop: '4px' }}>
                                Vừa chơi vừa học nào!
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
                    <div className="stat-card__label">Trận chơi</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card__value">{state.unlockedBadges?.length || 0}</div>
                    <div className="stat-card__label">Huy chương</div>
                </div>
            </div>
        </div>
    );
}

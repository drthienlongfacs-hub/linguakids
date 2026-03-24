// Achievements — Badge wall + Progress tracker
// Gamification evidence: recognition > extrinsic rewards (Duolingo research)
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

export default function Achievements() {
    const navigate = useNavigate();
    const { state, unlockedBadges, lockedBadges, currentLevel, levels } = useGame();

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">🏆 Huy chương</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {/* Stats overview */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px',
            }}>
                <div style={statCard}><div style={statValue}>{state.wordsLearned.length}</div><div style={statLabel}>Từ vựng</div></div>
                <div style={statCard}><div style={statValue}>{state.streak}</div><div style={statLabel}>Streak 🔥</div></div>
                <div style={statCard}><div style={statValue}>{unlockedBadges.length}</div><div style={statLabel}>Huy chương</div></div>
            </div>

            {/* Level Progress */}
            <div style={{
                background: 'linear-gradient(135deg, #FDF4FF, #EEF2FF)',
                borderRadius: '16px', padding: '16px', marginBottom: '20px',
                border: '2px solid #E0E7FF',
            }}>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px', fontSize: '1rem' }}>
                    Cấp độ của con
                </h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {levels.map((lvl, i) => {
                        const isReached = state.xp >= lvl.xpNeeded;
                        const isCurrent = lvl.level === currentLevel.level;
                        return (
                            <div key={i} style={{
                                width: '48px', height: '48px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.3rem',
                                background: isCurrent ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' :
                                    isReached ? '#E0E7FF' : '#F3F4F6',
                                border: isCurrent ? '3px solid #7C3AED' : '2px solid transparent',
                                boxShadow: isCurrent ? '0 0 12px rgba(139,92,246,0.4)' : 'none',
                                opacity: isReached ? 1 : 0.4,
                                transition: 'all 0.3s',
                            }}>
                                {lvl.emoji}
                            </div>
                        );
                    })}
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                    {currentLevel.emoji} <strong>{currentLevel.title}</strong> — {currentLevel.titleEn}
                </div>
            </div>

            {/* Unlocked Badges */}
            {unlockedBadges.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px', fontSize: '1rem' }}>
                        ✅ Đã đạt được ({unlockedBadges.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {unlockedBadges.map(badge => (
                            <div key={badge.id} className="animate-pop-in" style={{
                                background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                                borderRadius: '14px', padding: '14px',
                                textAlign: 'center', border: '2px solid #6EE7B7',
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '4px' }}>{badge.emoji}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: '#065F46' }}>
                                    {badge.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Locked Badges */}
            {lockedBadges.length > 0 && (
                <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px', fontSize: '1rem', color: 'var(--color-text-light)' }}>
                        🔒 Chưa đạt ({lockedBadges.length})
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                        {lockedBadges.map(badge => (
                            <div key={badge.id} style={{
                                background: '#F9FAFB', borderRadius: '14px', padding: '14px',
                                textAlign: 'center', border: '2px solid #E5E7EB', opacity: 0.6,
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '4px', filter: 'grayscale(100%)' }}>{badge.emoji}</div>
                                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.8rem', color: '#6B7280' }}>
                                    {badge.title}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

const statCard = {
    background: '#F9FAFB', borderRadius: '12px', padding: '12px', textAlign: 'center',
    border: '1px solid #E5E7EB',
};
const statValue = {
    fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#1E1B4B',
};
const statLabel = {
    fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px',
};

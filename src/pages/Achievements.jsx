// Achievements — Premium Badge Wall with Category Tabs + Unlock Animations
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { isAdultMode } from '../utils/userMode';

// Badge categories
const CATEGORIES = [
    { key: 'all', label: 'Tất cả', labelEn: 'All', icon: '🏅' },
    { key: 'vocab', label: 'Từ vựng', labelEn: 'Vocabulary', icon: '📚' },
    { key: 'streak', label: 'Streak', labelEn: 'Streak', icon: '🔥' },
    { key: 'games', label: 'Trò chơi', labelEn: 'Games', icon: '🎮' },
    { key: 'social', label: 'Đặc biệt', labelEn: 'Special', icon: '🌟' },
];

// Map badge IDs to categories
const BADGE_CATEGORIES = {
    first_word: 'vocab', ten_words: 'vocab', twenty_words: 'vocab', fifty_words: 'vocab',
    english_starter: 'vocab', chinese_starter: 'vocab', bilingual: 'vocab',
    streak_3: 'streak', streak_7: 'streak',
    first_game: 'games', ten_games: 'games', perfect_quiz: 'games',
    coin_100: 'social', coin_500: 'social', coin_1000: 'social',
};

export default function Achievements() {
    const navigate = useNavigate();
    const { state, unlockedBadges, lockedBadges, currentLevel, levels, modeConfig } = useGame();
    const isAdult = isAdultMode(state.userMode);
    const [activeCategory, setActiveCategory] = useState('all');

    const allBadges = [...unlockedBadges.map(b => ({ ...b, unlocked: true })), ...lockedBadges.map(b => ({ ...b, unlocked: false }))];

    const filteredBadges = activeCategory === 'all'
        ? allBadges
        : allBadges.filter(b => (BADGE_CATEGORIES[b.id] || 'social') === activeCategory);

    const unlockedCount = filteredBadges.filter(b => b.unlocked).length;
    const totalCount = filteredBadges.length;
    const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">🏆 {isAdult ? 'Achievements' : 'Huy chương'}</h2>
                <div className="home-hero__badges">
                    <div className="coin-badge">🪙 {state.coins || 0}</div>
                    <div className="xp-badge">⭐ {state.xp}</div>
                </div>
            </div>

            {/* Stats overview with glassmorphism */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px',
            }}>
                <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{state.wordsLearned.length}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>{isAdult ? 'Words' : 'Từ vựng'}</div>
                </div>
                <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{state.streak}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>Streak 🔥</div>
                </div>
                <div className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{unlockedBadges.length}/{allBadges.length}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>{isAdult ? 'Badges' : 'Huy chương'}</div>
                </div>
            </div>

            {/* Overall progress bar */}
            <div className="glass-card" style={{ padding: '14px 16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem' }}>
                        {isAdult ? 'Completion' : 'Tiến độ'}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {progressPct}%
                    </span>
                </div>
                <div className="progress-bar" style={{ height: '8px' }}>
                    <div className="progress-bar__fill" style={{ width: `${progressPct}%`, transition: 'width 0.8s ease' }} />
                </div>
            </div>

            {/* Level Progress */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px', fontSize: '0.9rem' }}>
                    {isAdult ? 'Level Journey' : 'Cấp độ của con'}
                </h3>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {levels.map((lvl, i) => {
                        const isReached = state.xp >= lvl.xpNeeded;
                        const isCurrent = lvl.level === currentLevel.level;
                        return (
                            <div key={i} className={isCurrent ? 'animate-pop-in' : ''} style={{
                                width: '46px', height: '46px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.2rem',
                                background: isCurrent ? 'linear-gradient(135deg, #8B5CF6, #EC4899)' :
                                    isReached ? 'rgba(99,102,241,0.15)' : 'rgba(148,163,184,0.08)',
                                border: isCurrent ? '2.5px solid #7C3AED' : '1.5px solid transparent',
                                boxShadow: isCurrent ? '0 0 12px rgba(139,92,246,0.4)' : 'none',
                                opacity: isReached ? 1 : 0.35,
                                transition: 'all 0.3s',
                            }}>
                                {isReached ? lvl.emoji : '🔒'}
                            </div>
                        );
                    })}
                </div>
                <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.82rem', color: 'var(--color-text-light)' }}>
                    {currentLevel.emoji} <strong>{currentLevel.title}</strong> — {currentLevel.titleEn}
                </div>
            </div>

            {/* Category Tabs */}
            <div style={{
                display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px',
                msOverflowStyle: 'none', scrollbarWidth: 'none',
            }}>
                {CATEGORIES.map(cat => (
                    <button key={cat.key} onClick={() => setActiveCategory(cat.key)} style={{
                        padding: '8px 14px', borderRadius: '99px', border: 'none',
                        cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap',
                        fontFamily: 'var(--font-display)',
                        background: activeCategory === cat.key
                            ? 'linear-gradient(135deg, var(--color-primary), #8B5CF6)'
                            : 'rgba(148,163,184,0.1)',
                        color: activeCategory === cat.key ? 'white' : 'var(--color-text-light)',
                        transition: 'all 0.2s',
                    }}>
                        {cat.icon} {isAdult ? cat.labelEn : cat.label}
                    </button>
                ))}
            </div>

            {/* Badge Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {filteredBadges.map((badge, i) => (
                    <div key={badge.id} className={badge.unlocked ? 'animate-pop-in' : ''} style={{
                        borderRadius: '16px', padding: '16px', textAlign: 'center',
                        animationDelay: badge.unlocked ? `${i * 0.05}s` : undefined,
                        background: badge.unlocked
                            ? 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(52,211,153,0.12))'
                            : 'rgba(148,163,184,0.05)',
                        border: badge.unlocked
                            ? '1.5px solid rgba(16,185,129,0.3)'
                            : '1.5px solid rgba(148,163,184,0.12)',
                        opacity: badge.unlocked ? 1 : 0.5,
                        transition: 'all 0.3s',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Shimmer effect for unlocked */}
                        {badge.unlocked && (
                            <div style={{
                                position: 'absolute', top: 0, left: '-100%', width: '200%', height: '100%',
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                                animation: 'shimmer 3s infinite',
                                pointerEvents: 'none',
                            }} />
                        )}
                        <div style={{
                            fontSize: '2rem', marginBottom: '6px',
                            filter: badge.unlocked ? 'none' : 'grayscale(100%)',
                            transition: 'filter 0.3s',
                        }}>
                            {badge.unlocked ? badge.emoji : '🔒'}
                        </div>
                        <div style={{
                            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.78rem',
                            color: badge.unlocked ? '#065F46' : 'var(--color-text-light)',
                        }}>
                            {badge.title}
                        </div>
                    </div>
                ))}
            </div>

            {filteredBadges.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-light)' }}>
                    {isAdult ? 'No badges in this category yet' : 'Chưa có huy chương trong mục này'}
                </div>
            )}
        </div>
    );
}

// Leaderboard — Simulated ranking board with weekly/all-time tabs
// Shows user's position + AI-generated competitors for motivation
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { isAdultMode } from '../utils/userMode';

// Simulated leaderboard data (AI competitors)
const AI_PLAYERS = [
    { name: 'Minh Anh', emoji: '👧', xp: 2850, streak: 14, level: 'A2' },
    { name: 'Đức Huy', emoji: '👦', xp: 2400, streak: 11, level: 'A2' },
    { name: 'Thanh Tâm', emoji: '👩', xp: 2100, streak: 9, level: 'A1' },
    { name: 'Bảo Ngọc', emoji: '👧', xp: 1800, streak: 7, level: 'A1' },
    { name: 'Quốc Anh', emoji: '👦', xp: 1500, streak: 6, level: 'A1' },
    { name: 'Hà My', emoji: '👩', xp: 1200, streak: 5, level: 'Pre-A1' },
    { name: 'Tuấn Kiệt', emoji: '👦', xp: 900, streak: 4, level: 'Pre-A1' },
    { name: 'Phương Linh', emoji: '👧', xp: 600, streak: 3, level: 'Starter' },
    { name: 'Hoàng Nam', emoji: '👦', xp: 400, streak: 2, level: 'Starter' },
];

const TABS = [
    { key: 'weekly', label: 'Tuần này', labelEn: 'This Week', emoji: '📅' },
    { key: 'alltime', label: 'Tất cả', labelEn: 'All Time', emoji: '🏆' },
];

// Medal colors for top 3
const MEDAL = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
    const navigate = useNavigate();
    const { state } = useGame();
    const isAdult = isAdultMode(state.userMode);
    const [tab, setTab] = useState('weekly');

    // Insert user into the leaderboard
    const userEntry = {
        name: isAdult ? 'You' : 'Bạn ⭐',
        emoji: '🌟',
        xp: state.xp || 0,
        streak: state.streak || 0,
        level: state.userCEFRLevel || 'Starter',
        isUser: true,
    };

    // For weekly, reduce AI XP by ~60% to simulate weekly scores
    const players = tab === 'weekly'
        ? [...AI_PLAYERS.map(p => ({ ...p, xp: Math.round(p.xp * 0.4) })), userEntry]
        : [...AI_PLAYERS, userEntry];

    const sorted = players.sort((a, b) => b.xp - a.xp);
    const userRank = sorted.findIndex(p => p.isUser) + 1;

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">🏆 {isAdult ? 'Leaderboard' : 'Bảng xếp hạng'}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {/* Tab switcher */}
            <div style={{
                display: 'flex', gap: '8px', marginBottom: '16px',
                background: 'var(--color-bg)', borderRadius: 'var(--radius-full)', padding: '4px',
            }}>
                {TABS.map(t => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        style={{
                            flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-full)',
                            background: tab === t.key ? 'var(--gradient-hero)' : 'transparent',
                            color: tab === t.key ? 'white' : 'var(--color-text-light)',
                            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem',
                            cursor: 'pointer', transition: 'var(--transition-normal)',
                        }}
                    >
                        {t.emoji} {isAdult ? t.labelEn : t.label}
                    </button>
                ))}
            </div>

            {/* User rank highlight */}
            <div className="glass-card" style={{
                padding: '16px', marginBottom: '16px', textAlign: 'center',
                background: 'linear-gradient(135deg, #6C63FF15, #8B5CF615)',
                border: '2px solid #6C63FF33',
            }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isAdult ? 'YOUR RANK' : 'THỨ HẠNG CỦA BẠN'}
                </div>
                <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--color-primary)' }}>
                    #{userRank}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                    {state.xp} XP · {state.streak} {isAdult ? 'day streak' : 'ngày liên tiếp'} 🔥
                </div>
            </div>

            {/* Leaderboard list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sorted.map((player, i) => (
                    <div
                        key={i}
                        className={player.isUser ? 'animate-pop-in' : ''}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '12px 16px', borderRadius: 'var(--radius-lg)',
                            background: player.isUser
                                ? 'linear-gradient(135deg, #6C63FF15, #EC489915)'
                                : 'var(--color-card)',
                            border: player.isUser ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                            boxShadow: player.isUser ? 'var(--shadow-md)' : 'none',
                            transition: 'var(--transition-normal)',
                        }}
                    >
                        {/* Rank */}
                        <div style={{
                            width: '32px', textAlign: 'center',
                            fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem',
                            color: i < 3 ? ['#F59E0B', '#94A3B8', '#CD7F32'][i] : 'var(--color-text-light)',
                        }}>
                            {i < 3 ? MEDAL[i] : `#${i + 1}`}
                        </div>

                        {/* Avatar */}
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '50%',
                            background: player.isUser ? 'var(--gradient-hero)' : `${['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'][i % 5]}20`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.3rem', flexShrink: 0,
                        }}>
                            {player.emoji}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                            <div style={{
                                fontFamily: 'var(--font-display)', fontWeight: 700,
                                fontSize: player.isUser ? '1rem' : '0.95rem',
                                color: player.isUser ? 'var(--color-primary)' : 'var(--color-text)',
                            }}>
                                {player.name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                                {player.level} · {player.streak}🔥
                            </div>
                        </div>

                        {/* XP */}
                        <div style={{
                            fontFamily: 'var(--font-display)', fontWeight: 800,
                            fontSize: '1rem', color: player.isUser ? 'var(--color-primary)' : 'var(--color-xp)',
                        }}>
                            {player.xp} ⭐
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

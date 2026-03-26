// StudyStats — Comprehensive learning statistics dashboard
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

export default function StudyStats() {
    const navigate = useNavigate();
    const { state } = useGame();

    const totalWords = 1155 + 550;
    const wordsLearned = state.wordsLearned || 0;
    const streakDays = state.streak || 0;
    const totalXP = state.xp || 0;
    const sessionsCompleted = state.sessionsCompleted || 0;
    const quizzesTaken = state.quizzesTaken || 0;
    const avgScore = state.avgScore || 0;

    const stats = [
        { label: 'Tổng XP', value: totalXP, emoji: '⭐', color: '#F59E0B' },
        { label: 'Từ đã học', value: `${wordsLearned}/${totalWords}`, emoji: '📚', color: '#3B82F6' },
        { label: 'Chuỗi ngày', value: `${streakDays} ngày`, emoji: '🔥', color: '#EF4444' },
        { label: 'Phiên học', value: sessionsCompleted, emoji: '📝', color: '#10B981' },
        { label: 'Bài quiz', value: quizzesTaken, emoji: '🧠', color: '#8B5CF6' },
        { label: 'Điểm TB phát âm', value: `${avgScore}%`, emoji: '🎙️', color: '#0891B2' },
    ];

    const milestones = [
        { xp: 100, title: 'Người mới bắt đầu', emoji: '🌱' },
        { xp: 500, title: 'Người học chăm chỉ', emoji: '📖' },
        { xp: 1000, title: 'Chiến binh ngôn ngữ', emoji: '⚔️' },
        { xp: 2500, title: 'Bậc thầy từ vựng', emoji: '🎓' },
        { xp: 5000, title: 'Nhà ngôn ngữ học', emoji: '🏆' },
        { xp: 10000, title: 'Huyền thoại', emoji: '👑' },
    ];

    const currentMilestone = milestones.filter(m => totalXP >= m.xp).pop() || milestones[0];
    const nextMilestone = milestones.find(m => totalXP < m.xp);

    const skills = [
        { name: 'Từ vựng EN', level: Math.min(10, Math.floor(totalXP / 100)), color: '#3B82F6' },
        { name: 'Từ vựng CN', level: Math.min(10, Math.floor(totalXP / 150)), color: '#EF4444' },
        { name: 'Ngữ pháp', level: Math.min(10, Math.floor(totalXP / 200)), color: '#8B5CF6' },
        { name: 'Phát âm', level: Math.min(10, Math.floor(totalXP / 180)), color: '#0891B2' },
        { name: 'Đọc hiểu', level: Math.min(10, Math.floor(totalXP / 250)), color: '#10B981' },
        { name: 'Nghe', level: Math.min(10, Math.floor(totalXP / 220)), color: '#F59E0B' },
    ];

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">📊 Thống kê học tập</h2>
            </div>

            {/* Current Level */}
            <div style={{
                textAlign: 'center', padding: '20px', borderRadius: 'var(--radius-lg)',
                background: 'var(--color-card)', boxShadow: 'var(--shadow-md)', marginBottom: '16px',
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{currentMilestone.emoji}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
                    {currentMilestone.title}
                </div>
                {nextMilestone && (
                    <>
                        <div className="progress-bar" style={{ height: '10px', marginTop: '10px', borderRadius: 'var(--radius-full)' }}>
                            <div className="progress-bar__fill" style={{ width: `${Math.min(100, (totalXP / nextMilestone.xp) * 100)}%` }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            {totalXP}/{nextMilestone.xp} XP → {nextMilestone.emoji} {nextMilestone.title}
                        </div>
                    </>
                )}
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {stats.map(s => (
                    <div key={s.label} style={{
                        textAlign: 'center', padding: '12px 8px', borderRadius: 'var(--radius-lg)',
                        background: 'var(--color-card)', border: `1px solid ${s.color}20`,
                    }}>
                        <div style={{ fontSize: '1.5rem' }}>{s.emoji}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Skill Bars */}
            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', marginBottom: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '12px' }}>🎯 Kỹ năng</h3>
                {skills.map(skill => (
                    <div key={skill.name} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{skill.name}</span>
                            <span style={{ fontSize: '0.75rem', color: skill.color, fontWeight: 700 }}>Lv.{skill.level}</span>
                        </div>
                        <div style={{ height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${skill.level * 10}%`, background: skill.color, borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="btn btn--primary btn--block" onClick={() => navigate('/daily-challenge')}>🎯 Thử thách</button>
                <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>🎮 Trò chơi</button>
            </div>
        </div>
    );
}

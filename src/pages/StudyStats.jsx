// StudyStats — Comprehensive learning statistics dashboard
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

const SKILL_META = [
    { key: 'speaking', label: 'Nói', color: '#0891B2' },
    { key: 'listening', label: 'Nghe', color: '#F59E0B' },
    { key: 'vocabulary', label: 'Từ vựng', color: '#3B82F6' },
    { key: 'grammar', label: 'Ngữ pháp', color: '#8B5CF6' },
    { key: 'reading', label: 'Đọc', color: '#10B981' },
    { key: 'writing', label: 'Viết', color: '#EF4444' },
];

const MILESTONES = [
    { xp: 100, title: 'Người mới bắt đầu', emoji: '🌱' },
    { xp: 500, title: 'Người học chăm chỉ', emoji: '📖' },
    { xp: 1000, title: 'Chiến binh ngôn ngữ', emoji: '⚔️' },
    { xp: 2500, title: 'Bậc thầy từ vựng', emoji: '🎓' },
    { xp: 5000, title: 'Nhà ngôn ngữ học', emoji: '🏆' },
    { xp: 10000, title: 'Huyền thoại', emoji: '👑' },
];

function formatRecapTime(value) {
    if (!value) return 'Vừa xong';
    try {
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(value));
    } catch {
        return 'Vừa xong';
    }
}

export default function StudyStats() {
    const navigate = useNavigate();
    const { state } = useGame();

    const totalXP = state.xp || 0;
    const streakDays = state.streak || 0;
    const totalWordsLearned = state.wordsLearned?.length || 0;
    const englishWordsLearned = state.englishWordsLearned || 0;
    const chineseWordsLearned = state.chineseWordsLearned || 0;
    const sessionsCompleted = state.totalSessions || 0;
    const activitiesCompleted = state.gamesPlayed || 0;
    const speakingRecaps = state.speakingRecaps || [];
    const avgSpeakingScore = speakingRecaps.length > 0
        ? Math.round(speakingRecaps.reduce((sum, recap) => sum + (recap.overallScore || 0), 0) / speakingRecaps.length)
        : Math.round(state.skillScores?.speaking || 0);
    const recentSpeakingRecaps = speakingRecaps.slice(0, 4);

    const stats = [
        { label: 'Tổng XP', value: totalXP, emoji: '⭐', color: '#F59E0B' },
        { label: 'Từ đã lưu', value: totalWordsLearned, emoji: '📚', color: '#3B82F6' },
        { label: 'EN / CN', value: `${englishWordsLearned}/${chineseWordsLearned}`, emoji: '🌍', color: '#EC4899' },
        { label: 'Chuỗi ngày', value: `${streakDays} ngày`, emoji: '🔥', color: '#EF4444' },
        { label: 'Phiên học', value: sessionsCompleted, emoji: '📝', color: '#10B981' },
        { label: 'Điểm nói TB', value: `${avgSpeakingScore}%`, emoji: '🎙️', color: '#0891B2' },
    ];

    const currentMilestone = MILESTONES.filter((milestone) => totalXP >= milestone.xp).pop() || MILESTONES[0];
    const nextMilestone = MILESTONES.find((milestone) => totalXP < milestone.xp);
    const skillScores = state.skillScores || {};
    const skills = SKILL_META.map((skill) => ({
        ...skill,
        score: Math.round(skillScores[skill.key] || 0),
    }));

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">📊 Thống kê học tập</h2>
            </div>

            <div style={{
                textAlign: 'center',
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--color-card)',
                boxShadow: 'var(--shadow-md)',
                marginBottom: '16px',
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{currentMilestone.emoji}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 800 }}>
                    {currentMilestone.title}
                </div>
                {nextMilestone ? (
                    <>
                        <div className="progress-bar" style={{ height: '10px', marginTop: '10px', borderRadius: 'var(--radius-full)' }}>
                            <div className="progress-bar__fill" style={{ width: `${Math.min(100, (totalXP / nextMilestone.xp) * 100)}%` }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                            {totalXP}/{nextMilestone.xp} XP → {nextMilestone.emoji} {nextMilestone.title}
                        </div>
                    </>
                ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '6px' }}>
                        Đã đạt mốc cao nhất hiện có
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        style={{
                            textAlign: 'center',
                            padding: '12px 8px',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--color-card)',
                            border: `1px solid ${stat.color}20`,
                        }}
                    >
                        <div style={{ fontSize: '1.5rem' }}>{stat.emoji}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 800, color: stat.color }}>
                            {stat.value}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)' }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', margin: 0 }}>🎯 Kỹ năng vận hành</h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
                        Hoạt động đã ghi nhận: {activitiesCompleted}
                    </span>
                </div>
                {skills.map((skill) => (
                    <div key={skill.key} style={{ marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{skill.label}</span>
                            <span style={{ fontSize: '0.75rem', color: skill.color, fontWeight: 700 }}>{skill.score}%</span>
                        </div>
                        <div style={{ height: '8px', borderRadius: 'var(--radius-full)', background: 'var(--color-surface)', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${skill.score}%`, background: skill.color, borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', margin: 0 }}>🧾 Speaking recaps gần đây</h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
                        {speakingRecaps.length} lượt được lưu
                    </span>
                </div>

                {recentSpeakingRecaps.length === 0 ? (
                    <div style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(15,23,42,0.04)',
                        color: 'var(--color-text-light)',
                        fontSize: '0.82rem',
                        lineHeight: 1.5,
                    }}>
                        Chưa có recap nói nào được lưu. Hãy hoàn thành ít nhất một bài speaking hoặc shadowing để bắt đầu theo dõi tiến bộ thật.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {recentSpeakingRecaps.map((recap) => (
                            <div
                                key={recap.id}
                                style={{
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    background: 'rgba(15,23,42,0.04)',
                                    border: '1px solid rgba(148,163,184,0.16)',
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px', alignItems: 'center' }}>
                                    <strong style={{ fontSize: '0.88rem' }}>{recap.lessonTitle}</strong>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 800, color: recap.overallScore >= 75 ? '#059669' : '#DC2626' }}>
                                        {recap.overallScore}%
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-light)', marginBottom: '6px' }}>
                                    {formatRecapTime(recap.createdAt)} · {recap.lang === 'cn' ? '中文' : 'English'} · {recap.analysisType}
                                </div>
                                <div style={{ fontSize: '0.8rem', lineHeight: 1.5 }}>
                                    {recap.recommendations?.[0] || recap.note}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="btn btn--primary btn--block" onClick={() => navigate('/speaking')}>🗣️ Luyện nói</button>
                <button className="btn btn--outline btn--block" onClick={() => navigate('/daily-challenge')}>🎯 Thử thách</button>
            </div>
        </div>
    );
}

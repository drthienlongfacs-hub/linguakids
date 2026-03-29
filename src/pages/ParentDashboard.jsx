import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { getPremiumStatus } from '../services/premiumService';
import { getXPData, getUnlockedBadges, getAllBadges } from '../services/xpEngine';
import { getDueWordIds } from '../services/fsrs';

export default function ParentDashboard() {
    const navigate = useNavigate();
    const { state, currentLevel, levelProgress, getDailyStats } = useGame();
    const premiumStatus = getPremiumStatus();
    const xpData = getXPData();
    const unlockedBadges = getUnlockedBadges();
    const allBadges = getAllBadges();
    const dueWords = getDueWordIds();
    const daily = getDailyStats();

    const totalStudyDays = state.streak || 0;
    const wordsLearned = state.wordsLearned?.length || 0;

    return (
        <div className="page-container" style={{ padding: '1rem', maxWidth: 640, margin: 'auto' }}>
            <button onClick={() => navigate(-1)} style={{
                background: 'none', border: 'none', color: 'var(--color-primary)',
                fontSize: '1rem', cursor: 'pointer', marginBottom: '0.5rem',
                fontFamily: 'var(--font-display)',
            }}>
                ← Quay lại
            </button>

            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                borderRadius: 20, padding: '1.5rem', color: '#fff', marginBottom: '1rem',
                textAlign: 'center',
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 4 }}>👨‍👩‍👧</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 4px' }}>
                    Bảng Điều Khiển Phụ Huynh
                </h1>
                <p style={{ opacity: 0.9, margin: 0, fontSize: '0.85rem' }}>
                    Theo dõi tiến trình học tập của bé
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
                marginBottom: '1rem',
            }}>
                <StatCard icon="📚" value={wordsLearned} label="Từ đã học" color="#4CAF50" />
                <StatCard icon="🔥" value={totalStudyDays} label="Ngày liên tiếp" color="#FF5722" />
                <StatCard icon="⭐" value={state.xp || 0} label="Điểm XP" color="#FF9800" />
            </div>

            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
                marginBottom: '1rem',
            }}>
                <StatCard icon="🎮" value={state.gamesPlayed || 0} label="Trò chơi" color="#9C27B0" />
                <StatCard icon="🏅" value={unlockedBadges.length} label={`/${allBadges.length} Huy chương`} color="#2196F3" />
                <StatCard icon="🧠" value={dueWords.length} label="Cần ôn tập" color="#E91E63" />
            </div>

            {/* Level Progress */}
            <div style={{
                background: '#fff', borderRadius: 16, padding: '1rem 1.2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem',
            }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', margin: '0 0 8px', color: '#444' }}>
                    📊 Cấp độ hiện tại
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: '2rem' }}>{currentLevel?.emoji}</span>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', color: '#333' }}>
                            {currentLevel?.title} (Lv.{currentLevel?.level})
                        </div>
                        <div style={{
                            background: '#e0e0e0', borderRadius: 10, height: 10,
                            overflow: 'hidden', marginTop: 4,
                        }}>
                            <div style={{
                                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                                height: '100%', borderRadius: 10,
                                width: `${Math.min(100, levelProgress)}%`,
                                transition: 'width 0.5s ease',
                            }} />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>
                            {Math.round(levelProgress)}% → Level tiếp theo
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Progress */}
            <div style={{
                background: '#fff', borderRadius: 16, padding: '1rem 1.2rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '1rem',
            }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', margin: '0 0 8px', color: '#444' }}>
                    📅 Tiến trình hôm nay
                </h3>
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    marginBottom: 8,
                }}>
                    <span style={{ fontSize: '0.85rem', color: '#666' }}>
                        {daily.totalToday}/{daily.goal} hoạt động
                    </span>
                    <span style={{
                        fontSize: '0.8rem', padding: '2px 10px', borderRadius: 20,
                        background: daily.goalReached ? '#e8f5e9' : '#fff3e0',
                        color: daily.goalReached ? '#2e7d32' : '#e65100',
                    }}>
                        {daily.goalReached ? '✅ Hoàn thành' : '⏳ Đang học'}
                    </span>
                </div>
                <div style={{
                    background: '#e0e0e0', borderRadius: 10, height: 12, overflow: 'hidden',
                }}>
                    <div style={{
                        background: daily.goalReached
                            ? 'linear-gradient(90deg, #43e97b, #38f9d7)'
                            : 'linear-gradient(90deg, #ffa726, #ff7043)',
                        height: '100%', borderRadius: 10,
                        width: `${Math.min(100, daily.progress)}%`,
                        transition: 'width 0.5s ease',
                    }} />
                </div>
            </div>

            {/* Premium Status */}
            <div style={{
                background: premiumStatus.active ? '#f3e5f5' : '#fff3e0',
                borderRadius: 16, padding: '1rem 1.2rem', marginBottom: '1rem',
                border: `1px solid ${premiumStatus.active ? '#ce93d8' : '#ffcc80'}`,
            }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', margin: '0 0 6px', color: '#444' }}>
                    {premiumStatus.active ? '👑 Premium Active' : '🔒 Phiên bản miễn phí'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#666', margin: 0, lineHeight: 1.5 }}>
                    {premiumStatus.active
                        ? premiumStatus.type === 'trial'
                            ? `Dùng thử đến ${new Date(premiumStatus.expiresAt).toLocaleDateString('vi-VN')}`
                            : 'Trọn đời — Đã mở khóa toàn bộ nội dung'
                        : 'Nâng cấp Premium để mở khóa 40+ chủ đề và tính năng nâng cao'}
                </p>
                {!premiumStatus.active && (
                    <button onClick={() => navigate('/premium')} style={{
                        marginTop: 8, background: 'var(--color-primary)', color: '#fff',
                        border: 'none', borderRadius: 10, padding: '8px 20px',
                        fontSize: '0.85rem', fontFamily: 'var(--font-display)', cursor: 'pointer',
                    }}>
                        Nâng cấp Premium
                    </button>
                )}
            </div>

            {/* Data Privacy Notice */}
            <div style={{
                background: '#e8f5e9', borderRadius: 12, padding: '0.8rem 1rem',
                textAlign: 'center', fontSize: '0.8rem', color: '#388e3c',
            }}>
                🔒 Tất cả dữ liệu chỉ lưu trên thiết bị. Không gửi đi đâu cả.
            </div>
        </div>
    );
}

function StatCard({ icon, value, label, color }) {
    return (
        <div style={{
            background: '#fff', borderRadius: 14, padding: '12px 8px',
            textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            borderTop: `3px solid ${color}`,
        }}>
            <div style={{ fontSize: '1.3rem', marginBottom: 2 }}>{icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color, fontWeight: 700 }}>
                {value}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#888', lineHeight: 1.2 }}>{label}</div>
        </div>
    );
}

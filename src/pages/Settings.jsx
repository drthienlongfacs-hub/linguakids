// Settings — User preferences page
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { isAdultMode } from '../utils/userMode';
import SystemCapabilityPanel from '../components/SystemCapabilityPanel';

const SPEED_OPTIONS = [
    { key: 'slow', label: 'Chậm', labelEn: 'Slow', emoji: '🐢', rate: 0.6 },
    { key: 'normal', label: 'Bình thường', labelEn: 'Normal', emoji: '🚶', rate: 1.0 },
    { key: 'fast', label: 'Nhanh', labelEn: 'Fast', emoji: '🏃', rate: 1.3 },
];

export default function Settings() {
    const navigate = useNavigate();
    const { state, dispatch } = useGame();
    const isAdult = isAdultMode(state.userMode);

    const [speechSpeed, setSpeechSpeed] = useState(
        () => localStorage.getItem('linguakids-speech-speed') || 'normal'
    );
    const [autoPlay, setAutoPlay] = useState(
        () => localStorage.getItem('linguakids-autoplay') !== 'false'
    );
    const [dailyGoal, setDailyGoal] = useState(
        () => parseInt(localStorage.getItem('linguakids-daily-goal') || '20')
    );

    const handleSpeechSpeed = (key) => {
        setSpeechSpeed(key);
        localStorage.setItem('linguakids-speech-speed', key);
    };

    const handleAutoPlay = () => {
        const next = !autoPlay;
        setAutoPlay(next);
        localStorage.setItem('linguakids-autoplay', String(next));
    };

    const handleDailyGoal = (val) => {
        setDailyGoal(val);
        localStorage.setItem('linguakids-daily-goal', String(val));
    };

    const handleResetProgress = () => {
        if (window.confirm(isAdult
            ? 'Reset all progress? This cannot be undone.'
            : 'Xóa toàn bộ tiến trình học? Không thể hoàn tác!'
        )) {
            localStorage.clear();
            window.location.href = '#/';
            window.location.reload();
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate(-1)}>←</button>
                <h2 className="page-header__title">⚙️ {isAdult ? 'Settings' : 'Cài đặt'}</h2>
            </div>

            {/* Speech Speed */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                    🔊 {isAdult ? 'Speech Speed' : 'Tốc độ phát âm'}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {SPEED_OPTIONS.map(opt => (
                        <button
                            key={opt.key}
                            onClick={() => handleSpeechSpeed(opt.key)}
                            style={{
                                flex: 1, padding: '10px 8px', border: 'none',
                                borderRadius: 'var(--radius-md)',
                                background: speechSpeed === opt.key ? 'var(--gradient-hero)' : 'var(--color-bg)',
                                color: speechSpeed === opt.key ? 'white' : 'var(--color-text)',
                                fontFamily: 'var(--font-display)', fontWeight: 700,
                                fontSize: '0.85rem', cursor: 'pointer',
                                transition: 'var(--transition-normal)',
                            }}
                        >
                            {opt.emoji} {isAdult ? opt.labelEn : opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Auto-play sounds */}
            <div className="glass-card" style={{
                padding: '16px', marginBottom: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
                        🔔 {isAdult ? 'Auto-play Audio' : 'Tự động phát âm'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                        {isAdult ? 'Play sound for new words automatically' : 'Tự phát khi mở từ mới'}
                    </div>
                </div>
                <button
                    onClick={handleAutoPlay}
                    style={{
                        width: '52px', height: '28px', borderRadius: '14px', border: 'none',
                        background: autoPlay ? '#22C55E' : '#D1D5DB',
                        position: 'relative', cursor: 'pointer',
                        transition: 'var(--transition-normal)',
                    }}
                >
                    <div style={{
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: 'white', position: 'absolute', top: '2px',
                        left: autoPlay ? '26px' : '2px',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'left var(--transition-normal)',
                    }} />
                </button>
            </div>

            {/* Daily Goal */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                    🎯 {isAdult ? 'Daily Goal' : 'Mục tiêu hằng ngày'}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {[10, 20, 30, 50].map(val => (
                        <button
                            key={val}
                            onClick={() => handleDailyGoal(val)}
                            style={{
                                flex: 1, padding: '10px 6px', border: 'none',
                                borderRadius: 'var(--radius-md)',
                                background: dailyGoal === val ? 'var(--gradient-hero)' : 'var(--color-bg)',
                                color: dailyGoal === val ? 'white' : 'var(--color-text)',
                                fontFamily: 'var(--font-display)', fontWeight: 700,
                                fontSize: '0.85rem', cursor: 'pointer',
                            }}
                        >
                            {val} XP
                        </button>
                    ))}
                </div>
            </div>

            {/* User Mode */}
            <div className="glass-card" style={{
                padding: '16px', marginBottom: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
                        👤 {isAdult ? 'User Mode' : 'Chế độ'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                        {isAdult ? 'Currently: Adult Mode' : 'Hiện tại: Chế độ trẻ em'}
                    </div>
                </div>
                <button
                    onClick={() => dispatch({ type: 'SET_MODE', payload: isAdult ? 'kids' : 'adult' })}
                    className="btn btn--outline"
                    style={{ fontSize: '0.8rem', padding: '8px 16px' }}
                >
                    {isAdult ? '👧 Switch to Kids' : '👨 Người lớn'}
                </button>
            </div>

            <SystemCapabilityPanel />

            {/* App Info */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🌈</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                    LinguaKids
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    v12.5.0 · Made with ❤️ for Vietnamese learners
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                    1050+ EN words · 500+ CN words · 6 CEFR levels
                </div>
            </div>

            {/* Danger Zone */}
            <div style={{
                padding: '16px', borderRadius: 'var(--radius-lg)',
                border: '2px solid #FCA5A5', background: '#FEF2F215',
            }}>
                <div style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem',
                    color: '#DC2626', marginBottom: '10px',
                }}>
                    ⚠️ {isAdult ? 'Danger Zone' : 'Vùng nguy hiểm'}
                </div>
                <button
                    onClick={handleResetProgress}
                    style={{
                        width: '100%', padding: '12px', border: '2px solid #DC2626',
                        borderRadius: 'var(--radius-md)', background: 'transparent',
                        color: '#DC2626', fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: '0.9rem', cursor: 'pointer',
                    }}
                >
                    🗑️ {isAdult ? 'Reset All Progress' : 'Xóa toàn bộ tiến trình'}
                </button>
            </div>
        </div>
    );
}

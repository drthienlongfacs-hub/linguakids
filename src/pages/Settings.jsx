// Settings — User preferences page
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { isAdultMode } from '../utils/userMode';
import SystemCapabilityPanel from '../components/SystemCapabilityPanel';
import usePremiumStatus from '../hooks/usePremiumStatus';
import { useGameStore } from '../store/useGameStore';
import { ACCENT_PROFILES, VOICE_PERSONALITIES } from '../data/voicePersonalities.js';
import { invalidateVoiceCache } from '../utils/speakText.js';
import { previewVoicePreference } from '../services/voicePreferenceService.js';

const SPEED_OPTIONS = [
    { key: 'slow', label: 'Chậm', labelEn: 'Slow', emoji: '🐢', rate: 0.6 },
    { key: 'normal', label: 'Bình thường', labelEn: 'Normal', emoji: '🚶', rate: 1.0 },
    { key: 'fast', label: 'Nhanh', labelEn: 'Fast', emoji: '🏃', rate: 1.3 },
];

export default function Settings() {
    const navigate = useNavigate();
    const { state, dispatch } = useGame();
    const isAdult = isAdultMode(state.userMode);
    const { premiumStatus, runtimeStatus } = usePremiumStatus();

    const [speechSpeed, setSpeechSpeed] = useState(
        () => localStorage.getItem('linguakids-speech-speed') || 'normal'
    );
    const [autoPlay, setAutoPlay] = useState(
        () => localStorage.getItem('linguakids-autoplay') !== 'false'
    );
    const [dailyGoal, setDailyGoal] = useState(
        () => parseInt(localStorage.getItem('linguakids-daily-goal') || '20')
    );

    const { preferredAccent, preferredPersonality, setVoicePreferences } = useGameStore();
    const [voices, setVoices] = useState(() => window.speechSynthesis?.getVoices() || []);
    const [previewPlaying, setPreviewPlaying] = useState(false);

    // Load voices
    useEffect(() => {
        const loadVoices = () => {
            const v = window.speechSynthesis?.getVoices() || [];
            if (v.length > 0) setVoices(v);
        };
        loadVoices();
        window.speechSynthesis?.addEventListener('voiceschanged', loadVoices);
        const timer = setTimeout(loadVoices, 500);
        return () => {
            clearTimeout(timer);
            window.speechSynthesis?.removeEventListener('voiceschanged', loadVoices);
        };
    }, []);

    const handleAccentChange = useCallback((accentId) => {
        setVoicePreferences(accentId, preferredPersonality);
        invalidateVoiceCache();
    }, [preferredPersonality, setVoicePreferences]);

    const handlePersonalityChange = useCallback((personalityId) => {
        setVoicePreferences(preferredAccent, personalityId);
        invalidateVoiceCache();
    }, [preferredAccent, setVoicePreferences]);

    const previewVoice = useCallback((accentId, personalityId) => {
        if (!window.speechSynthesis || previewPlaying) return;
        setPreviewPlaying(true);
        const accent = ACCENT_PROFILES.find((item) => item.id === accentId);
        previewVoicePreference({
            langCode: accent?.lang || 'en-US',
            accentId,
            personalityId,
            voices,
            onEnd: () => setPreviewPlaying(false),
            onError: () => setPreviewPlaying(false),
        });
    }, [voices, previewPlaying]);

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

            {/* Accent Selector */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                    🌍 {isAdult ? 'English Accent' : 'Giọng tiếng Anh'}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {ACCENT_PROFILES.map(accent => (
                        <button
                            key={accent.id}
                            onClick={() => handleAccentChange(accent.id)}
                            style={{
                                flex: 1, padding: '10px 6px', border: 'none',
                                borderRadius: 'var(--radius-md)',
                                background: preferredAccent === accent.id ? accent.color : 'var(--color-bg)',
                                color: preferredAccent === accent.id ? 'white' : 'var(--color-text)',
                                fontFamily: 'var(--font-display)', fontWeight: 700,
                                fontSize: '0.8rem', cursor: 'pointer',
                                transition: 'var(--transition-normal)',
                            }}
                        >
                            {accent.flag} {accent.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Voice Personality Selector */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                    🎭 {isAdult ? 'Voice Style' : 'Kiểu giọng nói'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {VOICE_PERSONALITIES.map(p => {
                        const isSelected = preferredPersonality === p.id;
                        return (
                            <button
                                key={p.id}
                                onClick={() => handlePersonalityChange(p.id)}
                                style={{
                                    padding: '10px 8px', border: 'none',
                                    borderRadius: 'var(--radius-md)',
                                    background: isSelected ? `${p.color}20` : 'var(--color-bg)',
                                    outline: isSelected ? `2px solid ${p.color}` : '1px solid transparent',
                                    fontFamily: 'var(--font-display)', fontWeight: 600,
                                    fontSize: '0.78rem', cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'var(--transition-normal)',
                                    color: isSelected ? p.color : 'var(--color-text)',
                                }}
                            >
                                <div style={{ fontSize: '1.2rem' }}>{p.emoji}</div>
                                <div>{isAdult ? p.label : p.labelVi}</div>
                                <div style={{ fontSize: '0.65rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                                    {p.gender === 'male' ? '♂' : '♀'}
                                </div>
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={() => previewVoice(preferredAccent, preferredPersonality)}
                    disabled={previewPlaying}
                    style={{
                        width: '100%', marginTop: '10px', padding: '10px',
                        borderRadius: 'var(--radius-md)', border: 'none',
                        background: 'var(--gradient-hero)', color: 'white',
                        fontFamily: 'var(--font-display)', fontWeight: 700,
                        fontSize: '0.85rem', cursor: 'pointer',
                        opacity: previewPlaying ? 0.6 : 1,
                    }}
                >
                    {previewPlaying ? '🔊 Đang phát...' : '🔊 Nghe thử giọng đã chọn'}
                </button>
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

            {/* Enterprise Modules */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '10px' }}>
                    📱 {isAdult ? 'App & Account' : 'Ứng dụng & Tài khoản'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <SettingsLink
                        emoji={premiumStatus.active ? '👑' : '🔒'}
                        label={premiumStatus.active ? 'Premium Active' : (isAdult ? 'Upgrade to Premium' : 'Nâng cấp Premium')}
                        sublabel={premiumStatus.active
                            ? `${premiumStatus.type === 'trial' ? 'Dùng thử' : 'Đã kích hoạt'} · ${premiumStatus.sourceOfTruth || 'local'}`
                            : (runtimeStatus.configured ? 'Server-backed activation available' : 'Signed token / trial cho web edition')}
                        onClick={() => navigate('/premium')}
                        highlight={!premiumStatus.active}
                    />
                    <SettingsLink emoji="👨‍👩‍👧" label={isAdult ? 'Parent Dashboard' : 'Bảng điều khiển phụ huynh'}
                        sublabel={isAdult ? 'Track learning progress' : 'Theo dõi tiến trình học'}
                        onClick={() => navigate('/parent-dashboard')} />
                    <SettingsLink emoji="🔒" label={isAdult ? 'Privacy Policy' : 'Chính sách bảo mật'}
                        sublabel="Zero data collection"
                        onClick={() => navigate('/privacy')} />
                    <SettingsLink emoji="📋" label={isAdult ? 'Terms of Service' : 'Điều khoản sử dụng'}
                        sublabel={isAdult ? 'Usage terms & refund' : 'Điều khoản & hoàn tiền'}
                        onClick={() => navigate('/terms')} />
                </div>
            </div>

            {/* App Info */}
            <div className="glass-card" style={{ padding: '16px', marginBottom: '12px', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🌈</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>
                    LinguaKids
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                    v13.0.0 · Made with ❤️ for Vietnamese learners
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

function SettingsLink({ emoji, label, sublabel, onClick, highlight }) {
    return (
        <button onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: '10px 12px', border: highlight ? '2px solid var(--color-primary)' : '1px solid #eee',
            borderRadius: 'var(--radius-md)', background: highlight ? '#f0f7ff' : '#fafafa',
            cursor: 'pointer', textAlign: 'left',
        }}>
            <span style={{ fontSize: '1.3rem' }}>{emoji}</span>
            <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: 600, color: '#333' }}>
                    {label}
                </div>
                {sublabel && (
                    <div style={{ fontSize: '0.7rem', color: '#888', marginTop: 1 }}>{sublabel}</div>
                )}
            </div>
            <span style={{ color: '#ccc', fontSize: '1rem' }}>›</span>
        </button>
    );
}

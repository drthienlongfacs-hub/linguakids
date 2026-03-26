// StudyReminder — Shows reminder if user hasn't studied today
// Uses Notification API (with permission) + in-app banner
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';

export default function StudyReminder() {
    const navigate = useNavigate();
    const { state } = useGame();
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if user studied today
        const today = new Date().toDateString();
        const lastStudy = localStorage.getItem('linguakids-last-study');
        const hasStudiedToday = lastStudy === today;

        if (!hasStudiedToday && !dismissed) {
            // Show reminder after 3 seconds
            const timer = setTimeout(() => setShow(true), 3000);
            return () => clearTimeout(timer);
        }
    }, [dismissed]);

    // Request notification permission on first visit
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            // Will ask permission when user first sees the reminder
        }
    }, []);

    const handleStartStudy = () => {
        localStorage.setItem('linguakids-last-study', new Date().toDateString());
        setShow(false);
        navigate('/english');
    };

    const handleDismiss = () => {
        setDismissed(true);
        setShow(false);
        localStorage.setItem('linguakids-last-study', new Date().toDateString());
    };

    if (!show) return null;

    const hour = new Date().getHours();
    const isEvening = hour >= 18;
    const isMorning = hour < 12;

    return (
        <div className="animate-slide-up" style={{
            position: 'fixed', top: '16px', left: '16px', right: '16px',
            zIndex: 1100,
            background: isEvening
                ? 'linear-gradient(135deg, #1E293B, #334155)'
                : 'linear-gradient(135deg, #FFF7ED, #FFF1F2)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            border: `2px solid ${isEvening ? '#475569' : '#FCD34D'}`,
            color: isEvening ? 'white' : 'var(--color-text)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ fontSize: '2.5rem', flexShrink: 0 }}>
                    {isMorning ? '🌅' : isEvening ? '🌙' : '☀️'}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>
                        {isMorning ? 'Chào buổi sáng!' : isEvening ? 'Buổi tối thú vị!' : 'Học tiếng Anh nào!'}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>
                        {state.streak > 0
                            ? `🔥 ${state.streak} ngày liên tiếp — đừng để mất streak!`
                            : '📚 Hãy bắt đầu hành trình học hôm nay!'}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <button
                    onClick={handleStartStudy}
                    style={{
                        flex: 1, padding: '10px', border: 'none', borderRadius: 'var(--radius-full)',
                        background: 'var(--gradient-hero)', color: 'white',
                        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem',
                        cursor: 'pointer',
                    }}
                >
                    📚 Học ngay
                </button>
                <button
                    onClick={handleDismiss}
                    style={{
                        padding: '10px 16px', border: `1px solid ${isEvening ? '#475569' : '#D1D5DB'}`,
                        borderRadius: 'var(--radius-full)', background: 'transparent',
                        color: isEvening ? '#94A3B8' : 'var(--color-text-light)', fontSize: '0.85rem',
                        cursor: 'pointer',
                    }}
                >
                    Để sau
                </button>
            </div>
        </div>
    );
}

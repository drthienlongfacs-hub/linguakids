// CelebrationOverlay.jsx — Track C: Animation & Micro-interactions
// CSS-powered celebration effects (no external dependency needed)
// Confetti, star burst, level-up, streak flame

import { useState, useEffect, useCallback } from 'react';

const CONFETTI_COLORS = ['#FF5722', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#E91E63', '#00BCD4', '#FF9800'];

function ConfettiPiece({ delay, color, left }) {
    return (
        <div style={{
            position: 'absolute', top: '-10px', left: `${left}%`,
            width: `${6 + Math.random() * 8}px`, height: `${6 + Math.random() * 8}px`,
            background: color, borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confettiFall ${1.5 + Math.random() * 1.5}s ease-in forwards`,
            animationDelay: `${delay}s`, opacity: 0,
            transform: `rotate(${Math.random() * 360}deg)`,
        }} />
    );
}

function StarBurst({ count = 8 }) {
    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {Array.from({ length: count }).map((_, i) => {
                const angle = (360 / count) * i;
                return (
                    <div key={i} style={{
                        position: 'absolute', top: '50%', left: '50%',
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
                        animation: `starBurst 0.8s ease-out forwards`,
                        animationDelay: `${i * 0.05}s`,
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(0)`,
                        '--burst-angle': `${angle}deg`,
                    }} />
                );
            })}
        </div>
    );
}

// Type: 'correct' | 'levelup' | 'streak' | 'perfect' | 'badge'
export default function CelebrationOverlay({ type = 'correct', message = '', messageVi = '', onDone, xpGained = 0 }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const t = setTimeout(() => {
            setVisible(false);
            onDone?.();
        }, type === 'levelup' ? 3000 : 2000);
        return () => clearTimeout(t);
    }, [type, onDone]);

    if (!visible) return null;

    const configs = {
        correct: { emoji: '🎉', bg: 'rgba(34,197,94,0.95)', label: 'Correct!', labelVi: 'Đúng rồi!' },
        levelup: { emoji: '⭐', bg: 'linear-gradient(135deg, #4F46E5, #7C3AED)', label: 'Level Up!', labelVi: 'Lên cấp!' },
        streak: { emoji: '🔥', bg: 'rgba(245,158,11,0.95)', label: 'Streak!', labelVi: 'Chuỗi liên tiếp!' },
        perfect: { emoji: '💯', bg: 'linear-gradient(135deg, #059669, #10B981)', label: 'Perfect!', labelVi: 'Hoàn hảo!' },
        badge: { emoji: '🏆', bg: 'linear-gradient(135deg, #D97706, #F59E0B)', label: 'New Badge!', labelVi: 'Huy chương mới!' },
    };
    const cfg = configs[type] || configs.correct;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
            animation: 'fadeIn 0.2s ease',
        }} onClick={() => { setVisible(false); onDone?.(); }}>
            {/* Confetti */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                {Array.from({ length: type === 'levelup' ? 40 : 20 }).map((_, i) => (
                    <ConfettiPiece
                        key={i}
                        delay={Math.random() * 0.5}
                        color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
                        left={Math.random() * 100}
                    />
                ))}
            </div>

            {/* Main card */}
            <div style={{
                background: cfg.bg, borderRadius: '24px', padding: '28px 40px',
                textAlign: 'center', color: '#fff', position: 'relative',
                animation: 'celebBounce 0.5s ease', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                minWidth: '200px',
            }}>
                <StarBurst count={type === 'levelup' ? 12 : 8} />
                <div style={{ fontSize: '3rem', marginBottom: '8px', animation: 'celebSpin 0.6s ease' }}>
                    {cfg.emoji}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '4px' }}>
                    {cfg.label}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: message ? '4px' : 0 }}>
                    {cfg.labelVi}
                </div>
                {message && <div style={{ fontSize: '0.82rem', opacity: 0.8, marginTop: '4px' }}>{message}</div>}
                {xpGained > 0 && (
                    <div style={{
                        marginTop: '8px', padding: '4px 12px', borderRadius: '8px',
                        background: 'rgba(255,255,255,0.2)', fontSize: '0.85rem', fontWeight: 700,
                        display: 'inline-block',
                    }}>
                        +{xpGained} XP
                    </div>
                )}
            </div>

            <style>{`
                @keyframes confettiFall {
                    0% { opacity: 1; transform: translateY(0) rotate(0deg); }
                    100% { opacity: 0; transform: translateY(calc(100vh + 20px)) rotate(720deg); }
                }
                @keyframes celebBounce {
                    0% { transform: scale(0.3) translateY(40px); opacity: 0; }
                    60% { transform: scale(1.1) translateY(-5px); opacity: 1; }
                    100% { transform: scale(1) translateY(0); }
                }
                @keyframes celebSpin {
                    0% { transform: rotate(-20deg) scale(0.5); }
                    50% { transform: rotate(10deg) scale(1.2); }
                    100% { transform: rotate(0) scale(1); }
                }
                @keyframes starBurst {
                    0% { transform: translate(-50%, -50%) translateY(0); opacity: 1; }
                    100% { transform: translate(-50%, -50%) translateY(-80px); opacity: 0; }
                }
            `}</style>
        </div>
    );
}

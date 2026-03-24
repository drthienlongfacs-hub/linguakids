// StarBurst — Enhanced Celebration Engine v3.0 (Dual Mode)
// Kids: playful emoji explosions with cheerful sounds
// Adults: subtle, professional celebrations (checkmarks, minimal particles)
// Evidence: Duolingo +14% 14-day retention via celebrations (Strivecloud 2024)
import { useState, useEffect, useCallback } from 'react';

const CELEBRATION_TYPES = {
    burst: {
        emojis: ['⭐', '🌟', '✨', '💫', '🎉', '🎊', '💖', '🌈'],
        count: 12,
        spread: 40,
        duration: 1500,
    },
    confetti: {
        emojis: ['🎊', '🎉', '🥳', '🎈', '🎁', '💫', '✨', '🎀'],
        count: 20,
        spread: 60,
        duration: 2000,
    },
    fireworks: {
        emojis: ['🎆', '🎇', '✨', '⭐', '💥', '🌟', '💫', '🔥'],
        count: 16,
        spread: 50,
        duration: 2000,
    },
    milestone: {
        emojis: ['🏆', '👑', '🌟', '💎', '🎖️', '🥇', '✨', '🎉', '🎊', '🏅'],
        count: 25,
        spread: 70,
        duration: 3000,
    },
    // Adult-only celebration types
    subtle: {
        emojis: ['✓', '●', '◆', '★'],
        count: 6,
        spread: 25,
        duration: 800,
    },
    checkmark: {
        emojis: ['✓', '✓', '✓', '●'],
        count: 4,
        spread: 15,
        duration: 600,
    },
    achievement: {
        emojis: ['✦', '★', '◆', '●', '✓'],
        count: 8,
        spread: 30,
        duration: 1000,
    },
};

// Map kid celebration types to adult equivalents
const ADULT_TYPE_MAP = {
    burst: 'subtle',
    confetti: 'subtle',
    fireworks: 'achievement',
    milestone: 'achievement',
};

// Kid-friendly celebration sounds using Web Audio API (no external files)
function playCelebrationSound(type = 'burst', isAdult = false) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;

        if (isAdult) {
            // Subtle click/tick for adults
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(1200, now);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.06, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
            return;
        }

        if (type === 'milestone') {
            // Ascending chime melody
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.15, now + i * 0.15);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
                osc.start(now + i * 0.15);
                osc.stop(now + i * 0.15 + 0.4);
            });
        } else {
            // Quick sparkle sound
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    } catch {
        // Audio not available — silent celebration
    }
}

// Haptic feedback  
function triggerHaptic() {
    try {
        if (navigator.vibrate) navigator.vibrate(50);
    } catch {
        // No haptic support
    }
}

export default function StarBurst({ trigger, type = 'burst', isAdult = false }) {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (!trigger) return;

        // Use adult equivalent types when in adult mode
        const effectiveType = isAdult ? (ADULT_TYPE_MAP[type] || type) : type;
        const config = CELEBRATION_TYPES[effectiveType] || CELEBRATION_TYPES.burst;
        const { emojis, count, spread, duration } = config;

        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: Date.now() + i,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            x: 50 + (Math.random() - 0.5) * spread,
            y: 50 + (Math.random() - 0.5) * spread,
            tx: (Math.random() - 0.5) * (isAdult ? 150 : 400),
            ty: (Math.random() - 0.5) * (isAdult ? 150 : 400) - (isAdult ? 50 : 150),
            scale: isAdult ? (0.4 + Math.random() * 0.4) : (0.5 + Math.random() * 1),
            delay: Math.random() * (isAdult ? 100 : 300),
            rotation: Math.random() * (isAdult ? 180 : 720) - (isAdult ? 90 : 360),
        }));

        setParticles(newParticles);
        playCelebrationSound(type, isAdult);
        if (!isAdult) triggerHaptic(); // Skip haptic for adults

        const timer = setTimeout(() => setParticles([]), duration);
        return () => clearTimeout(timer);
    }, [trigger, type, isAdult]);

    if (particles.length === 0) return null;

    return (
        <div className="starburst">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="starburst-particle"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        '--tx': `${p.tx}px`,
                        '--ty': `${p.ty}px`,
                        fontSize: `${p.scale}rem`,
                        animationDelay: `${p.delay}ms`,
                        ...(isAdult && {
                            color: '#818CF8',
                            fontFamily: 'system-ui, sans-serif',
                        }),
                    }}
                >
                    {p.emoji}
                </div>
            ))}
        </div>
    );
}

// Helper hook for triggering celebrations from anywhere
export function useCelebration() {
    const [trigger, setTrigger] = useState(0);
    const [type, setType] = useState('burst');

    const celebrate = useCallback((celebType = 'burst') => {
        setType(celebType);
        setTrigger(t => t + 1);
    }, []);

    return { trigger, type, celebrate };
}

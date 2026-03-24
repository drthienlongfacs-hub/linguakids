import { useState, useEffect } from 'react';

export default function StarBurst({ trigger }) {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (!trigger) return;

        const emojis = ['⭐', '🌟', '✨', '💫', '🎉', '🎊', '💖', '🌈'];
        const newParticles = Array.from({ length: 12 }, (_, i) => ({
            id: Date.now() + i,
            emoji: emojis[Math.floor(Math.random() * emojis.length)],
            x: 50 + (Math.random() - 0.5) * 40,
            y: 50 + (Math.random() - 0.5) * 40,
            tx: (Math.random() - 0.5) * 300,
            ty: (Math.random() - 0.5) * 300 - 100,
        }));

        setParticles(newParticles);
        setTimeout(() => setParticles([]), 1500);
    }, [trigger]);

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
                    }}
                >
                    {p.emoji}
                </div>
            ))}
        </div>
    );
}

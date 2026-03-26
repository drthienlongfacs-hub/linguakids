// ScrollToTop — Floating button that appears on scroll
import { useState, useEffect } from 'react';

export default function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handler = () => setVisible(window.scrollY > 300);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    if (!visible) return null;

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Scroll to top"
            style={{
                position: 'fixed',
                bottom: '80px',
                right: '16px',
                zIndex: 900,
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: 'var(--gradient-hero)',
                color: 'white',
                fontSize: '1.2rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-normal)',
                opacity: visible ? 1 : 0,
            }}
        >
            ↑
        </button>
    );
}

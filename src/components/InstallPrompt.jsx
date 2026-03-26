// PWA Install Prompt — Shows a non-intrusive banner when app can be installed
import { useState, useEffect } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Don't show if already installed or dismissed recently
        const dismissed = localStorage.getItem('pwa-dismiss');
        if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShow(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShow(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShow(false);
        localStorage.setItem('pwa-dismiss', String(Date.now()));
    };

    if (!show) return null;

    return (
        <div className="animate-slide-up" style={{
            position: 'fixed', bottom: '80px', left: '16px', right: '16px',
            zIndex: 1000,
            background: 'linear-gradient(135deg, #6C63FF 0%, #8B5CF6 100%)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: '14px',
            boxShadow: '0 8px 32px rgba(108, 99, 255, 0.3)',
            color: 'white',
        }}>
            <div style={{ fontSize: '2rem', flexShrink: 0 }}>📲</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>
                    Cài LinguaKids!
                </div>
                <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                    Học offline, nhanh hơn, không quảng cáo
                </div>
            </div>
            <button onClick={handleInstall} style={{
                background: 'white', color: '#6C63FF', border: 'none',
                borderRadius: 'var(--radius-full)', padding: '8px 16px',
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0,
            }}>
                Cài đặt
            </button>
            <button onClick={handleDismiss} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)',
                cursor: 'pointer', fontSize: '1.2rem', padding: '4px',
            }}>
                ✕
            </button>
        </div>
    );
}

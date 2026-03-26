// WordOfDay — Shows a new word each day from the vocabulary database
import { useMemo } from 'react';
import { ALL_ENGLISH_WORDS } from '../data/english';
import { useSpeech } from '../hooks/useSpeech';

export default function WordOfDay() {
    const { speakEnglish, isSpeaking } = useSpeech();

    // Deterministic daily word selection based on day-of-year
    const word = useMemo(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 0);
        const dayOfYear = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        const idx = dayOfYear % ALL_ENGLISH_WORDS.length;
        return ALL_ENGLISH_WORDS[idx];
    }, []);

    if (!word) return null;

    return (
        <div
            className="glass-card"
            style={{
                padding: '16px 20px', marginBottom: '16px',
                background: 'linear-gradient(135deg, #3B82F615, #8B5CF615)',
                border: '1px solid #3B82F633',
                cursor: 'pointer',
            }}
            onClick={() => speakEnglish(word.word)}
        >
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '8px',
            }}>
                <span style={{
                    fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1.5px',
                    color: 'var(--color-text-light)', fontWeight: 700,
                }}>
                    📅 Từ vựng hôm nay
                </span>
                <button
                    onClick={(e) => { e.stopPropagation(); speakEnglish(word.word); }}
                    disabled={isSpeaking}
                    style={{
                        background: 'none', border: 'none', fontSize: '1.2rem',
                        cursor: 'pointer', opacity: isSpeaking ? 0.5 : 1,
                    }}
                >
                    🔊
                </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '2rem' }}>{word.emoji}</div>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-display)', fontWeight: 800,
                        fontSize: '1.2rem', color: '#3B82F6',
                    }}>
                        {word.word}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                        {word.vietnamese}
                    </div>
                </div>
            </div>
            {word.example && (
                <div style={{
                    marginTop: '10px', padding: '8px 12px',
                    background: 'rgba(59, 130, 246, 0.06)', borderRadius: '10px',
                    borderLeft: '3px solid #3B82F6',
                }}>
                    <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-text)' }}>
                        💬 {word.example}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                        {word.exampleVi}
                    </div>
                </div>
            )}
        </div>
    );
}

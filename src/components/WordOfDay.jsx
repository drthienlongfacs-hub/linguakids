// WordOfDay — daily highlighted word with standard-bank support in adult mode
import { useMemo } from 'react';
import { ALL_ENGLISH_WORDS } from '../data/english';
import { useGame } from '../context/GameStateContext';
import { usePracticeLexicon } from '../hooks/usePracticeLexicon';
import { useSpeech } from '../hooks/useSpeech';
import { isAdultMode } from '../utils/userMode';

function getDayOfYear() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export default function WordOfDay() {
    const { state } = useGame();
    const { speakEnglish, isSpeaking } = useSpeech();
    const adult = isAdultMode(state.userMode);
    const { items, loading, sourceLabel } = usePracticeLexicon({
        lang: 'en',
        adult,
        fallbackEnglish: ALL_ENGLISH_WORDS,
        fallbackChinese: [],
    });

    const word = useMemo(() => {
        if (!items.length) return null;
        const idx = getDayOfYear() % items.length;
        return items[idx];
    }, [items]);

    if (loading || !word) return null;

    const meaning = word.vietnamese;
    const example = word.example;
    const exampleMeaning = word.exampleVi || word.example;

    return (
        <div
            className="glass-card"
            style={{
                padding: '16px 20px',
                marginBottom: '16px',
                background: adult
                    ? 'linear-gradient(135deg, #0F766E15, #1D4ED815)'
                    : 'linear-gradient(135deg, #3B82F615, #8B5CF615)',
                border: `1px solid ${adult ? '#0F766E33' : '#3B82F633'}`,
                cursor: 'pointer',
            }}
            onClick={() => speakEnglish(word.word)}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
            }}>
                <div>
                    <span style={{
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: '1.5px',
                        color: 'var(--color-text-light)',
                        fontWeight: 700,
                    }}>
                        📅 Từ vựng hôm nay
                    </span>
                    <div style={{ marginTop: '4px', fontSize: '0.75rem', color: 'var(--color-text-light)' }}>
                        {sourceLabel === 'standard' ? 'Standard lexicon' : 'Curriculum'}
                    </div>
                </div>
                <button
                    onClick={(event) => { event.stopPropagation(); speakEnglish(word.word); }}
                    disabled={isSpeaking}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.2rem',
                        cursor: 'pointer',
                        opacity: isSpeaking ? 0.5 : 1,
                    }}
                >
                    🔊
                </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '2rem' }}>{word.emoji}</div>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '1.2rem',
                        color: adult ? '#0F766E' : '#3B82F6',
                    }}>
                        {word.word}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                        {meaning}
                    </div>
                    {adult && word.domainLabel && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                            {word.domainLabel}
                        </div>
                    )}
                </div>
            </div>
            {example && (
                <div style={{
                    marginTop: '10px',
                    padding: '8px 12px',
                    background: adult ? 'rgba(15, 118, 110, 0.06)' : 'rgba(59, 130, 246, 0.06)',
                    borderRadius: '10px',
                    borderLeft: `3px solid ${adult ? '#0F766E' : '#3B82F6'}`,
                }}>
                    <div style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-text)' }}>
                        💬 {example}
                    </div>
                    {exampleMeaning && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                            {exampleMeaning}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// WordDetail.jsx — Rich word card with IPA, audio, definitions, examples
// Powered by FreeDictionaryAPI (free, unlimited, no key)

import { useState, useEffect, useCallback } from 'react';
import { lookupWord, playPronunciation } from '../../services/dictionaryService';
import { getWordProfile } from '../../services/datamuseService';
import { getCEFRLevel, getCEFRColor } from '../../data/cefrData';

const POS_COLORS = {
    noun: '#3B82F6',
    verb: '#22C55E',
    adjective: '#F59E0B',
    adverb: '#A855F7',
    preposition: '#64748B',
    conjunction: '#EC4899',
    interjection: '#EF4444',
    pronoun: '#06B6D4',
    determiner: '#64748B',
};

export default function WordDetail({ word, onClose }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [wordProfile, setWordProfile] = useState(null);
    const cefrLevel = word ? getCEFRLevel(word) : 'C1';
    const cefrColor = getCEFRColor(cefrLevel);

    useEffect(() => {
        if (!word) return;
        setLoading(true);
        lookupWord(word).then(d => {
            setData(d);
            setLoading(false);
        });
        getWordProfile(word).then(setWordProfile).catch(() => { });
    }, [word]);

    const handlePlay = useCallback(async () => {
        if (isPlaying) return;
        setIsPlaying(true);
        await playPronunciation(word);
        setTimeout(() => setIsPlaying(false), 1000);
    }, [word, isPlaying]);

    if (!word) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px', animation: 'fadeIn 0.2s ease',
        }} onClick={onClose}>
            <div style={{
                background: 'linear-gradient(135deg, #1E293B, #0F172A)',
                borderRadius: '20px', padding: '24px', maxWidth: '420px', width: '100%',
                maxHeight: '80vh', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#F8FAFC', fontWeight: 700 }}>{word}</h2>
                            <span style={{
                                padding: '2px 8px', borderRadius: '6px', fontSize: '0.65rem', fontWeight: 700,
                                background: cefrColor.bg, color: cefrColor.text, border: `1px solid ${cefrColor.text}33`,
                            }}>{cefrLevel} · {cefrColor.label}</span>
                        </div>
                        {data?.phonetic && (
                            <span style={{ color: '#818CF8', fontSize: '0.95rem', fontFamily: "'Noto Sans', sans-serif" }}>
                                {data.phonetic}
                            </span>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handlePlay}
                            style={{
                                width: '44px', height: '44px', borderRadius: '50%', border: 'none',
                                background: isPlaying ? 'rgba(129,140,248,0.3)' : 'rgba(129,140,248,0.15)',
                                color: '#A5B4FC', cursor: 'pointer', fontSize: '1.2rem',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s',
                            }}>
                            {isPlaying ? '🔊' : '🔈'}
                        </button>
                        <button onClick={onClose}
                            style={{
                                width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                                background: 'rgba(255,255,255,0.08)', color: '#94A3B8', cursor: 'pointer',
                                fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>✕</button>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>Loading...</div>
                )}

                {/* Not found */}
                {!loading && !data && (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                        No dictionary data found for "{word}"
                    </div>
                )}

                {/* Phonetics with audio */}
                {data?.phonetics?.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        {data.phonetics.filter(p => p.text).map((p, i) => (
                            <button key={i}
                                onClick={() => p.audio && new Audio(p.audio).play()}
                                style={{
                                    padding: '4px 12px', borderRadius: '8px', fontSize: '0.85rem',
                                    background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
                                    color: '#C7D2FE', cursor: p.audio ? 'pointer' : 'default',
                                    fontFamily: "'Noto Sans', sans-serif",
                                }}>
                                {p.audio ? '🔊 ' : ''}{p.text}
                            </button>
                        ))}
                    </div>
                )}

                {/* Meanings */}
                {data?.meanings?.map((m, mIdx) => (
                    <div key={mIdx} style={{ marginBottom: '16px' }}>
                        {/* Part of speech badge */}
                        <div style={{
                            display: 'inline-block', padding: '2px 10px', borderRadius: '6px',
                            fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase',
                            background: `${POS_COLORS[m.partOfSpeech] || '#64748B'}22`,
                            color: POS_COLORS[m.partOfSpeech] || '#94A3B8',
                            border: `1px solid ${POS_COLORS[m.partOfSpeech] || '#64748B'}44`,
                            marginBottom: '8px',
                        }}>
                            {m.partOfSpeech}
                        </div>

                        {/* Definitions */}
                        {m.definitions.map((d, dIdx) => (
                            <div key={dIdx} style={{ marginBottom: '10px', paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.06)' }}>
                                <p style={{ margin: '0 0 4px', fontSize: '0.88rem', color: '#E2E8F0', lineHeight: 1.6 }}>
                                    <span style={{ color: '#64748B', fontSize: '0.75rem', marginRight: '6px' }}>{dIdx + 1}.</span>
                                    {d.definition}
                                </p>
                                {d.example && (
                                    <p style={{ margin: '0 0 4px', fontSize: '0.82rem', color: '#818CF8', fontStyle: 'italic', lineHeight: 1.5 }}>
                                        "{d.example}"
                                    </p>
                                )}
                                {d.synonyms.length > 0 && (
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                                        <span style={{ fontSize: '0.7rem', color: '#64748B' }}>syn:</span>
                                        {d.synonyms.map((s, si) => (
                                            <span key={si} style={{ fontSize: '0.72rem', color: '#22C55E', background: 'rgba(34,197,94,0.1)', padding: '1px 6px', borderRadius: '4px' }}>{s}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Meaning-level synonyms */}
                        {m.synonyms.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Related:</span>
                                {m.synonyms.map((s, si) => (
                                    <span key={si} style={{ fontSize: '0.72rem', color: '#A5B4FC', background: 'rgba(129,140,248,0.1)', padding: '1px 6px', borderRadius: '4px' }}>{s}</span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Datamuse Related Words */}
                {wordProfile && (wordProfile.synonyms.length > 0 || wordProfile.associations.length > 0 || wordProfile.rhymes.length > 0) && (
                    <div style={{ marginTop: '16px', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔗 Related Words</div>

                        {wordProfile.synonyms.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.68rem', color: '#64748B', marginRight: '6px' }}>Synonyms:</span>
                                <div style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {wordProfile.synonyms.map((w, i) => (
                                        <span key={i} style={{ fontSize: '0.72rem', color: '#22C55E', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: '6px' }}>{w}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {wordProfile.antonyms?.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.68rem', color: '#64748B', marginRight: '6px' }}>Antonyms:</span>
                                <div style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {wordProfile.antonyms.map((w, i) => (
                                        <span key={i} style={{ fontSize: '0.72rem', color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '6px' }}>{w}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {wordProfile.associations.length > 0 && (
                            <div style={{ marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.68rem', color: '#64748B', marginRight: '6px' }}>Associated:</span>
                                <div style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {wordProfile.associations.map((w, i) => (
                                        <span key={i} style={{ fontSize: '0.72rem', color: '#F59E0B', background: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '6px' }}>{w}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {wordProfile.rhymes.length > 0 && (
                            <div>
                                <span style={{ fontSize: '0.68rem', color: '#64748B', marginRight: '6px' }}>Rhymes:</span>
                                <div style={{ display: 'inline-flex', gap: '4px', flexWrap: 'wrap' }}>
                                    {wordProfile.rhymes.map((w, i) => (
                                        <span key={i} style={{ fontSize: '0.72rem', color: '#A855F7', background: 'rgba(168,85,247,0.1)', padding: '2px 8px', borderRadius: '6px' }}>{w}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Source */}
                {data?.sourceUrls?.[0] && (
                    <div style={{ marginTop: '12px', fontSize: '0.7rem', color: '#475569' }}>
                        Source: <a href={data.sourceUrls[0]} target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8' }}>{data.sourceUrls[0]}</a>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
}

import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { loadStandardLexicon, loadStandardLexiconMeta, normalizeLexiconLang } from '../services/standardLexiconService';

const EMPTY_ENTRIES = [];

function formatCount(value) {
    return Number(value || 0).toLocaleString('en-US');
}

function badgeStyle(color) {
    return {
        background: `${color}15`,
        color,
        border: `1px solid ${color}33`,
        borderRadius: '999px',
        padding: '4px 10px',
        fontSize: '0.72rem',
        fontWeight: 700,
    };
}

export default function StandardLexicon() {
    const navigate = useNavigate();
    const { lang = 'en' } = useParams();
    const normalizedLang = normalizeLexiconLang(lang);
    const isEnglish = normalizedLang === 'en';

    const [payloadByLang, setPayloadByLang] = useState({});
    const [query, setQuery] = useState('');
    const [domain, setDomain] = useState('all');
    const [partOfSpeech, setPartOfSpeech] = useState('all');

    const deferredQuery = useDeferredValue(query);
    const currentPayload = payloadByLang[normalizedLang];
    const entries = currentPayload?.entries || EMPTY_ENTRIES;
    const meta = currentPayload?.meta || null;
    const loading = !currentPayload;

    useEffect(() => {
        let cancelled = false;
        if (payloadByLang[normalizedLang]) {
            return () => {
                cancelled = true;
            };
        }

        Promise.all([
            loadStandardLexiconMeta(),
            loadStandardLexicon(normalizedLang),
        ]).then(([metaPayload, entriesPayload]) => {
            if (cancelled) return;
            startTransition(() => {
                setPayloadByLang((previous) => ({
                    ...previous,
                    [normalizedLang]: {
                        meta: metaPayload,
                        entries: entriesPayload,
                    },
                }));
            });
        }).catch(() => {
            if (cancelled) return;
            startTransition(() => {
                setPayloadByLang((previous) => ({
                    ...previous,
                    [normalizedLang]: {
                        meta: null,
                        entries: [],
                    },
                }));
            });
        });

        return () => {
            cancelled = true;
        };
    }, [normalizedLang, payloadByLang]);

    const domainOptions = useMemo(() => {
        const counts = new Map();
        entries.forEach((entry) => {
            counts.set(entry.domainLabel, (counts.get(entry.domainLabel) || 0) + 1);
        });
        return [...counts.entries()]
            .sort((left, right) => right[1] - left[1])
            .slice(0, 14)
            .map(([label, count]) => ({ label, count }));
    }, [entries]);

    const partOfSpeechOptions = useMemo(() => {
        const counts = new Map();
        entries.forEach((entry) => {
            counts.set(entry.partOfSpeech, (counts.get(entry.partOfSpeech) || 0) + 1);
        });
        return [...counts.entries()]
            .sort((left, right) => right[1] - left[1])
            .map(([label, count]) => ({ label, count }));
    }, [entries]);

    const filtered = useMemo(() => {
        const q = deferredQuery.trim().toLowerCase();
        return entries.filter((entry) => {
            if (domain !== 'all' && entry.domainLabel !== domain) return false;
            if (partOfSpeech !== 'all' && entry.partOfSpeech !== partOfSpeech) return false;
            if (!q) return true;

            const haystack = isEnglish
                ? `${entry.word} ${entry.definition} ${entry.domainLabel} ${entry.englishSynonyms?.join(' ')}`
                : `${entry.character} ${entry.pinyin} ${entry.vietnamese} ${entry.definition} ${entry.domainLabel}`;

            return haystack.toLowerCase().includes(q);
        }).slice(0, 200);
    }, [deferredQuery, domain, entries, isEnglish, partOfSpeech]);

    const langMeta = meta?.[isEnglish ? 'english' : 'chinese'];

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate(isEnglish ? '/english' : '/chinese')}>←</button>
                <h2 className="page-header__title">{isEnglish ? '🗂️ English Standard Lexicon' : '🗂️ Chinese Standard Lexicon'}</h2>
                <div className="xp-badge">{langMeta ? `${formatCount(langMeta.total)} mục` : '...'}</div>
            </div>

            <div style={{
                background: 'var(--color-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)',
                padding: '16px',
                marginBottom: '16px',
                boxShadow: 'var(--shadow-md)',
            }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span style={badgeStyle(isEnglish ? '#3B82F6' : '#EF4444')}>
                        {formatCount(langMeta?.total)} mục chuẩn
                    </span>
                    <span style={badgeStyle('#10B981')}>
                        {formatCount(langMeta?.practice)} mục luyện tập
                    </span>
                    {meta?.comparison?.upgradedCombinedMultiplier && (
                        <span style={badgeStyle('#8B5CF6')}>
                            {meta.comparison.upgradedCombinedMultiplier}x core vocab hiện tại
                        </span>
                    )}
                </div>

                <p style={{ margin: 0, color: 'var(--color-text-light)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                    {isEnglish
                        ? 'Nguồn chuẩn hóa: Open English WordNet + CMUdict. Dùng để tra cứu, mở rộng vốn từ và cấp dữ liệu luyện tập lớn hơn nhiều so với curriculum hardcode.'
                        : 'Nguồn chuẩn hóa: CC-CEDICT + Chinese Open Wordnet. Phần gloss đang ưu tiên gloss tiếng Anh gốc để giữ tính nhất quán từ nguồn từ điển chuẩn.'}
                </p>
            </div>

            <div style={{ display: 'grid', gap: '10px', marginBottom: '16px' }}>
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={isEnglish ? 'Search word, definition, domain...' : 'Tìm chữ, pinyin, gloss...'}
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-card)',
                        color: 'var(--color-text)',
                        fontSize: '1rem',
                    }}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <select
                        value={domain}
                        onChange={(event) => setDomain(event.target.value)}
                        style={{
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-card)',
                            color: 'var(--color-text)',
                        }}
                    >
                        <option value="all">Tat ca nhom</option>
                        {domainOptions.map((option) => (
                            <option key={option.label} value={option.label}>
                                {option.label} ({formatCount(option.count)})
                            </option>
                        ))}
                    </select>

                    <select
                        value={partOfSpeech}
                        onChange={(event) => setPartOfSpeech(event.target.value)}
                        style={{
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-card)',
                            color: 'var(--color-text)',
                        }}
                    >
                        <option value="all">Tat ca tu loai</option>
                        {partOfSpeechOptions.map((option) => (
                            <option key={option.label} value={option.label}>
                                {option.label} ({formatCount(option.count)})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-light)' }}>
                    Dang tai kho du lieu chuan...
                </div>
            ) : (
                <>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '12px',
                        color: 'var(--color-text-light)',
                        fontSize: '0.85rem',
                    }}>
                        <span>{formatCount(filtered.length)} ket qua dang hien</span>
                        {meta?.generatedAt && (
                            <span>Generated {new Date(meta.generatedAt).toLocaleDateString('en-US')}</span>
                        )}
                    </div>

                    <div style={{ display: 'grid', gap: '10px' }}>
                        {filtered.map((entry) => (
                            <div
                                key={entry.id}
                                style={{
                                    background: 'var(--color-card)',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: 'var(--radius-xl)',
                                    padding: '14px 16px',
                                    boxShadow: 'var(--shadow-sm)',
                                }}
                            >
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    marginBottom: '8px',
                                }}>
                                    <div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            flexWrap: 'wrap',
                                            marginBottom: '4px',
                                        }}>
                                            <span style={{ fontSize: '1.25rem' }}>{entry.emoji}</span>
                                            <span style={{
                                                fontFamily: 'var(--font-display)',
                                                fontSize: isEnglish ? '1.15rem' : '1.35rem',
                                                fontWeight: 800,
                                                color: isEnglish ? 'var(--color-english)' : 'var(--color-chinese)',
                                            }}>
                                                {isEnglish ? entry.word : entry.character}
                                            </span>
                                            <span style={badgeStyle('#64748B')}>{entry.partOfSpeech}</span>
                                        </div>
                                        <div style={{ color: 'var(--color-text-light)', fontSize: '0.86rem' }}>
                                            {isEnglish
                                                ? (entry.pronunciation || 'No IPA')
                                                : `${entry.pinyin || 'No pinyin'}${entry.englishSynonyms?.[0] ? ` · ${entry.englishSynonyms[0]}` : ''}`}
                                        </div>
                                    </div>
                                    <span style={badgeStyle(isEnglish ? '#3B82F6' : '#EF4444')}>
                                        {entry.domainLabel}
                                    </span>
                                </div>

                                <div style={{ lineHeight: 1.65, fontSize: '0.92rem', color: 'var(--color-text)' }}>
                                    {isEnglish ? entry.definition : entry.vietnamese}
                                </div>

                                {entry.example && (
                                    <div style={{
                                        marginTop: '8px',
                                        color: 'var(--color-text-light)',
                                        fontSize: '0.82rem',
                                        fontStyle: 'italic',
                                        lineHeight: 1.55,
                                    }}>
                                        {entry.example}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {meta?.sources?.length > 0 && (
                <div style={{ marginTop: '20px', display: 'grid', gap: '10px' }}>
                    {meta.sources.map((source) => (
                        <a
                            key={source.id}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                textDecoration: 'none',
                                color: 'inherit',
                                background: 'var(--color-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-lg)',
                                padding: '12px 14px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 700 }}>{source.label}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{source.license}</div>
                            </div>
                            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Open ↗</span>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
}

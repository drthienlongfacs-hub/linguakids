import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { isAdultMode } from '../utils/userMode';
import { loadStandardLexiconLookup } from '../services/standardLexiconService';
import WordDetail from '../components/WordDetail';

function getMastery(word, now) {
    const { reviewCount = 0, ef = 2.5, nextReview = 0 } = word;
    const overdue = nextReview < now;

    if (reviewCount >= 5 && ef >= 2.3 && !overdue) return 'mastered';
    if (reviewCount >= 2 && ef >= 2.0 && !overdue) return 'learning';
    if (overdue) return 'due';
    if (reviewCount >= 1) return 'learning';
    return 'new';
}

const MASTERY_CONFIG = {
    mastered: { label: 'Mastered', labelVi: 'Thuộc', color: '#22C55E', bg: '#22C55E15', icon: '🌟' },
    learning: { label: 'Learning', labelVi: 'Đang học', color: '#F59E0B', bg: '#F59E0B15', icon: '📖' },
    due: { label: 'Due', labelVi: 'Cần ôn', color: '#EF4444', bg: '#EF444415', icon: '🔔' },
    new: { label: 'New', labelVi: 'Mới', color: '#6366F1', bg: '#6366F115', icon: '✨' },
};

function pickLookup(word, lookupsByLang) {
    if (word.lang === 'en') {
        return lookupsByLang.en?.[word.word.toLowerCase()] || null;
    }
    return lookupsByLang.cn?.[word.word] || null;
}

export default function VocabularyDashboard() {
    const navigate = useNavigate();
    const { wordsLearned, userMode, reviewWord } = useGameStore();
    const adult = isAdultMode(userMode);
    const [mountedAt] = useState(() => Date.now());
    const [lookupsByLang, setLookupsByLang] = useState({ en: null, cn: null, ready: false });

    const [filter, setFilter] = useState('all');
    const [langFilter, setLangFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedWord, setSelectedWord] = useState(null);
    const [reviewMode, setReviewMode] = useState(false);
    const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        if (!adult || lookupsByLang.ready) return;

        let cancelled = false;
        Promise.all([
            loadStandardLexiconLookup('en'),
            loadStandardLexiconLookup('cn'),
        ]).then(([englishLookup, chineseLookup]) => {
            if (cancelled) return;
            setLookupsByLang({ en: englishLookup, cn: chineseLookup, ready: true });
        }).catch(() => {
            if (cancelled) return;
            setLookupsByLang({ en: {}, cn: {}, ready: true });
        });

        return () => {
            cancelled = true;
        };
    }, [adult, lookupsByLang.ready]);

    const enrichedWordsLearned = useMemo(() => {
        return wordsLearned.map((word) => {
            const lookup = adult ? pickLookup(word, lookupsByLang) : null;
            return {
                ...word,
                lookup,
            };
        });
    }, [adult, lookupsByLang, wordsLearned]);

    const categorized = useMemo(() => {
        const result = { mastered: [], learning: [], due: [], new: [] };
        enrichedWordsLearned.forEach((word) => {
            const mastery = getMastery(word, mountedAt);
            result[mastery].push({ ...word, mastery });
        });
        return result;
    }, [enrichedWordsLearned, mountedAt]);

    const displayed = useMemo(() => {
        let words = filter === 'all'
            ? [...categorized.due, ...categorized.new, ...categorized.learning, ...categorized.mastered]
            : categorized[filter] || [];

        if (langFilter !== 'all') {
            words = words.filter((word) => word.lang === langFilter);
        }

        if (search.trim()) {
            const query = search.toLowerCase();
            words = words.filter((word) => {
                const lookup = word.lookup || {};
                const haystack = `${word.word} ${lookup.vietnamese || ''} ${lookup.definition || ''} ${lookup.pinyin || ''} ${lookup.domainLabel || ''}`;
                return haystack.toLowerCase().includes(query);
            });
        }

        return words;
    }, [categorized, filter, langFilter, search]);

    const dueWords = useMemo(() => categorized.due, [categorized]);
    const totalWords = wordsLearned.length;
    const masteredCount = categorized.mastered.length;
    const dueCount = categorized.due.length;
    const masteryPercent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
    const avgRetention = useMemo(() => {
        if (!totalWords) return 0;
        const total = wordsLearned.reduce((sum, word) => sum + Math.min(((word.ef || 2.5) / 2.5) * 100, 100), 0);
        return Math.round(total / totalWords);
    }, [wordsLearned, totalWords]);

    function handleReview(quality) {
        const word = dueWords[currentReviewIdx];
        if (word) {
            reviewWord(word.word, word.lang, quality);
        }
        setShowAnswer(false);
        if (currentReviewIdx + 1 < dueWords.length) {
            setCurrentReviewIdx((value) => value + 1);
        } else {
            setReviewMode(false);
            setCurrentReviewIdx(0);
        }
    }

    if (reviewMode && dueWords.length > 0) {
        const word = dueWords[currentReviewIdx];
        const lookup = word.lookup || null;
        return (
            <div className="vocabulary-dashboard page">
                <div className="lh-header">
                    <button className="lh-back" onClick={() => setReviewMode(false)}>←</button>
                    <h2 className="lh-title">🔄 {adult ? 'Review' : 'Ôn tập'}</h2>
                </div>

                <div className="sp-progress">
                    <span>{currentReviewIdx + 1} / {dueWords.length}</span>
                    <div className="dictation-progress-bar">
                        <div className="dictation-progress-fill" style={{ width: `${((currentReviewIdx + 1) / dueWords.length) * 100}%` }} />
                    </div>
                </div>

                <div className="vocab-review-card">
                    <div className="vocab-review-word">{word.word}</div>
                    <div className="vocab-review-lang">{word.lang === 'en' ? '🇬🇧 English' : '🇨🇳 Chinese'}</div>

                    {!showAnswer ? (
                        <button className="vocab-show-btn" onClick={() => setShowAnswer(true)}>
                            {adult ? 'Show Answer' : 'Xem đáp án'}
                        </button>
                    ) : (
                        <>
                            <div style={{
                                marginTop: '14px',
                                padding: '14px',
                                borderRadius: '14px',
                                background: 'rgba(255,255,255,0.06)',
                                textAlign: 'left',
                            }}>
                                {lookup ? (
                                    <>
                                        <div style={{ fontWeight: 700, marginBottom: '6px' }}>
                                            {word.lang === 'en' ? (lookup.vietnamese || lookup.definition) : (lookup.vietnamese || lookup.definition)}
                                        </div>
                                        {lookup.pinyin && (
                                            <div style={{ fontSize: '0.9rem', color: '#FCA5A5', marginBottom: '4px' }}>
                                                {lookup.pinyin}
                                            </div>
                                        )}
                                        {lookup.domainLabel && (
                                            <div style={{ fontSize: '0.82rem', color: 'var(--color-text-light)', marginBottom: '4px' }}>
                                                {lookup.domainLabel}
                                            </div>
                                        )}
                                        {lookup.example && (
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontStyle: 'italic' }}>
                                                {lookup.example}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{ color: 'var(--color-text-light)' }}>
                                        {adult ? 'No standard metadata available for this word yet.' : 'Chưa có dữ liệu mở rộng cho từ này.'}
                                    </div>
                                )}
                            </div>

                            <div className="vocab-rating-section">
                                <p className="vocab-rating-label">{adult ? 'How well did you remember?' : 'Bạn nhớ tốt không?'}</p>
                                <div className="vocab-rating-btns">
                                    <button className="vocab-rate-btn forgot" onClick={() => handleReview(1)}>
                                        😵 {adult ? 'Forgot' : 'Quên'}
                                    </button>
                                    <button className="vocab-rate-btn hard" onClick={() => handleReview(3)}>
                                        😤 {adult ? 'Hard' : 'Khó'}
                                    </button>
                                    <button className="vocab-rate-btn good" onClick={() => handleReview(4)}>
                                        😊 {adult ? 'Good' : 'Tốt'}
                                    </button>
                                    <button className="vocab-rate-btn easy" onClick={() => handleReview(5)}>
                                        🌟 {adult ? 'Easy' : 'Dễ'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="vocabulary-dashboard page">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/')}>←</button>
                <h2 className="lh-title">📚 {adult ? 'Vocabulary' : 'Từ vựng'}</h2>
            </div>

            {adult && (
                <div style={{
                    marginBottom: '14px',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.18)',
                    color: 'var(--color-text-light)',
                    fontSize: '0.86rem',
                }}>
                    {lookupsByLang.ready
                        ? 'Metadata đang lấy từ standard lexicon cho English và Chinese.'
                        : 'Đang tải metadata từ standard lexicon...'}
                </div>
            )}

            <div className="vocab-stats-grid">
                <div className="vocab-stat-card">
                    <span className="vocab-stat-icon">📚</span>
                    <span className="vocab-stat-number">{totalWords}</span>
                    <span className="vocab-stat-label">{adult ? 'Total Words' : 'Tổng từ'}</span>
                </div>
                <div className="vocab-stat-card">
                    <span className="vocab-stat-icon">🌟</span>
                    <span className="vocab-stat-number">{masteryPercent}%</span>
                    <span className="vocab-stat-label">{adult ? 'Mastered' : 'Thuộc'}</span>
                </div>
                <div className="vocab-stat-card">
                    <span className="vocab-stat-icon">🧠</span>
                    <span className="vocab-stat-number">{avgRetention}%</span>
                    <span className="vocab-stat-label">{adult ? 'Retention' : 'Ghi nhớ'}</span>
                </div>
                <div className="vocab-stat-card highlight">
                    <span className="vocab-stat-icon">🔔</span>
                    <span className="vocab-stat-number">{dueCount}</span>
                    <span className="vocab-stat-label">{adult ? 'Due Today' : 'Cần ôn'}</span>
                </div>
            </div>

            {dueCount > 0 && (
                <button className="vocab-review-cta" onClick={() => { setReviewMode(true); setCurrentReviewIdx(0); }}>
                    🔄 {adult ? `Review ${dueCount} Due Words` : `Ôn ${dueCount} từ cần luyện`}
                </button>
            )}

            <div className="vocab-filter-row">
                {['all', 'due', 'new', 'learning', 'mastered'].map((item) => {
                    const count = item === 'all' ? totalWords : categorized[item]?.length || 0;
                    const config = item === 'all'
                        ? { label: adult ? 'All' : 'Tất cả', icon: '📋', color: '#6366F1' }
                        : { ...MASTERY_CONFIG[item], label: adult ? MASTERY_CONFIG[item].label : MASTERY_CONFIG[item].labelVi };
                    return (
                        <button
                            key={item}
                            className={`vocab-filter-btn ${filter === item ? 'active' : ''}`}
                            onClick={() => setFilter(item)}
                            style={{ '--filter-color': config.color }}
                        >
                            {config.icon} {config.label} ({count})
                        </button>
                    );
                })}
            </div>

            <div className="vocab-search-row">
                <div className="vocab-lang-toggle">
                    {['all', 'en', 'cn'].map((item) => (
                        <button
                            key={item}
                            className={`vocab-lang-btn ${langFilter === item ? 'active' : ''}`}
                            onClick={() => setLangFilter(item)}
                        >
                            {item === 'all' ? '🌐' : item === 'en' ? '🇬🇧' : '🇨🇳'}
                        </button>
                    ))}
                </div>
                <input
                    className="vocab-search-input"
                    placeholder={adult ? 'Search words, gloss, pinyin...' : 'Tìm từ...'}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            <div className="vocab-word-list">
                {displayed.length === 0 ? (
                    <div className="vocab-empty">
                        <span style={{ fontSize: '3rem' }}>📝</span>
                        <p>{adult ? 'No words found. Start learning to build your vocabulary!' : 'Chưa có từ nào. Bắt đầu học nhé!'}</p>
                    </div>
                ) : (
                    displayed.map((word, index) => {
                        const config = MASTERY_CONFIG[word.mastery];
                        const daysUntilReview = Math.max(0, Math.ceil(((word.nextReview || mountedAt) - mountedAt) / (24 * 3600 * 1000)));
                        const lookup = word.lookup || null;

                        return (
                            <div
                                key={`${word.word}-${word.lang}-${index}`}
                                className="vocab-word-card"
                                onClick={() => word.lang === 'en' && setSelectedWord(word.word)}
                                style={{ cursor: word.lang === 'en' ? 'pointer' : 'default' }}
                            >
                                <div className="vocab-word-left">
                                    <span className="vocab-word-text">{word.word}</span>
                                    <span className="vocab-word-lang">{word.lang === 'en' ? '🇬🇧' : '🇨🇳'}</span>
                                </div>
                                <div className="vocab-word-right">
                                    <span className="vocab-mastery-badge" style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}30` }}>
                                        {config.icon} {adult ? config.label : config.labelVi}
                                    </span>
                                    <span className="vocab-word-meta">
                                        {word.reviewCount || 0}× · {word.mastery === 'due' ? (adult ? 'Due now' : 'Cần ôn') : `${daysUntilReview}d`}
                                    </span>
                                </div>

                                {lookup && (
                                    <div style={{ marginTop: '8px', color: 'var(--color-text-light)', fontSize: '0.82rem', lineHeight: 1.55 }}>
                                        {lookup.pinyin && <div>{lookup.pinyin}</div>}
                                        <div>{lookup.vietnamese || lookup.definition}</div>
                                        {lookup.domainLabel && <div>{lookup.domainLabel}</div>}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {selectedWord && (
                <WordDetail word={selectedWord} onClose={() => setSelectedWord(null)} />
            )}
        </div>
    );
}

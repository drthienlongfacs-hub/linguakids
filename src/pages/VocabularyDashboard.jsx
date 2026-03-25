import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/useGameStore';
import { isAdultMode } from '../utils/userMode';
import WordDetail from '../components/WordDetail';

// Mastery classification based on FSRS review data
function getMastery(word) {
    const { reviewCount = 0, ef = 2.5, lastReviewQuality = 0, nextReview = 0 } = word;
    const now = Date.now();
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

export default function VocabularyDashboard() {
    const navigate = useNavigate();
    const { wordsLearned, userMode, reviewWord } = useGameStore();
    const adult = isAdultMode(userMode);

    const [filter, setFilter] = useState('all');
    const [langFilter, setLangFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedWord, setSelectedWord] = useState(null);
    const [reviewMode, setReviewMode] = useState(false);
    const [currentReviewIdx, setCurrentReviewIdx] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    // Categorize all words
    const categorized = useMemo(() => {
        const result = { mastered: [], learning: [], due: [], new: [] };
        wordsLearned.forEach(w => {
            const m = getMastery(w);
            result[m].push({ ...w, mastery: m });
        });
        return result;
    }, [wordsLearned]);

    // Filter + search
    const displayed = useMemo(() => {
        let words = filter === 'all'
            ? [...categorized.due, ...categorized.new, ...categorized.learning, ...categorized.mastered]
            : categorized[filter] || [];

        if (langFilter !== 'all') {
            words = words.filter(w => w.lang === langFilter);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            words = words.filter(w => w.word.toLowerCase().includes(q));
        }
        return words;
    }, [categorized, filter, langFilter, search]);

    // Due words for review
    const dueWords = useMemo(() => categorized.due, [categorized]);

    // Stats
    const totalWords = wordsLearned.length;
    const masteredCount = categorized.mastered.length;
    const dueCount = categorized.due.length;
    const masteryPercent = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;
    const avgRetention = useMemo(() => {
        if (!totalWords) return 0;
        const total = wordsLearned.reduce((sum, w) => sum + Math.min((w.ef || 2.5) / 2.5 * 100, 100), 0);
        return Math.round(total / totalWords);
    }, [wordsLearned, totalWords]);

    // Review mode
    const handleReview = (quality) => {
        const word = dueWords[currentReviewIdx];
        if (word) {
            reviewWord(word.word, word.lang, quality);
        }
        setShowAnswer(false);
        if (currentReviewIdx + 1 < dueWords.length) {
            setCurrentReviewIdx(i => i + 1);
        } else {
            setReviewMode(false);
            setCurrentReviewIdx(0);
        }
    };

    // ========== REVIEW MODE ==========
    if (reviewMode && dueWords.length > 0) {
        const word = dueWords[currentReviewIdx];
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
                    )}
                </div>
            </div>
        );
    }

    // ========== MAIN DASHBOARD ==========
    return (
        <div className="vocabulary-dashboard page">
            <div className="lh-header">
                <button className="lh-back" onClick={() => navigate('/')}>←</button>
                <h2 className="lh-title">📚 {adult ? 'Vocabulary' : 'Từ vựng'}</h2>
            </div>

            {/* Stats Overview */}
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

            {/* Review CTA */}
            {dueCount > 0 && (
                <button className="vocab-review-cta" onClick={() => { setReviewMode(true); setCurrentReviewIdx(0); }}>
                    🔄 {adult ? `Review ${dueCount} Due Words` : `Ôn ${dueCount} từ cần luyện`}
                </button>
            )}

            {/* Mastery Filter */}
            <div className="vocab-filter-row">
                {['all', 'due', 'new', 'learning', 'mastered'].map(f => {
                    const count = f === 'all' ? totalWords : categorized[f]?.length || 0;
                    const config = f === 'all'
                        ? { label: adult ? 'All' : 'Tất cả', icon: '📋', color: '#6366F1' }
                        : { ...MASTERY_CONFIG[f], label: adult ? MASTERY_CONFIG[f].label : MASTERY_CONFIG[f].labelVi };
                    return (
                        <button
                            key={f}
                            className={`vocab-filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                            style={{ '--filter-color': config.color }}
                        >
                            {config.icon} {config.label} ({count})
                        </button>
                    );
                })}
            </div>

            {/* Language Filter + Search */}
            <div className="vocab-search-row">
                <div className="vocab-lang-toggle">
                    {['all', 'en', 'cn'].map(l => (
                        <button key={l} className={`vocab-lang-btn ${langFilter === l ? 'active' : ''}`}
                            onClick={() => setLangFilter(l)}>
                            {l === 'all' ? '🌐' : l === 'en' ? '🇬🇧' : '🇨🇳'}
                        </button>
                    ))}
                </div>
                <input
                    className="vocab-search-input"
                    placeholder={adult ? 'Search words...' : 'Tìm từ...'}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Word List */}
            <div className="vocab-word-list">
                {displayed.length === 0 ? (
                    <div className="vocab-empty">
                        <span style={{ fontSize: '3rem' }}>📝</span>
                        <p>{adult ? 'No words found. Start learning to build your vocabulary!' : 'Chưa có từ nào. Bắt đầu học nhé!'}</p>
                    </div>
                ) : (
                    displayed.map((w, i) => {
                        const config = MASTERY_CONFIG[w.mastery];
                        const daysUntilReview = Math.max(0, Math.ceil((w.nextReview - Date.now()) / (24 * 3600 * 1000)));
                        return (
                            <div key={`${w.word}-${w.lang}-${i}`} className="vocab-word-card"
                                onClick={() => w.lang === 'en' && setSelectedWord(w.word)}
                                style={{ cursor: w.lang === 'en' ? 'pointer' : 'default' }}>
                                <div className="vocab-word-left">
                                    <span className="vocab-word-text">{w.word}</span>
                                    <span className="vocab-word-lang">{w.lang === 'en' ? '🇬🇧' : '🇨🇳'}</span>
                                </div>
                                <div className="vocab-word-right">
                                    <span className="vocab-mastery-badge" style={{ background: config.bg, color: config.color, border: `1px solid ${config.color}30` }}>
                                        {config.icon} {adult ? config.label : config.labelVi}
                                    </span>
                                    <span className="vocab-word-meta">
                                        {w.reviewCount || 0}× · {w.mastery === 'due' ? (adult ? 'Due now' : 'Cần ôn') : `${daysUntilReview}d`}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* WordDetail Modal */}
            {selectedWord && (
                <WordDetail word={selectedWord} onClose={() => setSelectedWord(null)} />
            )}
        </div>
    );
}

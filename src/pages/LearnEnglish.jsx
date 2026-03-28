import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { ENGLISH_TOPICS } from '../data/english';
import { isAdultMode } from '../utils/userMode';
import { loadStandardLexiconMeta } from '../services/standardLexiconService';

export default function LearnEnglish() {
    const navigate = useNavigate();
    const { state } = useGame();
    const isAdult = isAdultMode(state.userMode);
    const [standardCount, setStandardCount] = useState(null);

    useEffect(() => {
        let cancelled = false;
        loadStandardLexiconMeta()
            .then((meta) => {
                if (!cancelled) {
                    setStandardCount(meta?.english?.total || null);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setStandardCount(null);
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    // Filter topics by mode: kids see only kids topics, adults see all topics
    const filteredTopics = isAdult
        ? ENGLISH_TOPICS  // Adults see ALL topics (kids basics + adult)
        : ENGLISH_TOPICS.filter(t => !t.mode || t.mode !== 'adult');  // Kids see only non-adult

    const getTopicProgress = (topicId, totalWords) => {
        const learned = state.wordsLearned.filter(
            w => w.lang === 'en' && ENGLISH_TOPICS.find(t => t.id === topicId)?.words.some(tw => tw.word === w.word)
        ).length;
        return { learned, total: totalWords, pct: totalWords > 0 ? (learned / totalWords) * 100 : 0 };
    };

    // Separate topics into sections for adult mode
    const kidsTopics = filteredTopics.filter(t => !t.mode || t.mode !== 'adult');
    const adultTopics = filteredTopics.filter(t => t.mode === 'adult');

    const renderTopicCard = (topic, i) => {
        const prog = getTopicProgress(topic.id, topic.words.length);
        return (
            <Link
                key={topic.id}
                to={`/lesson/en/${topic.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
            >
                <div
                    className={`topic-card animate-slide-up delay-${i % 5 + 1}`}
                    style={{ borderColor: prog.pct === 100 ? 'var(--color-success)' : undefined }}
                >
                    {prog.pct === 100 && (
                        <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '1.2rem' }}>✅</div>
                    )}
                    <div className="topic-card__emoji">{topic.emoji}</div>
                    <div className="topic-card__title">{topic.title}</div>
                    <div className="topic-card__count">{topic.words.length} từ</div>
                    {topic.mode === 'adult' && (
                        <div style={{
                            fontSize: '0.6rem', color: '#818CF8', fontWeight: 600,
                            background: 'rgba(129,140,248,0.1)', padding: '2px 6px',
                            borderRadius: '4px', marginTop: '2px',
                        }}>B1-B2</div>
                    )}
                    <div className="topic-card__progress">
                        <div
                            className="topic-card__progress-fill"
                            style={{
                                width: `${prog.pct}%`,
                                background: prog.pct === 100 ? 'var(--color-success)' : 'var(--color-english)',
                            }}
                        />
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">{isAdult ? '🇬🇧 English' : '🇬🇧 Tiếng Anh'}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <p style={{
                textAlign: 'center',
                color: 'var(--color-text-light)',
                marginBottom: '24px',
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem'
            }}>
                {isAdult
                    ? `${filteredTopics.length} chủ đề · ${filteredTopics.reduce((a, t) => a + t.words.length, 0)} từ curriculum · ${standardCount ? standardCount.toLocaleString('en-US') : '...'} mục lexicon chuẩn`
                    : 'Chọn chủ đề để bắt đầu học nào! 🎯'}
            </p>

            <div className="topic-grid" style={{ marginBottom: '20px' }}>
                <div
                    className="topic-card"
                    onClick={() => navigate('/lexicon/en')}
                    style={{ cursor: 'pointer', textAlign: 'center', padding: '16px 12px' }}
                >
                    <div className="topic-card__emoji">🗂️</div>
                    <div className="topic-card__title">{isAdult ? 'Standard Lexicon' : 'Kho dữ liệu chuẩn'}</div>
                    <div className="topic-card__count">
                        {standardCount ? `${standardCount.toLocaleString('en-US')} mục` : 'Đang tải...'}
                    </div>
                </div>
            </div>

            {/* Adult mode: show sections */}
            {isAdult && adultTopics.length > 0 && (
                <>
                    <h3 style={{
                        fontFamily: 'var(--font-display)', fontSize: '1rem',
                        color: 'var(--color-primary)', marginBottom: '12px',
                        borderBottom: '1px solid var(--color-border)', paddingBottom: '8px',
                    }}>
                        💼 Professional · B1-B2
                    </h3>
                    <div className="topic-grid" style={{ marginBottom: '24px' }}>
                        {adultTopics.map((topic, i) => renderTopicCard(topic, i))}
                    </div>
                    <h3 style={{
                        fontFamily: 'var(--font-display)', fontSize: '1rem',
                        color: 'var(--color-text-light)', marginBottom: '12px',
                        borderBottom: '1px solid var(--color-border)', paddingBottom: '8px',
                    }}>
                        📚 Foundation · A1-A2
                    </h3>
                </>
            )}

            <div className="topic-grid">
                {kidsTopics.map((topic, i) => renderTopicCard(topic, i))}
            </div>
        </div>
    );
}

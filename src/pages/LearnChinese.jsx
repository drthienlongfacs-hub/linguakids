import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { CHINESE_TOPICS } from '../data/chinese';
import { isAdultMode } from '../utils/userMode';
import { loadStandardLexiconMeta } from '../services/standardLexiconService';
import { loadStandardTopicBank } from '../services/standardTopicService';

export default function LearnChinese() {
    const navigate = useNavigate();
    const { state } = useGame();
    const isAdult = isAdultMode(state.userMode);
    const [standardCount, setStandardCount] = useState(null);
    const [foundationTopics, setFoundationTopics] = useState(
        CHINESE_TOPICS.filter(t => !t.mode || t.mode !== 'adult')
    );

    useEffect(() => {
        let cancelled = false;
        loadStandardLexiconMeta()
            .then((meta) => {
                if (!cancelled) {
                    setStandardCount(meta?.chinese?.total || null);
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

    useEffect(() => {
        let cancelled = false;
        loadStandardTopicBank('zh')
            .then((topics) => {
                if (!cancelled && topics?.length) {
                    setFoundationTopics(topics);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setFoundationTopics(CHINESE_TOPICS.filter(t => !t.mode || t.mode !== 'adult'));
                }
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const getTopicProgress = (topic) => {
        const learned = state.wordsLearned.filter(
            w => w.lang === 'cn' && topic.words.some(tw => tw.character === w.word)
        ).length;
        const totalWords = topic.words.length;
        return { learned, total: totalWords, pct: totalWords > 0 ? (learned / totalWords) * 100 : 0 };
    };

    const kidsTopics = foundationTopics;
    const adultTopics = CHINESE_TOPICS.filter(t => t.mode === 'adult');
    const visibleTopics = isAdult ? [...adultTopics, ...kidsTopics] : kidsTopics;

    const renderCard = (topic, i) => {
        const prog = getTopicProgress(topic);
        return (
            <Link key={topic.id} to={`/lesson-cn/${topic.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div
                    className={`topic-card animate-slide-up delay-${i % 5 + 1}`}
                    style={{ borderColor: prog.pct === 100 ? 'var(--color-success)' : undefined }}
                >
                    {prog.pct === 100 && <div style={{ position: 'absolute', top: 8, right: 8, fontSize: '1.2rem' }}>✅</div>}
                    <div className="topic-card__emoji">{topic.emoji}</div>
                    <div className="topic-card__title">{topic.title}</div>
                    <div className="topic-card__count">{topic.words.length} từ</div>
                    {topic.framework && (
                        <div style={{
                            fontSize: '0.6rem',
                            color: '#EF4444',
                            fontWeight: 700,
                            background: 'rgba(239,68,68,0.08)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            marginTop: '4px',
                        }}>
                            Foundation
                        </div>
                    )}
                    {topic.mode === 'adult' && (
                        <div style={{
                            fontSize: '0.6rem', color: '#EF4444', fontWeight: 600,
                            background: 'rgba(239,68,68,0.1)', padding: '2px 6px',
                            borderRadius: '4px', marginTop: '2px',
                        }}>HSK 4-5</div>
                    )}
                    <div className="topic-card__progress">
                        <div className="topic-card__progress-fill" style={{
                            width: `${prog.pct}%`,
                            background: prog.pct === 100 ? 'var(--color-success)' : 'var(--color-chinese)',
                        }} />
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">{isAdult ? '🇨🇳 中文 Chinese' : '🇨🇳 Tiếng Trung'}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {/* Module navigation cards */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px',
                maxWidth: '420px', margin: '0 auto 24px',
            }}>
                <div className="topic-card" onClick={() => navigate('/listening-cn')} style={{ cursor: 'pointer', textAlign: 'center', padding: '16px 10px' }}>
                    <div className="topic-card__emoji">🎧</div>
                    <div className="topic-card__title" style={{ fontSize: '0.8rem' }}>{isAdult ? '听力' : 'Nghe'}</div>
                </div>
                <div className="topic-card" onClick={() => navigate('/speaking-cn')} style={{ cursor: 'pointer', textAlign: 'center', padding: '16px 10px' }}>
                    <div className="topic-card__emoji">🗣️</div>
                    <div className="topic-card__title" style={{ fontSize: '0.8rem' }}>{isAdult ? '口语' : 'Nói'}</div>
                </div>
                <div className="topic-card" onClick={() => navigate('/grammar-cn')} style={{ cursor: 'pointer', textAlign: 'center', padding: '16px 10px' }}>
                    <div className="topic-card__emoji">📐</div>
                    <div className="topic-card__title" style={{ fontSize: '0.8rem' }}>{isAdult ? '语法' : 'Ngữ pháp'}</div>
                </div>
            </div>

            <p style={{
                textAlign: 'center', color: 'var(--color-text-light)',
                marginBottom: '24px', fontFamily: 'var(--font-display)', fontSize: '1.1rem'
            }}>
                {isAdult
                    ? `${visibleTopics.length} chủ đề · ${visibleTopics.reduce((a, t) => a + t.words.length, 0)} từ dùng trực tiếp · ${standardCount ? standardCount.toLocaleString('en-US') : '...'} mục lexicon chuẩn`
                    : `${kidsTopics.length} chủ đề nền tảng · ${kidsTopics.reduce((a, t) => a + t.words.length, 0)} từ đang học trực tiếp`}
            </p>

            <div className="topic-grid" style={{ marginBottom: '20px' }}>
                <div
                    className="topic-card"
                    onClick={() => navigate('/lexicon/cn')}
                    style={{ cursor: 'pointer', textAlign: 'center', padding: '16px 12px' }}
                >
                    <div className="topic-card__emoji">🗂️</div>
                    <div className="topic-card__title">{isAdult ? 'Standard Lexicon' : 'Kho dữ liệu chuẩn'}</div>
                    <div className="topic-card__count">
                        {standardCount ? `${standardCount.toLocaleString('en-US')} mục` : 'Đang tải...'}
                    </div>
                </div>
            </div>

            {isAdult && adultTopics.length > 0 && (
                <>
                    <h3 style={{
                        fontFamily: 'var(--font-display)', fontSize: '1rem',
                        color: '#EF4444', marginBottom: '12px',
                        borderBottom: '1px solid var(--color-border)', paddingBottom: '8px',
                    }}>💼 Chuyên nghiệp · HSK 4-5</h3>
                    <div className="topic-grid" style={{ marginBottom: '24px' }}>
                        {adultTopics.map((topic, i) => renderCard(topic, i))}
                    </div>
                    <h3 style={{
                        fontFamily: 'var(--font-display)', fontSize: '1rem',
                        color: 'var(--color-text-light)', marginBottom: '12px',
                        borderBottom: '1px solid var(--color-border)', paddingBottom: '8px',
                    }}>📚 Nền tảng · HSK 1-3</h3>
                </>
            )}

            <div className="topic-grid">
                {kidsTopics.map((topic, i) => renderCard(topic, i))}
            </div>
        </div>
    );
}

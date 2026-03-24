import { Link, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { CHINESE_TOPICS } from '../data/chinese';

export default function LearnChinese() {
    const navigate = useNavigate();
    const { state } = useGame();

    const getTopicProgress = (topicId, totalWords) => {
        const learned = state.wordsLearned.filter(
            w => w.lang === 'cn' && CHINESE_TOPICS.find(t => t.id === topicId)?.words.some(tw => tw.character === w.word)
        ).length;
        return { learned, total: totalWords, pct: totalWords > 0 ? (learned / totalWords) * 100 : 0 };
    };

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/')}>←</button>
                <h2 className="page-header__title">🇨🇳 Tiếng Trung</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <p style={{
                textAlign: 'center',
                color: 'var(--color-text-light)',
                marginBottom: '24px',
                fontFamily: 'var(--font-display)',
                fontSize: '1.1rem'
            }}>
                Khám phá tiếng Trung nào! 🐉
            </p>

            <div className="topic-grid">
                {CHINESE_TOPICS.map((topic, i) => {
                    const prog = getTopicProgress(topic.id, topic.words.length);
                    return (
                        <Link
                            key={topic.id}
                            to={`/lesson-cn/${topic.id}`}
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
                                <div className="topic-card__progress">
                                    <div
                                        className="topic-card__progress-fill"
                                        style={{
                                            width: `${prog.pct}%`,
                                            background: prog.pct === 100 ? 'var(--color-success)' : 'var(--color-chinese)',
                                        }}
                                    />
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

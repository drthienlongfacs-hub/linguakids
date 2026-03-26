// StoryList — Choose a story to read
import { useNavigate, useParams } from 'react-router-dom';
import { ENGLISH_STORIES, CHINESE_STORIES } from '../data/stories';
import { useGame } from '../context/GameStateContext';

export default function StoryList() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { state } = useGame();
    const isEnglish = lang === 'en';
    const stories = isEnglish ? ENGLISH_STORIES : CHINESE_STORIES;

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">📖 Truyện {isEnglish ? '🇬🇧' : '🇨🇳'}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <p style={{
                textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '20px',
                fontFamily: 'var(--font-display)', fontSize: '1.05rem',
            }}>
                Đọc truyện, nghe, nói và trả lời câu hỏi! 📚
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {stories.map((story, i) => (
                    <div
                        key={story.id}
                        className={`animate-slide-up delay-${(i % 5) + 1}`}
                        onClick={() => navigate(`/story/${lang}/${story.id}`)}
                        style={{
                            background: 'var(--color-card)', borderRadius: 'var(--radius-xl)', overflow: 'hidden',
                            boxShadow: 'var(--shadow-md)', cursor: 'pointer',
                            transition: 'all var(--transition-normal)',
                            border: '2px solid transparent',
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = ''}
                    >
                        {/* Cover */}
                        <div style={{
                            background: story.coverColor, padding: '24px', textAlign: 'center', color: 'white',
                        }}>
                            <div style={{ fontSize: '3.5rem', marginBottom: '8px' }}>{story.emoji}</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700 }}>
                                {story.title}
                            </div>
                            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                                {isEnglish ? story.titleEn : story.titleCn}
                            </div>
                        </div>
                        {/* Info */}
                        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', fontWeight: 600 }}>
                                {story.scenes.length} trang · {story.level}
                            </span>
                            <span style={{ fontSize: '1.2rem' }}>▶️</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

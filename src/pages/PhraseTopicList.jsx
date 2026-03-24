// PhraseTopicList — Choose a topic to practice sentences
import { useParams, useNavigate } from 'react-router-dom';
import { PHRASE_TOPICS } from '../data/phrases';
import { useGame } from '../context/GameStateContext';

export default function PhraseTopicList() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { state } = useGame();
    const isEn = lang === 'en';

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🎤 Luyện câu {isEn ? '🇬🇧' : '🇨🇳'}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <p style={{
                textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '16px',
                fontFamily: 'var(--font-display)', fontSize: '1rem',
            }}>
                Nghe → Nói theo → Phân tích từng từ! 🎯
            </p>

            {PHRASE_TOPICS.map((topic, i) => {
                const count = isEn ? topic.phrases.en.length : topic.phrases.cn.length;
                return (
                    <div key={topic.id} className={`game-card animate-slide-up delay-${(i % 5) + 1}`}
                        onClick={() => navigate(`/phrases/${lang}/${topic.id}`)}>
                        <div className="game-card__icon" style={{ background: `${topic.color}20`, color: topic.color }}>
                            {topic.emoji}
                        </div>
                        <div className="game-card__info">
                            <div className="game-card__title">{topic.title}</div>
                            <div className="game-card__desc">{count} câu · {isEn ? 'English' : '中文'}</div>
                        </div>
                        <div style={{ fontSize: '1.2rem' }}>▶️</div>
                    </div>
                );
            })}
        </div>
    );
}

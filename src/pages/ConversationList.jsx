// ConversationList — Choose a conversation dialogue to practice
import { useNavigate, useParams } from 'react-router-dom';
import { ENGLISH_CONVERSATIONS, CHINESE_CONVERSATIONS } from '../data/conversations';
import { useGame } from '../context/GameStateContext';

export default function ConversationList() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { state } = useGame();
    const isEnglish = lang === 'en';
    const conversations = isEnglish ? ENGLISH_CONVERSATIONS : CHINESE_CONVERSATIONS;

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate(isEnglish ? '/english' : '/chinese')}>←</button>
                <h2 className="page-header__title">💬 Hội thoại {isEnglish ? '🇬🇧' : '🇨🇳'}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <p style={{
                textAlign: 'center', color: 'var(--color-text-light)', marginBottom: '20px',
                fontFamily: 'var(--font-display)', fontSize: '1.05rem',
            }}>
                Luyện nói theo tình huống thực tế! 🎭
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {conversations.map((conv, i) => (
                    <div
                        key={conv.id}
                        className={`game-card animate-slide-up delay-${(i % 5) + 1}`}
                        onClick={() => navigate(`/conversation/${lang}/${conv.id}`)}
                    >
                        <div className="game-card__icon">{conv.emoji}</div>
                        <div className="game-card__info">
                            <div className="game-card__title">{conv.title}</div>
                            <div className="game-card__desc">
                                {isEnglish ? conv.titleEn : conv.titleCn} · {conv.level}
                            </div>
                        </div>
                        <div style={{ fontSize: '1.3rem', color: 'var(--color-text-light)' }}>▶️</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

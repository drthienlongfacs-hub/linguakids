// StoryMode — Interactive story-based immersive lessons
// Scene-by-scene narration, comprehension checks, speaking practice
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ENGLISH_STORIES, CHINESE_STORIES } from '../data/stories';
import { useGame } from '../context/GameStateContext';
import { useSpeech } from '../hooks/useSpeech';
import StarBurst from '../components/StarBurst';

export default function StoryMode() {
    const { lang, storyId } = useParams();
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const { speakEnglish, speakChinese, startListening, isListening, isSpeaking } = useSpeech();

    const isEnglish = lang === 'en';
    const stories = isEnglish ? ENGLISH_STORIES : CHINESE_STORIES;
    const story = stories.find(s => s.id === storyId);

    const [sceneIndex, setSceneIndex] = useState(0);
    const [answered, setAnswered] = useState(null);
    const [spoken, setSpoken] = useState(false);
    const [celebration, setCelebration] = useState(0);
    const [xpEarned, setXpEarned] = useState(0);

    const scene = story.scenes[sceneIndex];
    const isLast = sceneIndex >= story.scenes.length - 1;
    const progress = ((sceneIndex + 1) / story.scenes.length) * 100;

    // Auto-narrate
    useEffect(() => {
        if (!story) return;
        setAnswered(null);
        setSpoken(false);
        const currentScene = story.scenes[sceneIndex];
        if (!currentScene) return;
        const timer = setTimeout(() => {
            if (isEnglish) speakEnglish(currentScene.narrator);
            else speakChinese(currentScene.narrator);
        }, 600);
        return () => clearTimeout(timer);
    }, [sceneIndex, story, isEnglish, speakEnglish, speakChinese]);

    if (!story) return (
        <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
            <p>Không tìm thấy truyện 😔</p>
            <button className="btn btn--primary" onClick={() => navigate(-1)}>Quay lại</button>
        </div>
    );

    const handleAnswer = (option) => {
        if (answered !== null) return;
        setAnswered(option);
        if (option.correct) {
            addXP(5);
            setXpEarned(prev => prev + 5);
            setCelebration(c => c + 1);
        }
    };

    const handleSpeak = () => {
        const recLang = isEnglish ? 'en-US' : 'zh-CN';
        startListening(recLang, () => {
            setSpoken(true);
            addXP(5);
            setXpEarned(prev => prev + 5);
            setCelebration(c => c + 1);
        });
    };

    const handleNext = () => {
        if (isLast) {
            addXP(15);
            setXpEarned(prev => prev + 15);
            setCelebration(c => c + 1);
        }
        setSceneIndex(i => i + 1);
    };

    // Story complete screen
    if (sceneIndex >= story.scenes.length) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '16px' }}>📖✨</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Hết truyện rồi!</h2>
                <p style={{ color: 'var(--color-text-light)', margin: '8px 0', fontSize: '1.1rem' }}>
                    {story.title} — {isEnglish ? story.titleEn : story.titleCn}
                </p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-primary)', marginBottom: '24px' }}>
                    +{xpEarned} XP ⭐
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => window.location.reload()}>
                        🔄 Đọc lại
                    </button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate(-1)}>
                        📚 Truyện khác
                    </button>
                </div>
            </div>
        );
    }

    const canAdvance = !scene.question || answered !== null;
    // speakDone used implicitly in UX flow

    return (
        <div className="page">
            <StarBurst trigger={celebration} />

            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate(-1)}>←</button>
                <h2 className="page-header__title">{story.emoji} {story.title}</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            {/* Progress */}
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${progress}%`, background: story.coverColor }} />
                </div>
                <span className="lesson-progress__text">{sceneIndex + 1}/{story.scenes.length}</span>
            </div>

            {/* Scene illustration */}
            <div style={{
                textAlign: 'center', fontSize: '4rem', margin: '16px 0',
                padding: '24px', borderRadius: 'var(--radius-xl)',
                background: 'var(--color-card)', boxShadow: 'var(--shadow-md)',
                userSelect: 'none',
            }}>
                {scene.image}
            </div>

            {/* Narration */}
            <div style={{
                background: 'var(--color-card)', borderRadius: 'var(--radius-lg)', padding: '16px 20px',
                boxShadow: 'var(--shadow-sm)', marginBottom: '16px',
            }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.5, marginBottom: '8px' }}>
                    {scene.narrator}
                </p>
                {scene.pinyin && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-chinese)', marginBottom: '4px' }}>{scene.pinyin}</p>
                )}
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>{scene.narratorVi}</p>

                {/* Replay audio */}
                <button style={{
                    marginTop: '8px', background: 'none', border: '2px solid var(--color-primary-light)',
                    borderRadius: 'var(--radius-full)', padding: '6px 16px', cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: 'var(--color-primary)',
                }} onClick={() => isEnglish ? speakEnglish(scene.narrator) : speakChinese(scene.narrator)}>
                    🔊 Nghe lại
                </button>
            </div>

            {/* Speaking practice */}
            {scene.speakPractice && (
                <div className="animate-pop-in" style={{
                    background: '#F0F0FF', borderRadius: 'var(--radius-lg)', padding: '16px',
                    textAlign: 'center', marginBottom: '16px', border: '2px dashed var(--color-primary-light)',
                }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
                        🎤 {scene.speakPractice.prompt}
                    </p>
                    <p style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: '12px' }}>
                        "{scene.speakPractice.text}"
                    </p>
                    {!spoken ? (
                        <button className={`mic-button ${isListening ? 'listening' : ''}`} onClick={handleSpeak}
                            disabled={isListening || isSpeaking} style={{ margin: '0 auto' }}>
                            🎤
                        </button>
                    ) : (
                        <div style={{ fontSize: '1.3rem', color: 'var(--color-success)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                            ✅ Giỏi lắm! +5 XP
                        </div>
                    )}
                </div>
            )}

            {/* Comprehension question */}
            {scene.question && (
                <div className="animate-pop-in" style={{
                    background: '#FFFBF0', borderRadius: 'var(--radius-lg)', padding: '16px',
                    marginBottom: '16px', border: '2px solid var(--color-xp-light)',
                }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: '4px' }}>
                        ❓ {scene.question.ask}
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginBottom: '12px' }}>
                        {scene.question.askVi}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {scene.question.options.map((opt, i) => {
                            let bg = 'white';
                            let border = 'var(--color-border)';
                            if (answered) {
                                if (opt.correct) { bg = '#ECFDF5'; border = 'var(--color-success)'; }
                                else if (answered === opt && !opt.correct) { bg = '#FFF1F2'; border = 'var(--color-error)'; }
                            }
                            return (
                                <button key={i} onClick={() => handleAnswer(opt)}
                                    disabled={answered !== null}
                                    style={{
                                        padding: '12px 16px', borderRadius: 'var(--radius-md)', border: `2px solid ${border}`,
                                        background: bg, fontFamily: 'var(--font-display)', fontWeight: 600,
                                        fontSize: '1rem', cursor: answered ? 'default' : 'pointer', textAlign: 'left',
                                        transition: 'all var(--transition-fast)',
                                    }}>
                                    {opt.text}
                                </button>
                            );
                        })}
                    </div>
                    {answered && (
                        <p style={{
                            marginTop: '8px', fontFamily: 'var(--font-display)', fontWeight: 700,
                            color: answered.correct ? 'var(--color-success)' : 'var(--color-error)'
                        }}>
                            {answered.correct ? '✅ Đúng rồi! +5 XP' : '❌ Chưa đúng rồi, xem đáp án nhé!'}
                        </p>
                    )}
                </div>
            )}

            {/* Next button */}
            <button
                className="btn btn--primary btn--block btn--large"
                onClick={handleNext}
                disabled={!canAdvance}
                style={{ opacity: canAdvance ? 1 : 0.5 }}
            >
                {isLast ? '🏁 Kết thúc' : '▶️ Tiếp theo'}
            </button>
        </div>
    );
}

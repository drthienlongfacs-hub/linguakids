import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKidsLibraryHarvestModel } from '../services/kidsLibraryHarvestService';
import { useGame } from '../context/GameStateContext';

const cardStyle = {
    background: 'var(--color-card-bg)',
    borderRadius: '24px',
    padding: '18px',
    border: '1px solid var(--color-border)',
    boxShadow: '0 14px 32px rgba(15, 23, 42, 0.08)',
};

export default function KidsLibrary() {
    const navigate = useNavigate();
    const { state } = useGame();
    const model = useMemo(() => getKidsLibraryHarvestModel(), []);

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate(-1)}>←</button>
                <h2 className="page-header__title">📚 Kids Library</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div style={{
                ...cardStyle,
                background: 'linear-gradient(135deg, #ECFEFF, #EEF2FF 55%, #FDF2F8)',
                marginBottom: '14px',
            }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 800, color: '#1E1B4B' }}>
                    Library + Guided Path + Teacher Visibility
                </div>
                <p style={{ margin: '8px 0 0', color: '#475569', lineHeight: 1.65, fontSize: '0.86rem' }}>
                    Built from Lingua&apos;s real stories, reading passages, teacher lessons, and speaking/listening rails.
                </p>
                <p style={{ margin: '4px 0 0', color: '#64748B', lineHeight: 1.55, fontSize: '0.78rem', fontStyle: 'italic' }}>
                    Lấy cảm hứng từ Khan Kids ở cấp độ pattern sản phẩm, không sao chép nội dung độc quyền.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                    <Badge value={`${model.summary.shelfCount} shelves`} />
                    <Badge value={`${model.summary.storyCount} stories`} />
                    <Badge value={`${model.summary.readingCount} reading items`} />
                    <Badge value={`${model.summary.teacherChapterCount} teacher chapters`} />
                    <Badge value={`${model.summary.speakingSentenceCount} speaking sentences`} />
                </div>
            </div>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
                {model.shelves.map((shelf) => (
                    <div key={shelf.id} style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 }}>
                                    {shelf.title} · {shelf.titleVi}
                                </div>
                                <div style={{ marginTop: '6px', fontSize: '0.78rem', color: 'var(--color-text-light)', lineHeight: 1.6 }}>
                                    {shelf.descriptionVi}
                                </div>
                                <div style={{ marginTop: '4px', fontSize: '0.7rem', color: '#6366F1', fontWeight: 700 }}>
                                    Harvest pattern: {shelf.benchmarkPattern}
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(shelf.route)}
                                style={{
                                    border: 'none',
                                    borderRadius: '16px',
                                    padding: '10px 14px',
                                    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                                    color: '#fff',
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Mở
                            </button>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                            {shelf.stats.map((stat) => (
                                <div key={`${shelf.id}-${stat.label}`} style={{
                                    minWidth: '100px',
                                    padding: '10px 12px',
                                    borderRadius: '16px',
                                    background: 'var(--color-card)',
                                    border: '1px solid var(--color-border)',
                                }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                                        {stat.value}
                                    </div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-light)' }}>
                                        {stat.labelVi || stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'grid', gap: '8px', marginTop: '12px' }}>
                            {shelf.actions.map((action) => (
                                <button
                                    key={`${shelf.id}-${action.route}`}
                                    onClick={() => navigate(action.route)}
                                    style={{
                                        textAlign: 'left',
                                        padding: '12px 14px',
                                        borderRadius: '16px',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-card)',
                                        color: 'var(--color-text)',
                                        cursor: 'pointer',
                                        fontWeight: 700,
                                    }}
                                >
                                    {action.labelVi} · {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div style={cardStyle}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 }}>
                    Recommended Learning Journeys · Hành trình gợi ý
                </div>
                <div style={{ display: 'grid', gap: '12px', marginTop: '12px' }}>
                    {model.journeys.map((journey, index) => (
                        <div key={journey.id} style={{
                            padding: '14px',
                            borderRadius: '18px',
                            background: index % 2 === 0 ? '#F8FAFC' : '#EEF2FF',
                            border: '1px solid var(--color-border)',
                        }}>
                            <div style={{ fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                                {journey.titleVi} · {journey.title}
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                                {journey.steps.map((step, stepIndex) => (
                                    <button
                                        key={`${journey.id}-${step.route}`}
                                        onClick={() => navigate(step.route)}
                                        style={{
                                            border: 'none',
                                            borderRadius: '999px',
                                            padding: '8px 12px',
                                            background: '#FFFFFF',
                                            color: '#1E1B4B',
                                            cursor: 'pointer',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {stepIndex + 1}. {step.labelVi}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function Badge({ value }) {
    return (
        <span style={{
            padding: '6px 10px',
            borderRadius: '999px',
            background: '#FFFFFFB8',
            border: '1px solid #C7D2FE',
            color: '#3730A3',
            fontSize: '0.72rem',
            fontWeight: 700,
        }}>
            {value}
        </span>
    );
}

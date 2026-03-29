import { SPEAKING_UI_THEME } from '../data/speakingUiTheme';

function metricColor(score) {
    if (score >= 85) return '#16A34A';
    if (score >= 70) return '#2563EB';
    if (score >= 55) return '#D97706';
    return '#DC2626';
}

function wordStatusColor(status) {
    if (status === 'perfect') return { bg: '#10281E', text: '#DCFCE7', border: '#22C55E' };
    if (status === 'close') return { bg: '#3F2A0E', text: '#FDE68A', border: '#F59E0B' };
    if (status === 'wrong') return { bg: '#3F1D1D', text: '#FECACA', border: '#EF4444' };
    return { bg: '#1E293B', text: '#E2E8F0', border: '#475569' };
}

function formatPercent(value) {
    return `${Math.round((value || 0) * 100)}%`;
}

export default function SpeakingCoachPanel({
    analysis,
    title = 'Speaking Coaching',
    transcriptLabel = 'Transcript',
    transcript = '',
    tone = '#4F46E5',
    footer = null,
}) {
    if (!analysis) return null;

    return (
        <div style={{
            marginTop: '14px',
            padding: '16px',
            borderRadius: '20px',
            background: SPEAKING_UI_THEME.panelSurfaceRaised,
            border: `1px solid ${SPEAKING_UI_THEME.border}`,
            boxShadow: '0 20px 50px rgba(15,23,42,0.08)',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
                marginBottom: '12px',
            }}>
                <div>
                    <div style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 800,
                        fontSize: '1rem',
                        color: tone,
                    }}>
                        {title}
                    </div>
                    <div style={{
                        marginTop: '4px',
                        fontSize: '0.76rem',
                        color: SPEAKING_UI_THEME.textMuted,
                        lineHeight: 1.5,
                    }}>
                        {analysis.analysisSummary || analysis.note}
                    </div>
                </div>
                <div style={{
                    minWidth: '84px',
                    textAlign: 'center',
                    padding: '10px 12px',
                    borderRadius: '16px',
                    background: `${tone}14`,
                    border: `1px solid ${tone}2A`,
                }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 800, color: tone }}>
                        {analysis.overallScore}%
                    </div>
                    <div style={{ fontSize: '0.68rem', color: SPEAKING_UI_THEME.textSoft }}>
                        Coaching
                    </div>
                </div>
            </div>

            {transcript && (
                <div style={{
                    padding: '10px 12px',
                    borderRadius: '14px',
                    background: SPEAKING_UI_THEME.accentSurface,
                    border: `1px solid ${SPEAKING_UI_THEME.accentStrong}`,
                    marginBottom: '12px',
                }}>
                    <div style={{ fontSize: '0.72rem', color: SPEAKING_UI_THEME.accentStrong, fontWeight: 700, marginBottom: '4px' }}>
                        {transcriptLabel}
                    </div>
                    <div style={{ fontSize: '0.86rem', lineHeight: 1.55, color: SPEAKING_UI_THEME.textStrong }}>
                        {transcript}
                    </div>
                </div>
            )}

            {analysis.metrics?.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                    gap: '8px',
                    marginBottom: '12px',
                }}>
                    {analysis.metrics.map((metric) => (
                        <div
                            key={metric.key}
                            style={{
                                padding: '10px 12px',
                                borderRadius: '14px',
                                background: SPEAKING_UI_THEME.panelSurfaceMuted,
                                border: `1px solid ${SPEAKING_UI_THEME.borderSoft}`,
                            }}
                        >
                            <div style={{ fontSize: '0.72rem', color: SPEAKING_UI_THEME.textMuted }}>
                                {metric.label}
                            </div>
                            <div style={{
                                marginTop: '4px',
                                fontSize: '1.05rem',
                                fontWeight: 800,
                                color: metricColor(metric.score),
                            }}>
                                {metric.score}%
                            </div>
                            <div style={{ marginTop: '4px', fontSize: '0.7rem', color: SPEAKING_UI_THEME.textSoft, lineHeight: 1.45 }}>
                                {metric.insight}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {analysis.signalBreakdown && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                    gap: '8px',
                    marginBottom: '12px',
                }}>
                    <div style={{ padding: '8px 10px', borderRadius: '12px', background: SPEAKING_UI_THEME.panelSurface, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: SPEAKING_UI_THEME.textSoft }}>WPM</div>
                        <div style={{ fontWeight: 800, color: SPEAKING_UI_THEME.textStrong }}>{analysis.transcriptStats?.wpm || 0}</div>
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: '12px', background: SPEAKING_UI_THEME.panelSurface, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: SPEAKING_UI_THEME.textSoft }}>Filler</div>
                        <div style={{ fontWeight: 800, color: SPEAKING_UI_THEME.textStrong }}>{analysis.signalBreakdown.fillerCount || 0}</div>
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: '12px', background: SPEAKING_UI_THEME.panelSurface, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: SPEAKING_UI_THEME.textSoft }}>Diversity</div>
                        <div style={{ fontWeight: 800, color: SPEAKING_UI_THEME.textStrong }}>{formatPercent(analysis.transcriptStats?.lexicalDiversity || 0)}</div>
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: '12px', background: SPEAKING_UI_THEME.panelSurface, textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: SPEAKING_UI_THEME.textSoft }}>Relevance</div>
                        <div style={{ fontWeight: 800, color: SPEAKING_UI_THEME.textStrong }}>{analysis.signalBreakdown.promptCoverage || 0}%</div>
                    </div>
                </div>
            )}

            {analysis.referenceWordFeedback?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: SPEAKING_UI_THEME.textMuted,
                        marginBottom: '8px',
                    }}>
                        Word-level alignment
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {analysis.referenceWordFeedback.map((word, index) => {
                            const palette = wordStatusColor(word.status);
                            return (
                                <span
                                    key={`${word.word}-${index}`}
                                    style={{
                                        padding: '6px 10px',
                                        borderRadius: '999px',
                                        background: palette.bg,
                                        color: palette.text,
                                        border: `1px solid ${palette.border}`,
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {word.word}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {analysis.strengths?.length > 0 && (
                <div style={{ marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: SPEAKING_UI_THEME.successText, marginBottom: '6px' }}>
                        What went well
                    </div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                        {analysis.strengths.map((item) => (
                            <div
                                key={item}
                                style={{
                                    padding: '8px 10px',
                                    borderRadius: '12px',
                                    background: SPEAKING_UI_THEME.successSurface,
                                    border: `1px solid ${SPEAKING_UI_THEME.successBorder}`,
                                    fontSize: '0.76rem',
                                    lineHeight: 1.45,
                                    color: SPEAKING_UI_THEME.successText,
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {analysis.recommendations?.length > 0 && (
                <div style={{ marginBottom: footer ? '10px' : 0 }}>
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: SPEAKING_UI_THEME.warningText, marginBottom: '6px' }}>
                        Next-step coaching
                    </div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                        {analysis.recommendations.map((item) => (
                            <div
                                key={item}
                                style={{
                                    padding: '8px 10px',
                                    borderRadius: '12px',
                                    background: SPEAKING_UI_THEME.warningSurface,
                                    border: `1px solid ${SPEAKING_UI_THEME.warningBorder}`,
                                    fontSize: '0.76rem',
                                    lineHeight: 1.45,
                                    color: SPEAKING_UI_THEME.warningText,
                                }}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {footer}

            <div style={{
                marginTop: '10px',
                fontSize: '0.7rem',
                color: SPEAKING_UI_THEME.textSoft,
                lineHeight: 1.45,
            }}>
                Evidence: {analysis.evidenceLevel || 'Transcript-based coaching'} · {analysis.note}
            </div>
        </div>
    );
}

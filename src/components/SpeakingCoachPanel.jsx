function metricColor(score) {
    if (score >= 85) return '#16A34A';
    if (score >= 70) return '#2563EB';
    if (score >= 55) return '#D97706';
    return '#DC2626';
}

function wordStatusColor(status) {
    if (status === 'perfect') return { bg: '#DCFCE7', text: '#166534', border: '#86EFAC' };
    if (status === 'close') return { bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' };
    if (status === 'wrong') return { bg: '#FEE2E2', text: '#B91C1C', border: '#FCA5A5' };
    return { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' };
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
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(148,163,184,0.22)',
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
                        color: 'var(--color-text-light)',
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
                    <div style={{ fontSize: '0.68rem', color: 'var(--color-text-light)' }}>
                        Coaching
                    </div>
                </div>
            </div>

            {transcript && (
                <div style={{
                    padding: '10px 12px',
                    borderRadius: '14px',
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.16)',
                    marginBottom: '12px',
                }}>
                    <div style={{ fontSize: '0.72rem', color: '#4F46E5', fontWeight: 700, marginBottom: '4px' }}>
                        {transcriptLabel}
                    </div>
                    <div style={{ fontSize: '0.86rem', lineHeight: 1.55 }}>
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
                                background: 'rgba(15,23,42,0.03)',
                                border: '1px solid rgba(148,163,184,0.18)',
                            }}
                        >
                            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
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
                            <div style={{ marginTop: '4px', fontSize: '0.7rem', color: '#64748B', lineHeight: 1.45 }}>
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
                    <div style={{ padding: '8px 10px', borderRadius: '12px', background: '#F8FAFC', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>WPM</div>
                        <div style={{ fontWeight: 800 }}>{analysis.transcriptStats?.wpm || 0}</div>
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: '12px', background: '#F8FAFC', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Filler</div>
                        <div style={{ fontWeight: 800 }}>{analysis.signalBreakdown.fillerCount || 0}</div>
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: '12px', background: '#F8FAFC', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Diversity</div>
                        <div style={{ fontWeight: 800 }}>{formatPercent(analysis.transcriptStats?.lexicalDiversity || 0)}</div>
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: '12px', background: '#F8FAFC', textAlign: 'center' }}>
                        <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Relevance</div>
                        <div style={{ fontWeight: 800 }}>{analysis.signalBreakdown.promptCoverage || 0}%</div>
                    </div>
                </div>
            )}

            {analysis.referenceWordFeedback?.length > 0 && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#334155',
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
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                        What went well
                    </div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                        {analysis.strengths.map((item) => (
                            <div
                                key={item}
                                style={{
                                    padding: '8px 10px',
                                    borderRadius: '12px',
                                    background: 'rgba(34,197,94,0.08)',
                                    border: '1px solid rgba(34,197,94,0.18)',
                                    fontSize: '0.76rem',
                                    lineHeight: 1.45,
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
                    <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#92400E', marginBottom: '6px' }}>
                        Next-step coaching
                    </div>
                    <div style={{ display: 'grid', gap: '6px' }}>
                        {analysis.recommendations.map((item) => (
                            <div
                                key={item}
                                style={{
                                    padding: '8px 10px',
                                    borderRadius: '12px',
                                    background: 'rgba(245,158,11,0.08)',
                                    border: '1px solid rgba(245,158,11,0.18)',
                                    fontSize: '0.76rem',
                                    lineHeight: 1.45,
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
                color: '#64748B',
                lineHeight: 1.45,
            }}>
                Evidence: {analysis.evidenceLevel || 'Transcript-based coaching'} · {analysis.note}
            </div>
        </div>
    );
}

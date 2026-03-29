const TONE_STYLES = {
    info: {
        border: 'rgba(99,102,241,0.22)',
        background: 'rgba(99,102,241,0.08)',
        title: '#4338CA',
        text: '#4B5563',
    },
    warn: {
        border: 'rgba(245,158,11,0.24)',
        background: 'rgba(245,158,11,0.12)',
        title: '#B45309',
        text: '#92400E',
    },
    success: {
        border: 'rgba(34,197,94,0.22)',
        background: 'rgba(34,197,94,0.08)',
        title: '#15803D',
        text: '#166534',
    },
};

export default function CapabilityNotice({
    icon = 'ℹ️',
    title,
    badge,
    summary,
    bullets = [],
    tone = 'info',
    compact = false,
}) {
    const palette = TONE_STYLES[tone] || TONE_STYLES.info;

    return (
        <div style={{
            marginBottom: compact ? '10px' : '14px',
            padding: compact ? '10px 12px' : '12px 14px',
            borderRadius: '14px',
            border: `1px solid ${palette.border}`,
            background: palette.background,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: summary || bullets.length > 0 ? '6px' : 0,
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: compact ? '0.84rem' : '0.88rem',
                    color: palette.title,
                }}>
                    <span>{icon}</span>
                    <span>{title}</span>
                </div>
                {badge && (
                    <span style={{
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: 'rgba(255,255,255,0.72)',
                        border: `1px solid ${palette.border}`,
                        color: palette.title,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                    }}>
                        {badge}
                    </span>
                )}
            </div>

            {summary && (
                <p style={{
                    margin: 0,
                    color: palette.text,
                    fontSize: compact ? '0.77rem' : '0.8rem',
                    lineHeight: 1.5,
                }}>
                    {summary}
                </p>
            )}

            {bullets.length > 0 && (
                <div style={{
                    display: 'grid',
                    gap: '4px',
                    marginTop: '8px',
                    color: palette.text,
                    fontSize: compact ? '0.75rem' : '0.78rem',
                    lineHeight: 1.45,
                }}>
                    {bullets.map((item) => (
                        <div key={item}>• {item}</div>
                    ))}
                </div>
            )}
        </div>
    );
}


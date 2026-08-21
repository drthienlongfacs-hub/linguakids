import { SPEAKING_UI_THEME } from '../data/speakingUiTheme';

const TONE_STYLES = {
    warn: {
        border: SPEAKING_UI_THEME.warningBorder,
        background: SPEAKING_UI_THEME.warningSurface,
        title: SPEAKING_UI_THEME.warningText,
        text: '#FDE68A',
    },
};

export default function CapabilityNotice({
    icon = '⚠️',
    title,
    badge,
    summary,
    bullets = [],
    tone = 'info',
    compact = false,
}) {
    // Extraneous Cognitive Load Elimination:
    // Only render visual alerts for actual user-actionable warnings (e.g. mic permission denied).
    // Suppress background telemetry & capability assertions on child learning screens.
    if (tone !== 'warn') {
        return null;
    }

    const palette = TONE_STYLES.warn;

    return (
        <div style={{
            marginBottom: compact ? '8px' : '12px',
            padding: compact ? '8px 10px' : '10px 12px',
            borderRadius: '12px',
            border: `1px solid ${palette.border}`,
            background: palette.background,
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: summary || bullets.length > 0 ? '4px' : 0,
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: compact ? '0.8rem' : '0.84rem',
                    color: palette.title,
                }}>
                    <span>{icon}</span>
                    <span>{title}</span>
                </div>
                {badge && (
                    <span style={{
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: SPEAKING_UI_THEME.panelSurfaceSoft,
                        border: `1px solid ${palette.border}`,
                        color: palette.title,
                        fontSize: '0.68rem',
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
                    fontSize: compact ? '0.74rem' : '0.78rem',
                    lineHeight: 1.45,
                }}>
                    {summary}
                </p>
            )}

            {bullets.length > 0 && (
                <div style={{
                    display: 'grid',
                    gap: '3px',
                    marginTop: '6px',
                    color: palette.text,
                    fontSize: compact ? '0.72rem' : '0.75rem',
                    lineHeight: 1.4,
                }}>
                    {bullets.map((item) => (
                        <div key={item}>• {item}</div>
                    ))}
                </div>
            )}
        </div>
    );
}


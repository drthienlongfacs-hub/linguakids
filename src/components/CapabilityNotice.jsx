import { SPEAKING_UI_THEME } from '../data/speakingUiTheme';

const TONE_STYLES = {
    info: {
        border: '#4F46E5',
        background: '#1E1B4B',
        title: '#C7D2FE',
        text: '#E0E7FF',
    },
    warn: {
        border: SPEAKING_UI_THEME.warningBorder,
        background: SPEAKING_UI_THEME.warningSurface,
        title: SPEAKING_UI_THEME.warningText,
        text: '#FDE68A',
    },
    success: {
        border: SPEAKING_UI_THEME.successBorder,
        background: SPEAKING_UI_THEME.successSurface,
        title: SPEAKING_UI_THEME.successText,
        text: '#DCFCE7',
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
                        background: SPEAKING_UI_THEME.panelSurfaceSoft,
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

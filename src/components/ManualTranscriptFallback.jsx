import { SPEAKING_UI_THEME } from '../data/speakingUiTheme';

export default function ManualTranscriptFallback({
    title,
    description,
    value,
    onChange,
    onSubmit,
    onCancel,
    placeholder,
    submitLabel = 'Nộp câu trả lời',
    cancelLabel = 'Hủy',
}) {
    const isDisabled = !value.trim();

    return (
        <div style={{
            marginTop: '12px',
            padding: '14px',
            borderRadius: '16px',
            border: `1px solid ${SPEAKING_UI_THEME.warningBorder}`,
            background: SPEAKING_UI_THEME.warningSurface,
        }}>
            <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: SPEAKING_UI_THEME.warningText,
                marginBottom: '6px',
            }}>
                ✍️ {title}
            </div>
            <p style={{
                margin: '0 0 10px',
                color: SPEAKING_UI_THEME.warningText,
                fontSize: '0.8rem',
                lineHeight: 1.5,
            }}>
                {description}
            </p>
            <textarea
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                rows={4}
                style={{
                    width: '100%',
                    resize: 'vertical',
                    borderRadius: '12px',
                    border: `1px solid ${SPEAKING_UI_THEME.inputBorder}`,
                    padding: '10px 12px',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    background: SPEAKING_UI_THEME.inputSurface,
                    color: SPEAKING_UI_THEME.inputText,
                    outline: 'none',
                    marginBottom: '10px',
                }}
            />
            <div style={{ display: 'flex', gap: '8px' }}>
                <button
                    onClick={onSubmit}
                    disabled={isDisabled}
                    style={{
                        flex: 1,
                        padding: '10px 12px',
                        borderRadius: '12px',
                        border: 'none',
                        background: isDisabled ? SPEAKING_UI_THEME.borderSoft : SPEAKING_UI_THEME.primarySurface,
                        color: SPEAKING_UI_THEME.primaryText,
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                >
                    {submitLabel}
                </button>
                <button
                    onClick={onCancel}
                    style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        border: `1px solid ${SPEAKING_UI_THEME.secondaryBorder}`,
                        background: SPEAKING_UI_THEME.secondarySurface,
                        color: SPEAKING_UI_THEME.secondaryText,
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        cursor: 'pointer',
                    }}
                >
                    {cancelLabel}
                </button>
            </div>
        </div>
    );
}

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
            border: '1px solid rgba(245,158,11,0.24)',
            background: 'rgba(245,158,11,0.10)',
        }}>
            <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: '0.92rem',
                color: '#B45309',
                marginBottom: '6px',
            }}>
                ✍️ {title}
            </div>
            <p style={{
                margin: '0 0 10px',
                color: '#92400E',
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
                    border: '1px solid rgba(148,163,184,0.32)',
                    padding: '10px 12px',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    background: 'rgba(255,255,255,0.9)',
                    color: 'var(--color-text)',
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
                        background: isDisabled ? '#CBD5E1' : 'var(--color-primary)',
                        color: '#fff',
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
                        border: '1px solid rgba(148,163,184,0.32)',
                        background: 'rgba(255,255,255,0.85)',
                        color: 'var(--color-text)',
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


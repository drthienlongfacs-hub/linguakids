import { useEffect, useMemo, useState } from 'react';
import { useDeviceCapabilities } from '../hooks/useDeviceCapabilities';
import {
    clearCapabilityEvents,
    formatCapabilityTimestamp,
    readCapabilityEvents,
} from '../services/capabilityService';

const STATUS_COLORS = {
    supported: '#16A34A',
    limited: '#D97706',
    degraded: '#DC2626',
    guided: '#4F46E5',
};

function statusColor(status) {
    return STATUS_COLORS[status] || '#64748B';
}

export default function SystemCapabilityPanel() {
    const { capabilities, readiness, refresh } = useDeviceCapabilities();
    const [events, setEvents] = useState(() => readCapabilityEvents().slice(0, 8));

    useEffect(() => {
        const sync = () => {
            refresh();
            setEvents(readCapabilityEvents().slice(0, 8));
        };

        window.addEventListener('focus', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('focus', sync);
            window.removeEventListener('storage', sync);
        };
    }, [refresh]);

    const capabilityRows = useMemo(() => ([
        readiness.speechInput,
        readiness.speechOutput,
        readiness.listening,
        readiness.conversation,
        readiness.hanziWriting,
    ]), [readiness]);

    return (
        <div className="glass-card" style={{ padding: '16px', marginBottom: '12px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '10px',
            }}>
                <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.95rem' }}>
                        🧪 System Capability Audit
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '2px' }}>
                        {capabilities.platformLabel} · {capabilities.browserLabel} · {capabilities.voiceCount} voices detected
                    </div>
                </div>
                <button
                    onClick={() => {
                        refresh();
                        setEvents(readCapabilityEvents().slice(0, 8));
                    }}
                    style={{
                        padding: '8px 12px',
                        borderRadius: '10px',
                        border: '1px solid var(--color-border)',
                        background: 'rgba(255,255,255,0.85)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                    }}
                >
                    Refresh
                </button>
            </div>

            <div style={{ display: 'grid', gap: '10px', marginBottom: '12px' }}>
                {capabilityRows.map((row) => (
                    <div key={row.title} style={{
                        borderRadius: '12px',
                        border: '1px solid rgba(148,163,184,0.18)',
                        background: 'rgba(255,255,255,0.68)',
                        padding: '12px',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '10px',
                            marginBottom: '5px',
                        }}>
                            <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{row.title}</div>
                            <span style={{
                                padding: '4px 10px',
                                borderRadius: '999px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: `${statusColor(row.status)}14`,
                                color: statusColor(row.status),
                                border: `1px solid ${statusColor(row.status)}28`,
                            }}>
                                {row.badge}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', lineHeight: 1.5 }}>
                            {row.summary}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{
                borderTop: '1px solid rgba(148,163,184,0.18)',
                paddingTop: '12px',
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '8px',
                }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                        Recent Runtime Events
                    </div>
                    <button
                        onClick={() => {
                            clearCapabilityEvents();
                            setEvents([]);
                        }}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#DC2626',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                        }}
                    >
                        Clear
                    </button>
                </div>

                {events.length === 0 ? (
                    <div style={{ color: 'var(--color-text-light)', fontSize: '0.77rem' }}>
                        Chưa có log vận hành cục bộ cho speech/listening trong thiết bị này.
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {events.map((event) => (
                            <div key={event.id} style={{
                                padding: '10px 12px',
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.68)',
                                border: '1px solid rgba(148,163,184,0.16)',
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginBottom: '4px',
                                }}>
                                    <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>
                                        {event.type}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
                                        {formatCapabilityTimestamp(event.timestamp)}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.74rem', color: 'var(--color-text-light)', lineHeight: 1.45 }}>
                                    {Object.keys(event.details || {}).length > 0
                                        ? JSON.stringify(event.details)
                                        : 'No details'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

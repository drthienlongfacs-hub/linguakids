import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    unlockPremium,
    startTrial,
    PREMIUM_FEATURES,
    PREMIUM_TOKEN_PLACEHOLDER,
} from '../services/premiumService';
import usePremiumStatus from '../hooks/usePremiumStatus';

function formatDate(value) {
    if (!value) return 'Chưa có';
    return new Date(value).toLocaleString('vi-VN');
}

function shortId(value) {
    if (!value) return 'Chưa có';
    if (value.length <= 18) return value;
    return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

function getRuntimeTone(runtimeStatus, premiumStatus) {
    if (runtimeStatus.configured && runtimeStatus.reachable) {
        return {
            label: 'Server-backed entitlement',
            color: '#155724',
            background: '#d4edda',
            border: '#b7e4c7',
        };
    }

    if (runtimeStatus.configured && !runtimeStatus.reachable && premiumStatus.sourceOfTruth === 'client_signed_token_fallback') {
        return {
            label: 'Client fallback đang hoạt động',
            color: '#8a4b00',
            background: '#fff3cd',
            border: '#ffe08a',
        };
    }

    return {
        label: 'Soft paywall local-only',
        color: '#0b5ed7',
        background: '#e7f1ff',
        border: '#bfd8ff',
    };
}

export default function PremiumUpgrade() {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [actionMessage, setActionMessage] = useState(null);
    const {
        premiumStatus,
        runtimeStatus,
        loading,
        syncing,
        lastAction,
        refresh,
        syncNow,
    } = usePremiumStatus();

    const runtimeTone = useMemo(
        () => getRuntimeTone(runtimeStatus, premiumStatus),
        [premiumStatus, runtimeStatus]
    );
    const feedback = actionMessage || lastAction;

    async function handleUnlock() {
        const result = await unlockPremium(code);
        setActionMessage(result);
        if (result.success) {
            setCode('');
        }
        await refresh(true);
    }

    async function handleTrial() {
        const result = startTrial();
        setActionMessage(result);
        await refresh(true);
    }

    async function handleSync() {
        const result = await syncNow();
        setActionMessage(result);
    }

    return (
        <div className="page-container" style={{ padding: '1rem', maxWidth: 760, margin: '0 auto 5rem' }}>
            <button
                onClick={() => navigate(-1)}
                style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    marginBottom: '0.75rem',
                    fontFamily: 'var(--font-display)',
                }}
            >
                ← Quay lại
            </button>

            <div style={{
                background: 'linear-gradient(135deg, #182848 0%, #4b6cb7 100%)',
                borderRadius: 24,
                padding: '1.6rem',
                color: '#fff',
                marginBottom: '1rem',
                boxShadow: '0 18px 40px rgba(24, 40, 72, 0.18)',
            }}>
                <div style={{ fontSize: '2.8rem', marginBottom: 6 }}>👑</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', margin: '0 0 8px' }}>
                    LinguaKids Premium Runtime
                </h1>
                <p style={{ margin: 0, opacity: 0.92, lineHeight: 1.6 }}>
                    Trang này phản ánh trạng thái entitlement thật của web edition: đang local-only,
                    signed-token fallback hay server-backed. Không còn chỉ là màn nhập mã tĩnh.
                </p>
            </div>

            <div style={{
                background: runtimeTone.background,
                borderRadius: 18,
                border: `1px solid ${runtimeTone.border}`,
                padding: '1rem 1.1rem',
                marginBottom: '1rem',
                color: runtimeTone.color,
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800 }}>
                            {runtimeTone.label}
                        </div>
                        <div style={{ fontSize: '0.82rem', opacity: 0.9, marginTop: 4 }}>
                            Service mode: {runtimeStatus.mode || 'soft_paywall'} · Sync on boot: {runtimeStatus.syncOnBoot === false ? 'off' : 'on'}
                        </div>
                    </div>
                    <button
                        onClick={() => refresh(true)}
                        disabled={loading}
                        style={{
                            background: '#fff',
                            border: `1px solid ${runtimeTone.border}`,
                            borderRadius: 999,
                            padding: '10px 16px',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 700,
                            color: runtimeTone.color,
                            cursor: loading ? 'wait' : 'pointer',
                        }}
                    >
                        {loading ? 'Đang kiểm tra...' : 'Làm mới runtime'}
                    </button>
                </div>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                    gap: 10,
                    marginTop: '0.9rem',
                }}>
                    <MetaCard label="Reachability" value={runtimeStatus.configured ? (runtimeStatus.reachable ? 'Reachable' : 'Unreachable') : 'Not configured'} />
                    <MetaCard label="Source of truth" value={premiumStatus.sourceOfTruth || 'free'} />
                    <MetaCard label="Installation" value={shortId(runtimeStatus.installationId || premiumStatus.installationId)} />
                    <MetaCard label="Last sync" value={premiumStatus.lastSyncedAt ? formatDate(premiumStatus.lastSyncedAt) : 'Chưa sync'} />
                </div>
            </div>

            {premiumStatus.active ? (
                <div style={{
                    background: '#fff',
                    borderRadius: 22,
                    padding: '1.3rem',
                    boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                    marginBottom: '1rem',
                    border: '1px solid rgba(79, 70, 229, 0.12)',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: '#1f2937' }}>
                                {premiumStatus.type === 'trial'
                                    ? '🎁 Trial đang hoạt động'
                                    : '✅ Premium đang hoạt động'}
                            </div>
                            <div style={{ color: '#64748b', marginTop: 6, fontSize: '0.92rem' }}>
                                {premiumStatus.type === 'trial'
                                    ? `Hết hạn: ${formatDate(premiumStatus.expiresAt)}`
                                    : `Kích hoạt lúc: ${formatDate(premiumStatus.activatedAt)}`}
                            </div>
                        </div>
                        {runtimeStatus.configured && (
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                style={{
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 14,
                                    padding: '12px 18px',
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 700,
                                    cursor: syncing ? 'wait' : 'pointer',
                                }}
                            >
                                {syncing ? 'Đang đồng bộ...' : 'Đồng bộ entitlement'}
                            </button>
                        )}
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 10,
                        marginTop: '1rem',
                    }}>
                        <MetaCard label="Activation method" value={premiumStatus.activationMethod || 'n/a'} />
                        <MetaCard label="Token version" value={premiumStatus.tokenVersion || 'n/a'} />
                        <MetaCard label="Entitlement" value={shortId(premiumStatus.entitlementId)} />
                        <MetaCard label="Session expires" value={premiumStatus.sessionExpiresAt ? formatDate(premiumStatus.sessionExpiresAt) : 'Không có'} />
                    </div>

                    {premiumStatus.syncMessage && (
                        <div style={{
                            marginTop: '1rem',
                            borderRadius: 14,
                            padding: '12px 14px',
                            background: '#f8fafc',
                            color: '#334155',
                            border: '1px solid #e2e8f0',
                            lineHeight: 1.5,
                        }}>
                            {premiumStatus.syncMessage}
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 12,
                        marginBottom: '1rem',
                    }}>
                        {PREMIUM_FEATURES.map((feature) => (
                            <div
                                key={feature.id}
                                style={{
                                    background: '#fff',
                                    borderRadius: 18,
                                    padding: '1rem',
                                    border: '1px solid rgba(15, 23, 42, 0.06)',
                                    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
                                }}
                            >
                                <div style={{ fontSize: '1.8rem', marginBottom: 6 }}>{feature.icon}</div>
                                <div style={{ fontFamily: 'var(--font-display)', color: '#1f2937' }}>{feature.name}</div>
                                <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>
                                    {feature.desc}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        background: '#fff',
                        borderRadius: 22,
                        padding: '1.3rem',
                        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.08)',
                        border: '1px solid rgba(79, 70, 229, 0.12)',
                        marginBottom: '1rem',
                    }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', color: '#1f2937', marginBottom: 10 }}>
                            Trial hoặc token kích hoạt
                        </div>
                        <div style={{
                            background: '#f8fafc',
                            borderRadius: 14,
                            padding: '12px 14px',
                            border: '1px solid #e2e8f0',
                            color: '#475569',
                            fontSize: '0.88rem',
                            lineHeight: 1.65,
                            marginBottom: '1rem',
                        }}>
                            Web edition hiện hỗ trợ hai chế độ vận hành:
                            nếu operator cấu hình entitlement API thì app sẽ ưu tiên server-backed activation;
                            nếu chưa cấu hình hoặc server lỗi, app mới rơi về signed-token fallback theo runtime policy.
                        </div>

                        <button
                            onClick={handleTrial}
                            style={{
                                width: '100%',
                                background: '#eef6ff',
                                color: '#0b5ed7',
                                border: '2px dashed #9ec5fe',
                                borderRadius: 16,
                                padding: '14px',
                                fontFamily: 'var(--font-display)',
                                fontWeight: 700,
                                cursor: 'pointer',
                                marginBottom: '1rem',
                            }}
                        >
                            🎁 Bắt đầu trial 7 ngày
                        </button>

                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder={PREMIUM_TOKEN_PLACEHOLDER}
                                value={code}
                                onChange={(event) => setCode(event.target.value)}
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                                maxLength={240}
                                style={{
                                    flex: '1 1 360px',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 14,
                                    padding: '14px 16px',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    letterSpacing: 0.3,
                                }}
                            />
                            <button
                                onClick={handleUnlock}
                                style={{
                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 14,
                                    padding: '14px 20px',
                                    fontFamily: 'var(--font-display)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                Kích hoạt
                            </button>
                        </div>
                    </div>
                </>
            )}

            {feedback && (
                <div style={{
                    background: feedback.success ? '#d4edda' : '#f8d7da',
                    color: feedback.success ? '#155724' : '#842029',
                    borderRadius: 14,
                    padding: '12px 14px',
                    border: `1px solid ${feedback.success ? '#b7e4c7' : '#f1aeb5'}`,
                    marginBottom: '1rem',
                }}>
                    {feedback.message}
                </div>
            )}

            <div style={{
                background: '#fff',
                borderRadius: 18,
                padding: '1rem 1.1rem',
                border: '1px solid rgba(15, 23, 42, 0.06)',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.05)',
            }}>
                <div style={{ fontFamily: 'var(--font-display)', color: '#1f2937', marginBottom: 8 }}>
                    Vận hành theo chuẩn hiện tại
                </div>
                <div style={{ color: '#64748b', fontSize: '0.86rem', lineHeight: 1.7 }}>
                    Soft paywall chỉ là mô hình local/web fallback. Khi entitlement API được cấu hình và reachable,
                    web edition sẽ tự chuyển sang server-backed web entitlement và đồng bộ lại trên mỗi lần khởi động theo runtime policy.
                </div>
            </div>
        </div>
    );
}

function MetaCard({ label, value }) {
    return (
        <div style={{
            background: 'rgba(255, 255, 255, 0.72)',
            borderRadius: 14,
            border: '1px solid rgba(148, 163, 184, 0.25)',
            padding: '10px 12px',
        }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 4 }}>{label}</div>
            <div style={{ fontFamily: 'var(--font-display)', color: '#0f172a', fontSize: '0.86rem', lineHeight: 1.45 }}>
                {value}
            </div>
        </div>
    );
}

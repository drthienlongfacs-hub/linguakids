import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useGame } from '../context/GameStateContext';
import {
    loadVideoLessonOps,
    loadVideoLessonReviewQueue,
} from '../services/videoLessonManifestService';
import { getVideoLessonTelemetrySummary } from '../services/videoLessonTelemetryService';
import { isAdultMode } from '../utils/userMode';

const FILTERS = ['all', 'candidate', 'review_queue', 'ready_to_publish', 'blocked', 'public'];

function formatPercent(value) {
    if (typeof value !== 'number') {
        return '--';
    }

    return `${Math.round(value * 100)}%`;
}

function badgeStyle(decision) {
    if (decision === 'green') return { background: 'rgba(34,197,94,0.14)', color: '#166534' };
    if (decision === 'yellow') return { background: 'rgba(245,158,11,0.14)', color: '#92400E' };
    return { background: 'rgba(239,68,68,0.14)', color: '#991B1B' };
}

export default function VideoLessonReview() {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const [filter, setFilter] = useState('all');
    const [reviewState, setReviewState] = useState({
        status: 'loading',
        reviewQueue: null,
        ops: null,
        error: null,
    });

    useEffect(() => {
        let active = true;

        Promise.all([loadVideoLessonReviewQueue(), loadVideoLessonOps()])
            .then(([reviewQueue, ops]) => {
                if (!active) return;
                setReviewState({
                    status: 'ready',
                    reviewQueue,
                    ops,
                    error: null,
                });
            })
            .catch((error) => {
                if (!active) return;
                setReviewState({
                    status: 'error',
                    reviewQueue: null,
                    ops: null,
                    error,
                });
            });

        return () => {
            active = false;
        };
    }, []);

    const telemetry = useMemo(() => getVideoLessonTelemetrySummary(), []);
    const filteredItems = useMemo(() => {
        const items = Array.isArray(reviewState.reviewQueue?.items) ? reviewState.reviewQueue.items : [];
        if (filter === 'all') {
            return items;
        }
        return items.filter((item) => item.status === filter);
    }, [filter, reviewState.reviewQueue]);

    if (reviewState.status === 'loading') {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" type="button" onClick={() => navigate(-1)}>←</button>
                    <h2 className="page-header__title">🧭 {adult ? 'Video Review Queue' : 'Hang duyet video'}</h2>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    {adult ? 'Loading review queue...' : 'Dang tai hang duyet...'}
                </div>
            </div>
        );
    }

    if (reviewState.status === 'error') {
        return (
            <div className="page">
                <div className="page-header">
                    <button className="page-header__back" type="button" onClick={() => navigate(-1)}>←</button>
                    <h2 className="page-header__title">🧭 {adult ? 'Video Review Queue' : 'Hang duyet video'}</h2>
                </div>
                <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                    {reviewState.error?.message || (adult ? 'Could not load review data.' : 'Khong tai duoc du lieu duyet.')}
                </div>
            </div>
        );
    }

    const summary = reviewState.reviewQueue?.summary || {};
    const opsSummary = reviewState.ops?.summary || {};
    const monitoring = reviewState.ops?.monitoring || {};
    const waves = Array.isArray(reviewState.reviewQueue?.waves) ? reviewState.reviewQueue.waves : [];
    const decisionSchema = reviewState.reviewQueue?.decisionSchema || {};

    return (
        <div className="page">
            <div className="page-header">
                <button className="page-header__back" type="button" onClick={() => navigate(-1)}>←</button>
                <h2 className="page-header__title">🧭 {adult ? 'Video Review Queue' : 'Hang duyet video'}</h2>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
                <div className="glass-card" style={{ padding: '14px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '8px', fontWeight: 700 }}>
                        {adult ? 'Pipeline summary' : 'Tong quan pipeline'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
                        {[
                            { label: adult ? 'Candidate' : 'Ung vien', value: summary.candidateLessons || 0 },
                            { label: adult ? 'Review queue' : 'Hang duyet', value: summary.reviewQueueLessons || 0 },
                            { label: adult ? 'Ready' : 'San sang', value: summary.readyToPublishLessons || 0 },
                            { label: adult ? 'Blocked' : 'Bi chan', value: summary.blockedLessons || 0 },
                        ].map((item) => (
                            <div key={item.label} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(79,70,229,0.06)' }}>
                                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{item.value}</div>
                                <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>{item.label}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.78rem', color: 'var(--color-text-light)', lineHeight: 1.55 }}>
                        {adult
                            ? `Decision buckets: green ${opsSummary.decisionCounts?.green || 0}, yellow ${opsSummary.decisionCounts?.yellow || 0}, red ${opsSummary.decisionCounts?.red || 0}.`
                            : `Nhom quyet dinh: xanh ${opsSummary.decisionCounts?.green || 0}, vang ${opsSummary.decisionCounts?.yellow || 0}, do ${opsSummary.decisionCounts?.red || 0}.`}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '14px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '8px', fontWeight: 700 }}>
                        {adult ? 'Rollout waves' : 'Cac dot mo lai'}
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {waves.map((wave) => (
                            <div key={wave.wave} style={{ padding: '12px', borderRadius: '12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>
                                    {adult ? `Wave ${wave.wave}` : `Dot ${wave.wave}`} · {wave.targetSize} {adult ? 'slots' : 'vi tri'}
                                </div>
                                <div style={{ fontSize: '0.76rem', color: 'var(--color-text-light)', marginTop: '4px', lineHeight: 1.55 }}>
                                    {adult
                                        ? `Green ${wave.greenCount} · Yellow ${wave.yellowCount} · Red ${wave.redCount} · Publicable now ${wave.publicableNowCount}`
                                        : `Xanh ${wave.greenCount} · Vang ${wave.yellowCount} · Do ${wave.redCount} · Co the public ngay ${wave.publicableNowCount}`}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '14px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '8px', fontWeight: 700 }}>
                        {adult ? 'Local runtime telemetry' : 'Thong ke runtime tren thiet bi nay'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px' }}>
                        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(79,70,229,0.06)' }}>
                            <div style={{ fontWeight: 800 }}>{formatPercent(telemetry.rates.video_source_error_rate)}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-light)' }}>{adult ? 'Source error' : 'Loi source'}</div>
                        </div>
                        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(79,70,229,0.06)' }}>
                            <div style={{ fontWeight: 800 }}>{formatPercent(telemetry.rates.quiz_complete_rate)}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-light)' }}>{adult ? 'Quiz complete' : 'Hoan thanh quiz'}</div>
                        </div>
                        <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(79,70,229,0.06)' }}>
                            <div style={{ fontWeight: 800 }}>{formatPercent(telemetry.rates.subtitle_toggle_rate)}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--color-text-light)' }}>{adult ? 'Subtitle toggle' : 'Doi che do phu de'}</div>
                        </div>
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '0.76rem', color: 'var(--color-text-light)' }}>
                        {adult
                            ? 'This is local device telemetry only. Use it as an early warning, not as release truth.'
                            : 'Day chi la thong ke tren thiet bi nay. Dung de canh bao som, khong phai su that release toan he thong.'}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '14px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '8px', fontWeight: 700 }}>
                        {adult ? 'Rollout guardrails' : 'Guardrail rollout'}
                    </div>
                    <div style={{ fontSize: '0.78rem', lineHeight: 1.6 }}>
                        <strong>{adult ? 'Review reject rate:' : 'Ty le reject duyet:'}</strong>{' '}
                        {formatPercent(monitoring.metrics?.review_reject_rate)}
                        <br />
                        <strong>{adult ? 'Wave stop threshold:' : 'Nguong dung dot:'}</strong>{' '}
                        {formatPercent(reviewState.ops?.stopConditions?.thresholds?.review_reject_rate)}
                        <br />
                        <strong>{adult ? 'Source error threshold:' : 'Nguong loi source:'}</strong>{' '}
                        {formatPercent(reviewState.ops?.stopConditions?.thresholds?.video_source_error_rate)}
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '14px' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginBottom: '8px', fontWeight: 700 }}>
                        {adult ? 'Decision commands' : 'Lenh quyet dinh'}
                    </div>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '0.72rem', color: 'var(--color-text-light)' }}>
                        {Object.entries(decisionSchema).map(([key, value]) => (
                            <div key={key} style={{ padding: '10px 12px', borderRadius: '12px', background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                                <div style={{ fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>{key}</div>
                                <div>{value.command}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {FILTERS.map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => setFilter(value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '999px',
                                border: '1px solid var(--color-border)',
                                background: filter === value ? 'var(--color-primary)' : 'var(--color-card)',
                                color: filter === value ? '#fff' : 'var(--color-text)',
                                fontWeight: 700,
                                cursor: 'pointer',
                            }}
                        >
                            {value}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gap: '8px' }}>
                    {filteredItems.map((item) => {
                        const badge = badgeStyle(item.autoDecision);
                        return (
                            <div key={item.lessonId} className="glass-card" style={{ padding: '14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start' }}>
                                    <div style={{ minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{adult ? item.title : item.titleVi}</div>
                                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                                            {item.levelTitle} · {item.categoryTitle} · {item.lessonId} · {item.subtitleLabel}
                                        </div>
                                    </div>
                                    <div style={{
                                        padding: '6px 10px',
                                        borderRadius: '999px',
                                        fontSize: '0.72rem',
                                        fontWeight: 800,
                                        ...badge,
                                    }}
                                    >
                                        {item.autoDecision} · {item.riskScore}
                                    </div>
                                </div>
                                <div style={{ marginTop: '8px', fontSize: '0.78rem', lineHeight: 1.6 }}>
                                    <strong>{adult ? 'Status:' : 'Trang thai:'}</strong> {item.status}
                                    <br />
                                    <strong>{adult ? 'Review:' : 'Duyet:'}</strong> {item.manualReviewStatus}
                                    <br />
                                    <strong>{adult ? 'Wave:' : 'Dot:'}</strong> {item.wave || '--'}
                                    <br />
                                    <strong>{adult ? 'Quiz count:' : 'So cau quiz:'}</strong> {item.quizCount}
                                    <br />
                                    <strong>{adult ? 'Canonical source:' : 'Nguon canonical:'}</strong>{' '}
                                    {item.canonicalSrc || '--'}
                                </div>
                                {item.blockingReasons?.length > 0 ? (
                                    <div style={{ marginTop: '8px', fontSize: '0.74rem', color: '#991B1B' }}>
                                        <strong>{adult ? 'Blocking reasons:' : 'Ly do chan:'}</strong> {item.blockingReasons.join(', ')}
                                    </div>
                                ) : null}
                                {item.autoReasons?.length > 0 ? (
                                    <div style={{ marginTop: '6px', fontSize: '0.74rem', color: 'var(--color-text-light)' }}>
                                        <strong>{adult ? 'Auto reasons:' : 'Ly do tu dong:'}</strong> {item.autoReasons.join(', ')}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

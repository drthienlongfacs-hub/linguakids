import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isPremium, unlockPremium, startTrial, getPremiumStatus, PREMIUM_FEATURES } from '../services/premiumService';

export default function PremiumUpgrade() {
    const [code, setCode] = useState('');
    const [msg, setMsg] = useState(null);
    const [premium, setPremium] = useState(isPremium());
    const navigate = useNavigate();
    const status = getPremiumStatus();

    const handleUnlock = () => {
        const result = unlockPremium(code);
        setMsg(result);
        if (result.success) setTimeout(() => setPremium(true), 1200);
    };

    const handleTrial = () => {
        const result = startTrial();
        setMsg(result);
        if (result.success) setTimeout(() => setPremium(true), 1200);
    };

    if (premium) {
        return (
            <div className="page-container" style={{ padding: '2rem 1rem', maxWidth: 600, margin: 'auto' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 20, padding: '2rem', textAlign: 'center', color: '#fff',
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: 8 }}>👑</div>
                    <h2 style={{ margin: '0 0 8px', fontFamily: 'var(--font-display)' }}>Premium Active</h2>
                    <p style={{ opacity: 0.9, margin: 0 }}>
                        {status.type === 'trial'
                            ? `Dùng thử đến ${new Date(status.expiresAt).toLocaleDateString('vi-VN')}`
                            : 'Trọn đời — Cảm ơn bạn đã ủng hộ!'}
                    </p>
                </div>
                <button onClick={() => navigate('/')} style={{
                    display: 'block', margin: '1.5rem auto 0', background: 'var(--color-primary)',
                    color: '#fff', border: 'none', borderRadius: 12, padding: '12px 32px',
                    fontFamily: 'var(--font-display)', fontSize: '1rem', cursor: 'pointer',
                }}>
                    ← Về trang chủ
                </button>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ padding: '1rem', maxWidth: 640, margin: 'auto' }}>
            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 24, padding: '2rem 1.5rem', textAlign: 'center', color: '#fff',
                marginBottom: '1.5rem',
            }}>
                <div style={{ fontSize: '3.5rem', marginBottom: 4 }}>👑</div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', margin: '0 0 8px' }}>
                    LinguaKids Premium
                </h1>
                <p style={{ opacity: 0.9, margin: 0, fontSize: '1rem', lineHeight: 1.5 }}>
                    Mở khóa trọn bộ chương trình học <br />cho bé yêu của bạn
                </p>
            </div>

            {/* Features grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px',
                marginBottom: '1.5rem',
            }}>
                {PREMIUM_FEATURES.map(f => (
                    <div key={f.id} style={{
                        background: '#fff', borderRadius: 16, padding: '16px 12px',
                        textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        border: '1px solid #f0f0f0',
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: 4 }}>{f.icon}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', color: '#333' }}>{f.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888', marginTop: 2 }}>{f.desc}</div>
                    </div>
                ))}
            </div>

            {/* Pricing */}
            <div style={{
                background: '#fff', borderRadius: 20, padding: '1.5rem',
                textAlign: 'center', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                border: '2px solid var(--color-primary)', marginBottom: '1.5rem',
            }}>
                <div style={{ fontSize: '0.85rem', color: '#888', textDecoration: 'line-through' }}>199.000₫</div>
                <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', fontWeight: 800 }}>
                    99.000₫
                </div>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                    Một lần duy nhất • Trọn đời • Không subscription
                </div>

                {/* Purchase instruction — external payment, NOT in-app */}
                <div style={{
                    background: '#f8f9fa', borderRadius: 12, padding: '16px',
                    fontSize: '0.85rem', color: '#555', lineHeight: 1.6,
                    textAlign: 'left',
                }}>
                    <strong>📋 Cách mua Premium:</strong>
                    <ol style={{ margin: '8px 0 0', paddingLeft: '1.2rem' }}>
                        <li>Chuyển khoản <strong>99.000₫</strong> qua Momo/ZaloPay/Ngân hàng</li>
                        <li>Ghi nội dung: <strong>LinguaKids Premium</strong></li>
                        <li>Gửi biên lai qua email: <strong>drthienlongfacs@gmail.com</strong></li>
                        <li>Nhận mã kích hoạt trong vòng 24h</li>
                    </ol>
                    <div style={{ marginTop: 8, fontSize: '0.8rem', color: '#888' }}>
                        💡 Hoặc nhắn tin Zalo/Messenger cho hỗ trợ nhanh hơn.
                    </div>
                </div>
            </div>

            {/* Trial */}
            <button onClick={handleTrial} style={{
                display: 'block', width: '100%', background: '#f0f7ff', color: 'var(--color-primary)',
                border: '2px dashed var(--color-primary)', borderRadius: 16, padding: '14px',
                fontSize: '1rem', fontFamily: 'var(--font-display)', cursor: 'pointer',
                marginBottom: '1rem',
            }}>
                🎁 Dùng thử miễn phí 7 ngày
            </button>

            {/* Unlock code */}
            <div style={{
                background: '#fff', borderRadius: 16, padding: '1.5rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', marginTop: 0 }}>
                    🔑 Nhập mã kích hoạt
                </h3>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <input
                        type="text"
                        placeholder="LK-XXXXXXXX-XXXX"
                        value={code}
                        onChange={e => setCode(e.target.value.toUpperCase())}
                        maxLength={15}
                        style={{
                            flex: 1, border: '2px solid #e0e0e0', borderRadius: 12,
                            padding: '12px', fontSize: '1rem', fontFamily: 'monospace',
                            textAlign: 'center', letterSpacing: 2,
                        }}
                    />
                    <button onClick={handleUnlock} style={{
                        background: 'var(--color-primary)', color: '#fff', border: 'none',
                        borderRadius: 12, padding: '12px 20px', fontSize: '0.95rem',
                        fontFamily: 'var(--font-display)', cursor: 'pointer', whiteSpace: 'nowrap',
                    }}>
                        Kích hoạt
                    </button>
                </div>
                {msg && (
                    <p style={{
                        margin: 0, padding: '8px 12px', borderRadius: 8, fontSize: '0.9rem',
                        background: msg.success ? '#d4edda' : '#f8d7da',
                        color: msg.success ? '#155724' : '#721c24',
                    }}>
                        {msg.message}
                    </p>
                )}
            </div>

            {/* Honest guarantees — NO "100% secure" claim */}
            <div style={{
                display: 'flex', justifyContent: 'center', gap: '1.5rem',
                marginTop: '1.5rem', fontSize: '0.8rem', color: '#888',
                flexWrap: 'wrap',
            }}>
                <span>📵 Không thu dữ liệu</span>
                <span>💯 Hoàn tiền 7 ngày</span>
                <span>❤️ Ủng hộ tác giả</span>
            </div>

            <button onClick={() => navigate(-1)} style={{
                display: 'block', margin: '1.5rem auto', background: 'none', border: 'none',
                color: 'var(--color-primary)', fontSize: '0.95rem', cursor: 'pointer',
                fontFamily: 'var(--font-display)',
            }}>
                ← Quay lại
            </button>
        </div>
    );
}

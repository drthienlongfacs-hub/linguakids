import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    unlockPremium,
    startTrial,
    PREMIUM_FEATURES,
    PREMIUM_TOKEN_PLACEHOLDER,
} from '../services/premiumService';
import usePremiumStatus from '../hooks/usePremiumStatus';

/**
 * PremiumGate — wraps content that requires premium.
 * If user is premium → renders children normally.
 * If not → shows beautiful paywall with unlock option.
 */
export default function PremiumGate({ children, featureName = '' }) {
    const [code, setCode] = useState('');
    const [msg, setMsg] = useState(null);
    const { premiumStatus, runtimeStatus, refresh } = usePremiumStatus();
    const navigate = useNavigate();

    if (premiumStatus.active) return children;

    const handleUnlock = async () => {
        const result = await unlockPremium(code);
        setMsg(result);
        if (result.success) {
            setCode('');
        }
        await refresh(true);
    };

    const handleTrial = async () => {
        const result = startTrial();
        setMsg(result);
        await refresh(true);
    };

    return (
        <div className="premium-gate">
            <div className="premium-gate__overlay">
                <div className="premium-gate__card">
                    {/* Crown icon */}
                    <div className="premium-gate__icon">👑</div>

                    <h2 className="premium-gate__title">Nội dung Premium</h2>
                    <p className="premium-gate__subtitle">
                        {featureName
                            ? `"${featureName}" là tính năng Premium`
                            : 'Mở khóa toàn bộ nội dung học tập'}
                    </p>

                    {/* Feature highlights */}
                    <div className="premium-gate__features">
                        {PREMIUM_FEATURES.slice(0, 4).map(f => (
                            <div key={f.id} className="premium-gate__feature">
                                <span className="premium-gate__feature-icon">{f.icon}</span>
                                <span className="premium-gate__feature-name">{f.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Price badge */}
                    <div className="premium-gate__price">
                        <span className="premium-gate__price-current">Premium access</span>
                        <span className="premium-gate__price-label">
                            {runtimeStatus.configured
                                ? 'Ưu tiên entitlement server, fallback sang signed token theo runtime policy'
                                : 'Kích hoạt bằng signed token hoặc trial nội bộ'}
                        </span>
                    </div>

                    {/* CTA buttons */}
                    <button
                        className="premium-gate__btn-buy"
                        onClick={() => navigate('/premium')}
                    >
                        🧾 Xem tùy chọn kích hoạt
                    </button>

                    <button
                        className="premium-gate__btn-trial"
                        onClick={handleTrial}
                    >
                        🎁 Dùng thử 7 ngày miễn phí
                    </button>

                    {/* Unlock code input */}
                    <div className="premium-gate__unlock">
                        <p className="premium-gate__unlock-label">Đã có mã kích hoạt?</p>
                        <div className="premium-gate__unlock-row">
                            <input
                                type="text"
                                placeholder={PREMIUM_TOKEN_PLACEHOLDER}
                                value={code}
                                onChange={e => setCode(e.target.value)}
                                className="premium-gate__input"
                                maxLength={240}
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck={false}
                            />
                            <button onClick={handleUnlock} className="premium-gate__btn-unlock">
                                Kích hoạt
                            </button>
                        </div>
                        {msg && (
                            <p className={`premium-gate__msg ${msg.success ? 'success' : 'error'}`}>
                                {msg.message}
                            </p>
                        )}
                    </div>

                    {/* Back button */}
                    <button
                        className="premium-gate__btn-back"
                        onClick={() => navigate(-1)}
                    >
                        ← Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
}

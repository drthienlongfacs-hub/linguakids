// ErrorBoundary — Catches React render errors gracefully
import { Component } from 'react';

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('LinguaKids Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', minHeight: '60vh', textAlign: 'center',
                    padding: '24px',
                }}>
                    <div style={{ fontSize: '5rem', marginBottom: '16px' }}>😵</div>
                    <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>
                        Oops! Có lỗi xảy ra
                    </h2>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '24px', maxWidth: '400px' }}>
                        Đừng lo — hãy thử tải lại trang hoặc quay về trang chủ nhé!
                    </p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            className="btn btn--primary btn--large"
                            onClick={() => window.location.reload()}
                        >
                            🔄 Tải lại
                        </button>
                        <button
                            className="btn btn--outline btn--large"
                            onClick={() => { window.location.hash = '#/'; window.location.reload(); }}
                        >
                            🏠 Về trang chủ
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

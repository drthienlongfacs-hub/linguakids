import { Link, useLocation } from 'react-router-dom';
import {
    BRAND_WATERMARK_TEXT,
    COPYRIGHT_OWNER,
    COPYRIGHT_TITLE,
} from '../config/brandProtection';

const WATERMARK_ROWS = Array.from({ length: 6 }, (_, index) => ({
    id: index,
    text: `${BRAND_WATERMARK_TEXT} • ${BRAND_WATERMARK_TEXT} • ${BRAND_WATERMARK_TEXT}`,
}));

export default function CopyrightSeal() {
    const location = useLocation();
    const isLegalPage = location.pathname === '/legal-notice';

    return (
        <>
            <div className="app-copyright-watermark" aria-hidden="true">
                {WATERMARK_ROWS.map((row) => (
                    <span key={row.id}>{row.text}</span>
                ))}
            </div>

            <footer className="copyright-seal" aria-label="Chan trang ban quyen">
                <div className="copyright-seal__inner">
                    <div className="copyright-seal__eyebrow">Quyen phat trien</div>
                    <strong className="copyright-seal__owner">{COPYRIGHT_OWNER}</strong>
                    <p className="copyright-seal__line">{COPYRIGHT_TITLE}</p>
                </div>
                {!isLegalPage && (
                    <Link className="copyright-seal__link" to="/legal-notice">
                        Xem tuyen bo quyen
                    </Link>
                )}
            </footer>
        </>
    );
}

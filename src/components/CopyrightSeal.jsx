import { Link, useLocation } from 'react-router-dom';
import {
    BRAND_WATERMARK_TEXT,
    COPYRIGHT_NOTICE,
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

            <aside className="copyright-seal" aria-label="Dau ban quyen">
                <div className="copyright-seal__eyebrow">Ban quyen phat trien</div>
                <strong className="copyright-seal__owner">{COPYRIGHT_OWNER}</strong>
                <p className="copyright-seal__line">{COPYRIGHT_TITLE}</p>
                <p className="copyright-seal__line">{COPYRIGHT_NOTICE}</p>
                {!isLegalPage && (
                    <Link className="copyright-seal__link" to="/legal-notice">
                        Tuyen bo quyen
                    </Link>
                )}
            </aside>
        </>
    );
}

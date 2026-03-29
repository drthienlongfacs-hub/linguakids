import { useNavigate } from 'react-router-dom';
import {
    COPYRIGHT_NOTICE,
    COPYRIGHT_OWNER,
    COPYRIGHT_RIGHTS,
    COPYRIGHT_SCOPE,
    COPYRIGHT_TECHNICAL_MEASURES,
    COPYRIGHT_TITLE,
    COPYRIGHT_WARNING,
    THIRD_PARTY_NOTICE,
} from '../config/brandProtection';

export default function LegalNotice() {
    const navigate = useNavigate();

    return (
        <div className="page legal-notice-page">
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate(-1)}>←</button>
                <h2 className="page-header__title">Tuyen bo quyen</h2>
            </div>

            <section className="legal-notice-card">
                <span className="legal-notice-card__eyebrow">Chu so huu va phat trien</span>
                <h3>{COPYRIGHT_OWNER}</h3>
                <p>{COPYRIGHT_TITLE}</p>
                <p>{COPYRIGHT_NOTICE}</p>
            </section>

            <section className="legal-notice-card">
                <h3>Pham vi bao ho</h3>
                <p>{COPYRIGHT_RIGHTS}</p>
                <ul className="legal-notice-list">
                    {COPYRIGHT_SCOPE.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </section>

            <section className="legal-notice-card">
                <h3>Han che su dung khong duoc phep</h3>
                <p>{COPYRIGHT_WARNING}</p>
            </section>

            <section className="legal-notice-card">
                <h3>Bien phap nhan dien va rang buoc</h3>
                <ul className="legal-notice-list">
                    {COPYRIGHT_TECHNICAL_MEASURES.map((item) => (
                        <li key={item}>{item}</li>
                    ))}
                </ul>
            </section>

            <section className="legal-notice-card">
                <h3>Thanh phan ben thu ba</h3>
                <p>{THIRD_PARTY_NOTICE}</p>
            </section>

            <section className="legal-notice-card">
                <h3>Chinh sach video lesson</h3>
                <p>
                    Video lesson public chi duoc phat hanh khi co nguon hop le, giay phep ro rang va
                    co the phat truc tiep trong app/PWA. Nguon YouTube chi duoc giu lai lam tham chieu,
                    khong duoc xem la nguon phat canonical cho lesson public.
                </p>
                <ul className="legal-notice-list">
                    <li>Moi lesson public phai co bang chung license va quyen rehost.</li>
                    <li>Nguon phat canonical phai duoc host tren object storage/CDN do LinguaKids kiem soat.</li>
                    <li>Lesson chua dat du cac dieu kien tren se bi an khoi giao dien public.</li>
                </ul>
            </section>
        </div>
    );
}

import {
    BRAND_NAME,
    COPYRIGHT_NOTICE,
    COPYRIGHT_OWNER,
    COPYRIGHT_RIGHTS,
    COPYRIGHT_TITLE,
    COPYRIGHT_WARNING,
} from '../config/brandProtection';

function upsertMeta(selector, attributes, content) {
    let node = document.head.querySelector(selector);
    if (!node) {
        node = document.createElement('meta');
        Object.entries(attributes).forEach(([key, value]) => {
            node.setAttribute(key, value);
        });
        document.head.appendChild(node);
    }
    node.setAttribute('content', content);
}

function upsertJsonLd(id, payload) {
    let node = document.head.querySelector(`#${id}`);
    if (!node) {
        node = document.createElement('script');
        node.type = 'application/ld+json';
        node.id = id;
        document.head.appendChild(node);
    }
    node.textContent = JSON.stringify(payload);
}

export function bootstrapBrandProtection() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
    }

    upsertMeta('meta[name="author"]', { name: 'author' }, COPYRIGHT_OWNER);
    upsertMeta('meta[name="creator"]', { name: 'creator' }, COPYRIGHT_OWNER);
    upsertMeta('meta[name="publisher"]', { name: 'publisher' }, COPYRIGHT_OWNER);
    upsertMeta('meta[name="copyright"]', { name: 'copyright' }, COPYRIGHT_NOTICE);
    upsertMeta('meta[name="rights"]', { name: 'rights' }, COPYRIGHT_RIGHTS);
    upsertMeta('meta[name="application-name"]', { name: 'application-name' }, BRAND_NAME);
    upsertMeta(
        'meta[name="robots"]',
        { name: 'robots' },
        'index,follow,noarchive,nosnippet,max-snippet:0,max-image-preview:none'
    );
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name' }, BRAND_NAME);
    upsertMeta('meta[property="og:type"]', { property: 'og:type' }, 'website');
    upsertMeta('meta[property="article:author"]', { property: 'article:author' }, COPYRIGHT_OWNER);

    document.documentElement.dataset.brandOwner = COPYRIGHT_OWNER;
    document.documentElement.dataset.brandNotice = COPYRIGHT_NOTICE;
    document.documentElement.style.setProperty('--brand-watermark-text', `"${COPYRIGHT_OWNER}"`);

    window.__LINGUAKIDS_COPYRIGHT__ = Object.freeze({
        app: BRAND_NAME,
        owner: COPYRIGHT_OWNER,
        title: COPYRIGHT_TITLE,
        notice: COPYRIGHT_NOTICE,
        rights: COPYRIGHT_RIGHTS,
        warning: COPYRIGHT_WARNING,
        registeredAt: new Date().toISOString(),
    });

    upsertJsonLd('linguakids-brand-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: BRAND_NAME,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        inLanguage: ['vi', 'en', 'zh'],
        creator: {
            '@type': 'Person',
            name: COPYRIGHT_OWNER,
        },
        author: {
            '@type': 'Person',
            name: COPYRIGHT_OWNER,
        },
        publisher: {
            '@type': 'Person',
            name: COPYRIGHT_OWNER,
        },
        copyrightNotice: COPYRIGHT_NOTICE,
    });

    console.info(
        `%c${BRAND_NAME}%c ${COPYRIGHT_NOTICE}`,
        'background:#111827;color:#F8FAFC;padding:4px 8px;border-radius:999px;font-weight:700;',
        'color:#2563EB;font-weight:700;'
    );
    console.info(COPYRIGHT_WARNING);
}

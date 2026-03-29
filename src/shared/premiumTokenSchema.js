export const PREMIUM_TOKEN_PREFIX = 'LK1';
export const PREMIUM_TOKEN_AUDIENCE = 'linguakids-premium';
export const PREMIUM_TOKEN_VERSION = 1;
export const PREMIUM_TOKEN_PLACEHOLDER = 'LK1.<payload>.<signature>';

export const PREMIUM_PUBLIC_JWK = {
    kty: 'EC',
    crv: 'P-256',
    x: 'e1V_QafkKUc0KmgnW58KogZHA_8D4BGDFDbfPk1Dlpw',
    y: 'S4DJlquwrv0ss9alXVf3Dnq8iQ0QB-cUuO48A_00Y9w',
};

export function bytesToBase64Url(value) {
    return btoa(String.fromCharCode(...value))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

export function base64UrlToBytes(value) {
    const normalized = String(value || '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    const binary = atob(`${normalized}${padding}`);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

export function encodePremiumPayload(payload) {
    return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(payload)));
}

export function decodePremiumPayload(payloadSegment) {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(payloadSegment)));
}

export function parseSignedPremiumToken(token) {
    const cleaned = String(token || '').trim();
    const parts = cleaned.split('.');
    if (parts.length !== 3 || parts[0] !== PREMIUM_TOKEN_PREFIX) {
        return null;
    }
    return {
        raw: cleaned,
        payloadSegment: parts[1],
        signatureSegment: parts[2],
    };
}

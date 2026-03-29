// premiumService.js v3.0 — Signed token activation for LinguaKids web
// ================================================================
// SECURITY MODEL: Soft paywall with asymmetric token verification
// - Premium entitlement is still enforced on the client
// - Client-side gating is deterrence, not authoritative authorization
// - Token forging is harder because only the public key ships in the app
// - localStorage tampering remains possible for a determined user
// - For true entitlement control, move premium content/services server-side
// - For App Store / Google Play builds, use native billing entitlements
// ================================================================

import {
    base64UrlToBytes,
    decodePremiumPayload,
    parseSignedPremiumToken,
    PREMIUM_PUBLIC_JWK,
    PREMIUM_TOKEN_AUDIENCE,
    PREMIUM_TOKEN_PLACEHOLDER,
    PREMIUM_TOKEN_VERSION,
} from '../shared/premiumTokenSchema.js';

export { PREMIUM_TOKEN_PLACEHOLDER };

const STORAGE_KEY = 'linguakids_premium';
const TRIAL_KEY = 'linguakids_trial';

let importedPremiumKeyPromise = null;

export const FREE_ENGLISH_TOPICS = [
    'alphabet', 'colors', 'numbers', 'animals', 'family',
];

export const FREE_CHINESE_TOPICS = [
    'greetings', 'numbers', 'colors',
];

export const FREE_ROUTES = new Set([
    '/', '/english', '/chinese', '/games', '/progress',
    '/achievements', '/settings', '/legal-notice',
    '/privacy', '/terms', '/premium', '/parent-dashboard',
    '/vocabulary', '/review', '/leaderboard',
    '/lesson/en/alphabet', '/lesson/en/colors', '/lesson/en/numbers',
    '/lesson/en/animals', '/lesson/en/family',
    '/lesson-cn/greetings', '/lesson-cn/numbers', '/lesson-cn/colors',
    '/game/memory/en', '/game/quiz/en', '/matching',
    '/teacher-lessons',
]);

export const PREMIUM_FEATURES = [
    { id: 'unlimited_topics', icon: '📚', name: 'Toàn bộ chủ đề', nameEn: 'All Topics', desc: '40+ chủ đề tiếng Anh & Trung' },
    { id: 'speaking', icon: '🎤', name: 'Luyện nói AI', nameEn: 'AI Speaking Practice', desc: 'Shadowing, Free Speaking, Accent Practice' },
    { id: 'listening', icon: '🎧', name: 'Nghe nâng cao', nameEn: 'Advanced Listening', desc: 'Dictation, Listening Comprehension' },
    { id: 'reading', icon: '📖', name: 'Đọc & Viết', nameEn: 'Reading & Writing', desc: 'Reading Hub, Writing Hub, Stories' },
    { id: 'grammar', icon: '📝', name: 'Ngữ pháp', nameEn: 'Grammar', desc: 'Tenses, Prepositions, Conditionals, Passive Voice' },
    { id: 'exam', icon: '📋', name: 'Luyện thi', nameEn: 'Exam Prep', desc: 'IELTS Simulator, HSK Simulator, Placement Test' },
    { id: 'spaced_rep', icon: '🧠', name: 'FSRS Ôn tập thông minh', nameEn: 'Smart Review', desc: 'Thuật toán ghi nhớ khoa học FSRS v4' },
    { id: 'parent_dashboard', icon: '👨‍👩‍👧', name: 'Bảng điều khiển phụ huynh', nameEn: 'Parent Dashboard', desc: 'Theo dõi tiến trình chi tiết' },
];

function loadPremiumState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function savePremiumState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function supportsPremiumTokenVerify() {
    return !!globalThis.crypto?.subtle;
}

async function importPremiumPublicKey() {
    if (!importedPremiumKeyPromise) {
        importedPremiumKeyPromise = globalThis.crypto.subtle.importKey(
            'jwk',
            PREMIUM_PUBLIC_JWK,
            { name: 'ECDSA', namedCurve: 'P-256' },
            false,
            ['verify']
        ).catch((error) => {
            importedPremiumKeyPromise = null;
            throw error;
        });
    }

    return importedPremiumKeyPromise;
}

function normalizeDateFromEpochSeconds(epochSeconds) {
    if (!Number.isFinite(epochSeconds)) return null;
    return new Date(epochSeconds * 1000).toISOString();
}

function validatePayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return { ok: false, message: 'Token payload không hợp lệ' };
    }

    if (payload.v !== PREMIUM_TOKEN_VERSION) {
        return { ok: false, message: 'Token version không được hỗ trợ' };
    }

    if (payload.a !== PREMIUM_TOKEN_AUDIENCE) {
        return { ok: false, message: 'Token audience không hợp lệ' };
    }

    if (!['lifetime', 'trial_token'].includes(payload.t)) {
        return { ok: false, message: 'Token type không hợp lệ' };
    }

    if (payload.e && Number(payload.e) < Math.floor(Date.now() / 1000)) {
        return { ok: false, message: 'Mã kích hoạt đã hết hạn' };
    }

    return { ok: true };
}

async function verifySignedToken(token) {
    if (!supportsPremiumTokenVerify()) {
        return {
            ok: false,
            message: 'Thiết bị này không hỗ trợ xác thực token ký số.',
        };
    }

    const parsed = parseSignedPremiumToken(token);
    if (!parsed) {
        if (/^LK-[A-Z0-9]{8}-[A-Z0-9]{4}$/i.test(String(token || '').trim())) {
            return {
                ok: false,
                message: 'Mã kích hoạt đời cũ đã được thay bằng token ký số LK1. Vui lòng liên hệ để được cấp lại.',
            };
        }
        return {
            ok: false,
            message: 'Token không đúng định dạng LK1.',
        };
    }

    let payload;
    try {
        payload = decodePremiumPayload(parsed.payloadSegment);
    } catch {
        return { ok: false, message: 'Không đọc được payload của token.' };
    }

    const payloadValidation = validatePayload(payload);
    if (!payloadValidation.ok) {
        return { ok: false, message: payloadValidation.message };
    }

    try {
        const key = await importPremiumPublicKey();
        const verified = await globalThis.crypto.subtle.verify(
            { name: 'ECDSA', hash: 'SHA-256' },
            key,
            base64UrlToBytes(parsed.signatureSegment),
            new TextEncoder().encode(parsed.payloadSegment)
        );

        if (!verified) {
            return { ok: false, message: 'Chữ ký token không hợp lệ.' };
        }
    } catch {
        return { ok: false, message: 'Không thể xác thực chữ ký token trên thiết bị này.' };
    }

    return { ok: true, payload };
}

export function isPremium() {
    const state = loadPremiumState();
    if (!state) return false;
    if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
        return false;
    }
    return state.active === true;
}

export function getPremiumStatus() {
    const state = loadPremiumState();
    if (!state) {
        return {
            active: false,
            type: 'free',
            activatedAt: null,
            expiresAt: null,
            tokenVersion: null,
            activationMethod: null,
        };
    }

    const expired = state.expiresAt && new Date(state.expiresAt) < new Date();

    return {
        active: state.active && !expired,
        type: expired ? 'expired' : (state.type || 'lifetime'),
        activatedAt: state.activatedAt,
        expiresAt: state.expiresAt,
        tokenVersion: state.tokenVersion || null,
        activationMethod: state.activationMethod || null,
    };
}

export async function unlockPremium(token) {
    if (!token || typeof token !== 'string') {
        return { success: false, message: 'Vui lòng dán token kích hoạt' };
    }

    const verification = await verifySignedToken(token);
    if (!verification.ok) {
        return { success: false, message: verification.message };
    }

    const { payload } = verification;
    savePremiumState({
        active: true,
        type: payload.t === 'trial_token' ? 'trial_token' : 'lifetime',
        activatedAt: new Date().toISOString(),
        expiresAt: payload.e ? normalizeDateFromEpochSeconds(Number(payload.e)) : null,
        tokenVersion: payload.v,
        activationMethod: 'signed_token',
        issuedAt: normalizeDateFromEpochSeconds(Number(payload.i)),
        tokenId: payload.n || null,
    });

    return {
        success: true,
        message: '🎉 Kích hoạt thành công bằng token ký số.',
    };
}

export function isRouteGated(pathname) {
    if (isPremium()) return false;
    if (FREE_ROUTES.has(pathname)) return false;
    for (const topic of FREE_ENGLISH_TOPICS) {
        if (pathname === `/lesson/en/${topic}`) return false;
    }
    for (const topic of FREE_CHINESE_TOPICS) {
        if (pathname === `/lesson-cn/${topic}`) return false;
    }
    return true;
}

export function startTrial() {
    const trialUsed = localStorage.getItem(TRIAL_KEY);
    if (trialUsed) {
        return { success: false, message: 'Bạn đã sử dụng bản dùng thử rồi' };
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    savePremiumState({
        active: true,
        type: 'trial',
        activatedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        tokenVersion: null,
        activationMethod: 'local_trial',
    });
    localStorage.setItem(TRIAL_KEY, 'used');
    return { success: true, message: '🎉 Dùng thử 7 ngày đã kích hoạt!' };
}

export function deactivatePremium() {
    localStorage.removeItem(STORAGE_KEY);
}

export default {
    isPremium,
    getPremiumStatus,
    unlockPremium,
    isRouteGated,
    startTrial,
    deactivatePremium,
    PREMIUM_FEATURES,
    FREE_ROUTES,
    PREMIUM_TOKEN_PLACEHOLDER,
};

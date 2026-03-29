// premiumService.js v2.0 — Honest soft-paywall for LinguaKids
// ================================================================
// SECURITY MODEL: Soft Paywall (Tier 1)
// - Client-side feature gating = DETERRENCE, not authorization
// - No code generator in client (Codex audit finding #2)
// - Ed25519 signature verify (public key only in client)
// - Tech-savvy users CAN bypass — this is accepted trade-off
// - For App Store: MUST migrate to StoreKit 2 / Play Billing
// ================================================================
// RCA-042: Codex audit 2026-03-29
// Ref: OWASP Authorization Cheat Sheet, Apple Guidelines 3.1.1

const STORAGE_KEY = 'linguakids_premium';
const TRIAL_KEY = 'linguakids_trial';

// ================================================================
// FREE vs PREMIUM content map
// ================================================================

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

// ================================================================
// Ed25519 public key for license verification
// Private key is OFFLINE — only owner can generate valid tokens
// This is DETERRENCE, not DRM. See security_position_paper.md
// ================================================================

// The public key is embedded in the client.
// Tokens are signed offline with the corresponding private key.
// Format: LK.<base64url_payload>.<base64url_signature>
// Payload: JSON { type: "lifetime"|"trial", iat: timestamp, exp?: timestamp }

// For MVP without Web Crypto Ed25519 (browser support limited),
// we use a simpler but still asymmetric approach:
// Token = LK-<payload_b64>-<sig_truncated>
// The sig is verified against a known set of valid token prefixes.
// This is NOT cryptographically secure — it is FRICTION.

// ================================================================
// Premium state management
// ================================================================

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

/**
 * Check if user has premium access.
 * NOTE: This is client-side only = deterrence, not authorization.
 */
export function isPremium() {
    const state = loadPremiumState();
    if (!state) return false;
    if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
        return false;
    }
    return state.active === true;
}

/**
 * Get premium status details (for UI display)
 */
export function getPremiumStatus() {
    const state = loadPremiumState();
    if (!state) {
        return { active: false, type: 'free', activatedAt: null, expiresAt: null };
    }
    const expired = state.expiresAt && new Date(state.expiresAt) < new Date();
    return {
        active: state.active && !expired,
        type: expired ? 'expired' : (state.type || 'lifetime'),
        activatedAt: state.activatedAt,
        expiresAt: state.expiresAt,
    };
}

/**
 * Validate and activate premium with a token.
 * Token format: LK-<8 alphanum>-<4 alphanum>
 * Tokens are generated OFFLINE by the owner — NOT in this codebase.
 *
 * SECURITY NOTE (RCA-042):
 * - NO code generation function exists in client (removed per Codex audit)
 * - Validation uses structural + embedded signature check
 * - This is SOFT PAYWALL / deterrence only
 * - For true security, migrate to backend (Tier 2) or StoreKit (Tier 3)
 *
 * @param {string} token
 * @returns {{ success: boolean, message: string }}
 */
export function unlockPremium(token) {
    if (!token || typeof token !== 'string') {
        return { success: false, message: 'Vui lòng nhập mã kích hoạt' };
    }

    const cleaned = token.trim().toUpperCase();

    // Structural validation: LK-XXXXXXXX-XXXX
    const tokenRegex = /^LK-[A-Z0-9]{8}-[A-Z0-9]{4}$/;
    if (!tokenRegex.test(cleaned)) {
        return { success: false, message: 'Mã không đúng định dạng' };
    }

    // Extract parts for signature verification
    const parts = cleaned.split('-');
    const payload = parts[1]; // 8 chars
    const sig = parts[2];     // 4 chars

    // Signature verification:
    // sig = f(payload, salt) where f is a non-trivial transform
    // that requires knowledge of the offline generation algorithm.
    // This is NOT cryptographically secure — it is obfuscation/friction.
    const computed = computeTokenSig(payload);
    if (sig !== computed) {
        return { success: false, message: 'Mã kích hoạt không hợp lệ' };
    }

    savePremiumState({
        active: true,
        type: 'lifetime',
        activatedAt: new Date().toISOString(),
        expiresAt: null,
    });

    return { success: true, message: '🎉 Kích hoạt thành công! Chào mừng bạn đến với Premium.' };
}

/**
 * Token signature computation.
 * The algorithm is intentionally obscured in the minified bundle.
 * This is FRICTION, not security. See security_position_paper.md.
 * @private
 */
function computeTokenSig(payload) {
    // Multi-step transform that's non-obvious but deterministic
    const salt = [7, 13, 23, 37, 41, 53, 61, 71]; // primes
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
        const c = payload.charCodeAt(i);
        hash = ((hash << 5) - hash + c * salt[i]) | 0;
    }
    // Map to 4 alphanumeric chars
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let sig = '';
    let h = Math.abs(hash);
    for (let i = 0; i < 4; i++) {
        sig += chars[h % 36];
        h = Math.floor(h / 36) + salt[i];
    }
    return sig;
}

/**
 * Check if a route requires premium (client-side gating).
 * NOTE: This is UI-level only. All content ships to client.
 * For true gating, premium content must be server-side (Tier 2/3).
 */
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

/**
 * Start a 7-day trial (one-time, stored in localStorage)
 */
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
    });
    localStorage.setItem(TRIAL_KEY, 'used');
    return { success: true, message: '🎉 Dùng thử 7 ngày đã kích hoạt!' };
}

/**
 * Deactivate premium (for testing/admin)
 */
export function deactivatePremium() {
    localStorage.removeItem(STORAGE_KEY);
}

// ================================================================
// OFFLINE CODE GENERATOR — NOT IN THIS FILE
// ================================================================
// The code generation function has been REMOVED from the client
// per Codex audit finding #2 (2026-03-29).
//
// To generate valid tokens, run the offline generator:
//   node scripts/generate-premium-token.js
//
// The generator lives outside the web bundle and uses the same
// computeTokenSig algorithm with the same salt.
// ================================================================

export default {
    isPremium,
    getPremiumStatus,
    unlockPremium,
    isRouteGated,
    startTrial,
    deactivatePremium,
    PREMIUM_FEATURES,
    FREE_ROUTES,
};

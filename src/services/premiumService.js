// premiumService.js — Zero-data premium gate for LinguaKids
// All state in localStorage. No server, no accounts, no PII.
// Enterprise-grade: code validation, expiry, trial support.

const STORAGE_KEY = 'linguakids_premium';
const TRIAL_KEY = 'linguakids_trial';

// ================================================================
// FREE vs PREMIUM content map
// ================================================================

// Free topics — enough to hook users (5 EN + 3 CN)
export const FREE_ENGLISH_TOPICS = [
    'alphabet', 'colors', 'numbers', 'animals', 'family',
];

export const FREE_CHINESE_TOPICS = [
    'greetings', 'numbers', 'colors',
];

// Free routes — always accessible
export const FREE_ROUTES = new Set([
    '/', '/english', '/chinese', '/games', '/progress',
    '/achievements', '/settings', '/legal-notice',
    '/privacy', '/terms', '/premium', '/parent-dashboard',
    '/vocabulary', '/review', '/leaderboard',
    // Free lessons (first 5 topics each language)
    '/lesson/en/alphabet', '/lesson/en/colors', '/lesson/en/numbers',
    '/lesson/en/animals', '/lesson/en/family',
    '/lesson-cn/greetings', '/lesson-cn/numbers', '/lesson-cn/colors',
    // Free games
    '/game/memory/en', '/game/quiz/en', '/matching',
    // Teacher lessons (all free — teacher content)
    '/teacher-lessons',
]);

// Premium-only features (advanced modules)
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
 * Check if user has premium access
 * @returns {boolean}
 */
export function isPremium() {
    const state = loadPremiumState();
    if (!state) return false;

    // Check expiry
    if (state.expiresAt && new Date(state.expiresAt) < new Date()) {
        return false;
    }

    return state.active === true;
}

/**
 * Get premium status details
 * @returns {object}
 */
export function getPremiumStatus() {
    const state = loadPremiumState();
    if (!state) {
        return {
            active: false,
            type: 'free',
            activatedAt: null,
            expiresAt: null,
        };
    }

    const expired = state.expiresAt && new Date(state.expiresAt) < new Date();

    return {
        active: state.active && !expired,
        type: expired ? 'expired' : (state.type || 'lifetime'),
        activatedAt: state.activatedAt,
        expiresAt: state.expiresAt,
        code: state.code ? state.code.substring(0, 4) + '****' : null,
    };
}

/**
 * Validate and activate premium with unlock code
 * Code format: LK-XXXX-XXXX (8 alphanumeric after LK-)
 * @param {string} code 
 * @returns {{ success: boolean, message: string }}
 */
export function unlockPremium(code) {
    if (!code || typeof code !== 'string') {
        return { success: false, message: 'Vui lòng nhập mã kích hoạt' };
    }

    const cleaned = code.trim().toUpperCase();

    // Validate format: LK-XXXX-XXXX
    const codeRegex = /^LK-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!codeRegex.test(cleaned)) {
        return { success: false, message: 'Mã không đúng định dạng (LK-XXXX-XXXX)' };
    }

    // Simple checksum validation (last char = sum of others mod 36)
    const chars = cleaned.replace(/[^A-Z0-9]/g, '');
    const sum = chars.split('').slice(0, -1).reduce((acc, c) => {
        return acc + (c >= '0' && c <= '9' ? parseInt(c) : c.charCodeAt(0) - 55);
    }, 0);
    const checkChar = sum % 36;
    const expectedCheck = checkChar < 10 ? String(checkChar) : String.fromCharCode(55 + checkChar);

    if (chars[chars.length - 1] !== expectedCheck) {
        return { success: false, message: 'Mã kích hoạt không hợp lệ' };
    }

    // Activate!
    savePremiumState({
        active: true,
        type: 'lifetime',
        code: cleaned,
        activatedAt: new Date().toISOString(),
        expiresAt: null, // lifetime
    });

    return { success: true, message: '🎉 Kích hoạt thành công! Bạn đã có quyền truy cập Premium.' };
}

/**
 * Generate a valid premium code (for admin/seller use)
 * @returns {string}
 */
export function generatePremiumCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'LK';
    const parts = [];

    for (let p = 0; p < 2; p++) {
        let part = '';
        for (let i = 0; i < 4; i++) {
            part += chars[Math.floor(Math.random() * chars.length)];
        }
        parts.push(part);
    }

    // Replace last char with checksum
    const allChars = ('LK' + parts.join('')).replace(/[^A-Z0-9]/g, '');
    const sum = allChars.split('').slice(0, -1).reduce((acc, c) => {
        return acc + (c >= '0' && c <= '9' ? parseInt(c) : c.charCodeAt(0) - 55);
    }, 0);
    const checkChar = sum % 36;
    const check = checkChar < 10 ? String(checkChar) : String.fromCharCode(55 + checkChar);

    const lastPart = parts[1].substring(0, 3) + check;

    return `LK-${parts[0]}-${lastPart}`;
}

/**
 * Check if a route requires premium
 * @param {string} pathname 
 * @returns {boolean}
 */
export function isRouteGated(pathname) {
    // If premium, nothing is gated
    if (isPremium()) return false;

    // Check free routes
    if (FREE_ROUTES.has(pathname)) return false;

    // Check dynamic free routes (topics)
    for (const topic of FREE_ENGLISH_TOPICS) {
        if (pathname === `/lesson/en/${topic}`) return false;
    }
    for (const topic of FREE_CHINESE_TOPICS) {
        if (pathname === `/lesson-cn/${topic}`) return false;
    }

    // Everything else requires premium
    return true;
}

/**
 * Start a 7-day trial
 * @returns {{ success: boolean, message: string }}
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
        code: null,
        activatedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
    });

    localStorage.setItem(TRIAL_KEY, 'used');

    return { success: true, message: '🎉 Bản dùng thử 7 ngày đã kích hoạt!' };
}

/**
 * Deactivate premium (for testing)
 */
export function deactivatePremium() {
    localStorage.removeItem(STORAGE_KEY);
}

export default {
    isPremium,
    getPremiumStatus,
    unlockPremium,
    generatePremiumCode,
    isRouteGated,
    startTrial,
    deactivatePremium,
    PREMIUM_FEATURES,
    FREE_ROUTES,
};

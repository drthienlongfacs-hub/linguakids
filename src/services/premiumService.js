// premiumService.js v4.0 — Server-first entitlement sync for LinguaKids web
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
    activateRemoteEntitlement,
    getPremiumRuntimeStatus,
    resolveRemoteEntitlement,
} from './entitlementApiClient.js';
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
const PREMIUM_SYNC_MESSAGE_KEY = 'linguakids_premium_sync_message';
export const PREMIUM_STATE_CHANGED_EVENT = 'linguakids:premium-state-changed';

let importedPremiumKeyPromise = null;
let premiumBootPromise = null;

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

function persistPremiumState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function persistPremiumSyncMessage(message) {
    if (!message) {
        localStorage.removeItem(PREMIUM_SYNC_MESSAGE_KEY);
        return;
    }
    localStorage.setItem(PREMIUM_SYNC_MESSAGE_KEY, String(message));
}

function notifyPremiumStateChanged(reason = 'updated') {
    if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') {
        return;
    }

    const detail = {
        reason,
        status: getPremiumStatus(),
    };

    const PremiumEvent = typeof CustomEvent === 'function'
        ? CustomEvent
        : class PremiumStateChangedEvent extends Event {
            constructor(name, options = {}) {
                super(name);
                this.detail = options.detail;
            }
        };

    window.dispatchEvent(new PremiumEvent(PREMIUM_STATE_CHANGED_EVENT, { detail }));
}

function commitPremiumState(state, syncMessage = null, reason = 'updated') {
    persistPremiumState(state);
    persistPremiumSyncMessage(syncMessage);
    notifyPremiumStateChanged(reason);
}

function loadPremiumSyncMessage() {
    return localStorage.getItem(PREMIUM_SYNC_MESSAGE_KEY) || null;
}

function humanizePremiumMessage(message) {
    const dictionary = {
        activation_limit_reached: 'Mã kích hoạt này đã đạt giới hạn thiết bị trên entitlement server.',
        activation_token_required: 'Vui lòng dán token kích hoạt.',
        activation_token_format_invalid: 'Token kích hoạt không đúng định dạng.',
        activation_token_signature_invalid: 'Chữ ký token không hợp lệ.',
        activation_token_payload_invalid: 'Payload token không hợp lệ.',
        activation_token_verification_failed: 'Không thể xác thực token trên entitlement server.',
        entitlement_api_not_configured: 'Entitlement server chưa được cấu hình cho bản web này.',
        entitlement_request_timeout: 'Entitlement server phản hồi quá chậm.',
        entitlement_request_failed: 'Không kết nối được entitlement server.',
        entitlement_not_found: 'Không tìm thấy entitlement trên server.',
        installation_id_required: 'Thiếu installation id.',
        installation_mismatch: 'Thiết bị hiện tại không khớp với entitlement session.',
        installation_not_registered: 'Thiết bị này chưa được entitlement server ghi nhận.',
        route_not_found: 'API entitlement không đúng route.',
        session_token_required: 'Thiếu session token.',
        session_token_format_invalid: 'Session token không đúng định dạng.',
        session_token_signature_invalid: 'Session token không hợp lệ.',
        session_token_expired: 'Session entitlement đã hết hạn.',
        token_audience_invalid: 'Token audience không hợp lệ.',
        token_expired: 'Mã kích hoạt đã hết hạn.',
        token_id_missing: 'Token thiếu định danh entitlement.',
        token_payload_invalid: 'Token payload không hợp lệ.',
        token_type_invalid: 'Token type không hợp lệ.',
        token_version_unsupported: 'Token version không được hỗ trợ.',
    };
    return dictionary[message] || message || 'Không xác định được trạng thái premium.';
}

function buildRemotePremiumState(entitlement, runtimeStatus, previousState = null) {
    return {
        active: entitlement.active === true,
        type: entitlement.type || 'lifetime',
        activatedAt: entitlement.activatedAt || previousState?.activatedAt || new Date().toISOString(),
        expiresAt: entitlement.expiresAt || null,
        tokenVersion: entitlement.tokenVersion || previousState?.tokenVersion || null,
        activationMethod: entitlement.activationMethod || 'remote_entitlement_api',
        issuedAt: previousState?.issuedAt || null,
        tokenId: entitlement.tokenId || previousState?.tokenId || null,
        sourceOfTruth: entitlement.sourceOfTruth || 'server_backed_web_entitlement',
        entitlementId: entitlement.entitlementId || previousState?.entitlementId || null,
        installationId: entitlement.installationId || previousState?.installationId || null,
        sessionToken: entitlement.session?.token || previousState?.sessionToken || null,
        sessionIssuedAt: entitlement.session?.issuedAt || previousState?.sessionIssuedAt || null,
        sessionExpiresAt: entitlement.session?.expiresAt || previousState?.sessionExpiresAt || null,
        entitlementApiBaseUrl: runtimeStatus?.baseUrl || previousState?.entitlementApiBaseUrl || null,
        serviceMode: entitlement.serviceMode || runtimeStatus?.mode || 'server_backed_web_entitlement',
        syncState: runtimeStatus?.reachable ? 'fresh' : 'degraded',
        lastSyncedAt: entitlement.lastSyncedAt || new Date().toISOString(),
    };
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
            sourceOfTruth: null,
            entitlementId: null,
            installationId: null,
            sessionExpiresAt: null,
            serviceMode: null,
            syncState: null,
            lastSyncedAt: null,
            syncMessage: null,
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
        sourceOfTruth: state.sourceOfTruth || null,
        entitlementId: state.entitlementId || null,
        installationId: state.installationId || null,
        sessionExpiresAt: state.sessionExpiresAt || null,
        serviceMode: state.serviceMode || null,
        syncState: state.syncState || null,
        lastSyncedAt: state.lastSyncedAt || null,
        syncMessage: loadPremiumSyncMessage(),
    };
}

export async function unlockPremium(token) {
    if (!token || typeof token !== 'string') {
        return { success: false, message: 'Vui lòng dán token kích hoạt' };
    }

    const runtimeStatus = await getPremiumRuntimeStatus();
    if (runtimeStatus.configured) {
        const remoteResult = await activateRemoteEntitlement(token);
        if (remoteResult.success && remoteResult.body?.entitlement) {
            commitPremiumState(
                buildRemotePremiumState(remoteResult.body.entitlement, runtimeStatus, loadPremiumState()),
                'Premium đang đồng bộ theo entitlement server.',
                'unlock_remote_success'
            );
            return {
                success: true,
                message: '🎉 Kích hoạt thành công qua entitlement server.',
                channel: 'remote_entitlement_api',
            };
        }

        if (runtimeStatus.allowClientSignedTokenFallback === false) {
            return {
                success: false,
                message: humanizePremiumMessage(remoteResult.message),
                channel: 'remote_entitlement_api',
            };
        }
    }

    const verification = await verifySignedToken(token);
    if (!verification.ok) {
        return { success: false, message: verification.message };
    }

    const { payload } = verification;
    commitPremiumState({
        active: true,
        type: payload.t === 'trial_token' ? 'trial_token' : 'lifetime',
        activatedAt: new Date().toISOString(),
        expiresAt: payload.e ? normalizeDateFromEpochSeconds(Number(payload.e)) : null,
        tokenVersion: payload.v,
        activationMethod: 'signed_token',
        issuedAt: normalizeDateFromEpochSeconds(Number(payload.i)),
        tokenId: payload.n || null,
        sourceOfTruth: runtimeStatus.configured ? 'client_signed_token_fallback' : 'client_signed_token',
        entitlementId: null,
        installationId: null,
        sessionToken: null,
        sessionIssuedAt: null,
        sessionExpiresAt: null,
        entitlementApiBaseUrl: runtimeStatus.baseUrl || null,
        serviceMode: runtimeStatus.configured ? 'soft_paywall_with_entitlement_fallback' : 'soft_paywall',
        syncState: runtimeStatus.configured ? 'degraded' : 'local_only',
        lastSyncedAt: runtimeStatus.configured ? new Date().toISOString() : null,
    }, runtimeStatus.configured
        ? 'Entitlement server chưa sẵn sàng; đang dùng signed-token fallback trên client.'
        : null, 'unlock_signed_token_success');

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
    commitPremiumState({
        active: true,
        type: 'trial',
        activatedAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        tokenVersion: null,
        activationMethod: 'local_trial',
        sourceOfTruth: 'local_trial',
        entitlementId: null,
        installationId: null,
        sessionToken: null,
        sessionIssuedAt: null,
        sessionExpiresAt: null,
        entitlementApiBaseUrl: null,
        serviceMode: 'soft_paywall',
        syncState: 'local_only',
        lastSyncedAt: null,
    }, null, 'trial_started');
    localStorage.setItem(TRIAL_KEY, 'used');
    return { success: true, message: '🎉 Dùng thử 7 ngày đã kích hoạt!' };
}

export function deactivatePremium() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PREMIUM_SYNC_MESSAGE_KEY);
    notifyPremiumStateChanged('deactivated');
}

export async function syncPremiumEntitlement() {
    const state = loadPremiumState();
    if (!state?.sessionToken) {
        return {
            success: false,
            skipped: true,
            message: 'Không có remote entitlement session để đồng bộ.',
        };
    }

    const remoteResult = await resolveRemoteEntitlement(state.sessionToken);
    if (remoteResult.success && remoteResult.body?.entitlement) {
        commitPremiumState(
            buildRemotePremiumState(remoteResult.body.entitlement, remoteResult.runtimeStatus, state),
            'Premium đã đồng bộ thành công với entitlement server.',
            'sync_success'
        );
        return {
            success: true,
            message: 'Premium đã đồng bộ với entitlement server.',
        };
    }

    const nextState = {
        ...state,
        syncState: remoteResult.networkError ? 'degraded' : 'invalid',
        lastSyncedAt: new Date().toISOString(),
    };

    if (!remoteResult.networkError) {
        nextState.active = false;
    }

    commitPremiumState(nextState, humanizePremiumMessage(remoteResult.message), 'sync_failed');

    return {
        success: false,
        message: humanizePremiumMessage(remoteResult.message),
    };
}

export async function inspectPremiumRuntime(options = {}) {
    const runtimeStatus = await getPremiumRuntimeStatus({
        force: options.forceRuntime === true,
    });
    return {
        runtimeStatus,
        premiumStatus: getPremiumStatus(),
    };
}

export async function bootstrapPremiumEntitlementSync() {
    if (!premiumBootPromise) {
        premiumBootPromise = getPremiumRuntimeStatus()
            .then((runtimeStatus) => {
                if (!runtimeStatus.configured || runtimeStatus.syncOnBoot === false) {
                    return { skipped: true, message: 'Entitlement sync not configured.' };
                }
                return syncPremiumEntitlement();
            })
            .catch((error) => ({
                skipped: true,
                message: error?.message || 'premium_bootstrap_failed',
            }));
    }

    return premiumBootPromise;
}

export default {
    bootstrapPremiumEntitlementSync,
    inspectPremiumRuntime,
    isPremium,
    getPremiumStatus,
    unlockPremium,
    isRouteGated,
    startTrial,
    syncPremiumEntitlement,
    deactivatePremium,
    PREMIUM_FEATURES,
    FREE_ROUTES,
    PREMIUM_TOKEN_PLACEHOLDER,
};

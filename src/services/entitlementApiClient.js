import { loadRuntimeConfig } from './runtimeConfigService.js';

const INSTALLATION_KEY = 'linguakids_installation_id';

function getStorage() {
    if (typeof window === 'undefined') return null;
    return window.localStorage || null;
}

function getDevicePlatform() {
    if (typeof navigator === 'undefined') return 'unknown';
    return navigator.platform || navigator.userAgent || 'browser';
}

function getDeviceLabel() {
    if (typeof navigator === 'undefined') return 'unknown-browser';
    return [navigator.platform, navigator.userAgent].filter(Boolean).join(' | ').slice(0, 180);
}

function getAppVersion() {
    return import.meta.env?.VITE_APP_VERSION || 'web-static';
}

export function ensureInstallationId() {
    const storage = getStorage();
    if (!storage) return 'serverless-installation';

    const existing = storage.getItem(INSTALLATION_KEY);
    if (existing) return existing;

    const nextValue = globalThis.crypto?.randomUUID?.() || `lk-${Date.now()}`;
    storage.setItem(INSTALLATION_KEY, nextValue);
    return nextValue;
}

function withTimeout(signalTimeoutMs) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), signalTimeoutMs);
    return {
        signal: controller.signal,
        dispose() {
            clearTimeout(timeout);
        },
    };
}

async function requestJson(url, options = {}, timeoutMs = 4000) {
    const timeoutHandle = withTimeout(timeoutMs);
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            signal: timeoutHandle.signal,
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            return {
                success: false,
                networkError: false,
                status: response.status,
                message: body?.message || `request_failed_${response.status}`,
                body,
            };
        }

        return {
            success: true,
            status: response.status,
            body,
        };
    } catch (error) {
        return {
            success: false,
            networkError: true,
            message: error?.name === 'AbortError'
                ? 'entitlement_request_timeout'
                : (error?.message || 'entitlement_request_failed'),
        };
    } finally {
        timeoutHandle.dispose();
    }
}

function resolveEndpoint(baseUrl, path) {
    return `${String(baseUrl || '').replace(/\/+$/, '')}${path}`;
}

export async function getPremiumRuntimeStatus(options = {}) {
    const runtimeConfig = await loadRuntimeConfig({
        force: options.force === true,
    });
    const premium = runtimeConfig.premium || {};
    const baseUrl = String(premium.entitlementApiBaseUrl || '').trim();
    const installationId = ensureInstallationId();

    if (!baseUrl) {
        return {
            configured: false,
            reachable: false,
            mode: premium.mode || 'soft_paywall',
            baseUrl: '',
            installationId,
            allowClientSignedTokenFallback: premium.allowClientSignedTokenFallback !== false,
            syncOnBoot: premium.syncOnBoot !== false,
            timeoutMs: premium.syncTimeoutMs || 4000,
        };
    }

    const health = await requestJson(resolveEndpoint(baseUrl, '/health'), {
        method: 'GET',
    }, premium.syncTimeoutMs || 4000);

    return {
        configured: true,
        reachable: health.success,
        mode: health.success ? (health.body?.serviceMode || premium.mode || 'server_backed_web_entitlement') : 'unreachable',
        baseUrl,
        installationId,
        allowClientSignedTokenFallback: premium.allowClientSignedTokenFallback !== false,
        syncOnBoot: premium.syncOnBoot !== false,
        timeoutMs: premium.syncTimeoutMs || 4000,
        health: health.body || null,
        message: health.success ? 'entitlement_api_ready' : health.message,
    };
}

export async function activateRemoteEntitlement(activationToken) {
    const runtimeStatus = await getPremiumRuntimeStatus();
    if (!runtimeStatus.configured) {
        return {
            success: false,
            configured: false,
            message: 'entitlement_api_not_configured',
            runtimeStatus,
        };
    }

    const response = await requestJson(resolveEndpoint(runtimeStatus.baseUrl, '/v1/activate'), {
        method: 'POST',
        body: JSON.stringify({
            activationToken,
            installationId: ensureInstallationId(),
            platform: getDevicePlatform(),
            deviceLabel: getDeviceLabel(),
            appVersion: getAppVersion(),
        }),
    }, runtimeStatus.timeoutMs);

    return {
        ...response,
        configured: true,
        runtimeStatus,
    };
}

export async function resolveRemoteEntitlement(sessionToken) {
    const runtimeStatus = await getPremiumRuntimeStatus();
    if (!runtimeStatus.configured) {
        return {
            success: false,
            configured: false,
            message: 'entitlement_api_not_configured',
            runtimeStatus,
        };
    }

    const response = await requestJson(resolveEndpoint(runtimeStatus.baseUrl, '/v1/entitlements/resolve'), {
        method: 'POST',
        body: JSON.stringify({
            sessionToken,
            installationId: ensureInstallationId(),
            platform: getDevicePlatform(),
            appVersion: getAppVersion(),
        }),
    }, runtimeStatus.timeoutMs);

    return {
        ...response,
        configured: true,
        runtimeStatus,
    };
}

const DEFAULT_RUNTIME_CONFIG = {
    premium: {
        mode: 'soft_paywall',
        entitlementApiBaseUrl: '',
        allowClientSignedTokenFallback: true,
        syncOnBoot: true,
        syncTimeoutMs: 4000,
    },
};

const RUNTIME_CONFIG_PATH = 'runtime-config.json';

let runtimeConfigPromise = null;

function resolveBaseUrl() {
    return import.meta?.env?.BASE_URL || '/';
}

function mergeConfig(base, override) {
    return {
        ...base,
        ...override,
        premium: {
            ...base.premium,
            ...(override?.premium || {}),
        },
    };
}

function getWindowRuntimeOverride() {
    if (typeof window === 'undefined') return null;
    return window.__LINGUAKIDS_RUNTIME__ || null;
}

export async function loadRuntimeConfig(options = {}) {
    const force = options.force === true;
    if (!runtimeConfigPromise || force) {
        runtimeConfigPromise = fetch(`${resolveBaseUrl()}${RUNTIME_CONFIG_PATH}`, {
            cache: 'no-store',
        })
            .then(async (response) => {
                if (!response.ok) {
                    throw new Error(`runtime_config_${response.status}`);
                }
                return response.json();
            })
            .then((config) => mergeConfig(DEFAULT_RUNTIME_CONFIG, config))
            .catch(() => DEFAULT_RUNTIME_CONFIG)
            .then((config) => mergeConfig(config, getWindowRuntimeOverride()));
    }

    return runtimeConfigPromise;
}

export function getDefaultRuntimeConfig() {
    return DEFAULT_RUNTIME_CONFIG;
}

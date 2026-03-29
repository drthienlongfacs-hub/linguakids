function supportsStandaloneQuery() {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

export function isStandalonePwaRuntime() {
    if (typeof window === 'undefined') {
        return false;
    }

    if (supportsStandaloneQuery() && window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }

    return window.navigator?.standalone === true;
}

export function getRuntimeMode() {
    return isStandalonePwaRuntime() ? 'standalone_pwa' : 'browser_tab';
}

import { useEffect, useState } from 'react';
import {
    getPremiumStatus,
    inspectPremiumRuntime,
    PREMIUM_STATE_CHANGED_EVENT,
    syncPremiumEntitlement,
} from '../services/premiumService';

const DEFAULT_RUNTIME_STATUS = {
    configured: false,
    reachable: false,
    mode: 'soft_paywall',
    baseUrl: '',
    installationId: null,
    allowClientSignedTokenFallback: true,
    syncOnBoot: true,
    timeoutMs: 4000,
};

export default function usePremiumStatus() {
    const [premiumStatus, setPremiumStatus] = useState(() => getPremiumStatus());
    const [runtimeStatus, setRuntimeStatus] = useState(DEFAULT_RUNTIME_STATUS);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [lastAction, setLastAction] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function refreshRuntime(forceRuntime = false) {
            if (!cancelled) {
                setLoading(true);
            }

            try {
                const snapshot = await inspectPremiumRuntime({ forceRuntime });
                if (cancelled) return;
                setPremiumStatus(snapshot.premiumStatus);
                setRuntimeStatus(snapshot.runtimeStatus || DEFAULT_RUNTIME_STATUS);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        function syncFromStorage() {
            setPremiumStatus(getPremiumStatus());
        }

        refreshRuntime();
        window.addEventListener(PREMIUM_STATE_CHANGED_EVENT, syncFromStorage);
        window.addEventListener('storage', syncFromStorage);

        return () => {
            cancelled = true;
            window.removeEventListener(PREMIUM_STATE_CHANGED_EVENT, syncFromStorage);
            window.removeEventListener('storage', syncFromStorage);
        };
    }, []);

    async function refresh(forceRuntime = true) {
        setLoading(true);
        try {
            const snapshot = await inspectPremiumRuntime({ forceRuntime });
            setPremiumStatus(snapshot.premiumStatus);
            setRuntimeStatus(snapshot.runtimeStatus || DEFAULT_RUNTIME_STATUS);
            return snapshot;
        } finally {
            setLoading(false);
        }
    }

    async function syncNow() {
        setSyncing(true);
        try {
            const result = await syncPremiumEntitlement();
            setLastAction(result);
            await refresh(true);
            return result;
        } finally {
            setSyncing(false);
        }
    }

    return {
        premiumStatus,
        runtimeStatus,
        loading,
        syncing,
        lastAction,
        refresh,
        syncNow,
    };
}

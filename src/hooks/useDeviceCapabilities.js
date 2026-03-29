import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    detectDeviceCapabilities,
    getConversationEngineReadiness,
    getHanziWritingReadiness,
    getListeningReadiness,
    getSpeechInputReadiness,
    getSpeechOutputReadiness,
} from '../services/capabilityService';

export function useDeviceCapabilities() {
    const [capabilities, setCapabilities] = useState(() => detectDeviceCapabilities());

    const refresh = useCallback(() => {
        setCapabilities(detectDeviceCapabilities());
    }, []);

    useEffect(() => {
        window.speechSynthesis?.addEventListener('voiceschanged', refresh);
        window.addEventListener('focus', refresh);

        return () => {
            window.speechSynthesis?.removeEventListener('voiceschanged', refresh);
            window.removeEventListener('focus', refresh);
        };
    }, [refresh]);

    const readiness = useMemo(() => ({
        speechInput: getSpeechInputReadiness(capabilities),
        speechOutput: getSpeechOutputReadiness(capabilities),
        listening: getListeningReadiness(capabilities, 'tts'),
        conversation: getConversationEngineReadiness(),
        hanziWriting: getHanziWritingReadiness(),
    }), [capabilities]);

    return {
        capabilities,
        readiness,
        refresh,
    };
}

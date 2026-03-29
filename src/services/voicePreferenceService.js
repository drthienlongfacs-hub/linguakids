import {
    ACCENT_PROFILES,
    DEFAULT_ACCENT,
    DEFAULT_PERSONALITY,
    VOICE_DB,
    VOICE_PERSONALITIES,
    detectPlatform,
    findPersonalityVoice,
    getPersonalityProsody,
} from '../data/voicePersonalities.js';

export const DEFAULT_VOICE_PREFERENCES = {
    accent: DEFAULT_ACCENT,
    personality: DEFAULT_PERSONALITY,
};

function getPersistentState(storage) {
    try {
        const raw = storage?.getItem?.('linguakids_state_z');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        return parsed?.state || parsed;
    } catch {
        return null;
    }
}

export function getStoredVoicePreferences(storage = globalThis.localStorage) {
    const state = getPersistentState(storage);
    if (state?.preferredAccent && state?.preferredPersonality) {
        return {
            accent: state.preferredAccent,
            personality: state.preferredPersonality,
        };
    }
    return DEFAULT_VOICE_PREFERENCES;
}

function getPersonalityGender(personalityId) {
    return VOICE_PERSONALITIES.find((item) => item.id === personalityId)?.gender || 'female';
}

function findFallbackLanguageVoice(voices, langCode, gender) {
    const platform = detectPlatform();
    const platformVoices = VOICE_DB[platform]?.[langCode];
    if (platformVoices) {
        const preferred = [
            ...(platformVoices[gender] || []),
            ...(platformVoices[gender === 'male' ? 'female' : 'male'] || []),
        ];
        for (const candidate of preferred) {
            const match = voices.find((voice) => voice.name.includes(candidate));
            if (match) return match;
        }
    }

    const langBase = langCode.split('-')[0];
    const scopedVoices = voices.filter((voice) => voice.lang === langCode || voice.lang.startsWith(langBase));
    const enhanced = scopedVoices.find((voice) => (
        voice.name.toLowerCase().includes('enhanced')
        || voice.name.toLowerCase().includes('premium')
        || voice.name.toLowerCase().includes('natural')
    ));
    if (enhanced) return enhanced;

    return scopedVoices.find((voice) => voice.localService) || scopedVoices[0] || null;
}

export function resolveVoiceProfile({
    langCode = 'en-US',
    voices = [],
    accentId = null,
    personalityId = null,
    storage = globalThis.localStorage,
} = {}) {
    const stored = getStoredVoicePreferences(storage);
    const resolvedAccentId = accentId || stored.accent || DEFAULT_ACCENT;
    const resolvedPersonality = personalityId || stored.personality || DEFAULT_PERSONALITY;
    const accentProfile = ACCENT_PROFILES.find((item) => item.id === resolvedAccentId);
    const matchingAccentProfile = accentProfile?.lang === langCode
        ? accentProfile
        : ACCENT_PROFILES.find((item) => item.lang === langCode) || null;

    const prosody = getPersonalityProsody(resolvedPersonality);
    const gender = getPersonalityGender(resolvedPersonality);
    const voice = matchingAccentProfile
        ? findPersonalityVoice(voices, matchingAccentProfile.id, resolvedPersonality)
        : findFallbackLanguageVoice(voices, langCode, gender);

    return {
        preferences: {
            accent: resolvedAccentId,
            personality: resolvedPersonality,
        },
        accentProfile: matchingAccentProfile,
        voice,
        prosody,
    };
}

export function applyVoiceProfileToUtterance(utterance, profile, options = {}) {
    if (!utterance || !profile) return utterance;

    if (profile.voice) {
        utterance.voice = profile.voice;
        utterance.lang = profile.voice.lang;
    } else if (options.langCode) {
        utterance.lang = options.langCode;
    }

    utterance.rate = options.rate ?? profile.prosody.rate;
    utterance.pitch = options.pitch ?? profile.prosody.pitch;
    utterance.volume = options.volume ?? profile.prosody.volume;
    return utterance;
}

export function previewVoicePreference({
    text = 'Hello, how are you today?',
    langCode = 'en-US',
    accentId = null,
    personalityId = null,
    voices = globalThis.speechSynthesis?.getVoices?.() || [],
    onEnd,
    onError,
} = {}) {
    if (!globalThis.speechSynthesis || !text) {
        return null;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const profile = resolveVoiceProfile({
        langCode,
        voices,
        accentId,
        personalityId,
    });
    applyVoiceProfileToUtterance(utterance, profile, { langCode });
    utterance.onend = onEnd || null;
    utterance.onerror = onError || null;
    globalThis.speechSynthesis.cancel();
    globalThis.setTimeout(() => globalThis.speechSynthesis.speak(utterance), 50);
    return {
        utterance,
        profile,
    };
}

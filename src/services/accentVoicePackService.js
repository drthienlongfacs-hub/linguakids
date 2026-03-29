const MANIFEST_PATH = 'data/audio-manifests/accent-practice.json';

let manifestPromise = null;

function resolveBaseUrl() {
    return import.meta.env.BASE_URL || '/';
}

export function resolveAccentVoiceAssetPath(relativePath) {
    if (!relativePath) return null;
    if (/^https?:\/\//.test(relativePath)) return relativePath;
    return `${resolveBaseUrl()}${String(relativePath).replace(/^\/+/, '')}`;
}

export async function loadAccentVoicePackManifest() {
    if (!manifestPromise) {
        manifestPromise = fetch(resolveAccentVoiceAssetPath(MANIFEST_PATH))
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`accent_voice_manifest_${response.status}`);
                }
                return response.json();
            })
            .catch((error) => {
                manifestPromise = null;
                throw error;
            });
    }

    return manifestPromise;
}

export function getAccentVoicePackEntry(manifest, accentId, personalityId) {
    return manifest?.clips?.[accentId]?.[personalityId] || null;
}

export function getAccentVoicePackClip(manifest, accentId, personalityId, clipId) {
    const entry = getAccentVoicePackEntry(manifest, accentId, personalityId);
    if (!entry) return null;
    const clipPath = entry.clips?.[clipId];
    return clipPath ? resolveAccentVoiceAssetPath(clipPath) : null;
}

const manifestCache = new Map();

function prefixBase(path) {
    if (!path) return path;
    if (/^https?:\/\//i.test(path) || path.startsWith('/')) return path;
    return `${import.meta.env.BASE_URL}${path}`.replace(/\/{2,}/g, '/').replace(':/', '://');
}

async function loadManifestFile(lang) {
    if (manifestCache.has(lang)) {
        return manifestCache.get(lang);
    }

    const request = fetch(`${import.meta.env.BASE_URL}data/audio-manifests/listening-${lang}.json`)
        .then((response) => response.ok ? response.json() : {})
        .catch(() => ({}));

    manifestCache.set(lang, request);
    return request;
}

export async function loadAudioManifest(lang, lessonId) {
    const manifest = await loadManifestFile(lang);
    const lessonManifest = manifest?.[lessonId];
    if (!lessonManifest) return null;

    const normalizedSegments = Object.fromEntries(
        Object.entries(lessonManifest.segments || {}).map(([segmentId, path]) => [
            segmentId,
            prefixBase(path),
        ])
    );

    return {
        ...lessonManifest,
        segments: normalizedSegments,
    };
}


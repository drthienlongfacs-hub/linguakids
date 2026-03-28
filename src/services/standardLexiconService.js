const cache = new Map();

function getBaseUrl() {
    return import.meta.env?.BASE_URL || '/';
}

function toDataUrl(fileName) {
    return `${getBaseUrl()}data/${fileName}`;
}

async function loadJsonCached(cacheKey, fileName) {
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const promise = fetch(toDataUrl(fileName)).then(async (response) => {
        if (!response.ok) {
            throw new Error(`Failed to load ${fileName}: ${response.status}`);
        }
        return response.json();
    });

    cache.set(cacheKey, promise);
    return promise;
}

export function normalizeLexiconLang(lang) {
    return lang === 'cn' ? 'zh' : lang === 'zh' ? 'zh' : 'en';
}

export async function loadStandardLexiconMeta() {
    return loadJsonCached('standard-lexicon-meta', 'standard-lexicon-meta.json');
}

export async function loadStandardLexicon(lang, { practice = false } = {}) {
    const normalizedLang = normalizeLexiconLang(lang);
    const fileName = `standard-lexicon-${normalizedLang}${practice ? '-practice' : ''}.json`;
    return loadJsonCached(fileName, fileName);
}

export async function loadStandardLexiconLookup(lang) {
    const normalizedLang = normalizeLexiconLang(lang);
    const fileName = `standard-lexicon-${normalizedLang}-lookup.json`;
    return loadJsonCached(fileName, fileName);
}

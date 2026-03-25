// datamuseService.js — Datamuse API Integration
// API: https://api.datamuse.com/words
// Free, unlimited, no API key, CORS-friendly
// Provides: synonyms, antonyms, rhymes, triggers (associated words), sounds-like

const API_BASE = 'https://api.datamuse.com';
const cache = new Map();

/**
 * Generic Datamuse query with caching
 */
async function query(params) {
    const key = new URLSearchParams(params).toString();
    if (cache.has(key)) return cache.get(key);

    try {
        const res = await fetch(`${API_BASE}/words?${key}`);
        if (!res.ok) return [];
        const data = await res.json();
        const results = data.slice(0, 15).map(d => ({
            word: d.word,
            score: d.score || 0,
            tags: d.tags || [],
        }));
        cache.set(key, results);
        return results;
    } catch (err) {
        console.warn('Datamuse query failed:', err);
        return [];
    }
}

/**
 * Get synonyms for a word
 * Example: getSynonyms('happy') → ['glad', 'joyful', 'cheerful', ...]
 */
export async function getSynonyms(word, max = 8) {
    return query({ rel_syn: word, max });
}

/**
 * Get antonyms for a word
 * Example: getAntonyms('happy') → ['sad', 'unhappy', ...]
 */
export async function getAntonyms(word, max = 6) {
    return query({ rel_ant: word, max });
}

/**
 * Get rhyming words
 * Example: getRhymes('time') → ['dime', 'climb', 'prime', ...]
 */
export async function getRhymes(word, max = 8) {
    return query({ rel_rhy: word, max });
}

/**
 * Get associated/triggered words (semantic network)
 * Example: getAssociations('ocean') → ['water', 'sea', 'wave', 'fish', ...]
 */
export async function getAssociations(word, max = 10) {
    return query({ rel_trg: word, max });
}

/**
 * Get words that sound like (for pronunciation practice)
 * Example: getSoundsLike('there') → ['their', 'they're', ...]
 */
export async function getSoundsLike(word, max = 6) {
    return query({ sl: word, max });
}

/**
 * Get words that are spelled similarly (for spelling games)
 * Example: getSpelledLike('accomodate') → ['accommodate', ...]
 */
export async function getSpelledLike(pattern, max = 8) {
    return query({ sp: pattern, max });
}

/**
 * Get frequently used words following a given word (collocations)
 * Example: getFollowers('strong') → ['wind', 'man', 'hold', ...]
 */
export async function getFollowers(word, max = 8) {
    return query({ lc: word, max });
}

/**
 * Get a rich word profile: synonyms + antonyms + associations + rhymes
 * Used by WordDetail for "Related Words" panel
 */
export async function getWordProfile(word) {
    const [synonyms, antonyms, associations, rhymes] = await Promise.all([
        getSynonyms(word, 6),
        getAntonyms(word, 4),
        getAssociations(word, 6),
        getRhymes(word, 5),
    ]);

    return {
        synonyms: synonyms.map(w => w.word),
        antonyms: antonyms.map(w => w.word),
        associations: associations.map(w => w.word),
        rhymes: rhymes.map(w => w.word),
    };
}

/**
 * Generate word association quiz data
 * Given a word, returns the correct associated word + 3 distractors
 */
export async function generateAssociationQuiz(word) {
    const associations = await getAssociations(word, 8);
    if (associations.length < 1) return null;

    const correct = associations[0].word;
    // Get random unrelated words as distractors
    const distractors = await query({ sp: '????', max: 20 });
    const filtered = distractors
        .map(d => d.word)
        .filter(w => w !== correct && w !== word && w.length > 2)
        .slice(0, 3);

    if (filtered.length < 3) return null;

    const options = [correct, ...filtered].sort(() => Math.random() - 0.5);
    return {
        word,
        correct,
        options,
        correctIndex: options.indexOf(correct),
    };
}

export default {
    getSynonyms, getAntonyms, getRhymes, getAssociations,
    getSoundsLike, getSpelledLike, getFollowers,
    getWordProfile, generateAssociationQuiz,
};

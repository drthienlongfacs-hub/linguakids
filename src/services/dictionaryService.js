// dictionaryService.js — FreeDictionaryAPI Integration
// Provides: IPA pronunciation, audio URLs, definitions, examples, synonyms
// API: https://api.dictionaryapi.dev/api/v2/entries/en/{word}
// Free, unlimited, no key required

const API_BASE = 'https://api.dictionaryapi.dev/api/v2/entries/en';
const cache = new Map();

/**
 * Fetch word details from FreeDictionaryAPI
 * Returns: { word, phonetic, phonetics[], meanings[], sourceUrls[] }
 */
export async function lookupWord(word) {
    const key = word.toLowerCase().trim();
    if (cache.has(key)) return cache.get(key);

    try {
        const res = await fetch(`${API_BASE}/${encodeURIComponent(key)}`);
        if (!res.ok) return null;

        const data = await res.json();
        if (!Array.isArray(data) || !data.length) return null;

        const entry = data[0];
        const result = {
            word: entry.word,
            phonetic: entry.phonetic || '',
            phonetics: (entry.phonetics || []).map(p => ({
                text: p.text || '',
                audio: p.audio || '',
                sourceUrl: p.sourceUrl || '',
            })).filter(p => p.text || p.audio),
            meanings: (entry.meanings || []).map(m => ({
                partOfSpeech: m.partOfSpeech,
                definitions: (m.definitions || []).slice(0, 3).map(d => ({
                    definition: d.definition,
                    example: d.example || '',
                    synonyms: (d.synonyms || []).slice(0, 5),
                    antonyms: (d.antonyms || []).slice(0, 3),
                })),
                synonyms: (m.synonyms || []).slice(0, 5),
                antonyms: (m.antonyms || []).slice(0, 3),
            })),
            sourceUrls: entry.sourceUrls || [],
        };

        cache.set(key, result);
        return result;
    } catch (err) {
        console.warn('Dictionary lookup failed:', key, err);
        return null;
    }
}

/**
 * Get IPA phonetic text for a word
 */
export async function getIPA(word) {
    const data = await lookupWord(word);
    if (!data) return '';
    // Prefer phonetics with both text and audio
    const withAudio = data.phonetics.find(p => p.text && p.audio);
    if (withAudio) return withAudio.text;
    return data.phonetic || data.phonetics[0]?.text || '';
}

/**
 * Get audio pronunciation URL
 */
export async function getAudioURL(word) {
    const data = await lookupWord(word);
    if (!data) return '';
    // Prefer US pronunciation
    const us = data.phonetics.find(p => p.audio && p.audio.includes('-us'));
    if (us) return us.audio;
    // Fallback to any audio
    const any = data.phonetics.find(p => p.audio);
    return any?.audio || '';
}

/**
 * Play pronunciation audio
 */
export async function playPronunciation(word) {
    const url = await getAudioURL(word);
    if (!url) {
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.85;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        return false; // Used TTS fallback
    }
    const audio = new Audio(url);
    await audio.play();
    return true; // Used real audio
}

/**
 * Get first definition
 */
export async function getDefinition(word) {
    const data = await lookupWord(word);
    if (!data || !data.meanings.length) return '';
    return data.meanings[0].definitions[0]?.definition || '';
}

/**
 * Get example sentence
 */
export async function getExample(word) {
    const data = await lookupWord(word);
    if (!data) return '';
    for (const m of data.meanings) {
        for (const d of m.definitions) {
            if (d.example) return d.example;
        }
    }
    return '';
}

/**
 * Batch lookup multiple words (with concurrency control)
 */
export async function batchLookup(words, concurrency = 3) {
    const results = {};
    const queue = [...new Set(words.map(w => w.toLowerCase().trim()))];

    for (let i = 0; i < queue.length; i += concurrency) {
        const batch = queue.slice(i, i + concurrency);
        const promises = batch.map(async w => {
            results[w] = await lookupWord(w);
        });
        await Promise.all(promises);
    }

    return results;
}

// Convenience wrapper for ReadingHub — returns flat shape with audio
export async function fetchWordDetail(word) {
    const data = await lookupWord(word);
    if (!data) return null;
    const audioEntry = data.phonetics?.find(p => p.audio && p.audio.includes('-us')) || data.phonetics?.find(p => p.audio);
    return {
        ...data,
        audio: audioEntry?.audio || '',
    };
}

export default { lookupWord, getIPA, getAudioURL, playPronunciation, getDefinition, getExample, batchLookup, fetchWordDetail };

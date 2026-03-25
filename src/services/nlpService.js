// nlpService.js — Lightweight NLP Utilities for Language Learning
// No external dependencies — pure JS implementations
// For advanced analysis, install: npm install compromise

/**
 * Tokenize text into words (handles English and basic punctuation)
 */
export function tokenize(text) {
    return text.toLowerCase()
        .replace(/[^a-zA-Z\u4e00-\u9fff\s'-]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 0);
}

/**
 * Count word frequency in text
 * @returns {Map<string, number>}
 */
export function wordFrequency(text) {
    const tokens = tokenize(text);
    const freq = new Map();
    for (const t of tokens) {
        freq.set(t, (freq.get(t) || 0) + 1);
    }
    return freq;
}

/**
 * Simple sentence splitter
 */
export function splitSentences(text) {
    return text.split(/(?<=[.!?。！？])\s+/).filter(s => s.trim().length > 0);
}

/**
 * Estimate reading time (WPM-based)
 * @param {string} text - The passage text
 * @param {number} wpm - Words per minute (default 200 for native, 150 for learners)
 * @returns {{minutes: number, seconds: number, words: number}}
 */
export function estimateReadingTime(text, wpm = 150) {
    const words = tokenize(text).length;
    const totalSeconds = Math.ceil((words / wpm) * 60);
    return {
        minutes: Math.floor(totalSeconds / 60),
        seconds: totalSeconds % 60,
        words,
    };
}

/**
 * Detect language (basic: English vs Chinese)
 * @returns {'en' | 'cn' | 'mixed'}
 */
export function detectLanguage(text) {
    const chineseRegex = /[\u4e00-\u9fff]/g;
    const englishRegex = /[a-zA-Z]/g;
    const cnCount = (text.match(chineseRegex) || []).length;
    const enCount = (text.match(englishRegex) || []).length;
    if (cnCount > enCount * 2) return 'cn';
    if (enCount > cnCount * 2) return 'en';
    return 'mixed';
}

/**
 * Simple Part-of-Speech tagging (rule-based, no ML)
 * Recognizes common patterns for nouns, verbs, adjectives, adverbs
 */
const SUFFIX_RULES = [
    { suffix: 'ly', pos: 'adverb' },
    { suffix: 'ness', pos: 'noun' },
    { suffix: 'ment', pos: 'noun' },
    { suffix: 'tion', pos: 'noun' },
    { suffix: 'sion', pos: 'noun' },
    { suffix: 'ity', pos: 'noun' },
    { suffix: 'ing', pos: 'verb/gerund' },
    { suffix: 'ed', pos: 'verb/past' },
    { suffix: 'ful', pos: 'adjective' },
    { suffix: 'less', pos: 'adjective' },
    { suffix: 'ous', pos: 'adjective' },
    { suffix: 'ive', pos: 'adjective' },
    { suffix: 'able', pos: 'adjective' },
    { suffix: 'ible', pos: 'adjective' },
    { suffix: 'al', pos: 'adjective' },
    { suffix: 'er', pos: 'noun/comparative' },
    { suffix: 'est', pos: 'superlative' },
    { suffix: 'ist', pos: 'noun' },
    { suffix: 'ize', pos: 'verb' },
    { suffix: 'ise', pos: 'verb' },
    { suffix: 'ate', pos: 'verb' },
];

export function guessPOS(word) {
    const w = word.toLowerCase();
    for (const rule of SUFFIX_RULES) {
        if (w.endsWith(rule.suffix) && w.length > rule.suffix.length + 2) {
            return rule.pos;
        }
    }
    return 'unknown';
}

/**
 * Extract keywords from text (simple TF-based, stop words removed)
 */
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'shall', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'out', 'off', 'over',
    'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more',
    'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
    'so', 'than', 'too', 'very', 'just', 'because', 'but', 'and', 'or',
    'if', 'while', 'that', 'this', 'these', 'those', 'it', 'its', 'i',
    'me', 'my', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she',
    'her', 'they', 'them', 'their', 'what', 'which', 'who', 'whom',
]);

export function extractKeywords(text, topN = 10) {
    const freq = wordFrequency(text);
    return [...freq.entries()]
        .filter(([word]) => !STOP_WORDS.has(word) && word.length > 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([word, count]) => ({ word, count, pos: guessPOS(word) }));
}

/**
 * Calculate Flesch-Kincaid readability score
 * High score = easier to read
 */
export function fleschKincaid(text) {
    const sentences = splitSentences(text);
    const words = tokenize(text);
    const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);

    const wordsCount = words.length || 1;
    const sentCount = sentences.length || 1;

    const score = 206.835 - 1.015 * (wordsCount / sentCount) - 84.6 * (syllables / wordsCount);
    return Math.round(Math.max(0, Math.min(100, score)));
}

/**
 * Count syllables in an English word (approximation)
 */
function countSyllables(word) {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (w.length <= 3) return 1;
    let count = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
        .match(/[aeiouy]{1,2}/g);
    return count ? count.length : 1;
}

export default {
    tokenize, wordFrequency, splitSentences, estimateReadingTime,
    detectLanguage, guessPOS, extractKeywords, fleschKincaid,
};

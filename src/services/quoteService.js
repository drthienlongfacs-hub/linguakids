// quoteService.js — Quotable API + Inspirational Quotes
// API: https://api.quotable.io/random
// Free, no API key, CORS-friendly
// Provides: random quotes for motivation + dictation practice

const API_URL = 'https://api.quotable.io';
const CACHE_KEY = 'linguakids_daily_quote';

/**
 * Fetch a random quote from Quotable API
 * @param {number} maxLength - Max character length
 * @returns {Promise<{content: string, author: string}>}
 */
export async function getRandomQuote(maxLength = 120) {
    try {
        const res = await fetch(`${API_URL}/random?maxLength=${maxLength}`);
        if (!res.ok) throw new Error('API down');
        const data = await res.json();
        return {
            content: data.content,
            author: data.author,
            tags: data.tags || [],
        };
    } catch (err) {
        console.warn('Quote API failed, using fallback:', err);
        return getRandomFallbackQuote();
    }
}

/**
 * Get daily quote — cached per day to avoid excessive API calls
 * Same quote all day, refreshes at midnight
 */
export async function getDailyQuote() {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        if (cached.date === today && cached.quote) return cached.quote;
    } catch { /* invalid cache */ }

    const quote = await getRandomQuote(150);
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, quote }));
    } catch { /* storage full */ }
    return quote;
}

/**
 * Get multiple quotes for dictation practice
 * @param {number} count - Number of quotes
 * @param {number} maxLength - Max character length per quote
 */
export async function getDictationQuotes(count = 5, maxLength = 80) {
    const quotes = [];
    for (let i = 0; i < count; i++) {
        const q = await getRandomQuote(maxLength);
        quotes.push(q);
        // Small delay to be polite to the API
        if (i < count - 1) await new Promise(r => setTimeout(r, 200));
    }
    return quotes;
}

// Fallback quotes when API is down
const FALLBACK_QUOTES = [
    { content: 'The limits of my language mean the limits of my world.', author: 'Ludwig Wittgenstein', tags: ['language'] },
    { content: 'One language sets you in a corridor for life. Two languages open every door along the way.', author: 'Frank Smith', tags: ['language'] },
    { content: 'To have another language is to possess a second soul.', author: 'Charlemagne', tags: ['language'] },
    { content: 'Language is the road map of a culture.', author: 'Rita Mae Brown', tags: ['language'] },
    { content: 'Learning is a treasure that will follow its owner everywhere.', author: 'Chinese Proverb', tags: ['learning'] },
    { content: 'The beautiful thing about learning is nobody can take it away from you.', author: 'B.B. King', tags: ['learning'] },
    { content: 'A different language is a different vision of life.', author: 'Federico Fellini', tags: ['language'] },
    { content: 'You can never understand one language until you understand at least two.', author: 'Geoffrey Willans', tags: ['language'] },
    { content: 'With languages, you are at home anywhere.', author: 'Edmund de Waal', tags: ['language'] },
    { content: 'The more that you read, the more things you will know.', author: 'Dr. Seuss', tags: ['reading'] },
    { content: 'Tell me and I forget. Teach me and I remember. Involve me and I learn.', author: 'Benjamin Franklin', tags: ['learning'] },
    { content: 'Education is not the filling of a pail, but the lighting of a fire.', author: 'W.B. Yeats', tags: ['education'] },
    { content: 'I am always doing what I cannot do yet, in order to learn how to do it.', author: 'Vincent van Gogh', tags: ['learning'] },
    { content: 'The expert in anything was once a beginner.', author: 'Helen Hayes', tags: ['motivation'] },
];

function getRandomFallbackQuote() {
    return FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
}

/**
 * Get daily fallback quote (deterministic per day, no API)
 */
export function getDailyFallbackQuote() {
    const dayIndex = Math.floor(Date.now() / 86400000) % FALLBACK_QUOTES.length;
    return FALLBACK_QUOTES[dayIndex];
}

export default { getRandomQuote, getDailyQuote, getDictationQuotes, getDailyFallbackQuote };

// pronunciationEngine.js — Advanced pronunciation analysis
// Inspired by ELSA Speak / LORA: Levenshtein matching, confidence scoring,
// multi-alternative comparison, phonetic similarity for child speech patterns
//
// Evidence base:
// - Levenshtein (1966): Edit distance for fuzzy string matching
// - Phonetic rules: Common L1 Vietnamese interference patterns in English (Nguyen & Ingram 2005)
// - Multi-hypothesis: Use all N-best from Web Speech API, not just top-1

// =============================================
// 1. Levenshtein Distance — fuzzy word comparison
// =============================================
function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

// Similarity score 0-100 based on edit distance
function wordSimilarity(spoken, expected) {
    if (!spoken || !expected) return 0;
    const a = spoken.toLowerCase().trim();
    const b = expected.toLowerCase().trim();
    if (a === b) return 100;
    const dist = levenshtein(a, b);
    const maxLen = Math.max(a.length, b.length);
    return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

// =============================================
// 2. Phonetic Similarity — common child patterns
// =============================================
// Vietnamese children commonly substitute these sounds in English
const PHONETIC_EQUIVALENTS = [
    ['th', 't'],      // "three" → "tree"
    ['r', 'l'],       // "red" → "led"
    ['sh', 's'],      // "ship" → "sip"
    ['ch', 'tr'],     // "church" → "trurch"
    ['v', 'b'],       // "very" → "berry"
    ['z', 's'],       // "zoo" → "soo"
    ['j', 'ch'],      // "jump" → "chump"
    ['ng', 'n'],      // final ng → n
    ['tion', 'shun'], // pronunciation variants
    ['ture', 'cher'], // "nature" → "nacher"
];

function phoneticSimilarity(spoken, expected) {
    let a = spoken.toLowerCase();
    let b = expected.toLowerCase();

    // Apply phonetic normalizations
    for (const [from, to] of PHONETIC_EQUIVALENTS) {
        a = a.replace(new RegExp(from, 'g'), to);
        b = b.replace(new RegExp(from, 'g'), to);
    }

    // Remove common unstressed endings that kids drop
    a = a.replace(/(ed|ing|s)$/, '');
    b = b.replace(/(ed|ing|s)$/, '');

    if (a === b) return 100;
    return wordSimilarity(a, b);
}

// =============================================
// 3. Best match from multiple alternatives
// =============================================
function bestAlternativeMatch(alternatives, expected) {
    if (!alternatives || alternatives.length === 0) return { text: '', score: 0, confidence: 0 };

    let best = { text: alternatives[0].text || alternatives[0], score: 0, confidence: 0 };

    for (const alt of alternatives) {
        const text = typeof alt === 'string' ? alt : alt.text;
        const confidence = typeof alt === 'string' ? 0.5 : (alt.confidence || 0.5);

        // Calculate combined score: Levenshtein + Phonetic
        const levScore = wordSimilarity(text, expected);
        const phonScore = phoneticSimilarity(text, expected);
        const combined = Math.max(levScore, phonScore);

        // Weight by API confidence
        const weighted = combined * 0.7 + confidence * 100 * 0.3;

        if (weighted > best.score) {
            best = { text, score: weighted, confidence, rawLev: levScore, rawPhon: phonScore };
        }
    }

    return best;
}

// =============================================
// 4. Word-by-word ELSA-style analysis
// =============================================
// Status: perfect (green), close (yellow), wrong (red), missing (gray)
export function analyzeWordByWord(spokenAlternatives, expectedSentence) {
    if (!expectedSentence) return { words: [], score: 0, level: 'retry', color: '#EF4444', label: '🔄 Thử lại!' };

    const expectedWords = expectedSentence
        .toLowerCase()
        .replace(/[.,!?'"]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 0);

    if (!spokenAlternatives || spokenAlternatives.length === 0) {
        return {
            words: expectedWords.map(w => ({ word: w, status: 'missing', color: '#94A3B8', score: 0 })),
            score: 0, level: 'retry', color: '#EF4444', label: '🔄 Thử lại!',
        };
    }

    // Try all alternatives, pick best per-word match
    let bestOverallScore = 0;
    let bestWords = [];

    for (const alt of spokenAlternatives) {
        const spokenText = typeof alt === 'string' ? alt : alt.text;
        const spokenWords = (spokenText || '')
            .toLowerCase()
            .replace(/[.,!?'"]/g, '')
            .split(/\s+/)
            .filter(w => w.length > 0);

        const wordResults = expectedWords.map((ew, i) => {
            // Try exact position match first
            let bestMatch = 0;
            if (spokenWords[i]) {
                const levScore = wordSimilarity(spokenWords[i], ew);
                const phonScore = phoneticSimilarity(spokenWords[i], ew);
                bestMatch = Math.max(levScore, phonScore);
            }

            // Also try nearby positions (±2) for word-order variations
            for (let offset = -2; offset <= 2; offset++) {
                const idx = i + offset;
                if (idx >= 0 && idx < spokenWords.length && idx !== i) {
                    const levScore = wordSimilarity(spokenWords[idx], ew);
                    const phonScore = phoneticSimilarity(spokenWords[idx], ew);
                    bestMatch = Math.max(bestMatch, levScore, phonScore);
                }
            }

            let status, color;
            if (bestMatch >= 85) { status = 'perfect'; color = '#10B981'; }
            else if (bestMatch >= 55) { status = 'close'; color = '#F59E0B'; }
            else if (bestMatch >= 30) { status = 'wrong'; color = '#EF4444'; }
            else { status = 'missing'; color = '#94A3B8'; }

            return { word: ew, status, color, score: bestMatch };
        });

        const avgScore = wordResults.reduce((s, w) => s + w.score, 0) / Math.max(wordResults.length, 1);
        if (avgScore > bestOverallScore) {
            bestOverallScore = avgScore;
            bestWords = wordResults;
        }
    }

    // Overall scoring
    const score = Math.round(bestOverallScore);
    let level, label, color;
    if (score >= 80) { level = 'excellent'; label = '🌟 Xuất sắc!'; color = '#10B981'; }
    else if (score >= 60) { level = 'good'; label = '👍 Tốt lắm!'; color = '#F59E0B'; }
    else if (score >= 35) { level = 'fair'; label = '💪 Gần đúng!'; color = '#3B82F6'; }
    else { level = 'retry'; label = '🔄 Thử lại!'; color = '#EF4444'; }

    return { words: bestWords, score, level, label, color };
}

// =============================================
// 5. Single-word pronunciation check (for flashcards)
// =============================================
export function checkWordPronunciation(spokenAlternatives, expectedWord) {
    if (!spokenAlternatives || !expectedWord) return { score: 40, feedback: 'tryAgain', confidence: 0 };

    const alternatives = spokenAlternatives.map(alt => {
        const text = typeof alt === 'string' ? alt : alt.text;
        const confidence = typeof alt === 'string' ? 0.5 : (alt.confidence || 0.5);
        return { text, confidence };
    });

    const best = bestAlternativeMatch(alternatives, expectedWord);

    if (best.score >= 85) return { score: 100, feedback: 'perfect', confidence: best.confidence, matched: best.text };
    if (best.score >= 65) return { score: 80, feedback: 'great', confidence: best.confidence, matched: best.text };
    if (best.score >= 45) return { score: 60, feedback: 'good', confidence: best.confidence, matched: best.text };
    if (best.score >= 25) return { score: 45, feedback: 'close', confidence: best.confidence, matched: best.text };
    return { score: 30, feedback: 'tryAgain', confidence: best.confidence, matched: best.text };
}

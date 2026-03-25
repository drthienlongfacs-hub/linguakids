// speakingUtils.js — Shared utilities for pronunciation assessment
// Used by: ShadowingEngine, SpeakingPractice, IELTSSimulator

// ============================================================
// Levenshtein distance for word-level similarity
// ============================================================
export function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
        for (let j = 1; j <= n; j++)
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    return dp[m][n];
}

// Word-level similarity (0-100)
export function wordSimilarity(target, spoken) {
    if (!target || !spoken) return 0;
    const t = target.toLowerCase().trim();
    const s = spoken.toLowerCase().trim();
    if (t === s) return 100;
    const dist = levenshtein(t, s);
    const maxLen = Math.max(t.length, s.length);
    return Math.max(0, Math.round((1 - dist / maxLen) * 100));
}

// ============================================================
// Diff words: match target words to spoken words
// Returns array of { word, status, spoken, similarity }
// ============================================================
export function diffWords(targetText, spokenText, lang = 'en') {
    const normalize = (text) => {
        let t = text.toLowerCase().replace(/[.,!?;:'"()\-—–…]/g, '').trim();
        if (lang === 'cn' || lang === 'zh') {
            return t.split('').filter(c => c.trim());
        }
        return t.split(/\s+/).filter(Boolean);
    };

    const targetWords = normalize(targetText);
    const spokenWords = normalize(spokenText);

    if (!spokenWords.length) {
        return targetWords.map(w => ({ word: w, status: 'missing', spoken: '', similarity: 0 }));
    }

    const result = [];
    let spIdx = 0;

    for (let i = 0; i < targetWords.length; i++) {
        const tw = targetWords[i];
        let bestMatch = { idx: -1, sim: 0 };

        // Search window: look ahead up to 3 positions in spoken words
        const searchEnd = Math.min(spIdx + 4, spokenWords.length);
        for (let j = spIdx; j < searchEnd; j++) {
            const sim = wordSimilarity(tw, spokenWords[j]);
            if (sim > bestMatch.sim) {
                bestMatch = { idx: j, sim };
            }
        }

        if (bestMatch.sim >= 85) {
            result.push({ word: tw, status: 'perfect', spoken: spokenWords[bestMatch.idx], similarity: bestMatch.sim });
            spIdx = bestMatch.idx + 1;
        } else if (bestMatch.sim >= 55) {
            result.push({ word: tw, status: 'close', spoken: spokenWords[bestMatch.idx], similarity: bestMatch.sim });
            spIdx = bestMatch.idx + 1;
        } else {
            result.push({ word: tw, status: bestMatch.idx >= 0 ? 'wrong' : 'missing', spoken: bestMatch.idx >= 0 ? spokenWords[bestMatch.idx] : '', similarity: bestMatch.sim });
            if (bestMatch.idx >= 0 && bestMatch.sim >= 30) spIdx = bestMatch.idx + 1;
        }
    }

    return result;
}

// ============================================================
// Calculate overall accuracy from diff results (0-100)
// ============================================================
export function calculateAccuracy(diffs) {
    if (!diffs.length) return 0;
    const total = diffs.reduce((sum, d) => sum + d.similarity, 0);
    return Math.round(total / diffs.length);
}

// ============================================================
// Words Per Minute calculation
// ============================================================
export function calculateWPM(wordCount, durationMs) {
    if (!durationMs || durationMs < 1000) return 0;
    const minutes = durationMs / 60000;
    return Math.round(wordCount / minutes);
}

// ============================================================
// Fluency assessment
// Returns { wpm, level, feedback }
// ============================================================
export function assessFluency(wordCount, durationMs) {
    const wpm = calculateWPM(wordCount, durationMs);
    let level, feedback;

    if (wpm >= 150) {
        level = 'excellent';
        feedback = 'Native-like pace! Clear and confident delivery.';
    } else if (wpm >= 120) {
        level = 'good';
        feedback = 'Good pace. Natural rhythm with occasional pauses.';
    } else if (wpm >= 90) {
        level = 'fair';
        feedback = 'Moderate pace. Try to reduce hesitations.';
    } else if (wpm >= 60) {
        level = 'slow';
        feedback = 'Slow pace with frequent pauses. Practice speaking more fluidly.';
    } else {
        level = 'very_slow';
        feedback = 'Very slow. Focus on common phrases to build fluency.';
    }

    return { wpm, level, feedback };
}

// ============================================================
// IELTS Band Score estimation
// Based on: Pronunciation accuracy + Fluency + Vocabulary range
// ============================================================
export function estimateBandScore({ accuracy, wpm, wordCount, uniqueWords }) {
    // Pronunciation score (0-9)
    let pronScore;
    if (accuracy >= 90) pronScore = 8;
    else if (accuracy >= 80) pronScore = 7;
    else if (accuracy >= 70) pronScore = 6.5;
    else if (accuracy >= 60) pronScore = 6;
    else if (accuracy >= 50) pronScore = 5.5;
    else if (accuracy >= 40) pronScore = 5;
    else pronScore = 4;

    // Fluency score (0-9)
    let fluencyScore;
    if (wpm >= 150) fluencyScore = 8;
    else if (wpm >= 130) fluencyScore = 7.5;
    else if (wpm >= 110) fluencyScore = 7;
    else if (wpm >= 90) fluencyScore = 6.5;
    else if (wpm >= 70) fluencyScore = 6;
    else if (wpm >= 50) fluencyScore = 5;
    else fluencyScore = 4;

    // Vocabulary range (lexical diversity)
    const lexicalDiversity = uniqueWords / Math.max(wordCount, 1);
    let vocabScore;
    if (lexicalDiversity >= 0.7 && wordCount >= 50) vocabScore = 7.5;
    else if (lexicalDiversity >= 0.6 && wordCount >= 30) vocabScore = 7;
    else if (lexicalDiversity >= 0.5 && wordCount >= 20) vocabScore = 6.5;
    else if (wordCount >= 15) vocabScore = 6;
    else vocabScore = 5;

    // Average (IELTS rounds to nearest 0.5)
    const avg = (pronScore + fluencyScore + vocabScore) / 3;
    const band = Math.round(avg * 2) / 2;

    return {
        overall: band,
        pronunciation: pronScore,
        fluency: fluencyScore,
        vocabulary: vocabScore,
    };
}

// Status colors for word-level feedback
export const STATUS_COLORS = {
    perfect: '#22C55E',
    close: '#F59E0B',
    wrong: '#EF4444',
    missing: '#6B7280',
};

export const STATUS_LABELS = {
    perfect: '✅ Perfect',
    close: '🟡 Close',
    wrong: '❌ Wrong',
    missing: '⚪ Missing',
};

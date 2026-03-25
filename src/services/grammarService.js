// grammarService.js — LanguageTool API Integration
// API: https://api.languagetool.org/v2/check
// Free tier: 20 requests/min, 20K chars/request
// No API key required for basic usage

const API_URL = 'https://api.languagetool.org/v2/check';

/**
 * Check text for grammar, spelling, and style errors
 * @param {string} text - Text to check
 * @param {string} language - Language code (en-US, zh, etc.)
 * @returns {Promise<{matches: Array, correctedText: string}>}
 */
export async function checkGrammar(text, language = 'en-US') {
    if (!text || text.trim().length < 3) return { matches: [], correctedText: text };

    try {
        const params = new URLSearchParams({
            text,
            language,
            enabledOnly: 'false',
        });

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString(),
        });

        if (!res.ok) {
            console.warn('LanguageTool API error:', res.status);
            return { matches: [], correctedText: text };
        }

        const data = await res.json();
        const matches = (data.matches || []).map(m => ({
            message: m.message,
            shortMessage: m.shortMessage || '',
            offset: m.offset,
            length: m.length,
            replacements: (m.replacements || []).slice(0, 5).map(r => r.value),
            context: m.context?.text || '',
            contextOffset: m.context?.offset || 0,
            category: m.rule?.category?.name || 'Unknown',
            ruleId: m.rule?.id || '',
            type: m.rule?.issueType || 'grammar',
            // Severity: typographical < grammar < style
            severity: m.rule?.issueType === 'typographical' ? 1
                : m.rule?.issueType === 'grammar' ? 2
                    : m.rule?.issueType === 'style' ? 3 : 2,
        }));

        // Build corrected text by applying first replacement for each match
        let correctedText = text;
        const sortedMatches = [...matches].sort((a, b) => b.offset - a.offset);
        for (const m of sortedMatches) {
            if (m.replacements.length > 0) {
                correctedText = correctedText.slice(0, m.offset) + m.replacements[0] + correctedText.slice(m.offset + m.length);
            }
        }

        return { matches, correctedText };
    } catch (err) {
        console.warn('Grammar check failed:', err);
        return { matches: [], correctedText: text };
    }
}

/**
 * Get error count by category
 */
export function categorizeErrors(matches) {
    const categories = {};
    for (const m of matches) {
        const cat = m.category;
        categories[cat] = (categories[cat] || 0) + 1;
    }
    return categories;
}

/**
 * Calculate grammar score (0-100)
 */
export function calculateGrammarScore(text, matches) {
    if (!text || !text.trim()) return 100;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    if (wordCount === 0) return 100;

    // Weight by severity
    let totalPenalty = 0;
    for (const m of matches) {
        totalPenalty += m.severity === 1 ? 1 : m.severity === 2 ? 3 : 2;
    }

    const errorRate = totalPenalty / wordCount;
    const score = Math.max(0, Math.round(100 * (1 - errorRate * 2)));
    return score;
}

/**
 * Highlight errors in text by wrapping them in markers
 * Returns array of { text, type, message, replacements }
 */
export function highlightErrors(text, matches) {
    if (!matches.length) return [{ text, type: 'normal' }];

    const sorted = [...matches].sort((a, b) => a.offset - b.offset);
    const segments = [];
    let lastEnd = 0;

    for (const m of sorted) {
        if (m.offset > lastEnd) {
            segments.push({ text: text.slice(lastEnd, m.offset), type: 'normal' });
        }
        segments.push({
            text: text.slice(m.offset, m.offset + m.length),
            type: m.type || 'grammar',
            message: m.message,
            replacements: m.replacements,
            category: m.category,
        });
        lastEnd = m.offset + m.length;
    }

    if (lastEnd < text.length) {
        segments.push({ text: text.slice(lastEnd), type: 'normal' });
    }

    return segments;
}

export default { checkGrammar, categorizeErrors, calculateGrammarScore, highlightErrors };

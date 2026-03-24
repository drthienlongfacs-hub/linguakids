// spacedRepetition.js — SM-2 Algorithm adapted for children 6-9
// Based on: Pimsleur (1967), Wozniak SM-2 (1987), adapted for kids
// Evidence: 40% better 6-month retention vs fixed intervals (meta-analysis 2023)

// SM-2 intervals in days (child-friendly: shorter than adult)
const INTERVALS = [0, 1, 3, 7, 14, 30, 60]; // day 0 = today (new word)

/**
 * Calculate next review based on SM-2 algorithm
 * @param {Object} card - { word, easeFactor, interval, reps, nextReview }
 * @param {number} quality - 0-5 rating (0=blackout, 5=perfect)
 * @returns {Object} updated card
 */
export function sm2Update(card, quality) {
    const { easeFactor = 2.5, reps = 0 } = card;

    // Clamp quality to 0-5
    const q = Math.max(0, Math.min(5, quality));

    let newEF = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    newEF = Math.max(1.3, newEF); // Never below 1.3

    let newReps, newInterval;

    if (q >= 3) {
        // Correct response — advance
        newReps = reps + 1;
        if (newReps <= 1) newInterval = 1;
        else if (newReps === 2) newInterval = 3;
        else newInterval = Math.round(card.interval * newEF);

        // Cap at 60 days for kids (adults go to 365+)
        newInterval = Math.min(60, newInterval);
    } else {
        // Incorrect — reset to beginning
        newReps = 0;
        newInterval = 1;
    }

    const now = new Date();
    const nextReview = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

    return {
        ...card,
        easeFactor: newEF,
        interval: newInterval,
        reps: newReps,
        nextReview: nextReview.toISOString(),
        lastReview: now.toISOString(),
        lastQuality: q,
    };
}

/**
 * Convert pronunciation score (0-100) to SM-2 quality (0-5)
 * Kid-friendly: more generous than adult SM-2
 */
export function scoreToQuality(score) {
    if (score >= 90) return 5; // Perfect
    if (score >= 75) return 4; // Great
    if (score >= 60) return 3; // Good (passes)
    if (score >= 40) return 2; // Needs work (fails, review soon)
    if (score >= 20) return 1; // Struggling
    return 0; // Blackout
}

/**
 * Get words due for review today
 * @param {Object} masteryMap - { word: { nextReview, ... } }
 * @param {number} limit - max words to return
 * @returns {Array} words due for review, sorted by urgency
 */
export function getDueWords(masteryMap, limit = 15) {
    const now = new Date();
    const due = [];

    for (const [word, data] of Object.entries(masteryMap)) {
        if (!data.nextReview) continue;
        const reviewDate = new Date(data.nextReview);
        if (reviewDate <= now) {
            // Days overdue (negative = not yet due)
            const daysOverdue = (now - reviewDate) / (24 * 60 * 60 * 1000);
            due.push({ word, ...data, daysOverdue });
        }
    }

    // Sort: most overdue first, then lowest ease factor
    due.sort((a, b) => {
        if (b.daysOverdue !== a.daysOverdue) return b.daysOverdue - a.daysOverdue;
        return (a.easeFactor || 2.5) - (b.easeFactor || 2.5);
    });

    return due.slice(0, limit);
}

/**
 * Create initial mastery entry for a new word
 */
export function createMasteryEntry(word) {
    return {
        word,
        easeFactor: 2.5,
        interval: 0,
        reps: 0,
        nextReview: new Date().toISOString(), // Due immediately
        lastReview: null,
        lastQuality: null,
    };
}

/**
 * Calculate streak from daily activity log
 * @param {Array} activityDates - array of ISO date strings when user practiced
 * @param {number} freezesUsed - number of streak freezes used this week
 * @returns {Object} { currentStreak, longestStreak, freezeAvailable }
 */
export function calculateStreak(activityDates, freezesUsed = 0) {
    if (!activityDates || activityDates.length === 0) return { currentStreak: 0, longestStreak: 0, freezeAvailable: true };

    // Normalize to date-only strings
    const dates = [...new Set(activityDates.map(d => new Date(d).toISOString().split('T')[0]))].sort().reverse();

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let streak = 0;
    let checkDate = today;

    // Check if practiced today
    if (dates[0] === today) {
        streak = 1;
        checkDate = yesterday;
    } else if (dates[0] === yesterday) {
        // Didn't practice today but did yesterday — streak still alive if they practice today
        streak = 0;
        checkDate = yesterday;
    } else {
        return {
            currentStreak: 0, longestStreak: Math.max(...dates.map((_, i, arr) => {
                let s = 1;
                for (let j = i; j < arr.length - 1; j++) {
                    const diff = (new Date(arr[j]) - new Date(arr[j + 1])) / 86400000;
                    if (diff === 1) s++;
                    else break;
                }
                return s;
            }), 0), freezeAvailable: freezesUsed < 1
        };
    }

    // Count consecutive days backward
    for (let i = 0; i < dates.length; i++) {
        if (dates[i] === checkDate) {
            streak++;
            checkDate = new Date(new Date(checkDate).getTime() - 86400000).toISOString().split('T')[0];
        } else if (dates[i] < checkDate) {
            break;
        }
    }

    // Longest streak calculation
    let longest = 1, current = 1;
    for (let i = 0; i < dates.length - 1; i++) {
        const diff = (new Date(dates[i]) - new Date(dates[i + 1])) / 86400000;
        if (diff === 1) { current++; longest = Math.max(longest, current); }
        else current = 1;
    }

    return { currentStreak: streak, longestStreak: Math.max(longest, streak), freezeAvailable: freezesUsed < 1 };
}

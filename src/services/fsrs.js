// fsrs.js — Free Spaced Repetition Scheduler (FSRS v4)
// Evidence: 15% better retention than SM-2 (Anki default)
// Reference: https://github.com/open-spaced-repetition/ts-fsrs
// Simplified port for browser use — no dependencies

// ============================================================
// FSRS Parameters (optimized from large-scale Anki data)
// ============================================================
const DEFAULT_PARAMS = {
    w: [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61],
    requestRetention: 0.9, // Target 90% retention rate
    maximumInterval: 36500, // Max 100 years
};

// Rating enum
export const Rating = {
    Again: 1,  // Complete blackout
    Hard: 2,   // Significant difficulty
    Good: 3,   // Moderate effort
    Easy: 4,   // Effortless recall
};

// State enum
export const State = {
    New: 0,
    Learning: 1,
    Review: 2,
    Relearning: 3,
};

// ============================================================
// Core FSRS Card
// ============================================================
export function createCard() {
    return {
        due: new Date(),
        stability: 0,
        difficulty: 0,
        elapsedDays: 0,
        scheduledDays: 0,
        reps: 0,
        lapses: 0,
        state: State.New,
        lastReview: null,
    };
}

// ============================================================
// FSRS Scheduler
// ============================================================
export class FSRS {
    constructor(params = {}) {
        this.p = { ...DEFAULT_PARAMS, ...params };
        this.w = this.p.w;
    }

    // Calculate initial stability based on rating
    initStability(r) {
        return Math.max(this.w[r - 1], 0.1);
    }

    // Calculate initial difficulty based on rating
    initDifficulty(r) {
        return Math.min(Math.max(this.w[4] - (r - 3) * this.w[5], 1), 10);
    }

    // Calculate next difficulty
    nextDifficulty(d, r) {
        const nextD = d - this.w[6] * (r - 3);
        return Math.min(Math.max(this.meanReversion(this.w[4], nextD), 1), 10);
    }

    meanReversion(init, current) {
        return this.w[7] * init + (1 - this.w[7]) * current;
    }

    // Calculate next stability after recall
    nextRecallStability(d, s, r, elapsedDays) {
        const hardPenalty = r === Rating.Hard ? this.w[15] : 1;
        const easyBonus = r === Rating.Easy ? this.w[16] : 1;
        return s * (1 + Math.exp(this.w[8]) *
            (11 - d) *
            Math.pow(s, -this.w[9]) *
            (Math.exp((1 - (elapsedDays / s)) * this.w[10]) - 1) *
            hardPenalty *
            easyBonus);
    }

    // Calculate next stability after forgetting
    nextForgetStability(d, s, r) {
        return this.w[11] *
            Math.pow(d, -this.w[12]) *
            (Math.pow(s + 1, this.w[13]) - 1) *
            Math.exp((1 - r) * this.w[14]);
    }

    // Calculate next interval from stability
    nextInterval(s) {
        const interval = (s / 0.9) * (Math.pow(this.p.requestRetention, 1 / -0.5) - 1);
        return Math.min(Math.max(Math.round(interval), 1), this.p.maximumInterval);
    }

    // ============================================================
    // Main scheduling function
    // Returns: { card, interval, state }
    // ============================================================
    schedule(card, rating, now = new Date()) {
        const c = { ...card };
        const elapsedDays = c.lastReview
            ? Math.max(0, (now - new Date(c.lastReview)) / 86400000)
            : 0;

        c.lastReview = now.toISOString();
        c.reps += 1;

        if (c.state === State.New) {
            // First review
            c.stability = this.initStability(rating);
            c.difficulty = this.initDifficulty(rating);
            c.elapsedDays = 0;

            if (rating === Rating.Again) {
                c.state = State.Learning;
                c.scheduledDays = 0;
                c.due = new Date(now.getTime() + 60000); // 1 min
            } else if (rating === Rating.Hard) {
                c.state = State.Learning;
                c.scheduledDays = 0;
                c.due = new Date(now.getTime() + 300000); // 5 min
            } else if (rating === Rating.Good) {
                c.state = State.Learning;
                c.scheduledDays = 0;
                c.due = new Date(now.getTime() + 600000); // 10 min
            } else {
                c.state = State.Review;
                const interval = this.nextInterval(c.stability);
                c.scheduledDays = interval;
                c.due = new Date(now.getTime() + interval * 86400000);
            }
        } else if (c.state === State.Learning || c.state === State.Relearning) {
            c.elapsedDays = elapsedDays;

            if (rating === Rating.Again) {
                c.stability = this.initStability(rating);
                c.state = c.state === State.Learning ? State.Learning : State.Relearning;
                c.scheduledDays = 0;
                c.due = new Date(now.getTime() + 300000); // 5 min
                c.lapses += 1;
            } else if (rating === Rating.Hard) {
                c.stability = this.initStability(rating);
                c.scheduledDays = 0;
                c.due = new Date(now.getTime() + 600000); // 10 min
            } else {
                c.state = State.Review;
                c.stability = this.initStability(rating);
                const interval = this.nextInterval(c.stability);
                c.scheduledDays = interval;
                c.due = new Date(now.getTime() + interval * 86400000);
            }
        } else {
            // Review state
            c.elapsedDays = elapsedDays;

            if (rating === Rating.Again) {
                c.state = State.Relearning;
                c.lapses += 1;
                c.stability = this.nextForgetStability(c.difficulty, c.stability, 0.9);
                c.difficulty = this.nextDifficulty(c.difficulty, rating);
                c.scheduledDays = 0;
                c.due = new Date(now.getTime() + 300000); // 5 min
            } else {
                c.stability = this.nextRecallStability(c.difficulty, c.stability, rating, elapsedDays);
                c.difficulty = this.nextDifficulty(c.difficulty, rating);
                const interval = this.nextInterval(c.stability);
                c.scheduledDays = interval;
                c.due = new Date(now.getTime() + interval * 86400000);
            }
        }

        return c;
    }

    // Get cards due for review
    getDueCards(cards, now = new Date()) {
        return cards.filter(c => new Date(c.due) <= now);
    }

    // Sort cards by priority (overdue first, then by stability)
    sortByPriority(cards) {
        const now = new Date();
        return [...cards].sort((a, b) => {
            const aDue = new Date(a.due);
            const bDue = new Date(b.due);
            // Overdue items first
            const aOverdue = aDue <= now;
            const bOverdue = bDue <= now;
            if (aOverdue && !bOverdue) return -1;
            if (!aOverdue && bOverdue) return 1;
            // Among overdue, lowest stability first (most likely to forget)
            if (aOverdue && bOverdue) return a.stability - b.stability;
            // Among future, earliest due first
            return aDue - bDue;
        });
    }
}

// Singleton instance
export const fsrs = new FSRS();

// ============================================================
// LocalStorage persistence for FSRS cards
// ============================================================
const STORAGE_KEY = 'linguakids_fsrs_cards';

export function loadFSRSCards() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
}

export function saveFSRSCards(cards) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) { console.warn('FSRS save failed:', e); }
}

export function getOrCreateCard(wordId) {
    const cards = loadFSRSCards();
    if (!cards[wordId]) {
        cards[wordId] = createCard();
        saveFSRSCards(cards);
    }
    return cards[wordId];
}

export function reviewCard(wordId, rating) {
    const cards = loadFSRSCards();
    const card = cards[wordId] || createCard();
    const updated = fsrs.schedule(card, rating);
    cards[wordId] = updated;
    saveFSRSCards(cards);
    return updated;
}

export function getDueWordIds() {
    const cards = loadFSRSCards();
    const now = new Date();
    return Object.entries(cards)
        .filter(([, card]) => new Date(card.due) <= now)
        .sort((a, b) => (a[1].stability || 0) - (b[1].stability || 0))
        .map(([id]) => id);
}

export default { fsrs, Rating, State, createCard, loadFSRSCards, saveFSRSCards, getOrCreateCard, reviewCard, getDueWordIds };

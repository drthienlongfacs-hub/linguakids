// useGameState — XP, levels, streaks, achievements, spaced repetition
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'linguakids_state';

const LEVELS = [
    { level: 1, title: 'Bé Mầm Non', titleEn: 'Little Seedling', emoji: '🌱', xpNeeded: 0 },
    { level: 2, title: 'Bé Khám Phá', titleEn: 'Explorer', emoji: '🌿', xpNeeded: 100 },
    { level: 3, title: 'Bé Thông Minh', titleEn: 'Smart Kid', emoji: '🌳', xpNeeded: 250 },
    { level: 4, title: 'Bé Giỏi Giang', titleEn: 'Champion', emoji: '⭐', xpNeeded: 500 },
    { level: 5, title: 'Bé Siêu Sao', titleEn: 'Superstar', emoji: '🌟', xpNeeded: 800 },
    { level: 6, title: 'Bé Tài Năng', titleEn: 'Prodigy', emoji: '🏆', xpNeeded: 1200 },
    { level: 7, title: 'Nhà Ngôn Ngữ', titleEn: 'Linguist', emoji: '👑', xpNeeded: 2000 },
];

const BADGES = [
    { id: 'first_word', title: 'Từ Đầu Tiên', emoji: '🎯', condition: (s) => s.wordsLearned.length >= 1 },
    { id: 'ten_words', title: '10 Từ Mới', emoji: '📚', condition: (s) => s.wordsLearned.length >= 10 },
    { id: 'twenty_words', title: '20 Từ Mới', emoji: '🎓', condition: (s) => s.wordsLearned.length >= 20 },
    { id: 'fifty_words', title: '50 Từ Mới', emoji: '🏅', condition: (s) => s.wordsLearned.length >= 50 },
    { id: 'streak_3', title: '3 Ngày Liên Tiếp', emoji: '🔥', condition: (s) => s.streak >= 3 },
    { id: 'streak_7', title: '1 Tuần Liên Tiếp', emoji: '💎', condition: (s) => s.streak >= 7 },
    { id: 'first_game', title: 'Game Thủ Nhí', emoji: '🎮', condition: (s) => s.gamesPlayed >= 1 },
    { id: 'ten_games', title: 'Vua Trò Chơi', emoji: '👾', condition: (s) => s.gamesPlayed >= 10 },
    { id: 'english_starter', title: 'En → Bắt Đầu', emoji: '🇬🇧', condition: (s) => s.englishWordsLearned >= 5 },
    { id: 'chinese_starter', title: 'Cn → Bắt Đầu', emoji: '🇨🇳', condition: (s) => s.chineseWordsLearned >= 5 },
    { id: 'bilingual', title: 'Song Ngữ', emoji: '🌍', condition: (s) => s.englishWordsLearned >= 10 && s.chineseWordsLearned >= 10 },
    { id: 'perfect_quiz', title: 'Xuất Sắc', emoji: '💯', condition: (s) => s.perfectQuizzes >= 1 },
];

const DEFAULT_STATE = {
    childName: '',
    avatarEmoji: '🐼',
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    wordsLearned: [],     // Array of { word, lang, masteredAt, reviewCount, nextReview }
    englishWordsLearned: 0,
    chineseWordsLearned: 0,
    gamesPlayed: 0,
    perfectQuizzes: 0,
    unlockedBadges: [],
    soundEnabled: true,
    totalSessions: 0,
    sessionStartTime: null,
    topicProgress: {},    // { topicId: { completed: number, total: number } }
    // Phase 1: Daily tracking
    activityDates: [],     // ISO date strings of days practiced
    dailyGoal: 10,         // Words per day target
    dailyWordsToday: 0,    // Words completed today
    dailyReviewsToday: 0,  // Reviews completed today
    lastDailyReset: null,  // Date string of last daily reset
    freezesUsedThisWeek: 0,
};

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return { ...DEFAULT_STATE, ...JSON.parse(saved) };
        }
    } catch (e) {
        console.warn('Failed to load game state:', e);
    }
    return { ...DEFAULT_STATE };
}

function saveState(state) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        console.warn('Failed to save game state:', e);
    }
}

export function useGameState() {
    const [state, setState] = useState(loadState);

    // Save state whenever it changes
    useEffect(() => {
        saveState(state);
    }, [state]);

    // Check and update streak on mount + reset daily counters
    useEffect(() => {
        const today = new Date().toDateString();
        if (state.lastActiveDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const isConsecutive = state.lastActiveDate === yesterday.toDateString();

            setState(prev => ({
                ...prev,
                streak: isConsecutive ? prev.streak + 1 : (prev.lastActiveDate === today ? prev.streak : 1),
                lastActiveDate: today,
                totalSessions: prev.totalSessions + 1,
                sessionStartTime: Date.now(),
                // Reset daily counters
                dailyWordsToday: prev.lastDailyReset === today ? prev.dailyWordsToday : 0,
                dailyReviewsToday: prev.lastDailyReset === today ? prev.dailyReviewsToday : 0,
                lastDailyReset: today,
                // Track activity date
                activityDates: prev.activityDates.includes(today)
                    ? prev.activityDates
                    : [...prev.activityDates.slice(-90), today], // Keep last 90 days
            }));
        }
    }, []);

    // Add XP
    const addXP = useCallback((amount) => {
        setState(prev => ({ ...prev, xp: prev.xp + amount }));
    }, []);

    // Learn a word (track for spaced repetition)
    const learnWord = useCallback((word, lang) => {
        setState(prev => {
            const isNew = !prev.wordsLearned.find(w => w.word === word && w.lang === lang);
            if (!isNew) return prev;

            const now = Date.now();
            const newWordEntry = {
                word,
                lang,
                masteredAt: now,
                reviewCount: 0,
                nextReview: now + 24 * 60 * 60 * 1000, // 1 day
            };

            return {
                ...prev,
                wordsLearned: [...prev.wordsLearned, newWordEntry],
                englishWordsLearned: prev.englishWordsLearned + (lang === 'en' ? 1 : 0),
                chineseWordsLearned: prev.chineseWordsLearned + (lang === 'cn' ? 1 : 0),
                xp: prev.xp + 10, // +10 XP per new word
            };
        });
    }, []);

    // Record game played
    const recordGame = useCallback((isPerfect = false) => {
        setState(prev => ({
            ...prev,
            gamesPlayed: prev.gamesPlayed + 1,
            perfectQuizzes: prev.perfectQuizzes + (isPerfect ? 1 : 0),
            xp: prev.xp + (isPerfect ? 25 : 15),
        }));
    }, []);

    // Update topic progress
    const updateTopicProgress = useCallback((topicId, completed, total) => {
        setState(prev => ({
            ...prev,
            topicProgress: {
                ...prev.topicProgress,
                [topicId]: { completed, total },
            },
        }));
    }, []);

    // Set child name
    const setChildName = useCallback((name) => {
        setState(prev => ({ ...prev, childName: name }));
    }, []);

    // Set avatar
    const setAvatar = useCallback((emoji) => {
        setState(prev => ({ ...prev, avatarEmoji: emoji }));
    }, []);

    // Toggle sound
    const toggleSound = useCallback(() => {
        setState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
    }, []);

    // Get current level
    const currentLevel = LEVELS.reduce((acc, lvl) => {
        if (state.xp >= lvl.xpNeeded) return lvl;
        return acc;
    }, LEVELS[0]);

    const nextLevel = LEVELS[LEVELS.indexOf(currentLevel) + 1] || null;
    const xpForNext = nextLevel ? nextLevel.xpNeeded - state.xp : 0;
    const levelProgress = nextLevel
        ? ((state.xp - currentLevel.xpNeeded) / (nextLevel.xpNeeded - currentLevel.xpNeeded)) * 100
        : 100;

    // Check unlocked badges
    const unlockedBadges = BADGES.filter(badge => badge.condition(state));
    const lockedBadges = BADGES.filter(badge => !badge.condition(state));

    // SM-2 Adaptive Difficulty System
    // Calculates difficulty based on performance history
    const getDifficulty = useCallback(() => {
        const { gamesPlayed, perfectQuizzes, wordsLearned, streak } = state;
        if (gamesPlayed < 3) return 'easy';

        const accuracy = gamesPlayed > 0 ? perfectQuizzes / gamesPlayed : 0;
        const wordCount = wordsLearned.length;

        // Factor in: accuracy, word count, streak length
        const score = (accuracy * 40) + (Math.min(wordCount, 50) / 50 * 30) + (Math.min(streak, 7) / 7 * 30);

        if (score >= 70) return 'hard';
        if (score >= 40) return 'medium';
        return 'easy';
    }, [state]);

    // Get words due for review (spaced repetition)
    const getWordsForReview = useCallback(() => {
        const now = Date.now();
        return state.wordsLearned.filter(w => w.nextReview && w.nextReview <= now);
    }, [state.wordsLearned]);

    // Update word review (SM-2 algorithm)
    const reviewWord = useCallback((word, lang, quality) => {
        // quality: 0-5 (0=blackout, 5=perfect)
        setState(prev => {
            const newWords = prev.wordsLearned.map(w => {
                if (w.word !== word || w.lang !== lang) return w;

                const ef = Math.max(1.3, (w.ef || 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
                const count = (w.reviewCount || 0) + 1;
                let interval;

                if (quality < 3) {
                    interval = 1; // Reset if poor
                } else if (count === 1) {
                    interval = 1;
                } else if (count === 2) {
                    interval = 6;
                } else {
                    interval = Math.round((w.lastInterval || 1) * ef);
                }

                return {
                    ...w,
                    reviewCount: count,
                    ef,
                    lastInterval: interval,
                    nextReview: Date.now() + interval * 24 * 60 * 60 * 1000,
                    lastReviewQuality: quality,
                };
            });
            return { ...prev, wordsLearned: newWords };
        });
    }, []);

    // Reset state 
    const resetState = useCallback(() => {
        setState({ ...DEFAULT_STATE });
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    // Record daily activity (called when word learned or reviewed)
    const recordDailyActivity = useCallback((type = 'learn') => {
        setState(prev => ({
            ...prev,
            dailyWordsToday: type === 'learn' ? prev.dailyWordsToday + 1 : prev.dailyWordsToday,
            dailyReviewsToday: type === 'review' ? prev.dailyReviewsToday + 1 : prev.dailyReviewsToday,
        }));
    }, []);

    // Get daily progress stats
    const getDailyStats = useCallback(() => {
        const totalToday = state.dailyWordsToday + state.dailyReviewsToday;
        const progress = Math.min(100, Math.round((totalToday / state.dailyGoal) * 100));
        const wordsForReview = state.wordsLearned.filter(w => w.nextReview && w.nextReview <= Date.now()).length;
        return {
            wordsLearned: state.dailyWordsToday,
            wordsReviewed: state.dailyReviewsToday,
            totalToday,
            goal: state.dailyGoal,
            progress,
            goalReached: totalToday >= state.dailyGoal,
            wordsForReview,
        };
    }, [state]);

    return {
        state,
        addXP,
        learnWord,
        recordGame,
        updateTopicProgress,
        setChildName,
        setAvatar,
        toggleSound,
        currentLevel,
        nextLevel,
        xpForNext,
        levelProgress,
        unlockedBadges,
        lockedBadges,
        allBadges: BADGES,
        levels: LEVELS,
        resetState,
        getDifficulty,
        getWordsForReview,
        reviewWord,
        recordDailyActivity,
        getDailyStats,
    };
}


// Bridging to Zustand store to avoid breaking 15+ pages at once
import { useEffect } from 'react';
import { USER_MODES, getModeConfig } from '../utils/userMode';
import { useGameStore } from '../store/useGameStore';

const LEVELS = [
    { level: 1, title: 'Bé Mầm Non', titleEn: 'Little Seedling', emoji: '🌱', xpNeeded: 0 },
    { level: 2, title: 'Bé Khám Phá', titleEn: 'Explorer', emoji: '🌿', xpNeeded: 100 },
    { level: 3, title: 'Bé Thông Minh', titleEn: 'Smart Kid', emoji: '🌳', xpNeeded: 250 },
    { level: 4, title: 'Bé Giỏi Giang', titleEn: 'Champion', emoji: '⭐', xpNeeded: 500 },
    { level: 5, title: 'Bé Siêu Sao', titleEn: 'Superstar', emoji: '🌟', xpNeeded: 800 },
    { level: 6, title: 'Bé Tài Năng', titleEn: 'Prodigy', emoji: '🏆', xpNeeded: 1200 },
    { level: 7, title: 'Nhà Ngôn Ngữ', titleEn: 'Linguist', emoji: '👑', xpNeeded: 2000 },
];

const ADULT_LEVELS = [
    { level: 1, title: 'Người Mới Bắt Đầu', titleEn: 'Beginner', emoji: '📖', xpNeeded: 0 },
    { level: 2, title: 'Học Viên Chăm Chỉ', titleEn: 'Dedicated Learner', emoji: '📝', xpNeeded: 100 },
    { level: 3, title: 'Người Giao Tiếp', titleEn: 'Communicator', emoji: '💬', xpNeeded: 250 },
    { level: 4, title: 'Người Thành Thạo', titleEn: 'Proficient', emoji: '🎯', xpNeeded: 500 },
    { level: 5, title: 'Chuyên Gia Ngôn Ngữ', titleEn: 'Language Expert', emoji: '🏅', xpNeeded: 800 },
    { level: 6, title: 'Bậc Thầy', titleEn: 'Master', emoji: '🏆', xpNeeded: 1200 },
    { level: 7, title: 'Đa Ngôn Ngữ', titleEn: 'Polyglot', emoji: '🌐', xpNeeded: 2000 },
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
    { id: 'coin_100', title: '100 Xu', emoji: '🪙', condition: (s) => s.totalCoinsEarned >= 100 },
    { id: 'coin_500', title: '500 Xu', emoji: '💰', condition: (s) => s.totalCoinsEarned >= 500 },
    { id: 'coin_1000', title: 'Tỉ Phú Nhí', emoji: '🤑', condition: (s) => s.totalCoinsEarned >= 1000 },
];

export function useGameState() {
    const store = useGameStore();

    // Trigger daily check on mount
    useEffect(() => {
        store.checkAndResetDaily();
    }, [store]);

    const activeLevels = store.userMode === USER_MODES.ADULT ? ADULT_LEVELS : LEVELS;
    const currentLevel = activeLevels.reduce((acc, lvl) => {
        if (store.xp >= lvl.xpNeeded) return lvl;
        return acc;
    }, activeLevels[0]);

    const nextLevel = activeLevels[activeLevels.indexOf(currentLevel) + 1] || null;
    const xpForNext = nextLevel ? nextLevel.xpNeeded - store.xp : 0;
    const levelProgress = nextLevel
        ? ((store.xp - currentLevel.xpNeeded) / (nextLevel.xpNeeded - currentLevel.xpNeeded)) * 100
        : 100;

    const unlockedBadges = BADGES.filter(badge => badge.condition(store));
    const lockedBadges = BADGES.filter(badge => !badge.condition(store));

    const getDifficulty = () => {
        const { gamesPlayed, perfectQuizzes, wordsLearned, streak } = store;
        if (gamesPlayed < 3) return 'easy';

        const accuracy = gamesPlayed > 0 ? perfectQuizzes / gamesPlayed : 0;
        const wordCount = wordsLearned.length;

        const score = (accuracy * 40) + (Math.min(wordCount, 50) / 50 * 30) + (Math.min(streak, 7) / 7 * 30);

        if (score >= 70) return 'hard';
        if (score >= 40) return 'medium';
        return 'easy';
    };

    const getWordsForReview = () => {
        const now = Date.now();
        return store.wordsLearned.filter(w => w.nextReview && w.nextReview <= now);
    };

    const getDailyStats = () => {
        const totalToday = store.dailyWordsToday + store.dailyReviewsToday;
        const progress = Math.min(100, Math.round((totalToday / store.dailyGoal) * 100));
        const wordsForReview = store.wordsLearned.filter(w => w.nextReview && w.nextReview <= Date.now()).length;

        return {
            wordsLearned: store.dailyWordsToday,
            wordsReviewed: store.dailyReviewsToday,
            totalToday,
            goal: store.dailyGoal,
            progress,
            goalReached: totalToday >= store.dailyGoal,
            wordsForReview,
        };
    };

    const modeConfig = getModeConfig(store.userMode);

    return {
        state: store,
        addXP: store.addXP,
        addCoins: store.addCoins,
        learnWord: store.learnWord,
        recordGame: store.recordGame,
        updateTopicProgress: store.updateTopicProgress,
        setChildName: store.setChildName,
        setAvatar: store.setAvatar,
        toggleSound: store.toggleSound,
        toggleMode: store.toggleMode,
        modeConfig,
        currentLevel,
        nextLevel,
        xpForNext,
        levelProgress,
        unlockedBadges,
        lockedBadges,
        allBadges: BADGES,
        levels: activeLevels,
        resetState: store.resetState,
        getDifficulty,
        getWordsForReview,
        reviewWord: store.reviewWord,
        recordDailyActivity: store.recordDailyActivity,
        completeDailyChallenge: store.completeDailyChallenge,
        getDailyStats,
        updateSkillScore: store.updateSkillScore,
        addSpeakingRecap: store.addSpeakingRecap,
        clearSpeakingRecaps: store.clearSpeakingRecaps,
    };
}

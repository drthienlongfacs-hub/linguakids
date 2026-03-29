import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { USER_MODES, getModeConfig } from '../utils/userMode';

export interface WordLearned {
    word: string;
    lang: 'en' | 'cn';
    masteredAt: number;
    reviewCount: number;
    nextReview: number;
    ef?: number;
    lastInterval?: number;
    lastReviewQuality?: number;
}

export interface SpeakingRecapMetric {
    key: string;
    label: string;
    score: number;
    status: string;
    insight: string;
}

export interface SpeakingRecap {
    id: string;
    createdAt: string;
    lessonId: string;
    lessonTitle: string;
    lang: 'en' | 'cn';
    promptText: string;
    targetText: string;
    transcript: string;
    source: string;
    overallScore: number;
    analysisType: string;
    metrics: SpeakingRecapMetric[];
    recommendations: string[];
    note: string;
    transcriptStats: {
        tokenCount: number;
        uniqueTokens: number;
        wpm: number;
        lexicalDiversity: number;
    };
}

export interface GameState {
    childName: string;
    avatarEmoji: string;
    xp: number;
    streak: number;
    lastActiveDate: string | null;
    wordsLearned: WordLearned[];
    englishWordsLearned: number;
    chineseWordsLearned: number;
    gamesPlayed: number;
    perfectQuizzes: number;
    unlockedBadges: string[];
    soundEnabled: boolean;
    totalSessions: number;
    sessionStartTime: number | null;
    topicProgress: Record<string, { completed: number; total: number }>;

    // Daily tracking
    activityDates: string[];
    dailyGoal: number;
    dailyWordsToday: number;
    dailyReviewsToday: number;
    lastDailyReset: string | null;
    lastDailyChallenge: string | null;
    freezesUsedThisWeek: number;

    // Coin Economy
    coins: number;
    totalCoinsEarned: number;

    // Mode
    userMode: string;

    // Placement Test Results
    userCEFRLevel: string | null;
    userHSKLevel: string | null;
    placementCompleted: boolean;

    // Roadmap
    examTarget: string | null;
    roadmapWeek: number;
    completedRoadmapTasks: { week: number; day: number; taskIdx: number; type: string; xp: number }[];
    skillScores: Record<string, number>;
    examHistory: { date: string; type: string; score: number }[];
    speakingRecaps: SpeakingRecap[];
}

interface GameActions {
    addXP: (amount: number) => void;
    addCoins: (amount: number) => void;
    learnWord: (word: string, lang: 'en' | 'cn') => void;
    recordGame: (isPerfect?: boolean) => void;
    updateTopicProgress: (topicId: string, completed: number, total: number) => void;
    setChildName: (name: string) => void;
    setAvatar: (emoji: string) => void;
    toggleSound: () => void;
    toggleMode: () => void;
    reviewWord: (word: string, lang: 'en' | 'cn', quality: number) => void;
    recordDailyActivity: (type?: 'learn' | 'review') => void;
    completeDailyChallenge: (date: string) => void;
    resetState: () => void;
    checkAndResetDaily: () => void;
    setExamTarget: (target: string | null) => void;
    setRoadmapWeek: (week: number) => void;
    completeRoadmapTask: (task: { week: number; day: number; taskIdx: number; type: string; xp: number }) => void;
    setPlacementResult: (cefrLevel: string | null, hskLevel: string | null) => void;
    updateSkillScore: (skill: string, score: number) => void;
    addSpeakingRecap: (recap: SpeakingRecap) => void;
    clearSpeakingRecaps: () => void;
}

export type GameStore = GameState & GameActions;

const DEFAULT_STATE: GameState = {
    childName: '',
    avatarEmoji: '🐼',
    xp: 0,
    streak: 0,
    lastActiveDate: null,
    wordsLearned: [],
    englishWordsLearned: 0,
    chineseWordsLearned: 0,
    gamesPlayed: 0,
    perfectQuizzes: 0,
    unlockedBadges: [],
    soundEnabled: true,
    totalSessions: 0,
    sessionStartTime: null,
    topicProgress: {},
    activityDates: [],
    dailyGoal: 10,
    dailyWordsToday: 0,
    dailyReviewsToday: 0,
    lastDailyReset: null,
    lastDailyChallenge: null,
    freezesUsedThisWeek: 0,
    coins: 0,
    totalCoinsEarned: 0,
    userMode: USER_MODES.KIDS,
    userCEFRLevel: null,
    userHSKLevel: null,
    placementCompleted: false,
    examTarget: null,
    roadmapWeek: 1,
    completedRoadmapTasks: [],
    skillScores: { listening: 0, reading: 0, writing: 0, speaking: 0, grammar: 0, vocabulary: 0 },
    examHistory: [],
    speakingRecaps: [],
};

export const useGameStore = create<GameStore>()(
    persist(
        (set, get) => ({
            ...DEFAULT_STATE,

            checkAndResetDaily: () => {
                const today = new Date().toDateString();
                const state = get();
                if (state.lastActiveDate !== today) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const isConsecutive = state.lastActiveDate === yesterday.toDateString();

                    set({
                        streak: isConsecutive ? state.streak + 1 : (state.lastActiveDate ? 1 : state.streak),
                        lastActiveDate: today,
                        totalSessions: state.totalSessions + 1,
                        sessionStartTime: Date.now(),
                        dailyWordsToday: state.lastDailyReset === today ? state.dailyWordsToday : 0,
                        dailyReviewsToday: state.lastDailyReset === today ? state.dailyReviewsToday : 0,
                        lastDailyReset: today,
                        activityDates: state.activityDates.includes(today)
                            ? state.activityDates
                            : [...state.activityDates.slice(-90), today]
                    });
                }
            },

            addXP: (amount: number) => set((state) => ({ xp: state.xp + amount })),

            addCoins: (amount: number) => set((state) => ({
                coins: state.coins + amount,
                totalCoinsEarned: state.totalCoinsEarned + amount,
            })),

            learnWord: (word: string, lang: 'en' | 'cn') => set((state) => {
                const isNew = !state.wordsLearned.find(w => w.word === word && w.lang === lang);
                if (!isNew) return state;

                const now = Date.now();
                const newWordEntry: WordLearned = {
                    word,
                    lang,
                    masteredAt: now,
                    reviewCount: 0,
                    nextReview: now + 24 * 60 * 60 * 1000,
                };

                return {
                    wordsLearned: [...state.wordsLearned, newWordEntry],
                    englishWordsLearned: state.englishWordsLearned + (lang === 'en' ? 1 : 0),
                    chineseWordsLearned: state.chineseWordsLearned + (lang === 'cn' ? 1 : 0),
                    xp: state.xp + 10,
                };
            }),

            recordGame: (isPerfect = false) => set((state) => ({
                gamesPlayed: state.gamesPlayed + 1,
                perfectQuizzes: state.perfectQuizzes + (isPerfect ? 1 : 0),
                xp: state.xp + (isPerfect ? 25 : 15),
            })),

            updateTopicProgress: (topicId: string, completed: number, total: number) => set((state) => ({
                topicProgress: {
                    ...state.topicProgress,
                    [topicId]: { completed, total },
                }
            })),

            setChildName: (name: string) => set({ childName: name }),
            setAvatar: (emoji: string) => set({ avatarEmoji: emoji }),
            toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

            toggleMode: () => set((state) => {
                const newMode = state.userMode === USER_MODES.KIDS ? USER_MODES.ADULT : USER_MODES.KIDS;
                const config = getModeConfig(newMode);
                return { userMode: newMode, dailyGoal: config.dailyGoal };
            }),

            reviewWord: (word: string, lang: 'en' | 'cn', quality: number) => set((state) => {
                const newWords = state.wordsLearned.map(w => {
                    if (w.word !== word || w.lang !== lang) return w;

                    const ef = Math.max(1.3, (w.ef || 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
                    const count = (w.reviewCount || 0) + 1;
                    let interval;

                    if (quality < 3) {
                        interval = 1;
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
                return { wordsLearned: newWords };
            }),

            recordDailyActivity: (type = 'learn') => set((state) => ({
                dailyWordsToday: type === 'learn' ? state.dailyWordsToday + 1 : state.dailyWordsToday,
                dailyReviewsToday: type === 'review' ? state.dailyReviewsToday + 1 : state.dailyReviewsToday,
            })),

            completeDailyChallenge: (date: string) => set({
                lastDailyChallenge: date,
            }),

            resetState: () => {
                set(DEFAULT_STATE);
                localStorage.removeItem('linguakids_state_z');
            },

            setExamTarget: (target: string | null) => set({ examTarget: target }),
            setRoadmapWeek: (week: number) => set({ roadmapWeek: week }),
            setPlacementResult: (cefrLevel: string | null, hskLevel: string | null) => set({
                userCEFRLevel: cefrLevel,
                userHSKLevel: hskLevel,
                placementCompleted: true,
            }),
            completeRoadmapTask: (task: { week: number; day: number; taskIdx: number; type: string; xp: number }) => set((state) => {
                const already = state.completedRoadmapTasks.some(
                    t => t.week === task.week && t.day === task.day && t.taskIdx === task.taskIdx
                );
                if (already) return state;
                return {
                    completedRoadmapTasks: [...state.completedRoadmapTasks, task],
                    xp: state.xp + (task.xp || 0),
                };
            }),
            // EMA-based skill score update: newScore = α * incoming + (1-α) * old
            updateSkillScore: (skill: string, score: number) => set((state) => {
                const alpha = 0.3;
                const old = state.skillScores[skill] ?? 0;
                const updated = old === 0 ? score : Math.round(alpha * score + (1 - alpha) * old);
                return {
                    skillScores: { ...state.skillScores, [skill]: Math.min(100, Math.max(0, updated)) },
                };
            }),
            addSpeakingRecap: (recap: SpeakingRecap) => set((state) => ({
                speakingRecaps: [recap, ...state.speakingRecaps].slice(0, 20),
            })),
            clearSpeakingRecaps: () => set({ speakingRecaps: [] }),
        }),
        {
            name: 'linguakids_state_z', // unique name
        }
    )
);

// XP & Gamification Engine — Streak, Levels, Achievements
// Inspired by Duolingo/Memrise progression systems

const STORAGE_KEY = 'linguakids_xp';

// XP awards per activity type
const XP_TABLE = {
    vocab_learn: 5,
    vocab_review: 3,
    quiz_correct: 10,
    quiz_perfect: 25,
    listening_complete: 15,
    speaking_complete: 20,
    reading_complete: 10,
    writing_submit: 15,
    grammar_exercise: 10,
    daily_login: 10,
    streak_bonus_7: 50,
    streak_bonus_30: 200,
    placement_test: 50,
    exam_complete: 30,
};

// Level thresholds — 50 levels
const LEVEL_XP = Array.from({ length: 50 }, (_, i) => (i + 1) * 100);

// Badge definitions
const BADGES = [
    { id: 'first_word', name: '🌱 First Word', nameVi: 'Từ đầu tiên', desc: 'Learn your first word', requirement: { type: 'words_learned', count: 1 } },
    { id: 'word_10', name: '📚 Bookworm', nameVi: 'Mọt sách', desc: 'Learn 10 words', requirement: { type: 'words_learned', count: 10 } },
    { id: 'word_50', name: '🧠 Vocab Builder', nameVi: 'Xây dựng vốn từ', desc: 'Learn 50 words', requirement: { type: 'words_learned', count: 50 } },
    { id: 'word_100', name: '🏆 Word Master', nameVi: 'Bậc thầy từ vựng', desc: 'Learn 100 words', requirement: { type: 'words_learned', count: 100 } },
    { id: 'word_500', name: '👑 Vocabulary King', nameVi: 'Vua từ vựng', desc: 'Learn 500 words', requirement: { type: 'words_learned', count: 500 } },
    { id: 'streak_3', name: '🔥 On Fire', nameVi: 'Đang cháy', desc: '3-day streak', requirement: { type: 'streak', count: 3 } },
    { id: 'streak_7', name: '🔥🔥 Week Warrior', nameVi: 'Chiến binh tuần', desc: '7-day streak', requirement: { type: 'streak', count: 7 } },
    { id: 'streak_30', name: '🔥🔥🔥 Monthly Master', nameVi: 'Sư phụ tháng', desc: '30-day streak', requirement: { type: 'streak', count: 30 } },
    { id: 'quiz_10', name: '✅ Quiz Pro', nameVi: 'Siêu trắc nghiệm', desc: 'Score 100% on 10 quizzes', requirement: { type: 'perfect_quizzes', count: 10 } },
    { id: 'listen_5', name: '🎧 Good Listener', nameVi: 'Người nghe giỏi', desc: 'Complete 5 listening lessons', requirement: { type: 'listening_done', count: 5 } },
    { id: 'speak_5', name: '🗣️ Speaker', nameVi: 'Người nói', desc: 'Complete 5 speaking exercises', requirement: { type: 'speaking_done', count: 5 } },
    { id: 'read_5', name: '📖 Reader', nameVi: 'Người đọc', desc: 'Complete 5 reading passages', requirement: { type: 'reading_done', count: 5 } },
    { id: 'write_5', name: '✍️ Writer', nameVi: 'Người viết', desc: 'Submit 5 writing pieces', requirement: { type: 'writing_done', count: 5 } },
    { id: 'level_5', name: '⭐ Rising Star', nameVi: 'Ngôi sao đang lên', desc: 'Reach level 5', requirement: { type: 'level', count: 5 } },
    { id: 'level_10', name: '🌟 Shining Star', nameVi: 'Ngôi sao sáng', desc: 'Reach level 10', requirement: { type: 'level', count: 10 } },
    { id: 'level_25', name: '💫 Superstar', nameVi: 'Siêu sao', desc: 'Reach level 25', requirement: { type: 'level', count: 25 } },
    { id: 'hsk1', name: '🀄 HSK 1', nameVi: 'HSK Cấp 1', desc: 'Learn all HSK 1 words', requirement: { type: 'hsk_level', count: 1 } },
    { id: 'hsk3', name: '🀄🀄 HSK 3', nameVi: 'HSK Cấp 3', desc: 'Learn all HSK 3 words', requirement: { type: 'hsk_level', count: 3 } },
    { id: 'bilingual', name: '🌍 Bilingual', nameVi: 'Song ngữ', desc: 'Learn 50+ words in both EN & CN', requirement: { type: 'bilingual', count: 50 } },
    { id: 'exam_pass', name: '📋 Exam Ready', nameVi: 'Sẵn sàng thi', desc: 'Pass a mock exam', requirement: { type: 'exam_passed', count: 1 } },
];

function loadXPData() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return {
        totalXP: 0,
        todayXP: 0,
        todayDate: new Date().toDateString(),
        streak: 0,
        lastActiveDate: null,
        weeklyGoal: 100,
        studyMinutes: 0,
        activities: { words_learned: 0, perfect_quizzes: 0, listening_done: 0, speaking_done: 0, reading_done: 0, writing_done: 0, exam_passed: 0 },
        unlockedBadges: [],
        xpHistory: [], // [{ date, xp }]
    };
}

function saveXPData(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* ignore */ }
}

// Award XP and check for streak/badge updates
export function awardXP(activityType, count = 1) {
    const data = loadXPData();
    const today = new Date().toDateString();

    // Reset today XP if new day
    if (data.todayDate !== today) {
        data.todayXP = 0;
        data.todayDate = today;

        // Update streak
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (data.lastActiveDate === yesterday) {
            data.streak += 1;
        } else if (data.lastActiveDate !== today) {
            data.streak = 1;
        }
    }
    data.lastActiveDate = today;

    // Calculate XP
    const baseXP = (XP_TABLE[activityType] || 5) * count;
    const streakMultiplier = data.streak >= 7 ? 1.5 : data.streak >= 3 ? 1.2 : 1;
    const earnedXP = Math.round(baseXP * streakMultiplier);

    data.totalXP += earnedXP;
    data.todayXP += earnedXP;

    // Update activity counts
    const activityMap = {
        vocab_learn: 'words_learned', vocab_review: 'words_learned',
        quiz_perfect: 'perfect_quizzes', listening_complete: 'listening_done',
        speaking_complete: 'speaking_done', reading_complete: 'reading_done',
        writing_submit: 'writing_done', exam_complete: 'exam_passed',
    };
    if (activityMap[activityType]) {
        data.activities[activityMap[activityType]] = (data.activities[activityMap[activityType]] || 0) + count;
    }

    // XP history (keep last 30 days)
    const existing = data.xpHistory.find(h => h.date === today);
    if (existing) existing.xp += earnedXP;
    else data.xpHistory.push({ date: today, xp: earnedXP });
    if (data.xpHistory.length > 30) data.xpHistory.shift();

    // Check new badges
    const newBadges = checkNewBadges(data);

    saveXPData(data);
    return { earnedXP, totalXP: data.totalXP, level: getLevel(data.totalXP), newBadges, streak: data.streak };
}

function checkNewBadges(data) {
    const newlyUnlocked = [];
    const level = getLevel(data.totalXP);

    for (const badge of BADGES) {
        if (data.unlockedBadges.includes(badge.id)) continue;

        let met = false;
        const req = badge.requirement;
        switch (req.type) {
            case 'words_learned': met = (data.activities.words_learned || 0) >= req.count; break;
            case 'streak': met = data.streak >= req.count; break;
            case 'perfect_quizzes': met = (data.activities.perfect_quizzes || 0) >= req.count; break;
            case 'listening_done': met = (data.activities.listening_done || 0) >= req.count; break;
            case 'speaking_done': met = (data.activities.speaking_done || 0) >= req.count; break;
            case 'reading_done': met = (data.activities.reading_done || 0) >= req.count; break;
            case 'writing_done': met = (data.activities.writing_done || 0) >= req.count; break;
            case 'level': met = level >= req.count; break;
            case 'exam_passed': met = (data.activities.exam_passed || 0) >= req.count; break;
            default: break;
        }
        if (met) {
            data.unlockedBadges.push(badge.id);
            newlyUnlocked.push(badge);
        }
    }
    return newlyUnlocked;
}

export function getLevel(totalXP) {
    for (let i = 0; i < LEVEL_XP.length; i++) {
        if (totalXP < LEVEL_XP[i]) return i + 1;
    }
    return 50;
}

export function getLevelProgress(totalXP) {
    const level = getLevel(totalXP);
    const prevThreshold = level > 1 ? LEVEL_XP[level - 2] : 0;
    const nextThreshold = LEVEL_XP[level - 1];
    const progress = totalXP - prevThreshold;
    const needed = nextThreshold - prevThreshold;
    return { level, progress, needed, percentage: Math.min(100, Math.round((progress / needed) * 100)) };
}

export function getXPData() {
    const data = loadXPData();
    const today = new Date().toDateString();
    if (data.todayDate !== today) { data.todayXP = 0; data.todayDate = today; }
    return {
        ...data,
        level: getLevel(data.totalXP),
        levelProgress: getLevelProgress(data.totalXP),
    };
}

export function getUnlockedBadges() {
    const data = loadXPData();
    return BADGES.filter(b => data.unlockedBadges.includes(b.id));
}

export function getAllBadges() {
    const data = loadXPData();
    return BADGES.map(b => ({ ...b, unlocked: data.unlockedBadges.includes(b.id) }));
}

export { BADGES, XP_TABLE };

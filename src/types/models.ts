export interface Word {
    word: string;
    emoji: string;
    vietnamese: string;
    example: string;
    exampleVi: string;
    pinyin?: string;       // For Chinese
    pinyinTones?: string;  // For Chinese tones
    titleCn?: string;      // Meaning in Vietnamese for Chinese word
}

export interface Topic {
    id: string;
    title: string;
    emoji: string;
    color: string;
    mode?: 'adult' | 'kid';
    words: Word[];
}

export interface SkillProgress {
    completedLessons: number;
    score: number;
    lastPracticed?: string; // ISO date string
}

export interface UserProgress {
    listening: SkillProgress;
    speaking: SkillProgress;
    reading: SkillProgress;
    writing: SkillProgress;
    grammar: SkillProgress;
    vocabulary: SkillProgress;
    exam: SkillProgress;
}

export interface GamificationState {
    coins: number;
    streak: number;
    lastActiveDate?: string; // ISO date string
    unlockedItems: string[]; // Items bought with coins
    unlockedTopics: string[]; // Progression based
    stars: number;
}

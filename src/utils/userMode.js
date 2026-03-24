// userMode.js — Dual mode support: Kids vs Adult
// Kids: ages 6-9, playful UI, short SM-2 intervals, generous scoring
// Adult: professional UI, standard SM-2, business/travel content

export const USER_MODES = {
    KIDS: 'kids',
    ADULT: 'adult',
};

// Mode-aware configuration
export const MODE_CONFIG = {
    kids: {
        label: 'Chế độ Bé',
        labelToggle: '🧒 Bé',
        dailyGoal: 10,
        sm2MaxInterval: 60,        // days
        sm2EaseMin: 1.3,
        scoreThresholds: { perfect: 90, great: 75, good: 60, needsWork: 40, struggling: 20 },
        celebrationType: 'full',    // confetti, fireworks, etc.
        showMascot: true,
        showClouds: true,
        fontDisplay: "'Fredoka', sans-serif",
        fontBody: "'Nunito', sans-serif",
        greeting: (name) => `${name || 'bạn nhỏ'}`,
        topicFilter: 'kids',       // show only kids topics
    },
    adult: {
        label: 'Chế độ Người lớn',
        labelToggle: '🧑 Người lớn',
        dailyGoal: 20,
        sm2MaxInterval: 365,       // days
        sm2EaseMin: 1.3,
        scoreThresholds: { perfect: 95, great: 85, good: 70, needsWork: 50, struggling: 30 },
        celebrationType: 'subtle',  // checkmark, gentle sound
        showMascot: false,
        showClouds: false,
        fontDisplay: "'Inter', sans-serif",
        fontBody: "'Inter', sans-serif",
        greeting: (name) => `${name || 'bạn'}`,
        topicFilter: 'all',        // show all topics including kids basics + adult
    },
};

export function getModeConfig(mode) {
    return MODE_CONFIG[mode] || MODE_CONFIG.kids;
}

export function isAdultMode(mode) {
    return mode === USER_MODES.ADULT;
}

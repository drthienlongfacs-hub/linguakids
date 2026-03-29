// voicePersonalities.js — Voice Personality System for LinguaKids
// 6 distinct voice types × 3 accents with platform-specific voice mapping
// RCA: Previous system showed "System default" because voice hints didn't match
// actual Android/iOS/Desktop voice names.

// ================================================================
// PLATFORM-SPECIFIC VOICE DATABASE
// Sourced from: github.com/HadrienGardeur/web-speech-recommended-voices
// Verified on Chrome Android, iOS Safari, macOS Chrome/Safari
// ================================================================

export const VOICE_DB = {
    // Chrome Android (Google TTS engine)
    android: {
        'en-US': {
            female: ['Google US English', 'Google US English Female'],
            male: ['Google US English Male'],
        },
        'en-GB': {
            female: ['Google UK English Female'],
            male: ['Google UK English Male'],
        },
        'en-AU': {
            female: ['Google Australian English Female', 'Google Australian English'],
            male: ['Google Australian English Male'],
        },
    },
    // iOS Safari (Apple voices)
    ios: {
        'en-US': {
            female: ['Samantha', 'Allison', 'Ava', 'Susan', 'Zoe', 'Nicky'],
            male: ['Aaron', 'Fred', 'Tom'],
        },
        'en-GB': {
            female: ['Serena', 'Kate', 'Fiona', 'Martha'],
            male: ['Daniel', 'Arthur', 'Oliver'],
        },
        'en-AU': {
            female: ['Karen', 'Catherine', 'Lee'],
            male: ['Gordon', 'James'],
        },
    },
    // macOS (Apple voices — shared with Safari desktop)
    macos: {
        'en-US': {
            female: ['Samantha', 'Allison', 'Ava', 'Victoria', 'Zoe', 'Susan'],
            male: ['Alex', 'Tom', 'Fred'],
        },
        'en-GB': {
            female: ['Kate', 'Serena', 'Fiona', 'Martha'],
            male: ['Daniel', 'Oliver', 'Arthur'],
        },
        'en-AU': {
            female: ['Karen', 'Catherine', 'Lee'],
            male: ['Gordon', 'James'],
        },
    },
    // Windows (Microsoft voices)
    windows: {
        'en-US': {
            female: ['Microsoft Aria', 'Microsoft Jenny', 'Microsoft Zira'],
            male: ['Microsoft Mark', 'Microsoft David', 'Microsoft Guy'],
        },
        'en-GB': {
            female: ['Microsoft Hazel', 'Microsoft Libby'],
            male: ['Microsoft Ryan'],
        },
        'en-AU': {
            female: ['Microsoft Natasha'],
            male: ['Microsoft William'],
        },
    },
};

// ================================================================
// 6 VOICE PERSONALITIES
// Each has distinct pitch, rate, and gender preference to create
// truly different listening experiences
// ================================================================

export const VOICE_PERSONALITIES = [
    {
        id: 'broadcast',
        emoji: '🎬',
        label: 'Broadcast',
        labelVi: 'MC Truyền hình',
        description: 'Clear, authoritative news anchor voice',
        descriptionVi: 'Giọng MC truyền hình, rõ ràng, truyền cảm',
        gender: 'male',
        // RCA-040v2: 3-axis differentiation
        // Rate = PRIMARY differentiator (most audible)
        // Pitch = SECONDARY (moderate, Android-safe 0.95-1.10)
        // Volume = TERTIARY (warmth vs projection)
        pitch: 0.97,     // slightly low = authoritative
        rate: 0.90,       // measured, deliberate pace
        volume: 1.0,      // full projection
        color: '#3B82F6',
    },
    {
        id: 'natural',
        emoji: '🌟',
        label: 'Natural',
        labelVi: 'Tự nhiên',
        description: 'Warm, conversational, everyday speech',
        descriptionVi: 'Giọng nữ ấm áp, giao tiếp hàng ngày',
        gender: 'female',
        pitch: 1.03,      // warm, friendly
        rate: 0.93,       // comfortable conversational
        volume: 0.90,     // intimate, not shouting
        color: '#10B981',
    },
    {
        id: 'energetic',
        emoji: '⚡',
        label: 'Energetic',
        labelVi: 'Năng động',
        description: 'Young, dynamic, podcast presenter style',
        descriptionVi: 'Trẻ trung, năng động, kiểu podcast',
        gender: 'female',
        pitch: 1.08,      // bright, youthful
        rate: 1.15,       // FAST — most distinctive trait
        volume: 1.0,      // energetic projection
        color: '#F59E0B',
    },
    {
        id: 'dramatic',
        emoji: '🎭',
        label: 'Dramatic',
        labelVi: 'Trầm ấm',
        description: 'Deep, expressive, audiobook narrator',
        descriptionVi: 'Giọng nam trầm ấm, như đọc truyện',
        gender: 'male',
        pitch: 0.95,      // low end of safe range
        rate: 0.72,       // VERY SLOW — audiobook pace, most distinctive
        volume: 0.85,     // intimate narration
        color: '#8B5CF6',
    },
    {
        id: 'premium',
        emoji: '💎',
        label: 'Premium',
        labelVi: 'Sang trọng',
        description: 'Refined, elegant, diplomatic speaker',
        descriptionVi: 'Giọng nữ sang trọng, lịch thiệp',
        gender: 'female',
        pitch: 1.0,       // neutral, polished
        rate: 0.82,       // slow, measured, deliberate
        volume: 0.88,     // composed, not loud
        color: '#EC4899',
    },
    {
        id: 'dynamic',
        emoji: '🔥',
        label: 'Dynamic',
        labelVi: 'TED Talk',
        description: 'Engaging TED Talk presenter, motivational',
        descriptionVi: 'Giọng thuyết giảng cuốn hút kiểu TED',
        gender: 'male',
        pitch: 1.05,      // confident, upbeat
        rate: 1.05,       // brisk, engaging pace
        volume: 1.0,      // strong projection
        color: '#EF4444',
    },
];

// ================================================================
// ACCENT PROFILES (upgraded with platform-aware voice mapping)
// ================================================================

export const ACCENT_PROFILES = [
    {
        id: 'us',
        label: 'American',
        flag: '🇺🇸',
        lang: 'en-US',
        color: '#3B82F6',
        description: 'Standard American English',
        descriptionVi: 'Tiếng Anh Mỹ chuẩn',
    },
    {
        id: 'uk',
        label: 'British',
        flag: '🇬🇧',
        lang: 'en-GB',
        color: '#EF4444',
        description: 'Received Pronunciation (RP)',
        descriptionVi: 'Giọng Anh chuẩn RP',
    },
    {
        id: 'au',
        label: 'Australian',
        flag: '🇦🇺',
        lang: 'en-AU',
        color: '#F59E0B',
        description: 'General Australian English',
        descriptionVi: 'Giọng Anh Úc phổ thông',
    },
];

// ================================================================
// PLATFORM DETECTION
// ================================================================

export function detectPlatform() {
    if (typeof navigator === 'undefined') return 'unknown';
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (/Mac/.test(navigator.platform)) return 'macos';
    if (/Win/.test(navigator.platform)) return 'windows';
    return 'unknown';
}

// ================================================================
// SMART VOICE FINDER
// Matches the best voice for a given accent + personality combo
// Priority: exact name match > gender match > lang match > any English
// ================================================================

export function findPersonalityVoice(voices, accentId, personalityId) {
    if (!voices || voices.length === 0) return null;

    const accent = ACCENT_PROFILES.find(a => a.id === accentId);
    const personality = VOICE_PERSONALITIES.find(p => p.id === personalityId);
    if (!accent) return null;

    const platform = detectPlatform();
    const lang = accent.lang;
    const gender = personality?.gender || 'female';

    // 1. Try platform-specific voice names (highest quality match)
    const platformDB = VOICE_DB[platform];
    if (platformDB && platformDB[lang]) {
        const candidates = platformDB[lang][gender] || [];
        for (const name of candidates) {
            const match = voices.find(v => v.name.includes(name));
            if (match) return match;
        }
        // Try opposite gender on same platform
        const altGender = gender === 'male' ? 'female' : 'male';
        const altCandidates = platformDB[lang][altGender] || [];
        for (const name of altCandidates) {
            const match = voices.find(v => v.name.includes(name));
            if (match) return match;
        }
    }

    // 2. Try all platforms' voice names (cross-platform fallback)
    for (const plat of Object.values(VOICE_DB)) {
        if (plat[lang]) {
            const candidates = [...(plat[lang][gender] || []), ...(plat[lang][gender === 'male' ? 'female' : 'male'] || [])];
            for (const name of candidates) {
                const match = voices.find(v => v.name.includes(name));
                if (match) return match;
            }
        }
    }

    // 3. Language match — prefer enhanced/premium/natural voices
    const langBase = lang.split('-')[0];
    const langRegion = lang.split('-')[1];
    const langVoices = voices.filter(v => v.lang === lang || (v.lang.startsWith(langBase) && v.lang.includes(langRegion)));

    const enhanced = langVoices.find(v =>
        v.name.toLowerCase().includes('enhanced') ||
        v.name.toLowerCase().includes('premium') ||
        v.name.toLowerCase().includes('natural')
    );
    if (enhanced) return enhanced;

    // 4. Any voice for this specific locale
    if (langVoices.length > 0) return langVoices[0];

    // 5. Any English voice as last resort
    const anyEnglish = voices.filter(v => v.lang.startsWith('en'));
    const localEnglish = anyEnglish.find(v => v.localService);
    if (localEnglish) return localEnglish;

    return anyEnglish[0] || null;
}

// ================================================================
// APPLY PERSONALITY PROSODY
// Adds subtle randomization for human-like variation
// ================================================================

export function getPersonalityProsody(personalityId) {
    const p = VOICE_PERSONALITIES.find(v => v.id === personalityId);
    if (!p) return { pitch: 1.0, rate: 0.95, volume: 1.0 };

    const platform = detectPlatform();
    // RCA-040v2: On Android, pitch outside 0.93-1.12 causes distortion
    // Use rate as primary differentiator (0.72-1.15 = very audible)
    // Volume as secondary (0.80-1.0 = warmth vs projection)
    const isAndroid = (platform === 'android');

    // Minimal jitter — just enough to avoid robotic repetition
    const rateJitter = (Math.random() - 0.5) * 0.04; // ±0.02

    // Clamp pitch to platform-safe range
    const safePitch = isAndroid
        ? Math.max(0.95, Math.min(1.10, p.pitch))
        : Math.max(0.90, Math.min(1.15, p.pitch));

    return {
        pitch: safePitch,
        rate: Math.max(0.65, Math.min(1.3, p.rate + rateJitter)),
        volume: Math.max(0.7, Math.min(1.0, p.volume || 1.0)),
    };
}

// ================================================================
// DEFAULT PERSONALITY
// ================================================================

export const DEFAULT_PERSONALITY = 'natural';
export const DEFAULT_ACCENT = 'us';

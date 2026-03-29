// speakText.js — Centralized TTS utility for LinguaKids
// RCA-041: 17+ components were creating raw SpeechSynthesisUtterance
// without voice selection → system default voice (muffled/robotic)
//
// v2: Personality-aware — reads user's stored voice preference from Zustand
// and applies personality prosody + platform-specific voice selection.
// Falls back to basic voice selection if no preference is stored.

import {
    DEFAULT_ACCENT,
} from '../data/voicePersonalities.js';
import {
    applyVoiceProfileToUtterance,
    getStoredVoicePreferences,
    resolveVoiceProfile,
} from '../services/voicePreferenceService.js';

// ================================================================
// VOICE PREFERENCE LISTS — best quality first (fallback when no personality)
// ================================================================
const VOICE_PREFERENCES = {
    'en-US': [
        'Samantha', 'Aaron', 'Allison', 'Ava',
        'Google US English', 'Google US English Female', 'Google US English Male',
        'Microsoft Aria', 'Microsoft Jenny', 'Microsoft Mark',
    ],
    'en-GB': [
        'Daniel', 'Kate', 'Serena', 'Fiona',
        'Google UK English Female', 'Google UK English Male',
        'Microsoft Hazel', 'Microsoft Ryan',
    ],
    'en-AU': [
        'Karen', 'Lee', 'Gordon',
        'Google Australian English',
        'Microsoft Natasha', 'Microsoft William',
    ],
    'zh-CN': [
        'Ting-Ting', 'Mei-Jia', 'Sin-ji',
        'Google 普通话', 'Google 中文',
        'Microsoft Xiaoxiao', 'Microsoft Yunyang',
    ],
    'vi-VN': [
        'Linh', 'Google Tiếng Việt',
        'Microsoft HoaiMy',
    ],
};

// ================================================================
// VOICE CACHE — avoid searching every call
// ================================================================
let _voiceCache = {};
let _voicesLoaded = false;

function _ensureVoices() {
    if (!window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 && !_voicesLoaded) {
        _voicesLoaded = true;
        _voiceCache = {};
    }
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        _voicesLoaded = false;
        _voiceCache = {};
        _ensureVoices();
    });
    setTimeout(() => _ensureVoices(), 100);
    setTimeout(() => _ensureVoices(), 500);
    setTimeout(() => _ensureVoices(), 1500);
}

// ================================================================
// FIND BEST VOICE — personality-aware with fallback
// ================================================================
function findBestVoice(lang) {
    if (_voiceCache[lang]) return _voiceCache[lang];

    const voices = window.speechSynthesis?.getVoices() || [];
    if (voices.length === 0) return null;

    const profile = resolveVoiceProfile({
        langCode: lang,
        voices,
    });
    if (profile.voice) {
        _voiceCache[lang] = profile.voice;
        return profile.voice;
    }

    // Fallback: preference list matching
    const prefList = VOICE_PREFERENCES[lang] || [];
    for (const pref of prefList) {
        const found = voices.find(v =>
            v.name.includes(pref) && v.lang.startsWith(lang.split('-')[0])
        );
        if (found) {
            _voiceCache[lang] = found;
            return found;
        }
    }

    const langBase = lang.split('-')[0];
    const langVoices = voices.filter(v => v.lang.startsWith(langBase));

    const enhanced = langVoices.find(v =>
        v.name.toLowerCase().includes('enhanced') ||
        v.name.toLowerCase().includes('premium') ||
        v.name.toLowerCase().includes('natural')
    );
    if (enhanced) {
        _voiceCache[lang] = enhanced;
        return enhanced;
    }

    const local = langVoices.find(v => v.localService);
    if (local) {
        _voiceCache[lang] = local;
        return local;
    }

    const best = langVoices[0] || null;
    if (best) _voiceCache[lang] = best;
    return best;
}

// ================================================================
// MAIN API: speakText()
// Now personality-aware — applies stored voice + prosody automatically.
// Explicit options override stored prosody when provided.
// ================================================================

/**
 * Speak text with personality-aware voice selection
 * @param {string} text - Text to speak
 * @param {object} options - Options
 * @param {string} options.lang - Language code (default: 'en-US')
 * @param {number} options.rate - Speed override (uses personality rate if not provided)
 * @param {number} options.pitch - Pitch override (uses personality pitch if not provided)
 * @param {number} options.volume - Volume override (uses personality volume if not provided)
 * @param {function} options.onEnd - Callback when speech ends
 * @param {boolean} options.skipPersonality - Force basic voice selection
 */
export function speakText(text, options = {}) {
    if (!window.speechSynthesis || !text) return;

    const lang = options.lang || 'en-US';
    const profile = options.skipPersonality
        ? {
            voice: findBestVoice(lang),
            prosody: { pitch: 1.0, rate: 0.88, volume: 1.0 },
        }
        : resolveVoiceProfile({
            langCode: lang,
            voices: window.speechSynthesis.getVoices(),
        });

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    applyVoiceProfileToUtterance(utterance, profile, {
        langCode: lang,
        rate: options.rate,
        pitch: options.pitch,
        volume: options.volume,
    });

    if (options.onEnd) {
        utterance.onend = options.onEnd;
    }

    setTimeout(() => {
        try {
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('speakText failed:', e);
        }
    }, 50);
}

/**
 * Quick English speak — now personality-aware
 */
export function speakEnglish(text, rate) {
    const prefs = getStoredVoicePreferences();
    const accentId = prefs?.accent || DEFAULT_ACCENT;
    const lang = resolveVoiceProfile({
        accentId,
    }).accentProfile?.lang || 'en-US';
    speakText(text, { lang, ...(typeof rate === 'number' ? { rate } : {}) });
}

/**
 * Quick Chinese speak
 */
export function speakChinese(text, rate = 0.8) {
    speakText(text, { lang: 'zh-CN', rate });
}

/**
 * Invalidate voice cache — call when user changes voice preferences
 */
export function invalidateVoiceCache() {
    _voiceCache = {};
}

export default speakText;

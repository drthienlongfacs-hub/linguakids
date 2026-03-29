// speakText.js — Centralized TTS utility for LinguaKids
// RCA-041: 17+ components were creating raw SpeechSynthesisUtterance
// without voice selection → system default voice (muffled/robotic)
//
// This module provides a single speakText() function that:
// 1. Selects the BEST available voice for the language
// 2. Prefers Enhanced/Premium/Local voices for clarity
// 3. Caches the voice selection for performance
// 4. Applies sensible rate/pitch defaults
// 5. Works outside React (no hooks needed)

// ================================================================
// VOICE PREFERENCE LISTS — best quality first
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
        _voiceCache = {}; // reset cache when voices change
    }
}

// Listen for voice changes (async loading on some browsers)
if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.addEventListener?.('voiceschanged', () => {
        _voicesLoaded = false;
        _voiceCache = {};
        _ensureVoices();
    });
    // Initial load attempts
    setTimeout(() => _ensureVoices(), 100);
    setTimeout(() => _ensureVoices(), 500);
    setTimeout(() => _ensureVoices(), 1500);
}

// ================================================================
// FIND BEST VOICE — with preference list + quality ranking
// ================================================================
function findBestVoice(lang) {
    // Check cache first
    if (_voiceCache[lang]) return _voiceCache[lang];

    const voices = window.speechSynthesis?.getVoices() || [];
    if (voices.length === 0) return null;

    const prefs = VOICE_PREFERENCES[lang] || [];

    // 1. Try preferred voices by name
    for (const pref of prefs) {
        const found = voices.find(v =>
            v.name.includes(pref) && v.lang.startsWith(lang.split('-')[0])
        );
        if (found) {
            _voiceCache[lang] = found;
            return found;
        }
    }

    // 2. Try any voice for this language
    const langBase = lang.split('-')[0];
    const langVoices = voices.filter(v => v.lang.startsWith(langBase));

    // Prefer enhanced/premium/natural voices
    const enhanced = langVoices.find(v =>
        v.name.toLowerCase().includes('enhanced') ||
        v.name.toLowerCase().includes('premium') ||
        v.name.toLowerCase().includes('natural')
    );
    if (enhanced) {
        _voiceCache[lang] = enhanced;
        return enhanced;
    }

    // Prefer local voices (better quality, no network delay)
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
// Drop-in replacement for raw SpeechSynthesisUtterance patterns
// ================================================================

/**
 * Speak text with high-quality voice selection
 * @param {string} text - Text to speak
 * @param {object} options - Options
 * @param {string} options.lang - Language code (default: 'en-US')
 * @param {number} options.rate - Speed 0.1-2.0 (default: 0.88)
 * @param {number} options.pitch - Pitch 0.0-2.0 (default: 1.0)
 * @param {number} options.volume - Volume 0.0-1.0 (default: 1.0)
 * @param {function} options.onEnd - Callback when speech ends
 */
export function speakText(text, options = {}) {
    if (!window.speechSynthesis || !text) return;

    const lang = options.lang || 'en-US';
    const rate = options.rate ?? 0.88;
    const pitch = options.pitch ?? 1.0;
    const volume = options.volume ?? 1.0;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Apply high-quality voice
    const voice = findBestVoice(lang);
    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang; // Use voice's exact lang for best results
    } else {
        utterance.lang = lang;
    }

    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    if (options.onEnd) {
        utterance.onend = options.onEnd;
    }

    // Small delay after cancel to prevent iOS Safari glitch
    setTimeout(() => {
        try {
            window.speechSynthesis.speak(utterance);
        } catch (e) {
            console.warn('speakText failed:', e);
        }
    }, 50);
}

/**
 * Quick English speak (most common use case)
 */
export function speakEnglish(text, rate = 0.85) {
    speakText(text, { lang: 'en-US', rate });
}

/**
 * Quick Chinese speak
 */
export function speakChinese(text, rate = 0.8) {
    speakText(text, { lang: 'zh-CN', rate });
}

export default speakText;

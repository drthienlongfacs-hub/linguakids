import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const repoRoot = new URL('..', import.meta.url).pathname;

const fileChecks = [
    'src/data/voicePersonalities.js',
    'src/services/voicePreferenceService.js',
    'src/utils/speakText.js',
    'src/hooks/useSpeech.js',
    'src/pages/Settings.jsx',
    'src/modules/listening/ListeningPlayer.jsx',
    'src/modules/listening/DictationExercise.jsx',
    'src/modules/speaking/SpeakingExercise.jsx',
    'src/modules/speaking/ShadowingEngine.jsx',
    'src/store/useGameStore.ts',
    'docs/voice-runtime-sot.md',
];

const requiredPatterns = [
    {
        file: 'src/services/voicePreferenceService.js',
        pattern: /resolveVoiceProfile/,
        message: 'voicePreferenceService must expose resolveVoiceProfile.',
    },
    {
        file: 'src/utils/speakText.js',
        pattern: /voicePreferenceService/,
        message: 'speakText must consume the shared voice preference service.',
    },
    {
        file: 'src/hooks/useSpeech.js',
        pattern: /getStoredVoicePreferences/,
        message: 'useSpeech must consume the shared voice preference service.',
    },
    {
        file: 'src/modules/listening\/ListeningPlayer.jsx',
        pattern: /applyVoiceProfileToUtterance|resolveVoiceProfile/,
        message: 'ListeningPlayer must apply the shared voice profile.',
    },
    {
        file: 'src/pages/Settings.jsx',
        pattern: /previewVoicePreference/,
        message: 'Settings preview must use the shared voice runtime service.',
    },
    {
        file: 'src/store/useGameStore.ts',
        pattern: /preferredAccent|preferredPersonality|setVoicePreferences/,
        message: 'Store must persist voice preferences.',
    },
];

const forbiddenPatterns = [
    {
        file: 'src/hooks/useSpeech.js',
        pattern: /localStorage\.getItem\('linguakids_state_z'\)/,
        message: 'useSpeech must not parse localStorage directly for voice preferences.',
    },
    {
        file: 'src/modules/listening/ListeningPlayer.jsx',
        pattern: /localStorage\.getItem\('linguakids_state_z'\)/,
        message: 'ListeningPlayer must not parse localStorage directly for voice preferences.',
    },
    {
        file: 'src/pages/Settings.jsx',
        pattern: /new SpeechSynthesisUtterance\(/,
        message: 'Settings voice preview must not bypass the shared runtime service.',
    },
];

async function readRelative(file) {
    return fs.readFile(path.join(repoRoot, file), 'utf8');
}

function createStorage(seed = {}) {
    const store = { ...seed };
    return {
        getItem(key) {
            return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
        },
        setItem(key, value) {
            store[key] = String(value);
        },
        removeItem(key) {
            delete store[key];
        },
    };
}

async function main() {
    const findings = [];
    const runtimeChecks = [];

    for (const file of fileChecks) {
        try {
            await fs.access(path.join(repoRoot, file));
        } catch (error) {
            findings.push({
                file,
                message: `Required file missing: ${error.code || error.message}`,
            });
        }
    }

    for (const rule of requiredPatterns) {
        try {
            const contents = await readRelative(rule.file);
            if (!rule.pattern.test(contents)) {
                findings.push({
                    file: rule.file,
                    message: rule.message,
                });
            }
        } catch (error) {
            findings.push({
                file: rule.file,
                message: `Could not inspect file: ${error.code || error.message}`,
            });
        }
    }

    for (const rule of forbiddenPatterns) {
        try {
            const contents = await readRelative(rule.file);
            if (rule.pattern.test(contents)) {
                findings.push({
                    file: rule.file,
                    message: rule.message,
                });
            }
        } catch (error) {
            findings.push({
                file: rule.file,
                message: `Could not inspect file: ${error.code || error.message}`,
            });
        }
    }

    try {
        const voiceRuntime = await import(`${pathToFileURL(path.join(repoRoot, 'src', 'services', 'voicePreferenceService.js')).href}?audit=${Date.now()}`);
        const storage = createStorage({
            linguakids_state_z: JSON.stringify({
                state: {
                    preferredAccent: 'uk',
                    preferredPersonality: 'premium',
                },
            }),
        });
        const prefs = voiceRuntime.getStoredVoicePreferences(storage);
        const enProfile = voiceRuntime.resolveVoiceProfile({
            langCode: 'en-GB',
            voices: [
                { name: 'Martha', lang: 'en-GB', localService: true },
                { name: 'Daniel', lang: 'en-GB', localService: true },
            ],
            storage,
        });
        const zhProfile = voiceRuntime.resolveVoiceProfile({
            langCode: 'zh-CN',
            voices: [
                { name: 'Ting-Ting', lang: 'zh-CN', localService: true },
                { name: 'Microsoft Xiaoxiao', lang: 'zh-CN', localService: true },
            ],
            storage,
        });

        const pass = prefs.accent === 'uk'
            && prefs.personality === 'premium'
            && !!enProfile.voice
            && !!zhProfile.voice
            && typeof enProfile.prosody.rate === 'number';

        runtimeChecks.push({
            name: 'voice_preference_roundtrip',
            pass,
            prefs,
            englishVoice: enProfile.voice?.name || null,
            chineseVoice: zhProfile.voice?.name || null,
            englishRate: enProfile.prosody.rate,
        });

        if (!pass) {
            findings.push({
                file: 'voice runtime integration',
                message: 'Voice preference round-trip failed.',
            });
        }
    } catch (error) {
        findings.push({
            file: 'voice runtime integration',
            message: error.message || String(error),
        });
        runtimeChecks.push({
            name: 'voice_preference_roundtrip',
            pass: false,
            error: error.message || String(error),
        });
    }

    const summary = {
        checks: fileChecks.length + requiredPatterns.length + forbiddenPatterns.length,
        findings: findings.length,
        pass: findings.length === 0,
    };

    console.log(JSON.stringify({ summary, runtimeChecks, findings }, null, 2));

    if (findings.length > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

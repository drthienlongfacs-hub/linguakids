import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
    ACCENT_PRACTICE_TOTAL,
    ACCENT_PREVIEW_TEXT,
    ACCENT_VOICE_PACK_CONFIG,
    PERSONALITY_PREVIEW_TEXT,
    PRACTICE_SENTENCES,
} from '../src/data/accentPracticeContent.js';

const execFileAsync = promisify(execFile);
const repoRoot = new URL('..', import.meta.url).pathname;
const outputRoot = path.join(repoRoot, 'public', 'audio', 'accent-voice-pack');
const manifestPath = path.join(repoRoot, 'public', 'data', 'audio-manifests', 'accent-practice.json');

function normalizeText(text) {
    return String(text || '')
        .replace(/\s+/g, ' ')
        .replace(/[“”]/g, '"')
        .trim();
}

function buildClipDefinitions() {
    return [
        { id: 'accent-preview', text: ACCENT_PREVIEW_TEXT },
        { id: 'personality-preview', text: PERSONALITY_PREVIEW_TEXT },
        ...PRACTICE_SENTENCES.slice(0, ACCENT_PRACTICE_TOTAL).map((sentence) => ({
            id: sentence.id,
            text: sentence.text,
        })),
    ];
}

async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

async function synthesizeClip({ voice, text, rate, pitch, volume, targetPath }) {
    await execFileAsync('python3', [
        '-m',
        'edge_tts',
        '--text',
        normalizeText(text),
        '--voice',
        voice,
        `--rate=${rate}`,
        `--pitch=${pitch}`,
        `--volume=${volume}`,
        '--write-media',
        targetPath,
    ]);
}

async function main() {
    const clipDefinitions = buildClipDefinitions();
    await ensureDir(outputRoot);
    await ensureDir(path.dirname(manifestPath));

    const manifest = {
        source: 'controlled_studio_voice_pack',
        engine: 'edge_tts',
        generatedAt: new Date().toISOString(),
        clips: {},
    };

    for (const [accentId, personalities] of Object.entries(ACCENT_VOICE_PACK_CONFIG)) {
        manifest.clips[accentId] = {};

        for (const [personalityId, config] of Object.entries(personalities)) {
            const accentDir = path.join(outputRoot, accentId, personalityId);
            await ensureDir(accentDir);

            const clipManifest = {};
            for (const clip of clipDefinitions) {
                const fileName = `${clip.id}.mp3`;
                const absoluteTarget = path.join(accentDir, fileName);
                const relativeTarget = path.posix.join('audio', 'accent-voice-pack', accentId, personalityId, fileName);
                await synthesizeClip({
                    voice: config.voice,
                    text: clip.text,
                    rate: config.rate || '+0%',
                    pitch: config.pitch || '+0Hz',
                    volume: config.volume || '+0%',
                    targetPath: absoluteTarget,
                });
                clipManifest[clip.id] = relativeTarget;
            }

            manifest.clips[accentId][personalityId] = {
                voice: config.voice,
                voiceLabel: config.voiceLabel,
                rate: config.rate || '+0%',
                pitch: config.pitch || '+0Hz',
                volume: config.volume || '+0%',
                clips: clipManifest,
            };
        }
    }

    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log('Accent practice studio audio generation complete.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

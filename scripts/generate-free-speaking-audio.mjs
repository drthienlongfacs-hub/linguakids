import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { buildFreeSpeakingAudioBlueprint } from '../src/data/freeSpeakingCoachAudioContent.js';

const execFileAsync = promisify(execFile);
const repoRoot = new URL('..', import.meta.url).pathname;
const outputRoot = path.join(repoRoot, 'public', 'audio', 'free-speaking-coach');
const manifestPath = path.join(repoRoot, 'public', 'data', 'audio-manifests', 'free-speaking-coach.json');

function normalizeText(text) {
    return String(text || '')
        .replace(/\s+/g, ' ')
        .replace(/[“”]/g, '"')
        .trim();
}

function safeFileName(fileName) {
    return String(fileName || '')
        .replace(/[^a-z0-9_-]+/gi, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
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
    const blueprint = buildFreeSpeakingAudioBlueprint();
    await ensureDir(outputRoot);
    await ensureDir(path.dirname(manifestPath));

    const manifest = {
        source: 'controlled_free_speaking_coach_pack',
        engine: 'edge_tts',
        generatedAt: new Date().toISOString(),
        clips: {},
    };

    for (const scenario of blueprint) {
        const config = scenario.voice;
        if (!config?.voice) {
            throw new Error(`missing_voice_config:${scenario.scenarioId}`);
        }

        const scenarioDir = path.join(outputRoot, scenario.scenarioId);
        await ensureDir(scenarioDir);

        const clipManifest = {};
        for (const clip of scenario.clips) {
            const fileName = `${safeFileName(clip.id)}.mp3`;
            const absoluteTarget = path.join(scenarioDir, fileName);
            const relativeTarget = path.posix.join('audio', 'free-speaking-coach', scenario.scenarioId, fileName);
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

        manifest.clips[scenario.scenarioId] = {
            lang: scenario.lang,
            voice: config.voice,
            voiceLabel: config.voiceLabel,
            speakerKey: config.speakerKey || config.voice,
            variantMode: config.variantMode || 'distinct_speaker',
            rate: config.rate || '+0%',
            pitch: config.pitch || '+0Hz',
            volume: config.volume || '+0%',
            clipCount: scenario.clips.length,
            clips: clipManifest,
        };
    }

    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log('Free speaking coach audio generation complete.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

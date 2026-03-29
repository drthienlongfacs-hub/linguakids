import fs from 'node:fs/promises';
import path from 'node:path';
import { buildFreeSpeakingAudioBlueprint } from '../src/data/freeSpeakingCoachAudioContent.js';
import { SPEAKING_UI_CONTRAST_AUDIT } from '../src/data/speakingUiTheme.js';

const repoRoot = new URL('..', import.meta.url).pathname;
const manifestPath = path.join(repoRoot, 'public', 'data', 'audio-manifests', 'free-speaking-coach.json');
const qaPath = path.join(repoRoot, 'public', 'data', 'audio-manifests', 'free-speaking-coach.qa.json');
const sourceFiles = [
    path.join(repoRoot, 'src', 'pages', 'FreeSpeakingCoach.jsx'),
    path.join(repoRoot, 'src', 'components', 'SpeakingCoachPanel.jsx'),
    path.join(repoRoot, 'src', 'components', 'ManualTranscriptFallback.jsx'),
    path.join(repoRoot, 'src', 'components', 'CapabilityNotice.jsx'),
];
const forbiddenSurfacePattern = /background\s*:\s*['"`][^'"`]*(?:rgba\(\s*255\s*,\s*255\s*,\s*255|#fff(?:fff)?)/gi;

function hexToRgb(hex) {
    const normalized = String(hex || '').replace('#', '').trim();
    const expanded = normalized.length === 3
        ? normalized.split('').map((char) => `${char}${char}`).join('')
        : normalized;
    const value = Number.parseInt(expanded, 16);
    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
}

function channelToLinear(channel) {
    const normalized = channel / 255;
    return normalized <= 0.03928
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return (0.2126 * channelToLinear(r)) + (0.7152 * channelToLinear(g)) + (0.0722 * channelToLinear(b));
}

function contrastRatio(foreground, background) {
    const fg = luminance(foreground);
    const bg = luminance(background);
    const lighter = Math.max(fg, bg);
    const darker = Math.min(fg, bg);
    return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

async function main() {
    const blueprint = buildFreeSpeakingAudioBlueprint();
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const sourceMatches = [];
    const scenarioSummaries = {};
    let missingFiles = 0;
    let zeroByteFiles = 0;
    let clipCount = 0;

    for (const filePath of sourceFiles) {
        const contents = await fs.readFile(filePath, 'utf8');
        const matches = [...contents.matchAll(forbiddenSurfacePattern)].map((match) => match[0]);
        if (matches.length > 0) {
            sourceMatches.push({
                file: path.relative(repoRoot, filePath),
                matches,
            });
        }
    }

    for (const scenario of blueprint) {
        const entry = manifest?.clips?.[scenario.scenarioId];
        const scenarioResult = {
            clipCount: scenario.clips.length,
            missingClipIds: [],
            zeroByteClipIds: [],
        };

        for (const clip of scenario.clips) {
            clipCount += 1;
            const relativePath = entry?.clips?.[clip.id];
            if (!relativePath) {
                missingFiles += 1;
                scenarioResult.missingClipIds.push(clip.id);
                continue;
            }

            const absolutePath = path.join(repoRoot, 'public', relativePath);
            try {
                const stats = await fs.stat(absolutePath);
                if (stats.size <= 0) {
                    zeroByteFiles += 1;
                    scenarioResult.zeroByteClipIds.push(clip.id);
                }
            } catch {
                missingFiles += 1;
                scenarioResult.missingClipIds.push(clip.id);
            }
        }

        scenarioSummaries[scenario.scenarioId] = scenarioResult;
    }

    const contrast = SPEAKING_UI_CONTRAST_AUDIT.map((pair) => {
        const ratio = contrastRatio(pair.foreground, pair.background);
        return {
            ...pair,
            ratio,
            pass: ratio >= pair.min,
        };
    });

    const contrastFailures = contrast.filter((pair) => !pair.pass);
    const qa = {
        generatedAt: new Date().toISOString(),
        sourceManifest: 'free-speaking-coach.json',
        summary: {
            scenarioCount: blueprint.length,
            clipCount,
            missingFiles,
            zeroByteFiles,
            forbiddenLightSurfaceMatches: sourceMatches.reduce((sum, item) => sum + item.matches.length, 0),
            contrastFailures: contrastFailures.length,
            strictModulePass: missingFiles === 0
                && zeroByteFiles === 0
                && contrastFailures.length === 0
                && sourceMatches.length === 0,
        },
        scenarios: scenarioSummaries,
        contrast,
        sourceMatches,
    };

    await fs.writeFile(qaPath, `${JSON.stringify(qa, null, 2)}\n`);
    console.log(JSON.stringify(qa.summary, null, 2));

    if (!qa.summary.strictModulePass) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const repoRoot = new URL('..', import.meta.url).pathname;
const manifestPath = path.join(repoRoot, 'public', 'data', 'audio-manifests', 'accent-practice.json');
const qaPath = path.join(repoRoot, 'public', 'data', 'audio-manifests', 'accent-practice.qa.json');

function hashFile(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

async function main() {
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const accentSummaries = {};
    const allEntries = [];
    const globalPreviewHashes = new Set();
    let missingFiles = 0;

    for (const [accentId, personalities] of Object.entries(manifest.clips || {})) {
        const previewHashes = new Set();
        const speakerKeys = new Set();
        const entries = [];

        for (const [personalityId, entry] of Object.entries(personalities || {})) {
            speakerKeys.add(entry.speakerKey || entry.voice);
            const clipIds = Object.keys(entry.clips || {});
            const previewRelative = entry.clips?.['personality-preview'];
            const previewAbsolute = previewRelative ? path.join(repoRoot, 'public', previewRelative) : null;
            let previewHash = null;

            if (previewAbsolute) {
                try {
                    const previewBuffer = await fs.readFile(previewAbsolute);
                    previewHash = hashFile(previewBuffer);
                    previewHashes.add(previewHash);
                    globalPreviewHashes.add(previewHash);
                } catch {
                    missingFiles += 1;
                }
            }

            for (const relativePath of Object.values(entry.clips || {})) {
                try {
                    await fs.access(path.join(repoRoot, 'public', relativePath));
                } catch {
                    missingFiles += 1;
                }
            }

            const variantMode = entry.variantMode || 'unknown';
            entries.push({
                accentId,
                personalityId,
                voice: entry.voice,
                voiceLabel: entry.voiceLabel,
                speakerKey: entry.speakerKey || entry.voice,
                variantMode,
                clipCount: clipIds.length,
                previewHash,
            });
            allEntries.push({
                accentId,
                personalityId,
                voice: entry.voice,
                speakerKey: entry.speakerKey || entry.voice,
                variantMode,
            });
        }

        accentSummaries[accentId] = {
            presetCount: entries.length,
            distinctSpeakerCount: speakerKeys.size,
            distinctPreviewCount: previewHashes.size,
            variantModes: entries.reduce((acc, entry) => {
                acc[entry.variantMode] = (acc[entry.variantMode] || 0) + 1;
                return acc;
            }, {}),
            entries,
        };
    }

    const qa = {
        generatedAt: new Date().toISOString(),
        sourceManifest: 'accent-practice.json',
        summary: {
            presetCount: allEntries.length,
            distinctSpeakerCount: new Set(allEntries.map((entry) => entry.speakerKey)).size,
            distinctPreviewCount: globalPreviewHashes.size,
            missingFiles,
            strict18DistinctSpeakers: new Set(allEntries.map((entry) => entry.speakerKey)).size >= 18,
        },
        accents: accentSummaries,
    };

    await fs.writeFile(qaPath, `${JSON.stringify(qa, null, 2)}\n`);
    console.log(JSON.stringify(qa.summary, null, 2));

    if (missingFiles > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

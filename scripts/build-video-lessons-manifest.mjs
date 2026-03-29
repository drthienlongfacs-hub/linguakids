import fs from 'node:fs/promises';

import {
    buildBaseQa,
    buildVideoLessonManifest,
    readJson,
    videoLessonApprovedSourcesPath,
    videoLessonCatalogPath,
    videoLessonManifestPath,
    videoLessonQaPath,
    writeJson,
} from './lib/videoLessonManifestShared.mjs';

async function readExistingQaIfCompatible(version) {
    try {
        const existing = JSON.parse(await fs.readFile(videoLessonQaPath, 'utf8'));
        if (existing?.version === version) {
            return existing;
        }
        return null;
    } catch {
        return null;
    }
}

async function main() {
    const catalog = await readJson(videoLessonCatalogPath);
    const approvedSources = await readJson(videoLessonApprovedSourcesPath);
    const manifest = buildVideoLessonManifest(catalog, approvedSources);
    const baseQa = buildBaseQa(manifest, approvedSources);
    const existingQa = await readExistingQaIfCompatible(manifest.version);

    const qa = existingQa
        ? {
            ...baseQa,
            audit: existingQa.audit || baseQa.audit,
            findings: Array.isArray(existingQa.findings) ? existingQa.findings : [],
            summary: {
                ...baseQa.summary,
                findings: existingQa?.summary?.findings ?? baseQa.summary.findings,
                pass: typeof existingQa?.summary?.pass === 'boolean' ? existingQa.summary.pass : baseQa.summary.pass,
            },
        }
        : baseQa;

    await writeJson(videoLessonManifestPath, manifest);
    await writeJson(videoLessonQaPath, qa);

    console.log(JSON.stringify({
        version: manifest.version,
        lessonCount: manifest.summary.lessonCount,
        publicLessonCount: manifest.summary.publicLessonCount,
        hiddenLessonCount: manifest.summary.hiddenLessonCount,
    }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

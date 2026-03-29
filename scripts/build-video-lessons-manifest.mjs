import fs from 'node:fs/promises';

import {
    buildBaseQa,
    buildVideoLessonManifest,
    readJson,
    videoLessonAlignmentQaPath,
    videoLessonApprovedSourcesPath,
    videoLessonCatalogPath,
    videoLessonManifestPath,
    videoLessonOpsPath,
    videoLessonQaPath,
    videoLessonReviewQueuePath,
    writeJson,
} from './lib/videoLessonManifestShared.mjs';
import {
    applyAutomatedTriage,
    buildOpsArtifact,
    buildReviewQueueArtifact,
    readOptionalJson,
} from './lib/videoLessonReviewOps.mjs';

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
    const alignmentQa = await readOptionalJson(videoLessonAlignmentQaPath, null);
    const triagedCatalog = applyAutomatedTriage(catalog, approvedSources, alignmentQa);
    const manifest = buildVideoLessonManifest(triagedCatalog, approvedSources);
    const baseQa = buildBaseQa(manifest, approvedSources);
    const existingQa = await readExistingQaIfCompatible(manifest.version);
    const reviewQueue = buildReviewQueueArtifact(triagedCatalog, manifest.version);
    const ops = buildOpsArtifact(triagedCatalog, manifest.version);

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
    await writeJson(videoLessonReviewQueuePath, reviewQueue);
    await writeJson(videoLessonOpsPath, ops);

    console.log(JSON.stringify({
        version: manifest.version,
        lessonCount: manifest.summary.lessonCount,
        publicLessonCount: manifest.summary.publicLessonCount,
        hiddenLessonCount: manifest.summary.hiddenLessonCount,
        candidateLessonCount: manifest.summary.candidateLessonCount,
        reviewQueueLessonCount: manifest.summary.reviewQueueLessonCount,
        blockedLessonCount: manifest.summary.blockedLessonCount,
    }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

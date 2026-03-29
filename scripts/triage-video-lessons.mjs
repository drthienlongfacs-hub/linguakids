import {
    readJson,
    videoLessonAlignmentQaPath,
    videoLessonApprovedSourcesPath,
    videoLessonCatalogPath,
    writeJson,
} from './lib/videoLessonManifestShared.mjs';
import {
    applyAutomatedTriage,
    readOptionalJson,
} from './lib/videoLessonReviewOps.mjs';

async function main() {
    const catalog = await readJson(videoLessonCatalogPath);
    const approvedSources = await readJson(videoLessonApprovedSourcesPath);
    const alignmentQa = await readOptionalJson(videoLessonAlignmentQaPath, null);
    const triagedCatalog = applyAutomatedTriage(catalog, approvedSources, alignmentQa);
    triagedCatalog.updatedAt = new Date().toISOString();

    await writeJson(videoLessonCatalogPath, triagedCatalog);

    const summary = {
        updatedAt: triagedCatalog.updatedAt,
        lessonCount: 0,
        statusCounts: {},
        decisionCounts: {
            green: 0,
            yellow: 0,
            red: 0,
        },
    };

    for (const level of triagedCatalog.levels) {
        for (const category of level.categories) {
            for (const lesson of category.lessons) {
                summary.lessonCount += 1;
                summary.statusCounts[lesson.status] = (summary.statusCounts[lesson.status] || 0) + 1;
                const decision = lesson?.sourceVerification?.autoDecision;
                if (decision && summary.decisionCounts[decision] !== undefined) {
                    summary.decisionCounts[decision] += 1;
                }
            }
        }
    }

    console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

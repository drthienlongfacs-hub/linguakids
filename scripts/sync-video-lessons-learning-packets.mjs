import {
    flattenLessons,
    normalizeCatalog,
    readJson,
    videoLessonApprovedSourcesPath,
    videoLessonCatalogPath,
    writeJson,
} from './lib/videoLessonManifestShared.mjs';

async function main() {
    const catalog = await readJson(videoLessonCatalogPath);
    const approvedSources = await readJson(videoLessonApprovedSourcesPath);
    const normalized = normalizeCatalog(catalog, approvedSources);

    const materializedCatalog = {
        schemaVersion: normalized.schemaVersion,
        updatedAt: new Date().toISOString(),
        policy: normalized.policy,
        levels: normalized.levels.map((level) => ({
            ...level,
            categories: level.categories.map((category) => ({
                ...category,
                lessons: category.lessons.map((lesson) => ({
                    ...lesson,
                    quiz: lesson.learningPacket.quiz.questions,
                })),
            })),
        })),
    };

    await writeJson(videoLessonCatalogPath, materializedCatalog);

    const flattened = flattenLessons(materializedCatalog.levels);
    console.log(JSON.stringify({
        updatedAt: materializedCatalog.updatedAt,
        lessonCount: flattened.length,
        publicLessonCount: flattened.filter((entry) => entry.lesson.status === 'public').length,
        questionCount: flattened.reduce((sum, entry) => sum + (entry.lesson.quiz?.length || 0), 0),
    }, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

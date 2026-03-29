import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
    ensureDir,
    repoRoot,
    videoLessonCatalogPath,
    writeJson,
} from './lib/videoLessonManifestShared.mjs';
import {
    buildLessonLearningPacketDefaults,
    buildLessonSourceVerificationDefaults,
} from './lib/videoLessonPedagogy.mjs';

function durationLabelToSeconds(label) {
    const normalized = String(label || '').trim();
    if (!normalized) return null;

    const parts = normalized.split(':').map((item) => Number.parseInt(item, 10));
    if (parts.some((part) => !Number.isFinite(part))) {
        return null;
    }

    if (parts.length === 2) {
        return (parts[0] * 60) + parts[1];
    }

    if (parts.length === 3) {
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }

    return null;
}

async function importModule(relativePath) {
    const absolutePath = path.join(repoRoot, relativePath);
    return import(`${pathToFileURL(absolutePath).href}?bootstrap=${Date.now()}`);
}

function buildLegacyBackup(youtubeId) {
    const watchUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    return [
        {
            kind: 'youtube_watch',
            label: 'Legacy YouTube reference',
            youtubeId,
            src: watchUrl,
        },
    ];
}

function buildLesson(level, category, lesson, order) {
    const youtubeId = String(lesson.youtubeId || '').trim();
    const watchUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null;

    const sourceVerification = buildLessonSourceVerificationDefaults(lesson, category, level);
    const learningPacket = buildLessonLearningPacketDefaults(lesson, category, level, category.videos);

    return {
        id: lesson.id,
        title: lesson.title,
        titleVi: lesson.titleVi,
        channel: lesson.channel || null,
        durationLabel: lesson.duration || null,
        durationSeconds: durationLabelToSeconds(lesson.duration),
        levelId: level.id,
        categoryId: category.id,
        order,
        status: 'hidden',
        quiz: Array.isArray(lesson.quiz) ? lesson.quiz : [],
        notes: [
            'Bootstrapped from the legacy YouTube curriculum.',
            'Hidden until a licensed or CC replacement is uploaded to the canonical video CDN and manually approved.',
        ],
        playback: {
            canonical: {
                kind: 'unassigned',
                src: null,
                mimeType: null,
                poster: null,
                byteLength: null,
                sha256: null,
                pwaCompatible: false,
                browserCompatible: false,
            },
            backups: youtubeId ? buildLegacyBackup(youtubeId) : [],
        },
        sourceVerification,
        learningPacket,
        attribution: {
            sourceName: lesson.channel || null,
            sourcePageUrl: watchUrl,
            licenseLabel: null,
            licenseUrl: null,
            rehostAllowed: false,
            reviewedBy: null,
            reviewedAt: null,
            evidenceUrl: null,
        },
        qa: {
            verifiedAt: null,
            headStatus: null,
            contentType: null,
            rangeSupported: false,
        },
    };
}

async function main() {
    await ensureDir(path.dirname(videoLessonCatalogPath));

    try {
        await fs.access(videoLessonCatalogPath);
        console.log(`Catalog already exists: ${videoLessonCatalogPath}`);
        return;
    } catch {
        // Continue and bootstrap the file.
    }

    const kidsModule = await importModule('src/data/videoCurriculum.js');
    const beginnerModule = await importModule('src/data/videoCurriculumL2.js');
    const advancedModule = await importModule('src/data/videoCurriculumL3L4.js');

    const levels = [
        kidsModule.LEVEL_1_KIDS,
        beginnerModule.LEVEL_2_BEGINNER,
        advancedModule.LEVEL_3_INTERMEDIATE,
        advancedModule.LEVEL_4_ADVANCED,
    ].map((level, levelIndex) => ({
        id: level.id,
        level: level.level,
        title: level.title,
        titleVi: level.titleVi,
        ageRange: level.ageRange,
        icon: level.icon,
        color: level.color,
        order: levelIndex + 1,
        categories: level.categories.map((category, categoryIndex) => ({
            id: category.id,
            title: category.title,
            titleVi: category.titleVi,
            icon: category.icon,
            color: category.color,
            order: categoryIndex + 1,
            lessons: category.videos.map((lesson, lessonIndex) => buildLesson(level, category, lesson, lessonIndex + 1)),
        })),
    }));

    const catalog = {
        schemaVersion: 1,
        updatedAt: new Date().toISOString(),
        policy: {
            defaultStatus: 'hidden',
            publicLessonRequirements: [
                'Approved canonical video source hosted on the object-storage CDN.',
                'License evidence and manual editorial review recorded in attribution metadata.',
                'Canonical playback proven in browser and standalone PWA before publication.',
            ],
        },
        levels,
    };

    await writeJson(videoLessonCatalogPath, catalog);
    console.log(`Bootstrapped ${videoLessonCatalogPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

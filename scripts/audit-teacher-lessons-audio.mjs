import fs from 'node:fs/promises';
import path from 'node:path';
import {
    TEACHER_CURRICULUM,
    getTeacherLessonPracticeItems,
    normalizeTeacherLessonAudioKey,
} from '../src/data/teacherLessons.js';

const repoRoot = new URL('..', import.meta.url).pathname;
const manifestPath = path.join(repoRoot, 'public', 'data', 'audio-manifests', 'teacher-lessons.json');
const qaPath = path.join(repoRoot, 'public', 'data', 'audio-manifests', 'teacher-lessons.qa.json');
const sourceFiles = [
    path.join(repoRoot, 'src', 'pages', 'TeacherLessons.jsx'),
    path.join(repoRoot, 'src', 'services', 'teacherLessonAudioService.js'),
];

async function buildExpectedEntries() {
    const expected = new Map();

    for (const chapter of TEACHER_CURRICULUM.chapters) {
        for (const item of getTeacherLessonPracticeItems(chapter)) {
            const key = normalizeTeacherLessonAudioKey(item.promptEn);
            if (!key || expected.has(key)) continue;
            expected.set(key, {
                text: item.promptEn,
                sourceChapters: [chapter.id],
            });
        }
    }

    return expected;
}

async function main() {
    const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
    const expected = await buildExpectedEntries();
    const missingKeys = [];
    const zeroByteKeys = [];
    const sourceFindings = [];

    for (const filePath of sourceFiles) {
        const contents = await fs.readFile(filePath, 'utf8');
        if (!contents.includes('loadTeacherLessonAudioManifest')) {
            sourceFindings.push({
                file: path.relative(repoRoot, filePath),
                message: 'controlled audio manifest hook missing',
            });
        }
    }

    const pageSource = await fs.readFile(path.join(repoRoot, 'src', 'pages', 'TeacherLessons.jsx'), 'utf8');
    if (!pageSource.includes('buildPlaybackSourceLabel')) {
        sourceFindings.push({
            file: 'src/pages/TeacherLessons.jsx',
            message: 'teacher lesson playback source labeling missing',
        });
    }

    for (const [key] of expected.entries()) {
        const entry = manifest?.clips?.[key];
        if (!entry?.src) {
            missingKeys.push(key);
            continue;
        }

        const absolutePath = path.join(repoRoot, 'public', entry.src);
        try {
            const stats = await fs.stat(absolutePath);
            if (stats.size <= 0) {
                zeroByteKeys.push(key);
            }
        } catch {
            missingKeys.push(key);
        }
    }

    const qa = {
        generatedAt: new Date().toISOString(),
        sourceManifest: 'teacher-lessons.json',
        summary: {
            chapterCount: TEACHER_CURRICULUM.chapters.length,
            practiceItemCount: TEACHER_CURRICULUM.chapters.reduce((sum, chapter) => sum + getTeacherLessonPracticeItems(chapter).length, 0),
            clipCount: expected.size,
            manifestClipCount: Object.keys(manifest?.clips || {}).length,
            filteredOutStructuralItems: TEACHER_CURRICULUM.chapters.reduce((sum, chapter) => sum + chapter.items.length, 0)
                - TEACHER_CURRICULUM.chapters.reduce((sum, chapter) => sum + getTeacherLessonPracticeItems(chapter).length, 0),
            missingFiles: missingKeys.length,
            zeroByteFiles: zeroByteKeys.length,
            sourceFindings: sourceFindings.length,
            strictModulePass: missingKeys.length === 0
                && zeroByteKeys.length === 0
                && sourceFindings.length === 0
                && Object.keys(manifest?.clips || {}).length === expected.size,
        },
        missingKeys,
        zeroByteKeys,
        sourceFindings,
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

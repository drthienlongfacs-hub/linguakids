import {
    readJson,
    videoLessonCatalogPath,
    videoLessonManifestPath,
} from './lib/videoLessonManifestShared.mjs';

function ensureArray(value) {
    return Array.isArray(value) ? value : [];
}

function ensureString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function flattenLessons(data) {
    const lessons = [];

    for (const level of ensureArray(data?.levels)) {
        for (const category of ensureArray(level?.categories)) {
            for (const lesson of ensureArray(category?.lessons)) {
                lessons.push({
                    levelId: level.id,
                    categoryId: category.id,
                    lesson,
                });
            }
        }
    }

    return lessons;
}

function getScriptSegments(lesson) {
    return ensureArray(lesson?.learningPacket?.script?.segments);
}

function getQuizQuestions(lesson) {
    const packetQuestions = ensureArray(lesson?.learningPacket?.quiz?.questions);
    if (packetQuestions.length > 0) {
        return packetQuestions;
    }

    return ensureArray(lesson?.quiz);
}

function getOptionText(option) {
    if (typeof option === 'string') {
        return ensureString(option);
    }

    return ensureString(option?.en) || ensureString(option?.vi);
}

function auditLessonQuality(entry) {
    const findings = [];
    const { lesson } = entry;
    const scriptSegments = getScriptSegments(lesson);
    const questions = getQuizQuestions(lesson);
    const previewQuestion = questions.find((question) => ensureString(question?.id) === 'q1') || null;
    const detailQuestion = questions.find((question) => ensureString(question?.id) === 'q3') || null;

    if (scriptSegments.length < 4) {
        findings.push({
            type: 'script_segments_missing',
            message: `Expected at least 4 script segments, found ${scriptSegments.length}.`,
        });
    }

    if (questions.length < 5) {
        findings.push({
            type: 'quiz_questions_missing',
            message: `Expected at least 5 quiz questions, found ${questions.length}.`,
        });
    }

    questions.forEach((question, index) => {
        const options = ensureArray(question?.options);
        if (options.length !== 4) {
            findings.push({
                type: 'option_count_invalid',
                message: `Question ${question?.id || index + 1} should have 4 options, found ${options.length}.`,
            });
        }

        const hasBlankOption = options.some((option) => !getOptionText(option));
        if (hasBlankOption) {
            findings.push({
                type: 'option_blank',
                message: `Question ${question?.id || index + 1} contains a blank option.`,
            });
        }

        const answerIndex = Number.isInteger(question?.answer) ? question.answer : -1;
        if (answerIndex < 0 || answerIndex >= options.length) {
            findings.push({
                type: 'answer_invalid',
                message: `Question ${question?.id || index + 1} has an invalid answer index.`,
            });
        }

        if (!ensureString(question?.q) || !ensureString(question?.qVi)) {
            findings.push({
                type: 'prompt_missing',
                message: `Question ${question?.id || index + 1} is missing English or Vietnamese prompt text.`,
            });
        }

        if (!ensureString(question?.explanation) || !ensureString(question?.explanationVi)) {
            findings.push({
                type: 'explanation_missing',
                message: `Question ${question?.id || index + 1} is missing explanation text.`,
            });
        }
    });

    if (
        previewQuestion
        && detailQuestion
        && ensureString(previewQuestion.q)
        && ensureString(previewQuestion.q) === ensureString(detailQuestion.q)
    ) {
        findings.push({
            type: 'detail_duplicates_preview',
            message: 'Question q3 duplicates the preview question prompt.',
        });
    }

    return findings;
}

async function auditFile(filePath, label) {
    const data = await readJson(filePath);
    const lessons = flattenLessons(data);
    const findings = lessons.flatMap((entry) =>
        auditLessonQuality(entry).map((finding) => ({
            file: label,
            lessonId: entry.lesson.id,
            levelId: entry.levelId,
            categoryId: entry.categoryId,
            ...finding,
        }))
    );

    return {
        file: label,
        lessonCount: lessons.length,
        findings,
    };
}

async function main() {
    const reports = await Promise.all([
        auditFile(videoLessonCatalogPath, 'content/video-lessons/catalog.json'),
        auditFile(videoLessonManifestPath, 'public/data/video-manifests/video-lessons.json'),
    ]);

    const totalFindings = reports.reduce((sum, report) => sum + report.findings.length, 0);
    const output = {
        summary: {
            files: reports.length,
            findings: totalFindings,
            pass: totalFindings === 0,
        },
        reports,
    };

    console.log(JSON.stringify(output, null, 2));

    if (totalFindings > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

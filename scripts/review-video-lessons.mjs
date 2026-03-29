import { spawn } from 'node:child_process';

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

function parseArgs(argv) {
    const options = {};
    const positionals = [];

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        if (!token.startsWith('--')) {
            positionals.push(token);
            continue;
        }

        const key = token.slice(2);
        const next = argv[index + 1];
        if (!next || next.startsWith('--')) {
            options[key] = true;
            continue;
        }

        options[key] = next;
        index += 1;
    }

    return {
        command: positionals[0] || 'help',
        options,
    };
}

function ensureString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function findLesson(levels, lessonId) {
    for (const level of levels) {
        for (const category of level.categories) {
            for (const lesson of category.lessons) {
                if (lesson.id === lessonId) {
                    return lesson;
                }
            }
        }
    }

    return null;
}

function findWaveLessonIds(levels, waveNumber) {
    const queueable = [];
    for (const level of levels) {
        for (const category of level.categories) {
            for (const lesson of category.lessons) {
                if (!['blocked', 'draft', 'retired'].includes(lesson.status)) {
                    queueable.push({ level, category, lesson });
                }
            }
        }
    }

    queueable.sort((a, b) => (
        (a.level.order - b.level.order)
        || (a.category.order - b.category.order)
        || (a.lesson.order - b.lesson.order)
        || a.lesson.id.localeCompare(b.lesson.id)
    ));

    const sizes = [12, 24, 36, Number.POSITIVE_INFINITY];
    let offset = 0;
    for (let index = 0; index < sizes.length; index += 1) {
        const size = sizes[index];
        const slice = queueable.slice(offset, offset + size).map((entry) => entry.lesson.id);
        if (index + 1 === waveNumber) {
            return slice;
        }
        offset += size;
    }

    return [];
}

function validateReadyToPublish(lesson) {
    const checklist = lesson?.sourceVerification?.reviewChecklist || {};
    const reasons = [];

    if (lesson?.sourceVerification?.autoDecision !== 'green') {
        reasons.push('auto_decision_not_green');
    }
    if (!lesson?.playback?.canonical?.src) {
        reasons.push('canonical_source_missing');
    }
    if (lesson?.sourceVerification?.contentMatchStatus !== 'aligned') {
        reasons.push('content_match_not_aligned');
    }
    if (checklist.titleCategoryMatch !== true) reasons.push('title_category_not_approved');
    if (checklist.ageAppropriate !== true) reasons.push('age_appropriateness_not_approved');
    if (checklist.licenseValid !== true) reasons.push('license_not_approved');
    if (checklist.scriptAcceptable !== true) reasons.push('script_not_approved');
    if (checklist.quizAcceptable !== true) reasons.push('quiz_not_approved');

    return reasons;
}

function run(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: new URL('..', import.meta.url).pathname,
            stdio: 'inherit',
        });

        child.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`command_failed:${command}:${args.join(' ')}:${code}`));
        });
        child.on('error', reject);
    });
}

async function loadTriagedCatalog() {
    const catalog = await readJson(videoLessonCatalogPath);
    const approvedSources = await readJson(videoLessonApprovedSourcesPath);
    const alignmentQa = await readOptionalJson(videoLessonAlignmentQaPath, null);
    return applyAutomatedTriage(catalog, approvedSources, alignmentQa);
}

async function writeCatalog(catalog) {
    catalog.updatedAt = new Date().toISOString();
    await writeJson(videoLessonCatalogPath, catalog);
}

async function approveLesson(options) {
    const lessonId = ensureString(options['lesson-id']);
    const reviewer = ensureString(options.reviewer);
    const evidenceUrl = ensureString(options['evidence-url']);
    if (!lessonId || !reviewer || !evidenceUrl) {
        throw new Error('approve_requires_lesson-id_reviewer_evidence-url');
    }

    const catalog = await loadTriagedCatalog();
    const lesson = findLesson(catalog.levels, lessonId);
    if (!lesson) {
        throw new Error(`lesson_not_found:${lessonId}`);
    }

    lesson.sourceVerification.manualReviewStatus = 'approved';
    lesson.sourceVerification.reviewedBy = reviewer;
    lesson.sourceVerification.reviewedAt = new Date().toISOString();
    lesson.sourceVerification.evidenceUrl = evidenceUrl;
    lesson.sourceVerification.rejectionReasonCode = null;
    lesson.sourceVerification.canonicalMatchEvidence.reviewSnapshotUrl = evidenceUrl;
    lesson.attribution.reviewedBy = reviewer;
    lesson.attribution.reviewedAt = lesson.sourceVerification.reviewedAt;
    lesson.attribution.evidenceUrl = lesson.attribution.evidenceUrl || evidenceUrl;

    const approvedSources = await readJson(videoLessonApprovedSourcesPath);
    const alignmentQa = await readOptionalJson(videoLessonAlignmentQaPath, null);
    const triagedCatalog = applyAutomatedTriage(catalog, approvedSources, alignmentQa);
    const triagedLesson = findLesson(triagedCatalog.levels, lessonId);
    const blockers = validateReadyToPublish(triagedLesson);
    triagedLesson.status = blockers.length === 0 ? 'ready_to_publish' : 'review_queue';

    await writeCatalog(triagedCatalog);
    await run('node', ['scripts/build-video-lessons-manifest.mjs']);

    console.log(JSON.stringify({
        lessonId,
        reviewer,
        status: triagedLesson.status,
        remainingBlockers: blockers,
    }, null, 2));
}

async function rejectLesson(options) {
    const lessonId = ensureString(options['lesson-id']);
    const reviewer = ensureString(options.reviewer);
    const reasonCode = ensureString(options['reason-code']);
    const fallbackStatus = ensureString(options['fallback-status']) || 'blocked';
    if (!lessonId || !reviewer || !reasonCode) {
        throw new Error('reject_requires_lesson-id_reviewer_reason-code');
    }

    const catalog = await loadTriagedCatalog();
    const lesson = findLesson(catalog.levels, lessonId);
    if (!lesson) {
        throw new Error(`lesson_not_found:${lessonId}`);
    }

    lesson.sourceVerification.manualReviewStatus = 'rejected';
    lesson.sourceVerification.reviewedBy = reviewer;
    lesson.sourceVerification.reviewedAt = new Date().toISOString();
    lesson.sourceVerification.rejectionReasonCode = reasonCode;
    lesson.status = fallbackStatus === 'candidate' ? 'candidate' : 'blocked';

    const approvedSources = await readJson(videoLessonApprovedSourcesPath);
    const alignmentQa = await readOptionalJson(videoLessonAlignmentQaPath, null);
    const triagedCatalog = applyAutomatedTriage(catalog, approvedSources, alignmentQa);
    const triagedLesson = findLesson(triagedCatalog.levels, lessonId);
    triagedLesson.status = fallbackStatus === 'candidate' ? 'candidate' : 'blocked';

    await writeCatalog(triagedCatalog);
    await run('node', ['scripts/build-video-lessons-manifest.mjs']);

    console.log(JSON.stringify({
        lessonId,
        reviewer,
        status: triagedLesson.status,
        reasonCode,
    }, null, 2));
}

async function publishWave(options) {
    const wave = Number.parseInt(String(options.wave || ''), 10);
    if (!Number.isFinite(wave) || wave < 1) {
        throw new Error('publish_requires_valid_wave');
    }

    const catalog = await loadTriagedCatalog();
    const lessonIds = findWaveLessonIds(catalog.levels, wave);
    const promoted = [];
    const skipped = [];

    for (const lessonId of lessonIds) {
        const lesson = findLesson(catalog.levels, lessonId);
        if (!lesson) continue;

        const blockers = validateReadyToPublish(lesson);
        if (lesson.status === 'ready_to_publish' && blockers.length === 0) {
            lesson.status = 'public';
            promoted.push(lessonId);
        } else {
            skipped.push({
                lessonId,
                status: lesson.status,
                blockers,
            });
        }
    }

    await writeCatalog(catalog);
    await run('node', ['scripts/build-video-lessons-manifest.mjs']);
    await run('node', ['scripts/audit-video-lessons.mjs']);

    console.log(JSON.stringify({
        wave,
        promotedCount: promoted.length,
        promoted,
        skipped,
    }, null, 2));
}

async function main() {
    const { command, options } = parseArgs(process.argv.slice(2));

    if (command === 'approve') {
        await approveLesson(options);
        return;
    }

    if (command === 'reject') {
        await rejectLesson(options);
        return;
    }

    if (command === 'publish-wave') {
        await publishWave(options);
        return;
    }

    console.log([
        'Usage:',
        '  node scripts/review-video-lessons.mjs approve --lesson-id <id> --reviewer "<name>" --evidence-url "<url>"',
        '  node scripts/review-video-lessons.mjs reject --lesson-id <id> --reviewer "<name>" --reason-code "<code>" [--fallback-status blocked|candidate]',
        '  node scripts/review-video-lessons.mjs publish-wave --wave <1|2|3|4>',
    ].join('\n'));
}

main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});

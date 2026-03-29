import fs from 'node:fs/promises';
import { URL } from 'node:url';

import {
    getApprovedDomains,
    isBlockedDomain,
} from './videoLessonManifestShared.mjs';

const WAVE_SIZES = [12, 24, 36, Number.POSITIVE_INFINITY];
const LIFECYCLE_STATUSES = new Set([
    'hidden',
    'candidate',
    'review_queue',
    'ready_to_publish',
    'public',
    'blocked',
    'draft',
    'retired',
]);

function ensureArray(value) {
    return Array.isArray(value) ? value : [];
}

function ensureString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function ensureNumber(value) {
    return Number.isFinite(value) ? value : null;
}

function ensureBoolean(value) {
    return value === true;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function toIsoOrNull(value) {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
}

function normalizeTokens(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

function sortByCurriculumOrder(a, b) {
    return (
        (a.level.order - b.level.order)
        || (a.category.order - b.category.order)
        || (a.lesson.order - b.lesson.order)
        || a.lesson.id.localeCompare(b.lesson.id)
    );
}

function getScriptVariant(script = {}) {
    const hasTimedTracks = (
        (ensureString(script?.captionsEnVtt) && ensureString(script?.captionsViVtt))
        || ensureArray(script?.timedSegments).length > 0
    );

    if (script?.variant === 'exact_timed' && hasTimedTracks) {
        return 'exact_timed';
    }

    return 'companion';
}

function getScriptPublicLabel(script = {}) {
    if (getScriptVariant(script) === 'exact_timed') {
        return ensureString(script?.publicLabel) || 'Exact Subtitles';
    }

    return ensureString(script?.publicLabel) || 'Companion Script';
}

function hasBilingualScript(lesson) {
    const segments = ensureArray(lesson?.learningPacket?.script?.segments);
    return segments.length >= 4
        && segments.every((segment) => ensureString(segment?.en) && ensureString(segment?.vi));
}

function hasValidatedQuiz(lesson) {
    const questions = ensureArray(lesson?.learningPacket?.quiz?.questions);
    return questions.length >= 5
        && questions.every((question) => (
            ensureString(question?.q)
            && ensureString(question?.qVi)
            && ensureArray(question?.options).length >= 4
            && Number.isInteger(question?.answer)
            && question.answer >= 0
            && question.answer < question.options.length
        ));
}

function hasApprovedLicense(lesson) {
    return ensureString(lesson?.attribution?.licenseLabel)
        && ensureString(lesson?.attribution?.licenseUrl)
        && lesson?.attribution?.rehostAllowed === true;
}

function hasCanonicalSource(lesson) {
    return !!ensureString(lesson?.playback?.canonical?.src);
}

function hasApprovedCanonical(lesson, approvedSources) {
    const canonical = lesson?.playback?.canonical || {};
    if (!ensureString(canonical.src)) return false;
    if (!ensureString(canonical.kind) || canonical.kind === 'unassigned') return false;
    if (!ensureArray(approvedSources?.allowedCanonicalKinds).includes(canonical.kind)) return false;

    let parsedUrl;
    try {
        parsedUrl = new URL(canonical.src);
    } catch {
        return false;
    }

    const hostname = parsedUrl.hostname.toLowerCase();
    const approvedDomains = getApprovedDomains(approvedSources);
    return approvedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

function getAlignmentLookup(alignmentQa) {
    const map = new Map();
    for (const entry of ensureArray(alignmentQa?.results)) {
        if (ensureString(entry?.lessonId)) {
            map.set(entry.lessonId, entry);
        }
    }
    return map;
}

function getKeywordCoverage(expectedKeywords, haystack) {
    const tokens = new Set(normalizeTokens(haystack));
    const keywords = ensureArray(expectedKeywords).map((value) => ensureString(value)).filter(Boolean);
    if (keywords.length === 0) {
        return 0;
    }

    const matched = keywords.filter((keyword) => tokens.has(keyword.toLowerCase()));
    return matched.length / keywords.length;
}

function buildReviewChecklist(lesson, alignmentEntry) {
    const contentStatus = ensureString(lesson?.sourceVerification?.contentMatchStatus);
    const titleCategoryMatch = contentStatus === 'aligned'
        || ensureString(alignmentEntry?.status) === 'aligned';
    const ageAppropriate = !(lesson.levelId || '').startsWith('kids')
        || titleCategoryMatch;

    return {
        titleCategoryMatch,
        ageAppropriate,
        licenseValid: hasCanonicalSource(lesson) ? hasApprovedLicense(lesson) : false,
        scriptAcceptable: hasBilingualScript(lesson),
        quizAcceptable: hasValidatedQuiz(lesson),
    };
}

function getBlockingReasons(lesson, approvedSources, alignmentEntry, checklist) {
    const reasons = [];
    const canonical = lesson?.playback?.canonical || {};
    const contentStatus = ensureString(lesson?.sourceVerification?.contentMatchStatus) || ensureString(alignmentEntry?.status);

    if (contentStatus === 'mismatch') {
        reasons.push('title_category_mismatch');
    }

    if (!checklist.ageAppropriate) {
        reasons.push('age_appropriateness_risk');
    }

    if (ensureString(canonical.src)) {
        if (!ensureArray(approvedSources?.allowedCanonicalKinds).includes(canonical.kind)) {
            reasons.push('unapproved_canonical_kind');
        }

        try {
            const hostname = new URL(canonical.src).hostname.toLowerCase();
            if (isBlockedDomain(hostname, approvedSources)) {
                reasons.push('blocked_canonical_domain');
            }

            if (!hasApprovedCanonical(lesson, approvedSources)) {
                reasons.push('canonical_domain_not_allowlisted');
            }
        } catch {
            reasons.push('canonical_url_invalid');
        }

        if (!hasApprovedLicense(lesson)) {
            reasons.push('license_or_rehost_missing');
        }
    }

    return [...new Set(reasons)];
}

function computeRiskScore(lesson, alignmentEntry, checklist, blockingReasons) {
    let score = 100;
    const contentStatus = ensureString(lesson?.sourceVerification?.contentMatchStatus) || ensureString(alignmentEntry?.status);
    const hasCanonical = hasCanonicalSource(lesson);
    const scriptVariant = getScriptVariant(lesson?.learningPacket?.script);

    if (!checklist.quizAcceptable) score -= 20;
    if (!checklist.scriptAcceptable) score -= 20;
    if (!hasCanonical) score -= 25;
    if (hasCanonical && !hasApprovedLicense(lesson)) score -= 20;
    if (lesson?.playback?.canonical?.browserCompatible !== true || lesson?.playback?.canonical?.pwaCompatible !== true) score -= 10;

    if (contentStatus === 'aligned') score += 0;
    else if (contentStatus === 'suspect') score -= 20;
    else if (contentStatus === 'unreachable') score -= 25;
    else if (contentStatus === 'mismatch') score -= 60;
    else score -= 15;

    if ((lesson.levelId || '').startsWith('kids') && contentStatus !== 'aligned') {
        score -= 10;
    }

    if (scriptVariant === 'exact_timed') {
        score += 5;
    }

    if (ensureString(lesson?.sourceVerification?.manualReviewStatus) !== 'approved') {
        score -= 10;
    }

    if (blockingReasons.length > 0) {
        score -= 25;
    }

    return clamp(score, 0, 100);
}

function getAutoDecision(score, blockingReasons) {
    if (blockingReasons.length > 0) {
        return 'red';
    }

    if (score >= 85) return 'green';
    if (score >= 60) return 'yellow';
    return 'red';
}

function buildAutoReasons(lesson, alignmentEntry, checklist, blockingReasons, score) {
    const reasons = [...blockingReasons];
    const contentStatus = ensureString(lesson?.sourceVerification?.contentMatchStatus) || ensureString(alignmentEntry?.status) || 'unverified';

    if (!hasCanonicalSource(lesson)) {
        reasons.push('no_canonical_source');
    }
    if (!checklist.scriptAcceptable) {
        reasons.push('script_incomplete');
    }
    if (!checklist.quizAcceptable) {
        reasons.push('quiz_incomplete');
    }
    if (!checklist.licenseValid) {
        reasons.push('license_review_pending');
    }
    if (contentStatus === 'suspect') {
        reasons.push('alignment_suspect');
    }
    if (contentStatus === 'unverified') {
        reasons.push('alignment_unverified');
    }
    if (contentStatus === 'unreachable') {
        reasons.push('alignment_unreachable');
    }
    if (ensureString(lesson?.sourceVerification?.manualReviewStatus) !== 'approved') {
        reasons.push('human_review_pending');
    }
    if (getScriptVariant(lesson?.learningPacket?.script) !== 'exact_timed') {
        reasons.push('exact_subtitles_not_ready');
    }
    if (score >= 85 && reasons.length === 0) {
        reasons.push('review_ready');
    }

    return [...new Set(reasons)];
}

function getCanonicalMatchEvidence(lesson, alignmentEntry) {
    const expectedKeywords = ensureArray(lesson?.sourceVerification?.expectedKeywords);
    const haystack = `${alignmentEntry?.actualTitle || ''} ${alignmentEntry?.actualAuthor || ''}`;

    return {
        titleMatchScore: ensureNumber(lesson?.sourceVerification?.canonicalMatchEvidence?.titleMatchScore)
            ?? ensureNumber(lesson?.sourceVerification?.automatedMatchScore)
            ?? ensureNumber(alignmentEntry?.tokenOverlapScore)
            ?? 0,
        channelMatch: ensureBoolean(lesson?.sourceVerification?.canonicalMatchEvidence?.channelMatch)
            || ensureBoolean(alignmentEntry?.channelMatch),
        keywordCoverage: ensureNumber(lesson?.sourceVerification?.canonicalMatchEvidence?.keywordCoverage)
            ?? Number(getKeywordCoverage(expectedKeywords, haystack).toFixed(3)),
        reviewSnapshotUrl: ensureString(lesson?.sourceVerification?.canonicalMatchEvidence?.reviewSnapshotUrl)
            || ensureString(lesson?.sourceVerification?.evidenceUrl)
            || ensureString(lesson?.attribution?.evidenceUrl)
            || null,
    };
}

function getRecommendedStatus(lesson, approvedSources, autoDecision, blockingReasons) {
    const existingStatus = ensureString(lesson?.status) || 'hidden';
    const manualReviewStatus = ensureString(lesson?.sourceVerification?.manualReviewStatus);
    const contentMatchStatus = ensureString(lesson?.sourceVerification?.contentMatchStatus);

    if (existingStatus === 'public' || existingStatus === 'draft' || existingStatus === 'retired') {
        return existingStatus;
    }

    if (blockingReasons.length > 0 || manualReviewStatus === 'rejected') {
        return 'blocked';
    }

    if (
        autoDecision === 'green'
        && hasApprovedCanonical(lesson, approvedSources)
        && manualReviewStatus === 'approved'
        && contentMatchStatus === 'aligned'
    ) {
        return existingStatus === 'ready_to_publish' ? 'ready_to_publish' : 'review_queue';
    }

    if (contentMatchStatus === 'aligned' && !hasCanonicalSource(lesson)) {
        return 'candidate';
    }

    if (
        autoDecision === 'yellow'
        || autoDecision === 'green'
        || hasCanonicalSource(lesson)
        || ['aligned', 'suspect', 'unverified', 'unreachable'].includes(contentMatchStatus)
    ) {
        return 'review_queue';
    }

    return existingStatus && LIFECYCLE_STATUSES.has(existingStatus) ? existingStatus : 'blocked';
}

export async function readOptionalJson(filePath, fallback = null) {
    try {
        return JSON.parse(await fs.readFile(filePath, 'utf8'));
    } catch {
        return fallback;
    }
}

export function applyAutomatedTriage(catalog, approvedSources, alignmentQa) {
    const alignmentLookup = getAlignmentLookup(alignmentQa);

    const triagedLevels = ensureArray(catalog?.levels).map((level) => ({
        ...level,
        categories: ensureArray(level.categories).map((category) => ({
            ...category,
            lessons: ensureArray(category.lessons).map((lesson) => {
                const alignmentEntry = alignmentLookup.get(lesson.id) || null;
                const derivedContentMatchStatus = (
                    ensureString(lesson?.sourceVerification?.contentMatchStatus) !== 'unverified'
                        ? ensureString(lesson?.sourceVerification?.contentMatchStatus)
                        : ensureString(alignmentEntry?.status) || 'unverified'
                );
                const lessonWithMatch = {
                    ...lesson,
                    sourceVerification: {
                        ...lesson.sourceVerification,
                        contentMatchStatus: derivedContentMatchStatus,
                    },
                };
                const reviewChecklist = buildReviewChecklist(lessonWithMatch, alignmentEntry);
                const blockingReasons = getBlockingReasons(lessonWithMatch, approvedSources, alignmentEntry, reviewChecklist);
                const riskScore = computeRiskScore(lessonWithMatch, alignmentEntry, reviewChecklist, blockingReasons);
                const autoDecision = getAutoDecision(riskScore, blockingReasons);
                const autoReasons = buildAutoReasons(lessonWithMatch, alignmentEntry, reviewChecklist, blockingReasons, riskScore);
                const canonicalMatchEvidence = getCanonicalMatchEvidence(lessonWithMatch, alignmentEntry);
                const nextStatus = getRecommendedStatus(lessonWithMatch, approvedSources, autoDecision, blockingReasons);
                const scriptVariant = getScriptVariant(lesson?.learningPacket?.script);
                const publicLabel = getScriptPublicLabel(lesson?.learningPacket?.script);

                return {
                    ...lesson,
                    status: nextStatus,
                    sourceVerification: {
                        ...lesson.sourceVerification,
                        contentMatchStatus: derivedContentMatchStatus,
                        automatedCheckStatus: 'triaged',
                        automatedMatchScore: canonicalMatchEvidence.titleMatchScore,
                        riskScore,
                        autoDecision,
                        autoReasons,
                        canonicalMatchEvidence,
                        reviewChecklist,
                        blockingReasons,
                        lastAlignedAt: toIsoOrNull(alignmentQa?.summary?.checkedAt) || null,
                    },
                    learningPacket: {
                        ...lesson.learningPacket,
                        script: {
                            ...lesson.learningPacket?.script,
                            variant: scriptVariant,
                            captionsEnVtt: ensureString(lesson?.learningPacket?.script?.captionsEnVtt) || null,
                            captionsViVtt: ensureString(lesson?.learningPacket?.script?.captionsViVtt) || null,
                            timedSegments: ensureArray(lesson?.learningPacket?.script?.timedSegments),
                            publicLabel,
                        },
                    },
                };
            }),
        })),
    }));

    return {
        ...catalog,
        updatedAt: catalog?.updatedAt || null,
        levels: triagedLevels,
    };
}

export function buildRolloutWaves(levels) {
    const entries = [];
    for (const level of ensureArray(levels)) {
        for (const category of ensureArray(level.categories)) {
            for (const lesson of ensureArray(category.lessons)) {
                entries.push({ level, category, lesson });
            }
        }
    }

    const queueable = entries
        .filter((entry) => entry.lesson.status !== 'blocked' && entry.lesson.status !== 'draft' && entry.lesson.status !== 'retired')
        .sort(sortByCurriculumOrder);

    const waves = [];
    let offset = 0;

    WAVE_SIZES.forEach((size, index) => {
        const lessonIds = queueable.slice(offset, offset + size).map((entry) => entry.lesson.id);
        const items = queueable.slice(offset, offset + size);
        waves.push({
            wave: index + 1,
            targetSize: Number.isFinite(size) ? size : Math.max(queueable.length - offset, 0),
            lessonIds,
            publicableNowCount: items.filter((entry) => entry.lesson.status === 'ready_to_publish' || entry.lesson.status === 'public').length,
            greenCount: items.filter((entry) => entry.lesson.sourceVerification?.autoDecision === 'green').length,
            yellowCount: items.filter((entry) => entry.lesson.sourceVerification?.autoDecision === 'yellow').length,
            redCount: items.filter((entry) => entry.lesson.sourceVerification?.autoDecision === 'red').length,
        });
        offset += size;
    });

    const waveByLessonId = new Map();
    waves.forEach((wave) => {
        wave.lessonIds.forEach((lessonId) => waveByLessonId.set(lessonId, wave.wave));
    });

    return {
        waves,
        waveByLessonId,
    };
}

export function buildReviewQueueArtifact(catalog, manifestVersion) {
    const flattened = [];
    for (const level of ensureArray(catalog?.levels)) {
        for (const category of ensureArray(level.categories)) {
            for (const lesson of ensureArray(category.lessons)) {
                flattened.push({ level, category, lesson });
            }
        }
    }

    const { waves, waveByLessonId } = buildRolloutWaves(catalog?.levels);

    const items = flattened
        .sort(sortByCurriculumOrder)
        .map(({ level, category, lesson }) => ({
            lessonId: lesson.id,
            status: lesson.status,
            levelId: level.id,
            levelTitle: level.title,
            categoryId: category.id,
            categoryTitle: category.title,
            title: lesson.title,
            titleVi: lesson.titleVi,
            riskScore: ensureNumber(lesson?.sourceVerification?.riskScore) ?? 0,
            autoDecision: ensureString(lesson?.sourceVerification?.autoDecision) || 'red',
            blockingReasons: ensureArray(lesson?.sourceVerification?.blockingReasons),
            autoReasons: ensureArray(lesson?.sourceVerification?.autoReasons),
            subtitleMode: getScriptVariant(lesson?.learningPacket?.script),
            subtitleLabel: getScriptPublicLabel(lesson?.learningPacket?.script),
            quizCount: ensureArray(lesson?.learningPacket?.quiz?.questions).length,
            canonicalSrc: ensureString(lesson?.playback?.canonical?.src) || null,
            manualReviewStatus: ensureString(lesson?.sourceVerification?.manualReviewStatus) || 'pending',
            rejectionReasonCode: ensureString(lesson?.sourceVerification?.rejectionReasonCode) || null,
            wave: waveByLessonId.get(lesson.id) || null,
            reviewActions: {
                approve: `node scripts/review-video-lessons.mjs approve --lesson-id ${lesson.id} --reviewer "<name>" --evidence-url "<url>"`,
                reject: `node scripts/review-video-lessons.mjs reject --lesson-id ${lesson.id} --reviewer "<name>" --reason-code "<code>"`,
            },
        }));

    return {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        version: manifestVersion,
        summary: {
            totalLessons: items.length,
            candidateLessons: items.filter((item) => item.status === 'candidate').length,
            reviewQueueLessons: items.filter((item) => item.status === 'review_queue').length,
            readyToPublishLessons: items.filter((item) => item.status === 'ready_to_publish').length,
            blockedLessons: items.filter((item) => item.status === 'blocked').length,
            publicLessons: items.filter((item) => item.status === 'public').length,
        },
        decisionSchema: {
            approve: {
                required: ['lesson-id', 'reviewer', 'evidence-url'],
                command: 'node scripts/review-video-lessons.mjs approve --lesson-id <id> --reviewer "<name>" --evidence-url "<url>"',
            },
            reject: {
                required: ['lesson-id', 'reviewer', 'reason-code'],
                optional: ['fallback-status'],
                command: 'node scripts/review-video-lessons.mjs reject --lesson-id <id> --reviewer "<name>" --reason-code "<code>" [--fallback-status candidate]',
            },
            publishWave: {
                required: ['wave'],
                command: 'node scripts/review-video-lessons.mjs publish-wave --wave <1-4>',
            },
        },
        waves,
        items,
    };
}

export function buildOpsArtifact(catalog, manifestVersion) {
    const flattened = [];
    for (const level of ensureArray(catalog?.levels)) {
        for (const category of ensureArray(level.categories)) {
            for (const lesson of ensureArray(category.lessons)) {
                flattened.push({ level, category, lesson });
            }
        }
    }

    const { waves } = buildRolloutWaves(catalog?.levels);
    const statusCounts = flattened.reduce((acc, entry) => {
        const status = entry.lesson.status || 'hidden';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
    const blockerCounts = flattened.reduce((acc, entry) => {
        ensureArray(entry.lesson?.sourceVerification?.blockingReasons).forEach((reason) => {
            acc[reason] = (acc[reason] || 0) + 1;
        });
        return acc;
    }, {});
    const rejectedLessons = flattened.filter((entry) => entry.lesson?.sourceVerification?.manualReviewStatus === 'rejected').length;
    const reviewedLessons = flattened.filter((entry) => ['approved', 'rejected'].includes(entry.lesson?.sourceVerification?.manualReviewStatus)).length;
    const reviewRejectRate = reviewedLessons > 0 ? rejectedLessons / reviewedLessons : null;
    const subtitleCounts = flattened.reduce((acc, entry) => {
        const variant = getScriptVariant(entry.lesson?.learningPacket?.script);
        acc[variant] = (acc[variant] || 0) + 1;
        return acc;
    }, {});

    return {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        version: manifestVersion,
        summary: {
            totalLessons: flattened.length,
            statusCounts,
            decisionCounts: {
                green: flattened.filter((entry) => entry.lesson?.sourceVerification?.autoDecision === 'green').length,
                yellow: flattened.filter((entry) => entry.lesson?.sourceVerification?.autoDecision === 'yellow').length,
                red: flattened.filter((entry) => entry.lesson?.sourceVerification?.autoDecision === 'red').length,
            },
            subtitleCounts,
            blockerCounts,
            publicLessonCount: statusCounts.public || 0,
            reviewRejectRate,
        },
        monitoring: {
            metrics: {
                video_source_error_rate: null,
                subtitle_toggle_rate: null,
                quiz_start_rate: null,
                quiz_complete_rate: null,
                public_lesson_count: statusCounts.public || 0,
                review_reject_rate: reviewRejectRate,
            },
            telemetrySources: {
                runtime: 'client_local_storage',
                review: 'catalog_source_verification',
            },
        },
        waves,
        stopConditions: {
            thresholds: {
                video_source_error_rate: 0.02,
                review_reject_rate: 0.15,
            },
            current: {
                review_reject_rate: reviewRejectRate,
                public_mismatch_incident: flattened.some((entry) => entry.lesson.status === 'public' && entry.lesson?.sourceVerification?.contentMatchStatus !== 'aligned'),
                runtime_telemetry_source: 'client_local_storage',
            },
        },
    };
}

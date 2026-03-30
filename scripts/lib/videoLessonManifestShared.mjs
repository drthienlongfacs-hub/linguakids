import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
    buildLessonLearningPacketDefaults,
    buildLessonSourceVerificationDefaults,
    getLearningPacketQuestionCount,
} from './videoLessonPedagogy.mjs';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(scriptDir, '..', '..');
export const videoLessonCatalogPath = path.join(repoRoot, 'content', 'video-lessons', 'catalog.json');
export const videoLessonApprovedSourcesPath = path.join(repoRoot, 'content', 'video-lessons', 'approved-sources.json');
export const videoLessonManifestPath = path.join(repoRoot, 'public', 'data', 'video-manifests', 'video-lessons.json');
export const videoLessonQaPath = path.join(repoRoot, 'public', 'data', 'video-manifests', 'video-lessons.qa.json');
export const videoLessonAlignmentQaPath = path.join(repoRoot, 'public', 'data', 'video-manifests', 'video-lessons.alignment.qa.json');
export const videoLessonReviewQueuePath = path.join(repoRoot, 'public', 'data', 'video-manifests', 'video-lessons.review-queue.json');
export const videoLessonOpsPath = path.join(repoRoot, 'public', 'data', 'video-manifests', 'video-lessons.ops.json');
export const videoLessonSourceCandidatesPath = path.join(repoRoot, 'content', 'video-lessons', 'source-candidates.json');
export const videoLessonDiscoveryQaPath = path.join(repoRoot, 'public', 'data', 'video-manifests', 'video-lessons.discovery.qa.json');

export async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

export async function readJson(filePath) {
    return JSON.parse(await fs.readFile(filePath, 'utf8'));
}

export async function writeJson(filePath, value) {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function ensureArray(value) {
    return Array.isArray(value) ? value : [];
}

function ensureString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function ensureNumber(value) {
    return Number.isFinite(value) ? value : null;
}

function toIsoOrNull(value) {
    if (!value) return null;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toISOString();
}

function ensureBoolean(value) {
    return value === true;
}

function ensureQuestionOptions(value) {
    return ensureArray(value)
        .map((option) => {
            if (typeof option === 'string') {
                const trimmed = ensureString(option);
                return trimmed
                    ? {
                        en: trimmed,
                        vi: trimmed,
                    }
                    : null;
            }

            const en = ensureString(option?.en);
            const vi = ensureString(option?.vi);
            if (!en && !vi) {
                return null;
            }

            return {
                en: en || vi,
                vi: vi || en,
            };
        })
        .filter(Boolean);
}

function normalizeQuestion(question, index) {
    const normalizedOptions = ensureQuestionOptions(question?.options);

    return {
        id: ensureString(question?.id) || `q${index + 1}`,
        stage: ensureString(question?.stage) || 'detail',
        type: ensureString(question?.type) || 'multiple_choice',
        q: ensureString(question?.q),
        qVi: ensureString(question?.qVi),
        options: normalizedOptions,
        answer: Number.isFinite(question?.answer) ? question.answer : null,
        explanation: ensureString(question?.explanation) || null,
        explanationVi: ensureString(question?.explanationVi) || null,
    };
}

function normalizeObjectives(value) {
    return ensureArray(value)
        .map((entry) => ({
            en: ensureString(entry?.en),
            vi: ensureString(entry?.vi),
        }))
        .filter((entry) => entry.en || entry.vi);
}

function normalizeVocabulary(value) {
    return ensureArray(value)
        .map((entry) => ({
            term: ensureString(entry?.term),
            meaningVi: ensureString(entry?.meaningVi),
            exampleEn: ensureString(entry?.exampleEn) || null,
            exampleVi: ensureString(entry?.exampleVi) || null,
        }))
        .filter((entry) => entry.term);
}

function normalizeScriptSegments(value) {
    return ensureArray(value)
        .map((entry, index) => ({
            id: ensureString(entry?.id) || `segment-${index + 1}`,
            phase: ensureString(entry?.phase) || 'notice',
            label: ensureString(entry?.label) || null,
            labelVi: ensureString(entry?.labelVi) || null,
            en: ensureString(entry?.en),
            vi: ensureString(entry?.vi),
        }))
        .filter((entry) => entry.en || entry.vi);
}

function normalizeBilingualList(value) {
    return ensureArray(value)
        .map((entry) => ({
            en: ensureString(entry?.en),
            vi: ensureString(entry?.vi),
        }))
        .filter((entry) => entry.en || entry.vi);
}

function normalizeResearchBasis(value) {
    return ensureArray(value)
        .map((entry) => ({
            key: ensureString(entry?.key),
            label: ensureString(entry?.label),
            whyEn: ensureString(entry?.whyEn),
            whyVi: ensureString(entry?.whyVi),
        }))
        .filter((entry) => entry.key || entry.label);
}

const LEGACY_VIETNAMESE_PATTERNS = [
    /Xac dinh/,
    /Nhan ra va goi lai/,
    /Nguoi hoc/,
    /Goi y tieng Viet/,
    /Mot thong tin/,
    /Mot dap an/,
    /Tam dung/,
    /Doc tieu de/,
    /Hay goi lai/,
    /Lam mot lan/,
    /Cau hoi quiz/,
    /Cac goi y/,
    /Moi dong tieng Anh/,
    /Dung ho tro song ngu/,
    /Tieu de nao/,
];

function hasLegacyVietnameseText(value) {
    const serialized = JSON.stringify(value || {});
    return LEGACY_VIETNAMESE_PATTERNS.some((pattern) => pattern.test(serialized));
}

function hasPopulatedQuestionOptions(question) {
    const options = ensureArray(question?.options)
        .map((option) => {
            if (typeof option === 'string') {
                return ensureString(option);
            }

            return ensureString(option?.en) || ensureString(option?.vi);
        })
        .filter(Boolean);

    return options.length >= 2;
}

function hasBrokenGeneratedQuizQuestions(questions) {
    const normalizedQuestions = ensureArray(questions);
    if (normalizedQuestions.length === 0) {
        return false;
    }

    const previewQuestion = normalizedQuestions.find((question) => ensureString(question?.id) === 'q1') || null;
    const detailQuestion = normalizedQuestions.find((question) => ensureString(question?.id) === 'q3') || null;

    if (normalizedQuestions.some((question) => !hasPopulatedQuestionOptions(question))) {
        return true;
    }

    return !!(
        previewQuestion
        && detailQuestion
        && ensureString(previewQuestion?.q)
        && ensureString(previewQuestion?.q) === ensureString(detailQuestion?.q)
    );
}

function normalizeSourceVerification(value, defaults) {
    const notes = ensureArray(value?.notes).map((entry) => ensureString(entry)).filter(Boolean);
    const fallbackNotes = ensureArray(defaults?.notes).map((entry) => ensureString(entry)).filter(Boolean);

    return {
        expectedLevelId: ensureString(value?.expectedLevelId) || defaults.expectedLevelId,
        expectedCategoryId: ensureString(value?.expectedCategoryId) || defaults.expectedCategoryId,
        expectedTitle: ensureString(value?.expectedTitle) || defaults.expectedTitle,
        expectedTitleVi: ensureString(value?.expectedTitleVi) || defaults.expectedTitleVi,
        expectedChannel: ensureString(value?.expectedChannel) || defaults.expectedChannel || null,
        expectedKeywords: ensureArray(value?.expectedKeywords).map((entry) => ensureString(entry)).filter(Boolean).length > 0
            ? ensureArray(value.expectedKeywords).map((entry) => ensureString(entry)).filter(Boolean)
            : defaults.expectedKeywords,
        legacyReference: {
            kind: ensureString(value?.legacyReference?.kind) || defaults.legacyReference?.kind || null,
            src: ensureString(value?.legacyReference?.src) || defaults.legacyReference?.src || null,
            youtubeId: ensureString(value?.legacyReference?.youtubeId) || defaults.legacyReference?.youtubeId || null,
        },
        manualReviewStatus: ensureString(value?.manualReviewStatus) || defaults.manualReviewStatus,
        contentMatchStatus: ensureString(value?.contentMatchStatus) || defaults.contentMatchStatus,
        automatedCheckStatus: ensureString(value?.automatedCheckStatus) || defaults.automatedCheckStatus,
        automatedMatchScore: Number.isFinite(value?.automatedMatchScore) ? value.automatedMatchScore : defaults.automatedMatchScore,
        riskScore: Number.isFinite(value?.riskScore) ? value.riskScore : null,
        autoDecision: ensureString(value?.autoDecision) || null,
        autoReasons: ensureArray(value?.autoReasons).map((entry) => ensureString(entry)).filter(Boolean),
        canonicalMatchEvidence: {
            titleMatchScore: Number.isFinite(value?.canonicalMatchEvidence?.titleMatchScore) ? value.canonicalMatchEvidence.titleMatchScore : null,
            channelMatch: ensureBoolean(value?.canonicalMatchEvidence?.channelMatch),
            keywordCoverage: Number.isFinite(value?.canonicalMatchEvidence?.keywordCoverage) ? value.canonicalMatchEvidence.keywordCoverage : null,
            reviewSnapshotUrl: ensureString(value?.canonicalMatchEvidence?.reviewSnapshotUrl) || null,
        },
        referenceHarvest: {
            source: ensureString(value?.referenceHarvest?.source) || null,
            query: ensureString(value?.referenceHarvest?.query) || null,
            confidence: Number.isFinite(value?.referenceHarvest?.confidence) ? value.referenceHarvest.confidence : null,
            harvestedTitle: ensureString(value?.referenceHarvest?.harvestedTitle) || null,
            harvestedChannel: ensureString(value?.referenceHarvest?.harvestedChannel) || null,
            harvestedUrl: ensureString(value?.referenceHarvest?.harvestedUrl) || null,
            harvestedAt: toIsoOrNull(value?.referenceHarvest?.harvestedAt),
        },
        reviewChecklist: {
            titleCategoryMatch: ensureBoolean(value?.reviewChecklist?.titleCategoryMatch),
            ageAppropriate: value?.reviewChecklist?.ageAppropriate !== false,
            licenseValid: ensureBoolean(value?.reviewChecklist?.licenseValid),
            scriptAcceptable: ensureBoolean(value?.reviewChecklist?.scriptAcceptable),
            quizAcceptable: ensureBoolean(value?.reviewChecklist?.quizAcceptable),
        },
        blockingReasons: ensureArray(value?.blockingReasons).map((entry) => ensureString(entry)).filter(Boolean),
        reviewedBy: ensureString(value?.reviewedBy) || null,
        reviewedAt: toIsoOrNull(value?.reviewedAt),
        evidenceUrl: ensureString(value?.evidenceUrl) || null,
        rejectionReasonCode: ensureString(value?.rejectionReasonCode) || null,
        lastAlignedAt: toIsoOrNull(value?.lastAlignedAt),
        notes: notes.length > 0 ? notes : fallbackNotes,
    };
}

function normalizeLearningPacket(value, defaults) {
    const shouldRefreshGeneratedText = hasLegacyVietnameseText(value)
        || hasBrokenGeneratedQuizQuestions(value?.quiz?.questions);
    const sourcePacket = shouldRefreshGeneratedText ? null : value;

    const objectives = normalizeObjectives(sourcePacket?.learningObjectives);
    const vocabulary = normalizeVocabulary(sourcePacket?.focusVocabulary);
    const scriptSegments = normalizeScriptSegments(sourcePacket?.script?.segments);
    const questions = ensureArray(sourcePacket?.quiz?.questions).map(normalizeQuestion);
    const beforeWatch = normalizeBilingualList(sourcePacket?.practice?.beforeWatch);
    const afterWatch = normalizeBilingualList(sourcePacket?.practice?.afterWatch);
    const memoryPlan = normalizeBilingualList(sourcePacket?.practice?.memoryPlan);
    const shadowing = normalizeBilingualList(sourcePacket?.practice?.shadowing);
    const researchBasis = normalizeResearchBasis(sourcePacket?.researchBasis);

    return {
        schemaVersion: Number.isFinite(value?.schemaVersion) ? value.schemaVersion : defaults.schemaVersion,
        packetType: ensureString(value?.packetType) || defaults.packetType,
        pedagogicalFrame: {
            learningScience: ensureArray(sourcePacket?.pedagogicalFrame?.learningScience).map((entry) => ensureString(entry)).filter(Boolean).length > 0
                ? ensureArray(sourcePacket.pedagogicalFrame.learningScience).map((entry) => ensureString(entry)).filter(Boolean)
                : defaults.pedagogicalFrame.learningScience,
            rationaleEn: ensureString(sourcePacket?.pedagogicalFrame?.rationaleEn) || defaults.pedagogicalFrame.rationaleEn,
            rationaleVi: ensureString(sourcePacket?.pedagogicalFrame?.rationaleVi) || defaults.pedagogicalFrame.rationaleVi,
            designGuardrailEn: ensureString(sourcePacket?.pedagogicalFrame?.designGuardrailEn) || defaults.pedagogicalFrame.designGuardrailEn,
            designGuardrailVi: ensureString(sourcePacket?.pedagogicalFrame?.designGuardrailVi) || defaults.pedagogicalFrame.designGuardrailVi,
        },
        learningObjectives: objectives.length > 0 ? objectives : defaults.learningObjectives,
        focusVocabulary: vocabulary.length > 0 ? vocabulary : defaults.focusVocabulary,
        script: {
            type: ensureString(value?.script?.type) || defaults.script.type,
            displayMode: ensureString(value?.script?.displayMode) || defaults.script.displayMode,
            variant: ensureString(value?.script?.variant) || defaults.script.variant,
            captionsEnVtt: ensureString(value?.script?.captionsEnVtt) || null,
            captionsViVtt: ensureString(value?.script?.captionsViVtt) || null,
            timedSegments: ensureArray(value?.script?.timedSegments).map((entry, index) => ({
                id: ensureString(entry?.id) || `timed-${index + 1}`,
                startMs: ensureNumber(entry?.startMs),
                endMs: ensureNumber(entry?.endMs),
                en: ensureString(entry?.en),
                vi: ensureString(entry?.vi),
            })).filter((entry) => Number.isFinite(entry.startMs) && Number.isFinite(entry.endMs) && (entry.en || entry.vi)),
            publicLabel: ensureString(value?.script?.publicLabel) || defaults.script.publicLabel,
            segments: scriptSegments.length > 0 ? scriptSegments : defaults.script.segments,
        },
        quiz: {
            minimumPassRatio: Number.isFinite(value?.quiz?.minimumPassRatio) ? value.quiz.minimumPassRatio : defaults.quiz.minimumPassRatio,
            unlockCondition: ensureString(value?.quiz?.unlockCondition) || defaults.quiz.unlockCondition,
            questions: questions.length > 0 ? questions : defaults.quiz.questions,
        },
        practice: {
            beforeWatch: beforeWatch.length > 0 ? beforeWatch : defaults.practice.beforeWatch,
            afterWatch: afterWatch.length > 0 ? afterWatch : defaults.practice.afterWatch,
            memoryPlan: memoryPlan.length > 0 ? memoryPlan : defaults.practice.memoryPlan,
            shadowing: shadowing.length > 0 ? shadowing : defaults.practice.shadowing,
        },
        researchBasis: researchBasis.length > 0 ? researchBasis : defaults.researchBasis,
    };
}

function normalizeRelativePath(value) {
    return ensureString(value).replace(/^\/+/, '');
}

function ensureTrailingSlash(value) {
    const trimmed = ensureString(value);
    if (!trimmed) return '';
    return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

export function resolveCanonicalSrc(rawSrc, approvedSources) {
    const src = ensureString(rawSrc);
    if (!src) return null;
    if (/^https?:\/\//i.test(src)) return src;

    const baseUrl = ensureTrailingSlash(
        approvedSources?.mediaHost?.baseUrl || process.env.LINGUAKIDS_VIDEO_CDN_BASE_URL || ''
    );
    if (!baseUrl) {
        return src;
    }

    return new URL(normalizeRelativePath(src), baseUrl).toString();
}

export function normalizeCatalog(catalog, approvedSources) {
    const levels = ensureArray(catalog?.levels).map((level, levelIndex) => {
        const levelOrder = Number.isFinite(level?.order) ? level.order : levelIndex + 1;
        const levelId = ensureString(level?.id);

        const categories = ensureArray(level?.categories).map((category, categoryIndex) => {
            const categoryOrder = Number.isFinite(category?.order) ? category.order : categoryIndex + 1;
            const categoryId = ensureString(category?.id);
            const rawLessons = ensureArray(category?.lessons);

            const lessons = rawLessons.map((lesson, lessonIndex) => {
                const status = ensureString(lesson?.status) || 'hidden';
                const canonical = lesson?.playback?.canonical || {};
                const backups = ensureArray(lesson?.playback?.backups).map((entry) => ({
                    kind: ensureString(entry?.kind) || 'reference',
                    src: ensureString(entry?.src) || null,
                    label: ensureString(entry?.label) || null,
                    youtubeId: ensureString(entry?.youtubeId) || null,
                    title: ensureString(entry?.title) || null,
                    channel: ensureString(entry?.channel) || null,
                    confidence: ensureNumber(entry?.confidence),
                    source: ensureString(entry?.source) || null,
                }));
                const learningPacketDefaults = buildLessonLearningPacketDefaults(lesson, {
                    id: categoryId,
                    title: ensureString(category?.title),
                    titleVi: ensureString(category?.titleVi),
                }, {
                    id: levelId,
                    title: ensureString(level?.title),
                    titleVi: ensureString(level?.titleVi),
                }, rawLessons);
                const sourceVerificationDefaults = buildLessonSourceVerificationDefaults(lesson, {
                    id: categoryId,
                    title: ensureString(category?.title),
                    titleVi: ensureString(category?.titleVi),
                }, {
                    id: levelId,
                    title: ensureString(level?.title),
                    titleVi: ensureString(level?.titleVi),
                });
                const learningPacket = normalizeLearningPacket(lesson?.learningPacket, learningPacketDefaults);
                const lessonQuestions = learningPacket.quiz.questions.length > 0
                    ? learningPacket.quiz.questions
                    : ensureArray(lesson?.quiz).map(normalizeQuestion);

                return {
                    id: ensureString(lesson?.id),
                    title: ensureString(lesson?.title),
                    titleVi: ensureString(lesson?.titleVi),
                    channel: ensureString(lesson?.channel) || null,
                    durationLabel: ensureString(lesson?.durationLabel) || null,
                    durationSeconds: ensureNumber(lesson?.durationSeconds),
                    levelId,
                    categoryId,
                    order: Number.isFinite(lesson?.order) ? lesson.order : lessonIndex + 1,
                    status,
                    quiz: lessonQuestions,
                    notes: ensureArray(lesson?.notes).map((item) => ensureString(item)).filter(Boolean),
                    playback: {
                        canonical: {
                            kind: ensureString(canonical?.kind) || 'unassigned',
                            src: resolveCanonicalSrc(canonical?.src, approvedSources),
                            mimeType: ensureString(canonical?.mimeType) || null,
                            poster: resolveCanonicalSrc(canonical?.poster, approvedSources),
                            byteLength: ensureNumber(canonical?.byteLength),
                            sha256: ensureString(canonical?.sha256) || null,
                            pwaCompatible: canonical?.pwaCompatible === true,
                            browserCompatible: canonical?.browserCompatible === true,
                        },
                        backups,
                    },
                    sourceVerification: normalizeSourceVerification(lesson?.sourceVerification, sourceVerificationDefaults),
                    learningPacket,
                    attribution: {
                        sourceName: ensureString(lesson?.attribution?.sourceName) || null,
                        sourcePageUrl: ensureString(lesson?.attribution?.sourcePageUrl) || null,
                        licenseLabel: ensureString(lesson?.attribution?.licenseLabel) || null,
                        licenseUrl: ensureString(lesson?.attribution?.licenseUrl) || null,
                        rehostAllowed: lesson?.attribution?.rehostAllowed === true,
                        reviewedBy: ensureString(lesson?.attribution?.reviewedBy) || null,
                        reviewedAt: toIsoOrNull(lesson?.attribution?.reviewedAt),
                        evidenceUrl: ensureString(lesson?.attribution?.evidenceUrl) || null,
                    },
                    qa: {
                        verifiedAt: toIsoOrNull(lesson?.qa?.verifiedAt),
                        headStatus: ensureNumber(lesson?.qa?.headStatus),
                        contentType: ensureString(lesson?.qa?.contentType) || null,
                        rangeSupported: ensureBoolean(lesson?.qa?.rangeSupported),
                    },
                };
            });

            return {
                id: categoryId,
                title: ensureString(category?.title),
                titleVi: ensureString(category?.titleVi),
                icon: ensureString(category?.icon),
                color: ensureString(category?.color),
                order: categoryOrder,
                lessons,
            };
        });

        return {
            id: levelId,
            level: ensureString(level?.level),
            title: ensureString(level?.title),
            titleVi: ensureString(level?.titleVi),
            ageRange: ensureString(level?.ageRange),
            icon: ensureString(level?.icon),
            color: ensureString(level?.color),
            order: levelOrder,
            categories,
        };
    });

    return {
        schemaVersion: Number.isFinite(catalog?.schemaVersion) ? catalog.schemaVersion : 1,
        updatedAt: toIsoOrNull(catalog?.updatedAt) || new Date().toISOString(),
        policy: catalog?.policy || {},
        levels,
    };
}

export function flattenLessons(levels) {
    const result = [];

    for (const level of ensureArray(levels)) {
        for (const category of ensureArray(level.categories)) {
            for (const lesson of ensureArray(category.lessons)) {
                result.push({ level, category, lesson });
            }
        }
    }

    return result;
}

function countStatuses(lessons) {
    return lessons.reduce((accumulator, entry) => {
        const status = entry.lesson.status || 'hidden';
        accumulator[status] = (accumulator[status] || 0) + 1;
        return accumulator;
    }, {});
}

export function getManifestVersion(catalog, approvedSources) {
    const digest = createHash('sha256')
        .update(JSON.stringify({ catalog, approvedSources }))
        .digest('hex')
        .slice(0, 12);
    return `video-lessons-${digest}`;
}

export function buildVideoLessonManifest(catalog, approvedSources) {
    const normalizedCatalog = normalizeCatalog(catalog, approvedSources);
    const flattened = flattenLessons(normalizedCatalog.levels);
    const statusCounts = countStatuses(flattened);
    const publicLevels = getPublicLevels({ levels: normalizedCatalog.levels });
    const publicFlattened = flattenLessons(publicLevels);
    const totalQuizQuestions = flattened.reduce((sum, entry) => sum + getLearningPacketQuestionCount(entry.lesson.learningPacket), 0);
    const publicQuizQuestions = publicFlattened.reduce((sum, entry) => sum + getLearningPacketQuestionCount(entry.lesson.learningPacket), 0);
    const version = getManifestVersion(normalizedCatalog, approvedSources);

    const manifest = {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        version,
        policy: {
            mediaHost: approvedSources?.mediaHost || {},
            allowedCanonicalKinds: ensureArray(approvedSources?.allowedCanonicalKinds),
            blockedCanonicalKinds: ensureArray(approvedSources?.blockedCanonicalKinds),
            blockedDomains: ensureArray(approvedSources?.blockedDomains),
            publicLessonRequirements: ensureArray(normalizedCatalog?.policy?.publicLessonRequirements),
        },
        summary: {
            levelCount: normalizedCatalog.levels.length,
            categoryCount: normalizedCatalog.levels.reduce((sum, level) => sum + level.categories.length, 0),
            lessonCount: flattened.length,
            publicLessonCount: publicFlattened.length,
            totalQuizQuestionCount: totalQuizQuestions,
            publicQuizQuestionCount: publicQuizQuestions,
            hiddenLessonCount: statusCounts.hidden || 0,
            candidateLessonCount: statusCounts.candidate || 0,
            reviewQueueLessonCount: statusCounts.review_queue || 0,
            readyToPublishLessonCount: statusCounts.ready_to_publish || 0,
            blockedLessonCount: statusCounts.blocked || 0,
            draftLessonCount: statusCounts.draft || 0,
            retiredLessonCount: statusCounts.retired || 0,
            emptyPublicLevelCount: normalizedCatalog.levels.filter((level) => !publicLevels.some((entry) => entry.id === level.id)).length,
            mediaHostBaseUrl: approvedSources?.mediaHost?.baseUrl || null,
        },
        levels: normalizedCatalog.levels,
    };

    return manifest;
}

export function buildBaseQa(manifest, approvedSources) {
    const allLessons = flattenLessons(manifest.levels);
    const publicLessons = allLessons.filter((entry) => entry.lesson.status === 'public');
    const hiddenLessons = allLessons.filter((entry) => entry.lesson.status === 'hidden');

    return {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        version: manifest.version,
        summary: {
            totalLessons: allLessons.length,
            publicLessons: publicLessons.length,
            hiddenLessons: hiddenLessons.length,
            candidateLessons: allLessons.filter((entry) => entry.lesson.status === 'candidate').length,
            reviewQueueLessons: allLessons.filter((entry) => entry.lesson.status === 'review_queue').length,
            readyToPublishLessons: allLessons.filter((entry) => entry.lesson.status === 'ready_to_publish').length,
            blockedLessons: allLessons.filter((entry) => entry.lesson.status === 'blocked').length,
            draftLessons: allLessons.filter((entry) => entry.lesson.status === 'draft').length,
            retiredLessons: allLessons.filter((entry) => entry.lesson.status === 'retired').length,
            approvedDomainCount: new Set(getApprovedDomains(approvedSources)).size,
            findings: 0,
            pass: null,
        },
        audit: {
            status: 'not_run',
            checkedAt: null,
        },
        findings: [],
    };
}

export function getPublicLevels(manifest) {
    return ensureArray(manifest?.levels).map((level) => {
        const categories = ensureArray(level.categories).map((category) => ({
            ...category,
            lessons: ensureArray(category.lessons).filter((lesson) => lesson.status === 'public'),
        })).filter((category) => category.lessons.length > 0);

        return {
            ...level,
            categories,
        };
    }).filter((level) => level.categories.length > 0);
}

export function getApprovedDomains(approvedSources) {
    const domains = new Set();

    for (const domain of ensureArray(approvedSources?.mediaHost?.allowedDomains)) {
        if (ensureString(domain)) domains.add(ensureString(domain));
    }

    for (const entry of ensureArray(approvedSources?.approvedSources)) {
        if (ensureString(entry?.domain)) domains.add(ensureString(entry.domain));
    }

    return [...domains];
}

export function isBlockedDomain(hostname, approvedSources) {
    const blockedDomains = ensureArray(approvedSources?.blockedDomains).map((value) => ensureString(value)).filter(Boolean);
    return blockedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

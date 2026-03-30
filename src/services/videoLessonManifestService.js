const MANIFEST_PATH = 'data/video-manifests/video-lessons.json';
const QA_PATH = 'data/video-manifests/video-lessons.qa.json';
const REVIEW_QUEUE_PATH = 'data/video-manifests/video-lessons.review-queue.json';
const OPS_PATH = 'data/video-manifests/video-lessons.ops.json';

let manifestPromise = null;
let qaPromise = null;
let reviewQueuePromise = null;
let opsPromise = null;

function resolveBaseUrl() {
    return import.meta.env.BASE_URL || '/';
}

export function resolveVideoLessonAssetPath(relativePath) {
    if (!relativePath) return null;
    if (/^https?:\/\//i.test(relativePath)) return relativePath;
    return `${resolveBaseUrl()}${String(relativePath).replace(/^\/+/, '')}`;
}

async function loadJson(relativePath, errorPrefix) {
    const response = await fetch(resolveVideoLessonAssetPath(relativePath), {
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`${errorPrefix}_${response.status}`);
    }

    return response.json();
}

export async function loadVideoLessonManifest() {
    if (!manifestPromise) {
        manifestPromise = loadJson(MANIFEST_PATH, 'video_lessons_manifest')
            .catch((error) => {
                manifestPromise = null;
                throw error;
            });
    }

    return manifestPromise;
}

export async function loadVideoLessonQA() {
    if (!qaPromise) {
        qaPromise = loadJson(QA_PATH, 'video_lessons_qa')
            .catch((error) => {
                qaPromise = null;
                throw error;
            });
    }

    return qaPromise;
}

export async function loadVideoLessonReviewQueue() {
    if (!reviewQueuePromise) {
        reviewQueuePromise = loadJson(REVIEW_QUEUE_PATH, 'video_lessons_review_queue')
            .catch((error) => {
                reviewQueuePromise = null;
                throw error;
            });
    }

    return reviewQueuePromise;
}

export async function loadVideoLessonOps() {
    if (!opsPromise) {
        opsPromise = loadJson(OPS_PATH, 'video_lessons_ops')
            .catch((error) => {
                opsPromise = null;
                throw error;
            });
    }

    return opsPromise;
}

export function formatVideoLessonDuration(durationSeconds) {
    if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
        return '--:--';
    }

    const hours = Math.floor(durationSeconds / 3600);
    const minutes = Math.floor((durationSeconds % 3600) / 60);
    const seconds = durationSeconds % 60;

    if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function getPublicVideoLevels(manifest) {
    return getVisibleVideoLevels(manifest, { mode: 'public' });
}

export function getStudyVideoLevels(manifest) {
    return getVisibleVideoLevels(manifest, { mode: 'study' });
}

function isVisibleInReferenceMode(lesson) {
    return lesson?.status !== 'retired'
        && lesson?.status !== 'draft'
        && !!getVideoReferenceLink(lesson);
}

function hasCompleteStudyPacket(lesson) {
    const scriptSegments = Array.isArray(lesson?.learningPacket?.script?.segments)
        ? lesson.learningPacket.script.segments
        : [];
    const questions = Array.isArray(lesson?.learningPacket?.quiz?.questions)
        ? lesson.learningPacket.quiz.questions
        : Array.isArray(lesson?.quiz)
            ? lesson.quiz
            : [];

    return scriptSegments.length >= 4 && questions.length >= 5;
}

function isStudyVisibleLesson(lesson) {
    return lesson?.status !== 'retired'
        && lesson?.status !== 'draft'
        && hasCompleteStudyPacket(lesson)
        && (!!getCanonicalVideoSource(lesson) || !!getVideoReferenceLink(lesson));
}

export function getVisibleVideoLevels(manifest, options = {}) {
    const mode = options.mode || 'reference_fallback';
    return Array.isArray(manifest?.levels)
        ? manifest.levels
            .map((level) => ({
                ...level,
                categories: Array.isArray(level.categories)
                    ? level.categories
                        .map((category) => ({
                            ...category,
                            lessons: Array.isArray(category.lessons)
                                ? category.lessons.filter((lesson) => (
                                    mode === 'public'
                                        ? lesson.status === 'public'
                                        : mode === 'study'
                                            ? isStudyVisibleLesson(lesson)
                                            : (lesson.status === 'public' || isVisibleInReferenceMode(lesson))
                                ))
                                : [],
                        }))
                        .filter((category) => category.lessons.length > 0)
                    : [],
            }))
            .filter((level) => level.categories.length > 0)
        : [];
}

export function flattenPublicVideoLessons(manifest) {
    return flattenVisibleVideoLessons(manifest, { mode: 'public' });
}

export function flattenStudyVideoLessons(manifest) {
    return flattenVisibleVideoLessons(manifest, { mode: 'study' });
}

export function flattenVisibleVideoLessons(manifest, options = {}) {
    return getVisibleVideoLevels(manifest, options).flatMap((level) =>
        level.categories.flatMap((category) =>
            category.lessons.map((lesson) => ({
                ...lesson,
                level,
                category,
            }))
        )
    );
}

export function getLessonLearningPacket(lesson) {
    return lesson?.learningPacket || null;
}

export function getLessonQuizQuestions(lesson) {
    if (Array.isArray(lesson?.learningPacket?.quiz?.questions) && lesson.learningPacket.quiz.questions.length > 0) {
        return lesson.learningPacket.quiz.questions;
    }

    return Array.isArray(lesson?.quiz) ? lesson.quiz : [];
}

export function getLessonScriptSegments(lesson) {
    return Array.isArray(lesson?.learningPacket?.script?.segments)
        ? lesson.learningPacket.script.segments
        : [];
}

export function getLessonTimedScriptSegments(lesson) {
    return Array.isArray(lesson?.learningPacket?.script?.timedSegments)
        ? lesson.learningPacket.script.timedSegments
        : [];
}

export function getLessonFocusVocabulary(lesson) {
    return Array.isArray(lesson?.learningPacket?.focusVocabulary)
        ? lesson.learningPacket.focusVocabulary
        : [];
}

export function getLessonObjectives(lesson) {
    return Array.isArray(lesson?.learningPacket?.learningObjectives)
        ? lesson.learningPacket.learningObjectives
        : [];
}

export function getLessonPracticeBlocks(lesson) {
    return lesson?.learningPacket?.practice || null;
}

export function getLessonSubtitleVariant(lesson) {
    return lesson?.learningPacket?.script?.variant || 'companion';
}

export function getLessonSubtitleLabel(lesson) {
    return lesson?.learningPacket?.script?.publicLabel
        || (getLessonSubtitleVariant(lesson) === 'exact_timed' ? 'Exact Subtitles' : 'Companion Script');
}

export function getLessonCaptionTrack(lesson, language) {
    const script = lesson?.learningPacket?.script || {};
    if (language === 'en') {
        return script.captionsEnVtt || null;
    }
    if (language === 'vi') {
        return script.captionsViVtt || null;
    }
    return null;
}

export function getLessonReviewBadge(lesson) {
    const sourceVerification = lesson?.sourceVerification || {};
    if (sourceVerification.manualReviewStatus === 'approved' && sourceVerification.contentMatchStatus === 'aligned') {
        return {
            tone: 'approved',
            label: 'Reviewed source',
        };
    }

    if (sourceVerification.referenceHarvest?.confidence >= 0.72) {
        return {
            tone: 'approved',
            label: 'Reference matched',
        };
    }

    if (getVideoReferenceLink(lesson)) {
        return {
            tone: 'pending',
            label: 'Reference mode',
        };
    }

    return {
        tone: 'pending',
        label: 'Review pending',
    };
}

export function getCanonicalVideoSource(lesson) {
    const canonical = lesson?.playback?.canonical;
    if (!canonical?.src) return null;
    if (canonical.browserCompatible !== true) return null;
    return resolveVideoLessonAssetPath(canonical.src);
}

export function getCanonicalPosterSource(lesson) {
    const poster = lesson?.playback?.canonical?.poster;
    if (!poster) return null;
    return resolveVideoLessonAssetPath(poster);
}

export function getVideoReferenceLink(lesson) {
    const backup = Array.isArray(lesson?.playback?.backups)
        ? lesson.playback.backups.find((entry) => entry?.src)
        : null;
    return backup?.src || lesson?.attribution?.sourcePageUrl || null;
}

export function getVideoReferenceMeta(lesson) {
    const backup = Array.isArray(lesson?.playback?.backups)
        ? lesson.playback.backups.find((entry) => entry?.src)
        : null;
    return backup || null;
}

export function getYouTubeVideoId(url) {
    if (!url) return null;

    try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('youtu.be')) {
            return parsed.pathname.replace(/^\/+/, '') || null;
        }
        if (parsed.hostname.includes('youtube.com')) {
            return parsed.searchParams.get('v') || null;
        }
    } catch {
        return null;
    }

    return null;
}

export function getVideoReferenceEmbedSource(lesson) {
    const reference = getVideoReferenceLink(lesson);
    const youtubeId = getYouTubeVideoId(reference);
    if (!youtubeId) {
        return null;
    }

    return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`;
}

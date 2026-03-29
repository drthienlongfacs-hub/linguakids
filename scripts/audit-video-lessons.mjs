import { URL } from 'node:url';

import {
    buildBaseQa,
    buildVideoLessonManifest,
    flattenLessons,
    getApprovedDomains,
    isBlockedDomain,
    readJson,
    videoLessonApprovedSourcesPath,
    videoLessonCatalogPath,
    videoLessonManifestPath,
    videoLessonQaPath,
    writeJson,
} from './lib/videoLessonManifestShared.mjs';

function addFinding(findings, file, message, lessonId = null) {
    findings.push({
        file,
        lessonId,
        message,
    });
}

function isVideoContentType(contentType) {
    return /^video\//i.test(String(contentType || '').trim());
}

function isYouTubeSource(kind, src) {
    const haystack = `${String(kind || '').toLowerCase()} ${String(src || '').toLowerCase()}`;
    return haystack.includes('youtube') || haystack.includes('youtu.be') || haystack.includes('youtube-nocookie');
}

function hasBilingualSegments(lesson) {
    const segments = Array.isArray(lesson?.learningPacket?.script?.segments)
        ? lesson.learningPacket.script.segments
        : [];
    return segments.length >= 4
        && segments.every((segment) => segment?.en && segment?.vi);
}

function hasQuizDepth(lesson) {
    const questions = Array.isArray(lesson?.learningPacket?.quiz?.questions)
        ? lesson.learningPacket.quiz.questions
        : [];

    return questions.length >= 5
        && questions.every((question) =>
            question?.q
            && question?.qVi
            && Array.isArray(question?.options)
            && question.options.length >= 4
            && Number.isInteger(question?.answer)
            && question.answer >= 0
            && question.answer < question.options.length
        );
}

function hasLearningObjectives(lesson) {
    return Array.isArray(lesson?.learningPacket?.learningObjectives)
        && lesson.learningPacket.learningObjectives.length >= 3;
}

function hasPedagogicalFrame(lesson) {
    return Array.isArray(lesson?.learningPacket?.pedagogicalFrame?.learningScience)
        && lesson.learningPacket.pedagogicalFrame.learningScience.length >= 3;
}

async function probeVideoSource(url) {
    const baseHeaders = {
        'cache-control': 'no-cache',
        pragma: 'no-cache',
    };

    let response;
    let usedMethod = 'HEAD';

    try {
        response = await fetch(url, {
            method: 'HEAD',
            redirect: 'follow',
            headers: baseHeaders,
        });
    } catch {
        response = null;
    }

    if (!response || !response.ok) {
        usedMethod = 'GET';
        response = await fetch(url, {
            method: 'GET',
            redirect: 'follow',
            headers: {
                ...baseHeaders,
                Range: 'bytes=0-0',
            },
        });
    }

    const contentType = response.headers.get('content-type');
    const acceptRanges = response.headers.get('accept-ranges');
    const contentRange = response.headers.get('content-range');
    const rangeSupported = (typeof acceptRanges === 'string' && acceptRanges.toLowerCase().includes('bytes'))
        || response.status === 206
        || typeof contentRange === 'string';

    return {
        ok: response.ok,
        status: response.status,
        finalUrl: response.url || url,
        contentType,
        rangeSupported,
        usedMethod,
    };
}

async function main() {
    const catalog = await readJson(videoLessonCatalogPath);
    const approvedSources = await readJson(videoLessonApprovedSourcesPath);
    const manifest = buildVideoLessonManifest(catalog, approvedSources);
    const qa = buildBaseQa(manifest, approvedSources);
    const findings = [];
    const approvedDomains = getApprovedDomains(approvedSources);

    await writeJson(videoLessonManifestPath, manifest);

    const flattened = flattenLessons(manifest.levels);
    const publicEntries = flattened.filter((entry) => entry.lesson.status === 'public');
    const allQuestionCount = flattened.reduce((sum, entry) => sum + (entry.lesson.learningPacket?.quiz?.questions?.length || 0), 0);

    const lessonIds = new Set();
    const canonicalSrcs = new Set();

    for (const entry of flattened) {
        const { lesson } = entry;
        if (!lesson.id) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Lesson is missing a stable id.', null);
            continue;
        }

        if (!lesson.learningPacket) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Lesson is missing a learningPacket.', lesson.id);
        }

        if (!lesson.sourceVerification) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Lesson is missing sourceVerification metadata.', lesson.id);
        }

        if (lessonIds.has(lesson.id)) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Duplicate lesson id detected.', lesson.id);
        } else {
            lessonIds.add(lesson.id);
        }
    }

    for (const entry of publicEntries) {
        const { lesson } = entry;
        const canonical = lesson.playback?.canonical || {};

        if (!canonical.src || !canonical.kind || canonical.kind === 'unassigned') {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson is missing canonical playback metadata.', lesson.id);
            continue;
        }

        if (canonicalSrcs.has(canonical.src)) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Duplicate canonical source URL detected.', lesson.id);
        } else {
            canonicalSrcs.add(canonical.src);
        }

        if (isYouTubeSource(canonical.kind, canonical.src)) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson may not use YouTube as the canonical playback source.', lesson.id);
        }

        if (!approvedSources?.allowedCanonicalKinds?.includes(canonical.kind)) {
            addFinding(findings, 'content/video-lessons/catalog.json', `Canonical playback kind "${canonical.kind}" is not approved.`, lesson.id);
        }

        if (!canonical.mimeType || !isVideoContentType(canonical.mimeType)) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson must declare a video/* canonical mimeType.', lesson.id);
        }

        if (canonical.browserCompatible !== true || canonical.pwaCompatible !== true) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson must be marked browserCompatible and pwaCompatible.', lesson.id);
        }

        if (!lesson.attribution?.licenseLabel || !lesson.attribution?.licenseUrl || lesson.attribution?.rehostAllowed !== true) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson must include approved license metadata and rehostAllowed: true.', lesson.id);
        }

        if (!lesson.attribution?.reviewedAt || !lesson.attribution?.reviewedBy || !lesson.attribution?.evidenceUrl) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson must include reviewedBy, reviewedAt, and evidenceUrl.', lesson.id);
        }

        if (!hasLearningObjectives(lesson)) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson must include at least three learning objectives.', lesson.id);
        }

        if (!hasBilingualSegments(lesson)) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson must include a bilingual script with at least four EN/VI segments.', lesson.id);
        }

        if (!hasQuizDepth(lesson)) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson must include at least five validated quiz questions.', lesson.id);
        }

        if (!hasPedagogicalFrame(lesson)) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson must declare its learning-science guardrails.', lesson.id);
        }

        if (lesson?.sourceVerification?.manualReviewStatus !== 'approved') {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson sourceVerification.manualReviewStatus must be "approved".', lesson.id);
        }

        if (lesson?.sourceVerification?.contentMatchStatus !== 'aligned') {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson sourceVerification.contentMatchStatus must be "aligned".', lesson.id);
        }

        if (!lesson?.sourceVerification?.reviewedAt || !lesson?.sourceVerification?.reviewedBy || !lesson?.sourceVerification?.evidenceUrl) {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Public lesson sourceVerification must include reviewedBy, reviewedAt, and evidenceUrl.', lesson.id);
        }

        let parsedUrl;
        try {
            parsedUrl = new URL(canonical.src);
        } catch {
            addFinding(findings, 'content/video-lessons/catalog.json', 'Canonical source URL is not a valid absolute URL.', lesson.id);
            continue;
        }

        const hostname = parsedUrl.hostname.toLowerCase();
        const isApprovedDomain = approvedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
        if (!isApprovedDomain) {
            addFinding(findings, 'content/video-lessons/catalog.json', `Canonical source host "${hostname}" is not approved.`, lesson.id);
        }

        if (isBlockedDomain(hostname, approvedSources)) {
            addFinding(findings, 'content/video-lessons/catalog.json', `Canonical source host "${hostname}" is blocked.`, lesson.id);
        }

        try {
            const probe = await probeVideoSource(canonical.src);
            lesson.qa = {
                verifiedAt: new Date().toISOString(),
                headStatus: probe.status,
                contentType: probe.contentType || null,
                rangeSupported: probe.rangeSupported,
            };

            if (!probe.ok) {
                addFinding(findings, 'content/video-lessons/catalog.json', `Canonical source probe returned HTTP ${probe.status}.`, lesson.id);
            }

            if (!isVideoContentType(probe.contentType)) {
                addFinding(findings, 'content/video-lessons/catalog.json', `Canonical source content-type "${probe.contentType || 'unknown'}" is not video/*.`, lesson.id);
            }

            if (!probe.rangeSupported) {
                addFinding(findings, 'content/video-lessons/catalog.json', 'Canonical source must support byte-range requests.', lesson.id);
            }
        } catch (error) {
            lesson.qa = {
                verifiedAt: new Date().toISOString(),
                headStatus: null,
                contentType: null,
                rangeSupported: false,
            };
            addFinding(findings, 'content/video-lessons/catalog.json', `Canonical source probe failed: ${error.message || String(error)}`, lesson.id);
        }
    }

    const recomputedPublicCount = flattenLessons(manifest.levels).filter((entry) => entry.lesson.status === 'public').length;
    if (recomputedPublicCount !== manifest.summary.publicLessonCount) {
        addFinding(findings, 'public/data/video-manifests/video-lessons.json', 'Hidden lessons are leaking into public summary counts.', null);
    }

    qa.generatedAt = new Date().toISOString();
    qa.audit = {
        status: findings.length === 0 ? 'pass' : 'fail',
        checkedAt: new Date().toISOString(),
    };
    qa.summary.findings = findings.length;
    qa.summary.pass = findings.length === 0;
    qa.summary.totalQuizQuestions = allQuestionCount;
    qa.summary.totalBilingualScripts = flattened.filter((entry) => hasBilingualSegments(entry.lesson)).length;
    qa.summary.totalSourceVerificationRecords = flattened.filter((entry) => entry.lesson.sourceVerification).length;
    qa.findings = findings;

    await writeJson(videoLessonManifestPath, manifest);
    await writeJson(videoLessonQaPath, qa);

    console.log(JSON.stringify({
        summary: {
            checks: publicEntries.length + flattened.length + 4,
            findings: findings.length,
            pass: findings.length === 0,
        },
        runtimeChecks: [
            {
                name: 'video_lessons_manifest_roundtrip',
                pass: findings.length === 0,
                totalLessons: flattened.length,
                publicLessons: publicEntries.length,
                hiddenLessons: flattened.filter((entry) => entry.lesson.status === 'hidden').length,
            },
        ],
        findings,
    }, null, 2));

    if (findings.length > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

import {
    flattenLessons,
    normalizeCatalog,
    readJson,
    videoLessonAlignmentQaPath,
    videoLessonApprovedSourcesPath,
    videoLessonCatalogPath,
    writeJson,
} from './lib/videoLessonManifestShared.mjs';

function normalizeTokens(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

function scoreTokenOverlap(expectedTokens, actualTokens) {
    if (expectedTokens.length === 0 || actualTokens.length === 0) {
        return 0;
    }

    const actualSet = new Set(actualTokens);
    const matched = expectedTokens.filter((token) => actualSet.has(token));
    return matched.length / expectedTokens.length;
}

async function fetchOEmbed(referenceUrl) {
    const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(referenceUrl)}&format=json`;
    const response = await fetch(endpoint, {
        headers: {
            'cache-control': 'no-cache',
            pragma: 'no-cache',
        },
    });

    if (!response.ok) {
        throw new Error(`oembed_${response.status}`);
    }

    return response.json();
}

function computeStatus(score, channelMatch, titleMatch) {
    if (titleMatch && (channelMatch || score >= 0.5)) {
        return 'aligned';
    }

    if (score >= 0.35 || channelMatch) {
        return 'suspect';
    }

    return 'mismatch';
}

function buildExpectedTokens(entry) {
    const lesson = entry.lesson;
    const sourceVerification = lesson.sourceVerification || {};
    return normalizeTokens([
        lesson.title,
        lesson.titleVi,
        sourceVerification.expectedTitle,
        sourceVerification.expectedTitleVi,
        lesson.category?.title,
        entry.category?.title,
        entry.level?.title,
        ...(Array.isArray(sourceVerification.expectedKeywords) ? sourceVerification.expectedKeywords : []),
    ].join(' '));
}

async function mapWithConcurrency(items, limit, worker) {
    const results = new Array(items.length);
    let nextIndex = 0;

    async function runWorker() {
        while (nextIndex < items.length) {
            const currentIndex = nextIndex;
            nextIndex += 1;
            results[currentIndex] = await worker(items[currentIndex], currentIndex);
        }
    }

    await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, () => runWorker()));
    return results;
}

async function main() {
    const catalog = await readJson(videoLessonCatalogPath);
    const approvedSources = await readJson(videoLessonApprovedSourcesPath);
    const normalized = normalizeCatalog(catalog, approvedSources);
    const flattened = flattenLessons(normalized.levels);

    const legacyEntries = flattened.filter((entry) =>
        Array.isArray(entry.lesson.playback?.backups)
        && entry.lesson.playback.backups.some((backup) => backup?.kind === 'youtube_watch' && backup?.src)
    );

    const results = await mapWithConcurrency(legacyEntries, 8, async (entry) => {
        const backup = entry.lesson.playback.backups.find((item) => item?.kind === 'youtube_watch' && item?.src);
        const expectedTokens = buildExpectedTokens(entry);

        try {
            const oembed = await fetchOEmbed(backup.src);
            const actualTitle = String(oembed?.title || '').trim();
            const actualAuthor = String(oembed?.author_name || '').trim();
            const actualTokens = normalizeTokens(`${actualTitle} ${actualAuthor}`);
            const score = scoreTokenOverlap(expectedTokens, actualTokens);
            const expectedChannel = String(entry.lesson.sourceVerification?.expectedChannel || entry.lesson.channel || '').trim().toLowerCase();
            const channelMatch = expectedChannel
                ? actualAuthor.toLowerCase().includes(expectedChannel) || expectedChannel.includes(actualAuthor.toLowerCase())
                : false;
            const titleMatch = actualTitle.toLowerCase().includes(entry.lesson.title.toLowerCase())
                || entry.lesson.title.toLowerCase().includes(actualTitle.toLowerCase());
            const status = computeStatus(score, channelMatch, titleMatch);

            return {
                lessonId: entry.lesson.id,
                expectedTitle: entry.lesson.title,
                expectedCategory: entry.category.title,
                expectedChannel: entry.lesson.sourceVerification?.expectedChannel || entry.lesson.channel || null,
                legacyReferenceUrl: backup.src,
                legacyReferenceId: backup.youtubeId || null,
                actualTitle,
                actualAuthor,
                tokenOverlapScore: Number(score.toFixed(3)),
                channelMatch,
                titleMatch,
                status,
            };
        } catch (error) {
            return {
                lessonId: entry.lesson.id,
                expectedTitle: entry.lesson.title,
                expectedCategory: entry.category.title,
                expectedChannel: entry.lesson.sourceVerification?.expectedChannel || entry.lesson.channel || null,
                legacyReferenceUrl: backup.src,
                legacyReferenceId: backup.youtubeId || null,
                actualTitle: null,
                actualAuthor: null,
                tokenOverlapScore: 0,
                channelMatch: false,
                titleMatch: false,
                status: 'unreachable',
                error: error.message || String(error),
            };
        }
    });

    const summary = {
        checkedAt: new Date().toISOString(),
        lessonCount: legacyEntries.length,
        alignedCount: results.filter((entry) => entry.status === 'aligned').length,
        suspectCount: results.filter((entry) => entry.status === 'suspect').length,
        mismatchCount: results.filter((entry) => entry.status === 'mismatch').length,
        unreachableCount: results.filter((entry) => entry.status === 'unreachable').length,
    };

    const output = {
        schemaVersion: 1,
        summary,
        results,
    };

    await writeJson(videoLessonAlignmentQaPath, output);
    console.log(JSON.stringify(summary, null, 2));

    if (summary.mismatchCount > 0 || summary.unreachableCount > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

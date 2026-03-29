import {
    readJson,
    videoLessonCatalogPath,
    writeJson,
} from './lib/videoLessonManifestShared.mjs';

function ensureString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function normalizeTokens(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

function overlapScore(expectedTokens, actualText) {
    const actualTokens = new Set(normalizeTokens(actualText));
    if (expectedTokens.length === 0 || actualTokens.size === 0) {
        return 0;
    }

    const matched = expectedTokens.filter((token) => actualTokens.has(token));
    return matched.length / expectedTokens.length;
}

function channelScore(expectedChannel, actualChannel) {
    const expected = ensureString(expectedChannel).toLowerCase();
    const actual = ensureString(actualChannel).toLowerCase();
    if (!expected || !actual) return 0;
    if (actual.includes(expected) || expected.includes(actual)) return 1;

    const expectedTokens = normalizeTokens(expected);
    const actualTokens = new Set(normalizeTokens(actual));
    if (expectedTokens.length === 0) return 0;
    const matched = expectedTokens.filter((token) => actualTokens.has(token));
    return matched.length / expectedTokens.length;
}

function keywordScore(expectedKeywords, actualText) {
    const keywords = Array.isArray(expectedKeywords)
        ? expectedKeywords.map((value) => ensureString(value)).filter(Boolean)
        : [];
    if (keywords.length === 0) return 0;
    return overlapScore(normalizeTokens(keywords.join(' ')), actualText);
}

function buildQuery(lesson) {
    const expectedTitle = ensureString(lesson?.sourceVerification?.expectedTitle) || ensureString(lesson?.title);
    const expectedChannel = ensureString(lesson?.sourceVerification?.expectedChannel) || ensureString(lesson?.channel);
    return [expectedTitle, expectedChannel, 'english lesson'].filter(Boolean).join(' ');
}

function getExpectedTokens(lesson) {
    const title = ensureString(lesson?.sourceVerification?.expectedTitle) || ensureString(lesson?.title);
    return normalizeTokens(title);
}

function extractVideoRenderers(node, bucket = []) {
    if (!node) return bucket;

    if (Array.isArray(node)) {
        node.forEach((entry) => extractVideoRenderers(entry, bucket));
        return bucket;
    }

    if (typeof node === 'object') {
        if (node.videoRenderer) {
            bucket.push(node.videoRenderer);
        }
        Object.values(node).forEach((value) => extractVideoRenderers(value, bucket));
    }

    return bucket;
}

async function searchYouTube(query) {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
        signal: AbortSignal.timeout(10000),
        headers: {
            'user-agent': 'Mozilla/5.0',
            'accept-language': 'en-US,en;q=0.9',
            'cache-control': 'no-cache',
        },
    });
    if (!response.ok) {
        throw new Error(`youtube_search_http_${response.status}`);
    }
    const html = await response.text();
    const match = html.match(/var ytInitialData = (.*?);<\/script>/s)
        || html.match(/window\["ytInitialData"\] = (.*?);<\/script>/s);
    if (!match?.[1]) {
        throw new Error('youtube_search_missing_initial_data');
    }

    const parsed = JSON.parse(match[1]);
    const renderers = extractVideoRenderers(parsed);
    return renderers.map((renderer) => ({
        videoId: renderer.videoId || null,
        title: Array.isArray(renderer?.title?.runs)
            ? renderer.title.runs.map((entry) => entry.text || '').join('')
            : '',
        channel: Array.isArray(renderer?.ownerText?.runs)
            ? renderer.ownerText.runs.map((entry) => entry.text || '').join('')
            : '',
    })).filter((entry) => entry.videoId && entry.title).slice(0, 8);
}

function scoreCandidate(lesson, candidate) {
    const expectedTitle = ensureString(lesson?.sourceVerification?.expectedTitle) || ensureString(lesson?.title);
    const expectedChannel = ensureString(lesson?.sourceVerification?.expectedChannel) || ensureString(lesson?.channel);
    const expectedKeywords = lesson?.sourceVerification?.expectedKeywords || [];
    const titleScore = overlapScore(getExpectedTokens(lesson), candidate.title);
    const ownerScore = channelScore(expectedChannel, candidate.channel);
    const keywords = keywordScore(expectedKeywords, `${candidate.title} ${candidate.channel}`);
    const exactPhraseBonus = candidate.title.toLowerCase().includes(expectedTitle.toLowerCase()) ? 0.15 : 0;

    const score = Math.min(
        1,
        (titleScore * 0.55) + (ownerScore * 0.3) + (keywords * 0.15) + exactPhraseBonus
    );

    return {
        ...candidate,
        titleScore: Number(titleScore.toFixed(3)),
        channelScore: Number(ownerScore.toFixed(3)),
        keywordScore: Number(keywords.toFixed(3)),
        confidence: Number(score.toFixed(3)),
    };
}

function classifyConfidence(score) {
    if (score >= 0.72) return 'aligned';
    if (score >= 0.42) return 'suspect';
    return 'mismatch';
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
    const catalog = await readJson(videoLessonCatalogPath);
    const updatedAt = new Date().toISOString();
    const summary = {
        updatedAt,
        lessonCount: 0,
        harvested: 0,
        aligned: 0,
        suspect: 0,
        mismatch: 0,
        failed: 0,
    };

    for (const level of catalog.levels) {
        for (const category of level.categories) {
            for (const lesson of category.lessons) {
                summary.lessonCount += 1;
                const query = buildQuery(lesson);
                if (summary.lessonCount % 10 === 0) {
                    console.log(`Harvesting reference ${summary.lessonCount}/120: ${lesson.id} :: ${query}`);
                }

                try {
                    const results = await searchYouTube(query);
                    const ranked = results
                        .map((candidate) => scoreCandidate(lesson, candidate))
                        .sort((a, b) => b.confidence - a.confidence)
                        .slice(0, 5);
                    const best = ranked[0];

                    if (!best) {
                        summary.failed += 1;
                        continue;
                    }

                    const harvestedStatus = classifyConfidence(best.confidence);
                    summary.harvested += 1;
                    summary[harvestedStatus] += 1;

                    const watchUrl = `https://www.youtube.com/watch?v=${best.videoId}`;
                    const existingBackups = Array.isArray(lesson?.playback?.backups) ? lesson.playback.backups : [];
                    const legacyBackup = existingBackups.find((entry) => ensureString(entry?.src) && ensureString(entry?.src) !== watchUrl);

                    lesson.playback.backups = [
                        {
                            kind: 'youtube_watch',
                            src: watchUrl,
                            label: 'Harvested YouTube reference',
                            youtubeId: best.videoId,
                            title: best.title,
                            channel: best.channel,
                            confidence: best.confidence,
                            source: 'youtube_search',
                        },
                        ...(legacyBackup ? [{
                            ...legacyBackup,
                            label: legacyBackup.label || 'Legacy YouTube reference',
                        }] : []),
                    ];

                    lesson.sourceVerification.contentMatchStatus = harvestedStatus;
                    lesson.sourceVerification.automatedCheckStatus = 'harvested_reference';
                    lesson.sourceVerification.automatedMatchScore = best.confidence;
                    lesson.sourceVerification.referenceHarvest = {
                        source: 'youtube_search',
                        query,
                        confidence: best.confidence,
                        harvestedTitle: best.title,
                        harvestedChannel: best.channel,
                        harvestedUrl: watchUrl,
                        harvestedAt: updatedAt,
                    };
                } catch {
                    summary.failed += 1;
                }

                await sleep(100);
            }
        }
    }

    catalog.updatedAt = updatedAt;
    await writeJson(videoLessonCatalogPath, catalog);
    console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

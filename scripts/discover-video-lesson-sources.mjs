import { URL } from 'node:url';

import {
    getApprovedDomains,
    normalizeCatalog,
    readJson,
    videoLessonApprovedSourcesPath,
    videoLessonCatalogPath,
    videoLessonDiscoveryQaPath,
    videoLessonSourceCandidatesPath,
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

function overlapScore(expectedTokens, actualTokens) {
    if (expectedTokens.length === 0 || actualTokens.length === 0) {
        return 0;
    }

    const actualSet = new Set(actualTokens);
    const matched = expectedTokens.filter((token) => actualSet.has(token));
    return matched.length / expectedTokens.length;
}

function isApprovedCandidate(candidate, approvedDomains) {
    try {
        const hostname = new URL(candidate.url).hostname.toLowerCase();
        return approvedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
    } catch {
        return false;
    }
}

async function main() {
    const catalog = await readJson(videoLessonCatalogPath);
    const approvedSources = await readJson(videoLessonApprovedSourcesPath);
    const candidateIndex = await readJson(videoLessonSourceCandidatesPath).catch(() => ({
        schemaVersion: 1,
        candidates: [],
    }));
    const normalized = normalizeCatalog(catalog, approvedSources);
    const approvedDomains = getApprovedDomains(approvedSources);

    const lessons = normalized.levels.flatMap((level) =>
        level.categories.flatMap((category) =>
            category.lessons.map((lesson) => ({
                lesson,
                level,
                category,
            }))
        )
    );

    const candidates = Array.isArray(candidateIndex?.candidates) ? candidateIndex.candidates : [];

    const results = lessons.map(({ lesson, level, category }) => {
        const expectedTokens = normalizeTokens([
            lesson.title,
            lesson.titleVi,
            category.title,
            level.title,
            ...(lesson?.sourceVerification?.expectedKeywords || []),
        ].join(' '));

        const ranked = candidates
            .filter((candidate) => isApprovedCandidate(candidate, approvedDomains))
            .map((candidate) => {
                const searchable = [
                    candidate.title,
                    candidate.channel,
                    ...(candidate.keywords || []),
                ].join(' ');
                const score = overlapScore(expectedTokens, normalizeTokens(searchable));
                return {
                    candidateId: ensureString(candidate.id) || null,
                    url: ensureString(candidate.url) || null,
                    title: ensureString(candidate.title) || null,
                    channel: ensureString(candidate.channel) || null,
                    evidenceUrl: ensureString(candidate.evidenceUrl) || null,
                    licenseLabel: ensureString(candidate.licenseLabel) || null,
                    licenseUrl: ensureString(candidate.licenseUrl) || null,
                    rehostAllowed: candidate.rehostAllowed === true,
                    score: Number(score.toFixed(3)),
                };
            })
            .filter((candidate) => candidate.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);

        return {
            lessonId: lesson.id,
            title: lesson.title,
            levelId: level.id,
            categoryId: category.id,
            approvedCandidateCount: ranked.length,
            topCandidates: ranked,
        };
    });

    const output = {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        summary: {
            lessonCount: results.length,
            sourceInventoryCount: candidates.length,
            approvedSourceInventoryCount: candidates.filter((candidate) => isApprovedCandidate(candidate, approvedDomains)).length,
            lessonsWithMatches: results.filter((entry) => entry.approvedCandidateCount > 0).length,
        },
        results,
    };

    await writeJson(videoLessonDiscoveryQaPath, output);
    console.log(JSON.stringify(output.summary, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

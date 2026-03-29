import { URL } from 'node:url';

import {
    getApprovedDomains,
    normalizeCatalog,
    readJson,
    videoLessonApprovedSourcesPath,
    videoLessonCatalogPath,
} from './lib/videoLessonManifestShared.mjs';

function isVideoContentType(contentType) {
    return /^video\//i.test(String(contentType || '').trim());
}

function isTextTrackContentType(contentType) {
    return /^(text\/vtt|text\/plain|application\/x-subrip|application\/octet-stream)/i.test(String(contentType || '').trim());
}

async function probe(url, expected = 'any') {
    const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
            'cache-control': 'no-cache',
            pragma: 'no-cache',
        },
    });

    const contentType = response.headers.get('content-type');
    const ok = response.ok
        && (
            expected === 'any'
            || (expected === 'video' && isVideoContentType(contentType))
            || (expected === 'track' && isTextTrackContentType(contentType))
            || (expected === 'image' && String(contentType || '').toLowerCase().startsWith('image/'))
        );

    return {
        ok,
        status: response.status,
        contentType,
        finalUrl: response.url || url,
    };
}

async function main() {
    const catalog = await readJson(videoLessonCatalogPath);
    const approvedSources = await readJson(videoLessonApprovedSourcesPath);
    const normalized = normalizeCatalog(catalog, approvedSources);
    const approvedDomains = getApprovedDomains(approvedSources);
    const findings = [];

    for (const level of normalized.levels) {
        for (const category of level.categories) {
            for (const lesson of category.lessons) {
                const canonical = lesson?.playback?.canonical || {};
                if (!canonical.src) {
                    continue;
                }

                try {
                    const hostname = new URL(canonical.src).hostname.toLowerCase();
                    const approved = approvedDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
                    if (!approved) {
                        findings.push({ lessonId: lesson.id, check: 'canonical_domain', pass: false, message: `Host ${hostname} is not approved.` });
                        continue;
                    }
                } catch {
                    findings.push({ lessonId: lesson.id, check: 'canonical_url', pass: false, message: 'Canonical URL is invalid.' });
                    continue;
                }

                const videoProbe = await probe(canonical.src, 'video').catch((error) => ({
                    ok: false,
                    status: null,
                    contentType: null,
                    finalUrl: canonical.src,
                    error: error.message || String(error),
                }));
                findings.push({
                    lessonId: lesson.id,
                    check: 'canonical_video',
                    pass: videoProbe.ok,
                    message: videoProbe.ok ? 'ok' : `Video check failed (${videoProbe.status || 'network_error'})`,
                    contentType: videoProbe.contentType,
                });

                if (canonical.poster) {
                    const posterProbe = await probe(canonical.poster, 'image').catch((error) => ({
                        ok: false,
                        status: null,
                        contentType: null,
                        error: error.message || String(error),
                    }));
                    findings.push({
                        lessonId: lesson.id,
                        check: 'poster_image',
                        pass: posterProbe.ok,
                        message: posterProbe.ok ? 'ok' : `Poster check failed (${posterProbe.status || 'network_error'})`,
                        contentType: posterProbe.contentType,
                    });
                }

                const script = lesson?.learningPacket?.script || {};
                if (script.variant === 'exact_timed') {
                    for (const [key, url] of [
                        ['captions_en_vtt', script.captionsEnVtt],
                        ['captions_vi_vtt', script.captionsViVtt],
                    ]) {
                        const trackProbe = await probe(url, 'track').catch((error) => ({
                            ok: false,
                            status: null,
                            contentType: null,
                            error: error.message || String(error),
                        }));
                        findings.push({
                            lessonId: lesson.id,
                            check: key,
                            pass: trackProbe.ok,
                            message: trackProbe.ok ? 'ok' : `Track check failed (${trackProbe.status || 'network_error'})`,
                            contentType: trackProbe.contentType,
                        });
                    }
                }
            }
        }
    }

    const summary = {
        totalChecks: findings.length,
        failures: findings.filter((entry) => !entry.pass).length,
        pass: findings.every((entry) => entry.pass),
    };

    console.log(JSON.stringify({ summary, findings }, null, 2));
    if (!summary.pass) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

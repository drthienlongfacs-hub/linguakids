import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

function parseArgs(argv) {
    const options = {};

    for (let index = 0; index < argv.length; index += 1) {
        const token = argv[index];
        if (!token.startsWith('--')) {
            continue;
        }

        const key = token.slice(2);
        const next = argv[index + 1];
        if (!next || next.startsWith('--')) {
            options[key] = 'true';
            continue;
        }

        options[key] = next;
        index += 1;
    }

    return options;
}

function extractAsset(html, pattern, label) {
    const match = html.match(pattern);
    if (!match?.[1]) {
        throw new Error(`Could not find ${label} in dist HTML`);
    }
    return match[1];
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchHtml(url) {
    const bust = `${url.includes('?') ? '&' : '?'}verify=${Date.now()}`;
    const response = await fetch(`${url}${bust}`, {
        headers: {
            'cache-control': 'no-cache',
            pragma: 'no-cache',
        },
    });

    if (!response.ok) {
        throw new Error(`Live site returned HTTP ${response.status}`);
    }

    return response.text();
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const distPath = args.dist || 'dist/index.html';
    const site = args.site || 'https://drthienlongfacs-hub.github.io/linguakids/';
    const manifestPath = args.manifest || path.join(path.dirname(distPath), 'data', 'video-manifests', 'video-lessons.json');
    const timeoutMs = Number(args['timeout-ms'] || 900000);
    const intervalMs = Number(args['interval-ms'] || 20000);

    const distHtml = await readFile(distPath, 'utf8');
    const localManifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    const markers = [
        extractAsset(distHtml, /<script[^>]+src="([^"]+\/assets\/[^"]+\.js)"/, 'JS asset'),
        extractAsset(distHtml, /<link[^>]+href="([^"]+\/assets\/[^"]+\.css)"/, 'CSS asset'),
        extractAsset(distHtml, /serviceWorker\.register\('([^']+sw\.js)'/, 'service worker path'),
    ];
    const manifestChecks = [
        {
            label: 'video manifest',
            url: new URL('data/video-manifests/video-lessons.json', site).toString(),
            expectedVersion: localManifest.version,
        },
        {
            label: 'review queue',
            url: new URL('data/video-manifests/video-lessons.review-queue.json', site).toString(),
            expectedVersion: localManifest.version,
        },
        {
            label: 'ops manifest',
            url: new URL('data/video-manifests/video-lessons.ops.json', site).toString(),
            expectedVersion: localManifest.version,
        },
    ];

    console.log(`Verifying live deployment for ${site}`);
    console.log(`Expected markers: ${markers.join(', ')}`);
    console.log(`Expected video manifest version: ${localManifest.version}`);

    const deadline = Date.now() + timeoutMs;
    let attempt = 0;

    while (Date.now() <= deadline) {
        attempt += 1;

        try {
            const liveHtml = await fetchHtml(site);
            const missing = markers.filter((marker) => !liveHtml.includes(marker));
            const manifestResults = [];

            for (const manifestCheck of manifestChecks) {
                try {
                    const liveManifestResponse = await fetch(`${manifestCheck.url}?verify=${Date.now()}`, {
                        headers: {
                            'cache-control': 'no-cache',
                            pragma: 'no-cache',
                        },
                    });

                    if (!liveManifestResponse.ok) {
                        throw new Error(`HTTP ${liveManifestResponse.status}`);
                    }

                    const liveManifest = await liveManifestResponse.json();
                    manifestResults.push({
                        label: manifestCheck.label,
                        version: liveManifest?.version || null,
                        pass: liveManifest?.version === manifestCheck.expectedVersion,
                    });
                } catch (error) {
                    manifestResults.push({
                        label: manifestCheck.label,
                        version: null,
                        pass: false,
                        error: error.message,
                    });
                }
            }

            if (missing.length === 0 && manifestResults.every((result) => result.pass)) {
                console.log(`Live deployment verified on attempt ${attempt}.`);
                return;
            }

            const manifestSummary = manifestResults
                .map((result) => `${result.label}=${result.version || result.error || 'unavailable'}`)
                .join(', ');
            console.log(
                `Attempt ${attempt}: live HTML missing ${missing.length} marker(s); ${manifestSummary}`
            );
        } catch (error) {
            console.log(`Attempt ${attempt}: ${error.message}`);
        }

        if (Date.now() + intervalMs > deadline) {
            break;
        }

        await sleep(intervalMs);
    }

    throw new Error(`Timed out after ${Math.round(timeoutMs / 1000)}s waiting for live deployment.`);
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});

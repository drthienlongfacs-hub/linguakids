import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const repoRoot = new URL('..', import.meta.url).pathname;

const requiredFiles = [
    'src/services/kidsLibraryHarvestService.js',
    'src/pages/KidsLibrary.jsx',
    'src/pages/Home.jsx',
    'src/pages/ParentDashboard.jsx',
    'src/App.jsx',
    'docs/khan-kids-harvest-2026-03-29.md',
];

const requiredPatterns = [
    { file: 'src/App.jsx', pattern: /\/kids-library/, message: 'App must expose the kids library route.' },
    { file: 'src/pages/Home.jsx', pattern: /\/kids-library/, message: 'Home must link into kids library.' },
    { file: 'src/pages/ParentDashboard.jsx', pattern: /Kids Library|\/kids-library/, message: 'Parent dashboard must surface kids library.' },
    { file: 'src/pages/KidsLibrary.jsx', pattern: /getKidsLibraryHarvestModel|model\.shelves\.map|model\.journeys\.map/, message: 'KidsLibrary page must render the harvested library model.' },
];

async function readRelative(file) {
    return fs.readFile(path.join(repoRoot, file), 'utf8');
}

async function main() {
    const findings = [];
    const runtimeChecks = [];

    for (const file of requiredFiles) {
        try {
            await fs.access(path.join(repoRoot, file));
        } catch (error) {
            findings.push({ file, message: `Required file missing: ${error.code || error.message}` });
        }
    }

    for (const rule of requiredPatterns) {
        try {
            const contents = await readRelative(rule.file);
            if (!rule.pattern.test(contents)) {
                findings.push({ file: rule.file, message: rule.message });
            }
        } catch (error) {
            findings.push({ file: rule.file, message: `Could not inspect file: ${error.code || error.message}` });
        }
    }

    try {
        const service = await import(`${pathToFileURL(path.join(repoRoot, 'src', 'services', 'kidsLibraryHarvestService.js')).href}?audit=${Date.now()}`);
        const model = service.getKidsLibraryHarvestModel();
        const pass = model.summary.storyCount > 0
            && model.summary.readingCount > 0
            && model.summary.teacherChapterCount > 0
            && model.summary.speakingSentenceCount > 0
            && model.shelves.length >= 4
            && model.journeys.length >= 3;

        runtimeChecks.push({
            name: 'kids_library_model_roundtrip',
            pass,
            stories: model.summary.storyCount,
            readings: model.summary.readingCount,
            teacherChapters: model.summary.teacherChapterCount,
            speakingSentences: model.summary.speakingSentenceCount,
            shelves: model.shelves.length,
            journeys: model.journeys.length,
        });

        if (!pass) {
            findings.push({ file: 'kids library service', message: 'Kids library model did not meet minimum data thresholds.' });
        }
    } catch (error) {
        findings.push({ file: 'kids library service', message: error.message || String(error) });
    }

    const summary = {
        checks: requiredFiles.length + requiredPatterns.length,
        findings: findings.length,
        pass: findings.length === 0,
    };

    console.log(JSON.stringify({ summary, runtimeChecks, findings }, null, 2));

    if (findings.length > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

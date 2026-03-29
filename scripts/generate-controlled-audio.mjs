import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { KIDS_LISTENING_CURRICULUM_LESSONS } from '../src/data/listeningKidsCurriculum.js';
import { KIDS_LISTENING_CN_CURRICULUM_LESSONS } from '../src/data/listeningCnCurriculum.js';

const execFileAsync = promisify(execFile);
const repoRoot = new URL('..', import.meta.url).pathname;

const LANGUAGE_CONFIG = {
    en: {
        voice: 'Samantha',
        rate: 178,
        lessonIds: [
            'listening-shadow-greetings',
            'listening-shadow-school-kids',
        ],
        lessons: KIDS_LISTENING_CURRICULUM_LESSONS,
    },
    zh: {
        voice: 'Eddy (Tiếng Trung (Trung Quốc đại lục))',
        rate: 170,
        lessonIds: [
            'listening-shadow-greetings-cn',
            'listening-shadow-family-home-cn',
        ],
        lessons: KIDS_LISTENING_CN_CURRICULUM_LESSONS,
    },
};

function normalizeText(text) {
    return String(text || '')
        .replace(/\s+/g, ' ')
        .replace(/[“”]/g, '"')
        .trim();
}

function padSegmentId(segmentId) {
    return String(segmentId).padStart(2, '0');
}

async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

async function readJson(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        return JSON.parse(content);
    } catch {
        return {};
    }
}

async function synthesizeSegment({ voice, rate, text, targetPath }) {
    const tempAiff = path.join(
        os.tmpdir(),
        `lingua-${Date.now()}-${Math.random().toString(16).slice(2, 8)}.aiff`
    );

    await execFileAsync('say', ['-v', voice, '-r', String(rate), '-o', tempAiff, text]);
    await execFileAsync('afconvert', ['-f', 'm4af', '-d', 'aac', '-b', '64000', tempAiff, targetPath]);
    await fs.unlink(tempAiff).catch(() => {});
}

async function generateForLanguage(lang, config) {
    const manifestPath = path.join(repoRoot, 'public', 'data', 'audio-manifests', `listening-${lang}.json`);
    const audioRoot = path.join(repoRoot, 'public', 'audio', 'controlled', lang);
    await ensureDir(path.dirname(manifestPath));
    await ensureDir(audioRoot);

    const manifest = await readJson(manifestPath);

    for (const lessonId of config.lessonIds) {
        const lesson = config.lessons.find((item) => item.id === lessonId);
        if (!lesson) {
            throw new Error(`Lesson not found: ${lang}:${lessonId}`);
        }

        const lessonDir = path.join(audioRoot, lessonId);
        await ensureDir(lessonDir);

        const segmentManifest = {};
        for (const segment of lesson.segments || []) {
            const fileName = `${padSegmentId(segment.id)}.m4a`;
            const absoluteTarget = path.join(lessonDir, fileName);
            const relativeTarget = path.posix.join('audio', 'controlled', lang, lessonId, fileName);
            segmentManifest[String(segment.id)] = relativeTarget;

            try {
                await fs.access(absoluteTarget);
            } catch {
                const text = normalizeText(segment.text);
                await synthesizeSegment({
                    voice: config.voice,
                    rate: config.rate,
                    text,
                    targetPath: absoluteTarget,
                });
            }
        }

        manifest[lessonId] = {
            source: 'controlled_audio',
            voice: config.voice,
            generatedAt: new Date().toISOString(),
            segments: segmentManifest,
        };
    }

    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main() {
    for (const [lang, config] of Object.entries(LANGUAGE_CONFIG)) {
        await generateForLanguage(lang, config);
    }
    console.log('Controlled audio generation complete.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

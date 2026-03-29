import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
    TEACHER_CURRICULUM,
    TEACHER_LESSON_AUDIO_VOICE,
    getTeacherLessonPracticeItems,
    normalizeTeacherLessonAudioKey,
} from '../src/data/teacherLessons.js';

const execFileAsync = promisify(execFile);
const repoRoot = new URL('..', import.meta.url).pathname;
const outputRoot = path.join(repoRoot, 'public', 'audio', 'teacher-lessons');
const manifestPath = path.join(repoRoot, 'public', 'data', 'audio-manifests', 'teacher-lessons.json');

function normalizeText(text) {
    return String(text || '')
        .replace(/\s+/g, ' ')
        .replace(/[“”]/g, '"')
        .trim();
}

function clipFileName(key) {
    return `${createHash('sha1').update(key).digest('hex').slice(0, 12)}.mp3`;
}

async function ensureDir(dirPath) {
    await fs.mkdir(dirPath, { recursive: true });
}

async function synthesizeClip({ voice, text, rate, pitch, volume, targetPath }) {
    await execFileAsync('python3', [
        '-m',
        'edge_tts',
        '--text',
        normalizeText(text),
        '--voice',
        voice,
        `--rate=${rate}`,
        `--pitch=${pitch}`,
        `--volume=${volume}`,
        '--write-media',
        targetPath,
    ]);
}

function buildUniqueEntries() {
    const uniqueEntries = new Map();

    for (const chapter of TEACHER_CURRICULUM.chapters) {
        for (const item of getTeacherLessonPracticeItems(chapter)) {
            const key = normalizeTeacherLessonAudioKey(item.promptEn);
            if (!key) continue;

            if (!uniqueEntries.has(key)) {
                uniqueEntries.set(key, {
                    key,
                    text: item.promptEn,
                    sourceChapters: [chapter.id],
                });
                continue;
            }

            const entry = uniqueEntries.get(key);
            if (!entry.sourceChapters.includes(chapter.id)) {
                entry.sourceChapters.push(chapter.id);
            }
        }
    }

    return [...uniqueEntries.values()];
}

async function runWithConcurrency(entries, limit, worker) {
    const queue = [...entries];
    const workers = new Array(Math.min(limit, queue.length)).fill(null).map(async () => {
        while (queue.length > 0) {
            const entry = queue.shift();
            await worker(entry);
        }
    });
    await Promise.all(workers);
}

async function main() {
    const entries = buildUniqueEntries();
    await ensureDir(outputRoot);
    await ensureDir(path.dirname(manifestPath));

    const manifest = {
        source: 'controlled_teacher_lessons_pack',
        engine: 'edge_tts',
        generatedAt: new Date().toISOString(),
        voice: TEACHER_LESSON_AUDIO_VOICE,
        summary: {
            chapterCount: TEACHER_CURRICULUM.chapters.length,
            practiceItemCount: TEACHER_CURRICULUM.chapters.reduce((sum, chapter) => sum + getTeacherLessonPracticeItems(chapter).length, 0),
            clipCount: entries.length,
        },
        clips: {},
    };

    await runWithConcurrency(entries, 6, async (entry) => {
        const fileName = clipFileName(entry.key);
        const absoluteTarget = path.join(outputRoot, fileName);
        const relativeTarget = path.posix.join('audio', 'teacher-lessons', fileName);

        await synthesizeClip({
            voice: TEACHER_LESSON_AUDIO_VOICE.voice,
            text: entry.text,
            rate: TEACHER_LESSON_AUDIO_VOICE.rate,
            pitch: TEACHER_LESSON_AUDIO_VOICE.pitch,
            volume: TEACHER_LESSON_AUDIO_VOICE.volume,
            targetPath: absoluteTarget,
        });

        manifest.clips[entry.key] = {
            text: entry.text,
            src: relativeTarget,
            sourceChapters: entry.sourceChapters,
        };
    });

    await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(JSON.stringify(manifest.summary, null, 2));
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

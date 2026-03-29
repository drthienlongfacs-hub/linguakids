import { normalizeTeacherLessonAudioKey } from '../data/teacherLessons';

const MANIFEST_PATH = 'data/audio-manifests/teacher-lessons.json';
const QA_PATH = 'data/audio-manifests/teacher-lessons.qa.json';

let manifestPromise = null;
let qaPromise = null;

function resolveBaseUrl() {
    return import.meta.env.BASE_URL || '/';
}

function resolveAssetPath(relativePath) {
    if (!relativePath) return null;
    if (/^https?:\/\//.test(relativePath)) return relativePath;
    return `${resolveBaseUrl()}${String(relativePath).replace(/^\/+/, '')}`;
}

export async function loadTeacherLessonAudioManifest() {
    if (!manifestPromise) {
        manifestPromise = fetch(resolveAssetPath(MANIFEST_PATH))
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`teacher_lessons_audio_manifest_${response.status}`);
                }
                return response.json();
            })
            .catch((error) => {
                manifestPromise = null;
                throw error;
            });
    }

    return manifestPromise;
}

export async function loadTeacherLessonAudioQA() {
    if (!qaPromise) {
        qaPromise = fetch(resolveAssetPath(QA_PATH))
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`teacher_lessons_audio_qa_${response.status}`);
                }
                return response.json();
            })
            .catch((error) => {
                qaPromise = null;
                throw error;
            });
    }

    return qaPromise;
}

export function getTeacherLessonAudioClip(manifest, text) {
    const key = normalizeTeacherLessonAudioKey(text);
    const entry = key ? manifest?.clips?.[key] : null;
    return entry?.src ? resolveAssetPath(entry.src) : null;
}

export function hasTeacherLessonAudioClip(manifest, text) {
    return !!getTeacherLessonAudioClip(manifest, text);
}

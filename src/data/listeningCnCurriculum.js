import { CHINESE_TOPICS } from './chinese.js';
import { KIDS_CN_SPEAKING_CURRICULUM_LESSONS } from './speakingCnCurriculum.js';

const TOPIC_VOCAB_MAP = {
    'shadow-greetings-cn': ['greetings_cn', 'emotions_cn'],
    'shadow-family-home-cn': ['family_cn', 'house_cn'],
    'shadow-school-cn': ['school_cn'],
    'shadow-food-cn': ['food_cn', 'fruits_cn'],
    'shadow-animals-cn': ['animals_cn', 'nature_cn', 'weather_cn'],
    'shadow-routine-cn': ['actions_cn', 'time_cn', 'house_cn'],
    'shadow-weather-clothes-cn': ['weather_cn', 'clothes_cn', 'colors_cn'],
    'shadow-places-cn': ['transport_cn', 'school_cn', 'house_cn'],
    'shadow-health-cn': ['body_cn', 'health_cn', 'emotions_cn'],
    'shadow-hobbies-cn': ['actions_cn', 'sports_cn', 'toys_cn'],
    'shadow-feelings-cn': ['emotions_cn', 'greetings_cn', 'family_cn'],
    'shadow-time-colors-cn': ['time_cn', 'numbers_cn', 'colors_cn', 'shapes_cn'],
};

function formatDuration(segmentCount) {
    const totalSeconds = segmentCount * 6;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function sanitizeChinese(text) {
    return String(text || '').replace(/[^\u4e00-\u9fff0-9]/g, '');
}

function pickGapFillWord(text, vocabulary) {
    const vocabMatch = vocabulary.find(item => text.includes(item.word));
    if (vocabMatch) {
        return vocabMatch.word;
    }

    const chunks = sanitizeChinese(text).match(/[\u4e00-\u9fff]{2,4}/g) || [];
    return chunks.find(chunk => chunk.length >= 2) || chunks[0] || '词语';
}

function buildGapFill(segment, idx, vocabulary) {
    const answer = pickGapFillWord(segment.text, vocabulary);
    const question = segment.text.includes(answer)
        ? segment.text.replace(answer, '_____')
        : `_____${segment.text.slice(answer.length)}`;

    return {
        type: 'gap_fill',
        question,
        answer,
        hint: `Cụm trọng tâm số ${idx + 1} của bài nghe ${segment.topicLabel || ''}`.trim(),
    };
}

function buildVocabulary(lessonId) {
    const topicIds = TOPIC_VOCAB_MAP[lessonId] || [];
    const words = [];
    const seen = new Set();

    for (const topicId of topicIds) {
        const topic = CHINESE_TOPICS.find(item => item.id === topicId);
        if (!topic) {
            continue;
        }

        for (const word of topic.words) {
            const key = `${word.character}-${word.pinyin}`;
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            words.push({
                word: word.character,
                pinyin: word.pinyin,
                meaning: word.vietnamese,
                example: word.example,
            });
            if (words.length >= 10) {
                return words;
            }
        }
    }

    return words;
}

function buildListeningLesson(speakingLesson) {
    const segments = speakingLesson.sentences.map((sentence, index) => ({
        id: index + 1,
        startTime: index * 6,
        endTime: index * 6 + 5,
        text: sentence.text,
        pinyin: sentence.pinyin,
        textVi: sentence.textVi,
        topicLabel: speakingLesson.title,
    }));
    const vocabulary = buildVocabulary(speakingLesson.id);

    return {
        id: `listening-${speakingLesson.id}`,
        title: speakingLesson.title,
        titleVi: speakingLesson.titleVi,
        level: speakingLesson.level,
        duration: formatDuration(segments.length),
        topic: speakingLesson.title,
        emoji: speakingLesson.emoji,
        mode: 'kids',
        source: 'shadowing-curriculum-cn',
        framework: speakingLesson.framework,
        segments,
        vocabulary,
        quiz: segments.slice(0, 6).map((segment, idx) => buildGapFill(segment, idx, vocabulary)),
    };
}

export const KIDS_LISTENING_CN_CURRICULUM_LESSONS =
    KIDS_CN_SPEAKING_CURRICULUM_LESSONS.map(buildListeningLesson);

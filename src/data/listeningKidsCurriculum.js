import { ENGLISH_TOPICS } from './english.js';
import { KIDS_SPEAKING_CURRICULUM_LESSONS } from './speakingKidsCurriculum.js';

const TOPIC_VOCAB_MAP = {
    'shadow-greetings': ['greetings', 'emotions'],
    'shadow-school-kids': ['school'],
    'shadow-family-kids': ['family', 'house'],
    'shadow-food-kids': ['food', 'fruits'],
    'shadow-hobbies-kids': ['actions', 'emotions'],
    'shadow-home-routine-kids': ['house', 'actions'],
    'shadow-animals-kids': ['animals', 'weather'],
    'shadow-weather-clothes-kids': ['clothes', 'weather'],
    'shadow-places-directions-kids': ['transport', 'house'],
    'shadow-health-kids': ['body', 'emotions'],
    'shadow-transport-kids': ['transport'],
    'shadow-friends-feelings-kids': ['emotions', 'greetings'],
};

const STOP_WORDS = new Set([
    'the', 'and', 'are', 'with', 'from', 'this', 'that', 'have', 'your', 'you',
    'they', 'their', 'there', 'then', 'them', 'into', 'when', 'what', 'where',
    'which', 'would', 'could', 'should', 'about', 'after', 'before', 'every',
    'today', 'very', 'will', 'make', 'makes', 'like', 'likes', 'feel', 'feels',
    'look', 'looks', 'play', 'plays', 'good', 'nice', 'best', 'more', 'most',
]);

function formatDuration(segmentCount) {
    const totalSeconds = segmentCount * 6;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function pickGapFillWord(text) {
    const candidates = text
        .replace(/[^a-zA-Z0-9'\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word.toLowerCase())
        .filter(word => word.length > 3 && !STOP_WORDS.has(word));

    return candidates[0] || text.replace(/[^a-zA-Z0-9'\s]/g, ' ').split(/\s+/).find(Boolean) || 'word';
}

function buildGapFill(segment, idx) {
    const answer = pickGapFillWord(segment.text);
    const question = segment.text.replace(
        new RegExp(`\\b${escapeRegExp(answer)}\\b`, 'i'),
        '_____'
    );

    return {
        type: 'gap_fill',
        question,
        answer,
        hint: `Từ số ${idx + 1} trong ngữ cảnh chủ đề ${segment.topicLabel || 'bài nghe'}`,
    };
}

function buildVocabulary(lessonId) {
    const topicIds = TOPIC_VOCAB_MAP[lessonId] || [];
    const words = [];
    const seen = new Set();

    for (const topicId of topicIds) {
        const topic = ENGLISH_TOPICS.find(item => item.id === topicId);
        if (!topic) {
            continue;
        }
        for (const word of topic.words) {
            const key = word.word.toLowerCase();
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            words.push({
                word: word.word,
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
        textVi: sentence.textVi,
        topicLabel: speakingLesson.title,
    }));

    return {
        id: `listening-${speakingLesson.id}`,
        title: speakingLesson.title,
        titleVi: speakingLesson.titleVi,
        level: speakingLesson.level,
        duration: formatDuration(segments.length),
        topic: speakingLesson.title,
        emoji: speakingLesson.emoji,
        mode: 'kids',
        source: 'shadowing-curriculum',
        segments,
        vocabulary: buildVocabulary(speakingLesson.id),
        quiz: segments.slice(0, 6).map(buildGapFill),
    };
}

export const KIDS_LISTENING_CURRICULUM_LESSONS = KIDS_SPEAKING_CURRICULUM_LESSONS.map(buildListeningLesson);

import { ENGLISH_TOPICS } from '../data/english.js';
import { CHINESE_TOPICS } from '../data/chinese.js';
import { loadStandardLexicon } from './standardLexiconService.js';

const topicBankCache = new Map();

const EN_FOUNDATION_TOPICS = [
    {
        id: 'std-en-greetings',
        title: 'Greetings & Introductions',
        titleVi: 'Chào hỏi & Giới thiệu',
        emoji: '👋',
        color: '#3B82F6',
        legacyTopicIds: ['greetings', 'emotions'],
        domains: ['Noun: Communication', 'Verb: Communication', 'Verb: Social', 'Noun: Feeling'],
        keywords: ['hello', 'goodbye', 'thank', 'thanks', 'sorry', 'please', 'welcome', 'friend', 'name', 'talk', 'speak', 'question', 'answer', 'introduce'],
        limit: 220,
    },
    {
        id: 'std-en-family-home',
        title: 'Family & Home',
        titleVi: 'Gia đình & Nhà cửa',
        emoji: '🏡',
        color: '#8B5CF6',
        legacyTopicIds: ['family', 'house'],
        domains: ['Noun: Person', 'Noun: Artifact', 'Noun: Location'],
        keywords: ['family', 'mother', 'father', 'parent', 'brother', 'sister', 'baby', 'grandmother', 'grandfather', 'house', 'home', 'room', 'kitchen', 'bathroom', 'bedroom', 'door', 'window', 'garden'],
        limit: 220,
    },
    {
        id: 'std-en-school',
        title: 'School & Learning',
        titleVi: 'Trường học & Học tập',
        emoji: '🏫',
        color: '#A855F7',
        legacyTopicIds: ['school'],
        domains: ['Noun: Communication', 'Noun: Person', 'Noun: Artifact'],
        keywords: ['school', 'teacher', 'student', 'class', 'classroom', 'lesson', 'book', 'library', 'desk', 'pencil', 'homework', 'study', 'learn', 'math', 'music', 'art'],
        limit: 220,
    },
    {
        id: 'std-en-food',
        title: 'Food & Drink',
        titleVi: 'Đồ ăn & Thức uống',
        emoji: '🍎',
        color: '#EF4444',
        legacyTopicIds: ['food', 'fruits'],
        domains: ['Noun: Food', 'Verb: Consumption'],
        keywords: ['food', 'drink', 'water', 'rice', 'bread', 'milk', 'egg', 'fruit', 'vegetable', 'breakfast', 'lunch', 'dinner', 'cake', 'sandwich', 'juice', 'soup', 'eat', 'cook'],
        limit: 220,
    },
    {
        id: 'std-en-animals-nature',
        title: 'Animals & Nature',
        titleVi: 'Động vật & Thiên nhiên',
        emoji: '🐻',
        color: '#10B981',
        legacyTopicIds: ['animals', 'weather'],
        domains: ['Noun: Animal', 'Noun: Plant', 'Noun: Object'],
        keywords: ['animal', 'dog', 'cat', 'bird', 'fish', 'rabbit', 'elephant', 'lion', 'tree', 'flower', 'leaf', 'river', 'nature', 'forest', 'farm', 'garden', 'sun', 'rain', 'wind'],
        limit: 220,
    },
    {
        id: 'std-en-body-health',
        title: 'Body & Health',
        titleVi: 'Cơ thể & Sức khỏe',
        emoji: '🩺',
        color: '#6366F1',
        legacyTopicIds: ['body'],
        domains: ['Noun: Body', 'Verb: Body', 'Noun: Feeling'],
        keywords: ['body', 'head', 'eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'tooth', 'hair', 'heart', 'health', 'doctor', 'medicine', 'sick', 'clean'],
        limit: 220,
    },
    {
        id: 'std-en-clothes-weather',
        title: 'Clothes & Weather',
        titleVi: 'Quần áo & Thời tiết',
        emoji: '🌦️',
        color: '#EC4899',
        legacyTopicIds: ['clothes', 'weather'],
        domains: ['Noun: Artifact', 'Adjective: All', 'Noun: Time'],
        keywords: ['clothes', 'shirt', 'pants', 'dress', 'shoes', 'hat', 'jacket', 'sock', 'scarf', 'weather', 'sunny', 'rainy', 'cloudy', 'windy', 'cold', 'hot', 'storm', 'summer', 'winter'],
        limit: 220,
    },
    {
        id: 'std-en-transport-places',
        title: 'Transport & Places',
        titleVi: 'Phương tiện & Địa điểm',
        emoji: '🚌',
        color: '#F97316',
        legacyTopicIds: ['transport'],
        domains: ['Verb: Motion', 'Noun: Location', 'Noun: Artifact'],
        keywords: ['transport', 'car', 'bus', 'train', 'airplane', 'bicycle', 'boat', 'taxi', 'road', 'street', 'park', 'market', 'station', 'airport', 'city', 'town', 'travel', 'place', 'direction'],
        limit: 220,
    },
    {
        id: 'std-en-actions',
        title: 'Daily Actions',
        titleVi: 'Hoạt động hằng ngày',
        emoji: '🏃',
        color: '#14B8A6',
        legacyTopicIds: ['actions'],
        domains: ['Verb: Motion', 'Verb: Contact', 'Verb: Body', 'Verb: Consumption', 'Verb: Creation', 'Verb: Perception'],
        keywords: ['run', 'jump', 'walk', 'swim', 'dance', 'sing', 'read', 'write', 'draw', 'eat', 'drink', 'sleep', 'play', 'cook', 'watch', 'listen', 'work'],
        limit: 220,
    },
    {
        id: 'std-en-friends-feelings',
        title: 'Friends & Feelings',
        titleVi: 'Bạn bè & Cảm xúc',
        emoji: '💛',
        color: '#EAB308',
        legacyTopicIds: ['emotions', 'family'],
        domains: ['Noun: Feeling', 'Verb: Emotion', 'Verb: Social', 'Noun: Person'],
        keywords: ['happy', 'sad', 'angry', 'scared', 'surprised', 'tired', 'friend', 'kind', 'help', 'love', 'like', 'calm', 'proud', 'nervous', 'thankful'],
        limit: 220,
    },
    {
        id: 'std-en-time-numbers',
        title: 'Time & Numbers',
        titleVi: 'Thời gian & Số đếm',
        emoji: '⏰',
        color: '#0EA5E9',
        legacyTopicIds: ['numbers'],
        domains: ['Noun: Time', 'Noun: Quantity'],
        keywords: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'time', 'day', 'week', 'month', 'year', 'morning', 'afternoon', 'night'],
        limit: 220,
    },
    {
        id: 'std-en-colors-shapes',
        title: 'Colors & Shapes',
        titleVi: 'Màu sắc & Hình khối',
        emoji: '🎨',
        color: '#F59E0B',
        legacyTopicIds: ['colors'],
        domains: ['Adjective: All', 'Noun: Object'],
        keywords: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'black', 'white', 'brown', 'gray', 'gold', 'circle', 'square', 'triangle', 'shape'],
        limit: 220,
    },
];

const ZH_FOUNDATION_TOPICS = [
    {
        id: 'std-zh-greetings',
        title: 'Chào hỏi',
        emoji: '👋',
        color: '#EF4444',
        legacyTopicIds: ['greetings_cn'],
        keywords: ['hello', 'goodbye', 'thanks', 'thank', 'sorry', 'please', 'welcome', 'friend', 'name', 'speak', 'question', 'answer'],
        limit: 220,
        allowGeneralFallback: true,
    },
    {
        id: 'std-zh-family-home',
        title: 'Gia đình & Nhà cửa',
        emoji: '🏡',
        color: '#8B5CF6',
        legacyTopicIds: ['family_cn'],
        keywords: ['family', 'father', 'mother', 'dad', 'mom', 'brother', 'sister', 'baby', 'grandfather', 'grandmother', 'home', 'house', 'room', 'door', 'window', 'bed'],
        limit: 220,
        allowGeneralFallback: true,
    },
    {
        id: 'std-zh-school',
        title: 'Trường học',
        emoji: '🏫',
        color: '#A855F7',
        legacyTopicIds: ['school_cn'],
        keywords: ['school', 'teacher', 'student', 'class', 'classroom', 'book', 'desk', 'pen', 'homework', 'study', 'learn', 'read', 'write'],
        limit: 220,
        allowGeneralFallback: true,
    },
    {
        id: 'std-zh-food',
        title: 'Đồ ăn & Thức uống',
        emoji: '🍜',
        color: '#F97316',
        legacyTopicIds: ['food_cn', 'fruits_cn'],
        keywords: ['food', 'drink', 'rice', 'noodle', 'bun', 'dumpling', 'milk', 'water', 'juice', 'cake', 'fruit', 'apple', 'banana', 'orange', 'eat', 'cook'],
        limit: 220,
        allowGeneralFallback: true,
    },
    {
        id: 'std-zh-animals-nature',
        title: 'Động vật & Thiên nhiên',
        emoji: '🐼',
        color: '#10B981',
        legacyTopicIds: ['animals_cn', 'nature_cn', 'weather_cn'],
        keywords: ['animal', 'dog', 'cat', 'fish', 'bird', 'rabbit', 'elephant', 'lion', 'tree', 'flower', 'mountain', 'river', 'sea', 'sun', 'moon', 'weather', 'rain', 'wind'],
        limit: 220,
        allowGeneralFallback: true,
    },
    {
        id: 'std-zh-body-health',
        title: 'Cơ thể & Sức khỏe',
        emoji: '🩺',
        color: '#3B82F6',
        legacyTopicIds: ['body_cn'],
        keywords: ['body', 'head', 'eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'tooth', 'hair', 'doctor', 'health', 'medicine', 'sick'],
        limit: 220,
        allowGeneralFallback: true,
    },
    {
        id: 'std-zh-clothes',
        title: 'Quần áo',
        emoji: '👕',
        color: '#EC4899',
        legacyTopicIds: ['clothes_cn'],
        keywords: ['clothes', 'shirt', 'pants', 'dress', 'shoes', 'hat', 'coat', 'jacket', 'sock', 'scarf', 'glove', 'backpack'],
        limit: 220,
        allowGeneralFallback: true,
    },
    {
        id: 'std-zh-actions',
        title: 'Hoạt động hằng ngày',
        emoji: '🏃',
        color: '#14B8A6',
        legacyTopicIds: ['actions_cn'],
        keywords: ['eat', 'drink', 'run', 'jump', 'walk', 'look', 'listen', 'speak', 'read', 'write', 'draw', 'play', 'sleep', 'sing'],
        limit: 220,
        allowGeneralFallback: true,
    },
    {
        id: 'std-zh-feelings',
        title: 'Cảm xúc & Bạn bè',
        emoji: '💛',
        color: '#EAB308',
        legacyTopicIds: ['emotions_cn'],
        keywords: ['happy', 'sad', 'angry', 'afraid', 'tired', 'hungry', 'thirsty', 'love', 'like', 'friend', 'brave', 'calm'],
        limit: 220,
        allowGeneralFallback: true,
    },
    {
        id: 'std-zh-numbers-colors',
        title: 'Số đếm & Màu sắc',
        emoji: '🔢',
        color: '#F59E0B',
        legacyTopicIds: ['numbers_cn', 'colors_cn'],
        keywords: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'pink', 'purple'],
        limit: 220,
        allowGeneralFallback: true,
    },
];

function normalizeText(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function buildLegacyMap(topics, getWordKey) {
    return new Map(
        topics.map(topic => [
            topic.id,
            topic.words.map(word => ({
                ...word,
                __topicKey: normalizeText(getWordKey(word)),
            })),
        ])
    );
}

const legacyEnglishMap = buildLegacyMap(ENGLISH_TOPICS, word => word.word);
const legacyChineseMap = buildLegacyMap(CHINESE_TOPICS, word => word.character);

function scoreEntry(entry, config, seedSet) {
    const wordKey = normalizeText(entry.wordLower || entry.word || entry.character);
    const searchBlob = normalizeText([
        entry.wordLower,
        entry.word,
        entry.character,
        entry.vietnamese,
        entry.definition,
        entry.example,
        entry.domainLabel,
        ...(entry.englishSynonyms || []),
    ].join(' '));

    let score = 0;

    if (seedSet.has(wordKey)) {
        score += 500;
    }

    for (const domain of config.domains || []) {
        if (entry.domainLabel === domain) {
            score += 50;
        }
    }

    for (const keyword of config.keywords || []) {
        if (wordKey === keyword) {
            score += 90;
            continue;
        }
        if (wordKey.includes(keyword)) {
            score += 60;
            continue;
        }
        if (searchBlob.includes(keyword)) {
            score += 20;
        }
    }

    if ((entry.cefr || '').toLowerCase() === 'curriculum') {
        score += 8;
    }

    if (entry.example) {
        score += 4;
    }

    return score;
}

function buildEnglishWord(entry, config) {
    const meaning = entry.vietnamese || entry.definition || '';
    return {
        word: entry.word,
        emoji: entry.emoji || config.emoji,
        vietnamese: meaning,
        example: entry.example || `${entry.word} is used in ${config.title.toLowerCase()}.`,
        exampleVi: entry.exampleVi && entry.exampleVi !== entry.example
            ? entry.exampleVi
            : meaning,
        pronunciation: entry.pronunciation || '',
        source: 'standard-lexicon',
    };
}

function buildChineseWord(entry, config) {
    const meaning = entry.vietnamese || entry.definition || '';
    return {
        character: entry.character || entry.word,
        pinyin: entry.pinyin || '',
        vietnamese: meaning,
        emoji: entry.emoji || config.emoji,
        example: entry.example || `${entry.character || entry.word}`,
        exampleVi: entry.example || meaning,
        source: 'standard-lexicon',
    };
}

function buildTopicBank(entries, configs, legacyMap, buildWord) {
    const generalPool = [...entries].sort((a, b) => (a.rank || 999999) - (b.rank || 999999));
    return configs.map((config) => {
        const usedKeys = new Set();
        const seedWords = [];
        const seedSet = new Set();

        for (const legacyTopicId of config.legacyTopicIds || []) {
            const legacyWords = legacyMap.get(legacyTopicId) || [];
            for (const legacyWord of legacyWords) {
                const wordKey = legacyWord.__topicKey;
                if (!wordKey || usedKeys.has(wordKey)) {
                    continue;
                }
                usedKeys.add(wordKey);
                seedSet.add(wordKey);
                const { __topicKey, ...cleanWord } = legacyWord;
                seedWords.push(cleanWord);
            }
        }

        const ranked = entries
            .map((entry) => ({ entry, score: scoreEntry(entry, config, seedSet) }))
            .filter(({ score }) => score >= (config.minScore || 20))
            .sort((a, b) => {
                if (b.score !== a.score) {
                    return b.score - a.score;
                }
                return (a.entry.rank || 999999) - (b.entry.rank || 999999);
            });

        const targetLimit = Math.min(config.maxLimit || 320, Math.max(config.limit || 0, seedWords.length * 20));
        const expandedWords = [...seedWords];

        for (const { entry } of ranked) {
            const wordKey = normalizeText(entry.wordLower || entry.word || entry.character);
            if (!wordKey || usedKeys.has(wordKey)) {
                continue;
            }
            usedKeys.add(wordKey);
            expandedWords.push(buildWord(entry, config));
            if (expandedWords.length >= targetLimit) {
                break;
            }
        }

        if (config.allowGeneralFallback && expandedWords.length < targetLimit) {
            for (const entry of generalPool) {
                const wordKey = normalizeText(entry.wordLower || entry.word || entry.character);
                if (!wordKey || usedKeys.has(wordKey)) {
                    continue;
                }
                usedKeys.add(wordKey);
                expandedWords.push(buildWord(entry, config));
                if (expandedWords.length >= targetLimit) {
                    break;
                }
            }
        }

        return {
            id: config.id,
            title: config.title,
            titleVi: config.titleVi || config.title,
            emoji: config.emoji,
            color: config.color,
            mode: 'kids',
            framework: 'CEFR A1-A2 + standard lexicon',
            words: expandedWords,
        };
    });
}

export async function loadStandardTopicBank(lang) {
    const normalizedLang = lang === 'cn' || lang === 'zh' ? 'zh' : 'en';
    if (topicBankCache.has(normalizedLang)) {
        return topicBankCache.get(normalizedLang);
    }

    const promise = loadStandardLexicon(normalizedLang, { practice: true }).then((entries) => {
        if (normalizedLang === 'zh') {
            return buildTopicBank(entries, ZH_FOUNDATION_TOPICS, legacyChineseMap, buildChineseWord);
        }
        return buildTopicBank(entries, EN_FOUNDATION_TOPICS, legacyEnglishMap, buildEnglishWord);
    });

    topicBankCache.set(normalizedLang, promise);
    return promise;
}

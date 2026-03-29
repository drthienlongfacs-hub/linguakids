import { getReadingByMode } from '../data/reading.js';
import { ENGLISH_STORIES, CHINESE_STORIES } from '../data/stories.js';
import { KIDS_LISTENING_CURRICULUM_LESSONS } from '../data/listeningKidsCurriculum.js';
import {
    KIDS_SPEAKING_CURRICULUM_LESSONS,
    KIDS_SPEAKING_CURRICULUM_META,
} from '../data/speakingKidsCurriculum.js';
import { TEACHER_CURRICULUM, getTeacherLessonPracticeItems } from '../data/teacherLessons.js';

function sum(values) {
    return values.reduce((total, value) => total + value, 0);
}

function buildStoryShelf() {
    const englishScenes = sum(ENGLISH_STORIES.map((story) => story.scenes.length));
    const chineseScenes = sum(CHINESE_STORIES.map((story) => story.scenes.length));

    return {
        id: 'story-library',
        title: 'Story Library',
        titleVi: 'Thư viện truyện',
        description: 'Read-to-me and interactive story shelves with English and Chinese routes.',
        descriptionVi: 'Kệ truyện có đọc mẫu và tương tác, gồm cả tiếng Anh và tiếng Trung.',
        benchmarkPattern: 'Library tabs + read-aloud shelf',
        route: '/stories/en',
        stats: [
            { label: 'Stories', labelVi: 'Truyện', value: ENGLISH_STORIES.length + CHINESE_STORIES.length },
            { label: 'Scenes', labelVi: 'Trang', value: englishScenes + chineseScenes },
        ],
        actions: [
            { label: 'English stories', labelVi: 'Truyện Anh', route: '/stories/en' },
            { label: 'Chinese stories', labelVi: 'Truyện Trung', route: '/stories/cn' },
        ],
    };
}

function buildReadingShelf() {
    const kidsPassages = getReadingByMode('kids');
    const totalWords = sum(kidsPassages.map((passage) => passage.wordCount || 0));

    return {
        id: 'reading-library',
        title: 'Read By Myself',
        titleVi: 'Tự đọc',
        description: 'Guided reading shelf with leveled passages, quizzes, and tap-to-define vocabulary.',
        descriptionVi: 'Kệ tự đọc có bài đọc phân cấp, quiz và chạm từ để xem nghĩa.',
        benchmarkPattern: 'Independent reading shelf + scaffolded vocabulary',
        route: '/reading',
        stats: [
            { label: 'Passages', labelVi: 'Bài đọc', value: kidsPassages.length },
            { label: 'Words', labelVi: 'Tổng từ', value: totalWords },
        ],
        actions: [
            { label: 'Open reading shelf', labelVi: 'Mở kệ đọc', route: '/reading' },
        ],
    };
}

function buildTeacherShelf() {
    const chapters = TEACHER_CURRICULUM.chapters || [];
    const practiceItems = sum(chapters.map((chapter) => getTeacherLessonPracticeItems(chapter).length));

    return {
        id: 'teacher-tools',
        title: 'Teacher-led Lessons',
        titleVi: 'Bài của cô',
        description: 'Teacher-style classroom shelf with structured chapters and practice loops.',
        descriptionVi: 'Kệ bài học kiểu lớp học với chapter có cấu trúc và vòng luyện tập.',
        benchmarkPattern: 'Teacher tools + assignments + progress visibility',
        route: '/teacher-lessons',
        stats: [
            { label: 'Chapters', labelVi: 'Chương', value: chapters.length },
            { label: 'Practice items', labelVi: 'Mục luyện', value: practiceItems },
        ],
        actions: [
            { label: 'Open teacher lessons', labelVi: 'Mở bài của cô', route: '/teacher-lessons' },
        ],
    };
}

function buildSpeakListenShelf() {
    const listeningSegments = sum(KIDS_LISTENING_CURRICULUM_LESSONS.map((lesson) => lesson.segments.length));

    return {
        id: 'speak-listen',
        title: 'Speak & Listen Path',
        titleVi: 'Lộ trình nghe nói',
        description: 'Kids speaking and listening rails connected to curriculum-scale sentence banks.',
        descriptionVi: 'Lộ trình nghe nói trẻ em nối với kho câu ở quy mô curriculum.',
        benchmarkPattern: 'Personalized path + language growth loops',
        route: '/speaking',
        stats: [
            { label: 'Speaking lessons', labelVi: 'Bài nói', value: KIDS_SPEAKING_CURRICULUM_META.totalLessons },
            { label: 'Sentences', labelVi: 'Câu', value: KIDS_SPEAKING_CURRICULUM_META.totalSentences },
            { label: 'Listening segments', labelVi: 'Đoạn nghe', value: listeningSegments },
        ],
        actions: [
            { label: 'Open speaking', labelVi: 'Mở luyện nói', route: '/speaking' },
            { label: 'Open listening', labelVi: 'Mở luyện nghe', route: '/listening' },
        ],
    };
}

function buildRecommendedJourneys() {
    return [
        {
            id: 'warm-story',
            title: 'Story Warm-Up',
            titleVi: 'Khởi động bằng truyện',
            steps: [
                { label: 'Read a story', labelVi: 'Đọc truyện', route: '/stories/en' },
                { label: 'Practice speaking', labelVi: 'Luyện nói', route: '/speaking' },
                { label: 'Review words', labelVi: 'Ôn từ', route: '/review' },
            ],
        },
        {
            id: 'classroom-rail',
            title: 'Teacher Classroom Rail',
            titleVi: 'Chuỗi lớp học',
            steps: [
                { label: 'Teacher lesson', labelVi: 'Bài của cô', route: '/teacher-lessons' },
                { label: 'Reading shelf', labelVi: 'Kệ đọc', route: '/reading' },
                { label: 'Daily challenge', labelVi: 'Thử thách ngày', route: '/daily-challenge' },
            ],
        },
        {
            id: 'hear-say-build',
            title: 'Hear → Say → Build',
            titleVi: 'Nghe → Nói → Xây câu',
            steps: [
                { label: 'Listening', labelVi: 'Luyện nghe', route: '/listening' },
                { label: 'Speaking', labelVi: 'Luyện nói', route: '/speaking' },
                { label: 'Sentence builder', labelVi: 'Xếp câu', route: '/sentence-builder' },
            ],
        },
    ];
}

export function getKidsLibraryHarvestModel() {
    const shelves = [
        buildStoryShelf(),
        buildReadingShelf(),
        buildTeacherShelf(),
        buildSpeakListenShelf(),
    ];

    const totalExperiences = shelves.reduce(
        (total, shelf) => total + shelf.stats.reduce((sumStats, stat) => sumStats + (Number(stat.value) || 0), 0),
        0,
    );

    return {
        benchmarkTarget: 'Khan Kids-inspired library, path, and teacher visibility',
        complianceNote: 'Uses Lingua-authored or already-licensed repo content. It does not copy Khan Kids proprietary lessons, assets, or copyrighted story data.',
        shelves,
        journeys: buildRecommendedJourneys(),
        summary: {
            shelfCount: shelves.length,
            totalExperiences,
            storyCount: ENGLISH_STORIES.length + CHINESE_STORIES.length,
            readingCount: getReadingByMode('kids').length,
            teacherChapterCount: (TEACHER_CURRICULUM.chapters || []).length,
            speakingSentenceCount: KIDS_SPEAKING_CURRICULUM_META.totalSentences,
        },
    };
}

// studyPlan.js — Structured exam preparation roadmaps
// Evidence: Interleaving practice (Rohrer & Taylor 2007), CEFR progression

export const EXAM_TARGETS = {
    ielts75: {
        id: 'ielts75', name: 'IELTS 7.5', emoji: '🎯', cefr: 'C1',
        totalWeeks: 8, dailyHours: 2,
        description: 'Band 7.5 — Advanced English proficiency (CEFR C1)',
        skills: ['listening', 'reading', 'writing', 'speaking', 'grammar', 'vocabulary'],
        passScore: { listening: 8, reading: 7.5, writing: 7, speaking: 7 },
    },
    hsk3: {
        id: 'hsk3', name: 'HSK 3', emoji: '🏮', cefr: 'A2-B1',
        totalWeeks: 12, dailyHours: 1.5,
        description: 'HSK 3 — 600 words, daily conversation level',
        skills: ['listening', 'reading', 'writing', 'vocabulary', 'grammar', 'tones'],
        passScore: { total: 180, maxScore: 300 },
    },
};

// ============================================================
// IELTS 7.5 — 8-week roadmap (3-4 hrs/day recommended)
// Weeks 1-2: Foundation, Weeks 3-6: Skills, Weeks 7-8: Mock
// ============================================================
export const IELTS_ROADMAP = [
    {
        week: 1, title: 'Foundation — Vocabulary & Grammar Core',
        focus: ['vocabulary', 'grammar'],
        days: [
            {
                day: 1, tasks: [
                    { type: 'vocab', module: '/english', topic: 'business', duration: 30, label: 'Learn 30 Academic Words (CEFR B2)', xp: 50 },
                    { type: 'grammar', module: '/grammar', topic: 'present-tenses', duration: 20, label: 'Present Tenses Review', xp: 30 },
                    { type: 'review', module: '/review', duration: 15, label: 'Spaced Repetition Review', xp: 20 },
                ]
            },
            {
                day: 2, tasks: [
                    { type: 'vocab', module: '/english', topic: 'communication', duration: 30, label: 'Communication Vocabulary (15 words)', xp: 50 },
                    { type: 'grammar', module: '/grammar', topic: 'past-tenses', duration: 20, label: 'Past Tenses Mastery', xp: 30 },
                    { type: 'listening', module: '/listening', duration: 20, label: 'Listening Practice — Section 1', xp: 40 },
                ]
            },
            {
                day: 3, tasks: [
                    { type: 'vocab', module: '/english', topic: 'health_adult', duration: 30, label: 'Health & Medicine Vocabulary', xp: 50 },
                    { type: 'grammar', module: '/grammar', topic: 'conditionals', duration: 25, label: 'Conditionals (If-clauses)', xp: 40 },
                    { type: 'speaking', module: '/speaking', duration: 15, label: 'Speaking Part 1 Practice', xp: 30 },
                ]
            },
            {
                day: 4, tasks: [
                    { type: 'vocab', module: '/english', topic: 'technology', duration: 30, label: 'Technology Vocabulary', xp: 50 },
                    { type: 'reading', module: '/reading', duration: 30, label: 'Reading Passage — Skimming & Scanning', xp: 50 },
                    { type: 'review', module: '/review', duration: 15, label: 'Weekly Review (SM-2)', xp: 20 },
                ]
            },
            {
                day: 5, tasks: [
                    { type: 'vocab', module: '/english', topic: 'environment', duration: 30, label: 'Environment Vocabulary', xp: 50 },
                    { type: 'writing', module: '/writing', duration: 30, label: 'Writing Task 2 — Essay Structure', xp: 50 },
                    { type: 'grammar', module: '/grammar', topic: 'passive-voice', duration: 20, label: 'Passive Voice', xp: 30 },
                ]
            },
        ],
    },
    {
        week: 2, title: 'Foundation — Expand Skills',
        focus: ['listening', 'reading', 'vocabulary'],
        days: [
            {
                day: 1, tasks: [
                    { type: 'vocab', module: '/english', topic: 'finance', duration: 25, label: 'Finance & Economy Words', xp: 40 },
                    { type: 'listening', module: '/listening', duration: 30, label: 'Listening — Note Completion Practice', xp: 50 },
                    { type: 'grammar', module: '/grammar', topic: 'future-tenses', duration: 20, label: 'Future Tenses', xp: 30 },
                ]
            },
            {
                day: 2, tasks: [
                    { type: 'reading', module: '/reading', duration: 40, label: 'Academic Reading — True/False/Not Given', xp: 60 },
                    { type: 'vocab', module: '/english', topic: 'legal-english', duration: 25, label: 'Legal English Vocabulary', xp: 40 },
                    { type: 'review', module: '/review', duration: 15, label: 'Spaced Repetition Review', xp: 20 },
                ]
            },
            {
                day: 3, tasks: [
                    { type: 'speaking', module: '/speaking', duration: 25, label: 'Speaking Part 2 — Cue Card Practice', xp: 50 },
                    { type: 'grammar', module: '/grammar', topic: 'reported-speech', duration: 20, label: 'Reported Speech', xp: 30 },
                    { type: 'listening', module: '/listening', duration: 25, label: 'Listening — MCQ Section', xp: 40 },
                ]
            },
            {
                day: 4, tasks: [
                    { type: 'writing', module: '/writing', duration: 35, label: 'Writing Task 1 — Graph Description', xp: 50 },
                    { type: 'vocab', module: '/english', topic: 'negotiation', duration: 25, label: 'Negotiation & Business Words', xp: 40 },
                    { type: 'review', module: '/review', duration: 10, label: 'Quick Review', xp: 15 },
                ]
            },
            {
                day: 5, tasks: [
                    { type: 'exam', module: '/exam-prep', duration: 60, label: 'Mini Mock Test — Reading + Listening', xp: 100 },
                    { type: 'review', module: '/review', duration: 20, label: 'Error Analysis & Review', xp: 30 },
                ]
            },
        ],
    },
    {
        week: 3, title: 'Skills — Deep Listening & Reading',
        focus: ['listening', 'reading'],
        days: [
            {
                day: 1, tasks: [
                    { type: 'listening', module: '/listening', duration: 40, label: 'Full Listening Test — Sections 1-2', xp: 70 },
                    { type: 'vocab', module: '/english', topic: 'psychology', duration: 20, label: 'Psychology Vocabulary', xp: 30 },
                    { type: 'review', module: '/review', duration: 15, label: 'Review Weak Words', xp: 20 },
                ]
            },
            {
                day: 2, tasks: [
                    { type: 'reading', module: '/reading', duration: 45, label: 'Reading — Matching Headings + Summary', xp: 70 },
                    { type: 'grammar', module: '/grammar', topic: 'relative-clauses', duration: 20, label: 'Relative Clauses', xp: 30 },
                    { type: 'speaking', module: '/speaking', duration: 15, label: 'Part 1 Fluency Drill', xp: 25 },
                ]
            },
            {
                day: 3, tasks: [
                    { type: 'listening', module: '/listening', duration: 40, label: 'Listening Sections 3-4 — Academic', xp: 70 },
                    { type: 'writing', module: '/writing', duration: 30, label: 'Task 2 — Practice Essay', xp: 50 },
                ]
            },
            {
                day: 4, tasks: [
                    { type: 'reading', module: '/reading', duration: 45, label: 'Timed Reading — 3 Passages in 60 min', xp: 80 },
                    { type: 'vocab', module: '/english', duration: 25, label: 'Academic Collocations', xp: 40 },
                ]
            },
            {
                day: 5, tasks: [
                    { type: 'exam', module: '/exam-prep', duration: 70, label: 'Mock — Full Reading Test', xp: 120 },
                    { type: 'review', module: '/review', duration: 15, label: 'Error Analysis', xp: 20 },
                ]
            },
        ],
    },
    {
        week: 4, title: 'Skills — Writing & Speaking Focus',
        focus: ['writing', 'speaking'],
        days: [
            {
                day: 1, tasks: [
                    { type: 'writing', module: '/writing', duration: 40, label: 'Task 1 — Line Graph + Bar Chart', xp: 60 },
                    { type: 'grammar', module: '/grammar', topic: 'linking-words', duration: 20, label: 'Linking Words & Cohesion', xp: 30 },
                    { type: 'review', module: '/review', duration: 15, label: 'SM-2 Review', xp: 20 },
                ]
            },
            {
                day: 2, tasks: [
                    { type: 'speaking', module: '/speaking', duration: 30, label: 'Part 2 — Describe a Person/Place', xp: 50 },
                    { type: 'speaking', module: '/speaking', duration: 20, label: 'Part 3 — Discussion Practice', xp: 40 },
                    { type: 'listening', module: '/listening', duration: 20, label: 'Listening — Gap Fill Section', xp: 30 },
                ]
            },
            {
                day: 3, tasks: [
                    { type: 'writing', module: '/writing', duration: 45, label: 'Task 2 — Opinion Essay (Timed)', xp: 70 },
                    { type: 'vocab', module: '/english', duration: 25, label: 'Paraphrasing Practice', xp: 40 },
                ]
            },
            {
                day: 4, tasks: [
                    { type: 'speaking', module: '/speaking', duration: 30, label: 'Full Speaking Mock (Parts 1-3)', xp: 60 },
                    { type: 'grammar', module: '/grammar', topic: 'modal-verbs', duration: 20, label: 'Modal Verbs Mastery', xp: 30 },
                    { type: 'review', module: '/review', duration: 15, label: 'Weekly Review', xp: 20 },
                ]
            },
            {
                day: 5, tasks: [
                    { type: 'writing', module: '/writing', duration: 45, label: 'Task 1 + Task 2 Combo Practice', xp: 80 },
                    { type: 'review', module: '/review', duration: 15, label: 'Error Pattern Analysis', xp: 20 },
                ]
            },
        ],
    },
    {
        week: 5, title: 'Integration — Cross-skill Practice',
        focus: ['listening', 'reading', 'writing', 'speaking'],
        days: [
            {
                day: 1, tasks: [
                    { type: 'listening', module: '/listening', duration: 35, label: 'Listening Full Test Practice', xp: 60 },
                    { type: 'writing', module: '/writing', duration: 35, label: 'Task 2 — Discussion Essay', xp: 50 },
                    { type: 'review', module: '/review', duration: 10, label: 'Vocab Review', xp: 15 },
                ]
            },
            {
                day: 2, tasks: [
                    { type: 'reading', module: '/reading', duration: 40, label: 'Academic Reading — Speed Training', xp: 60 },
                    { type: 'speaking', module: '/speaking', duration: 25, label: 'Speaking — Idiomatic Expressions', xp: 40 },
                    { type: 'grammar', module: '/grammar', topic: 'gerunds-infinitives', duration: 15, label: 'Gerunds & Infinitives', xp: 25 },
                ]
            },
            {
                day: 3, tasks: [
                    { type: 'exam', module: '/exam-prep', duration: 90, label: 'Half Mock Test (Listening + Reading)', xp: 150 },
                ]
            },
            {
                day: 4, tasks: [
                    { type: 'writing', module: '/writing', duration: 40, label: 'Task 1 — Process Diagram', xp: 60 },
                    { type: 'speaking', module: '/speaking', duration: 30, label: 'Part 2+3 Advanced Practice', xp: 50 },
                ]
            },
            {
                day: 5, tasks: [
                    { type: 'exam', module: '/exam-prep', duration: 90, label: 'Half Mock Test (Writing + Speaking)', xp: 150 },
                    { type: 'review', module: '/review', duration: 15, label: 'Full Week Review', xp: 20 },
                ]
            },
        ],
    },
    {
        week: 6, title: 'Advanced — Complex Structures & Academic Style',
        focus: ['grammar', 'writing', 'vocabulary'],
        days: [
            {
                day: 1, tasks: [
                    { type: 'grammar', module: '/grammar', topic: 'inversion', duration: 25, label: 'Advanced: Inversion', xp: 40 },
                    { type: 'writing', module: '/writing', duration: 35, label: 'Task 2 — Problem-Solution Essay', xp: 50 },
                    { type: 'vocab', module: '/english', duration: 20, label: 'C1 Academic Vocabulary', xp: 30 },
                ]
            },
            {
                day: 2, tasks: [
                    { type: 'reading', module: '/reading', duration: 40, label: 'Reading — Inference Questions', xp: 60 },
                    { type: 'grammar', module: '/grammar', topic: 'cleft-sentences', duration: 25, label: 'Advanced: Cleft Sentences', xp: 40 },
                    { type: 'review', module: '/review', duration: 15, label: 'SM-2 Review', xp: 20 },
                ]
            },
            {
                day: 3, tasks: [
                    { type: 'listening', module: '/listening', duration: 35, label: 'Listening — Section 4 Academic Lectures', xp: 60 },
                    { type: 'speaking', module: '/speaking', duration: 30, label: 'Advanced Vocabulary in Speaking', xp: 50 },
                ]
            },
            {
                day: 4, tasks: [
                    { type: 'writing', module: '/writing', duration: 45, label: 'Task 1+2 Full Timed Practice', xp: 80 },
                    { type: 'grammar', module: '/grammar', topic: 'nominalization', duration: 20, label: 'Advanced: Nominalization', xp: 30 },
                ]
            },
            {
                day: 5, tasks: [
                    { type: 'exam', module: '/exam-prep', duration: 120, label: 'Full Mock Test #1', xp: 200 },
                ]
            },
        ],
    },
    {
        week: 7, title: 'Mock Exam — Timed Practice',
        focus: ['exam'],
        days: [
            {
                day: 1, tasks: [
                    { type: 'exam', module: '/exam-prep', duration: 60, label: 'Mock — Listening (40 questions)', xp: 100 },
                    { type: 'review', module: '/review', duration: 30, label: 'Error Analysis — Listening', xp: 40 },
                ]
            },
            {
                day: 2, tasks: [
                    { type: 'exam', module: '/exam-prep', duration: 60, label: 'Mock — Reading (3 passages)', xp: 100 },
                    { type: 'review', module: '/review', duration: 30, label: 'Error Analysis — Reading', xp: 40 },
                ]
            },
            {
                day: 3, tasks: [
                    { type: 'exam', module: '/exam-prep', duration: 60, label: 'Mock — Writing (Task 1 + 2)', xp: 100 },
                    { type: 'review', module: '/review', duration: 20, label: 'Writing Rubric Self-Check', xp: 30 },
                ]
            },
            {
                day: 4, tasks: [
                    { type: 'exam', module: '/exam-prep', duration: 30, label: 'Mock — Speaking (Parts 1-3)', xp: 80 },
                    { type: 'review', module: '/review', duration: 20, label: 'Fluency + Pronunciation Review', xp: 30 },
                    { type: 'vocab', module: '/english', duration: 20, label: 'Last-minute Vocabulary', xp: 30 },
                ]
            },
            {
                day: 5, tasks: [
                    { type: 'exam', module: '/exam-prep', duration: 150, label: 'FULL Mock Exam #2 (All Sections)', xp: 250 },
                ]
            },
        ],
    },
    {
        week: 8, title: 'Final Prep — Confidence & Fine-tuning',
        focus: ['exam', 'review'],
        days: [
            {
                day: 1, tasks: [
                    { type: 'review', module: '/review', duration: 30, label: 'Review All Weak Areas', xp: 40 },
                    { type: 'vocab', module: '/english', duration: 20, label: 'High-frequency IELTS Words', xp: 30 },
                    { type: 'listening', module: '/listening', duration: 25, label: 'Listening — Speed Adaptation', xp: 40 },
                ]
            },
            {
                day: 2, tasks: [
                    { type: 'reading', module: '/reading', duration: 30, label: 'Quick Reading — Time Management', xp: 50 },
                    { type: 'writing', module: '/writing', duration: 30, label: 'Essay Templates Review', xp: 40 },
                    { type: 'review', module: '/review', duration: 15, label: 'Grammar Error Patterns', xp: 20 },
                ]
            },
            {
                day: 3, tasks: [
                    { type: 'speaking', module: '/speaking', duration: 30, label: 'Speaking Confidence Drill', xp: 50 },
                    { type: 'review', module: '/review', duration: 30, label: 'Full Vocabulary Review (SM-2)', xp: 40 },
                ]
            },
            {
                day: 4, tasks: [
                    { type: 'exam', module: '/exam-prep', duration: 150, label: 'FINAL Full Mock Exam #3', xp: 300 },
                ]
            },
            {
                day: 5, tasks: [
                    { type: 'review', module: '/review', duration: 30, label: 'Final Error Analysis', xp: 40 },
                    { type: 'review', module: '/review', duration: 20, label: 'Exam Day Strategy Review', xp: 20 },
                    { type: 'review', module: '/review', duration: 10, label: 'Confidence Meditation & Visualization', xp: 10 },
                ]
            },
        ],
    },
];

// ============================================================
// HSK 3 — 12-week roadmap
// Weeks 1-4: HSK1 Review, Weeks 5-8: HSK2 Consolidation,
// Weeks 9-12: HSK3 New Content + Mock
// ============================================================
export const HSK_ROADMAP = [
    {
        week: 1, title: 'HSK 1 Review — Basic Characters & Tones',
        focus: ['vocabulary', 'tones'],
        days: [
            {
                day: 1, tasks: [
                    { type: 'vocab', module: '/chinese', topic: 'greetings-cn', duration: 20, label: '问候 Greetings Review (10 words)', xp: 30 },
                    { type: 'speaking', module: '/speaking-cn', duration: 15, label: 'Tone Drill — 4 Tones', xp: 25 },
                    { type: 'review', module: '/review', duration: 10, label: 'Spaced Repetition', xp: 15 },
                ]
            },
            {
                day: 2, tasks: [
                    { type: 'vocab', module: '/chinese', topic: 'numbers-cn', duration: 20, label: '数字 Numbers & Counting', xp: 30 },
                    { type: 'grammar', module: '/grammar-cn', topic: 'word-order', duration: 15, label: 'SVO Word Order', xp: 25 },
                    { type: 'listening', module: '/listening-cn', duration: 15, label: 'Listening — Daily Routine', xp: 25 },
                ]
            },
            {
                day: 3, tasks: [
                    { type: 'vocab', module: '/chinese', topic: 'family-cn', duration: 20, label: '家庭 Family Members', xp: 30 },
                    { type: 'speaking', module: '/speaking-cn', duration: 15, label: 'Shadowing — Self Introduction', xp: 25 },
                    { type: 'review', module: '/review', duration: 10, label: 'Character Review', xp: 15 },
                ]
            },
            {
                day: 4, tasks: [
                    { type: 'vocab', module: '/chinese', topic: 'food-cn', duration: 20, label: '食物 Food & Drinks', xp: 30 },
                    { type: 'grammar', module: '/grammar-cn', topic: 'particles', duration: 15, label: 'Particles 了/的/吗', xp: 25 },
                    { type: 'listening', module: '/listening-cn', duration: 15, label: 'Listening — Restaurant', xp: 25 },
                ]
            },
            {
                day: 5, tasks: [
                    { type: 'review', module: '/review', duration: 20, label: 'Weekly Review — All HSK1 Words', xp: 30 },
                    { type: 'vocab', module: '/chinese', topic: 'time-cn', duration: 20, label: '时间 Time Expressions', xp: 30 },
                ]
            },
        ],
    },
    {
        week: 2, title: 'HSK 1 Review — Daily Life Topics', focus: ['vocabulary', 'listening'],
        days: [
            {
                day: 1, tasks: [
                    { type: 'vocab', module: '/chinese', topic: 'colors-cn', duration: 20, label: '颜色 Colors', xp: 30 },
                    { type: 'listening', module: '/listening-cn', duration: 20, label: 'Listening Comprehension', xp: 35 },
                    { type: 'review', module: '/review', duration: 10, label: 'Review', xp: 15 },
                ]
            },
            {
                day: 2, tasks: [
                    { type: 'vocab', module: '/chinese', topic: 'body-cn', duration: 20, label: '身体 Body Parts', xp: 30 },
                    { type: 'grammar', module: '/grammar-cn', topic: 'measure-words', duration: 20, label: 'Measure Words 个/本/杯', xp: 35 },
                ]
            },
            {
                day: 3, tasks: [
                    { type: 'vocab', module: '/chinese', topic: 'animals-cn', duration: 20, label: '动物 Animals', xp: 30 },
                    { type: 'speaking', module: '/speaking-cn', duration: 20, label: 'Tone Pairs Practice', xp: 35 },
                    { type: 'review', module: '/review', duration: 10, label: 'Flashcard Review', xp: 15 },
                ]
            },
            {
                day: 4, tasks: [
                    { type: 'vocab', module: '/chinese', topic: 'clothes-cn', duration: 20, label: '衣服 Clothing', xp: 30 },
                    { type: 'listening', module: '/listening-cn', duration: 20, label: 'Dialogue Practice', xp: 35 },
                ]
            },
            {
                day: 5, tasks: [
                    { type: 'review', module: '/review', duration: 30, label: 'HSK 1 — Full Review (150 words)', xp: 50 },
                    { type: 'speaking', module: '/speaking-cn', duration: 15, label: 'Free Conversation', xp: 25 },
                ]
            },
        ],
    },
    // Weeks 3-4: HSK1 complete + transition
    {
        week: 3, title: 'HSK 1 Complete — Advanced Practice', focus: ['vocabulary', 'grammar'],
        days: Array.from({ length: 5 }, (_, i) => ({
            day: i + 1, tasks: [
                { type: 'vocab', module: '/chinese', duration: 20, label: `HSK 1 Topics ${i * 2 + 1}-${i * 2 + 2} Review`, xp: 30 },
                { type: 'grammar', module: '/grammar-cn', duration: 15, label: 'Grammar Pattern Practice', xp: 25 },
                { type: 'review', module: '/review', duration: 15, label: 'Spaced Repetition', xp: 20 },
            ]
        })),
    },
    {
        week: 4, title: 'HSK 1→2 Transition', focus: ['vocabulary', 'listening'],
        days: Array.from({ length: 5 }, (_, i) => ({
            day: i + 1, tasks: [
                { type: 'vocab', module: '/chinese', duration: 25, label: `HSK 2 New Words — Set ${i + 1}`, xp: 40 },
                { type: 'listening', module: '/listening-cn', duration: 20, label: 'Listening Upgrade', xp: 35 },
                { type: 'review', module: '/review', duration: 10, label: 'Review', xp: 15 },
            ]
        })),
    },
    // Weeks 5-8: HSK 2 mastery
    {
        week: 5, title: 'HSK 2 — Core Vocabulary', focus: ['vocabulary', 'grammar'],
        days: Array.from({ length: 5 }, (_, i) => ({
            day: i + 1, tasks: [
                { type: 'vocab', module: '/chinese', duration: 25, label: `HSK 2 Words — Group ${i + 1}`, xp: 40 },
                { type: 'grammar', module: '/grammar-cn', duration: 20, label: 'Comparison & Question Patterns', xp: 35 },
                { type: 'speaking', module: '/speaking-cn', duration: 15, label: 'Dialogue Shadowing', xp: 25 },
            ]
        })),
    },
    {
        week: 6, title: 'HSK 2 — Listening & Speaking', focus: ['listening', 'speaking'],
        days: Array.from({ length: 5 }, (_, i) => ({
            day: i + 1, tasks: [
                { type: 'listening', module: '/listening-cn', duration: 25, label: `Listening — Dialogue ${i + 1}`, xp: 40 },
                { type: 'speaking', module: '/speaking-cn', duration: 20, label: 'Conversation Practice', xp: 35 },
                { type: 'review', module: '/review', duration: 15, label: 'Character Review', xp: 20 },
            ]
        })),
    },
    {
        week: 7, title: 'HSK 2 — Reading & Writing', focus: ['reading', 'writing'],
        days: Array.from({ length: 5 }, (_, i) => ({
            day: i + 1, tasks: [
                { type: 'reading', module: '/reading', duration: 20, label: 'Chinese Reading — Short Passages', xp: 35 },
                { type: 'writing', module: '/writing', duration: 20, label: 'Sentence Construction', xp: 35 },
                { type: 'vocab', module: '/chinese', duration: 15, label: 'HSK 2 Vocabulary Drill', xp: 25 },
            ]
        })),
    },
    {
        week: 8, title: 'HSK 2 Complete — Mock Test', focus: ['exam', 'review'],
        days: Array.from({ length: 5 }, (_, i) => ({
            day: i + 1, tasks: i < 4 ? [
                { type: 'review', module: '/review', duration: 25, label: 'HSK 2 Full Review', xp: 40 },
                { type: 'grammar', module: '/grammar-cn', duration: 20, label: 'Grammar Consolidation', xp: 30 },
            ] : [
                { type: 'exam', module: '/exam-prep', duration: 60, label: 'HSK 2 Mock Test', xp: 100 },
            ]
        })),
    },
    // Weeks 9-12: HSK 3 new content
    {
        week: 9, title: 'HSK 3 — New Vocabulary (1/3)', focus: ['vocabulary', 'grammar'],
        days: Array.from({ length: 5 }, (_, i) => ({
            day: i + 1, tasks: [
                { type: 'vocab', module: '/chinese', duration: 30, label: `HSK 3 New Words — Set ${i + 1} (20 words)`, xp: 50 },
                { type: 'grammar', module: '/grammar-cn', duration: 20, label: 'HSK 3 Grammar Patterns', xp: 35 },
                { type: 'review', module: '/review', duration: 15, label: 'Spaced Repetition', xp: 20 },
            ]
        })),
    },
    {
        week: 10, title: 'HSK 3 — New Vocabulary (2/3)', focus: ['vocabulary', 'listening'],
        days: Array.from({ length: 5 }, (_, i) => ({
            day: i + 1, tasks: [
                { type: 'vocab', module: '/chinese', duration: 30, label: `HSK 3 Words — Set ${i + 6} (20 words)`, xp: 50 },
                { type: 'listening', module: '/listening-cn', duration: 25, label: 'HSK 3 Listening Practice', xp: 40 },
                { type: 'review', module: '/review', duration: 10, label: 'Review', xp: 15 },
            ]
        })),
    },
    {
        week: 11, title: 'HSK 3 — Complete Vocabulary + Skills', focus: ['vocabulary', 'writing'],
        days: Array.from({ length: 5 }, (_, i) => ({
            day: i + 1, tasks: [
                { type: 'vocab', module: '/chinese', duration: 25, label: `HSK 3 Final Words — Set ${i + 11}`, xp: 40 },
                { type: 'writing', module: '/writing', duration: 20, label: 'Sentence Writing Practice', xp: 35 },
                { type: 'speaking', module: '/speaking-cn', duration: 15, label: 'Free Speaking Drill', xp: 25 },
            ]
        })),
    },
    {
        week: 12, title: 'HSK 3 — Final Review & Mock Exam', focus: ['exam', 'review'],
        days: Array.from({ length: 5 }, (_, i) => ({
            day: i + 1, tasks: i < 3 ? [
                { type: 'review', module: '/review', duration: 30, label: 'Full HSK 3 Vocabulary Review', xp: 50 },
                { type: 'grammar', module: '/grammar-cn', duration: 20, label: 'Grammar Final Review', xp: 30 },
                { type: 'listening', module: '/listening-cn', duration: 15, label: 'Listening Speed Drill', xp: 25 },
            ] : [
                { type: 'exam', module: '/exam-prep', duration: 90, label: i === 3 ? 'HSK 3 Mock Test #1' : 'HSK 3 FINAL Mock Test', xp: i === 3 ? 150 : 250 },
                { type: 'review', module: '/review', duration: 20, label: 'Error Analysis', xp: 30 },
            ]
        })),
    },
];

// ============================================================
// Helper functions
// ============================================================

export function getRoadmap(examTarget) {
    if (examTarget === 'ielts75') return IELTS_ROADMAP;
    if (examTarget === 'hsk3') return HSK_ROADMAP;
    return [];
}

export function getTodayTasks(roadmap, week, dayOfWeek) {
    // dayOfWeek: 1=Mon ... 5=Fri (study days), 6-7=weekend (review only)
    const weekData = roadmap.find(w => w.week === week);
    if (!weekData) return [];
    const day = Math.min(dayOfWeek, weekData.days.length);
    return weekData.days[day - 1]?.tasks || [];
}

export function getWeekProgress(completedTasks, weekData) {
    if (!weekData) return 0;
    const totalTasks = weekData.days.reduce((sum, d) => sum + d.tasks.length, 0);
    if (totalTasks === 0) return 0;
    const done = completedTasks.filter(t =>
        t.week === weekData.week
    ).length;
    return Math.round((done / totalTasks) * 100);
}

export function getTotalXPForWeek(weekData) {
    if (!weekData) return 0;
    return weekData.days.reduce((sum, d) =>
        sum + d.tasks.reduce((s, t) => s + (t.xp || 0), 0), 0);
}

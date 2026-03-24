// Writing Content — IELTS/TOEIC writing prompts, model answers, grammar exercises

export const WRITING_PROMPTS = [
    {
        id: 'ielts-task2-technology',
        type: 'essay',
        title: 'Technology & Society',
        titleVi: 'Công nghệ & Xã hội',
        level: 'B2',
        emoji: '📝',
        mode: 'adult',
        examType: 'IELTS Task 2',
        timeLimit: 2400,
        minWords: 250,
        prompt: "Some people believe that technology has made our lives more complicated rather than simpler. To what extent do you agree or disagree?",
        promptVi: "Một số người cho rằng công nghệ đã làm cuộc sống phức tạp hơn thay vì đơn giản hơn. Bạn đồng ý hay không đồng ý?",
        tips: [
            "Start with a clear thesis statement in the introduction",
            "Use 2-3 body paragraphs with topic sentences",
            "Include specific examples to support your arguments",
            "Write a conclusion that summarizes your position",
            "Target: 250-300 words for IELTS Task 2",
        ],
        modelAnswer: `It is often argued that technological advancements have added complexity to our daily lives rather than simplifying them. While I acknowledge that technology can sometimes be overwhelming, I largely disagree with this view, as the benefits far outweigh the drawbacks.

On the one hand, critics have valid concerns about technology's impact on our lives. The constant flow of notifications from smartphones and social media can be stressful and distracting. Many people feel pressured to be available around the clock, blurring the boundaries between work and personal life. Furthermore, the rapid pace of technological change means that individuals must continuously learn new systems and applications, which can be frustrating, particularly for older generations.

However, technology has undeniably simplified numerous aspects of daily life. Communication has become virtually instantaneous — we can connect with anyone, anywhere in the world, within seconds. Tasks that once required hours, such as banking, shopping, and paying bills, can now be completed in minutes through mobile applications. In healthcare, technological innovations have led to earlier disease detection and more effective treatments, ultimately saving lives.

Moreover, technology has democratized access to information and education. Online learning platforms enable people from all backgrounds to acquire new skills and qualifications without geographical constraints. This would have been impossible just twenty years ago.

In conclusion, while technology certainly presents some challenges, I believe it has fundamentally made our lives easier and more efficient. The key lies in learning to manage our relationship with technology rather than dismissing its value entirely.`,
        criteria: [
            { name: 'Task Achievement', description: 'Addresses all parts of the task, presents a clear position' },
            { name: 'Coherence & Cohesion', description: 'Logically organized, uses linking words effectively' },
            { name: 'Lexical Resource', description: 'Range of vocabulary, collocations, less common words' },
            { name: 'Grammar Range & Accuracy', description: 'Mix of simple and complex sentences, few errors' },
        ],
    },
    {
        id: 'ielts-task1-graph',
        type: 'report',
        title: 'Graph Description',
        titleVi: 'Mô tả biểu đồ',
        level: 'B2',
        emoji: '📊',
        mode: 'adult',
        examType: 'IELTS Task 1',
        timeLimit: 1200,
        minWords: 150,
        prompt: "The bar chart shows the percentage of people in four countries who used the internet for different purposes in 2025. Summarize the information by selecting and reporting the main features, and make comparisons where relevant.",
        chartData: {
            type: 'bar',
            categories: ['Email', 'Social Media', 'Online Shopping', 'News', 'Education'],
            countries: ['Vietnam', 'Japan', 'USA', 'Germany'],
            data: {
                'Vietnam': [78, 92, 65, 55, 45],
                'Japan': [85, 70, 80, 75, 35],
                'USA': [90, 88, 95, 60, 40],
                'Germany': [88, 65, 82, 80, 50],
            },
        },
        tips: [
            "Start with a paraphrase of the question",
            "Describe the overall trend first",
            "Compare and contrast key data points",
            "Use specific numbers from the chart",
            "Don't give your opinion — just describe",
        ],
    },
    {
        id: 'email-formal',
        type: 'email',
        title: 'Formal Email Writing',
        titleVi: 'Viết email trang trọng',
        level: 'B1',
        emoji: '✉️',
        mode: 'adult',
        examType: 'TOEIC / General',
        timeLimit: 900,
        minWords: 100,
        prompt: "You recently purchased a laptop online but received the wrong model. Write an email to the customer service department to: explain the situation, describe the item you received vs. what you ordered, and request a resolution.",
        tips: [
            "Use formal greetings: Dear Sir/Madam, Dear Customer Service Team",
            "Structure: Opening → Problem → Details → Request → Closing",
            "Be polite but firm",
            "Include order number and dates (you can make these up)",
            "Close formally: Yours sincerely / Best regards",
        ],
    },
];

export const SENTENCE_EXERCISES = [
    {
        id: 'error-correction-1',
        type: 'error_correction',
        title: 'Error Correction — Tenses',
        titleVi: 'Sửa lỗi — Thì',
        level: 'B1',
        exercises: [
            { sentence: "I have went to Paris last summer.", correct: "I went to Paris last summer.", error: 'went → went (simple past, not present perfect)', rule: "Don't use present perfect with specific past time expressions." },
            { sentence: "She is working here since 2020.", correct: "She has been working here since 2020.", error: 'is working → has been working', rule: "Use present perfect continuous with 'since' for duration." },
            { sentence: "By the time he arrived, the movie already started.", correct: "By the time he arrived, the movie had already started.", error: 'started → had started', rule: "Use past perfect for the earlier of two past events." },
            { sentence: "I will call you when I will arrive.", correct: "I will call you when I arrive.", error: "Remove 'will' after 'when'", rule: "Don't use future tense in time clauses with 'when', 'after', 'before'." },
            { sentence: "He don't like coffee.", correct: "He doesn't like coffee.", error: "don't → doesn't", rule: "Third person singular uses 'doesn't' in negative present simple." },
        ],
    },
    {
        id: 'sentence-transform-1',
        type: 'transformation',
        title: 'Sentence Transformation',
        titleVi: 'Chuyển đổi câu',
        level: 'B2',
        exercises: [
            { original: "They built this bridge in 1990.", target: "This bridge was built in 1990.", hint: "Change to passive voice", skill: "Passive voice" },
            { original: "She said, 'I will come tomorrow.'", target: "She said that she would come the next day.", hint: "Change to reported speech", skill: "Reported speech" },
            { original: "If I have enough money, I will buy a car.", target: "If I had enough money, I would buy a car.", hint: "Change to second conditional (hypothetical)", skill: "Conditionals" },
            { original: "It is necessary that everyone attends the meeting.", target: "Everyone must attend the meeting.", hint: "Use a modal verb", skill: "Modal verbs" },
        ],
    },
];

export function getWritingByMode(mode) {
    if (mode === 'adult') return WRITING_PROMPTS;
    return [];
}

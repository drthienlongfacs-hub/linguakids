// Grammar Content — 10 core grammar topics with explanations, examples, and exercises

export const GRAMMAR_TOPICS = [
    {
        id: 'present-tenses',
        title: 'Present Tenses',
        titleVi: 'Các thì hiện tại',
        level: 'B1',
        emoji: '⏰',
        summary: 'Present Simple, Present Continuous, Present Perfect, Present Perfect Continuous',
        sections: [
            {
                name: 'Present Simple',
                rule: 'For habits, routines, facts, and general truths.',
                formula: 'S + V(s/es) | S + do/does + not + V',
                examples: [
                    { en: 'She works at a hospital.', vi: 'Cô ấy làm việc ở bệnh viện.' },
                    { en: 'Water boils at 100 degrees Celsius.', vi: 'Nước sôi ở 100 độ C.' },
                    { en: 'I don\'t like coffee.', vi: 'Tôi không thích cà phê.' },
                ],
                signalWords: ['always', 'usually', 'often', 'sometimes', 'never', 'every day'],
            },
            {
                name: 'Present Continuous',
                rule: 'For actions happening right now or temporary situations.',
                formula: 'S + am/is/are + V-ing',
                examples: [
                    { en: 'I am studying English right now.', vi: 'Tôi đang học tiếng Anh.' },
                    { en: 'She is living in Hanoi temporarily.', vi: 'Cô ấy đang sống tạm ở Hà Nội.' },
                ],
                signalWords: ['now', 'right now', 'at the moment', 'currently', 'today'],
            },
            {
                name: 'Present Perfect',
                rule: 'For actions that started in the past and continue to now, or past actions with present results.',
                formula: 'S + have/has + V3 (past participle)',
                examples: [
                    { en: 'I have lived here since 2020.', vi: 'Tôi đã sống ở đây từ 2020.' },
                    { en: 'She has visited Japan three times.', vi: 'Cô ấy đã đến Nhật 3 lần.' },
                ],
                signalWords: ['since', 'for', 'already', 'yet', 'just', 'ever', 'never'],
            },
        ],
        exercises: [
            { type: 'gap_fill', question: 'She _______ (work) at the company since 2019.', answer: 'has worked', hint: 'Present perfect with "since"' },
            { type: 'gap_fill', question: 'Look! It _______ (rain) outside.', answer: 'is raining', hint: 'Action happening now' },
            { type: 'gap_fill', question: 'He usually _______ (drink) tea in the morning.', answer: 'drinks', hint: 'Routine/habit' },
            { type: 'mcq', question: 'Which sentence is correct?', options: ['I am knowing the answer.', 'I know the answer.', 'I have knowing the answer.', 'I knowing the answer.'], correct: 1 },
            { type: 'error_correction', sentence: 'I am living in this city since 2015.', correct: 'I have lived/have been living in this city since 2015.', rule: "Use present perfect with 'since'" },
        ],
    },
    {
        id: 'past-tenses',
        title: 'Past Tenses',
        titleVi: 'Các thì quá khứ',
        level: 'B1',
        emoji: '⏪',
        summary: 'Past Simple, Past Continuous, Past Perfect',
        sections: [
            {
                name: 'Past Simple',
                rule: 'For completed actions in the past.',
                formula: 'S + V2 (past tense) | S + did + not + V',
                examples: [
                    { en: 'I visited London last year.', vi: 'Tôi đã đến London năm ngoái.' },
                    { en: 'She didn\'t come to the party.', vi: 'Cô ấy không đến bữa tiệc.' },
                ],
                signalWords: ['yesterday', 'last week/month/year', 'ago', 'in 2020'],
            },
            {
                name: 'Past Continuous',
                rule: 'For actions in progress at a specific time in the past.',
                formula: 'S + was/were + V-ing',
                examples: [
                    { en: 'I was reading when you called.', vi: 'Tôi đang đọc khi bạn gọi.' },
                    { en: 'They were playing football at 3pm.', vi: 'Họ đang chơi bóng lúc 3 giờ chiều.' },
                ],
                signalWords: ['when', 'while', 'at that time'],
            },
            {
                name: 'Past Perfect',
                rule: 'For actions completed before another past action.',
                formula: 'S + had + V3',
                examples: [
                    { en: 'I had already eaten when she arrived.', vi: 'Tôi đã ăn rồi khi cô ấy đến.' },
                    { en: 'By 2020, he had published three books.', vi: 'Đến năm 2020, anh ấy đã xuất bản 3 cuốn sách.' },
                ],
                signalWords: ['before', 'after', 'by the time', 'already', 'just'],
            },
        ],
        exercises: [
            { type: 'gap_fill', question: 'I _______ (see) that movie yesterday.', answer: 'saw', hint: 'Past simple with "yesterday"' },
            { type: 'gap_fill', question: 'While she _______ (cook), the phone rang.', answer: 'was cooking', hint: 'Action in progress interrupted' },
            { type: 'gap_fill', question: 'By the time we arrived, the concert _______ (start).', answer: 'had started', hint: 'Earlier past action' },
            { type: 'mcq', question: 'Which is correct?', options: ['When I came, she already left.', 'When I came, she had already left.', 'When I came, she has already left.', 'When I was coming, she already left.'], correct: 1 },
        ],
    },
    {
        id: 'conditionals',
        title: 'Conditionals (If-clauses)',
        titleVi: 'Câu điều kiện',
        level: 'B2',
        emoji: '🔀',
        summary: 'Zero, First, Second, Third Conditionals',
        sections: [
            {
                name: 'Zero Conditional',
                rule: 'For general truths and scientific facts.',
                formula: 'If + present simple, present simple',
                examples: [{ en: 'If you heat water to 100°C, it boils.', vi: 'Nếu bạn đun nước đến 100°C, nó sôi.' }],
            },
            {
                name: 'First Conditional',
                rule: 'For possible future situations.',
                formula: 'If + present simple, will + V',
                examples: [{ en: 'If it rains tomorrow, I will stay home.', vi: 'Nếu ngày mai trời mưa, tôi sẽ ở nhà.' }],
            },
            {
                name: 'Second Conditional',
                rule: 'For hypothetical/unlikely present or future situations.',
                formula: 'If + past simple, would + V',
                examples: [{ en: 'If I had a million dollars, I would travel the world.', vi: 'Nếu tôi có triệu đô, tôi sẽ đi vòng quanh thế giới.' }],
            },
            {
                name: 'Third Conditional',
                rule: 'For hypothetical past situations (things that didn\'t happen).',
                formula: 'If + past perfect, would have + V3',
                examples: [{ en: 'If I had studied harder, I would have passed the exam.', vi: 'Nếu tôi học chăm hơn, tôi đã đỗ kỳ thi rồi.' }],
            },
        ],
        exercises: [
            { type: 'gap_fill', question: 'If I _______ (be) you, I would accept the offer.', answer: 'were', hint: 'Second conditional' },
            { type: 'gap_fill', question: 'If she studies hard, she _______ (pass) the exam.', answer: 'will pass', hint: 'First conditional' },
            { type: 'gap_fill', question: 'If they _______ (leave) earlier, they would have caught the train.', answer: 'had left', hint: 'Third conditional' },
            { type: 'mcq', question: 'Which conditional is for impossible past events?', options: ['Zero', 'First', 'Second', 'Third'], correct: 3 },
        ],
    },
    {
        id: 'passive-voice',
        title: 'Passive Voice',
        titleVi: 'Câu bị động',
        level: 'B1',
        emoji: '🔄',
        summary: 'Active to Passive conversion across tenses',
        sections: [
            {
                name: 'Basic Passive',
                rule: 'Object becomes subject. Use be + past participle.',
                formula: 'S + be + V3 (+ by agent)',
                examples: [
                    { en: 'Active: They built this bridge in 1990.', vi: 'Chủ động: Họ xây cây cầu này năm 1990.' },
                    { en: 'Passive: This bridge was built in 1990.', vi: 'Bị động: Cây cầu này được xây năm 1990.' },
                ],
            },
        ],
        exercises: [
            { type: 'transformation', original: 'They make cars in Germany.', target: 'Cars are made in Germany.', hint: 'Present simple passive' },
            { type: 'transformation', original: 'Someone stole my bicycle.', target: 'My bicycle was stolen.', hint: 'Past simple passive' },
            { type: 'gap_fill', question: 'English _______ (speak) in many countries.', answer: 'is spoken', hint: 'Present passive' },
        ],
    },
    {
        id: 'reported-speech',
        title: 'Reported Speech',
        titleVi: 'Câu tường thuật',
        level: 'B2',
        emoji: '💬',
        summary: 'Direct to Indirect speech conversion',
        sections: [
            {
                name: 'Statements',
                rule: 'Shift tenses back one step. Change pronouns and time expressions.',
                formula: 'S + said (that) + shifted tense',
                examples: [
                    { en: '"I am tired," she said. → She said (that) she was tired.', vi: '"Tôi mệt," cô ấy nói. → Cô ấy nói rằng cô ấy mệt.' },
                    { en: '"I will come tomorrow." → He said he would come the next day.', vi: '"Tôi sẽ đến ngày mai." → Anh ấy nói sẽ đến ngày hôm sau.' },
                ],
            },
        ],
        exercises: [
            { type: 'transformation', original: '"I love this city," he said.', target: 'He said that he loved that city.', hint: 'Change tense + pronoun + this→that' },
            { type: 'transformation', original: '"We are leaving now," they said.', target: 'They said that they were leaving then.', hint: 'Shift tense, now→then' },
        ],
    },
];

export function getGrammarByLevel(level) {
    return GRAMMAR_TOPICS.filter(t => t.level === level);
}

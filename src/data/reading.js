// Reading Content — Passages with IELTS/TOEIC question types

export const READING_PASSAGES = [
    {
        id: 'remote-work-revolution',
        title: 'The Remote Work Revolution',
        titleVi: 'Cuộc cách mạng làm việc từ xa',
        level: 'B1',
        wordCount: 320,
        readingTime: '4 min',
        topic: 'Work',
        emoji: '🏠',
        mode: 'adult',
        passage: `The way we work has changed dramatically in recent years. Before 2020, only about 5% of employees worked from home regularly. Today, that number has risen to over 30% in many countries, and some experts predict it could reach 50% by 2030.

There are several advantages to remote work. First, employees save time and money on commuting. The average worker spends about 45 minutes traveling to and from work each day. Working from home eliminates this completely. Second, many workers report higher productivity when they can control their own environment. They can work during their most productive hours and avoid the distractions of a busy office.

However, remote work is not without its challenges. Many employees feel isolated and miss the social interaction that comes with working in an office. Building team relationships can be more difficult when communication happens mainly through screens. Some workers also struggle with maintaining a healthy work-life balance, finding it hard to "switch off" when their home is also their office.

Companies have responded to these challenges in various ways. Some have adopted a hybrid model, where employees work from home two or three days a week and come to the office for the rest. Others have invested in virtual team-building activities and online collaboration tools. A few companies have even closed their offices entirely and gone fully remote.

The future of work will likely be a blend of these approaches. What's clear is that the traditional five-day office week is no longer the only option, and both employers and employees are still figuring out what works best for them.`,
        passageVi: `Cách chúng ta làm việc đã thay đổi đáng kể trong những năm gần đây...`,
        vocabulary: [
            { word: 'commuting', meaning: 'đi lại (đi làm)', example: 'Commuting takes 45 minutes daily.' },
            { word: 'productivity', meaning: 'năng suất', example: 'Remote work increases productivity.' },
            { word: 'isolate', meaning: 'cô lập', example: 'Some employees feel isolated at home.' },
            { word: 'hybrid model', meaning: 'mô hình kết hợp', example: 'A hybrid model combines office and home work.' },
            { word: 'collaboration', meaning: 'hợp tác', example: 'Online collaboration tools help teams.' },
        ],
        quiz: [
            { type: 'mcq', question: 'What percentage of employees worked from home before 2020?', options: ['5%', '15%', '30%', '50%'], correct: 0 },
            { type: 'mcq', question: 'What is one advantage of remote work mentioned in the passage?', options: ['Higher salary', 'Free lunch', 'Saving commute time', 'More vacation days'], correct: 2 },
            { type: 'true_false', question: 'All workers feel more productive working from home.', answer: false, explanation: 'The passage says "many workers report higher productivity" — not all.' },
            { type: 'true_false', question: 'Some companies have closed their offices entirely.', answer: true, explanation: 'The passage states "A few companies have even closed their offices entirely."' },
            { type: 'gap_fill', question: 'Companies have adopted a _______ model where employees split time between home and office.', answer: 'hybrid', hint: 'A combination of two approaches' },
            { type: 'mcq', question: 'What is the main challenge of remote work according to the passage?', options: ['Low salary', 'Poor internet', 'Feeling isolated', 'Too many meetings'], correct: 2 },
        ],
    },
    {
        id: 'ai-in-healthcare',
        title: 'Artificial Intelligence in Healthcare',
        titleVi: 'Trí tuệ nhân tạo trong y tế',
        level: 'B2',
        wordCount: 420,
        readingTime: '5 min',
        topic: 'Technology',
        emoji: '🤖',
        mode: 'adult',
        passage: `Artificial intelligence is transforming healthcare in ways that were unimaginable just a decade ago. From diagnosing diseases to developing new drugs, AI systems are becoming increasingly sophisticated and are being integrated into nearly every aspect of medical practice.

One of the most promising applications of AI is in medical imaging. Machine learning algorithms can now analyze X-rays, MRIs, and CT scans with remarkable accuracy, sometimes outperforming experienced radiologists. In a landmark study published in Nature, an AI system developed by Google Health demonstrated an accuracy rate of 94.5% in detecting breast cancer from mammograms, compared to 88% for human radiologists. This doesn't mean AI will replace doctors, but it can serve as a powerful second opinion.

Drug discovery is another area where AI is making significant strides. Traditionally, developing a new drug takes an average of 12 years and costs approximately $2.6 billion. AI can dramatically accelerate this process by analyzing millions of molecular combinations and predicting which ones are most likely to be effective. In 2023, the first AI-designed drug entered clinical trials, marking a historic milestone.

However, the integration of AI in healthcare raises important ethical concerns. Patient data privacy is paramount — AI systems require vast amounts of medical data to learn, and ensuring this data is properly anonymized and protected is crucial. There are also concerns about algorithmic bias: if AI systems are trained primarily on data from certain populations, they may not perform equally well for all patients.

Despite these challenges, the potential benefits are enormous. AI could help address the global shortage of healthcare workers by automating routine tasks, enable earlier detection of diseases, and provide personalized treatment recommendations based on an individual's unique genetic profile. The key is to develop and deploy these technologies responsibly, with appropriate oversight and regulation.`,
        vocabulary: [
            { word: 'sophisticated', meaning: 'tinh vi, phức tạp', example: 'AI systems are becoming increasingly sophisticated.' },
            { word: 'mammogram', meaning: 'chụp nhũ ảnh', example: 'AI can analyze mammograms accurately.' },
            { word: 'molecular', meaning: 'phân tử', example: 'Analyzing millions of molecular combinations.' },
            { word: 'milestone', meaning: 'cột mốc', example: 'A historic milestone in drug development.' },
            { word: 'paramount', meaning: 'tối quan trọng', example: 'Patient data privacy is paramount.' },
            { word: 'algorithmic bias', meaning: 'thiên lệch thuật toán', example: 'Algorithmic bias can affect AI accuracy.' },
            { word: 'anonymized', meaning: 'ẩn danh hóa', example: 'Data must be properly anonymized.' },
        ],
        quiz: [
            { type: 'mcq', question: "What was the AI system's accuracy rate in detecting breast cancer?", options: ['88%', '90%', '94.5%', '98%'], correct: 2 },
            { type: 'mcq', question: 'How long does traditional drug development typically take?', options: ['5 years', '8 years', '12 years', '20 years'], correct: 2 },
            { type: 'gap_fill', question: 'Developing a new drug costs approximately $_______ billion.', answer: '2.6', hint: 'A number between 2 and 3' },
            { type: 'true_false', question: 'The first AI-designed drug entered clinical trials in 2025.', answer: false, explanation: 'The passage states it was in 2023.' },
            { type: 'mcq', question: 'What ethical concern about AI in healthcare is mentioned?', options: ['High cost', 'Patient data privacy', 'Doctor unemployment', 'Slow processing'], correct: 1 },
            { type: 'true_false', question: 'AI will completely replace human doctors according to the passage.', answer: false, explanation: "The passage explicitly states 'This doesn't mean AI will replace doctors.'" },
        ],
    },
    {
        id: 'my-school',
        title: 'My School',
        titleVi: 'Trường em',
        level: 'A1',
        wordCount: 120,
        readingTime: '2 min',
        topic: 'School',
        emoji: '🏫',
        mode: 'kids',
        passage: `My name is Lan and I go to Nguyen Hue Primary School. My school is very big and has a beautiful garden. There are twenty classrooms and a big library.

I am in Class 2A. My classroom is on the second floor. We have thirty students in our class. My best friend is Hoa. We sit next to each other.

My favorite subject is art because I love drawing pictures. I also like English class. My teacher, Miss Thanh, is very kind and patient.

After school, I play in the schoolyard with my friends. We play jump rope and hide-and-seek. I love my school very much!`,
        vocabulary: [
            { word: 'primary school', meaning: 'trường tiểu học', example: 'I go to a primary school.' },
            { word: 'library', meaning: 'thư viện', example: 'Our school has a big library.' },
            { word: 'patient', meaning: 'kiên nhẫn', example: 'My teacher is very patient.' },
        ],
        quiz: [
            { type: 'mcq', question: "What is Lan's school called?", options: ['Nguyen Du', 'Nguyen Hue', 'Le Loi', 'Tran Hung Dao'], correct: 1 },
            { type: 'mcq', question: "What is Lan's favorite subject?", options: ['Math', 'English', 'Art', 'Science'], correct: 2 },
            { type: 'true_false', question: 'There are forty students in the class.', answer: false, explanation: 'There are thirty students.' },
        ],
    },
];

export function getReadingByMode(mode) {
    if (mode === 'adult') return READING_PASSAGES;
    return READING_PASSAGES.filter(p => p.mode === 'kids' || p.level === 'A1');
}

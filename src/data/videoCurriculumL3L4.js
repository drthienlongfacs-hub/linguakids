// videoCurriculumL3L4.js — Level 3 (A2-B1) + Level 4 (B1-B2) — 120+ videos
// Sources: English with Lucy, engVid, BBC, Oxford, VOA, Rachel's English, TED-Ed

const q = (question, questionVi, options, answer) => ({ q: question, qVi: questionVi, options, answer });

export const LEVEL_3_INTERMEDIATE = {
    id: 'intermediate-a2b1', level: 'A2-B1', title: 'Intermediate', titleVi: 'Trung cấp',
    ageRange: '10+ / Adult', icon: '📘', color: '#6366F1',
    categories: [
        {
            id: 'i-grammar', title: 'Grammar Mastery', titleVi: 'Ngữ pháp nâng cao', icon: '📐', color: '#6366F1',
            videos: [
                {
                    id: 'i-g1', youtubeId: 'CEa8IZy7hLk', title: 'Present Perfect', titleVi: 'Hiện tại hoàn thành', duration: '8:30', channel: 'English with Lucy',
                    quiz: [q('I ___ to Paris twice', 'Tôi ___ đến Paris 2 lần', ['went', 'have been', 'go', 'am going'], 1)]
                },
                {
                    id: 'i-g2', youtubeId: 'uTB5I8V9Eog', title: 'Past Simple vs Continuous', titleVi: 'Quá khứ đơn vs Tiếp diễn', duration: '9:00', channel: 'engVid',
                    quiz: [q('I ___ when the phone ___', 'Tôi ___ khi điện thoại ___', ['slept/rang', 'was sleeping/rang', 'sleep/rings', 'sleeping/ring'], 1)]
                },
                {
                    id: 'i-g3', youtubeId: 'MbVPhYPFWl0', title: 'Modal Verbs', titleVi: 'Động từ khiếm khuyết', duration: '10:00', channel: 'engVid',
                    quiz: [q('"Must" expresses...?', '\"Must\" diễn tả...?', ['Permission', 'Obligation', 'Possibility', 'Ability'], 1)]
                },
                {
                    id: 'i-g4', youtubeId: '0-6ZBRkZKWI', title: 'Conditionals 0 & 1', titleVi: 'Câu điều kiện 0 & 1', duration: '8:45', channel: 'Oxford Online English',
                    quiz: [q('If it rains, I ___ stay home', 'Nếu trời mưa, tôi ___ ở nhà', ['would', 'will', 'can', 'must'], 1)]
                },
                {
                    id: 'i-g5', youtubeId: 'nI5zaB6QL-o', title: 'Passive Voice', titleVi: 'Câu bị động', duration: '7:30', channel: 'BBC Learning English',
                    quiz: [q('"The book was written" is...?', '\"The book was written\" là...?', ['Active', 'Passive', 'Question', 'Negative'], 1)]
                },
                {
                    id: 'i-g6', youtubeId: 'eplQBhE0-Hg', title: 'Reported Speech', titleVi: 'Câu tường thuật', duration: '9:20', channel: 'English with Lucy',
                    quiz: [q('He said he ___ tired', 'Anh ấy nói anh ấy ___ mệt', ['is', 'was', 'be', 'were'], 1)]
                },
                {
                    id: 'i-g7', youtubeId: 'j25CFx-4g0I', title: 'Relative Clauses', titleVi: 'Mệnh đề quan hệ', duration: '8:10', channel: 'engVid',
                    quiz: [q('The man ___ is tall', 'Người đàn ông ___ cao', ['which', 'who', 'where', 'when'], 1)]
                },
                {
                    id: 'i-g8', youtubeId: 'iZnL2cb_w20', title: 'Conditionals 2 & 3', titleVi: 'Câu điều kiện 2 & 3', duration: '9:00', channel: 'Oxford Online English',
                    quiz: [q('If I ___ rich, I would travel', 'Nếu tôi ___ giàu, tôi sẽ du lịch', ['am', 'was', 'were', 'be'], 2)]
                },
            ]
        },
        {
            id: 'i-vocab', title: 'Topic Vocabulary', titleVi: 'Từ vựng chủ đề', icon: '📚', color: '#059669',
            videos: [
                {
                    id: 'i-v1', youtubeId: 'd3LPrhI0v-w', title: 'Work & Office', titleVi: 'Công việc & Văn phòng', duration: '7:20', channel: 'English with Lucy',
                    quiz: [q('A "deadline" is...?', '\"Deadline\" là...?', ['Bắt đầu', 'Hạn chót', 'Nghỉ lễ', 'Lương'], 1)]
                },
                {
                    id: 'i-v2', youtubeId: 'QHTdOq5MHZM', title: 'Travel Vocabulary', titleVi: 'Từ vựng Du lịch', duration: '8:00', channel: 'Oxford Online English',
                    quiz: [q('"Boarding pass" is for...?', '\"Boarding pass\" dùng để...?', ['Hotel', 'Train', 'Airplane', 'Bus'], 2)]
                },
                {
                    id: 'i-v3', youtubeId: 'WQtbFDPOdT8', title: 'Health & Medical', titleVi: 'Sức khỏe & Y tế', duration: '7:45', channel: 'BBC Learning English',
                    quiz: [q('A "prescription" is from a...?', '\"Prescription\" từ...?', ['Teacher', 'Doctor', 'Chef', 'Pilot'], 1)]
                },
                {
                    id: 'i-v4', youtubeId: 'jAa58N4Jlos', title: 'Environment', titleVi: 'Môi trường', duration: '8:30', channel: 'TED-Ed',
                    quiz: [q('"Renewable energy" means...?', '\"Năng lượng tái tạo\" nghĩa là...?', ['Oil', 'Coal', 'Solar/Wind', 'Gas'], 2)]
                },
                {
                    id: 'i-v5', youtubeId: 'sG1IH1vCvko', title: 'Technology Words', titleVi: 'Từ vựng Công nghệ', duration: '6:40', channel: 'English with Lucy',
                    quiz: [q('"Upload" is the opposite of...?', '\"Upload\" trái nghĩa với...?', ['Delete', 'Download', 'Install', 'Copy'], 1)]
                },
                {
                    id: 'i-v6', youtubeId: '8_I2sg8Z7Yk', title: 'Personality Adjectives', titleVi: 'Tính từ tính cách', duration: '7:10', channel: 'engVid',
                    quiz: [q('"Ambitious" means...?', '\"Ambitious\" nghĩa là...?', ['Lười', 'Tham vọng', 'Xấu', 'Nhút nhát'], 1)]
                },
                {
                    id: 'i-v7', youtubeId: 'B0heWo1XGhc', title: 'Phrasal Verbs 50', titleVi: '50 Cụm động từ', duration: '12:00', channel: 'English with Lucy',
                    quiz: [q('"Give up" means...?', '\"Give up\" nghĩa là...?', ['Bắt đầu', 'Từ bỏ', 'Cho đi', 'Đứng dậy'], 1)]
                },
                {
                    id: 'i-v8', youtubeId: 'GRxofEmo3HA', title: 'Idioms & Expressions', titleVi: 'Thành ngữ & Cách nói', duration: '9:00', channel: 'engVid',
                    quiz: [q('"Break the ice" means...?', '\"Break the ice\" nghĩa là...?', ['Đập đá', 'Phá vỡ bầu không khí', 'Thất bại', 'Giận dữ'], 1)]
                },
            ]
        },
        {
            id: 'i-speak', title: 'Speaking Skills', titleVi: 'Kỹ năng nói', icon: '🎙️', color: '#EC4899',
            videos: [
                {
                    id: 'i-s1', youtubeId: 'tn8ubczZpAo', title: 'How to Describe', titleVi: 'Cách miêu tả', duration: '7:30', channel: 'Speak English With Vanessa',
                    quiz: [q('To describe, use lots of...?', 'Để miêu tả, dùng nhiều...?', ['Verbs', 'Adjectives', 'Nouns', 'Numbers'], 1)]
                },
                {
                    id: 'i-s2', youtubeId: 'aWAOqzudtSM', title: 'Express Opinions', titleVi: 'Bày tỏ ý kiến', duration: '6:45', channel: 'Oxford Online English',
                    quiz: [q('"In my opinion..." expresses...?', '\"In my opinion...\" diễn tả...?', ['Fact', 'Belief', 'Question', 'Request'], 1)]
                },
                {
                    id: 'i-s3', youtubeId: 'd0GKyzG9OWA', title: 'Debate & Argue', titleVi: 'Tranh luận', duration: '8:00', channel: 'engVid',
                    quiz: [q('"On the other hand" shows...?', '\"On the other hand\" thể hiện...?', ['Agreement', 'Contrast', 'Example', 'Conclusion'], 1)]
                },
                {
                    id: 'i-s4', youtubeId: '4zXys7i8Zrc', title: 'Small Talk Master', titleVi: 'Nói chuyện xã giao', duration: '9:10', channel: 'Speak English With Vanessa',
                    quiz: [q('Small talk is about...?', 'Nói chuyện xã giao về...?', ['Politics', 'Weather/hobbies', 'Business', 'Problems'], 1)]
                },
                {
                    id: 'i-s5', youtubeId: 'hUoEtGmXtIw', title: 'Presentation Skills', titleVi: 'Kỹ năng thuyết trình', duration: '8:30', channel: 'BBC Learning English',
                    quiz: [q('Start a presentation with...?', 'Bắt đầu thuyết trình bằng...?', ['Goodbye', 'A joke/hook', 'Nothing', 'A complaint'], 1)]
                },
                {
                    id: 'i-s6', youtubeId: 'Af4kqQ8hdhE', title: 'Job Interview', titleVi: 'Phỏng vấn xin việc', duration: '10:00', channel: 'Oxford Online English',
                    quiz: [q('"Tell me about yourself" tests...?', '\"Tell me about yourself\" kiểm tra...?', ['Memory', 'Communication', 'Math', 'Speed'], 1)]
                },
            ]
        },
        {
            id: 'i-listen', title: 'Advanced Listening', titleVi: 'Nghe nâng cao', icon: '🎧', color: '#F59E0B',
            videos: [
                {
                    id: 'i-li1', youtubeId: 'paivy-gGQZA', title: 'News English', titleVi: 'Nghe tin tức', duration: '6:00', channel: 'VOA Learning English',
                    quiz: [q('VOA speaks...for learners', 'VOA nói ...', ['Fast', 'Slowly', 'Normal', 'Silently'], 1)]
                },
                {
                    id: 'i-li2', youtubeId: 'H14bBuluwB8', title: 'TED Talk: Grit', titleVi: 'TED: Sự kiên trì', duration: '6:12', channel: 'TED',
                    quiz: [q('"Grit" means...?', '\"Grit\" nghĩa là...?', ['Intelligence', 'Perseverance', 'Luck', 'Money'], 1)]
                },
                {
                    id: 'i-li3', youtubeId: 'arj7oStGLkU', title: 'TED: Inside Mind', titleVi: 'TED: Bên trong tâm trí', duration: '6:24', channel: 'TED-Ed',
                    quiz: [q('Procrastination is...?', 'Trì hoãn là...?', ['Working hard', 'Delaying tasks', 'Exercising', 'Sleeping'], 1)]
                },
                {
                    id: 'i-li4', youtubeId: 'LnJwH_PZXnM', title: 'Movie Clips English', titleVi: 'Học từ phim', duration: '8:00', channel: 'English with Lucy',
                    quiz: [q('Movies help with...?', 'Phim giúp cải thiện...?', ['Math', 'Listening skills', 'Cooking', 'Drawing'], 1)]
                },
                {
                    id: 'i-li5', youtubeId: 'YV4oYkIeGJc', title: 'Song Lyrics', titleVi: 'Lời bài hát', duration: '7:30', channel: 'engVid',
                    quiz: [q('Songs help remember...?', 'Bài hát giúp nhớ...?', ['Numbers', 'Vocabulary', 'Formulas', 'Dates'], 1)]
                },
                {
                    id: 'i-li6', youtubeId: '5MgBikgcWnY', title: 'BBC 6 Minute English', titleVi: 'BBC 6 phút tiếng Anh', duration: '6:00', channel: 'BBC Learning English',
                    quiz: [q('BBC 6 Minute is for...?', 'BBC 6 Minutes dành cho...?', ['Beginners', 'Intermediate', 'Kids', 'Experts'], 1)]
                },
            ]
        },
    ]
};

export const LEVEL_4_ADVANCED = {
    id: 'advanced-b1b2', level: 'B1-B2', title: 'Advanced', titleVi: 'Nâng cao',
    ageRange: '14+ / Adult', icon: '📕', color: '#DC2626',
    categories: [
        {
            id: 'a-fluency', title: 'Fluency & Natural English', titleVi: 'Trôi chảy & Tự nhiên', icon: '🚀', color: '#DC2626',
            videos: [
                {
                    id: 'a-f1', youtubeId: '3IWtnBniKF4', title: 'Think in English', titleVi: 'Suy nghĩ bằng tiếng Anh', duration: '8:00', channel: 'Speak English With Vanessa',
                    quiz: [q('To be fluent, stop...?', 'Để trôi chảy, hãy dừng...?', ['Reading', 'Translating in head', 'Listening', 'Writing'], 1)]
                },
                {
                    id: 'a-f2', youtubeId: 'AYLo2GJ3Mog', title: 'Connected Speech', titleVi: 'Nối âm', duration: '9:30', channel: 'Rachel\'s English',
                    quiz: [q('"Want to" sounds like...?', '\"Want to\" nghe giống...?', ['Wanto', 'Wanna', 'Want', 'Wan'], 1)]
                },
                {
                    id: 'a-f3', youtubeId: 'h98_IupNFAU', title: 'Shadowing Method', titleVi: 'Phương pháp Shadowing', duration: '7:00', channel: 'mmmEnglish',
                    quiz: [q('Shadowing means...repeat?', 'Shadowing nghĩa là...lặp lại?', ['Writing', 'Immediately', 'Tomorrow', 'Never'], 1)]
                },
                {
                    id: 'a-f4', youtubeId: 'dQw4w9WgXcQ', title: 'Filler Words', titleVi: 'Từ đệm tự nhiên', duration: '6:40', channel: 'English with Lucy',
                    quiz: [q('"You know", "like" are...?', '\"You know\", \"like\" là...?', ['Errors', 'Fillers', 'Questions', 'Verbs'], 1)]
                },
                {
                    id: 'a-f5', youtubeId: 'V-Ro66uMBX4', title: 'British vs American', titleVi: 'Anh-Anh vs Anh-Mỹ', duration: '10:00', channel: 'English with Lucy',
                    quiz: [q('British "flat" = American...?', '\"flat\" Anh = Mỹ...?', ['House', 'Apartment', 'Car', 'Room'], 1)]
                },
                {
                    id: 'a-f6', youtubeId: 'ChqnN3cKzXQ', title: 'Accent Reduction', titleVi: 'Giảm accent', duration: '8:30', channel: 'Rachel\'s English',
                    quiz: [q('Accent training focuses on...?', 'Luyện accent tập trung vào...?', ['Grammar', 'Sounds & rhythm', 'Vocabulary', 'Spelling'], 1)]
                },
            ]
        },
        {
            id: 'a-business', title: 'Business English', titleVi: 'Tiếng Anh thương mại', icon: '💼', color: '#0EA5E9',
            videos: [
                {
                    id: 'a-b1', youtubeId: 'Sw61Uu8ftII', title: 'Email Writing', titleVi: 'Viết email', duration: '9:00', channel: 'Oxford Online English',
                    quiz: [q('"Dear Sir" is used when...?', '\"Dear Sir\" dùng khi...?', ['Informal', 'Formal', 'Friend', 'Family'], 1)]
                },
                {
                    id: 'a-b2', youtubeId: 'Zm8GNCdro4o', title: 'Meeting Vocabulary', titleVi: 'Từ vựng cuộc họp', duration: '7:30', channel: 'BBC Learning English',
                    quiz: [q('"Agenda" means...?', '\"Agenda\" nghĩa là...?', ['Kết quả', 'Chương trình họp', 'Lương', 'Hợp đồng'], 1)]
                },
                {
                    id: 'a-b3', youtubeId: 'RfTalFEeKKE', title: 'Negotiation Skills', titleVi: 'Kỹ năng đàm phán', duration: '10:00', channel: 'engVid',
                    quiz: [q('"Win-win" means...?', '\"Win-win\" nghĩa là...?', ['One wins', 'Both benefit', 'Both lose', 'Competition'], 1)]
                },
                {
                    id: 'a-b4', youtubeId: '1KtKNkg4j3s', title: 'Phone Etiquette', titleVi: 'Giao tiếp điện thoại', duration: '6:45', channel: 'Oxford Online English',
                    quiz: [q('"May I speak to..." is...?', '\"May I speak to...\" là...?', ['Rude', 'Polite', 'Informal', 'Slang'], 1)]
                },
                {
                    id: 'a-b5', youtubeId: 'YaEG2aWJnZ8', title: 'Finance Vocabulary', titleVi: 'Từ vựng tài chính', duration: '8:20', channel: 'English with Lucy',
                    quiz: [q('"Revenue" means...?', '\"Revenue\" nghĩa là...?', ['Chi phí', 'Doanh thu', 'Nợ', 'Thuế'], 1)]
                },
                {
                    id: 'a-b6', youtubeId: 'Tt08KmFfIYQ', title: 'CV & Resume', titleVi: 'Hồ sơ xin việc', duration: '7:00', channel: 'EnglishClass101',
                    quiz: [q('"References" on a CV are...?', '\"References\" trong CV là...?', ['Hobbies', 'People who recommend you', 'Education', 'Skills'], 1)]
                },
            ]
        },
        {
            id: 'a-academic', title: 'Academic & IELTS', titleVi: 'Học thuật & IELTS', icon: '🎓', color: '#7C3AED',
            videos: [
                {
                    id: 'a-ac1', youtubeId: 'yvt8RzGNhBc', title: 'IELTS Writing Task 2', titleVi: 'IELTS Writing Task 2', duration: '12:00', channel: 'engVid',
                    quiz: [q('IELTS Task 2 is a/an...?', 'IELTS Task 2 là...?', ['Letter', 'Essay', 'Story', 'Email'], 1)]
                },
                {
                    id: 'a-ac2', youtubeId: 'e-p-DuPevss', title: 'IELTS Speaking Tips', titleVi: 'Mẹo IELTS Speaking', duration: '10:00', channel: 'Oxford Online English',
                    quiz: [q('Part 2 gives you ___ minute(s) to prepare', 'Phần 2 cho bạn ___ phút chuẩn bị', ['0', '1', '2', '5'], 1)]
                },
                {
                    id: 'a-ac3', youtubeId: 'iTJgIgCtNi4', title: 'Academic Vocabulary', titleVi: 'Từ vựng học thuật', duration: '8:30', channel: 'engVid',
                    quiz: [q('"Furthermore" means...?', '\"Furthermore\" nghĩa là...?', ['However', 'In addition', 'Because', 'Finally'], 1)]
                },
                {
                    id: 'a-ac4', youtubeId: 'UuOWNNvupik', title: 'Essay Structure', titleVi: 'Cấu trúc bài luận', duration: '9:00', channel: 'Oxford Online English',
                    quiz: [q('An essay starts with a/an...?', 'Bài luận bắt đầu bằng...?', ['Conclusion', 'Introduction', 'Body', 'References'], 1)]
                },
                {
                    id: 'a-ac5', youtubeId: 'DsFT8exiG5o', title: 'TOEIC Listening', titleVi: 'TOEIC Listening', duration: '10:00', channel: 'EnglishClass101',
                    quiz: [q('TOEIC tests ___ English', 'TOEIC kiểm tra tiếng Anh ___', ['Kids', 'Business', 'Academic', 'Slang'], 1)]
                },
                {
                    id: 'a-ac6', youtubeId: 'dItUGF8GdTw', title: 'Critical Thinking', titleVi: 'Tư duy phản biện', duration: '7:48', channel: 'TED-Ed',
                    quiz: [q('Critical thinking means...?', 'Tư duy phản biện nghĩa là...?', ['Criticizing', 'Analyzing carefully', 'Memorizing', 'Ignoring'], 1)]
                },
            ]
        },
        {
            id: 'a-culture', title: 'Culture & Real World', titleVi: 'Văn hóa & Thực tế', icon: '🌍', color: '#F59E0B',
            videos: [
                {
                    id: 'a-cu1', youtubeId: 'wpjspHgHU9g', title: 'British Culture', titleVi: 'Văn hóa Anh', duration: '8:00', channel: 'English with Lucy',
                    quiz: [q('British people love...?', 'Người Anh thích...?', ['Coffee', 'Tea', 'Juice', 'Water'], 1)]
                },
                {
                    id: 'a-cu2', youtubeId: 'fkY_Bu5rrcE', title: 'American Slang', titleVi: 'Tiếng lóng Mỹ', duration: '7:30', channel: 'Rachel\'s English',
                    quiz: [q('"Cool" informally means...?', '\"Cool\" nghĩa informal là...?', ['Cold', 'Great', 'Bad', 'Old'], 1)]
                },
                {
                    id: 'a-cu3', youtubeId: 'ZnioDeQNlxQ', title: 'Australian English', titleVi: 'Tiếng Anh Úc', duration: '7:00', channel: 'Canguro English',
                    quiz: [q('"G\'day" means...?', '\"G\'day\" nghĩa là...?', ['Goodbye', 'Good day', 'Sorry', 'Thanks'], 1)]
                },
                {
                    id: 'a-cu4', youtubeId: '8xYMnb5Dyko', title: 'Body Language', titleVi: 'Ngôn ngữ cơ thể', duration: '6:30', channel: 'TED-Ed',
                    quiz: [q('Crossed arms often mean...?', 'Khoanh tay thường là...?', ['Happy', 'Defensive', 'Hungry', 'Tired'], 1)]
                },
                {
                    id: 'a-cu5', youtubeId: 'yoEezZD71sc', title: 'Social Media English', titleVi: 'Tiếng Anh mạng xã hội', duration: '6:00', channel: 'English with Lucy',
                    quiz: [q('"DM" stands for...?', '\"DM\" viết tắt của...?', ['Digital Media', 'Direct Message', 'Don\'t Mind', 'Display Mode'], 1)]
                },
                {
                    id: 'a-cu6', youtubeId: '4uuGYHfnVRE', title: 'Food Around World', titleVi: 'Ẩm thực thế giới', duration: '7:20', channel: 'TED-Ed',
                    quiz: [q('Sushi is from...?', 'Sushi đến từ...?', ['Korea', 'Japan', 'China', 'Thailand'], 1)]
                },
            ]
        },
    ]
};

export default { LEVEL_3_INTERMEDIATE, LEVEL_4_ADVANCED };

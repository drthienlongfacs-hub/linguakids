const STOP_WORDS = new Set([
    'a',
    'an',
    'and',
    'around',
    'at',
    'by',
    'for',
    'from',
    'how',
    'in',
    'inside',
    'of',
    'on',
    'or',
    'the',
    'to',
    'vs',
    'with',
]);

const TOKEN_TRANSLATIONS = {
    abc: 'bảng chữ cái',
    accent: 'giọng',
    academic: 'học thuật',
    actions: 'hành động',
    adjective: 'tính từ',
    adjectives: 'tính từ',
    alphabet: 'bảng chữ cái',
    american: 'Mỹ',
    animals: 'động vật',
    argue: 'tranh luận',
    australian: 'Úc',
    basic: 'cơ bản',
    body: 'cơ thể',
    british: 'Anh',
    bus: 'xe buýt',
    business: 'kinh doanh',
    can: 'có thể',
    cant: 'không thể',
    clauses: 'mệnh đề',
    clothes: 'quần áo',
    color: 'màu sắc',
    colors: 'màu sắc',
    conditionals: 'câu điều kiện',
    connected: 'nối âm',
    continuous: 'tiếp diễn',
    conversation: 'hội thoại',
    counting: 'đếm',
    country: 'quốc gia',
    culture: 'văn hóa',
    cv: 'CV',
    daily: 'hằng ngày',
    debate: 'tranh luận',
    directions: 'chỉ đường',
    doctor: 'bác sĩ',
    email: 'email',
    english: 'tiếng Anh',
    environment: 'môi trường',
    essay: 'bài luận',
    etiquette: 'phép lịch sự',
    exercise: 'tập thể dục',
    expressions: 'cách diễn đạt',
    family: 'gia đình',
    finance: 'tài chính',
    filler: 'từ đệm',
    food: 'đồ ăn',
    friends: 'bạn bè',
    grammar: 'ngữ pháp',
    great: 'tuyệt',
    greetings: 'chào hỏi',
    health: 'sức khỏe',
    hello: 'xin chào',
    idioms: 'thành ngữ',
    interview: 'phỏng vấn',
    introduction: 'giới thiệu',
    ielts: 'IELTS',
    jungle: 'rừng',
    language: 'ngôn ngữ',
    letter: 'chữ cái',
    letters: 'chữ cái',
    listening: 'nghe',
    long: 'dài',
    lower: 'thường',
    lowercase: 'chữ thường',
    lyrics: 'lời bài hát',
    main: 'chính',
    making: 'kết bạn',
    match: 'ghép',
    meaning: 'nghĩa',
    master: 'thành thạo',
    medical: 'y tế',
    meeting: 'cuộc họp',
    members: 'thành viên',
    modal: 'khiếm khuyết',
    movie: 'đoạn phim',
    nature: 'thiên nhiên',
    negotiation: 'đàm phán',
    news: 'tin tức',
    number: 'số',
    numbers: 'số đếm',
    office: 'văn phòng',
    opinions: 'ý kiến',
    pair: 'cặp',
    pattern: 'mẫu',
    parts: 'bộ phận',
    passive: 'bị động',
    perfect: 'hoàn thành',
    personality: 'tính cách',
    phone: 'điện thoại',
    phonics: 'ngữ âm',
    phrasal: 'cụm động từ',
    pigs: 'heo',
    practice: 'luyện tập',
    prepositions: 'giới từ',
    present: 'hiện tại',
    pronunciation: 'phát âm',
    reduction: 'giảm',
    relative: 'quan hệ',
    reported: 'gián tiếp',
    repeat: 'lặp lại',
    request: 'yêu cầu',
    reply: 'phản hồi',
    restaurant: 'nhà hàng',
    resume: 'hồ sơ',
    rhythm: 'nhịp điệu',
    routines: 'thói quen',
    school: 'trường học',
    sea: 'biển',
    self: 'bản thân',
    shadowing: 'shadowing',
    shapes: 'hình dạng',
    shop: 'cửa hàng',
    short: 'ngắn',
    simple: 'đơn giản',
    singing: 'hát',
    skills: 'kỹ năng',
    slang: 'tiếng lóng',
    social: 'mạng xã hội',
    song: 'bài hát',
    sound: 'âm',
    sounds: 'âm',
    speak: 'nói',
    speaker: 'người nói',
    speaking: 'nói',
    spider: 'nhện',
    stress: 'trọng âm',
    structure: 'cấu trúc',
    study: 'học',
    talk: 'nói chuyện',
    technology: 'công nghệ',
    th: 'âm th',
    thinking: 'suy nghĩ',
    those: 'những cái kia',
    this: 'cái này',
    tone: 'sắc thái',
    travel: 'du lịch',
    use: 'sử dụng',
    upper: 'hoa',
    uppercase: 'chữ hoa',
    verbs: 'động từ',
    visit: 'thăm khám',
    vocabulary: 'từ vựng',
    vowel: 'nguyên âm',
    weather: 'thời tiết',
    wheels: 'bánh xe',
    what: 'điều gì',
    where: 'ở đâu',
    who: 'ai',
    words: 'từ',
    world: 'thế giới',
    writing: 'viết',
};

const PHRASE_TRANSLATIONS = {
    'ABC Song': 'Bài hát bảng chữ cái',
    'Accent Reduction': 'Giảm giọng địa phương',
    'Action Verbs Song': 'Bài hát động từ hành động',
    'Academic Vocabulary': 'Từ vựng học thuật',
    'American Slang': 'Tiếng lóng Mỹ',
    'Animal Sounds': 'Âm thanh con vật',
    'Asking Directions': 'Hỏi đường',
    'At School': 'Ở trường học',
    'At the Shop': 'Ở cửa hàng',
    'Australian English': 'Tiếng Anh Úc',
    'Baby Shark': 'Cá mập con',
    'BBC 6 Minute English': 'BBC 6 Minute English',
    'Body Language': 'Ngôn ngữ cơ thể',
    'British Culture': 'Văn hóa Anh',
    'British vs American': 'Anh - Mỹ',
    'Can/Can\'t': 'Can/Can\'t',
    'Clothes & Fashion': 'Quần áo và thời trang',
    'Color Song': 'Bài hát màu sắc',
    'Conditionals 0 & 1': 'Câu điều kiện loại 0 và 1',
    'Conditionals 2 & 3': 'Câu điều kiện loại 2 và 3',
    'Connected Speech': 'Nối âm tự nhiên',
    'Count 1-10': 'Đếm từ 1 đến 10',
    'Count 1-20': 'Đếm từ 1 đến 20',
    'Count 1-100': 'Đếm từ 1 đến 100',
    'Count by 2s': 'Đếm cách 2',
    'Count by 5s': 'Đếm cách 5',
    'Critical Thinking': 'Tư duy phản biện',
    'CV & Resume': 'CV và hồ sơ xin việc',
    'Daily Actions': 'Hành động hằng ngày',
    'Daily Routines': 'Thói quen hằng ngày',
    'Debate & Argue': 'Tranh luận và lập luận',
    'Doctor Visit': 'Đi khám bác sĩ',
    'Email Writing': 'Viết email',
    'Essay Structure': 'Cấu trúc bài luận',
    'Express Opinions': 'Bày tỏ ý kiến',
    'Family Members': 'Các thành viên gia đình',
    'Finance Vocabulary': 'Từ vựng tài chính',
    'Filler Words': 'Từ đệm',
    'Five Senses': 'Năm giác quan',
    'Food Around World': 'Ẩm thực thế giới',
    'Food Vocabulary': 'Từ vựng đồ ăn',
    'Goldilocks': 'Cô bé tóc vàng',
    'Greetings': 'Chào hỏi',
    'Head Shoulders Knees Toes': 'Đầu vai gối chân',
    'Health & Medical': 'Sức khỏe và y tế',
    'How to Describe': 'Cách miêu tả',
    'I See Something Blue': 'Tôi thấy một thứ màu xanh',
    'IELTS Speaking Tips': 'Mẹo nói IELTS',
    'IELTS Writing Task 2': 'IELTS Writing Task 2',
    'If You\'re Happy': 'Nếu em vui',
    'Idioms & Expressions': 'Thành ngữ và cách diễn đạt',
    'Insects Song': 'Bài hát côn trùng',
    'Job Interview': 'Phỏng vấn xin việc',
    'Learn Letter A': 'Học chữ A',
    'Long Vowel Sounds': 'Âm nguyên âm dài',
    'Making Friends': 'Kết bạn',
    'Meeting Vocabulary': 'Từ vựng họp hành',
    'Mix Colors': 'Pha màu',
    'Modal Verbs': 'Động từ khiếm khuyết',
    'Movie Clips English': 'Tiếng Anh qua đoạn phim',
    'My Body Parts': 'Các bộ phận cơ thể',
    'News English': 'Tiếng Anh tin tức',
    'Number Song 1-10': 'Bài hát số 1 đến 10',
    'Old MacDonald': 'Ông MacDonald',
    'Past Simple vs Continuous': 'Quá khứ đơn và quá khứ tiếp diễn',
    'Passive Voice': 'Câu bị động',
    'Phone Conversation': 'Hội thoại điện thoại',
    'Phone Etiquette': 'Phép lịch sự qua điện thoại',
    'Phonics Song': 'Bài hát ngữ âm',
    'Phonics Song 2': 'Bài hát ngữ âm 2',
    'Phrasal Verbs 50': '50 cụm động từ',
    'Presentation Skills': 'Kỹ năng thuyết trình',
    'Present Perfect': 'Hiện tại hoàn thành',
    'Prepositions in/on/at': 'Giới từ in/on/at',
    'Pronunciation': 'Phát âm',
    'Relative Clauses': 'Mệnh đề quan hệ',
    'Reported Speech': 'Câu gián tiếp',
    'Restaurant Dialogue': 'Hội thoại nhà hàng',
    'R vs L': 'Âm R và L',
    'Row Row Row': 'Chèo thuyền',
    'Sea Animals': 'Động vật biển',
    'Self Introduction': 'Tự giới thiệu',
    'Shadowing Method': 'Phương pháp shadowing',
    'Shape Song': 'Bài hát hình dạng',
    'Shapes All Around': 'Hình dạng xung quanh',
    'Short Vowel Sounds': 'Âm nguyên âm ngắn',
    'Silent Letters': 'Chữ câm',
    'Simple Present': 'Hiện tại đơn',
    'Small Talk Master': 'Làm chủ giao tiếp xã giao',
    'Social Media English': 'Tiếng Anh mạng xã hội',
    'Song Lyrics': 'Lời bài hát',
    'S vs SH': 'Âm S và SH',
    'TED Talk: Grit': 'TED Talk: Sự bền bỉ',
    'TED: Inside Mind': 'TED: Bên trong tâm trí',
    'Think in English': 'Suy nghĩ bằng tiếng Anh',
    'This/That/These/Those': 'This/That/These/Those',
    'TH Sound': 'Âm TH',
    'Three Little Pigs': 'Ba chú heo con',
    'TOEIC Listening': 'Nghe TOEIC',
    'Travel Vocabulary': 'Từ vựng du lịch',
    'Twinkle Twinkle': 'Ngôi sao lấp lánh',
    'Vowel Sounds': 'Âm nguyên âm',
    'Walking in the Jungle': 'Đi bộ trong rừng',
    'Weather Words': 'Từ vựng thời tiết',
    'Wheels on the Bus': 'Bánh xe trên xe buýt',
    'Word Stress': 'Trọng âm từ',
    'Work & Office': 'Công việc và văn phòng',
};

const CATEGORY_GUIDES = {
    'k-phonics': {
        focusEn: 'sound-letter matching and early decoding',
        focusVi: 'ghép âm với chữ và giải mã sớm',
        watchCueEn: 'repeat the sound, point to the letter, and notice the matching picture',
        watchCueVi: 'lặp lại âm, chỉ vào chữ cái và chú ý tranh tương ứng',
        practiceEn: 'Say the sound, then name one example word.',
        practiceVi: 'Nói âm đó rồi nêu một từ ví dụ.',
        defaults: ['listen', 'repeat', 'match', 'sound', 'letter'],
    },
    'k-numbers': {
        focusEn: 'number sense, sequence, and skip counting',
        focusVi: 'cảm nhận số, thứ tự số và đếm cách',
        watchCueEn: 'tap each number in order and say the next number before the video says it',
        watchCueVi: 'chạm vào từng số theo thứ tự và nói số tiếp theo trước khi video đọc',
        practiceEn: 'Count out loud, then point to real objects around you.',
        practiceVi: 'Đếm thành tiếng rồi chỉ vào đồ vật thật xung quanh con.',
        defaults: ['count', 'number', 'order', 'next', 'group'],
    },
    'k-colors': {
        focusEn: 'visual noticing and naming colors or shapes',
        focusVi: 'quan sát và gọi tên màu sắc hoặc hình dạng',
        watchCueEn: 'look, point, and say the color or shape before the singer repeats it',
        watchCueVi: 'nhìn, chỉ và nói màu hoặc hình trước khi bài hát lặp lại',
        practiceEn: 'Find one real example in the room and name it.',
        practiceVi: 'Tìm một ví dụ thật trong phòng rồi gọi tên.',
        defaults: ['color', 'shape', 'look', 'find', 'point'],
    },
    'k-animals': {
        focusEn: 'animal names, sounds, and simple world knowledge',
        focusVi: 'tên con vật, âm thanh và hiểu biết đơn giản về thế giới',
        watchCueEn: 'copy the sound or movement and connect it to the correct animal',
        watchCueVi: 'bắt chước âm thanh hoặc động tác rồi nối với đúng con vật',
        practiceEn: 'Say the animal name, then act or point.',
        practiceVi: 'Nói tên con vật rồi làm động tác hoặc chỉ tranh.',
        defaults: ['animal', 'sound', 'move', 'look', 'name'],
    },
    'k-body': {
        focusEn: 'body awareness, action verbs, and movement-language links',
        focusVi: 'nhận biết cơ thể, động từ hành động và liên kết vận động với ngôn ngữ',
        watchCueEn: 'move the body part or action as soon as you hear it',
        watchCueVi: 'chuyển động bộ phận cơ thể hoặc hành động ngay khi nghe thấy',
        practiceEn: 'Touch, move, or mime the target word.',
        practiceVi: 'Chạm, cử động hoặc diễn tả từ mục tiêu.',
        defaults: ['body', 'move', 'touch', 'jump', 'clap'],
    },
    'k-songs': {
        focusEn: 'story-song recall, rhythm, and repeated language chunks',
        focusVi: 'nhớ nội dung bài hát, nhịp điệu và cụm lặp',
        watchCueEn: 'notice who or what appears in each verse and repeat the chorus pattern',
        watchCueVi: 'để ý nhân vật hoặc sự vật xuất hiện trong từng đoạn và lặp lại mẫu điệp khúc',
        practiceEn: 'Retell the song with gestures and three key words.',
        practiceVi: 'Kể lại bài hát bằng cử chỉ và ba từ khóa.',
        defaults: ['song', 'verse', 'repeat', 'story', 'gesture'],
    },
    'b-vocab': {
        focusEn: 'high-frequency vocabulary in useful chunks',
        focusVi: 'từ vựng tần suất cao theo cụm hữu ích',
        watchCueEn: 'group the words by meaning, not by spelling alone',
        watchCueVi: 'gom từ theo nghĩa chứ không chỉ nhìn chính tả',
        practiceEn: 'Use two target words in one short sentence.',
        practiceVi: 'Dùng hai từ mục tiêu trong một câu ngắn.',
        defaults: ['word', 'meaning', 'example', 'group', 'use'],
    },
    'b-grammar': {
        focusEn: 'core sentence patterns for accurate beginner communication',
        focusVi: 'mẫu câu cốt lõi để giao tiếp chính xác ở trình độ đầu vào',
        watchCueEn: 'listen for the grammar form, then say why that form fits the sentence',
        watchCueVi: 'nghe cấu trúc ngữ pháp rồi nói vì sao cấu trúc đó phù hợp câu',
        practiceEn: 'Pause after each model sentence and make your own version.',
        practiceVi: 'Tạm dừng sau mỗi câu mẫu rồi tạo câu của riêng mình.',
        defaults: ['form', 'pattern', 'sentence', 'meaning', 'use'],
    },
    'b-listen': {
        focusEn: 'gist listening, detail spotting, and routine listening confidence',
        focusVi: 'nghe ý chính, bắt chi tiết và xây sự tự tin khi nghe',
        watchCueEn: 'first catch the situation, then listen again for the exact clue',
        watchCueVi: 'trước hết nắm tình huống rồi nghe lại để bắt đúng chi tiết',
        practiceEn: 'Retell the scene in two short sentences.',
        practiceVi: 'Kể lại tình huống bằng hai câu ngắn.',
        defaults: ['who', 'where', 'what', 'listen', 'clue'],
    },
    'b-convo': {
        focusEn: 'functional conversation for everyday situations',
        focusVi: 'hội thoại chức năng cho tình huống hằng ngày',
        watchCueEn: 'listen for the opening, the key request, and the polite closing',
        watchCueVi: 'nghe câu mở đầu, yêu cầu chính và câu kết lịch sự',
        practiceEn: 'Role-play both speakers out loud.',
        practiceVi: 'Đóng vai cả hai người nói thành tiếng.',
        defaults: ['hello', 'question', 'answer', 'request', 'reply'],
    },
    'b-pronun': {
        focusEn: 'clearer sound production and listening discrimination',
        focusVi: 'phát âm rõ hơn và phân biệt âm khi nghe',
        watchCueEn: 'notice tongue or mouth position and compare similar sounds',
        watchCueVi: 'quan sát vị trí lưỡi hoặc miệng và so sánh các âm gần nhau',
        practiceEn: 'Say the pair slowly, then say it again at natural speed.',
        practiceVi: 'Đọc cặp âm chậm rồi đọc lại với tốc độ tự nhiên.',
        defaults: ['sound', 'mouth', 'stress', 'pair', 'repeat'],
    },
    'i-grammar': {
        focusEn: 'form-meaning connection and contrastive grammar control',
        focusVi: 'kết nối hình thức-nghĩa và kiểm soát đối chiếu ngữ pháp',
        watchCueEn: 'listen for the signal word, then explain why that grammar choice works',
        watchCueVi: 'nghe từ tín hiệu rồi giải thích vì sao lựa chọn ngữ pháp đó đúng',
        practiceEn: 'Transform one model sentence into a new personal example.',
        practiceVi: 'Biến đổi một câu mẫu thành ví dụ cá nhân mới.',
        defaults: ['rule', 'signal', 'form', 'meaning', 'contrast'],
    },
    'i-vocab': {
        focusEn: 'topic-based vocabulary networks and collocations',
        focusVi: 'mạng từ vựng theo chủ đề và kết hợp từ',
        watchCueEn: 'notice which words naturally appear together in the topic',
        watchCueVi: 'chú ý những từ nào thường đi cùng nhau trong chủ đề đó',
        practiceEn: 'Use one collocation in a realistic sentence.',
        practiceVi: 'Dùng một cụm kết hợp từ trong câu thực tế.',
        defaults: ['topic', 'collocation', 'meaning', 'context', 'use'],
    },
    'i-speak': {
        focusEn: 'speaking organization, fluency, and communicative intent',
        focusVi: 'tổ chức nói, độ trôi chảy và mục đích giao tiếp',
        watchCueEn: 'listen for the structure, linking phrases, and speaking move',
        watchCueVi: 'nghe cấu trúc, cụm nối và chiến lược nói',
        practiceEn: 'Answer the prompt with your own voice in 20 to 30 seconds.',
        practiceVi: 'Trả lời câu gợi ý bằng giọng của bạn trong 20 đến 30 giây.',
        defaults: ['opinion', 'reason', 'example', 'structure', 'speak'],
    },
    'i-listen': {
        focusEn: 'authentic listening strategy and inference from spoken media',
        focusVi: 'chiến lược nghe nguồn thật và suy luận từ nội dung nghe',
        watchCueEn: 'separate the main message from supporting details and tone',
        watchCueVi: 'tách ý chính khỏi chi tiết hỗ trợ và sắc thái giọng',
        practiceEn: 'Summarize the clip in one idea and one detail.',
        practiceVi: 'Tóm tắt đoạn nghe bằng một ý chính và một chi tiết.',
        defaults: ['main idea', 'detail', 'tone', 'speaker', 'summary'],
    },
    'a-fluency': {
        focusEn: 'automaticity, rhythm, and more natural spoken English',
        focusVi: 'tính tự động, nhịp điệu và tiếng Anh nói tự nhiên hơn',
        watchCueEn: 'listen for reduction, rhythm, and how the speaker keeps going without translating',
        watchCueVi: 'nghe hiện tượng rút gọn, nhịp điệu và cách người nói tiếp tục mà không dịch thầm',
        practiceEn: 'Shadow one line, then say it again without reading.',
        practiceVi: 'Shadow một câu rồi nói lại mà không nhìn chữ.',
        defaults: ['fluency', 'rhythm', 'natural', 'speak', 'repeat'],
    },
    'a-business': {
        focusEn: 'professional English for work tasks and relationships',
        focusVi: 'tiếng Anh chuyên nghiệp cho công việc và quan hệ công sở',
        watchCueEn: 'listen for precise wording, tone, and workplace purpose',
        watchCueVi: 'nghe cách dùng từ chính xác, sắc thái và mục đích nơi làm việc',
        practiceEn: 'Rewrite the model as a real work message you could send.',
        practiceVi: 'Viết lại câu mẫu thành thông điệp công việc thật bạn có thể gửi.',
        defaults: ['formal', 'clear', 'professional', 'purpose', 'tone'],
    },
    'a-academic': {
        focusEn: 'exam-ready structure, evidence, and academic precision',
        focusVi: 'cấu trúc thi cử, dẫn chứng và độ chính xác học thuật',
        watchCueEn: 'notice the structure, criteria, and language for stronger answers',
        watchCueVi: 'chú ý cấu trúc, tiêu chí và ngôn ngữ để trả lời tốt hơn',
        practiceEn: 'Plan an answer before speaking or writing it.',
        practiceVi: 'Lập dàn ý câu trả lời trước khi nói hoặc viết.',
        defaults: ['structure', 'evidence', 'clear', 'argument', 'exam'],
    },
    'a-culture': {
        focusEn: 'real-world language, pragmatics, and cultural interpretation',
        focusVi: 'ngôn ngữ đời thực, dụng học và diễn giải văn hóa',
        watchCueEn: 'notice what the words mean and when they are socially appropriate',
        watchCueVi: 'chú ý từ đó nghĩa là gì và khi nào phù hợp về mặt xã hội',
        practiceEn: 'Compare the video example with your own culture or experience.',
        practiceVi: 'So sánh ví dụ trong video với văn hóa hay trải nghiệm của bạn.',
        defaults: ['context', 'culture', 'meaning', 'appropriate', 'example'],
    },
};

function ensureString(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function uniqueStrings(values, limit = 6) {
    const seen = new Set();
    const result = [];

    for (const value of values) {
        const normalized = ensureString(value);
        if (!normalized) continue;
        const key = normalized.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(normalized);
        if (result.length >= limit) break;
    }

    return result;
}

function titleCase(value) {
    return ensureString(value)
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

function normalizeToken(value) {
    return ensureString(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function splitTitleTokens(title) {
    return normalizeToken(title)
        .split(/\s+/)
        .filter((token) => token && !STOP_WORDS.has(token));
}

function translatePhrase(value) {
    const direct = PHRASE_TRANSLATIONS[ensureString(value)];
    if (direct) {
        return direct;
    }

    const tokens = splitTitleTokens(value);
    if (tokens.length === 0) {
        return ensureString(value);
    }

    return tokens
        .map((token) => TOKEN_TRANSLATIONS[token] || token)
        .join(' ');
}

function normalizeOptionValue(option, fallbackVi = null) {
    if (typeof option === 'string') {
        const en = ensureString(option);
        return {
            en,
            vi: ensureString(fallbackVi) || translatePhrase(en),
        };
    }

    const en = ensureString(option?.en);
    const vi = ensureString(option?.vi) || ensureString(fallbackVi);
    if (!en && !vi) {
        return {
            en: '',
            vi: '',
        };
    }

    return {
        en: en || vi,
        vi: vi || translatePhrase(en),
    };
}

function makeOption(en, vi = null) {
    return normalizeOptionValue(en, vi);
}

function makeQuestion({
    id,
    stage,
    q,
    qVi,
    options,
    answer,
    explanation,
    explanationVi,
}) {
    return {
        id,
        stage,
        type: 'multiple_choice',
        q: ensureString(q),
        qVi: ensureString(qVi),
        options: options.map((option) => makeOption(option)),
        answer,
        explanation: ensureString(explanation),
        explanationVi: ensureString(explanationVi),
    };
}

function getGuide(categoryId) {
    return CATEGORY_GUIDES[categoryId] || CATEGORY_GUIDES['b-vocab'];
}

function parseRangeTitle(title) {
    const countMatch = title.match(/Count\s+(\d+)-(\d+)/i);
    if (countMatch) {
        return {
            type: 'range',
            start: Number.parseInt(countMatch[1], 10),
            end: Number.parseInt(countMatch[2], 10),
        };
    }

    const skipMatch = title.match(/Count by (\d+)s/i);
    if (skipMatch) {
        return {
            type: 'skip',
            step: Number.parseInt(skipMatch[1], 10),
        };
    }

    return null;
}

function parseLetterTitle(title) {
    const match = title.match(/Letter\s+([A-Z])/i);
    return match ? titleCase(match[1]) : null;
}

function extractQuotedTerm(text) {
    const match = ensureString(text).match(/"([^"]+)"|'([^']+)'/);
    return match ? ensureString(match[1] || match[2]) : null;
}

function hasPopulatedOptions(question) {
    const options = Array.isArray(question?.options) ? question.options : [];
    if (options.length < 2) {
        return false;
    }

    return options.every((option) => {
        const normalized = normalizeOptionValue(option);
        return normalized.en || normalized.vi;
    });
}

function isGeneratedQuestion(question) {
    const id = ensureString(question?.id);
    const prompt = ensureString(question?.q);

    if (/^q[1-5]$/i.test(id)) {
        return true;
    }

    return [
        /^Which title best matches the approved content for this lesson\?$/i,
        /^While watching ".*", which cue should the learner track\?$/i,
        /^In ".*", which detail should the learner confirm while watching\?$/i,
        /^Which Vietnamese cue best matches ".*" in this lesson\?$/i,
        /^After watching ".*", what is the strongest next study move\?$/i,
        /^Which statement fits the lesson ".*" best\?$/i,
    ].some((pattern) => pattern.test(prompt));
}

function isLegacyQuestionCandidate(question) {
    if (isGeneratedQuestion(question) || !hasPopulatedOptions(question)) {
        return false;
    }

    const answerIndex = Number.isInteger(question?.answer) ? question.answer : -1;
    const options = Array.isArray(question?.options) ? question.options : [];
    if (answerIndex < 0 || answerIndex >= options.length) {
        return false;
    }

    return ensureString(question?.q) || ensureString(question?.qVi);
}

function getLegacyQuestion(lesson) {
    const questions = Array.isArray(lesson?.quiz) ? lesson.quiz : [];
    return questions.find(isLegacyQuestionCandidate) || null;
}

function getLegacyCorrectAnswer(legacyQuestion) {
    if (!legacyQuestion) return null;
    const answerIndex = Number.isInteger(legacyQuestion.answer) ? legacyQuestion.answer : -1;
    const option = answerIndex >= 0 ? legacyQuestion.options?.[answerIndex] : null;
    const normalized = normalizeOptionValue(option);
    return normalized.en || normalized.vi || null;
}

function buildLegacyAnchor(lesson, legacyQuestion) {
    if (!legacyQuestion) {
        return {
            statementEn: `The lesson stays focused on ${lesson.title}.`,
            statementVi: `Bài học giữ đúng trọng tâm vào ${lesson.titleVi || translatePhrase(lesson.title)}.`,
        };
    }

    const correctAnswer = getLegacyCorrectAnswer(legacyQuestion) || lesson.title;
    const englishPrompt = ensureString(legacyQuestion.q);
    const vietnamesePrompt = ensureString(legacyQuestion.qVi);

    if (englishPrompt.includes('___')) {
        return {
            statementEn: englishPrompt.replace('___', correctAnswer),
            statementVi: vietnamesePrompt
                ? vietnamesePrompt.replace('___', correctAnswer)
                : `Câu mẫu đúng với bài học này là: ${correctAnswer}.`,
        };
    }

    const quotedTerm = extractQuotedTerm(englishPrompt);
    if (quotedTerm && /means|is|for|stands for|sounds like/i.test(englishPrompt)) {
        return {
            statementEn: `"${quotedTerm}" is linked with ${correctAnswer} in this lesson.`,
            statementVi: `"${quotedTerm}" được gắn với ${correctAnswer} trong bài học này.`,
        };
    }

    if (/how many/i.test(englishPrompt)) {
        return {
            statementEn: `A key fact in this lesson is ${correctAnswer}.`,
            statementVi: `Một thông tin chính trong bài học này là ${correctAnswer}.`,
        };
    }

    return {
        statementEn: `A key answer for this lesson is ${correctAnswer}.`,
        statementVi: `Một đáp án cốt lõi của bài học này là ${correctAnswer}.`,
    };
}

function buildTopicVariants(lesson, category, level) {
    const range = parseRangeTitle(lesson.title);
    const letter = parseLetterTitle(lesson.title);
    const titleVi = ensureString(lesson.titleVi) || translatePhrase(lesson.title);
    const categoryVi = ensureString(category.titleVi) || translatePhrase(category.title);
    const levelVi = ensureString(level.titleVi) || translatePhrase(level.title);

    return {
        titleEn: lesson.title,
        titleVi,
        categoryEn: category.title,
        categoryVi,
        levelEn: level.title,
        levelVi,
        range,
        letter,
        tokens: splitTitleTokens(lesson.title),
    };
}

function buildKeywordTerms(lesson, category, context, legacyQuestion) {
    const guide = getGuide(category.id);
    const correctAnswer = getLegacyCorrectAnswer(legacyQuestion);
    const quotedTerm = extractQuotedTerm(legacyQuestion?.q);

    const generated = [];

    if (context.letter) {
        generated.push(`letter ${context.letter}`, `${context.letter} sound`, `${context.letter.toLowerCase()} example`);
    }

    if (context.range?.type === 'range') {
        generated.push(`${context.range.start} to ${context.range.end}`, 'count', 'next number');
    }

    if (context.range?.type === 'skip') {
        generated.push(`count by ${context.range.step}s`, 'pattern', 'skip count');
    }

    generated.push(quotedTerm, correctAnswer, ...context.tokens, ...guide.defaults);

    return uniqueStrings(generated, 6).map((term) => ({
        term,
        meaningVi: translatePhrase(term),
        exampleEn: `Use "${term}" while studying ${lesson.title}.`,
        exampleVi: `Dùng "${term}" khi học bài ${context.titleVi}.`,
    }));
}

function buildWatchCue(lesson, category, context) {
    const guide = getGuide(category.id);

    if (context.range?.type === 'range') {
        return {
            en: `Watch for the counting sequence from ${context.range.start} to ${context.range.end}, and say the next number before it appears.`,
            vi: `Hãy nghe dãy đếm từ ${context.range.start} đến ${context.range.end}, và đọc số tiếp theo trước khi video hiện ra.`,
        };
    }

    if (context.range?.type === 'skip') {
        return {
            en: `Watch for the skip-count pattern in steps of ${context.range.step} and clap each jump.`,
            vi: `Hãy để ý mẫu đếm cách ${context.range.step} và vỗ tay mỗi lần nhảy số.`,
        };
    }

    if (context.letter) {
        return {
            en: `Watch for the letter ${context.letter}, repeat its sound, and notice one example word that starts with it.`,
            vi: `Hãy để ý chữ ${context.letter}, lặp lại âm của nó và nhận ra một từ ví dụ bắt đầu bằng chữ đó.`,
        };
    }

    return {
        en: `${guide.watchCueEn.charAt(0).toUpperCase()}${guide.watchCueEn.slice(1)} while the video stays on ${lesson.title}.`,
        vi: `${guide.watchCueVi.charAt(0).toUpperCase()}${guide.watchCueVi.slice(1)} khi video tập trung vào ${context.titleVi}.`,
    };
}

function buildTransferCue(lesson, category, context) {
    const guide = getGuide(category.id);

    if (category.id === 'b-convo' || category.id === 'i-speak' || category.id === 'a-business') {
        return {
            en: `After watching, record a 20-second response about ${lesson.title} using one line from the video and one line of your own.`,
            vi: `Sau khi xem, hãy tự ghi âm một đoạn 20 giây về ${context.titleVi} với một câu từ video và một câu của riêng bạn.`,
        };
    }

    return {
        en: guide.practiceEn,
        vi: guide.practiceVi,
    };
}

function buildObjectives(lesson, category, context, keywords, anchor) {
    const guide = getGuide(category.id);
    const firstKeyword = keywords[0]?.term || lesson.title;
    const secondKeyword = keywords[1]?.term || category.title;

    return [
        {
            en: `Identify the main idea of ${lesson.title} and keep attention on the right content cues.`,
            vi: `Xác định ý chính của bài ${context.titleVi} và giữ sự chú ý vào các dấu hiệu nội dung đúng.`,
        },
        {
            en: `Notice and recall core language such as ${firstKeyword} and ${secondKeyword}.`,
            vi: `Nhận ra và gọi lại ngôn ngữ cốt lõi như ${translatePhrase(firstKeyword)} và ${translatePhrase(secondKeyword)}.`,
        },
        {
            en: `Use the video as input for ${guide.focusEn}, then produce one short response of your own.`,
            vi: `Dùng video làm đầu vào cho ${guide.focusVi}, rồi tự tạo một phản hồi ngắn của riêng mình.`,
        },
        {
            en: anchor.statementEn,
            vi: anchor.statementVi,
        },
    ];
}

function buildScriptSegments(lesson, category, context, keywords, watchCue, transferCue, anchor) {
    const keywordList = keywords.slice(0, 3).map((entry) => entry.term).join(', ');

    return [
        {
            id: 'preview',
            phase: 'preview',
            label: 'Preview',
            labelVi: 'Trước khi xem',
            en: `Today we study ${lesson.title}. Predict what the video should teach before you press play.`,
            vi: `Hôm nay chúng ta học ${context.titleVi}. Hãy đoán trước video sẽ dạy gì trước khi bấm phát.`,
        },
        {
            id: 'watch_cue',
            phase: 'while_watch',
            label: 'Watch Cue',
            labelVi: 'Lúc xem',
            en: watchCue.en,
            vi: watchCue.vi,
        },
        {
            id: 'focus_words',
            phase: 'while_watch',
            label: 'Focus Words',
            labelVi: 'Từ khóa',
            en: `Listen for these anchor words: ${keywordList}.`,
            vi: `Hãy nghe các từ mốc này: ${keywords.slice(0, 3).map((entry) => entry.meaningVi).join(', ')}.`,
        },
        {
            id: 'anchor',
            phase: 'notice',
            label: 'Anchor Idea',
            labelVi: 'Ý neo',
            en: anchor.statementEn,
            vi: anchor.statementVi,
        },
        {
            id: 'retrieve',
            phase: 'retrieve',
            label: 'Retrieve',
            labelVi: 'Gọi lại',
            en: `Pause the video and say three things you remember about ${lesson.title} without looking at the screen.`,
            vi: `Tạm dừng video và nói ba điều bạn còn nhớ về ${context.titleVi} mà không nhìn màn hình.`,
        },
        {
            id: 'transfer',
            phase: 'transfer',
            label: 'Transfer',
            labelVi: 'Vận dụng',
            en: transferCue.en,
            vi: transferCue.vi,
        },
    ];
}

function buildTopicDistractors(lesson, category, siblingLessons) {
    const siblingTopics = uniqueStrings(
        siblingLessons
            .map((item) => ensureString(item?.title))
            .filter((title) => title && title !== lesson.title),
        3
    );

    while (siblingTopics.length < 3) {
        siblingTopics.push(`${category.title} practice ${siblingTopics.length + 1}`);
    }

    return siblingTopics.slice(0, 3);
}

function buildQuestionOptionsForTopic(lesson, category, siblingLessons) {
    const topics = uniqueStrings([lesson.title, ...buildTopicDistractors(lesson, category, siblingLessons)], 4);
    return topics.map((topic) => makeOption(topic, topic === lesson.title ? lesson.titleVi : translatePhrase(topic)));
}

function buildWatchCueOptions(watchCue, category) {
    const guide = getGuide(category.id);
    return [
        makeOption(watchCue.en, watchCue.vi),
        makeOption(
            `Ignore the key cue and only wait for subtitles.`,
            'Bỏ qua dấu hiệu chính và chỉ đợi phụ đề.'
        ),
        makeOption(
            `Focus on every detail equally and avoid pausing or repeating.`,
            'Tập trung vào mọi chi tiết như nhau và không tạm dừng hay lặp lại.'
        ),
        makeOption(
            `Memorize random words without checking the lesson goal.`,
            'Học thuộc từ ngẫu nhiên mà không kiểm tra mục tiêu bài học.'
        ),
    ];
}

function buildLegacyDetailQuestion(lesson, legacyQuestion, anchor, index) {
    if (!legacyQuestion) {
        return makeQuestion({
            id: `q${index}`,
            stage: 'detail',
            q: `Which statement fits the lesson "${lesson.title}" best?`,
            qVi: `Câu nào phù hợp nhất với bài "${lesson.titleVi || translatePhrase(lesson.title)}"?`,
            options: [
                makeOption(anchor.statementEn, anchor.statementVi),
                makeOption('The lesson should ignore the main topic and change to something unrelated.', 'Bài học không nên bỏ qua chủ đề chính và chuyển sang nội dung không liên quan.'),
                makeOption('The lesson is only for silent viewing with no recall practice.', 'Bài học không chỉ để xem im lặng mà không cần gọi lại.'),
                makeOption('The learner should skip checking meaning or form.', 'Người học không nên bỏ qua việc kiểm tra nghĩa hoặc cấu trúc.'),
            ],
            answer: 0,
            explanation: 'The aligned statement must stay anchored to the intended lesson outcome.',
            explanationVi: 'Phát biểu đúng phải giữ nội dung bám sát kết quả học tập dự kiến của bài học.',
        });
    }

    const answerIndex = Number.isInteger(legacyQuestion.answer) ? legacyQuestion.answer : 0;
    const options = Array.isArray(legacyQuestion.options) ? legacyQuestion.options : [];

    return makeQuestion({
        id: `q${index}`,
        stage: 'detail',
        q: legacyQuestion.q,
        qVi: legacyQuestion.qVi || `Câu chi tiết cho bài ${lesson.titleVi || translatePhrase(lesson.title)}`,
        options,
        answer: Math.max(0, Math.min(answerIndex, Math.max(0, options.length - 1))),
        explanation: `This detail question is preserved from the legacy curriculum because it captures a concrete content checkpoint for ${lesson.title}.`,
        explanationVi: `Câu hỏi chi tiết này được giữ lại từ curriculum cũ vì nó nhắc đến một mốc nội dung cụ thể cho bài ${lesson.titleVi || translatePhrase(lesson.title)}.`,
    });
}

function buildGeneratedDetailQuestion(lesson, category, context, anchor, index) {
    const promptEn = `In "${lesson.title}", which detail should the learner confirm while watching?`;
    const promptVi = `Trong bài "${context.titleVi}", người học cần xác nhận chi tiết nào khi xem?`;

    if (context.range?.type === 'range') {
        return makeQuestion({
            id: `q${index}`,
            stage: 'detail',
            q: promptEn,
            qVi: promptVi,
            options: [
                makeOption(
                    `The numbers stay in order from ${context.range.start} to ${context.range.end}, and the learner predicts the next one.`,
                    `Các số đi đúng thứ tự từ ${context.range.start} đến ${context.range.end}, và người học đoán số tiếp theo.`
                ),
                makeOption(
                    'The lesson should jump to unrelated colors and stop tracking number order.',
                    'Bài học nên chuyển sang màu sắc không liên quan và bỏ việc theo dõi thứ tự số.'
                ),
                makeOption(
                    'The learner should only read subtitles and skip saying the sequence out loud.',
                    'Người học chỉ nên đọc phụ đề và bỏ qua việc nói dãy số thành tiếng.'
                ),
                makeOption(
                    'The lesson works best when numbers are memorized randomly with no sequence check.',
                    'Bài học sẽ tốt nhất nếu thuộc số ngẫu nhiên mà không kiểm tra chuỗi.'
                ),
            ],
            answer: 0,
            explanation: 'A strong detail check in a counting-range lesson confirms sequence and next-number prediction.',
            explanationVi: 'Một câu hỏi chi tiết tốt trong bài đếm dãy phải kiểm tra được thứ tự số và khả năng đoán số kế tiếp.',
        });
    }

    if (context.range?.type === 'skip') {
        return makeQuestion({
            id: `q${index}`,
            stage: 'detail',
            q: promptEn,
            qVi: promptVi,
            options: [
                makeOption(
                    `The learner should notice that the number pattern jumps by ${context.range.step} each time.`,
                    `Người học cần nhận ra rằng dãy số nhảy thêm ${context.range.step} ở mỗi bước.`
                ),
                makeOption(
                    'The pattern should move by unpredictable amounts and ignore the repeated jump.',
                    'Dãy số nên tăng giảm ngẫu nhiên và bỏ qua bước nhảy lặp lại.'
                ),
                makeOption(
                    'The learner only needs to memorize one isolated number and ignore the pattern.',
                    'Người học chỉ cần thuộc một số riêng lẻ và bỏ qua quy luật của dãy.'
                ),
                makeOption(
                    'The lesson should switch from numbers to an unrelated story with no counting pattern.',
                    'Bài học nên chuyển từ số đếm sang một câu chuyện không liên quan và không còn quy luật đếm.'
                ),
            ],
            answer: 0,
            explanation: 'Skip-count lessons are understood correctly only when the repeated jump size is tracked.',
            explanationVi: 'Bài học đếm cách chỉ được hiểu đúng khi người học theo dõi được độ dài bước nhảy lặp lại.',
        });
    }

    if (context.letter) {
        return makeQuestion({
            id: `q${index}`,
            stage: 'detail',
            q: promptEn,
            qVi: promptVi,
            options: [
                makeOption(
                    `The learner should connect the letter ${context.letter} with its sound and one example word.`,
                    `Người học cần nối chữ ${context.letter} với âm của nó và một từ ví dụ.`
                ),
                makeOption(
                    'The lesson should hide the letter and focus only on random counting.',
                    'Bài học nên giấu chữ cái đi và chỉ tập trung vào đếm số ngẫu nhiên.'
                ),
                makeOption(
                    'The learner should skip the sound and memorize subtitles word for word.',
                    'Người học nên bỏ qua âm và chép thuộc phụ đề từng chữ.'
                ),
                makeOption(
                    'The best strategy is to ignore the picture and avoid saying the target sound.',
                    'Cách học tốt nhất là bỏ qua hình minh họa và không phát âm âm mục tiêu.'
                ),
            ],
            answer: 0,
            explanation: 'Letter lessons become meaningful when the learner connects symbol, sound, and a concrete example.',
            explanationVi: 'Bài học chữ cái chỉ thật sự có ý nghĩa khi người học nối được ký hiệu, âm và một ví dụ cụ thể.',
        });
    }

    const detailBlueprints = {
        'k-colors': {
            correctEn: 'The learner names the color or shape as soon as it appears and links it to the right object.',
            correctVi: 'Người học gọi đúng màu hoặc hình ngay khi nó xuất hiện và nối nó với đồ vật phù hợp.',
            explanationEn: 'A detail check for colors or shapes should confirm quick visual recognition, not passive rereading.',
            explanationVi: 'Câu hỏi chi tiết cho màu sắc hoặc hình dạng phải kiểm tra khả năng nhận diện nhanh bằng mắt, không phải chỉ đọc lại thụ động.',
        },
        'k-animals': {
            correctEn: 'The learner links the correct animal with its sound, movement, or key feature.',
            correctVi: 'Người học nối đúng con vật với âm thanh, chuyển động hoặc đặc điểm chính của nó.',
            explanationEn: 'Animal lessons work when the learner ties the name to a concrete sound or movement clue.',
            explanationVi: 'Bài học về con vật hiệu quả khi người học gắn được tên con vật với dấu hiệu cụ thể như âm thanh hoặc chuyển động.',
        },
        'k-body': {
            correctEn: 'The learner moves or points to the correct body part or action immediately after hearing it.',
            correctVi: 'Người học chỉ hoặc thực hiện đúng bộ phận cơ thể hay hành động ngay sau khi nghe thấy.',
            explanationEn: 'Body lessons are accurate when language is tied directly to physical response.',
            explanationVi: 'Bài học về cơ thể chỉ chính xác khi ngôn ngữ được nối trực tiếp với phản ứng vận động.',
        },
        'k-songs': {
            correctEn: 'The learner notices who or what appears in each verse and repeats the chorus pattern accurately.',
            correctVi: 'Người học nhận ra nhân vật hoặc sự vật trong từng đoạn và lặp lại đúng mẫu điệp khúc.',
            explanationEn: 'Song lessons need detail checks on verse content and repeated chorus language.',
            explanationVi: 'Bài học qua bài hát cần câu hỏi chi tiết về nội dung từng đoạn và phần điệp khúc lặp lại.',
        },
        'b-vocab': {
            correctEn: `The learner groups the key words in "${lesson.title}" by meaning and uses one useful chunk correctly.`,
            correctVi: `Người học gom các từ khóa trong bài "${context.titleVi}" theo nghĩa và dùng đúng một cụm hữu ích.`,
            explanationEn: 'Vocabulary detail should confirm semantic grouping and practical chunk use.',
            explanationVi: 'Chi tiết trong bài từ vựng phải xác nhận được việc gom nhóm theo nghĩa và dùng cụm từ vào thực tế.',
        },
        'i-vocab': {
            correctEn: `The learner notices which words naturally go together in the topic "${lesson.title}".`,
            correctVi: `Người học nhận ra những từ nào thường đi với nhau trong chủ đề "${context.titleVi}".`,
            explanationEn: 'Intermediate vocabulary work is stronger when collocation is checked, not only isolated meaning.',
            explanationVi: 'Ở mức trung cấp, bài từ vựng sẽ tốt hơn khi kiểm tra được kết hợp từ chứ không chỉ nghĩa rời rạc.',
        },
        'b-grammar': {
            correctEn: 'The learner identifies the grammar form and explains why it fits the sentence meaning.',
            correctVi: 'Người học nhận ra cấu trúc ngữ pháp và giải thích vì sao nó phù hợp với nghĩa của câu.',
            explanationEn: 'Beginner grammar should connect form with sentence meaning, not memorization alone.',
            explanationVi: 'Ngữ pháp cơ bản cần nối được hình thức với nghĩa câu, không chỉ học thuộc máy móc.',
        },
        'i-grammar': {
            correctEn: 'The learner checks the signal word or contrast and explains why that grammar choice works.',
            correctVi: 'Người học kiểm tra từ tín hiệu hoặc điểm đối chiếu và giải thích vì sao lựa chọn ngữ pháp đó đúng.',
            explanationEn: 'Advanced grammar detail depends on noticing the signal that drives the form choice.',
            explanationVi: 'Chi tiết trong bài ngữ pháp nâng cao phụ thuộc vào việc nhận ra tín hiệu dẫn đến lựa chọn cấu trúc.',
        },
        'b-listen': {
            correctEn: 'The learner first catches the situation, then listens again to confirm the exact clue.',
            correctVi: 'Người học trước hết nắm tình huống, rồi nghe lại để xác nhận đúng chi tiết then chốt.',
            explanationEn: 'Listening detail should build from gist to one verified clue.',
            explanationVi: 'Câu hỏi chi tiết trong bài nghe phải đi từ ý khái quát đến một dấu hiệu đã được xác nhận.',
        },
        'i-listen': {
            correctEn: 'The learner separates the main message from the supporting detail and the speaker tone.',
            correctVi: 'Người học tách được ý chính khỏi chi tiết hỗ trợ và sắc thái của người nói.',
            explanationEn: 'Authentic listening improves when the learner tracks message, support, and tone separately.',
            explanationVi: 'Nghe nguồn thật tiến bộ hơn khi người học theo dõi riêng ý chính, chi tiết hỗ trợ và sắc thái giọng.',
        },
        'b-convo': {
            correctEn: 'The learner follows the opening, the key request, and the polite closing in the exchange.',
            correctVi: 'Người học theo dõi được câu mở đầu, yêu cầu chính và câu kết lịch sự trong đoạn hội thoại.',
            explanationEn: 'Conversation detail is accurate when the interaction structure is recognized end to end.',
            explanationVi: 'Chi tiết trong bài hội thoại chỉ chính xác khi người học nhận ra được cấu trúc tương tác từ đầu đến cuối.',
        },
        'b-pronun': {
            correctEn: 'The learner notices mouth position or sound contrast and repeats the pair clearly.',
            correctVi: 'Người học chú ý vị trí miệng hoặc sự đối lập âm và lặp lại cặp âm một cách rõ ràng.',
            explanationEn: 'Pronunciation detail should focus on the physical cue behind the sound contrast.',
            explanationVi: 'Chi tiết trong bài phát âm phải tập trung vào dấu hiệu khẩu hình đứng sau sự khác biệt âm.',
        },
        'i-speak': {
            correctEn: 'The learner notices how the response is organized with a point, a reason, and an example.',
            correctVi: 'Người học nhận ra câu trả lời được tổ chức bằng một ý chính, một lý do và một ví dụ.',
            explanationEn: 'Speaking detail is stronger when organization is checked, not just isolated phrases.',
            explanationVi: 'Bài nói sẽ chắc hơn khi kiểm tra được cách tổ chức ý chứ không chỉ những cụm từ rời rạc.',
        },
        'a-fluency': {
            correctEn: 'The learner listens for reduction, rhythm, and how one line flows naturally without translating.',
            correctVi: 'Người học lắng nghe hiện tượng rút gọn, nhịp điệu và cách một câu được nói trôi tự nhiên mà không dịch thầm.',
            explanationEn: 'Fluency detail should target rhythm and connected delivery, not isolated word memorization.',
            explanationVi: 'Chi tiết trong bài trôi chảy phải nhắm vào nhịp điệu và cách nối âm tự nhiên, không phải học thuộc từng từ riêng lẻ.',
        },
        'a-business': {
            correctEn: 'The learner tracks precise wording, tone, and the workplace purpose of the message.',
            correctVi: 'Người học theo dõi cách dùng từ chính xác, sắc thái và mục đích công việc của thông điệp.',
            explanationEn: 'Business English detail depends on wording, tone, and task fit.',
            explanationVi: 'Chi tiết trong bài tiếng Anh công việc phụ thuộc vào từ ngữ, sắc thái và độ phù hợp với nhiệm vụ.',
        },
        'a-academic': {
            correctEn: 'The learner checks structure, support, and the language that strengthens the argument or answer.',
            correctVi: 'Người học kiểm tra cấu trúc, dẫn chứng và ngôn ngữ làm cho lập luận hoặc câu trả lời vững hơn.',
            explanationEn: 'Academic detail is meaningful only when structure and evidence are both tracked.',
            explanationVi: 'Chi tiết trong bài học thuật chỉ có giá trị khi cả cấu trúc lẫn dẫn chứng đều được theo dõi.',
        },
        'a-culture': {
            correctEn: 'The learner compares literal meaning with the socially appropriate use in context.',
            correctVi: 'Người học so sánh nghĩa trực tiếp với cách dùng phù hợp về mặt xã hội trong ngữ cảnh.',
            explanationEn: 'Culture and real-world lessons need detail on pragmatic fit, not just dictionary meaning.',
            explanationVi: 'Bài văn hóa và đời thực cần chi tiết về sự phù hợp dụng học, không chỉ nghĩa từ điển.',
        },
    };

    const detail = detailBlueprints[category.id] || {
        correctEn: anchor.statementEn,
        correctVi: anchor.statementVi,
        explanationEn: `A useful detail question for "${lesson.title}" should keep the learner focused on the intended learning clue.`,
        explanationVi: `Câu hỏi chi tiết hữu ích cho bài "${context.titleVi}" phải giữ người học bám vào dấu hiệu học tập đúng trọng tâm.`,
    };

    return makeQuestion({
        id: `q${index}`,
        stage: 'detail',
        q: promptEn,
        qVi: promptVi,
        options: [
            makeOption(detail.correctEn, detail.correctVi),
            makeOption(
                'The lesson should switch to an unrelated topic and ignore the main clue.',
                'Bài học nên chuyển sang chủ đề không liên quan và bỏ qua dấu hiệu chính.'
            ),
            makeOption(
                'The learner should wait for subtitles only and skip checking the key detail.',
                'Người học chỉ nên chờ phụ đề và bỏ qua việc kiểm tra chi tiết then chốt.'
            ),
            makeOption(
                'The best approach is to memorize isolated words without linking them to the lesson goal.',
                'Cách làm tốt nhất là học thuộc các từ rời rạc mà không nối chúng với mục tiêu của bài học.'
            ),
        ],
        answer: 0,
        explanation: detail.explanationEn,
        explanationVi: detail.explanationVi,
    });
}

function buildDetailQuestion(lesson, category, context, legacyQuestion, anchor, index) {
    if (legacyQuestion) {
        return buildLegacyDetailQuestion(lesson, legacyQuestion, anchor, index);
    }

    return buildGeneratedDetailQuestion(lesson, category, context, anchor, index);
}

function buildVocabularyQuestion(lesson, keywords, index) {
    const keyword = keywords.find((entry) => !/^\d+$/.test(entry.term))
        || keywords[0]
        || { term: lesson.title, meaningVi: lesson.titleVi || translatePhrase(lesson.title) };
    const distractors = uniqueStrings(
        keywords.slice(1).map((entry) => entry.meaningVi).concat(['nội dung không liên quan', 'chi tiết sai', 'gợi ý phụ']),
        3
    );

    return makeQuestion({
        id: `q${index}`,
        stage: 'retrieve',
        q: `Which Vietnamese cue best matches "${keyword.term}" in this lesson?`,
        qVi: `Gợi ý tiếng Việt nào hợp nhất với "${keyword.term}" trong bài học này?`,
        options: [makeOption(keyword.meaningVi, keyword.meaningVi), ...distractors.map((value) => makeOption(value, value))],
        answer: 0,
        explanation: `A learner should connect the English anchor word "${keyword.term}" with a stable meaning cue.`,
        explanationVi: `Người học cần nối từ mốc tiếng Anh "${keyword.term}" với một gợi ý nghĩa ổn định.`,
    });
}

function buildTransferQuestion(lesson, transferCue, index) {
    return makeQuestion({
        id: `q${index}`,
        stage: 'transfer',
        q: `After watching "${lesson.title}", what is the strongest next study move?`,
        qVi: `Sau khi xem "${lesson.titleVi || translatePhrase(lesson.title)}", bước học tiếp theo tốt nhất là gì?`,
        options: [
            makeOption(transferCue.en, transferCue.vi),
            makeOption('Move on immediately without speaking, pausing, or recalling anything.', 'Chuyển ngay sang bài khác mà không nói, tạm dừng hay gọi lại gì.'),
            makeOption('Copy every line once and avoid using it in a new example.', 'Chép lại mỗi dòng một lần và tránh dùng nó trong ví dụ mới.'),
            makeOption('Only reread the title and assume the content is already mastered.', 'Chỉ đọc lại tiêu đề và cho rằng mình đã nắm vững nội dung.'),
        ],
        answer: 0,
        explanation: 'Retrieval plus production helps turn watched input into usable language.',
        explanationVi: 'Gọi lại kết hợp sản sinh ngôn ngữ giúp biến đầu vào đã xem thành ngôn ngữ có thể sử dụng.',
    });
}

function buildQuizQuestions(lesson, category, context, siblingLessons, legacyQuestion, watchCue, transferCue, anchor, keywords) {
    return [
        makeQuestion({
            id: 'q1',
            stage: 'preview',
            q: `Which title best matches the approved content for this lesson?`,
            qVi: 'Tiêu đề nào phù hợp nhất với nội dung đã được duyệt của bài học này?',
            options: buildQuestionOptionsForTopic(lesson, category, siblingLessons),
            answer: 0,
            explanation: 'A correct lesson should stay aligned with its intended title and classification.',
            explanationVi: 'Một bài học đúng phải giữ sự thẳng hàng với tiêu đề và phân loại dự kiến.',
        }),
        makeQuestion({
            id: 'q2',
            stage: 'while_watch',
            q: `While watching "${lesson.title}", which cue should the learner track?`,
            qVi: `Khi xem "${lesson.titleVi || translatePhrase(lesson.title)}", người học nên theo dõi dấu hiệu nào?`,
            options: buildWatchCueOptions(watchCue, category),
            answer: 0,
            explanation: 'This cue directs attention to the information that matters most in the lesson.',
            explanationVi: 'Dấu hiệu này giúp hướng sự chú ý vào thông tin quan trọng nhất của bài học.',
        }),
        buildDetailQuestion(lesson, category, context, legacyQuestion, anchor, 3),
        buildVocabularyQuestion(lesson, keywords, 4),
        buildTransferQuestion(lesson, transferCue, 5),
    ];
}

export function getLearningPacketQuestionCount(packet) {
    return Array.isArray(packet?.quiz?.questions) ? packet.quiz.questions.length : 0;
}

export function buildLessonSourceVerificationDefaults(lesson, category, level) {
    const context = buildTopicVariants(lesson, category, level);
    const legacyQuestion = getLegacyQuestion(lesson);
    const keywords = buildKeywordTerms(lesson, category, context, legacyQuestion);
    const backups = Array.isArray(lesson?.playback?.backups) ? lesson.playback.backups : [];
    const legacyReference = backups.find((entry) => ensureString(entry?.src)) || null;

    return {
        expectedLevelId: level.id,
        expectedCategoryId: category.id,
        expectedTitle: lesson.title,
        expectedTitleVi: context.titleVi,
        expectedChannel: ensureString(lesson.channel) || null,
        expectedKeywords: keywords.map((entry) => entry.term),
        legacyReference: legacyReference
            ? {
                kind: ensureString(legacyReference.kind) || 'reference',
                src: ensureString(legacyReference.src) || null,
                youtubeId: ensureString(legacyReference.youtubeId) || null,
            }
            : null,
        manualReviewStatus: 'pending',
        contentMatchStatus: 'unverified',
        automatedCheckStatus: 'not_run',
        automatedMatchScore: null,
        riskScore: null,
        autoDecision: null,
        autoReasons: [],
        canonicalMatchEvidence: {
            titleMatchScore: null,
            channelMatch: false,
            keywordCoverage: null,
            reviewSnapshotUrl: null,
        },
        referenceHarvest: {
            source: null,
            query: null,
            confidence: null,
            harvestedTitle: null,
            harvestedChannel: null,
            harvestedUrl: null,
            harvestedAt: null,
        },
        reviewChecklist: {
            titleCategoryMatch: false,
            ageAppropriate: true,
            licenseValid: false,
            scriptAcceptable: true,
            quizAcceptable: true,
        },
        blockingReasons: [],
        reviewedBy: null,
        reviewedAt: null,
        evidenceUrl: null,
        rejectionReasonCode: null,
        lastAlignedAt: null,
        notes: [
            `Expected focus: ${lesson.title}.`,
            `Expected classification: ${level.title} / ${category.title}.`,
            'Do not publish until a reviewer confirms that the canonical source matches the intended topic, level, and category.',
        ],
    };
}

export function buildLessonLearningPacketDefaults(lesson, category, level, siblingLessons = []) {
    const context = buildTopicVariants(lesson, category, level);
    const legacyQuestion = getLegacyQuestion(lesson);
    const keywords = buildKeywordTerms(lesson, category, context, legacyQuestion);
    const watchCue = buildWatchCue(lesson, category, context);
    const transferCue = buildTransferCue(lesson, category, context);
    const anchor = buildLegacyAnchor(lesson, legacyQuestion);
    const guide = getGuide(category.id);
    const questions = buildQuizQuestions(
        lesson,
        category,
        context,
        siblingLessons,
        legacyQuestion,
        watchCue,
        transferCue,
        anchor,
        keywords
    );

    return {
        schemaVersion: 1,
        packetType: 'curriculum_companion',
        pedagogicalFrame: {
            learningScience: [
                'retrieval_practice',
                'distributed_recall',
                'segmenting_and_signaling',
                'bilingual_support_with_low_split_attention',
            ],
            rationaleEn: `This lesson uses short preview cues, guided noticing, retrieval, and transfer so the learner does more than passively watch ${lesson.title}.`,
            rationaleVi: `Bài học này dùng gợi ý ngắn trước khi xem, hướng chú ý, gọi lại và vận dụng để người học không chỉ xem thụ động bài ${context.titleVi}.`,
            designGuardrailEn: 'Use bilingual support as a cue, not as a wall of text that competes with the video.',
            designGuardrailVi: 'Dùng hỗ trợ song ngữ như một gợi ý, không biến nó thành bức tường chữ dày đặc tranh chú ý với video.',
        },
        learningObjectives: buildObjectives(lesson, category, context, keywords, anchor),
        focusVocabulary: keywords,
        script: {
            type: 'companion_bilingual',
            displayMode: 'parallel_en_vi',
            variant: 'companion',
            captionsEnVtt: null,
            captionsViVtt: null,
            timedSegments: [],
            publicLabel: 'Companion Script',
            segments: buildScriptSegments(lesson, category, context, keywords, watchCue, transferCue, anchor),
        },
        quiz: {
            minimumPassRatio: 0.7,
            unlockCondition: 'video_or_script_ready',
            questions,
        },
        practice: {
            beforeWatch: [
                {
                    en: `Read the title and predict two things you expect to hear in ${lesson.title}.`,
                    vi: `Đọc tiêu đề và đoán hai điều bạn sẽ nghe trong bài ${context.titleVi}.`,
                },
            ],
            afterWatch: [
                {
                    en: 'Recall from memory first, then replay only the part you missed.',
                    vi: 'Hãy gọi lại bằng trí nhớ trước, rồi chỉ xem lại phần bạn bỏ lỡ.',
                },
                {
                    en: transferCue.en,
                    vi: transferCue.vi,
                },
            ],
            memoryPlan: [
                {
                    en: 'Do one immediate recall pass, one same-day retell, and one next-day quick review.',
                    vi: 'Làm một lần gọi lại ngay lập tức, một lần kể lại trong ngày, và một lần ôn nhanh vào hôm sau.',
                },
            ],
            shadowing: [
                {
                    en: anchor.statementEn,
                    vi: anchor.statementVi,
                },
            ],
        },
        researchBasis: [
            {
                key: 'retrieval_practice',
                label: 'Retrieval practice',
                whyEn: 'Quiz questions force recall instead of passive rereading.',
                whyVi: 'Câu hỏi quiz buộc người học gọi lại thay vì đọc lại thụ động.',
            },
            {
                key: 'distributed_recall',
                label: 'Distributed recall',
                whyEn: 'The packet asks for replay, retell, and next-day review instead of one-shot viewing.',
                whyVi: 'Gói học liệu yêu cầu xem lại, kể lại và ôn vào hôm sau thay vì xem một lần rồi bỏ.',
            },
            {
                key: 'segmenting_and_signaling',
                label: 'Segmenting and signaling',
                whyEn: 'Short watch cues reduce overload and highlight what the learner should notice.',
                whyVi: 'Các gợi ý ngắn lúc xem giúp giảm quá tải và làm rõ điều người học cần chú ý.',
            },
            {
                key: 'bilingual_support_with_low_split_attention',
                label: 'Bilingual support',
                whyEn: 'Each English line is paired with one concise Vietnamese cue rather than dense duplicate text.',
                whyVi: 'Mỗi dòng tiếng Anh đi kèm một gợi ý tiếng Việt ngắn gọn thay vì lặp lại dày đặc.',
            },
        ],
    };
}

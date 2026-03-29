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

function makeOption(en, vi = null) {
    return {
        en: ensureString(en),
        vi: ensureString(vi) || translatePhrase(en),
    };
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
        options: options.map((option) => (typeof option === 'string' ? makeOption(option) : makeOption(option.en, option.vi))),
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

function getLegacyQuestion(lesson) {
    const questions = Array.isArray(lesson?.quiz) ? lesson.quiz : [];
    return questions.find((question) => Array.isArray(question?.options) && Number.isInteger(question?.answer)) || null;
}

function getLegacyCorrectAnswer(legacyQuestion) {
    if (!legacyQuestion) return null;
    return ensureString(legacyQuestion.options?.[legacyQuestion.answer]) || null;
}

function buildLegacyAnchor(lesson, legacyQuestion) {
    if (!legacyQuestion) {
        return {
            statementEn: `The lesson stays focused on ${lesson.title}.`,
            statementVi: `Bai hoc giu dung trong tam vao ${lesson.titleVi || translatePhrase(lesson.title)}.`,
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
                : `Cau mau dung voi bai hoc nay la: ${correctAnswer}.`,
        };
    }

    const quotedTerm = extractQuotedTerm(englishPrompt);
    if (quotedTerm && /means|is|for|stands for|sounds like/i.test(englishPrompt)) {
        return {
            statementEn: `"${quotedTerm}" is linked with ${correctAnswer} in this lesson.`,
            statementVi: `"${quotedTerm}" duoc gan voi ${correctAnswer} trong bai hoc nay.`,
        };
    }

    if (/how many/i.test(englishPrompt)) {
        return {
            statementEn: `A key fact in this lesson is ${correctAnswer}.`,
            statementVi: `Mot thong tin chinh trong bai hoc nay la ${correctAnswer}.`,
        };
    }

    return {
        statementEn: `A key answer for this lesson is ${correctAnswer}.`,
        statementVi: `Mot dap an cot loi cua bai hoc nay la ${correctAnswer}.`,
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
        exampleVi: `Dung "${term}" khi hoc bai ${context.titleVi}.`,
    }));
}

function buildWatchCue(lesson, category, context) {
    const guide = getGuide(category.id);

    if (context.range?.type === 'range') {
        return {
            en: `Watch for the counting sequence from ${context.range.start} to ${context.range.end}, and say the next number before it appears.`,
            vi: `Hay nghe day dem tu ${context.range.start} den ${context.range.end}, va doc so tiep theo truoc khi video hien ra.`,
        };
    }

    if (context.range?.type === 'skip') {
        return {
            en: `Watch for the skip-count pattern in steps of ${context.range.step} and clap each jump.`,
            vi: `Hay de y mau dem cach ${context.range.step} va vo tay moi lan nhay so.`,
        };
    }

    if (context.letter) {
        return {
            en: `Watch for the letter ${context.letter}, repeat its sound, and notice one example word that starts with it.`,
            vi: `Hay de y chu ${context.letter}, lap lai am cua no va nhan ra mot tu vi du bat dau bang chu do.`,
        };
    }

    return {
        en: `${guide.watchCueEn.charAt(0).toUpperCase()}${guide.watchCueEn.slice(1)} while the video stays on ${lesson.title}.`,
        vi: `${guide.watchCueVi.charAt(0).toUpperCase()}${guide.watchCueVi.slice(1)} khi video tap trung vao ${context.titleVi}.`,
    };
}

function buildTransferCue(lesson, category, context) {
    const guide = getGuide(category.id);

    if (category.id === 'b-convo' || category.id === 'i-speak' || category.id === 'a-business') {
        return {
            en: `After watching, record a 20-second response about ${lesson.title} using one line from the video and one line of your own.`,
            vi: `Sau khi xem, hay tu ghi am mot doan 20 giay ve ${context.titleVi} voi mot cau tu video va mot cau cua rieng ban.`,
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
            vi: `Xac dinh y chinh cua bai ${context.titleVi} va giu su chu y vao cac dau hieu noi dung dung.`,
        },
        {
            en: `Notice and recall core language such as ${firstKeyword} and ${secondKeyword}.`,
            vi: `Nhan ra va goi lai ngon ngu cot loi nhu ${translatePhrase(firstKeyword)} va ${translatePhrase(secondKeyword)}.`,
        },
        {
            en: `Use the video as input for ${guide.focusEn}, then produce one short response of your own.`,
            vi: `Dung video lam dau vao cho ${guide.focusVi}, roi tu tao mot phan hoi ngan cua rieng minh.`,
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
            labelVi: 'Truoc khi xem',
            en: `Today we study ${lesson.title}. Predict what the video should teach before you press play.`,
            vi: `Hom nay chung ta hoc ${context.titleVi}. Hay doan truoc video se day gi truoc khi bam phat.`,
        },
        {
            id: 'watch_cue',
            phase: 'while_watch',
            label: 'Watch Cue',
            labelVi: 'Luc xem',
            en: watchCue.en,
            vi: watchCue.vi,
        },
        {
            id: 'focus_words',
            phase: 'while_watch',
            label: 'Focus Words',
            labelVi: 'Tu khoa',
            en: `Listen for these anchor words: ${keywordList}.`,
            vi: `Hay nghe cac tu moc nay: ${keywords.slice(0, 3).map((entry) => entry.meaningVi).join(', ')}.`,
        },
        {
            id: 'anchor',
            phase: 'notice',
            label: 'Anchor Idea',
            labelVi: 'Y neo',
            en: anchor.statementEn,
            vi: anchor.statementVi,
        },
        {
            id: 'retrieve',
            phase: 'retrieve',
            label: 'Retrieve',
            labelVi: 'Goi lai',
            en: `Pause the video and say three things you remember about ${lesson.title} without looking at the screen.`,
            vi: `Tam dung video va noi ba dieu ban con nho ve ${context.titleVi} ma khong nhin man hinh.`,
        },
        {
            id: 'transfer',
            phase: 'transfer',
            label: 'Transfer',
            labelVi: 'Van dung',
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
            'Bo qua dau hieu chinh va chi doi phu de.'
        ),
        makeOption(
            `Focus on every detail equally and avoid pausing or repeating.`,
            'Tap trung vao moi chi tiet nhu nhau va khong tam dung hay lap lai.'
        ),
        makeOption(
            `Memorize random words without checking the lesson goal.`,
            'Hoc thuoc tu ngau nhien ma khong kiem tra muc tieu bai hoc.'
        ),
    ];
}

function buildLegacyDetailQuestion(lesson, legacyQuestion, anchor, index) {
    if (!legacyQuestion) {
        return makeQuestion({
            id: `q${index}`,
            stage: 'detail',
            q: `Which statement fits the lesson "${lesson.title}" best?`,
            qVi: `Cau nao phu hop nhat voi bai "${lesson.titleVi || translatePhrase(lesson.title)}"?`,
            options: [
                makeOption(anchor.statementEn, anchor.statementVi),
                makeOption('The lesson should ignore the main topic and change to something unrelated.', 'Bai hoc nen bo qua chu de chinh va chuyen sang noi dung khong lien quan.'),
                makeOption('The lesson is only for silent viewing with no recall practice.', 'Bai hoc chi de xem im lang va khong can goi lai.'),
                makeOption('The learner should skip checking meaning or form.', 'Nguoi hoc nen bo qua viec kiem tra nghia hoac cau truc.'),
            ],
            answer: 0,
            explanation: 'The aligned statement must stay anchored to the intended lesson outcome.',
            explanationVi: 'Phat bieu dung phai giu noi dung bam sat ket qua hoc tap du kien cua bai hoc.',
        });
    }

    const answerIndex = Number.isInteger(legacyQuestion.answer) ? legacyQuestion.answer : 0;
    const options = Array.isArray(legacyQuestion.options) ? legacyQuestion.options : [];

    return makeQuestion({
        id: `q${index}`,
        stage: 'detail',
        q: legacyQuestion.q,
        qVi: legacyQuestion.qVi || `Cau chi tiet cho bai ${lesson.titleVi || translatePhrase(lesson.title)}`,
        options: options.map((option) => makeOption(option)),
        answer: Math.max(0, Math.min(answerIndex, Math.max(0, options.length - 1))),
        explanation: `This detail question is preserved from the legacy curriculum because it captures a concrete content checkpoint for ${lesson.title}.`,
        explanationVi: `Cau hoi chi tiet nay duoc giu lai tu curriculum cu vi no nho den mot moc noi dung cu the cho bai ${lesson.titleVi || translatePhrase(lesson.title)}.`,
    });
}

function buildVocabularyQuestion(lesson, keywords, index) {
    const keyword = keywords.find((entry) => !/^\d+$/.test(entry.term))
        || keywords[0]
        || { term: lesson.title, meaningVi: lesson.titleVi || translatePhrase(lesson.title) };
    const distractors = uniqueStrings(
        keywords.slice(1).map((entry) => entry.meaningVi).concat(['noi dung khong lien quan', 'chi tiet sai', 'goi y phu']),
        3
    );

    return makeQuestion({
        id: `q${index}`,
        stage: 'retrieve',
        q: `Which Vietnamese cue best matches "${keyword.term}" in this lesson?`,
        qVi: `Goi y tieng Viet nao hop nhat voi "${keyword.term}" trong bai hoc nay?`,
        options: [makeOption(keyword.meaningVi, keyword.meaningVi), ...distractors.map((value) => makeOption(value, value))],
        answer: 0,
        explanation: `A learner should connect the English anchor word "${keyword.term}" with a stable meaning cue.`,
        explanationVi: `Nguoi hoc can noi tu moc tieng Anh "${keyword.term}" voi mot goi y nghia on dinh.`,
    });
}

function buildTransferQuestion(lesson, transferCue, index) {
    return makeQuestion({
        id: `q${index}`,
        stage: 'transfer',
        q: `After watching "${lesson.title}", what is the strongest next study move?`,
        qVi: `Sau khi xem "${lesson.titleVi || translatePhrase(lesson.title)}", buoc hoc tiep theo tot nhat la gi?`,
        options: [
            makeOption(transferCue.en, transferCue.vi),
            makeOption('Move on immediately without speaking, pausing, or recalling anything.', 'Chuyen ngay sang bai khac ma khong noi, tam dung hay goi lai gi.'),
            makeOption('Copy every line once and avoid using it in a new example.', 'Chep lai moi dong mot lan va tranh dung no trong vi du moi.'),
            makeOption('Only reread the title and assume the content is already mastered.', 'Chi doc lai tieu de va cho rang minh da nam vung noi dung.'),
        ],
        answer: 0,
        explanation: 'Retrieval plus production helps turn watched input into usable language.',
        explanationVi: 'Goi lai ket hop san sinh ngon ngu giup bien dau vao da xem thanh ngon ngu co the su dung.',
    });
}

function buildQuizQuestions(lesson, category, siblingLessons, legacyQuestion, watchCue, transferCue, anchor, keywords) {
    return [
        makeQuestion({
            id: 'q1',
            stage: 'preview',
            q: `Which title best matches the approved content for this lesson?`,
            qVi: 'Tieu de nao phu hop nhat voi noi dung da duoc duyet cua bai hoc nay?',
            options: buildQuestionOptionsForTopic(lesson, category, siblingLessons),
            answer: 0,
            explanation: 'A correct lesson should stay aligned with its intended title and classification.',
            explanationVi: 'Mot bai hoc dung phai giu su thang hang voi tieu de va phan loai du kien.',
        }),
        makeQuestion({
            id: 'q2',
            stage: 'while_watch',
            q: `While watching "${lesson.title}", which cue should the learner track?`,
            qVi: `Khi xem "${lesson.titleVi || translatePhrase(lesson.title)}", nguoi hoc nen theo doi dau hieu nao?`,
            options: buildWatchCueOptions(watchCue, category),
            answer: 0,
            explanation: 'This cue directs attention to the information that matters most in the lesson.',
            explanationVi: 'Dau hieu nay giup huong su chu y vao thong tin quan trong nhat cua bai hoc.',
        }),
        buildLegacyDetailQuestion(lesson, legacyQuestion, anchor, 3),
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
        reviewedBy: null,
        reviewedAt: null,
        evidenceUrl: null,
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
            rationaleVi: `Bai hoc nay dung goi y ngan truoc khi xem, huong chu y, goi lai va van dung de nguoi hoc khong chi xem thu dong bai ${context.titleVi}.`,
            designGuardrailEn: 'Use bilingual support as a cue, not as a wall of text that competes with the video.',
            designGuardrailVi: 'Dung ho tro song ngu nhu mot goi y, khong bien no thanh buc tu day dac tranh chu y voi video.',
        },
        learningObjectives: buildObjectives(lesson, category, context, keywords, anchor),
        focusVocabulary: keywords,
        script: {
            type: 'companion_bilingual',
            displayMode: 'parallel_en_vi',
            segments: buildScriptSegments(lesson, category, context, keywords, watchCue, transferCue, anchor),
        },
        quiz: {
            minimumPassRatio: 0.7,
            unlockCondition: 'canonical_source_playable',
            questions,
        },
        practice: {
            beforeWatch: [
                {
                    en: `Read the title and predict two things you expect to hear in ${lesson.title}.`,
                    vi: `Doc tieu de va doan hai dieu ban se nghe trong bai ${context.titleVi}.`,
                },
            ],
            afterWatch: [
                {
                    en: 'Recall from memory first, then replay only the part you missed.',
                    vi: 'Hay goi lai bang tri nho truoc, roi chi xem lai phan ban bo lo.',
                },
                {
                    en: transferCue.en,
                    vi: transferCue.vi,
                },
            ],
            memoryPlan: [
                {
                    en: 'Do one immediate recall pass, one same-day retell, and one next-day quick review.',
                    vi: 'Lam mot lan goi lai ngay lap tuc, mot lan ke lai trong ngay, va mot lan on nhanh vao hom sau.',
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
                whyVi: 'Cau hoi quiz buoc nguoi hoc goi lai thay vi doc lai thu dong.',
            },
            {
                key: 'distributed_recall',
                label: 'Distributed recall',
                whyEn: 'The packet asks for replay, retell, and next-day review instead of one-shot viewing.',
                whyVi: 'Goi hoc lieu yeu cau xem lai, ke lai va on vao hom sau thay vi xem mot lan roi bo.',
            },
            {
                key: 'segmenting_and_signaling',
                label: 'Segmenting and signaling',
                whyEn: 'Short watch cues reduce overload and highlight what the learner should notice.',
                whyVi: 'Cac goi y ngan luc xem giup giam qua tai va lam ro dieu nguoi hoc can chu y.',
            },
            {
                key: 'bilingual_support_with_low_split_attention',
                label: 'Bilingual support',
                whyEn: 'Each English line is paired with one concise Vietnamese cue rather than dense duplicate text.',
                whyVi: 'Moi dong tieng Anh di kem mot goi y tieng Viet ngan gon thay vi lap lai day dac.',
            },
        ],
    };
}

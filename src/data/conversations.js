// Advanced Conversation Data — CEFR Pre-A1/A1 aligned
// Full sentence practice, dialogues, role-play scenarios
// For a 6yo who already communicates in full sentences

// ============================================
// ENGLISH CONVERSATIONS — Interactive Dialogues
// ============================================
export const ENGLISH_CONVERSATIONS = [
    {
        id: 'greet_friend',
        title: 'Gặp bạn mới',
        titleEn: 'Meeting a New Friend',
        emoji: '👋',
        level: 'A1',
        scenario: 'Con gặp một bạn mới ở công viên. Hãy nói chuyện với bạn ấy!',
        dialogue: [
            { speaker: 'friend', text: "Hi! My name is Lily. What's your name?", vietnamese: 'Xin chào! Mình tên là Lily. Bạn tên gì?', audio: 'en-US' },
            { speaker: 'child', prompt: "Trả lời: My name is ___", expected: ["My name is", "I'm", "I am"], hint: "My name is..." },
            { speaker: 'friend', text: "Nice to meet you! How old are you?", vietnamese: 'Rất vui được gặp bạn! Bạn mấy tuổi?', audio: 'en-US' },
            { speaker: 'child', prompt: "Trả lời về tuổi của con", expected: ["I'm six", "I am six", "six years old", "I'm 6"], hint: "I'm six years old" },
            { speaker: 'friend', text: "Cool! Do you want to play together?", vietnamese: 'Hay quá! Bạn muốn chơi cùng không?', audio: 'en-US' },
            { speaker: 'child', prompt: "Trả lời có hoặc không", expected: ["yes", "sure", "ok", "yes please", "let's play", "yes I do"], hint: "Yes! Let's play!" },
            { speaker: 'friend', text: "Great! Let's go! 🎉", vietnamese: 'Tuyệt! Đi thôi nào! 🎉', audio: 'en-US' },
        ]
    },
    {
        id: 'at_restaurant',
        title: 'Ở nhà hàng',
        titleEn: 'At the Restaurant',
        emoji: '🍕',
        level: 'A1',
        scenario: 'Con đi ăn nhà hàng với gia đình. Hãy gọi món!',
        dialogue: [
            { speaker: 'waiter', text: "Hello! Welcome! What would you like to eat?", vietnamese: 'Xin chào! Chào mừng! Bạn muốn ăn gì?', audio: 'en-US' },
            { speaker: 'child', prompt: "Gọi món ăn yêu thích", expected: ["I want", "I would like", "Can I have", "I'd like", "pizza", "chicken", "rice"], hint: "I would like pizza, please" },
            { speaker: 'waiter', text: "Would you like something to drink?", vietnamese: 'Bạn muốn uống gì không?', audio: 'en-US' },
            { speaker: 'child', prompt: "Gọi đồ uống", expected: ["water", "juice", "milk", "I want", "I would like", "Can I have", "orange juice"], hint: "Can I have some water, please?" },
            { speaker: 'waiter', text: "Here you go! Enjoy your meal!", vietnamese: 'Đây ạ! Chúc ngon miệng!', audio: 'en-US' },
            { speaker: 'child', prompt: "Cảm ơn", expected: ["thank you", "thanks", "thank you very much"], hint: "Thank you very much!" },
        ]
    },
    {
        id: 'daily_routine',
        title: 'Một ngày của con',
        titleEn: 'My Daily Routine',
        emoji: '🌅',
        level: 'A1',
        scenario: 'Kể cho bạn nghe về một ngày của con!',
        dialogue: [
            { speaker: 'friend', text: "What time do you wake up?", vietnamese: 'Bạn dậy lúc mấy giờ?', audio: 'en-US' },
            { speaker: 'child', prompt: "Nói giờ con thức dậy", expected: ["I wake up at", "I get up at", "six", "seven", "o'clock"], hint: "I wake up at seven o'clock" },
            { speaker: 'friend', text: "What do you have for breakfast?", vietnamese: 'Bạn ăn sáng gì?', audio: 'en-US' },
            { speaker: 'child', prompt: "Kể về bữa sáng", expected: ["I eat", "I have", "rice", "bread", "milk", "egg", "cereal", "breakfast"], hint: "I have rice and milk for breakfast" },
            { speaker: 'friend', text: "What do you do after school?", vietnamese: 'Sau giờ học bạn làm gì?', audio: 'en-US' },
            { speaker: 'child', prompt: "Kể về hoạt động sau giờ học", expected: ["I play", "I read", "I watch", "I go", "homework", "play", "draw", "swim"], hint: "I play with my friends" },
            { speaker: 'friend', text: "What time do you go to bed?", vietnamese: 'Bạn đi ngủ lúc mấy giờ?', audio: 'en-US' },
            { speaker: 'child', prompt: "Nói giờ đi ngủ", expected: ["I go to bed at", "I sleep at", "nine", "eight", "o'clock"], hint: "I go to bed at nine o'clock" },
        ]
    },
    {
        id: 'at_school',
        title: 'Ở trường học',
        titleEn: 'At School',
        emoji: '🏫',
        level: 'A1',
        scenario: 'Con nói chuyện với cô giáo và bạn ở trường!',
        dialogue: [
            { speaker: 'teacher', text: "Good morning, class! How are you today?", vietnamese: 'Chào buổi sáng cả lớp! Hôm nay các em thế nào?', audio: 'en-US' },
            { speaker: 'child', prompt: "Chào cô và trả lời", expected: ["good morning", "I'm fine", "I'm good", "I am fine", "very good", "I'm great", "happy"], hint: "Good morning, teacher! I'm fine, thank you!" },
            { speaker: 'teacher', text: "What is your favorite subject?", vietnamese: 'Môn học yêu thích của em là gì?', audio: 'en-US' },
            { speaker: 'child', prompt: "Nói về môn học yêu thích", expected: ["I like", "my favorite", "math", "art", "music", "english", "science", "PE"], hint: "I like math and art!" },
            { speaker: 'teacher', text: "That's wonderful! Can you count to ten in English?", vietnamese: 'Tuyệt vời! Em đếm đến mười tiếng Anh được không?', audio: 'en-US' },
            { speaker: 'child', prompt: "Đếm từ 1 đến 10", expected: ["one two three", "1 2 3", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"], hint: "One, two, three, four, five, six, seven, eight, nine, ten!" },
        ]
    },
    {
        id: 'pet_talk',
        title: 'Nói về thú cưng',
        titleEn: 'My Pet',
        emoji: '🐶',
        level: 'A1',
        scenario: 'Bạn hỏi con về thú cưng. Hãy kể cho bạn nghe!',
        dialogue: [
            { speaker: 'friend', text: "Do you have a pet?", vietnamese: 'Bạn có nuôi thú cưng không?', audio: 'en-US' },
            { speaker: 'child', prompt: "Trả lời có hay không", expected: ["yes", "no", "I have", "I don't have", "dog", "cat", "fish", "I have a"], hint: "Yes, I have a dog!" },
            { speaker: 'friend', text: "What is its name?", vietnamese: 'Nó tên gì?', audio: 'en-US' },
            { speaker: 'child', prompt: "Nói tên thú cưng", expected: ["its name is", "his name", "her name", "name is", "called"], hint: "Its name is Lucky!" },
            { speaker: 'friend', text: "What does it like to do?", vietnamese: 'Nó thích làm gì?', audio: 'en-US' },
            { speaker: 'child', prompt: "Kể về thú cưng", expected: ["it likes", "he likes", "she likes", "play", "eat", "run", "sleep", "swim"], hint: "It likes to play and run!" },
        ]
    },
    {
        id: 'weather_talk',
        title: 'Nói về thời tiết',
        titleEn: 'Weather Talk',
        emoji: '🌤️',
        level: 'A1',
        scenario: 'Bạn và con nói về thời tiết hôm nay!',
        dialogue: [
            { speaker: 'friend', text: "How's the weather today?", vietnamese: 'Hôm nay thời tiết thế nào?', audio: 'en-US' },
            { speaker: 'child', prompt: "Mô tả thời tiết", expected: ["it's sunny", "it's rainy", "it's cloudy", "it's hot", "it's cold", "sunny", "rainy", "hot", "cold", "warm"], hint: "It's sunny and hot today!" },
            { speaker: 'friend', text: "What do you like to do on sunny days?", vietnamese: 'Bạn thích làm gì khi trời nắng?', audio: 'en-US' },
            { speaker: 'child', prompt: "Nói hoạt động yêu thích", expected: ["I like to", "I want to", "play", "swim", "go to", "park", "ride", "bike", "outside"], hint: "I like to go to the park!" },
        ]
    },
];

// ============================================
// CHINESE CONVERSATIONS — Interactive Dialogues
// ============================================
export const CHINESE_CONVERSATIONS = [
    {
        id: 'greet_friend_cn',
        title: 'Gặp bạn mới',
        titleCn: '认识新朋友',
        emoji: '👋',
        level: 'A1',
        scenario: 'Con gặp một bạn mới ở Trung Quốc. Hãy nói chuyện bằng tiếng Trung!',
        dialogue: [
            { speaker: 'friend', text: "你好！我叫小明。你叫什么名字？", pinyin: "Nǐ hǎo! Wǒ jiào Xiǎo Míng. Nǐ jiào shénme míngzi?", vietnamese: 'Xin chào! Mình tên Tiểu Minh. Bạn tên gì?', audio: 'zh-CN' },
            { speaker: 'child', prompt: "Trả lời: 我叫___", expected: ["我叫", "wǒ jiào", "wo jiao"], hint: "我叫..." },
            { speaker: 'friend', text: "你几岁了？", pinyin: "Nǐ jǐ suì le?", vietnamese: 'Bạn mấy tuổi?', audio: 'zh-CN' },
            { speaker: 'child', prompt: "Trả lời tuổi", expected: ["我六岁", "六岁", "wǒ liù suì", "liu sui"], hint: "我六岁了" },
            { speaker: 'friend', text: "我们一起玩吧！", pinyin: "Wǒmen yìqǐ wán ba!", vietnamese: 'Chúng mình cùng chơi nhé!', audio: 'zh-CN' },
            { speaker: 'child', prompt: "Đồng ý", expected: ["好", "好的", "好啊", "hǎo", "hao"], hint: "好啊！" },
        ]
    },
    {
        id: 'food_cn',
        title: 'Đồ ăn yêu thích',
        titleCn: '我喜欢吃什么',
        emoji: '🍜',
        level: 'A1',
        scenario: 'Bạn hỏi con thích ăn gì. Trả lời bằng tiếng Trung!',
        dialogue: [
            { speaker: 'friend', text: "你喜欢吃什么？", pinyin: "Nǐ xǐhuān chī shénme?", vietnamese: 'Bạn thích ăn gì?', audio: 'zh-CN' },
            { speaker: 'child', prompt: "Nói món ăn yêu thích", expected: ["我喜欢吃", "喜欢", "xǐhuān", "chī"], hint: "我喜欢吃米饭" },
            { speaker: 'friend', text: "你想喝什么？", pinyin: "Nǐ xiǎng hē shénme?", vietnamese: 'Bạn muốn uống gì?', audio: 'zh-CN' },
            { speaker: 'child', prompt: "Nói đồ uống", expected: ["我想喝", "牛奶", "水", "果汁", "niú nǎi", "shuǐ"], hint: "我想喝牛奶" },
            { speaker: 'friend', text: "好吃吗？", pinyin: "Hǎo chī ma?", vietnamese: 'Ngon không?', audio: 'zh-CN' },
            { speaker: 'child', prompt: "Trả lời", expected: ["好吃", "很好吃", "hǎo chī", "hěn hǎo chī"], hint: "很好吃！" },
        ]
    },
    {
        id: 'family_cn',
        title: 'Gia đình của con',
        titleCn: '我的家人',
        emoji: '👨‍👩‍👦',
        level: 'A1',
        scenario: 'Kể cho bạn nghe về gia đình con bằng tiếng Trung!',
        dialogue: [
            { speaker: 'friend', text: "你家有几口人？", pinyin: "Nǐ jiā yǒu jǐ kǒu rén?", vietnamese: 'Nhà bạn có mấy người?', audio: 'zh-CN' },
            { speaker: 'child', prompt: "Nói số thành viên", expected: ["三口", "四口", "五口", "我家有", "sān", "sì", "wǔ"], hint: "我家有四口人" },
            { speaker: 'friend', text: "你爸爸做什么工作？", pinyin: "Nǐ bàba zuò shénme gōngzuò?", vietnamese: 'Ba bạn làm nghề gì?', audio: 'zh-CN' },
            { speaker: 'child', prompt: "Kể về nghề nghiệp ba", expected: ["爸爸是", "医生", "老师", "bàba shì", "yīshēng", "lǎoshī"], hint: "我爸爸是医生" },
            { speaker: 'friend', text: "你爱你的家人吗？", pinyin: "Nǐ ài nǐ de jiārén ma?", vietnamese: 'Bạn yêu gia đình không?', audio: 'zh-CN' },
            { speaker: 'child', prompt: "Trả lời", expected: ["我爱", "爱", "ài", "wǒ ài"], hint: "我爱我的家人！" },
        ]
    },
];

// ============================================
// SENTENCE BUILDING — Match & Build exercises
// ============================================
export const SENTENCE_EXERCISES = {
    english: [
        {
            id: 'se1',
            prompt: '🍎 Con muốn ăn táo',
            correctSentence: 'I want to eat an apple',
            words: ['I', 'want', 'to', 'eat', 'an', 'apple'],
            distractors: ['she', 'go', 'the'],
            level: 'A1',
        },
        {
            id: 'se2',
            prompt: '🐕 Con có một con chó',
            correctSentence: 'I have a dog',
            words: ['I', 'have', 'a', 'dog'],
            distractors: ['is', 'the', 'cat'],
            level: 'A1',
        },
        {
            id: 'se3',
            prompt: '📖 Con thích đọc sách',
            correctSentence: 'I like to read books',
            words: ['I', 'like', 'to', 'read', 'books'],
            distractors: ['she', 'goes', 'a'],
            level: 'A1',
        },
        {
            id: 'se4',
            prompt: '🏫 Con đi học mỗi ngày',
            correctSentence: 'I go to school every day',
            words: ['I', 'go', 'to', 'school', 'every', 'day'],
            distractors: ['she', 'night', 'play'],
            level: 'A1',
        },
        {
            id: 'se5',
            prompt: '☀️ Hôm nay trời nắng đẹp',
            correctSentence: 'Today is a sunny day',
            words: ['Today', 'is', 'a', 'sunny', 'day'],
            distractors: ['rainy', 'was', 'night'],
            level: 'A1',
        },
        {
            id: 'se6',
            prompt: '🎂 Con sáu tuổi',
            correctSentence: 'I am six years old',
            words: ['I', 'am', 'six', 'years', 'old'],
            distractors: ['is', 'have', 'new'],
            level: 'Pre-A1',
        },
        {
            id: 'se7',
            prompt: '👨‍👩‍👦 Con yêu gia đình',
            correctSentence: 'I love my family',
            words: ['I', 'love', 'my', 'family'],
            distractors: ['she', 'his', 'house'],
            level: 'Pre-A1',
        },
        {
            id: 'se8',
            prompt: '🚲 Con biết đi xe đạp',
            correctSentence: 'I can ride a bicycle',
            words: ['I', 'can', 'ride', 'a', 'bicycle'],
            distractors: ['she', 'drive', 'the'],
            level: 'A1',
        },
    ],
    chinese: [
        {
            id: 'sc1',
            prompt: '🍎 Con muốn ăn táo',
            correctSentence: '我 想 吃 苹果',
            words: ['我', '想', '吃', '苹果'],
            distractors: ['他', '去', '书'],
            level: 'A1',
        },
        {
            id: 'sc2',
            prompt: '🏫 Con đi học',
            correctSentence: '我 去 上学',
            words: ['我', '去', '上学'],
            distractors: ['他', '吃', '玩'],
            level: 'Pre-A1',
        },
        {
            id: 'sc3',
            prompt: '👩 Con yêu mẹ',
            correctSentence: '我 爱 妈妈',
            words: ['我', '爱', '妈妈'],
            distractors: ['他', '去', '学校'],
            level: 'Pre-A1',
        },
        {
            id: 'sc4',
            prompt: '🐱 Con thích mèo',
            correctSentence: '我 喜欢 猫',
            words: ['我', '喜欢', '猫'],
            distractors: ['他', '吃', '狗'],
            level: 'A1',
        },
    ],
};

// ============================================
// PRONUNCIATION SENTENCES — ELSA-style practice
// ============================================
export const PRONUNCIATION_SENTENCES = {
    english: [
        { text: "Hello, how are you?", vietnamese: "Xin chào, bạn khỏe không?", level: 'Pre-A1' },
        { text: "My name is...", vietnamese: "Tên tôi là...", level: 'Pre-A1' },
        { text: "I am six years old.", vietnamese: "Tôi sáu tuổi.", level: 'Pre-A1' },
        { text: "I like to play with my friends.", vietnamese: "Tôi thích chơi với bạn.", level: 'A1' },
        { text: "Can I have some water, please?", vietnamese: "Cho tôi xin nước, làm ơn?", level: 'A1' },
        { text: "What is your favorite color?", vietnamese: "Màu yêu thích của bạn là gì?", level: 'A1' },
        { text: "I go to school every day.", vietnamese: "Tôi đi học mỗi ngày.", level: 'A1' },
        { text: "Thank you very much!", vietnamese: "Cảm ơn rất nhiều!", level: 'Pre-A1' },
        { text: "I have a dog and a cat.", vietnamese: "Tôi có một con chó và một con mèo.", level: 'A1' },
        { text: "The weather is very nice today.", vietnamese: "Hôm nay thời tiết rất đẹp.", level: 'A1' },
        { text: "I want to be a doctor.", vietnamese: "Tôi muốn làm bác sĩ.", level: 'A1' },
        { text: "Let's play together!", vietnamese: "Cùng chơi nhé!", level: 'Pre-A1' },
    ],
    chinese: [
        { text: "你好，你好吗？", pinyin: "Nǐ hǎo, nǐ hǎo ma?", vietnamese: "Xin chào, bạn khỏe không?", level: 'Pre-A1' },
        { text: "我叫...", pinyin: "Wǒ jiào...", vietnamese: "Tôi tên là...", level: 'Pre-A1' },
        { text: "我六岁了。", pinyin: "Wǒ liù suì le.", vietnamese: "Tôi sáu tuổi.", level: 'Pre-A1' },
        { text: "我喜欢和朋友玩。", pinyin: "Wǒ xǐhuān hé péngyǒu wán.", vietnamese: "Tôi thích chơi với bạn.", level: 'A1' },
        { text: "我每天去上学。", pinyin: "Wǒ měitiān qù shàngxué.", vietnamese: "Tôi đi học mỗi ngày.", level: 'A1' },
        { text: "谢谢你！", pinyin: "Xièxiè nǐ!", vietnamese: "Cảm ơn bạn!", level: 'Pre-A1' },
        { text: "今天天气很好。", pinyin: "Jīntiān tiānqì hěn hǎo.", vietnamese: "Hôm nay thời tiết rất đẹp.", level: 'A1' },
        { text: "我们一起玩吧！", pinyin: "Wǒmen yìqǐ wán ba!", vietnamese: "Cùng chơi nhé!", level: 'Pre-A1' },
    ],
};

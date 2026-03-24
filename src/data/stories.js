// Story-based immersive lessons — interactive narratives for language learning
// Inspired by: Lingokids story mode, Duolingo Stories

export const ENGLISH_STORIES = [
    {
        id: 'lost_puppy',
        title: 'Chú chó lạc',
        titleEn: 'The Lost Puppy',
        emoji: '🐶',
        level: 'A1',
        coverColor: '#3B82F6',
        scenes: [
            {
                bg: '🏠',
                narrator: "One day, a little boy named Tom was walking in the park.",
                narratorVi: "Một ngày nọ, cậu bé Tom đang đi dạo trong công viên.",
                image: '🚶‍♂️🌳',
                choices: null,
            },
            {
                bg: '🌳',
                narrator: "He heard a small sound. Woof! Woof!",
                narratorVi: "Cậu bé nghe một tiếng kêu nhỏ. Gâu! Gâu!",
                image: '👂🐕',
                speakPractice: { text: "Woof! Woof!", prompt: "Bắt chước tiếng chó sủa!" },
                choices: null,
            },
            {
                bg: '🌳',
                narrator: "Tom saw a little puppy under a tree. The puppy looked sad.",
                narratorVi: "Tom thấy một chú cún nhỏ dưới gốc cây. Chú cún trông buồn lắm.",
                image: '🐶😢🌲',
                question: {
                    ask: "How does the puppy feel?",
                    askVi: "Chú cún cảm thấy thế nào?",
                    options: [
                        { text: "Happy 😊", correct: false },
                        { text: "Sad 😢", correct: true },
                        { text: "Angry 😠", correct: false },
                    ],
                },
            },
            {
                bg: '🌳',
                narrator: 'Tom said to the puppy:',
                narratorVi: 'Tom nói với chú cún:',
                image: '👦🗣️🐶',
                speakPractice: { text: "Hello puppy! Are you lost?", prompt: "Nói: Hello puppy! Are you lost?" },
                choices: null,
            },
            {
                bg: '🌳',
                narrator: "The puppy wagged its tail. Tom picked up the puppy.",
                narratorVi: "Chú cún vẫy đuôi. Tom bế chú cún lên.",
                image: '🐶💕👦',
                question: {
                    ask: "What did Tom do?",
                    askVi: "Tom đã làm gì?",
                    options: [
                        { text: "He ran away 🏃", correct: false },
                        { text: "He picked up the puppy 🐶", correct: true },
                        { text: "He went home 🏠", correct: false },
                    ],
                },
            },
            {
                bg: '🏡',
                narrator: 'Tom saw a girl looking around. She looked worried.',
                narratorVi: 'Tom thấy một bạn gái đang nhìn quanh. Bạn ấy trông lo lắng.',
                image: '👧😟🔍',
                choices: null,
            },
            {
                bg: '🏡',
                narrator: 'Tom said:',
                narratorVi: 'Tom nói:',
                image: '👦🗣️👧',
                speakPractice: { text: "Is this your puppy?", prompt: "Hỏi: Is this your puppy?" },
                choices: null,
            },
            {
                bg: '🏡',
                narrator: '"Yes! Thank you so much!" said the girl. "My name is Lily!"',
                narratorVi: '"Đúng rồi! Cảm ơn bạn nhiều lắm!" bạn gái nói. "Mình tên Lily!"',
                image: '👧😊🐶💖',
                speakPractice: { text: "You are welcome, Lily!", prompt: "Đáp: You are welcome, Lily!" },
                choices: null,
            },
            {
                bg: '🌅',
                narrator: "Tom and Lily became best friends. They played together every day. The End! 🌟",
                narratorVi: "Tom và Lily trở thành bạn thân. Họ chơi cùng nhau mỗi ngày. Hết! 🌟",
                image: '👦👧🐶🌈',
                choices: null,
            },
        ],
    },
    {
        id: 'magic_garden',
        title: 'Khu vườn kỳ diệu',
        titleEn: 'The Magic Garden',
        emoji: '🌻',
        level: 'A1',
        coverColor: '#10B981',
        scenes: [
            {
                bg: '🏠', narrator: "Little Mei loved flowers. One morning, she found a special seed.",
                narratorVi: "Bé Mei rất thích hoa. Một buổi sáng, bé tìm thấy một hạt giống đặc biệt.",
                image: '👧🌱✨',
            },
            {
                bg: '🌻', narrator: 'Mei planted the seed and said:',
                narratorVi: 'Mei trồng hạt giống và nói:',
                image: '👧🌱🪴',
                speakPractice: { text: "Please grow, little seed!", prompt: "Nói: Please grow, little seed!" },
            },
            {
                bg: '🌧️', narrator: "It rained all night. In the morning, something amazing happened!",
                narratorVi: "Trời mưa suốt đêm. Sáng hôm sau, điều kỳ diệu xảy ra!",
                image: '🌧️🌱💫',
                question: {
                    ask: "What happened to the seed?",
                    askVi: "Chuyện gì xảy ra với hạt giống?",
                    options: [
                        { text: "It grew into a big tree 🌳", correct: true },
                        { text: "Nothing happened ❌", correct: false },
                        { text: "It flew away 🕊️", correct: false },
                    ],
                },
            },
            {
                bg: '🌳', narrator: "A beautiful tree grew tall! It had flowers of every color: red, blue, yellow, and purple!",
                narratorVi: "Một cây đẹp mọc cao! Cây có hoa đủ màu: đỏ, xanh, vàng và tím!",
                image: '🌳🌸🌺🌻💜',
                speakPractice: { text: "Red, blue, yellow, purple!", prompt: "Nói tên các màu!" },
            },
            {
                bg: '🦋', narrator: "Butterflies came to the garden. Birds sang in the tree. All the children came to play!",
                narratorVi: "Bướm bay đến khu vườn. Chim hót trên cây. Tất cả các bạn nhỏ đều đến chơi!",
                image: '🦋🐦👧👦🌈',
            },
            {
                bg: '🌅', narrator: '"This is the most beautiful garden!" said Mei. And she took care of it every day. The End! 🌟',
                narratorVi: '"Đây là khu vườn đẹp nhất!" Mei nói. Và bé chăm sóc nó mỗi ngày. Hết! 🌟',
                image: '👧🌻💖✨',
                speakPractice: { text: "This is the most beautiful garden!", prompt: "Nói: This is the most beautiful garden!" },
            },
        ],
    },
];

export const CHINESE_STORIES = [
    {
        id: 'xiao_mao',
        title: 'Chú mèo nhỏ',
        titleCn: '小猫咪',
        emoji: '🐱',
        level: 'A1',
        coverColor: '#EF4444',
        scenes: [
            {
                bg: '🏠', narrator: "小明有一只小猫。", pinyin: "Xiǎo Míng yǒu yì zhī xiǎo māo.",
                narratorVi: "Tiểu Minh có một chú mèo nhỏ.", image: '👦🐱',
            },
            {
                bg: '🐱', narrator: '小猫很可爱。小明叫它"花花"。', pinyin: 'Xiǎo māo hěn kě\'ài. Xiǎo Míng jiào tā "Huā Huā".',
                narratorVi: 'Chú mèo rất dễ thương. Tiểu Minh gọi nó là "Hoa Hoa".', image: '🐱💕',
                speakPractice: { text: "花花，你好！", prompt: "Nói: 花花，你好！(Huā Huā, nǐ hǎo!)" },
            },
            {
                bg: '🐱', narrator: "花花喜欢吃鱼。", pinyin: "Huā Huā xǐhuān chī yú.",
                narratorVi: "Hoa Hoa thích ăn cá.", image: '🐱🐟',
                question: {
                    ask: "花花喜欢吃什么？", askVi: "Hoa Hoa thích ăn gì?",
                    options: [
                        { text: "鱼 (cá) 🐟", correct: true },
                        { text: "饭 (cơm) 🍚", correct: false },
                        { text: "面 (mì) 🍜", correct: false },
                    ],
                },
            },
            {
                bg: '☀️', narrator: "有一天，花花跑出去了！小明很着急。", pinyin: "Yǒu yì tiān, Huā Huā pǎo chū qù le! Xiǎo Míng hěn zhāojí.",
                narratorVi: "Một ngày, Hoa Hoa chạy ra ngoài! Tiểu Minh rất lo lắng.", image: '🐱🏃💨',
            },
            {
                bg: '🌳', narrator: '小明叫：', pinyin: 'Xiǎo Míng jiào:',
                narratorVi: 'Tiểu Minh gọi:', image: '👦📢',
                speakPractice: { text: "花花！你在哪里？", prompt: "Gọi: 花花！你在哪里？(Huā Huā! Nǐ zài nǎlǐ?)" },
            },
            {
                bg: '🌳', narrator: "喵！花花在树上！小明把花花抱下来了。", pinyin: "Miāo! Huā Huā zài shù shang! Xiǎo Míng bǎ Huā Huā bào xià lái le.",
                narratorVi: "Meo! Hoa Hoa ở trên cây! Tiểu Minh bế Hoa Hoa xuống.", image: '🐱🌲→👦🐱',
            },
            {
                bg: '🏠', narrator: '小明说："花花，别再跑了！我爱你！"完！🌟', pinyin: 'Xiǎo Míng shuō: "Huā Huā, bié zài pǎo le! Wǒ ài nǐ!" Wán!',
                narratorVi: 'Tiểu Minh nói: "Hoa Hoa, đừng chạy nữa nhé! Anh yêu em!" Hết! 🌟', image: '👦🐱💖',
                speakPractice: { text: "我爱你，花花！", prompt: "Nói: 我爱你，花花！(Wǒ ài nǐ, Huā Huā!)" },
            },
        ],
    },
];

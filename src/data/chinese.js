// Chinese (Mandarin) Curriculum — 50+ vocabulary items organized by theme
// Each word has: character, pinyin, tone (1-4), vietnamese, emoji, difficulty (1-3)
// Tone colors: T1=red, T2=green, T3=blue, T4=purple, T0(neutral)=gray

export const TONE_COLORS = {
    1: '#EF4444', // red — flat high
    2: '#10B981', // green — rising
    3: '#3B82F6', // blue — dipping
    4: '#8B5CF6', // purple — falling
    0: '#94A3B8', // gray — neutral
};

export const TONE_NAMES = {
    1: 'Thanh 1 — Cao đều',
    2: 'Thanh 2 — Lên',
    3: 'Thanh 3 — Xuống rồi lên',
    4: 'Thanh 4 — Xuống mạnh',
    0: 'Thanh nhẹ',
};

export const CHINESE_TOPICS = [
    {
        id: 'greetings_cn',
        title: 'Chào hỏi',
        titleCn: '打招呼',
        emoji: '👋',
        color: '#EF4444',
        words: [
            { character: '你好', pinyin: 'nǐ hǎo', tones: [3, 3], vietnamese: 'Xin chào', emoji: '👋', difficulty: 1 },
            { character: '再见', pinyin: 'zài jiàn', tones: [4, 4], vietnamese: 'Tạm biệt', emoji: '🤚', difficulty: 1 },
            { character: '谢谢', pinyin: 'xiè xiè', tones: [4, 4], vietnamese: 'Cảm ơn', emoji: '🙏', difficulty: 1 },
            { character: '对不起', pinyin: 'duì bu qǐ', tones: [4, 0, 3], vietnamese: 'Xin lỗi', emoji: '😔', difficulty: 2 },
            { character: '早上好', pinyin: 'zǎo shang hǎo', tones: [3, 0, 3], vietnamese: 'Chào buổi sáng', emoji: '🌅', difficulty: 2 },
            { character: '晚安', pinyin: 'wǎn ān', tones: [3, 1], vietnamese: 'Chúc ngủ ngon', emoji: '🌙', difficulty: 2 },
            { character: '是', pinyin: 'shì', tones: [4], vietnamese: 'Đúng / Có', emoji: '✅', difficulty: 1 },
            { character: '不', pinyin: 'bù', tones: [4], vietnamese: 'Không', emoji: '❌', difficulty: 1 },
        ]
    },
    {
        id: 'colors_cn',
        title: 'Màu sắc',
        titleCn: '颜色',
        emoji: '🎨',
        color: '#EC4899',
        words: [
            { character: '红', pinyin: 'hóng', tones: [2], vietnamese: 'Đỏ', emoji: '🔴', difficulty: 1 },
            { character: '蓝', pinyin: 'lán', tones: [2], vietnamese: 'Xanh dương', emoji: '🔵', difficulty: 1 },
            { character: '黄', pinyin: 'huáng', tones: [2], vietnamese: 'Vàng', emoji: '🟡', difficulty: 1 },
            { character: '绿', pinyin: 'lǜ', tones: [4], vietnamese: 'Xanh lá', emoji: '🟢', difficulty: 1 },
            { character: '白', pinyin: 'bái', tones: [2], vietnamese: 'Trắng', emoji: '⚪', difficulty: 1 },
            { character: '黑', pinyin: 'hēi', tones: [1], vietnamese: 'Đen', emoji: '⚫', difficulty: 1 },
            { character: '粉', pinyin: 'fěn', tones: [3], vietnamese: 'Hồng', emoji: '🩷', difficulty: 2 },
            { character: '紫', pinyin: 'zǐ', tones: [3], vietnamese: 'Tím', emoji: '🟣', difficulty: 2 },
        ]
    },
    {
        id: 'numbers_cn',
        title: 'Số đếm',
        titleCn: '数字',
        emoji: '🔢',
        color: '#F59E0B',
        words: [
            { character: '一', pinyin: 'yī', tones: [1], vietnamese: 'Một', emoji: '1️⃣', difficulty: 1 },
            { character: '二', pinyin: 'èr', tones: [4], vietnamese: 'Hai', emoji: '2️⃣', difficulty: 1 },
            { character: '三', pinyin: 'sān', tones: [1], vietnamese: 'Ba', emoji: '3️⃣', difficulty: 1 },
            { character: '四', pinyin: 'sì', tones: [4], vietnamese: 'Bốn', emoji: '4️⃣', difficulty: 1 },
            { character: '五', pinyin: 'wǔ', tones: [3], vietnamese: 'Năm', emoji: '5️⃣', difficulty: 1 },
            { character: '六', pinyin: 'liù', tones: [4], vietnamese: 'Sáu', emoji: '6️⃣', difficulty: 1 },
            { character: '七', pinyin: 'qī', tones: [1], vietnamese: 'Bảy', emoji: '7️⃣', difficulty: 2 },
            { character: '八', pinyin: 'bā', tones: [1], vietnamese: 'Tám', emoji: '8️⃣', difficulty: 2 },
            { character: '九', pinyin: 'jiǔ', tones: [3], vietnamese: 'Chín', emoji: '9️⃣', difficulty: 2 },
            { character: '十', pinyin: 'shí', tones: [2], vietnamese: 'Mười', emoji: '🔟', difficulty: 2 },
        ]
    },
    {
        id: 'animals_cn',
        title: 'Động vật',
        titleCn: '动物',
        emoji: '🐾',
        color: '#10B981',
        words: [
            { character: '狗', pinyin: 'gǒu', tones: [3], vietnamese: 'Con chó', emoji: '🐶', difficulty: 1 },
            { character: '猫', pinyin: 'māo', tones: [1], vietnamese: 'Con mèo', emoji: '🐱', difficulty: 1 },
            { character: '鸟', pinyin: 'niǎo', tones: [3], vietnamese: 'Con chim', emoji: '🐦', difficulty: 1 },
            { character: '鱼', pinyin: 'yú', tones: [2], vietnamese: 'Con cá', emoji: '🐟', difficulty: 1 },
            { character: '兔', pinyin: 'tù', tones: [4], vietnamese: 'Con thỏ', emoji: '🐰', difficulty: 2 },
            { character: '象', pinyin: 'xiàng', tones: [4], vietnamese: 'Con voi', emoji: '🐘', difficulty: 2 },
            { character: '猴', pinyin: 'hóu', tones: [2], vietnamese: 'Con khỉ', emoji: '🐵', difficulty: 2 },
            { character: '熊猫', pinyin: 'xióng māo', tones: [2, 1], vietnamese: 'Gấu trúc', emoji: '🐼', difficulty: 3 },
        ]
    },
    {
        id: 'family_cn',
        title: 'Gia đình',
        titleCn: '家人',
        emoji: '👨‍👩‍👦',
        color: '#8B5CF6',
        words: [
            { character: '妈妈', pinyin: 'mā ma', tones: [1, 0], vietnamese: 'Mẹ', emoji: '👩', difficulty: 1 },
            { character: '爸爸', pinyin: 'bà ba', tones: [4, 0], vietnamese: 'Ba / Bố', emoji: '👨', difficulty: 1 },
            { character: '哥哥', pinyin: 'gē ge', tones: [1, 0], vietnamese: 'Anh trai', emoji: '👦', difficulty: 2 },
            { character: '姐姐', pinyin: 'jiě jie', tones: [3, 0], vietnamese: 'Chị gái', emoji: '👧', difficulty: 2 },
            { character: '弟弟', pinyin: 'dì di', tones: [4, 0], vietnamese: 'Em trai', emoji: '👦', difficulty: 2 },
            { character: '奶奶', pinyin: 'nǎi nai', tones: [3, 0], vietnamese: 'Bà (nội)', emoji: '👵', difficulty: 2 },
            { character: '爷爷', pinyin: 'yé ye', tones: [2, 0], vietnamese: 'Ông (nội)', emoji: '👴', difficulty: 2 },
        ]
    },
    {
        id: 'food_cn',
        title: 'Đồ ăn',
        titleCn: '食物',
        emoji: '🍎',
        color: '#EF4444',
        words: [
            { character: '苹果', pinyin: 'píng guǒ', tones: [2, 3], vietnamese: 'Quả táo', emoji: '🍎', difficulty: 1 },
            { character: '香蕉', pinyin: 'xiāng jiāo', tones: [1, 1], vietnamese: 'Quả chuối', emoji: '🍌', difficulty: 2 },
            { character: '米饭', pinyin: 'mǐ fàn', tones: [3, 4], vietnamese: 'Cơm', emoji: '🍚', difficulty: 1 },
            { character: '水', pinyin: 'shuǐ', tones: [3], vietnamese: 'Nước', emoji: '💧', difficulty: 1 },
            { character: '牛奶', pinyin: 'niú nǎi', tones: [2, 3], vietnamese: 'Sữa bò', emoji: '🥛', difficulty: 2 },
            { character: '鸡蛋', pinyin: 'jī dàn', tones: [1, 4], vietnamese: 'Trứng gà', emoji: '🥚', difficulty: 2 },
            { character: '蛋糕', pinyin: 'dàn gāo', tones: [4, 1], vietnamese: 'Bánh kem', emoji: '🎂', difficulty: 2 },
            { character: '冰淇淋', pinyin: 'bīng qí lín', tones: [1, 2, 2], vietnamese: 'Kem', emoji: '🍦', difficulty: 3 },
        ]
    },
];

export const ALL_CHINESE_WORDS = CHINESE_TOPICS.flatMap(topic =>
    topic.words.map(w => ({ ...w, topicId: topic.id, topicTitle: topic.title }))
);

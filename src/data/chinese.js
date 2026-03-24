// Chinese Mandarin Curriculum — Comprehensive HSK1/YCT1 vocabulary
// 12 topics, 130+ words — with pinyin, tones, characters
// Reference: YCT Level 1-2, HSK 1, Lingokids CN, ChinesePod

// Tone colors: T1(red) T2(green) T3(blue) T4(purple) T0(gray)
function toneColor(pinyin) {
    if (/[āēīōūǖ]/.test(pinyin)) return '#EF4444'; // T1 red
    if (/[áéíóúǘ]/.test(pinyin)) return '#22C55E'; // T2 green
    if (/[ǎěǐǒǔǚ]/.test(pinyin)) return '#3B82F6'; // T3 blue
    if (/[àèìòùǜ]/.test(pinyin)) return '#8B5CF6'; // T4 purple
    return '#94A3B8'; // neutral
}

export { toneColor };

// Tone color map (indexed by tone number) for LessonChinese compatibility
export const TONE_COLORS = {
    1: '#EF4444',
    2: '#22C55E',
    3: '#3B82F6',
    4: '#8B5CF6',
    0: '#94A3B8',
};

export const CHINESE_TOPICS = [
    {
        id: 'greetings_cn', title: 'Chào hỏi', emoji: '👋', color: '#EF4444',
        words: [
            { character: '你好', pinyin: 'nǐ hǎo', vietnamese: 'Xin chào', emoji: '👋' },
            { character: '早上好', pinyin: 'zǎoshang hǎo', vietnamese: 'Chào buổi sáng', emoji: '🌅' },
            { character: '晚上好', pinyin: 'wǎnshang hǎo', vietnamese: 'Chào buổi tối', emoji: '🌙' },
            { character: '谢谢', pinyin: 'xièxiè', vietnamese: 'Cảm ơn', emoji: '🙏' },
            { character: '不客气', pinyin: 'bú kèqì', vietnamese: 'Không có gì', emoji: '😊' },
            { character: '对不起', pinyin: 'duìbuqǐ', vietnamese: 'Xin lỗi', emoji: '😔' },
            { character: '没关系', pinyin: 'méi guānxì', vietnamese: 'Không sao', emoji: '👌' },
            { character: '再见', pinyin: 'zàijiàn', vietnamese: 'Tạm biệt', emoji: '👋' },
            { character: '请', pinyin: 'qǐng', vietnamese: 'Xin / Mời', emoji: '🤲' },
            { character: '你好吗', pinyin: 'nǐ hǎo ma', vietnamese: 'Bạn khỏe không?', emoji: '😊' },
            { character: '很好', pinyin: 'hěn hǎo', vietnamese: 'Rất tốt', emoji: '😄' },
        ],
    },
    {
        id: 'numbers_cn', title: 'Số đếm', emoji: '🔢', color: '#F59E0B',
        words: [
            { character: '一', pinyin: 'yī', vietnamese: 'Một', emoji: '1️⃣' },
            { character: '二', pinyin: 'èr', vietnamese: 'Hai', emoji: '2️⃣' },
            { character: '三', pinyin: 'sān', vietnamese: 'Ba', emoji: '3️⃣' },
            { character: '四', pinyin: 'sì', vietnamese: 'Bốn', emoji: '4️⃣' },
            { character: '五', pinyin: 'wǔ', vietnamese: 'Năm', emoji: '5️⃣' },
            { character: '六', pinyin: 'liù', vietnamese: 'Sáu', emoji: '6️⃣' },
            { character: '七', pinyin: 'qī', vietnamese: 'Bảy', emoji: '7️⃣' },
            { character: '八', pinyin: 'bā', vietnamese: 'Tám', emoji: '8️⃣' },
            { character: '九', pinyin: 'jiǔ', vietnamese: 'Chín', emoji: '9️⃣' },
            { character: '十', pinyin: 'shí', vietnamese: 'Mười', emoji: '🔟' },
            { character: '百', pinyin: 'bǎi', vietnamese: 'Trăm', emoji: '💯' },
        ],
    },
    {
        id: 'colors_cn', title: 'Màu sắc', emoji: '🎨', color: '#EC4899',
        words: [
            { character: '红色', pinyin: 'hóngsè', vietnamese: 'Đỏ', emoji: '🔴' },
            { character: '蓝色', pinyin: 'lánsè', vietnamese: 'Xanh dương', emoji: '🔵' },
            { character: '绿色', pinyin: 'lǜsè', vietnamese: 'Xanh lá', emoji: '🟢' },
            { character: '黄色', pinyin: 'huángsè', vietnamese: 'Vàng', emoji: '🟡' },
            { character: '白色', pinyin: 'báisè', vietnamese: 'Trắng', emoji: '⚪' },
            { character: '黑色', pinyin: 'hēisè', vietnamese: 'Đen', emoji: '⚫' },
            { character: '紫色', pinyin: 'zǐsè', vietnamese: 'Tím', emoji: '🟣' },
            { character: '粉色', pinyin: 'fěnsè', vietnamese: 'Hồng', emoji: '💖' },
            { character: '橙色', pinyin: 'chéngsè', vietnamese: 'Cam', emoji: '🟠' },
        ],
    },
    {
        id: 'animals_cn', title: 'Động vật', emoji: '🐘', color: '#10B981',
        words: [
            { character: '狗', pinyin: 'gǒu', vietnamese: 'Con chó', emoji: '🐕' },
            { character: '猫', pinyin: 'māo', vietnamese: 'Con mèo', emoji: '🐱' },
            { character: '鱼', pinyin: 'yú', vietnamese: 'Con cá', emoji: '🐟' },
            { character: '鸟', pinyin: 'niǎo', vietnamese: 'Con chim', emoji: '🐦' },
            { character: '兔子', pinyin: 'tùzi', vietnamese: 'Con thỏ', emoji: '🐰' },
            { character: '大象', pinyin: 'dàxiàng', vietnamese: 'Con voi', emoji: '🐘' },
            { character: '狮子', pinyin: 'shīzi', vietnamese: 'Sư tử', emoji: '🦁' },
            { character: '猴子', pinyin: 'hóuzi', vietnamese: 'Con khỉ', emoji: '🐒' },
            { character: '熊', pinyin: 'xióng', vietnamese: 'Con gấu', emoji: '🐻' },
            { character: '老虎', pinyin: 'lǎohǔ', vietnamese: 'Con hổ', emoji: '🐯' },
            { character: '马', pinyin: 'mǎ', vietnamese: 'Con ngựa', emoji: '🐴' },
            { character: '牛', pinyin: 'niú', vietnamese: 'Con bò', emoji: '🐄' },
            { character: '鸡', pinyin: 'jī', vietnamese: 'Con gà', emoji: '🐔' },
            { character: '龙', pinyin: 'lóng', vietnamese: 'Con rồng', emoji: '🐲' },
            { character: '蝴蝶', pinyin: 'húdié', vietnamese: 'Con bướm', emoji: '🦋' },
        ],
    },
    {
        id: 'family_cn', title: 'Gia đình', emoji: '👨‍👩‍👦', color: '#8B5CF6',
        words: [
            { character: '妈妈', pinyin: 'māma', vietnamese: 'Mẹ', emoji: '👩' },
            { character: '爸爸', pinyin: 'bàba', vietnamese: 'Ba / Bố', emoji: '👨' },
            { character: '姐姐', pinyin: 'jiějie', vietnamese: 'Chị gái', emoji: '👧' },
            { character: '哥哥', pinyin: 'gēge', vietnamese: 'Anh trai', emoji: '👦' },
            { character: '弟弟', pinyin: 'dìdi', vietnamese: 'Em trai', emoji: '🧒' },
            { character: '妹妹', pinyin: 'mèimei', vietnamese: 'Em gái', emoji: '👧' },
            { character: '奶奶', pinyin: 'nǎinai', vietnamese: 'Bà nội', emoji: '👵' },
            { character: '爷爷', pinyin: 'yéye', vietnamese: 'Ông nội', emoji: '👴' },
            { character: '家', pinyin: 'jiā', vietnamese: 'Nhà / Gia đình', emoji: '🏠' },
            { character: '宝宝', pinyin: 'bǎobao', vietnamese: 'Em bé', emoji: '👶' },
        ],
    },
    {
        id: 'food_cn', title: 'Đồ ăn', emoji: '🍜', color: '#EF4444',
        words: [
            { character: '米饭', pinyin: 'mǐfàn', vietnamese: 'Cơm', emoji: '🍚' },
            { character: '面条', pinyin: 'miàntiáo', vietnamese: 'Mì', emoji: '🍜' },
            { character: '包子', pinyin: 'bāozi', vietnamese: 'Bánh bao', emoji: '🥟' },
            { character: '饺子', pinyin: 'jiǎozi', vietnamese: 'Sủi cảo', emoji: '🥟' },
            { character: '鸡蛋', pinyin: 'jīdàn', vietnamese: 'Trứng', emoji: '🥚' },
            { character: '牛奶', pinyin: 'niúnǎi', vietnamese: 'Sữa', emoji: '🥛' },
            { character: '水', pinyin: 'shuǐ', vietnamese: 'Nước', emoji: '💧' },
            { character: '果汁', pinyin: 'guǒzhī', vietnamese: 'Nước ép', emoji: '🧃' },
            { character: '蛋糕', pinyin: 'dàngāo', vietnamese: 'Bánh kem', emoji: '🎂' },
            { character: '冰淇淋', pinyin: 'bīngqílín', vietnamese: 'Kem', emoji: '🍦' },
            { character: '糖', pinyin: 'táng', vietnamese: 'Kẹo / Đường', emoji: '🍬' },
        ],
    },
    {
        id: 'fruits_cn', title: 'Trái cây', emoji: '🍎', color: '#22C55E',
        words: [
            { character: '苹果', pinyin: 'píngguǒ', vietnamese: 'Táo', emoji: '🍎' },
            { character: '香蕉', pinyin: 'xiāngjiāo', vietnamese: 'Chuối', emoji: '🍌' },
            { character: '橙子', pinyin: 'chéngzi', vietnamese: 'Cam', emoji: '🍊' },
            { character: '葡萄', pinyin: 'pútao', vietnamese: 'Nho', emoji: '🍇' },
            { character: '草莓', pinyin: 'cǎoméi', vietnamese: 'Dâu tây', emoji: '🍓' },
            { character: '西瓜', pinyin: 'xīguā', vietnamese: 'Dưa hấu', emoji: '🍉' },
            { character: '芒果', pinyin: 'mángguǒ', vietnamese: 'Xoài', emoji: '🥭' },
            { character: '桃子', pinyin: 'táozi', vietnamese: 'Đào', emoji: '🍑' },
            { character: '柠檬', pinyin: 'níngméng', vietnamese: 'Chanh', emoji: '🍋' },
            { character: '椰子', pinyin: 'yēzi', vietnamese: 'Dừa', emoji: '🥥' },
        ],
    },
    {
        id: 'body_cn', title: 'Cơ thể', emoji: '🦶', color: '#6366F1',
        words: [
            { character: '头', pinyin: 'tóu', vietnamese: 'Đầu', emoji: '🗣️' },
            { character: '眼睛', pinyin: 'yǎnjīng', vietnamese: 'Mắt', emoji: '👀' },
            { character: '鼻子', pinyin: 'bízi', vietnamese: 'Mũi', emoji: '👃' },
            { character: '嘴巴', pinyin: 'zuǐba', vietnamese: 'Miệng', emoji: '👄' },
            { character: '耳朵', pinyin: 'ěrduo', vietnamese: 'Tai', emoji: '👂' },
            { character: '手', pinyin: 'shǒu', vietnamese: 'Tay', emoji: '🤲' },
            { character: '脚', pinyin: 'jiǎo', vietnamese: 'Chân', emoji: '🦶' },
            { character: '心', pinyin: 'xīn', vietnamese: 'Trái tim', emoji: '❤️' },
            { character: '牙齿', pinyin: 'yáchǐ', vietnamese: 'Răng', emoji: '🦷' },
            { character: '头发', pinyin: 'tóufa', vietnamese: 'Tóc', emoji: '💇' },
        ],
    },
    {
        id: 'school_cn', title: 'Trường học', emoji: '🏫', color: '#A855F7',
        words: [
            { character: '学校', pinyin: 'xuéxiào', vietnamese: 'Trường', emoji: '🏫' },
            { character: '老师', pinyin: 'lǎoshī', vietnamese: 'Thầy/Cô giáo', emoji: '👩‍🏫' },
            { character: '学生', pinyin: 'xuéshēng', vietnamese: 'Học sinh', emoji: '🧑‍🎓' },
            { character: '书', pinyin: 'shū', vietnamese: 'Sách', emoji: '📖' },
            { character: '笔', pinyin: 'bǐ', vietnamese: 'Bút', emoji: '✏️' },
            { character: '桌子', pinyin: 'zhuōzi', vietnamese: 'Bàn', emoji: '🪑' },
            { character: '椅子', pinyin: 'yǐzi', vietnamese: 'Ghế', emoji: '💺' },
            { character: '作业', pinyin: 'zuòyè', vietnamese: 'Bài tập', emoji: '📝' },
            { character: '上课', pinyin: 'shàngkè', vietnamese: 'Đi học / Lên lớp', emoji: '📚' },
            { character: '下课', pinyin: 'xiàkè', vietnamese: 'Kết thúc tiết học', emoji: '🔔' },
        ],
    },
    {
        id: 'nature_cn', title: 'Thiên nhiên', emoji: '🌍', color: '#059669',
        words: [
            { character: '太阳', pinyin: 'tàiyáng', vietnamese: 'Mặt trời', emoji: '☀️' },
            { character: '月亮', pinyin: 'yuèliang', vietnamese: 'Mặt trăng', emoji: '🌙' },
            { character: '星星', pinyin: 'xīngxīng', vietnamese: 'Ngôi sao', emoji: '⭐' },
            { character: '天', pinyin: 'tiān', vietnamese: 'Trời', emoji: '🌤️' },
            { character: '树', pinyin: 'shù', vietnamese: 'Cây', emoji: '🌳' },
            { character: '花', pinyin: 'huā', vietnamese: 'Hoa', emoji: '🌸' },
            { character: '山', pinyin: 'shān', vietnamese: 'Núi', emoji: '⛰️' },
            { character: '河', pinyin: 'hé', vietnamese: 'Sông', emoji: '🏞️' },
            { character: '海', pinyin: 'hǎi', vietnamese: 'Biển', emoji: '🌊' },
            { character: '雨', pinyin: 'yǔ', vietnamese: 'Mưa', emoji: '🌧️' },
            { character: '风', pinyin: 'fēng', vietnamese: 'Gió', emoji: '💨' },
            { character: '草', pinyin: 'cǎo', vietnamese: 'Cỏ', emoji: '🌿' },
        ],
    },
    {
        id: 'actions_cn', title: 'Hành động', emoji: '🏃', color: '#14B8A6',
        words: [
            { character: '吃', pinyin: 'chī', vietnamese: 'Ăn', emoji: '🍽️' },
            { character: '喝', pinyin: 'hē', vietnamese: 'Uống', emoji: '🥤' },
            { character: '跑', pinyin: 'pǎo', vietnamese: 'Chạy', emoji: '🏃' },
            { character: '跳', pinyin: 'tiào', vietnamese: 'Nhảy', emoji: '🦘' },
            { character: '走', pinyin: 'zǒu', vietnamese: 'Đi', emoji: '🚶' },
            { character: '看', pinyin: 'kàn', vietnamese: 'Nhìn / Xem', emoji: '👀' },
            { character: '听', pinyin: 'tīng', vietnamese: 'Nghe', emoji: '👂' },
            { character: '说', pinyin: 'shuō', vietnamese: 'Nói', emoji: '🗣️' },
            { character: '读', pinyin: 'dú', vietnamese: 'Đọc', emoji: '📖' },
            { character: '写', pinyin: 'xiě', vietnamese: 'Viết', emoji: '✍️' },
            { character: '画', pinyin: 'huà', vietnamese: 'Vẽ', emoji: '🎨' },
            { character: '玩', pinyin: 'wán', vietnamese: 'Chơi', emoji: '⚽' },
            { character: '睡觉', pinyin: 'shuìjiào', vietnamese: 'Ngủ', emoji: '😴' },
            { character: '唱歌', pinyin: 'chànggē', vietnamese: 'Hát', emoji: '🎤' },
        ],
    },
    {
        id: 'emotions_cn', title: 'Cảm xúc', emoji: '😊', color: '#EAB308',
        words: [
            { character: '高兴', pinyin: 'gāoxìng', vietnamese: 'Vui vẻ', emoji: '😊' },
            { character: '难过', pinyin: 'nánguò', vietnamese: 'Buồn', emoji: '😢' },
            { character: '生气', pinyin: 'shēngqì', vietnamese: 'Tức giận', emoji: '😠' },
            { character: '害怕', pinyin: 'hàipà', vietnamese: 'Sợ hãi', emoji: '😨' },
            { character: '累', pinyin: 'lèi', vietnamese: 'Mệt', emoji: '😴' },
            { character: '饿', pinyin: 'è', vietnamese: 'Đói', emoji: '🤤' },
            { character: '渴', pinyin: 'kě', vietnamese: 'Khát', emoji: '💧' },
            { character: '爱', pinyin: 'ài', vietnamese: 'Yêu', emoji: '❤️' },
            { character: '喜欢', pinyin: 'xǐhuān', vietnamese: 'Thích', emoji: '😍' },
            { character: '勇敢', pinyin: 'yǒnggǎn', vietnamese: 'Dũng cảm', emoji: '💪' },
        ],
    },
    {
        id: 'military', title: '军队 (Quân đội)', emoji: '🎖️', color: '#166534',
        words: [
            { character: '军人', pinyin: 'jūnrén', vietnamese: 'Quân nhân', emoji: '🪖' },
            { character: '军队', pinyin: 'jūnduì', vietnamese: 'Quân đội', emoji: '🎖️' },
            { character: '海军', pinyin: 'hǎijūn', vietnamese: 'Hải quân', emoji: '⚓' },
            { character: '空军', pinyin: 'kōngjūn', vietnamese: 'Không quân', emoji: '✈️' },
            { character: '陆军', pinyin: 'lùjūn', vietnamese: 'Lục quân', emoji: '🪖' },
            { character: '将军', pinyin: 'jiāngjūn', vietnamese: 'Tướng quân', emoji: '⭐' },
            { character: '坦克', pinyin: 'tǎnkè', vietnamese: 'Xe tăng', emoji: '🪖' },
            { character: '直升机', pinyin: 'zhíshēngjī', vietnamese: 'Trực thăng', emoji: '🚁' },
            { character: '战斗机', pinyin: 'zhàndòujī', vietnamese: 'Máy bay chiến đấu', emoji: '✈️' },
            { character: '军舰', pinyin: 'jūnjiàn', vietnamese: 'Tàu chiến', emoji: '🚢' },
            { character: '潜水艇', pinyin: 'qiánshuǐtǐng', vietnamese: 'Tàu ngầm', emoji: '🤿' },
            { character: '国旗', pinyin: 'guóqí', vietnamese: 'Quốc kỳ', emoji: '🇻🇳' },
            { character: '英雄', pinyin: 'yīngxióng', vietnamese: 'Anh hùng', emoji: '🦸' },
            { character: '和平', pinyin: 'hépíng', vietnamese: 'Hòa bình', emoji: '🕊️' },
            { character: '勇敢', pinyin: 'yǒnggǎn', vietnamese: 'Dũng cảm', emoji: '💪' },
            { character: '保卫', pinyin: 'bǎowèi', vietnamese: 'Bảo vệ', emoji: '🛡️' },
            { character: '胜利', pinyin: 'shènglì', vietnamese: 'Chiến thắng', emoji: '🏆' },
            { character: '独立', pinyin: 'dúlì', vietnamese: 'Độc lập', emoji: '🇻🇳' },
        ],
    },
];

// Flatten all words for games
export const ALL_CHINESE_WORDS = CHINESE_TOPICS.flatMap(topic =>
    topic.words.map(w => ({ ...w, topicId: topic.id }))
);

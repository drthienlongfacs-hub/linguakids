// Chinese Speaking Content — Tone drills, shadowing, conversation practice
// Unique to Chinese: tone pair practice (critical for Mandarin learners)

export const SPEAKING_CN_LESSONS = [
    // === Tone Drills (unique to Chinese) ===
    {
        id: 'tone-drill-basics',
        type: 'tone_drill',
        title: '四声练习 (Luyện 4 thanh)',
        titleVi: 'Luyện 4 thanh cơ bản',
        level: 'A1',
        emoji: '🎵',
        mode: 'kids',
        drills: [
            { char: '妈', pinyin: 'mā', tone: 1, meaning: 'mẹ', tip: 'Thanh 1: cao + bằng phẳng (giống "a" kéo dài)' },
            { char: '麻', pinyin: 'má', tone: 2, meaning: 'tê, gai', tip: 'Thanh 2: từ thấp lên cao (giống hỏi "Hả?")' },
            { char: '马', pinyin: 'mǎ', tone: 3, meaning: 'ngựa', tip: 'Thanh 3: xuống rồi lên (giống ngạc nhiên "Ồ!")' },
            { char: '骂', pinyin: 'mà', tone: 4, meaning: 'mắng', tip: 'Thanh 4: từ cao xuống thấp (giống quát "Không!")' },
        ],
        tonePairs: [
            { pair: '1-2', words: [{ chars: '中国', pinyin: 'Zhōngguó', meaning: 'Trung Quốc' }, { chars: '今天', pinyin: 'jīntiān', meaning: 'hôm nay' }] },
            { pair: '2-4', words: [{ chars: '学校', pinyin: 'xuéxiào', meaning: 'trường học' }, { chars: '明天', pinyin: 'míngtiān', meaning: 'ngày mai' }] },
            { pair: '3-3', words: [{ chars: '你好', pinyin: 'nǐ hǎo', meaning: 'xin chào' }, { chars: '水果', pinyin: 'shuǐguǒ', meaning: 'trái cây' }] },
            { pair: '4-1', words: [{ chars: '大家', pinyin: 'dàjiā', meaning: 'mọi người' }, { chars: '教师', pinyin: 'jiàoshī', meaning: 'giáo viên' }] },
        ],
    },
    // === Shadowing — Daily conversation ===
    {
        id: 'shadow-daily-cn',
        type: 'shadowing',
        title: '日常对话 (Hội thoại hàng ngày)',
        titleVi: 'Hội thoại hàng ngày',
        level: 'A1',
        emoji: '💬',
        mode: 'kids',
        sentences: [
            { text: '你好！你叫什么名字？', pinyin: 'Nǐ hǎo! Nǐ jiào shénme míngzi?', textVi: 'Xin chào! Bạn tên gì?' },
            { text: '我叫小明。今年七岁。', pinyin: 'Wǒ jiào Xiǎo Míng. Jīnnián qī suì.', textVi: 'Tôi tên Tiểu Minh. Năm nay 7 tuổi.' },
            { text: '你好！很高兴认识你。', pinyin: 'Nǐ hǎo! Hěn gāoxìng rènshí nǐ.', textVi: 'Xin chào! Rất vui được gặp bạn.' },
            { text: '我喜欢吃冰淇淋。', pinyin: 'Wǒ xǐhuān chī bīngqílín.', textVi: 'Tôi thích ăn kem.' },
            { text: '明天不上学，太好了！', pinyin: 'Míngtiān bú shàngxué, tài hǎo le!', textVi: 'Mai không đi học, tuyệt quá!' },
        ],
    },
    // === Shadowing — Travel ===
    {
        id: 'shadow-travel-cn',
        type: 'shadowing',
        title: '旅行对话 (Hội thoại du lịch)',
        titleVi: 'Hội thoại du lịch',
        level: 'A2',
        emoji: '✈️',
        mode: 'adult',
        sentences: [
            { text: '请问，去火车站怎么走？', pinyin: 'Qǐngwèn, qù huǒchēzhàn zěnme zǒu?', textVi: 'Xin hỏi, đi ga tàu hỏa thế nào?' },
            { text: '一张去北京的火车票。', pinyin: 'Yī zhāng qù Běijīng de huǒchē piào.', textVi: 'Một vé tàu đi Bắc Kinh.' },
            { text: '这个多少钱？太贵了，便宜一点吗？', pinyin: 'Zhège duōshǎo qián? Tài guì le, piányi yīdiǎn ma?', textVi: 'Cái này bao nhiêu? Đắt quá, giảm chút được không?' },
            { text: '请问附近有酒店吗？', pinyin: 'Qǐngwèn fùjìn yǒu jiǔdiàn ma?', textVi: 'Xin hỏi gần đây có khách sạn không?' },
            { text: '我想预定一个双人间。', pinyin: 'Wǒ xiǎng yùdìng yīgè shuāngrénjiān.', textVi: 'Tôi muốn đặt phòng đôi.' },
            { text: 'WiFi密码是什么？', pinyin: 'WiFi mìmǎ shì shénme?', textVi: 'Mật khẩu WiFi là gì?' },
        ],
    },
    // === Shadowing — Business ===
    {
        id: 'shadow-business-cn',
        type: 'shadowing',
        title: '商务对话 (Hội thoại kinh doanh)',
        titleVi: 'Hội thoại kinh doanh',
        level: 'B1',
        emoji: '💼',
        mode: 'adult',
        sentences: [
            { text: '您好，请问贵公司的联系方式是什么？', pinyin: 'Nín hǎo, qǐngwèn guì gōngsī de liánxì fāngshì shì shénme?', textVi: 'Xin chào, xin hỏi thông tin liên hệ công ty?' },
            { text: '我们希望和贵公司合作。', pinyin: 'Wǒmen xīwàng hé guì gōngsī hézuò.', textVi: 'Chúng tôi mong muốn hợp tác với quý công ty.' },
            { text: '请问能安排一个会议吗？', pinyin: 'Qǐngwèn néng ānpái yīgè huìyì ma?', textVi: 'Có thể sắp xếp một cuộc họp không?' },
            { text: '合同的条款需要修改。', pinyin: 'Hétóng de tiáokuǎn xūyào xiūgǎi.', textVi: 'Điều khoản hợp đồng cần sửa đổi.' },
            { text: '非常感谢您的支持。期待合作愉快！', pinyin: 'Fēicháng gǎnxiè nín de zhīchí. Qīdài hézuò yúkuài!', textVi: 'Cảm ơn sự hỗ trợ. Mong hợp tác vui vẻ!' },
        ],
    },
    // === Conversation Practice ===
    {
        id: 'convo-self-intro-cn',
        type: 'conversation',
        title: '自我介绍 (Tự giới thiệu)',
        titleVi: 'Tự giới thiệu bản thân',
        level: 'A1',
        emoji: '🙋',
        mode: 'kids',
        prompts: [
            { question: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzi?', questionVi: 'Bạn tên gì?', sampleAnswer: '我叫___。', samplePinyin: 'Wǒ jiào___.' },
            { question: '你今年几岁？', pinyin: 'Nǐ jīnnián jǐ suì?', questionVi: 'Bạn bao nhiêu tuổi?', sampleAnswer: '我今年___岁。', samplePinyin: 'Wǒ jīnnián___suì.' },
            { question: '你喜欢吃什么？', pinyin: 'Nǐ xǐhuān chī shénme?', questionVi: 'Bạn thích ăn gì?', sampleAnswer: '我喜欢吃___。', samplePinyin: 'Wǒ xǐhuān chī___.' },
            { question: '你最喜欢什么颜色？', pinyin: 'Nǐ zuì xǐhuān shénme yánsè?', questionVi: 'Bạn thích màu gì nhất?', sampleAnswer: '我最喜欢___色。', samplePinyin: 'Wǒ zuì xǐhuān___sè.' },
        ],
    },
];

export function getCnSpeakingByMode(mode) {
    if (mode === 'adult') return SPEAKING_CN_LESSONS;
    return SPEAKING_CN_LESSONS.filter(l => l.mode === 'kids' || l.level === 'A1' || l.level === 'A2');
}

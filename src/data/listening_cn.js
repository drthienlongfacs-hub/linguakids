// Chinese Listening Content Library — HSK-inspired lessons
// Structure mirrors listening.js: segments, vocabulary, quiz
// All content with Chinese text + pinyin + Vietnamese translation

export const LISTENING_CN_LESSONS = [
    // ============ A1 Level — Kids ============
    {
        id: 'my-day-chinese',
        title: '我的一天',
        titleVi: 'Một ngày của em (Tiếng Trung)',
        level: 'A1',
        duration: '1:30',
        topic: 'Daily Life',
        emoji: '⏰',
        mode: 'kids',
        segments: [
            {
                id: 1, startTime: 0, endTime: 12,
                text: '大家好！我叫小明。我今年七岁。我住在胡志明市。让我告诉你我的一天！',
                pinyin: 'Dàjiā hǎo! Wǒ jiào Xiǎo Míng. Wǒ jīnnián qī suì. Wǒ zhù zài Hú Zhì Míng shì. Ràng wǒ gàosù nǐ wǒ de yī tiān!',
                textVi: 'Chào mọi người! Mình tên Tiểu Minh. Năm nay mình 7 tuổi. Mình sống ở TP Hồ Chí Minh. Để mình kể một ngày của mình nhé!',
            },
            {
                id: 2, startTime: 12, endTime: 25,
                text: '我每天早上六点半起床。我刷牙，洗脸，穿校服。然后和家人一起吃早饭。我通常吃米饭和鸡蛋。',
                pinyin: 'Wǒ měi tiān zǎoshang liù diǎn bàn qǐchuáng. Wǒ shuā yá, xǐ liǎn, chuān xiàofú. Ránhòu hé jiārén yīqǐ chī zǎofàn.',
                textVi: 'Mình dậy lúc 6:30 mỗi sáng. Mình đánh răng, rửa mặt, mặc đồng phục. Rồi ăn sáng cùng gia đình. Mình thường ăn cơm và trứng.',
            },
            {
                id: 3, startTime: 25, endTime: 40,
                text: '妈妈七点十五分送我上学。七点半开始上课。我学数学、越南语、中文和自然科学。我最喜欢中文课！',
                pinyin: 'Māma qī diǎn shíwǔ fēn sòng wǒ shàngxué. Qī diǎn bàn kāishǐ shàngkè. Wǒ xué shùxué, Yuènányǔ, Zhōngwén hé zìrán kēxué.',
                textVi: 'Mẹ đưa mình đi học lúc 7:15. 7:30 bắt đầu lên lớp. Mình học toán, tiếng Việt, tiếng Trung và khoa học tự nhiên. Mình thích nhất môn tiếng Trung!',
            },
            {
                id: 4, startTime: 40, endTime: 55,
                text: '放学后，我回家做作业。然后和朋友在公园玩。我们喜欢骑自行车和踢足球。九点睡觉。晚安！',
                pinyin: "Fàngxué hòu, wǒ huí jiā zuò zuòyè. Ránhòu hé péngyǒu zài gōngyuán wán. Wǒmen xǐhuān qí zìxíngchē hé tī zúqiú. Jiǔ diǎn shuìjiào. Wǎn\u2019ān!",
                textVi: 'Sau giờ học, mình về nhà làm bài tập. Rồi chơi với bạn ở công viên. Bọn mình thích đạp xe và đá bóng. 9 giờ đi ngủ. Chúc ngủ ngon!',
            },
        ],
        vocabulary: [
            { word: '起床', pinyin: 'qǐchuáng', meaning: 'thức dậy', example: '我六点半起床。' },
            { word: '校服', pinyin: 'xiàofú', meaning: 'đồng phục', example: '穿校服上学。' },
            { word: '放学', pinyin: 'fàngxué', meaning: 'tan trường', example: '放学后做作业。' },
        ],
        quiz: [
            { type: 'mcq', question: '小明几点起床？', options: ['六点', '六点半', '七点', '七点半'], correct: 1 },
            { type: 'mcq', question: '小明最喜欢的科目是什么？', options: ['数学', '自然科学', '中文', '越南语'], correct: 2 },
            { type: 'true_false', question: '小明九点半睡觉。', answer: false, explanation: '小明九点睡觉，不是九点半。' },
        ],
    },
    // ============ HSK 2-3 Level — Everyday ============
    {
        id: 'at-the-restaurant-cn',
        title: '在餐厅点菜',
        titleVi: 'Gọi món ở nhà hàng',
        level: 'A2',
        duration: '2:00',
        topic: 'Dining',
        emoji: '🍜',
        mode: 'adult',
        segments: [
            {
                id: 1, startTime: 0, endTime: 15,
                text: '服务员：欢迎光临！请问几位？\n客人：两位。\n服务员：好的，请跟我来。这是菜单。',
                pinyin: 'Fúwùyuán: Huānyíng guānglín! Qǐngwèn jǐ wèi?\nKèrén: Liǎng wèi.\nFúwùyuán: Hǎo de, qǐng gēn wǒ lái. Zhè shì càidān.',
                textVi: 'Phục vụ: Chào mừng quý khách! Xin hỏi mấy người?\nKhách: Hai người.\nPhục vụ: Được, xin đi theo tôi. Đây là thực đơn.',
            },
            {
                id: 2, startTime: 15, endTime: 35,
                text: '客人：请问有什么特色菜？\n服务员：我们的麻辣火锅和宫保鸡丁很受欢迎。今天的特价菜是糖醋排骨。\n客人：那我要一个宫保鸡丁，一个蛋炒饭。',
                pinyin: 'Kèrén: Qǐngwèn yǒu shénme tèsè cài?\nFúwùyuán: Wǒmen de málà huǒguō hé gōngbǎo jīdīng hěn shòu huānyíng.',
                textVi: 'Khách: Xin hỏi có món đặc sắc gì?\nPhục vụ: Lẩu cay và gà Kung Pao rất được ưa chuộng. Hôm nay sườn xào chua ngọt giá đặc biệt.\nKhách: Vậy tôi muốn một phần gà Kung Pao, một cơm chiên trứng.',
            },
            {
                id: 3, startTime: 35, endTime: 50,
                text: '服务员：好的。要不要来点饮料？\n客人：一杯绿茶和一杯橙汁。\n服务员：辣的可以吗？\n客人：不要太辣，谢谢。',
                pinyin: 'Fúwùyuán: Hǎo de. Yào bú yào lái diǎn yǐnliào?\nKèrén: Yī bēi lǜchá hé yī bēi chéngzhī.',
                textVi: 'Phục vụ: Được. Có muốn đồ uống không?\nKhách: Một trà xanh và một nước cam.\nPhục vụ: Cay được không?\nKhách: Đừng quá cay, cảm ơn.',
            },
            {
                id: 4, startTime: 50, endTime: 65,
                text: '客人：买单，谢谢。一共多少钱？\n服务员：一共一百二十八块。可以用微信支付。\n客人：好的。味道很好，谢谢！',
                pinyin: 'Kèrén: Mǎidān, xièxie. Yīgòng duōshǎo qián?\nFúwùyuán: Yīgòng yībǎi èrshíbā kuài.',
                textVi: 'Khách: Tính tiền, cảm ơn. Tổng bao nhiêu?\nPhục vụ: Tổng cộng 128 tệ. Có thể dùng WeChat Pay.\nKhách: Được. Rất ngon, cảm ơn!',
            },
        ],
        vocabulary: [
            { word: '欢迎光临', pinyin: 'huānyíng guānglín', meaning: 'chào mừng quý khách', example: '欢迎光临我们的餐厅！' },
            { word: '特色菜', pinyin: 'tèsè cài', meaning: 'món đặc sắc', example: '这家的特色菜很好吃。' },
            { word: '宫保鸡丁', pinyin: 'gōngbǎo jīdīng', meaning: 'gà Kung Pao', example: '宫保鸡丁是四川菜。' },
            { word: '买单', pinyin: 'mǎidān', meaning: 'tính tiền', example: '买单，谢谢！' },
        ],
        quiz: [
            { type: 'mcq', question: '餐厅有几位客人？', options: ['一位', '两位', '三位', '四位'], correct: 1 },
            { type: 'mcq', question: '客人点了什么主菜？', options: ['麻辣火锅', '宫保鸡丁', '糖醋排骨', '红烧肉'], correct: 1 },
            { type: 'gap_fill', question: '一共_______块钱。', answer: '一百二十八 / 128', hint: '大于一百' },
            { type: 'true_false', question: '客人要很辣的菜。', answer: false, explanation: '客人说"不要太辣"。' },
        ],
    },
    // ============ HSK 3-4 Level — Travel ============
    {
        id: 'travel-china-cn',
        title: '去中国旅行',
        titleVi: 'Du lịch Trung Quốc',
        level: 'B1',
        duration: '2:30',
        topic: 'Travel',
        emoji: '🇨🇳',
        mode: 'adult',
        segments: [
            {
                id: 1, startTime: 0, endTime: 18,
                text: '你想去中国旅行吗？中国是一个非常美丽的国家，有着五千多年的历史。每年有很多越南游客去中国旅游。',
                pinyin: 'Nǐ xiǎng qù Zhōngguó lǚxíng ma? Zhōngguó shì yīgè fēicháng měilì de guójiā, yǒuzhe wǔqiān duō nián de lìshǐ.',
                textVi: 'Bạn muốn đi du lịch Trung Quốc không? Trung Quốc là đất nước rất đẹp, có hơn 5000 năm lịch sử. Mỗi năm có rất nhiều khách du lịch Việt Nam đến Trung Quốc.',
            },
            {
                id: 2, startTime: 18, endTime: 38,
                text: '北京是中国的首都。在北京，你可以参观长城、故宫和天安门广场。长城是世界七大奇迹之一，每年有几百万游客来参观。建议你早上去，因为下午人太多了。',
                pinyin: 'Běijīng shì Zhōngguó de shǒudū. Zài Běijīng, nǐ kěyǐ cānguān Chángchéng, Gùgōng hé Tiān\'ānmén guǎngchǎng.',
                textVi: 'Bắc Kinh là thủ đô Trung Quốc. Ở Bắc Kinh, bạn có thể tham quan Vạn Lý Trường Thành, Tử Cấm Thành và quảng trường Thiên An Môn. Trường Thành là một trong 7 kỳ quan thế giới.',
            },
            {
                id: 3, startTime: 38, endTime: 58,
                text: '上海是中国最大的城市。外滩的夜景非常漂亮。你还可以去迪士尼乐园玩。如果你喜欢自然风景，可以去桂林看山水画一样的风景，或者去四川看大熊猫。',
                pinyin: 'Shànghǎi shì Zhōngguó zuì dà de chéngshì. Wàitān de yèjǐng fēicháng piàoliang.',
                textVi: 'Thượng Hải là thành phố lớn nhất Trung Quốc. Cảnh đêm ở Bến Thượng Hải rất đẹp. Nếu thích phong cảnh thiên nhiên, bạn có thể đi Quế Lâm ngắm sơn thủy, hoặc đi Tứ Xuyên xem gấu trúc.',
            },
            {
                id: 4, startTime: 58, endTime: 78,
                text: '旅行小提示：一，办好签证再出发。二，下载一个翻译App，因为不是所有地方都说英语。三，可以用支付宝或微信支付——在中国很少用现金。四，试试各地的特色小吃，你一定会爱上中国美食！',
                pinyin: 'Lǚxíng xiǎo tíshì: Yī, bàn hǎo qiānzhèng zài chūfā. Èr, xiàzǎi yīgè fānyì App.',
                textVi: 'Mẹo du lịch: 1, làm visa trước khi đi. 2, tải app phiên dịch vì không phải nơi nào cũng nói tiếng Anh. 3, dùng Alipay hoặc WeChat Pay — ở TQ ít dùng tiền mặt. 4, thử ẩm thực các vùng!',
            },
        ],
        vocabulary: [
            { word: '首都', pinyin: 'shǒudū', meaning: 'thủ đô', example: '北京是中国的首都。' },
            { word: '长城', pinyin: 'chángchéng', meaning: 'Vạn Lý Trường Thành', example: '长城是世界奇迹。' },
            { word: '景点', pinyin: 'jǐngdiǎn', meaning: 'điểm du lịch', example: '这个景点很有名。' },
            { word: '签证', pinyin: 'qiānzhèng', meaning: 'visa', example: '先办签证再出发。' },
            { word: '特色小吃', pinyin: 'tèsè xiǎochī', meaning: 'món ăn vặt đặc sắc', example: '每个城市有不同的特色小吃。' },
        ],
        quiz: [
            { type: 'mcq', question: '中国的首都是哪里？', options: ['上海', '北京', '广州', '成都'], correct: 1 },
            { type: 'mcq', question: '中国最大的城市是哪个？', options: ['北京', '广州', '上海', '深圳'], correct: 2 },
            { type: 'gap_fill', question: '长城是世界_______大奇迹之一。', answer: '七 / 7', hint: '一个数字' },
            { type: 'true_false', question: '在中国经常用现金。', answer: false, explanation: '在中国很少用现金，大多用手机支付。' },
            { type: 'mcq', question: '在哪里可以看大熊猫？', options: ['北京', '桂林', '四川', '上海'], correct: 2 },
        ],
    },
];

export const ALL_LISTENING_CN_LESSONS = LISTENING_CN_LESSONS;

export function getCnLessonsByMode(mode) {
    if (mode === 'adult') return LISTENING_CN_LESSONS;
    return LISTENING_CN_LESSONS.filter(l => l.mode === 'kids' || l.level === 'A1' || l.level === 'A2');
}

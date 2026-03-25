// Chinese Grammar — Core grammar patterns unique to Mandarin
// Focus: sentence structure, particles, measure words, comparison, complement patterns

export const GRAMMAR_CN_TOPICS = [
    {
        id: 'sentence-order-cn',
        title: '语序 (Trật tự câu)',
        titleVi: 'Trật tự câu tiếng Trung',
        level: 'A1',
        emoji: '📐',
        summary: 'SVO, Time-Location, 是-sentence, 有-sentence',
        sections: [
            {
                name: '基本语序 SVO (Trật tự cơ bản)',
                rule: 'Tiếng Trung dùng trật tự Chủ - Vị - Tân (giống tiếng Việt).',
                formula: '主语 + 谓语 + 宾语 (S + V + O)',
                examples: [
                    { cn: '我喜欢中文。', pinyin: 'Wǒ xǐhuān Zhōngwén.', vi: 'Tôi thích tiếng Trung.' },
                    { cn: '她吃苹果。', pinyin: 'Tā chī píngguǒ.', vi: 'Cô ấy ăn táo.' },
                ],
            },
            {
                name: '时间 + 地点 (Thời gian + Địa điểm)',
                rule: 'Thời gian và địa điểm đặt TRƯỚC động từ (khác tiếng Anh).',
                formula: 'S + 时间 + 在 + 地点 + V',
                examples: [
                    { cn: '我明天在学校学中文。', pinyin: 'Wǒ míngtiān zài xuéxiào xué Zhōngwén.', vi: 'Tôi ngày mai học tiếng Trung ở trường.' },
                    { cn: '他每天早上在公园跑步。', pinyin: 'Tā měitiān zǎoshang zài gōngyuán pǎobù.', vi: 'Anh ấy mỗi sáng chạy bộ ở công viên.' },
                ],
            },
            {
                name: '"是" 句 (Câu dùng 是)',
                rule: '"是" (shì) = "là" — dùng để xác định, giới thiệu.',
                formula: 'A + 是 + B',
                examples: [
                    { cn: '我是越南人。', pinyin: 'Wǒ shì Yuènánrén.', vi: 'Tôi là người Việt Nam.' },
                    { cn: '这不是我的书。', pinyin: 'Zhè bú shì wǒ de shū.', vi: 'Đây không phải sách của tôi.' },
                ],
            },
        ],
        exercises: [
            { type: 'mcq', question: '"我在图书馆看书" — Trật tự đúng là gì?', options: ['S + V + Location', 'S + 在 + Location + V', 'Location + S + V', 'V + S + Location'], correct: 1 },
            { type: 'gap_fill', question: '她______学生。(cô ấy là học sinh)', answer: '是', hint: 'Động từ "là" trong tiếng Trung' },
            { type: 'mcq', question: 'Câu nào đúng trật tự?', options: ['我中文在学校学。', '我在学校学中文。', '在学校我中文学。', '学中文我在学校。'], correct: 1 },
        ],
    },
    {
        id: 'particles-cn',
        title: '助词 (Trợ từ)',
        titleVi: 'Trợ từ 了/过/着/的/地/得',
        level: 'A2',
        emoji: '🧩',
        summary: '了 (le), 过 (guò), 着 (zhe), 的/地/得 (de)',
        sections: [
            {
                name: '了 (le) — Hoàn thành / Thay đổi',
                rule: '"了" đặt sau động từ = đã làm xong. Đặt cuối câu = thay đổi trạng thái.',
                formula: 'S + V + 了 + O | S + Adj + 了',
                examples: [
                    { cn: '我吃了午饭。', pinyin: 'Wǒ chī le wǔfàn.', vi: 'Tôi đã ăn trưa rồi.' },
                    { cn: '天气冷了。', pinyin: 'Tiānqì lěng le.', vi: 'Thời tiết lạnh rồi.' },
                ],
            },
            {
                name: '过 (guò) — Kinh nghiệm',
                rule: '"过" đặt sau động từ = đã từng (kinh nghiệm trong quá khứ).',
                formula: 'S + V + 过 + O',
                examples: [
                    { cn: '我去过中国。', pinyin: 'Wǒ qù guò Zhōngguó.', vi: 'Tôi đã từng đến Trung Quốc.' },
                    { cn: '你吃过越南菜吗？', pinyin: 'Nǐ chī guò Yuènán cài ma?', vi: 'Bạn đã từng ăn món Việt Nam chưa?' },
                ],
            },
            {
                name: '的/地/得 (de) — Ba chữ "de"',
                rule: '的 = sở hữu / bổ nghĩa danh từ. 地 = bổ nghĩa động từ. 得 = kết quả / mức độ.',
                formula: 'Adj + 的 + N | Adv + 地 + V | V + 得 + kết quả',
                examples: [
                    { cn: '漂亮的花', pinyin: 'piàoliang de huā', vi: 'hoa đẹp (的 + danh từ)' },
                    { cn: '认真地学习', pinyin: 'rènzhēn de xuéxí', vi: 'học nghiêm túc (地 + động từ)' },
                    { cn: '跑得很快', pinyin: 'pǎo de hěn kuài', vi: 'chạy rất nhanh (得 + kết quả)' },
                ],
            },
        ],
        exercises: [
            { type: 'mcq', question: '"我去___中国" — Điền gì để nói "đã từng đến"?', options: ['了', '过', '着', '的'], correct: 1 },
            { type: 'gap_fill', question: '她唱______很好听。(cô ấy hát rất hay)', answer: '得', hint: 'Chữ "de" chỉ kết quả' },
            { type: 'mcq', question: '"漂亮___花" dùng chữ de nào?', options: ['的', '地', '得'], correct: 0 },
        ],
    },
    {
        id: 'measure-words-cn',
        title: '量词 (Lượng từ)',
        titleVi: 'Lượng từ / Classifiers',
        level: 'A1',
        emoji: '📏',
        summary: '个/本/把/条/张/杯/只/件',
        sections: [
            {
                name: 'Quy tắc chung',
                rule: 'Trong tiếng Trung, PHẢI dùng lượng từ giữa số đếm và danh từ (giống "con", "cái", "quyển" trong tiếng Việt).',
                formula: '数字 + 量词 + 名词 (Số + Lượng từ + Danh từ)',
                examples: [
                    { cn: '一个人', pinyin: 'yī gè rén', vi: 'một người (个 = chung nhất)' },
                    { cn: '两本书', pinyin: 'liǎng běn shū', vi: 'hai quyển sách (本 = sách/vở)' },
                    { cn: '三杯茶', pinyin: 'sān bēi chá', vi: 'ba ly trà (杯 = ly/cốc)' },
                    { cn: '四只猫', pinyin: 'sì zhī māo', vi: 'bốn con mèo (只 = động vật nhỏ)' },
                    { cn: '五件衣服', pinyin: 'wǔ jiàn yīfu', vi: 'năm bộ quần áo (件 = quần áo)' },
                    { cn: '一条鱼', pinyin: 'yī tiáo yú', vi: 'một con cá (条 = vật dài)' },
                    { cn: '一张纸', pinyin: 'yī zhāng zhǐ', vi: 'một tờ giấy (张 = vật phẳng)' },
                    { cn: '一把椅子', pinyin: 'yī bǎ yǐzi', vi: 'một cái ghế (把 = vật có tay cầm)' },
                ],
            },
        ],
        exercises: [
            { type: 'mcq', question: '一___书', options: ['个', '本', '只', '条'], correct: 1 },
            { type: 'mcq', question: '三___猫', options: ['个', '本', '只', '张'], correct: 2 },
            { type: 'gap_fill', question: '两______水 (hai ly nước)', answer: '杯', hint: 'Lượng từ cho ly/cốc' },
            { type: 'mcq', question: '一___纸 (một tờ giấy)', options: ['个', '张', '条', '本'], correct: 1 },
        ],
    },
    {
        id: 'comparison-cn',
        title: '比较 (So sánh)',
        titleVi: 'Câu so sánh',
        level: 'A2',
        emoji: '⚖️',
        summary: '比 (hơn), 跟...一样 (giống), 没有...那么 (không bằng)',
        sections: [
            {
                name: '比 (bǐ) — So sánh hơn',
                rule: 'A 比 B + Adj — A hơn B.',
                formula: 'A + 比 + B + Adj (+ 多了/一点)',
                examples: [
                    { cn: '他比我高。', pinyin: 'Tā bǐ wǒ gāo.', vi: 'Anh ấy cao hơn tôi.' },
                    { cn: '中文比英文难多了。', pinyin: 'Zhōngwén bǐ Yīngwén nán duō le.', vi: 'Tiếng Trung khó hơn tiếng Anh nhiều.' },
                ],
            },
            {
                name: '跟...一样 — Giống nhau',
                rule: 'A 跟 B 一样 + Adj — A giống B.',
                formula: 'A + 跟 + B + 一样 (+ Adj)',
                examples: [
                    { cn: '我跟你一样高。', pinyin: 'Wǒ gēn nǐ yīyàng gāo.', vi: 'Tôi cao bằng bạn.' },
                    { cn: '这个跟那个一样。', pinyin: 'Zhège gēn nàge yīyàng.', vi: 'Cái này giống cái kia.' },
                ],
            },
            {
                name: '没有...那么 — Không bằng',
                rule: 'A 没有 B 那么 Adj — A không bằng B.',
                formula: 'A + 没有 + B + 那么 + Adj',
                examples: [
                    { cn: '今天没有昨天那么热。', pinyin: 'Jīntiān méiyǒu zuótiān nàme rè.', vi: 'Hôm nay không nóng bằng hôm qua.' },
                ],
            },
        ],
        exercises: [
            { type: 'gap_fill', question: '他______我大两岁。(anh ấy lớn hơn tôi 2 tuổi)', answer: '比', hint: 'Chữ "hơn" trong tiếng Trung' },
            { type: 'mcq', question: '我跟你一样高 nghĩa là gì?', options: ['Tôi cao hơn bạn', 'Tôi cao bằng bạn', 'Tôi không cao bằng bạn', 'Bạn cao hơn tôi'], correct: 1 },
        ],
    },
    {
        id: 'questions-cn',
        title: '问句 (Câu hỏi)',
        titleVi: 'Các dạng câu hỏi',
        level: 'A1',
        emoji: '❓',
        summary: '吗, 呢, 还是, 疑问词 (什么/谁/哪里/怎么/为什么)',
        sections: [
            {
                name: '吗 (ma) — Câu hỏi Yes/No',
                rule: 'Thêm 吗 vào cuối câu kể = câu hỏi có/không.',
                formula: 'Câu kể + 吗？',
                examples: [
                    { cn: '你是学生吗？', pinyin: 'Nǐ shì xuéshēng ma?', vi: 'Bạn là học sinh phải không?' },
                    { cn: '你喜欢中国菜吗？', pinyin: 'Nǐ xǐhuān Zhōngguó cài ma?', vi: 'Bạn thích món Trung Quốc không?' },
                ],
            },
            {
                name: '疑问词 — Từ hỏi',
                rule: 'Đặt từ hỏi tại vị trí của câu trả lời (KHÔNG đảo trật tự!).',
                formula: '...什么/谁/哪里/怎么/为什么/多少...',
                examples: [
                    { cn: '你叫什么名字？', pinyin: 'Nǐ jiào shénme míngzì?', vi: 'Bạn tên gì? (什么 = gì)' },
                    { cn: '谁是你的老师？', pinyin: 'Shéi shì nǐ de lǎoshī?', vi: 'Ai là giáo viên? (谁 = ai)' },
                    { cn: '你在哪里工作？', pinyin: 'Nǐ zài nǎlǐ gōngzuò?', vi: 'Bạn làm việc ở đâu? (哪里 = ở đâu)' },
                    { cn: '你为什么学中文？', pinyin: 'Nǐ wèishénme xué Zhōngwén?', vi: 'Tại sao bạn học tiếng Trung? (为什么 = tại sao)' },
                ],
            },
            {
                name: 'A 还是 B — Câu hỏi lựa chọn',
                rule: 'Dùng 还是 để hỏi lựa chọn giữa A và B.',
                formula: 'A + 还是 + B？',
                examples: [
                    { cn: '你喝茶还是咖啡？', pinyin: 'Nǐ hē chá háishi kāfēi?', vi: 'Bạn uống trà hay cà phê?' },
                ],
            },
        ],
        exercises: [
            { type: 'gap_fill', question: '你是老师______？(Bạn là giáo viên phải không?)', answer: '吗', hint: 'Trợ từ hỏi cuối câu' },
            { type: 'mcq', question: '"你在哪里工作？" — "哪里" nghĩa là gì?', options: ['khi nào', 'ở đâu', 'tại sao', 'như thế nào'], correct: 1 },
            { type: 'mcq', question: '"你喝茶___咖啡？" — Điền gì?', options: ['吗', '呢', '还是', '什么'], correct: 2 },
        ],
    },
    {
        id: 'negation-cn',
        title: '否定 (Phủ định)',
        titleVi: 'Câu phủ định 不/没',
        level: 'A1',
        emoji: '🚫',
        summary: '不 (bù) vs 没 (méi) — hai cách phủ định',
        sections: [
            {
                name: '不 (bù) — Phủ định chung',
                rule: '不 dùng cho: hiện tại, tương lai, thói quen, ý chí.',
                formula: 'S + 不 + V/Adj',
                examples: [
                    { cn: '我不喜欢吃辣。', pinyin: 'Wǒ bù xǐhuān chī là.', vi: 'Tôi không thích ăn cay.' },
                    { cn: '他不是医生。', pinyin: 'Tā bú shì yīshēng.', vi: 'Anh ấy không phải bác sĩ.' },
                ],
            },
            {
                name: '没(有) (méi yǒu) — Phủ định quá khứ / chưa',
                rule: '没 dùng cho: quá khứ, chưa xảy ra.',
                formula: 'S + 没(有) + V',
                examples: [
                    { cn: '我没去过日本。', pinyin: 'Wǒ méi qù guò Rìběn.', vi: 'Tôi chưa từng đến Nhật.' },
                    { cn: '他没有钱。', pinyin: 'Tā méiyǒu qián.', vi: 'Anh ấy không có tiền.' },
                ],
            },
        ],
        exercises: [
            { type: 'mcq', question: '"我___喜欢这个颜色" — dùng chữ nào?', options: ['不', '没', '没有'], correct: 0 },
            { type: 'mcq', question: '"她昨天___来上课" — dùng chữ nào?', options: ['不', '没', '不是'], correct: 1 },
            { type: 'gap_fill', question: '我______吃过泰国菜。(Tôi chưa ăn món Thái)', answer: '没', hint: 'Phủ định kinh nghiệm (với 过)' },
        ],
    },
];

export function getCnGrammarByMode(mode) {
    if (mode === 'adult') return GRAMMAR_CN_TOPICS;
    return GRAMMAR_CN_TOPICS.filter(t => t.level === 'A1' || t.level === 'A2');
}

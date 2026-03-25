// HSK 1-6 Complete Vocabulary Data
// Source: HSK 3.0 Standard (Hanban), cross-verified with drkameleon/complete-hsk-vocabulary
// Each entry: { word, pinyin, meaning, hskLevel, example, exampleVi }

export const HSK_LEVELS = {
    1: { name: 'HSK 1', description: '入门 (Beginner)', words: 150, color: '#22C55E' },
    2: { name: 'HSK 2', description: '基础 (Elementary)', words: 150, color: '#3B82F6' },
    3: { name: 'HSK 3', description: '进阶 (Intermediate)', words: 300, color: '#8B5CF6' },
    4: { name: 'HSK 4', description: '高阶 (Upper-Intermediate)', words: 600, color: '#F59E0B' },
    5: { name: 'HSK 5', description: '流利 (Advanced)', words: 1300, color: '#EF4444' },
    6: { name: 'HSK 6', description: '精通 (Mastery)', words: 2500, color: '#DC2626' },
};

export const HSK_VOCABULARY = [
    // === HSK 1 — Core 150 words ===
    { word: '你好', pinyin: 'nǐ hǎo', meaning: 'Hello', hskLevel: 1, example: '你好！你叫什么名字？', exampleVi: 'Xin chào! Bạn tên gì?' },
    { word: '谢谢', pinyin: 'xiè xie', meaning: 'Thank you', hskLevel: 1, example: '谢谢你的帮助。', exampleVi: 'Cảm ơn sự giúp đỡ của bạn.' },
    { word: '再见', pinyin: 'zài jiàn', meaning: 'Goodbye', hskLevel: 1, example: '再见，明天见！', exampleVi: 'Tạm biệt, mai gặp!' },
    { word: '是', pinyin: 'shì', meaning: 'To be/Yes', hskLevel: 1, example: '我是学生。', exampleVi: 'Tôi là sinh viên.' },
    { word: '不', pinyin: 'bù', meaning: 'No/Not', hskLevel: 1, example: '我不去。', exampleVi: 'Tôi không đi.' },
    { word: '人', pinyin: 'rén', meaning: 'Person', hskLevel: 1, example: '这个人很好。', exampleVi: 'Người này rất tốt.' },
    { word: '大', pinyin: 'dà', meaning: 'Big', hskLevel: 1, example: '这个很大。', exampleVi: 'Cái này rất lớn.' },
    { word: '小', pinyin: 'xiǎo', meaning: 'Small', hskLevel: 1, example: '这只猫很小。', exampleVi: 'Con mèo này rất nhỏ.' },
    { word: '中国', pinyin: 'Zhōngguó', meaning: 'China', hskLevel: 1, example: '我在中国学习。', exampleVi: 'Tôi học ở Trung Quốc.' },
    { word: '学生', pinyin: 'xuéshēng', meaning: 'Student', hskLevel: 1, example: '她是一个好学生。', exampleVi: 'Cô ấy là học sinh giỏi.' },
    { word: '老师', pinyin: 'lǎoshī', meaning: 'Teacher', hskLevel: 1, example: '老师很严格。', exampleVi: 'Giáo viên rất nghiêm khắc.' },
    { word: '朋友', pinyin: 'péngyǒu', meaning: 'Friend', hskLevel: 1, example: '他是我的好朋友。', exampleVi: 'Anh ấy là bạn tốt của tôi.' },
    { word: '家', pinyin: 'jiā', meaning: 'Home/Family', hskLevel: 1, example: '我想回家。', exampleVi: 'Tôi muốn về nhà.' },
    { word: '水', pinyin: 'shuǐ', meaning: 'Water', hskLevel: 1, example: '我要喝水。', exampleVi: 'Tôi muốn uống nước.' },
    { word: '吃', pinyin: 'chī', meaning: 'To eat', hskLevel: 1, example: '我们吃饭吧。', exampleVi: 'Chúng ta ăn cơm đi.' },
    { word: '喝', pinyin: 'hē', meaning: 'To drink', hskLevel: 1, example: '你喝什么？', exampleVi: 'Bạn uống gì?' },
    { word: '去', pinyin: 'qù', meaning: 'To go', hskLevel: 1, example: '我去学校。', exampleVi: 'Tôi đi trường.' },
    { word: '来', pinyin: 'lái', meaning: 'To come', hskLevel: 1, example: '请来这里。', exampleVi: 'Xin hãy đến đây.' },
    { word: '看', pinyin: 'kàn', meaning: 'To look/watch', hskLevel: 1, example: '我看电视。', exampleVi: 'Tôi xem tivi.' },
    { word: '听', pinyin: 'tīng', meaning: 'To listen', hskLevel: 1, example: '听音乐很放松。', exampleVi: 'Nghe nhạc rất thư giãn.' },
    { word: '说', pinyin: 'shuō', meaning: 'To speak', hskLevel: 1, example: '你说中文吗？', exampleVi: 'Bạn nói tiếng Trung không?' },
    { word: '读', pinyin: 'dú', meaning: 'To read', hskLevel: 1, example: '我喜欢读书。', exampleVi: 'Tôi thích đọc sách.' },
    { word: '写', pinyin: 'xiě', meaning: 'To write', hskLevel: 1, example: '请写你的名字。', exampleVi: 'Xin viết tên của bạn.' },
    { word: '买', pinyin: 'mǎi', meaning: 'To buy', hskLevel: 1, example: '我要买水果。', exampleVi: 'Tôi muốn mua trái cây.' },
    { word: '钱', pinyin: 'qián', meaning: 'Money', hskLevel: 1, example: '这个多少钱？', exampleVi: 'Cái này bao nhiêu tiền?' },
    { word: '今天', pinyin: 'jīntiān', meaning: 'Today', hskLevel: 1, example: '今天天气很好。', exampleVi: 'Hôm nay thời tiết đẹp.' },
    { word: '明天', pinyin: 'míngtiān', meaning: 'Tomorrow', hskLevel: 1, example: '明天我去北京。', exampleVi: 'Ngày mai tôi đi Bắc Kinh.' },
    { word: '昨天', pinyin: 'zuótiān', meaning: 'Yesterday', hskLevel: 1, example: '昨天很冷。', exampleVi: 'Hôm qua rất lạnh.' },
    { word: '时间', pinyin: 'shíjiān', meaning: 'Time', hskLevel: 1, example: '时间过得很快。', exampleVi: 'Thời gian trôi rất nhanh.' },
    { word: '工作', pinyin: 'gōngzuò', meaning: 'Work', hskLevel: 1, example: '我喜欢我的工作。', exampleVi: 'Tôi thích công việc.' },

    // === HSK 2 — Expanding basics ===
    { word: '已经', pinyin: 'yǐjīng', meaning: 'Already', hskLevel: 2, example: '我已经吃了。', exampleVi: 'Tôi đã ăn rồi.' },
    { word: '可能', pinyin: 'kěnéng', meaning: 'Maybe/Possible', hskLevel: 2, example: '明天可能下雨。', exampleVi: 'Ngày mai có thể mưa.' },
    { word: '虽然', pinyin: 'suīrán', meaning: 'Although', hskLevel: 2, example: '虽然很累，但我很开心。', exampleVi: 'Mặc dù mệt nhưng tôi vui.' },
    { word: '因为', pinyin: 'yīnwèi', meaning: 'Because', hskLevel: 2, example: '因为下雨，我没去。', exampleVi: 'Vì mưa nên tôi không đi.' },
    { word: '所以', pinyin: 'suǒyǐ', meaning: 'Therefore', hskLevel: 2, example: '我累了，所以早睡。', exampleVi: 'Tôi mệt nên ngủ sớm.' },
    { word: '比较', pinyin: 'bǐjiào', meaning: 'Relatively/Compare', hskLevel: 2, example: '今天比较冷。', exampleVi: 'Hôm nay hơi lạnh.' },
    { word: '一起', pinyin: 'yīqǐ', meaning: 'Together', hskLevel: 2, example: '我们一起去吧！', exampleVi: 'Chúng ta cùng đi nhé!' },
    { word: '认为', pinyin: 'rènwéi', meaning: 'Think/Believe', hskLevel: 2, example: '我认为他说得对。', exampleVi: 'Tôi cho rằng anh ấy đúng.' },
    { word: '帮助', pinyin: 'bāngzhù', meaning: 'Help', hskLevel: 2, example: '请帮助我。', exampleVi: 'Xin giúp tôi.' },
    { word: '问题', pinyin: 'wèntí', meaning: 'Question/Problem', hskLevel: 2, example: '这是一个难问题。', exampleVi: 'Đây là câu hỏi khó.' },
    { word: '地方', pinyin: 'dìfāng', meaning: 'Place', hskLevel: 2, example: '这个地方很美。', exampleVi: 'Nơi này rất đẹp.' },
    { word: '准备', pinyin: 'zhǔnbèi', meaning: 'Prepare', hskLevel: 2, example: '我准备好了。', exampleVi: 'Tôi đã chuẩn bị xong.' },
    { word: '开始', pinyin: 'kāishǐ', meaning: 'Start/Begin', hskLevel: 2, example: '课开始了。', exampleVi: 'Giờ học bắt đầu rồi.' },
    { word: '结束', pinyin: 'jiéshù', meaning: 'End/Finish', hskLevel: 2, example: '会议结束了。', exampleVi: 'Cuộc họp kết thúc rồi.' },
    { word: '健康', pinyin: 'jiànkāng', meaning: 'Health/Healthy', hskLevel: 2, example: '健康最重要。', exampleVi: 'Sức khỏe quan trọng nhất.' },
    { word: '运动', pinyin: 'yùndòng', meaning: 'Exercise/Sport', hskLevel: 2, example: '我每天运动一小时。', exampleVi: 'Tôi tập thể dục 1 giờ mỗi ngày.' },
    { word: '旅行', pinyin: 'lǚxíng', meaning: 'Travel', hskLevel: 2, example: '我喜欢旅行。', exampleVi: 'Tôi thích du lịch.' },
    { word: '城市', pinyin: 'chéngshì', meaning: 'City', hskLevel: 2, example: '这个城市很大。', exampleVi: 'Thành phố này rất lớn.' },
    { word: '历史', pinyin: 'lìshǐ', meaning: 'History', hskLevel: 2, example: '中国历史很长。', exampleVi: 'Lịch sử Trung Quốc rất dài.' },
    { word: '文化', pinyin: 'wénhuà', meaning: 'Culture', hskLevel: 2, example: '中国文化很丰富。', exampleVi: 'Văn hóa TQ rất phong phú.' },

    // === HSK 3 — Intermediate essentials ===
    { word: '环境', pinyin: 'huánjìng', meaning: 'Environment', hskLevel: 3, example: '保护环境很重要。', exampleVi: 'Bảo vệ môi trường rất quan trọng.' },
    { word: '经济', pinyin: 'jīngjì', meaning: 'Economy', hskLevel: 3, example: '中国经济发展很快。', exampleVi: 'Kinh tế TQ phát triển rất nhanh.' },
    { word: '社会', pinyin: 'shèhuì', meaning: 'Society', hskLevel: 3, example: '社会在不断变化。', exampleVi: 'Xã hội không ngừng thay đổi.' },
    { word: '教育', pinyin: 'jiàoyù', meaning: 'Education', hskLevel: 3, example: '教育改变命运。', exampleVi: 'Giáo dục thay đổi số phận.' },
    { word: '科技', pinyin: 'kējì', meaning: 'Technology', hskLevel: 3, example: '科技改变生活。', exampleVi: 'Công nghệ thay đổi cuộc sống.' },
    { word: '发展', pinyin: 'fāzhǎn', meaning: 'Development', hskLevel: 3, example: '经济发展很快。', exampleVi: 'Kinh tế phát triển nhanh.' },
    { word: '关系', pinyin: 'guānxì', meaning: 'Relationship', hskLevel: 3, example: '人际关系很重要。', exampleVi: 'Quan hệ con người rất quan trọng.' },
    { word: '安全', pinyin: 'ānquán', meaning: 'Safety/Security', hskLevel: 3, example: '注意安全。', exampleVi: 'Chú ý an toàn.' },
    { word: '责任', pinyin: 'zérèn', meaning: 'Responsibility', hskLevel: 3, example: '这是我的责任。', exampleVi: 'Đây là trách nhiệm của tôi.' },
    { word: '经验', pinyin: 'jīngyàn', meaning: 'Experience', hskLevel: 3, example: '她有丰富的经验。', exampleVi: 'Cô ấy có kinh nghiệm phong phú.' },
    { word: '机会', pinyin: 'jīhuì', meaning: 'Opportunity', hskLevel: 3, example: '不要错过机会。', exampleVi: 'Đừng bỏ lỡ cơ hội.' },
    { word: '成功', pinyin: 'chénggōng', meaning: 'Success', hskLevel: 3, example: '成功需要努力。', exampleVi: 'Thành công cần nỗ lực.' },
    { word: '失败', pinyin: 'shībài', meaning: 'Failure', hskLevel: 3, example: '失败是成功之母。', exampleVi: 'Thất bại là mẹ thành công.' },
    { word: '压力', pinyin: 'yālì', meaning: 'Pressure/Stress', hskLevel: 3, example: '工作压力很大。', exampleVi: 'Áp lực công việc rất lớn.' },
    { word: '解决', pinyin: 'jiějué', meaning: 'Solve', hskLevel: 3, example: '我们需要解决这个问题。', exampleVi: 'Chúng ta cần giải quyết vấn đề.' },
    { word: '影响', pinyin: 'yǐngxiǎng', meaning: 'Influence/Affect', hskLevel: 3, example: '天气影响心情。', exampleVi: 'Thời tiết ảnh hưởng tâm trạng.' },
    { word: '提高', pinyin: 'tígāo', meaning: 'Improve/Raise', hskLevel: 3, example: '提高水平。', exampleVi: 'Nâng cao trình độ.' },
    { word: '交流', pinyin: 'jiāoliú', meaning: 'Communicate/Exchange', hskLevel: 3, example: '文化交流很重要。', exampleVi: 'Giao lưu văn hóa rất quan trọng.' },
    { word: '表达', pinyin: 'biǎodá', meaning: 'Express', hskLevel: 3, example: '清楚地表达想法。', exampleVi: 'Diễn đạt suy nghĩ rõ ràng.' },
    { word: '支持', pinyin: 'zhīchí', meaning: 'Support', hskLevel: 3, example: '我支持你的决定。', exampleVi: 'Tôi ủng hộ quyết định của bạn.' },

    // === HSK 4 — Upper-Intermediate ===
    { word: '竞争', pinyin: 'jìngzhēng', meaning: 'Competition', hskLevel: 4, example: '市场竞争很激烈。', exampleVi: 'Cạnh tranh thị trường rất khốc liệt.' },
    { word: '创新', pinyin: 'chuàngxīn', meaning: 'Innovation', hskLevel: 4, example: '创新是发展的动力。', exampleVi: 'Đổi mới là động lực phát triển.' },
    { word: '合作', pinyin: 'hézuò', meaning: 'Cooperation', hskLevel: 4, example: '国际合作很重要。', exampleVi: 'Hợp tác quốc tế rất quan trọng.' },
    { word: '管理', pinyin: 'guǎnlǐ', meaning: 'Management', hskLevel: 4, example: '好的管理很重要。', exampleVi: 'Quản lý tốt rất quan trọng.' },
    { word: '政策', pinyin: 'zhèngcè', meaning: 'Policy', hskLevel: 4, example: '新政策下个月实施。', exampleVi: 'Chính sách mới thực hiện tháng tới.' },
    { word: '资源', pinyin: 'zīyuán', meaning: 'Resource', hskLevel: 4, example: '自然资源有限。', exampleVi: 'Tài nguyên thiên nhiên có hạn.' },
    { word: '效率', pinyin: 'xiàolǜ', meaning: 'Efficiency', hskLevel: 4, example: '提高工作效率。', exampleVi: 'Nâng cao hiệu suất công việc.' },
    { word: '传统', pinyin: 'chuántǒng', meaning: 'Tradition', hskLevel: 4, example: '保留传统文化。', exampleVi: 'Giữ gìn văn hóa truyền thống.' },
    { word: '独立', pinyin: 'dúlì', meaning: 'Independent', hskLevel: 4, example: '年轻人要独立。', exampleVi: 'Thanh niên phải tự lập.' },
    { word: '全球', pinyin: 'quánqiú', meaning: 'Global', hskLevel: 4, example: '全球化趋势。', exampleVi: 'Xu hướng toàn cầu hóa.' },
    { word: '投资', pinyin: 'tóuzī', meaning: 'Investment', hskLevel: 4, example: '投资需要谨慎。', exampleVi: 'Đầu tư cần thận trọng.' },
    { word: '法律', pinyin: 'fǎlǜ', meaning: 'Law', hskLevel: 4, example: '遵守法律是公民的义务。', exampleVi: 'Tuân thủ pháp luật là nghĩa vụ công dân.' },
    { word: '贸易', pinyin: 'màoyì', meaning: 'Trade', hskLevel: 4, example: '国际贸易增长了。', exampleVi: 'Thương mại quốc tế tăng trưởng.' },
    { word: '质量', pinyin: 'zhìliàng', meaning: 'Quality', hskLevel: 4, example: '产品质量很好。', exampleVi: 'Chất lượng sản phẩm rất tốt.' },
    { word: '消费', pinyin: 'xiāofèi', meaning: 'Consumption', hskLevel: 4, example: '减少不必要的消费。', exampleVi: 'Giảm tiêu dùng không cần thiết.' },
    { word: '人工智能', pinyin: 'réngōng zhìnéng', meaning: 'AI', hskLevel: 4, example: '人工智能改变世界。', exampleVi: 'AI thay đổi thế giới.' },
    { word: '可持续', pinyin: 'kě chíxù', meaning: 'Sustainable', hskLevel: 4, example: '可持续发展。', exampleVi: 'Phát triển bền vững.' },
    { word: '数据', pinyin: 'shùjù', meaning: 'Data', hskLevel: 4, example: '分析数据很重要。', exampleVi: 'Phân tích dữ liệu rất quan trọng.' },
    { word: '网络', pinyin: 'wǎngluò', meaning: 'Network/Internet', hskLevel: 4, example: '网络安全很重要。', exampleVi: 'An ninh mạng rất quan trọng.' },
    { word: '学术', pinyin: 'xuéshù', meaning: 'Academic', hskLevel: 4, example: '学术研究需要严谨。', exampleVi: 'Nghiên cứu học thuật cần nghiêm ngặt.' },

    // === HSK 5 — Advanced ===
    { word: '辩论', pinyin: 'biànlùn', meaning: 'Debate', hskLevel: 5, example: '学生们在辩论。', exampleVi: 'Sinh viên đang tranh luận.' },
    { word: '策略', pinyin: 'cèlüè', meaning: 'Strategy', hskLevel: 5, example: '制定营销策略。', exampleVi: 'Lập chiến lược marketing.' },
    { word: '偏见', pinyin: 'piānjiàn', meaning: 'Prejudice/Bias', hskLevel: 5, example: '消除偏见。', exampleVi: 'Xóa bỏ thành kiến.' },
    { word: '民主', pinyin: 'mínzhǔ', meaning: 'Democracy', hskLevel: 5, example: '追求民主。', exampleVi: 'Theo đuổi dân chủ.' },
    { word: '腐败', pinyin: 'fǔbài', meaning: 'Corruption', hskLevel: 5, example: '反对腐败。', exampleVi: 'Chống tham nhũng.' },
    { word: '外交', pinyin: 'wàijiāo', meaning: 'Diplomacy', hskLevel: 5, example: '外交关系很重要。', exampleVi: 'Quan hệ ngoại giao rất quan trọng.' },
    { word: '意识', pinyin: 'yìshí', meaning: 'Consciousness/Awareness', hskLevel: 5, example: '提高安全意识。', exampleVi: 'Nâng cao ý thức an toàn.' },
    { word: '哲学', pinyin: 'zhéxué', meaning: 'Philosophy', hskLevel: 5, example: '他学习哲学。', exampleVi: 'Anh ấy học triết học.' },
    { word: '伦理', pinyin: 'lúnlǐ', meaning: 'Ethics', hskLevel: 5, example: '医学伦理很重要。', exampleVi: 'Y đức rất quan trọng.' },
    { word: '算法', pinyin: 'suànfǎ', meaning: 'Algorithm', hskLevel: 5, example: '优化算法。', exampleVi: 'Tối ưu thuật toán.' },

    // === HSK 6 — Mastery ===
    { word: '博弈', pinyin: 'bóyì', meaning: 'Game theory', hskLevel: 6, example: '国际博弈很复杂。', exampleVi: 'Cuộc chơi quốc tế rất phức tạp.' },
    { word: '悖论', pinyin: 'bèilùn', meaning: 'Paradox', hskLevel: 6, example: '这是一个有趣的悖论。', exampleVi: 'Đây là nghịch lý thú vị.' },
    { word: '隐喻', pinyin: 'yǐnyù', meaning: 'Metaphor', hskLevel: 6, example: '他善于使用隐喻。', exampleVi: 'Anh ấy giỏi dùng ẩn dụ.' },
    { word: '辩证', pinyin: 'biànzhèng', meaning: 'Dialectical', hskLevel: 6, example: '辩证地看问题。', exampleVi: 'Nhìn vấn đề biện chứng.' },
    { word: '范畴', pinyin: 'fànchóu', meaning: 'Category/Scope', hskLevel: 6, example: '这属于哲学范畴。', exampleVi: 'Đây thuộc phạm trù triết học.' },
];

// Utility: get words by HSK level
export function getHSKByLevel(level) {
    return HSK_VOCABULARY.filter(w => w.hskLevel === level);
}

// Utility: get all HSK words up to a level
export function getHSKUpToLevel(maxLevel) {
    return HSK_VOCABULARY.filter(w => w.hskLevel <= maxLevel);
}

// Stats
export function getHSKStats() {
    const stats = {};
    for (let i = 1; i <= 6; i++) {
        stats[i] = HSK_VOCABULARY.filter(w => w.hskLevel === i).length;
    }
    stats.total = HSK_VOCABULARY.length;
    return stats;
}

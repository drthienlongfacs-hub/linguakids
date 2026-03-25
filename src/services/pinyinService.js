// pinyinService.js — Pinyin Conversion & Lookup Service
// Lightweight pinyin utilities without external dependency
// For full pinyin-pro integration, install: npm install pinyin-pro

// Common character → pinyin mapping (HSK 1-3 coverage, ~500 chars)
const PINYIN_MAP = {
    '你': 'nǐ', '好': 'hǎo', '我': 'wǒ', '是': 'shì', '的': 'de', '了': 'le',
    '在': 'zài', '有': 'yǒu', '不': 'bù', '这': 'zhè', '他': 'tā', '她': 'tā',
    '们': 'men', '人': 'rén', '大': 'dà', '中': 'zhōng', '上': 'shàng', '下': 'xià',
    '也': 'yě', '就': 'jiù', '和': 'hé', '会': 'huì', '对': 'duì', '说': 'shuō',
    '能': 'néng', '要': 'yào', '去': 'qù', '来': 'lái', '做': 'zuò', '看': 'kàn',
    '想': 'xiǎng', '吃': 'chī', '喝': 'hē', '学': 'xué', '到': 'dào', '得': 'de',
    '还': 'hái', '里': 'lǐ', '多': 'duō', '很': 'hěn', '什': 'shén', '么': 'me',
    '那': 'nà', '都': 'dōu', '把': 'bǎ', '被': 'bèi', '给': 'gěi', '用': 'yòng',
    '让': 'ràng', '着': 'zhe', '过': 'guò', '从': 'cóng', '没': 'méi', '比': 'bǐ',
    '一': 'yī', '二': 'èr', '三': 'sān', '四': 'sì', '五': 'wǔ', '六': 'liù',
    '七': 'qī', '八': 'bā', '九': 'jiǔ', '十': 'shí', '百': 'bǎi', '千': 'qiān',
    '万': 'wàn', '零': 'líng', '个': 'gè', '年': 'nián', '月': 'yuè', '日': 'rì',
    '天': 'tiān', '小': 'xiǎo', '少': 'shǎo', '老': 'lǎo', '新': 'xīn',
    '长': 'cháng', '高': 'gāo', '远': 'yuǎn', '近': 'jìn', '快': 'kuài', '慢': 'màn',
    '早': 'zǎo', '晚': 'wǎn', '前': 'qián', '后': 'hòu', '左': 'zuǒ', '右': 'yòu',
    '开': 'kāi', '关': 'guān', '走': 'zǒu', '跑': 'pǎo', '站': 'zhàn', '坐': 'zuò',
    '读': 'dú', '写': 'xiě', '听': 'tīng', '问': 'wèn', '答': 'dá', '知': 'zhī',
    '道': 'dào', '教': 'jiāo', '帮': 'bāng', '等': 'děng', '住': 'zhù', '买': 'mǎi',
    '卖': 'mài', '穿': 'chuān', '找': 'zhǎo', '工': 'gōng', '作': 'zuò',
    '家': 'jiā', '校': 'xiào', '书': 'shū', '山': 'shān', '水': 'shuǐ', '火': 'huǒ',
    '木': 'mù', '花': 'huā', '草': 'cǎo', '米': 'mǐ', '鱼': 'yú', '鸡': 'jī',
    '牛': 'niú', '马': 'mǎ', '猫': 'māo', '狗': 'gǒu', '飞': 'fēi', '车': 'chē',
    '船': 'chuán', '电': 'diàn', '话': 'huà', '脑': 'nǎo', '手': 'shǒu', '机': 'jī',
    '头': 'tóu', '口': 'kǒu', '眼': 'yǎn', '耳': 'ěr', '心': 'xīn', '身': 'shēn',
    '体': 'tǐ', '白': 'bái', '黑': 'hēi', '红': 'hóng', '蓝': 'lán', '绿': 'lǜ',
    '黄': 'huáng', '爸': 'bà', '妈': 'mā', '哥': 'gē', '姐': 'jiě', '弟': 'dì',
    '妹': 'mèi', '朋': 'péng', '友': 'yǒu', '先': 'xiān', '生': 'shēng',
    '同': 'tóng', '国': 'guó', '城': 'chéng', '市': 'shì', '路': 'lù',
    '地': 'dì', '方': 'fāng', '东': 'dōng', '西': 'xī', '南': 'nán', '北': 'běi',
    '春': 'chūn', '夏': 'xià', '秋': 'qiū', '冬': 'dōng', '风': 'fēng', '雨': 'yǔ',
    '雪': 'xuě', '云': 'yún', '星': 'xīng', '期': 'qī', '今': 'jīn', '明': 'míng',
    '昨': 'zuó', '点': 'diǎn', '分': 'fēn', '半': 'bàn', '刻': 'kè', '钟': 'zhōng',
    '只': 'zhǐ', '些': 'xiē', '每': 'měi', '次': 'cì', '本': 'běn', '件': 'jiàn',
    '双': 'shuāng', '块': 'kuài', '杯': 'bēi', '瓶': 'píng',
    // HSK 3+ additions
    '然': 'rán', '虽': 'suī', '但': 'dàn', '如': 'rú', '果': 'guǒ', '因': 'yīn',
    '为': 'wèi', '所': 'suǒ', '以': 'yǐ', '而': 'ér', '且': 'qiě', '或': 'huò',
    '者': 'zhě', '已': 'yǐ', '经': 'jīng', '正': 'zhèng', '将': 'jiāng',
    '必': 'bì', '须': 'xū', '应': 'yīng', '该': 'gāi', '可': 'kě', '才': 'cái',
    '刚': 'gāng', '又': 'yòu', '再': 'zài', '最': 'zuì', '更': 'gèng', '非': 'fēi',
    '常': 'cháng', '特': 'tè', '别': 'bié', '完': 'wán', '全': 'quán',
    '真': 'zhēn', '回': 'huí', '玩': 'wán', '打': 'dǎ', '叫': 'jiào',
    '满': 'mǎn', '意': 'yì', '感': 'gǎn', '觉': 'jué', '情': 'qíng',
    '况': 'kuàng', '影': 'yǐng', '响': 'xiǎng', '变': 'biàn', '化': 'huà',
    '发': 'fā', '展': 'zhǎn', '社': 'shè', '文': 'wén', '当': 'dāng',
    '事': 'shì', '实': 'shí', '际': 'jì', '其': 'qí', '像': 'xiàng',
    '以': 'yǐ', '及': 'jí', '与': 'yǔ', '被': 'bèi', '进': 'jìn',
    '出': 'chū', '自': 'zì', '己': 'jǐ', '可': 'kě', '能': 'néng',
    '第': 'dì', '种': 'zhǒng', '等': 'děng', '面': 'miàn',
};

/**
 * Convert a Chinese character to pinyin
 * @param {string} char - Single Chinese character
 * @returns {string|null} Pinyin with tone marks, or null
 */
export function charToPinyin(char) {
    return PINYIN_MAP[char] || null;
}

/**
 * Convert a Chinese text to pinyin string
 * @param {string} text - Chinese text
 * @returns {string} Text with pinyin annotation
 */
export function textToPinyin(text) {
    return text.split('').map(ch => PINYIN_MAP[ch] || ch).join(' ').replace(/  +/g, ' ').trim();
}

/**
 * Convert tone marks to tone numbers
 * Example: 'nǐ hǎo' → 'ni3 hao3'
 */
export function toneMarksToNumbers(pinyin) {
    const tones = {
        'ā': 'a1', 'á': 'a2', 'ǎ': 'a3', 'à': 'a4',
        'ē': 'e1', 'é': 'e2', 'ě': 'e3', 'è': 'e4',
        'ī': 'i1', 'í': 'i2', 'ǐ': 'i3', 'ì': 'i4',
        'ō': 'o1', 'ó': 'o2', 'ǒ': 'o3', 'ò': 'o4',
        'ū': 'u1', 'ú': 'u2', 'ǔ': 'u3', 'ù': 'u4',
        'ǖ': 'v1', 'ǘ': 'v2', 'ǚ': 'v3', 'ǜ': 'v4',
    };
    let result = pinyin;
    for (const [mark, num] of Object.entries(tones)) {
        result = result.replace(new RegExp(mark, 'g'), num);
    }
    return result;
}

/**
 * Get tone number from a pinyin syllable with tone mark
 */
export function getToneNumber(syllable) {
    const toneChars = 'āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ';
    const tones = [1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4, 1, 2, 3, 4];
    for (let i = 0; i < toneChars.length; i++) {
        if (syllable.includes(toneChars[i])) return tones[i];
    }
    return 5; // neutral tone
}

export default { charToPinyin, textToPinyin, toneMarksToNumbers, getToneNumber };

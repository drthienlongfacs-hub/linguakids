function normalizeVietnamese(text) {
    return String(text || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

const HELPER_BANK = {
    'day-check-in': [
        {
            patterns: ['hom nay', 'sang nay', 'buoi sang'],
            suggestion: 'Today is going well. This morning I had class and finished one important task.',
        },
        {
            patterns: ['di lam', 'cong viec', 'hop', 'meeting'],
            suggestion: 'Earlier today, I went to work and joined a meeting, so it has been a busy day.',
        },
        {
            patterns: ['met', 'ban', 'stress'],
            suggestion: 'I feel a little tired today because my schedule was busy, but I still finished my main work.',
        },
    ],
    routine: [
        {
            patterns: ['tap the duc', 'tap gym', 'chay bo', 'di bo'],
            suggestion: 'This week, I want to exercise more because it helps me feel healthier and more focused.',
        },
        {
            patterns: ['ngu som', 'ngu du', 'thuc khuya'],
            suggestion: 'I want to sleep earlier this week, so I can wake up with more energy every day.',
        },
        {
            patterns: ['hoc tieng anh', 'luyen noi', 'hoc moi ngay'],
            suggestion: 'I usually practice English every day, and this week I want to speak more confidently.',
        },
    ],
    'weekend-plan': [
        {
            patterns: ['cuoi tuan', 'di choi', 'ban be', 'gia dinh'],
            suggestion: 'This weekend, I plan to spend time with my family and relax with my friends because I need a break.',
        },
        {
            patterns: ['o nha', 'nghi ngoi', 'thu gian'],
            suggestion: 'I plan to stay home this weekend and relax because I want to recover after a busy week.',
        },
    ],
    'about-yourself': [
        {
            patterns: ['sinh vien', 'dai hoc', 'hoc'],
            suggestion: 'I am currently a student, and I am building strong teamwork and communication skills through my studies.',
        },
        {
            patterns: ['di lam', 'cong ty', 'kinh nghiem'],
            suggestion: 'I have work experience in a team environment, and one of my strengths is staying organized under pressure.',
        },
    ],
    challenge: [
        {
            patterns: ['kho khan', 'thach thuc', 'van de', 'ap luc'],
            suggestion: 'One challenge I faced was a tight deadline, so I organized the work clearly, supported my team, and delivered the result on time.',
        },
    ],
    motivation: [
        {
            patterns: ['muon', 'phat trien', 'hoc hoi', 'dong gop'],
            suggestion: 'I want this role because it matches my strengths, and I believe I can contribute through reliable teamwork and continuous learning.',
        },
    ],
    problem: [
        {
            patterns: ['tre', 'delay', 'may bay', 'tau', 'khach san'],
            suggestion: 'My flight is delayed, and I need help because my booking time has changed.',
        },
    ],
    'request-help': [
        {
            patterns: ['giup', 'doi ve', 'xac nhan', 'dat lai'],
            suggestion: 'Could you please help me rebook my ticket and confirm the next available option?',
        },
    ],
    'confirm-next-step': [
        {
            patterns: ['buoc tiep theo', 'cong', 'gio', 'xac nhan'],
            suggestion: 'So the next step is to go to the new gate and wait for the updated boarding time. Thank you.',
        },
    ],
};

function buildScaffold(turn) {
    const vocabulary = (turn?.targetVocabulary || []).slice(0, 3).join(', ');
    if (!turn) return '';
    return `I want to answer this clearly: ${turn.prompt} ${vocabulary ? `I can use words like ${vocabulary}.` : ''}`.trim();
}

export function suggestEnglishFromVietnamese({ text, turn }) {
    const normalized = normalizeVietnamese(text);
    if (!normalized || !turn?.id) {
        return {
            mode: 'empty',
            suggestion: '',
            matchedPatterns: [],
            note: 'Type a short Vietnamese idea to receive a phrase-bank suggestion.',
        };
    }

    const rules = HELPER_BANK[turn.id] || [];
    let bestRule = null;
    let bestScore = 0;

    for (const rule of rules) {
        const matchedPatterns = rule.patterns.filter((pattern) => normalized.includes(pattern));
        if (matchedPatterns.length > bestScore) {
            bestRule = { ...rule, matchedPatterns };
            bestScore = matchedPatterns.length;
        }
    }

    if (bestRule) {
        return {
            mode: 'matched',
            suggestion: bestRule.suggestion,
            matchedPatterns: bestRule.matchedPatterns,
            note: 'Dictionary-based helper matched your Vietnamese idea to a ready-made English speaking pattern.',
        };
    }

    return {
        mode: 'scaffold',
        suggestion: buildScaffold(turn),
        matchedPatterns: [],
        note: 'No close phrase match was found, so the helper generated a simple scaffold from the prompt.',
    };
}

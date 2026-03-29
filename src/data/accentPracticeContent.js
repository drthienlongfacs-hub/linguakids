export const ACCENT_PREVIEW_TEXT = 'Hello, how are you today?';
export const PERSONALITY_PREVIEW_TEXT = 'This is how I sound when speaking naturally.';
export const ACCENT_PRACTICE_TOTAL = 5;

export const PRACTICE_SENTENCES = [
    { id: 'sentence-1', text: 'Can I have a glass of water, please?', vi: 'Cho toi mot ly nuoc duoc khong?', category: 'daily' },
    { id: 'sentence-2', text: 'The meeting has been rescheduled to Friday.', vi: 'Cuoc hop da doi sang thu Sau.', category: 'work' },
    { id: 'sentence-3', text: 'I really enjoyed the movie last night.', vi: 'Toi rat thich bo phim toi qua.', category: 'casual' },
    { id: 'sentence-4', text: 'Could you tell me how to get to the hospital?', vi: 'Ban co the chi duong den benh vien khong?', category: 'travel' },
    { id: 'sentence-5', text: 'The weather forecast says it will rain tomorrow.', vi: 'Du bao thoi tiet noi ngay mai se mua.', category: 'daily' },
    { id: 'sentence-6', text: 'I would like to make a reservation for two.', vi: 'Toi muon dat ban cho hai nguoi.', category: 'restaurant' },
    { id: 'sentence-7', text: 'She graduated from university with honours.', vi: 'Co ay tot nghiep dai hoc loai xuat sac.', category: 'academic' },
    { id: 'sentence-8', text: 'The children are playing in the park after school.', vi: 'Cac em dang choi trong cong vien sau gio hoc.', category: 'daily' },
    { id: 'sentence-9', text: 'What time does the next train to London depart?', vi: 'Tau di London chuyen tiep theo khoi hanh luc may gio?', category: 'travel' },
    { id: 'sentence-10', text: 'Practice makes perfect, so keep trying!', vi: 'Tap luyen tao nen hoan hao, hay tiep tuc co gang!', category: 'motivation' },
];

export const ACCENT_VOICE_PACK_CONFIG = {
    us: {
        broadcast: { voice: 'en-US-ChristopherNeural', voiceLabel: 'Christopher Neural', rate: '-4%', pitch: '-2Hz', volume: '+0%' },
        natural: { voice: 'en-US-AvaNeural', voiceLabel: 'Ava Neural', rate: '+0%', pitch: '+0Hz', volume: '+0%' },
        energetic: { voice: 'en-US-EmmaNeural', voiceLabel: 'Emma Neural', rate: '+14%', pitch: '+3Hz', volume: '+0%' },
        dramatic: { voice: 'en-US-BrianNeural', voiceLabel: 'Brian Neural', rate: '-16%', pitch: '-4Hz', volume: '-5%' },
        premium: { voice: 'en-US-MichelleNeural', voiceLabel: 'Michelle Neural', rate: '-8%', pitch: '+0Hz', volume: '-2%' },
        dynamic: { voice: 'en-US-GuyNeural', voiceLabel: 'Guy Neural', rate: '+8%', pitch: '+2Hz', volume: '+0%' },
    },
    uk: {
        broadcast: { voice: 'en-GB-RyanNeural', voiceLabel: 'Ryan Neural', rate: '-4%', pitch: '-2Hz', volume: '+0%' },
        natural: { voice: 'en-GB-SoniaNeural', voiceLabel: 'Sonia Neural', rate: '+0%', pitch: '+0Hz', volume: '+0%' },
        energetic: { voice: 'en-GB-MaisieNeural', voiceLabel: 'Maisie Neural', rate: '+12%', pitch: '+3Hz', volume: '+0%' },
        dramatic: { voice: 'en-GB-ThomasNeural', voiceLabel: 'Thomas Neural', rate: '-16%', pitch: '-4Hz', volume: '-4%' },
        premium: { voice: 'en-GB-LibbyNeural', voiceLabel: 'Libby Neural', rate: '-8%', pitch: '+0Hz', volume: '-2%' },
        dynamic: { voice: 'en-GB-RyanNeural', voiceLabel: 'Ryan Neural+', rate: '+9%', pitch: '+2Hz', volume: '+0%' },
    },
    au: {
        broadcast: { voice: 'en-AU-WilliamMultilingualNeural', voiceLabel: 'William Neural', rate: '-4%', pitch: '-2Hz', volume: '+0%' },
        natural: { voice: 'en-AU-NatashaNeural', voiceLabel: 'Natasha Neural', rate: '+0%', pitch: '+0Hz', volume: '+0%' },
        energetic: { voice: 'en-AU-NatashaNeural', voiceLabel: 'Natasha Neural+', rate: '+13%', pitch: '+3Hz', volume: '+0%' },
        dramatic: { voice: 'en-AU-WilliamMultilingualNeural', voiceLabel: 'William Neural+', rate: '-16%', pitch: '-4Hz', volume: '-4%' },
        premium: { voice: 'en-AU-NatashaNeural', voiceLabel: 'Natasha Neural Studio', rate: '-8%', pitch: '-1Hz', volume: '-2%' },
        dynamic: { voice: 'en-AU-WilliamMultilingualNeural', voiceLabel: 'William Neural TED', rate: '+9%', pitch: '+2Hz', volume: '+0%' },
    },
};

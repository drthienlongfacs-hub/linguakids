// videoCurriculum.js — 240+ curated YouTube videos
// Organized by CEFR level + skill area
// Sources: Super Simple Songs, BBC Learning English, English with Lucy,
// Rachel's English, engVid, Oxford Online English, Dream English Kids,
// Maple Leaf Learning, British Council, Storyline Online, TED-Ed, etc.

// Helper to build quiz questions quickly
const q = (question, questionVi, options, answer) => ({ q: question, qVi: questionVi, options, answer });

// ============================================================
// LEVEL 1: PRE-A1 — KIDS (Ages 2-6) — 60 videos
// ============================================================
export const LEVEL_1_KIDS = {
    id: 'kids-prea1', level: 'Pre-A1', title: 'Kids Foundation', titleVi: 'Nền tảng cho bé',
    ageRange: '2-6', icon: '🧒', color: '#EF4444',
    categories: [
        {
            id: 'k-phonics', title: 'Phonics & ABC', titleVi: 'Ngữ âm & Bảng chữ cái', icon: '🔤', color: '#EF4444',
            videos: [
                {
                    id: 'k-p1', youtubeId: 'hq3yfQnllfQ', title: 'ABC Song', titleVi: 'Bài hát ABC', duration: '2:30', channel: 'Super Simple Songs',
                    quiz: [q('How many letters in the alphabet?', 'Bảng chữ cái có bao nhiêu chữ?', ['20', '24', '26', '30'], 2)]
                },
                {
                    id: 'k-p2', youtubeId: 'BELlZKpi1Zs', title: 'Phonics Song', titleVi: 'Bài hát Phonics', duration: '4:30', channel: 'Super Simple Songs',
                    quiz: [q('A is for...?', 'A là chữ đầu của...?', ['Ball', 'Apple', 'Cat', 'Dog'], 1)]
                },
                {
                    id: 'k-p3', youtubeId: '36IBDpTRVNE', title: 'Phonics Song 2', titleVi: 'Bài hát Phonics 2', duration: '3:45', channel: 'Kids TV',
                    quiz: [q('B is for...?', 'B là chữ đầu của...?', ['Bear', 'Cat', 'Dog', 'Egg'], 0)]
                },
                {
                    id: 'k-p4', youtubeId: 'eEmXHJX7Wb0', title: 'Learn Letter A', titleVi: 'Học chữ A', duration: '3:00', channel: 'Dream English Kids',
                    quiz: [q('What sound does A make?', 'Chữ A phát âm thế nào?', ['/a/', '/b/', '/c/', '/d/'], 0)]
                },
                {
                    id: 'k-p5', youtubeId: '8IW3RB1vVTg', title: 'ABC Uppercase', titleVi: 'ABC Chữ in hoa', duration: '5:15', channel: 'Maple Leaf Learning',
                    quiz: [q('Which is uppercase?', 'Chữ nào là in hoa?', ['a', 'B', 'c', 'd'], 1)]
                },
                {
                    id: 'k-p6', youtubeId: '_UR-l3QI2nE', title: 'ABC Lowercase', titleVi: 'ABC Chữ thường', duration: '4:50', channel: 'Maple Leaf Learning',
                    quiz: [q('Which is lowercase?', 'Chữ nào là chữ thường?', ['A', 'B', 'c', 'D'], 2)]
                },
                {
                    id: 'k-p7', youtubeId: 'RUSCz41aDug', title: 'Short Vowel Sounds', titleVi: 'Nguyên âm ngắn', duration: '3:20', channel: 'Dream English Kids',
                    quiz: [q('How many vowels?', 'Có bao nhiêu nguyên âm?', ['3', '4', '5', '6'], 2)]
                },
                {
                    id: 'k-p8', youtubeId: 'gp1UmVSlLJ4', title: 'Long Vowel Sounds', titleVi: 'Nguyên âm dài', duration: '4:10', channel: 'Jack Hartmann',
                    quiz: [q('"cake" has a long...', '\"cake\" có nguyên âm dài...?', ['A', 'E', 'I', 'O'], 0)]
                },
            ]
        },
        {
            id: 'k-numbers', title: 'Numbers & Counting', titleVi: 'Số đếm', icon: '🔢', color: '#F59E0B',
            videos: [
                {
                    id: 'k-n1', youtubeId: 'DR-cfDsHCGA', title: 'Count 1-10', titleVi: 'Đếm 1-10', duration: '2:45', channel: 'Super Simple Songs',
                    quiz: [q('What comes after 7?', 'Số nào sau 7?', ['6', '8', '9', '5'], 1)]
                },
                {
                    id: 'k-n2', youtubeId: '0TgLtF3PMOc', title: 'Count 1-20', titleVi: 'Đếm 1-20', duration: '3:30', channel: 'Dream English Kids',
                    quiz: [q('What is 10+5?', '10+5 bằng mấy?', ['12', '14', '15', '16'], 2)]
                },
                {
                    id: 'k-n3', youtubeId: 'Yt8GFgxlITs', title: 'Count 1-100', titleVi: 'Đếm 1-100', duration: '5:00', channel: 'Jack Hartmann',
                    quiz: [q('What comes after 99?', 'Sau 99 là số mấy?', ['98', '100', '101', '90'], 1)]
                },
                {
                    id: 'k-n4', youtubeId: 'e0dJWfQHF8Y', title: 'Number Song 1-10', titleVi: 'Bài hát số 1-10', duration: '2:50', channel: 'Maple Leaf Learning',
                    quiz: [q('How many fingers on one hand?', 'Một bàn tay có mấy ngón?', ['4', '5', '6', '10'], 1)]
                },
                {
                    id: 'k-n5', youtubeId: '85M1yxIcHpw', title: 'Count by 2s', titleVi: 'Đếm nhảy 2', duration: '3:00', channel: 'Jack Hartmann',
                    quiz: [q('2, 4, 6, ... ?', '2, 4, 6, ... ?', ['7', '8', '9', '10'], 1)]
                },
                {
                    id: 'k-n6', youtubeId: 'IjcX3MVSdyA', title: 'Count by 5s', titleVi: 'Đếm nhảy 5', duration: '2:40', channel: 'Scratch Garden',
                    quiz: [q('5, 10, 15, ... ?', '5, 10, 15, ... ?', ['16', '18', '20', '25'], 2)]
                },
            ]
        },
        {
            id: 'k-colors', title: 'Colors & Shapes', titleVi: 'Màu sắc & Hình dạng', icon: '🎨', color: '#8B5CF6',
            videos: [
                {
                    id: 'k-c1', youtubeId: 'jYAWf8Y91hA', title: 'Color Song', titleVi: 'Bài hát Màu sắc', duration: '2:10', channel: 'Dream English Kids',
                    quiz: [q('What color is the sky?', 'Bầu trời màu gì?', ['Red', 'Green', 'Blue', 'Yellow'], 2)]
                },
                {
                    id: 'k-c2', youtubeId: 'ybt2jhCQ3lA', title: 'I See Something Blue', titleVi: 'Tôi thấy màu xanh', duration: '3:00', channel: 'Super Simple Songs',
                    quiz: [q('Grass is...?', 'Cỏ có màu...?', ['Red', 'Blue', 'Green', 'Yellow'], 2)]
                },
                {
                    id: 'k-c3', youtubeId: 'zxIpA5nF_LY', title: 'Shape Song', titleVi: 'Bài hát Hình dạng', duration: '2:45', channel: 'Maple Leaf Learning',
                    quiz: [q('A ball is a...?', 'Quả bóng hình...?', ['Square', 'Triangle', 'Circle', 'Star'], 2)]
                },
                {
                    id: 'k-c4', youtubeId: 'tRNy2i75tCc', title: 'Rainbow Colors', titleVi: 'Bảy sắc cầu vồng', duration: '3:10', channel: 'Super Simple Songs',
                    quiz: [q('How many colors in rainbow?', 'Cầu vồng có mấy màu?', ['5', '6', '7', '8'], 2)]
                },
                {
                    id: 'k-c5', youtubeId: 'GFSsRYmSlZ0', title: 'Mix Colors', titleVi: 'Pha màu', duration: '3:30', channel: 'Peekaboo Kidz',
                    quiz: [q('Red + Blue = ?', 'Đỏ + Xanh dương = ?', ['Green', 'Purple', 'Orange', 'Yellow'], 1)]
                },
                {
                    id: 'k-c6', youtubeId: 'OEbRDtCAFdU', title: 'Shapes All Around', titleVi: 'Hình dạng xung quanh', duration: '2:55', channel: 'Jack Hartmann',
                    quiz: [q('A door is a...?', 'Cánh cửa hình...?', ['Circle', 'Rectangle', 'Triangle', 'Star'], 1)]
                },
            ]
        },
        {
            id: 'k-animals', title: 'Animals & Nature', titleVi: 'Động vật & Thiên nhiên', icon: '🐾', color: '#059669',
            videos: [
                {
                    id: 'k-a1', youtubeId: 'OwRmivbNgQk', title: 'Animal Sounds', titleVi: 'Tiếng kêu động vật', duration: '3:15', channel: 'Super Simple Songs',
                    quiz: [q('A dog says...?', 'Con chó kêu...?', ['Meow', 'Moo', 'Woof', 'Baa'], 2)]
                },
                {
                    id: 'k-a2', youtubeId: 'pWepfJ-8XU0', title: 'Walking in the Jungle', titleVi: 'Đi trong rừng', duration: '4:00', channel: 'Super Simple Songs',
                    quiz: [q('A lion is...?', 'Sư tử là...?', ['Small', 'Big', 'Tiny', 'Short'], 1)]
                },
                {
                    id: 'k-a3', youtubeId: 'XqZsoesa55w', title: 'Baby Shark', titleVi: 'Cá mập con', duration: '2:16', channel: 'Pinkfong',
                    quiz: [q('Baby shark, doo doo doo...', 'Cá mập con, doo doo doo...', ['Dance', 'Swim', 'Run', 'Fly'], 1)]
                },
                {
                    id: 'k-a4', youtubeId: 'zXEq-QO3xTg', title: 'Farm Animals', titleVi: 'Động vật nông trại', duration: '3:40', channel: 'Dream English Kids',
                    quiz: [q('A cow gives us...?', 'Bò cho ta...?', ['Eggs', 'Milk', 'Wool', 'Honey'], 1)]
                },
                {
                    id: 'k-a5', youtubeId: 'Oxw6FoUNeT4', title: 'Sea Animals', titleVi: 'Động vật biển', duration: '3:50', channel: 'Maple Leaf Learning',
                    quiz: [q('An octopus has ... arms', 'Bạch tuộc có ... tay', ['4', '6', '8', '10'], 2)]
                },
                {
                    id: 'k-a6', youtubeId: '_Ir0Mc6Qilo', title: 'Insects Song', titleVi: 'Bài hát côn trùng', duration: '3:20', channel: 'Fun Kids English',
                    quiz: [q('A butterfly has...?', 'Bướm có...?', ['2 wings', '4 wings', '6 wings', '8 wings'], 1)]
                },
            ]
        },
        {
            id: 'k-body', title: 'Body & Actions', titleVi: 'Cơ thể & Hành động', icon: '🏃', color: '#EC4899',
            videos: [
                {
                    id: 'k-b1', youtubeId: 'ZanHgPprl-0', title: 'Head Shoulders Knees Toes', titleVi: 'Đầu Vai Đầu gối Ngón chân', duration: '2:45', channel: 'Super Simple Songs',
                    quiz: [q('After shoulders?', 'Sau vai là?', ['Toes', 'Knees', 'Eyes', 'Arms'], 1)]
                },
                {
                    id: 'k-b2', youtubeId: 'h4eueDYPTIg', title: 'If You\'re Happy', titleVi: 'Nếu bạn vui', duration: '3:00', channel: 'Super Simple Songs',
                    quiz: [q('If happy, clap your...?', 'Nếu vui, vỗ tay...?', ['Feet', 'Hands', 'Head', 'Legs'], 1)]
                },
                {
                    id: 'k-b3', youtubeId: 'QkHQ0CYwjaI', title: 'My Body Parts', titleVi: 'Bộ phận cơ thể', duration: '3:30', channel: 'Dream English Kids',
                    quiz: [q('You see with your...?', 'Bạn nhìn bằng...?', ['Ears', 'Eyes', 'Nose', 'Mouth'], 1)]
                },
                {
                    id: 'k-b4', youtubeId: '-ozG4PFFP5A', title: 'Action Verbs Song', titleVi: 'Bài hát động từ', duration: '3:15', channel: 'Fun Kids English',
                    quiz: [q('Running, jumping, and...?', 'Chạy, nhảy, và...?', ['Sleeping', 'Swimming', 'Eating', 'All'], 3)]
                },
                {
                    id: 'k-b5', youtubeId: 'YVgv1EFJZHc', title: 'Five Senses', titleVi: 'Năm giác quan', duration: '3:45', channel: 'Jack Hartmann',
                    quiz: [q('How many senses?', 'Có mấy giác quan?', ['3', '4', '5', '6'], 2)]
                },
                {
                    id: 'k-b6', youtubeId: 'L_A_HjHZxfI', title: 'Exercise Song', titleVi: 'Bài hát tập thể dục', duration: '2:50', channel: 'The Kiboomers',
                    quiz: [q('Touch your...toes!', 'Chạm vào...ngón chân!', ['Head', 'Toes', 'Knees', 'Eyes'], 1)]
                },
            ]
        },
        {
            id: 'k-songs', title: 'Nursery Rhymes', titleVi: 'Đồng dao', icon: '🎵', color: '#0EA5E9',
            videos: [
                {
                    id: 'k-s1', youtubeId: 'e_04ZrNroTo', title: 'Wheels on the Bus', titleVi: 'Bánh xe trên xe buýt', duration: '3:20', channel: 'Super Simple Songs',
                    quiz: [q('Wheels go...?', 'Bánh xe quay...?', ['Up down', 'Round and round', 'Side to side', 'Fast'], 1)]
                },
                {
                    id: 'k-s2', youtubeId: 'yCjJyiqpAuU', title: 'Old MacDonald', titleVi: 'Bác MacDonald', duration: '4:00', channel: 'Super Simple Songs',
                    quiz: [q('Old MacDonald had a...?', 'Bác MacDonald có một...?', ['Car', 'Farm', 'House', 'School'], 1)]
                },
                {
                    id: 'k-s3', youtubeId: '0VLxWIHRD4E', title: 'Twinkle Twinkle', titleVi: 'Ngôi sao lấp lánh', duration: '2:30', channel: 'Super Simple Songs',
                    quiz: [q('Stars are in the...?', 'Ngôi sao ở trên...?', ['Ground', 'Water', 'Sky', 'Tree'], 2)]
                },
                {
                    id: 'k-s4', youtubeId: 'v0aRb4rAq0I', title: 'Row Row Row', titleVi: 'Chèo chèo chèo', duration: '2:40', channel: 'Maple Leaf Learning',
                    quiz: [q('Row your...?', 'Chèo cái...?', ['Car', 'Boat', 'Bus', 'Train'], 1)]
                },
                {
                    id: 'k-s5', youtubeId: 'LFrKYjrIDs8', title: 'Rain Rain Go Away', titleVi: 'Mưa mưa đi đi', duration: '2:15', channel: 'Super Simple Songs',
                    quiz: [q('Rain, rain, go...?', 'Mưa, mưa, đi...?', ['Come', 'Away', 'Here', 'Stay'], 1)]
                },
                {
                    id: 'k-s6', youtubeId: 'w_lCi8U49mY', title: 'Itsy Bitsy Spider', titleVi: 'Nhện nhỏ leo', duration: '2:55', channel: 'Super Simple Songs',
                    quiz: [q('The spider went up the...?', 'Nhện leo lên...?', ['Tree', 'Wall', 'Waterspout', 'Hill'], 2)]
                },
            ]
        },
    ]
};

export default LEVEL_1_KIDS;

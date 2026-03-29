// videoCurriculumL2.js — Level 2: A1 Beginner (Ages 6-10 / Adult Beginner) — 60 videos
// Sources: British Council, BBC Learning English, EnglishClass101, Daily English Conversation

const q = (question, questionVi, options, answer) => ({ q: question, qVi: questionVi, options, answer });

export const LEVEL_2_BEGINNER = {
    id: 'beginner-a1', level: 'A1', title: 'Beginner', titleVi: 'Cơ bản',
    ageRange: '6-10 / Adult Beginner', icon: '📗', color: '#059669',
    categories: [
        {
            id: 'b-vocab', title: 'Essential Vocabulary', titleVi: 'Từ vựng thiết yếu', icon: '📝', color: '#059669',
            videos: [
                {
                    id: 'b-v1', youtubeId: 'tFY9jK7OHYg', title: '100 Basic Words', titleVi: '100 từ cơ bản', duration: '12:30', channel: 'EnglishClass101',
                    quiz: [q('What is "house" in Vietnamese?', '\"House\" nghĩa là gì?', ['Xe', 'Nhà', 'Trường', 'Cây'], 1)]
                },
                {
                    id: 'b-v2', youtubeId: '9AOAH0j14qQ', title: 'Daily Actions', titleVi: 'Hành động hàng ngày', duration: '5:20', channel: 'British Council',
                    quiz: [q('"Eat" means...?', '\"Eat\" nghĩa là...?', ['Uống', 'Ăn', 'Ngủ', 'Đi'], 1)]
                },
                {
                    id: 'b-v3', youtubeId: 'FHaObkHEkHQ', title: 'Family Members', titleVi: 'Thành viên gia đình', duration: '4:15', channel: 'Dream English Kids',
                    quiz: [q('Your mother\'s mother is your...?', 'Mẹ của mẹ bạn là...?', ['Aunt', 'Sister', 'Grandmother', 'Cousin'], 2)]
                },
                {
                    id: 'b-v4', youtubeId: 'frN3nvhIHUk', title: 'Food Vocabulary', titleVi: 'Từ vựng thức ăn', duration: '6:00', channel: 'EnglishClass101',
                    quiz: [q('Bread, butter, and...?', 'Bánh mì, bơ, và...?', ['Water', 'Jam', 'Run', 'Book'], 1)]
                },
                {
                    id: 'b-v5', youtubeId: 'EIQQAzaSsw8', title: 'Clothes & Fashion', titleVi: 'Quần áo & Thời trang', duration: '5:40', channel: 'BBC Learning English',
                    quiz: [q('You wear shoes on your...?', 'Bạn đi giày ở...?', ['Hands', 'Head', 'Feet', 'Arms'], 2)]
                },
                {
                    id: 'b-v6', youtubeId: 'rD6FRDd9Hew', title: 'Weather Words', titleVi: 'Từ vựng thời tiết', duration: '4:30', channel: 'British Council',
                    quiz: [q('When it rains you need a...?', 'Khi mưa bạn cần...?', ['Hat', 'Umbrella', 'Song', 'Book'], 1)]
                },
            ]
        },
        {
            id: 'b-grammar', title: 'Basic Grammar', titleVi: 'Ngữ pháp cơ bản', icon: '📐', color: '#6366F1',
            videos: [
                {
                    id: 'b-g1', youtubeId: 'MqjKOZSdG90', title: 'Am/Is/Are', titleVi: 'Am/Is/Are', duration: '5:10', channel: 'BBC Learning English',
                    quiz: [q('She ___ happy', 'Cô ấy ___ vui', ['am', 'is', 'are', 'be'], 1)]
                },
                {
                    id: 'b-g2', youtubeId: 'LppAASWtUZU', title: 'A/An/The', titleVi: 'Mạo từ A/An/The', duration: '6:00', channel: 'engVid',
                    quiz: [q('___ apple', '___ quả táo', ['A', 'An', 'The', 'No article'], 1)]
                },
                {
                    id: 'b-g3', youtubeId: 'P2jvBE6DiHo', title: 'Simple Present', titleVi: 'Thì hiện tại đơn', duration: '7:15', channel: 'engVid',
                    quiz: [q('She ___ to school every day', 'Cô ấy ___ đến trường mỗi ngày', ['go', 'goes', 'going', 'went'], 1)]
                },
                {
                    id: 'b-g4', youtubeId: 'a9_a0kH1XYM', title: 'This/That/These/Those', titleVi: 'This/That/These/Those', duration: '4:45', channel: 'BBC Learning English',
                    quiz: [q('___ is my book (near)', '___ là sách của tôi (gần)', ['That', 'Those', 'This', 'These'], 2)]
                },
                {
                    id: 'b-g5', youtubeId: '_k5DYl0el14', title: 'Can/Can\'t', titleVi: 'Có thể/Không thể', duration: '5:00', channel: 'English with Lucy',
                    quiz: [q('I ___ swim (ability)', 'Tôi ___ bơi (khả năng)', ['can', 'is', 'do', 'have'], 0)]
                },
                {
                    id: 'b-g6', youtubeId: 'VSwsy6GEwOs', title: 'Prepositions in/on/at', titleVi: 'Giới từ in/on/at', duration: '6:20', channel: 'Oxford Online English',
                    quiz: [q('The book is ___ the table', 'Sách ở ___ bàn', ['at', 'in', 'on', 'under'], 2)]
                },
            ]
        },
        {
            id: 'b-listen', title: 'Listening Practice', titleVi: 'Luyện nghe', icon: '👂', color: '#EC4899',
            videos: [
                {
                    id: 'b-l1', youtubeId: 'Fw0rdSHzWFY', title: 'Greetings', titleVi: 'Chào hỏi', duration: '5:30', channel: 'Daily English Conversation',
                    quiz: [q('"Good morning" is said in the...?', '\"Good morning\" nói vào...?', ['Evening', 'Morning', 'Night', 'Afternoon'], 1)]
                },
                {
                    id: 'b-l2', youtubeId: 'd6J0OMjcQfc', title: 'At the Shop', titleVi: 'Tại cửa hàng', duration: '6:10', channel: 'Daily English Conversation',
                    quiz: [q('"How much?" asks about...?', '\"How much?\" hỏi về...?', ['Color', 'Size', 'Price', 'Time'], 2)]
                },
                {
                    id: 'b-l3', youtubeId: '7isSwerYaQc', title: 'At School', titleVi: 'Ở trường', duration: '5:45', channel: 'Daily English Conversation',
                    quiz: [q('The teacher says "Open your..."', 'Cô giáo nói \"Mở...\"', ['Door', 'Book', 'Bag', 'Window'], 1)]
                },
                {
                    id: 'b-l4', youtubeId: 'QLR2pLUsl-Y', title: 'Three Little Pigs', titleVi: 'Ba chú heo con', duration: '8:15', channel: 'Storyline Online',
                    quiz: [q('The wolf blew down the...?', 'Sói thổi bay nhà...?', ['Brick', 'Straw', 'Stone', 'Glass'], 1)]
                },
                {
                    id: 'b-l5', youtubeId: 'IxVT84N7Mbk', title: 'Goldilocks', titleVi: 'Goldilocks & 3 Gấu', duration: '7:42', channel: 'Storyline Online',
                    quiz: [q('The porridge was too...?', 'Cháo quá...?', ['Cold', 'Hot', 'Big', 'Small'], 1)]
                },
                {
                    id: 'b-l6', youtubeId: 'qD1pnquN_DM', title: 'Daily Routines', titleVi: 'Thói quen hàng ngày', duration: '8:00', channel: 'BBC Learning English',
                    quiz: [q('I ___ up at 7am', 'Tôi ___ dậy lúc 7h', ['wake', 'eat', 'go', 'run'], 0)]
                },
            ]
        },
        {
            id: 'b-convo', title: 'Simple Conversations', titleVi: 'Hội thoại đơn giản', icon: '💬', color: '#F59E0B',
            videos: [
                {
                    id: 'b-c1', youtubeId: 'UnEmEbWytI8', title: 'Self Introduction', titleVi: 'Tự giới thiệu', duration: '5:00', channel: 'BBC Learning English',
                    quiz: [q('"My name is..." tells people your...?', '\"My name is...\" nói cho mọi người biết...?', ['Age', 'Name', 'Job', 'Country'], 1)]
                },
                {
                    id: 'b-c2', youtubeId: 'DPYJQSA-x50', title: 'Asking Directions', titleVi: 'Hỏi đường', duration: '6:20', channel: 'Oxford Online English',
                    quiz: [q('"Go straight" means...?', '\"Go straight\" nghĩa là...?', ['Turn left', 'Go forward', 'Stop', 'Go back'], 1)]
                },
                {
                    id: 'b-c3', youtubeId: 'bgfdqVmVjfk', title: 'Restaurant Dialogue', titleVi: 'Hội thoại nhà hàng', duration: '5:50', channel: 'Daily English Conversation',
                    quiz: [q('"I\'d like..." is used to...?', '\"I\'d like...\" dùng để...?', ['Complain', 'Order', 'Ask', 'Thank'], 1)]
                },
                {
                    id: 'b-c4', youtubeId: 'XRG9LfZmChQ', title: 'Doctor Visit', titleVi: 'Đi khám bệnh', duration: '6:30', channel: 'EnglishClass101',
                    quiz: [q('"I have a headache" means...?', '\"I have a headache\" nghĩa là...?', ['Đau bụng', 'Đau đầu', 'Đau chân', 'Đau lưng'], 1)]
                },
                {
                    id: 'b-c5', youtubeId: 'q7Vqhpb0iIA', title: 'Phone Conversation', titleVi: 'Nói chuyện điện thoại', duration: '5:15', channel: 'BBC Learning English',
                    quiz: [q('"Hello, who\'s calling?" is said by...?', '\"Hello, who\'s calling?\" do ai nói?', ['Caller', 'Receiver', 'Both', 'Neither'], 1)]
                },
                {
                    id: 'b-c6', youtubeId: 'OuW5iLHG3G4', title: 'Making Friends', titleVi: 'Kết bạn mới', duration: '4:40', channel: 'British Council',
                    quiz: [q('"Nice to meet you" is a...?', '\"Nice to meet you\" là lời...?', ['Goodbye', 'Greeting', 'Complaint', 'Request'], 1)]
                },
            ]
        },
        {
            id: 'b-pronun', title: 'Pronunciation', titleVi: 'Phát âm', icon: '🗣️', color: '#0EA5E9',
            videos: [
                {
                    id: 'b-pr1', youtubeId: 'n4NVPg2kHv4', title: 'Vowel Sounds', titleVi: 'Nguyên âm tiếng Anh', duration: '8:20', channel: 'Rachel\'s English',
                    quiz: [q('How many vowel letters?', 'Có bao nhiêu chữ nguyên âm?', ['3', '5', '7', '10'], 1)]
                },
                {
                    id: 'b-pr2', youtubeId: 'ldAKIzq7bvs', title: 'TH Sound', titleVi: 'Âm TH', duration: '5:30', channel: 'Rachel\'s English',
                    quiz: [q('"Think" starts with...?', '\"Think\" bắt đầu bằng âm...?', ['T', 'TH', 'S', 'F'], 1)]
                },
                {
                    id: 'b-pr3', youtubeId: 'Ft17a7tyjMM', title: 'R vs L', titleVi: 'Phân biệt R và L', duration: '6:40', channel: 'mmmEnglish',
                    quiz: [q('"Rice" has the ___ sound', '\"Rice\" có âm ___', ['L', 'R', 'W', 'Y'], 1)]
                },
                {
                    id: 'b-pr4', youtubeId: 'Vu6UVwkUgzc', title: 'Word Stress', titleVi: 'Trọng âm từ', duration: '7:00', channel: 'Oxford Online English',
                    quiz: [q('In "baNAna", stress is on...?', 'Trong \"baNAna\", trọng âm ở...?', ['1st', '2nd', '3rd', 'All'], 1)]
                },
                {
                    id: 'b-pr5', youtubeId: 'oxWxft6i9E4', title: 'S vs SH', titleVi: 'Phân biệt S và SH', duration: '5:15', channel: 'Rachel\'s English',
                    quiz: [q('"Ship" starts with...?', '\"Ship\" bắt đầu bằng...?', ['S', 'SH', 'CH', 'TH'], 1)]
                },
                {
                    id: 'b-pr6', youtubeId: 'SphjRJgNbWc', title: 'Silent Letters', titleVi: 'Chữ câm', duration: '6:10', channel: 'English with Lucy',
                    quiz: [q('The K in "knife" is...?', 'Chữ K trong \"knife\" là...?', ['Loud', 'Silent', 'Short', 'Long'], 1)]
                },
            ]
        },
    ]
};

export default LEVEL_2_BEGINNER;

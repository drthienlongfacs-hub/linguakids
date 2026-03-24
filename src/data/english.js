// English Curriculum — 50+ vocabulary items organized by theme
// Each word has: word, vietnamese, emoji, difficulty (1-3)

export const ENGLISH_TOPICS = [
    {
        id: 'greetings',
        title: 'Chào hỏi',
        titleEn: 'Greetings',
        emoji: '👋',
        color: '#3B82F6',
        words: [
            { word: 'Hello', vietnamese: 'Xin chào', emoji: '👋', difficulty: 1 },
            { word: 'Goodbye', vietnamese: 'Tạm biệt', emoji: '🤚', difficulty: 1 },
            { word: 'Good morning', vietnamese: 'Chào buổi sáng', emoji: '🌅', difficulty: 1 },
            { word: 'Good night', vietnamese: 'Chúc ngủ ngon', emoji: '🌙', difficulty: 1 },
            { word: 'Thank you', vietnamese: 'Cảm ơn', emoji: '🙏', difficulty: 1 },
            { word: 'Please', vietnamese: 'Làm ơn', emoji: '😊', difficulty: 1 },
            { word: 'Sorry', vietnamese: 'Xin lỗi', emoji: '😔', difficulty: 1 },
            { word: 'Yes', vietnamese: 'Có', emoji: '✅', difficulty: 1 },
            { word: 'No', vietnamese: 'Không', emoji: '❌', difficulty: 1 },
        ]
    },
    {
        id: 'colors',
        title: 'Màu sắc',
        titleEn: 'Colors',
        emoji: '🎨',
        color: '#EC4899',
        words: [
            { word: 'Red', vietnamese: 'Đỏ', emoji: '🔴', difficulty: 1 },
            { word: 'Blue', vietnamese: 'Xanh dương', emoji: '🔵', difficulty: 1 },
            { word: 'Yellow', vietnamese: 'Vàng', emoji: '🟡', difficulty: 1 },
            { word: 'Green', vietnamese: 'Xanh lá', emoji: '🟢', difficulty: 1 },
            { word: 'Orange', vietnamese: 'Cam', emoji: '🟠', difficulty: 1 },
            { word: 'Pink', vietnamese: 'Hồng', emoji: '🩷', difficulty: 1 },
            { word: 'Purple', vietnamese: 'Tím', emoji: '🟣', difficulty: 2 },
            { word: 'White', vietnamese: 'Trắng', emoji: '⚪', difficulty: 1 },
            { word: 'Black', vietnamese: 'Đen', emoji: '⚫', difficulty: 1 },
        ]
    },
    {
        id: 'numbers',
        title: 'Số đếm',
        titleEn: 'Numbers',
        emoji: '🔢',
        color: '#F59E0B',
        words: [
            { word: 'One', vietnamese: 'Một', emoji: '1️⃣', difficulty: 1 },
            { word: 'Two', vietnamese: 'Hai', emoji: '2️⃣', difficulty: 1 },
            { word: 'Three', vietnamese: 'Ba', emoji: '3️⃣', difficulty: 1 },
            { word: 'Four', vietnamese: 'Bốn', emoji: '4️⃣', difficulty: 1 },
            { word: 'Five', vietnamese: 'Năm', emoji: '5️⃣', difficulty: 1 },
            { word: 'Six', vietnamese: 'Sáu', emoji: '6️⃣', difficulty: 1 },
            { word: 'Seven', vietnamese: 'Bảy', emoji: '7️⃣', difficulty: 2 },
            { word: 'Eight', vietnamese: 'Tám', emoji: '8️⃣', difficulty: 2 },
            { word: 'Nine', vietnamese: 'Chín', emoji: '9️⃣', difficulty: 2 },
            { word: 'Ten', vietnamese: 'Mười', emoji: '🔟', difficulty: 2 },
        ]
    },
    {
        id: 'animals',
        title: 'Động vật',
        titleEn: 'Animals',
        emoji: '🐾',
        color: '#10B981',
        words: [
            { word: 'Dog', vietnamese: 'Con chó', emoji: '🐶', difficulty: 1 },
            { word: 'Cat', vietnamese: 'Con mèo', emoji: '🐱', difficulty: 1 },
            { word: 'Bird', vietnamese: 'Con chim', emoji: '🐦', difficulty: 1 },
            { word: 'Fish', vietnamese: 'Con cá', emoji: '🐟', difficulty: 1 },
            { word: 'Rabbit', vietnamese: 'Con thỏ', emoji: '🐰', difficulty: 2 },
            { word: 'Elephant', vietnamese: 'Con voi', emoji: '🐘', difficulty: 2 },
            { word: 'Lion', vietnamese: 'Sư tử', emoji: '🦁', difficulty: 2 },
            { word: 'Monkey', vietnamese: 'Con khỉ', emoji: '🐵', difficulty: 2 },
            { word: 'Butterfly', vietnamese: 'Con bướm', emoji: '🦋', difficulty: 3 },
        ]
    },
    {
        id: 'family',
        title: 'Gia đình',
        titleEn: 'Family',
        emoji: '👨‍👩‍👦',
        color: '#8B5CF6',
        words: [
            { word: 'Mom', vietnamese: 'Mẹ', emoji: '👩', difficulty: 1 },
            { word: 'Dad', vietnamese: 'Ba / Bố', emoji: '👨', difficulty: 1 },
            { word: 'Brother', vietnamese: 'Anh / Em trai', emoji: '👦', difficulty: 2 },
            { word: 'Sister', vietnamese: 'Chị / Em gái', emoji: '👧', difficulty: 2 },
            { word: 'Grandma', vietnamese: 'Bà', emoji: '👵', difficulty: 2 },
            { word: 'Grandpa', vietnamese: 'Ông', emoji: '👴', difficulty: 2 },
            { word: 'Baby', vietnamese: 'Em bé', emoji: '👶', difficulty: 1 },
        ]
    },
    {
        id: 'food',
        title: 'Đồ ăn',
        titleEn: 'Food',
        emoji: '🍎',
        color: '#EF4444',
        words: [
            { word: 'Apple', vietnamese: 'Quả táo', emoji: '🍎', difficulty: 1 },
            { word: 'Banana', vietnamese: 'Quả chuối', emoji: '🍌', difficulty: 1 },
            { word: 'Rice', vietnamese: 'Cơm', emoji: '🍚', difficulty: 1 },
            { word: 'Water', vietnamese: 'Nước', emoji: '💧', difficulty: 1 },
            { word: 'Milk', vietnamese: 'Sữa', emoji: '🥛', difficulty: 1 },
            { word: 'Egg', vietnamese: 'Trứng', emoji: '🥚', difficulty: 1 },
            { word: 'Bread', vietnamese: 'Bánh mì', emoji: '🍞', difficulty: 2 },
            { word: 'Cake', vietnamese: 'Bánh kem', emoji: '🎂', difficulty: 1 },
            { word: 'Ice cream', vietnamese: 'Kem', emoji: '🍦', difficulty: 1 },
        ]
    },
    {
        id: 'actions',
        title: 'Hành động',
        titleEn: 'Actions',
        emoji: '🏃',
        color: '#06B6D4',
        words: [
            { word: 'Run', vietnamese: 'Chạy', emoji: '🏃', difficulty: 1 },
            { word: 'Jump', vietnamese: 'Nhảy', emoji: '🦘', difficulty: 1 },
            { word: 'Clap', vietnamese: 'Vỗ tay', emoji: '👏', difficulty: 1 },
            { word: 'Sing', vietnamese: 'Hát', emoji: '🎤', difficulty: 1 },
            { word: 'Dance', vietnamese: 'Nhảy múa', emoji: '💃', difficulty: 1 },
            { word: 'Read', vietnamese: 'Đọc sách', emoji: '📖', difficulty: 2 },
            { word: 'Write', vietnamese: 'Viết', emoji: '✍️', difficulty: 2 },
            { word: 'Sleep', vietnamese: 'Ngủ', emoji: '😴', difficulty: 1 },
            { word: 'Eat', vietnamese: 'Ăn', emoji: '🍽️', difficulty: 1 },
        ]
    },
];

// Flatten all words for game/quiz use
export const ALL_ENGLISH_WORDS = ENGLISH_TOPICS.flatMap(topic =>
    topic.words.map(w => ({ ...w, topicId: topic.id, topicTitle: topic.title }))
);

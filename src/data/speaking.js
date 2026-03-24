// Speaking Content — IELTS speaking prompts, shadowing exercises, pronunciation drills

export const SPEAKING_LESSONS = [
    // === Shadowing Exercises ===
    {
        id: 'shadow-travel',
        type: 'shadowing',
        title: 'Travel Conversations',
        titleVi: 'Hội thoại du lịch',
        level: 'B1',
        emoji: '✈️',
        mode: 'adult',
        sentences: [
            { text: "Excuse me, could you tell me how to get to the nearest subway station?", textVi: "Xin lỗi, bạn có thể chỉ cho tôi cách đến ga tàu điện ngầm gần nhất không?" },
            { text: "I'd like to book a room with a sea view for three nights, please.", textVi: "Tôi muốn đặt phòng có view biển cho ba đêm." },
            { text: "What time does the last train to the airport depart?", textVi: "Chuyến tàu cuối đến sân bay khởi hành lúc mấy giờ?" },
            { text: "Could I have the bill, please? We'd like to pay separately.", textVi: "Cho tôi tính tiền được không? Chúng tôi muốn trả riêng." },
            { text: "Is there a pharmacy nearby? I need some medicine for a headache.", textVi: "Gần đây có nhà thuốc không? Tôi cần thuốc đau đầu." },
        ],
    },
    {
        id: 'shadow-business',
        type: 'shadowing',
        title: 'Business Meeting Phrases',
        titleVi: 'Cụm từ họp công việc',
        level: 'B2',
        emoji: '💼',
        mode: 'adult',
        sentences: [
            { text: "Let me begin by outlining the key objectives for today's meeting.", textVi: "Cho phép tôi bắt đầu bằng việc nêu các mục tiêu chính của cuộc họp hôm nay." },
            { text: "I'd like to draw your attention to the figures on page three of the handout.", textVi: "Tôi muốn hướng sự chú ý của các bạn đến số liệu trang 3 của tài liệu." },
            { text: "Could you elaborate on how this would affect our timeline?", textVi: "Bạn có thể nói rõ hơn về việc này sẽ ảnh hưởng tiến độ thế nào?" },
            { text: "In summary, we need to increase our marketing budget by fifteen percent.", textVi: "Tóm lại, chúng ta cần tăng ngân sách marketing thêm 15%." },
            { text: "Let's schedule a follow-up meeting for next Thursday to review progress.", textVi: "Hãy đặt lịch họp tiếp vào thứ Năm tuần sau để xem tiến độ." },
        ],
    },
    {
        id: 'shadow-academic',
        type: 'shadowing',
        title: 'Academic Presentations',
        titleVi: 'Thuyết trình học thuật',
        level: 'B2',
        emoji: '🎓',
        mode: 'adult',
        sentences: [
            { text: "The research findings suggest a strong correlation between sleep quality and academic performance.", textVi: "Kết quả nghiên cứu cho thấy mối tương quan mạnh giữa chất lượng giấc ngủ và kết quả học tập." },
            { text: "However, it's important to note that correlation does not necessarily imply causation.", textVi: "Tuy nhiên, cần lưu ý rằng tương quan không nhất thiết có nghĩa là nhân quả." },
            { text: "The data was collected from a sample of five hundred university students over two semesters.", textVi: "Dữ liệu được thu thập từ 500 sinh viên đại học trong hai học kỳ." },
            { text: "These results are consistent with previous studies conducted in similar populations.", textVi: "Kết quả này phù hợp với các nghiên cứu trước đó trên nhóm dân số tương tự." },
        ],
    },

    // === IELTS Speaking Prompts ===
    {
        id: 'ielts-part1-intro',
        type: 'ielts_speaking',
        title: 'IELTS Part 1: Introduction',
        titleVi: 'IELTS Phần 1: Giới thiệu',
        level: 'B1',
        emoji: '🎤',
        mode: 'adult',
        part: 1,
        timeLimit: 300,
        questions: [
            { question: "Can you tell me your full name?", tip: "Say your full name clearly. Don't spell it unless asked.", tipVi: "Nói tên đầy đủ rõ ràng. Không cần đánh vần trừ khi được yêu cầu." },
            { question: "Where are you from?", tip: "Name your city/country and add 1-2 details about it.", tipVi: "Nêu tên thành phố/quốc gia và thêm 1-2 chi tiết." },
            { question: "Do you work or study?", tip: "Give a brief answer with reasons. Extend your response.", tipVi: "Trả lời ngắn gọn kèm lý do. Mở rộng câu trả lời." },
            { question: "What do you enjoy doing in your free time?", tip: "Name specific activities. Use present tenses.", tipVi: "Nêu hoạt động cụ thể. Dùng thì hiện tại." },
            { question: "Do you prefer reading books or watching movies?", tip: "State preference + explain why. Use comparative structures.", tipVi: "Nêu sở thích + giải thích. Dùng cấu trúc so sánh." },
        ],
    },
    {
        id: 'ielts-part2-cuecard',
        type: 'ielts_speaking',
        title: 'IELTS Part 2: Cue Card',
        titleVi: 'IELTS Phần 2: Thẻ đề bài',
        level: 'B2',
        emoji: '📋',
        mode: 'adult',
        part: 2,
        timeLimit: 120,
        cueCard: {
            topic: "Describe a book that has had a big influence on you.",
            points: [
                "What the book is called",
                "Who wrote it",
                "What it is about",
                "And explain why it has influenced you",
            ],
        },
        followUp: [
            "Do you think reading is important for young people?",
            "How has technology changed the way people read?",
            "What type of books do people in your country enjoy reading?",
        ],
    },

    // === Kids speaking ===
    {
        id: 'shadow-greetings',
        type: 'shadowing',
        title: 'Greetings & Introductions',
        titleVi: 'Chào hỏi & Giới thiệu',
        level: 'A1',
        emoji: '👋',
        mode: 'kids',
        sentences: [
            { text: "Hello! My name is Anna. What's your name?", textVi: "Xin chào! Tên mình là Anna. Bạn tên gì?" },
            { text: "Nice to meet you! How are you today?", textVi: "Rất vui được gặp bạn! Hôm nay bạn thế nào?" },
            { text: "I'm fine, thank you. And you?", textVi: "Mình khỏe, cảm ơn. Còn bạn?" },
            { text: "I am seven years old. How old are you?", textVi: "Mình bảy tuổi. Bạn bao nhiêu tuổi?" },
        ],
    },
];

export function getSpeakingByMode(mode) {
    if (mode === 'adult') return SPEAKING_LESSONS;
    return SPEAKING_LESSONS.filter(l => l.mode === 'kids' || l.level === 'A1');
}

import { KIDS_SPEAKING_CURRICULUM_LESSONS } from './speakingKidsCurriculum';

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

    // === Kids speaking curriculum ===
    ...KIDS_SPEAKING_CURRICULUM_LESSONS,

    // === More Shadowing Exercises ===
    {
        id: 'shadow-healthcare',
        type: 'shadowing',
        title: 'Healthcare & Doctor Visits',
        titleVi: 'Y tế & Khám bệnh',
        level: 'B2',
        emoji: '🏥',
        mode: 'adult',
        sentences: [
            { text: "I've been experiencing persistent headaches for the past two weeks.", textVi: "Tôi bị đau đầu liên tục trong hai tuần qua." },
            { text: "The doctor recommended that I take this medication twice a day after meals.", textVi: "Bác sĩ khuyên tôi uống thuốc này hai lần một ngày sau bữa ăn." },
            { text: "Could you explain the potential side effects of this treatment?", textVi: "Bạn có thể giải thích tác dụng phụ có thể có của phương pháp điều trị này không?" },
            { text: "I'd like to schedule a follow-up appointment for next week, please.", textVi: "Tôi muốn đặt lịch tái khám tuần sau." },
            { text: "My health insurance should cover most of the medical expenses.", textVi: "Bảo hiểm y tế của tôi sẽ chi trả hầu hết chi phí y tế." },
        ],
    },
    {
        id: 'shadow-technology',
        type: 'shadowing',
        title: 'Technology & Innovation',
        titleVi: 'Công nghệ & Đổi mới',
        level: 'B2',
        emoji: '💻',
        mode: 'adult',
        sentences: [
            { text: "Artificial intelligence is transforming every aspect of our daily lives.", textVi: "Trí tuệ nhân tạo đang thay đổi mọi khía cạnh cuộc sống hàng ngày." },
            { text: "The new software update has significantly improved the app's performance and user experience.", textVi: "Bản cập nhật phần mềm mới đã cải thiện đáng kể hiệu suất và trải nghiệm người dùng." },
            { text: "Cloud computing allows businesses to scale their operations more efficiently.", textVi: "Điện toán đám mây cho phép doanh nghiệp mở rộng hoạt động hiệu quả hơn." },
            { text: "Cybersecurity threats are becoming increasingly sophisticated and difficult to detect.", textVi: "Các mối đe dọa an ninh mạng ngày càng tinh vi và khó phát hiện." },
            { text: "Renewable energy technology has become more affordable and accessible than ever before.", textVi: "Công nghệ năng lượng tái tạo đã trở nên giá cả phải chăng và dễ tiếp cận hơn bao giờ hết." },
        ],
    },
    {
        id: 'shadow-environment',
        type: 'shadowing',
        title: 'Environment & Sustainability',
        titleVi: 'Môi trường & Bền vững',
        level: 'C1',
        emoji: '🌿',
        mode: 'adult',
        sentences: [
            { text: "Climate change poses an unprecedented threat to biodiversity and ecosystems worldwide.", textVi: "Biến đổi khí hậu gây ra mối đe dọa chưa từng có đối với đa dạng sinh học và hệ sinh thái toàn cầu." },
            { text: "Governments must implement stricter regulations to reduce carbon emissions from industrial activities.", textVi: "Chính phủ phải ban hành quy định chặt chẽ hơn để giảm lượng khí thải carbon từ hoạt động công nghiệp." },
            { text: "Sustainable development means meeting the needs of the present without compromising future generations.", textVi: "Phát triển bền vững nghĩa là đáp ứng nhu cầu hiện tại mà không ảnh hưởng đến thế hệ tương lai." },
            { text: "The circular economy model aims to eliminate waste through recycling and reusing materials.", textVi: "Mô hình kinh tế tuần hoàn nhằm loại bỏ chất thải thông qua tái chế và tái sử dụng vật liệu." },
        ],
    },
    {
        id: 'shadow-daily-life',
        type: 'shadowing',
        title: 'Daily Life & Routines',
        titleVi: 'Cuộc sống hàng ngày',
        level: 'B1',
        emoji: '☀️',
        mode: 'adult',
        sentences: [
            { text: "I usually wake up at six thirty and go for a quick jog before breakfast.", textVi: "Tôi thường dậy lúc 6:30 và chạy bộ nhanh trước bữa sáng." },
            { text: "After work, I like to unwind by cooking a nice meal and watching a documentary.", textVi: "Sau giờ làm, tôi thích thư giãn bằng cách nấu bữa tối ngon và xem phim tài liệu." },
            { text: "On weekends, my family and I often go to the local market to buy fresh produce.", textVi: "Cuối tuần, gia đình tôi thường đi chợ để mua thực phẩm tươi." },
            { text: "I've been trying to develop a habit of reading for at least thirty minutes every night.", textVi: "Tôi đang cố gắng tạo thói quen đọc sách ít nhất 30 phút mỗi tối." },
            { text: "Managing your time effectively is one of the most important skills you can learn.", textVi: "Quản lý thời gian hiệu quả là một trong những kỹ năng quan trọng nhất bạn có thể học." },
        ],
    },
    {
        id: 'shadow-news-media',
        type: 'shadowing',
        title: 'News & Current Affairs',
        titleVi: 'Tin tức & Thời sự',
        level: 'C1',
        emoji: '📰',
        mode: 'adult',
        sentences: [
            { text: "According to the latest report, global economic growth is expected to slow down significantly next year.", textVi: "Theo báo cáo mới nhất, tăng trưởng kinh tế toàn cầu dự kiến sẽ chậm lại đáng kể vào năm tới." },
            { text: "The government has announced a comprehensive plan to address the housing affordability crisis.", textVi: "Chính phủ đã công bố kế hoạch toàn diện để giải quyết cuộc khủng hoảng nhà ở." },
            { text: "Experts warn that misinformation on social media remains a serious threat to public discourse.", textVi: "Chuyên gia cảnh báo rằng thông tin sai lệch trên mạng xã hội vẫn là mối đe dọa nghiêm trọng." },
            { text: "International cooperation is essential for tackling global challenges such as pandemics and climate change.", textVi: "Hợp tác quốc tế là cần thiết để giải quyết các thách thức toàn cầu như đại dịch và biến đổi khí hậu." },
        ],
    },

    // === More IELTS Speaking ===
    {
        id: 'ielts-part3-discussion',
        type: 'ielts_speaking',
        title: 'IELTS Part 3: Discussion',
        titleVi: 'IELTS Phần 3: Thảo luận',
        level: 'C1',
        emoji: '🗣️',
        mode: 'adult',
        part: 3,
        timeLimit: 300,
        questions: [
            { question: "How has technology changed the way people communicate?", tip: "Give a balanced answer. Use examples from the past vs. now.", tipVi: "Trả lời cân bằng. Dùng ví dụ so sánh trước và bây giờ." },
            { question: "Do you think artificial intelligence will replace human workers in the future?", tip: "Express your opinion with reasons. Consider both sides.", tipVi: "Nêu quan điểm có lý do. Xem xét cả hai mặt." },
            { question: "What can governments do to encourage more sustainable living?", tip: "Suggest 2-3 specific policies. Use should/could/might.", tipVi: "Đề xuất 2-3 chính sách cụ thể. Dùng should/could/might." },
            { question: "Is it better for children to grow up in the city or the countryside?", tip: "Compare and contrast. Acknowledge both perspectives.", tipVi: "So sánh và đối chiếu. Thừa nhận cả hai góc nhìn." },
            { question: "How important is it for young people to learn a second language?", tip: "Use real-world benefits. Mention career, travel, cognitive advantages.", tipVi: "Dùng lợi ích thực tế. Đề cập sự nghiệp, du lịch, lợi ích nhận thức." },
        ],
    },
    {
        id: 'ielts-part2-describe-place',
        type: 'ielts_speaking',
        title: 'IELTS Part 2: Describe a Place',
        titleVi: 'IELTS Phần 2: Mô tả địa điểm',
        level: 'B2',
        emoji: '🏞️',
        mode: 'adult',
        part: 2,
        timeLimit: 120,
        cueCard: {
            topic: "Describe a place you visited that left a strong impression on you.",
            points: [
                "Where it was",
                "When you went there",
                "What you did there",
                "And explain why it left a strong impression",
            ],
        },
        followUp: [
            "Do you think tourism has a positive or negative impact on local communities?",
            "How has travel changed in the last 20 years?",
            "What makes a place worth visiting?",
        ],
    },
    {
        id: 'ielts-part1-technology',
        type: 'ielts_speaking',
        title: 'IELTS Part 1: Technology',
        titleVi: 'IELTS Phần 1: Công nghệ',
        level: 'B1',
        emoji: '📱',
        mode: 'adult',
        part: 1,
        timeLimit: 300,
        questions: [
            { question: "How often do you use the internet?", tip: "Give frequency + explain what you use it for.", tipVi: "Nêu tần suất + giải thích dùng để làm gì." },
            { question: "Do you think children spend too much time on electronic devices?", tip: "Give your opinion + specific reasons.", tipVi: "Nêu ý kiến + lý do cụ thể." },
            { question: "What technology do you find most useful in your daily life?", tip: "Name a specific device/app and explain why.", tipVi: "Nêu tên thiết bị/ứng dụng cụ thể và giải thích." },
            { question: "Do you prefer to shop online or in physical stores?", tip: "State preference clearly, then explain with examples.", tipVi: "Nêu rõ sở thích, rồi giải thích bằng ví dụ." },
        ],
    },

    // ═══════════════════════════════════════════════════════
    // IELTS Speaking Expansion — High-frequency topics
    // Source: Cambridge IELTS 12-19 topic analysis
    // ═══════════════════════════════════════════════════════

    // ── Part 1: Education ──
    {
        id: 'ielts-part1-education',
        type: 'ielts_speaking',
        title: 'IELTS Part 1: Education',
        titleVi: 'IELTS Phần 1: Giáo dục',
        level: 'B1',
        emoji: '📚',
        mode: 'adult',
        part: 1,
        timeLimit: 300,
        questions: [
            { question: "What subject did you enjoy most at school?", tip: "Name subject + explain why with a specific memory.", tipVi: "Nêu môn học + giải thích tại sao kèm kỷ niệm cụ thể." },
            { question: "Do you think the education system in your country is effective?", tip: "Give your opinion, then one strength and one weakness.", tipVi: "Nêu ý kiến, rồi một điểm mạnh và một điểm yếu." },
            { question: "Would you like to study abroad in the future?", tip: "State yes/no + reasons. Mention a specific country if possible.", tipVi: "Trả lời có/không + lý do. Nêu tên nước cụ thể nếu được." },
            { question: "How has the internet changed the way people learn?", tip: "Give 2 concrete examples. Compare past vs. present.", tipVi: "Cho 2 ví dụ cụ thể. So sánh quá khứ và hiện tại." },
            { question: "Do you prefer studying alone or in a group?", tip: "State preference clearly, give pros of your choice.", tipVi: "Nêu rõ sở thích, cho ưu điểm của lựa chọn." },
        ],
    },

    // ── Part 1: Health & Sports ──
    {
        id: 'ielts-part1-health',
        type: 'ielts_speaking',
        title: 'IELTS Part 1: Health & Sports',
        titleVi: 'IELTS Phần 1: Sức khỏe & Thể thao',
        level: 'B1',
        emoji: '🏃',
        mode: 'adult',
        part: 1,
        timeLimit: 300,
        questions: [
            { question: "What do you do to keep fit and healthy?", tip: "Mention specific activities, frequency, and why.", tipVi: "Nêu hoạt động cụ thể, tần suất, và lý do." },
            { question: "Do you play any sports regularly?", tip: "Name the sport, how often, who you play with.", tipVi: "Nêu tên môn, tần suất, chơi với ai." },
            { question: "Is it important for children to do physical exercise?", tip: "Say yes + give 2 benefits (physical + mental).", tipVi: "Nói có + cho 2 lợi ích (thể chất + tinh thần)." },
            { question: "Do you think people in your country eat healthily?", tip: "Give a balanced view. Mention traditional vs. modern food habits.", tipVi: "Nhận xét cân bằng. So sánh thói quen ăn truyền thống và hiện đại." },
        ],
    },

    // ── Part 1: Work & Career ──
    {
        id: 'ielts-part1-work',
        type: 'ielts_speaking',
        title: 'IELTS Part 1: Work & Career',
        titleVi: 'IELTS Phần 1: Công việc & Nghề nghiệp',
        level: 'B1',
        emoji: '💼',
        mode: 'adult',
        part: 1,
        timeLimit: 300,
        questions: [
            { question: "What kind of work do you do?", tip: "Name your job/field, main responsibilities, what you enjoy about it.", tipVi: "Nêu công việc, trách nhiệm chính, điều bạn thích." },
            { question: "What job would you like to have in the future?", tip: "Name a dream job + explain what attracts you.", tipVi: "Nêu công việc mơ ước + giải thích điểm hấp dẫn." },
            { question: "Do you prefer working from home or in an office?", tip: "State preference + 2 reasons. Acknowledge downsides briefly.", tipVi: "Nêu sở thích + 2 lý do. Nhắc qua nhược điểm." },
            { question: "Is work-life balance important to you?", tip: "Say yes + explain how you achieve it or struggle with it.", tipVi: "Nói có + giải thích cách bạn thực hiện hoặc khó khăn." },
        ],
    },

    // ── Part 2: Describe a Person ──
    {
        id: 'ielts-part2-person',
        type: 'ielts_speaking',
        title: 'IELTS Part 2: Describe a Person',
        titleVi: 'IELTS Phần 2: Mô tả người',
        level: 'B2',
        emoji: '👤',
        mode: 'adult',
        part: 2,
        prepTime: 60,
        timeLimit: 120,
        cueCard: {
            topic: "Describe someone who has had a significant influence on your life.",
            points: [
                "Who this person is",
                "How you know this person",
                "What this person has done",
                "And explain why they have influenced you",
            ],
        },
        followUp: [
            "Do you think famous people are good role models?",
            "How have role models changed compared to the past?",
            "Is it important for children to have role models?",
        ],
    },

    // ── Part 2: Describe an Event ──
    {
        id: 'ielts-part2-event',
        type: 'ielts_speaking',
        title: 'IELTS Part 2: Describe an Event',
        titleVi: 'IELTS Phần 2: Mô tả sự kiện',
        level: 'B2',
        emoji: '🎉',
        mode: 'adult',
        part: 2,
        prepTime: 60,
        timeLimit: 120,
        cueCard: {
            topic: "Describe a memorable celebration or event that you attended.",
            points: [
                "What the event was",
                "Where and when it took place",
                "Who was there with you",
                "And explain why it was memorable",
            ],
        },
        followUp: [
            "Do you think traditional celebrations are still important?",
            "How do celebrations differ between generations?",
            "Are festivals in your country becoming more commercialized?",
        ],
    },

    // ── Part 2: Describe an Achievement ──
    {
        id: 'ielts-part2-achievement',
        type: 'ielts_speaking',
        title: 'IELTS Part 2: Describe an Achievement',
        titleVi: 'IELTS Phần 2: Mô tả thành tựu',
        level: 'B2',
        emoji: '🏆',
        mode: 'adult',
        part: 2,
        prepTime: 60,
        timeLimit: 120,
        cueCard: {
            topic: "Describe something you achieved that you are proud of.",
            points: [
                "What you achieved",
                "When you achieved it",
                "How difficult it was",
                "And explain why you feel proud of it",
            ],
        },
        followUp: [
            "What motivates people to work hard?",
            "Is it better to set realistic or ambitious goals?",
            "How important is recognition for achievements?",
        ],
    },

    // ── Part 2: Describe a Skill ──
    {
        id: 'ielts-part2-skill',
        type: 'ielts_speaking',
        title: 'IELTS Part 2: Describe a Skill',
        titleVi: 'IELTS Phần 2: Mô tả kỹ năng',
        level: 'B2',
        emoji: '🎯',
        mode: 'adult',
        part: 2,
        prepTime: 60,
        timeLimit: 120,
        cueCard: {
            topic: "Describe a skill you learned that you found useful.",
            points: [
                "What the skill is",
                "How you learned it",
                "How long it took you to learn",
                "And explain why you found it useful",
            ],
        },
        followUp: [
            "What skills do you think will be important in the future?",
            "Is it better to learn from teachers or self-study?",
            "At what age should children start learning practical skills?",
        ],
    },

    // ── Part 3: Society & Culture ──
    {
        id: 'ielts-part3-society',
        type: 'ielts_speaking',
        title: 'IELTS Part 3: Society & Culture',
        titleVi: 'IELTS Phần 3: Xã hội & Văn hóa',
        level: 'C1',
        emoji: '🌏',
        mode: 'adult',
        part: 3,
        timeLimit: 300,
        questions: [
            { question: "How has globalization affected local cultures?", tip: "Discuss both positive (connection, exposure) and negative (homogenization) effects with examples.", tipVi: "Thảo luận cả mặt tích cực và tiêu cực kèm ví dụ." },
            { question: "Do you think social media has brought people closer together or driven them apart?", tip: "Take a nuanced position. Use 'on one hand... on the other hand' structure.", tipVi: "Đưa quan điểm cân bằng. Dùng cấu trúc 'một mặt... mặt khác'." },
            { question: "What role should the government play in promoting public health?", tip: "Give 2-3 specific policies. Use should/ought to/must.", tipVi: "Đưa 2-3 chính sách cụ thể. Dùng should/ought to/must." },
            { question: "Is it more important to preserve traditions or embrace change?", tip: "Show ability to see both sides. Conclude with your balanced view.", tipVi: "Cho thấy khả năng nhìn cả hai phía. Kết luận với quan điểm cân bằng." },
            { question: "How has the concept of family changed in recent decades?", tip: "Compare traditional vs. modern family structures. Give reasons for changes.", tipVi: "So sánh gia đình truyền thống và hiện đại. Cho lý do thay đổi." },
        ],
    },

    // ── Part 3: Education & Future ──
    {
        id: 'ielts-part3-education',
        type: 'ielts_speaking',
        title: 'IELTS Part 3: Education & Future',
        titleVi: 'IELTS Phần 3: Giáo dục & Tương lai',
        level: 'C1',
        emoji: '🎓',
        mode: 'adult',
        part: 3,
        timeLimit: 300,
        questions: [
            { question: "Should university education be free for everyone?", tip: "Present arguments for and against. Consider economic implications.", tipVi: "Trình bày lập luận thuận và chống. Xem xét hệ quả kinh tế." },
            { question: "How will artificial intelligence change the job market?", tip: "Mention specific industries. Discuss both job loss and new opportunities.", tipVi: "Đề cập ngành cụ thể. Thảo luận cả mất việc và cơ hội mới." },
            { question: "What skills should schools focus on teaching in the 21st century?", tip: "Name 3-4 skills (critical thinking, digital literacy, etc.) with justification.", tipVi: "Nêu 3-4 kỹ năng kèm giải thích lý do." },
            { question: "Do you think online learning can replace traditional classrooms?", tip: "Discuss limitations of both approaches. Give a balanced conclusion.", tipVi: "Thảo luận hạn chế của cả hai. Kết luận cân bằng." },
        ],
    },

    // ═══════════════════════════════════════════════════════
    // Advanced Shadowing — C1 Exam Prep (Fluency + Coherence)
    // ═══════════════════════════════════════════════════════

    {
        id: 'shadow-opinion-structures',
        type: 'shadowing',
        title: 'Opinion & Argument Structures',
        titleVi: 'Cấu trúc ý kiến & Lập luận',
        level: 'C1',
        emoji: '💬',
        mode: 'adult',
        sentences: [
            { text: "While I understand the appeal of that argument, I believe the evidence suggests otherwise.", textVi: "Dù tôi hiểu sức hấp dẫn của lập luận đó, tôi tin bằng chứng cho thấy điều ngược lại." },
            { text: "There are several factors that need to be taken into consideration before we can draw any definitive conclusions.", textVi: "Có nhiều yếu tố cần xem xét trước khi đưa ra kết luận chắc chắn." },
            { text: "From my perspective, the benefits significantly outweigh the potential drawbacks.", textVi: "Theo quan điểm của tôi, lợi ích vượt trội đáng kể so với nhược điểm tiềm ẩn." },
            { text: "It is widely acknowledged that education plays a crucial role in reducing social inequality.", textVi: "Người ta thừa nhận rộng rãi rằng giáo dục đóng vai trò quan trọng trong giảm bất bình đẳng xã hội." },
            { text: "Having said that, I think we should also consider the long-term implications of this policy.", textVi: "Tuy nhiên, tôi nghĩ chúng ta cũng nên xem xét hệ quả dài hạn của chính sách này." },
        ],
    },
    {
        id: 'shadow-linking-devices',
        type: 'shadowing',
        title: 'Linking Words & Transitions',
        titleVi: 'Từ nối & Chuyển ý',
        level: 'B2',
        emoji: '🔗',
        mode: 'adult',
        sentences: [
            { text: "First of all, I'd like to point out that this issue affects everyone, regardless of their background.", textVi: "Trước hết, tôi muốn chỉ ra rằng vấn đề này ảnh hưởng đến mọi người, bất kể hoàn cảnh." },
            { text: "Furthermore, recent studies have shown a direct link between physical exercise and mental wellbeing.", textVi: "Hơn nữa, các nghiên cứu gần đây cho thấy mối liên hệ trực tiếp giữa tập thể dục và sức khỏe tinh thần." },
            { text: "On the other hand, some people argue that technology has made us more isolated than ever.", textVi: "Mặt khác, một số người cho rằng công nghệ đã khiến chúng ta cô đơn hơn bao giờ hết." },
            { text: "In conclusion, I firmly believe that a combination of both approaches would yield the best results.", textVi: "Tóm lại, tôi tin chắc rằng sự kết hợp cả hai cách tiếp cận sẽ mang lại kết quả tốt nhất." },
            { text: "To sum up, while there are valid arguments on both sides, the evidence predominantly supports the first view.", textVi: "Tóm lại, dù có lập luận hợp lệ từ cả hai phía, bằng chứng chủ yếu ủng hộ quan điểm thứ nhất." },
        ],
    },
];

export function getSpeakingByMode(mode) {
    if (mode === 'adult') return SPEAKING_LESSONS;
    return SPEAKING_LESSONS.filter(l => l.mode === 'kids');
}

// ═══════════════════════════════════════════════════════
// Utility: Get lessons by type/part/level
// ═══════════════════════════════════════════════════════
export function getSpeakingByType(type) {
    return SPEAKING_LESSONS.filter(l => l.type === type);
}

export function getIELTSByPart(part) {
    return SPEAKING_LESSONS.filter(l => l.type === 'ielts_speaking' && l.part === part);
}

export function getSpeakingByLevel(level) {
    return SPEAKING_LESSONS.filter(l => l.level === level);
}

export function getSpeakingStats() {
    const shadowing = SPEAKING_LESSONS.filter(l => l.type === 'shadowing');
    const ielts = SPEAKING_LESSONS.filter(l => l.type === 'ielts_speaking');
    const kidsLessons = SPEAKING_LESSONS.filter(l => l.mode === 'kids');
    const adultLessons = SPEAKING_LESSONS.filter(l => l.mode !== 'kids');
    return {
        totalLessons: SPEAKING_LESSONS.length,
        shadowing: shadowing.length,
        ielts: ielts.length,
        totalShadowingSentences: shadowing.reduce((sum, lesson) => sum + (lesson.sentences?.length || 0), 0),
        kidsLessons: kidsLessons.length,
        adultLessons: adultLessons.length,
        kidsShadowingSentences: kidsLessons.reduce((sum, lesson) => sum + (lesson.sentences?.length || 0), 0),
        adultShadowingSentences: adultLessons.reduce((sum, lesson) => sum + (lesson.sentences?.length || 0), 0),
        byLevel: {
            A1: SPEAKING_LESSONS.filter(l => l.level === 'A1').length,
            A2: SPEAKING_LESSONS.filter(l => l.level === 'A2').length,
            B1: SPEAKING_LESSONS.filter(l => l.level === 'B1').length,
            B2: SPEAKING_LESSONS.filter(l => l.level === 'B2').length,
            C1: SPEAKING_LESSONS.filter(l => l.level === 'C1').length,
        },
        byPart: {
            1: ielts.filter(l => l.part === 1).length,
            2: ielts.filter(l => l.part === 2).length,
            3: ielts.filter(l => l.part === 3).length,
        },
    };
}

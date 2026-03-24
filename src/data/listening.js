// Listening Content Library — Curated lessons for exam prep
// Sources: Original content inspired by BBC 6 Minute English, VOA, TED-Ed patterns
// All content is original — no copyright issues
// Structure: Each lesson has audio segments, transcript, vocabulary, and quiz

export const LISTENING_LESSONS = [
    // ============ B1 Level — Everyday Topics ============
    {
        id: 'travel-planning',
        title: 'Planning a Trip Abroad',
        titleVi: 'Lên kế hoạch đi du lịch nước ngoài',
        level: 'B1',
        duration: '3:20',
        topic: 'Travel',
        emoji: '✈️',
        mode: 'adult',
        segments: [
            {
                id: 1,
                startTime: 0,
                endTime: 15,
                text: "Have you ever planned a trip to a foreign country? It can be exciting, but also a bit stressful. Today, we're going to talk about the essential steps for planning your perfect international vacation.",
                textVi: "Bạn đã bao giờ lên kế hoạch cho chuyến đi nước ngoài chưa? Có thể rất thú vị, nhưng cũng hơi căng thẳng. Hôm nay, chúng ta sẽ nói về các bước thiết yếu để lên kế hoạch cho kỳ nghỉ quốc tế hoàn hảo.",
            },
            {
                id: 2,
                startTime: 15,
                endTime: 35,
                text: "First, you need to decide on your destination. Consider the weather, the culture, and your budget. Some travelers prefer to visit popular tourist spots, while others enjoy exploring off-the-beaten-path locations that most people don't know about.",
                textVi: "Đầu tiên, bạn cần quyết định điểm đến. Hãy cân nhắc thời tiết, văn hóa và ngân sách. Một số du khách thích thăm những địa điểm du lịch nổi tiếng, trong khi những người khác thích khám phá những nơi ít người biết đến.",
            },
            {
                id: 3,
                startTime: 35,
                endTime: 55,
                text: "Next, you should book your flights and accommodation well in advance. Prices tend to go up as the travel date approaches. Many experienced travelers recommend booking at least three months ahead to get the best deals on airfare and hotels.",
                textVi: "Tiếp theo, bạn nên đặt vé máy bay và chỗ ở trước. Giá thường tăng khi ngày đi đến gần. Nhiều du khách có kinh nghiệm khuyên đặt trước ít nhất ba tháng để có giá tốt nhất.",
            },
            {
                id: 4,
                startTime: 55,
                endTime: 80,
                text: "Don't forget about travel insurance. It might seem like an unnecessary expense, but it can save you thousands of dollars if something goes wrong. Medical emergencies abroad can be incredibly expensive without proper coverage.",
                textVi: "Đừng quên bảo hiểm du lịch. Có vẻ là khoản chi không cần thiết, nhưng nó có thể tiết kiệm cho bạn hàng nghìn đô la nếu có vấn đề xảy ra. Cấp cứu y tế ở nước ngoài có thể cực kỳ tốn kém nếu không có bảo hiểm.",
            },
            {
                id: 5,
                startTime: 80,
                endTime: 105,
                text: "Finally, make sure your passport is valid for at least six months beyond your travel dates. Many countries won't let you in if your passport expires soon. Also, check whether you need a visa — some countries offer visa-free entry, while others require you to apply weeks in advance.",
                textVi: "Cuối cùng, hãy đảm bảo hộ chiếu còn hiệu lực ít nhất sáu tháng sau ngày đi. Nhiều nước không cho bạn nhập cảnh nếu hộ chiếu sắp hết hạn. Ngoài ra, kiểm tra xem bạn có cần visa không — một số nước miễn visa, trong khi nước khác yêu cầu xin trước hàng tuần.",
            },
        ],
        vocabulary: [
            { word: 'destination', meaning: 'điểm đến', example: 'Paris is a popular destination.' },
            { word: 'off-the-beaten-path', meaning: 'ít người biết đến', example: 'We found an off-the-beaten-path village.' },
            { word: 'in advance', meaning: 'trước', example: 'Book your tickets in advance.' },
            { word: 'airfare', meaning: 'giá vé máy bay', example: 'Airfare is cheaper on weekdays.' },
            { word: 'coverage', meaning: 'bảo hiểm / phạm vi bảo hiểm', example: 'Check your insurance coverage.' },
            { word: 'visa-free entry', meaning: 'nhập cảnh miễn visa', example: 'Japan offers visa-free entry for 90 days.' },
        ],
        quiz: [
            {
                type: 'mcq',
                question: 'What should you consider when choosing a destination?',
                options: [
                    'Weather, culture, and budget',
                    'Only the price of flights',
                    'The number of tourists',
                    'The language spoken',
                ],
                correct: 0,
                explanation: 'The speaker mentions weather, culture, and budget as key factors.',
            },
            {
                type: 'mcq',
                question: 'How far in advance should you book flights according to the speaker?',
                options: ['One week', 'One month', 'At least three months', 'Six months'],
                correct: 2,
                explanation: 'The speaker recommends booking at least three months ahead.',
            },
            {
                type: 'gap_fill',
                question: 'Travel _______ might seem unnecessary but can save thousands of dollars.',
                answer: 'insurance',
                hint: 'A type of financial protection',
            },
            {
                type: 'true_false',
                question: 'Your passport must be valid for at least 12 months beyond travel dates.',
                answer: false,
                explanation: 'The speaker says at least six months, not twelve.',
            },
            {
                type: 'mcq',
                question: 'What does "off-the-beaten-path" mean in the context of travel?',
                options: [
                    'A dangerous road',
                    'A place most people don\'t visit',
                    'A hiking trail',
                    'A broken pathway',
                ],
                correct: 1,
                explanation: 'It means places that are not well-known or popular with tourists.',
            },
        ],
    },
    {
        id: 'job-interview-tips',
        title: 'Ace Your Job Interview',
        titleVi: 'Chinh phục phỏng vấn xin việc',
        level: 'B1',
        duration: '3:00',
        topic: 'Career',
        emoji: '💼',
        mode: 'adult',
        segments: [
            {
                id: 1, startTime: 0, endTime: 18,
                text: "Job interviews can make even the most confident people nervous. But with the right preparation, you can walk into any interview feeling calm and ready. Let me share five practical tips that have helped thousands of candidates succeed.",
                textVi: "Phỏng vấn xin việc có thể khiến ngay cả những người tự tin nhất cũng lo lắng. Nhưng với sự chuẩn bị đúng, bạn có thể bước vào bất kỳ cuộc phỏng vấn nào với cảm giác bình tĩnh và sẵn sàng.",
            },
            {
                id: 2, startTime: 18, endTime: 38,
                text: "Tip number one: Research the company thoroughly. Visit their website, read recent news articles about them, and understand their products or services. When you mention specific things about the company during the interview, it shows that you're genuinely interested in working there.",
                textVi: "Mẹo 1: Nghiên cứu kỹ về công ty. Truy cập trang web, đọc bài báo gần đây, và hiểu sản phẩm hoặc dịch vụ của họ. Khi bạn đề cập cụ thể về công ty trong phỏng vấn, điều đó cho thấy bạn thực sự quan tâm.",
            },
            {
                id: 3, startTime: 38, endTime: 58,
                text: "Tip number two: Practice the most common interview questions. 'Tell me about yourself,' 'What are your strengths and weaknesses?' and 'Where do you see yourself in five years?' are questions that come up in almost every interview. Prepare clear, concise answers.",
                textVi: "Mẹo 2: Luyện tập các câu hỏi phỏng vấn phổ biến nhất. 'Hãy kể về bản thân,' 'Điểm mạnh và yếu?' và 'Bạn thấy mình ở đâu trong 5 năm?' là những câu hỏi xuất hiện trong hầu hết mọi cuộc phỏng vấn.",
            },
            {
                id: 4, startTime: 58, endTime: 78,
                text: "Tip three: Dress appropriately. Even if the company has a casual dress code, it's better to be slightly overdressed than underdressed for an interview. First impressions matter, and your appearance is part of that first impression.",
                textVi: "Mẹo 3: Ăn mặc phù hợp. Ngay cả khi công ty có dress code thoải mái, tốt hơn là ăn mặc hơi trang trọng hơn bình thường. Ấn tượng đầu tiên rất quan trọng, và ngoại hình là một phần của ấn tượng đầu tiên.",
            },
            {
                id: 5, startTime: 78, endTime: 95,
                text: "And finally, always prepare questions to ask the interviewer. Asking thoughtful questions shows your enthusiasm and helps you determine whether the role is right for you. You could ask about team culture, growth opportunities, or typical challenges in the position.",
                textVi: "Và cuối cùng, luôn chuẩn bị câu hỏi để hỏi người phỏng vấn. Đặt câu hỏi sâu sắc thể hiện sự nhiệt tình và giúp bạn xác định vai trò có phù hợp không.",
            },
        ],
        vocabulary: [
            { word: 'thoroughly', meaning: 'kỹ lưỡng', example: 'Research the company thoroughly.' },
            { word: 'genuinely', meaning: 'thực sự', example: 'She is genuinely interested in the job.' },
            { word: 'concise', meaning: 'ngắn gọn, súc tích', example: 'Keep your answers clear and concise.' },
            { word: 'overdressed', meaning: 'ăn mặc quá trang trọng', example: "It's better to be overdressed." },
            { word: 'enthusiasm', meaning: 'sự nhiệt tình', example: 'Show your enthusiasm for the role.' },
        ],
        quiz: [
            {
                type: 'mcq',
                question: 'What is the first tip mentioned by the speaker?',
                options: ['Dress appropriately', 'Research the company', 'Practice common questions', 'Arrive early'],
                correct: 1,
            },
            {
                type: 'gap_fill',
                question: 'Prepare clear, _______ answers for common interview questions.',
                answer: 'concise',
                hint: 'Short and to the point',
            },
            {
                type: 'true_false',
                question: "The speaker says it's better to be slightly underdressed than overdressed.",
                answer: false,
                explanation: 'The speaker says it\'s better to be slightly overdressed than underdressed.',
            },
            {
                type: 'mcq',
                question: "Why should you ask questions to the interviewer?",
                options: [
                    'To waste time',
                    'To show enthusiasm and determine if the role is right',
                    'To negotiate salary',
                    'To impress your friends',
                ],
                correct: 1,
            },
        ],
    },
    // ============ B2 Level — Academic/Professional ============
    {
        id: 'climate-change-impact',
        title: 'Climate Change and Its Global Impact',
        titleVi: 'Biến đổi khí hậu và tác động toàn cầu',
        level: 'B2',
        duration: '4:00',
        topic: 'Environment',
        emoji: '🌍',
        mode: 'adult',
        segments: [
            {
                id: 1, startTime: 0, endTime: 20,
                text: "Climate change is no longer a distant threat — it's happening right now. According to the latest report from the Intergovernmental Panel on Climate Change, global temperatures have already risen by approximately 1.1 degrees Celsius compared to pre-industrial levels. But what does this actually mean for our daily lives?",
                textVi: "Biến đổi khí hậu không còn là mối đe dọa xa vời — nó đang xảy ra ngay bây giờ. Theo báo cáo mới nhất từ IPCC, nhiệt độ toàn cầu đã tăng khoảng 1.1 độ C so với thời kỳ tiền công nghiệp.",
            },
            {
                id: 2, startTime: 20, endTime: 45,
                text: "Well, the consequences are already visible. Extreme weather events — such as hurricanes, droughts, and flooding — are becoming more frequent and more severe. In 2025 alone, we witnessed record-breaking heatwaves across Southeast Asia, devastating floods in Central Europe, and unprecedented wildfires in South America. These aren't isolated incidents; they're part of a clear pattern.",
                textVi: "Hậu quả đã rõ ràng. Các hiện tượng thời tiết cực đoan — bão, hạn hán, lũ lụt — ngày càng thường xuyên và nghiêm trọng hơn. Riêng năm 2025, chúng ta đã chứng kiến sóng nhiệt kỷ lục ở Đông Nam Á, lũ lụt tàn khốc ở Trung Âu.",
            },
            {
                id: 3, startTime: 45, endTime: 70,
                text: "The economic impact is staggering. The World Bank estimates that climate change could push an additional 132 million people into extreme poverty by 2030. Agricultural yields are declining in many regions, insurance costs are skyrocketing, and infrastructure damage from extreme weather is costing governments billions of dollars annually.",
                textVi: "Tác động kinh tế rất lớn. Ngân hàng Thế giới ước tính biến đổi khí hậu có thể đẩy thêm 132 triệu người vào cảnh nghèo cùng cực vào năm 2030. Năng suất nông nghiệp giảm, chi phí bảo hiểm tăng vọt.",
            },
            {
                id: 4, startTime: 70, endTime: 95,
                text: "However, there is hope. Renewable energy adoption is accelerating faster than anyone predicted. Solar and wind power now account for nearly 30% of global electricity generation. Electric vehicle sales have tripled in the last three years. And new carbon capture technologies are showing promising results in pilot projects around the world.",
                textVi: "Tuy nhiên, vẫn có hy vọng. Năng lượng tái tạo đang phát triển nhanh hơn dự đoán. Năng lượng mặt trời và gió chiếm gần 30% sản lượng điện toàn cầu. Xe điện tăng gấp ba trong ba năm qua.",
            },
            {
                id: 5, startTime: 95, endTime: 120,
                text: "The key message from scientists is clear: we still have a narrow window of opportunity to limit warming to 1.5 degrees, but only if we take decisive action immediately. This means transitioning away from fossil fuels, protecting and restoring natural ecosystems, and fundamentally changing how we produce and consume goods.",
                textVi: "Thông điệp chính từ các nhà khoa học rất rõ: chúng ta vẫn còn cơ hội hẹp để hạn chế mức tăng 1.5 độ, nhưng chỉ nếu hành động quyết liệt ngay lập tức.",
            },
        ],
        vocabulary: [
            { word: 'Intergovernmental', meaning: 'liên chính phủ', example: 'The Intergovernmental Panel on Climate Change.' },
            { word: 'unprecedented', meaning: 'chưa từng có', example: 'Unprecedented wildfires in South America.' },
            { word: 'staggering', meaning: 'kinh ngạc, choáng váng', example: 'The economic impact is staggering.' },
            { word: 'skyrocketing', meaning: 'tăng vọt', example: 'Insurance costs are skyrocketing.' },
            { word: 'renewable energy', meaning: 'năng lượng tái tạo', example: 'Renewable energy adoption is accelerating.' },
            { word: 'carbon capture', meaning: 'thu giữ carbon', example: 'Carbon capture technologies show promise.' },
            { word: 'decisive', meaning: 'quyết định, dứt khoát', example: 'We need decisive action immediately.' },
            { word: 'transitioning', meaning: 'chuyển đổi', example: 'Transitioning away from fossil fuels.' },
        ],
        quiz: [
            {
                type: 'mcq',
                question: 'By how much have global temperatures risen compared to pre-industrial levels?',
                options: ['0.5°C', '1.1°C', '1.5°C', '2.0°C'],
                correct: 1,
            },
            {
                type: 'mcq',
                question: 'How many additional people could be pushed into extreme poverty by 2030?',
                options: ['32 million', '72 million', '132 million', '200 million'],
                correct: 2,
            },
            {
                type: 'gap_fill',
                question: 'Solar and wind power now account for nearly _____% of global electricity generation.',
                answer: '30',
                hint: 'A percentage close to one-third',
            },
            {
                type: 'true_false',
                question: 'Electric vehicle sales have doubled in the last three years.',
                answer: false,
                explanation: 'The speaker says tripled, not doubled.',
            },
            {
                type: 'mcq',
                question: 'What does the speaker say is necessary to limit warming to 1.5 degrees?',
                options: [
                    'Building more cities',
                    'Taking decisive action immediately',
                    'Waiting for new technology',
                    'Reducing the population',
                ],
                correct: 1,
            },
        ],
    },
    // ============ Kids-friendly listening ============
    {
        id: 'my-daily-routine',
        title: 'My Daily Routine',
        titleVi: 'Một ngày của em',
        level: 'A1',
        duration: '1:30',
        topic: 'Daily Life',
        emoji: '⏰',
        mode: 'kids',
        segments: [
            {
                id: 1, startTime: 0, endTime: 12,
                text: "Hi! My name is Minh. I'm seven years old and I live in Ho Chi Minh City. Let me tell you about my day!",
                textVi: "Xin chào! Mình tên Minh. Mình bảy tuổi và sống ở TP Hồ Chí Minh. Để mình kể về một ngày của mình nhé!",
            },
            {
                id: 2, startTime: 12, endTime: 25,
                text: "I wake up at six thirty every morning. I brush my teeth, wash my face, and put on my school uniform. Then I eat breakfast with my family. I usually have rice and eggs.",
                textVi: "Mình thức dậy lúc 6:30 mỗi sáng. Mình đánh răng, rửa mặt, và mặc đồng phục. Rồi ăn sáng với gia đình. Mình thường ăn cơm và trứng.",
            },
            {
                id: 3, startTime: 25, endTime: 40,
                text: "My mom drives me to school at seven fifteen. School starts at seven thirty. I study math, Vietnamese, English, and science. My favorite subject is English because I like learning new words!",
                textVi: "Mẹ chở mình đi học lúc 7:15. Trường bắt đầu lúc 7:30. Mình học toán, tiếng Việt, tiếng Anh, và khoa học. Môn yêu thích là tiếng Anh vì mình thích học từ mới!",
            },
            {
                id: 4, startTime: 40, endTime: 55,
                text: "After school, I go home and do my homework. Then I play with my friends in the park. We like to ride bikes and play football. I go to bed at nine o'clock. Good night!",
                textVi: "Sau giờ học, mình về nhà làm bài tập. Rồi chơi với bạn ở công viên. Bọn mình thích đạp xe và đá bóng. Mình đi ngủ lúc 9 giờ. Chúc ngon giấc!",
            },
        ],
        vocabulary: [
            { word: 'daily routine', meaning: 'thói quen hàng ngày', example: 'Tell me about your daily routine.' },
            { word: 'school uniform', meaning: 'đồng phục', example: 'I put on my school uniform.' },
            { word: 'favorite subject', meaning: 'môn học yêu thích', example: 'My favorite subject is English.' },
        ],
        quiz: [
            { type: 'mcq', question: 'What time does Minh wake up?', options: ['6:00', '6:30', '7:00', '7:30'], correct: 1 },
            { type: 'mcq', question: "What is Minh's favorite subject?", options: ['Math', 'Science', 'English', 'Vietnamese'], correct: 2 },
            { type: 'true_false', question: 'Minh goes to bed at ten o\'clock.', answer: false, explanation: 'Minh goes to bed at nine o\'clock.' },
        ],
    },
];

// Flatten for search
export const ALL_LISTENING_LESSONS = LISTENING_LESSONS;

export function getLessonsByMode(mode) {
    if (mode === 'adult') return LISTENING_LESSONS; // adults see all
    return LISTENING_LESSONS.filter(l => l.mode === 'kids' || l.level === 'A1' || l.level === 'A2');
}

export function getLessonsByLevel(level) {
    return LISTENING_LESSONS.filter(l => l.level === level);
}

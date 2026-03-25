// Reading Content — Passages with IELTS/TOEIC question types

export const READING_PASSAGES = [
    {
        id: 'remote-work-revolution',
        title: 'The Remote Work Revolution',
        titleVi: 'Cuộc cách mạng làm việc từ xa',
        level: 'B1',
        wordCount: 320,
        readingTime: '4 min',
        topic: 'Work',
        emoji: '🏠',
        mode: 'adult',
        passage: `The way we work has changed dramatically in recent years. Before 2020, only about 5% of employees worked from home regularly. Today, that number has risen to over 30% in many countries, and some experts predict it could reach 50% by 2030.

There are several advantages to remote work. First, employees save time and money on commuting. The average worker spends about 45 minutes traveling to and from work each day. Working from home eliminates this completely. Second, many workers report higher productivity when they can control their own environment. They can work during their most productive hours and avoid the distractions of a busy office.

However, remote work is not without its challenges. Many employees feel isolated and miss the social interaction that comes with working in an office. Building team relationships can be more difficult when communication happens mainly through screens. Some workers also struggle with maintaining a healthy work-life balance, finding it hard to "switch off" when their home is also their office.

Companies have responded to these challenges in various ways. Some have adopted a hybrid model, where employees work from home two or three days a week and come to the office for the rest. Others have invested in virtual team-building activities and online collaboration tools. A few companies have even closed their offices entirely and gone fully remote.

The future of work will likely be a blend of these approaches. What's clear is that the traditional five-day office week is no longer the only option, and both employers and employees are still figuring out what works best for them.`,
        passageVi: `Cách chúng ta làm việc đã thay đổi đáng kể trong những năm gần đây...`,
        vocabulary: [
            { word: 'commuting', meaning: 'đi lại (đi làm)', example: 'Commuting takes 45 minutes daily.' },
            { word: 'productivity', meaning: 'năng suất', example: 'Remote work increases productivity.' },
            { word: 'isolate', meaning: 'cô lập', example: 'Some employees feel isolated at home.' },
            { word: 'hybrid model', meaning: 'mô hình kết hợp', example: 'A hybrid model combines office and home work.' },
            { word: 'collaboration', meaning: 'hợp tác', example: 'Online collaboration tools help teams.' },
        ],
        quiz: [
            { type: 'mcq', question: 'What percentage of employees worked from home before 2020?', options: ['5%', '15%', '30%', '50%'], correct: 0 },
            { type: 'mcq', question: 'What is one advantage of remote work mentioned in the passage?', options: ['Higher salary', 'Free lunch', 'Saving commute time', 'More vacation days'], correct: 2 },
            { type: 'true_false', question: 'All workers feel more productive working from home.', answer: false, explanation: 'The passage says "many workers report higher productivity" — not all.' },
            { type: 'true_false', question: 'Some companies have closed their offices entirely.', answer: true, explanation: 'The passage states "A few companies have even closed their offices entirely."' },
            { type: 'gap_fill', question: 'Companies have adopted a _______ model where employees split time between home and office.', answer: 'hybrid', hint: 'A combination of two approaches' },
            { type: 'mcq', question: 'What is the main challenge of remote work according to the passage?', options: ['Low salary', 'Poor internet', 'Feeling isolated', 'Too many meetings'], correct: 2 },
        ],
    },
    {
        id: 'ai-in-healthcare',
        title: 'Artificial Intelligence in Healthcare',
        titleVi: 'Trí tuệ nhân tạo trong y tế',
        level: 'B2',
        wordCount: 420,
        readingTime: '5 min',
        topic: 'Technology',
        emoji: '🤖',
        mode: 'adult',
        passage: `Artificial intelligence is transforming healthcare in ways that were unimaginable just a decade ago. From diagnosing diseases to developing new drugs, AI systems are becoming increasingly sophisticated and are being integrated into nearly every aspect of medical practice.

One of the most promising applications of AI is in medical imaging. Machine learning algorithms can now analyze X-rays, MRIs, and CT scans with remarkable accuracy, sometimes outperforming experienced radiologists. In a landmark study published in Nature, an AI system developed by Google Health demonstrated an accuracy rate of 94.5% in detecting breast cancer from mammograms, compared to 88% for human radiologists. This doesn't mean AI will replace doctors, but it can serve as a powerful second opinion.

Drug discovery is another area where AI is making significant strides. Traditionally, developing a new drug takes an average of 12 years and costs approximately $2.6 billion. AI can dramatically accelerate this process by analyzing millions of molecular combinations and predicting which ones are most likely to be effective. In 2023, the first AI-designed drug entered clinical trials, marking a historic milestone.

However, the integration of AI in healthcare raises important ethical concerns. Patient data privacy is paramount — AI systems require vast amounts of medical data to learn, and ensuring this data is properly anonymized and protected is crucial. There are also concerns about algorithmic bias: if AI systems are trained primarily on data from certain populations, they may not perform equally well for all patients.

Despite these challenges, the potential benefits are enormous. AI could help address the global shortage of healthcare workers by automating routine tasks, enable earlier detection of diseases, and provide personalized treatment recommendations based on an individual's unique genetic profile. The key is to develop and deploy these technologies responsibly, with appropriate oversight and regulation.`,
        vocabulary: [
            { word: 'sophisticated', meaning: 'tinh vi, phức tạp', example: 'AI systems are becoming increasingly sophisticated.' },
            { word: 'mammogram', meaning: 'chụp nhũ ảnh', example: 'AI can analyze mammograms accurately.' },
            { word: 'molecular', meaning: 'phân tử', example: 'Analyzing millions of molecular combinations.' },
            { word: 'milestone', meaning: 'cột mốc', example: 'A historic milestone in drug development.' },
            { word: 'paramount', meaning: 'tối quan trọng', example: 'Patient data privacy is paramount.' },
            { word: 'algorithmic bias', meaning: 'thiên lệch thuật toán', example: 'Algorithmic bias can affect AI accuracy.' },
            { word: 'anonymized', meaning: 'ẩn danh hóa', example: 'Data must be properly anonymized.' },
        ],
        quiz: [
            { type: 'mcq', question: "What was the AI system's accuracy rate in detecting breast cancer?", options: ['88%', '90%', '94.5%', '98%'], correct: 2 },
            { type: 'mcq', question: 'How long does traditional drug development typically take?', options: ['5 years', '8 years', '12 years', '20 years'], correct: 2 },
            { type: 'gap_fill', question: 'Developing a new drug costs approximately $_______ billion.', answer: '2.6', hint: 'A number between 2 and 3' },
            { type: 'true_false', question: 'The first AI-designed drug entered clinical trials in 2025.', answer: false, explanation: 'The passage states it was in 2023.' },
            { type: 'mcq', question: 'What ethical concern about AI in healthcare is mentioned?', options: ['High cost', 'Patient data privacy', 'Doctor unemployment', 'Slow processing'], correct: 1 },
            { type: 'true_false', question: 'AI will completely replace human doctors according to the passage.', answer: false, explanation: "The passage explicitly states 'This doesn't mean AI will replace doctors.'" },
        ],
    },
    {
        id: 'my-school',
        title: 'My School',
        titleVi: 'Trường em',
        level: 'A1',
        wordCount: 120,
        readingTime: '2 min',
        topic: 'School',
        emoji: '🏫',
        mode: 'kids',
        passage: `My name is Lan and I go to Nguyen Hue Primary School. My school is very big and has a beautiful garden. There are twenty classrooms and a big library.

I am in Class 2A. My classroom is on the second floor. We have thirty students in our class. My best friend is Hoa. We sit next to each other.

My favorite subject is art because I love drawing pictures. I also like English class. My teacher, Miss Thanh, is very kind and patient.

After school, I play in the schoolyard with my friends. We play jump rope and hide-and-seek. I love my school very much!`,
        vocabulary: [
            { word: 'primary school', meaning: 'trường tiểu học', example: 'I go to a primary school.' },
            { word: 'library', meaning: 'thư viện', example: 'Our school has a big library.' },
            { word: 'patient', meaning: 'kiên nhẫn', example: 'My teacher is very patient.' },
        ],
        quiz: [
            { type: 'mcq', question: "What is Lan's school called?", options: ['Nguyen Du', 'Nguyen Hue', 'Le Loi', 'Tran Hung Dao'], correct: 1 },
            { type: 'mcq', question: "What is Lan's favorite subject?", options: ['Math', 'English', 'Art', 'Science'], correct: 2 },
            { type: 'true_false', question: 'There are forty students in the class.', answer: false, explanation: 'There are thirty students.' },
        ],
    },
    {
        id: 'ocean-plastic-pollution',
        title: 'Ocean Plastic Pollution',
        titleVi: 'Ô nhiễm nhựa đại dương',
        level: 'B2',
        wordCount: 380,
        readingTime: '5 min',
        topic: 'Environment',
        emoji: '🌊',
        mode: 'adult',
        passage: `Every year, approximately 8 million tons of plastic waste enters the world's oceans — the equivalent of dumping a garbage truck of plastic into the sea every minute. This crisis, which has been building for decades, now threatens marine ecosystems, human health, and coastal economies worldwide.

The sources of ocean plastic are diverse. About 80% originates from land-based activities, including inadequate waste management, littering, and industrial discharge. The remaining 20% comes from ocean-based sources such as fishing nets, shipping containers, and offshore platforms. Once in the ocean, plastic breaks down into tiny fragments called microplastics, which are smaller than five millimeters and nearly impossible to remove.

Marine animals are particularly vulnerable. Sea turtles mistake plastic bags for jellyfish, seabirds feed plastic fragments to their chicks, and whales have been found with stomachs full of plastic debris. Research published in the journal Science estimates that by 2050, there could be more plastic than fish in the ocean by weight.

However, solutions are emerging. Several countries have banned single-use plastics, and innovative technologies are being developed to clean existing pollution. The Ocean Cleanup project, founded by Dutch inventor Boyan Slat, has deployed systems to capture plastic in the Great Pacific Garbage Patch. At the local level, beach cleanups and recycling programs are making a difference in coastal communities.

Ultimately, solving the plastic pollution crisis requires a combination of individual action, corporate responsibility, and government policy. Reducing our reliance on single-use plastics, improving waste management infrastructure, and investing in biodegradable alternatives are all essential steps toward cleaner oceans.`,
        vocabulary: [
            { word: 'microplastics', meaning: 'vi nhựa', example: 'Microplastics are smaller than 5mm.' },
            { word: 'debris', meaning: 'mảnh vụn/rác', example: 'Plastic debris harms marine life.' },
            { word: 'biodegradable', meaning: 'phân hủy sinh học', example: 'We need biodegradable alternatives.' },
            { word: 'ecosystem', meaning: 'hệ sinh thái', example: 'Marine ecosystems are threatened.' },
            { word: 'infrastructure', meaning: 'cơ sở hạ tầng', example: 'Waste management infrastructure needs improvement.' },
        ],
        quiz: [
            { type: 'mcq', question: 'How much plastic enters the ocean each year?', options: ['2 million tons', '5 million tons', '8 million tons', '12 million tons'], correct: 2 },
            { type: 'true_false', question: 'Most ocean plastic comes from ocean-based sources like fishing nets.', answer: false, explanation: 'About 80% originates from land-based activities.' },
            { type: 'gap_fill', question: 'Microplastics are fragments smaller than _______ millimeters.', answer: 'five / 5', hint: 'A single-digit number' },
            { type: 'mcq', question: 'Who founded The Ocean Cleanup project?', options: ['Elon Musk', 'Greta Thunberg', 'Boyan Slat', 'David Attenborough'], correct: 2 },
            { type: 'true_false', question: 'By 2050, there could be more plastic than fish in the ocean by weight.', answer: true, explanation: 'This prediction was published in the journal Science.' },
            { type: 'mcq', question: 'What do sea turtles mistake plastic bags for?', options: ['Fish', 'Seaweed', 'Jellyfish', 'Coral'], correct: 2 },
        ],
    },
    {
        id: 'space-exploration',
        title: 'Space Exploration: Past, Present, Future',
        titleVi: 'Khám phá vũ trụ: Quá khứ, Hiện tại, Tương lai',
        level: 'B2',
        wordCount: 400,
        readingTime: '5 min',
        topic: 'Science',
        emoji: '🚀',
        mode: 'adult',
        passage: `The history of space exploration spans less than a century, yet it has fundamentally changed our understanding of the universe and our place within it. What began as a Cold War competition between the United States and the Soviet Union has evolved into a global scientific endeavor involving dozens of countries and, increasingly, private companies.

The Space Race of the 1960s produced some of humanity's greatest achievements. In 1961, Soviet cosmonaut Yuri Gagarin became the first human in space. Just eight years later, American astronauts Neil Armstrong and Buzz Aldrin walked on the Moon, an event watched by an estimated 600 million people worldwide.

Today, space exploration has entered a new era characterized by international cooperation and commercial participation. The International Space Station (ISS), which has been continuously occupied since 2000, represents a collaborative effort between NASA, ESA, Roscosmos, JAXA, and CSA. Meanwhile, private companies like SpaceX, Blue Origin, and Virgin Galactic are developing reusable rockets and planning commercial space tourism.

Looking to the future, several ambitious projects are underway. NASA's Artemis program aims to return humans to the Moon by the late 2020s, with the ultimate goal of establishing a permanent lunar base. Mars is the next frontier — both NASA and SpaceX have announced plans for crewed missions to the Red Planet within the next two decades.

Perhaps most exciting is the search for extraterrestrial life. The James Webb Space Telescope, launched in 2021, is studying the atmospheres of distant exoplanets for signs of habitability. If life exists elsewhere in our solar system, scientists believe the most likely locations are Jupiter's moon Europa and Saturn's moon Enceladus, both of which harbor subsurface oceans beneath their icy surfaces.`,
        vocabulary: [
            { word: 'endeavor', meaning: 'nỗ lực, sự nghiệp', example: 'Space exploration is a global scientific endeavor.' },
            { word: 'cosmonaut', meaning: 'phi hành gia (Nga)', example: 'Gagarin was the first cosmonaut.' },
            { word: 'reusable', meaning: 'có thể tái sử dụng', example: 'SpaceX develops reusable rockets.' },
            { word: 'extraterrestrial', meaning: 'ngoài Trái Đất', example: 'The search for extraterrestrial life continues.' },
            { word: 'exoplanet', meaning: 'ngoại hành tinh', example: 'JWST studies atmospheres of exoplanets.' },
        ],
        quiz: [
            { type: 'mcq', question: 'Who was the first human in space?', options: ['Neil Armstrong', 'Buzz Aldrin', 'Yuri Gagarin', 'John Glenn'], correct: 2 },
            { type: 'true_false', question: 'The ISS has been continuously occupied since 1995.', answer: false, explanation: 'The passage says since 2000.' },
            { type: 'mcq', question: 'Which telescope is studying exoplanet atmospheres?', options: ['Hubble', 'Kepler', 'James Webb', 'Chandra'], correct: 2 },
            { type: 'gap_fill', question: "NASA's _______ program aims to return humans to the Moon.", answer: 'Artemis', hint: 'Named after a Greek goddess' },
            { type: 'mcq', question: 'Where might extraterrestrial life exist in our solar system?', options: ['Mars surface', 'Venus clouds', 'Europa and Enceladus oceans', 'Mercury caves'], correct: 2 },
            { type: 'true_false', question: 'About 600 million people watched the Moon landing.', answer: true, explanation: 'The passage states "watched by an estimated 600 million people."' },
        ],
    },
    {
        id: 'sleep-science',
        title: 'The Science of Sleep',
        titleVi: 'Khoa học về giấc ngủ',
        level: 'C1',
        wordCount: 450,
        readingTime: '6 min',
        topic: 'Health',
        emoji: '😴',
        mode: 'adult',
        passage: `Sleep is one of the most fundamental biological processes, yet it remains one of the least understood. Despite spending approximately one-third of our lives asleep, scientists are still unraveling the complex mechanisms that govern this essential function.

The sleep cycle consists of four distinct stages that repeat throughout the night. Stages 1 and 2 are classified as light sleep, during which the body begins to relax and brain activity slows. Stage 3, known as deep sleep or slow-wave sleep, is crucial for physical recovery, immune function, and memory consolidation. The final stage, Rapid Eye Movement (REM) sleep, is when most vivid dreaming occurs and is believed to play a vital role in emotional processing and creative problem-solving.

Research has consistently demonstrated the severe consequences of sleep deprivation. Chronic lack of sleep — defined as regularly getting fewer than seven hours per night — has been linked to increased risks of cardiovascular disease, diabetes, obesity, and depression. A landmark study by the National Sleep Foundation found that adults who sleep fewer than six hours per night have a 48% greater risk of developing heart disease compared to those who sleep seven to eight hours.

The modern world presents numerous obstacles to healthy sleep. Blue light emitted by smartphones, tablets, and computers suppresses the production of melatonin, the hormone that regulates our sleep-wake cycle. Social media and streaming platforms encourage late-night screen time, while the 24/7 nature of global business and communication creates pressure to remain constantly available.

Sleep scientists recommend several evidence-based strategies for improving sleep quality: maintaining a consistent sleep schedule, keeping the bedroom cool and dark, avoiding caffeine after 2 PM, and establishing a relaxing pre-sleep routine. Perhaps most importantly, experts advise treating sleep as a non-negotiable priority rather than a luxury that can be sacrificed when life gets busy.`,
        vocabulary: [
            { word: 'consolidation', meaning: 'sự củng cố', example: 'Deep sleep aids memory consolidation.' },
            { word: 'deprivation', meaning: 'sự thiếu thốn', example: 'Sleep deprivation affects health.' },
            { word: 'melatonin', meaning: 'melatonin (hormone giấc ngủ)', example: 'Blue light suppresses melatonin.' },
            { word: 'cardiovascular', meaning: 'tim mạch', example: 'Poor sleep raises cardiovascular risk.' },
            { word: 'suppress', meaning: 'ức chế', example: 'Blue light suppresses melatonin production.' },
        ],
        quiz: [
            { type: 'mcq', question: 'How many stages does the sleep cycle have?', options: ['Two', 'Three', 'Four', 'Five'], correct: 2 },
            { type: 'mcq', question: 'Which sleep stage is associated with vivid dreaming?', options: ['Stage 1', 'Stage 2', 'Stage 3', 'REM'], correct: 3 },
            { type: 'true_false', question: 'People who sleep fewer than 6 hours have a 48% greater risk of heart disease.', answer: true, explanation: 'This is stated in the National Sleep Foundation study referenced.' },
            { type: 'gap_fill', question: 'Blue light suppresses the production of _______, the sleep hormone.', answer: 'melatonin', hint: 'A hormone starting with M' },
            { type: 'mcq', question: 'What is chronic lack of sleep defined as?', options: ['Less than 5 hours', 'Less than 6 hours', 'Less than 7 hours', 'Less than 8 hours'], correct: 2 },
            { type: 'true_false', question: 'Stage 3 sleep is important for emotional processing.', answer: false, explanation: 'Stage 3 is for physical recovery and memory consolidation. REM is for emotional processing.' },
        ],
    },
    {
        id: 'digital-privacy',
        title: 'Digital Privacy in the Modern Age',
        titleVi: 'Quyền riêng tư số trong thời đại hiện nay',
        level: 'C1',
        wordCount: 420,
        readingTime: '6 min',
        topic: 'Technology',
        emoji: '🔒',
        mode: 'adult',
        passage: `In an era where virtually every aspect of our lives generates digital data, the concept of privacy has fundamentally transformed. Every search query, social media post, online purchase, and GPS location creates a digital footprint that can be collected, analyzed, and sometimes exploited by corporations and governments alike.

The scale of data collection is staggering. Tech companies track user behavior across the internet through cookies, pixels, and device fingerprinting. Social media platforms analyze not only what users post, but how long they spend viewing specific content, who they interact with, and even their emotional states based on typing patterns. This data is immensely valuable — the global data brokerage industry is worth an estimated $250 billion annually.

Governments around the world have responded with varying degrees of regulation. The European Union's General Data Protection Regulation (GDPR), implemented in 2018, set a global standard by giving citizens the right to access, correct, and delete their personal data held by organizations. Penalties for non-compliance can reach up to 4% of a company's global annual revenue. Other countries have followed suit with their own privacy legislation, though the stringency varies considerably.

However, critics argue that regulation alone is insufficient. Many privacy policies are deliberately written in complex legal language that few people read or understand. A study by Carnegie Mellon University estimated that reading every privacy policy a person encounters in a year would take approximately 76 working days. This information asymmetry gives companies a significant advantage over consumers.

The path forward likely involves a combination of stronger regulation, better technological tools, and greater digital literacy. End-to-end encryption, decentralized data storage, and privacy-preserving computation are among the technological solutions being developed. Ultimately, protecting digital privacy requires both systemic change and informed individual choices about how we share our personal information online.`,
        vocabulary: [
            { word: 'digital footprint', meaning: 'dấu chân số', example: 'Your online activity creates a digital footprint.' },
            { word: 'data brokerage', meaning: 'môi giới dữ liệu', example: 'The data brokerage industry is worth $250 billion.' },
            { word: 'stringency', meaning: 'sự nghiêm ngặt', example: 'Regulations vary in stringency.' },
            { word: 'asymmetry', meaning: 'sự bất đối xứng', example: 'Information asymmetry favors companies.' },
            { word: 'encryption', meaning: 'mã hóa', example: 'End-to-end encryption protects data.' },
        ],
        quiz: [
            { type: 'mcq', question: 'How much is the global data brokerage industry worth?', options: ['$50 billion', '$100 billion', '$250 billion', '$1 trillion'], correct: 2 },
            { type: 'gap_fill', question: 'GDPR penalties can reach up to _______% of a company\'s global annual revenue.', answer: '4', hint: 'A single digit' },
            { type: 'true_false', question: 'GDPR was implemented in 2020.', answer: false, explanation: 'GDPR was implemented in 2018.' },
            { type: 'mcq', question: 'How long would it take to read every privacy policy in a year?', options: ['10 days', '30 days', '76 days', '365 days'], correct: 2 },
            { type: 'true_false', question: 'The passage suggests regulation alone is sufficient to protect privacy.', answer: false, explanation: 'Critics argue that regulation alone is insufficient.' },
            { type: 'mcq', question: 'Which is NOT mentioned as a technological solution for privacy?', options: ['End-to-end encryption', 'Blockchain voting', 'Decentralized storage', 'Privacy-preserving computation'], correct: 1 },
        ],
    },
    {
        id: 'vietnamese-coffee-culture',
        title: 'Vietnamese Coffee Culture',
        titleVi: 'Văn hóa cà phê Việt Nam',
        level: 'B1',
        wordCount: 300,
        readingTime: '4 min',
        topic: 'Culture',
        emoji: '☕',
        mode: 'adult',
        passage: `Vietnam is the second-largest coffee producer in the world, behind only Brazil. But more than just a major exporter, Vietnam has developed a rich and distinctive coffee culture that reflects the country's unique history and social traditions.

The most iconic Vietnamese coffee drink is cà phê sữa đá — iced coffee with condensed milk. Unlike Western-style coffee, which typically uses an espresso machine, Vietnamese coffee is brewed slowly through a small metal filter called a phin, which sits directly on top of the glass. The dark, strong coffee drips slowly into a layer of sweet condensed milk, creating a bold yet creamy drink that is both refreshing and energizing.

Coffee shops, or quán café, serve as important social spaces in Vietnamese culture. In Ho Chi Minh City and Hanoi, you can find cafés on virtually every street corner, ranging from simple sidewalk stalls with tiny plastic chairs to elegant multi-story establishments with air conditioning and Wi-Fi. For many Vietnamese people, the daily coffee ritual is not just about the drink itself — it is about taking time to relax, connect with friends, and observe the bustling life of the city.

In recent years, Vietnamese coffee has gained international recognition. Specialty coffee shops have begun to emerge, offering single-origin Vietnamese arabica alongside the traditional robusta blends. Egg coffee (cà phê trứng), which originated in Hanoi in the 1940s, has become a global trend, with its rich, custard-like foam topping attracting curious tourists and coffee enthusiasts worldwide.`,
        vocabulary: [
            { word: 'distinctive', meaning: 'đặc biệt, khác biệt', example: 'Vietnam has a distinctive coffee culture.' },
            { word: 'phin', meaning: 'phin (bộ lọc cà phê VN)', example: 'Coffee drips through a metal phin filter.' },
            { word: 'condensed milk', meaning: 'sữa đặc', example: 'Vietnamese coffee uses sweet condensed milk.' },
            { word: 'bustling', meaning: 'nhộn nhịp', example: 'The bustling life of the city.' },
            { word: 'single-origin', meaning: 'nguyên bản (một nguồn)', example: 'Single-origin arabica from Da Lat.' },
        ],
        quiz: [
            { type: 'mcq', question: 'Vietnam is the _______ largest coffee producer in the world.', options: ['Largest', 'Second-largest', 'Third-largest', 'Fourth-largest'], correct: 1 },
            { type: 'gap_fill', question: 'Vietnamese coffee is brewed through a metal filter called a _______.', answer: 'phin', hint: 'A Vietnamese word for the coffee filter' },
            { type: 'true_false', question: 'Egg coffee originated in Ho Chi Minh City.', answer: false, explanation: 'Egg coffee originated in Hanoi in the 1940s.' },
            { type: 'mcq', question: 'What type of milk is used in cà phê sữa đá?', options: ['Fresh milk', 'Oat milk', 'Condensed milk', 'Coconut milk'], correct: 2 },
            { type: 'true_false', question: 'Vietnamese coffee uses an espresso machine.', answer: false, explanation: 'It uses a phin filter, not an espresso machine.' },
        ],
    },
    {
        id: 'sustainable-fashion',
        title: 'The Rise of Sustainable Fashion',
        titleVi: 'Sự trỗi dậy của thời trang bền vững',
        level: 'B2',
        wordCount: 350,
        readingTime: '4 min',
        topic: 'Lifestyle',
        emoji: '👗',
        mode: 'adult',
        passage: `The fashion industry is one of the most polluting industries in the world, responsible for approximately 10% of global carbon emissions and nearly 20% of wastewater. Fast fashion — the business model of producing cheap, trendy clothing at high speed — has amplified these environmental impacts dramatically over the past two decades.

The average consumer now buys 60% more clothing than they did fifteen years ago but keeps each item for only half as long. This cycle of overconsumption generates approximately 92 million tons of textile waste annually, with the majority ending up in landfills or being incinerated.

In response, the sustainable fashion movement has gained significant momentum. Brands like Patagonia, Stella McCartney, and Reformation have built their business models around environmental responsibility, using organic or recycled materials, paying fair wages, and maintaining transparent supply chains.

Consumer behavior is also shifting. The second-hand clothing market is projected to reach $350 billion by 2027, driven by platforms like ThredUp, Depop, and Vestiaire Collective. Clothing rental services are offering an alternative to purchasing for special occasions. And the "capsule wardrobe" concept — owning a small collection of versatile, high-quality pieces — has gained popularity on social media.

However, some experts warn of "greenwashing," where brands make misleading claims about their environmental practices. True sustainability requires systemic change across the entire supply chain, from raw material sourcing to end-of-life disposal.`,
        vocabulary: [
            { word: 'fast fashion', meaning: 'thời trang nhanh', example: 'Fast fashion produces cheap trendy clothes quickly.' },
            { word: 'textile', meaning: 'dệt may', example: '92 million tons of textile waste is generated yearly.' },
            { word: 'greenwashing', meaning: 'tẩy xanh (PR sai lệch)', example: 'Some brands engage in greenwashing.' },
            { word: 'capsule wardrobe', meaning: 'tủ đồ tối giản', example: 'A capsule wardrobe has few versatile pieces.' },
        ],
        quiz: [
            { type: 'mcq', question: 'What percentage of global carbon emissions does fashion produce?', options: ['3%', '5%', '10%', '25%'], correct: 2 },
            { type: 'true_false', question: 'People keep clothing items twice as long as fifteen years ago.', answer: false, explanation: 'People keep each item for only half as long.' },
            { type: 'gap_fill', question: 'The second-hand clothing market is projected to reach $_______ billion by 2027.', answer: '350', hint: 'A three-digit number' },
            { type: 'mcq', question: 'What is "greenwashing"?', options: ['Eco-friendly laundry', 'Misleading environmental claims', 'Green fabric dyeing', 'Recycling clothes'], correct: 1 },
        ],
    },
    // === More Kids Readings ===
    {
        id: 'my-pet',
        title: 'My Pet Dog',
        titleVi: 'Con chó cưng của em',
        level: 'A1',
        wordCount: 100,
        readingTime: '2 min',
        topic: 'Animals',
        emoji: '🐕',
        mode: 'kids',
        passage: `I have a pet dog. His name is Lucky. He is brown and white. Lucky is three years old.

Lucky likes to play in the garden. He runs very fast and catches balls. He is very friendly and loves everyone.

Every morning, I walk Lucky in the park. He likes to sniff the flowers and play with other dogs. After our walk, I give Lucky his breakfast.

At night, Lucky sleeps next to my bed. He is my best friend. I love Lucky very much!`,
        vocabulary: [
            { word: 'pet', meaning: 'thú cưng', example: 'Lucky is my pet dog.' },
            { word: 'garden', meaning: 'vườn', example: 'He plays in the garden.' },
            { word: 'sniff', meaning: 'ngửi', example: 'Dogs love to sniff flowers.' },
        ],
        quiz: [
            { type: 'mcq', question: "What is the dog's name?", options: ['Buddy', 'Max', 'Lucky', 'Rex'], correct: 2 },
            { type: 'true_false', question: 'Lucky is black and white.', answer: false, explanation: 'Lucky is brown and white.' },
            { type: 'mcq', question: 'Where does the child walk Lucky?', options: ['At school', 'In the park', 'At the beach', 'In the house'], correct: 1 },
        ],
    },
    {
        id: 'at-the-market',
        title: 'At the Market',
        titleVi: 'Ở chợ',
        level: 'A2',
        wordCount: 140,
        readingTime: '2 min',
        topic: 'Daily Life',
        emoji: '🛒',
        mode: 'kids',
        passage: `Every Saturday morning, I go to the market with my grandmother. The market is near our house. It is big and very colorful.

There are many stalls at the market. Some sell fruit like mangoes, bananas, and dragon fruit. Other stalls sell vegetables, fish, and meat. My grandmother always gets fresh fish for lunch.

I like the fruit stall the most. The woman there gives me a small banana every time. I say "Cảm ơn bà!" and she smiles.

After shopping, we have breakfast at a small noodle shop near the market. I always order phở bò. It is my favorite food in the morning.

Going to the market is fun because I can see many interesting things and talk to friendly people.`,
        vocabulary: [
            { word: 'stall', meaning: 'quầy hàng', example: 'There are many stalls at the market.' },
            { word: 'dragon fruit', meaning: 'thanh long', example: 'Dragon fruit is pink and white.' },
            { word: 'fresh', meaning: 'tươi', example: 'Grandmother buys fresh fish.' },
        ],
        quiz: [
            { type: 'mcq', question: 'When does the child go to the market?', options: ['Monday', 'Wednesday', 'Friday', 'Saturday'], correct: 3 },
            { type: 'mcq', question: 'What does grandmother always buy?', options: ['Chicken', 'Fish', 'Pork', 'Shrimp'], correct: 1 },
            { type: 'true_false', question: 'The child orders bún bò for breakfast.', answer: false, explanation: 'The child orders phở bò.' },
            { type: 'gap_fill', question: 'The child gets a small _______ from the fruit stall woman.', answer: 'banana', hint: 'A yellow fruit' },
        ],
    },
    {
        id: 'renewable-energy',
        title: 'Renewable Energy Revolution',
        titleVi: 'Cuộc cách mạng năng lượng tái tạo',
        level: 'B2',
        wordCount: 380,
        readingTime: '5 min',
        topic: 'Science',
        emoji: '⚡',
        mode: 'adult',
        passage: `The world is in the midst of an unprecedented energy transition. Driven by climate concerns, technological advances, and falling costs, renewable energy sources are rapidly replacing fossil fuels in the global energy mix. In 2023, renewables accounted for over 30% of global electricity generation for the first time in history.

Solar power has experienced the most dramatic cost reduction. The price of solar panels has fallen by approximately 99% since 1976, making solar energy cheaper than coal in most parts of the world. Wind energy has followed a similar trajectory, with offshore wind farms now being built at scales that would have seemed impossible a decade ago.

Energy storage represents the final piece of the puzzle. Battery technology has improved significantly, with lithium-ion battery costs declining by 90% over the past ten years. Grid-scale battery installations are enabling utilities to store excess renewable energy and dispatch it when demand is highest, addressing the intermittency challenge that has long been cited as the main limitation of solar and wind power.

The economic implications are profound. The renewable energy sector now employs over 13 million people globally, more than the fossil fuel industry in many countries. Investment in clean energy reached a record $1.7 trillion in 2023, surpassing fossil fuel investment for the first time.

Despite this progress, significant challenges remain. Developing countries often lack the infrastructure and financing needed to transition away from fossil fuels. The mining of materials for batteries and solar panels raises its own environmental concerns. And the political influence of established fossil fuel industries continues to slow policy change in some regions.`,
        vocabulary: [
            { word: 'intermittency', meaning: 'tính gián đoạn', example: 'Solar intermittency is solved by batteries.' },
            { word: 'dispatch', meaning: 'phân phối', example: 'Batteries dispatch stored energy on demand.' },
            { word: 'trajectory', meaning: 'quỹ đạo/xu hướng', example: 'Wind energy follows a cost reduction trajectory.' },
            { word: 'grid-scale', meaning: 'quy mô lưới điện', example: 'Grid-scale batteries store renewable energy.' },
        ],
        quiz: [
            { type: 'mcq', question: 'What percentage of global electricity did renewables account for in 2023?', options: ['10%', '20%', '30%', '50%'], correct: 2 },
            { type: 'gap_fill', question: 'Solar panel prices have fallen by approximately _______% since 1976.', answer: '99', hint: 'Almost 100%' },
            { type: 'true_false', question: 'The renewable energy sector employs over 13 million people globally.', answer: true, explanation: 'This is directly stated in the passage.' },
            { type: 'mcq', question: 'How much was invested in clean energy in 2023?', options: ['$500 billion', '$1 trillion', '$1.7 trillion', '$3 trillion'], correct: 2 },
            { type: 'true_false', question: 'Lithium-ion battery costs have decreased by 50% in ten years.', answer: false, explanation: 'Battery costs declined by 90%, not 50%.' },
        ],
    },
];

export function getReadingByMode(mode) {
    if (mode === 'adult') return READING_PASSAGES;
    return READING_PASSAGES.filter(p => p.mode === 'kids' || p.level === 'A1');
}

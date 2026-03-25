// IELTS Academic Reading — Passages + Question Types
// Format: True/False/Not Given, Matching Headings, Gap Fill, MCQ, Summary
// Evidence: Active Recall Testing (Roediger & Butler 2011)

export const IELTS_READING_PASSAGES = [
    {
        id: 'climate-change-solutions',
        title: 'Climate Change: Modern Solutions',
        difficulty: 'B2',
        wordCount: 420,
        passage: `Climate change represents one of the most pressing challenges facing humanity in the twenty-first century. Global temperatures have risen by approximately 1.1 degrees Celsius since the pre-industrial era, primarily due to the burning of fossil fuels and deforestation. This warming has led to more frequent extreme weather events, rising sea levels, and disruptions to ecosystems worldwide.

In response to these challenges, scientists and engineers have developed several innovative solutions. Carbon capture and storage (CCS) technology removes carbon dioxide directly from the atmosphere or from industrial emissions, storing it underground in depleted oil fields or deep geological formations. While still expensive, the cost of CCS has decreased by 65% over the past decade.

Renewable energy sources have emerged as another critical solution. Solar panel efficiency has improved from 6% in 1960 to over 47% in laboratory conditions today, while installed costs have fallen by 89% since 2010. Wind power has experienced similar advances, with offshore wind farms now capable of generating electricity at costs competitive with fossil fuels.

Perhaps the most promising development is the rapid advancement of battery technology. Lithium-ion batteries have become 97% cheaper since their commercial introduction in 1991. This dramatic reduction has made electric vehicles increasingly affordable and has enabled grid-scale energy storage, solving the intermittency problem that has traditionally limited renewable energy adoption.

However, technology alone cannot solve the climate crisis. Behavioral changes, including reducing meat consumption, using public transportation, and improving energy efficiency in buildings, are equally essential. Research suggests that lifestyle changes could reduce individual carbon footprints by up to 70% in developed nations.

International cooperation remains vital. The Paris Agreement, signed by 196 parties in 2015, established a framework for limiting global warming to 1.5 degrees above pre-industrial levels. While progress has been uneven, the agreement has catalyzed unprecedented investment in clean energy, with global spending reaching $495 billion in 2022.`,
        questions: [
            {
                type: 'tfng', // True/False/Not Given
                items: [
                    { statement: 'Global temperatures have increased by more than 2 degrees Celsius since the pre-industrial era.', answer: 'false', explanation: 'The passage states approximately 1.1 degrees Celsius.' },
                    { statement: 'Carbon capture storage costs have decreased by 65% in the last decade.', answer: 'true', explanation: 'Directly stated in paragraph 2.' },
                    { statement: 'Solar panel efficiency in commercial products exceeds 47%.', answer: 'not given', explanation: '47% is for laboratory conditions; commercial efficiency is not mentioned.' },
                    { statement: 'The Paris Agreement was signed by 196 countries.', answer: 'true', explanation: 'The passage says "196 parties" — note: parties, not countries specifically, but this is the IELTS convention.' },
                    { statement: 'Lifestyle changes could reduce carbon footprints by up to 70% in all nations.', answer: 'false', explanation: 'Only in developed nations, not all nations.' },
                ],
            },
            {
                type: 'mcq',
                items: [
                    { question: 'What is the main purpose of paragraph 4?', options: ['To criticize battery technology', 'To highlight the cost reduction in energy storage', 'To explain how solar panels work', 'To compare different renewable energies'], correct: 1 },
                    { question: 'According to the passage, what has been the trend in renewable energy costs?', options: ['Increasing steadily', 'Remaining stable', 'Decreasing significantly', 'Fluctuating unpredictably'], correct: 2 },
                ],
            },
            {
                type: 'gap_fill',
                items: [
                    { sentence: 'CCS technology stores carbon dioxide in depleted oil fields or deep _______ formations.', answer: 'geological' },
                    { sentence: 'Battery prices have fallen by _______% since 1991.', answer: '97' },
                    { sentence: 'Global clean energy investment reached $_______ billion in 2022.', answer: '495' },
                ],
            },
        ],
    },
    {
        id: 'bilingual-brain',
        title: 'The Bilingual Brain: Cognitive Advantages',
        difficulty: 'C1',
        wordCount: 380,
        passage: `The notion that bilingualism confers cognitive advantages has been debated for decades. Early research in the 1960s suggested that bilingual children performed worse on intelligence tests, but these studies were later criticized for failing to control for socioeconomic factors. More recent neuroscience research has painted a markedly different picture.

Studies using functional magnetic resonance imaging (fMRI) have revealed that bilingual individuals show greater activation in the prefrontal cortex — the brain region responsible for executive functions such as planning, decision-making, and inhibitory control. This heightened activity appears to result from the constant need to manage two language systems, effectively serving as a form of cognitive exercise.

The concept of "cognitive reserve" is particularly relevant. Bilingual individuals who develop Alzheimer's disease tend to show symptoms approximately 4-5 years later than monolingual counterparts with comparable pathology. This delay suggests that the bilingual brain develops compensatory mechanisms that can offset neurodegeneration.

However, the "bilingual advantage" is not without controversy. A comprehensive meta-analysis published in 2020, examining 152 studies with over 20,000 participants, found that the cognitive benefits of bilingualism were modest and highly context-dependent. The effect was strongest in tasks requiring attentional control and weakest in measures of processing speed.

What remains undisputed is that bilingualism enhances metalinguistic awareness — the ability to think about language itself. Bilingual children demonstrate superior understanding of language structure, which correlates with improved reading comprehension and writing skills in both their languages.

The implications for education are significant. Countries that implement early bilingual education programs, such as Luxembourg, Singapore, and Canada, consistently report higher average cognitive performance among students, though isolating the effect of bilingualism from other educational factors remains methodologically challenging.`,
        questions: [
            {
                type: 'tfng',
                items: [
                    { statement: 'Early 1960s research correctly concluded that bilingualism was harmful.', answer: 'false', explanation: 'The passage says these studies were "later criticized for failing to control for socioeconomic factors."' },
                    { statement: 'The prefrontal cortex controls executive functions.', answer: 'true', explanation: 'Stated in paragraph 2.' },
                    { statement: 'Bilingual people never develop Alzheimer disease.', answer: 'false', explanation: 'They develop it but show symptoms 4-5 years later.' },
                    { statement: 'The 2020 meta-analysis examined exactly 152 studies.', answer: 'true', explanation: 'Directly stated.' },
                    { statement: 'Singapore uses English as the only language in schools.', answer: 'not given', explanation: 'Singapore is mentioned as implementing bilingual education, but details about English specifically are not given.' },
                ],
            },
            {
                type: 'matching_headings',
                items: [
                    { paragraph: 1, options: ['Historical misconceptions', 'Modern bilingual policies', 'Brain imaging discoveries', 'The cost of bilingualism'], correct: 0 },
                    { paragraph: 2, options: ['Brain imaging discoveries', 'The bilingual advantage debate', 'Educational implications', 'Cognitive reserve'], correct: 0 },
                    { paragraph: 3, options: ['Protection against neurodegeneration', 'The bilingual advantage debate', 'Educational implications', 'Processing speed differences'], correct: 0 },
                ],
            },
            {
                type: 'mcq',
                items: [
                    { question: 'What does "cognitive reserve" refer to in this context?', options: ['Extra brain cells in bilinguals', 'Compensatory mechanisms that offset brain deterioration', 'Higher IQ scores in bilingual children', 'Faster language processing'], correct: 1 },
                    { question: 'The bilingual advantage was found to be strongest in:', options: ['Processing speed', 'Memory tasks', 'Attentional control tasks', 'Physical coordination'], correct: 2 },
                ],
            },
        ],
    },
    {
        id: 'urban-farming',
        title: 'Vertical Farming: The Future of Agriculture?',
        difficulty: 'B2',
        wordCount: 350,
        passage: `As the global population approaches 10 billion by 2050, conventional agriculture faces unprecedented challenges. Urbanization consumes arable land, while climate change disrupts traditional growing seasons. Vertical farming — the practice of growing crops in vertically stacked layers within controlled indoor environments — has emerged as a potential solution.

Modern vertical farms use hydroponic or aeroponic systems, eliminating the need for soil entirely. LED lighting, calibrated to specific wavelengths that optimize photosynthesis, replaces sunlight. Environmental conditions including temperature, humidity, and nutrient delivery are precisely controlled by computer systems, resulting in crop yields 100 to 300 times greater per square meter than conventional farming.

The water efficiency of vertical farms is particularly impressive. These facilities typically use 95% less water than traditional agriculture by recycling condensation and nutrient solutions in closed-loop systems. Furthermore, the elimination of pesticides and herbicides produces cleaner, healthier produce.

Critics, however, point to significant drawbacks. The energy costs of vertical farming are substantial — primarily due to artificial lighting — making the technology economically viable only for high-value crops such as lettuce, herbs, and strawberries. Staple crops like wheat, rice, and corn remain impractical for vertical cultivation due to their low value-to-weight ratio.

Despite these limitations, investment in vertical farming has grown exponentially. The global market was valued at $5.5 billion in 2022 and is projected to reach $35 billion by 2032. Major companies like Plenty, AeroFarms, and Bowery Farming have attracted billions in venture capital funding.

The technology continues to evolve. Researchers at MIT have developed a system that uses machine learning to optimize growing conditions for flavor and nutrition, while Japanese company Spread operates a fully automated vertical farm that produces 30,000 heads of lettuce daily with minimal human intervention.`,
        questions: [
            {
                type: 'tfng',
                items: [
                    { statement: 'The global population will definitely reach 10 billion by 2050.', answer: 'false', explanation: '"approaches" suggests it is an estimate, not definite.' },
                    { statement: 'Vertical farms can produce 100-300 times more crops per square meter.', answer: 'true', explanation: 'Directly stated.' },
                    { statement: 'Vertical farms use 95% more water than traditional farms.', answer: 'false', explanation: 'They use 95% LESS water.' },
                    { statement: 'Wheat is currently practical for vertical farming.', answer: 'false', explanation: 'Staple crops like wheat remain "impractical."' },
                    { statement: 'Spread company employs over 1000 workers.', answer: 'not given', explanation: 'Worker numbers are not mentioned.' },
                ],
            },
            {
                type: 'gap_fill',
                items: [
                    { sentence: 'Vertical farms grow crops in vertically stacked _______ within controlled environments.', answer: 'layers' },
                    { sentence: 'The global vertical farming market was valued at $_______ billion in 2022.', answer: '5.5' },
                    { sentence: 'Japanese company Spread produces _______ heads of lettuce daily.', answer: '30,000' },
                ],
            },
            {
                type: 'mcq',
                items: [
                    { question: 'What is the main limitation of vertical farming mentioned by critics?', options: ['Water usage', 'Energy costs for lighting', 'Lack of technology', 'Consumer resistance'], correct: 1 },
                    { question: 'The author\'s tone toward vertical farming is best described as:', options: ['Entirely dismissive', 'Uncritically enthusiastic', 'Cautiously optimistic', 'Deeply skeptical'], correct: 2 },
                ],
            },
        ],
    },
];

// IELTS Writing — Task 1 (Graph/Data) + Task 2 (Essay)
export const IELTS_WRITING = {
    task1: [
        {
            id: 'line-graph-population',
            type: 'line_graph',
            title: 'World Population Growth (1950-2050)',
            instruction: 'The line graph shows the population growth of four countries between 1950 and 2050 (projected). Summarize the information by selecting and reporting the main features, and make comparisons where relevant.',
            dataDescription: 'China: 550M→1.4B→1.3B | India: 380M→1.4B→1.7B | USA: 150M→330M→380M | Nigeria: 30M→210M→400M',
            modelAnswer: `The line graph illustrates population changes in China, India, the USA, and Nigeria from 1950 to 2050, with projections for the latter period.

Overall, India and Nigeria are expected to experience continued growth, while China's population is projected to decline after peaking around 2030. The USA shows steady but modest growth throughout the period.

In 1950, China had the largest population at approximately 550 million, followed by India at 380 million. Both nations experienced rapid growth, with China reaching 1.4 billion by 2020. However, their trajectories diverge significantly thereafter: India is projected to surpass China by 2025 and reach 1.7 billion by 2050, while China's population is expected to decline to approximately 1.3 billion.

Nigeria demonstrates the most dramatic proportional growth, rising from just 30 million in 1950 to an estimated 400 million by 2050 — more than a tenfold increase. In contrast, the USA shows the most stable trend, growing gradually from 150 million to a projected 380 million over the century.`,
            wordCount: 160,
            band: 8,
        },
        {
            id: 'bar-chart-energy',
            type: 'bar_chart',
            title: 'Energy Consumption by Source (2000 vs 2020)',
            instruction: 'The bar chart compares energy consumption by source in five countries in 2000 and 2020. Summarize the information by selecting and reporting the main features.',
            dataDescription: 'Oil, Gas, Coal, Nuclear, Renewables across USA, China, Germany, Japan, Brazil',
            modelAnswer: `The bar chart compares the energy mix of five nations — the USA, China, Germany, Japan, and Brazil — in 2000 and 2020.

Overall, fossil fuels remained dominant in most countries, but there was a notable shift toward renewable energy sources in all five nations over the two decades.

China experienced the most significant change, with coal consumption doubling from 600 to 1,200 million tonnes of oil equivalent, reflecting rapid industrialization. However, China also saw the largest absolute increase in renewables, growing from virtually zero to approximately 200 million tonnes.

In contrast, Germany made the most progress in transitioning away from fossil fuels, reducing coal consumption by approximately 40% while increasing renewables fivefold. Brazil maintained the highest proportion of renewable energy throughout both periods, primarily due to its extensive hydroelectric infrastructure.

The USA and Japan showed more modest changes, with both reducing oil dependence slightly while increasing natural gas and renewable consumption. Nuclear energy remained relatively stable across all countries except Germany, which began phasing out nuclear power following policy changes after 2011.`,
            wordCount: 170,
            band: 7.5,
        },
    ],
    task2: [
        {
            id: 'technology-education',
            type: 'opinion',
            title: 'Technology in Education',
            prompt: 'Some people believe that technology has made education more accessible and effective. Others argue that it has created new problems, such as reduced attention spans and increased inequality. Discuss both views and give your own opinion.',
            modelEssay: {
                band7: `Technology has transformed education in recent decades, leading to a debate about whether its impact has been primarily positive or negative. While there are valid concerns about its effects, I believe the benefits ultimately outweigh the drawbacks.

On the one hand, technology has made education more accessible than ever before. Online platforms such as Coursera and Khan Academy offer free courses from prestigious universities, enabling learners in developing countries to access world-class education. Furthermore, tools like interactive simulations and educational apps have made complex subjects more engaging, particularly for visual learners.

On the other hand, critics raise legitimate concerns. Research suggests that excessive screen time may reduce concentration, with some studies showing that students who multitask with devices score 11% lower on tests. Additionally, the digital divide means that students without reliable internet access are increasingly disadvantaged, potentially widening existing educational inequalities.

In my opinion, while these challenges are real, they can be addressed through thoughtful implementation. Schools should establish clear guidelines for device usage, and governments must invest in digital infrastructure to ensure equitable access. When used appropriately, technology enhances rather than diminishes the learning experience.

In conclusion, technology in education offers significant benefits that can be realized if potential problems are proactively managed through policy and pedagogy.`,
            },
            keyVocabulary: ['accessible', 'prestigious', 'interactive', 'multitask', 'concentration', 'digital divide', 'equitable', 'implementation', 'pedagogy'],
        },
        {
            id: 'environment-economy',
            type: 'discuss_both',
            title: 'Environment vs Economic Growth',
            prompt: 'Some people think that environmental problems should be solved by governments, while others believe that individuals should take responsibility. Discuss both views and give your opinion.',
            modelEssay: {
                band7: `The question of who bears primary responsibility for environmental protection — governments or individuals — is increasingly relevant as environmental challenges intensify. Both levels of action are essential, but I believe government intervention is more critical for achieving meaningful change.

Proponents of government responsibility argue that environmental problems require systemic solutions that only governments can implement. Regulations such as carbon taxes, emissions standards, and protected natural areas have proven effective at reducing pollution and preserving biodiversity. For instance, the European Union's emissions trading system has reduced CO2 emissions by approximately 35% since 2005, demonstrating the power of government policy.

Those who emphasize individual responsibility point to the cumulative impact of personal choices. Reducing meat consumption, choosing sustainable transportation, and minimizing waste can collectively make a significant difference. Moreover, individual action sends market signals that drive corporate behavior, as demonstrated by the growing demand for organic and sustainably sourced products.

However, I contend that government action is fundamentally more important. Individual choices, while valuable, cannot address structural issues such as industrial pollution, which accounts for approximately 70% of global emissions. Without regulatory frameworks, even well-intentioned individuals are limited in their impact.

In conclusion, while both governmental and individual action are necessary, governments bear the greater responsibility due to their unique capacity to implement large-scale systemic changes.`,
            },
            keyVocabulary: ['systemic', 'emissions', 'biodiversity', 'cumulative', 'sustainable', 'regulatory framework', 'structural', 'intervention'],
        },
    ],
};

// IELTS Speaking — Part 1 (Interview), Part 2 (Cue Card), Part 3 (Discussion)
export const IELTS_SPEAKING = {
    part1: [
        {
            topic: 'Home & Living', questions: [
                'Do you live in a house or an apartment?',
                'What do you like most about your home?',
                'Would you like to move to a different place in the future?',
            ], sampleAnswers: [
                'I live in a two-bedroom apartment in the city center. It is quite compact, but I appreciate the convenience of being close to public transport and shops.',
                'What I like most is probably the natural light. My apartment has large windows that face south, so it gets plenty of sunshine throughout the day, which really lifts my mood.',
                'Actually, I would love to move to the suburbs eventually. While I enjoy the vibrant atmosphere of the city, I think having more space and a quieter environment would be beneficial, particularly if I start a family.',
            ]
        },
        {
            topic: 'Work & Study', questions: [
                'What do you do? Do you work or study?',
                'Why did you choose this particular field?',
                'What do you enjoy most about your work/studies?',
            ], sampleAnswers: [
                'I work as a software engineer at a technology company. I have been in this role for about three years now.',
                'I chose this field primarily because I have always been fascinated by problem-solving and logical thinking. Technology evolves rapidly, which keeps the work intellectually stimulating.',
                'What I enjoy most is the creative aspect of building solutions. There is something incredibly satisfying about writing code that solves a real-world problem and seeing it used by thousands of people.',
            ]
        },
        {
            topic: 'Reading', questions: [
                'Do you like reading? What kind of books do you prefer?',
                'Do you think reading is important? Why?',
                'Has the way you read changed over the years?',
            ], sampleAnswers: [
                'Yes, I am quite an avid reader. I particularly enjoy non-fiction, especially books about psychology and history, though I also read fiction occasionally for relaxation.',
                'Absolutely. Reading is crucial for expanding vocabulary, improving critical thinking, and gaining exposure to diverse perspectives. Research consistently shows that regular readers have better analytical skills.',
                'Definitely. I used to read exclusively physical books, but I have gradually shifted to e-books and audiobooks for convenience. I listen to audiobooks during my commute, which has actually increased my reading volume significantly.',
            ]
        },
    ],
    part2: [
        {
            id: 'describe-achievement',
            cueCard: 'Describe a personal achievement you are proud of.',
            points: ['What it was', 'When it happened', 'How you achieved it', 'And explain why you are proud of it'],
            thinkTime: 60,
            speakTime: 120,
            sampleAnswer: `I would like to talk about completing my first marathon last year, which I consider one of my proudest achievements.

It was the Ho Chi Minh City Marathon in January, and I had been training for approximately six months beforehand. Initially, I could barely run five kilometers without stopping, so the idea of completing 42.2 kilometers seemed almost impossible.

I achieved this through consistent training and gradual progression. I followed a structured plan that increased my weekly mileage by no more than 10% each week, which is the recommended approach to avoid injury. I also made significant lifestyle changes, including improving my diet and ensuring I got adequate sleep.

On race day, the conditions were quite challenging — it was unusually hot and humid. Around the 30-kilometer mark, I hit what runners call "the wall" and seriously considered giving up. However, the encouragement from spectators and fellow runners kept me going.

I am particularly proud of this achievement because it taught me that perseverance and consistent effort can overcome seemingly impossible challenges. The discipline I developed during training has positively influenced other areas of my life, including my professional work.`,
        },
        {
            id: 'describe-place',
            cueCard: 'Describe a place you would like to visit in the future.',
            points: ['Where it is', 'How you learned about it', 'What you would do there', 'And explain why you would like to visit this place'],
            thinkTime: 60,
            speakTime: 120,
            sampleAnswer: `I would love to visit Iceland, which is a small island nation in the North Atlantic Ocean, situated between Europe and North America.

I first learned about Iceland through a documentary series about its unique geological features. The country sits on the Mid-Atlantic Ridge, where two tectonic plates are slowly pulling apart, creating an extraordinary landscape of volcanoes, geysers, and glaciers.

If I had the opportunity to visit, I would definitely want to see the Northern Lights, which are apparently most visible between September and March. I would also explore the famous Golden Circle route, which includes the Gullfoss waterfall and Geysir geothermal area. Additionally, I would try to visit the Blue Lagoon, a geothermal spa that looks absolutely stunning in photographs.

The main reason I want to visit Iceland is its unique combination of natural wonders. Unlike most tourist destinations, Iceland offers landscapes that genuinely cannot be found anywhere else on Earth. The contrast between fire and ice — active volcanoes next to massive glaciers — is something I find both scientifically fascinating and visually spectacular.`,
        },
    ],
    part3: [
        {
            topic: 'Achievement & Success',
            questions: [
                'What factors contribute to success in life?',
                'Do you think success means the same thing to everyone?',
                'How has the definition of success changed in recent years?',
                'Is it better to set realistic goals or ambitious ones?',
            ],
        },
        {
            topic: 'Travel & Tourism',
            questions: [
                'How has tourism changed in your country over the past decade?',
                'What are the negative effects of mass tourism?',
                'Should governments limit the number of tourists visiting popular sites?',
                'Do you think virtual travel experiences could replace physical travel?',
            ],
        },
        {
            topic: 'Technology & Society',
            questions: [
                'How has technology changed the way people communicate?',
                'Do you think artificial intelligence will create more jobs or destroy them?',
                'Should children be allowed to use smartphones from a young age?',
                'What role should technology play in education?',
            ],
        },
    ],
};

export function getReadingPassageById(id) {
    return IELTS_READING_PASSAGES.find(p => p.id === id);
}

export function getWritingTaskById(taskType, id) {
    return IELTS_WRITING[taskType]?.find(t => t.id === id);
}

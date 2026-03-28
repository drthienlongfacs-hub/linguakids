# Market Harvest: English and Chinese Learning Systems

Audit date: 2026-03-29

## Scope

This document benchmarks major English-learning, Chinese-learning, and conversation-practice systems using official product pages, help centers, or official blogs only.

Goal: identify the highest-value product patterns to harvest for the next Lingua upgrade cycle.

## Method

- Only official product sources were used.
- Focus areas:
  - curriculum structure
  - speaking loop
  - pronunciation / feedback loop
  - listening / immersion loop
  - Chinese-specific mechanics
  - human/community interaction
  - between-session review and progress tracking
- The benchmark is product-design oriented, not investor/marketing oriented.

## Product Segments

### 1. AI speaking-first English systems

| Product | Officially confirmed strengths | Harvest value for Lingua | Main caution |
| --- | --- | --- | --- |
| Duolingo Max | Video Call, Roleplay, Explain My Answer, post-chat transcript review, AI feedback, human-authored scenarios | Persona-based AI calls, scenario memory, transcript review after talk | Chinese coverage is not symmetrical with major European tracks; expensive AI loop |
| ELSA Speak | Detailed pronunciation, fluency, intonation, grammar, vocab feedback; bilingual AI tutor; accent choice | Strongest pronunciation analytics model to emulate | Can over-optimize pronunciation versus real communication |
| Speak | AI tutor, pronunciation coach, daily-life tutor scenarios, roleplay, speaking-first UX | Best model for "speak more, learn faster" interaction density | English-first product; likely high STT cost |
| Babbel Speak | Calm, judgment-free AI scenarios, hinting, translations, feedback after conversation | Good model for low-anxiety guided conversations | Availability is still selective by language/interface |
| Busuu Conversations | AI partner, real-time speaking, end-of-conversation personalized feedback, chapter-aligned AI conversation lessons | Best model for inserting AI conversation at the end of curriculum chapters | Requires strong course-to-scenario alignment |

### 2. Chinese-specialized learning systems

| Product | Officially confirmed strengths | Harvest value for Lingua | Main caution |
| --- | --- | --- | --- |
| HelloChinese | Reading, writing, speaking, vocabulary, grammar, speech recognition, handwriting, 2000+ native videos, SRS | Best all-in-one Chinese benchmark for beginner/intermediate path | Content ops load is high |
| SuperChinese | Expert-designed path, HSK-oriented structure, CHAO AI corrections, explicit educator-first / AI-second positioning | Good model for hybrid "expert curriculum + AI correction" | Product tone is more adult/self-learner than child-first |
| Skritter | Handwriting recognition, stroke-level grading, stroke order help, textbook mapping, SRS | Best pattern for Hanzi writing mastery loop | Narrow feature set; not a full learning platform |
| Pimsleur Mandarin | Audio-first conversation method, first-day speaking emphasis, Voice Coach, Speak Easy roleplay transcripts | Strong audio/shadowing engine model, especially for hands-free practice | Lower visual engagement for children |
| Rosetta Stone | Full immersion, TruAccent pronunciation engine, stories / phrasebook / live lessons | Strong immersion + pronunciation combination | Weak native-language scaffolding for early learners |

### 3. Human tutoring and conversation systems

| Product | Officially confirmed strengths | Harvest value for Lingua | Main caution |
| --- | --- | --- | --- |
| Cambly | 24/7 native-speaking tutors, private/group lessons, lesson recordings, interactive transcripts, between-lesson activities | Best benchmark for tutor replay + transcript + homework loop | Tutor marketplace and QA are operationally heavy |
| Preply | 1:1 live tutoring, bilingual tutors, AI Lesson Insights, Daily Exercises, tutor filtering by learner need | Best hybrid human + AI recap model | Marketplace complexity and variable tutor quality |

### 4. Social/community practice systems

| Product | Officially confirmed strengths | Harvest value for Lingua | Main caution |
| --- | --- | --- | --- |
| Tandem | Partner search, text, voice note, audio/video call, correction, translation tools | Cleanest low-cost partner-practice model | Moderation/safety burden is high |
| HelloTalk | Chat, voice, video, Moments, Connect filters, Live, Voicerooms, pronunciation assessor | Richest community practice and creator layer | Highest moderation, trust, abuse, and product-focus risk |

### 5. Immersion + media-assisted self-study

| Product | Officially confirmed strengths | Harvest value for Lingua | Main caution |
| --- | --- | --- | --- |
| Memrise | Native speaker videos, private AI coach, scenario system, AI conversation tab, phrase relevance | Best benchmark for "hear real people + then speak" flow | Recent cloud-first redesign reduces offline value |

## What The Market Repeats Over And Over

Across products, the same winning patterns appear:

1. Scenario-based speaking beats isolated word practice.
2. Feedback works best after the speaking turn, not while interrupting the learner.
3. The strongest systems connect lesson content to realistic conversation tasks.
4. Chinese products win when they combine pinyin, tones, hanzi writing, and real listening in one loop.
5. Human-like practice works best when learners can fail privately first.
6. The best retention systems always include post-session review, recap, and targeted reuse.
7. Community/tutor layers create value, but they also create the highest moderation and operations burden.

## Capability Harvest Matrix

The table below normalizes what each product family is actually good at, so Lingua can harvest the right mechanics instead of copying whole products.

| Segment | Structured curriculum | AI speaking | Pronunciation analysis | Listening immersion | Chinese-specific depth | Human/community practice | Best harvest target for Lingua |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Duolingo Max / Busuu / Babbel / Speak / ELSA | High | High | High | Medium | Low | Low | AI roleplay, chapter-end checkpoints, post-session feedback |
| HelloChinese / SuperChinese / Skritter / Pimsleur / Rosetta Stone | High | Medium | Medium | High | Very high | Low | Tones, pinyin, hanzi, native listening, shadowing |
| Cambly / Preply | Medium | Low | Medium | Medium | Low | Very high | Transcript, lesson recap, homework from session errors |
| Tandem / HelloTalk | Low | Low | Low | Medium | Medium | Very high | Async voice exchange, corrections, safe peer practice |
| Memrise | Medium | Medium | Low | High | Low | Low | Learn-hear-use chaining and native video rails |

## Module Harvest Map For Lingua

This maps the market evidence directly to Lingua modules.

| Lingua area | Current gap | Best market references | Concrete harvest |
| --- | --- | --- | --- |
| Vocabulary topics | Topic counts now exist, but progression still feels like static lists | Busuu, HelloChinese, Memrise | Topic arcs with learn-hear-use sequencing and topic-end recap |
| Listening | Still too detached from speaking and correction | Memrise, Pimsleur, HelloChinese | Audio micro-lessons, shadow after listen, comprehension then reply |
| Speaking | Feedback is lighter than leaders and lacks strong transcript review | ELSA, Speak, Duolingo Max, Busuu | Turn transcript, replay, multi-metric scoring, next-step drills |
| Chinese track | Improved scale but still too symmetric with English | HelloChinese, SuperChinese, Skritter | Tones, pinyin production, hanzi tracing, handwriting grading |
| Review loop | Weak session recap from user-specific mistakes | Preply, Cambly, Busuu | Auto-generated recap cards and follow-up practice |
| Community layer | No peer or mentor loop yet | Tandem, Cambly | Start with moderated async voice review, not open social |

## Upgrade Candidate Stack

If Lingua upgrades again, the highest-yield stack is:

1. Topic-to-conversation pipeline
   - Learn words
   - Hear native dialogue
   - Shadow key lines
   - Answer with voice
   - Receive recap cards
2. Chinese deep-practice rail
   - tone discrimination
   - tone production
   - pinyin-to-audio
   - hanzi tracing
   - hanzi recall
3. Session intelligence layer
   - transcript
   - pronunciation score
   - fluency score
   - grammar/vocabulary notes
   - generated homework
4. Safe practice expansion
   - async mentor review first
   - peer exchange later

## Official Evidence Snapshot

### Duolingo Max

- Official blog states Video Call lets learners talk in real time with Lily, review a transcript after the call, and continue prior conversation context.
- Official blog states Roleplay gives AI-powered feedback on response accuracy and complexity.
- Official blog states Chinese learners have Video Call access, while Roleplay coverage is narrower.

Implication for Lingua:

- Add persistent AI conversation personas.
- Add post-conversation transcript review and replay.
- Do not assume all languages should launch with identical conversation modes.

### Busuu + Babbel

- Busuu methodology uses communicative chunks, controlled practice, free writing correction, private messaging, voice recording, and voice recognition.
- Busuu Conversations adds chapter-linked AI speaking with post-conversation feedback.
- Babbel Speak emphasizes realistic scenarios, hinting, and calm no-pressure practice.

Implication for Lingua:

- Tie every lesson cluster to one speaking checkpoint.
- Give structured hints before and after, but do not interrupt the speaking turn.
- Add "AI conversation lessons" inside chapter progression, not only as a separate free-play mode.

### ELSA + Speak

- ELSA focuses on detailed pronunciation and fluency analytics.
- Speak focuses on daily-life scenarios, AI tutor flows, pronunciation coach, and roleplay.

Implication for Lingua:

- Split speaking analytics into:
  - pronunciation
  - fluency
  - vocabulary range
  - grammar control
  - task completion
- Keep the learner-facing UX simple even if the backend scoring is multi-dimensional.

### HelloChinese + SuperChinese + Skritter

- HelloChinese proves that Chinese learners expect one path containing speaking, handwriting, native videos, and SRS.
- SuperChinese shows the market now favors expert curriculum plus AI correction, not AI-only curriculum.
- Skritter proves stroke-level writing feedback is a category on its own.

Implication for Lingua:

- Chinese in Lingua should stop being only a mirrored English track.
- Build Chinese-specific loops:
  - tone discrimination
  - tone production
  - pinyin-to-speech
  - hanzi tracing and recall
  - video-based listening

### Cambly + Preply

- Cambly focuses on real tutors, lesson recordings, transcripts, and between-lesson practice.
- Preply adds AI Lesson Insights and Daily Exercises after live lessons.

Implication for Lingua:

- Even without a tutor marketplace, Lingua should copy the post-session layer:
  - transcript
  - mistakes summary
  - vocabulary recap
  - mini exercises generated from the session

### Tandem + HelloTalk

- Tandem keeps the practice layer relatively clean: partner search, chat, voice, audio/video, correction, translate.
- HelloTalk expands this into Moments, Live, Voicerooms, creator economy, pronunciation tools.

Implication for Lingua:

- If Lingua ever adds peer practice, start with:
  - asynchronous voice exchange
  - built-in correction tools
  - strict safety controls
- Do not start with a public social feed or livestream ecosystem.

### Memrise

- Memrise now organizes around scenarios, videos, and conversations.
- The loop is: learn phrases, hear real people say them, then use them with the AI coach.

Implication for Lingua:

- Listening and speaking should be chained together more tightly.
- "Learn -> Hear -> Use" is a better module architecture than isolated tabs.

## Lingua Gap Review

Based on the current Lingua codebase, the biggest competitive gaps are:

1. Speaking exists, but the post-session coaching layer is still lighter than ELSA / Speak / Busuu.
2. Chinese content scale is improved, but Chinese-specialized mechanics are still behind HelloChinese / Skritter / SuperChinese.
3. Listening and speaking are still too separate; the market is moving toward linked scenario loops.
4. Lingua lacks a serious transcript + recap + generated follow-up exercise layer.
5. Lingua has no human practice layer yet.
6. Lingua does not yet expose enough "why you got this wrong" tutoring after conversation turns.

## Highest-Value Patterns To Harvest Next

### Priority A: Build immediately

1. Scenario speaking engine with transcript replay
2. Post-session skill breakdown:
   - pronunciation
   - fluency
   - grammar
   - vocabulary
   - task completion
3. Chapter-end AI conversation checkpoints
4. Chinese tone and pinyin speaking drills
5. Chinese hanzi writing / recall loop
6. Listening-to-speaking chaining:
   - listen
   - shadow
   - answer
   - recap
7. Session recap cards generated from user mistakes

### Priority B: Build after that

1. Native video / short dialogue immersion rail
2. Bilingual AI tutor explanations
3. Accent selection for English speaking practice
4. Smart recommendation engine across "learn / hear / use"
5. Tutor-style session summary and follow-up homework

### Priority C: Consider only after strong foundations

1. Asynchronous partner practice
2. Human tutor integrations
3. Community practice rooms

## What Lingua Should Explicitly Avoid For Now

1. Public social feed like HelloTalk Moments
2. Livestream/creator economy
3. Open tutor marketplace
4. Full real-time video social graph

Reason:

- These features create large moderation, trust, abuse, privacy, and operations burdens.
- They can easily derail the product from structured learning into noisy social usage.

## Recommended Upgrade Roadmap

### Wave 1: Speaking and Chinese core quality

- Replace current speaking result screens with transcript + multi-metric coaching.
- Add chapter-linked AI roleplay lessons.
- Add Chinese tone perception and tone production drills.
- Add Hanzi writing module with grading.
- Add error-to-review card generation.

### Wave 2: Immersion and adaptive practice

- Add native-video / micro-dialogue rail.
- Build "learn -> hear -> use" pathway at the topic level.
- Add adaptive recommendations based on user weakness clusters.
- Add bilingual tutor explanations and hinting.

### Wave 3: Human practice lite

- Add safe, asynchronous voice exchange or mentor review.
- Keep it invite-based or moderated, not open-social by default.

## Suggested Product Direction For Lingua

If Lingua wants the strongest next step, the best positioning is not:

- "another broad language app"

It should be:

- "a structured English + Chinese speaking system with strong correction, strong review, and Chinese-specific writing/tone support"

That direction is more defensible than chasing:

- social feed scale
- tutor marketplace scale
- generic flashcard scale

## Source Links

Official sources used in this audit:

- Duolingo Max: https://blog.duolingo.com/duolingo-max/
- Busuu methodology: https://www.busuu.com/en/it-works/busuu-methodology
- Busuu Conversations: https://blog.busuu.com/new-conversations-release/
- Speak: https://www.speak.com/vn/inf-vuive
- ELSA Speak: https://elsaspeak.com/en/
- Babbel Speak: https://support.babbel.com/hc/en-us/articles/25875402999826-Babbel-Speak
- HelloChinese: https://www.hellochinese.cc/
- SuperChinese: https://www.superchinese.com/
- Skritter features: https://skritter.com/features/
- Pimsleur Mandarin: https://www.pimsleur.com/learn-chinese-mandarin/
- Rosetta Stone: https://eu.rosettastone.com/tryitnow/
- Cambly: https://studentsupport.cambly.com/hc/en-us/articles/360000299966-What-is-Cambly-
- Cambly free tools: https://www.cambly.com/english/resources
- Preply English for Chinese speakers: https://preply.com/en/online/english-tutors/chinese-speakers
- Preply Chinese for English speakers: https://preply.com/en/online/chinese-tutors/english-speakers
- Tandem: https://tandem.net/en
- HelloTalk navigation: https://creators.hellotalk.com/article/navigating-hellotalk
- HelloTalk creator features: https://creators.hellotalk.com/article/features-to-create
- Memrise: https://www.memrise.com/
- Memrise major update: https://www.memrise.com/blog/major-update-a-new-version-of-the-app-is-coming

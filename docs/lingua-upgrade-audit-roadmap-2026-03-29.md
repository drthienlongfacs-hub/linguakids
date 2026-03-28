# Lingua Upgrade Audit And Execution Roadmap

Audit date: 2026-03-29

Related benchmark:
- `docs/market-harvest-english-chinese-platforms-2026-03-29.md`

## Purpose

This document converts the market harvest into a repo-grounded technical audit.

It answers four questions:

1. What in Lingua is truly working today?
2. What is only browser-dependent or heuristic?
3. What is still simulated rather than production-grade?
4. What should be built next, in what order, and with what release gates?

## Audit Method

- Reviewed current repo structure and live front-end modules.
- Audited current implementation files, not only UI labels.
- Classified each capability into one of four states:
  - `Operational`
  - `Operational with browser limits`
  - `Simulated / heuristic`
  - `Missing / incomplete`

## Repo Reality Check

Current repo shape:

- Front-end Vite app only.
- No dedicated backend service directory or server runtime in the repo.
- Most learning experiences are client-side data plus browser-native speech APIs.

Implication:

- Lingua can already deliver a real front-end learning product.
- Lingua cannot honestly claim full backend-grade speech evaluation, persistent AI tutoring, or cross-device identical speech performance yet.

## Capability Audit

| Area | Current state | Evidence in repo | Audit result | Main risk |
| --- | --- | --- | --- | --- |
| Topic vocabulary scale | Large standard topic banks are connected to topic pages | `src/pages/LearnEnglish.jsx`, `src/pages/LearnChinese.jsx`, `src/services/standardTopicService.js` | Operational | Topic progression still feels list-first, not lesson-arc-first |
| Standard lexicon metadata | Standard lexicon and lookup metadata are wired into review and dashboard flows | `src/services/standardLexiconService.js`, `src/pages/VocabularyDashboard.jsx` | Operational | Metadata is strong, but lesson-to-review reuse is still limited |
| English listening | Lesson structure is real, but audio is generated with browser TTS | `src/modules/listening/ListeningLesson.jsx`, `src/modules/listening/ListeningPlayer.jsx` | Simulated / heuristic | TTS is not equivalent to recorded native listening content |
| Chinese listening | Same as English listening, with pinyin support and Chinese segments | `src/modules/listening_cn/ListeningCnLesson.jsx`, `src/modules/listening/ListeningPlayer.jsx` | Simulated / heuristic | Still depends on browser voice quality instead of controlled source audio |
| English speaking | Recording, transcript capture, and scoring exist in supported browsers | `src/modules/speaking/SpeakingExercise.jsx`, `src/modules/speaking/ShadowingEngine.jsx`, `src/hooks/useSpeech.js` | Operational with browser limits | STT varies by browser/device and falls back to typed input |
| Chinese speaking | Tone drill, shadowing, and prompt flows exist | `src/modules/speaking_cn/SpeakingCnHub.jsx`, `src/hooks/useSpeech.js` | Operational with browser limits | Same STT limitations; tone evaluation is not acoustic-grade |
| Pronunciation scoring | Word and sentence scoring are based on text similarity and phonetic rules | `src/utils/pronunciationEngine.js`, `src/modules/speaking/ShadowingEngine.jsx` | Simulated / heuristic | Useful for practice, but not true phoneme/acoustic scoring |
| AI conversation | Scenario chat exists, but it is rule-based pattern matching | `src/modules/conversation/ConversationAI.jsx` | Simulated / heuristic | Should not be marketed as full AI conversation tutoring |
| Chinese Hanzi writing | Real stroke-order tracing exists using HanziWriter | `src/pages/StrokeWriter.jsx` | Operational | Only 20 characters, remote char data dependency, not yet curriculum-scale |
| Review and spaced repetition | Word review exists with due/mastery states | `src/pages/VocabularyDashboard.jsx`, `src/store/useGameStore.ts`, `src/services/fsrs.js` | Operational | Review is word-centric; no session-level recap cards yet |
| Product roadmap flow | Learning roadmap exists for exam style flows | `src/modules/roadmap/RoadmapHub.jsx`, `src/data/studyPlan.js` | Operational | Not yet connected to speaking/listening weakness-driven adaptation |

## What Lingua Can Honestly Claim Today

Safe claims:

- Large English and Chinese topic banks are live.
- Vocabulary counts are real and connected to standard topic data.
- Listening, speaking, review, and Hanzi practice modules are usable in the browser.
- Speaking practice supports TTS playback and browser speech recognition where available.
- Chinese includes topic banks, listening, speaking, grammar, and starter Hanzi writing.

Claims that should be avoided for now:

- "Perfect speech recognition across devices"
- "Backend-grade pronunciation analysis"
- "Native listening audio library" if the lesson is powered by browser TTS
- "AI conversation tutor" for the current rule-based scenario engine
- "Production-grade Chinese tone scoring" beyond guided practice

## Root Causes Behind The Current Quality Ceiling

### 1. Speech relies on browser APIs

Files:
- `src/hooks/useSpeech.js`
- `src/modules/speaking/SpeakingExercise.jsx`
- `src/modules/speaking/ShadowingEngine.jsx`

Observed reality:

- STT uses `SpeechRecognition` or `webkitSpeechRecognition`.
- Unsupported or blocked browsers fall back to `prompt()` typed input.
- Browser voice availability also affects TTS quality.

Result:

- The experience works.
- It is not uniform enough to be called device-perfect.

### 2. Listening uses generated speech, not controlled recordings

Files:
- `src/modules/listening/ListeningPlayer.jsx`
- `src/modules/listening/ListeningLesson.jsx`
- `src/modules/listening_cn/ListeningCnLesson.jsx`

Observed reality:

- Listening playback is synthesized from transcript segments with `SpeechSynthesisUtterance`.
- Timing is simulated from segment metadata.

Result:

- Good enough for structured training and shadowing.
- Not competitive yet with products built around native audio or studio recordings.

### 3. Speaking analytics are text-similarity driven

Files:
- `src/utils/pronunciationEngine.js`
- `src/modules/speaking/ShadowingEngine.jsx`

Observed reality:

- Scoring uses edit distance, phonetic normalization rules, and transcript overlap.
- This is smart heuristic scoring, not acoustic feature analysis.

Result:

- Helpful for practice feedback.
- Not enough for strong pronunciation claims.

### 4. Conversation is scenario-based but not model-based

File:
- `src/modules/conversation/ConversationAI.jsx`

Observed reality:

- Replies are selected from trigger-word templates plus generic fallbacks.

Result:

- Good prototype for controlled practice.
- Not yet a true conversational tutor, transcript coach, or adaptive dialogue engine.

### 5. Chinese-specific depth exists but is still narrow

Files:
- `src/modules/speaking_cn/SpeakingCnHub.jsx`
- `src/modules/listening_cn/ListeningCnHub.jsx`
- `src/pages/StrokeWriter.jsx`

Observed reality:

- Chinese now has stronger scale and dedicated modules.
- Hanzi writing is real but small.
- Tone drills exist, but not full acoustic tone analysis.

Result:

- The track is directionally correct.
- It is not yet at HelloChinese / Skritter depth.

## Release Gate Policy For The Next Upgrade Cycle

No feature should be considered complete until all gates below pass.

### Gate A: Truthfulness

- UI labels must match actual implementation.
- If audio is TTS, say so internally and avoid "native audio" language.
- If conversation is rule-based, do not present it as a full AI tutor.
- If STT has fallback typing, that state must be treated as degraded mode.

### Gate B: Operational Verification

- Desktop Chrome: full happy path
- Safari iPhone: degraded path documented and non-blocking
- Android Chrome: full happy path
- Browser without STT: fallback path must not dead-end

### Gate C: Content Verification

- Topic counts must come from live data, not hardcoded labels.
- Lesson counts must match actual sentence/segment arrays.
- Chinese writing banks, tone drills, and review cards must all be backed by source data.

### Gate D: Performance And Failure Handling

- TTS unavailable: lesson remains navigable
- STT unavailable: speaking flow offers explicit fallback state
- Remote asset unavailable: Hanzi module fails gracefully

### Gate E: Product Proof

- Every major new module must have one clearly defined outcome metric:
  - completion rate
  - retry rate
  - speech capture success rate
  - review return rate

## Priority Roadmap

### P0: Product Truth And Infrastructure Baseline

Goal:
- Stop over-claiming.
- Make degraded states explicit.
- Prepare the app for real speech and richer content upgrades.

Build items:

1. Add capability state badges to critical modules
   - Listening: `TTS lesson audio`
   - Speaking: `Browser speech recognition`
   - Conversation: `Guided scenario engine`
2. Centralize speech capability detection
   - One service for TTS/STT support matrix
   - One user-facing degraded-mode banner
3. Add event logging hooks for:
   - speech start success
   - speech capture failure
   - typed fallback usage
   - listening completion
4. Expand audit docs and release checklist in repo

Primary files to touch:

- `src/hooks/useSpeech.js`
- `src/modules/speaking/SpeakingExercise.jsx`
- `src/modules/speaking/ShadowingEngine.jsx`
- `src/modules/listening/ListeningPlayer.jsx`
- `src/modules/conversation/ConversationAI.jsx`

### P1: Real Listening Upgrade

Goal:
- Replace simulated listening with controlled audio assets where quality matters most.

Build items:

1. Introduce an audio manifest per lesson
   - audio URL
   - transcript segments
   - translation
   - pinyin where needed
2. Update listening player to support:
   - recorded audio
   - transcript sync
   - fallback to TTS only when no media asset exists
3. Prioritize native or curated audio for:
   - top English beginner topics
   - top Chinese beginner topics
   - most-used shadowing lessons

Primary files to touch:

- `src/modules/listening/ListeningPlayer.jsx`
- `src/modules/listening/ListeningLesson.jsx`
- `src/modules/listening_cn/ListeningCnLesson.jsx`
- `src/data/listening.js`
- `src/data/listening_cn.js`

### P2: Speaking Intelligence Layer

Goal:
- Move from simple score display to real post-session coaching.

Build items:

1. Persist transcript and attempt history
2. Split feedback into:
   - pronunciation
   - fluency
   - completeness
   - vocabulary use
   - grammar hints
3. Add session recap cards from mistakes
4. Add replay and compare flow after each speaking set

Primary files to touch:

- `src/modules/speaking/ShadowingEngine.jsx`
- `src/modules/speaking/SpeakingExercise.jsx`
- `src/pages/DailyReview.jsx`
- `src/pages/VocabularyDashboard.jsx`
- `src/store/useGameStore.ts`

Important note:

- If Lingua wants backend-grade speaking evaluation, this phase eventually requires a dedicated speech analysis service or self-hosted engine. The current client-only heuristic should remain a fallback, not the final tier.

### P3: Chinese Deep-Practice Rail

Goal:
- Make Chinese a first-class track, not only a scaled mirror of English.

Build items:

1. Expand Hanzi writer from 20 characters to curriculum sets
2. Link Hanzi sets to current topic banks and lessons
3. Add pinyin-to-speech drills and tone discrimination tests
4. Add Chinese listen-shadow-answer chains
5. Add review cards specifically for:
   - tone confusion
   - character confusion
   - pinyin confusion

Primary files to touch:

- `src/pages/StrokeWriter.jsx`
- `src/modules/speaking_cn/SpeakingCnHub.jsx`
- `src/modules/listening_cn/ListeningCnHub.jsx`
- `src/data/speakingCnCurriculum.js`
- `src/data/listeningCnCurriculum.js`

### P4: Scenario Progression And Review Integration

Goal:
- Convert topic banks into learning arcs rather than static topic pages.

Build items:

1. Topic entry flow:
   - learn words
   - hear dialogue
   - shadow lines
   - answer prompts
   - receive recap
2. Topic-end checkpoint conversation
3. Auto-generated review queues from the topic session

Primary files to touch:

- `src/services/standardTopicService.js`
- `src/pages/LearnEnglish.jsx`
- `src/pages/LearnChinese.jsx`
- `src/modules/conversation/ConversationAI.jsx`
- `src/pages/DailyChallenge.jsx`

## Recommended Order Of Execution

1. P0 truthfulness and support matrix
2. P1 real listening foundation
3. P2 speaking intelligence layer
4. P3 Chinese deep-practice rail
5. P4 topic-to-conversation integration

Reason:

- P1 and P2 remove the biggest gap between current Lingua behavior and premium language-learning expectations.
- P3 makes Chinese defensible as a real product lane.
- P4 improves cohesion and retention after the foundation is strong enough.

## Definition Of Done For The Next Major Release

The next release should only be called a major quality upgrade if all items below are true:

- At least one top-level listening rail uses recorded or controlled audio assets, not TTS only.
- Speaking result screens show transcript and multi-part feedback, not only one blended score.
- Browser capability limits are explicitly handled and messaged.
- Chinese Hanzi practice covers a curriculum set larger than the current starter bank.
- Topic learning connects vocabulary, listening, speaking, and review in one flow.
- Release notes avoid any claim stronger than what the code path actually supports.

## Immediate Recommendation

The next build cycle should start with P0 plus the architecture work for P1.

That is the safest and highest-yield move because it:

- reduces misleading product claims
- protects future releases from repeating the same reporting gap
- creates the technical base needed for real listening and stronger speaking evaluation

## Final Audit Judgment

Lingua is no longer a tiny static learning demo. The data scale and module coverage are materially stronger now.

But Lingua is still in this state:

- strong front-end learning app
- partially browser-dependent speech product
- partially simulated listening product
- promising Chinese track with real direction but not yet category-leading depth

That is a good platform to build on, as long as the next upgrade cycle is governed by truthfulness, capability gates, and module-by-module verification rather than optimistic labels.

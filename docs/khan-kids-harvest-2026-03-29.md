# Khan Kids Harvest — Comprehensive Upgrade Plan

Date: 2026-03-29 (Updated)

---

## Scope

This harvest benchmarks Khan Academy Kids using official public sources + iOS 26 search UX patterns, and converts findings into LinguaKids product changes. **Goal: outperform Khan Kids** on interactivity, search UX, and bilingual depth.

## Official evidence used

- Khan Academy Kids official site: https://www.khanacademy.org/kids
- Khan Kids help center: https://khankids.zendesk.com/hc/en-us/sections/360001481891
- Khan Kids characters: https://khankids.zendesk.com/hc/en-us/articles/360049358751
- Khan Kids streaks/levels: https://support.khanacademy.org/hc/en-us/articles/28946883989261
- iOS 26 design system (Apple): https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/
- iOS 26 search tab analysis: https://ryanashcraft.com/ios-26-tab-bar-beef/
- Loora AI (conversation benchmark): https://www.loora.com
- Practice Me (multi-tutor benchmark): https://practiceme.app/vs/loora
- H5P interactive video: https://moodle.org/plugins/mod_interactivevideo
- awesome-video (GitHub): https://github.com/sitkevij/awesome-video

---

## Evidence snapshot — Khan Academy Kids (2026-03-29)

### Core Features
- **100% free**, no ads, no subscriptions
- Ages 2–8, standards-aligned curriculum
- **5,000+ playful activities, books, and interactive videos**
- Personalized learning path that adapts to child's age + progress

### Character/Mascot System (Key Differentiator)
| Mascot | Animal | Personality | Specialization |
|--------|--------|-------------|----------------|
| **Kodi** | Bear | Narrator, optimist | Main guide |
| **Reya** | Red Panda | Confident | Storytime, writing |
| **Peck** | Hummingbird | Excited, energetic | Counting, math |
| **Sandy** | Dingo | Free spirit | Creative play |
| **Ollo** | Elephant | Dependable | Phonics, letter sounds |

- Characters provide **scripted, specific encouragement** ("You traced the letter D!")
- Social-emotional learning via original character stories (friendship, persistence)
- Characters appear in interactive videos, books, and games

### Gamification
- **Streaks**: weekly proficiency requirement (≥1 new skill Mon-Sun)
- **Levels**: courses chunked into milestones with "level up" celebrations
- **Collectibles**: bugs, hats, toys, clothes → personalized character rooms
- **Energy points** + **badges** (challenge patches)
- **Avatar customization** earned through mastery

### Video Integration (Main gap vs LinguaKids)
- **Interactive animated videos** embedded throughout curriculum
- **Read-aloud storybooks** with character narration
- **Phonics video lessons** with letter sounds, sign language, pictures
- Videos are NOT passive — they include **tap-to-interact moments**
- Scaffolded: video → practice exercise → reinforcement game

### Teacher/Parent Dashboard
- Multiple child profiles with age-based avatars
- Assign lessons, track student progress, actionable insights
- Classroom-ready features (admin tools)

---

## Evidence snapshot — iOS 26 Search UX (2026-03-29)

### "Liquid Glass" Design System
- Translucent material that reflects/refracts surroundings
- **Tab bars**: capsule-shaped, inset from screen edges
- **Search tab**: circular shape, morphs into search field when tapped
- Scroll → tab bar shrinks for content focus; scroll back → expands
- **Bottom placement** for reachability (thumb-friendly)

### Search UX Best Practices (from research)
| Pattern | When to Use | Example |
|---------|------------|---------|
| **Search bar (top)** | Content-heavy apps, frequent search | App Store, Google |
| **Search icon** | Browse-focused, infrequent search | Medium, Instagram |
| **Search tab (bottom)** | Feature-heavy apps, equal weight to search | Uber Eats, iOS 26 |
| **Spotlight overlay (Cmd+K)** | Power-user apps, cross-feature search | Notion, Slack, VS Code |

### What's relevant for LinguaKids
- **Spotlight-style overlay** (Cmd+K / tap 🔍) → instant search across ALL 59 pages + 12 modules
- **As-you-type results** with categorized sections: Lessons, Games, Stories, Exercises
- **Recent searches** + **trending/suggested** content
- **Bottom-anchored search** on mobile for reachability

---

## Gap Analysis: LinguaKids vs Khan Kids

| Area | Khan Kids | LinguaKids Now | LinguaKids Target |
|------|-----------|---------------|-------------------|
| Search/Discovery | ❌ Basic nav | ❌ No search | ✅ Spotlight search |
| Video integration | ✅ Interactive videos | ❌ None | ✅ Embedded + interactive |
| Animation quality | ✅ Polished, playful | ⚡ CSS only | ✅ Lottie/Rive micro-animations |
| Characters/Mascots | ✅ 5 mascots | ❌ None | ✅ 3 AI tutor personalities |
| Gamification depth | ✅ Streaks/levels/collectibles | ⚡ XP + basic streak | ✅ Full: streaks, levels, avatars |
| Bilingual depth | ❌ English only | ✅ EN+CN+VI | ✅ Strengthen — our edge |
| Speaking/Voice | ❌ Limited | ✅ Voice engine | ✅ Superior — our edge |
| Curriculum breadth | ✅ 5,000+ activities | ⚡ ~200 activities | ✅ Scale with video + games |
| Price | ✅ Free | ✅ Free | ✅ Free |

---

## Upgrade Plan — 6 Tracks

### Track A: Spotlight Search (iOS 26 Pattern)

**What**: Global search overlay across ALL app features

**Implementation**:
1. New `SearchOverlay.jsx` component — triggered by 🔍 icon or Cmd+K
2. Fuzzy search index of all pages, exercises, stories, vocabulary
3. Categorized results: 📚 Lessons · 🎮 Games · 📖 Stories · 🗣️ Exercises · 📝 Vocabulary
4. Recent searches + AI-suggested content
5. Mobile: bottom sheet; Desktop: centered modal with glassmorphism

**Open-source tools**:
- `fuse.js` — lightweight fuzzy search (MIT, GitHub: krisk/Fuse)
- `cmdk` — ⌘K command palette for React (MIT, GitHub: pacocoursey/cmdk)

**Priority**: P0 (high impact, 1-2 day effort)

---

### Track B: Interactive Video Integration

**What**: Embed educational videos with interactive quiz/annotation layers

**Free Video Sources (CC/embeddable)**:

| Source | Content | URL |
|--------|---------|-----|
| **British Council LearnEnglish Kids** | Stories, songs, grammar | youtube.com/@LearnEnglishKids |
| **Super Simple Songs** | Phonics, alphabet, nursery | youtube.com/@SuperSimpleSongs |
| **Storyline Online** | Celebrity read-alouds (49 books) | storylineonline.net |
| **Patty Shukla Kids TV** | Phonics, letter sounds, sign language | youtube.com/playlist?list=PL-PtrQaHMOvRYU-w91iXup2fTrfcCjnKI |
| **Phonics Reading** | Step-by-step reading/writing | youtube.com/@phonics_reading |
| **ABC Phonics Chant** | A-Z letter sounds + workbook | youtube.com/watch?v=ChqnN3cKzXQ |
| **Monster Phonics** | Engaging animated phonics | monsterphonics.com/free-resources/free-videos/ |

**Interactive Video Player Stack**:

| Tool | What it does | License | URL |
|------|-------------|---------|-----|
| **H5P** | Quiz overlays, annotations, branching | MIT | h5p.org |
| **Video.js** | Base player + plugin ecosystem | Apache 2.0 | videojs.com |
| **Plyr** | Clean, accessible player | MIT | plyr.io |
| **react-player** | React wrapper for YouTube/Vimeo/local | MIT | github.com/CookPete/react-player |

**Implementation Pattern** (Khan Kids "video → practice → reinforce"):
```
Video Lesson (3-5min) → Comprehension Quiz (H5P overlay)
    → Practice Exercise (existing module) → Reinforcement Game
```

**Priority**: P1 (high value, 3-5 day effort)

---

### Track C: Animation & Micro-interactions

**What**: Replace CSS-only animations with rich, playful animations

| Library | Best For | Size | URL |
|---------|----------|------|-----|
| **Lottie React** | Icon animations, celebrations, loading | 60KB | lottiefiles.com (free tier) |
| **Framer Motion** | Page transitions, gesture-based UI | 32KB | framer.com/motion |
| **GSAP** | Complex timelines, scroll animations | 25KB | gsap.com (free for non-commercial) |
| **Rive** | Interactive state-machine animations | 50KB | rive.app |

**Free Lottie Animations for Education**:
- LottieFiles.com — 100,000+ free animations (search: "education", "kids", "success", "celebration")
- Icons8 Animated Icons — 2,000+ animated icons
- LordIcon — animated icons with triggers (hover, click, loop)

**Usage Map**:
| Where | Animation |
|-------|-----------|
| Correct answer | 🎉 Confetti + bounce celebration (Lottie) |
| Level up | ⭐ Star burst + XP counter (Lottie) |
| Page transitions | Slide/fade with spring physics (Framer Motion) |
| Loading states | Playful character walking (Lottie) |
| Button hover | Subtle scale + glow (Framer Motion) |
| Streak badge | Flame animation (Lottie) |

**Priority**: P2 (medium effort, high polish)

---

### Track D: Character/Mascot System

**What**: 3 AI tutor personalities (inspired by Khan Kids mascots + Practice Me tutors)

| Name | Personality | Specialization | Avatar |
|------|------------|---------------|--------|
| **Milo** 🐻 | Patient, warm | Phonics, early reading | Bear cub |
| **Luna** 🦊 | Creative, playful | Speaking, conversation | Fox |
| **Max** 🦉 | Challenging, wise | Grammar, advanced | Owl |

**Behavior differences**:
- **Milo**: slow speech, simple vocab, lots of encouragement
- **Luna**: fun topics, casual tone, creative prompts
- **Max**: complex sentences, pushes deeper, academic style

**Implementation**: Extend `ConversationAI.jsx` tutor selector, adjust `findBestResponse()` per personality

**Priority**: P2

---

### Track E: Enhanced Gamification

**What**: Level up from basic XP to Khan-style engagement system

| Feature | Current | Target |
|---------|---------|--------|
| Streaks | Basic daily | Weekly proficiency (Mon-Sun window) |
| Levels | None | Course-level milestones with celebrations |
| Collectibles | None | Avatar items (hats, badges, backgrounds) |
| Character room | None | Personal space to display achievements |
| League/ranking | None | Weekly league (Bronze → Silver → Gold → Diamond) |

**Priority**: P3

---

### Track F: Content Scale-up

**What**: Expand from ~200 activities to Khan-level breadth

| Content Type | Source | Volume Target |
|-------------|--------|---------------|
| Vocabulary cards | Own generation | 2,000+ words |
| Interactive stories | Storyline Online embeds | 49 stories |
| Phonics videos | YouTube playlist embeds | 26+ (A-Z) |
| Grammar exercises | Existing modules | 500+ |
| Conversation scenarios | ConversationAI | 20+ scenarios |
| Reading passages | ReadingHub existing | 100+ passages |

**Priority**: P3

---

## What LinguaKids must NOT do

1. ❌ Copy Khan Kids proprietary content (stories, images, videos, books)
2. ❌ Scrape or redistribute copyrighted app content
3. ❌ Market as "better than Khan Kids" without concrete benchmark evidence
4. ❌ Use YouTube embeds of copyrighted content without checking terms
5. ❌ Add animation libraries that degrade performance (budget: ≤100KB added)

---

## QA/QC Standards

### Pre-implementation
- [ ] Evidence audit: every feature claim traced to source URL
- [ ] Legal review: video embed terms verified per channel
- [ ] Performance budget: ≤100KB added bundle, ≤3s mobile load

### During implementation
- [ ] Build passes (0 errors, 0 warnings)
- [ ] Cross-browser test: Chrome/Safari/Firefox mobile + desktop
- [ ] Accessibility audit: ARIA labels, focus management, color contrast
- [ ] Bilingual parity: every new feature in EN + VI

### Post-implementation
- [ ] Lighthouse audit: Performance ≥80, Accessibility ≥90
- [ ] User flow test: search → find → learn → practice → review
- [ ] Regression test: all existing features still work
- [ ] Deploy verification: GitHub Pages live site matches local

---

## Current honest benchmark position (Updated)

### Where LinguaKids now exceeds Khan Kids:
- ✅ **Voice-first conversation** — Khan has no voice AI coaching
- ✅ **Real-time pronunciation feedback** — Khan has no speech recognition
- ✅ **Bilingual depth** — EN + Chinese + Vietnamese (Khan: English only)
- ✅ **Grammar coaching** — Inline "tap to fix" with native rephrase
- ✅ **Session analytics** — Real-time speaking performance metrics

### Where Khan Kids still exceeds LinguaKids:
- ❌ **Interactive video content** — Khan has 5,000+ animated lessons
- ❌ **Character/mascot system** — Khan has 5 beloved mascots
- ❌ **Classroom tools** — Khan has teacher dashboards + assignment systems
- ❌ **Content breadth** — Khan has full math + science + social-emotional
- ❌ **Search/discovery** — Khan has guided paths; we have no search yet
- ❌ **Animation polish** — Khan has professional animated experiences

### Priority roadmap to close gaps:
1. **P0**: Spotlight Search (Track A) — 1-2 days
2. **P1**: Interactive Video (Track B) — 3-5 days
3. **P2**: Animation + Characters (Track C+D) — 3-4 days
4. **P3**: Gamification + Scale (Track E+F) — ongoing

---

## Repo changes made from this harvest

### Previous (still valid):
1. `src/services/kidsLibraryHarvestService.js` — Khan-inspired library model
2. `src/pages/KidsLibrary.jsx` — Library + guided-path UI
3. `src/pages/Home.jsx` — Kids-mode library entry
4. `src/pages/ParentDashboard.jsx` — Parent visibility
5. `scripts/audit-kids-library.mjs` — Release gate

### New from this update:
6. `src/modules/conversation/ConversationAI.jsx` — Voice-first AI tutor with coaching
7. **Planned**: `src/components/SearchOverlay.jsx` — Spotlight search
8. **Planned**: `src/components/VideoLesson.jsx` — Interactive video player
9. **Planned**: `src/components/TutorSelector.jsx` — Character/mascot selector

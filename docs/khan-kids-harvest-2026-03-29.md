# Khan Kids Harvest

Date: 2026-03-29

## Scope

This harvest benchmarks Khan Academy Kids using official public sources and converts the result into Lingua-integrated product changes.

## Official evidence used

- Khan Academy Kids official site:
  - https://www.khanacademy.org/kids
- Khan Kids help center index:
  - https://khankids.zendesk.com/hc/en-us/sections/360001481891-Home-Parent-Resources

## Evidence snapshot

From the official Khan Academy Kids site on 2026-03-29:

- "100% free" and "No ads, no subscriptions"
- early learner focus for ages 2-8
- expert-developed curriculum aligned with standards
- classroom-ready features:
  - assign lessons
  - track student progress
  - actionable insights
- app internals:
  - thousands of playful activities, books, and videos
  - personalized path
- English learner support:
  - engaging visuals
  - read-alouds
  - scaffolded vocabulary

From the help center index on 2026-03-29:

- teacher/admin/parent resource structure exists
- offline learning support exists
- device support and classroom/home routines are treated as product surfaces, not only support details

## What Lingua should harvest

Pattern-level harvest only:

1. Library shelves
   - one place for stories, reading, teacher-led lessons, and language practice rails
2. Guided paths
   - recommended journeys that reduce "tab hopping"
3. Teacher visibility
   - parent/teacher surfaces should show the real size of the curriculum
4. Scaffolded language support
   - easier movement from support to practice

## What Lingua must not do

1. Copy Khan Kids proprietary story text, images, books, videos, or lesson assets
2. Scrape or redistribute copyrighted app content
3. Market Lingua as "better than Khan Kids" without evidence on concrete benchmark axes

## Repo changes made from this harvest

1. `src/services/kidsLibraryHarvestService.js`
   - Source of truth for a Khan-inspired kids library model built from Lingua-owned repo data
2. `src/pages/KidsLibrary.jsx`
   - Library + guided-path UI that routes into real Lingua modules
3. `src/pages/Home.jsx`
   - Kids-mode entry into the library
4. `src/pages/ParentDashboard.jsx`
   - Parent-facing visibility into library scale
5. `scripts/audit-kids-library.mjs`
   - Release gate so the library stays wired and data-backed

## Current honest benchmark position

Lingua now closes part of the gap on:

- library discoverability
- guided path orchestration
- teacher/parent visibility

Lingua still does not honestly exceed Khan Kids overall on:

- breadth of early-childhood curriculum
- classroom penetration
- media/content ops scale
- offline maturity

Lingua can, however, target a stronger benchmark within its own domain:

- bilingual language-learning depth
- English + Chinese speaking/listening specialization
- curriculum-scale guided language practice

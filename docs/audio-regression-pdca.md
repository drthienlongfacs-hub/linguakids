# Audio Regression PDCA

Date: 2026-03-29

## Problem

`TeacherLessons` kept replaying browser TTS even after other routes had been upgraded to controlled audio packs.
This caused recurring low-quality playback on mobile browsers, especially Safari/iPhone, where browser voices can collapse to a muffled or tunnel-like timbre.

## Root cause

1. Audio hardening had been applied route-by-route, not system-wide.
2. `TeacherLessons` still used `useSpeech()` directly for model playback.
3. No release gate required this route to provide controlled audio coverage.
4. Mixed or structural lesson lines in the source data were still eligible for practice, degrading audio quality.

## PDCA control

### Plan

- Identify audio-heavy instructional routes that auto-play model speech.
- Define route-level source of truth: data filter, manifest, QA artifact, runtime loader.

### Do

- Add a controlled `teacher-lessons` studio audio pack.
- Filter out structural or mixed-language lines from practice generation.
- Load manifest first in runtime and fall back to browser TTS only if a verified clip fails.

### Check

- `scripts/audit-teacher-lessons-audio.mjs`
- `npm run audit:teacher-lessons`
- `npm run audit:release`

### Act

- Any new or upgraded audio-heavy route must either:
  - ship a controlled audio manifest and audit, or
  - declare an explicit transitional waiver before release.
- A route-level audio fix is not considered complete until it is wired into `audit:release`.

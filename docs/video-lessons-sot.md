# Video Lessons Source of Truth

Date: 2026-03-29

## Purpose

This document defines the only supported publication workflow for LinguaKids video lessons.

Legacy YouTube IDs are retained only as hidden reference metadata. Public playback must use a
licensed or CC source that streams inside the app and standalone PWA.

## Files

- `content/video-lessons/catalog.json`
  Editorial source of truth for every lesson, including public/hidden status.
- `content/video-lessons/approved-sources.json`
  Allowed canonical host domains and playback kinds.
- `public/data/video-manifests/video-lessons.json`
  Generated runtime manifest consumed by the app.
- `public/data/video-manifests/video-lessons.qa.json`
  Generated QA snapshot.
- `public/data/video-manifests/video-lessons.alignment.qa.json`
  Automated alignment RCA snapshot for legacy backup references.
- `public/data/video-manifests/video-lessons.review-queue.json`
  Generated reviewer queue with rollout waves, blockers, and approve/reject command schema.
- `public/data/video-manifests/video-lessons.ops.json`
  Generated operational snapshot with status counts, blocker counts, subtitle coverage, and rollout stop conditions.
- `scripts/build-video-lessons-manifest.mjs`
  Manifest generator.
- `scripts/audit-video-lessons.mjs`
  Release-blocking audit.
- `scripts/audit-video-lessons-vietnamese.mjs`
  Release-blocking audit for Vietnamese localization regressions in SOT and manifest.
- `scripts/audit-video-lessons-study-quality.mjs`
  Release-blocking audit for script/quiz completeness, blank options, and duplicate detail prompts.
- `scripts/audit-video-lesson-alignment.mjs`
  Migration-time RCA for title/category mismatch against legacy reference sources.
- `scripts/triage-video-lessons.mjs`
  Deterministic scorer that assigns `candidate`, `review_queue`, `ready_to_publish`, or `blocked`.
- `scripts/review-video-lessons.mjs`
  Review/publish workflow for approve, reject, and wave publication.
- `scripts/discover-video-lesson-sources.mjs`
  Approved-domain candidate matching for canonical source discovery.
- `scripts/validate-video-lesson-canonical-assets.mjs`
  Canonical asset probe for MP4, poster, and exact-timed subtitle tracks.
- `scripts/sync-video-lessons-learning-packets.mjs`
  Materializes generated bilingual scripts, multi-stage quizzes, and source-verification defaults into `catalog.json`.

## Canonical source contract

- Host type: object storage + CDN under a domain listed in `approved-sources.json`
- Canonical file path: `video-lessons/{lessonId}/main.mp4`
- Poster path: `video-lessons/{lessonId}/poster.jpg`
- Codec baseline: H.264/AAC MP4
- Max release baseline: 720p
- Delivery requirements:
  - `Content-Type: video/*`
  - byte-range requests supported
  - CORS allows `https://drthienlongfacs-hub.github.io`
  - stable absolute URLs

## Public lesson requirements

A lesson may be marked `public` only if all of the following are true:

- `playback.canonical.kind` is approved
- `playback.canonical.src` resolves to the approved CDN host
- `playback.canonical.browserCompatible` is `true`
- `playback.canonical.pwaCompatible` is `true`
- `attribution.licenseLabel` is present
- `attribution.licenseUrl` is present
- `attribution.rehostAllowed` is `true`
- `attribution.reviewedBy` is present
- `attribution.reviewedAt` is present
- `attribution.evidenceUrl` is present
- `sourceVerification.manualReviewStatus` is `approved`
- `sourceVerification.contentMatchStatus` is `aligned`
- `sourceVerification.reviewedBy` is present
- `sourceVerification.reviewedAt` is present
- `sourceVerification.evidenceUrl` is present
- `learningPacket.script.segments` contains bilingual EN/VI guidance
- `learningPacket.quiz.questions` contains at least 5 validated questions
- `npm run audit:video-lessons` passes

## Learning packet contract

Each lesson now carries a `learningPacket` and a `sourceVerification` block.

`learningPacket` must include:

- learning objectives
- focus vocabulary
- bilingual companion script (`script.segments`)
- quiz stages spanning preview, while-watch, detail, retrieval, and transfer
- after-watch practice, memory loop, and shadowing cue
- learning-science guardrails

`sourceVerification` must include:

- expected title, category, and keywords
- risk score, auto decision, and automated reasons
- canonical match evidence
- review checklist
- blocking reasons when a lesson cannot move forward
- manual review status
- content match status
- reviewer identity and evidence URL before publication

The runtime now exposes the bilingual script and richer quiz only for lessons that have both a complete study packet and an `aligned` source match, while still preserving the distinction between `public` canonical playback and reference-backed study mode.

## Lifecycle policy

- `hidden`
  Not yet surfaced to the fast-reopen queue.
- `candidate`
  Auto-generated packet exists and lesson is eligible for source replacement work.
- `review_queue`
  Needs human review or still has reopen blockers.
- `ready_to_publish`
  Automation and manual review both passed; lesson can be promoted by wave.
- `public`
  Published to the public route and search surfaces.
- `blocked`
  Hard stop caused by mismatch, legal risk, or reviewer rejection.

## Hidden lesson policy

- Hidden lessons remain in `catalog.json` to preserve stable IDs, quiz data, and migration traceability.
- Hidden lessons must not appear in:
  - `/video-lessons`
  - route stats
  - search overlay video results
  - public category counts

`review_queue`, `candidate`, and `blocked` lessons must not be mislabeled as `public`. They also must not appear in the live study surface unless their source match is `aligned`. Non-aligned lessons remain available only in reviewer workflows.

## Migration workflow

Order:

1. Level 1
2. Level 2
3. Level 3
4. Level 4

Within each level, keep the current category and lesson ordering.

Per lesson:

1. Choose a replacement only from an approved source.
2. Capture source page URL and legal evidence URL.
3. Verify that rehosting is allowed.
4. Transcode/upload the canonical MP4 and poster to the CDN.
5. Fill `catalog.json` canonical playback + attribution metadata.
6. Run `npm run sync:video-lessons:learning` if titles/categories changed.
7. Run `npm run build:video-lessons`.
8. Run `npm run audit:video-lessons`.
9. Mark the lesson `public` only after the audit passes.

If any step fails, keep the lesson `hidden`.

## Fast reopen workflow

1. Run `npm run triage:video-lessons`.
   This refreshes risk score, auto decision, blockers, and lifecycle status across all 120 lessons.
2. Run `npm run discover:video-lessons:sources`.
   This ranks candidate sources from the approved-domain inventory in `content/video-lessons/source-candidates.json`.
3. Review `public/data/video-manifests/video-lessons.review-queue.json` or the in-app `/video-lessons-review` screen.
4. Approve or reject lessons with `npm run review:video-lessons -- approve ...` or `npm run review:video-lessons -- reject ...`.
5. Publish only by wave with `npm run review:video-lessons -- publish-wave --wave <1-4>`.
6. Run `npm run validate:video-lessons:canonical` for any lesson upgraded to canonical media.
7. Run `npm run audit:video-lessons`, `npm run audit:release`, `npm run build`, and `npm run verify:live`.

## Alignment RCA workflow

Use `npm run audit:video-lessons:alignment` during migration to compare each hidden legacy backup link against the lesson title/category expectation.

Baseline snapshot on 2026-03-29:

- `8` aligned
- `29` suspect
- `83` mismatch

This report is for triage only. A good legacy backup match does not make a lesson publishable. Publication still requires a reviewed canonical source on the approved CDN.

## Learning design basis

The packet design intentionally uses:

- retrieval after viewing, not just passive watching
- distributed recall across immediate replay, same-day retell, and next-day review
- short watch cues to signal what matters and avoid overload
- bilingual support as concise EN/VI pairs instead of dense duplicated text

Reference readings used for this design:

- Roediger & Karpicke, 2006, test-enhanced learning
- Dunlosky et al., 2013, practice testing and distributed practice
- Mayer, multimedia learning principles on signaling/segmenting and avoiding overload
- Montero Perez et al., research on captioned video support in second-language learning

## Release checklist

- `npm run sync:video-lessons:learning`
- `npm run build:video-lessons`
- `npm run audit:video-lessons`
- `npm run audit:video-lessons:vi`
- `npm run audit:video-lessons:study-quality`
- `npm run audit:release`
- `npm run build`
- `npm run verify:live`

## Explicit non-goals

- Do not publish public lessons that depend on YouTube iframe playback.
- Do not mark lessons public based only on oEmbed validity.
- Do not use GitHub Pages as the canonical media host.

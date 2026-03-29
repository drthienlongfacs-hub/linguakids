# Release SOT and SOP

Date: 2026-03-29

## Source of truth

The following files are the operational source of truth for release-critical checks in this repo:

- `src/shared/premiumTokenSchema.js`
  Premium token prefix, audience, version, and public verification key.
- `src/services/premiumService.js`
  Client-side premium activation and entitlement behavior for the web edition.
- `public/runtime-config.json`
  Deployment-time runtime switch for entitlement server mode and fallback policy.
- `src/services/runtimeConfigService.js`
  Runtime config loader and merge logic.
- `src/services/entitlementApiClient.js`
  Client adapter for entitlement health, activation, and resolve.
- `src/hooks/usePremiumStatus.js`
  Shared UI subscription layer for premium runtime truth.
- `src/services/voicePreferenceService.js`
  Shared voice preference runtime for browser TTS paths.
- `scripts/audit-voice-runtime.mjs`
  End-to-end audit for voice preference propagation through store, UI, and runtime.
- `src/services/kidsLibraryHarvestService.js`
  Source of truth for the kids library and harvested shelf counts.
- `scripts/audit-kids-library.mjs`
  Regression gate for the Khan-inspired kids library integration.
- `server/entitlement-api.mjs`
  Reference backend for server-backed web entitlement.
- `scripts/generate-premium-token.js`
  Offline signed-token issuance, using a private key outside the repo.
- `scripts/audit-premium-architecture.mjs`
  Premium architecture audit and optional signed-token round-trip test.
- `scripts/audit-entitlement-stack.mjs`
  End-to-end server-backed entitlement audit.
- `scripts/audit-free-speaking-module.mjs`
  Free-speaking readability and controlled-audio audit.
- `scripts/audit-teacher-lessons-audio.mjs`
  Teacher-lessons studio-audio coverage audit and regression gate.
- `content/video-lessons/catalog.json`
  Editorial source of truth for public/hidden video lesson status, canonical playback, and legal metadata.
- `content/video-lessons/approved-sources.json`
  Allowlist for canonical video hosts, blocked domains, and approved playback kinds.
- `public/data/video-manifests/video-lessons.json`
  Generated runtime video manifest consumed by the app.
- `public/data/video-manifests/video-lessons.qa.json`
  Generated QA snapshot for release review and live verification.
- `public/data/video-manifests/video-lessons.alignment.qa.json`
  RCA snapshot for legacy reference mismatch triage.
- `public/data/video-manifests/video-lessons.review-queue.json`
  Reviewer queue, rollout waves, blocker reasons, and publish commands.
- `public/data/video-manifests/video-lessons.ops.json`
  Operational snapshot for rollout metrics and stop conditions.
- `scripts/build-video-lessons-manifest.mjs`
  Video lesson manifest build step from the editorial catalog.
- `scripts/audit-video-lessons.mjs`
  Release-blocking audit for canonical video source health, legality metadata, and public visibility policy.
- `scripts/sync-video-lessons-learning-packets.mjs`
  Materializes bilingual scripts, richer quiz packs, and source-verification defaults into the catalog.
- `scripts/audit-video-lesson-alignment.mjs`
  Non-release RCA audit for mismatch between expected lesson topic and legacy reference links.
- `scripts/triage-video-lessons.mjs`
  Deterministic lesson scorer for candidate, review queue, blocked, and ready-to-publish status.
- `scripts/review-video-lessons.mjs`
  Approve, reject, and publish-wave workflow for hybrid review gating.
- `scripts/discover-video-lesson-sources.mjs`
  Approved-domain source discovery helper.
- `scripts/validate-video-lesson-canonical-assets.mjs`
  Canonical MP4/poster/VTT validation helper.
- `.github/workflows/deploy.yml`
  Mandatory release gates before publish.

## Standard operating procedure

1. Run `npm run sync:video-lessons:learning` if video titles, categories, or quiz design changed.
   Result must refresh learning packets, bilingual scripts, and source-verification defaults in the catalog.
2. Run `npm run triage:video-lessons` after alignment RCA, source replacement work, or review decisions.
   Result must refresh risk score, auto decision, blocking reasons, and lifecycle status.
3. Optionally run `npm run discover:video-lessons:sources` when replenishing canonical source candidates.
   Result must emit the approved-domain candidate ranking report.
4. Run `npm run build:video-lessons`.
   Result must emit the runtime manifest, QA snapshot, review queue, and ops snapshot.
5. Run `npm run audit:video-lessons`.
   Result must be `pass: true`.
6. Run `npm run audit:premium`.
   Result must be `pass: true`.
7. Run `npm run audit:entitlement`.
   Result must be `pass: true`.
8. Run `npm run audit:voice-runtime`.
   Result must be `pass: true`.
9. Run `npm run audit:kids-library`.
   Result must be `pass: true`.
10. Run `npm run audit:free-speaking`.
   Result must be `strictModulePass: true`.
11. Run `npm run audit:teacher-lessons`.
   Result must be `strictModulePass: true`.
12. Run `npm run build`.
   Result must complete successfully.
13. Optionally run `npm run audit:video-lessons:alignment` during migration to review mismatch RCA before replacing legacy backup references.
14. Push `main`.
15. Wait for GitHub Actions deploy and verify live bundle rollout with `npm run verify:live`.

## Audio regression control

- Any lesson route that auto-plays instructional audio must ship a controlled audio manifest or an explicit transitional waiver.
- A route-level fix is not considered complete until its audit script is wired into `audit:release`.
- Any new browser-TTS preference flow must consume the shared voice preference service and pass `audit:voice-runtime`.
- Any harvested benchmark-inspired surface must point into real routes, use repo-backed counts, and pass its dedicated audit gate.
- Video lessons are not allowed to publish directly from legacy YouTube IDs.
- A public video lesson must have a CDN-backed canonical source, legal evidence, and a passing `audit:video-lessons` probe.
- Hidden video lessons must not appear in counts, search results, categories, or route browse flows.

## Video publication policy

- Public video lessons are no longer treated as "100% offline". They are streamed from a controlled object-storage CDN.
- YouTube may remain as a reference URL only. It is not a valid canonical source for public playback, especially in standalone PWA mode.
- If a lesson has no approved replacement source, it stays hidden until the migration checklist in `docs/video-lessons-sot.md` is complete.
- A lesson cannot move from `review_queue` to `public` unless review approval, auto decision `green`, and rollout wave publication all succeed.

## Distribution policy

- Web edition:
  - may use signed activation tokens as a soft paywall.
  - should switch to server-backed entitlement automatically when `runtime-config.json` provides an entitlement API URL.
  - must not claim strong authorization or DRM.
- App Store / Google Play editions:
  - must not reuse the web activation UX as-is for digital entitlements.
  - must move to platform-native purchase and entitlement flows.

## Private key handling

- Private key path is outside the repository.
- Default local path on the maintainer machine:
  `/Users/mac/.linguakids-premium/premium-private-key.pem`
- Private key must never be committed, embedded in client code, or placed in public docs.

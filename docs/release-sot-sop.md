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
- `.github/workflows/deploy.yml`
  Mandatory release gates before publish.

## Standard operating procedure

1. Run `npm run audit:premium`.
   Result must be `pass: true`.
2. Run `npm run audit:entitlement`.
   Result must be `pass: true`.
3. Run `npm run audit:voice-runtime`.
   Result must be `pass: true`.
4. Run `npm run audit:kids-library`.
   Result must be `pass: true`.
5. Run `npm run audit:free-speaking`.
   Result must be `strictModulePass: true`.
6. Run `npm run audit:teacher-lessons`.
   Result must be `strictModulePass: true`.
7. Run `npm run build`.
   Result must complete successfully.
8. Push `main`.
9. Wait for GitHub Actions deploy and verify live bundle rollout with `npm run verify:live`.

## Audio regression control

- Any lesson route that auto-plays instructional audio must ship a controlled audio manifest or an explicit transitional waiver.
- A route-level fix is not considered complete until its audit script is wired into `audit:release`.
- Any new browser-TTS preference flow must consume the shared voice preference service and pass `audit:voice-runtime`.
- Any harvested benchmark-inspired surface must point into real routes, use repo-backed counts, and pass its dedicated audit gate.

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

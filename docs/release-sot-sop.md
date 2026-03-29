# Release SOT and SOP

Date: 2026-03-29

## Source of truth

The following files are the operational source of truth for release-critical checks in this repo:

- `src/shared/premiumTokenSchema.js`
  Premium token prefix, audience, version, and public verification key.
- `src/services/premiumService.js`
  Client-side premium activation and entitlement behavior for the web edition.
- `scripts/generate-premium-token.js`
  Offline signed-token issuance, using a private key outside the repo.
- `scripts/audit-premium-architecture.mjs`
  Premium architecture audit and optional signed-token round-trip test.
- `scripts/audit-free-speaking-module.mjs`
  Free-speaking readability and controlled-audio audit.
- `scripts/audit-teacher-lessons-audio.mjs`
  Teacher-lessons studio-audio coverage audit and regression gate.
- `.github/workflows/deploy.yml`
  Mandatory release gates before publish.

## Standard operating procedure

1. Run `npm run audit:premium`.
   Result must be `pass: true`.
2. Run `npm run audit:free-speaking`.
   Result must be `strictModulePass: true`.
3. Run `npm run audit:teacher-lessons`.
   Result must be `strictModulePass: true`.
4. Run `npm run build`.
   Result must complete successfully.
5. Push `main`.
6. Wait for GitHub Actions deploy and verify live bundle rollout with `npm run verify:live`.

## Audio regression control

- Any lesson route that auto-plays instructional audio must ship a controlled audio manifest or an explicit transitional waiver.
- A route-level fix is not considered complete until its audit script is wired into `audit:release`.

## Distribution policy

- Web edition:
  - may use signed activation tokens as a soft paywall.
  - must not claim strong authorization or DRM.
- App Store / Google Play editions:
  - must not reuse the web activation UX as-is for digital entitlements.
  - must move to platform-native purchase and entitlement flows.

## Private key handling

- Private key path is outside the repository.
- Default local path on the maintainer machine:
  `/Users/mac/.linguakids-premium/premium-private-key.pem`
- Private key must never be committed, embedded in client code, or placed in public docs.

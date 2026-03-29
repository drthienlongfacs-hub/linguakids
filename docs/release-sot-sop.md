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
- `.github/workflows/deploy.yml`
  Mandatory release gates before publish.

## Standard operating procedure

1. Run `npm run audit:premium`.
   Result must be `pass: true`.
2. Run `npm run audit:free-speaking`.
   Result must be `strictModulePass: true`.
3. Run `npm run build`.
   Result must complete successfully.
4. Push `main`.
5. Wait for GitHub Actions deploy and verify live bundle rollout with `npm run verify:live`.

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

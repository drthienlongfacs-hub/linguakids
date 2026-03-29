# Premium Security Position Paper

Date: 2026-03-29

## Current position

LinguaKids web currently uses a `soft paywall` model:

- Premium route gating and entitlement state are enforced in the client.
- Signed activation tokens reduce casual token forgery.
- Client-side entitlement remains bypassable by a determined user because the final access decision still runs on the client and state is stored locally.

This model is acceptable for the current static web distribution when the goal is friction and honest signaling, not strong authorization.

## What is true

1. Client-only premium gating is deterrence, not strong authorization.
2. Asymmetric signed tokens are stronger than client-side checksum or HMAC-with-client-secret designs.
3. True premium enforcement requires server-side control over entitlement or content delivery.
4. Mobile store builds for digital content/features require native store billing flows, not ad hoc external payment UX inside the app.

## Evidence base

- OWASP Authorization Cheat Sheet: do not rely on client-side access control checks.
  https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- Apple App Review Guidelines 3.1.1: unlocking features/content in an app must use in-app purchase, with limited regional exceptions for external purchase links.
  https://developer.apple.com/app-store/review/guidelines/
- Google Play Payments policy: app functionality, content, and subscriptions on Google Play must use Play Billing unless a listed exception applies.
  https://support.google.com/googleplay/android-developer/answer/10281818?hl=en
- OWASP MASTG: hardcoded cryptographic secrets in app code are a security failure pattern.
  https://mas.owasp.org/MASTG/tests/ios/MASVS-CRYPTO/MASTG-TEST-0213/

## Architecture tiers

### Tier 1: Web soft paywall

- Client-side route gating
- Signed activation token verified with public key only
- localStorage state for premium/trial
- Honest claim: reduces casual abuse, does not stop local tampering

Score:
- Anti-forgery: medium
- Anti-tamper: low
- Offline support: high
- Cost: low

### Tier 2: Server-backed web entitlement

- Token activation verified by API
- Premium content or premium APIs delivered only after entitlement check
- Revocation, reissue, and abuse handling become possible

Score:
- Anti-forgery: high
- Anti-tamper: medium to high
- Offline support: medium
- Cost: medium

### Tier 3: Native store entitlement

- StoreKit 2 / App Store Server API on Apple platforms
- Google Play Billing on Android
- Optional backend for receipt and subscription lifecycle management

Score:
- Anti-forgery: high
- Anti-tamper: high
- Offline support: medium
- Compliance readiness: high

## Implementation policy for this repo

1. No private key material may be committed into the repository.
2. No client-side premium code generator may ship in the browser bundle.
3. No comment may describe the model as DRM, secure authorization, or enterprise-grade access control.
4. Web edition purchase UX must avoid overclaiming app-store compliance.
5. If LinguaKids is packaged for App Store or Google Play, payment and entitlement UX must be redesigned around the native store policies for that build.

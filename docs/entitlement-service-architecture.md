# Entitlement Service Architecture

Date: 2026-03-29

## Objective

Upgrade the web edition from a pure client-side soft paywall into a server-first entitlement flow that can:

- prefer remote activation when an entitlement API is configured,
- degrade honestly to signed-token fallback when the API is unavailable,
- expose runtime truth to the UI,
- be audited before release.

## Scope in the current repo

### Source of truth

- `public/runtime-config.json`
  Runtime toggle for web deployment. This is the operator-facing switch for `entitlementApiBaseUrl`, fallback policy, and boot-sync policy.
- `src/services/runtimeConfigService.js`
  Loads and merges runtime config for the web client.
- `src/services/entitlementApiClient.js`
  Client-side API adapter for entitlement health, activation, and resolve.
- `src/services/premiumService.js`
  Premium lifecycle orchestrator. This is the web SOT for activation, fallback, sync, and state propagation.
- `src/hooks/usePremiumStatus.js`
  Shared state subscriber for UI layers.
- `server/entitlement-api.mjs`
  Reference backend for server-backed web entitlement.
- `scripts/audit-entitlement-stack.mjs`
  End-to-end regression gate for the entitlement stack.

### Runtime modes

1. `soft_paywall`
   No entitlement API configured. Trial and signed tokens stay local to the browser.
2. `server_backed_web_entitlement`
   Entitlement API is configured and reachable. Activation and ongoing sync prefer the backend.
3. `soft_paywall_with_entitlement_fallback`
   API is configured but unavailable or policy allows a signed-token fallback path.

## Activation flow

1. Web app boots and calls `bootstrapPremiumEntitlementSync()`.
2. `runtimeConfigService` loads `runtime-config.json`.
3. If `entitlementApiBaseUrl` is blank:
   web stays in `soft_paywall`.
4. If `entitlementApiBaseUrl` is configured:
   - app pings `/health`,
   - `premiumService.unlockPremium()` sends the activation token to `/v1/activate`,
   - backend returns a server-issued session token,
   - session token is stored client-side for later `/v1/entitlements/resolve`.
5. If backend activation fails and runtime policy allows fallback:
   client verifies the signed token locally and marks the state as degraded fallback.

## Resolve and sync flow

1. `premiumService.syncPremiumEntitlement()` sends the stored session token to `/v1/entitlements/resolve`.
2. Backend validates:
   - session signature,
   - entitlement existence,
   - installation match.
3. Client stores the refreshed premium snapshot and emits a shared `PREMIUM_STATE_CHANGED_EVENT`.
4. `usePremiumStatus()` subscribers refresh automatically across UI surfaces.

## Backend reference design

### Current reference server

- Stateless HTTP API with JSON persistence on the operator machine.
- Activation tokens are verified with the public key already shipped in the web app.
- Session tokens are issued by the server using a secret that stays outside the repo.
- Installation list is tracked per entitlement to enforce a max installation count.

### Minimum production hardening path

- Replace local JSON persistence with a managed datastore.
- Add operator authentication for admin and revoke flows.
- Add structured audit logs for activation, resolve, revoke, and limit breaches.
- Add rate limiting and IP reputation checks.
- Add signed backup/export for entitlement records.

## UI integration rules

- Premium UI must expose the real runtime mode.
- Premium UI must distinguish `server-backed`, `fallback`, and `local-only`.
- Premium UI must never claim strong authorization for a static web build.
- Privacy copy must remain honest when an entitlement server is configured.

## Operational gates

Release is not considered valid unless:

1. `npm run audit:premium` passes.
2. `npm run audit:entitlement` passes.
3. `npm run audit:free-speaking` passes.
4. `npm run audit:teacher-lessons` passes.
5. `npm run build` passes.
6. live deploy verification passes.

## Decision guidance

### When this architecture is enough

- Web edition distributed as a static app.
- Main goal is honest entitlement sync and lower abuse, not perfect DRM.

### When to move beyond it

- Mobile store distribution with digital premium unlocks.
- Need for restore, refund, revoke, abuse handling, or subscription lifecycle.
- Need for stronger auditability across devices.

In those cases, move to:

- `StoreKit 2` for iOS,
- `Google Play Billing` for Android,
- a shared backend entitlement service behind both web and native channels.

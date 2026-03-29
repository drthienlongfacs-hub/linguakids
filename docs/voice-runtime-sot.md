# Voice Runtime SOT

Date: 2026-03-29

## Objective

Make voice selection operational across the whole app, not just visible in UI:

- user chooses accent and speaking style once,
- preference persists in the global store,
- TTS runtime resolves voice + prosody from one shared service,
- listening and speaking modules consume the same voice runtime,
- release fails if this chain is broken.

## Source of truth

- `src/store/useGameStore.ts`
  Persistent state for `preferredAccent` and `preferredPersonality`.
- `src/services/voicePreferenceService.js`
  Shared runtime resolver for stored preference, selected voice, and prosody.
- `src/utils/speakText.js`
  Shared TTS entry point for components that do not use hooks.
- `src/hooks/useSpeech.js`
  Hook-based speaking runtime that must align with the same voice preference service.
- `src/pages/Settings.jsx`
  Operator/user control surface for changing and previewing preferences.
- `src/modules/listening/ListeningPlayer.jsx`
  Listening fallback TTS must use the shared voice profile.
- `scripts/audit-voice-runtime.mjs`
  Regression gate for the full preference propagation chain.

## Operational rule

No module may parse `linguakids_state_z` directly for voice preferences unless it is the shared voice runtime service.

## Acceptance criteria

1. Store persists voice preference fields.
2. Settings preview uses the shared service.
3. `speakText` uses the shared service.
4. `useSpeech` uses the shared service.
5. Listening fallback TTS uses the shared service.
6. Core speaking modules (`SpeakingExercise`, `ShadowingEngine`, `DictationExercise`) route through `speakText`.
7. `npm run audit:voice-runtime` passes.

## Scope note

This system governs browser TTS fallback and user preference propagation.
It does not replace controlled audio packs where those packs already exist.

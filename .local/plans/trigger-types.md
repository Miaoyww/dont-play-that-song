# Trigger guard type contract

## Scope and evidence

- `frontend/trigger.mjs:31` implements `observe(snapshot)` and returns four boolean fields: `preload`, `trigger`, `cancelPreload`, and `reset`.
- `frontend/trigger.mjs:95` exposes `observe`, `retryPreload`, and `shouldOpen`.
- `frontend/trigger.d.mts:16` declares all three implemented methods with matching argument and return types.
- `frontend/index.tsx:28` and `frontend/index.tsx:113` consume observations; lines 50 and 57 request preload retries.
- `tests/trigger.test.mjs` already exercises preload timing, retries, cancellation, playback triggering, and reset behavior.
- `pnpm build` typechecks the four reported call sites successfully.
- No `.git`, `.codegraph`, CONTEXT.md, ADR, or additional AGENTS.md exists in the target directory. Commit history and commits are unavailable.

## Implementation and dependencies

- [x] Inspect project guidance and reproduce the build failure.
- [x] Independently cross-check the runtime contract and tests with the investigation agent.
- [x] Add declarations for the existing observation result and retry method; preserve runtime behavior and existing method signatures.
- [x] Record the build fix under CHANGELOG Unreleased.
- [x] Run project formatting, tests, build, and final format check, in that order; inspect all changed files and generated output.

## Acceptance

- All four TS2339 diagnostics disappear without casts, suppression, or relaxed compiler settings.
- All existing trigger tests pass.
- The plugin build completes and the ZIP is generated.
- Project formatting check passes.
- No runtime behavior or dependency changes are required. Existing build typechecking provides regression coverage for the reported call sites.
- Host window/video playback is outside the automated verification scope.

## Verification results

- Project formatting, all 7 trigger tests, plugin build, and final format check pass.
- The ZIP contains manifest.json, ui.mjs, and assets/genshen-start.mp4.
- The build warns that the video URL remains for runtime resolution; video packaging is verified, but Windows host playback is not.
- Formatting also normalizes frontend/index.tsx and tests/trigger.test.mjs without behavioral changes.

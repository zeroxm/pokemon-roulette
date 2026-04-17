---
phase: "04-type-safety"
plan: "02-type-02"
subsystem: "imaging"
tags: ["typescript", "type-safety", "dom-to-image-more", "ts-ignore", "refactor"]
dependency_graph:
  requires: ["01-type-01"]
  provides: ["typed-dom-to-image-more"]
  affects: ["end-game.component.ts", "game-over.component.ts", "types/dom-to-image-more.d.ts"]
tech_stack:
  added: []
  patterns: ["ambient-module-declaration", "typed-third-party-module"]
key_files:
  created: []
  modified:
    - "tsconfig.app.json"
    - "tsconfig.spec.json"
    - "types/dom-to-image-more.d.ts"
    - "src/app/main-game/end-game/end-game.component.ts"
    - "src/app/main-game/game-over/game-over.component.ts"
decisions:
  - "Expanded dom-to-image-more.d.ts from bare module declaration to full typed interface"
  - "toBlob returns Promise<Blob | null> matching library reality; callers updated with null guard"
  - "Added types/**/*.d.ts to both tsconfig.app.json and tsconfig.spec.json includes"
metrics:
  duration: "~10 minutes"
  completed: "2026-04-17"
---

# Phase 04 Plan 02: TYPE-02 — dom-to-image-more .d.ts + remove @ts-ignore Summary

**One-liner:** Replace bare `declare module 'dom-to-image-more'` stub with full typed interface (Options, DomToImageMore), add types/**/*.d.ts to tsconfig includes, and remove `@ts-ignore` from end-game and game-over components.

## What Was Done

1. **tsconfig.app.json** — Added `"types/**/*.d.ts"` to the `include` array so TypeScript resolves ambient declarations from the `types/` directory during app builds.

2. **tsconfig.spec.json** — Same addition for test builds.

3. **types/dom-to-image-more.d.ts** — Replaced the one-line bare module stub with a full ambient module declaration containing:
   - `Options` interface (filter, bgcolor, width, height, style, quality, imagePlaceholder, cacheBust, scale)
   - `DomToImageMore` interface (toPng, toJpeg, toSvg, toBlob — all returning typed Promises)
   - `export default domtoimage` const

4. **end-game.component.ts** — Removed `// @ts-ignore` before the `domtoimage` import.

5. **game-over.component.ts** — Removed `// @ts-ignore` before the `domtoimage` import.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Null-guard for `toBlob` Promise resolution**

- **Found during:** Task — first `ng build` after changes
- **Issue:** `toBlob` now typed as `Promise<Blob | null>`, but both `.then((blob: Blob) => {` callbacks declared `Blob` (not null-safe), causing TS2345 errors in both components.
- **Fix:** Changed callback parameter type to `Blob | null` and added `if (!blob) return;` guard before use. This is the correct behaviour — if the library fails to produce a blob, the share/download silently does nothing rather than crashing with a null-reference.
- **Files modified:** `end-game.component.ts`, `game-over.component.ts`
- **Commit:** included in `da7c3f8`

## Verification Results

| Check | Expected | Actual |
|-------|----------|--------|
| `types/**/*.d.ts` in tsconfig.app.json | 1 | 1 ✅ |
| `@ts-ignore` in end-game + game-over | 0 | 0 ✅ |
| `toBlob` in dom-to-image-more.d.ts | ≥1 | 1 ✅ |
| `ng build` exit code | 0 | 0 ✅ |
| `ng test` specs/failures | 175/0 | 175/0 ✅ |

## Commits

- `da7c3f8` — refactor: expand dom-to-image-more type declarations and remove @ts-ignore (TYPE-02)

## Self-Check: PASSED

- `tsconfig.app.json` updated ✅
- `tsconfig.spec.json` updated ✅
- `types/dom-to-image-more.d.ts` replaced with full declaration ✅
- `@ts-ignore` removed from both components ✅
- Null guards added to both `.then()` callbacks ✅
- Commit `da7c3f8` exists ✅
- Build and tests green ✅

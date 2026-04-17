---
phase: 2
plan: "01-name-01"
subsystem: "restart-game-button component"
tags: [rename, typo-fix, naming-correction]
dependency_graph:
  requires: []
  provides: [NAME-01]
  affects: [restart-game-button, main-game, game-over]
tech_stack:
  added: []
  patterns: []
key_files:
  created: []
  modified:
    - src/app/restart-game-button/restart-game-button.component.ts
    - src/app/restart-game-button/restart-game-button.component.spec.ts
    - src/app/restart-game-button/restart-game-button.component.html
    - src/app/restart-game-button/restart-game-button.component.css
    - src/app/main-game/main-game.component.ts
    - src/app/main-game/main-game.component.html
    - src/app/main-game/game-over/game-over.component.ts
    - src/app/main-game/game-over/game-over.component.html
  renamed:
    - "src/app/restart-game-buttom/ → src/app/restart-game-button/ (all 4 component files)"
decisions:
  - Used `git mv` for all renames so history is preserved as renames, not delete+add
metrics:
  duration: "~8 minutes"
  completed_date: "2026-04-17"
  tasks_completed: 6
  files_modified: 8
---

# Phase 2 Plan 01: Rename restart-game-buttom → restart-game-button (NAME-01) Summary

## One-liner

Corrected the "buttom" typo in the `restart-game-button` component — renamed directory, 4 component files, and updated all 8 content references across the codebase using `git mv` to preserve rename history.

## What Was Done

### Files Renamed (via `git mv`)

| Old path | New path |
|----------|----------|
| `src/app/restart-game-buttom/restart-game-buttom.component.ts` | `src/app/restart-game-button/restart-game-button.component.ts` |
| `src/app/restart-game-buttom/restart-game-buttom.component.spec.ts` | `src/app/restart-game-button/restart-game-button.component.spec.ts` |
| `src/app/restart-game-buttom/restart-game-buttom.component.html` | `src/app/restart-game-button/restart-game-button.component.html` |
| `src/app/restart-game-buttom/restart-game-buttom.component.css` | `src/app/restart-game-button/restart-game-button.component.css` |

Directory rename: `src/app/restart-game-buttom/` → `src/app/restart-game-button/`

### Content Edits Made

| File | Change |
|------|--------|
| `restart-game-button.component.ts` | `selector: 'app-restart-game-buttom'` → `selector: 'app-restart-game-button'` |
| `restart-game-button.component.ts` | `templateUrl: './restart-game-buttom.component.html'` → `templateUrl: './restart-game-button.component.html'` |
| `restart-game-button.component.ts` | `styleUrl: './restart-game-buttom.component.css'` → `styleUrl: './restart-game-button.component.css'` |
| `restart-game-button.component.spec.ts` | Import path `./restart-game-buttom.component` → `./restart-game-button.component` |
| `main-game.component.ts` | Import path `../restart-game-buttom/restart-game-buttom.component` → `../restart-game-button/restart-game-button.component` |
| `main-game.component.html` | `<app-restart-game-buttom>` → `<app-restart-game-button>` |
| `game-over.component.ts` | Import path `../../restart-game-buttom/restart-game-buttom.component` → `../../restart-game-button/restart-game-button.component` |
| `game-over.component.html` | `<app-restart-game-buttom>` → `<app-restart-game-button>` |

## Verification Results

| Check | Result |
|-------|--------|
| "buttom" occurrences in `src/` | **0** ✅ |
| `src/app/restart-game-button/` exists | **True** ✅ |
| `src/app/restart-game-buttom/` exists | **False** ✅ |
| `ng build` exit code | **0** ✅ |
| `ng test` specs / failures | **175 / 0** ✅ |

## Commit

- **Hash:** `82d32ca`
- **Message:** `refactor: rename restart-game-buttom to restart-game-button (NAME-01)`
- **Files changed:** 8 (4 renames + 4 content edits in dependents)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — purely a rename/refactor with no new network endpoints, auth paths, or schema changes.

## Self-Check: PASSED

- [x] "buttom" count in `src/` = 0
- [x] `src/app/restart-game-button/` exists
- [x] `src/app/restart-game-buttom/` does NOT exist
- [x] `ng build` exit code 0
- [x] `ng test` 175 specs, 0 failures
- [x] Commit `82d32ca` created
- [x] SUMMARY.md written

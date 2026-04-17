---
phase: "03"
plan: "02"
subsystem: constants
tags: [refactor, constants, deduplication, trainer-service]
key-files:
  modified:
    - src/app/services/trainer-service/trainer.service.ts
decisions:
  - Used a private static readonly class constant (DEFAULT_POTION) rather than a module-level export, keeping the constant scoped to TrainerService
  - Used structuredClone() for both usages to ensure independent copies and prevent accidental mutation of the canonical constant
metrics:
  duration: "~3 minutes"
  completed: "2026-04-17"
  tasks: 3
  files: 1
---

# Phase 03 Plan 02: Centralize Default Potion Constant (CONST-02) Summary

**One-liner:** Eliminated two duplicate Potion object literals in `TrainerService` by introducing a `private static readonly DEFAULT_POTION` class constant and replacing both usages with `structuredClone(TrainerService.DEFAULT_POTION)`.

## What Was Done

1. **Added `DEFAULT_POTION` static constant to `TrainerService`** — a `private static readonly ItemItem` holding all Potion properties (text, name, sprite, fillStyle, weight, description).
2. **Replaced `trainerItems` field initializer** — the 7-line inline literal replaced with a one-liner: `[structuredClone(TrainerService.DEFAULT_POTION)]`.
3. **Replaced `resetItems()` body** — the 9-line inline literal replaced with `[structuredClone(TrainerService.DEFAULT_POTION)]`, keeping the `trainerItemsObservable.next()` call intact.

## Verification Results

| Check | Expected | Actual | Pass? |
|-------|----------|--------|-------|
| `items.potion.name` occurrences in trainer.service.ts | 1 | 1 | ✅ |
| `DEFAULT_POTION` occurrences in trainer.service.ts | 3 | 3 | ✅ |
| `ng build` | exit 0 | exit 0 | ✅ |
| `ng test` | 175 specs, 0 failures | 175 specs, 0 failures | ✅ |

## Commit

**SHA:** `0e74253`
**Message:** `refactor: centralize default Potion as a constant in TrainerService (CONST-02)`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/app/services/trainer-service/trainer.service.ts` ✅ modified with DEFAULT_POTION
- Commit `0e74253` ✅ verified in git log

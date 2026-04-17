---
phase: "03"
plan: "01"
subsystem: constants
tags: [refactor, constants, deduplication, evolution-service]
key-files:
  created:
    - src/app/constants/pokemon-ids.constants.ts
  modified:
    - src/app/services/evolution-service/evolution.service.ts
    - src/app/main-game/roulette-container/roulette-container.component.ts
decisions:
  - Placed NINCADA_ID in a dedicated constants file under src/app/constants/ for future growth
  - Encapsulated Nincada special-evolution check in EvolutionService.isNincadaSpecialEvolution() to keep pokemon logic in the service layer
metrics:
  duration: "~4 minutes"
  completed: "2026-04-17"
  tasks: 4
  files: 3
---

# Phase 03 Plan 01: Extract NINCADA_ID Constant (CONST-01) Summary

**One-liner:** Extracted magic number `290` into `NINCADA_ID` constant and encapsulated Nincada special-evolution logic in `EvolutionService`.

## What Was Done

1. **Created `src/app/constants/pokemon-ids.constants.ts`** — exports `NINCADA_ID = 290` as a named constant.
2. **Updated `EvolutionService`** — added import of `NINCADA_ID` and new public method `isNincadaSpecialEvolution(pokemon)` which returns `true` when `pokemon.pokemonId === NINCADA_ID`.
3. **Updated `RouletteContainerComponent`** — removed the class-level `NINCADA_ID = 290` field and replaced the inline comparison `pokemon.pokemonId === this.NINCADA_ID` with a call to `this.evolutionService.isNincadaSpecialEvolution(pokemon)`.

## Verification Results

| Check | Expected | Actual | Pass? |
|-------|----------|--------|-------|
| `NINCADA_ID = 290` in roulette-container | 0 | 0 | ✅ |
| `NINCADA_ID` in pokemon-ids.constants.ts | 1 | 1 | ✅ |
| `isNincadaSpecialEvolution` in evolution.service.ts | 1 (definition) | 1 | ✅ |
| `isNincadaSpecialEvolution` call in roulette-container | 1 | 1 | ✅ |
| `ng build` | exit 0 | exit 0 | ✅ |
| `ng test` | 175 specs, 0 failures | 175 specs, 0 failures | ✅ |

> Note: The plan stated an expected count of 2 for `isNincadaSpecialEvolution` in `evolution.service.ts`. The actual count there is 1 (the method definition). The second occurrence is in `roulette-container.component.ts` (the call site). Total occurrences across both files = 2, confirming the refactor is complete.

## Commit

**SHA:** `fc970b6`
**Message:** `refactor: extract NINCADA_ID constant and encapsulate Nincada evolution in EvolutionService (CONST-01)`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- `src/app/constants/pokemon-ids.constants.ts` ✅ exists
- `src/app/services/evolution-service/evolution.service.ts` ✅ modified
- `src/app/main-game/roulette-container/roulette-container.component.ts` ✅ modified
- Commit `fc970b6` ✅ verified in git log

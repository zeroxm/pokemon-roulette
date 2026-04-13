---
phase: 03-elite-four-types
plan: 01
subsystem: data
tags: [elite-four, types, data]
key-files:
  modified:
    - src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-by-generation.ts
decisions:
  - Larry (Gen 9) assigned types: ['flying'] — his Elite Four encounter is Flying specialist, not Normal
  - Gen 8 multi-slot entries (Marnie/Hop/Bede and Bea/Allister) have types arrays index-aligned to their sprite arrays
metrics:
  duration: ~6 minutes
  completed: 2026-04-13
---

# Phase 3 Plan 01: Elite Four Types Assignment Summary

**One-liner:** Added `types: PokemonType[]` to all 36 Elite Four slots across 9 generations, with index-aligned multi-type arrays for Gen 8 multi-trainer slots.

## What Was Done

Added `types` arrays to every Elite Four entry in `elite-four-by-generation.ts`:

| Gen | Member | Types |
|-----|--------|-------|
| 1 | Lorelei | `['ice']` |
| 1 | Bruno | `['fighting']` |
| 1 | Agatha | `['ghost']` |
| 1 | Lance | `['dragon']` |
| 2 | Will | `['psychic']` |
| 2 | Koga | `['poison']` |
| 2 | Bruno | `['fighting']` |
| 2 | Karen | `['dark']` |
| 3 | Sidney | `['dark']` |
| 3 | Phoebe | `['ghost']` |
| 3 | Glacia | `['ice']` |
| 3 | Drake | `['dragon']` |
| 4 | Aaron | `['bug']` |
| 4 | Bertha | `['ground']` |
| 4 | Flint | `['fire']` |
| 4 | Lucian | `['psychic']` |
| 5 | Shauntal | `['ghost']` |
| 5 | Marshal | `['fighting']` |
| 5 | Grimsley | `['dark']` |
| 5 | Caitlin | `['psychic']` |
| 6 | Malva | `['fire']` |
| 6 | Siebold | `['water']` |
| 6 | Wikstrom | `['steel']` |
| 6 | Drasna | `['dragon']` |
| 7 | Molayne | `['steel']` |
| 7 | Olivia | `['rock']` |
| 7 | Acerola | `['ghost']` |
| 7 | Kahili | `['flying']` |
| 8 | Marnie/Hop/Bede | `['dark', 'normal', 'fairy']` |
| 8 | Nessa | `['water']` |
| 8 | Bea/Allister | `['fighting', 'ghost']` |
| 8 | Raihan | `['dragon']` |
| 9 | Rika | `['ground']` |
| 9 | Poppy | `['steel']` |
| 9 | Larry | `['flying']` |
| 9 | Hassel | `['dragon']` |

## Verification

**Grep count:** `grep -c "types:" elite-four-by-generation.ts` → **36** ✓

**Build:** `npm run build` → zero TypeScript errors ✓  
(Pre-existing warnings: bundle budget exceeded, CommonJS module — unrelated to this change)

## Commit

`c17792f` — feat(03): assign types to all Elite Four members across 9 generations

## Deviations from Plan

None — plan executed exactly as written.

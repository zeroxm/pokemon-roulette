---
phase: 02-gym-leader-types
plan: 1
title: "Add types to all gym leaders"
subsystem: gym-battle-roulette
tags: [gym-leaders, types, data]
completed: 2026-04-13
commit: 9905f84
---

# Phase 02 Plan 01: Add Types to All Gym Leaders — Summary

## One-liner
Added `types: PokemonType[]` arrays to all 72 gym leader entries across 9 generations (Kanto–Paldea), including 6 multi-slot entries with index-aligned type arrays.

## What Was Changed

Single file modified:
`src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts`

### Changes by generation

| Gen | Region | Leaders | Multi-slot entries |
|-----|--------|---------|-------------------|
| 1 | Kanto | 8 | 0 |
| 2 | Johto | 8 | 0 |
| 3 | Hoenn | 8 | 0 |
| 4 | Sinnoh | 8 | 0 |
| 5 | Unova | 8 | 2 (Cilan/Chili/Cress × 3; Drayden/Iris × 2) |
| 6 | Kalos | 8 | 0 |
| 7 | Alola | 8 | 2 (Lana/Kiawe/Mallow × 3; Sophocles/Acerola × 2) |
| 8 | Galar | 8 | 2 (Bea/Allister × 2; Gordie/Melony × 2) |
| 9 | Paldea | 8 | 0 |
| **Total** | | **72** | **6** |

### Multi-slot entries (types arrays match sprite array length)
- Gen 5 round 0: `types: ['grass', 'fire', 'water']` (3 elements — Cilan/Chili/Cress)
- Gen 5 round 7: `types: ['dragon', 'dragon']` (2 elements — Drayden/Iris)
- Gen 7 round 2: `types: ['water', 'fire', 'grass']` (3 elements — Lana/Kiawe/Mallow)
- Gen 7 round 4: `types: ['electric', 'ghost']` (2 elements — Sophocles/Acerola)
- Gen 8 round 3: `types: ['fighting', 'ghost']` (2 elements — Bea/Allister)
- Gen 8 round 5: `types: ['rock', 'ice']` (2 elements — Gordie/Melony)

## Spot-checks

| Leader | Expected | ✓ |
|--------|----------|---|
| Brock | `['rock']` | ✓ |
| Morty | `['ghost']` | ✓ |
| Fantina | `['ghost']` | ✓ |
| Valerie | `['fairy']` | ✓ |

## Verification Results

### grep count
```
grep -c "types:" gym-leaders-by-generation.ts
→ 72  ✓
```

### Build result
```
npm run build
→ Building... ✔
→ Application bundle generation complete. [4.955 seconds]
→ Zero TypeScript errors  ✓
```
(Pre-existing warnings about bundle size and CommonJS module are unrelated to this change.)

## Deviations from Plan

None — plan executed exactly as written. No `PokemonType` import was needed; TypeScript inferred all types from the `GymLeader` interface.

## Commit

`9905f84` — feat(02): assign types to all gym leaders across 9 generations

## Self-Check: PASSED

- [x] File modified: `gym-leaders-by-generation.ts` — exists ✓
- [x] Commit `9905f84` exists in git log ✓
- [x] `grep -c "types:"` returns `72` ✓
- [x] `npm run build` — zero TypeScript errors ✓

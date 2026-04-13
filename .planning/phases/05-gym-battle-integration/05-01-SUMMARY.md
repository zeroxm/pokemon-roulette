---
phase: 05-gym-battle-integration
plan: 01
title: Gym Battle Type Integration
subsystem: gym-battle-roulette
tags: [type-matchup, gym-battle, wheel-odds, modal, i18n]
dependency_graph:
  requires: [TypeMatchupService, ModalQueueService]
  provides: [type-advantage-modal, adjusted-wheel-odds]
  affects: [gym-battle-roulette]
tech_stack:
  patterns: [modal-queue, async-leader-resolution, type-matchup-bonus]
key_files:
  modified:
    - src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts
    - src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.html
    - src/assets/i18n/en.json
    - src/assets/i18n/de.json
    - src/assets/i18n/es.json
    - src/assets/i18n/fr.json
    - src/assets/i18n/it.json
    - src/assets/i18n/pt.json
decisions:
  - "Call queueTypeAdvantageModal() in both gameSubscription (single-slot leaders) and async subscribe callback (multi-slot leaders) to ensure modal shows with correct resolved data"
  - "Capture leaderTypes before async translate.get() to avoid losing type data on multi-slot leader resolution"
  - "Re-show typeAdvantageModal on teamSubscription when state=gym-battle to reflect PC swap changes"
metrics:
  duration: ~5 minutes
  completed: 2026-04-13
  tasks: 6
  files: 8
---

# Phase 05 Plan 01: Gym Battle Type Integration Summary

**One-liner:** Injected TypeMatchupService into gym-battle component — adjusts wheel odds (+2/+3 yes or +1/+2 no) and shows a queued type-advantage modal after the gym-leader presentation modal.

## What Was Built

- **TypeMatchupService injection** — added to constructor, used in `calcVictoryOdds()` to compute `strongCount`/`weakCount` and set `advantageLabel`.
- **Wheel odds adjustment** — overwhelming advantage: +3 yes; advantage: +2 yes; disadvantage: +1 or +2 extra no (>3 weak).
- **`typeAdvantageModal`** — new `ng-template` queued via `ModalQueueService` after the gym-leader presentation modal. Shows type icons (via PokeAPI sprites), strong/weak counts, and advantage label.
- **`getTypeIconUrl()`** — maps `PokemonType` to PokeAPI sprite URL using `pokemonTypeDataByKey`.
- **Multi-slot async bug fix** — `leaderTypes` captured before `translate.get()` subscribe, then `[leaderTypes[randomIndex]]` assigned on the resolved leader. `calcVictoryOdds()` and `queueTypeAdvantageModal()` called inside the subscribe callback for multi-slot leaders.
- **PC swap re-show (BATTLE-04)** — `currentGameState` cached; `teamSubscription` re-queues the advantage modal when team changes during an active gym battle and `advantageLabel` is set.
- **i18n** — added `typeAdvantage.{overwhelming,advantage,disadvantage,strong,weak}` keys to all 6 language files (en, de, es, fr, it, pt).

## Files Changed

| File | Change |
|------|--------|
| `gym-battle-roulette.component.ts` | Added TypeMatchupService injection, new fields, calcVictoryOdds type bonus, queueTypeAdvantageModal helper, async bug fix, BATTLE-04 state caching |
| `gym-battle-roulette.component.html` | Added `#typeAdvantageModal` ng-template with type icons, strong/weak counts |
| `src/assets/i18n/en.json` | Added `typeAdvantage` nested keys |
| `src/assets/i18n/de.json` | Added German translations |
| `src/assets/i18n/es.json` | Added Spanish translations |
| `src/assets/i18n/fr.json` | Added French translations |
| `src/assets/i18n/it.json` | Added Italian translations |
| `src/assets/i18n/pt.json` | Added Portuguese translations |

## Build Result

✅ `npm run build` — exit code 0, zero TypeScript errors.
Pre-existing warnings (bundle size budget, CommonJS dom-to-image-more) — not caused by these changes.

## Deviations from Plan

None — plan executed exactly as written, including all notes from the critical implementation section.

## Commits

| Hash | Message |
|------|---------|
| a2c199d | feat(05): integrate type matchup into gym battle — wheel odds + advantage modal |

## Self-Check: PASSED

- `gym-battle-roulette.component.ts` — modified and committed ✓
- `gym-battle-roulette.component.html` — modified and committed ✓
- All 6 i18n files — modified and committed ✓
- Build: exit 0 ✓
- Commit a2c199d exists ✓

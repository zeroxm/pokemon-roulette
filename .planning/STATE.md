# Project State

**Last updated:** 2026-04-13  
**Current milestone:** v1.1 — Inline Type Matchup Display ✅ SHIPPED  
**Branch:** `28-pokémon-types-on-battles`  
**Status:** Milestone complete — ready for next milestone

## Current Position

Phase: —  
Plan: —  
Status: All phases complete. Next milestone TBD.  
Last activity: 2026-04-13 — v1.1 shipped (Phase 7 + Phase 8)

## Accumulated Context

- Angular 21 standalone, no NgModule
- No `setTimeout` anywhere — use lifecycle hooks, RxJS, `afterNextRender`
- `TypeMatchupService` at `src/app/services/type-matchup-service/type-matchup.service.ts`
  - `calcTeamMatchup(team, opponentTypes)` → `{ strongCount, weakCount }`
  - `getAdvantageLabel(strongCount, weakCount)` → label or null
  - `getMatchupTypes(team, opponentTypes)` → `{ advantageTypes, disadvantageTypes }` (added v1.1)
- Type icon URL: `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl/{id}.png`
- `pokemonTypeDataByKey[type].id` gives the numeric ID for the URL
- `ModalQueueService` is the established pattern for leader presentation and item modals
- `.planning/` is gitignored — force-add with `git add -f`
- Phase numbering continues from last phase (next milestone starts at Phase 9+)

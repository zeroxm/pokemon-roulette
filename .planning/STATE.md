# Project State

**Last updated:** 2026-04-13  
**Current milestone:** v1.1 — Inline Type Matchup Display  
**Branch:** `28-pokémon-types-on-battles`  
**Status:** Roadmap created — ready for phase planning

## Current Position

Phase: Phase 7 — Foundation (not started)  
Plan: —  
Status: Ready to plan  
Last activity: 2026-04-13 — v1.1 roadmap created (Phase 7 & 8)

## Accumulated Context

- Angular 21 standalone, no NgModule
- No `setTimeout` anywhere — use lifecycle hooks, RxJS, `afterNextRender`
- `TypeMatchupService` at `src/app/services/type-matchup-service/type-matchup.service.ts`
- Type icon URL: `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl/{id}.png`
- `pokemonTypeDataByKey[type].id` gives the numeric ID for the URL
- `ModalQueueService` is the established pattern (but typeAdvantageModal is being removed)
- `.planning/` is gitignored — force-add with `git add -f`

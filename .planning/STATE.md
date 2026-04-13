# Project State

**Last updated:** 2026-04-13  
**Current milestone:** v1.1 — Inline Type Matchup Display  
**Branch:** `28-pokémon-types-on-battles`  
**Status:** Defining requirements

## Current Position

Phase: Not started (defining requirements)  
Plan: —  
Status: Defining requirements  
Last activity: 2026-04-13 — Milestone v1.1 started

## Accumulated Context

- Angular 21 standalone, no NgModule
- No `setTimeout` anywhere — use lifecycle hooks, RxJS, `afterNextRender`
- `TypeMatchupService` at `src/app/services/type-matchup-service/type-matchup.service.ts`
- Type icon URL: `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl/{id}.png`
- `pokemonTypeDataByKey[type].id` gives the numeric ID for the URL
- `ModalQueueService` is the established pattern (but typeAdvantageModal is being removed)
- `.planning/` is gitignored — force-add with `git add -f`

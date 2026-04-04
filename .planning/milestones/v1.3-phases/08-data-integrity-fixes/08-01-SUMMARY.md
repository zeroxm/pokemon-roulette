---
plan: 08-01
phase: 08-data-integrity-fixes
status: complete
completed: 2026-04-09
commit: 1a06393
---

# Plan 08-01: Data Integrity Fixes — Summary

## What Was Built

Two targeted bug fixes in `roulette-container.component.ts` ensuring Pokédex data accurately reflects shiny captures and champion wins for all Pokémon including alt-forms.

## Changes Made

### Fix 0 — `completePokemonCapture` prerequisite (SHINY-03 enabler)
Added `this.currentContextPokemon = pokemon;` as the first line so `setShininess` can always reference the captured pokemon, regardless of whether form-selection occurred.

### Fix 1 — SHINY-03: Shiny flag persistence
In `setShininess(true)`, after `makeShiny()`, calls `registerInPokedex({ ...this.currentContextPokemon, shiny: true })`. Previously the Pokédex was written before shininess was determined, so the entry always had `shiny: false`.

### Fix 2 — ALTW-01: Alt-form champion wins
In `championBattleResult`, replaced direct `wonIds` array with a deduplicated set that includes base national dex IDs for alt-form pokemon via `pokemonFormsService.getBasePokemonId`. Alt-form IDs (> 1025) are not in the Pokédex grid, so base IDs were never marked won.

## Key Files

- `src/app/main-game/roulette-container/roulette-container.component.ts` — 3 targeted edits
- `src/app/main-game/roulette-container/roulette-container.component.spec.ts` — 2 new regression tests

## Test Results

- **Before:** 167 specs passing, 2 new tests RED (SHINY-03, ALTW-01)
- **After:** 169 specs, 0 failures ✓

## Self-Check: PASSED

---
plan: 04-02
phase: 4
status: complete
completed: 2026-04-03
requirements_completed: [HOOK-01, HOOK-02]
commits:
  - 4117f25
---

# Plan 04-02: Game Hook Fixes — markSeen on Evolution & Trade

## What Was Built

Added two missing `pokedexService.markSeen()` calls to `roulette-container.component.ts`:

**HOOK-01 — Evolution hook:**
- Added `this.pokedexService.markSeen(pokemonIn.pokemonId)` inside `replaceForEvolution()` after `structuredClone(pokemonIn)` (line 703)
- Covers ALL evolution paths via single insertion: evolvePokemon() (line 663), evolveSecondPokemon() lines 719/721, inline at line 355
- Existing Nincada second-evolution markSeen at line 725 untouched

**HOOK-02 — Trade hook:**
- Added `this.pokedexService.markSeen(this.pkmnIn.pokemonId)` in `performTrade()` immediately after `trainerService.performTrade(...)` (line 564)
- Received Pokémon now registered in Pokédex synchronously with the trade

## Files Modified

- `src/app/main-game/roulette-container/roulette-container.component.ts` — 2 line insertions

## Verification

- `grep -c "markSeen" roulette-container.component.ts` → 5 (was 3) ✓
- HOOK-01 insertion at line 703 confirmed ✓
- HOOK-02 insertion at line 564 confirmed ✓
- 141/141 tests pass ✓

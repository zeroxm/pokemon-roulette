# Phase 8 Summary — Service Hardening

**Status:** complete
**Commits:** f542e0c, 25a797b, e4ab7b0, 4af9732

## What Was Done

### PLAN-01: BADGE-01 — BadgesService bounds check
- Added guard in `getBadge()` before accessing `badgesByGeneration[generation.id][fromRound]`
- Returns `of(undefined as unknown as Badge)` with `console.warn` when generation or round is out of range
- Added 2 new spec tests covering unknown generation ID and out-of-range round

### PLAN-02: CLEAN-01 + IMMUT-01 — TrainerService cleanup
- Removed `pokemonIn = pokemonIn;` no-op self-assignment in `replaceForEvolution()`
- `getTeam()` now returns `[...this.trainerTeam]` (spread copy)
- `getStored()` now returns `[...this.storedPokemon]` (spread copy)
- Internal mutations (`removeFromTeam`, `updateTeam`) still use the live array directly — intentional

### PLAN-03: LOOKUP-01 — PokemonService O(1) lookup
- Added `private readonly pokemonById: Map<number, PokemonItem>` built once in constructor
- `getPokemonById()` uses `Map.get()` instead of `Array.find()` over 14k+ entries
- `getPokemonByIdArray()` reuses the persistent Map instead of building throwaway Map on each call

### PLAN-04: STATE-01 — Data-driven game state stack
- Added `GENERATION_GAME_CONFIG` constant mapping all 9 generations to `{ gymCount: 8, eliteFourCount: 4 }`
- Injected `GenerationService` into `GameStateService` constructor (no circular dep)
- Replaced hardcoded 25-element `stateStack` array with programmatic builder loop
- `resetGameState()` reads current generation config before rebuilding stack
- Updated 7 test mocks to include `getCurrentGeneration()` (required by new constructor)

## Test Results

- Build: ✅ clean (no errors or warnings)
- Tests: ✅ 177/177 (175 original + 2 new BADGE-01 tests)

## Requirements Addressed

- BADGE-01: bounds check in BadgesService ✅
- CLEAN-01: self-assignment removed ✅
- IMMUT-01: immutable copies from getTeam/getStored ✅
- LOOKUP-01: persistent Map for O(1) lookup ✅
- STATE-01: data-driven state stack ✅

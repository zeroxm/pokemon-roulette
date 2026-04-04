---
phase: 01-service-game-hooks
plan: 01
subsystem: pokedex-data-layer
tags: [service, localStorage, rxjs, tdd, game-hooks]
dependency_graph:
  requires: []
  provides: [PokedexService, PokedexEntry, PokedexData]
  affects: [roulette-container.component.ts]
tech_stack:
  added: []
  patterns: [BehaviorSubject pattern (mirrors SettingsService), in-memory Map cache for sprite URLs]
key_files:
  created:
    - src/app/services/pokedex-service/pokedex.service.ts
    - src/app/services/pokedex-service/pokedex.service.spec.ts
  modified:
    - src/app/main-game/roulette-container/roulette-container.component.ts
decisions:
  - "D-01: PokedexData stored as Record<string, PokedexEntry> keyed by pokemonId string (not array)"
  - "D-02: localStorage key is 'pokemon-roulette-pokedex' (namespaced, survives game resets)"
  - "D-03: Sprite URLs are deterministic — computed from pokemonId, no HTTP calls (GitHub raw sprites)"
  - "D-04: In-memory spriteCache (Map<number,string>) deduplicates URL construction across calls"
  - "D-05: markSeen is idempotent — early-return no-op if key already in caught{}"
  - "D-06: markWon creates entries for unseen Pokémon (sets won:true and sprite)"
  - "D-07: No clearPokedex/reset method — Pokédex must survive game resets by design"
  - "D-08: PokedexService is decoupled from TrainerService — callers pass pokemonId directly"
metrics:
  duration_seconds: 251
  completed_date: "2026-04-03T22:39:28Z"
  tasks_completed: 2
  files_created: 2
  files_modified: 1
  tests_added: 15
  tests_total_after: 119
---

# Phase 1 Plan 01: PokedexService and Game Hooks Summary

**One-liner:** Persistent Pokédex data layer using BehaviorSubject+localStorage pattern with four game hook call sites wired in roulette-container.

## What Was Built

### PokedexService (`src/app/services/pokedex-service/pokedex.service.ts`)

New singleton service implementing the Pokédex data layer. Mirrors the `SettingsService` pattern exactly.

**Public API:**
| Symbol | Type | Description |
|---|---|---|
| `PokedexEntry` | interface | `{ won: boolean; sprite: string \| null }` |
| `PokedexData` | interface | `{ caught: Record<string, PokedexEntry> }` |
| `pokedex$` | `Observable<PokedexData>` | BehaviorSubject-backed reactive stream |
| `currentPokedex` | `PokedexData` | Synchronous current value getter |
| `markSeen(id)` | `void` | Adds entry to `caught{}` — idempotent, stores sprite URL |
| `markWon(ids[])` | `void` | Sets `won: true` for all IDs; also marks unseen as seen |

**Internal implementation:**
- `private readonly STORAGE_KEY = 'pokemon-roulette-pokedex'`
- `private readonly spriteCache = new Map<number, string>()` — avoids reconstructing URL strings
- Sprite URL formula: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
- Constructor reads localStorage; falls back to `{ caught: {} }` on missing or invalid JSON
- `savePokedexToStorage()` wraps `localStorage.setItem` in try/catch for quota safety

### Game Hooks Wired (`roulette-container.component.ts`)

Four hook call sites added with exactly 6 edits (import, constructor injection, 4 call sites):

| Method | Hook | Requirement |
|---|---|---|
| `completePokemonCapture(pokemon)` | `markSeen(pokemon.pokemonId)` | DATA-01: all roulette captures |
| `teamRocketDefeated()` | `markSeen(stolenPokemon.pokemonId)` BEFORE null assignment | DATA-01: Team Rocket recovery |
| `evolveSecondPokemon()` Nincada branch | `markSeen(pokemonEvolutions[1].pokemonId)` | DATA-01: Shedinja edge case |
| `championBattleResult(result)` | `markWon(team+stored IDs)` INSIDE `if (result)` | DATA-02: Champion defeat only |

## Key Decisions Implemented

- **D-01 — Record keyed by string ID:** `caught` is a `Record<string, PokedexEntry>` so JSON serialization is trivial and lookup is O(1).
- **D-02 — Namespaced localStorage key:** `'pokemon-roulette-pokedex'` is never touched by `TrainerService.resetTeam()` — Pokédex survives new game runs.
- **D-03 — Deterministic sprite URLs:** No HTTP calls at write time; URLs are constructed from the pokemonId and served from GitHub raw CDN.
- **D-04 — In-memory cache:** `spriteCache: Map<number, string>` prevents duplicate string construction on `markSeen` idempotency calls.
- **D-05 — Idempotent markSeen:** Early-return if `caught[key]` already exists — safe to call from any game event without side effects.
- **D-06 — markWon creates entries:** If a Pokémon was not seen yet (e.g., stored PC Pokémon won against champion), `markWon` will create the entry with `won: true`.
- **D-07 — No reset method:** There is no `clearPokedex()` method to prevent accidental wiring to game resets.
- **D-08 — Decoupled from TrainerService:** Callers pass `pokemonId: number` directly — no coupling between the data layer and team management.

## Test Results

**Task 1 TDD spec:** 15 tests added covering DATA-01 through DATA-06:
- `should be created`
- DATA-01: markSeen creates entry, idempotency (2 tests)
- DATA-02: markWon sets won:true, marks unseen as seen (2 tests)
- DATA-03: localStorage persistence, constructor restore, fallback to empty (3 tests)
- DATA-04: no clearPokedex method exists (1 test)
- DATA-05: deterministic sprite URL stored on markSeen and markWon (2 tests)
- DATA-06: spriteCache populated, no duplicates (2 tests)
- Observable: emits on subscribe, emits after mutation (2 tests)

**Full suite after Task 2:** 119/119 SUCCESS — zero regressions.

## Commits

| Hash | Message |
|---|---|
| `89c7c08` | feat(01-01): add PokedexService with localStorage persistence and reactive Observable |
| `14e83ba` | feat(01-01): wire PokedexService hooks into game events |

## Deviations from Plan

None — plan executed exactly as written. All 6 edits made to roulette-container.component.ts match the plan specification. All 15 tests pass green. Build compiles with zero TypeScript errors.

## Known Stubs

None — all data flows are fully implemented. The service writes real data to localStorage and emits real values via `pokedex$`. Phase 2 (UI grid) will subscribe to `pokedex$` and render the entries.

## Self-Check: PASSED

- `src/app/services/pokedex-service/pokedex.service.ts` — FOUND
- `src/app/services/pokedex-service/pokedex.service.spec.ts` — FOUND
- commit `89c7c08` — FOUND
- commit `14e83ba` — FOUND
- markSeen calls = 3 — VERIFIED
- markWon calls = 1 — VERIFIED
- TrainerService in PokedexService = 0 — VERIFIED
- 119/119 tests pass — VERIFIED

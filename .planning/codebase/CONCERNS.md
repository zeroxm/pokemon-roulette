# Concerns & Technical Debt

**Analysis Date:** 2025-01-27

---

## Critical Issues

### Self-Assignment No-Op Bug
- **File:** `src/app/services/trainer-service/trainer.service.ts:164`
- **Issue:** `pokemonIn = pokemonIn;` is a no-op self-assignment that does nothing. This is dead code left behind from a refactor, but it signals the method may have had different intent (e.g., `this.pkmnIn = pokemonIn`).
- **Severity:** Medium — the surrounding logic is correct, but the line is misleading.

### Hardcoded Untranslated String
- **File:** `src/app/main-game/roulette-container/roulette-container.component.ts:572`
- **Issue:** `this.pkmnTradeTitle = "Trade!";` is a raw English string that bypasses the i18n translation pipeline. All other modal titles use translation keys.
- **Severity:** Medium — breaks localization for French, German, Italian, Portuguese, Spanish players.

### Direct DOM Access for Canvas (Anti-Pattern)
- **File:** `src/app/wheel/wheel.component.ts:66–68`
- **Issue:** `document.getElementById('wheel')` and `document.getElementById('pointer')` bypass Angular's component encapsulation. If the template IDs change or the component is rendered multiple times, this will silently fail. Angular `@ViewChild` is the correct approach.
- **Severity:** Medium — fragile and untestable.

### No Game State Persistence
- **Issue:** Game progress (team, items, badges) lives entirely in-memory in `TrainerService`. Refreshing the page mid-game resets everything. Only Pokédex and settings are persisted to localStorage.
- **Files:** `src/app/services/trainer-service/trainer.service.ts`, `src/app/services/game-state-service/game-state.service.ts`
- **Severity:** High (for UX) — complete game state loss on any accidental navigation or page refresh.

---

## Security

### External CDN Dependency (Bulbagarden Archive)
- **Files:** `src/app/services/item-sprite-service/item-sprite.service.ts:15`, `src/app/services/badges-service/badges-data.ts:65–79`
- **Issue:** Z-Crystal badges and the Running Shoes item sprite are loaded from `https://archives.bulbagarden.net/...`. This third-party domain has no SLA guarantee. Unlike PokeAPI sprites (also external), there is no retry or fallback logic for this CDN.
- **Severity:** Medium — if Bulbagarden changes their URL structure, those sprites silently break.

---

## Performance

### Massive Static Data Files Bundled in the App
- **Files:**
  - `src/app/services/pokemon-service/national-dex-pokemon.ts` — **14,354 lines**
  - `src/app/services/pokemon-forms-service/pokemon-forms.ts` — **2,224 lines**
  - `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts` — **695 lines**
  - `src/app/services/evolution-service/evolution-chain.ts` — **487 lines**
- **Issue:** All Pokémon data (~14k entries), form data, gym leaders, and evolution chains are bundled directly in the JavaScript bundle. This increases initial parse and boot time.
- **Severity:** Medium — impacts initial load, especially on mobile. Consider lazy-loading or serving as JSON assets fetched on demand.

### Linear Search on 14k+ Array
- **File:** `src/app/services/pokemon-service/pokemon.service.ts:40`
- **Issue:** `getPokemonById()` uses `Array.find()` over `nationalDexPokemon` on every call. With 14k+ entries and frequent calls (team render, evolution checks, etc.), this is a repeated O(n) scan. `getPokemonByIdArray()` already builds a `Map` for batched lookups but it's not reused.
- **Severity:** Medium — add a persistent `Map<number, PokemonItem>` lookup at service construction.

### Full PokéAPI Response Fetched for Sprite Only
- **File:** `src/app/services/pokemon-service/pokemon.service.ts:22–36`
- **Issue:** `getPokemonSprites()` fetches the complete PokéAPI `/pokemon/{id}` endpoint (which returns ~50+ fields) just to extract two sprite URLs. This wastes bandwidth on mobile connections.
- **Severity:** Low — PokeAPI provides a sprites-only endpoint; alternatively, the PokeAPI sprite CDN URLs are deterministic by ID and don't require an API call at all.

---

## Technical Debt

### Mixed Subscription Cleanup Patterns
- **Issue:** Three different cleanup patterns coexist inconsistently:
  1. `takeUntilDestroyed()` — modern Angular signal pattern (used in `coffee-button.component.ts`, `credits-button.component.ts`, `roulette-container.component.ts`)
  2. Manual `Subscription` + `ngOnDestroy()` — older pattern (used in `end-game.component.ts`, `game-over.component.ts`, `trainer.service.ts`, and most roulette components)
  3. No cleanup at all — subscription created in constructor without any teardown (`restart-game-button.component.ts:25`, `settings-button.component.ts:25`)
- **Files:** `src/app/restart-game-button/restart-game-button.component.ts:25`, `src/app/settings-button/settings-button.component.ts:25`
- **Severity:** Medium — components with no cleanup leak subscriptions if they are destroyed and re-created.

### Temporary Shiny Propagation Bridge (TODO)
- **File:** `src/app/services/pokedex-service/pokedex.service.ts:43–49` and `121–138`
- **Issue:** Two `TODO(next-task cleanup)` comments mark temporary migration code that propagates shiny status across evolution chains. This bridge is meant to be removed once a "dedicated shiny consistency pipeline lands in the next task" — but that task is not tracked in code.
- **Severity:** Medium — if never removed, the migration logic runs on every `markSeen()` call and on every load, creating unnecessary overhead.

### God Component: `RouletteContainerComponent`
- **File:** `src/app/main-game/roulette-container/roulette-container.component.ts` — **818 lines**
- **Issue:** This component orchestrates all game flow: item use, evolution, Pokédex registration, modal management, trading, legendary capture, Team Rocket events, shiny resolution, and more. It has 10+ injected services and 6 `@ViewChild` modal references. Any new game mechanic requires editing this file.
- **Severity:** High — high coupling makes testing and extension risky. Business logic should be extracted into dedicated services.

### Hardcoded Game State Stack in Service
- **File:** `src/app/services/game-state-service/game-state.service.ts:24–51`
- **Issue:** The initial game flow (gym battles, elite four, champion) is hardcoded as a fixed array in `initializeStates()`. Changing the number of gyms or inserting new states requires editing this array manually and counting positions carefully.
- **Severity:** Medium — fragile when new generations with different gym counts need to be supported.

### Duplicate Battle Component Code
- **Files:**
  - `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts`
  - `src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component.ts`
  - `src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-battle-roulette.component.ts`
  - `src/app/main-game/roulette-container/roulettes/rival-battle-roulette/rival-battle-roulette.component.ts`
- **Issue:** All four battle components share the same structure: `generationSubscription`, `teamSubscription`, `gameSubscription`, `victoryOdds`, `calcVictoryOdds()`, item-use logic, and modal patterns. The subscription management boilerplate is repeated verbatim.
- **Severity:** Medium — increases maintenance burden; a shared `BaseBattleRouletteComponent` or service could centralize this.

---

## TODOs & FIXMEs

| File | Line | Comment |
|------|------|---------|
| `src/app/services/pokedex-service/pokedex.service.ts` | 43 | `TODO(next-task cleanup): remove this temporary shiny propagation bridge once the dedicated shiny consistency pipeline lands` |
| `src/app/services/pokedex-service/pokedex.service.ts` | 121 | `TODO(next-task cleanup): remove this temporary migration once legacy shiny records are no longer in circulation` |

---

## Missing Features / Incomplete Areas

### No Game Progress Persistence
- **Issue:** If a player refreshes mid-game, their entire team, items, and badges are lost. Only Pokédex completion and settings survive a refresh.
- **Impact:** High player frustration. Adds implicit expectation that players never close the tab.

### No Loading State for PokeAPI Sprite Fetches
- **File:** `src/app/services/trainer-service/trainer.service.ts:330–335`
- **Issue:** `loadPokemonSpriteIfMissing()` fires-and-forgets an HTTP request via subscribe without exposing any loading state to the UI. Pokémon sprites may briefly appear as broken images or placeholder pixels.
- **Severity:** Medium

### PokeAPI Used Without Global Error/Retry Fallback
- **File:** `src/app/services/pokemon-service/pokemon.service.ts`
- **Issue:** Sprite fetching has a 3-retry policy, but `loadPokemonSpriteIfMissing()` in `TrainerService` directly subscribes with no error handling at all. If PokeAPI is down, sprites silently fail.
- **Severity:** Medium

### No CSP or Subresource Integrity
- **Issue:** External resources from `raw.githubusercontent.com`, `pokeapi.co`, and `archives.bulbagarden.net` are loaded with no Content Security Policy or integrity attributes. No fallback local assets exist.
- **Severity:** Low

---

## Fragile Areas

### `BadgesService` — No Bounds Check on Round Index
- **File:** `src/app/services/badges-service/badges.service.ts:18`
- **Issue:** `this.badgesByGeneration[generation.id][fromRound]` accesses the badge array by round index directly. If `fromRound` exceeds the array length for a given generation (possible if generation-specific gym counts differ), the result is `undefined` and the badge is silently skipped.
- **Severity:** Medium

### `WheelComponent` Canvas IDs — Not Scoped to Instance
- **File:** `src/app/wheel/wheel.component.ts:66–68`
- **Issue:** `document.getElementById('wheel')` assumes exactly one element with `id="wheel"` exists on the page. If two `<app-wheel>` instances are ever rendered simultaneously (e.g., during a transition animation), both will reference the same DOM node.
- **Severity:** Medium

### `TrainerService` Mutates Arrays Directly
- **File:** `src/app/services/trainer-service/trainer.service.ts:84–120`
- **Issue:** `trainerTeam` and `storedPokemon` are public arrays mutated by `splice()` and `push()` directly. Consumers (e.g., `getTeam()`) return the live reference, not a copy. External mutation of the returned array bypasses the `BehaviorSubject` notification chain.
- **Severity:** Medium

### `GameStateService` Stack Can Become Inconsistent
- **File:** `src/app/services/game-state-service/game-state.service.ts`
- **Issue:** Multiple components call `setNextState()` and `finishCurrentState()` in coordinated sequences. If any state-advancing call is called in the wrong order or skipped (e.g., due to an error in a modal promise), the stack can desync and the game will advance to an unintended state. There is no state validation or guard.
- **Severity:** High

---

## Test Coverage Gaps

### Most Components Have Only a Smoke Test
- **Issue:** 44 of the 63 spec files contain exactly 1 `it()` test — the auto-generated `'should create'` check. These cover component instantiation only.
- **Affected files (sample):** `gym-battle-roulette.component.spec.ts`, `elite-four-battle-roulette.component.spec.ts`, `champion-battle-roulette.component.spec.ts`, `rival-battle-roulette.component.spec.ts`, `items.component.spec.ts`, `game-state.service.spec.ts`, `generation.service.spec.ts`, `settings.service.spec.ts`
- **Risk:** The core battle outcome logic, item use, odds calculation, and modal flow have zero assertion coverage.
- **Priority:** High

### `RouletteContainerComponent` — Core Game Flow Undertested
- **File:** `src/app/main-game/roulette-container/roulette-container.component.spec.ts`
- **Issue:** 7 tests cover only Pokémon capture, form selection, shiny flags, and Pokédex registration. The `chooseWhoWillEvolve()` method (with its 9 branches), `stealPokemon()`, `tradePokemon()`, `handleRareCandyEvolution()`, and all item-activation paths have no tests.
- **Priority:** High

### `GymBattleRouletteComponent` / Battle Roulettes — Zero Logic Tests
- **Files:** `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.spec.ts` and peers
- **Issue:** Victory odds calculation (`calcVictoryOdds()`), type-matchup integration, item-use paths, and leader selection logic are entirely untested.
- **Priority:** High

### `TrainerService` — Key Mutations Partially Tested
- **File:** `src/app/services/trainer-service/trainer.service.spec.ts` — 12 tests
- **Issue:** The 12 tests cover basic team/item operations, but the battle form transformation (`applyBattleForms`, `revertBattleForms`), Palafin/sticky form logic, and `getPokemonThatCanEvolve()` edge cases are not covered.
- **Priority:** Medium

---

## Recommendations (Priority Order)

1. **Add game state persistence** — Serialize `GameStateService` stack + `TrainerService` data to localStorage, restore on load. This is the single biggest UX risk.

2. **Fix `GameStateService` desync risk** — Add guard assertions or a state machine that validates legal state transitions to prevent game flow corruption.

3. **Refactor `RouletteContainerComponent`** — Extract event-handling branches into a `GameOrchestrationService` or dedicated per-mechanic services. The 818-line component is a maintenance liability.

4. **Standardize subscription cleanup** — Migrate all components to `takeUntilDestroyed()`. Fix the leaked subscriptions in `restart-game-button.component.ts` and `settings-button.component.ts`.

5. **Remove TODO temporary code** — Complete the "dedicated shiny consistency pipeline" task and delete both temporary propagation bridges in `pokedex.service.ts`.

6. **Fix `WheelComponent` DOM access** — Replace `document.getElementById()` with `@ViewChild` template references to make canvas access Angular-idiomatic and testable.

7. **Fix hardcoded "Trade!" string** — Move to the i18n translation file to match all other modal titles.

8. **Remove self-assignment no-op** — Delete `pokemonIn = pokemonIn;` at `trainer.service.ts:164`.

9. **Build a `Map` index in `PokemonService`** — Construct once at service init: `new Map(nationalDexPokemon.map(p => [p.pokemonId, p]))` for O(1) lookups.

---

*Concerns audit: 2025-01-27*

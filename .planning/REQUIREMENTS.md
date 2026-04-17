# Requirements: Pokemon Roulette — Milestone v1.1 (Code Quality & Test Coverage)

**Defined:** 2026-04-17
**Core Value:** The game stays green (compilable, testable, and playable) after every change.

---

## v1.1 Requirements

### Subscription Cleanup

- [x] **SUB-01**: Add `takeUntilDestroyed()` teardown to the subscription in `src/app/restart-game-button/restart-game-button.component.ts:25` — currently created in constructor with no cleanup, causing a memory leak if the component is destroyed and recreated
- [x] **SUB-02**: Add `takeUntilDestroyed()` teardown to the subscription in `src/app/settings-button/settings-button.component.ts:25` — same pattern as SUB-01; no cleanup on destroy

### Internationalization

- [x] **I18N-01**: Replace the hardcoded English string `this.pkmnTradeTitle = "Trade!"` in `src/app/main-game/roulette-container/roulette-container.component.ts:572` with a `TranslateService.instant()` call using an appropriate i18n key (e.g. `roulette.tradeTitle`), and add the key to all 6 locale JSON files (`en`, `es`, `fr`, `de`, `it`, `pt`)

### DOM Access

- [x] **DOM-01**: Replace `document.getElementById('wheel')` and `document.getElementById('pointer')` in `src/app/wheel/wheel.component.ts:66–68` with `@ViewChild` template references, making canvas access Angular-idiomatic and instance-safe

### Defensive Programming

- [x] **BADGE-01**: Add a bounds check in `src/app/services/badges-service/badges.service.ts` before `this.badgesByGeneration[generation.id][fromRound]` — guard against undefined (out-of-range round index) and log a warning rather than silently returning undefined
- [x] **CLEAN-01**: Remove the self-assignment no-op `pokemonIn = pokemonIn;` at `src/app/services/trainer-service/trainer.service.ts:164` — dead code from a refactor, misleading about method intent

### Performance

- [x] **LOOKUP-01**: Build a persistent `Map<number, PokemonItem>` at construction time in `src/app/services/pokemon-service/pokemon.service.ts` and use it in `getPokemonById()`, replacing the current `Array.find()` O(n) scan over 14k+ entries on every call

### Component Architecture

- [x] **BATTLE-01**: Extract a `BaseBattleRouletteComponent` that centralizes the common subscription setup (`generationSubscription`, `teamSubscription`, `gameSubscription`), `calcVictoryOdds()` logic, item-use boilerplate, and modal patterns shared verbatim across `GymBattleRouletteComponent`, `EliteFourBattleRouletteComponent`, `ChampionBattleRouletteComponent`, and `RivalBattleRouletteComponent`

### Data Integrity

- [x] **IMMUT-01**: Fix `TrainerService` mutable array exposure — `getTeam()` and related accessors should return a copy of `trainerTeam` and `storedPokemon` rather than live references, so external mutation cannot bypass the `BehaviorSubject` notification chain

### Game State

- [x] **STATE-01**: Refactor `GameStateService.initializeStates()` to build the state stack from generation-specific data (gym count, elite four size) rather than a hardcoded flat array — adding a new generation's gym count should not require manual position counting in a fixed array

### Test Coverage

- [x] **TEST-01**: Write meaningful unit tests for battle roulette logic — victory odds calculation (`calcVictoryOdds()`), type-matchup integration, item-use paths, and leader selection logic for at least `GymBattleRouletteComponent` and `EliteFourBattleRouletteComponent`
- [x] **TEST-02**: Write unit tests for `RouletteContainerComponent` core flows — `chooseWhoWillEvolve()` all 9 branches, `stealPokemon()`, `tradePokemon()`, `handleRareCandyEvolution()`, and at least 2 item-activation paths
- [x] **TEST-03**: Write service-layer unit tests covering: `TrainerService` battle form transformations (`applyBattleForms`, `revertBattleForms`), `GameStateService` state transition validation, and `PokedexService` shiny flag edge cases (`SHINY-01` through `SHINY-03` scenarios)

---

## Future Requirements (Deferred)

- Language selector image-based flags (Windows emoji rendering issue) — visual UX improvement, image assets needed
- `RouletteContainerComponent` full refactor — track but defer (already significantly decomposed)
- `GameStateService` desync guard — theoretical risk, very low probability in practice
- Game state persistence — by design (in-memory acceptable)
- Bulbagarden CDN retry/fallback — by design (acceptable dependency)
- Static data lazy-loading — by design (bundle size acceptable)

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Game state persistence | By design — in-memory is acceptable for this game type |
| RouletteContainerComponent refactor | Track but not this milestone — already significantly decomposed |
| GameStateService desync guard | Theoretical, very low probability in practice |
| Bulbagarden CDN fallback | By design — acceptable external dependency |
| Static data lazy-loading | By design — bundle size acceptable |
| Shiny propagation TODO cleanup | Future PR handles it — do not touch |

---

## Traceability

| Requirement | Phase | Status | Phase Name |
|-------------|-------|--------|------------|
| SUB-01 | 7 | ✅ Complete | Component Hygiene |
| SUB-02 | 7 | ✅ Complete | Component Hygiene |
| I18N-01 | 7 | ✅ Complete | Component Hygiene |
| DOM-01 | 7 | ✅ Complete | Component Hygiene |
| BADGE-01 | 8 | ✅ Complete | Service Hardening |
| CLEAN-01 | 8 | ✅ Complete | Service Hardening |
| LOOKUP-01 | 8 | ✅ Complete | Service Hardening |
| BATTLE-01 | 9 | ✅ Complete | Battle Architecture Refactor |
| IMMUT-01 | 8 | ✅ Complete | Service Hardening |
| STATE-01 | 8 | ✅ Complete | Service Hardening |
| TEST-01 | 10 | ✅ Complete | Test Coverage |
| TEST-02 | 10 | ✅ Complete | Test Coverage |
| TEST-03 | 10 | ✅ Complete | Test Coverage |

**v1.1 requirements defined: 13 total**

---
*Requirements defined: 2026-04-17*

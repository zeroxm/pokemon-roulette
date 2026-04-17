# Roadmap: Pokemon Roulette

## Milestones

- ✅ **v1.0 Low-Severity Debt** — Phases 1-6 (shipped 2026-04-17)
- 🔄 **v1.1 Code Quality & Test Coverage** — Phases 7-10 (active)

## Phases

<details>
<summary>✅ v1.0 Low-Severity Debt (Phases 1-6) — SHIPPED 2026-04-17</summary>

- [x] Phase 1: Dead Code Cleanup (2/2 plans) — completed 2026-04-17
- [x] Phase 2: Naming Correction (1/1 plans) — completed 2026-04-17
- [x] Phase 3: Constants & Deduplication (2/2 plans) — completed 2026-04-17
- [x] Phase 4: Type Safety Improvements (2/2 plans) — completed 2026-04-17
- [x] Phase 5: RxJS Simplification (2/2 plans) — completed 2026-04-17
- [x] Phase 6: Performance & Analytics Config (2/2 plans) — completed 2026-04-17

Full details: [.planning/milestones/v1.0-ROADMAP.md](.planning/milestones/v1.0-ROADMAP.md)

</details>

---

## v1.1 Code Quality & Test Coverage (Phases 7–10)

- [x] **Phase 7: Component Hygiene** (3 plans) — SUB-01, SUB-02, DOM-01, I18N-01 — completed 2026-04-17
- [x] **Phase 8: Service Hardening** (4 plans) — BADGE-01, CLEAN-01, LOOKUP-01, IMMUT-01, STATE-01 — completed 2026-04-17
- [x] **Phase 9: Battle Architecture Refactor** (2 plans) — BATTLE-01 — completed 2026-04-17
- [x] **Phase 10: Test Coverage** (3 plans) — TEST-01, TEST-02, TEST-03 — completed 2026-04-17

---

## Phase Details

### Phase 7: Component Hygiene
**Goal**: All component-level hygiene issues are resolved — subscriptions are lifecycle-safe, the wheel accesses the DOM through Angular's abstractions, and the "Trade!" label is translatable in all 6 supported locales.
**Depends on**: Phase 6 (v1.0 complete)
**Requirements**: SUB-01, SUB-02, DOM-01, I18N-01
**Success Criteria** (what must be TRUE):
  1. `RestartGameButtonComponent` and `SettingsButtonComponent` subscriptions are destroyed automatically when the component is torn down (no manual `unsubscribe` call needed)
  2. `WheelComponent` resolves its canvas/element reference via `@ViewChild` — no `document.getElementById` calls remain in the component
  3. The "Trade!" action label is sourced from an i18n key and renders correctly in English, Spanish, French, German, Italian, and Portuguese without a hardcoded string in the component
**Plans**: TBD
**UI hint**: yes

### Phase 8: Service Hardening
**Goal**: The service layer is safe, performant, and architecturally honest — no out-of-bounds crashes, no silent no-ops, O(1) Pokémon lookup, immutable team/storage accessors, and generation-driven state initialization.
**Depends on**: Phase 7
**Requirements**: BADGE-01, CLEAN-01, LOOKUP-01, IMMUT-01, STATE-01
**Success Criteria** (what must be TRUE):
  1. Accessing badge data for an out-of-range generation/round does not throw a runtime error (bounds check guards the access in `BadgesService`)
  2. The self-assignment no-op `pokemonIn = pokemonIn` is removed from `TrainerService` and no equivalent dead code is reintroduced
  3. `getPokemonById()` resolves via a pre-built `Map<number, PokemonItem>` — profiling shows constant-time lookup regardless of Pokédex size
  4. `TrainerService.getTeam()` and `getStorage()` return copies; mutating the returned array does not alter internal state
  5. `GameStateService.initializeStates()` derives its state list from generation data rather than a hardcoded flat array — adding a new generation requires no code change to this method
**Plans**: TBD

### Phase 9: Battle Architecture Refactor
**Goal**: The four battle-roulette components (gym, Elite Four, champion, rival) share a common base class that owns their duplicated subscription setup, `calcVictoryOdds()`, item-use boilerplate, and modal patterns.
**Depends on**: Phase 8
**Requirements**: BATTLE-01
**Success Criteria** (what must be TRUE):
  1. A `BaseBattleRouletteComponent` exists and all four battle components extend it — no verbatim subscription setup, `calcVictoryOdds`, item-use, or modal code is duplicated across the four leaf components
  2. Each battle scenario (gym leader, Elite Four member, Champion, Rival) continues to function correctly in-game — victory/defeat flows, item usage, and modal dismissal behave identically to before the refactor
**Plans**: TBD

### Phase 10: Test Coverage
**Goal**: Critical game logic is covered by automated unit tests — battle odds, evolution branching, item activation, and service state transitions are all verifiable without running the full application.
**Depends on**: Phase 9
**Requirements**: TEST-01, TEST-02, TEST-03
**Success Criteria** (what must be TRUE):
  1. `calcVictoryOdds()`, type-matchup logic, item-use paths, and leader-selection logic (gym + E4 at minimum) are covered by passing unit tests in the battle roulette spec files
  2. `RouletteContainerComponent` has passing tests for all 9 branches of `chooseWhoWillEvolve()`, plus `stealPokemon()`, `tradePokemon()`, `handleRareCandyEvolution()`, and both item-activation paths
  3. `TrainerService` battle-form transitions, `GameStateService` state transitions, and `PokedexService` shiny edge cases each have passing unit tests; `ng test` exits green with no skipped specs
**Plans**: TBD

---

## Progress Table

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Dead Code Cleanup | v1.0 | 2/2 | Complete | 2026-04-17 |
| 2. Naming Correction | v1.0 | 1/1 | Complete | 2026-04-17 |
| 3. Constants & Deduplication | v1.0 | 2/2 | Complete | 2026-04-17 |
| 4. Type Safety Improvements | v1.0 | 2/2 | Complete | 2026-04-17 |
| 5. RxJS Simplification | v1.0 | 2/2 | Complete | 2026-04-17 |
| 6. Performance & Analytics Config | v1.0 | 2/2 | Complete | 2026-04-17 |
| 7. Component Hygiene | v1.1 | 3/3 | Complete | 2026-04-17 |
| 8. Service Hardening | v1.1 | 4/4 | Complete | 2026-04-17 |
| 9. Battle Architecture Refactor | v1.1 | 2/2 | Complete | 2026-04-17 |
| 10. Test Coverage | v1.1 | 0/? | Pending | - |

---

*Roadmap last updated: 2026-04-17 after v1.0 milestone completion | v1.1 phases added*

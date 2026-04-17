# Requirements: Pokemon Roulette — Milestone 1 (Low-Severity Debt)

**Defined:** 2026-04-17
**Core Value:** The game stays green (buildable, testable, playable) after every concern is fixed.

---

## v1 Requirements

### Dead Code Cleanup

- [x] **DEAD-01**: Remove unreachable `break` statements after `return` in every `case` of `chooseWhoWillEvolve()` in `src/app/main-game/roulette-container/roulette-container.component.ts` (lines 252–310)
- [x] **DEAD-02**: Remove the double semicolon (`;;`) at `src/app/main-game/roulette-container/roulette-container.component.ts:570`

### Naming Correction

- [x] **NAME-01**: Rename `src/app/restart-game-buttom/` directory to `src/app/restart-game-button/`, updating all file names, the class name (`RestartGameButtomComponent` → `RestartGameButtonComponent`), the selector (`app-restart-game-buttom` → `app-restart-game-button`), and all import/usage references across the codebase

### Constants & Duplication

- [ ] **CONST-01**: Extract `NINCADA_ID = 290` from `roulette-container.component.ts` into a shared constants file (e.g., `src/app/constants/pokemon-ids.constants.ts`) and move Nincada-specific Shedinja evolution logic into `EvolutionService`
- [ ] **CONST-02**: Define the default starting item (Potion) as a single constant in `TrainerService` and reference it from both the field initializer and `resetItems()`, eliminating the duplication at lines 51–60 and 254–265

### Type Safety

- [ ] **TYPE-01**: Replace `declare var gtag: any` in `src/app/services/analytics-service/analytics.service.ts` with a typed `Gtag` interface covering the GA4 event-tracking API
- [ ] **TYPE-02**: Remove `// @ts-ignore` from `src/app/main-game/end-game/end-game.component.ts` and `src/app/main-game/game-over/game-over.component.ts` by providing a proper custom type declaration file (`types/dom-to-image-more.d.ts`) — expanding the existing stub at `types/dom-to-image-more.d.ts` with the methods actually used (`toPng`, `toBlob`, `toJpeg`, `toSvg`)

### RxJS Simplification

- [ ] **RX-01**: Replace the manual `new Observable(observer => { observer.next(data); observer.complete(); })` pattern in `src/app/services/item-sprite-service/item-sprite.service.ts` with `of(data)` from RxJS
- [ ] **RX-02**: Replace the same manual observable-wrapping pattern in `src/app/services/badges-service/badges.service.ts` with `of(data)`

### Performance — Lookup Index

- [ ] **PERF-01**: Build a persistent reverse index (`Map<variantId, basePokemonId>`) at service construction time in `src/app/services/pokemon-forms-service/pokemon-forms.service.ts` to replace the O(n) linear scan in `getBasePokemonIdForForms()`, used during every Pokédex registration and sprite load

### Analytics Configuration

- [ ] **ANALYTICS-01**: Use a stub/empty GA measurement ID in `src/environments/environment.ts` (dev) so that local development sessions no longer send events to the production Google Analytics property (`G-40CS5XD7G9`)

---

## v2 Requirements

*(Not scheduled for this milestone)*

### Medium-Severity Debt

- **MED-01**: Standardize subscription cleanup to `takeUntilDestroyed()` across all components
- **MED-02**: Fix `WheelComponent` direct DOM access (`document.getElementById`) with `@ViewChild`
- **MED-03**: Fix hardcoded untranslated "Trade!" string via i18n key
- **MED-04**: Add Bulbagarden CDN fallback/retry logic for sprite loading
- **MED-05**: Add bounds check on `BadgesService` round index

### High-Severity Debt

- **HIGH-01**: Add game state persistence (team, items, badges survive page refresh)
- **HIGH-02**: Add `GameStateService` state transition validation / guard
- **HIGH-03**: Refactor `RouletteContainerComponent` god component into focused services

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Game state persistence | High severity — Milestone 2 |
| God component refactor | High severity — Milestone 2 |
| Test coverage expansion | Separate dedicated milestone |
| New game features | Out of scope for this branch milestone |
| UI/graphics redesign | Later milestone on this branch |
| Subresource Integrity / CSP headers | Infrastructure concern, separate track |

---

## Traceability

| Requirement | Phase | Status | Phase Name |
|-------------|-------|--------|------------|
| DEAD-01 | Phase 1 | Complete | Dead Code Cleanup |
| DEAD-02 | Phase 1 | Complete | Dead Code Cleanup |
| NAME-01 | Phase 2 | Complete | Naming Correction |
| CONST-01 | Phase 3 | Pending | Constants & Deduplication |
| CONST-02 | Phase 3 | Pending | Constants & Deduplication |
| TYPE-01 | Phase 4 | Pending | Type Safety Improvements |
| TYPE-02 | Phase 4 | Pending | Type Safety Improvements |
| RX-01 | Phase 5 | Pending | RxJS Simplification |
| RX-02 | Phase 5 | Pending | RxJS Simplification |
| PERF-01 | Phase 6 | Pending | Performance & Analytics Config |
| ANALYTICS-01 | Phase 6 | Pending | Performance & Analytics Config |

**Coverage:**
- v1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

*Traceability updated: 2026-04-17 — roadmap finalized in .planning/ROADMAP.md*

---
*Requirements defined: 2026-04-17*
*Last updated: 2026-04-17 after initial definition*

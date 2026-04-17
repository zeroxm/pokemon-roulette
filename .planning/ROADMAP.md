# Roadmap: Pokemon Roulette — Milestone 1 (Low-Severity Debt)

**Milestone:** 1
**Branch:** better-graphics
**Goal:** Eliminate all Low-severity technical debt from CONCERNS.md while keeping CI green

---

## Phases

- [x] **Phase 1: Dead Code Cleanup** — Remove unreachable `break` statements and the double semicolon from `roulette-container.component.ts` (completed 2026-04-17)
- [x] **Phase 2: Naming Correction** — Rename the misspelled `restart-game-buttom` across all files, selectors, classes, and import references (completed 2026-04-17)
- [ ] **Phase 3: Constants & Deduplication** — Extract `NINCADA_ID` to a shared constant, move Shedinja logic to `EvolutionService`, and centralize the default Potion in `TrainerService`
- [ ] **Phase 4: Type Safety Improvements** — Replace `declare var gtag: any` with a typed interface and remove `@ts-ignore` suppressions with a proper `.d.ts` declaration
- [ ] **Phase 5: RxJS Simplification** — Replace manual `new Observable` wrapping of synchronous data with `of()` in `ItemSpriteService` and `BadgesService`
- [ ] **Phase 6: Performance & Analytics Config** — Build a persistent reverse-index in `PokemonFormsService` and isolate the GA measurement ID between dev and prod environments

---

## Phase Details

### Phase 1: Dead Code Cleanup
**Goal:** The two dead-code instances in `roulette-container.component.ts` are removed; the file is identical in runtime behavior and CI stays green
**Depends on:** —
**Requirements:** DEAD-01, DEAD-02

**Success Criteria:**
1. `ng build` produces zero errors and zero new warnings after the edits
2. `ng test --watch=false` passes with no regressions
3. `grep -n 'break;' roulette-container.component.ts` returns zero hits inside `chooseWhoWillEvolve()` switch cases (every `case` ends with `return`, not `return; break;`)
4. `grep -n ';;' roulette-container.component.ts` returns zero hits

**Plans:**
2/2 plans complete
- [ ] Remove double semicolon at line 570 (DEAD-02)

---

### Phase 2: Naming Correction
**Goal:** The typo "buttom" is eradicated from the codebase; the component works identically under its corrected name
**Depends on:** Phase 1

**Requirements:** NAME-01

**Success Criteria:**
1. `grep -r 'buttom' src/` returns zero hits
2. The directory `src/app/restart-game-button/` exists; `src/app/restart-game-buttom/` does not
3. The component selector is `app-restart-game-button` and all usages in templates reference the corrected selector
4. `ng build` and `ng test --watch=false` both pass without errors

**Plans:**
1/1 plans complete

---

### Phase 3: Constants & Deduplication
**Goal:** Magic numbers and duplicated default-item literals are replaced by named constants; the single source of truth is in the right layer
**Depends on:** Phase 2

**Requirements:** CONST-01, CONST-02

**Success Criteria:**
1. `grep -rn 'NINCADA_ID\s*=\s*290' src/app/main-game/` returns zero hits (constant lives in `src/app/constants/pokemon-ids.constants.ts` instead)
2. Nincada/Shedinja evolution logic is handled inside `EvolutionService`, not in `RouletteContainerComponent`
3. `grep -n "Potion" src/app/services/trainer-service/trainer.service.ts` shows the literal appearing exactly once (the constant definition), not in both the initializer and `resetItems()`
4. `ng build` and `ng test --watch=false` pass

**Plans:**
- [ ] Extract `NINCADA_ID` constant and move Shedinja evolution logic to `EvolutionService` (CONST-01)
- [ ] Centralize default starting item constant in `TrainerService` (CONST-02)

---

### Phase 4: Type Safety Improvements
**Goal:** TypeScript strict-mode coverage is extended to the GA4 API and `dom-to-image-more`; no `any` or `@ts-ignore` remain for these integrations
**Depends on:** Phase 3

**Requirements:** TYPE-01, TYPE-02

**Success Criteria:**
1. `grep -rn 'declare var gtag' src/` returns zero hits; a typed `Gtag` interface is present in the codebase
2. `grep -rn '@ts-ignore' src/app/main-game/end-game/ src/app/main-game/game-over/` returns zero hits
3. `types/dom-to-image-more.d.ts` declares at minimum `toPng`, `toBlob`, `toJpeg`, and `toSvg`
4. `ng build` passes with `--strict` (no new type errors introduced)

**Plans:**
- [ ] Replace `declare var gtag: any` with a typed `Gtag` interface in `analytics.service.ts` (TYPE-01)
- [ ] Expand `types/dom-to-image-more.d.ts` and remove `@ts-ignore` from `end-game` and `game-over` components (TYPE-02)

---

### Phase 5: RxJS Simplification
**Goal:** Synchronous static data in `ItemSpriteService` and `BadgesService` is returned via `of()` rather than manual Observable construction
**Depends on:** Phase 4

**Requirements:** RX-01, RX-02

**Success Criteria:**
1. `grep -rn 'new Observable' src/app/services/item-sprite-service/ src/app/services/badges-service/` returns zero hits
2. Both services import and use `of` from `rxjs`
3. All callers of these services compile without changes (return type remains `Observable<T>`)
4. `ng build` and `ng test --watch=false` pass

**Plans:**
- [ ] Replace manual `new Observable` wrapping with `of()` in `ItemSpriteService` (RX-01)
- [ ] Replace manual `new Observable` wrapping with `of()` in `BadgesService` (RX-02)

---

### Phase 6: Performance & Analytics Config
**Goal:** The `PokemonFormsService` reverse-lookup is O(1) at runtime, and local dev sessions no longer pollute production Google Analytics
**Depends on:** Phase 5

**Requirements:** PERF-01, ANALYTICS-01

**Success Criteria:**
1. `PokemonFormsService` initializes a `Map<variantId, basePokemonId>` at construction; `getBasePokemonIdForForms()` performs a `Map.get()` lookup, not an array iteration
2. `src/environments/environment.ts` contains an empty or stub GA measurement ID (e.g., `''` or `'G-DEVELOPMENT'`); `environment.prod.ts` retains `G-40CS5XD7G9`
3. `ng build` (prod) and `ng build` (dev) both succeed; no runtime errors in a local browser session
4. `ng test --watch=false` passes — all 6 phases complete with full CI green ✓

**Plans:**
- [ ] Build persistent `Map` reverse index in `PokemonFormsService` (PERF-01)
- [ ] Separate GA measurement ID between `environment.ts` (dev) and `environment.prod.ts` (prod) (ANALYTICS-01)

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Dead Code Cleanup | 2/2 | Complete   | 2026-04-17 |
| 2. Naming Correction | 1/1 | Complete   | 2026-04-17 |
| 3. Constants & Deduplication | 0/2 | Not started | — |
| 4. Type Safety Improvements | 0/2 | Not started | — |
| 5. RxJS Simplification | 0/2 | Not started | — |
| 6. Performance & Analytics Config | 0/2 | Not started | — |

---

## Coverage

| Requirement | Phase |
|-------------|-------|
| DEAD-01 | Phase 1 |
| DEAD-02 | Phase 1 |
| NAME-01 | Phase 2 |
| CONST-01 | Phase 3 |
| CONST-02 | Phase 3 |
| TYPE-01 | Phase 4 |
| TYPE-02 | Phase 4 |
| RX-01 | Phase 5 |
| RX-02 | Phase 5 |
| PERF-01 | Phase 6 |
| ANALYTICS-01 | Phase 6 |

**v1 requirements mapped: 11/11 ✓**

---
*Roadmap created: 2026-04-17*

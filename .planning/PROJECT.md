# Pokemon Roulette

## Current Milestone: v1.3 — TBD

Run `/gsd-new-milestone` to define the next milestone goals and requirements.

Candidates from the deferred backlog:
- Language selector image-based flags (visual UX, needs image assets)
- DarkModeToggleComponent source file cleanup (delete unused component)
- DarkModeService injection cleanup in migrated components (cosmetic debt)
- Additional themes (generation-specific backgrounds) — v1.3+ backlog
- ThemeSelectorComponent label alignment (deferred from v1.2 UAT)

---

## Current State: v1.2 Shipped ✅

**Shipped:** 2026-04-17
**Tests:** 223 passing (Karma/Jasmine, ChromeHeadless)
**Branch:** 30-better-graphics

Milestone v1.2 (Theming System) is complete. Users can now select between three themes (Starters, Plain Dark, Plain Light) from the Settings panel. Theme preference persists to localStorage. All 14 components that respond to dark/light mode were migrated to the new `ThemeService.isDark$` observable.

---

## Next Milestone Planning

Run `/gsd-new-milestone` to define v1.2 goals and requirements.

Candidates from the deferred backlog:
- Language selector image-based flags (visual UX, needs image assets)
- UI/graphics improvements (scoped for this branch)
- `RouletteContainerComponent` further decomposition (tracked, not urgent)
- Shiny propagation TODO cleanup (future PR)

---

<details>
<summary>v1.2 Milestone Context (archived)</summary>

## Previous Milestone: v1.2 Theming System

**Goal:** Replace the dark/light mode toggle with a named theme selector shipping three themes.

**Delivered:**
- ThemeService with Renderer2-based body class management and localStorage persistence
- Three CSS themes: Starters (dark + tile), Plain Dark, Plain Light
- ThemeSelectorComponent replacing dark-mode toggle in Settings panel
- Full i18n in all 6 locales (en, es, fr, de, it, pt)
- 14 components migrated from DarkModeService.darkMode$ to ThemeService.isDark$
- Legacy dark-mode localStorage key removed on every setTheme() call

---

</details>

<details>
<summary>v1.1 Milestone Context (archived)</summary>

## Previous Milestone: v1.1 Code Quality & Test Coverage

**Goal:** Address all medium-severity code quality concerns from the codebase audit and fill the test coverage gap so core game logic has meaningful assertions.

**Delivered:**
- Fix leaked subscriptions in restart-game-button and settings-button (takeUntilDestroyed)
- Fix hardcoded "Trade!" string — moved to i18n translation key (6 locales)
- Fix WheelComponent DOM access — replaced document.getElementById with @ViewChild
- Add bounds check to BadgesService round index access
- Remove TrainerService self-assignment no-op
- Extract BaseBattleRouletteComponent — eliminated 454 lines of duplication
- Build persistent Map in PokemonService for O(1) getPokemonById() lookups
- Fix TrainerService mutable arrays — return copies, protect BehaviorSubject chain
- Refactor hardcoded game state stack in GameStateService to data-driven approach
- +40 tests: battle odds, roulette flow branches, service state transitions, shiny edge cases

---

</details>

<details>
<summary>v1.0 Milestone Context (archived)</summary>

## What This Is

A browser-based Pokemon roulette game built with Angular 21. Players spin randomized wheels to
determine their Pokemon team, battles, and adventure path through a generation of their choice.
The codebase has been through a full low-severity debt cleanup pass (v1.0), leaving a clean base
for the next phase of structural refactoring.

## Core Value

The game must stay green (compilable, testable, and playable) after every change — no concern fix
should introduce a regression.

## Context

This is the "better-graphics" branch, scoped for major UI and code refactoring.
Milestone v1.0 complete: 11 low-severity concerns resolved (dead code, typo, constants, type safety, RxJS, perf, analytics).

Codebase: Angular 21, TypeScript strict mode, 217 unit tests (Karma/Jasmine).
CI: GitHub Actions — `npm ci` → `ng build` → `ng test --watch=false --browsers=ChromeHeadless`.

## Constraints

- **Tech Stack**: Angular 21 + TypeScript strict mode — no framework changes
- **Compatibility**: Must pass the existing GitHub Actions CI pipeline after each phase
- **Safety**: Each concern fix committed atomically; system stays buildable and testable

</details>

---

*Last updated: 2026-04-17 after v1.1 milestone completion*

**Goal:** Address all real medium-severity concerns from the codebase audit and fill the test coverage gap so core game logic has meaningful assertions.

**Target items:**
- Fix leaked subscriptions in restart-game-button and settings-button (no teardown at all)
- Fix hardcoded "Trade!" string — move to i18n translation key
- Fix WheelComponent DOM access — replace `document.getElementById` with `@ViewChild`
- Add bounds check to `BadgesService` round index access
- Remove `TrainerService` self-assignment no-op (`pokemonIn = pokemonIn`)
- Extract `BaseBattleRouletteComponent` to eliminate 4-way boilerplate duplication
- Build persistent `Map` in `PokemonService` for O(1) `getPokemonById()` lookups
- Fix `TrainerService` mutable arrays — return copies, protect `BehaviorSubject` chain
- Refactor hardcoded game state stack in `GameStateService`
- Add meaningful test coverage for core game logic (battle odds, roulette flow, service mutations)

---

## What This Is

A browser-based Pokemon roulette game built with Angular 21. Players spin randomized wheels to
determine their Pokemon team, battles, and adventure path through a generation of their choice.
The codebase has been through a full low-severity debt cleanup pass (v1.0), leaving a clean base
for the next phase of structural refactoring.

## Core Value

The game must stay green (compilable, testable, and playable) after every change — no concern fix
should introduce a regression.

## Requirements

### Validated

- ✓ Angular 21 standalone-component SPA with client-side routing — existing
- ✓ Canvas-based spinning wheel with weighted segments and sound FX — existing
- ✓ 28 roulette screens orchestrated by a game-state stack machine — existing
- ✓ Trainer team, storage PC, item inventory, and badge tracking — existing
- ✓ Full Pokédex browser with generation filtering — existing
- ✓ i18n in 6 languages (en, es, fr, de, it, pt) via ngx-translate — existing
- ✓ Dark-mode toggle and per-generation settings — existing
- ✓ GitHub Actions CI (build + headless tests) and GitHub Pages deploy — existing
- ✓ Remove unreachable `break` statements after `return` in `chooseWhoWillEvolve()` switch block — v1.0 (DEAD-01)
- ✓ Remove double semicolon at `roulette-container.component.ts:570` — v1.0 (DEAD-02)
- ✓ Rename `restart-game-buttom` directory, files, class, selector, and all import/usage references — v1.0 (NAME-01)
- ✓ Extract `NINCADA_ID = 290` into a shared constants file; move Nincada evolution logic to `EvolutionService` — v1.0 (CONST-01)
- ✓ Centralize `TrainerService` default starting item into a single constant — v1.0 (CONST-02)
- ✓ Replace `declare var gtag: any` with a typed `GtagCommand` interface for the GA4 API — v1.0 (TYPE-01)
- ✓ Replace `@ts-ignore` on `dom-to-image-more` with a proper custom type declaration file — v1.0 (TYPE-02)
- ✓ Replace `new Observable` patterns in `ItemSpriteService` and `BadgesService` with `of()` — v1.0 (RX-01, RX-02)
- ✓ Build a persistent `Map<id, number>` reverse index in `PokemonFormsService` — v1.0 (PERF-01)
- ✓ Separate Google Analytics ID between dev and prod environments — v1.0 (ANALYTICS-01)
- ✓ ThemeService with three named themes (starters, plain-dark, plain-light), localStorage persistence, body class management — v1.2 (THEME-01)
- ✓ Global CSS theme rules for all three themes — v1.2 (THEME-02)
- ✓ ThemeSelectorComponent replacing dark-mode toggle in Settings panel — v1.2 (THEME-03)
- ✓ Theme i18n keys in all 6 locales — v1.2 (THEME-04)
- ✓ Default to starters theme on first load (silent migration from old dark-mode key) — v1.2 (THEME-05)

### Active

- [ ] Language selector image-based flags — needs image assets (deferred from v1.1)
- [ ] ThemeSelectorComponent label alignment fix — cosmetic, deferred from v1.2 UAT
- [ ] DarkModeService cleanup — remove unused injections from migrated components (v1.3+)

### Out of Scope

- Game-state persistence to localStorage — by design (in-memory is acceptable for this game type)
- `RouletteContainerComponent` god-component refactor — track, not this milestone (already significantly decomposed)
- `GameStateService` desync guard — theoretical, very low probability in practice
- Bulbagarden CDN fallback — by design (acceptable external dependency)
- Static data lazy-loading — by design (bundle size acceptable)
- Shiny propagation TODO cleanup — future PR handles it
- Language selector flag rendering on Windows — UX note, image-based approach needed, tracked for future
- UI/graphics refactoring — later milestone
- New game features — out of scope for this branch milestone

## Context

This is the "better-graphics" branch, scoped for major UI and code refactoring.
Milestone v1.0 complete: 11 low-severity concerns resolved (dead code, typo, constants, type safety, RxJS, perf, analytics).
Milestone v1.1 active: medium-severity code quality concerns + test coverage gaps.

Codebase: ~Angular 21, TypeScript strict mode, 175 unit tests (Karma/Jasmine).
CI: GitHub Actions — `npm ci` → `ng build` → `ng test --watch=false --browsers=ChromeHeadless`.
Codebase map: `.planning/codebase/` (analyzed 2025-01-31).

## Constraints

- **Tech Stack**: Angular 21 + TypeScript strict mode — no framework changes
- **Compatibility**: Must pass the existing GitHub Actions CI pipeline after each phase
- **Safety**: Each concern fix committed atomically; system stays buildable and testable

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Address Low severity only in Milestone 1 | Build confidence before tackling structural changes | ✓ Good — clean base achieved |
| Keep CONCERNS.md as living document | Remove fixed concerns after verification | ✓ Good — worked as intended |
| Atomic commits per concern | Enables bisect if a fix causes CI failure | ✓ Good — 11 clean commits |
| NINCADA_ID in dedicated constants file | Future growth — more pokemon-id constants expected | ✓ Good — extensible pattern |
| DEFAULT_POTION as private static readonly | Keep constant scoped to TrainerService | ✓ Good — appropriate encapsulation |
| GtagCommand as named type alias | Allows type reuse across call sites | ✓ Good |
| toBlob returns Promise<Blob | null> | Matches library reality — null guard needed | ✓ Good — prevents crash |
| variantToBase Map in constructor | Pre-computation at init = O(1) at every call | ✓ Good — perf win |
| Empty string for dev GA ID | Prevents analytics pollution without code changes | ✓ Good |

## Evolution

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-17 after v1.2 milestone completion*

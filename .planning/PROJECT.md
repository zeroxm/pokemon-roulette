# Pokemon Roulette

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

### Active

- [ ] Standardize subscription cleanup to `takeUntilDestroyed()` across all components (MED-01)
- [ ] Fix `WheelComponent` direct DOM access (`document.getElementById`) with `@ViewChild` (MED-02)
- [ ] Fix hardcoded untranslated "Trade!" string via i18n key (MED-03)
- [ ] Add Bulbagarden CDN fallback/retry logic for sprite loading (MED-04)
- [ ] Add bounds check on `BadgesService` round index (MED-05)

### Out of Scope

- Game-state persistence to localStorage — High severity, tracked for Milestone 2
- `RouletteContainerComponent` god-component refactor — High severity, Milestone 2
- `GameStateService` desync risk / guard — High severity, Milestone 2
- Test coverage expansion — separate milestone
- UI/graphics refactoring — later milestone on this branch
- New game features — out of scope for this branch milestone

## Context

This is the "better-graphics" branch, scoped for major UI and code refactoring.
Milestone 1 (v1.0) is complete: all 11 Low-severity concerns resolved across 6 phases, 21 files changed.
Next milestone: Medium-severity debt (subscription leaks, DOM access, i18n gaps, CDN resilience).

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
*Last updated: 2026-04-17 after v1.0 milestone completion*

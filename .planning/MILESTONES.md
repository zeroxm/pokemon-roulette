# Milestones

## v1.2 Theming System (Shipped: 2026-04-17)

**Phases completed:** 1 phase (Phase 11), 2 plans, 5 requirements delivered
**Files changed:** 18 | LOC: +125/-26
**Tests:** 217 → 223 (+6)

**Key accomplishments:**

1. Created `ThemeService` with Renderer2-based body class management and localStorage persistence (`pokemon-roulette-theme`)
2. Added three global CSS themes: `theme-starters` (dark + 430×430px tile), `theme-plain-dark`, `theme-plain-light`
3. Built `ThemeSelectorComponent` (Bootstrap select) replacing `DarkModeToggleComponent` in Settings panel
4. Added theme i18n keys in all 6 locales (en, es, fr, de, it, pt) — label + 3 option labels
5. Migrated 14 components from `DarkModeService.darkMode$` to `ThemeService.isDark$`
6. Legacy `dark-mode` localStorage key removed on every `setTheme()` call

**Archive:** `.planning/milestones/v1.2-ROADMAP.md`

---

## v1.0 Low-Severity Debt (Shipped: 2026-04-17)

**Phases completed:** 6 phases, 11 plans
**Files changed:** 21 (87 insertions, 73 deletions)
**Tests:** 175/175 throughout — zero regressions

**Key accomplishments:**

1. Removed 8 unreachable `break;` statements after `return` in `chooseWhoWillEvolve()` switch block (DEAD-01)
2. Eliminated `;;` double-semicolon from `performTrade()` (DEAD-02)
3. Corrected "buttom" typo in restart-game-button component — renamed directory, 4 files, class, selector, and 8 import/usage references using `git mv` (NAME-01)
4. Extracted `NINCADA_ID = 290` into shared constants file; encapsulated Nincada special-evolution logic in `EvolutionService` (CONST-01)
5. Centralized Potion default as `private static readonly DEFAULT_POTION` in `TrainerService` — eliminated duplicate literal (CONST-02)
6. Replaced `declare var gtag: any` with typed `GtagCommand` + `GtagEventParams` interface (TYPE-01)
7. Expanded `dom-to-image-more.d.ts` with full typed interface; removed `@ts-ignore` from end-game and game-over components; added null guard for `toBlob` (TYPE-02)
8. Replaced `new Observable` constructor pattern with RxJS `of()` in `ItemSpriteService` (RX-01)
9. Replaced `new Observable` constructor pattern with RxJS `of()` in `BadgesService` (RX-02)
10. Built `variantToBase: Map<number, number>` in `PokemonFormsService` constructor for O(1) base-id lookup (PERF-01)
11. Cleared `googleAnalyticsId` in `environment.ts` — dev/CI no longer pollutes production Google Analytics (ANALYTICS-01)

**Archive:** `.planning/milestones/v1.0-ROADMAP.md`

---

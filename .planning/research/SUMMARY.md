# Project Research Summary

**Project:** Pokémon Roulette — Persistent Pokédex Feature
**Domain:** Angular 21 SPA feature addition — large-grid Pokédex with localStorage persistence and lazy PokeAPI sprite loading
**Researched:** 2025-04-03
**Confidence:** HIGH

## Executive Summary

This milestone adds a persistent Pokédex tracker to an existing Angular 21 browser game. The Pokédex records every Pokémon a player has been assigned across all runs ("seen") and those that were on the team when the Champion was defeated ("won"), persisting across browser sessions via localStorage. The good news: every technology and pattern required already exists in the codebase. Zero new packages are needed — Angular 21 standalone components, RxJS `BehaviorSubject`, ng-bootstrap `NgbModal`, and Bootstrap 5 nav-tabs are all installed and in active use. The build should follow two established codebase models exactly: `SettingsService`/`DarkModeService` for the persistence layer and `StoragePcComponent` for the modal component pattern.

The recommended approach is a strict service-first build order. `PokedexService` must exist and be wired to game hooks before any UI is built — this lets the feature accumulate real data immediately and validates the storage contract. The grid component is the most technically complex piece: 1,025 entries with PokeAPI sprites require a deliberate lazy-loading strategy using Angular's `@defer (on viewport)` blocks and `shareReplay(1)` caching. Attempting to load sprites eagerly will cause 1,025+ simultaneous HTTP requests, modal freezes, and PokeAPI 429 rate-limit responses — this is the single highest-risk implementation decision.

The key mitigation strategy is: store only IDs in localStorage (not full `PokemonItem` objects), use `Set<number>` in memory for O(1) lookup, and strictly isolate `PokedexService` from `TrainerService` so game resets never touch Pokédex history. The existing codebase has a documented subscription leak problem (CONCERNS.md); the Pokédex grid must not repeat this pattern — every sprite subscription needs explicit cleanup via `takeUntilDestroyed()` or the `Subscription` container pattern from `StoragePcComponent`.

---

## Key Findings

### Recommended Stack

All required dependencies are already installed. No new packages needed. The entire feature is implementable using Angular 21 standalone components, RxJS `BehaviorSubject`, ng-bootstrap `NgbModal`, and Bootstrap 5.

**Core technologies:**
- **`BehaviorSubject<PokedexState>` (RxJS 7.8.2):** State management for seen/won sets — matches `SettingsService` and `DarkModeService` exactly; no paradigm change
- **`NgbModal` + `@ViewChild` (ng-bootstrap 20.0.0):** Modal container — `StoragePcComponent` uses this pattern; copy it verbatim
- **`localStorage` (native):** Persistence layer — store `{ seen: number[], won: number[] }` only; max ~8KB at full 1,025 IDs (0.16% of quota)
- **`@defer (on viewport)` (Angular 21):** Lazy sprite loading — Angular-native solution, no manual `IntersectionObserver` setup required
- **CSS Grid + `repeat(auto-fill, minmax(52px, 1fr))`:** Responsive 1,025-item grid — no CDK Virtual Scroll needed; the DOM cost of 1,025 thin `<div>` elements is low (~2ms layout)
- **Direct PokeAPI sprite URL construction:** `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png` — eliminates HTTP round-trips for sprite URL resolution; computed from ID, no Observable needed
- **`@ngx-translate/core` (17.0.0, existing):** i18n strings for progress labels and tab names — already configured

**Critical version note:** `@angular/cdk@^21.2.5` is already installed. CDK Virtual Scroll is available but NOT recommended — it requires fixed `itemSize` in pixels, which conflicts with the responsive CSS grid layout. The DOM cost does not justify the complexity.

> See `.planning/research/STACK.md` for full patterns, code samples, and alternatives considered.

---

### Expected Features

The most design-critical decisions are: (1) silhouette via `filter: brightness(0)` for unseen Pokémon (not a separate unknown asset), and (2) gold star `★` badge (`#FFD700`, CSS `::after` pseudo-element) for Won state. Both require zero images.

**Must have (table stakes — v1):**
- **Pokédex number on every cell** (`#001`) — expected in every Pokémon game; always visible even for unseen
- **Black silhouette for unseen Pokémon** — the iconic reveal mechanic; CSS `filter: brightness(0)` on the real sprite preserves shape
- **`???` name for unseen Pokémon** — real name revealed on first "seen" state
- **Small sprite grid** — ~56–64px cells; matches storage-pc rhythm (`calc((100% - 5*12px) / 6)`)
- **Progress counter** — "Seen: 45 / 151 | Won: 12 / 151" in modal header; two counts
- **Local / National Dex tab toggle** — Bootstrap `nav-tabs`; Local = current generation, National = all 1,025
- **Gold star badge for Won state** — Unicode `★` in top-right corner, `position: absolute`
- **Dark mode support** — `darkMode | async` pattern from `StoragePcComponent`
- **Scrollable modal** — `NgbModal` with `scrollable: true`; `modal-fullscreen-sm-down` for phones
- **Pokédex button** — alongside existing PC button in trainer-team area

**Should have (v1.x — after validation):**
- **Per-generation count in tab label** — `Kanto (45/151)` — low complexity, high polish
- **Real-time cell reveal animation** — CSS `@keyframes` scale pop on state transition; requires "newly seen" flag in service
- **Pokéball icon on seen-not-won cells** — additional visual differentiator between states

**Defer to v2+:**
- **Pokédex entry panel** (type, stats, descriptions) — 6,000+ API responses to cache across 6 languages
- **Search / filter bar** — explicit out-of-scope per PROJECT.md
- **Shiny tracking** — third visual state, additional storage model
- **Per-run Pokédex reset** — explicit out-of-scope; Pokédex is intentionally cumulative
- **Animated GIF sprites** — only available Gen 1–5; inconsistent across generations

> See `.planning/research/FEATURES.md` for visual reference diagrams, mobile considerations, and full prioritization matrix.

---

### Architecture Approach

The feature requires two new files (service + component) plus a thin entry component for the `@defer` target, and surgical additions to two existing files (3 lines in `RouletteContainerComponent`, 1 line in `TrainerTeamComponent` template). No existing logic changes. The `PokedexService` is a strict singleton with no coupling back to `TrainerService` — Pokédex data must survive `resetTeam()` calls. Data flows one-way: game hooks push IDs into `PokedexService`; the modal reads from it.

**Major components:**
1. **`PokedexService`** (NEW, `services/pokedex-service/`) — `BehaviorSubject<PokedexState>`, `markSeen(id)`, `markWon(ids)`, localStorage I/O; `Set<number>` in memory, `number[]` in storage
2. **`PokedexComponent`** (NEW, `trainer-team/pokedex/`) — button + modal template refs + tab state + progress counters; follows `StoragePcComponent` pattern exactly; no `@Input`/`@Output` to parent
3. **`PokedexEntryComponent`** (NEW, thin presentational) — `@Input() pokemonId`, `seen`, `won`; fetches sprite via `pokemonService.getPokemonSprites()`; required as `@defer` target
4. **`RouletteContainerComponent`** (MODIFY) — inject `PokedexService`; add `pokedexService.markSeen(pokemon.pokemonId)` in `completePokemonCapture()`; add `pokedexService.markWon(trainerService.getTeam())` in `championBattleResult(true)`
5. **`TrainerTeamComponent`** (MODIFY) — add `<app-pokedex></app-pokedex>` next to `<app-storage-pc></app-storage-pc>`

**Suggested build order (dependency-respecting):**
1. `PokedexService` → 2. `markSeen` hook → 3. `markWon` hook → 4. `PokedexEntryComponent` → 5. `PokedexComponent` (modal + tabs) → 6. Register in `TrainerTeamComponent`

> See `.planning/research/ARCHITECTURE.md` for full data flow diagrams, component hierarchy, integration point line numbers, and anti-patterns.

---

### Critical Pitfalls

1. **Storing full `PokemonItem` objects in localStorage** — Avoid: serialize only `{ seen: number[], won: number[] }`. Full objects at 1,025 entries = ~360KB → silent `QuotaExceededError` on mobile WebKit. Storing IDs only = ~8KB worst case.

2. **Eager-loading all 1,025 sprites on modal open** — Avoid: use `@defer (on viewport)` for `PokedexEntryComponent`. Without this, 1,025 concurrent HTTP requests freeze the modal for 10–30 seconds and trigger PokeAPI rate-limiting (429s), compounded by the existing `retry({ count: 3, delay: 1000 })`.

3. **Subscription leaks in the grid** — Avoid: use `takeUntilDestroyed(this.destroyRef)` on every sprite subscription; never call `subscribe()` in the entry component without cleanup. The existing codebase already has documented leak issues (CONCERNS.md) — the Pokédex must not add to them.

4. **Pokédex state coupled to `TrainerService`** — Avoid: `PokedexService` must have its own `localStorage` key (`pokemon-roulette-pokedex`) and zero import of `TrainerService`. `resetTeam()` must never touch Pokédex state. One-way data push only.

5. **Unguarded `localStorage.setItem()` calls** — Avoid: wrap writes in `try/catch` — the existing services guard reads but not writes. `QuotaExceededError` is thrown on write, not read; silently swallowed without a guard.

6. **External unknown silhouette URL** — Avoid: bundle the unknown sprite as a local asset (`/public/sprites/unknown.png`). The GitHub raw URL from PROJECT.md is a single point of failure for the default grid state (worst possible failure visibility). CONCERNS.md already flags 241+ hardcoded external URLs as a risk.

> See `.planning/research/PITFALLS.md` for full descriptions, warning signs, recovery strategies, and a pitfall-to-phase verification checklist.

---

## Implications for Roadmap

### Phase 1: Pokédex Service & Game Hooks

**Rationale:** Service-first is non-negotiable. The storage schema must be locked in before any UI exists. Wiring the hooks immediately means data accumulates during development/testing with no UI overhead. Both hooks are single-line additions to already-identified methods with LOW risk.

**Delivers:** Working persistence layer — `PokedexService` with BehaviorSubject + localStorage; `markSeen` fires on every Pokémon capture; `markWon` fires on Champion defeat. Verifiable via DevTools Application → localStorage before any modal is built.

**Addresses features:** Pokédex persistence, two-state tracking (seen/won)

**Avoids pitfalls:**
- P1 (full objects in storage) — define `StoredPokedex = { seen: number[], won: number[] }` schema as the first design decision
- P4 (coupling to TrainerService) — isolated service with own key from the start
- P5 (unguarded writes) — `saveToStorage()` with try/catch as part of initial implementation

**Research flag:** ❌ No research needed — this follows `SettingsService` pattern verbatim; well-documented, HIGH confidence

---

### Phase 2: Pokédex Entry Component & Lazy Loading

**Rationale:** The entry component must exist before the modal can render a grid. More importantly, the lazy loading strategy must be built-in from the start — not retrofitted. `@defer (on viewport)` requires a component as its target, which is why `PokedexEntryComponent` is a separate step.

**Delivers:** `PokedexEntryComponent` — presentational component that fetches its own sprite lazily when it enters the viewport; correct silhouette/color/star visual states; `shareReplay(1)` caching to prevent re-fetching on repeat opens; mobile-responsive CSS with `minmax(52px, 1fr)`; local unknown-sprite asset bundled.

**Uses:** Angular `@defer (on viewport)`, `pokemonService.getPokemonSprites()`, `shareReplay(1)`, CSS Grid

**Implements:** Architecture component #3 (PokedexEntryComponent)

**Avoids pitfalls:**
- P2 (eager sprite loading) — `@defer` built into component structure
- P3 (subscription leaks) — `takeUntilDestroyed()` on sprite subscription from day one
- P6 (external unknown sprite) — local asset bundled in this phase
- P7 (change detection flooding) — `ChangeDetectionStrategy.OnPush` declared at component creation
- P8 (mobile fixed sizes) — responsive CSS grid as initial implementation
- P9 (iOS Safari scroll) — explicit `max-height` + `-webkit-overflow-scrolling: touch` on grid container
- P10 (IntersectionObserver leak) — `@defer` handles cleanup automatically vs manual observer
- P11 (PokeAPI rate limiting) — `shareReplay(1)` + `debounceTime` on scroll triggers

**Research flag:** ⚠️ Shallow research recommended — verify `@defer (on viewport)` behavior inside an `NgbModal` scroll container (the modal scroll lock may interfere with viewport detection). Also verify iOS Safari scroll behavior before marking phase complete.

---

### Phase 3: Pokédex Modal (Full UI)

**Rationale:** With service and entry component in place, the modal is assembly work. `PokedexComponent` follows `StoragePcComponent` exactly — `@ViewChild` template refs, `NgbModal.open()`, button in template. The tab toggle, progress counters, and dark mode support are all CSS/template work with established patterns.

**Delivers:** Full Pokédex UI — Pokédex button alongside PC button; modal with Local Dex and National Dex tabs; progress counters ("Seen X / N | Won Y / N"); silhouette/color/star visual states across 1,025 cells; dark mode compatibility; `modal-fullscreen-sm-down` for phones.

**Uses:** `NgbModal`, Bootstrap `nav-tabs`, `combineLatest` view-model stream, `AsyncPipe`, `@ngx-translate/core`

**Implements:** Architecture component #2 (PokedexComponent), architecture modifications #4+#5 (TrainerTeam registration)

**Avoids pitfalls:**
- UX: modal uses default backdrop (click to dismiss) and `keyboard: true` (ESC) — unlike the PC storage modal, the Pokédex is read-only with no data-loss risk
- UX: progress counter derives from same `BehaviorSubject` as grid — single source of truth, no lag
- Layout: `modal-fullscreen-sm-down` for phone viewport; `modal-xl` for desktop

**Research flag:** ❌ No research needed — all patterns are established and verified in codebase

---

### Phase 4: Polish & V1.x Enhancements

**Rationale:** Post-validation enhancements that increase delight without changing the core feature. These are lower priority and should only be built after the core Pokédex is confirmed working in production.

**Delivers:** Per-generation count in tab label (`Kanto (45/151)`); optional cell reveal animation for newly-seen Pokémon (requires "newly seen" flag in service); Pokéball icon on seen-not-won cells.

**Research flag:** ❌ No research needed — low complexity enhancements on established patterns

---

### Phase Ordering Rationale

- **Service before UI** — prevents data contract changes after UI is built; lets hooks accumulate test data immediately
- **Entry component before modal** — `@defer` requires a component target; isolating sprite loading concerns simplifies modal component
- **Hooks in Phase 1 (not Phase 3)** — if hooks were deferred until the UI phase, the service would exist but nothing would populate it during development; wiring hooks immediately means real data is available when building the grid
- **Polish deferred to Phase 4** — core value (persistent tracking) is delivered in Phase 3; animations and enhanced labels are non-blocking

---

### Research Flags

**Phases needing deeper research before or during planning:**
- **Phase 2 (Grid / lazy loading):** Verify `@defer (on viewport)` works correctly inside an `NgbModal` scrollable container — Angular CDK and Bootstrap's scroll-lock interact with viewport detection in non-obvious ways. Also verify iOS Safari inner-scroll on a real device before marking done.

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Service):** Direct copy of `SettingsService` pattern — no unknowns
- **Phase 3 (Modal):** Direct copy of `StoragePcComponent` pattern — no unknowns
- **Phase 4 (Polish):** Incremental CSS/template work — no unknowns

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All findings verified against live codebase; zero new dependencies; all patterns confirmed in active use |
| Features | HIGH | Core visual language derived from main-series Pokémon games + direct codebase inspection; PokeAPI sprite URLs confirmed live |
| Architecture | HIGH | Based on direct inspection of all integration points (line numbers identified); build order validated against dependency graph |
| Pitfalls | HIGH | Grounded in direct codebase analysis including existing CONCERNS.md; standard browser/Angular pitfalls with well-documented prevention |

**Overall confidence: HIGH**

### Gaps to Address

- **`@defer` inside NgbModal scroll containers:** Angular docs confirm `@defer (on viewport)` uses `IntersectionObserver` internally with the nearest scrollable ancestor. Whether Bootstrap's modal scroll-lock (`overflow: hidden` on `<body>`) intercepts before the modal's inner scroll container is the scrollable ancestor needs a quick smoke test early in Phase 2. If it fails, fall back to a custom `IntersectionObserver` directive (documented in ARCHITECTURE.md Pattern 3 notes).

- **PokeAPI rate limits:** Not formally documented; community-observed ~100 req/min threshold. The `shareReplay(1)` + `debounceTime(150ms)` mitigation is standard. If hit in practice, a client-side in-memory sprite URL cache (`Map<number, string>`) in `PokemonService` is the recovery path.

- **Unknown sprite asset path on GitHub Pages:** The game deploys to GitHub Pages as a static site. The unknown-sprite local asset path must use a path compatible with Angular's `deployUrl` / `baseHref` configuration. Verify the `/public/sprites/unknown.png` path resolves correctly under the repo's Pages URL at Phase 2 completion.

---

## Sources

### Primary (HIGH confidence)

- Live codebase — `src/app/services/settings-service/settings.service.ts` — BehaviorSubject + localStorage pattern
- Live codebase — `src/app/services/dark-mode-service/dark-mode.service.ts` — storage read/write with try/catch
- Live codebase — `src/app/trainer-team/storage-pc/storage-pc.component.ts` — NgbModal + @ViewChild + Subscription cleanup pattern
- Live codebase — `src/app/services/pokemon-service/national-dex-pokemon.ts` — PokemonItem shape
- Live codebase — `src/app/main-game/roulette-container/roulette-container.component.ts` — hook locations (lines 628–688)
- Live codebase — `.planning/codebase/CONCERNS.md` — documented subscription leaks, URL fragility, localStorage error handling gaps
- PokeAPI sprite URL: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png` — confirmed 200 response
- MDN Web Docs — `<img loading="lazy">` — works in scrollable containers with defined height
- Angular docs — `@defer (on viewport)` — Angular 17+ stable feature

### Secondary (MEDIUM confidence)

- Bootstrap Issues #17590 and related — iOS Safari inner-scroll issues in fixed-position modals; `-webkit-overflow-scrolling: touch` workaround
- Community observation — PokeAPI rate limit ~100 req/min per IP; not formally documented

### Tertiary (LOW confidence)

- n/a — no findings required unverified inference

---
*Research completed: 2025-04-03*
*Ready for roadmap: yes*

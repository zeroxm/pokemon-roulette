# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Angular 21 single-page game ("Pokémon Roulette"): a randomized Pokémon run driven by spinning wheels. Standalone components only (no NgModules), Bootstrap 5 + ng-bootstrap for UI/modals, `@ngx-translate` for i18n, deployed to GitHub Pages.

> **A remediation campaign is in progress on `remediation/thermo-nuclear-audit`**
> ([PR #42](https://github.com/zeroxm/pokemon-roulette/pull/42), draft) — **read `docs/TASKS.md`
> before starting work.** Do not commit to `main`; it tracks `origin/main` untouched so the PR shows
> the whole change. Task branches fork from, and merge back into, the remediation branch.
> Two whole-codebase audits produced `docs/thermo-nuclear-review.md` (correctness, `SEC-nn`) and
> `docs/thermo-nuclear-code-quality-review.md` (maintainability, `CQ-nn`). `docs/TASKS.md` sequences
> the fixes; `docs/CHANGELOG.md` lists observable changes for UAT.
>
> Several tasks are **structural refactors that delete the code other findings sit in** — e.g. the
> planned `FormRuleService` removes ~180 lines of `TrainerService` that two High-severity bugs live in.
> Check whether a file you are about to change is scheduled for restructuring before patching it by
> hand, or your fix gets deleted. Findings are struck from the reports as tasks land; when the reports
> are empty they are deleted and `main` pushes to the remote.

## Commands

```bash
npm start                                        # dev server on 0.0.0.0:4200
npm run build                                    # production build -> dist/pokemon-roulette
npm test                                         # Karma/Jasmine, watch mode
npm test -- --watch=false --browsers=ChromeHeadless   # what CI runs
npm test -- --include='**/wheel.component.spec.ts'    # single spec file
npm run deploy                                   # gh-pages, base-href /pokemon-roulette/
```

CI (`.github/workflows/node.js.yml`) runs `npm ci`, `npm audit --omit=dev --audit-level=high`, `npm run build`, and the headless test command on every push/PR to `main`. The audit is scoped to production dependencies on purpose — a DoS in an image parser used only by the build is not a user risk, and gating on dev tooling would red-wall every PR for something unshippable. There is no lint step; `noUnusedLocals`/`noUnusedParameters` cover that class of problem.

**Green baseline:** build passes, **230/230 tests pass**. Any change must leave both green.

### Local environment gotchas

- **`CHROME_BIN` may need exporting.** Karma finds no `chromium` on some setups; `export CHROME_BIN=/usr/bin/google-chrome-stable` (or your Chrome path) before `npm test`.
- **Node: CI uses 24.x and `.nvmrc` pins 24**, but no version manager is installed, so local runs may be on a different major. A green local build is strong evidence, not proof — check CI.
- **npm 12 blocks 4 install scripts** (`esbuild`, `@parcel/watcher`, `lmdb`, `msgpackr-extract`). Build and tests pass anyway; a toolchain bump may need `npm install-scripts approve`.

### Build budgets — read before adding assets or CSS

Configured in `angular.json`: initial bundle **1.55 MB warn / 2 MB error**; per-component stylesheet **9 kB warn / 12 kB error**.

These were raised deliberately. The previous values (1 MB / 4 kB) were breached on every build by the app's actual size, which trains everyone to ignore build warnings. The new thresholds sit just above current reality — initial bundle **1.47 MB**, and `mega-evolution-animation-modal.component.css` at **8.52 kB** — so growth still trips them.

## Architecture

### Game loop: a state stack

`GameStateService` (`src/app/services/game-state-service/`) is the spine. It holds a **stack** of `GameState` strings (see `game-state.ts` for the full union), pre-seeded in `initializeStates()` in reverse play order (`character-select` … 8 gyms … elite four … `game-finish`). Two operations drive everything:

- `setNextState(s)` — push a state to run *next* (push in reverse order when queuing several).
- `finishCurrentState()` — pop and emit; the emitted value is what the UI renders.

`RouletteContainerComponent` subscribes to `currentState` and its template is one big `@switch` over the state, rendering exactly one roulette component per state. Its handler methods are the transition table: each handler pushes any follow-up states then calls its own `finishCurrentState()` wrapper (which also implements the running-shoes re-spin). This component is ~1000 lines and is where new game flow belongs.

`EventSource` (`src/app/main-game/EventSource.ts`) tags *why* a shared state was entered (e.g. `chooseWhoWillEvolve` fires from gym battles, daycare, rival battles) so the container can pick the right consolation prize when the branch is a dead end.

### Roulettes

Every roulette is a thin standalone component that:
1. builds an array of `WheelItem`s (`text` is a **translation key**, plus `fillStyle` and `weight`),
2. renders `<app-wheel [items]="…" (selectedItemEvent)="…">` (`src/app/wheel/wheel.component.ts` — canvas-drawn wheel, weighted random via `getRandomWeightedIndex()`, click SFX, theme-aware),
3. emits the chosen domain object upward to the container.

Wheel fairness/weighting is covered by statistical tests in `wheel.component.spec.ts` — keep those passing when touching selection logic.

Per-generation content lives in sibling data files next to each roulette (`fish-by-generation.ts`, `gym-leaders-by-generation.ts`, `legendaries-by-generation.ts`, …), keyed by generation id 1–9. Battle roulettes (gym / elite four / champion) extend the abstract `BaseBattleRouletteComponent`, which owns victory-odds recalculation, potion retries, and X-Attack modifiers.

### Domain data

`PokemonItem`, `ItemItem`, `GenerationItem` all extend `WheelItem`, so any domain object can be fed to the wheel directly. The National Dex is a static local table (`services/pokemon-service/national-dex-pokemon.ts`, indexed by id in `PokemonService`); only **sprites** are fetched at runtime from `pokeapi.co` (`getPokemonSprites`, retries 3×). Many item/badge sprites are hot-linked from the PokeAPI sprites GitHub repo.

### Services (all `providedIn: 'root'`, BehaviorSubject-based)

- `TrainerService` — team, PC storage, items, badges; also owns form swapping (mega/gigantamax/sticky/battle-only forms) applied and reverted around battle states.
- `GenerationService` — the selected generation drives nearly all content lookups.
- `ItemsService` / `MegaStoneService` / `RareCandyService` — item catalogs and mid-game item interrupts (rare candy and mega stones bypass the wheel; both are gated on `wheelSpinning`).
- `ModalQueueService` — serializes `NgbModal` opens so chained result modals don't stomp each other. Prefer it over `NgbModal` directly for anything the game flow triggers.
- `SoundFxService` — WebAudio handles for the mp3s in `public/`; honors the mute setting.
- `SettingsService` / `ThemeService` — persisted to `localStorage` (`pokemon-roulette-settings`, `pokemon-roulette-theme`).
- `PokedexService`, `BadgesService`, `EvolutionService`, `TypeMatchupService`, `AnalyticsService` (GA id in `src/environments/`).

### i18n

Six locales in `src/assets/i18n/*.json` (en, pt, es, fr, de, it), loaded over HTTP by `TranslateHttpLoader`. User-facing strings are **never** literals — data files store dotted keys (`items.potion.name`, `game.main.roulette.fishing.title`) that templates resolve with the `translate` pipe. Adding a string means adding it to all six files.

**All six files hold an identical key set** (2,196 keys). ngx-translate renders the raw key on a miss, so a key present in code but absent from a locale ships as literal `badges.bug_paldea` text to users. Verify parity after any i18n change:

```bash
node -e "const p=(o,x='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v?p(v,x+k+'.'):[x+k]);const b=p(require('./src/assets/i18n/en.json')).sort();for(const l of ['pt','es','fr','de','it']){const o=p(require('./src/assets/i18n/'+l+'.json')).sort();console.log(l,b.filter(k=>!o.includes(k)).length||o.filter(k=>!b.includes(k)).length?'DIVERGENT':'ok')}"
```

Badge names follow a per-locale house pattern (`Fire Badge` / `Insígnia de Fogo` / `Medalla Fuego` / `Badge Feu` / `Feuer-Orden` / `Medaglia Fuoco`). Type-named badges repeat across generations, so a new one usually copies an existing sibling key's text verbatim rather than needing fresh translation; the `_kalos`/`_galar`/`_paldea` suffix exists only to disambiguate.

## Conventions

- **Unused code fails the build.** `tsconfig.json` sets `noUnusedLocals` and `noUnusedParameters` on top of an already-strict config (`strict`, `strictTemplates`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`). An unused import, private field, local, or constructor injection is a **build error**, not a warning — in specs too. There is deliberately no ESLint; the compiler covers it. Two consequences worth knowing:
  - A constructor param you inject but never read must lose its `private` modifier (or go entirely). `find-item-roulette` shows the pattern: `itemService: ItemsService` with no `private`, used only inside the constructor body.
  - Unused **parameters** are exempt when prefixed with `_`; unused private **properties** are not.
- A component that defines `ngOnInit`/`ngOnDestroy` must declare `implements OnInit, OnDestroy`. Angular calls them by name either way, but without the interface a typo'd hook silently never runs.
- Standalone components with an `imports: [...]` array; no NgModules.
- Constructor injection is the norm; `inject(DestroyRef)` + `takeUntilDestroyed` for subscriptions in newer components, explicit `Subscription` fields + `ngOnDestroy` in older ones.
- Components live in their own folder with `.ts`/`.html`/`.css`/`.spec.ts`. Services live in `services/<name>-service/`, with bulk data in adjacent `*-data.ts` / `*.json` files rather than inside the service.
- Specs use `TestBed.configureTestingModule({ imports: [Component, TranslateModule.forRoot()] })`.
- Two spacing indent, single quotes in TypeScript (`.editorconfig`).
- Static assets go in `public/` (served from the app root, referenced as `./name.mp3`); translation JSON goes in `src/assets/`.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Angular 22 single-page game ("Pokémon Roulette"): a randomized Pokémon run driven by spinning wheels. Standalone components only (no NgModules), Bootstrap 5 + ng-bootstrap for UI/modals, `@ngx-translate` for i18n, deployed to GitHub Pages.

> **A remediation campaign has just landed** on `remediation/thermo-nuclear-audit`
> ([PR #42](https://github.com/zeroxm/pokemon-roulette/pull/42)). Two whole-codebase audits produced
> 46 correctness and 26 maintainability findings; all but one are fixed. The reports are deleted;
> `docs/CHANGELOG.md` is the UAT script and `docs/TASKS.md` the record of what was done — both go
> once UAT passes.
>
> **One finding was deliberately left open** — see *Known accepted risk* below.

## Commands

```bash
npm start                                        # dev server on 0.0.0.0:4200
npm run build                                    # production build -> dist/pokemon-roulette
npm test                                         # Karma/Jasmine, watch mode
npm test -- --watch=false --browsers=ChromeHeadless   # what CI runs
npm test -- --include='**/wheel.component.spec.ts'    # single spec file
npm run deploy                                   # gh-pages, base-href /pokemon-roulette/
```

CI (`.github/workflows/node.js.yml`) runs `npm ci`, `npm audit --omit=dev --audit-level=high`, `npm run build`, and the headless test command on every push/PR to `main`. The audit gate is scoped to production dependencies, but the tree is currently clean either way — **`npm audit` reports 0 vulnerabilities with dev dependencies included**. Keep it that way: the last 7 all arrived through a single package (see *Toolchain* below). There is no lint step; `noUnusedLocals`/`noUnusedParameters` cover that class of problem.

**Green baseline:** build passes, **316/316 tests pass**. Any change must leave both green.

### Local environment gotchas

- **`CHROME_BIN` may need exporting.** Karma finds no `chromium` on some setups; `export CHROME_BIN=/usr/bin/google-chrome-stable` (or your Chrome path) before `npm test`.
- **Node: CI uses 24.x and `.nvmrc` pins 24**, but no version manager is installed, so local runs may be on a different major. A green local build is strong evidence, not proof — check CI.
- **npm 12 blocks 4 install scripts** (`esbuild`, `@parcel/watcher`, `lmdb`, `msgpackr-extract`). Build and tests pass anyway; a toolchain bump may need `npm install-scripts approve`.
- **`ng serve` and Karma cannot substitute for opening the page.** The i18n loader is reached only through DI at runtime; when it is misconfigured it resolves to an empty translation set rather than failing, and the app renders raw keys while every spec passes. `app.config.spec.ts` now guards that one path, but the general lesson holds for anything wired through providers.

### Toolchain — three deliberate pins

Everything is current except three packages, each held back for a reason that will outlive
a casual `npm outdated`:

- **No `@angular-devkit/build-angular`.** The builders come from `@angular/build`
  (`application`, `dev-server`, `karma`). The devkit package exists only to carry the legacy
  webpack stack, which is where all 7 of the last advisories lived
  (`webpack-dev-server` → `sockjs` → `uuid`, `less` → `image-size`). Do not reintroduce it;
  there is no `extract-i18n` target because nothing used it.
- **`jasmine-core` stays on 6.** v7 seals the global test functions, so `zone.js`'s
  `patchJasmine` cannot wrap `describe` and the suite dies at load. `@types/jasmine` has no
  v7 published either. Revisit when zone.js supports it.
- **`typescript` stays on 6.0.** `@angular/compiler-cli` peers `>=6.0 <6.1`; TS 7 waits on Angular.

Angular 22 made two behavioural changes this app opts out of, both intentionally:
`ChangeDetectionStrategy.Eager` is declared on every component because **v22's default is now
OnPush** and this app mutates component fields directly throughout the game loop, and
`provideHttpClient(withXhr())` keeps HttpClient on XHR rather than v22's new fetch default.
Removing either is a real behaviour change, not cleanup.

### Build budgets — read before adding assets or CSS

Configured in `angular.json`: initial bundle **1.55 MB warn / 2 MB error**; per-component stylesheet **9 kB warn / 12 kB error**.

These were raised deliberately. The previous values (1 MB / 4 kB) were breached on every build by the app's actual size, which trains everyone to ignore build warnings. The new thresholds sit just above current reality — initial bundle **1.50 MB**, and `mega-evolution-animation-modal.component.css` at **8.52 kB** — so growth still trips them.

## Architecture

### Game loop: a state stack

`GameStateService` (`src/app/services/game-state-service/`) is the spine. It holds a **stack** of `GameState` strings (see `game-state.ts` for the full union), pre-seeded in `initializeStates()` in reverse play order (`character-select` … 8 gyms … elite four … `game-finish`). Two operations drive everything:

- `setNextState(s)` — push one state to run *next*.
- `setNextStates(a, b, …)` — queue several **in play order**; it does the stack reversal for you.
- `finishCurrentState()` — pop and emit; the emitted value is what the UI renders and is returned.

`GameStateService` also owns `runModifiers` — the rules that span a whole run (evolution credits,
exp-share, running shoes, a stolen Pokémon). They live there rather than on the container because
the container is never destroyed, so a restart would otherwise leave them set.

`RouletteContainerComponent` subscribes to `currentState`; its template is one `@switch` over the
state rendering exactly one roulette per state, with a `@default` arm so an unhandled state fails
loudly instead of blanking the screen. Its handler methods are the transition table. It is ~1050
lines and is where new game flow belongs.

**Selections carry their own continuation.** Both "pick one of these" states —
`select-from-pokemon-list` and `select-from-item-list` — are driven by `PendingSelection<T>`
(`roulette-container/selection/`), which bundles the wheel title, the options, and what to do with
the choice. Queue one with `requestPokemonSelection` / `requestItemSelection`; the continuation
**owns advancing the state machine**, so push any follow-up state *before* calling
`finishCurrentState()`.

Consolation prizes — what the player gets when a branch offers an evolution but nothing can evolve —
are a `Record<EventSource, ConsolationPrize>` table in `roulette-container/consolation/`. Adding an
`EventSource` member without a row is a compile error.

`EventSource` (`src/app/main-game/EventSource.ts`) tags *why* a shared state was entered (e.g. `chooseWhoWillEvolve` fires from gym battles, daycare, rival battles) so the container can pick the right consolation prize when the branch is a dead end.

### Roulettes

Every roulette is a thin standalone component that:
1. builds an array of `WheelItem`s (`text` is a **translation key**, plus `fillStyle`; `weight` is
   optional and defaults to 1),
2. renders `<app-wheel [items]="…" (selectedItemEvent)="…">`,
3. emits the chosen domain object upward to the container.

`WheelComponent` draws the canvas; selection and animation live outside it —
`utils/weighted-random.ts` (`pickWeightedIndex`, with an injectable `random` so boundaries are
testable) and `wheel/spin-animation.ts`. The wheel refuses to spin until translations have resolved
and releases the global `wheelSpinning` gate on any throw; that gate disables most of the UI, so
never latch it without a path that clears it.

Per-generation content lives in sibling data files (`fish-by-generation.ts`,
`gym-leaders-by-generation.ts`, …), keyed by generation id 1–9. **Five pool roulettes — fishing,
fossil, legendary, starter, cave — are one `PokemonPoolRouletteComponent`** driven by
`POKEMON_POOLS`; add a pool by adding a row, not a component. The other 26 roulettes are
deliberately separate: they emit into different typed outputs and collapsing them would trade
compile-time checking for runtime string matching.

Battle roulettes (gym / elite four / champion / rival) extend `BaseBattleRouletteComponent`, which
owns `buildVictoryOdds` — the whole win/lose wheel, parameterised by `outcomeKeyPrefix` and
`baseNoOdds` (the difficulty curve: gym 1, elite four 2, champion 3) — plus retries and X-Attack
modifiers. The retry ladder on a lost spin is **potion → Mimikyu's Disguise → lose**; it lives in the
base class so all three battle types share it, and the Disguise is limited to once per run by
`runModifiers.disguiseUsed` rather than by the Pokémon's own state.

### Domain data

`PokemonItem`, `ItemItem`, `GenerationItem` all extend `WheelItem`, so any domain object can be fed to the wheel directly. The National Dex is a static local table (`services/pokemon-service/national-dex-pokemon.ts`, indexed by id in `PokemonService`); only **sprites** are fetched at runtime from `pokeapi.co` (`getPokemonSprites`, retries 3×). Many item/badge sprites are hot-linked from the PokeAPI sprites GitHub repo.

### Services (all `providedIn: 'root'`, BehaviorSubject-based)

- `TrainerService` — team, PC storage, items, badges. It no longer manipulates forms.
- `FormRuleService` — **every** form change: mega, sticky (Aegislash, Ogerpon), and battle-only
  (Palafin). One `FormRule` table with four axes — scope, persistence, **trigger**, selection. Apply
  is idempotent, revert sweeps storage as well as the team, and revert bookkeeping always clears. Add
  a mechanic by adding a rule, not another code path.
  `trigger` exists because `selection` alone conflated two questions. `battle-start` rules fire from
  `applyAll` when a fight begins; `manual` rules fire **only** from `forceApply`. Mega evolution is
  `manual` — holding the stone decides *which* mega form is available, never that one should happen.
  Applying it from `applyAll` made every eligible Pokémon transform on battle entry just for owning
  the stone, which is exactly the bug the axis prevents.
  Mimikyu's Disguise is the other `manual` rule: a *defeat* fires it, not entering a battle. It is
  `sticky`, so the busted form outlives the fight, and both of its forms carry the same `power` —
  `carryOver` reads `power` from the target, so differing values would move the battle odds.
- `GenerationService` — the selected generation drives nearly all content lookups.
- `ItemsService` / `MegaStoneService` / `RareCandyService` — item catalogs and mid-game item interrupts (rare candy and mega stones bypass the wheel; both are gated on `wheelSpinning`).
- `ModalQueueService` — serializes `NgbModal` opens so chained result modals don't stomp each other. Prefer it over `NgbModal` directly for anything the game flow triggers.
- `SoundFxService` — `playSoundFx('click')`; sounds are named by a `SoundFxName` union, not by per-caller handles. Honors the mute setting.
- `SettingsService` / `ThemeService` — persisted to `localStorage` (`pokemon-roulette-settings`, `pokemon-roulette-theme`).
- `PokedexService`, `BadgesService`, `EvolutionService`, `TypeMatchupService`, `AnalyticsService` (GA id in `src/environments/`).

### i18n

Six locales in `src/assets/i18n/*.json` (en, pt, es, fr, de, it), loaded over HTTP by `TranslateHttpLoader`. User-facing strings are **never** literals — data files store dotted keys (`items.potion.name`, `game.main.roulette.fishing.title`) that templates resolve with the `translate` pipe. Adding a string means adding it to all six files.

**All six files hold an identical key set** (2,207 keys). ngx-translate renders the raw key on a miss, so a key present in code but absent from a locale ships as literal `badges.bug_paldea` text to users. Verify parity after any i18n change:

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
- Specs use `TestBed.configureTestingModule({ imports: [Component], providers: [provideTranslateService()] })`. ngx-translate 18 removed `TranslateModule`; the pipe and directive are standalone.
- Two spacing indent, single quotes in TypeScript (`.editorconfig`).
- Static assets go in `public/` (referenced as `./name.mp3`); translation JSON goes in `src/assets/`.
- Game-flow modals are components under `roulette-container/modals/`, opened through
  `ModalQueueService` and closed with `NgbActiveModal` — not inline `ng-template` + `dismissAll()`.
- `<img>` gets a local placeholder on error automatically in any component that imports
  `ImageFallbackDirective`; import it when adding a component that renders remote images.

## Known accepted risk

**~2,400 sprites are hot-linked from `raw.githubusercontent.com`** — a source-fetch endpoint with
unauthenticated per-IP rate limits, not a CDN — at a moving branch. Failure is now *cosmetic*: every
image falls back to a local placeholder and the one sprite fetcher handles errors. Eliminating it
means pinning to a commit SHA (freezes artwork) or vendoring the sprites (repo size, deploy weight).
That trade-off is open; centralise the base URL first so it is one edit rather than 2,400.

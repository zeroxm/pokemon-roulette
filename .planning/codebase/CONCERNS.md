# Codebase Concerns

**Analysis Date:** 2025-07-15

---

## High Severity

### Subscription Memory Leaks (Multiple Components)

**Issue:** Several Angular components and services subscribe to Observables without storing or unsubscribing from them, leading to memory leaks.

**Files and lines:**

- `src/app/main-game/roulette-container/roulette-container.component.ts:118-136` — three `.subscribe()` calls inside `ngOnInit()` (for `currentState`, `currentRoundObserver`, and `wheelSpinningObserver`) are never stored in a field and are never unsubscribed. Only `rareCandySubscription` at line 140 is properly cleaned up in `ngOnDestroy()`.
- `src/app/main-game/main-game.component.ts:54` — `wheelSpinningObserver.subscribe()` not stored, no `OnDestroy` implemented.
- `src/app/main-game/coffee-button/coffee-button.component.ts:20` — `wheelSpinningObserver.subscribe()` in constructor, not stored, no `OnDestroy`.
- `src/app/main-game/credits-button/credits-button.component.ts:20` — same pattern.
- `src/app/main-game/language-selector/language-selector.component.ts:38` — `onLangChange.subscribe()` not stored.
- `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts:161` — `translate.get().subscribe()` not stored inside an event handler (repeated calls accumulate listeners).
- Same pattern in `champion-battle-roulette.component.ts:160`, `rival-battle-roulette.component.ts:148`, `elite-four-battle-roulette.component.ts:160`.

**Impact:** Every component instance that is created and destroyed (e.g., on route change or game reset) leaks Observable listeners. Since `gameStateService` observables are application-lifetime `BehaviorSubject`s, accumulated listeners fire for every state change.

**Fix approach:** Use Angular 16+ `takeUntilDestroyed(destroyRef)` operator, or store all subscriptions in a `Subscription` array and `unsubscribe()` in `ngOnDestroy()`.

---

### `TrainerService.ngOnDestroy()` Never Called (Service Lifecycle Mismatch)

**Issue:** `TrainerService` (`src/app/services/trainer-service/trainer.service.ts`) defines `ngOnDestroy()` at line 67 and holds a `gameStateSubscription` that it unsubscribes there, but Angular does **not** call `ngOnDestroy()` on root-provided services (which are singletons for the app lifetime). The service also does not `implements OnDestroy` in its class declaration, so TypeScript gives no compile-time guarantee either.

**Impact:** Dead code that creates a false sense of safety. If this service were ever scoped to a component or lazy-loaded module, the cleanup would be missing at compile-time type-check level.

**Fix approach:** Either remove `ngOnDestroy()` (as it is never invoked for a root singleton) or add `implements OnDestroy` to the class signature and ensure the code path is actually reachable.

---

### Hardcoded Google Analytics Tracking ID in Source HTML

**Issue:** `src/index.html:11` embeds the production GA4 measurement ID (`G-40CS5XD7G9`) directly in the committed HTML file. Combined with `src/app/services/analytics-service/analytics.service.ts:3` using `declare var gtag: any`, this means analytics fires unconditionally including in local development and CI environments.

**Impact:** Developer activity pollutes production analytics data. Tracking ID is public in source control.

**Fix approach:** Move the GA snippet to an environment-specific configuration; guard `gtag` calls behind an environment flag; or use Angular's `environment.ts` to conditionally inject the script.

---

### Missing Translation Key (Trailing Space Bug)

**Issue:** `src/app/main-game/roulette-container/roulette-container.component.ts:545` calls:
```typescript
this.translateService.instant('game.main.roulette.teamrocket.saved.title ')
```
The key has a **trailing space**. In `src/assets/i18n/en.json` the actual key is `"title "` (with trailing space), so it technically resolves, but this is fragile and will silently return the raw key string in any translation file that doesn't replicate the typo. All six locale JSON files contain this space, so the bug is masked.

**Impact:** Any new locale file that doesn't copy the space will render the raw key to users instead of the translated string.

**Fix approach:** Remove the trailing space from the key in both the component call (`roulette-container.component.ts:545`) and all six locale JSON files under `src/assets/i18n/`.

---

## Medium Severity

### `@ts-ignore` Suppressing Type Errors for `dom-to-image-more`

**Issue:** Both `src/app/main-game/end-game/end-game.component.ts:11` and `src/app/main-game/game-over/game-over.component.ts:9` use `// @ts-ignore` to suppress a TypeScript error when importing `dom-to-image-more`:
```typescript
// @ts-ignore
import domtoimage from 'dom-to-image-more'
```

**Impact:** Type safety is lost for the entire `domtoimage` API surface. Runtime errors in the image-capture flow will not be caught at compile time. The `catch` blocks at `end-game.component.ts:134` and `game-over.component.ts:139` only log via `console.error` — no user-visible fallback is shown if capture fails.

**Fix approach:** Add a `@types/dom-to-image-more` package or write a local type declaration file (`dom-to-image-more.d.ts`) to enable proper typing and remove the suppression.

---

### `PokemonService.getPokemonSprites()` Uses `http.get<any>()` Without Type

**Issue:** `src/app/services/pokemon-service/pokemon.service.ts:24`:
```typescript
return this.http.get<any>(url).pipe(...)
```
The PokéAPI response is typed as `any`, and fields are accessed via `response.sprites.other['official-artwork']` without any runtime validation.

**Impact:** Any PokéAPI breaking change or unexpected response shape causes a silent `undefined` sprite, not a typed compile-time error.

**Fix approach:** Define an interface matching the relevant PokeAPI `/pokemon/{id}` response shape and replace `<any>` with that interface.

---

### Language Persistence Duplicated Across Three Files

**Issue:** `localStorage.setItem('language', ...)` and `localStorage.getItem('language')` are spread across:
- `src/app/app.component.ts:16,24`
- `src/app/main-game/language-selector/language-selector.component.ts:46`

The `AppComponent.changeLang()` method (line 24) appears to be a dead function — the language is now changed through `LanguageSelectorComponent`. This means language persistence logic exists in two places with no shared service abstraction, and the `AppComponent` method is unreachable from the template.

**Impact:** Future language key changes must be updated in multiple places. Dead code creates confusion.

**Fix approach:** Extract language persistence into a dedicated `LanguageService` (similar to how `SettingsService` handles settings), and remove the dead `changeLang()` method from `AppComponent`.

---

### `RouletteContainerComponent` is a God Component (809 lines)

**Issue:** `src/app/main-game/roulette-container/roulette-container.component.ts` is 809 lines and imports 30+ child roulette components directly. It acts as a central event dispatcher/state router — receiving events from all child roulettes and orchestrating game progression.

**Impact:** High cognitive complexity, difficult to test in isolation, and changes to any roulette flow touch the same file. The component's `ngOnInit()` already mixes subscription setup, game-state wiring, and business logic.

**Fix approach:** Extract the event-handling dispatch logic into a dedicated `GameFlowService` or use a state machine pattern. Child roulette communication should go through a service rather than requiring `RouletteContainerComponent` to know every event type.

---

### `TrainerService` Holds Mutable Public Arrays (No Encapsulation)

**Issue:** In `src/app/services/trainer-service/trainer.service.ts`:
```typescript
trainerTeam: PokemonItem[] = [];
storedPokemon: PokemonItem[] = [];
trainerItems: ItemItem[] = [...];
trainerBadges: Badge[] = [];
```
These are `public` (by default) mutable arrays. Any component can mutate them directly, bypassing the `BehaviorSubject` observables and breaking reactive state.

**Impact:** State can become silently inconsistent if any consumer directly pushes or splices these arrays. This is particularly risky given that multiple roulette components read this service.

**Fix approach:** Mark all raw arrays `private readonly`, expose only immutable getters or Observable streams, and route all mutations through dedicated methods.

---

### `console.log` in Production Code Path

**Issue:** `src/app/coffee/coffee.component.ts:27` uses `console.log('Pix code copied to clipboard')` in a user-facing action. This is a debug log left in shipping code.

**Impact:** Minor — leaks implementation detail to browser console.

**Fix approach:** Remove the `console.log` call. User feedback is already handled via the `pixCodeCopied` boolean flag.

---

### Untyped `gtag` Global via `declare var gtag: any`

**Issue:** `src/app/services/analytics-service/analytics.service.ts:3` uses `declare var gtag: any`, giving zero type safety for all analytics calls. If `gtag` is not loaded (e.g., ad blocker, offline), the call will throw a runtime `ReferenceError` with no error boundary.

**Impact:** Unhandled runtime errors whenever analytics script fails to load.

**Fix approach:** Wrap `gtag` calls in a `try/catch` or check `typeof gtag !== 'undefined'` before calling. Consider using a typed `gtag.js` type package.

---

### Hardcoded Pokémon ID as Class Field (Magic Number)

**Issue:** `src/app/main-game/roulette-container/roulette-container.component.ts:95`:
```typescript
NINCADA_ID = 290;
```
While named, this magic Pokémon ID is defined as a component class field rather than in a shared constants file. Other Pokémon IDs used in data files have no symbolic names at all.

**Impact:** If the logic for Nincada ever needs reuse, the ID must be duplicated. No discoverability.

**Fix approach:** Move to a shared `pokemon-ids.const.ts` constants file and import where needed.

---

### Sprite URLs Scattered Inline Across Data Files

**Issue:** Hundreds of hardcoded `raw.githubusercontent.com` and `zeroxm/pokemon-roulette-trainer-sprites` GitHub raw URLs are embedded directly in data files:
- `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts` (623 lines, dozens of URLs)
- `src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/rival-battle-roulette/rival-by-generation.ts`
- `src/app/main-game/roulette-container/roulette-container.component.ts:243-293` (inline item sprite URLs)
- `src/app/services/pokedex-service/pokedex.service.ts:87` (sprite URL construction via template literal)

GitHub raw CDN is not a production-grade image host and can throttle or change URLs.

**Impact:** Any GitHub outage, repo restructuring, or CDN policy change breaks all trainer/champion/rival/item sprites. No fallback exists.

**Fix approach:** Bundle sprites as local assets in `src/assets/`, or use a proper CDN with versioned URL constants defined in one location.

---

## Low Severity

### `restart-game-buttom` Typo in Directory and Selector Names

**Issue:** The directory `src/app/restart-game-buttom/` and selector `app-restart-game-buttom` contain a misspelling ("buttom" instead of "button"). This propagates through all files in the directory:
- `src/app/restart-game-buttom/restart-game-buttom.component.ts`
- `src/app/restart-game-buttom/restart-game-buttom.component.spec.ts`
- `src/app/main-game/main-game.component.html:12`
- `src/app/main-game/game-over/game-over.component.html:63`

**Impact:** Low functional impact; primarily a readability and onboarding concern.

**Fix approach:** Rename directory, files, selector, and all import paths in a single refactor commit.

---

### TODO Comments Indicate Temporary Migration Code Still Present

**Issue:** `src/app/services/pokedex-service/pokedex.service.ts` contains two `TODO(next-task cleanup)` comments at lines 43 and 121 referencing a "shiny consistency pipeline" and "legacy shiny records migration" that were supposed to be temporary:
```
// TODO(next-task cleanup): remove this temporary shiny propagation bridge once the
// TODO(next-task cleanup): remove this temporary migration once legacy shiny records
```

**Impact:** Migration code running on every `markSeen()` call and every `localStorage` load adds complexity and BFS traversal cost proportional to evolution chain depth.

**Fix approach:** Remove migration code once the next-task shiny pipeline is confirmed shipped and legacy data is no longer in circulation.

---

### Shallow/Boilerplate Tests Cover Many Components

**Issue:** 13 out of ~175 test cases are `should be created` boilerplate assertions (just `expect(component).toBeTruthy()`). Several spec files for complex components have no meaningful behavioral tests:
- `src/app/services/analytics-service/analytics.service.spec.ts` — only `should be created`
- Most roulette component specs test only construction and basic event emission

**Impact:** High-value business logic (game state transitions, Pokémon team management, shiny propagation) has coverage but roulette flow integration is largely untested. Regressions in event-wiring are likely to be missed.

**Fix approach:** Add behavioral tests for `RouletteContainerComponent`'s event dispatch logic and for `TrainerService`'s team management (swap-to-PC, form-change, evolution) flows.

---

### `loadPokemonSpriteIfMissing` Has No Error Handler on Subscribe

**Issue:** `src/app/services/trainer-service/trainer.service.ts:332`:
```typescript
this.pokemonService.getPokemonSprites(pokemon.pokemonId).subscribe(response => {
  pokemon.sprite = response.sprite;
});
```
No error callback is provided. If `getPokemonSprites` throws after exhausting 3 retries (handled upstream in `pokemon.service.ts:32`), the observable re-throws via `throwError()`, which causes an unhandled error to surface here.

**Impact:** Pokémon sprite fails silently in the UI (no sprite shown) but an unhandled error is emitted to the Observable chain.

**Fix approach:** Add an error callback: `.subscribe({ next: ..., error: (e) => { /* leave sprite null */ } })`.

---

### `national-dex-pokemon.ts` is a 14,353-line Static Data File

**Issue:** `src/app/services/pokemon-service/national-dex-pokemon.ts` is a single TypeScript file with 14,353 lines of inline static data. It is imported eagerly into `PokemonService` and therefore included in the main bundle.

**Impact:** Increases initial bundle size. Tree-shaking cannot eliminate individual Pokémon entries since they are in a single exported array.

**Fix approach:** Convert to a JSON asset loaded lazily via `HttpClient`, or split into generation-specific modules that are loaded on demand.

---

### No Content Security Policy (CSP) in `index.html`

**Issue:** `src/index.html` has no `<meta http-equiv="Content-Security-Policy">` header. The page loads inline scripts (Google Analytics `gtag` bootstrap code), external scripts from `googletagmanager.com`, and images from `raw.githubusercontent.com` with no policy restricting these sources.

**Impact:** No XSS mitigation layer. Particularly relevant since the app processes user-selected game data and external sprites.

**Fix approach:** Add a CSP meta tag (or configure it at the hosting/CDN layer) that whitelists `googletagmanager.com`, `raw.githubusercontent.com`, and `pokeapi.co`.

---

*Concerns audit: 2025-07-15*

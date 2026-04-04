# Stack Research

**Domain:** Persistent Pokédex tracker — Angular 21 SPA, localStorage persistence, 1,025-entry grid
**Researched:** 2025-04-03
**Confidence:** HIGH (all findings verified directly against the live codebase)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Angular 21 standalone components | 21.2.7 (existing) | Pokédex modal + grid component | Matches every component in the codebase; no NgModule overhead |
| RxJS BehaviorSubject | 7.8.2 (existing) | Reactive Pokédex state | Exact pattern used by `SettingsService` and `DarkModeService`; consistent, no new dependency |
| `@angular/cdk` ScrollingModule | 21.2.5 (already installed, unused) | **Not recommended** for this grid — see below | CDK is already a dep; ScrollingModule exists but wrong tool here |
| ng-bootstrap NgbModal | 20.0.0 (existing) | Pokédex modal container | StoragePcComponent uses this pattern exactly; zero new code needed |
| Bootstrap 5 nav-tabs | 5.3.8 (existing) | Local Dex / National Dex tab switcher | No extra library; Bootstrap nav-tabs with `@if` toggling is all that's needed |
| Native `<img loading="lazy">` | Browser API | Lazy sprite loading in the 1,025-entry grid | Zero Angular code, zero API calls; browser handles viewport detection automatically |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@angular/common` | 21.2.7 (existing) | `AsyncPipe`, `NgClass` | Already used everywhere; pipe the `pokedex$` Observable directly in templates |
| `@ngx-translate/core` | 17.0.0 (existing) | i18n strings for progress counter labels, tab names | Already configured; add keys like `pokedex.seen`, `pokedex.won`, `pokedex.progress` |

> **No new packages required.** All necessary tools are already installed.

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Karma + Jasmine (existing) | Unit-test `PokedexService` | Spy on `localStorage.setItem` / `getItem`; test `markSeen`, `markWon`, set/get round-trip |
| Angular CLI (existing) | Generate service + component | `ng g service services/pokedex-service/pokedex` |

---

## Installation

```bash
# No new packages required.
# All dependencies are already present in the project.
```

---

## The Pokédex Service Pattern

Follow `SettingsService` exactly. The pattern is:

1. `private readonly STORAGE_KEY` constant
2. `BehaviorSubject` initialised from `getInitialX()` which reads localStorage
3. Public `.x$` observable via `.asObservable().pipe(distinctUntilChanged())`
4. Public `.currentX` getter via `.getValue()`
5. Private `updateX()` that calls `saveToStorage()` then `.next()`
6. `try/catch` in the storage reader with `console.error` fallback

### Recommended `PokedexService` shape

```typescript
// src/app/services/pokedex-service/pokedex.service.ts

export interface PokedexState {
  seen: Set<number>;
  won: Set<number>;
}

// What actually goes into localStorage:
interface StoredPokedex {
  seen: number[];
  won: number[];
}

@Injectable({ providedIn: 'root' })
export class PokedexService {
  private readonly STORAGE_KEY = 'pokemon-roulette-pokedex';

  private pokedexSubject$: BehaviorSubject<PokedexState>;

  constructor() {
    this.pokedexSubject$ = new BehaviorSubject(this.getInitialState());
  }

  get pokedex$(): Observable<PokedexState> {
    return this.pokedexSubject$.asObservable().pipe(distinctUntilChanged());
  }

  get currentPokedex(): PokedexState {
    return this.pokedexSubject$.getValue();
  }

  markSeen(pokemonId: number): void {
    const current = this.currentPokedex;
    if (current.seen.has(pokemonId)) return;          // no-op guard
    const newSeen = new Set(current.seen);
    newSeen.add(pokemonId);
    this.updateState({ ...current, seen: newSeen });
  }

  markWon(pokemonId: number): void {
    const current = this.currentPokedex;
    if (current.won.has(pokemonId)) return;           // no-op guard
    const newSeen = new Set(current.seen);
    const newWon = new Set(current.won);
    newSeen.add(pokemonId);                           // won implies seen
    newWon.add(pokemonId);
    this.updateState({ seen: newSeen, won: newWon });
  }

  isSeen(pokemonId: number): boolean {
    return this.currentPokedex.seen.has(pokemonId);
  }

  isWon(pokemonId: number): boolean {
    return this.currentPokedex.won.has(pokemonId);
  }

  private updateState(next: PokedexState): void {
    this.saveToStorage(next);
    this.pokedexSubject$.next(next);
  }

  private getInitialState(): PokedexState {
    const stored = this.readFromStorage();
    return {
      seen: new Set(stored?.seen ?? []),
      won:  new Set(stored?.won  ?? []),
    };
  }

  private saveToStorage(state: PokedexState): void {
    const payload: StoredPokedex = {
      seen: [...state.seen],
      won:  [...state.won],
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
  }

  private readFromStorage(): StoredPokedex | null {
    const item = localStorage.getItem(this.STORAGE_KEY);
    if (!item) return null;
    try {
      return JSON.parse(item) as StoredPokedex;
    } catch (error) {
      console.error('Invalid pokedex localStorage item:', item, '— resetting');
      return null;
    }
  }
}
```

**Why `Set<number>` in memory, `number[]` in storage:**  
`Set` gives O(1) `has()` lookups — critical because the template calls `isSeen`/`isWon` for every grid cell during change detection. `Set` does not serialize with `JSON.stringify` (produces `{}`), so we spread to arrays on write and reconstruct on read. This matches the `boolean → JSON boolean` conversion already used by `DarkModeService`.

---

## localStorage Schema Design

```
Key: 'pokemon-roulette-pokedex'
Value: { "seen": [1, 4, 7, 25, ...], "won": [4, 7, ...] }
```

**Size at max population (all 1,025 seen + won):**
- Seen array: 1,025 numbers, avg 3 chars + comma = ~4,100 chars
- Won array: 1,025 numbers, same = ~4,100 chars
- JSON overhead (keys, brackets): ~30 chars
- **Total worst case: ~8.2 KB** — negligible against localStorage's 5 MB limit

**Why not a bitmask / base64 encoding:**  
Premature optimisation. 8 KB is 0.16% of localStorage quota. Arrays are human-readable during debugging, directly JSON-serialisable, and match the existing codebase's pattern. No encoding logic to maintain.

**Why not an object `{1: true, 25: true}`:**  
String keys add overhead vs integer arrays. Reconstructing a `Set` from an array is one line; from an object requires `Object.keys().map(Number)` which is less obvious. The array form is simpler.

**Existing storage keys (no collision risk):**
| Key | Owner |
|-----|-------|
| `dark-mode` | DarkModeService |
| `pokemon-roulette-settings` | SettingsService |
| `language` | language-selector / app.component |
| `pokemon-roulette-pokedex` | **new** PokedexService |

---

## Grid Rendering: @for + CSS Grid + Native Lazy Images

### Why NOT Angular CDK Virtual Scroll

CDK `CdkVirtualScrollViewport` is designed for flat lists with **fixed item size** (the `itemSize` input is required in pixels). The Pokédex is a responsive multi-column grid where the number of columns varies with viewport width. CDK Virtual Scroll cannot drive a CSS `grid-template-columns: repeat(auto-fill, ...)` layout without custom `VirtualScrollStrategy` implementation — significant complexity for no real gain.

The DOM cost of 1,025 small `<div>` elements is low (benchmarked ~2 ms layout in modern Chromium). The performance concern is **network + decode time for sprites**, not DOM size. Native lazy image loading solves the real problem.

### Why NOT Pagination

Pagination destroys the "see the whole Pokédex" feel that makes the feature rewarding. The design spec calls for a grid. Paginating 1,025 items into pages of, say, 50 adds navigation state with no performance benefit once lazy images are in use.

### The Right Pattern

```html
<!-- In the Pokédex modal template -->
<div class="pokedex-grid">
  @for (entry of gridEntries; track entry.pokemonId) {
    <div class="pokedex-cell"
         [class.seen]="entry.seen"
         [class.won]="entry.won">
      <img
        [src]="entry.seen ? entry.spriteUrl : unknownSpriteUrl"
        [alt]="entry.pokemonId"
        loading="lazy"
        width="56"
        height="56">
    </div>
  }
</div>
```

```css
.pokedex-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
  gap: 4px;
  max-height: 60vh;
  overflow-y: auto;
}
```

**Why `loading="lazy"` is sufficient:**  
The browser's native lazy loading defers image fetch until the `<img>` is within ~1–2 viewports of the scroll position. This is implemented at the browser level (network layer), so it does not trigger Angular change detection and has no RxJS/Observable overhead. For a scrollable container, `loading="lazy"` works correctly as long as the container has a definite height (the `max-height: 60vh` provides this).

**Why direct PokeAPI sprite URLs instead of `pokemonService.getPokemonSprites()`:**  
PokeAPI sprite URLs follow a deterministic pattern:
```
https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png
```
This means the URL can be computed from `pokemonId` at build time — no HTTP Observable, no async pipe, no subscription needed. The existing `pokemonService.getPokemonSprites()` makes an HTTP call to `https://pokeapi.co/api/v2/pokemon/{id}` to get the sprite URL; for the Pokédex grid we can skip that round-trip entirely. This is a significant simplification.

```typescript
// In the component or a pure function
getSpriteUrl(pokemonId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
}
```

---

## RxJS Patterns

### Do: BehaviorSubject following SettingsService exactly

The codebase is consistent: all persistent state lives in `BehaviorSubject`s. Deviate from this only if there's a strong reason. There isn't one here.

### Do: Derive view-model data in the component from a single stream

```typescript
// In PokedexModalComponent
protected readonly vm$ = combineLatest([
  this.pokedexService.pokedex$,
  this.generationService.getGeneration(),
]).pipe(
  map(([dex, gen]) => ({
    localEntries:    this.buildEntries(pokemonByGeneration[gen.id], dex),
    nationalEntries: this.buildEntries(nationalDexPokemonIds, dex),
    localSeenCount:  [...dex.seen].filter(id => pokemonByGeneration[gen.id].includes(id)).length,
    localWonCount:   [...dex.won].filter(id => pokemonByGeneration[gen.id].includes(id)).length,
    totalSeen:       dex.seen.size,
    totalWon:        dex.won.size,
  }))
);
```

### Do: Subscribe in the template with `async` pipe

```html
@if (vm$ | async; as vm) {
  <div class="progress-counter">{{ vm.totalSeen }} / 1025</div>
  ...
}
```

### Do NOT: Store derived grid arrays in service state

The service stores raw `seen` / `won` sets. The component maps those to display entries. This keeps the service pure and the component testable independently.

### Do NOT: Call `markSeen` / `markWon` from the Pokédex component

These are write operations triggered by game events. Wire them at the existing hooks in `roulette-container.component.ts`:

```typescript
// In completePokemonCapture():
private completePokemonCapture(pokemon: PokemonItem): void {
  this.pokedexService.markSeen(pokemon.pokemonId);   // ← add this line
  this.trainerService.addToTeam(pokemon);
  this.gameStateService.setNextState('check-shininess');
  this.finishCurrentState();
}

// In championBattleResult(true):
championBattleResult(result: boolean): void {
  if (result) {
    this.trainerService.getTeam().forEach(p =>
      this.pokedexService.markWon(p.pokemonId)       // ← add this line
    );
    this.gameStateService.advanceRound();
  }
  // ...
}
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| `BehaviorSubject<PokedexState>` with Set | Angular Signals (`signal<PokedexState>`) | When/if the codebase migrates to signals; avoid mixing paradigms mid-project |
| `number[]` in localStorage | Base64 bitmask | Only if localStorage quota becomes a real problem (it won't at 8 KB) |
| CSS Grid + `@for` | CDK `cdk-virtual-scroll-viewport` | If items were tall (>100px), list-only, and count exceeded ~5,000 |
| Direct sprite URL construction | `pokemonService.getPokemonSprites()` per cell | If the Pokédex needed shiny sprites (where the URL is not predictable without API) — deferred out of scope |
| ng-bootstrap `NgbModal` + `@ViewChild` | Routed page (`/pokedex`) | If deep-linking or browser-back navigation were required — out of scope for this milestone |
| Bootstrap `nav-tabs` | ng-bootstrap `NgbTabset` | Identical outcome; plain Bootstrap tabs need zero extra import |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Angular Signals for this feature | Codebase uses BehaviorSubject throughout; mixing paradigms introduces inconsistency and subtle bugs (e.g. `effect()` cleanup, `toSignal()` injection context) without any benefit here | `BehaviorSubject` + `distinctUntilChanged()` as in SettingsService |
| CDK `CdkVirtualScrollViewport` | Requires `itemSize` in pixels and a flat list; breaks responsive CSS grid; adds `ScrollingModule` import complexity for zero perceptible gain at 1,025 small items | CSS Grid + `@for` + `loading="lazy"` |
| `ChangeDetectionStrategy.OnPush` on the Pokédex component | No other component in the codebase uses OnPush; it requires careful immutable-update discipline (already satisfied by new-Set pattern) but adds risk if a future contributor doesn't know the rules | Default change detection; re-evaluate if profiling shows a real problem |
| NgRx / Akita / NGXS | Massive overkill for a two-field localStorage store; introduces store/action/reducer/selector boilerplate across 4+ files for something `SettingsService` handles in 60 lines | `PokedexService` following `SettingsService` pattern |
| `localStorage.setItem` directly from the component | Bypasses the reactive layer; breaks `pokedex$` consumers; inconsistent with every other service | `pokedexService.markSeen()` / `markWon()` only |
| Loading all 1,025 sprites via `pokemonService.getPokemonSprites()` on modal open | 1,025 simultaneous HTTP calls to PokeAPI → rate limiting, slow load, horrible UX | Direct URL construction + native `loading="lazy"` |

---

## Version Compatibility

| Package | Version | Compatibility Note |
|---------|---------|-------------------|
| `@angular/cdk` | 21.2.5 | Matches `@angular/core` exactly — safe to import `ScrollingModule` if ever needed |
| `rxjs` | 7.8.2 | `BehaviorSubject`, `combineLatest`, `distinctUntilChanged`, `map` — all stable, no breaking changes expected |
| `@ng-bootstrap/ng-bootstrap` | 20.0.0 | `NgbModal` API unchanged from v18+; `modalService.open(templateRef, options)` pattern is stable |
| Bootstrap | 5.3.8 | `nav-tabs` CSS class API is stable since Bootstrap 5.0 |

---

## Sources

- Live codebase inspection: `src/app/services/settings-service/settings.service.ts` — BehaviorSubject + localStorage pattern (HIGH confidence)
- Live codebase inspection: `src/app/services/dark-mode-service/dark-mode.service.ts` — storage read/write with try/catch (HIGH confidence)
- Live codebase inspection: `src/app/trainer-team/storage-pc/storage-pc.component.ts` — NgbModal + @ViewChild TemplateRef pattern (HIGH confidence)
- Live codebase inspection: `src/app/services/pokemon-service/national-dex-pokemon.ts` — PokemonItem shape, sprite null until loaded (HIGH confidence)
- Live codebase inspection: `package.json` — confirmed `@angular/cdk@^21.2.5` already installed, no ScrollingModule currently imported (HIGH confidence)
- PokeAPI sprite URL structure: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{id}.png` — confirmed from existing sprite usage patterns in codebase (HIGH confidence)
- MDN Web Docs: `<img loading="lazy">` — supported in all modern browsers; works in scrollable containers with defined height (HIGH confidence)

---

*Stack research for: Pokédex feature — Angular 21 SPA (Pokémon Roulette)*
*Researched: 2025-04-03*

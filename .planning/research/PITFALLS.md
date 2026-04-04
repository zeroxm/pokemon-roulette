# Pitfalls Research

**Domain:** Angular 21 large-grid Pokédex with lazy PokeAPI sprite loading and localStorage persistence
**Researched:** 2025-01-31
**Confidence:** HIGH — grounded in direct codebase analysis (CONCERNS.md, existing services, PokemonItem interface) and well-documented Angular/browser patterns

---

## Critical Pitfalls

### Pitfall 1: Storing Full PokemonItem Objects in localStorage

**What goes wrong:**
Developer follows the simplest path: serialize the full `PokemonItem[]` array to localStorage. Each `PokemonItem` contains a `sprite` field with two URL strings (~150 chars each), a `text` translation key, `fillStyle`, `power`, `weight`, etc. With 1,025 entries × ~350 chars = **~360KB per array** before accounting for two arrays (seen + won). Compounded with existing keys (`pokemon-roulette-settings`, dark mode), the cumulative size approaches browser limits (5MB nominal, often lower in practice on mobile WebKit). Writes throw silent `QuotaExceededError` and the Pokédex data is never actually saved.

**Why it happens:**
The `TrainerService` already deals in `PokemonItem[]` arrays; it's natural to reuse the same type for persistence. The existing localStorage services (`SettingsService`, `DarkModeService`) are small and never hit size limits, creating false confidence.

**How to avoid:**
Store **only IDs**. The Pokédex service should persist `{ seen: number[], won: number[] }` — nothing else. At worst-case 1,025 IDs: `[1,2,...,1025]` ≈ 4KB per array → **~8KB total**. Re-hydrate to `PokemonItem` objects using `pokemonService.getPokemonById()` at read time. Never write sprite URLs, translation keys, or full PokemonItem shapes to localStorage.

**Warning signs:**
- Pokédex data fails to persist after browser close with no console error (the `QuotaExceededError` is swallowed by the existing `catch (error) { console.error(...) }` pattern in SettingsService — Pokédex service will likely copy that pattern and also swallow it silently)
- localStorage inspection in DevTools shows entries over 50KB
- Safari mobile silently discards the Pokédex entirely on first save (WebKit's 5MB limit is more aggressively enforced)

**Phase to address:**
Pokédex Service implementation phase (data persistence design) — define the storage schema before writing any code.

---

### Pitfall 2: Eager-Loading All 1,025 Sprites on Modal Open

**What goes wrong:**
The Pokédex modal renders all 1,025 grid cells and triggers `pokemonService.getPokemonSprites(id)` for each on mount. Browsers cap concurrent HTTP connections to the same origin (Chrome: 6 per host, HTTP/1.1; HTTP/2 multiplexes but PokeAPI may still rate-limit). Result: 1,025 queued requests, the modal is visually frozen for 10–30 seconds, and PokeAPI starts returning 429/503 responses. The existing `retry({ count: 3, delay: 1000 })` in `PokemonService` then multiplies requests to up to 3,075 total.

**Why it happens:**
Standard Angular pattern is to bind an Observable to the template with `| async`. If that call is made in `*ngFor` or in each child component's `ngOnInit`, every item fetches immediately.

**How to avoid:**
Two-layer strategy:
1. **Only load sprites for _seen_ Pokémon** — unseen entries show the unknown silhouette PNG from assets (bundled locally, not fetched from GitHub raw). This cuts 90%+ of requests for new players.
2. **Intersection Observer for visible sprites** — for _seen_ Pokémon not yet in the current viewport, defer fetch until the card scrolls into view. Angular CDK's `cdkObserveContent` or a custom `IntersectionObserver` directive works well. `shareReplay(1)` on the Observable prevents duplicate fetches.

**Warning signs:**
- Network tab in DevTools shows hundreds of pending requests immediately after opening modal
- Browser console shows 429 errors from `pokeapi.co`
- Modal takes >2 seconds to become interactive on first open

**Phase to address:**
Pokédex Grid component implementation phase — Intersection Observer loading must be part of the initial design, not retrofitted.

---

### Pitfall 3: Subscription Leaks in the Pokédex Grid Component

**What goes wrong:**
This codebase already has documented subscription leak issues (CONCERNS.md). The Pokédex grid introduces a new, amplified version: if each of the 1,025 cell components (or directives) subscribes to a sprite Observable without cleanup, opening/closing the modal multiple times accumulates thousands of dangling subscriptions. The sprite fetch includes `retry({ count: 3, delay: 1000 })` — those delayed retry timers continue firing for destroyed components.

**Why it happens:**
The existing `*ngFor` pattern in templates may instantiate child components that each call `getPokemonSprites()` in `ngOnInit`. Developers focused on getting the feature working skip `ngOnDestroy`. The bug is invisible in single-session testing.

**How to avoid:**
Follow the `StoragePcComponent` pattern exactly: use a single `private readonly subscriptions = new Subscription()` container, add each subscription via `this.subscriptions.add(...)`, and call `this.subscriptions.unsubscribe()` in `ngOnDestroy`. For Angular 16+ signal context, prefer `takeUntilDestroyed(this.destroyRef)`. For cell-level components (if used), ensure `OnDestroy` is implemented — or use the `| async` pipe (auto-unsubscribes) wherever possible. Avoid `subscribe()` in template-driven child components entirely; pass resolved data down as `@Input()`.

**Warning signs:**
- Browser memory usage climbs each time the Pokédex modal is opened and closed
- Console shows errors from `getPokemonSprites` after modal is dismissed
- `CONCERNS.md` pattern repeats: component implements `OnInit` but not `OnDestroy`

**Phase to address:**
Pokédex Service + Grid implementation phases — subscription cleanup is a first-class requirement, not an afterthought. Code review checklist should verify `ngOnDestroy` exists on every component that subscribes.

---

### Pitfall 4: Pokédex Data Coupled to TrainerService or Game Reset

**What goes wrong:**
The Pokédex marks Pokémon as "seen" at team assignment time (inside `completePokemonCapture`) and as "won" at Champion defeat (inside `championBattleResult`). If the Pokédex state is stored in `TrainerService` or linked to `trainerTeam`/`storedPokemon` arrays, a call to `trainerService.resetTeam()` silently wipes Pokédex history. PROJECT.md explicitly states the Pokédex is cumulative and must survive run resets.

**Why it happens:**
`TrainerService` is the natural home for Pokémon-related state. It's injectable everywhere and already has team mutation methods. Developers may add `seenPokemon: Set<number>` directly to the service without creating an independent boundary.

**How to avoid:**
Pokédex state must live in a dedicated `PokedexService` with its own localStorage key (e.g., `pokemon-roulette-pokedex`). `TrainerService` should call `pokedexService.markSeen(pokemon.pokemonId)` and `pokedexService.markWon(ids)` — one-way pushes only. `PokedexService` must have zero coupling back to `TrainerService`. Never store `Set<PokemonItem>` — store `Set<number>` (IDs).

**Warning signs:**
- `PokedexService` injects `TrainerService` (dependency inversion smell)
- `resetTeam()` in `TrainerService` touches any Pokédex-related field
- Pokédex clears after starting a new game run

**Phase to address:**
Pokédex Service design phase — isolation is an architectural constraint, not an implementation detail.

---

### Pitfall 5: Uncaught `QuotaExceededError` Silently Losing Pokédex Saves

**What goes wrong:**
The existing `SettingsService` and `DarkModeService` wrap localStorage reads in try/catch but localStorage **writes** are unguarded. The Pokédex service will likely copy this pattern. `localStorage.setItem()` throws `QuotaExceededError` when storage is full — if unhandled, the write silently fails and the user's Pokédex progress is lost with no feedback.

**Why it happens:**
The existing pattern (`catch` on `JSON.parse`) guards against corrupt reads, not failed writes. Developers extending the pattern may not notice writes need their own guard.

**How to avoid:**
Wrap ALL `localStorage.setItem()` calls in try/catch:
```typescript
private savePokedexToStorage(data: PokedexStorage): void {
  try {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Pokédex: localStorage write failed (quota exceeded?)', error);
    // Optional: notify user via a toast/alert that progress cannot be saved
  }
}
```
Also: storing only ID arrays (Pitfall 1 prevention) makes quota errors practically impossible.

**Warning signs:**
- `localStorage.setItem` is called without a try/catch
- Progress is lost after extended play sessions (storage accumulated over time)
- No write guards visible in the service's `saveToStorage` method

**Phase to address:**
Pokédex Service implementation phase — must be part of the service's write method from the start.

---

### Pitfall 6: Unknown Silhouette Loaded from External GitHub URL

**What goes wrong:**
PROJECT.md references the unknown sprite at `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png`. CONCERNS.md already flags 241+ hardcoded external URLs as a reliability and maintenance risk. If that GitHub URL changes (branch rename, repo restructure) or if GitHub raw content is rate-limited, ALL unseen Pokémon show broken images simultaneously — the most visible possible failure state for a Pokédex.

**Why it happens:**
The URL is provided directly in the spec, and using it is the path of least resistance. The existing codebase does this everywhere, normalizing the practice.

**How to avoid:**
Bundle the unknown silhouette as a local asset (`/assets/sprites/unknown.png`). It's a single small PNG. This eliminates the network dependency for the grid's default state entirely. The asset can be committed to the repo and referenced via `assets/sprites/unknown.png` in `angular.json`.

**Warning signs:**
- Unknown silhouette is referenced via an `https://raw.githubusercontent.com` URL in the component
- No local fallback asset in `/public` or `/src/assets`

**Phase to address:**
Pokédex Grid component phase — asset must be bundled before the component is built.

---

### Pitfall 7: Change Detection Flooding the 1,025-Item Grid

**What goes wrong:**
With default `ChangeDetectionStrategy.Default`, Angular re-evaluates every binding in the Pokédex grid on any event (mouse moves, scroll events, subscription emissions). A grid with 1,025 cells, each with multiple bindings (class conditions for seen/won state, sprite src, silhouette toggle), causes significant CPU spikes during scroll and interaction. On low-end mobile devices this manifests as visible jank.

**Why it happens:**
Default change detection is implicit. Component templates with many items and conditional classes are the classic case where it degrades.

**How to avoid:**
Apply `changeDetection: ChangeDetectionStrategy.OnPush` to the Pokédex modal component and any Pokédex cell child component. This limits re-renders to explicit `@Input()` changes and `markForCheck()` calls. Pass Pokédex state down as an immutable snapshot (`seen: Set<number>`, `won: Set<number>`) so cell components re-render only when those sets change. Combine with virtual scroll (Angular CDK `cdk-virtual-scroll-viewport`) if the full 1,025-item grid causes scroll jank.

**Warning signs:**
- Visible lag (>100ms) when opening modal or scrolling the grid on mid-range Android devices
- Chrome Performance tab shows long "Recalculate Style" tasks during scroll
- Grid component uses `ChangeDetectionStrategy.Default` (or none specified)

**Phase to address:**
Pokédex Grid component phase — OnPush must be set at component creation, not added later as a fix.

---

### Pitfall 8: Mobile Layout — Fixed Sprite Sizes Breaking Dense Grid

**What goes wrong:**
A desktop-designed grid using fixed pixel sizes (e.g., `width: 64px; height: 64px` per cell) renders correctly at 1280px but creates two failure modes on mobile: (a) overflow → horizontal scroll inside the modal, or (b) too few columns → the grid takes excessive vertical space requiring unreasonable scrolling through 1,025 items. Bootstrap's `.modal-lg` at mobile viewport widths is ~100vw, leaving little room for fixed-width grid cells.

**Why it happens:**
Developers test on desktop. The PC storage modal (`storage-pc`) uses a larger grid structure but has at most 30 items — layout issues aren't visible there.

**How to avoid:**
Use CSS Grid with `repeat(auto-fill, minmax(52px, 1fr))` for the Pokédex cell grid. This allows the browser to fit as many columns as possible at any viewport width. Define the minimum cell size to match the sprite size (official artwork sprites are 475×475px displayed at ~52px thumbnail size). Test explicitly at 375px (iPhone SE) and 390px (iPhone 14) viewport widths inside the modal container.

**Warning signs:**
- Grid cells use `width: Xpx` and `height: Ypx` fixed values without responsive breakpoints
- Horizontal scrollbar appears inside the modal on mobile viewports
- Desktop-only testing in development

**Phase to address:**
Pokédex Grid component phase — responsive grid layout must be part of initial CSS, not a polish step.

---

### Pitfall 9: iOS Safari Modal Scroll Trapping

**What goes wrong:**
On iOS Safari, a scrollable container inside a Bootstrap `NgbModal` with `overflow: auto` or `overflow-y: scroll` frequently fails to scroll — touches are absorbed by the outer modal backdrop or the body scroll lock that Bootstrap applies. Users cannot scroll through the 1,025-item grid on iPhone.

**Why it happens:**
Bootstrap 5 applies `overflow: hidden` to `<body>` when a modal is open (scroll lock). On iOS, this has known interaction bugs with inner-scrolling elements. The existing PC storage modal doesn't scroll much so this has never surfaced.

**How to avoid:**
Apply `-webkit-overflow-scrolling: touch` to the scrollable grid container (legacy but still effective on older iOS). Also ensure the scrollable element has an explicit `height` or `max-height` set — iOS won't scroll a container without a defined height. Test on real iOS Safari or BrowserStack at 375px. If using CDK virtual scroll, verify it's compatible with the ng-bootstrap modal scroll lock.

**Warning signs:**
- No iOS-specific scroll testing done
- Inner scrollable container lacks an explicit `max-height` or `height`
- Reports of "grid can't scroll" on iOS after initial release

**Phase to address:**
Pokédex Grid component phase — mobile scroll behavior must be verified before marking the modal complete.

---

### Pitfall 10: Intersection Observer Not Disconnected on Modal Close

**What goes wrong:**
If using `IntersectionObserver` to trigger lazy sprite loading (the correct approach for Pitfall 2), the observer instances attached to grid cells must be `disconnect()`ed when the modal is destroyed. If not disconnected, the observers continue listening for DOM changes even after the modal's DOM is removed, accumulating with each open/close cycle.

**Why it happens:**
`IntersectionObserver` is a native browser API (not RxJS), so it falls outside Angular's standard subscription cleanup patterns. Developers handling subscriptions correctly may forget about imperative observer cleanup.

**How to avoid:**
If implementing a custom lazy-load directive, track all `IntersectionObserver` instances and call `.disconnect()` in `ngOnDestroy`. Alternatively, implement lazy loading at the grid-level component using a single observer (not per-cell), disconnect it in `ngOnDestroy`. If using a third-party Angular intersection observer library, verify it implements `OnDestroy` correctly.

**Warning signs:**
- `IntersectionObserver` instances created without being stored in a class property
- No `observer.disconnect()` call in any `ngOnDestroy`
- Memory profile shows `IntersectionObserver` accumulation after repeated modal open/close

**Phase to address:**
Pokédex Grid component phase — part of the lazy loading implementation, not a separate concern.

---

### Pitfall 11: PokeAPI Rate Limiting on Rapid Scroll

**What goes wrong:**
Scrolling quickly through the Pokédex grid fires Intersection Observer callbacks in rapid succession. If each callback immediately triggers `getPokemonSprites()`, a user scrolling from entry 1 to entry 1025 could fire 100+ requests in under a second. PokeAPI's rate limit (publicly undocumented but observed around 100 req/min per IP in practice) causes 429 responses, and the existing `retry({ count: 3, delay: 1000 })` silently burns 3× the requests.

**Why it happens:**
Intersection Observer fires on every element entering the viewport during fast scroll, and the existing HTTP service has no request debouncing.

**How to avoid:**
Debounce sprite loading triggers (e.g., 150ms) so rapid scroll only fires requests for cards that remain in the viewport. Use `shareReplay(1)` on the sprite Observable so a Pokémon's sprite is fetched at most once per session. Cache resolved sprites in `PokedexService` or `PokemonService` memory (a `Map<number, string>`) to avoid re-fetching on subsequent modal opens.

**Warning signs:**
- Network tab shows bursts of 50+ simultaneous requests to `pokeapi.co` during scroll
- Console shows 429 errors during scroll interaction
- No debounce logic in the lazy loading implementation

**Phase to address:**
Pokédex Grid component phase — debounce and caching strategy must be part of the lazy loading implementation.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Copy `StoragePcComponent` and strip out drag-drop | Fast modal scaffold | Drag-drop still in imports, unused DI in constructor, dead code | Never — delete unused imports immediately |
| Store `Set<number>` but serialize as JSON array each save | Simple code | Re-creates Set on every read; on large data, adds unnecessary GC pressure | OK at 1,025 IDs; only matters if data grows to 10K+ |
| Single flat `seenPokemon: number[]` array in service, scan linearly for `includes()` | Simplest implementation | O(n) lookup × 1,025 checks on every grid render = noticeable lag | Use `Set<number>` for O(1) lookups — non-negotiable at 1,025 entries |
| Skip virtual scroll and render all 1,025 DOM nodes | No CDK dependency | 1,025 nodes × DOM overhead = slow initial paint, slow scroll on mobile | Acceptable if each cell is a very thin `<div>` with no dynamic bindings; risky with OnPush disabled |
| Fetch sprites for `seen` entries on modal open (not lazy) | Simpler code | Triggers 20–500 requests depending on progress state; user freezes mid-game | Only acceptable if `seen` count is guaranteed ≤ 20 (unrealistic) |

---

## Integration Gotchas

Common mistakes when connecting to PokeAPI and localStorage.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| `pokemonService.getPokemonSprites()` | Call it in `*ngFor` child component `ngOnInit`, creating N subscriptions | Call it lazily (on scroll-into-view), cache in service `Map`, pass resolved URL as `@Input` string |
| `pokemonService.getPokemonSprites()` | Subscribe without `takeUntil` or `takeUntilDestroyed` | Always pair with destroy-scoped unsubscription; modal close must cancel pending requests |
| PokeAPI sprite URLs | Use `response.sprites.front_default` instead of `official-artwork` | Existing service uses `response.sprites.other['official-artwork'].front_default` — Pokédex must use the same path for visual consistency |
| localStorage write | Call `localStorage.setItem` directly without try/catch | Wrap in try/catch; `QuotaExceededError` is a real failure mode, not hypothetical |
| localStorage key | Reuse `pokemon-roulette-settings` key or pick a similar but slightly different name | Use a clearly distinct key: `pokemon-roulette-pokedex` — document it as a constant in the service |
| Unknown sprite | Reference GitHub raw URL directly in template | Bundle as local asset in `/public/sprites/unknown.png`, reference as a relative path |

---

## Performance Traps

Patterns that work at small scale but fail as the grid grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `Array.includes()` for seen/won lookup inside `*ngFor` | Visible render delay opening modal; CPU spike | Use `Set<number>` for O(1) lookup — `seenSet.has(pokemon.pokemonId)` | Noticeable at 150+ items; severe at 1,025 |
| Unthrottled Intersection Observer firing sprite loads | 429 errors from PokeAPI; burst network traffic | Debounce 150ms; cache results in `Map<number, string>` | At scroll speed >5 items/second |
| `ChangeDetectionStrategy.Default` with 1,025 bindings | Jank scrolling; dropped frames on mobile | `OnPush` on grid and cell components from day one | Any interaction on mid-range Android (2019-era) |
| Rendering all 1,025 DOM nodes immediately | 500ms+ initial paint for modal open; high memory usage | CDK Virtual Scroll viewport inside modal | At ~500+ full DOM nodes with images |
| Storing full `PokemonItem` arrays in localStorage | Occasional silent save failures; missing Pokédex data | Store only `{ seen: number[], won: number[] }` | First save attempt on a device with >4MB already in localStorage |

---

## UX Pitfalls

Common user experience mistakes in Pokédex grid domains.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Modal uses `backdrop: 'static', keyboard: false` (same as PC storage) | User can't close Pokédex by pressing ESC or clicking outside — feels broken for a read-only view | Pokédex modal should use default backdrop (click to dismiss) and `keyboard: true` (ESC to close); it's read-only, no risk of accidental data loss |
| No loading state for sprites — blank cells while fetching | Grid appears broken or incomplete; user may think unseen Pokémon are invisible | Show unknown silhouette by default; replace with sprite when fetch resolves (transition, not swap) |
| Progress counter updates delayed | "45 / 151" counter lags behind actual seen state during the current run | Counter should derive from the same `BehaviorSubject` the grid uses — one source of truth |
| No visual distinction between "not yet seen" and "seen" at small thumbnail size | Difficult to read progress at a glance | Greyscale filter (CSS `filter: grayscale(100%)`) for unseen, golden border for won — consistent with Pokémon game conventions |
| Scroll position resets every time modal is opened | User loses their place in a 1,025-item grid after checking another modal | Save scroll position in service or DOM; restore on modal open |
| Dense grid looks identical to app's existing PC storage modal | User confusion: "which modal am I in?" | Distinct visual theme (Pokédex-red color scheme per PROJECT.md's "Pokémon game-inspired UI") |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Pokédex persistence:** Appears to work in single session — verify data survives browser close/reopen (test in Incognito to isolate)
- [ ] **Won state marking:** Champion defeat marks the right Pokémon — verify it reads from `trainerService.getTeam()` at the moment of defeat, not at component render time (timing bug risk)
- [ ] **Subscription cleanup:** Modal opens and closes 10 times — verify browser memory does not grow (Chrome Memory tab, heap snapshot comparison)
- [ ] **Mobile scroll:** Grid scrolls correctly on actual iOS Safari (not desktop Chrome DevTools mobile emulation) — they behave differently for inner scroll containers
- [ ] **Unknown silhouette:** Shown correctly for all 1,025 entries before any Pokémon are seen — verify the asset path works on GitHub Pages (static deployment, path must be relative or use `BASE_HREF`)
- [ ] **No data regression from `resetTeam()`:** Call `trainerService.resetTeam()` manually in DevTools — verify Pokédex data is unchanged
- [ ] **Storage quota safety:** Open DevTools > Application > localStorage — verify Pokédex key value is a compact JSON array of numbers, not full objects
- [ ] **Rate limiting:** Open modal with 100+ seen Pokémon and scroll rapidly — verify no 429 errors in Network tab
- [ ] **Generation filter:** Local Dex view shows only the current generation's Pokémon — verify generation change updates the view (subscribes to `generationService.getCurrentGeneration()`)

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Full PokemonItem objects stored in localStorage — quota exceeded | MEDIUM | Schema migration: read old format, extract IDs, write new compact format; one-time migration in service constructor |
| Subscription leaks discovered post-ship | MEDIUM | Add `takeUntilDestroyed(this.destroyRef)` to all sprite subscriptions; test with heap snapshot before/after |
| Pokédex data cleared by `resetTeam()` | HIGH | User data unrecoverable; prevent with automated test on `resetTeam()` that asserts Pokédex service state unchanged |
| iOS scroll completely broken | MEDIUM | Add explicit `height` + `-webkit-overflow-scrolling: touch` to scrollable container; test on BrowserStack |
| PokeAPI 429s making grid unusable | LOW | Add client-side debounce + `shareReplay(1)` cache; existing retry logic already handles transient failures |
| Unknown silhouette 404 on GitHub Pages | LOW | Bundle asset locally (should have been done from start); deploy fix takes <30 min |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Storing full PokemonItem in localStorage (P1) | Pokédex Service design | `localStorage.getItem('pokemon-roulette-pokedex')` returns `{"seen":[1,2,3],"won":[]}` format |
| Eager sprite loading (P2) | Pokédex Grid component | Network tab shows 0 requests on modal open with 0 seen Pokémon; requests fire on scroll only |
| Subscription leaks (P3) | Pokédex Grid component | Heap snapshot before/after 10 open/close cycles shows no growth |
| Pokédex coupled to TrainerService (P4) | Pokédex Service design | `resetTeam()` call does not modify `PokedexService` state; zero `TrainerService` import in `PokedexService` |
| Unguarded localStorage writes (P5) | Pokédex Service implementation | `saveToStorage` method has try/catch wrapping `setItem` |
| External unknown sprite URL (P6) | Pokédex Grid component | Unknown silhouette asset present in `/public/sprites/` and referenced locally |
| Change detection flooding (P7) | Pokédex Grid component | `ChangeDetectionStrategy.OnPush` declared on grid component; no `Default` strategy |
| Mobile fixed-size grid (P8) | Pokédex Grid component | Grid renders correctly at 375px viewport; no horizontal scroll in modal |
| iOS Safari scroll trapping (P9) | Pokédex Grid component | Manual test on iOS Safari — grid scrollable within modal |
| IntersectionObserver not disconnected (P10) | Pokédex Grid component | DevTools memory — observers not accumulating after repeated modal open/close |
| PokeAPI rate limiting (P11) | Pokédex Grid component | Rapid scroll test shows no 429s; `shareReplay(1)` visible in sprite fetch Observable |

---

## Sources

- **Direct codebase analysis:** `src/app/services/pokemon-service/pokemon.service.ts` — `retry({ count: 3, delay: 1000 })` behavior; `any` type response
- **Direct codebase analysis:** `src/app/trainer-team/storage-pc/storage-pc.component.ts` — correct `Subscription` container pattern with `ngOnDestroy`
- **Direct codebase analysis:** `src/app/interfaces/pokemon-item.ts` — `PokemonItem` shape with sprite URL fields
- **Direct codebase analysis:** `src/app/services/settings-service/settings.service.ts` — localStorage read guard present, write guard absent
- **Project spec:** `.planning/PROJECT.md` — unknown sprite URL, storage constraints, external sprite loading requirement
- **Known tech debt:** `.planning/codebase/CONCERNS.md` — documented subscription leaks, hardcoded URL fragility, localStorage error handling gaps
- **Browser standards (HIGH confidence):** `localStorage` per-origin limit: 5MB nominal (MDN); `QuotaExceededError` on overflow
- **Angular docs (HIGH confidence):** `ChangeDetectionStrategy.OnPush`, `takeUntilDestroyed`, CDK Virtual Scroll
- **iOS Safari behavior (MEDIUM confidence):** Inner-scroll issues in fixed-position modals documented in Bootstrap Issues #17590 and related; `-webkit-overflow-scrolling: touch` workaround
- **PokeAPI rate limits (MEDIUM confidence):** Not formally documented by PokeAPI; community-observed ~100 req/min per IP threshold

---
*Pitfalls research for: Angular 21 Pokédex feature (1,025-entry grid, PokeAPI lazy loading, localStorage persistence)*
*Researched: 2025-01-31*

# Architecture Research — Pokédex Feature

**Domain:** Angular 21 standalone component feature addition (Pokédex) to existing Pokémon Roulette game
**Researched:** 2025-01-15
**Confidence:** HIGH — based on direct codebase inspection of all integration points

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Presentation Layer                        │
├──────────────────────┬──────────────────────┬───────────────────┤
│  RouletteContainer   │   TrainerTeam         │  PokedexComponent │
│  Component           │   Component           │  (NEW — modal)    │
│                      │  ┌────────────────┐   │                   │
│  completePokemon      │  │StoragePcComp   │   │ Local Dex tab     │
│  Capture() ──────────┼──┤                │   │ National Dex tab  │
│                      │  └────────────────┘   │ Progress counter  │
│  championBattle      │  ┌────────────────┐   │ Sprite grid       │
│  Result(true) ───────┼──┤PokedexComp     │   │ Seen/Won badges   │
│                      │  │(NEW button+    │   │                   │
│                      │  │ modal inline)  │   │                   │
│                      │  └────────────────┘   │                   │
├──────────────────────┴──────────────────────┴───────────────────┤
│                        Services Layer                            │
├─────────────────────┬───────────────────────┬───────────────────┤
│  PokedexService     │  TrainerService        │  GenerationService│
│  (NEW)              │  (existing)            │  (existing)       │
│                     │                        │                   │
│  BehaviorSubject    │  getTeam()             │  getCurrentGen()  │
│  markSeen(id)       │                        │  gen.id → 1-9     │
│  markWon(ids)       │                        │                   │
│  pokedex$ Observable│                        │                   │
├─────────────────────┴───────────────────────┴───────────────────┤
│                        Data / Persistence Layer                  │
├─────────────────────────────────────────────────────────────────┤
│  localStorage key: 'pokedex'                                     │
│  { seen: number[], won: number[] }                               │
│  pokemonByGeneration (existing static data)                      │
│  nationalDexPokemon (existing static data)                       │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `RouletteContainerComponent` (existing, modify) | Mark Pokémon as seen on capture; mark team as won on champion defeat | Inject `PokedexService`, call hooks in existing methods |
| `TrainerTeamComponent` (existing, modify) | Host the Pokédex button alongside PC button | Add `<app-pokedex>` next to `<app-storage-pc>` in template |
| `PokedexComponent` (NEW) | Pokédex button + modal with Local/National Dex grid | Single standalone component; owns button, modal template ref, tab state |
| `PokedexService` (NEW) | Persistent Pokédex state, seen/won tracking, localStorage I/O | `providedIn: 'root'` singleton, `BehaviorSubject`, mirrors `DarkModeService` pattern |

---

## Recommended Project Structure

```
src/app/
├── services/
│   └── pokedex-service/             # NEW
│       ├── pokedex.service.ts       # BehaviorSubject, markSeen, markWon, localStorage
│       └── pokedex.service.spec.ts
├── trainer-team/
│   ├── storage-pc/                  # existing — no changes needed
│   ├── pokedex/                     # NEW — mirrors storage-pc folder structure
│   │   ├── pokedex.component.ts
│   │   ├── pokedex.component.html
│   │   ├── pokedex.component.css
│   │   └── pokedex.component.spec.ts
│   ├── trainer-team.component.html  # modify: add <app-pokedex> alongside <app-storage-pc>
│   ├── trainer-team.component.ts    # modify: import PokedexComponent
│   └── ...
└── main-game/
    └── roulette-container/
        └── roulette-container.component.ts  # modify: inject PokedexService, add two hook calls
```

### Structure Rationale

- **`pokedex-service/` under `services/`:** All other domain services live here (`trainer-service`, `dark-mode-service`, `settings-service`). Consistent location.
- **`pokedex/` under `trainer-team/`:** The Pokédex button is a sibling of the PC button in the trainer panel — colocation with `storage-pc/` makes the structural relationship obvious.
- **Single `PokedexComponent` (no separate button component):** `StoragePcComponent` owns its own button inline. The Pokédex follows the exact same pattern — button + modal template refs in one component. Splitting to `PokedexButtonComponent` + `PokedexModalComponent` would add indirection with no benefit at this scope.

---

## Architectural Patterns

### Pattern 1: BehaviorSubject Service with localStorage (follow DarkModeService)

**What:** Service holds state in a `BehaviorSubject`, persists to `localStorage` on every mutation, hydrates from `localStorage` on construction.

**When to use:** Any cross-component persistent state that must survive page reloads. Already established for dark mode and settings.

**Trade-offs:** Simple, zero dependencies, works offline. Not suitable if data needs to be shared across browser tabs in real-time (not required here).

**Example:**
```typescript
@Injectable({ providedIn: 'root' })
export class PokedexService {
  private readonly STORAGE_KEY = 'pokedex';
  private readonly pokedexSubject$ = new BehaviorSubject<PokedexData>(
    this.loadFromStorage()
  );

  readonly pokedex$ = this.pokedexSubject$.asObservable().pipe(distinctUntilChanged());

  markSeen(pokemonId: number): void {
    const current = this.pokedexSubject$.getValue();
    if (!current.seen.includes(pokemonId)) {
      const updated = { ...current, seen: [...current.seen, pokemonId] };
      this.saveToStorage(updated);
      this.pokedexSubject$.next(updated);
    }
  }

  markWon(team: PokemonItem[]): void {
    const current = this.pokedexSubject$.getValue();
    const newWonIds = team.map(p => p.pokemonId).filter(id => !current.won.includes(id));
    if (newWonIds.length > 0) {
      const updated = { ...current, won: [...current.won, ...newWonIds] };
      this.saveToStorage(updated);
      this.pokedexSubject$.next(updated);
    }
  }

  private loadFromStorage(): PokedexData {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* fall through */ }
    return { seen: [], won: [] };
  }

  private saveToStorage(data: PokedexData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
}

// Interface (new file or inline):
interface PokedexData {
  seen: number[]; // pokemonIds ever assigned to team
  won: number[];  // pokemonIds on team when champion was defeated
}
```

---

### Pattern 2: Self-contained Modal Component (follow StoragePcComponent)

**What:** A single component owns its trigger button, `@ViewChild` template refs for each modal, and opens them via `NgbModal`. No `@Input`/`@Output` plumbing to parent.

**When to use:** Modal UI that doesn't need to relay results back to the parent (Pokédex is read-only display — perfect fit). `StoragePcComponent` is the established example.

**Trade-offs:** Minimal coupling; parent just adds `<app-pokedex>` and forgets it. Slightly harder to test in isolation, but consistent with existing codebase.

**Example:**
```typescript
@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, NgIconsModule, TranslatePipe],
  templateUrl: './pokedex.component.html',
})
export class PokedexComponent implements OnInit, OnDestroy {
  @ViewChild('pokedexModal', { static: true }) pokedexModal!: TemplateRef<any>;

  constructor(
    private modalService: NgbModal,
    private pokedexService: PokedexService,
    private generationService: GenerationService,
    private darkModeService: DarkModeService,
    private gameStateService: GameStateService
  ) {}

  openPokedex(): void {
    if (this.wheelSpinning) return;
    this.modalService.open(this.pokedexModal, {
      centered: true,
      size: 'xl',
      scrollable: true
    });
  }
}
```

---

### Pattern 3: Lazy Sprite Loading with Angular `@defer`

**What:** Use Angular 17+ `@defer` blocks (available in Angular 21) or `IntersectionObserver` to load Pokémon sprites only when a grid entry scrolls into view. Prevents 151–1,025 simultaneous PokeAPI calls on modal open.

**When to use:** Required for National Dex (1,025 entries). Also recommended for Local Dex for consistency and performance.

**Trade-offs:** `@defer (on viewport)` is the cleanest Angular-native approach — no manual IntersectionObserver setup. Only works for components, not raw `<img>` tags, so each grid entry should be a small inline `@if` with a loading placeholder.

**Example:**
```html
<!-- In pokedex.component.html grid -->
@for (pokemonId of displayedPokemonIds; track pokemonId) {
  <div class="pokedex-entry" [class.seen]="isSeen(pokemonId)" [class.won]="isWon(pokemonId)">
    @defer (on viewport) {
      <app-pokedex-entry [pokemonId]="pokemonId" [seen]="isSeen(pokemonId)" [won]="isWon(pokemonId)">
      </app-pokedex-entry>
    } @placeholder {
      <img src="https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png"
           class="img-fluid pokedex-sprite" alt="Unknown">
    }
  </div>
}
```

> **Note:** This means a thin `PokedexEntryComponent` is needed as the deferred target — it fetches its own sprite via `pokemonService.getPokemonSprites(pokemonId)`. The entry component is presentational only; all state logic stays in `PokedexService`.

---

## Data Flow

### Seen Marking Flow (Pokémon assigned by roulette)

```
Roulette Component
    ↓ emits PokemonItem
RouletteContainerComponent.preparePokemonCapture()
    ↓
RouletteContainerComponent.completePokemonCapture(pokemon)   ← EXISTING METHOD
    ↓ trainerService.addToTeam(pokemon)                      ← existing line
    ↓ pokedexService.markSeen(pokemon.pokemonId)             ← NEW line (add after addToTeam)
    ↓
PokedexService.markSeen()
    ↓ updates BehaviorSubject
    ↓ writes to localStorage
    ↓ pokedex$ emits new state
PokedexComponent (if modal open) subscribes and re-renders grid
```

### Won Marking Flow (Champion defeated)

```
ChampionRouletteComponent emits result: true
    ↓
RouletteContainerComponent.championBattleResult(true)        ← EXISTING METHOD
    ↓ gameStateService.advanceRound()                        ← existing line
    ↓ pokedexService.markWon(trainerService.getTeam())       ← NEW line (add before finishCurrentState)
    ↓
PokedexService.markWon()
    ↓ extracts pokemonIds from PokemonItem[]
    ↓ merges with existing won set (deduplicates)
    ↓ writes to localStorage
    ↓ pokedex$ emits new state
```

### Pokédex UI Read Flow

```
User clicks Pokédex button
    ↓
PokedexComponent.openPokedex()
    ↓ NgbModal.open(pokedexModal)
Modal renders
    ↓ pokedexService.pokedex$ (one-time snapshot or subscribe)
    ↓ generationService.getCurrentGeneration() → gen.id
    ↓ pokemonByGeneration[gen.id] → local pokemon ID list
    ↓ nationalDexPokemon → all 1,025 IDs (national tab)
Grid renders with seen/won state
    ↓ @defer(on viewport) per entry
    ↓ PokedexEntryComponent loads sprite via pokemonService.getPokemonSprites()
```

### State Management

```
PokedexService (singleton, providedIn: 'root')
    BehaviorSubject<PokedexData>
         ↓ (mutations via markSeen / markWon)
    pokedex$ Observable
         ↓ (subscribed by PokedexComponent)
    localStorage['pokedex']
         ↑ (loaded on service construction)
         ↓ (written on every mutation)
```

---

## Component Hierarchy (full picture after feature addition)

```
TrainerTeamComponent
├── BadgesComponent
├── (6 × Pokémon slot divs — inline, no sub-component)
├── StoragePcComponent      ← existing, unchanged
└── PokedexComponent        ← NEW, added here
    ├── button (inline in template)
    └── #pokedexModal (ng-template)
        ├── Tab: Local Dex
        │   └── @for pokemonId in localDexIds
        │       └── @defer → PokedexEntryComponent
        └── Tab: National Dex
            └── @for pokemonId in nationalDexIds
                └── @defer → PokedexEntryComponent
```

### PokedexEntryComponent (small presentational component)

Needed as target for `@defer`. Responsibilities:
- Receives `@Input() pokemonId: number`
- Receives `@Input() seen: boolean`
- Receives `@Input() won: boolean`
- Fetches sprite via `pokemonService.getPokemonSprites(pokemonId)` on init
- Shows silhouette placeholder until sprite resolves
- Applies CSS class for won (golden border/star)

This keeps `PokedexComponent` clean — it only manages tabs, progress counts, and the ID arrays. Sprite fetching is entirely delegated.

---

## Integration Points with Existing Code

### 1. `RouletteContainerComponent` — two line additions

**File:** `src/app/main-game/roulette-container/roulette-container.component.ts`

| Method | Line region | Change |
|--------|-------------|--------|
| `constructor()` | line 99–112 | Add `private pokedexService: PokedexService` parameter |
| `completePokemonCapture(pokemon)` | line 684–688 | After `trainerService.addToTeam(pokemon)`, add `pokedexService.markSeen(pokemon.pokemonId)` |
| `championBattleResult(result)` | line 628–639 | Inside `if (result)` block, before `finishCurrentState()`, add `pokedexService.markWon(trainerService.getTeam())` |

**Risk:** LOW — both are additive one-liners inside already-called methods. No existing logic changes.

### 2. `TrainerTeamComponent` — template addition

**File:** `src/app/trainer-team/trainer-team.component.html`

Current line 74:
```html
<app-storage-pc></app-storage-pc>
```
Becomes:
```html
<app-storage-pc></app-storage-pc>
<app-pokedex></app-pokedex>
```

**File:** `src/app/trainer-team/trainer-team.component.ts`

Add `PokedexComponent` to the `imports` array.

**Risk:** LOW — purely additive, no interaction with existing StoragePcComponent.

### 3. No changes needed to `TrainerService`, `GameStateService`, or any roulette components

The hooks go exclusively into `RouletteContainerComponent`, which is already the central outcome handler. `TrainerService.resetTeam()` must NOT be modified — the Pokédex is intentionally cumulative across resets.

---

## Suggested Build Order

This order respects dependencies: service before consumers, backend before UI.

| Step | Deliverable | Depends On | Risk |
|------|-------------|------------|------|
| 1 | `PokedexService` (storage, BehaviorSubject, markSeen, markWon) | Nothing new | LOW |
| 2 | Hook `markSeen` in `completePokemonCapture` | Step 1 | LOW |
| 3 | Hook `markWon` in `championBattleResult` | Step 1 | LOW |
| 4 | `PokedexEntryComponent` (sprite fetch, seen/won styling) | Step 1, PokeAPI pattern | LOW |
| 5 | `PokedexComponent` (button, modal shell, local/national tabs, progress counter) | Steps 1, 4 | MEDIUM |
| 6 | Register `<app-pokedex>` in `TrainerTeamComponent` | Step 5 | LOW |

**Why this order:** Service first means hooks (steps 2–3) can be tested immediately with localStorage inspection before any UI exists. `PokedexEntryComponent` before `PokedexComponent` means the grid is functional before the full modal is wired up — easier to test sprite loading in isolation.

---

## Anti-Patterns

### Anti-Pattern 1: Injecting PokedexService into individual Roulette Components

**What people do:** Add `PokedexService` injection to each of the 25+ roulette components to call `markSeen` directly when they emit their result.

**Why it's wrong:** `RouletteContainerComponent` is the single outcome handler for all roulettes. Scattering Pokédex calls across roulette components violates the existing architecture, creates 25+ injection sites to maintain, and risks missing new roulette types added in future.

**Do this instead:** Add one call in `RouletteContainerComponent.completePokemonCapture()` — it's already the single convergence point for all Pokémon captures regardless of which roulette triggered them.

---

### Anti-Pattern 2: Loading all 1,025 sprites on modal open

**What people do:** Subscribe to `pokedex$` on modal open and immediately call `pokemonService.getPokemonSprites(id)` for every Pokémon in the dex.

**Why it's wrong:** 1,025 HTTP requests on a single user action will saturate the browser connection pool, create visible jank, and likely hit PokeAPI rate limits. The existing `pokemonService` does retry with delay — cascading that across 1,025 requests compounds the problem.

**Do this instead:** Use Angular `@defer (on viewport)` so `PokedexEntryComponent` instances only mount and fetch sprites when their grid cell scrolls into the visible modal area. The unknown-sprite placeholder shows instantly with zero network cost.

---

### Anti-Pattern 3: Using `Set<number>` in the persisted PokedexData type

**What people do:** Use `Set<number>` for seen/won sets because deduplication is built in.

**Why it's wrong:** `JSON.stringify(new Set([1,2,3]))` produces `{}` — Sets are not JSON-serializable. On the next page load, `localStorage.getItem()` → `JSON.parse()` would return `{ seen: {}, won: {} }` and silently lose all data.

**Do this instead:** Store as `number[]` (plain arrays). Deduplicate in `markSeen`/`markWon` with an `includes()` check before pushing. Arrays serialize correctly and round-trip through `JSON.parse`/`JSON.stringify` without loss.

---

### Anti-Pattern 4: Splitting PokedexComponent into PokedexButtonComponent + PokedexModalComponent

**What people do:** Separate the trigger button into its own component and the modal content into another, using `@Input`/`@Output` or a service to coordinate open/close state.

**Why it's wrong:** `StoragePcComponent` — the established pattern in this codebase — owns button + modal template refs + open logic in one component. Splitting adds indirection with no benefit; the Pokédex modal has no state that needs to escape back to its parent.

**Do this instead:** Follow `StoragePcComponent` exactly: one component, one `@ViewChild` template ref, `NgbModal.open()` in a single handler method.

---

## Scaling Considerations

This is a client-side browser game; scaling is about UI performance, not servers.

| Concern | At current scope | If Pokédex grows |
|---------|-----------------|------------------|
| Sprite loading (1,025 entries) | `@defer (on viewport)` — only visible entries fetch | Same pattern holds |
| localStorage payload | `{ seen: number[], won: number[] }` — max ~8KB for all 1,025 IDs each | Negligible; localStorage limit is 5–10MB |
| BehaviorSubject emissions | One emission per markSeen/markWon call — fine for click-rate events | Add `debounceTime` if batch imports ever added |
| Modal scroll performance | CSS grid with fixed-size cells; no virtual scroll needed for 1,025 items | Add `@angular/cdk/scrolling` VirtualScroll if entries grow complex |

---

## Sources

- Direct inspection: `src/app/main-game/roulette-container/roulette-container.component.ts` (lines 628–688)
- Direct inspection: `src/app/trainer-team/storage-pc/storage-pc.component.ts` (modal pattern reference)
- Direct inspection: `src/app/trainer-team/trainer-team.component.html` (button placement target)
- Direct inspection: `src/app/services/dark-mode-service/dark-mode.service.ts` (localStorage + BehaviorSubject pattern)
- Project spec: `.planning/PROJECT.md` (requirements, constraints, hook locations)
- Existing architecture: `.planning/codebase/ARCHITECTURE.md` (service/component hierarchy)
- Angular 17+ `@defer` blocks: HIGH confidence (Angular 17 stable feature, available in Angular 21)

---

*Architecture research for: Pokédex feature — Angular 21 Pokémon Roulette game*
*Researched: 2025-01-15*

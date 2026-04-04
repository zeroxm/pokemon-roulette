# Phase 1: Service & Game Hooks — Research

**Researched:** 2026-04-03
**Domain:** Angular 21 service creation + localStorage persistence + game hook wiring
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** localStorage schema — unified per-Pokémon record:
  ```json
  {
    "caught": {
      "1":  { "won": false, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" },
      "25": { "won": true,  "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" }
    }
  }
  ```
  - `caught[id]` presence = "seen"; `won: true` = on team at Champion defeat
  - `interface PokedexEntry { won: boolean; sprite: string | null }`
  - `interface PokedexData { caught: Record<string, PokedexEntry> }`

- **D-02:** localStorage key: `'pokemon-roulette-pokedex'`

- **D-03:** Sprite URL computed deterministically: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png` — no HTTP call needed; store immediately in `caught[id].sprite`

- **D-04:** In-memory dedup cache: `private readonly spriteCache = new Map<number, string>()` — prevents redundant URL computation if a Pokémon is seen multiple times in a session

- **D-05:** Two `markSeen(pokemonId: number)` hook sites:
  1. `completePokemonCapture()` at line ~684 — after `this.trainerService.addToTeam(pokemon)`
  2. Team Rocket steal (`teamRocketDefeated()`) at line ~533 — after `this.trainerService.addToTeam(this.stolenPokemon)`

- **D-06:** One `markWon(pokemonIds: number[])` hook site: `championBattleResult(result: true)`, passing `getTeam() + getStored()` IDs, before `finishCurrentState()`

- **D-07:** Expose `pokedex$: Observable<PokedexData>` backed by `BehaviorSubject<PokedexData>`, following `SettingsService.settings$` pattern exactly

- **D-08:** Follow `SettingsService` as the exact blueprint:
  - `private readonly STORAGE_KEY = 'pokemon-roulette-pokedex'`
  - `private pokedexSubject$: BehaviorSubject<PokedexData>`
  - Constructor reads from localStorage (try/catch, fallback to empty state)
  - `private updatePokedex(data: PokedexData): void` — saves + emits
  - `markSeen(pokemonId: number): void`
  - `markWon(pokemonIds: number[]): void`
  - `get currentPokedex(): PokedexData`

### Agent's Discretion

- Whether `markWon` receives only `getTeam()` IDs or `getTeam() + getStored()` IDs — use all owned Pokémon for maximum fairness
- Error handling for localStorage write failures (quota exceeded) — decide logging vs silent fail, consistent with existing `SettingsService` pattern
- Whether to add a `clearPokedex()` stub for future use — may add but must NOT be called from `resetGame()`

### Deferred Ideas (OUT OF SCOPE)

- `clearPokedex()` / reset method — deferred; must NOT be called from `resetGame()`
- Shiny sprite tracking in the Pokédex
- Per-generation completion stats — Phase 3 concern
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DATA-01 | Track Pokémon as "seen" when assigned to team by roulette (any run, any outcome, any generation) | All `addToTeam` paths audited; markSeen in `completePokemonCapture()` covers all roulette paths; Team Rocket steal is a second direct path |
| DATA-02 | Track Pokémon as "won" when player defeats Champion with it on team | `championBattleResult(result: true)` confirmed at line 628; `getTeam()` + `getStored()` confirmed as correct data sources |
| DATA-03 | Pokédex data persists in localStorage — survives browser close and page refresh | `SettingsService` pattern confirmed; BehaviorSubject + localStorage write on every mutation |
| DATA-04 | Pokédex data NOT reset when new game run starts | `resetTeam()` in TrainerService confirmed; `PokedexService` must have zero coupling to TrainerService and owns its own storage key |
| DATA-05 | Sprite URLs stored in localStorage alongside seen/won IDs | D-03 locked: deterministic URL computed and stored in `caught[id].sprite` on `markSeen` |
| DATA-06 | PokeAPI sprite calls deduplicated within session via in-memory Map | D-04 locked: `private readonly spriteCache = new Map<number, string>()` — check cache before computing; since URL is deterministic (no HTTP call), cache prevents recomputation cost only |
</phase_requirements>

---

## Summary

Phase 1 creates `PokedexService` and wires two game hooks into `roulette-container.component.ts`. No UI is built. The deliverables are entirely verifiable via DevTools → Application → Local Storage.

The implementation is a direct clone of `SettingsService` with a different data shape. Every pattern needed already exists in the codebase. The service creates a `BehaviorSubject<PokedexData>`, reads initial state from localStorage in its constructor, and updates both localStorage and the subject on every mutation. The two hooks in `roulette-container.component.ts` are single-line calls after confirmed `addToTeam` call sites.

One research finding requires planner attention: there is a **third** direct `addToTeam` call at line 713 (Nincada's special evolution adds Shedinja as a second Pokémon) that is not covered by the two locked hook sites. This is a gap in DATA-01 coverage. The planner must decide whether to add a third `markSeen` hook there or accept that Shedinja will not be tracked as "seen" via this path.

**Primary recommendation:** Clone `SettingsService` exactly, wire the two confirmed hook sites, and add a note for the planner about the Nincada/Shedinja coverage gap at line 713.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| RxJS BehaviorSubject | 7.8.2 | State management + reactive updates | Already used in SettingsService, DarkModeService, TrainerService — established codebase pattern |
| localStorage (native) | Browser API | Persistence across sessions | No server; matches existing SettingsService and dark-mode storage keys |
| Angular `@Injectable({ providedIn: 'root' })` | 21.2.7 | Singleton service | All services in codebase use this; guarantees one instance app-wide |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| RxJS `distinctUntilChanged` | 7.8.2 | Prevent duplicate emissions | Used in SettingsService.settings$ — prevents unnecessary re-renders when state unchanged |
| TypeScript `Record<string, T>` | 5.9.3 | Type-safe localStorage schema | String keys required for JSON serialization (pokemonId as string key in `caught`) |

**No new packages needed.** Zero `npm install` required for this phase.

---

## Architecture Patterns

### Service Directory Structure
```
src/app/services/pokedex-service/
├── pokedex.service.ts       # Service implementation
└── pokedex.service.spec.ts  # Jasmine unit tests (Wave 0 gap)
```

### Pattern 1: SettingsService Clone
**What:** BehaviorSubject backed by localStorage, with public Observable getter and private update method
**When to use:** This IS the pattern for PokedexService — copy verbatim, change types

**Exact SettingsService structure to replicate:**
```typescript
// Source: src/app/services/settings-service/settings.service.ts

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly STORAGE_KEY = 'pokemon-roulette-settings';
  private readonly defaultSettings: GameSettings = { ... };

  private settingsSubject$: BehaviorSubject<GameSettings>;

  constructor() {
    this.settingsSubject$ = new BehaviorSubject(this.getInitialSettings());
  }

  get settings$(): Observable<GameSettings> {
    return this.settingsSubject$.asObservable().pipe(distinctUntilChanged());
  }

  get currentSettings(): GameSettings {
    return this.settingsSubject$.getValue();
  }

  private updateSettings(newSettings: GameSettings): void {
    this.saveSettingsToStorage(newSettings);        // 1. persist
    this.settingsSubject$.next(newSettings);        // 2. emit
  }

  private getInitialSettings(): GameSettings {
    const settingsFromStorage = this.getSettingsFromStorage();
    return { ...this.defaultSettings, ...settingsFromStorage };
  }

  private saveSettingsToStorage(settings: GameSettings): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    // NOTE: No try/catch on write — matches existing codebase pattern
  }

  private getSettingsFromStorage(): Partial<GameSettings> | null {
    const storageItem = localStorage.getItem(this.STORAGE_KEY);
    if (storageItem) {
      try {
        return JSON.parse(storageItem);
      } catch (error) {
        console.error('Invalid settings localStorage item:', storageItem, 'falling back to default settings');
      }
    }
    return null;
  }
}
```

**Translated to PokedexService:**
```typescript
// Target: src/app/services/pokedex-service/pokedex.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';

export interface PokedexEntry {
  won: boolean;
  sprite: string | null;
}

export interface PokedexData {
  caught: Record<string, PokedexEntry>;
}

@Injectable({ providedIn: 'root' })
export class PokedexService {
  private readonly STORAGE_KEY = 'pokemon-roulette-pokedex';
  private readonly defaultPokedex: PokedexData = { caught: {} };
  private readonly spriteCache = new Map<number, string>();

  private pokedexSubject$: BehaviorSubject<PokedexData>;

  constructor() {
    this.pokedexSubject$ = new BehaviorSubject(this.getInitialPokedex());
  }

  get pokedex$(): Observable<PokedexData> {
    return this.pokedexSubject$.asObservable().pipe(distinctUntilChanged());
  }

  get currentPokedex(): PokedexData {
    return this.pokedexSubject$.getValue();
  }

  markSeen(pokemonId: number): void {
    const current = this.currentPokedex;
    const key = String(pokemonId);
    if (current.caught[key]) {
      return; // already seen — no-op
    }
    const sprite = this.getSpriteUrl(pokemonId);
    const updated: PokedexData = {
      caught: { ...current.caught, [key]: { won: false, sprite } }
    };
    this.updatePokedex(updated);
  }

  markWon(pokemonIds: number[]): void {
    const current = this.currentPokedex;
    const updatedCaught = { ...current.caught };
    for (const pokemonId of pokemonIds) {
      const key = String(pokemonId);
      // markSeen implicitly (pokemonId may not yet be in caught if hook order varies)
      const sprite = this.getSpriteUrl(pokemonId);
      updatedCaught[key] = { won: true, sprite: updatedCaught[key]?.sprite ?? sprite };
    }
    this.updatePokedex({ caught: updatedCaught });
  }

  private getSpriteUrl(pokemonId: number): string {
    if (this.spriteCache.has(pokemonId)) {
      return this.spriteCache.get(pokemonId)!;
    }
    const url = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
    this.spriteCache.set(pokemonId, url);
    return url;
  }

  private updatePokedex(data: PokedexData): void {
    this.savePokedexToStorage(data);
    this.pokedexSubject$.next(data);
  }

  private getInitialPokedex(): PokedexData {
    const fromStorage = this.getPokedexFromStorage();
    return fromStorage ?? this.defaultPokedex;
  }

  private savePokedexToStorage(data: PokedexData): void {
    // Agent discretion: add try/catch here if QuotaExceededError is a concern
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  private getPokedexFromStorage(): PokedexData | null {
    const storageItem = localStorage.getItem(this.STORAGE_KEY);
    if (storageItem) {
      try {
        return JSON.parse(storageItem);
      } catch (error) {
        console.error('Invalid pokedex localStorage item:', storageItem, 'falling back to empty pokedex');
      }
    }
    return null;
  }
}
```

### Pattern 2: Hook Injection into RouletteContainerComponent

**What:** Constructor-inject PokedexService; call `markSeen`/`markWon` at exact call sites
**When to use:** Two sites for markSeen, one site for markWon

#### Hook Site 1: completePokemonCapture() — Line 684

```typescript
// Source: src/app/main-game/roulette-container/roulette-container.component.ts (verified)
// Current (line 684–688):
private completePokemonCapture(pokemon: PokemonItem): void {
  this.trainerService.addToTeam(pokemon);
  this.gameStateService.setNextState('check-shininess');
  this.finishCurrentState();
}

// After patch (add line 685.5):
private completePokemonCapture(pokemon: PokemonItem): void {
  this.trainerService.addToTeam(pokemon);
  this.pokedexService.markSeen(pokemon.pokemonId);  // ← INSERT HERE
  this.gameStateService.setNextState('check-shininess');
  this.finishCurrentState();
}
```

**Coverage:** ALL roulette capture paths funnel through this method:
- `capturePokemon()` → `preparePokemonCapture()` → `completePokemonCapture()`
- `legendaryCaptureSuccess()` → `preparePokemonCapture()` → `completePokemonCapture()`
- `paradoxCaptureSuccess()` → `preparePokemonCapture()` → `completePokemonCapture()`
- `catchZubat()` → `preparePokemonCapture()` → `completePokemonCapture()`
- `catchSnorlax()` → `preparePokemonCapture()` → `completePokemonCapture()`
- `selectPokemonForm()` → `completePokemonCapture()` (directly — form selection result)

#### Hook Site 2: teamRocketDefeated() — Line 529

```typescript
// Source: src/app/main-game/roulette-container/roulette-container.component.ts (verified)
// Current (line 529–544):
teamRocketDefeated(): void {
  if (this.stolenPokemon) {
    const pokemonName = this.translateService.instant(this.stolenPokemon.text);
    this.trainerService.addToTeam(this.stolenPokemon);  // ← line 533
    this.infoModalTitle = ...;
    this.infoModalMessage = ...;
    this.stolenPokemon = null;
    this.modalQueueService.open(this.infoModal, { ... });
  }
  this.chooseWhoWillEvolve('team-rocket-encounter');
}

// After patch — add markSeen after addToTeam, BEFORE stolenPokemon is nulled:
teamRocketDefeated(): void {
  if (this.stolenPokemon) {
    const pokemonName = this.translateService.instant(this.stolenPokemon.text);
    this.trainerService.addToTeam(this.stolenPokemon);
    this.pokedexService.markSeen(this.stolenPokemon.pokemonId);  // ← INSERT HERE
    this.infoModalTitle = ...;
    this.infoModalMessage = ...;
    this.stolenPokemon = null;  // ← hook must be BEFORE this null assignment
    ...
  }
}
```

⚠️ **Order matters:** `markSeen` must be called BEFORE `this.stolenPokemon = null` or the pokemonId would be unavailable.

#### Hook Site 3: championBattleResult() — Line 628

```typescript
// Source: src/app/main-game/roulette-container/roulette-container.component.ts (verified)
// Current (line 628–639):
championBattleResult(result: boolean): void {
  this.runningShoesUsed = false;
  this.respinReason = '';

  if (result) {
    this.gameStateService.advanceRound();
  } else {
    this.gameStateService.setNextState('game-over');
  }
  this.finishCurrentState();
}

// After patch — add markWon inside if(result) block:
championBattleResult(result: boolean): void {
  this.runningShoesUsed = false;
  this.respinReason = '';

  if (result) {
    const wonIds = [
      ...this.trainerService.getTeam().map(p => p.pokemonId),
      ...this.trainerService.getStored().map(p => p.pokemonId)
    ];
    this.pokedexService.markWon(wonIds);   // ← INSERT HERE
    this.gameStateService.advanceRound();
  } else {
    this.gameStateService.setNextState('game-over');
  }
  this.finishCurrentState();
}
```

#### Constructor Addition

```typescript
// Add to constructor parameters (alphabetical by variable name is convention):
constructor(
  private evolutionService: EvolutionService,
  private gameStateService: GameStateService,
  private itemService: ItemsService,
  private pokemonService: PokemonService,
  private pokedexService: PokedexService,    // ← ADD THIS
  private translateService: TranslateService,
  private trainerService: TrainerService,
  private modalService: NgbModal,
  private modalQueueService: ModalQueueService,
  private soundFxService: SoundFxService,
  private settingsService: SettingsService,
  private pokemonFormsService: PokemonFormsService,
  private rareCandyService: RareCandyService) {
```

#### Import Addition

```typescript
// Add to imports at top of roulette-container.component.ts:
import { PokedexService } from '../../services/pokedex-service/pokedex.service';
```

### Anti-Patterns to Avoid

- **Coupling PokedexService to TrainerService:** PokedexService must NOT import or depend on TrainerService. IDs are passed in as primitive `number` values — one-way push only.
- **Calling `markWon` outside the `if (result)` guard:** markWon must only fire when result is `true`. Calling it unconditionally would mark all Pokémon as won on a game-over loss.
- **Hooking `resetGame()` to clear Pokédex:** `resetGameAction()` at line 645 emits `resetGameEvent` — the Pokédex service must NOT subscribe to this event. DATA-04 is explicit: Pokédex is cumulative.
- **Using `Set<number>` internally with array in storage:** D-01 locks the schema to `Record<string, PokedexEntry>` (not a separate seen/won array). Use this schema from day one.
- **Using spread operator on PokedexData for `markSeen` no-op check:** Always check if `caught[key]` exists before mutating; skipping the no-op guard causes unnecessary localStorage writes and BehaviorSubject emissions.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reactive state management | Custom event emitter / callback chain | `BehaviorSubject` (RxJS, already installed) | Synchronous `.getValue()` + async `.asObservable()` in one; same as SettingsService |
| localStorage read error handling | Custom JSON validation | `try/catch` around `JSON.parse()` with `console.error` fallback | Matches exact codebase pattern; simple and sufficient |
| Sprite URL resolution | HTTP call to PokeAPI | Deterministic URL construction | `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png` is stable; no network round-trip needed |
| Session-scoped dedup | localStorage read on every `markSeen` | `Map<number, string>` in-memory cache | O(1) lookup; resets on page refresh (correct behavior) |

**Key insight:** This phase is 100% "plumbing" work. Every primitive needed (BehaviorSubject, localStorage, RxJS pipes) is already installed. The risk is in getting the small details wrong (null assignment order in Team Rocket hook, markWon guard condition), not in choosing wrong technology.

---

## ⚠️ Coverage Gap: Nincada/Shedinja (Line 713)

**Research finding — requires planner decision:**

There is a **third direct `addToTeam` call** at line 713 that is NOT covered by the two locked hook sites:

```typescript
// src/app/main-game/roulette-container/roulette-container.component.ts, line 706-721
private evolveSecondPokemon(pokemon: PokemonItem): void {
  const pokemonEvolutions = this.evolutionService.getEvolutions(pokemon);

  if (pokemonEvolutions.length === 1) {
    this.replaceForEvolution(pokemon, pokemonEvolutions[0]);
  } else if (pokemon.pokemonId === this.NINCADA_ID) {   // NINCADA_ID = 290
    this.replaceForEvolution(pokemon, pokemonEvolutions[0]);  // → Ninjask (291)
    this.trainerService.addToTeam(pokemonEvolutions[1]);      // → Shedinja (292) — UNCOVERED
  } else { ... }
}
```

**When this fires:** When Nincada (#290) evolves, it becomes Ninjask (#291) AND Shedinja (#292) is added as a bonus team member. The Shedinja `addToTeam` call bypasses both `completePokemonCapture()` and `teamRocketDefeated()`.

**Impact on DATA-01:** If not hooked, Shedinja (#292) obtained via Nincada evolution would NOT appear in the Pokédex as "seen."

**Planner options:**
1. Add a third `markSeen` hook: `this.pokedexService.markSeen(pokemonEvolutions[1].pokemonId)` immediately after line 713
2. Accept the gap — Nincada evolution is a rare case; Nincada itself IS tracked when initially caught via `completePokemonCapture()`

**Recommendation:** Option 1 — add the third hook. It's a single line and fully closes DATA-01 coverage. The CONTEXT.md didn't anticipate this path; it should be included.

---

## ⚠️ Additional Finding: Trade Path (performTrade at Line 560)

`performTrade()` at line 560 calls `this.trainerService.performTrade(...)` which swaps an existing team slot with a new Pokémon. The new Pokémon IS on the team after this call, but it does NOT go through `completePokemonCapture()` or `addToTeam()` — it calls `TrainerService.replaceForEvolution()` equivalent.

**Assessment:** The CONTEXT.md locked decisions do not include this path. Whether the traded-in Pokémon should be "seen" is a game design question. Given that the player explicitly receives this Pokémon and it becomes a team member, DATA-01 ("assigned to player's team by the roulette") could be interpreted to include trades.

**Planner decision needed:** Add `markSeen(this.pkmnIn.pokemonId)` after `this.trainerService.performTrade(...)` at line 560, or explicitly exclude trades from Pokédex tracking. `pkmnIn` is set at line 557 and holds the received Pokémon.

---

## Common Pitfalls

### Pitfall 1: Team Rocket null assignment order
**What goes wrong:** Calling `markSeen(this.stolenPokemon.pokemonId)` AFTER `this.stolenPokemon = null` throws `Cannot read properties of null`.
**Why it happens:** `stolenPokemon` is nulled at line 536 immediately after the `addToTeam` call; a hook placed below that null assignment silently breaks.
**How to avoid:** Place the `markSeen` call at line 534 — after `addToTeam` at 533, before the `null` assignment at 536.
**Warning signs:** TypeScript will not catch this at compile time since `stolenPokemon` is typed `PokemonItem | null` — only a runtime NullPointerException at the Team Rocket encounter.

### Pitfall 2: markWon called on game-over (result: false)
**What goes wrong:** All Pokémon in team get `won: true` even when the player loses the Champion battle.
**Why it happens:** Placing `markWon` outside the `if (result)` block, or negating the condition.
**How to avoid:** `markWon` call must be the FIRST statement inside `if (result) { ... }`.
**Warning signs:** After a Champion loss, Pokémon appear with a won-star in the Pokédex (Phase 2 visual regression).

### Pitfall 3: localStorage key collision
**What goes wrong:** Using `'pokemon-roulette-settings'` or any existing key for the Pokédex.
**Why it happens:** Copying from SettingsService without updating `STORAGE_KEY`.
**How to avoid:** Verify `STORAGE_KEY = 'pokemon-roulette-pokedex'` — distinct from `'pokemon-roulette-settings'` and `'dark-mode'`.
**Warning signs:** Settings stop persisting after starting a game (overwritten by Pokédex JSON).

### Pitfall 4: `PokedexData.caught` initialized as array instead of Record
**What goes wrong:** `JSON.parse` of stored data fails silently or produces wrong shape if `caught` was ever stored as `[]` instead of `{}`.
**Why it happens:** Confusion between "seen list" (array of IDs) and "caught record" (per-ID object).
**How to avoid:** Use `defaultPokedex = { caught: {} }` (empty object, not array). On `getPokedexFromStorage`, validate shape before returning: if `!parsed.caught || Array.isArray(parsed.caught)` → return null (triggers fallback).
**Warning signs:** `caught[id]` returns `undefined` for every ID despite prior sessions; Pokédex appears empty after reload.

### Pitfall 5: BehaviorSubject initialized before localStorage read completes
**What goes wrong:** N/A for synchronous `localStorage.getItem()` — but if future async storage is introduced, the BehaviorSubject would emit the default state before real data arrives.
**Why it happens:** Not a risk for this phase (localStorage is synchronous).
**How to avoid:** Keep implementation synchronous as in `SettingsService`. The `BehaviorSubject` is initialized in the constructor with `this.getInitialPokedex()` — both are synchronous. No async/await needed.

---

## Code Examples

### Verified SettingsService localStorage read pattern
```typescript
// Source: src/app/services/settings-service/settings.service.ts (lines 72–88)
private getSettingsFromStorage(): Partial<GameSettings> | null {
  const storageItem = localStorage.getItem(this.STORAGE_KEY);
  if (storageItem) {
    try {
      return JSON.parse(storageItem);
    } catch (error) {
      console.error(
        'Invalid settings localStorage item:',
        storageItem,
        'falling back to default settings'
      );
    }
  }
  return null;
}
```

### getTeam() and getStored() return types
```typescript
// Source: src/app/services/trainer-service/trainer.service.ts (lines 114–123)
getTeam(): PokemonItem[] {
  return this.trainerTeam;  // max 6 Pokémon
}

getStored(): PokemonItem[] {
  return this.storedPokemon;  // PC box — can hold many
}

// PokemonItem.pokemonId is number (confirmed from src/app/interfaces/pokemon-item.ts)
// Usage in markWon:
const wonIds = [
  ...this.trainerService.getTeam().map(p => p.pokemonId),
  ...this.trainerService.getStored().map(p => p.pokemonId)
];
```

### Deterministic sprite URL
```typescript
// No HTTP call needed. URL is stable for all 1,025 Pokémon IDs including Gen 9.
// Confirmed from prior research: IDs 1011, 1018, 1019 (Gen 9 non-sequential) use same pattern.
const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`;
// Example: pokemonId=1011 → https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1011.png
```

### Existing roulette-container import block (for reference)
```typescript
// Source: src/app/main-game/roulette-container/roulette-container.component.ts (lines 1–51)
// Current imports (12 service injections in constructor):
import { SettingsService } from '../../services/settings-service/settings.service';
import { TrainerService } from '../../services/trainer-service/trainer.service';
// ... etc.

// Relative path for new PokedexService import:
import { PokedexService } from '../../services/pokedex-service/pokedex.service';
```

---

## Environment Availability

Step 2.6: SKIPPED — Phase 1 is code/config-only changes. No external tools, services, or CLIs are required beyond the existing Angular/Node.js toolchain already confirmed in the project.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Karma 6.4.4 + Jasmine 6.1.0 |
| Config file | `angular.json` (lines 76-96) |
| Quick run command | `ng test --include="**/pokedex.service.spec.ts" --no-watch --browsers=ChromeHeadless` |
| Full suite command | `npm test` (runs all `*.spec.ts` files) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | `markSeen(pokemonId)` creates entry in `caught` | unit | `ng test --include="**/pokedex.service.spec.ts" --no-watch --browsers=ChromeHeadless` | ❌ Wave 0 |
| DATA-01 | `markSeen` is idempotent (called twice → one entry) | unit | same | ❌ Wave 0 |
| DATA-02 | `markWon([1,2,3])` sets `won: true` on entries | unit | same | ❌ Wave 0 |
| DATA-02 | `markWon` also marks unseen Pokémon as seen | unit | same | ❌ Wave 0 |
| DATA-03 | After `markSeen`, localStorage contains `pokemon-roulette-pokedex` key | unit | same | ❌ Wave 0 |
| DATA-03 | Constructor reads from localStorage on initialization | unit | same | ❌ Wave 0 |
| DATA-04 | Service has no dependency on TrainerService (no import) | static | TypeScript compile | ❌ Wave 0 |
| DATA-05 | `caught[id].sprite` is populated on `markSeen` | unit | same | ❌ Wave 0 |
| DATA-06 | `spriteCache.has(pokemonId)` is true after first `markSeen` | unit | same | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `ng test --include="**/pokedex.service.spec.ts" --no-watch --browsers=ChromeHeadless`
- **Per wave merge:** `npm test` (full suite — confirm existing tests still pass)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/app/services/pokedex-service/pokedex.service.spec.ts` — covers DATA-01 through DATA-06 unit tests
- [ ] `src/app/services/pokedex-service/pokedex.service.ts` — the service file itself (new directory)

*(Note: `roulette-container.component.spec.ts` already exists at `src/app/main-game/roulette-container/roulette-container.component.spec.ts` — existing test for "should create" will continue to compile if constructor injection is added correctly; no new tests needed for the hook sites since they are single-line calls.)*

---

## Project Constraints (from copilot-instructions.md)

| Directive | Category | Impact on Phase 1 |
|-----------|----------|-------------------|
| Angular 21 + Bootstrap 5 + ng-bootstrap — no new UI frameworks | Tech stack | ✅ Phase 1 has no UI; constraint not triggered |
| Pokédex data must survive game resets | Data integrity | `PokedexService` must NOT be imported by or responsive to `TrainerService.resetTeam()` |
| Must work on GitHub Pages (static, no server) | Deployment | localStorage only; no server-side calls — already the approach |
| Sprites loaded lazily on demand (not all at once) | Performance | Phase 1 stores sprite URLs; deferred loading is Phase 2 concern |
| 2 spaces indentation, single quotes, final newline (EditorConfig) | Style | Apply to `pokedex.service.ts` |
| `@Injectable({ providedIn: 'root' })` for singleton services | Angular | Apply to `PokedexService` |
| Observable fields suffixed with `$` | Naming | `pokedexSubject$`, `pokedex$` ✅ |
| Private fields use `private` keyword (no leading underscore) | Naming | `private pokedexSubject$` ✅ |
| camelCase for methods and properties | Naming | `markSeen`, `markWon`, `currentPokedex` ✅ |
| GSD workflow — no direct edits outside GSD commands | Workflow | Planning artifacts managed via GSD |

---

## Sources

### Primary (HIGH confidence)
- Live codebase: `src/app/services/settings-service/settings.service.ts` — BehaviorSubject + localStorage pattern, try/catch on read, no try/catch on write
- Live codebase: `src/app/services/dark-mode-service/dark-mode.service.ts` — secondary localStorage service pattern with `getInitialValue()`
- Live codebase: `src/app/main-game/roulette-container/roulette-container.component.ts` — Hook sites at lines 533 (teamRocketDefeated), 628 (championBattleResult), 684 (completePokemonCapture), 713 (Nincada special case)
- Live codebase: `src/app/services/trainer-service/trainer.service.ts` — `getTeam()` at line 114, `getStored()` at line 122, `addToTeam()` at line 84 (all usages audited)
- Live codebase: `src/app/interfaces/pokemon-item.ts` — `pokemonId: number` confirmed as the key field
- `.planning/research/SUMMARY.md` — prior domain research confirming sprite URL pattern and architecture approach

### Secondary (MEDIUM confidence)
- `.planning/phases/01-service-game-hooks/01-CONTEXT.md` — locked design decisions (all decisions verified against codebase during this research)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified as already installed; no new dependencies
- Architecture patterns: HIGH — verified exact line numbers from live codebase; SettingsService pattern copied verbatim
- Pitfalls: HIGH — derived directly from code inspection; null assignment order and result guard confirmed via code reading
- Coverage gaps: HIGH — third `addToTeam` call at line 713 verified; trade path at line 560 confirmed

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable codebase; roulette-container line numbers may drift if major refactors occur)

---

## Open Questions

1. **Nincada/Shedinja coverage (line 713)**
   - What we know: A direct `addToTeam(pokemonEvolutions[1])` at line 713 bypasses `completePokemonCapture()`; Shedinja (#292) would not be tracked as "seen"
   - What's unclear: Whether the CONTEXT.md intentionally excluded this path or simply didn't anticipate it
   - Recommendation: Add a third `markSeen` hook at line 713 — one line of code, fully closes DATA-01 coverage

2. **Trade path coverage (performTrade at line 560)**
   - What we know: `performTrade()` adds a new Pokémon to the team slot but doesn't go through `addToTeam()`; traded-in Pokémon is `this.pkmnIn`
   - What's unclear: Whether "assigned to team by the roulette" (DATA-01) includes manual trade outcomes
   - Recommendation: Include — player receives this Pokémon as a result of a roulette outcome (the trade roulette); add `markSeen(this.pkmnIn.pokemonId)` after line 560

3. **localStorage write error handling (agent's discretion)**
   - What we know: `SettingsService.saveSettingsToStorage()` does NOT wrap `localStorage.setItem()` in try/catch; writes can throw `QuotaExceededError` on mobile WebKit
   - What's unclear: Whether Phase 1 should add write-side error handling that `SettingsService` doesn't have
   - Recommendation: Add `try/catch` around `localStorage.setItem()` in `savePokedexToStorage()` with `console.error` — the Pokédex data is larger and more valuable than settings; the extra safety is worth the 3 lines

4. **markWon: team-only vs team+stored**
   - What we know: `getTeam()` returns active team (max 6); `getStored()` returns PC box (unlimited); CONTEXT.md says agent may choose
   - Recommendation: Use both — if a player sends a Pokémon to storage to make room and then defeats the Champion, that Pokémon contributed to the victory; fairness argues for including stored Pokémon

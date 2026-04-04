# Phase 1: Service & Game Hooks — Context

**Gathered:** 2026-04-03
**Status:** Ready for planning

<domain>
## Phase Boundary

Create `PokedexService` — the data layer for the Pokédex feature. No UI is built in this phase.

Deliverables:
- New `PokedexService` (`src/app/services/pokedex-service/pokedex.service.ts`) with localStorage persistence and a reactive Observable
- Two game hooks in `roulette-container.component.ts`: `markSeen` on Pokémon assignment (both regular capture and Team Rocket steal), and `markWon` on Champion defeat

Success is verifiable via DevTools → Application → Local Storage before any UI exists.

</domain>

<decisions>
## Implementation Decisions

### localStorage Schema

- **D-01:** Use a **unified per-Pokémon record** structure:
  ```json
  {
    "caught": {
      "1":  { "won": false, "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" },
      "25": { "won": true,  "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png" }
    }
  }
  ```
  - An entry in `caught` means the Pokémon is **seen** (assigned to team at any point)
  - `won: true` means the Pokémon was on the team when the Champion was defeated
  - `sprite` holds the cached `front_default` URL (or `null` if the fetch hasn't completed yet)
  - TypeScript interface: `interface PokedexEntry { won: boolean; sprite: string | null }`
  - TypeScript interface: `interface PokedexData { caught: Record<string, PokedexEntry> }`

- **D-02:** localStorage key: `'pokemon-roulette-pokedex'` — consistent with existing `'pokemon-roulette-settings'` naming convention

### Sprite Fetch & Caching

- **D-03:** Fetch the `front_default` sprite URL **immediately on `markSeen`** — do not defer to Pokédex open time
  - Use `pokemonService.getPokemonSprites(pokemonId)` — it already fetches the sprite object
  - Actually: use the deterministic PokeAPI URL directly: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png` — no HTTP call needed, just compute the URL
  - Store the URL in `caught[id].sprite` immediately in localStorage
  - In-memory dedup cache: `private readonly spriteCache = new Map<number, string>()` — if a Pokémon is caught twice in a session, the URL is already known, no recomputation needed

- **D-04:** The `sprites.front_default` URL pattern from PokeAPI is deterministic — the service should compute it locally rather than making an HTTP call for the sprite URL

### Game Hooks

- **D-05:** Hook 1 — `markSeen(pokemonId: number)` called in **two places** in `roulette-container.component.ts`:
  1. `completePokemonCapture()` at line ~685 — immediately after `this.trainerService.addToTeam(pokemon)`
  2. Team Rocket steal at line ~533 — immediately after `this.trainerService.addToTeam(this.stolenPokemon)`
  - Both paths add a Pokémon to the team; both should count as "seen" for Pokédex purposes

- **D-06:** Hook 2 — `markWon(pokemonIds: number[])` called in `championBattleResult(result: boolean)` when `result === true`, before `finishCurrentState()`
  - Pass `this.trainerService.getTeam().map(p => p.pokemonId)` plus `this.trainerService.getStored().map(p => p.pokemonId)` — all Pokémon the player has (team + PC storage) count as won
  - Actually: only active team? Discuss: the simplest interpretation is all Pokémon the player owns at time of victory, i.e. `getTeam()` + `getStored()`

### Service Reactivity

- **D-07:** Expose a **reactive Observable** now: `pokedex$: Observable<PokedexData>` backed by `BehaviorSubject<PokedexData>`, following the exact pattern of `SettingsService.settings$`
  - `get pokedex$(): Observable<PokedexData>` — public getter
  - BehaviorSubject is updated every time `markSeen` or `markWon` mutates state
  - This allows Phase 3's progress counters to derive counts reactively via `async` pipe without any additional wiring

### Service Structure

- **D-08:** Follow `SettingsService` exactly as the blueprint:
  - `private readonly STORAGE_KEY = 'pokemon-roulette-pokedex'`
  - `private pokedexSubject$: BehaviorSubject<PokedexData>`
  - Constructor reads from localStorage (try/catch, fallback to empty state)
  - `private updatePokedex(data: PokedexData): void` — saves to localStorage + emits next
  - `markSeen(pokemonId: number): void` — public mutation method
  - `markWon(pokemonIds: number[]): void` — public mutation method
  - `get currentPokedex(): PokedexData` — synchronous getter

### the agent's Discretion

- Whether `markWon` receives only `getTeam()` IDs or `getTeam() + getStored()` IDs — agent should use all owned Pokémon (team + storage) for maximum fairness, but may choose based on game logic review
- Error handling strategy for localStorage write failures (quota exceeded) — agent decides logging vs silent fail, consistent with existing pattern in `SettingsService`
- Whether to add a `clearPokedex()` method for future use — agent may add it as a private-or-public no-op stub if it helps future phases, but it must NOT be called from `resetGame()`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing Service Blueprints (copy these patterns exactly)
- `src/app/services/settings-service/settings.service.ts` — **Primary blueprint**: BehaviorSubject + localStorage pattern, STORAGE_KEY convention, try/catch parse, updateSettings() private method
- `src/app/services/dark-mode-service/dark-mode.service.ts` — Secondary blueprint: localStorage pattern with getInitialValue()

### Hook Integration Points
- `src/app/main-game/roulette-container/roulette-container.component.ts` — Contains both hook sites:
  - `completePokemonCapture()` ~line 684 — markSeen hook goes here
  - Team Rocket steal ~line 533 — second markSeen hook goes here
  - `championBattleResult(result: boolean)` ~line 628 — markWon hook goes here

### Data Interfaces
- `src/app/interfaces/pokemon-item.ts` — PokemonItem interface (pokemonId: number is the key field)
- `src/app/services/trainer-service/trainer.service.ts` — getTeam() and getStored() methods for markWon

### Requirements
- `.planning/REQUIREMENTS.md` — DATA-01 through DATA-06 are the acceptance criteria for this phase

</canonical_refs>

<specifics>
## Specific Ideas

- The `front_default` sprite URL is deterministic: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png` — no HTTP call needed, just compute it
- The `unknown.png` URL (for unseen Pokémon in the UI) is: `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png` — this is referenced in Phase 2, not Phase 1
- The in-memory sprite dedup cache uses pokemonId as key (number, matching pokemonId field on PokemonItem)

</specifics>

<deferred>
## Deferred Ideas

- A `clearPokedex()` / reset method — deferred to a future phase; must NOT be called from `resetGame()` per requirements
- Shiny sprite tracking in the Pokédex — explicitly out of scope per PROJECT.md
- Per-generation completion stats — Phase 3 concern, not Phase 1

</deferred>

---
*Phase: 01-service-game-hooks*
*Context gathered: 2026-04-03 via /gsd-discuss-phase 1*

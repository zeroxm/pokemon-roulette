# Phase 8: Service Hardening - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure phase — pure service-layer, no user-facing behavior)

<domain>
## Phase Boundary

Fix 5 independent service-layer issues: a bounds check, a dead-code removal, an O(n)→Map performance fix, immutable accessor returns, and a data-driven state stack. All changes are internal implementation details — no API surface changes, no template changes, no i18n changes.

</domain>

<decisions>
## Implementation Decisions

### BADGE-01 — Bounds check in BadgesService.getBadge()
- Current: `this.badgesByGeneration[generation.id][fromRound]` — crashes if generation.id not in map or fromRound out of range
- Fix: guard with `if (!this.badgesByGeneration[generation.id] || this.badgesByGeneration[generation.id][fromRound] === undefined)` → log warning + return `of(undefined as unknown as Badge)` (same shape as success path)
- Preserve existing return type `Observable<Badge>` — callers aren't typed to handle undefined, but a graceful fallback prevents runtime crashes

### CLEAN-01 — Remove self-assignment in TrainerService.replaceForEvolution()
- `pokemonIn = pokemonIn;` at line 164 — delete this single line
- No other changes needed — the line above (`pokemonIn.shiny = pokemonOut.shiny;`) is the correct shiny propagation

### LOOKUP-01 — Persistent Map in PokemonService
- Add `private readonly pokemonById: Map<number, PokemonItem>` built in constructor: `new Map(this.nationalDexPokemon.map(p => [p.pokemonId, p]))`
- Replace `getPokemonById()` body: `return this.pokemonById.get(pokemonId)` (already returns `PokemonItem | undefined`)
- Also update `getPokemonByIdArray()` to use `this.pokemonById` instead of building a local Map each call (it already builds a throwaway Map — replace with the persistent one)

### IMMUT-01 — Immutable accessors in TrainerService
- `getTeam()`: return `[...this.trainerTeam]` instead of `this.trainerTeam`
- `getStored()`: return `[...this.storedPokemon]` instead of `this.storedPokemon`
- Shallow copy is sufficient — prevents external mutation from bypassing BehaviorSubject notifications
- Internal code that mutates `this.trainerTeam` directly is fine — all such code is within TrainerService itself
- NOTE: `removeFromTeam()` uses `this.trainerTeam.indexOf(pokemon)` with the live array before calling `splice()` — this internal access is correct and unaffected by getTeam() returning a copy

### STATE-01 — Data-driven state stack in GameStateService
- Define `const GENERATION_GAME_CONFIG: Record<number, { gymCount: number; eliteFourCount: number }>` at top of file (or a separate data file) with entries for generations 1-9
- All 9 generations have 8 gyms (confirmed from badges-data.ts: 8 badges per generation) and 4 Elite Four members
- Modify `initializeStates()` to accept `gymCount` and `eliteFourCount` params (defaulting to 8 and 4 for backward compat)
- Build stack programmatically: start with `['game-finish', 'champion-battle']`, then `eliteFourCount` × `'elite-four-battle'`, then `'elite-four-preparation'`, then `gymCount` × `['gym-battle', 'adventure-continues']` (alternating, skipping last `'adventure-continues'`), then `['start-adventure', 'starter-pokemon', 'character-select']`
- Inject `GenerationService` into `GameStateService` constructor to read current generation when `resetGameState()` is called — `initializeStates(config.gymCount, config.eliteFourCount)` where config comes from `GENERATION_GAME_CONFIG[this.generationService.getCurrentGeneration().id]`
- Constructor call uses Gen 1 default (current generation at boot = Gen 1)
- `resetGameState()` reads current generation from `GenerationService` and passes its config to `initializeStates()`

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `BadgesService.badgesByGeneration`: `Record<number, (Badge | Badge[])[]>` — all 9 generations have exactly 8 entries (confirmed)
- `PokemonService.nationalDexPokemon`: 14k+ entry array; `getPokemonByIdArray()` already builds a throwaway Map — replace both with the persistent one
- `TrainerService`: internal arrays are `trainerTeam: PokemonItem[]` and `storedPokemon: PokemonItem[]` (public fields), observable is `trainerTeamObservable: BehaviorSubject<PokemonItem[]>`
- `GameStateService.resetGameState()`: called from `main-game.component.ts:82` after generation is selected in the wheel — generation is set before reset is called
- `GenerationService.getCurrentGeneration()`: returns current `GenerationItem` synchronously — safe to inject

### Established Patterns
- Injectable services use constructor injection
- `Observable<T>` return types use `of()` for synchronous values
- BehaviorSubject `.next()` pattern for emitting updates

### Integration Points
- `badges.service.ts`: `getBadge(generation, fromRound, fromLeader)` — add guard before line 18
- `trainer.service.ts:114,122,164` — `getTeam()`, `getStored()`, `replaceForEvolution()` (self-assignment)
- `pokemon.service.ts:12,39,44` — constructor, `getPokemonById()`, `getPokemonByIdArray()`
- `game-state.service.ts:20-51` — constructor + `initializeStates()` + `resetGameState()`
- `GenerationService` circular dep check: `generation.service.ts` imports nothing from game-state — safe to inject GameStateService dependency on GenerationService

</code_context>

<specifics>
## Specific Ideas

- For STATE-01: the alternating gym/adventure pattern is: read bottom-up (stack pop) = character-select → starter → start-adventure → gym-1 → adventure → gym-2 → ... → gym-N → elite-four-prep → E4×4 → champion → finish. Build array in reverse order (push order = pop order reversed).
- For LOOKUP-01: `getPokemonByIdArray` can replace its inner `new Map(...)` with `this.pokemonById` directly.
- For BADGE-01: return type can stay `Observable<Badge>` with internal undefined guard — callers already handle the observable subscription pattern.

</specifics>

<deferred>
## Deferred Ideas

- Making `trainerTeam` and `storedPokemon` fully private (would require more extensive refactor of callers)
- Adding Elite Four count per-generation variance (all 9 generations have 4 E4 members)

</deferred>

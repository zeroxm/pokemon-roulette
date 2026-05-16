# M001: Mega Evolution

**Gathered:** 2025-01-16
**Status:** Ready for planning

## Project Description

Pokémon Roulette is an Angular-based adventure game where players spin wheels to drive every decision. This milestone adds Mega Evolution: a post-battle stone reward system and a per-battle temporary transformation with a cinematic animation.

## Why This Milestone

Mega Evolution is a major Pokémon mechanic not yet present. It adds a meaningful progression reward (stones accumulate over the run), a dramatic battle-entry moment (the animation), and a real power boost in battle odds.

## User-Visible Outcome

### When this milestone is complete, the user can:

- Win a gym/elite-four/champion battle and receive a mega stone in their items if a mega-capable Pokémon is on the team
- See a wheel spin to determine which mega stone they receive when multiple candidates exist
- Watch their Pokémon undergo a cinematic Mega Evolution animation before the next battle starts
- See the Mega form used in battle with power = 5, then revert to base form after the battle

### Entry point / environment

- Entry point: Running Angular dev server (`ng serve`)
- Environment: Browser, local dev
- Live dependencies involved: PokeAPI sprites (existing pattern), ModalQueueService, GameStateService

## Completion Class

- Contract complete means: TypeScript compiles clean, mega stone items exist in itemsData, mega forms data file exports correct structure, applyBattleForms applies the mega form when stone is held
- Integration complete means: Full battle cycle works — win battle → stone awarded → enter next battle → animation plays → mega form active → battle ends → form reverted
- Operational complete means: none (no service lifecycle concerns)

## Final Integrated Acceptance

- Win a gym battle with a mega-capable Pokémon → mega stone appears in trainer items
- Enter the next battle → animation modal opens before leader presentation → Pokémon shows Mega form in team display, power = 5
- Battle ends → Pokémon reverts to base form, stone stays in inventory

## Architectural Decisions

### Mega forms as temporary battle forms

**Decision:** Mega Evolution uses the existing `temporaryBattleForms` / `applyBattleForms` / `revertBattleForms` pattern in TrainerService, keyed by stone possession check.

**Rationale:** The Palafin pattern already handles temporary battle-entry swaps cleanly. Extending it avoids a parallel system.

**Alternatives Considered:**
- Sticky forms — rejected because mega forms revert after battle
- New parallel service — unnecessary given existing infrastructure

### Mega stone selection for animation

**Decision:** When the player holds multiple mega stones with matching team Pokémon, a wheel (reusing `PokemonFromAuxListRouletteComponent`) fires before the battle-start modal via ModalQueueService. The selected Pokémon is stored in a transient field and consumed by `applyBattleForms`.

**Rationale:** Consistent with the game's roulette-first philosophy; same pattern as evolution and trade selection.

### Animation delivery

**Decision:** Mega Evolution animation is a standalone Angular component rendered inside a ModalQueueService modal. CSS keyframe animations drive the sphere, crack, reveal, and icon-dissolve stages.

**Rationale:** No canvas needed — CSS transforms/keyframes are sufficient and keep the implementation in the existing style stack.

### Mega stone items

**Decision:** Each mega stone is a distinct `ItemName` entry (e.g., `'venusaurite'`), stored as a regular `ItemItem` in `trainerItems`. The `pokemon-mega-forms.ts` data file maps base Pokémon ID → stone name + mega form `PokemonItem[]`.

**Rationale:** Reuses existing item infrastructure (add, remove, hasItem, getItem). Stone uniqueness is enforced by checking `hasItem` before awarding.

## Error Handling Strategy

- If PokeAPI sprite fetch fails for a mega form, fall back silently (existing `loadPokemonSpriteIfMissing` pattern)
- Mega stone and icon sprites use `/assets/unknown.png` statically — no fetch, no error path
- If the team has no mega-capable Pokémon when checking for stone award, fall through to existing alt-prize logic

## Risks and Unknowns

- Animation complexity — CSS sphere-crack effect needs careful keyframe sequencing; may require iteration to feel "very VERY cool"
- ItemName union is a TypeScript string literal type — adding ~100 stone names is mechanical but verbose; must not miss any from the JSON
- `applyBattleForms` currently runs synchronously on game state change; injecting a wheel-spin async step before it requires care to not double-apply

## Existing Codebase / Prior Art

- `src/app/services/trainer-service/trainer.service.ts` — `applyBattleForms`, `revertBattleForms`, `temporaryBattleForms`; extend here
- `src/app/services/trainer-service/palafin-forms.ts` — structural template for `pokemon-mega-forms.ts`
- `src/app/services/trainer-service/pokemon-forms-mega-primal.json` — source data to convert
- `src/app/main-game/roulette-container/roulettes/pokemon-from-aux-list-roulette/` — wheel for selecting from a list; reuse for stone candidate selection
- `src/app/services/modal-queue-service/modal-queue.service.ts` — serializes modals; mega animation modal queues before leader presentation
- `src/app/main-game/roulette-container/roulettes/base-battle-roulette/base-battle-roulette.component.ts` — `onGameStateChange` is where battle-entry hook lives
- `src/app/services/items-service/item-names.ts` — must extend with all mega stone names
- `src/app/services/items-service/items-data.ts` — must add entries for each stone
- `src/app/main-game/roulette-container/roulette-container.component.ts` — owns post-battle result handlers (`gymBattleResult`, `eliteFourBattleResult`, `championBattleResult`); stone award logic goes here

## Relevant Requirements

- R001 — post-battle stone award (S02)
- R002 — wheel when multiple candidates (S02)
- R003 — triggers before battle modal (S03, S04)
- R004 — one mega per battle, wheel if ambiguous (S03)
- R005 — cinematic animation (S04)
- R006 — reverts after battle (S03)
- R007 — permanent per-species stone (S01, S02)
- R008 — power = 5 (S03)
- R009 — unknown.png fallback (S01)

## Scope

### In Scope

- `pokemon-mega-forms.ts` data file (converted from JSON)
- All mega stone `ItemName` entries and `itemsData` records
- Post-battle stone award logic in `roulette-container.component.ts`
- Wheel-based selection when multiple mega candidates exist (award and battle-entry)
- Mega form application via `applyBattleForms` conditioned on stone possession
- Revert via `revertBattleForms`
- Mega Evolution animation modal (sphere → crack → reveal → icon dissolve)
- Animation queued before leader presentation modal

### Out of Scope / Non-Goals

- Permanent mega evolution
- Multiple simultaneous mega-evolutions per battle
- Primal Reversion treated differently from Mega (same code path)
- Real mega stone sprites (unknown.png is the fallback, not a blocker)

## Technical Constraints

- `ItemName` is a TypeScript string literal union — all stone names must be added before they can be referenced
- Angular standalone component architecture — new components must declare their own imports
- ModalQueueService queue is promise-based; the mega modal must resolve/dismiss before the leader modal opens naturally

## Integration Points

- `TrainerService.applyBattleForms` / `revertBattleForms` — extended to check stone inventory
- `BaseBattleRouletteComponent.onGameStateChange` — fires the pre-battle mega selection/animation
- `RouletteContainerComponent.gymBattleResult` / `eliteFourBattleResult` / `championBattleResult` — fire the post-battle stone award

## Testing Requirements

Manual verification via dev server. Key scenarios:
1. Team with one mega-capable Pokémon, no stone → win battle → stone appears in items
2. Team with multiple mega-capable Pokémon → win battle → wheel spins → correct stone awarded
3. Hold stone + matching Pokémon on team → enter battle → animation plays → mega form shown (power = 5 in odds)
4. Hold stones for multiple Pokémon → enter battle → wheel picks one → that one mega-evolves
5. Battle ends → Pokémon reverts → stone still in inventory

## Acceptance Criteria

- S01: `pokemon-mega-forms.ts` exports all entries from JSON; all stone `ItemName`s compile; `itemsData` has records for all stones with `unknown.png` sprite
- S02: Winning a battle awards a mega stone to trainer items; wheel fires when multiple candidates; no duplicate stones awarded
- S03: Entering a battle state with a stone + team Pokémon triggers the mega form swap; only one Pokémon mega-evolves; form reverts on battle exit; power = 5 reflected in victory odds
- S04: Animation modal opens before leader modal; sphere → crack → reveal → icon dissolve plays in sequence; modal dismisses automatically after animation completes

## Open Questions

- None — all decisions confirmed.

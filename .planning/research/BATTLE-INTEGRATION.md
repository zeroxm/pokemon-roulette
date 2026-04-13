# Battle Roulette Integration Architecture Research

**Project:** Pokémon Roulette — Type Matchup Wheel Weight Feature
**Researched:** 2025
**Scope:** GymBattleRouletteComponent, EliteFourBattleRouletteComponent, WheelComponent, ModalQueueService, TrainerService

---

## 1. How Wheel Weights Work

**Answer: Purely additive — add more WheelItem entries, never mutate `.weight`.**

The `WheelItem` interface has a `weight: number` field, but in practice every entry in the battle roulettes uses `weight: 1`. The wheel is proportional by **entry count**, not by the weight value on individual items.

### How the WheelComponent uses weight

In `drawWheel()`, segment arc size is:
```ts
const totalWeight = this.getTotalWeights();        // sum of all item.weight
const arcSize = (2 * Math.PI) / totalWeight;       // base arc unit
const segmentSize = arcSize * item.weight;         // each item's slice
```

`getRandomWeightedIndex()` accumulates weights similarly. So `weight: 2` on one item would give it a double arc. But **neither battle component uses weight > 1 today** — they achieve probability by pushing more entries:

```ts
// calcVictoryOdds() in both components — weight is always 1
for (let i = 0; i < pokemon.power; i++) {
  yesOdds.push({ text: "game.main.roulette.gym.yes", fillStyle: "green", weight: 1 });
}
```

### Implication for type matchup

To add type matchup odds, push additional `yes` or `no` items into `yesOdds` / `noOdds` inside `calcVictoryOdds()`:

```ts
// After the power loop, before interleaveOdds()
const typeBonus = this.calcTypeMatchupBonus();   // +3, +2, 0, -1, -2 (negative = add no entries)
if (typeBonus > 0) {
  for (let i = 0; i < typeBonus; i++) {
    yesOdds.push({ text: "game.main.roulette.gym.yes", fillStyle: "green", weight: 1 });
  }
} else if (typeBonus < 0) {
  for (let i = 0; i < Math.abs(typeBonus); i++) {
    noOdds.push({ text: "game.main.roulette.gym.no", fillStyle: "crimson", weight: 1 });
  }
}
this.victoryOdds = interleaveOdds(yesOdds, noOdds);
```

The wheel auto-redraws: `WheelComponent.ngOnChanges` watches `@Input() items` and redraws when it changes (excluding firstChange). Assigning a new array to `this.victoryOdds` triggers this because it's bound as `[items]="victoryOdds"` in the template.

---

## 2. How ModalQueueService Works

**Signature:**
```ts
open(content: any, options?: NgbModalOptions): Promise<NgbModalRef>
```

- `content` is any value accepted by `NgbModal.open()` — in this codebase always a `TemplateRef<any>` from `@ViewChild`.
- Returns a `Promise<NgbModalRef>` so callers can `await` and read `result` if needed (currently ignored by callers).

**Queue mechanism:**
- Internally maintains a `Promise<void> queue` chain.
- Each `open()` call appends to the chain: it waits for the current `activeModal.result` to settle (close or dismiss) before opening the next modal.
- This means modals are guaranteed to be sequential. The type advantage modal queued after the gym leader presentation modal will always appear second, automatically.

**Practical consequence:** To show the type advantage modal after the gym leader intro, simply call:
```ts
this.modalQueueService.open(this.typeAdvantageModal, { centered: true, size: 'md' });
```
…immediately after the existing `this.modalQueueService.open(this.gymLeaderPresentationModal, ...)` call. No manual timing needed.

---

## 3. When Battle Roulette Initializes Its Wheel

**Answer: The wheel is initialized reactively, not once in `ngOnInit`. It rebuilds on every relevant state change.**

Both `GymBattleRouletteComponent` and `EliteFourBattleRouletteComponent` follow the same pattern in `ngOnInit`:

### Subscription 1 — team changes (BehaviorSubject, fires immediately + on each change)
```ts
this.teamSubscription = this.trainerService.getTeamObservable().subscribe(team => {
  this.trainerTeam = team;
  this.calcVictoryOdds();    // ← rebuilds victoryOdds array
});
```
Fires on subscribe (current team) and every subsequent team mutation.

### Subscription 2 — game state changes (fires when entering battle state)
```ts
this.gameSubscription = this.gameStateService.currentState.subscribe(state => {
  if (state === 'gym-battle') {
    this.getCurrentLeader();
    this.calcVictoryOdds();   // ← rebuilds with current leader known
    this.modalQueueService.open(this.gymLeaderPresentationModal, ...);
  }
});
```

**Ordering subtlety:** The team subscription fires *before* `this.currentLeader` is set (because the game-state subscription fires second). The first `calcVictoryOdds()` from the team subscription will run without a valid leader. This is fine currently because `calcVictoryOdds()` doesn't use `this.currentLeader`. But the **type matchup calculation will need the leader** — so it must guard against `!this.currentLeader`:

```ts
private calcTypeMatchupBonus(): number {
  if (!this.currentLeader || !this.currentLeader.types?.length) return 0;
  // ...
}
```

The `calcVictoryOdds()` inside the state subscription runs after `getCurrentLeader()`, so it will have a valid leader and produce the correct bonus. The wheel will then redraw with the correct odds before the modal opens.

---

## 4. TrainerService.getTeamObservable() — Does It Fire on PC Swap?

**Answer: YES, unconditionally.**

`getTeamObservable()` returns a `BehaviorSubject<PokemonItem[]>` as an Observable. Every mutation path calls `.next()`:

| Action | Triggers observable |
|--------|-------------------|
| `addToTeam()` | ✅ |
| `removeFromTeam()` | ✅ |
| `makeShiny()` | ✅ |
| `replaceForEvolution()` | ✅ |
| `performTrade()` | ✅ |
| `updateTeam()` | ✅ ← **this is the PC swap path** |
| `applyBattleForms()` / `revertBattleForms()` | ✅ (conditionally, if changed) |
| `resetTeam()` | ✅ |

### PC swap flow
`StoragePcComponent.drop()` (CDK drag-drop) directly mutates `trainerTeam` and `storedPokemon` arrays via `moveItemInArray` / `transferArrayItem`, then calls:
```ts
this.trainerService.updateTeam();
// which calls: this.trainerTeamObservable.next(this.trainerTeam);
```

So when a player swaps a Pokémon via the PC during a gym battle:
1. `trainerTeamObservable` emits
2. Both battle components' `teamSubscription` fires
3. `this.trainerTeam = team` updates
4. `calcVictoryOdds()` rebuilds — type matchup will recalculate here
5. `this.victoryOdds` assigned new array
6. `WheelComponent.ngOnChanges` fires → redraws wheel

**To re-show the advantage modal on PC swap**, add a conditional `modalQueueService.open()` in the team subscription:

```ts
this.teamSubscription = this.trainerService.getTeamObservable().subscribe(team => {
  this.trainerTeam = team;
  this.calcVictoryOdds();

  // Re-show type matchup modal if we're in battle and leader is known
  const inBattle = /* check current game state */;
  if (inBattle && this.currentLeader) {
    const advantage = this.getTypeAdvantage();  // 'overwhelming' | 'advantage' | 'disadvantage' | null
    if (advantage) {
      this.modalQueueService.open(this.typeAdvantageModal, { centered: true, size: 'md' });
    }
  }
});
```

This requires subscribing to `gameStateService.currentState` and caching the value (already done — both components have a `generationSubscription` pattern to follow). Alternatively, inject `GameStateService` and call a synchronous getter if one exists.

---

## 5. Existing Subscription Patterns

Both battle components use the **manual subscription pattern**:

```ts
private gameSubscription: Subscription | null = null;
private generationSubscription: Subscription | null = null;
private teamSubscription!: Subscription;

ngOnInit(): void {
  this.generationSubscription = this.generationService.getGeneration().subscribe(...);
  this.teamSubscription = this.trainerService.getTeamObservable().subscribe(...);
  this.gameSubscription = this.gameStateService.currentState.subscribe(...);
}

ngOnDestroy(): void {
  this.gameSubscription?.unsubscribe();
  this.generationSubscription?.unsubscribe();
  this.teamSubscription?.unsubscribe();
}
```

**Contrast:** `RouletteContainerComponent` uses the modern Angular pattern:
```ts
private destroyRef = inject(DestroyRef);
// ...
this.gameStateService.currentState.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(...);
```

**Recommendation:** Match the existing battle component pattern (manual subscriptions) for consistency. Any new subscription for caching game state or watching for battle re-entry should follow the same `Subscription | null` + `?.unsubscribe()` style already present in these files.

---

## 6. Where the Type Matchup Calculation Should Hook In

### Primary hook: inside `calcVictoryOdds()`, after power loop, before `interleaveOdds`

Both components have identical structure:
```
calcVictoryOdds()
  → build yesOdds (base 1 + power per pokemon + item modifiers)
  → build noOdds (1 per round + starting penalty)
  → ← INSERT TYPE MATCHUP BONUS HERE
  → interleaveOdds(yesOdds, noOdds) → this.victoryOdds
```

This means:
- Type matchup integrates cleanly without touching `interleaveOdds` or wheel rendering.
- It fires on team changes (PC swap) automatically.
- It fires when battle starts (gameStateService subscription also calls `calcVictoryOdds()`).

### Secondary hook: modal queuing inside game-state subscription

The type advantage modal open call belongs *after* the existing presentation modal open, inside the `state === 'gym-battle'` block:

```ts
if (state === 'gym-battle') {
  this.getCurrentLeader();
  this.calcVictoryOdds();

  this.modalQueueService.open(this.gymLeaderPresentationModal, {
    centered: true, size: 'lg'
  });

  // ← ADD HERE: queue type advantage modal if applicable
  const advantage = this.getTypeAdvantageLabel();
  if (advantage) {
    this.modalQueueService.open(this.typeAdvantageModal, {
      centered: true, size: 'md'
    });
  }
}
```

---

## 7. GymLeader Interface — Missing Type Data (Critical Gap)

The `GymLeader` interface currently has:
```ts
export interface GymLeader {
  name: string;
  sprite: string | string[];
  quotes: string[];
}
```

**There is no `types` field.** The type matchup feature requires knowing the opponent's Pokémon types. Two options:

### Option A (Recommended): Add `types: PokemonType[]` to GymLeader interface
- Extend `GymLeader` to `{ ..., types?: PokemonType[] }`
- Populate in `gym-leaders-by-generation.ts` and `elite-four-by-generation.ts`
- This is data-driven and explicit (Brock = `['rock']`, Misty = `['water']`, etc.)

### Option B: Derive from a separate lookup map
- Create a record keyed by leader name → types
- Avoids touching gym leader data files but adds indirection

Option A is cleaner and consistent with how the data is already structured.

---

## 8. type-matchups.json Structure

Located at project root: `/home/andre/workspace/pokemon-roulette/type-matchups.json`

```json
{
  "fire": {
    "strongAgainst": ["bug", "grass", "ice", "steel"],
    "weakAgainst": ["dragon", "fire", "rock", "water"]
  }
}
```

**Key is the attacking Pokémon's type.** `strongAgainst` = types the attacker has super-effective moves against. `weakAgainst` = types the attacker is resisted/ineffective against.

**Logic mapping for the feature:**
- A team Pokémon is "strong" vs opponent if `any of its types → strongAgainst includes any of opponent's types`
- A team Pokémon is "weak" vs opponent if `any of its types → weakAgainst includes any of opponent's types`

`PokemonItem` already carries `type1?: PokemonType` and `type2?: PokemonType | null`.

---

## 9. Type Icon Rendering Pattern (from PokedexDetailModal)

Type icons are rendered from PokeAPI sprites:
```ts
private readonly typeIconBaseUrl =
  'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl';

getTypeIconUrl(type: PokemonType): string {
  const typeData = pokemonTypeDataByKey[type];  // PokemonTypeData with numeric id
  return `${this.typeIconBaseUrl}/${typeData.id}.png`;
}
```

`pokemonTypeDataByKey` and `pokemonTypeData` are already exported from `src/app/interfaces/pokemon-type.ts`. The type advantage modal can reuse this exact pattern.

---

## 10. Summary of Integration Points

| Question | Answer |
|----------|--------|
| Wheel weights | Additive — push more WheelItem entries (weight=1) into yesOdds/noOdds |
| ModalQueueService signature | `open(content: TemplateRef<any>, options?: NgbModalOptions): Promise<NgbModalRef>` |
| Wheel initialization | Reactive — `calcVictoryOdds()` called in `ngOnInit` team+state subscriptions |
| getTeamObservable fires on PC swap | YES — `StoragePcComponent.drop()` → `updateTeam()` → BehaviorSubject emits |
| Subscription pattern | Manual `Subscription` variables + `?.unsubscribe()` in `ngOnDestroy` |
| Type matchup hook location | Inside `calcVictoryOdds()` after power loop, before `interleaveOdds()` |
| Modal hook location | After existing `gymLeaderPresentationModal` open, in game-state subscription |
| GymLeader has types | ❌ NO — must add `types?: PokemonType[]` to interface and data files |
| type-matchups.json loaded | Not yet in any service — needs a new `TypeMatchupService` or asset import |

---

## 11. Recommended Implementation Sequence

1. **Extend `GymLeader` interface** — add `types?: PokemonType[]`
2. **Populate type data** in `gym-leaders-by-generation.ts` and `elite-four-by-generation.ts`
3. **Create `TypeMatchupService`** — loads/parses `type-matchups.json`, exposes `calcTeamAdvantage(team, opponentTypes)` returning `{ strongCount, weakCount, label }`
4. **Extend `calcVictoryOdds()`** in both battle components — call service, push bonus entries
5. **Add `@ViewChild` template ref** for type advantage modal in both components
6. **Queue modal** in game-state subscription (after presentation modal)
7. **Queue modal on PC swap** — add conditional `modalQueueService.open()` in team subscription, guarded by current game state

---

## Sources

- Direct file reads (HIGH confidence):
  - `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts`
  - `src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component.ts`
  - `src/app/wheel/wheel.component.ts`
  - `src/app/interfaces/wheel-item.ts`
  - `src/app/interfaces/pokemon-item.ts`
  - `src/app/interfaces/pokemon-type.ts`
  - `src/app/interfaces/gym-leader.ts`
  - `src/app/services/modal-queue-service/modal-queue.service.ts`
  - `src/app/services/trainer-service/trainer.service.ts`
  - `src/app/trainer-team/storage-pc/storage-pc.component.ts`
  - `src/app/main-game/roulette-container/roulette-container.component.ts` (lines 1–250)
  - `src/app/pokedex/pokedex-detail-modal/pokedex-detail-modal.component.ts`
  - `src/utils/odd-utils.ts`
  - `type-matchups.json`

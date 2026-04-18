# Phase 9 Context — Battle Architecture Refactor

**Phase:** 9
**Requirement:** BATTLE-01
**Classification:** Infrastructure (no user-facing changes)

## Goal

Extract `BaseBattleRouletteComponent` from the 4 battle components, eliminating duplicated subscription setup, `plusModifiers`, `hasPotions`, `usePotion`, and lifecycle boilerplate. Each component retains only battle-specific logic.

## Codebase Scouting

### Target files

| Component | File | Game state trigger |
|-----------|------|--------------------|
| GymBattleRouletteComponent | `gym-battle-roulette.component.ts` | `'gym-battle'` |
| EliteFourBattleRouletteComponent | `elite-four-battle-roulette.component.ts` | `'elite-four-battle'` |
| ChampionBattleRouletteComponent | `champion-battle-roulette.component.ts` | `'champion-battle'` |
| RivalBattleRouletteComponent | `rival-battle-roulette.component.ts` | `'battle-rival'` |

### What is identical across all 4

1. **`plusModifiers()`** — exact copy × 4
2. **`hasPotions()`** — exact copy × 3 (rival does NOT use potions)
3. **`usePotion()` logic** — splice + `removeItem` + set `retries` by switch — identical; only the modal open call differs
4. **Subscription fields** — `gameSubscription`, `generationSubscription`, `teamSubscription`
5. **Shared fields** — `generation`, `trainerTeam`, `trainerItems`, `currentItem`, `retries`
6. **`ngOnInit` pattern** — subscribe generation → getItems → subscribe team → subscribe gameState
7. **`ngOnDestroy`** — unsubscribe all three
8. **`closeModal()`** — `this.modalService.dismissAll()`

### What differs per component

| Aspect | Gym | EliteFour | Champion | Rival |
|--------|-----|-----------|----------|-------|
| Yes text key | `gym.yes` | `elite.yes` | `champion.yes` | `rival.yes` |
| No text key | `gym.no` | `elite.no` | `champion.no` | `rival.no` |
| Base noOdds | 1 | 2 | 3 | 1 |
| Type matchup | ✅ | ✅ | ❌ | ❌ |
| Potion use | ✅ | ✅ | ✅ | ❌ |
| Presentation modal | modalQueueService | modalQueueService | modalService | modalService |
| Item modal | modalQueueService | modalQueueService | modalService | — |
| `onItemSelected` | retries+potion check | retries+potion check | retries+potion check | simple emit |

### Modal service split

- **`gym` + `elite-four`** inject both `NgbModal` AND `ModalQueueService`; use queue for both presentation + item modals
- **`champion` + `rival`** inject only `NgbModal`; use it directly

### Angular inheritance constraint

`@Component` decorator is NOT inheritable. The base class must be a plain abstract TypeScript class (no decorator). The 4 concrete components keep their own `@Component` decorators and call `super()` in their constructors.

### Injection in base class

Since Angular resolves DI via the concrete class's constructor, subclasses must inject services themselves and pass them to `super()`. This is the standard pattern for Angular base components.

## Proposed Base Class API

```typescript
// base-battle-roulette.component.ts (no @Component decorator)
export abstract class BaseBattleRouletteComponent implements OnInit, OnDestroy {
  protected generation!: GenerationItem;
  protected trainerTeam!: PokemonItem[];
  protected trainerItems!: ItemItem[];
  protected currentItem!: ItemItem;
  protected retries = 0;
  protected victoryOdds: WheelItem[] = [];

  constructor(
    protected readonly modalService: NgbModal,
    protected readonly gameStateService: GameStateService,
    protected readonly generationService: GenerationService,
    protected readonly trainerService: TrainerService,
    protected readonly translate: TranslateService
  ) {}

  ngOnInit(): void { /* subscribe generation, items, team, gameState → onGameStateChange */ }
  ngOnDestroy(): void { /* unsubscribe all */ }
  closeModal(): void { /* modalService.dismissAll() */ }

  protected plusModifiers(): number { /* identical impl */ }
  protected hasPotions(): ItemItem | undefined { /* identical impl */ }
  protected usePotion(potion: ItemItem, openItemUsedModal: () => void): void { /* splice + switch + openItemUsedModal() */ }

  protected abstract onGameStateChange(state: string): void;
  protected abstract calcVictoryOdds(): void;
}
```

### ModalQueueService injection strategy

`gym` and `elite-four` need `ModalQueueService`. Rather than inject it in the base (where champion/rival don't need it), subclasses that use the queue inject it themselves and pass the open call as a lambda to `usePotion()` and in `onGameStateChange`.

## Files to Create / Modify

- **CREATE** `src/app/main-game/roulette-container/roulettes/base-battle-roulette/base-battle-roulette.component.ts`
- **MODIFY** `gym-battle-roulette.component.ts` — extend base, remove duplicated code
- **MODIFY** `elite-four-battle-roulette.component.ts` — extend base, remove duplicated code
- **MODIFY** `champion-battle-roulette.component.ts` — extend base, remove duplicated code
- **MODIFY** `rival-battle-roulette.component.ts` — extend base, remove duplicated code

## Constraints

- All 4 existing spec files must remain green (build + ng test 177 green)
- No changes to templates or styles
- `RivalBattleRouletteComponent` has NO potion logic — `hasPotions`/`usePotion` stay in base but rival never calls them
- The rival's `onItemSelected` is simpler (no retries/potion check) — keep it in the subclass

import { WheelItem } from '../../../../interfaces/wheel-item';

/**
 * Shape check for the rows below. Not exported: `name` is narrowed to {@link AdventureActionName}
 * once the rows exist, and {@link AdventureAction} is the type everything else should use.
 */
interface AdventureActionRow extends WheelItem {
  readonly name: string;
  readonly generations?: readonly number[];
}

/**
 * Every adventure slice, in wheel order.
 *
 * `as const satisfies` earns both halves: `satisfies` reports a malformed row at the row itself,
 * and `as const` keeps `name` a literal so the union below can be derived from this list rather
 * than maintained alongside it.
 */
const ROWS = [
  { name: 'catchPokemon', text: 'game.main.roulette.adventure.actions.catchPokemon', fillStyle: 'crimson', weight: 3 },
  { name: 'battleTrainer', text: 'game.main.roulette.adventure.actions.battleTrainer', fillStyle: 'darkorange', weight: 1 },
  { name: 'buyPotions', text: 'game.main.roulette.adventure.actions.buyPotions', fillStyle: 'darkgoldenrod', weight: 1 },
  { name: 'goStraight', text: 'game.main.roulette.adventure.actions.goStraight', fillStyle: 'green', weight: 1 },
  { name: 'catchTwoPokemon', text: 'game.main.roulette.adventure.actions.catchTwoPokemon', fillStyle: 'darkcyan', weight: 1 },
  { name: 'visitDaycare', text: 'game.main.roulette.adventure.actions.visitDaycare', fillStyle: 'blue', weight: 1 },
  { name: 'teamRocket', text: 'game.main.roulette.adventure.actions.teamRocket', fillStyle: 'purple', weight: 1 },
  { name: 'mysteriousEgg', text: 'game.main.roulette.adventure.actions.mysteriousEgg', fillStyle: 'deeppink', weight: 1 },
  { name: 'legendaryEncounter', text: 'game.main.roulette.adventure.actions.legendaryEncounter', fillStyle: 'crimson', weight: 1 },
  { name: 'tradePokemon', text: 'game.main.roulette.adventure.actions.tradePokemon', fillStyle: 'darkorange', weight: 1 },
  { name: 'findItem', text: 'game.main.roulette.adventure.actions.findItem', fillStyle: 'darkgoldenrod', weight: 1 },
  { name: 'exploreCave', text: 'game.main.roulette.adventure.actions.exploreCave', fillStyle: 'green', weight: 1 },
  { name: 'snorlaxEncounter', text: 'game.main.roulette.adventure.actions.snorlaxEncounter', fillStyle: 'darkcyan', weight: 1 },
  { name: 'multitask', text: 'game.main.roulette.adventure.actions.multitask', fillStyle: 'blue', weight: 1 },
  { name: 'goFishing', text: 'game.main.roulette.adventure.actions.goFishing', fillStyle: 'purple', weight: 1 },
  { name: 'findFossil', text: 'game.main.roulette.adventure.actions.findFossil', fillStyle: 'deeppink', weight: 1 },
  { name: 'battleRival', text: 'game.main.roulette.adventure.actions.battleRival', fillStyle: 'black', weight: 1 },

  // Region-only slices. Each belongs to exactly one generation, so no player sees both.
  { name: 'safariZone', text: 'game.main.roulette.adventure.actions.safariZone', fillStyle: 'olivedrab', weight: 1, generations: [1] },
  { name: 'areaZero', text: 'game.main.roulette.adventure.actions.areaZero', fillStyle: 'darkslateblue', weight: 1, generations: [9] },
] as const satisfies readonly AdventureActionRow[];

/** Every slice name, derived from the rows so the two cannot drift apart. */
export type AdventureActionName = typeof ROWS[number]['name'];

/**
 * One slice of the main adventure wheel.
 *
 * The wheel reports the index of whatever array it was handed, so the slice list and the dispatch
 * table have to agree. Naming each slice is what lets them agree: the component maps names to
 * outputs through a `Record`, so a slice that only exists in some regions cannot change what an
 * index means everywhere else.
 */
export interface AdventureAction extends WheelItem {
  readonly name: AdventureActionName;
  /** Generations this slice appears in. Omitted means every generation. */
  readonly generations?: readonly number[];
}

export const ADVENTURE_ACTIONS: readonly AdventureAction[] = ROWS;

/** The slices on offer in a given generation, in wheel order. */
export function adventureActionsFor(generationId: number): AdventureAction[] {
  return ADVENTURE_ACTIONS.filter(
    action => !action.generations || action.generations.includes(generationId),
  );
}

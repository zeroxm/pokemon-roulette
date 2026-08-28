import { GymLeader } from '../interfaces/gym-leader';

/**
 * Picks one trainer out of an entry that covers several.
 *
 * A few slots hold two trainers behind one name — the Unova gym pair, the Kalos rival who depends
 * on the player's gender — stored as a slash-separated translated name plus parallel arrays. All
 * four battle roulettes rebuilt that the same way.
 *
 * `sprite` is genuinely `string | string[]`, so its array check is real. `quotes` and `types` are
 * always arrays and are indexed directly.
 */
export function resolveSplitTrainer(trainer: GymLeader, translatedName: string, index: number): GymLeader {
  const names = translatedName.split('/');
  const sprites = Array.isArray(trainer.sprite) ? trainer.sprite : [trainer.sprite];

  return {
    name: names[index],
    sprite: sprites[index],
    quotes: [trainer.quotes[index]],
    types: trainer.types ? [trainer.types[index]] : undefined,
  } as GymLeader;
}

/** How many trainers an entry covers, given its translated name. */
export function splitTrainerCount(translatedName: string): number {
  return translatedName.split('/').length;
}

import { EventSource } from '../../EventSource';

const SPRITE_BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items';

const SPRITE = {
  potion: `${SPRITE_BASE}/potion.png`,
  unknown: `${SPRITE_BASE}/unknown.png`,
  egg: `${SPRITE_BASE}/mystery-egg.png`,
} as const;

/** What the player receives instead, when a branch offers an evolution but nothing can evolve. */
export type ConsolationAction = 'buy-potions' | 'mysterious-egg' | 'find-item' | 'none';

export interface ConsolationPrize {
  /** Translation key for the modal heading. Empty when `action` is `'none'`. */
  readonly titleKey: string;
  readonly sprite: string;
  readonly descriptionKey: string;
  readonly action: ConsolationAction;
}

/**
 * Typed as `Record<EventSource, …>` on purpose: adding a member to `EventSource` without a row
 * here is a compile error, where the switch this replaced would have fallen through to `default`
 * and silently awarded nothing.
 */
export const CONSOLATION_PRIZES: Record<EventSource, ConsolationPrize> = {
  'gym-battle': {
    titleKey: 'game.main.altPrizes.gymBattle.potion',
    sprite: SPRITE.potion,
    descriptionKey: 'game.main.altPrizes.gymBattle.potionDesc',
    action: 'buy-potions',
  },
  'elite-four-battle': {
    titleKey: 'game.main.altPrizes.eliteFourBattle.potion',
    sprite: SPRITE.potion,
    descriptionKey: 'game.main.altPrizes.eliteFourBattle.potionDesc',
    action: 'buy-potions',
  },
  'battle-trainer': {
    titleKey: 'game.main.altPrizes.battleTrainer.potion',
    sprite: SPRITE.potion,
    descriptionKey: 'game.main.altPrizes.battleTrainer.potionDesc',
    action: 'buy-potions',
  },
  'visit-daycare': {
    titleKey: 'game.main.altPrizes.visitDaycare.egg',
    sprite: SPRITE.egg,
    descriptionKey: 'game.main.altPrizes.visitDaycare.eggDesc',
    action: 'mysterious-egg',
  },
  'battle-rival': {
    titleKey: 'game.main.altPrizes.battleRival.item',
    sprite: SPRITE.unknown,
    descriptionKey: 'game.main.altPrizes.battleRival.itemDesc',
    action: 'find-item',
  },
  'team-rocket-encounter': {
    titleKey: 'game.main.altPrizes.teamRocket.item',
    sprite: SPRITE.unknown,
    descriptionKey: 'game.main.altPrizes.teamRocket.itemDesc',
    action: 'find-item',
  },
  'snorlax-encounter': {
    titleKey: 'game.main.altPrizes.snorlax.item',
    sprite: SPRITE.unknown,
    descriptionKey: 'game.main.altPrizes.snorlax.itemDesc',
    action: 'find-item',
  },
  // A rare candy that finds nothing to evolve simply does nothing; there is no prize modal.
  'rare-candy': { titleKey: '', sprite: '', descriptionKey: '', action: 'none' },
};

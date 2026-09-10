import { PlayerStats } from '../stats-service/stats.service';
import { CounterKey, GENERATION_IDS, GenerationId, championRegionKey, playedRegionKey } from '../stats-service/counter-keys';
import { pokedexByGeneration } from '../../pokedex/pokedex-by-generation';
import { starterByGeneration } from '../../main-game/roulette-container/roulettes/starter-roulette/starter-by-generation';
import { fossilByGeneration } from '../../main-game/roulette-container/roulettes/fossil-roulette/fossil-by-generation';
import { legendaryByGeneration } from '../../main-game/roulette-container/roulettes/legendary-roulette/legendaries-by-generation';
import { ALL_BADGE_IDS, GENERATIONS_WITH_BADGES, badgeRoundsForGeneration } from '../badge-dex-service/badge-dex.service';

/**
 * Everything an achievement may read.
 *
 * The derived counts are precomputed once per evaluation rather than by each
 * row: fifty achievements each walking a thousand-entry Pokédex would be fifty
 * thousand iterations for one catch.
 */
export interface AchievementContext {
  readonly stats: PlayerStats;
  /** Pokémon ids with a Pokédex entry — obtained at least once. */
  readonly caught: ReadonlySet<number>;
  readonly shinyIds: ReadonlySet<number>;
  readonly megaCount: number;
  readonly badges: ReadonlySet<string>;
  /** The most times any single Pokémon has been caught. */
  readonly highestCatchCount: number;
}

/** How far along an achievement is. Unlocked is `current >= target`. */
export interface Progress {
  readonly current: number;
  readonly target: number;
}

export type AchievementGroup =
  | 'collection'
  | 'shiny'
  | 'champion'
  | 'rival'
  | 'forms'
  | 'encounters'
  | 'badges'
  | 'grind';

export interface Achievement {
  readonly id: string;
  readonly group: AchievementGroup;
  readonly progress: (context: AchievementContext) => Progress;
}

// --- helpers ---------------------------------------------------------------

const counter = (key: CounterKey, target: number) =>
  (context: AchievementContext): Progress => ({
    current: context.stats[key] ?? 0,
    target,
  });

const distinctCaught = (target: number) =>
  (context: AchievementContext): Progress => ({ current: context.caught.size, target });

const shinies = (target: number) =>
  (context: AchievementContext): Progress => ({ current: context.shinyIds.size, target });

/** How many of a set of Pokémon have been obtained. */
const owned = (ids: readonly number[], context: AchievementContext): number =>
  ids.reduce((total, id) => (context.caught.has(id) ? total + 1 : total), 0);

const allOf = (ids: readonly number[]) =>
  (context: AchievementContext): Progress => ({ current: owned(ids, context), target: ids.length });

/** The best progress across regions — the region you are closest to finishing. */
const bestRegion = (idsByGeneration: Record<number, number[]>) =>
  (context: AchievementContext): Progress => {
    let best: Progress = { current: 0, target: 1 };
    let bestRatio = -1;

    for (const generation of GENERATION_IDS) {
      const ids = idsByGeneration[generation];
      if (!ids?.length) {
        continue;
      }
      const current = owned(ids, context);
      const ratio = current / ids.length;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = { current, target: ids.length };
      }
    }

    return best;
  };

const LEGENDARY_IDS: readonly number[] = GENERATION_IDS.flatMap(g => legendaryByGeneration[g] ?? []);

const everySpecies: readonly number[] = GENERATION_IDS.flatMap(g => pokedexByGeneration[g] ?? []);

/** Regions where every gym has been beaten — one badge from each of its rounds. */
const regionsFullyBadged = (context: AchievementContext): number =>
  GENERATIONS_WITH_BADGES.reduce((total, generation) => {
    const rounds = badgeRoundsForGeneration(generation);
    const complete = rounds.length > 0 && rounds.every(round => round.some(id => context.badges.has(id)));
    return complete ? total + 1 : total;
  }, 0);

/** Regions with at least one counter above zero — championed, or played. */
const regionsWhere = (key: (generation: GenerationId) => CounterKey) =>
  (context: AchievementContext): number =>
    GENERATION_IDS.reduce((total, g) => ((context.stats[key(g)] ?? 0) > 0 ? total + 1 : total), 0);

const championedRegions = regionsWhere(championRegionKey);
const playedRegions = regionsWhere(playedRegionKey);

// --- the catalog -----------------------------------------------------------

/**
 * The frozen catalog: https://github.com/zeroxm/pokemon-roulette/issues/50
 *
 * Ids are frozen — the backend validates against exactly this list, and
 * renaming one after players hold it means a data migration on live accounts.
 * Name and description translation keys are derived from the id
 * (`achievements.<id>.name`), so they cannot drift out of step with it.
 *
 * Adding one is adding a row. It must also be added to the backend allowlist,
 * and the backend must deploy first.
 */
export const ACHIEVEMENTS: readonly Achievement[] = [
  // Collection — derived from the Pokédex.
  { id: 'i_choose_you', group: 'collection', progress: distinctCaught(1) },
  { id: 'pokedex_lv_1', group: 'collection', progress: distinctCaught(10) },
  { id: 'pokedex_lv_2', group: 'collection', progress: distinctCaught(50) },
  { id: 'pokedex_lv_3', group: 'collection', progress: distinctCaught(100) },
  { id: 'pokedex_lv_4', group: 'collection', progress: distinctCaught(250) },
  { id: 'pokedex_lv_5', group: 'collection', progress: distinctCaught(500) },
  { id: 'gotta_catch_em_all_national', group: 'collection', progress: allOf(everySpecies) },
  { id: 'gotta_catch_em_all_regional', group: 'collection', progress: bestRegion(pokedexByGeneration) },
  { id: 'i_choose_you_and_you', group: 'collection', progress: allOf(GENERATION_IDS.flatMap(g => starterByGeneration[g] ?? [])) },
  { id: 'paleontologist', group: 'collection', progress: allOf(GENERATION_IDS.flatMap(g => fossilByGeneration[g] ?? [])) },
  { id: 'myth_buster', group: 'collection', progress: bestRegion(legendaryByGeneration) },

  // Shiny — also derived from the Pokédex.
  { id: 'oh_shiny', group: 'shiny', progress: shinies(1) },
  { id: 'shiny_hunter_1', group: 'shiny', progress: shinies(5) },
  { id: 'shiny_hunter_2', group: 'shiny', progress: shinies(10) },
  { id: 'shiny_hunter_3', group: 'shiny', progress: shinies(25) },
  {
    id: 'never_tell_me_the_odds',
    group: 'shiny',
    progress: context => ({
      current: LEGENDARY_IDS.some(id => context.shinyIds.has(id)) ? 1 : 0,
      target: 1,
    }),
  },

  // Champion.
  { id: 'champion', group: 'champion', progress: counter('runs_completed', 1) },
  { id: 'regional_champion', group: 'champion', progress: c => ({ current: championedRegions(c), target: 3 }) },
  { id: 'world_champion', group: 'champion', progress: c => ({ current: championedRegions(c), target: 9 }) },
  { id: 'full_house', group: 'champion', progress: counter('champion_with_six', 1) },
  { id: 'pokemon_stadium', group: 'champion', progress: counter('champion_with_three_or_fewer', 1) },

  // Rival.
  { id: 'smell_ya_later', group: 'rival', progress: counter('rival_battles_won', 1) },
  { id: 'notch_above', group: 'rival', progress: counter('rival_battles_won', 5) },
  { id: 'fruitful_battle', group: 'rival', progress: counter('rival_battles_won', 10) },

  // Forms.
  { id: 'evolved_beyond_1', group: 'forms', progress: c => ({ current: c.megaCount, target: 1 }) },
  { id: 'evolved_beyond_2', group: 'forms', progress: c => ({ current: c.megaCount, target: 10 }) },
  { id: 'its_a_disguise', group: 'forms', progress: counter('mimikyu_disguises_busted', 1) },
  { id: 'bond_phenomenon', group: 'forms', progress: counter('ash_greninja_transformations', 1) },
  { id: 'shapeshifter', group: 'forms', progress: counter('sticky_forms_triggered', 1) },

  // Encounters.
  { id: 'super_rod', group: 'encounters', progress: counter('fishing_catches', 10) },
  { id: 'super_nerd', group: 'encounters', progress: counter('fossil_catches', 10) },
  { id: 'prepare_for_trouble', group: 'encounters', progress: counter('team_rocket_defeats', 1) },
  { id: 'make_it_double', group: 'encounters', progress: counter('team_rocket_rescues', 1) },
  { id: 'mystery_gift', group: 'encounters', progress: counter('eggs_hatched', 1) },
  { id: 'used_the_pokeflute', group: 'encounters', progress: counter('snorlax_resolved', 1) },
  // Region-locked: Kanto, Kalos and Paldea only. Hidden, because a player who
  // never visits those regions would otherwise stare at three rows they cannot
  // earn and reasonably conclude something is broken.
  { id: 'five_hundred_steps', group: 'encounters', progress: counter('safari_zone_visits', 1) },
  { id: 'friend_code', group: 'encounters', progress: counter('friend_safari_visits', 1) },
  { id: 'the_great_crater', group: 'encounters', progress: counter('area_zero_visits', 1) },
  { id: 'a_fair_trade', group: 'encounters', progress: counter('trades_completed', 1) },

  // Badge dex.
  { id: 'champ_in_the_making', group: 'badges', progress: c => ({ current: c.badges.size, target: 1 }) },
  { id: 'off_to_victory_road', group: 'badges', progress: c => ({ current: regionsFullyBadged(c), target: 1 }) },
  { id: 'badger_badger_badger', group: 'badges', progress: c => ({ current: regionsFullyBadged(c), target: 3 }) },
  { id: 'the_very_best', group: 'badges', progress: c => ({ current: c.badges.size, target: ALL_BADGE_IDS.size }) },

  // Grind.
  { id: 'youngster', group: 'grind', progress: counter('runs_completed', 10) },
  { id: 'bug_catcher', group: 'grind', progress: counter('runs_completed', 25) },
  { id: 'ace_trainer', group: 'grind', progress: counter('runs_completed', 50) },
  { id: 'veteran', group: 'grind', progress: counter('runs_completed', 100) },
  { id: 'wheel_of_fortune', group: 'grind', progress: counter('spins_total', 1000) },
  { id: 'whos_that_pokemon', group: 'grind', progress: c => ({ current: c.highestCatchCount, target: 50 }) },
  { id: 'world_tour', group: 'grind', progress: c => ({ current: playedRegions(c), target: 9 }) },
];

export type AchievementId = typeof ACHIEVEMENTS[number]['id'];

export const achievementNameKey = (id: string): string => `achievements.${id}.name`;
export const achievementDescriptionKey = (id: string): string => `achievements.${id}.description`;

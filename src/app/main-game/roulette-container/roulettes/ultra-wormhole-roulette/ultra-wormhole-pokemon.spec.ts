import { ULTRA_WORMHOLE_POKEMON, WORMHOLE_COLOURS, WormholeColour } from './ultra-wormhole-pokemon';
import { nationalDexPokemon } from '../../../../services/pokemon-service/national-dex-pokemon';

describe('the Ultra Wormhole pools', () => {
  const byId = new Map(nationalDexPokemon.map(pokemon => [pokemon.pokemonId, pokemon.text]));

  /**
   * A wrong id is the failure this data can have that nothing else would
   * catch: the wheel would cheerfully offer the wrong Pokémon, and only
   * someone who knows the games would notice.
   */
  it('names a real Pokémon for every id, and the ones the games do', () => {
    const expected: Record<WormholeColour, string[]> = {
      white: ['nihilego', 'buzzwole', 'pheromosa', 'xurkitree', 'celesteela', 'kartana', 'guzzlord',
        'stakataka', 'blacephalon'],
      red: ['articuno', 'zapdos', 'moltres', 'ho-oh', 'rayquaza', 'cresselia', 'tornadus',
        'thundurus', 'landorus', 'yveltal'],
      blue: ['suicune', 'lugia', 'latias', 'latios', 'kyogre', 'uxie', 'mesprit', 'azelf', 'kyurem'],
      green: ['mewtwo', 'raikou', 'entei', 'dialga', 'cobalion', 'terrakion', 'virizion', 'reshiram',
        'zekrom', 'xerneas'],
      yellow: ['regirock', 'regice', 'registeel', 'groudon', 'palkia', 'heatran', 'regigigas',
        'giratina'],
    };

    for (const [colour, ids] of Object.entries(ULTRA_WORMHOLE_POKEMON)) {
      const names = ids.map(id => byId.get(id)?.replace('pokemon.', ''));

      expect(names).withContext(`the ${colour} wormhole`).toEqual(expected[colour as WormholeColour]);
    }
  });

  it('offers a pool for every colour on the wheel', () => {
    for (const { colour } of WORMHOLE_COLOURS) {
      expect(ULTRA_WORMHOLE_POKEMON[colour].length).withContext(colour).toBeGreaterThan(0);
    }
  });

  it('never offers the same Pokémon from two wormholes', () => {
    const all = Object.values(ULTRA_WORMHOLE_POKEMON).flat();

    expect(all.length).toBe(new Set(all).size);
  });
});

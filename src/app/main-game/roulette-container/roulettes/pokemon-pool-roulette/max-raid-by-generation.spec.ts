import { maxRaidByGeneration } from './max-raid-by-generation';
import { gigantamaxForms } from '../../../../services/trainer-service/gigantamax-forms';
import { evolutionChain } from '../../../../services/evolution-service/evolution-chain';
import { nationalDexPokemon } from '../../../../services/pokemon-service/national-dex-pokemon';
import { starterByGeneration } from '../starter-roulette/starter-by-generation';

/**
 * The raid exists to make every Gigantamax form reachable in a Galar run. These lock that in:
 * a Gigantamax form added later without a raid entry would otherwise be silently unobtainable,
 * which is exactly the state the whole feature was written to fix.
 */
describe('maxRaidByGeneration', () => {
  const raid = maxRaidByGeneration[8];

  /** Everything the raid can eventually turn into, following evolutions forward. */
  const reachableFromRaid = (): Set<number> => {
    const reached = new Set<number>(raid);
    let grew = true;
    while (grew) {
      grew = false;
      for (const id of [...reached]) {
        for (const next of evolutionChain[id] ?? []) {
          if (!reached.has(next)) { reached.add(next); grew = true; }
        }
      }
    }
    return reached;
  };

  /** The base species behind every Gigantamax form, via the National Dex for alternate forms. */
  const gmaxSpecies = (): number[] => {
    const dexIds = new Set(nationalDexPokemon.map(p => p.pokemonId));
    return [...new Set(Object.keys(gigantamaxForms).map(Number).map(
      id => dexIds.has(id) ? id : (id === 10184 ? 849 : id === 10191 ? 892 : id),
    ))];
  };

  it('is Galar only', () => {
    expect(Object.keys(maxRaidByGeneration)).toEqual(['8']);
  });

  /**
   * The Gigantamax species a Galar run already hands you: Rillaboom, Cinderace and Inteleon.
   * `starterByGeneration[8]` lists the *first* stage (Grookey, Scorbunny, Sobble), so the
   * Gigantamax-capable forms are what those evolve into.
   */
  const fromStarters = (): Set<number> => {
    const reached = new Set<number>(starterByGeneration[8] ?? []);
    let grew = true;
    while (grew) {
      grew = false;
      for (const id of [...reached]) {
        for (const next of evolutionChain[id] ?? []) {
          if (!reached.has(next)) { reached.add(next); grew = true; }
        }
      }
    }
    return reached;
  };

  it('leads to every Gigantamax species the run does not already hand you', () => {
    const reached = reachableFromRaid();
    const starters = fromStarters();

    const unreachable = gmaxSpecies()
      .filter(id => !starters.has(id))
      .filter(id => !reached.has(id));

    expect(unreachable)
      .withContext('a Gigantamax form nothing in Galar can reach is dead content')
      .toEqual([]);
  });

  it('leaves the starter lines out, since the player is handed one anyway', () => {
    const starters = fromStarters();
    expect(raid.filter(id => starters.has(id))).toEqual([]);
  });

  // The point of the pre-evolutions: the raid is a lead to follow, not a prize handed over.
  it('never hands over a Gigantamax-capable form directly, bar the agreed exceptions', () => {
    const hasPreEvolution = (id: number) =>
      Object.values(evolutionChain).some(targets => targets.includes(id));
    const species = new Set(gmaxSpecies());

    // Pikachu and Snorlax by choice (Pichu and Munchlax are baby forms); the rest because they
    // have no pre-evolution to give instead.
    const allowed = raid.filter(id => species.has(id) && (id === 25 || id === 143 || !hasPreEvolution(id)));

    const handedOver = raid.filter(id => species.has(id) && !allowed.includes(id));
    expect(handedOver)
      .withContext('these have a pre-evolution and should be given as that instead')
      .toEqual([]);
  });

  it('has no duplicates, so Applin covers both of its Gigantamax forms once', () => {
    expect(new Set(raid).size).toBe(raid.length);
  });

  /**
   * The reason the slice was written. These lines are not generation 8, so a Galar run cannot
   * otherwise meet them, and their Gigantamax forms were unobtainable in the entire game.
   *
   * The raid also carries gen-8 natives the ordinary wheel already offers, which is deliberate:
   * a den holds any Gigantamax species, not only the imported ones.
   */
  it('covers every Gigantamax line a Galar run could not otherwise reach', () => {
    const galarNative = (id: number) => id >= 810 && id <= 905;
    const reached = reachableFromRaid();

    const imported = gmaxSpecies().filter(id => !galarNative(id));
    expect(imported.length).withContext('the 14 pre-generation-8 Gigantamax species').toBe(14);

    expect(imported.filter(id => !reached.has(id)))
      .withContext('unreachable without the raid, and still unreachable with it')
      .toEqual([]);
  });
});

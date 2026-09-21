import { gigantamaxForms } from './gigantamax-forms';
import { nationalDexPokemon } from '../pokemon-service/national-dex-pokemon';
import { pokemonForms } from '../pokemon-forms-service/pokemon-forms';
import en from '../../../assets/i18n/en.json';

describe('gigantamaxForms', () => {
  const basePowerById = new Map(nationalDexPokemon.map(p => [p.pokemonId, p.power]));

  /** The species a form id belongs to, so an alternate base form resolves to its species' power. */
  const speciesOf = (formId: number): number => {
    if (basePowerById.has(formId)) {
      return formId;
    }
    for (const [baseId, forms] of Object.entries(pokemonForms)) {
      if (forms.some(form => form.pokemonId === formId)) {
        return Number(baseId);
      }
    }
    fail(`no species for form ${formId}`);
    return formId;
  };

  it('covers every Gigantamax form', () => {
    expect(Object.keys(gigantamaxForms).length).toBe(35);
  });

  // The buff is the extra winning slices in buildVictoryOdds, not a stat change. `carryOver` reads
  // `power` from the target form, so a value that drifted from the Dex would move the battle odds
  // invisibly, on top of the +3 a Gigantamax already grants.
  it('never changes a Pokemon power', () => {
    for (const [fromId, gmax] of Object.entries(gigantamaxForms)) {
      const expected = basePowerById.get(speciesOf(Number(fromId)));
      expect(gmax.power)
        .withContext(`${gmax.text} (from ${fromId}) should keep its species' power`)
        .toBe(expected!);
    }
  });

  // Keyed on the current form rather than the species, which is the whole reason these two land
  // on the right sprite without a fallback branch.
  it('gives each two-form species its own Gigantamax', () => {
    expect(gigantamaxForms[849].text).toBe('pokemon.toxtricity-amped-gmax');
    expect(gigantamaxForms[10184].text).toBe('pokemon.toxtricity-low-key-gmax');
    expect(gigantamaxForms[892].text).toBe('pokemon.urshifu-single-strike-gmax');
    expect(gigantamaxForms[10191].text).toBe('pokemon.urshifu-rapid-strike-gmax');
  });

  it('keeps Eternatus as Eternamax rather than a Gigantamax', () => {
    expect(gigantamaxForms[890].text).toBe('pokemon.eternatus-eternamax');
    expect(gigantamaxForms[890].pokemonId).toBe(10190);
  });

  // ngx-translate renders the raw key on a miss, so a missing one ships as literal
  // `pokemon.venusaur-gmax` text to players. Specs are the only thing that catches it.
  it('has a translation for every form', () => {
    const names = (en as { pokemon: Record<string, string> }).pokemon;
    for (const gmax of Object.values(gigantamaxForms)) {
      expect(names[gmax.text.replace('pokemon.', '')])
        .withContext(`missing i18n key ${gmax.text}`)
        .toBeDefined();
    }
  });

  it('never reuses a Gigantamax form id', () => {
    const ids = Object.values(gigantamaxForms).map(form => form.pokemonId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

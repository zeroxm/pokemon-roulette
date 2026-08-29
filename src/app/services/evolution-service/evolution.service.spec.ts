import { TestBed } from '@angular/core/testing';

import { EvolutionService } from './evolution.service';
import { HttpClient } from '@angular/common/http';
import { PokemonItem } from '../../interfaces/pokemon-item';

describe('EvolutionService', () => {
  let service: EvolutionService;

  beforeEach(() => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    });
    service = TestBed.inject(EvolutionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should resolve >10000 evolution ids using form alias metadata', () => {
    const pikachu = service.nationalDexPokemon.find((pokemon) => pokemon.pokemonId === 25) as PokemonItem;
    const evolutions = service.getEvolutions(pikachu);

    expect(evolutions.map((pokemon) => pokemon.pokemonId)).toContain(10100);

    const alolaRaichu = evolutions.find((pokemon) => pokemon.pokemonId === 10100) as PokemonItem;
    expect(alolaRaichu.text).toBe('pokemon.raichu-alola');
    expect(alolaRaichu.sprite).toBeNull();
  });

  it('should resolve chained form evolutions where source and target are >10000', () => {
    const alolaVulpix = service.nationalDexPokemon.find((pokemon) => pokemon.pokemonId === 37) as PokemonItem;
    const source = structuredClone(alolaVulpix);
    source.pokemonId = 10103;
    source.text = 'Vulpix (Alola)';

    const evolutions = service.getEvolutions(source);

    expect(evolutions.length).toBe(1);
    expect(evolutions[0].pokemonId).toBe(10104);
    expect(evolutions[0].text).toBe('pokemon.ninetales-alola');
    expect(evolutions[0].sprite).toBeNull();
  });

  describe('alternate forms captured as forms', () => {
    /** A Pokémon as the player holds it: the base dex entry wearing a form id. */
    const asForm = (baseId: number, formId: number): PokemonItem => {
      const base = service.nationalDexPokemon.find(p => p.pokemonId === baseId) as PokemonItem;
      return { ...structuredClone(base), pokemonId: formId };
    };

    // Pumpkaboo and Gourgeist come in four sizes, and the size is meant to survive the evolution.
    const pumpkabooSizes: ReadonlyArray<readonly [string, number, number]> = [
      ['Small', 10027, 10030],
      ['Average', 710, 711],
      ['Large', 10028, 10031],
      ['Super', 10029, 10032],
    ];

    for (const [size, pumpkaboo, gourgeist] of pumpkabooSizes) {
      it(`evolves ${size} Pumpkaboo into ${size} Gourgeist`, () => {
        const source = asForm(710, pumpkaboo);

        expect(service.canEvolve(source))
          .withContext('a form the wheel never offers is a form that silently never evolves')
          .toBeTrue();
        expect(service.getEvolutions(source).map(p => p.pokemonId)).toEqual([gourgeist]);
      });
    }

    it('evolves White-Striped Basculin into Basculegion', () => {
      const source = asForm(550, 10247);

      expect(service.canEvolve(source)).toBeTrue();
      expect(service.getEvolutions(source).map(p => p.pokemonId)).toEqual([902, 10248]);
    });

    it('leaves Blue-Striped Basculin with no evolution', () => {
      expect(service.canEvolve(asForm(550, 10016)))
        .withContext('Blue-Striped has no evolution in the games')
        .toBeFalse();
    });
  });

  it('should carry form-specific types when evolving into an alternative form', () => {
    const pikachu = service.nationalDexPokemon.find(p => p.pokemonId === 25) as PokemonItem;
    const evolutions = service.getEvolutions(pikachu);
    const alolaRaichu = evolutions.find(p => p.pokemonId === 10100) as PokemonItem;

    expect(alolaRaichu.type1).toBe('electric');
    expect(alolaRaichu.type2).toBe('psychic');
  });
});

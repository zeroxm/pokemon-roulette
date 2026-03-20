import { TestBed } from '@angular/core/testing';

import { EvolutionService } from './evolution.service';
import { HttpClient } from '@angular/common/http';
import { PokemonItem } from '../../interfaces/pokemon-item';

describe('EvolutionService', () => {
  let service: EvolutionService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

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
});

import { TestBed } from '@angular/core/testing';

import { PokemonService } from './pokemon.service';
import { HttpClient } from '@angular/common/http';

describe('PokemonService', () => {
  let service: PokemonService;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(() => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    });
    service = TestBed.inject(PokemonService);
    httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return pokemon list for valid id array', () => {
    const result = service.getPokemonByIdArray([1, 4, 7]);

    expect(result.length).toBe(3);
    expect(result.map(pokemon => pokemon.pokemonId)).toEqual([1, 4, 7]);
  });

  it('should ignore ids that are not in national dex', () => {
    const result = service.getPokemonByIdArray([1, 999999, 7]);

    expect(result.map(pokemon => pokemon.pokemonId)).toEqual([1, 7]);
  });
});


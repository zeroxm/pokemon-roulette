import { TestBed } from '@angular/core/testing';

import { PokemonSpriteService } from './pokemon-sprite.service';

describe('PokemonSpriteService', () => {
  let service: PokemonSpriteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PokemonSpriteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

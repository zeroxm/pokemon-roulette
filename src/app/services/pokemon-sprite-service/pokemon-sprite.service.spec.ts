import { TestBed } from '@angular/core/testing';

import { PokemonSpriteService } from './pokemon-sprite.service';
import { HttpClient } from '@angular/common/http';

describe('PokemonSpriteService', () => {
  let service: PokemonSpriteService;
  let httpSpy: jasmine.SpyObj<HttpClient>;


  beforeEach(() => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    });
    service = TestBed.inject(PokemonSpriteService);
    httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});


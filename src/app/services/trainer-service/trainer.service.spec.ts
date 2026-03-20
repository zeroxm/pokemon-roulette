import { TestBed } from '@angular/core/testing';

import { TrainerService } from './trainer.service';
import { HttpClient } from '@angular/common/http';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { GameStateService } from '../game-state-service/game-state.service';
import { GameState } from '../game-state-service/game-state';
import { of } from 'rxjs';

describe('TrainerService', () => {
  let service: TrainerService;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let gameStateService: GameStateService;

  const palafinZero: PokemonItem = {
    text: 'pokemon.palafin',
    pokemonId: 964,
    fillStyle: 'darkblue',
    sprite: null,
    shiny: false,
    power: 2,
    weight: 1,
  };

  const palafinHero: PokemonItem = {
    text: 'pokemon.palafin-hero',
    pokemonId: 10256,
    fillStyle: 'darkblue',
    sprite: null,
    shiny: false,
    power: 5,
    weight: 1,
  };

  const bulbasaur: PokemonItem = {
    text: 'pokemon.bulbasaur',
    pokemonId: 1,
    fillStyle: 'green',
    sprite: null,
    shiny: false,
    power: 1,
    weight: 1,
  };

  beforeEach(() => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    TestBed.configureTestingModule({
      providers: [
        {provide: HttpClient, useValue: httpSpyObj }
      ]
    });
    service = TestBed.inject(TrainerService);
    httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    httpSpy.get.and.returnValue(of({
      sprites: {
        other: {
          'official-artwork': {
            front_default: 'sprite-default',
            front_shiny: 'sprite-shiny'
          }
        }
      }
    }));
    gameStateService = TestBed.inject(GameStateService);
    gameStateService.resetGameState();
  });

  const emitGameState = (gameState: GameState): void => {
    gameStateService.setNextState(gameState);
    gameStateService.finishCurrentState();
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should temporarily transform palafin into hero during battle states and revert after', () => {
    service.trainerTeam = [structuredClone(palafinZero), structuredClone(bulbasaur)];

    emitGameState('gym-battle');

    expect(service.trainerTeam[0].pokemonId).toBe(10256);
    expect(service.trainerTeam[0].power).toBe(5);
    expect(service.trainerTeam[1].pokemonId).toBe(1);

    emitGameState('adventure-continues');

    expect(service.trainerTeam[0].pokemonId).toBe(964);
    expect(service.trainerTeam[0].power).toBe(2);
    expect(service.trainerTeam[1].pokemonId).toBe(1);
  });

  it('should preserve shiny flag when applying temporary battle form', () => {
    const shinyPalafin = structuredClone(palafinZero);
    shinyPalafin.shiny = true;
    service.trainerTeam = [shinyPalafin];

    emitGameState('champion-battle');

    expect(service.trainerTeam[0].pokemonId).toBe(10256);
    expect(service.trainerTeam[0].shiny).toBeTrue();

    emitGameState('start-adventure');

    expect(service.trainerTeam[0].pokemonId).toBe(964);
    expect(service.trainerTeam[0].shiny).toBeTrue();
  });

  it('should not alter a naturally hero-form palafin', () => {
    service.trainerTeam = [structuredClone(palafinHero)];

    emitGameState('elite-four-battle');
    expect(service.trainerTeam[0].pokemonId).toBe(10256);

    emitGameState('adventure-continues');
    expect(service.trainerTeam[0].pokemonId).toBe(964);
  });

  it('should transform and revert palafin in both trainerTeam and storedPokemon', () => {
    service.trainerTeam = [structuredClone(bulbasaur), structuredClone(palafinZero)];
    service.storedPokemon = [structuredClone(palafinZero), structuredClone(bulbasaur)];

    emitGameState('gym-battle');

    expect(service.trainerTeam[0].pokemonId).toBe(1);
    expect(service.trainerTeam[1].pokemonId).toBe(10256);
    expect(service.storedPokemon[0].pokemonId).toBe(10256);
    expect(service.storedPokemon[1].pokemonId).toBe(1);

    // Simulate user reordering during battle in PC.
    const moved = service.trainerTeam.pop();
    if (moved) {
      service.trainerTeam.unshift(moved);
    }

    emitGameState('start-adventure');

    expect(service.trainerTeam.filter(pokemon => pokemon.pokemonId === 964).length).toBe(1);
    expect(service.trainerTeam.filter(pokemon => pokemon.pokemonId === 10256).length).toBe(0);
    expect(service.storedPokemon.filter(pokemon => pokemon.pokemonId === 964).length).toBe(1);
    expect(service.storedPokemon.filter(pokemon => pokemon.pokemonId === 10256).length).toBe(0);
  });
});

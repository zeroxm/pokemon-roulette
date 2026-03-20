import { TestBed } from '@angular/core/testing';
import { PokemonFormsService } from './pokemon-forms.service';
import { PokemonItem } from '../../interfaces/pokemon-item';

describe('PokemonFormsService', () => {
  let service: PokemonFormsService;

  const deoxysBase: PokemonItem = {
    text: 'pokemon.deoxys',
    pokemonId: 386,
    fillStyle: 'darkred',
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
    TestBed.configureTestingModule({
      providers: [PokemonFormsService],
    });

    service = TestBed.inject(PokemonFormsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return form ids for a pokemon with forms', () => {
    expect(service.getFormIds(386)).toEqual([386, 10001, 10002, 10003]);
    expect(service.hasForms(deoxysBase)).toBeTrue();
  });

  it('should return an empty form list for pokemon without forms', () => {
    expect(service.getFormIds(1)).toEqual([]);
    expect(service.hasForms(bulbasaur)).toBeFalse();
    expect(service.getPokemonForms(bulbasaur)).toEqual([]);
  });

  it('should build form options and override id without mutating original pokemon', () => {
    const forms = service.getPokemonForms(deoxysBase);

    expect(forms.map(form => form.pokemonId)).toEqual([386, 10001, 10002, 10003]);
    expect(forms[1].text).toBe('pokemon.deoxys-attack');
    expect(forms[1].fillStyle).toBe('darkred');
    expect(forms[1].weight).toBe(1);
    expect(deoxysBase.pokemonId).toBe(386);
  });

  it('should apply selected form id to a cloned pokemon', () => {
    const selectedForm = service.getPokemonForms(deoxysBase)[1];
    const selectedPokemon = service.applyFormToPokemon(deoxysBase, selectedForm);

    expect(selectedPokemon.pokemonId).toBe(10001);
    expect(selectedPokemon.sprite).toBeNull();
    expect(selectedPokemon).not.toBe(deoxysBase);
    expect(deoxysBase.pokemonId).toBe(386);
  });
});

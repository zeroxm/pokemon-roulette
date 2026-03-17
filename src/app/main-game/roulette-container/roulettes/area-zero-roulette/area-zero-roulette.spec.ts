import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';

import { AreaZeroRoulette } from './area-zero-roulette';
import { areaZeroParadoxPokemonIds } from './area-zero-pokemon';

describe('AreaZeroRoulette', () => {
  let component: AreaZeroRoulette;
  let fixture: ComponentFixture<AreaZeroRoulette>;

  const getPokemonById = (pokemonId: number): PokemonItem => ({
    text: `pokemon.${pokemonId}`,
    pokemonId,
    fillStyle: 'black',
    sprite: null,
    shiny: false,
    power: 4,
    weight: 1
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaZeroRoulette, TranslateModule.forRoot()],
      providers: [
        {
          provide: PokemonService,
          useValue: {
            getPokemonById,
            getPokemonByIdArray: (pokemonIds: number[]) => pokemonIds.map(getPokemonById)
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaZeroRoulette);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build the full Area Zero paradox roster', () => {
    expect(component.paradoxPokemon.length).toBe(areaZeroParadoxPokemonIds.length);
    expect(component.paradoxPokemon.map(pokemon => pokemon.pokemonId)).toEqual(areaZeroParadoxPokemonIds);
  });

  it('should emit the selected paradox pokemon', () => {
    spyOn(component.selectedPokemonEvent, 'emit');

    component.onItemSelected(3);

    expect(component.selectedPokemonEvent.emit).toHaveBeenCalledWith(component.paradoxPokemon[3]);
  });
});

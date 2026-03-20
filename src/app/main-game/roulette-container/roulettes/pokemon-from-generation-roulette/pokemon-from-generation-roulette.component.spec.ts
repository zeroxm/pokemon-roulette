import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { PokemonFromGenerationRouletteComponent } from './pokemon-from-generation-roulette.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

describe('PokemonFromGenerationRouletteComponent', () => {
  let component: PokemonFromGenerationRouletteComponent;
  let fixture: ComponentFixture<PokemonFromGenerationRouletteComponent>;
  let generationService: jasmine.SpyObj<GenerationService>;
  let pokemonService: jasmine.SpyObj<PokemonService>;

  beforeEach(async () => {
    const generationSubject = new BehaviorSubject<GenerationItem>({
      id: 1,
      text: 'generation.1',
      fillStyle: '#000000',
      region: 'Kanto',
      weight: 1
    });

    generationService = jasmine.createSpyObj('GenerationService', ['getGeneration']);
    generationService.getGeneration.and.returnValue(generationSubject.asObservable());

    pokemonService = jasmine.createSpyObj('PokemonService', ['getPokemonByIdArray']);
    pokemonService.getPokemonByIdArray.and.callFake((ids: number[]) => {
      const mockPokemon: Record<number, PokemonItem> = {
        1: { pokemonId: 1, text: 'pokemon.bulbasaur', fillStyle: 'green', sprite: null, shiny: false, power: 1, weight: 1 },
        2: { pokemonId: 2, text: 'pokemon.ivysaur', fillStyle: 'green', sprite: null, shiny: false, power: 2, weight: 1 },
        3: { pokemonId: 3, text: 'pokemon.venusaur', fillStyle: 'green', sprite: null, shiny: false, power: 3, weight: 1 }
      };
      return ids.map(id => mockPokemon[id]).filter(p => p !== undefined);
    });

    await TestBed.configureTestingModule({
      imports: [PokemonFromGenerationRouletteComponent, TranslateModule.forRoot()],
      providers: [
        { provide: GenerationService, useValue: generationService },
        { provide: PokemonService, useValue: pokemonService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonFromGenerationRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load pokemon by id for current generation', () => {
    expect(pokemonService.getPokemonByIdArray).toHaveBeenCalled();
    expect(component.pokemon.length).toBe(3);
    expect(component.pokemon.map(p => p.pokemonId)).toEqual([1, 2, 3]);
  });
});

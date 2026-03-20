import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { LegendaryRouletteComponent } from './legendary-roulette.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

describe('LegendaryRouletteComponent', () => {
  let component: LegendaryRouletteComponent;
  let fixture: ComponentFixture<LegendaryRouletteComponent>;
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
        144: { pokemonId: 144, text: 'pokemon.articuno', fillStyle: 'darkblue', sprite: null, shiny: false, power: 5, weight: 1 },
        145: { pokemonId: 145, text: 'pokemon.zapdos', fillStyle: 'goldenrod', sprite: null, shiny: false, power: 5, weight: 1 },
        146: { pokemonId: 146, text: 'pokemon.moltres', fillStyle: 'darkorange', sprite: null, shiny: false, power: 5, weight: 1 },
        150: { pokemonId: 150, text: 'pokemon.mewtwo', fillStyle: 'purple', sprite: null, shiny: false, power: 5, weight: 1 },
        151: { pokemonId: 151, text: 'pokemon.mew', fillStyle: 'pink', sprite: null, shiny: false, power: 5, weight: 1 }
      };
      return ids.map(id => mockPokemon[id]).filter(p => p !== undefined);
    });

    await TestBed.configureTestingModule({
      imports: [LegendaryRouletteComponent, TranslateModule.forRoot()],
      providers: [
        { provide: GenerationService, useValue: generationService },
        { provide: PokemonService, useValue: pokemonService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegendaryRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load legendaries by id for current generation', () => {
    expect(component.legendaries.length).toBe(5);
    expect(component.legendaries.map(p => p.pokemonId)).toEqual([144, 145, 146, 150, 151]);
  });
});

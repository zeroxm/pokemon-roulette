import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { CavePokemonRouletteComponent } from './cave-pokemon-roulette.component';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

describe('CavePokemonRouletteComponent', () => {
  let component: CavePokemonRouletteComponent;
  let fixture: ComponentFixture<CavePokemonRouletteComponent>;
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
        24: { pokemonId: 24, text: 'pokemon.arbok', fillStyle: 'purple', sprite: null, shiny: false, power: 2, weight: 1 },
        28: { pokemonId: 28, text: 'pokemon.sandslash', fillStyle: 'goldenrod', sprite: null, shiny: false, power: 2, weight: 1 },
        35: { pokemonId: 35, text: 'pokemon.clefairy', fillStyle: 'pink', sprite: null, shiny: false, power: 2, weight: 1 },
        41: { pokemonId: 41, text: 'pokemon.zubat', fillStyle: 'purple', sprite: null, shiny: false, power: 1, weight: 1 },
        42: { pokemonId: 42, text: 'pokemon.golbat', fillStyle: 'purple', sprite: null, shiny: false, power: 2, weight: 1 }
      };
      return ids.map(id => mockPokemon[id]).filter(p => p !== undefined);
    });

    await TestBed.configureTestingModule({
      imports: [CavePokemonRouletteComponent, TranslateModule.forRoot()],
      providers: [
        { provide: GenerationService, useValue: generationService },
        { provide: PokemonService, useValue: pokemonService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CavePokemonRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load cave pokemon by id for current generation', () => {
    expect(component.cavePokemon.length).toBe(5);
    expect(component.cavePokemon.map(p => p.pokemonId)).toEqual([24, 28, 35, 41, 42]);
  });
});

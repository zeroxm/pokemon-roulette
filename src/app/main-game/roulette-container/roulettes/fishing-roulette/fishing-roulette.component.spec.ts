import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';

import { FishingRouletteComponent } from './fishing-roulette.component';

describe('FishingRouletteComponent', () => {
  let component: FishingRouletteComponent;
  let fixture: ComponentFixture<FishingRouletteComponent>;

  const generationSubject = new BehaviorSubject<GenerationItem>({
    text: 'Gen 1',
    region: 'Kanto',
    fillStyle: 'crimson',
    id: 1,
    weight: 1
  });

  const getPokemonByIdArray = (pokemonIds: number[]): PokemonItem[] =>
    pokemonIds.map((pokemonId) => ({
      text: `pokemon.${pokemonId}`,
      pokemonId,
      fillStyle: 'black',
      sprite: null,
      shiny: false,
      power: 1,
      weight: 1
    }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FishingRouletteComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: GenerationService,
          useValue: {
            getGeneration: () => generationSubject.asObservable()
          }
        },
        {
          provide: PokemonService,
          useValue: {
            getPokemonByIdArray
          }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FishingRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load fish by id for current generation', () => {
    expect(component.fish.map(pokemon => pokemon.pokemonId)).toEqual([
      54, 60, 61, 72, 73, 79, 80, 90, 98, 99, 116, 117, 118, 119, 120, 129, 130, 147, 148
    ]);
  });
});

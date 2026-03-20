import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

import { StarterRouletteComponent } from './starter-roulette.component';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';
import { PokemonItem } from '../../../../interfaces/pokemon-item';

describe('StarterRouletteComponent', () => {
  let component: StarterRouletteComponent;
  let fixture: ComponentFixture<StarterRouletteComponent>;

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
      imports: [StarterRouletteComponent, TranslateModule.forRoot()],
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

    fixture = TestBed.createComponent(StarterRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load starters by id for current generation', () => {
    expect(component.starters.map(starter => starter.pokemonId)).toEqual([1, 4, 7, 25, 133]);
  });
});

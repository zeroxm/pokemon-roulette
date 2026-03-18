import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { GenerationItem } from '../../../../interfaces/generation-item';
import { PokemonItem } from '../../../../interfaces/pokemon-item';
import { GenerationService } from '../../../../services/generation-service/generation.service';
import { PokemonService } from '../../../../services/pokemon-service/pokemon.service';

import { FossilRouletteComponent } from './fossil-roulette.component';

describe('FossilRouletteComponent', () => {
  let component: FossilRouletteComponent;
  let fixture: ComponentFixture<FossilRouletteComponent>;

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
      imports: [FossilRouletteComponent, TranslateModule.forRoot()],
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

    fixture = TestBed.createComponent(FossilRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load fossils by id for current generation', () => {
    expect(component.fossils.map(pokemon => pokemon.pokemonId)).toEqual([138, 139, 140, 141, 142]);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonFromGenerationRouletteComponent } from './pokemon-from-generation-roulette.component';
import { GenerationItem } from '../../../interfaces/generation-item';

describe('PokemonFromGenerationRouletteComponent', () => {
  let component: PokemonFromGenerationRouletteComponent;
  let fixture: ComponentFixture<PokemonFromGenerationRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonFromGenerationRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonFromGenerationRouletteComponent);
    component = fixture.componentInstance;
    component.generation = { text: 'Gen 1', region: 'Kanto', fillStyle: 'crimson', id: 1, weight: 1 } as GenerationItem;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

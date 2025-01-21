import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonFromGenerationRouletteComponent } from './pokemon-from-generation-roulette.component';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

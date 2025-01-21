import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonFromTeamRouletteComponent } from './pokemon-from-team-roulette.component';

describe('PokemonFromTeamRouletteComponent', () => {
  let component: PokemonFromTeamRouletteComponent;
  let fixture: ComponentFixture<PokemonFromTeamRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonFromTeamRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonFromTeamRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

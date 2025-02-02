import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CavePokemonRouletteComponent } from './cave-pokemon-roulette.component';

describe('CavePokemonRouletteComponent', () => {
  let component: CavePokemonRouletteComponent;
  let fixture: ComponentFixture<CavePokemonRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CavePokemonRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CavePokemonRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

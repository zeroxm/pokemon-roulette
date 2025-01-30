import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradePokemonRouletteComponent } from './trade-pokemon-roulette.component';

describe('TradePokemonRouletteComponent', () => {
  let component: TradePokemonRouletteComponent;
  let fixture: ComponentFixture<TradePokemonRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TradePokemonRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TradePokemonRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

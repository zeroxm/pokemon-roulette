import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChampionBattleRouletteComponent } from './champion-battle-roulette.component';

describe('ChampionBattleRouletteComponent', () => {
  let component: ChampionBattleRouletteComponent;
  let fixture: ComponentFixture<ChampionBattleRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChampionBattleRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChampionBattleRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GymBattleRouletteComponent } from './gym-battle-roulette.component';

describe('GymBattleRouletteComponent', () => {
  let component: GymBattleRouletteComponent;
  let fixture: ComponentFixture<GymBattleRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GymBattleRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GymBattleRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

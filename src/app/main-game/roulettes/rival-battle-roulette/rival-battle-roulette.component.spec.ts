import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RivalBattleRouletteComponent } from './rival-battle-roulette.component';

describe('RivalBattleRouletteComponent', () => {
  let component: RivalBattleRouletteComponent;
  let fixture: ComponentFixture<RivalBattleRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RivalBattleRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RivalBattleRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

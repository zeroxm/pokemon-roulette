import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EliteFourBattleRouletteComponent } from './elite-four-battle-roulette.component';

describe('EliteFourBattleRouletteComponent', () => {
  let component: EliteFourBattleRouletteComponent;
  let fixture: ComponentFixture<EliteFourBattleRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EliteFourBattleRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EliteFourBattleRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamRocketRouletteComponent } from './team-rocket-roulette.component';

describe('TeamRocketRouletteComponent', () => {
  let component: TeamRocketRouletteComponent;
  let fixture: ComponentFixture<TeamRocketRouletteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamRocketRouletteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamRocketRouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

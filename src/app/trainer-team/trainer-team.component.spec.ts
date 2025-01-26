import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerTeamComponent } from './trainer-team.component';

describe('TrainerTeamComponent', () => {
  let component: TrainerTeamComponent;
  let fixture: ComponentFixture<TrainerTeamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainerTeamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainerTeamComponent);
    component = fixture.componentInstance;
    component.trainer = { sprite: './place-holder-pixel.png' };
    component.trainerTeam = [];
    component.trainerBadges = [];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

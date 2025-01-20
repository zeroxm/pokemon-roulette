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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

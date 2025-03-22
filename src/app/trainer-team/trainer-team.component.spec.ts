import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerTeamComponent } from './trainer-team.component';
import { HttpClient } from '@angular/common/http';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapPcDisplayHorizontal } from '@ng-icons/bootstrap-icons';

describe('TrainerTeamComponent', () => {
  let component: TrainerTeamComponent;
  let fixture: ComponentFixture<TrainerTeamComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [
        TrainerTeamComponent,
        NgIconsModule
      ],
      providers: [
        provideIcons({ bootstrapPcDisplayHorizontal }),
        {provide: HttpClient, useValue: httpSpyObj }
      ]
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

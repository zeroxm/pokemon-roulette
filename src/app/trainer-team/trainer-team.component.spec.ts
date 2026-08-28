import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainerTeamComponent } from './trainer-team.component';
import { HttpClient } from '@angular/common/http';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapBook, bootstrapPcDisplayHorizontal } from '@ng-icons/bootstrap-icons';
import { provideTranslateService } from '@ngx-translate/core';

describe('TrainerTeamComponent', () => {
  let component: TrainerTeamComponent;
  let fixture: ComponentFixture<TrainerTeamComponent>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [
        TrainerTeamComponent,
        NgIconsModule
      ],
      providers: [
        provideTranslateService(),
        provideIcons({ bootstrapPcDisplayHorizontal, bootstrapBook }),
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

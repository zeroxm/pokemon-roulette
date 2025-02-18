import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndGameComponent } from './end-game.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapClock, bootstrapShare } from '@ng-icons/bootstrap-icons';
import { HttpClient } from '@angular/common/http';

describe('EndGameComponent', () => {
  let component: EndGameComponent;
  let fixture: ComponentFixture<EndGameComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [
        EndGameComponent,
        NgIconsModule
      ],
      providers: [
        provideIcons({ bootstrapShare, bootstrapClock }),
        {provide: HttpClient, useValue: httpSpyObj }
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

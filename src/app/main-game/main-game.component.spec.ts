import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainGameComponent } from './main-game.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { HttpClient } from '@angular/common/http';
import {
  bootstrapArrowRepeat,
  bootstrapCheck,
  bootstrapClock,
  bootstrapCupHotFill,
  bootstrapGear,
  bootstrapPcDisplayHorizontal,
  bootstrapShare,
} from '@ng-icons/bootstrap-icons';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../services/analytics-service/analytics.service';

describe('MainGameComponent', () => {
  let component: MainGameComponent;
  let fixture: ComponentFixture<MainGameComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;
  let analyticsServiceSpy: jasmine.SpyObj<AnalyticsService>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);
    const analyticsServiceSpyObj = jasmine.createSpyObj('AnalyticsService', ['trackEvent']);

    await TestBed.configureTestingModule({
      imports: [
        MainGameComponent,
        NgIconsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideIcons({
          bootstrapShare,
          bootstrapClock,
          bootstrapArrowRepeat,
          bootstrapGear,
          bootstrapCupHotFill,
          bootstrapCheck,
          bootstrapPcDisplayHorizontal,
        }),
        {provide: HttpClient, useValue: httpSpyObj },
        { provide: AnalyticsService, useValue: analyticsServiceSpyObj }
      ],
    })
    .compileComponents();

    httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    analyticsServiceSpy = TestBed.inject(AnalyticsService) as jasmine.SpyObj<AnalyticsService>;
    fixture = TestBed.createComponent(MainGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

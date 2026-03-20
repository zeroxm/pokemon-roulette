import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameOverComponent } from './game-over.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapClock, bootstrapShare } from '@ng-icons/bootstrap-icons';
import { HttpClient } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

describe('GameOverComponent', () => {
  let component: GameOverComponent;
  let fixture: ComponentFixture<GameOverComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [
        GameOverComponent,
        NgIconsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideIcons({ bootstrapShare, bootstrapClock }),
        {provide: HttpClient, useValue: httpSpyObj }
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GameOverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

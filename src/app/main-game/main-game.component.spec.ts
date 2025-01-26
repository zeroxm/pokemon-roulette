import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainGameComponent } from './main-game.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapArrowRepeat } from '@ng-icons/bootstrap-icons';
import { HttpClient } from '@angular/common/http';

describe('MainGameComponent', () => {
  let component: MainGameComponent;
  let fixture: ComponentFixture<MainGameComponent>;
  let httpSpy: jasmine.SpyObj<HttpClient>;

  beforeEach(async () => {
    const httpSpyObj = jasmine.createSpyObj('HttpClient', ['get']);

    await TestBed.configureTestingModule({
      imports: [
        MainGameComponent,
        NgIconsModule
      ],
      providers: [
        {provide: HttpClient, useValue: httpSpyObj },
        provideIcons({ bootstrapArrowRepeat }),
      ],
    })
    .compileComponents();

    httpSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    fixture = TestBed.createComponent(MainGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainGameButtonComponent } from './main-game-button.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapController } from '@ng-icons/bootstrap-icons';

describe('MainGameButtonComponent', () => {
  let component: MainGameButtonComponent;
  let fixture: ComponentFixture<MainGameButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MainGameButtonComponent,
        NgIconsModule
      ],
      providers: [
        provideIcons({ bootstrapController }),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainGameButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

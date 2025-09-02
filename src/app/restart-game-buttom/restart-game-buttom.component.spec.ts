import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestartGameButtonComponent } from './restart-game-buttom.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapArrowRepeat } from '@ng-icons/bootstrap-icons';

describe('RestartGameButtonComponent', () => {
  let component: RestartGameButtonComponent;
  let fixture: ComponentFixture<RestartGameButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RestartGameButtonComponent,
        NgIconsModule
      ],
      providers: [
        provideIcons({ bootstrapArrowRepeat }),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestartGameButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

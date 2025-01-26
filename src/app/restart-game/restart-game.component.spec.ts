import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestartGameComponent } from './restart-game.component';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapArrowRepeat } from '@ng-icons/bootstrap-icons';

describe('RestartGameComponent', () => {
  let component: RestartGameComponent;
  let fixture: ComponentFixture<RestartGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RestartGameComponent,
        NgIconsModule
      ],
      providers: [
        provideIcons({ bootstrapArrowRepeat }),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RestartGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

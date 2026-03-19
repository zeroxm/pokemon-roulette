import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import {
  bootstrapArrowRepeat,
  bootstrapCheck,
  bootstrapClock,
  bootstrapController,
  bootstrapCupHotFill,
  bootstrapGear,
  bootstrapMap,
  bootstrapPcDisplayHorizontal,
  bootstrapPeopleFill,
  bootstrapShare,
} from '@ng-icons/bootstrap-icons';
import { provideIcons } from '@ng-icons/core';

import { RouletteContainerComponent } from './roulette-container.component';

describe('RouletteContainerComponent', () => {
  let component: RouletteContainerComponent;
  let fixture: ComponentFixture<RouletteContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouletteContainerComponent, TranslateModule.forRoot()],
      providers: [
        provideIcons({
          bootstrapArrowRepeat,
          bootstrapCheck,
          bootstrapClock,
          bootstrapController,
          bootstrapCupHotFill,
          bootstrapGear,
          bootstrapMap,
          bootstrapPcDisplayHorizontal,
          bootstrapPeopleFill,
          bootstrapShare,
        }),
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(RouletteContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

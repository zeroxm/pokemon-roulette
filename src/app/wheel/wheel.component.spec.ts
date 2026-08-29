import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheelComponent } from './wheel.component';
import { provideTranslateService } from '@ngx-translate/core';
import { GameStateService } from '../services/game-state-service/game-state.service';

describe('WheelComponent', () => {
  let component: WheelComponent;
  let fixture: ComponentFixture<WheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideTranslateService()],
      imports: [WheelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('spin gate', () => {
    const items = [
      { text: 'a', weight: 1, fillStyle: 'red' },
      { text: 'b', weight: 1, fillStyle: 'blue' }
    ];

    it('is not ready before translations have been preprocessed', () => {
      component.items = items;
      expect(component.isReady).toBeFalse();
    });

    it('is not ready when translatedItems has gone stale against items', () => {
      component.items = items;
      (component as any).translatedItems = [items[0]];
      expect(component.isReady).toBeFalse();
    });

    it('is ready once translatedItems mirrors items', () => {
      component.items = items;
      (component as any).translatedItems = items;
      expect(component.isReady).toBeTrue();
    });

    it('refuses to spin before translations resolve, and does not latch the global gate', () => {
      const gameState = TestBed.inject(GameStateService);
      const setSpinning = spyOn(gameState, 'setWheelSpinning');

      component.items = items;
      component.spinWheel();

      expect(component.spinning).toBeFalse();
      expect(setSpinning).not.toHaveBeenCalled();
    });

    it('releases the global gate when the spin throws', () => {
      const gameState = TestBed.inject(GameStateService);
      const setSpinning = spyOn(gameState, 'setWheelSpinning');

      // Ready, but every weight is zero — total weight 0 would divide by zero.
      const zeroWeighted = [
        { text: 'a', weight: 0, fillStyle: 'red' },
        { text: 'b', weight: 0, fillStyle: 'blue' }
      ];
      component.items = zeroWeighted;
      (component as any).translatedItems = zeroWeighted;

      component.spinWheel();

      expect(component.spinning).toBeFalse();
      expect(setSpinning).toHaveBeenCalledWith(true);
      expect(setSpinning).toHaveBeenCalledWith(false);
    });

    it('clamps font size once a large item set is bound', () => {
      // The clamp lives in updateWheelDimensions, which the constructor runs before any input
      // is bound — so it only takes effect if something re-runs it after `items` arrives.
      const many = Array.from({ length: 45 }, (_, i) => ({ text: `${i}`, weight: 1, fillStyle: 'red' }));
      component.items = many;
      (component as any).updateWheelDimensions();

      expect(component.fontSize).toBeLessThanOrEqual(10);
    });

    it('returns -1 from weighted selection when there is nothing to pick', () => {
      (component as any).translatedItems = [];
      expect(component.getRandomWeightedIndex()).toBe(-1);
    });
  });
});

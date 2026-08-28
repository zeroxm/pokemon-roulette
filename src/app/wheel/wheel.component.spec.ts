import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheelComponent } from './wheel.component';
import { TranslateModule } from '@ngx-translate/core';
import { GameStateService } from '../services/game-state-service/game-state.service';

describe('WheelComponent', () => {
  const sigmaTolerance = (p: number, runs: number, sigma = 4) => sigma * Math.sqrt((p * (1 - p)) / runs);

  let component: WheelComponent;
  let fixture: ComponentFixture<WheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WheelComponent, TranslateModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WheelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('spin gate (SEC-01)', () => {
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

    it('clamps font size once a large item set is bound (SEC-10)', () => {
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

  it('should have a fair distribuition of chances', () => {
    const numRuns = 10000;
    const expectedProbability = 1 / 8;
    const tolerance = sigmaTolerance(expectedProbability, numRuns);

    component.items = [
      { text: '1', weight: 1, fillStyle: 'red' },
      { text: '2', weight: 1, fillStyle: 'green' },
      { text: '3', weight: 1, fillStyle: 'blue' },
      { text: '4', weight: 1, fillStyle: 'yellow' },
      { text: '5', weight: 1, fillStyle: 'orange' },
      { text: '6', weight: 1, fillStyle: 'black' },
      { text: '7', weight: 1, fillStyle: 'purple' },
      { text: '8', weight: 1, fillStyle: 'pink' }
    ];
    (component as any).translatedItems = component.items;

    const results: number[] = new Array(component.items.length).fill(0);

    for (let i = 0; i < numRuns; i++) {
      const result = component.getRandomWeightedIndex();
      results[result]++;
    }

    const probabilities = results.map(result => result / numRuns);

    for (let i = 0; i < probabilities.length; i++) {
      expect(Math.abs(probabilities[i] - expectedProbability)).toBeLessThan(tolerance);
    }
  });

  it('should have a fair distribuition for large numbers of elements', () => {
    const numRuns = 100000;
    const expectedProbability = 1 / 150;
    const tolerance = sigmaTolerance(expectedProbability, numRuns, 5);

    component.items = [];
    const possibleColors = ['red', 'green', 'blue', 'yellow', 'orange', 'black', 'purple', 'pink'];

    for (let i = 1; i <= 150; i++) {
      const color = possibleColors[Math.floor(Math.random() * possibleColors.length)];
      component.items.push({ text: `${i}`, weight: 1, fillStyle: color });
    }
    (component as any).translatedItems = component.items;

    const results: number[] = new Array(component.items.length).fill(0);
    const occurrences: number[] = new Array(component.items.length).fill(0);

    for (let i = 0; i < numRuns; i++) {
      const result = component.getRandomWeightedIndex();
      results[result]++;
      occurrences[result]++;
    }

    const probabilities = results.map(result => result / numRuns);

    const meanProbability = probabilities.reduce((sum, probability) => sum + probability, 0) / probabilities.length;
    expect(Math.abs(meanProbability - expectedProbability)).toBeLessThan(tolerance);

    for (let i = 0; i < probabilities.length; i++) {
      expect(Math.abs(probabilities[i] - expectedProbability)).toBeLessThan(tolerance);
    }
  });

  it('the distribuition should respect the weight', () => {
    const numRuns = 10000;
    const expectedForLower = 1 / 14;
    const expectedForHigher = 1 / 2;
    const lowerTolerance = sigmaTolerance(expectedForLower, numRuns, 4);
    const higherTolerance = sigmaTolerance(expectedForHigher, numRuns, 4);

    component.items = [
      { text: '1', weight: 7, fillStyle: 'red' },
      { text: '2', weight: 1, fillStyle: 'green' },
      { text: '3', weight: 1, fillStyle: 'blue' },
      { text: '4', weight: 1, fillStyle: 'yellow' },
      { text: '5', weight: 1, fillStyle: 'orange' },
      { text: '6', weight: 1, fillStyle: 'black' },
      { text: '7', weight: 1, fillStyle: 'purple' },
      { text: '8', weight: 1, fillStyle: 'pink' }
    ];
    (component as any).translatedItems = component.items;

    const results: number[] = new Array(component.items.length).fill(0);

    for (let i = 0; i < numRuns; i++) {
      const result = component.getRandomWeightedIndex();
      results[result]++;
    }

    const probabilities = results.map(result => result / numRuns);

    expect(Math.abs(probabilities[0] - expectedForHigher)).toBeLessThan(higherTolerance);

    for (let i = 1; i < probabilities.length; i++) {
      expect(Math.abs(probabilities[i] - expectedForLower)).toBeLessThan(lowerTolerance);
    }
  });
});

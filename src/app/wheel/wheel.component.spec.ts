import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheelComponent } from './wheel.component';
import { TranslateModule } from '@ngx-translate/core';

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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WheelComponent } from './wheel.component';

describe('WheelComponent', () => {
  let component: WheelComponent;
  let fixture: ComponentFixture<WheelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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

  it('should have a fair distribuition of chances', () => {
    const numRuns = 10000;
    const tolerance = 0.02;
    const expectedProbability = 1 / 8;

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
    fixture.detectChanges();

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

  it('the distribuition should respect the weight', () => {
    const numRuns = 10000;
    const tolerance = 0.02;
    const expectedForLower = 1 / 16;
    const expectedForHigher = 1 / 2;

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
    fixture.detectChanges();

    const results: number[] = new Array(component.items.length).fill(0);

    for (let i = 0; i < numRuns; i++) {
      const result = component.getRandomWeightedIndex();
      results[result]++;
    }

    const probabilities = results.map(result => result / numRuns);

    expect(Math.abs(probabilities[0] - expectedForHigher)).toBeLessThan(tolerance);

    for (let i = 1; i < probabilities.length; i++) {
      expect(Math.abs(probabilities[i] - expectedForLower)).toBeLessThan(tolerance);
    }
  });
});

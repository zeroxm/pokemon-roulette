import { pickWeightedIndex, totalWeight } from './weighted-random';

describe('weighted-random', () => {
  const sigmaTolerance = (p: number, runs: number, sigma = 4) => sigma * Math.sqrt((p * (1 - p)) / runs);
  const equalWeights = (count: number) => Array.from({ length: count }, () => ({ weight: 1 }));

  describe('totalWeight', () => {
    it('sums weights', () => {
      expect(totalWeight([{ weight: 2 }, { weight: 3 }])).toBe(5);
    });

    it('is 0 for an empty list', () => {
      expect(totalWeight([])).toBe(0);
    });
  });

  describe('pickWeightedIndex — exact boundaries', () => {
    // These were only reachable statistically while selection lived inside the component.
    it('returns the first item when random lands at 0', () => {
      expect(pickWeightedIndex(equalWeights(4), () => 0)).toBe(0);
    });

    it('returns the last item when random lands just below 1', () => {
      expect(pickWeightedIndex(equalWeights(4), () => 0.999999)).toBe(3);
    });

    it('respects segment boundaries exactly', () => {
      const items = [{ weight: 1 }, { weight: 1 }, { weight: 2 }];   // total 4
      expect(pickWeightedIndex(items, () => 0.24)).withContext('0.96 of 4 -> first').toBe(0);
      expect(pickWeightedIndex(items, () => 0.25)).withContext('1.0 of 4 -> second').toBe(1);
      expect(pickWeightedIndex(items, () => 0.49)).withContext('1.96 of 4 -> second').toBe(1);
      expect(pickWeightedIndex(items, () => 0.5)).withContext('2.0 of 4 -> third').toBe(2);
    });

    it('never returns an out-of-range index when random reaches 1', () => {
      const index = pickWeightedIndex(equalWeights(3), () => 1);
      expect(index).toBeLessThan(3);
      expect(index).toBeGreaterThanOrEqual(0);
    });

    it('returns -1 when there is nothing to pick', () => {
      expect(pickWeightedIndex([], () => 0.5)).toBe(-1);
    });

    it('returns an index even when every weight is 0', () => {
      const index = pickWeightedIndex([{ weight: 0 }, { weight: 0 }], () => 0.5);
      expect(index).toBeGreaterThanOrEqual(0);
    });
  });

  describe('pickWeightedIndex — distribution', () => {
    it('is fair across equal weights', () => {
      const runs = 10000;
      const items = equalWeights(8);
      const expected = 1 / 8;
      const tolerance = sigmaTolerance(expected, runs);
      const results = new Array(8).fill(0);

      for (let i = 0; i < runs; i++) {
        results[pickWeightedIndex(items)]++;
      }

      for (const count of results) {
        expect(Math.abs(count / runs - expected)).toBeLessThan(tolerance);
      }
    });

    it('is fair across many items', () => {
      const runs = 100000;
      const items = equalWeights(150);
      const expected = 1 / 150;
      const tolerance = sigmaTolerance(expected, runs, 5);
      const results = new Array(150).fill(0);

      for (let i = 0; i < runs; i++) {
        results[pickWeightedIndex(items)]++;
      }

      for (const count of results) {
        expect(Math.abs(count / runs - expected)).toBeLessThan(tolerance);
      }
    });

    it('respects weight', () => {
      const runs = 10000;
      const items = [{ weight: 7 }, ...equalWeights(7)];
      const expectedHigh = 7 / 14;
      const expectedLow = 1 / 14;
      const results = new Array(8).fill(0);

      for (let i = 0; i < runs; i++) {
        results[pickWeightedIndex(items)]++;
      }

      expect(Math.abs(results[0] / runs - expectedHigh))
        .toBeLessThan(sigmaTolerance(expectedHigh, runs));
      for (let i = 1; i < 8; i++) {
        expect(Math.abs(results[i] / runs - expectedLow))
          .toBeLessThan(sigmaTolerance(expectedLow, runs));
      }
    });
  });
});

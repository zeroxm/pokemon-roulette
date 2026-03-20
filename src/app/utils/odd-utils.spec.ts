import { interleaveOdds } from './odd-utils';
import { WheelItem } from '../interfaces/wheel-item';

describe('interleaveOdds utility', () => {
  const makeItems = (text: string, count: number): WheelItem[] =>
    Array.from({ length: count }, () => ({ text, fillStyle: '', weight: 1 }));

  /** Returns the positions in `result` where item.text === text. */
  function indicesOf(result: WheelItem[], text: string): number[] {
    return result.reduce<number[]>((acc, item, i) => {
      if (item.text === text) acc.push(i);
      return acc;
    }, []);
  }

  /** Consecutive distances between sorted positions. */
  function gapsBetween(indices: number[]): number[] {
    return indices.slice(1).map((v, i) => v - indices[i]);
  }

  /**
   * True when every value is within 1 of every other value —
   * the Bresenham-style "evenly spread" property.
   */
  function isEvenlySpread(values: number[]): boolean {
    if (values.length === 0) return true;
    return Math.max(...values) - Math.min(...values) <= 1;
  }

  it('returns all no when yes array is empty', () => {
    const no = makeItems('n', 5);
    expect(interleaveOdds([], no)).toEqual(no);
  });

  it('returns all yes when no array is empty', () => {
    const yes = makeItems('y', 4);
    expect(interleaveOdds(yes, [])).toEqual(yes);
  });

  /**
   * Asserts the three distribution invariants:
   * 1. All input items appear in the output (counts preserved).
   * 2. The minority group is evenly spread — consecutive gaps between its
   *    items in the result differ by at most 1 (Bresenham / ±1 spacing).
   */
  function assertDistributionInvariants(yesCount: number, noCount: number): void {
    const result = interleaveOdds(makeItems('y', yesCount), makeItems('n', noCount));

    expect(result.length).toBe(yesCount + noCount);
    expect(result.filter(i => i.text === 'y').length).toBe(yesCount);
    expect(result.filter(i => i.text === 'n').length).toBe(noCount);

    const minority = yesCount <= noCount ? 'y' : 'n';
    const gaps = gapsBetween(indicesOf(result, minority));
    expect(isEvenlySpread(gaps)).toBeTrue();
  }

  it('spaces a larger yes list with fewer no items (10 yes, 2 no)', () => {
    assertDistributionInvariants(10, 2);
  });

  it('spaces a larger no list with fewer yes items (3 yes, 7 no)', () => {
    assertDistributionInvariants(3, 7);
  });

  it('distributes evenly with 5 yes and 12 no', () => {
    assertDistributionInvariants(5, 12);
  });

  it('distributes evenly with 13 yes and 5 no', () => {
    assertDistributionInvariants(13, 5);
  });
});

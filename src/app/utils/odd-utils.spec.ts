import { interleaveOdds } from './odd-utils';
import { WheelItem } from '../../../interfaces/wheel-item';

describe('interleaveOdds utility', () => {
  const makeItems = (text: string, count: number): WheelItem[] =>
    Array.from({ length: count }, () => ({ text, fillStyle: '', weight: 1 }));

  it('spaces a larger yes list with fewer no items', () => {
    const yes = makeItems('y', 10);
    const no = makeItems('n', 2);
    const result = interleaveOdds(yes, no);

    expect(result.filter(i => i.text === 'n').length).toBe(2);
    // after roughly each 5 yes there should be a no
    expect(result[5].text).toBe('n');
    expect(result[11].text).toBe('n');
  });

  it('spaces a larger no list with fewer yes items', () => {
    const yes = makeItems('y', 3);
    const no = makeItems('n', 7);
    const result = interleaveOdds(yes, no);

    expect(result.filter(i => i.text === 'y').length).toBe(3);
    expect(result.filter(i => i.text === 'n').length).toBe(7);
    // with rounding (7/3 ≈ 2), expect about two no at start
    expect(result.slice(0, 2).every(i => i.text === 'n')).toBeTrue();
  });

  it('returns all no when yes array is empty', () => {
    const yes: WheelItem[] = [];
    const no = makeItems('n', 5);
    expect(interleaveOdds(yes, no)).toEqual(no);
  });

  it('returns all yes when no array is empty', () => {
    const yes = makeItems('y', 4);
    const no: WheelItem[] = [];
    expect(interleaveOdds(yes, no)).toEqual(yes);
  });
});

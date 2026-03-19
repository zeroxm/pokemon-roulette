import { WheelItem } from '../interfaces/wheel-item';

/**
 * Distributes two lists of wheel items (`yes` and `no`) in proportion to each other.
 *
 * @param yes   Array of items considered a positive outcome.
 * @param no    Array of items considered a negative outcome.
 * @returns     Newly ordered array mixing both inputs.
 */
export function interleaveOdds(yes: WheelItem[], no: WheelItem[]): WheelItem[] {
  if (yes.length >= no.length) {
    return interleaveSortedOdds(yes, no);
  }
  return interleaveSortedOdds(no, yes);
}

/**
 * Distributes two lists of wheel items in proportion to each other.
 *
 * @param big   Bigger array of items.
 * @param small Smaller array of items.
 * @returns     Newly ordered array mixing both inputs.
 */
function interleaveSortedOdds(
  big: WheelItem[],
  small: WheelItem[],
): WheelItem[] {
  const result: WheelItem[] = [];

  let bigIndex = 0;
  let smallIndex = 0;
  const bigCount = big.length;
  const smallCount = small.length;

  // simple edge cases first
  if (bigCount === 0) {
    return [...small];
  }
  if (smallCount === 0) {
    return [...big];
  }

  const interval = Math.max(1, Math.floor(bigCount / smallCount));
  const rest = bigCount % smallCount;
  const exactBigCount = bigCount - rest;
  while (bigIndex < exactBigCount || smallIndex < smallCount) {
    for (let i = 0; i < interval && bigIndex < exactBigCount; i++) {
      result.push(big[bigIndex++]);
    }
    if (smallIndex < smallCount) {
      result.push(small[smallIndex++]);
    }
  }
  return interleaveSortedOdds(result, rest === 0 ? [] : big.slice(-1 * rest));
}

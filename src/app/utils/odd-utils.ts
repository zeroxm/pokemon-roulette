import { WheelItem } from "../interfaces/wheel-item";

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
 * Distributes two lists of wheel items in proportion to each other using a
 * Bresenham-style accumulator: O(n) single pass, no recursion.
 *
 * For each output slot the accumulator grows by `smallCount`; when it exceeds
 * `bigCount` a small item is emitted and the accumulator is reduced by `total`,
 * guaranteeing consecutive gaps between small items differ by at most 1.
 *
 * @param big   Larger (or equal) array of items.
 * @param small Smaller (or equal) array of items.
 * @returns     Newly ordered array mixing both inputs.
 */
function interleaveSortedOdds(
  big: WheelItem[],
  small: WheelItem[],
): WheelItem[] {
  const bigCount = big.length;
  const smallCount = small.length;

  if (bigCount === 0) return [...small];
  if (smallCount === 0) return [...big];

  const total = bigCount + smallCount;
  const result: WheelItem[] = [];
  let bigIndex = 0;
  let smallIndex = 0;
  let accumulator = 0;

  for (let i = 0; i < total; i++) {
    accumulator += smallCount;
    if (accumulator > bigCount) {
      result.push(small[smallIndex++]);
      accumulator -= total;
    } else {
      result.push(big[bigIndex++]);
    }
  }

  return result;
}

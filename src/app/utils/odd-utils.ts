import { WheelItem } from "../interfaces/wheel-item";

/**
 * Distributes two lists of wheel items (`yes` and `no`) in proportion to each other.
 * 
 * @param yes   Array of items considered a positive outcome.
 * @param no    Array of items considered a negative outcome.
 * @returns     Newly ordered array mixing both inputs.
 */
export function interleaveOdds(yes: WheelItem[], no: WheelItem[]): WheelItem[] {
  const result: WheelItem[] = [];

  let yesIndex = 0;
  let noIndex = 0;
  const yesCount = yes.length;
  const noCount = no.length;

  // simple edge cases first
  if (yesCount === 0) {
    return [...no];
  }
  if (noCount === 0) {
    return [...yes];
  }

  if (yesCount >= noCount) {
    // round to nearest whole number, but never drop below 1
    const interval = Math.max(1, Math.round(yesCount / noCount));
    while (yesIndex < yesCount || noIndex < noCount) {
      for (let i = 0; i < interval && yesIndex < yesCount; i++) {
        result.push(yes[yesIndex++]);
      }
      if (noIndex < noCount) {
        result.push(no[noIndex++]);
      }
    }
  } else {
    const interval = Math.max(1, Math.round(noCount / yesCount));
    while (yesIndex < yesCount || noIndex < noCount) {
      for (let i = 0; i < interval && noIndex < noCount; i++) {
        result.push(no[noIndex++]);
      }
      if (yesIndex < yesCount) {
        result.push(yes[yesIndex++]);
      }
    }
  }

  return result;
}

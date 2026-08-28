/** The minimum an item needs for weighted selection. An absent weight counts as 1. */
export interface Weighted {
  readonly weight?: number;
}

/** A missing weight is an equal share, so data rows only state a weight when it differs. */
export function weightOf(item: Weighted): number {
  return item.weight ?? 1;
}

export function totalWeight(items: readonly Weighted[]): number {
  return items.reduce((sum, item) => sum + weightOf(item), 0);
}

/**
 * Picks an index with probability proportional to `weight`.
 *
 * Returns **-1** when there is nothing to pick from — callers must check. The trailing
 * `length - 1` is a floating-point backstop for a `random` that lands fractionally past the
 * accumulated total; on an empty array that expression is -1, which is why the guard is here
 * rather than left for the caller to discover at `items[-1]`.
 *
 * `random` is injectable so selection can be tested at its exact boundaries rather than only
 * statistically.
 */
export function pickWeightedIndex(
  items: readonly Weighted[],
  random: () => number = Math.random,
): number {
  if (items.length === 0) {
    return -1;
  }

  const total = totalWeight(items);
  let target = random() * total;
  let accumulated = 0;

  for (let i = 0; i < items.length; i++) {
    accumulated += weightOf(items[i]);
    if (target < accumulated) {
      return i;
    }
  }
  return items.length - 1;
}

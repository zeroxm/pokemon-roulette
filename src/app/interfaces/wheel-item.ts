export interface WheelItem {
  text: string,
  fillStyle: string,
  /**
   * Relative share of the wheel. Defaults to 1 when omitted.
   *
   * This is wheel-selection tuning that every hand-authored data row had to restate, almost always
   * as `1`. Weighted selection treats a missing weight as 1, so only rows that actually differ
   * need to say so.
   */
  weight?: number;
}
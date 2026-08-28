/**
 * A wheel spin whose meaning travels with it.
 *
 * The container reuses two states — `select-from-pokemon-list` and `select-from-item-list` — for
 * every "pick one of these" moment in the game. What the pick *means* used to be recorded
 * separately: as marker `GameState` members that rendered nothing and were read back after the
 * pop, and later, when mega stones needed a meaning the state string could not carry, as a second
 * parallel tag alongside them.
 *
 * Carrying the continuation with the request removes the need for either.
 */
export interface PendingSelection<T> {
  /** Translation key for the wheel's heading. */
  readonly title: string;
  readonly options: T[];
  /**
   * Runs once the player has chosen. **Owns advancing the state machine** — push any follow-up
   * state first, then call `finishCurrentState()`, so the follow-up is what renders next.
   */
  readonly onSelected: (choice: T) => void;
}

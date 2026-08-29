/**
 * A wheel spin whose meaning travels with it.
 *
 * The container reuses two states — `select-from-pokemon-list` and `select-from-item-list` — for
 * every "pick one of these" moment. Carrying the continuation with the request is what keeps those
 * states generic, rather than tagging the meaning somewhere alongside them.
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

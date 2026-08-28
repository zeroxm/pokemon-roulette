import { PokemonItem } from '../../interfaces/pokemon-item';
import { MegaStoneItemName } from '../items-service/item-names';

/** Which of a rule's forms a Pokémon changes into when the rule fires. */
export type FormSelection =
  /** Next form in the list, wrapping. Two-form rules toggle back and forth. */
  | { kind: 'cycle' }
  /**
   * Only the *base* form (index 0) changes, into index 1.
   *
   * Distinct from `cycle`: a Pokémon caught already in its battle form must be left alone rather
   * than demoted on entering a fight.
   */
  | { kind: 'base-to-battle' }
  /** Any form other than the current one. */
  | { kind: 'random-other' }
  /** The form paired with a held stone; the rule does nothing without one. */
  | { kind: 'item-gated'; stones: MegaStoneItemName[] };

/**
 * One form-changing mechanic, described as data.
 *
 * Mega, sticky and temporary battle forms were three separate code paths that all ended in the
 * same swap — clone the target, carry `shiny` across, drop the sprite, write it back. They differ
 * only along the three axes below, so they are now rows in one table rather than three near-copies
 * of the same loop.
 */
export interface FormRule {
  /** Stable identity, used to record what to undo. */
  readonly id: string;
  /** Candidate forms. For `item-gated`, index-aligned with `selection.stones`. */
  readonly forms: readonly PokemonItem[];
  /** Whether the PC is swept too. A form left in storage is otherwise stranded there. */
  readonly scope: 'team' | 'team+stored';
  /** `temporary` reverts when the battle ends; `sticky` is kept. */
  readonly persistence: 'temporary' | 'sticky';
  readonly selection: FormSelection;
}

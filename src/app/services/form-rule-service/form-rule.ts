import { PokemonItem } from '../../interfaces/pokemon-item';

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
  /**
   * The form whose own `stone` the trainer holds; the rule does nothing without one.
   *
   * `baseId` is carried explicitly because the base Pokémon is not among `forms` — the forms are
   * what it becomes, not what it is.
   */
  | { kind: 'item-gated'; baseId: number };

/**
 * What makes a rule fire.
 *
 * Separate from {@link FormSelection}, which only says *which* form is picked once a rule runs.
 * Owning a mega stone answers the second question, never the first.
 */
export type FormTrigger =
  /** Fires automatically when a battle starts. */
  | 'battle-start'
  /** Fires only when the player asks for it, through `forceApply`. Never from `applyAll`. */
  | 'manual';

/**
 * One form-changing mechanic, described as data.
 *
 * Mega, sticky and temporary battle forms were three separate code paths that all ended in the
 * same swap — clone the target, carry `shiny` across, drop the sprite, write it back. They differ
 * only along the four axes below, so they are now rows in one table rather than three near-copies
 * of the same loop.
 */
export interface FormRule {
  /** Stable identity, keyed on when recording what to undo. */
  readonly id: string;
  /** Candidate forms. Item-gated forms carry the stone that selects them. */
  readonly forms: readonly PokemonItem[];
  /** Whether the PC is swept too. A form left in storage is otherwise stranded there. */
  readonly scope: 'team' | 'team+stored';
  /** `temporary` reverts when the battle ends; `sticky` is kept. */
  readonly persistence: 'temporary' | 'sticky';
  /** Whether entering a battle applies this rule, or the player has to trigger it. */
  readonly trigger: FormTrigger;
  readonly selection: FormSelection;
}

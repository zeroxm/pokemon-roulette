import { FormRule } from './form-rule';
import { palafinForms } from '../trainer-service/palafin-forms';
import { stickyBattleForms } from '../trainer-service/sticky-battle-forms';
import { pokemonMegaForms } from '../trainer-service/pokemon-mega-forms';
import { mimikyuForms } from '../trainer-service/mimikyu-forms';

/**
 * The three existing form tables, adapted into one rule list.
 *
 * Adapted rather than rewritten so the data itself is untouched by this migration — the tables
 * remain the single source of truth for which forms exist, and only their shape is normalised.
 */
export const formRules: FormRule[] = [
  // Palafin: base ↔ Hero, reverts after the battle, and must sweep the PC too — a Hero-form
  // Palafin left in storage would otherwise never change back.
  ...Object.entries(palafinForms)
    .filter(([, forms]) => forms.length >= 2)
    .map(([baseId, forms]): FormRule => ({
      id: `temporary:${baseId}`,
      forms,
      scope: 'team+stored',
      persistence: 'temporary',
      trigger: 'battle-start',
      selection: { kind: 'base-to-battle' },
    })),

  // Aegislash, Ogerpon and friends: change on entering a battle and stay changed.
  ...stickyBattleForms.map((group, index): FormRule => ({
    id: `sticky:${index}`,
    forms: group.forms,
    scope: 'team',
    persistence: 'sticky',
    trigger: 'battle-start',
    selection: group.mode === 'toggle' ? { kind: 'cycle' } : { kind: 'random-other' },
  })),

  // Mimikyu's Disguise: busts as a last-resort retry when the player is out of potions, and stays
  // busted for the rest of the run. `manual` because losing a battle is what fires it, not entering
  // one; `sticky` so revertAll leaves it alone at battle end.
  ...Object.entries(mimikyuForms).map(([baseIdText, forms]): FormRule => ({
    id: `disguise:${baseIdText}`,
    forms,
    scope: 'team+stored',
    persistence: 'sticky',
    trigger: 'manual',
    selection: { kind: 'base-to-battle' },
  })),

  // Mega evolution: the player taps a stone mid-battle, so this rule is `manual` and never fires
  // from `applyAll`. Holding the stone selects *which* mega form; it is not permission to apply one.
  ...Object.entries(pokemonMegaForms).map(([baseIdText, forms]): FormRule => ({
    id: `mega:${baseIdText}`,
    forms,
    scope: 'team+stored',
    persistence: 'temporary',
    trigger: 'manual',
    selection: { kind: 'item-gated', baseId: Number(baseIdText) },
  })),
];

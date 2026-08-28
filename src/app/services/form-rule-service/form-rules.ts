import { FormRule } from './form-rule';
import { palafinForms } from '../trainer-service/palafin-forms';
import { stickyBattleForms } from '../trainer-service/sticky-battle-forms';
import { pokemonMegaForms, megaStoneNamesForBaseId } from '../trainer-service/pokemon-mega-forms';

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
      selection: { kind: 'cycle' },
    })),

  // Aegislash, Ogerpon and friends: change on entering a battle and stay changed.
  ...stickyBattleForms.map((group, index): FormRule => ({
    id: `sticky:${index}`,
    forms: group.forms,
    scope: 'team',
    persistence: 'sticky',
    selection: group.mode === 'toggle' ? { kind: 'cycle' } : { kind: 'random-other' },
  })),

  // Mega evolution: gated on holding the matching stone, reverts after the battle.
  ...Object.entries(pokemonMegaForms).map(([baseIdText, forms]): FormRule => ({
    id: `mega:${baseIdText}`,
    forms,
    scope: 'team+stored',
    persistence: 'temporary',
    selection: { kind: 'item-gated', stones: megaStoneNamesForBaseId(Number(baseIdText)) },
  })),
];

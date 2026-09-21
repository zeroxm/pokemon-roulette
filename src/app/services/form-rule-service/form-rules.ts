import { FormRule } from './form-rule';
import { palafinForms } from '../trainer-service/palafin-forms';
import { stickyBattleForms } from '../trainer-service/sticky-battle-forms';
import { pokemonMegaForms } from '../trainer-service/pokemon-mega-forms';
import { zygardeLadderForms } from '../trainer-service/zygarde-forms';
import { gigantamaxForms } from '../trainer-service/gigantamax-forms';
import { mimikyuForms } from '../trainer-service/mimikyu-forms';
import { greninjaForms } from '../trainer-service/greninja-forms';

/**
 * The three existing form tables, adapted into one rule list.
 *
 * Adapted rather than rewritten so the data itself is untouched by this migration: the tables
 * remain the single source of truth for which forms exist, and only their shape is normalised.
 */
export const formRules: FormRule[] = [
  // Palafin: base ↔ Hero, reverts after the battle, and must sweep the PC too: a Hero-form
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

  // Mimikyu's Disguise: busts as a last-resort retry when the player is out of potions, and is
  // repaired when the battle ends. `manual` because losing a spin is what fires it, not entering a
  // battle; `temporary` so revertAll puts the disguise back on the way out.
  ...Object.entries(mimikyuForms).map(([baseIdText, forms]): FormRule => ({
    id: `disguise:${baseIdText}`,
    forms,
    scope: 'team+stored',
    persistence: 'temporary',
    trigger: 'manual',
    selection: { kind: 'base-to-battle' },
  })),

  // Ash-Greninja: fires when a potion is used mid-battle, and needs no stone. `manual` because the
  // potion is what triggers it; `temporary` so it reverts at the end of the fight like a mega does.
  ...Object.entries(greninjaForms).map(([baseIdText, forms]): FormRule => ({
    id: `ash-greninja:${baseIdText}`,
    forms,
    scope: 'team+stored',
    persistence: 'temporary',
    trigger: 'manual',
    selection: { kind: 'base-to-battle' },
  })),

  // Zygarde's cells gather as it fights: one rung per battle *won*, kept for the rest of the run.
  //
  // `battle-won` rather than `battle-start`, which is what it was first written as and was wrong:
  // firing on entry meant the 10% form existed for exactly one screen, because the state stack
  // puts a gym battle immediately after the adventure wheel that produced the Zygarde. A rung is
  // a reward, so it is paid on the win.
  //
  // `sticky` because it never reverts, `ladder` because it stops at Complete rather than wrapping
  // back to 10%. `team+stored` so a Zygarde parked in the PC does not fall behind the ladder.
  {
    id: 'ladder:718',
    forms: zygardeLadderForms,
    scope: 'team+stored',
    persistence: 'sticky',
    trigger: 'battle-won',
    selection: { kind: 'ladder' },
  },

  // Gigantamax: Galar's replacement for mega evolution, and `manual` for the same reason mega is.
  // The player taps the Dynamax Band on their lead; the rule says what that becomes, never that it
  // should happen. `TrainerService.activateMax` owns the when, including the Galar-only check.
  //
  // Keyed on the *current* form id, which is what makes Toxtricity Amped and Low Key (and both
  // Urshifu styles) reach their own Gigantamax with no special case here.
  ...Object.entries(gigantamaxForms).map(([fromIdText, gmax]): FormRule => ({
    id: `gmax:${fromIdText}`,
    forms: [gmax],
    scope: 'team',
    persistence: 'temporary',
    trigger: 'manual',
    selection: { kind: 'to-form', fromId: Number(fromIdText) },
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

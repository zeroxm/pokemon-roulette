import { Injectable } from '@angular/core';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { ItemName } from '../items-service/item-names';
import { FormRule } from './form-rule';
import { formRules } from './form-rules';

/** What a fired rule replaced, so it can be put back. */
interface AppliedForm {
  readonly ruleId: string;
  readonly original: PokemonItem;
}

/**
 * Applies and reverts every form-changing mechanic through one code path.
 *
 * Three things this design fixes by construction rather than by patch:
 *
 * - **Apply is idempotent.** A battle state emitted twice used to run apply twice, which turned
 *   a two-form toggle into a no-op (Shield → Blade → Shield) and re-rolled random forms.
 * - **Revert sweeps storage.** A form moved to the PC mid-battle used to be missed and stranded
 *   there permanently.
 * - **Revert bookkeeping always clears.** It used to clear only on a *successful* revert, so one
 *   miss disabled mega evolution for the rest of the run.
 */
@Injectable({ providedIn: 'root' })
export class FormRuleService {
  private readonly rules: readonly FormRule[] = formRules;
  private readonly rulesById = new Map(formRules.map(rule => [rule.id, rule]));

  /** Non-empty only while battle forms are applied; also the idempotency guard. */
  private applied: AppliedForm[] = [];
  private formsApplied = false;

  /**
   * Applies every rule whose conditions are met. A no-op if forms are already applied, so
   * re-entering the same battle state cannot double-toggle anything.
   */
  applyAll(team: PokemonItem[], stored: PokemonItem[], heldItems: readonly ItemName[]): boolean {
    if (this.formsApplied) {
      return false;
    }
    this.formsApplied = true;

    let changed = false;
    for (const rule of this.rules) {
      changed = this.applyRule(rule, team, stored, heldItems) || changed;
    }
    return changed;
  }

  /** Puts back everything a `temporary` rule replaced, wherever it now sits. */
  revertAll(team: PokemonItem[], stored: PokemonItem[]): boolean {
    if (!this.formsApplied) {
      return false;
    }
    this.formsApplied = false;

    const toRevert = this.applied;
    // Cleared unconditionally, before any attempt: leaving stale bookkeeping behind after a
    // missed revert is what used to disable mega evolution for the rest of the run.
    this.applied = [];

    let reverted = false;
    for (const record of toRevert) {
      const rule = this.rulesById.get(record.ruleId);
      if (!rule) {
        continue;
      }
      for (const collection of this.collectionsFor(rule, team, stored)) {
        for (let i = 0; i < collection.length; i++) {
          if (!this.isFormOf(rule, collection[i])) {
            continue;
          }
          collection[i] = this.carryOver(record.original, collection[i]);
          reverted = true;
        }
      }
    }
    return reverted;
  }

  /** Applies one rule immediately — used when a stone is tapped mid-battle. */
  forceApply(ruleId: string, team: PokemonItem[], stored: PokemonItem[], heldItems: readonly ItemName[]): boolean {
    const rule = this.rulesById.get(ruleId);
    if (!rule) {
      return false;
    }
    // A forced application still has to be undone at battle end.
    this.formsApplied = true;
    return this.applyRule(rule, team, stored, heldItems);
  }

  /** True when any collection currently holds a non-base form of the given rule. */
  isRuleActive(ruleId: string, team: PokemonItem[], stored: PokemonItem[]): boolean {
    const rule = this.rulesById.get(ruleId);
    if (!rule) {
      return false;
    }
    return this.collectionsFor(rule, team, stored)
      .some(collection => collection.some(pokemon => this.isNonBaseFormOf(rule, pokemon)));
  }

  /** Forgets all bookkeeping without touching any Pokémon. For a game reset. */
  reset(): void {
    this.applied = [];
    this.formsApplied = false;
  }

  // ── internals ─────────────────────────────────────────────────────────────

  private applyRule(
    rule: FormRule, team: PokemonItem[], stored: PokemonItem[], heldItems: readonly ItemName[],
  ): boolean {
    let changed = false;

    for (const collection of this.collectionsFor(rule, team, stored)) {
      for (let i = 0; i < collection.length; i++) {
        const current = collection[i];
        const target = this.pickTarget(rule, current, heldItems);
        if (!target || target.pokemonId === current.pokemonId) {
          continue;
        }

        if (rule.persistence === 'temporary') {
          this.applied.push({ ruleId: rule.id, original: structuredClone(current) });
        }
        collection[i] = this.carryOver(target, current);
        changed = true;
      }
    }
    return changed;
  }

  /** The one swap every mechanic used to implement separately. */
  private carryOver(target: PokemonItem, replacing: PokemonItem): PokemonItem {
    const replacement = structuredClone(target);
    replacement.shiny = replacing.shiny;
    replacement.sprite = null;
    return replacement;
  }

  private pickTarget(rule: FormRule, current: PokemonItem, heldItems: readonly ItemName[]): PokemonItem | null {
    const index = rule.forms.findIndex(form => form.pokemonId === current.pokemonId);

    switch (rule.selection.kind) {
      case 'cycle':
        return index === -1 ? null : rule.forms[(index + 1) % rule.forms.length];

      case 'random-other': {
        if (index === -1) {
          return null;
        }
        const others = rule.forms.filter(form => form.pokemonId !== current.pokemonId);
        return others.length ? others[Math.floor(Math.random() * others.length)] : null;
      }

      case 'item-gated': {
        // Gated rules key off the *base* Pokémon, which is not among `forms`.
        if (index !== -1) {
          return null;
        }
        const baseId = Number(rule.id.split(':')[1]);
        if (current.pokemonId !== baseId) {
          return null;
        }
        const stoneIndex = rule.selection.stones.findIndex(stone => heldItems.includes(stone));
        if (stoneIndex === -1) {
          return null;
        }
        return rule.forms[stoneIndex] ?? rule.forms[0] ?? null;
      }
    }
  }

  private collectionsFor(rule: FormRule, team: PokemonItem[], stored: PokemonItem[]): PokemonItem[][] {
    return rule.scope === 'team+stored' ? [team, stored] : [team];
  }

  private isFormOf(rule: FormRule, pokemon: PokemonItem): boolean {
    return rule.forms.some(form => form.pokemonId === pokemon.pokemonId);
  }

  private isNonBaseFormOf(rule: FormRule, pokemon: PokemonItem): boolean {
    if (rule.selection.kind === 'item-gated') {
      return this.isFormOf(rule, pokemon);
    }
    return rule.forms.slice(1).some(form => form.pokemonId === pokemon.pokemonId);
  }
}

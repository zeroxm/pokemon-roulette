import { Injectable } from '@angular/core';
import { PokemonItem } from '../../interfaces/pokemon-item';
import { PokemonType } from '../../interfaces/pokemon-type';
import { TypeMatchupMap } from '../../interfaces/type-matchup';
import * as rawImport from '../../../../type-matchups.json';

const typeMatchups = rawImport as unknown as TypeMatchupMap;

@Injectable({ providedIn: 'root' })
export class TypeMatchupService {

  /** True if pokemonType is super-effective against opponentType. */
  isStrongAgainst(pokemonType: PokemonType, opponentType: PokemonType): boolean {
    return typeMatchups[pokemonType]?.strongAgainst.includes(opponentType) ?? false;
  }

  /** True if opponentType is super-effective against pokemonType. */
  isWeakAgainst(pokemonType: PokemonType, opponentType: PokemonType): boolean {
    return typeMatchups[opponentType]?.strongAgainst.includes(pokemonType) ?? false;
  }

  /**
   * Counts how many team members are strong / weak against the given opponent types.
   * A member is strong if ANY of its types is SE against ANY opponent type.
   * A member is weak  if ANY opponent type is SE against ANY of its types.
   * A member may be counted in both.
   */
  calcTeamMatchup(
    team: PokemonItem[],
    opponentTypes: PokemonType[]
  ): { strongCount: number; weakCount: number } {
    let strongCount = 0;
    let weakCount = 0;

    for (const member of team) {
      const memberTypes = ([member.type1, member.type2] as Array<PokemonType | null | undefined>)
        .filter((t): t is PokemonType => !!t);

      const isStrong = memberTypes.some(mt =>
        opponentTypes.some(ot => this.isStrongAgainst(mt, ot))
      );
      const isWeak = memberTypes.some(mt =>
        opponentTypes.some(ot => this.isWeakAgainst(mt, ot))
      );

      if (isStrong) strongCount++;
      if (isWeak) weakCount++;
    }

    return { strongCount, weakCount };
  }

  /**
   * Returns a human-readable advantage label.
   * Strong takes precedence over weak.
   * Returns null when neither threshold is met.
   */
  getAdvantageLabel(
    strongCount: number,
    weakCount: number
  ): 'overwhelming' | 'advantage' | 'disadvantage' | null {
    if (strongCount >= 3) return 'overwhelming';
    if (strongCount >= 1) return 'advantage';
    if (weakCount >= 1)   return 'disadvantage';
    return null;
  }

  /**
   * Returns the unique PokemonType values from the team that are strong or weak
   * against the given opponent types. Used by the inline matchup strip to render
   * type icon rows.
   *
   * advantageTypes: unique types from team members where the type is SE against
   *   ANY opponent type. Order: type1 before type2, team order preserved, deduplicated.
   *
   * disadvantageTypes: unique types from team members where ANY opponent type is
   *   SE against that member type. Same ordering and dedup rules.
   *
   * A type may appear in both arrays (same rule as calcTeamMatchup).
   * Returns empty arrays when team or opponentTypes is empty.
   */
  getMatchupTypes(
    team: PokemonItem[],
    opponentTypes: PokemonType[]
  ): { advantageTypes: PokemonType[]; disadvantageTypes: PokemonType[] } {
    if (!team.length || !opponentTypes.length) {
      return { advantageTypes: [], disadvantageTypes: [] };
    }

    const advantageTypes: PokemonType[] = [];
    const disadvantageTypes: PokemonType[] = [];
    const seenAdvantage = new Set<PokemonType>();
    const seenDisadvantage = new Set<PokemonType>();

    for (const member of team) {
      const memberTypes = ([member.type1, member.type2] as Array<PokemonType | null | undefined>)
        .filter((t): t is PokemonType => !!t);

      for (const mt of memberTypes) {
        if (!seenAdvantage.has(mt) && opponentTypes.some(ot => this.isStrongAgainst(mt, ot))) {
          advantageTypes.push(mt);
          seenAdvantage.add(mt);
        }
        if (!seenDisadvantage.has(mt) && opponentTypes.some(ot => this.isWeakAgainst(mt, ot))) {
          disadvantageTypes.push(mt);
          seenDisadvantage.add(mt);
        }
      }
    }

    return { advantageTypes, disadvantageTypes };
  }
}

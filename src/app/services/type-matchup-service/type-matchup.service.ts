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
}

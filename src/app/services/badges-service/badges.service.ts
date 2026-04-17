import { Injectable } from '@angular/core';
import { GenerationItem } from '../../interfaces/generation-item';
import { Observable, of } from 'rxjs';
import { badgesByGeneration } from './badges-data';
import { Badge } from '../../interfaces/badge';

@Injectable({
  providedIn: 'root'
})
export class BadgesService {

  constructor() { }

  badgesByGeneration = badgesByGeneration;

  getBadge(generation: GenerationItem, fromRound: number, fromLeader: number): Observable<Badge> {

    if (!this.badgesByGeneration[generation.id] ||
        this.badgesByGeneration[generation.id][fromRound] === undefined) {
      console.warn(
        `BadgesService.getBadge: no badge for generation ${generation.id} round ${fromRound}`
      );
      return of(undefined as unknown as Badge);
    }

    let badge = this.badgesByGeneration[generation.id][fromRound];

    if (Array.isArray(badge)) {
      badge = badge[fromLeader];
    }

    return of(badge);
  }
}

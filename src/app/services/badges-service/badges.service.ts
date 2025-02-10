import { Injectable } from '@angular/core';
import { GenerationItem } from '../../interfaces/generation-item';
import { Observable } from 'rxjs';
import { badgesByGeneration } from './badges-data';
import { Badge } from '../../interfaces/badge';

@Injectable({
  providedIn: 'root'
})
export class BadgesService {

  constructor() { }

  badgesByGeneration = badgesByGeneration;

  getBadge(generation: GenerationItem, fromRound: number, fromLeader: number): Observable<Badge> {

    let badge = this.badgesByGeneration[generation.id][fromRound];

    if (Array.isArray(badge)) {
      badge = badge[fromLeader];
    }

    return new Observable(observer => {
      observer.next(badge);
      observer.complete();
    });
  }
}

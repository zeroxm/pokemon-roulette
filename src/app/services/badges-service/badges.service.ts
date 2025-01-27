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

  getBadge(generation: GenerationItem, fromRound: number): Observable<Badge> {
    return new Observable(observer => {
      observer.next(this.badgesByGeneration[generation.id][fromRound]);
      observer.complete();
    });
  }
}

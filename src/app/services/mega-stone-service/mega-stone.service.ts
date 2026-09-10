import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ItemItem } from '../../interfaces/item-item';
import { PokemonItem } from '../../interfaces/pokemon-item';

/**
 * A request to mega evolve.
 *
 * `pokemon` is the exact team member whose stone was tapped, and it is the
 * reason this is an object rather than the bare item: two of the same species
 * hold the same stone, so the stone alone cannot say which one the player
 * meant. It is absent when the stone was tapped in the bag, where there is
 * nothing to point at.
 */
export interface MegaStoneActivation {
  readonly stone: ItemItem;
  readonly pokemon?: PokemonItem;
}

@Injectable({
  providedIn: 'root'
})
export class MegaStoneService {
  private megaStoneTriggerSubject = new Subject<MegaStoneActivation>();

  get megaStoneTrigger$() {
    return this.megaStoneTriggerSubject.asObservable();
  }

  triggerMegaStoneActivation(activation: MegaStoneActivation): void {
    this.megaStoneTriggerSubject.next(activation);
  }
}

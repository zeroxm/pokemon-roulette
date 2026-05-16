import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ItemItem } from '../../interfaces/item-item';

@Injectable({
  providedIn: 'root'
})
export class MegaStoneService {
  private megaStoneTriggerSubject = new Subject<ItemItem>();

  get megaStoneTrigger$() {
    return this.megaStoneTriggerSubject.asObservable();
  }

  triggerMegaStoneActivation(megaStone: ItemItem): void {
    this.megaStoneTriggerSubject.next(megaStone);
  }
}

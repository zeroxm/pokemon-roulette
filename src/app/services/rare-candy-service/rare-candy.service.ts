import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ItemItem } from '../../interfaces/item-item';

@Injectable({
  providedIn: 'root'
})
export class RareCandyService {
  private rareCandyTriggerSubject = new Subject<ItemItem>();
  
  // Observable that components can subscribe to
  get rareCandyTrigger$() {
    return this.rareCandyTriggerSubject.asObservable();
  }
  
  // Method to trigger rare candy evolution
  triggerRareCandyEvolution(rareCandy: ItemItem): void {
    this.rareCandyTriggerSubject.next(rareCandy);
  }
}

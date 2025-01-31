import { Injectable } from '@angular/core';
import { itemsData } from './items-data';
import { Observable } from 'rxjs';
import { ItemName } from './item-names';
import { ItemItem } from '../../interfaces/item-item';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  constructor() { }

  itemsData = itemsData;

  getItem(itemName: ItemName): Observable<ItemItem> {
    return new Observable(observer => {
      observer.next(this.itemsData[itemName]);
      observer.complete();
    });
  }

  getAllItems(): ItemItem[] {
    return Object.values(this.itemsData);
  }
}

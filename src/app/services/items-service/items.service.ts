import { Injectable } from '@angular/core';
import { itemsData } from './items-data';
import { ItemName } from './item-names';
import { ItemItem } from '../../interfaces/item-item';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  constructor() { }

  itemsData = itemsData;

  getItem(itemName: ItemName): ItemItem {
    return this.itemsData[itemName];
  }

  getAllItems(): ItemItem[] {
    return Object.values(this.itemsData);
  }
}

import { Injectable } from '@angular/core';
import { itemsData } from './items-data';
import { megaStonesData } from './mega-stones-data';
import { ItemName, MegaStoneItemName, RegularItemName } from './item-names';
import { ItemItem } from '../../interfaces/item-item';

@Injectable({
  providedIn: 'root'
})
export class ItemsService {

  constructor() { }

  readonly regularItemsData = itemsData;
  readonly megaStonesData = megaStonesData;
  readonly itemsData = {
    ...this.regularItemsData,
    ...this.megaStonesData
  };

  getRegularItem(itemName: RegularItemName): ItemItem {
    return this.regularItemsData[itemName];
  }

  getMegaStone(itemName: MegaStoneItemName): ItemItem {
    return this.megaStonesData[itemName];
  }

  getItem(itemName: ItemName): ItemItem {
    return this.itemsData[itemName];
  }

  getRegularItems(): ItemItem[] {
    return Object.values(this.regularItemsData);
  }

  getMegaStones(): ItemItem[] {
    return Object.values(this.megaStonesData);
  }

  getAllItems(): ItemItem[] {
    return Object.values(this.itemsData);
  }
}

import { Injectable } from '@angular/core';
import { ItemName } from '../items-service/item-names';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemSpriteService {

  constructor() { }

  itemSpriteData: Record<ItemName, { sprite: string }> = {
    potion: { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png' },
  };

  getItemSprite(itemName: ItemName): Observable<{ sprite: string }> {
    return new Observable(observer => {
      observer.next(this.itemSpriteData[itemName]);
      observer.complete();
    });
  }
}

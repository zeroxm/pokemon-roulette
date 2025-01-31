import { Injectable } from '@angular/core';
import { ItemName } from '../items-service/item-names';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemSpriteService {

  constructor() { }

  itemSpriteData: Record<ItemName, { sprite: string }> = {
    "potion": { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png' },
    "rare-candy": { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png' },
    "running-shoes": { sprite: 'https://archives.bulbagarden.net/media/upload/4/42/Bag_Running_Shoes_Sprite.png' },
    "super-potion": { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-potion.png' },
    "x-attack": { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-attack.png' },
    "exp-share": { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/exp-share.png' },
    "hyper-potion": { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/hyper-potion.png' },
    "escape-rope": { sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/escape-rope.png' }
  };

  getItemSprite(itemName: ItemName): Observable<{ sprite: string }> {
    return new Observable(observer => {
      observer.next(this.itemSpriteData[itemName]);
      observer.complete();
    });
  }
}

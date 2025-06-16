import { ItemItem } from "../../interfaces/item-item";
import { ItemName } from "./item-names";

export const itemsData: Record<ItemName, ItemItem> = {
    'potion': {
        text: 'items.potion.name',
        name: 'potion',
        sprite: '',
        fillStyle: 'purple',
        weight: 1,
        description: 'items.potion.description'
    },
    'rare-candy': {
        text: 'items.rare-candy.name',
        name: 'rare-candy',
        sprite: '',
        fillStyle: 'darkcyan',
        weight: 1,
        description: 'items.rare-candy.description'
    },
    'running-shoes': {
        text: 'items.running-shoes.name',
        name: 'running-shoes',
        sprite: '',
        fillStyle: 'darkgoldenrod',
        weight: 1,
        description: 'items.running-shoes.description'
    },
    'super-potion': {
        text: 'items.super-potion.name',
        name: 'super-potion',
        sprite: '',
        fillStyle: 'darkorange',
        weight: 1,
        description: 'items.super-potion.description'
    },
    'x-attack': {
        text: 'items.x-attack.name',
        name: 'x-attack',
        sprite: '',
        fillStyle: 'crimson',
        weight: 1,
        description: 'items.x-attack.description'
    },
    "exp-share": {
        text: 'items.exp-share.name',
        name: 'exp-share',
        sprite: '',
        fillStyle: 'black',
        weight: 1,
        description: 'items.exp-share.description'
    },
    "hyper-potion": {
        text: 'items.hyper-potion.name',
        name: 'hyper-potion',
        sprite: '',
        fillStyle: 'deeppink',
        weight: 1,
        description: 'items.hyper-potion.description'
    },
    "escape-rope": {
        text: 'items.escape-rope.name',
        name: 'escape-rope',
        sprite: '',
        fillStyle: 'maroon',
        weight: 1,
        description: 'items.escape-rope.description'
    }
}

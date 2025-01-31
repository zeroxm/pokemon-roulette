import { ItemItem } from "../../interfaces/item-item";
import { ItemName } from "./item-names";

export const itemsData: Record<ItemName, ItemItem> = {
    'potion': {
        text: 'Potion',
        name: 'potion',
        sprite: '',
        fillStyle: 'purple',
        weight: 1,
        description: 'Potion let you spin again whenever you would lose a Gym battle!'
    },
    'rare-candy': {
        text: 'Rare Candy',
        name: 'rare-candy',
        sprite: '',
        fillStyle: 'darkcyan',
        weight: 1,
        description: 'Use a Rare Candy to Evolve your Pokémon anytime!'
    },
    'running-shoes': {
        text: 'Running Shoes',
        name: 'running-shoes',
        sprite: '',
        fillStyle: 'darkgoldenrod',
        weight: 1,
        description: 'Running Shoes let you spin the wheel twice between Gyms!'
    },
    'super-potion': {
        text: 'Super Potion',
        name: 'super-potion',
        sprite: '',
        fillStyle: 'darkorange',
        weight: 1,
        description: 'Super Potion let you spin again up to two times whenever you would lose a Gym battle!'
    },
    'x-attack': {
        text: 'X Attack',
        name: 'x-attack',
        sprite: '',
        fillStyle: 'crimson',
        weight: 1,
        description: 'X Attack makes your Team is stronger!'
    },
    "exp-share": {
        text: 'Exp Share',
        name: 'exp-share',
        sprite: '',
        fillStyle: 'black',
        weight: 1,
        description: 'Whenever a Pokémon evolves, Exp Share makes another Pokémon evolve!'
    },
    "hyper-potion": {
        text: 'Hyper Potion',
        name: 'hyper-potion',
        sprite: '',
        fillStyle: 'deeppink',
        weight: 1,
        description: 'Hyper Potion let you spin again up to three times whenever you would lose a Gym battle!'
    },
    "escape-rope": {
        text: 'Escape Rope',
        name: 'escape-rope',
        sprite: '',
        fillStyle: 'maroon',
        weight: 1,
        description: 'Next time you would lose a Spin between Gyms, Escape Rope resets that spin!'
    }
}
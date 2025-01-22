import { PokemonItem } from "../interfaces/pokemon-item";

export const starterByGeneration: Record<number, PokemonItem[]> = {
    1: [
        { text: 'Pikachu', pokemonId: 25, fillStyle: 'goldenrod', sprite: null, shiny: false, power: 1 },
        { text: 'Bulbasaur', pokemonId: 1, fillStyle: 'green', sprite: null, shiny: false, power: 1 },
        { text: 'Charmander', pokemonId: 4, fillStyle: 'crimson', sprite: null, shiny: false, power: 1 },
        { text: 'Squirtle', pokemonId: 7, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1 }],
    2: [
        { text: 'Chikorita', pokemonId: 152, fillStyle: 'green', sprite: null, shiny: false, power: 1 },
        { text: 'Cyndaquil', pokemonId: 155, fillStyle: 'crimson', sprite: null, shiny: false, power: 1 },
        { text: 'Totodile', pokemonId: 158, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1 }],
    3: [
        { text: 'Treecko', pokemonId: 252, fillStyle: 'green', sprite: null, shiny: false, power: 1 },
        { text: 'Torchic', pokemonId: 255, fillStyle: 'crimson', sprite: null, shiny: false, power: 1 },
        { text: 'Mudkip', pokemonId: 258, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1 }],
    4: [
        { text: 'Turtwig', pokemonId: 387, fillStyle: 'green', sprite: null, shiny: false, power: 1 },
        { text: 'Chimchar', pokemonId: 390, fillStyle: 'crimson', sprite: null, shiny: false, power: 1 },
        { text: 'Piplup', pokemonId: 393, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1 }],
    5: [
        { text: 'Snivy', pokemonId: 495, fillStyle: 'green', sprite: null, shiny: false, power: 1 },
        { text: 'Tepig', pokemonId: 498, fillStyle: 'crimson', sprite: null, shiny: false, power: 1 },
        { text: 'Oshawott', pokemonId: 501, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1 }],
    6: [
        { text: 'Chespin', pokemonId: 650, fillStyle: 'green', sprite: null, shiny: false, power: 1 },
        { text: 'Fennekin', pokemonId: 653, fillStyle: 'crimson', sprite: null, shiny: false, power: 1 },
        { text: 'Froakie', pokemonId: 656, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1 }],
    7: [
        { text: 'Rowlet', pokemonId: 722, fillStyle: 'green', sprite: null, shiny: false, power: 1 },
        { text: 'Litten', pokemonId: 725, fillStyle: 'crimson', sprite: null, shiny: false, power: 1 },
        { text: 'Popplio', pokemonId: 728, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1 }],
    8: [
        { text: 'Grookey', pokemonId: 810, fillStyle: 'green', sprite: null, shiny: false, power: 1 },
        { text: 'Scorbunny', pokemonId: 813, fillStyle: 'crimson', sprite: null, shiny: false, power: 1 },
        { text: 'Sobble', pokemonId: 816, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1 }]
}
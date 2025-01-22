import { PokemonItem } from "../interfaces/pokemon-item";

export const starterByGeneration: Record<number, PokemonItem[]> = {
    1: [
        { text: 'Pikachu', pokemonId: 25, fillStyle: 'goldenrod', sprite: null, shiny: false },
        { text: 'Bulbasaur', pokemonId: 1, fillStyle: 'green', sprite: null, shiny: false },
        { text: 'Charmander', pokemonId: 4, fillStyle: 'crimson', sprite: null, shiny: false },
        { text: 'Squirtle', pokemonId: 7, fillStyle: 'darkblue', sprite: null, shiny: false }],
    2: [
        { text: 'Chikorita', pokemonId: 152, fillStyle: 'green', sprite: null, shiny: false },
        { text: 'Cyndaquil', pokemonId: 155, fillStyle: 'crimson', sprite: null, shiny: false },
        { text: 'Totodile', pokemonId: 158, fillStyle: 'darkblue', sprite: null, shiny: false }],
    3: [
        { text: 'Treecko', pokemonId: 252, fillStyle: 'green', sprite: null, shiny: false },
        { text: 'Torchic', pokemonId: 255, fillStyle: 'crimson', sprite: null, shiny: false },
        { text: 'Mudkip', pokemonId: 258, fillStyle: 'darkblue', sprite: null, shiny: false }],
    4: [
        { text: 'Turtwig', pokemonId: 387, fillStyle: 'green', sprite: null, shiny: false },
        { text: 'Chimchar', pokemonId: 390, fillStyle: 'crimson', sprite: null, shiny: false },
        { text: 'Piplup', pokemonId: 393, fillStyle: 'darkblue', sprite: null, shiny: false }],
    5: [
        { text: 'Snivy', pokemonId: 495, fillStyle: 'green', sprite: null, shiny: false },
        { text: 'Tepig', pokemonId: 498, fillStyle: 'crimson', sprite: null, shiny: false },
        { text: 'Oshawott', pokemonId: 501, fillStyle: 'darkblue', sprite: null, shiny: false }],
    6: [
        { text: 'Chespin', pokemonId: 650, fillStyle: 'green', sprite: null, shiny: false },
        { text: 'Fennekin', pokemonId: 653, fillStyle: 'crimson', sprite: null, shiny: false },
        { text: 'Froakie', pokemonId: 656, fillStyle: 'darkblue', sprite: null, shiny: false }],
    7: [
        { text: 'Rowlet', pokemonId: 722, fillStyle: 'green', sprite: null, shiny: false },
        { text: 'Litten', pokemonId: 725, fillStyle: 'crimson', sprite: null, shiny: false },
        { text: 'Popplio', pokemonId: 728, fillStyle: 'darkblue', sprite: null, shiny: false }],
    8: [
        { text: 'Grookey', pokemonId: 810, fillStyle: 'green', sprite: null, shiny: false },
        { text: 'Scorbunny', pokemonId: 813, fillStyle: 'crimson', sprite: null, shiny: false },
        { text: 'Sobble', pokemonId: 816, fillStyle: 'darkblue', sprite: null, shiny: false }]
}
import { PokemonItem } from "../main-game/main-game.component";

export const starterByGeneration: Record<number, PokemonItem[]> = {
    1: [
        { text: 'Pikachu', pokemonId: 25, fillStyle: 'goldenrod', sprite: null },
        { text: 'Bulbasaur', pokemonId: 1, fillStyle: 'green', sprite: null },
        { text: 'Charmander', pokemonId: 4, fillStyle: 'crimson', sprite: null },
        { text: 'Squirtle', pokemonId: 7, fillStyle: 'darkblue', sprite: null }],
    2: [
        { text: 'Chikorita', pokemonId: 152, fillStyle: 'green', sprite: null },
        { text: 'Cyndaquil', pokemonId: 155, fillStyle: 'crimson', sprite: null },
        { text: 'Totodile', pokemonId: 158, fillStyle: 'darkblue', sprite: null }],
    3: [
        { text: 'Treecko', pokemonId: 252, fillStyle: 'green', sprite: null },
        { text: 'Torchic', pokemonId: 255, fillStyle: 'crimson', sprite: null },
        { text: 'Mudkip', pokemonId: 258, fillStyle: 'darkblue', sprite: null }],
    4: [
        { text: 'Turtwig', pokemonId: 387, fillStyle: 'green', sprite: null },
        { text: 'Chimchar', pokemonId: 390, fillStyle: 'crimson', sprite: null },
        { text: 'Piplup', pokemonId: 393, fillStyle: 'darkblue', sprite: null }],
    5: [
        { text: 'Snivy', pokemonId: 495, fillStyle: 'green', sprite: null },
        { text: 'Tepig', pokemonId: 498, fillStyle: 'crimson', sprite: null },
        { text: 'Oshawott', pokemonId: 501, fillStyle: 'darkblue', sprite: null }],
    6: [
        { text: 'Chespin', pokemonId: 650, fillStyle: 'green', sprite: null },
        { text: 'Fennekin', pokemonId: 653, fillStyle: 'crimson', sprite: null },
        { text: 'Froakie', pokemonId: 656, fillStyle: 'darkblue', sprite: null }],
    7: [
        { text: 'Rowlet', pokemonId: 722, fillStyle: 'green', sprite: null },
        { text: 'Litten', pokemonId: 725, fillStyle: 'crimson', sprite: null },
        { text: 'Popplio', pokemonId: 728, fillStyle: 'darkblue', sprite: null }],
    8: [
        { text: 'Grookey', pokemonId: 810, fillStyle: 'green', sprite: null },
        { text: 'Scorbunny', pokemonId: 813, fillStyle: 'crimson', sprite: null },
        { text: 'Sobble', pokemonId: 816, fillStyle: 'darkblue', sprite: null }]
}
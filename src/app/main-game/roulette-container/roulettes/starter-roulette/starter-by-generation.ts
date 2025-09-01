import { PokemonItem } from "../../../../interfaces/pokemon-item";

export const starterByGeneration: Record<number, PokemonItem[]> = {
    1: [
        { text: 'pokemon.bulbasaur', pokemonId: 1, fillStyle: 'green', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.charmander', pokemonId: 4, fillStyle: 'crimson', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.squirtle', pokemonId: 7, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.pikachu', pokemonId: 25, fillStyle: 'goldenrod', sprite: null, shiny: false, power: 2, weight: 1 }],
    2: [
        { text: 'pokemon.chikorita', pokemonId: 152, fillStyle: 'green', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.cyndaquil', pokemonId: 155, fillStyle: 'crimson', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.totodile', pokemonId: 158, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1, weight: 1 }],
    3: [
        { text: 'pokemon.treecko', pokemonId: 252, fillStyle: 'green', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.torchic', pokemonId: 255, fillStyle: 'crimson', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.mudkip', pokemonId: 258, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1, weight: 1 }],
    4: [
        { text: 'pokemon.turtwig', pokemonId: 387, fillStyle: 'green', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.chimchar', pokemonId: 390, fillStyle: 'crimson', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.piplup', pokemonId: 393, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1, weight: 1 }],
    5: [
        { text: 'pokemon.snivy', pokemonId: 495, fillStyle: 'green', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.tepig', pokemonId: 498, fillStyle: 'crimson', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.oshawott', pokemonId: 501, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1, weight: 1 }],
    6: [
        { text: 'pokemon.chespin', pokemonId: 650, fillStyle: 'green', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.fennekin', pokemonId: 653, fillStyle: 'crimson', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.froakie', pokemonId: 656, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1, weight: 1 }],
    7: [
        { text: 'pokemon.rowlet', pokemonId: 722, fillStyle: 'green', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.litten', pokemonId: 725, fillStyle: 'crimson', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.popplio', pokemonId: 728, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1, weight: 1 }],
    8: [
        { text: 'pokemon.grookey', pokemonId: 810, fillStyle: 'green', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.scorbunny', pokemonId: 813, fillStyle: 'crimson', sprite: null, shiny: false, power: 1, weight: 1 },
        { text: 'pokemon.sobble', pokemonId: 816, fillStyle: 'darkblue', sprite: null, shiny: false, power: 1, weight: 1 }]
}

import { TypeMatchupMap } from '../../interfaces/type-matchup';

export const typeMatchups: TypeMatchupMap = {
    bug: {
        strongAgainst: ['dark', 'grass', 'psychic'],
        weakAgainst: ['fire', 'flying', 'rock']
    },
    dark: {
        strongAgainst: ['ghost', 'psychic'],
        weakAgainst: ['bug', 'fairy', 'fighting']
    },
    dragon: {
        strongAgainst: ['dragon'],
        weakAgainst: ['dragon', 'fairy', 'ice']
    },
    electric: {
        strongAgainst: ['flying', 'water'],
        weakAgainst: ['ground']
    },
    fairy: {
        strongAgainst: ['dark', 'dragon', 'fighting'],
        weakAgainst: ['poison', 'steel']
    },
    fighting: {
        strongAgainst: ['dark', 'ice', 'normal', 'rock', 'steel'],
        weakAgainst: ['fairy', 'flying', 'psychic']
    },
    fire: {
        strongAgainst: ['bug', 'grass', 'ice', 'steel'],
        weakAgainst: ['ground', 'rock', 'water']
    },
    flying: {
        strongAgainst: ['bug', 'fighting', 'grass'],
        weakAgainst: ['electric', 'ice', 'rock']
    },
    ghost: {
        strongAgainst: ['ghost', 'psychic'],
        weakAgainst: ['dark', 'ghost']
    },
    grass: {
        strongAgainst: ['ground', 'rock', 'water'],
        weakAgainst: ['bug', 'fire', 'flying', 'ice', 'poison']
    },
    ground: {
        strongAgainst: ['electric', 'fire', 'poison', 'rock', 'steel'],
        weakAgainst: ['grass', 'ice', 'water']
    },
    ice: {
        strongAgainst: ['dragon', 'flying', 'grass', 'ground'],
        weakAgainst: ['fighting', 'fire', 'rock', 'steel']
    },
    normal: {
        strongAgainst: [],
        weakAgainst: ['fighting']
    },
    poison: {
        strongAgainst: ['fairy', 'grass'],
        weakAgainst: ['ground', 'psychic']
    },
    psychic: {
        strongAgainst: ['fighting', 'poison'],
        weakAgainst: ['bug', 'dark', 'ghost']
    },
    rock: {
        strongAgainst: ['bug', 'fire', 'flying', 'ice'],
        weakAgainst: ['fighting', 'grass', 'ground', 'steel', 'water']
    },
    steel: {
        strongAgainst: ['fairy', 'ice', 'rock'],
        weakAgainst: ['fighting', 'fire', 'ground']
    },
    water: {
        strongAgainst: ['fire', 'ground', 'rock'],
        weakAgainst: ['electric', 'grass']
    }
};

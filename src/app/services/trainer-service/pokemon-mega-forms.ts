import { PokemonItem } from '../../interfaces/pokemon-item';
import { MegaStoneItemName } from '../items-service/item-names';

/**
 * A mega form and the stone that produces it.
 *
 * The pairing used to live in a second table keyed by the same base id and joined **by array
 * index**, which nothing could enforce — and which was already wrong: Greninja had three forms
 * against one stone, so two of them were unreachable and the silent `?? forms[0]` fallback hid it.
 */
export interface MegaForm extends PokemonItem {
    readonly stone: MegaStoneItemName;
}

export const pokemonMegaForms: Record<number, MegaForm[]> = {
    3: [
        {
            pokemonId: 10033,
            stone: 'venusaurite',
            text: 'pokemon.venusaur-mega',
            fillStyle: 'green',
            type1: 'grass',
            type2: 'poison',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    6: [
        {
            pokemonId: 10034,
            stone: 'charizardite-x',
            text: 'pokemon.charizard-mega-x',
            fillStyle: 'red',
            type1: 'fire',
            type2: 'dragon',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        },
        {
            pokemonId: 10035,
            stone: 'charizardite-y',
            text: 'pokemon.charizard-mega-y',
            fillStyle: 'red',
            type1: 'fire',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    9: [
        {
            pokemonId: 10036,
            stone: 'blastoisinite',
            text: 'pokemon.blastoise-mega',
            fillStyle: 'blue',
            type1: 'water',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    15: [
        {
            pokemonId: 10090,
            stone: 'beedrillite',
            text: 'pokemon.beedrill-mega',
            fillStyle: 'yellow',
            type1: 'bug',
            type2: 'poison',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    18: [
        {
            pokemonId: 10073,
            stone: 'pidgeotite',
            text: 'pokemon.pidgeot-mega',
            fillStyle: 'brown',
            type1: 'normal',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    26: [
        {
            pokemonId: 10304,
            stone: 'raichunite-x',
            text: 'pokemon.raichu-mega-x',
            fillStyle: 'yellow',
            type1: 'electric',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        },
        {
            pokemonId: 10305,
            stone: 'raichunite-y',
            text: 'pokemon.raichu-mega-y',
            fillStyle: 'yellow',
            type1: 'electric',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    36: [
        {
            pokemonId: 10278,
            stone: 'clefablite',
            text: 'pokemon.clefable-mega',
            fillStyle: 'pink',
            type1: 'fairy',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    65: [
        {
            pokemonId: 10037,
            stone: 'alakazite',
            text: 'pokemon.alakazam-mega',
            fillStyle: 'brown',
            type1: 'psychic',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    71: [
        {
            pokemonId: 10279,
            stone: 'victreebelite',
            text: 'pokemon.victreebel-mega',
            fillStyle: 'green',
            type1: 'grass',
            type2: 'poison',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    80: [
        {
            pokemonId: 10071,
            stone: 'slowbronite',
            text: 'pokemon.slowbro-mega',
            fillStyle: 'pink',
            type1: 'water',
            type2: 'psychic',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    94: [
        {
            pokemonId: 10038,
            stone: 'gengarite',
            text: 'pokemon.gengar-mega',
            fillStyle: 'purple',
            type1: 'ghost',
            type2: 'poison',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    115: [
        {
            pokemonId: 10039,
            stone: 'kangaskhanite',
            text: 'pokemon.kangaskhan-mega',
            fillStyle: 'brown',
            type1: 'normal',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    121: [
        {
            pokemonId: 10280,
            stone: 'starminite',
            text: 'pokemon.starmie-mega',
            fillStyle: 'purple',
            type1: 'water',
            type2: 'psychic',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    127: [
        {
            pokemonId: 10040,
            stone: 'pinsirite',
            text: 'pokemon.pinsir-mega',
            fillStyle: 'brown',
            type1: 'bug',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    130: [
        {
            pokemonId: 10041,
            stone: 'gyaradosite',
            text: 'pokemon.gyarados-mega',
            fillStyle: 'blue',
            type1: 'water',
            type2: 'dark',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    142: [
        {
            pokemonId: 10042,
            stone: 'aerodactylite',
            text: 'pokemon.aerodactyl-mega',
            fillStyle: 'purple',
            type1: 'rock',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    149: [
        {
            pokemonId: 10281,
            stone: 'dragoninite',
            text: 'pokemon.dragonite-mega',
            fillStyle: 'brown',
            type1: 'dragon',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 6
        }
    ],
    150: [
        {
            pokemonId: 10043,
            stone: 'mewtwonite-x',
            text: 'pokemon.mewtwo-mega-x',
            fillStyle: 'purple',
            type1: 'psychic',
            type2: 'fighting',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        },
        {
            pokemonId: 10044,
            stone: 'mewtwonite-y',
            text: 'pokemon.mewtwo-mega-y',
            fillStyle: 'purple',
            type1: 'psychic',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        }
    ],
    154: [
        {
            pokemonId: 10282,
            stone: 'meganiumite',
            text: 'pokemon.meganium-mega',
            fillStyle: 'green',
            type1: 'grass',
            type2: 'fairy',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    160: [
        {
            pokemonId: 10283,
            stone: 'feraligite',
            text: 'pokemon.feraligatr-mega',
            fillStyle: 'blue',
            type1: 'water',
            type2: 'dragon',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    181: [
        {
            pokemonId: 10045,
            stone: 'ampharosite',
            text: 'pokemon.ampharos-mega',
            fillStyle: 'yellow',
            type1: 'electric',
            type2: 'dragon',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    208: [
        {
            pokemonId: 10072,
            stone: 'steelixite',
            text: 'pokemon.steelix-mega',
            fillStyle: 'gray',
            type1: 'steel',
            type2: 'ground',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    212: [
        {
            pokemonId: 10046,
            stone: 'scizorite',
            text: 'pokemon.scizor-mega',
            fillStyle: 'red',
            type1: 'bug',
            type2: 'steel',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    214: [
        {
            pokemonId: 10047,
            stone: 'heracronite',
            text: 'pokemon.heracross-mega',
            fillStyle: 'blue',
            type1: 'bug',
            type2: 'fighting',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    227: [
        {
            pokemonId: 10284,
            stone: 'skarmorite',
            text: 'pokemon.skarmory-mega',
            fillStyle: 'gray',
            type1: 'steel',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    229: [
        {
            pokemonId: 10048,
            stone: 'houndoominite',
            text: 'pokemon.houndoom-mega',
            fillStyle: 'black',
            type1: 'dark',
            type2: 'fire',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    248: [
        {
            pokemonId: 10049,
            stone: 'tyranitarite',
            text: 'pokemon.tyranitar-mega',
            fillStyle: 'green',
            type1: 'rock',
            type2: 'dark',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 6
        }
    ],
    254: [
        {
            pokemonId: 10065,
            stone: 'sceptilite',
            text: 'pokemon.sceptile-mega',
            fillStyle: 'green',
            type1: 'grass',
            type2: 'dragon',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    257: [
        {
            pokemonId: 10050,
            stone: 'blazikenite',
            text: 'pokemon.blaziken-mega',
            fillStyle: 'red',
            type1: 'fire',
            type2: 'fighting',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    260: [
        {
            pokemonId: 10064,
            stone: 'swampertite',
            text: 'pokemon.swampert-mega',
            fillStyle: 'blue',
            type1: 'water',
            type2: 'ground',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    282: [
        {
            pokemonId: 10051,
            stone: 'gardevoirite',
            text: 'pokemon.gardevoir-mega',
            fillStyle: 'white',
            type1: 'psychic',
            type2: 'fairy',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    302: [
        {
            pokemonId: 10066,
            stone: 'sablenite',
            text: 'pokemon.sableye-mega',
            fillStyle: 'purple',
            type1: 'dark',
            type2: 'ghost',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    303: [
        {
            pokemonId: 10052,
            stone: 'mawilite',
            text: 'pokemon.mawile-mega',
            fillStyle: 'black',
            type1: 'steel',
            type2: 'fairy',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    306: [
        {
            pokemonId: 10053,
            stone: 'aggronite',
            text: 'pokemon.aggron-mega',
            fillStyle: 'gray',
            type1: 'steel',
            type2: 'rock',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    308: [
        {
            pokemonId: 10054,
            stone: 'medichamite',
            text: 'pokemon.medicham-mega',
            fillStyle: 'red',
            type1: 'fighting',
            type2: 'psychic',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    310: [
        {
            pokemonId: 10055,
            stone: 'manectite',
            text: 'pokemon.manectric-mega',
            fillStyle: 'yellow',
            type1: 'electric',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    319: [
        {
            pokemonId: 10070,
            stone: 'sharpedonite',
            text: 'pokemon.sharpedo-mega',
            fillStyle: 'blue',
            type1: 'water',
            type2: 'dark',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    323: [
        {
            pokemonId: 10087,
            stone: 'cameruptite',
            text: 'pokemon.camerupt-mega',
            fillStyle: 'red',
            type1: 'fire',
            type2: 'ground',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    334: [
        {
            pokemonId: 10067,
            stone: 'altarianite',
            text: 'pokemon.altaria-mega',
            fillStyle: 'blue',
            type1: 'dragon',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    354: [
        {
            pokemonId: 10056,
            stone: 'banettite',
            text: 'pokemon.banette-mega',
            fillStyle: 'black',
            type1: 'ghost',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    358: [
        {
            pokemonId: 10306,
            stone: 'chimechite',
            text: 'pokemon.chimecho-mega',
            fillStyle: 'blue',
            type1: 'psychic',
            type2: 'steel',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    359: [
        {
            pokemonId: 10057,
            stone: 'absolite',
            text: 'pokemon.absol-mega',
            fillStyle: 'white',
            type1: 'dark',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        },
        {
            pokemonId: 10307,
            stone: 'absolite-z',
            text: 'pokemon.absol-mega-z',
            fillStyle: 'white',
            type1: 'dark',
            type2: 'ghost',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    362: [
        {
            pokemonId: 10074,
            stone: 'glalitite',
            text: 'pokemon.glalie-mega',
            fillStyle: 'gray',
            type1: 'ice',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    373: [
        {
            pokemonId: 10089,
            stone: 'salamencite',
            text: 'pokemon.salamence-mega',
            fillStyle: 'blue',
            type1: 'dragon',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 6
        }
    ],
    376: [
        {
            pokemonId: 10076,
            stone: 'metagrossite',
            text: 'pokemon.metagross-mega',
            fillStyle: 'blue',
            type1: 'steel',
            type2: 'psychic',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 6
        }
    ],
    380: [
        {
            pokemonId: 10062,
            stone: 'latiasite',
            text: 'pokemon.latias-mega',
            fillStyle: 'red',
            type1: 'dragon',
            type2: 'psychic',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        }
    ],
    381: [
        {
            pokemonId: 10063,
            stone: 'latiosite',
            text: 'pokemon.latios-mega',
            fillStyle: 'blue',
            type1: 'dragon',
            type2: 'psychic',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        }
    ],
    382: [
        {
            pokemonId: 10077,
            stone: 'blue-orb',
            text: 'pokemon.kyogre-primal',
            fillStyle: 'blue',
            type1: 'water',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        }
    ],
    383: [
        {
            pokemonId: 10078,
            stone: 'red-orb',
            text: 'pokemon.groudon-primal',
            fillStyle: 'red',
            type1: 'ground',
            type2: 'fire',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        }
    ],
    384: [
        {
            pokemonId: 10079,
            stone: 'dragon-ascent',
            text: 'pokemon.rayquaza-mega',
            fillStyle: 'green',
            type1: 'dragon',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 8
        }
    ],
    398: [
        {
            pokemonId: 10308,
            stone: 'staraptite',
            text: 'pokemon.staraptor-mega',
            fillStyle: 'brown',
            type1: 'normal',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    428: [
        {
            pokemonId: 10088,
            stone: 'lopunnite',
            text: 'pokemon.lopunny-mega',
            fillStyle: 'brown',
            type1: 'normal',
            type2: 'fighting',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    445: [
        {
            pokemonId: 10058,
            stone: 'garchompite',
            text: 'pokemon.garchomp-mega',
            fillStyle: 'blue',
            type1: 'dragon',
            type2: 'ground',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        },
        {
            pokemonId: 10309,
            stone: 'garchompite-z',
            text: 'pokemon.garchomp-mega-z',
            fillStyle: 'blue',
            type1: 'dragon',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    448: [
        {
            pokemonId: 10059,
            stone: 'lucarionite',
            text: 'pokemon.lucario-mega',
            fillStyle: 'blue',
            type1: 'fighting',
            type2: 'steel',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        },
        {
            pokemonId: 10310,
            stone: 'lucarionite-z',
            text: 'pokemon.lucario-mega-z',
            fillStyle: 'blue',
            type1: 'fighting',
            type2: 'steel',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    460: [
        {
            pokemonId: 10060,
            stone: 'abomasite',
            text: 'pokemon.abomasnow-mega',
            fillStyle: 'white',
            type1: 'grass',
            type2: 'ice',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    475: [
        {
            pokemonId: 10068,
            stone: 'galladite',
            text: 'pokemon.gallade-mega',
            fillStyle: 'white',
            type1: 'psychic',
            type2: 'fighting',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    478: [
        {
            pokemonId: 10285,
            stone: 'froslassite',
            text: 'pokemon.froslass-mega',
            fillStyle: 'white',
            type1: 'ice',
            type2: 'ghost',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    485: [
        {
            pokemonId: 10311,
            stone: 'heatranite',
            text: 'pokemon.heatran-mega',
            fillStyle: 'brown',
            type1: 'fire',
            type2: 'steel',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        }
    ],
    491: [
        {
            pokemonId: 10312,
            stone: 'darkranite',
            text: 'pokemon.darkrai-mega',
            fillStyle: 'black',
            type1: 'dark',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        }
    ],
    500: [
        {
            pokemonId: 10286,
            stone: 'emboarite',
            text: 'pokemon.emboar-mega',
            fillStyle: 'red',
            type1: 'fire',
            type2: 'fighting',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    530: [
        {
            pokemonId: 10287,
            stone: 'excadrite',
            text: 'pokemon.excadrill-mega',
            fillStyle: 'gray',
            type1: 'ground',
            type2: 'steel',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    531: [
        {
            pokemonId: 10069,
            stone: 'audinite',
            text: 'pokemon.audino-mega',
            fillStyle: 'pink',
            type1: 'normal',
            type2: 'fairy',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    545: [
        {
            pokemonId: 10288,
            stone: 'scolipite',
            text: 'pokemon.scolipede-mega',
            fillStyle: 'red',
            type1: 'bug',
            type2: 'poison',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    560: [
        {
            pokemonId: 10289,
            stone: 'scraftinite',
            text: 'pokemon.scrafty-mega',
            fillStyle: 'red',
            type1: 'dark',
            type2: 'fighting',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    604: [
        {
            pokemonId: 10290,
            stone: 'eelektrossite',
            text: 'pokemon.eelektross-mega',
            fillStyle: 'blue',
            type1: 'electric',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    609: [
        {
            pokemonId: 10291,
            stone: 'chandelurite',
            text: 'pokemon.chandelure-mega',
            fillStyle: 'black',
            type1: 'ghost',
            type2: 'fire',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    623: [
        {
            pokemonId: 10313,
            stone: 'golurkite',
            text: 'pokemon.golurk-mega',
            fillStyle: 'green',
            type1: 'ground',
            type2: 'ghost',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    652: [
        {
            pokemonId: 10292,
            stone: 'chesnaughtite',
            text: 'pokemon.chesnaught-mega',
            fillStyle: 'green',
            type1: 'grass',
            type2: 'fighting',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    655: [
        {
            pokemonId: 10293,
            stone: 'delphoxite',
            text: 'pokemon.delphox-mega',
            fillStyle: 'red',
            type1: 'fire',
            type2: 'psychic',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    658: [
        {
            pokemonId: 10294,
            stone: 'greninjite',
            text: 'pokemon.greninja-mega',
            fillStyle: 'blue',
            type1: 'water',
            type2: 'dark',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    668: [
        {
            pokemonId: 10295,
            stone: 'pyroarite',
            text: 'pokemon.pyroar-mega',
            fillStyle: 'brown',
            type1: 'fire',
            type2: 'normal',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    10061: [
        {
            pokemonId: 10296,
            stone: 'floettite',
            text: 'pokemon.floette-mega',
            fillStyle: 'white',
            type1: 'fairy',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    678: [
        {
            pokemonId: 10314,
            stone: 'meowsticite',
            text: 'pokemon.meowstic-mega',
            fillStyle: 'blue',
            type1: 'psychic',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    687: [
        {
            pokemonId: 10297,
            stone: 'malamarite',
            text: 'pokemon.malamar-mega',
            fillStyle: 'blue',
            type1: 'dark',
            type2: 'psychic',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    689: [
        {
            pokemonId: 10298,
            stone: 'barbaracite',
            text: 'pokemon.barbaracle-mega',
            fillStyle: 'brown',
            type1: 'rock',
            type2: 'fighting',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    691: [
        {
            pokemonId: 10299,
            stone: 'dragalgite',
            text: 'pokemon.dragalge-mega',
            fillStyle: 'brown',
            type1: 'poison',
            type2: 'dragon',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    701: [
        {
            pokemonId: 10300,
            stone: 'hawluchanite',
            text: 'pokemon.hawlucha-mega',
            fillStyle: 'green',
            type1: 'fighting',
            type2: 'flying',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    10120: [
        {
            pokemonId: 10301,
            stone: 'zygardite',
            text: 'pokemon.zygarde-mega',
            fillStyle: 'green',
            type1: 'dragon',
            type2: 'ground',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 8
        }
    ],
    719: [
        {
            pokemonId: 10075,
            stone: 'diancite',
            text: 'pokemon.diancie-mega',
            fillStyle: 'pink',
            type1: 'rock',
            type2: 'fairy',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        }
    ],
    740: [
        {
            pokemonId: 10315,
            stone: 'crabominite',
            text: 'pokemon.crabominable-mega',
            fillStyle: 'white',
            type1: 'fighting',
            type2: 'ice',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    768: [
        {
            pokemonId: 10316,
            stone: 'golisopite',
            text: 'pokemon.golisopod-mega',
            fillStyle: 'gray',
            type1: 'bug',
            type2: 'steel',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    780: [
        {
            pokemonId: 10302,
            stone: 'drampanite',
            text: 'pokemon.drampa-mega',
            fillStyle: 'white',
            type1: 'normal',
            type2: 'dragon',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    801: [
        {
            pokemonId: 10317,
            stone: 'magearnite',
            text: 'pokemon.magearna-mega',
            fillStyle: 'gray',
            type1: 'steel',
            type2: 'fairy',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        }
    ],
    10147: [
        {
            pokemonId: 10318,
            stone: 'magearnite',
            text: 'pokemon.magearna-original-mega',
            fillStyle: 'gray',
            type1: 'steel',
            type2: 'fairy',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        }
    ],
    807: [
        {
            pokemonId: 10319,
            stone: 'zeraorite',
            text: 'pokemon.zeraora-mega',
            fillStyle: 'yellow',
            type1: 'electric',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 7
        }
    ],
    870: [
        {
            pokemonId: 10303,
            stone: 'falinksite',
            text: 'pokemon.falinks-mega',
            fillStyle: 'yellow',
            type1: 'fighting',
            type2: null,
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    952: [
        {
            pokemonId: 10320,
            stone: 'scovillainite',
            text: 'pokemon.scovillain-mega',
            fillStyle: 'green',
            type1: 'grass',
            type2: 'fire',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    970: [
        {
            pokemonId: 10321,
            stone: 'glimmoranite',
            text: 'pokemon.glimmora-mega',
            fillStyle: 'blue',
            type1: 'rock',
            type2: 'poison',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    978: [
        {
            pokemonId: 10322,
            stone: 'tatsugirinite',
            text: 'pokemon.tatsugiri-curly-mega',
            fillStyle: 'pink',
            type1: 'dragon',
            type2: 'water',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    10258: [
        {
            pokemonId: 10323,
            stone: 'tatsugirinite',
            text: 'pokemon.tatsugiri-droopy-mega',
            fillStyle: 'pink',
            type1: 'dragon',
            type2: 'water',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    10259: [
        {
            pokemonId: 10324,
            stone: 'tatsugirinite',
            text: 'pokemon.tatsugiri-stretchy-mega',
            fillStyle: 'pink',
            type1: 'dragon',
            type2: 'water',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 5
        }
    ],
    998: [
        {
            pokemonId: 10325,
            stone: 'baxcalibrite',
            text: 'pokemon.baxcalibur-mega',
            fillStyle: 'gray',
            type1: 'dragon',
            type2: 'ice',
            weight: 1,
            sprite: null,
            shiny: false,
            power: 6
        }
    ]
};


/** Maps base Pokémon ID to one or more mega stone item names. */

export function megaStoneNamesForBaseId(baseId: number): MegaStoneItemName[] {
    return (pokemonMegaForms[baseId] ?? []).map(form => form.stone);
}


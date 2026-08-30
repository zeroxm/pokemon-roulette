import { PokemonType } from '../../../../interfaces/pokemon-type';

/**
 * The Friend Safari catch pools, one per type.
 *
 * Sourced from the documented X/Y Friend Safari encounter tables and cross-checked between Serebii
 * and Bulbapedia. A real safari holds three of these; the wheel offers the whole pool for the type,
 * so every documented encounter is reachable.
 *
 * Five species appear in two pools — Sneasel, Venomoth, Fletchinder, Dedenne and Mawile — which is
 * faithful to the games rather than an oversight.
 */
export const friendSafariPokemon: Record<PokemonType, number[]> = {
  normal: [
    190, // Aipom
    206, // Dunsparce
    216, // Teddiursa
    506, // Lillipup
    294, // Loudred
    352, // Kecleon
    531, // Audino
    572, // Minccino
    113, // Chansey
    132, // Ditto
    133, // Eevee
    235, // Smeargle
  ],
  fighting: [
     56, // Mankey
     67, // Machoke
    307, // Meditite
    619, // Mienfoo
    538, // Throh
    539, // Sawk
    674, // Pancham
    236, // Tyrogue
    286, // Breloom
    297, // Hariyama
    447, // Riolu
  ],
  flying: [
     16, // Pidgey
     21, // Spearow
     83, // Farfetchd
     84, // Doduo
    163, // Hoothoot
    520, // Tranquill
    527, // Woobat
    581, // Swanna
    357, // Tropius
    627, // Rufflet
    662, // Fletchinder
    701, // Hawlucha
  ],
  poison: [
     14, // Kakuna
     44, // Gloom
    268, // Cascoon
    336, // Seviper
     49, // Venomoth
    168, // Ariados
    317, // Swalot
    569, // Garbodor
     89, // Muk
    452, // Drapion
    454, // Toxicroak
    544, // Whirlipede
  ],
  ground: [
     27, // Sandshrew
    194, // Wooper
    231, // Phanpy
    328, // Trapinch
     51, // Dugtrio
    105, // Marowak
    290, // Nincada
    323, // Camerupt
    423, // Gastrodon
    536, // Palpitoad
    660, // Diggersby
  ],
  rock: [
    299, // Nosepass
    525, // Boldore
    557, // Dwebble
     95, // Onix
    219, // Magcargo
    222, // Corsola
    247, // Pupitar
    112, // Rhydon
    213, // Shuckle
    689, // Barbaracle
  ],
  bug: [
     12, // Butterfree
     46, // Paras
    165, // Ledyba
    415, // Combee
    267, // Beautifly
    284, // Masquerain
    313, // Volbeat
    314, // Illumise
     49, // Venomoth
    127, // Pinsir
    214, // Heracross
    666, // Vivillon
  ],
  ghost: [
    353, // Shuppet
    608, // Lampent
    708, // Phantump
    710, // Pumpkaboo
    356, // Dusclops
    426, // Drifblim
    442, // Spiritomb
    623, // Golurk
  ],
  steel: [
     82, // Magneton
    303, // Mawile
    597, // Ferroseed
    205, // Forretress
    227, // Skarmory
    375, // Metang
    600, // Klang
    437, // Bronzong
    530, // Excadrill
    707, // Klefki
  ],
  fire: [
     58, // Growlithe
     77, // Ponyta
    126, // Magmar
    513, // Pansear
      5, // Charmeleon
    218, // Slugma
    636, // Larvesta
    668, // Pyroar
     38, // Ninetales
    654, // Braixen
    662, // Fletchinder
  ],
  water: [
     98, // Krabby
    224, // Octillery
    400, // Bibarel
    515, // Panpour
      8, // Wartortle
    130, // Gyarados
    195, // Quagsire
    419, // Floatzel
     61, // Poliwhirl
    184, // Azumarill
    657, // Frogadier
  ],
  grass: [
     43, // Oddish
    114, // Tangela
    191, // Sunkern
    511, // Pansage
      2, // Ivysaur
    541, // Swadloon
    548, // Petilil
    586, // Sawsbuck
    556, // Maractus
    651, // Quilladin
    673, // Gogoat
  ],
  electric: [
    101, // Electrode
    417, // Pachirisu
    587, // Emolga
    702, // Dedenne
     25, // Pikachu
    125, // Electabuzz
    618, // Stunfisk
    694, // Helioptile
    310, // Manectric
    404, // Luxio
    523, // Zebstrika
    596, // Galvantula
  ],
  psychic: [
     63, // Abra
     96, // Drowzee
    326, // Grumpig
    517, // Munna
    202, // Wobbuffet
    561, // Sigilyph
    677, // Espurr
    178, // Xatu
    203, // Girafarig
    575, // Gothorita
    578, // Duosion
  ],
  ice: [
    225, // Delibird
    361, // Snorunt
    363, // Spheal
    459, // Snover
    215, // Sneasel
    614, // Beartic
    712, // Bergmite
     87, // Dewgong
     91, // Cloyster
    131, // Lapras
    221, // Piloswine
  ],
  dragon: [
    444, // Gabite
    611, // Fraxure
    148, // Dragonair
    372, // Shelgon
    714, // Noibat
    621, // Druddigon
    705, // Sliggoo
  ],
  dark: [
    262, // Mightyena
    274, // Nuzleaf
    624, // Pawniard
    629, // Vullaby
    215, // Sneasel
    332, // Cacturne
    342, // Crawdaunt
    551, // Sandile
    302, // Sableye
    359, // Absol
    510, // Liepard
    686, // Inkay
  ],
  fairy: [
    175, // Togepi
    209, // Snubbull
    281, // Kirlia
    702, // Dedenne
     39, // Jigglypuff
    303, // Mawile
    682, // Spritzee
    684, // Swirlix
     35, // Clefairy
    670, // Floette
  ],
};

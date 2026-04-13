# Type Matchup Research: Pokémon Roulette Angular App

**Researched:** 2025  
**Scope:** Type effectiveness data, gym/Elite Four type assignments, Angular integration patterns  
**Confidence:** HIGH (canonical game data + direct codebase inspection)

---

## 1. Existing Codebase Findings

### 1.1 PokemonType Union (`src/app/interfaces/pokemon-type.ts`)

18 types defined as a union type **and** as an ordered array with numeric IDs:

```ts
export type PokemonType =
  'normal' | 'fighting' | 'flying' | 'poison' | 'ground' | 'rock' |
  'bug' | 'ghost' | 'steel' | 'fire' | 'water' | 'grass' | 'electric' |
  'psychic' | 'ice' | 'dragon' | 'dark' | 'fairy';

// IDs 1–18 match the PokeAPI sprite path used in pokedex-detail-modal:
// https://…/sprites/types/generation-viii/brilliant-diamond-shining-pearl/{id}.png
export const pokemonTypeData: PokemonTypeData[] = [
  { id: 1, key: 'normal' },  { id: 2, key: 'fighting' }, { id: 3, key: 'flying' },
  { id: 4, key: 'poison' },  { id: 5, key: 'ground' },   { id: 6, key: 'rock' },
  { id: 7, key: 'bug' },     { id: 8, key: 'ghost' },    { id: 9, key: 'steel' },
  { id: 10, key: 'fire' },   { id: 11, key: 'water' },   { id: 12, key: 'grass' },
  { id: 13, key: 'electric'},{ id: 14, key: 'psychic' }, { id: 15, key: 'ice' },
  { id: 16, key: 'dragon' }, { id: 17, key: 'dark' },    { id: 18, key: 'fairy' }
];
// Also exported: pokemonTypeDataByKey (Record<PokemonType, PokemonTypeData>)
```

**`pokemonTypeDataByKey` is already available** for O(1) type → id lookup. The type icon URL pattern from `pokedex-detail-modal` can be reused for displaying gym leader types.

### 1.2 GymLeader Interface (`src/app/interfaces/gym-leader.ts`)

**Current (missing types):**
```ts
export interface GymLeader {
  name: string;
  sprite: string | string[];
  quotes: string[];
}
```

**Required addition:**
```ts
export interface GymLeader {
  name: string;
  sprite: string | string[];
  quotes: string[];
  types: PokemonType[];          // ← add this
}
```

`types` is an array (not singular) because Gen 5's Cilan/Chili/Cress triple entry covers Grass/Fire/Water, Gen 7's Lana/Kiawe/Mallow covers Water/Fire/Grass, and Gen 8's Bea/Allister covers Fighting/Ghost. The service reads `currentLeader` from `gymLeadersByGeneration[generation.id][currentRound]` — the types array must match the chosen leader after the random split (see §1.4 for the split pattern).

### 1.3 PokemonItem Interface (`src/app/interfaces/pokemon-item.ts`)

```ts
export interface PokemonItem extends WheelItem {
  pokemonId: number;
  type1?: PokemonType;
  type2?: PokemonType | null;
  sprite: { front_default: string; front_shiny: string } | null;
  shiny: boolean;
  power: 1 | 2 | 3 | 4 | 5;
}
```

Each Pokémon already carries `type1` / `type2`. The `TypeMatchupService` can read these directly from `trainerTeam` (available as `PokemonItem[]`).

### 1.4 Wheel Weight System (`src/app/wheel/wheel.component.ts`)

**How weights work:**
- `WheelItem.weight: number` — a positive integer controlling arc size.  
- `getTotalWeights()` sums all weights; each item's arc = `weight / totalWeight * 2π`.  
- `getRandomWeightedIndex()` picks proportionally: `random * totalWeight`, then walks cumulative weights.  
- Weight = 1 for every item in the current gym/elite battle components — **all slots are equal weight 1**, but the *count* of YES vs NO items controls odds (see §1.5).

### 1.5 `calcVictoryOdds()` — How Odds Are Built

**Gym battle pattern** (`gym-battle-roulette.component.ts`):
```
yesOdds = [1 base] + [pokemon.power slots each] + [powerModifier slots from x-attack]
noOdds  = [currentRound slots] + [1 base slot]
victoryOdds = interleaveOdds(yesOdds, noOdds)
```

**Elite Four pattern** (same, but starts with **2** base no-slots instead of 1):
```
noOdds = [currentRound slots] + [2 base slots]
```

**Integration point for type matchup:** Add `typeBonus` slots to `yesOdds` (or `typePenalty` to `noOdds`) computed by `TypeMatchupService`. The right place is inside `calcVictoryOdds()`, after the `trainerTeam.forEach` loop and before `interleaveOdds()`.

### 1.6 TrainerService (`src/app/services/trainer-service/trainer.service.ts`)

```ts
getTeamObservable(): Observable<PokemonItem[]>  // BehaviorSubject — emits on every team change
getTeam(): PokemonItem[]                         // synchronous snapshot
getItems(): ItemItem[]                           // synchronous snapshot
```

Both gym and elite four roulettes subscribe to `getTeamObservable()` and call `calcVictoryOdds()` on each emission. The `TypeMatchupService` will be called from inside `calcVictoryOdds()` — no additional subscription needed.

### 1.7 ModalQueueService (`src/app/services/modal-queue-service/modal-queue.service.ts`)

Promise-based serial queue on top of NgbModal. Signature:
```ts
open(content: TemplateRef<any>, options?: NgbModalOptions): Promise<NgbModalRef>
```
Each `open()` call waits for the previous modal's `result` promise before showing the next. The gym leader presentation modal is opened immediately on `game-state === 'gym-battle'`. A "type advantage" info line can be shown **inside** that same `gymLeaderPresentationModal` template — no new modal needed.

### 1.8 Multi-Leader Slots (Gen 5, 7, 8)

When a gym slot has multiple possible leaders (e.g. Cilan/Chili/Cress), the component:
1. Translates the combined name string (e.g. `"Cilan/Chili/Cress"`)
2. Splits on `/`
3. Picks `randomIndex` and emits `fromLeaderChange`
4. Overwrites `currentLeader` with the chosen sub-leader

**Implication:** The `types` field on the *pre-split* entry should carry all possible types (e.g. `['grass','fire','water']`). After the split, the service constructs a simplified `currentLeader` — the `types` at that point should be resolved to just the chosen leader's type. To support this cleanly, define types per-slot on the array entry, and after `randomIndex` is chosen, pass `[types[randomIndex]]` into the rebuilt `currentLeader`.

### 1.9 Type Icons (already in pokedex-detail-modal)

```ts
private readonly typeIconBaseUrl =
  'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl';

getTypeIconUrl(type: PokemonType): string {
  const typeData = pokemonTypeDataByKey[type];
  return `${this.typeIconBaseUrl}/${typeData.id}.png`;
}
```

This exact pattern can be copy-pasted into `gym-battle-roulette.component.ts` or extracted into a shared pipe/utility. **Do not duplicate the base URL** — move it to a shared constant.

### 1.10 Generations Covered

| Gen | Gym Leaders | Elite Four / Champion Cup |
|-----|-------------|--------------------------|
| 1   | 8 leaders   | Lorelei, Bruno, Agatha, Lance |
| 2   | 8 leaders   | Will, Koga, Bruno, Karen |
| 3   | 8 leaders   | Sidney, Phoebe, Glacia, Drake |
| 4   | 8 leaders   | Aaron, Bertha, Flint, Lucian |
| 5   | 8 leaders (3 multi-slots) | Shauntal, Marshal, Grimsley, Caitlin |
| 6   | 8 leaders   | Malva, Siebold, Wikstrom, Drasna |
| 7   | 8 captains (2 multi-slots) | Molayne, Olivia, Acerola, Kahili |
| 8   | 8 leaders (2 multi-slots) | Marnie/Hop/Bede, Nessa, Bea/Allister, Raihan |
| 9   | 8 leaders   | Rika, Poppy, Larry, Hassel |

---

## 2. Full 18×18 Type Effectiveness Chart (Gen VI+)

**Key:** `chart[attacker][defender]` = damage multiplier  
Values: `0` (immune), `0.5` (not very effective), `1` (normal), `2` (super effective)

### 2.1 JSON Structure for `type-matchups.json`

```json
{
  "normal":   { "normal":1,"fighting":1,"flying":1,"poison":1,"ground":1,"rock":0.5,"bug":1,"ghost":0,"steel":0.5,"fire":1,"water":1,"grass":1,"electric":1,"psychic":1,"ice":1,"dragon":1,"dark":1,"fairy":1 },
  "fighting": { "normal":2,"fighting":1,"flying":0.5,"poison":0.5,"ground":1,"rock":2,"bug":0.5,"ghost":0,"steel":2,"fire":1,"water":1,"grass":1,"electric":1,"psychic":0.5,"ice":2,"dragon":1,"dark":2,"fairy":0.5 },
  "flying":   { "normal":1,"fighting":2,"flying":1,"poison":1,"ground":1,"rock":0.5,"bug":2,"ghost":1,"steel":0.5,"fire":1,"water":1,"grass":2,"electric":0.5,"psychic":1,"ice":1,"dragon":1,"dark":1,"fairy":1 },
  "poison":   { "normal":1,"fighting":1,"flying":1,"poison":0.5,"ground":0.5,"rock":0.5,"bug":1,"ghost":0.5,"steel":0,"fire":1,"water":1,"grass":2,"electric":1,"psychic":1,"ice":1,"dragon":1,"dark":1,"fairy":2 },
  "ground":   { "normal":1,"fighting":1,"flying":0,"poison":2,"ground":1,"rock":2,"bug":0.5,"ghost":1,"steel":2,"fire":2,"water":1,"grass":0.5,"electric":2,"psychic":1,"ice":1,"dragon":1,"dark":1,"fairy":1 },
  "rock":     { "normal":1,"fighting":0.5,"flying":2,"poison":1,"ground":0.5,"rock":1,"bug":2,"ghost":1,"steel":0.5,"fire":2,"water":1,"grass":1,"electric":1,"psychic":1,"ice":2,"dragon":1,"dark":1,"fairy":1 },
  "bug":      { "normal":1,"fighting":0.5,"flying":0.5,"poison":0.5,"ground":1,"rock":1,"bug":1,"ghost":0.5,"steel":0.5,"fire":0.5,"water":1,"grass":2,"electric":1,"psychic":2,"ice":1,"dragon":1,"dark":2,"fairy":0.5 },
  "ghost":    { "normal":0,"fighting":1,"flying":1,"poison":1,"ground":1,"rock":1,"bug":1,"ghost":2,"steel":1,"fire":1,"water":1,"grass":1,"electric":1,"psychic":2,"ice":1,"dragon":1,"dark":0.5,"fairy":1 },
  "steel":    { "normal":1,"fighting":1,"flying":1,"poison":1,"ground":1,"rock":2,"bug":1,"ghost":1,"steel":0.5,"fire":0.5,"water":0.5,"grass":1,"electric":0.5,"psychic":1,"ice":2,"dragon":1,"dark":1,"fairy":2 },
  "fire":     { "normal":1,"fighting":1,"flying":1,"poison":1,"ground":1,"rock":0.5,"bug":2,"ghost":1,"steel":2,"fire":0.5,"water":0.5,"grass":2,"electric":1,"psychic":1,"ice":2,"dragon":0.5,"dark":1,"fairy":1 },
  "water":    { "normal":1,"fighting":1,"flying":1,"poison":1,"ground":2,"rock":2,"bug":1,"ghost":1,"steel":1,"fire":2,"water":0.5,"grass":0.5,"electric":1,"psychic":1,"ice":1,"dragon":0.5,"dark":1,"fairy":1 },
  "grass":    { "normal":1,"fighting":1,"flying":0.5,"poison":0.5,"ground":2,"rock":2,"bug":0.5,"ghost":1,"steel":0.5,"fire":0.5,"water":2,"grass":0.5,"electric":1,"psychic":1,"ice":1,"dragon":0.5,"dark":1,"fairy":1 },
  "electric": { "normal":1,"fighting":1,"flying":2,"poison":1,"ground":0,"rock":1,"bug":1,"ghost":1,"steel":1,"fire":1,"water":2,"grass":0.5,"electric":0.5,"psychic":1,"ice":1,"dragon":0.5,"dark":1,"fairy":1 },
  "psychic":  { "normal":1,"fighting":2,"flying":1,"poison":2,"ground":1,"rock":1,"bug":1,"ghost":1,"steel":0.5,"fire":1,"water":1,"grass":1,"electric":1,"psychic":0.5,"ice":1,"dragon":1,"dark":0,"fairy":1 },
  "ice":      { "normal":1,"fighting":1,"flying":2,"poison":1,"ground":2,"rock":1,"bug":1,"ghost":1,"steel":0.5,"fire":0.5,"water":0.5,"grass":2,"electric":1,"psychic":1,"ice":0.5,"dragon":2,"dark":1,"fairy":1 },
  "dragon":   { "normal":1,"fighting":1,"flying":1,"poison":1,"ground":1,"rock":1,"bug":1,"ghost":1,"steel":0.5,"fire":1,"water":1,"grass":1,"electric":1,"psychic":1,"ice":1,"dragon":2,"dark":1,"fairy":0 },
  "dark":     { "normal":1,"fighting":0.5,"flying":1,"poison":1,"ground":1,"rock":1,"bug":1,"ghost":2,"steel":0.5,"fire":1,"water":1,"grass":1,"electric":1,"psychic":2,"ice":1,"dragon":1,"dark":0.5,"fairy":0.5 },
  "fairy":    { "normal":1,"fighting":2,"flying":1,"poison":0.5,"ground":1,"rock":1,"bug":1,"ghost":1,"steel":0.5,"fire":0.5,"water":1,"grass":1,"electric":1,"psychic":1,"ice":1,"dragon":2,"dark":2,"fairy":1 }
}
```

### 2.2 Human-Readable Table

Rows = Attacker, Columns = Defender  
`2` = super effective, `½` = not very effective, `0` = immune, `·` = normal (1)

| Atk ↓ / Def → | NOR | FIG | FLY | POI | GRO | ROC | BUG | GHO | STL | FIR | WAT | GRA | ELE | PSY | ICE | DRG | DAR | FAI |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Normal**   | · | · | · | · | · | ½ | · | 0 | ½ | · | · | · | · | · | · | · | · | · |
| **Fighting** | 2 | · | ½ | ½ | · | 2 | ½ | 0 | 2 | · | · | · | · | ½ | 2 | · | 2 | ½ |
| **Flying**   | · | 2 | · | · | · | ½ | 2 | · | ½ | · | · | 2 | ½ | · | · | · | · | · |
| **Poison**   | · | · | · | ½ | ½ | ½ | · | ½ | 0 | · | · | 2 | · | · | · | · | · | 2 |
| **Ground**   | · | · | 0 | 2 | · | 2 | ½ | · | 2 | 2 | · | ½ | 2 | · | · | · | · | · |
| **Rock**     | · | ½ | 2 | · | ½ | · | 2 | · | ½ | 2 | · | · | · | · | 2 | · | · | · |
| **Bug**      | · | ½ | ½ | ½ | · | · | · | ½ | ½ | ½ | · | 2 | · | 2 | · | · | 2 | ½ |
| **Ghost**    | 0 | · | · | · | · | · | · | 2 | · | · | · | · | · | 2 | · | · | ½ | · |
| **Steel**    | · | · | · | · | · | 2 | · | · | ½ | ½ | ½ | · | ½ | · | 2 | · | · | 2 |
| **Fire**     | · | · | · | · | · | ½ | 2 | · | 2 | ½ | ½ | 2 | · | · | 2 | ½ | · | · |
| **Water**    | · | · | · | · | 2 | 2 | · | · | · | 2 | ½ | ½ | · | · | · | ½ | · | · |
| **Grass**    | · | · | ½ | ½ | 2 | 2 | ½ | · | ½ | ½ | 2 | ½ | · | · | · | ½ | · | · |
| **Electric** | · | · | 2 | · | 0 | · | · | · | · | · | 2 | ½ | ½ | · | · | ½ | · | · |
| **Psychic**  | · | 2 | · | 2 | · | · | · | · | ½ | · | · | · | · | ½ | · | · | 0 | · |
| **Ice**      | · | · | 2 | · | 2 | · | · | · | ½ | ½ | ½ | 2 | · | · | ½ | 2 | · | · |
| **Dragon**   | · | · | · | · | · | · | · | · | ½ | · | · | · | · | · | · | 2 | · | 0 |
| **Dark**     | · | ½ | · | · | · | · | · | 2 | ½ | · | · | · | · | 2 | · | · | ½ | ½ |
| **Fairy**    | · | 2 | · | ½ | · | · | · | · | ½ | ½ | · | · | · | · | · | 2 | 2 | · |

### 2.3 Notable Immunities

| Defending Type | Immune to |
|---|---|
| Normal | Ghost |
| Ghost | Normal |
| Flying | Ground |
| Ground | Electric |
| Steel | Poison |
| Dark | Psychic |
| Fairy | Dragon |

---

## 3. Gym Leader Types by Generation

All generations present in `gym-leaders-by-generation.ts`. Index in array = `currentRound` (0-based).

### Generation 1 (Kanto)
| Round | Leader | Type(s) |
|-------|--------|---------|
| 0 | Brock | `['rock']` |
| 1 | Misty | `['water']` |
| 2 | Lt. Surge | `['electric']` |
| 3 | Erika | `['grass']` |
| 4 | Koga | `['poison']` |
| 5 | Sabrina | `['psychic']` |
| 6 | Blaine | `['fire']` |
| 7 | Giovanni | `['ground']` |

### Generation 2 (Johto)
| Round | Leader | Type(s) |
|-------|--------|---------|
| 0 | Falkner | `['flying']` |
| 1 | Bugsy | `['bug']` |
| 2 | Whitney | `['normal']` |
| 3 | Morty | `['ghost']` |
| 4 | Chuck | `['fighting']` |
| 5 | Jasmine | `['steel']` |
| 6 | Pryce | `['ice']` |
| 7 | Clair | `['dragon']` |

### Generation 3 (Hoenn)
| Round | Leader | Type(s) |
|-------|--------|---------|
| 0 | Roxanne | `['rock']` |
| 1 | Brawly | `['fighting']` |
| 2 | Wattson | `['electric']` |
| 3 | Flannery | `['fire']` |
| 4 | Norman | `['normal']` |
| 5 | Winona | `['flying']` |
| 6 | Liza & Tate | `['psychic']` |
| 7 | Wallace | `['water']` |

### Generation 4 (Sinnoh)
| Round | Leader | Type(s) |
|-------|--------|---------|
| 0 | Roark | `['rock']` |
| 1 | Gardenia | `['grass']` |
| 2 | Maylene | `['fighting']` |
| 3 | Crasher Wake | `['water']` |
| 4 | Fantina | `['ghost']` |
| 5 | Byron | `['steel']` |
| 6 | Candice | `['ice']` |
| 7 | Volkner | `['electric']` |

### Generation 5 (Unova)
Multi-slots at rounds 0 and 7 (split by `randomIndex`, flagged in component logic).

| Round | Leader(s) | Type(s) per slot |
|-------|-----------|---------|
| 0 | Cilan / Chili / Cress | `['grass', 'fire', 'water']` → chosen one |
| 1 | Lenora | `['normal']` |
| 2 | Burgh | `['bug']` |
| 3 | Elesa | `['electric']` |
| 4 | Clay | `['ground']` |
| 5 | Skyla | `['flying']` |
| 6 | Brycen | `['ice']` |
| 7 | Drayden / Iris | `['dragon', 'dragon']` → same type, different leader |

### Generation 6 (Kalos)
| Round | Leader | Type(s) |
|-------|--------|---------|
| 0 | Viola | `['bug']` |
| 1 | Grant | `['rock']` |
| 2 | Korrina | `['fighting']` |
| 3 | Ramos | `['grass']` |
| 4 | Clemont | `['electric']` |
| 5 | Valerie | `['fairy']` |
| 6 | Olympia | `['psychic']` |
| 7 | Wulfric | `['ice']` |

### Generation 7 (Alola — Island Kahunas / Trial Captains)
Multi-slots at rounds 2 and 4.

| Round | Leader(s) | Type(s) per slot |
|-------|-----------|---------|
| 0 | Ilima | `['normal']` |
| 1 | Hala | `['fighting']` |
| 2 | Lana / Kiawe / Mallow | `['water', 'fire', 'grass']` → chosen one |
| 3 | Olivia | `['rock']` |
| 4 | Sophocles / Acerola | `['electric', 'ghost']` → chosen one |
| 5 | Nanu | `['dark']` |
| 6 | Mina | `['fairy']` |
| 7 | Hapu | `['ground']` |

### Generation 8 (Galar)
Multi-slots at rounds 3 and 5.

| Round | Leader(s) | Type(s) per slot |
|-------|-----------|---------|
| 0 | Milo | `['grass']` |
| 1 | Nessa | `['water']` |
| 2 | Kabu | `['fire']` |
| 3 | Bea / Allister | `['fighting', 'ghost']` → chosen one |
| 4 | Opal | `['fairy']` |
| 5 | Gordie / Melony | `['rock', 'ice']` → chosen one |
| 6 | Piers | `['dark']` |
| 7 | Raihan | `['dragon']` |

### Generation 9 (Paldea)
| Round | Leader | Type(s) |
|-------|--------|---------|
| 0 | Katy | `['bug']` |
| 1 | Brassius | `['grass']` |
| 2 | Iono | `['electric']` |
| 3 | Kofu | `['water']` |
| 4 | Larry | `['normal']` |
| 5 | Ryme | `['ghost']` |
| 6 | Tulip | `['psychic']` |
| 7 | Grusha | `['ice']` |

---

## 4. Elite Four Types by Generation

Elite Four uses `currentRound % 4` for the member index.

### Gen 1 (Kanto)
| Index | Member | Type |
|-------|--------|------|
| 0 | Lorelei | `['ice']` |
| 1 | Bruno | `['fighting']` |
| 2 | Agatha | `['ghost']` |
| 3 | Lance | `['dragon']` |

### Gen 2 (Johto)
| Index | Member | Type |
|-------|--------|------|
| 0 | Will | `['psychic']` |
| 1 | Koga | `['poison']` |
| 2 | Bruno | `['fighting']` |
| 3 | Karen | `['dark']` |

### Gen 3 (Hoenn)
| Index | Member | Type |
|-------|--------|------|
| 0 | Sidney | `['dark']` |
| 1 | Phoebe | `['ghost']` |
| 2 | Glacia | `['ice']` |
| 3 | Drake | `['dragon']` |

### Gen 4 (Sinnoh)
| Index | Member | Type |
|-------|--------|------|
| 0 | Aaron | `['bug']` |
| 1 | Bertha | `['ground']` |
| 2 | Flint | `['fire']` |
| 3 | Lucian | `['psychic']` |

### Gen 5 (Unova)
| Index | Member | Type |
|-------|--------|------|
| 0 | Shauntal | `['ghost']` |
| 1 | Marshal | `['fighting']` |
| 2 | Grimsley | `['dark']` |
| 3 | Caitlin | `['psychic']` |

### Gen 6 (Kalos)
| Index | Member | Type |
|-------|--------|------|
| 0 | Malva | `['fire']` |
| 1 | Siebold | `['water']` |
| 2 | Wikstrom | `['steel']` |
| 3 | Drasna | `['dragon']` |

### Gen 7 (Alola — Elite Four)
| Index | Member | Type |
|-------|--------|------|
| 0 | Molayne | `['steel']` |
| 1 | Olivia | `['rock']` |
| 2 | Acerola | `['ghost']` |
| 3 | Kahili | `['flying']` |

### Gen 8 (Galar — Champion Cup semi-finals)
Multi-slots at indices 0 and 2 — uses same `randomIndex` + `fromEliteChange` pattern.

| Index | Member(s) | Type(s) |
|-------|-----------|---------|
| 0 | Marnie / Hop / Bede | `['dark', 'normal', 'fairy']` → chosen one |
| 1 | Nessa | `['water']` |
| 2 | Bea / Allister | `['fighting', 'ghost']` → chosen one |
| 3 | Raihan | `['dragon']` |

> **Note:** Hop's type is ambiguous (mixed team). For bonus purposes `['normal']` is a reasonable default since his Dubwool leads; `['fairy']` for Bede's Hatterene team.

### Gen 9 (Paldea — Elite Four)
| Index | Member | Type |
|-------|--------|------|
| 0 | Rika | `['ground']` |
| 1 | Poppy | `['steel']` |
| 2 | Larry (2nd encounter) | `['flying']` |
| 3 | Hassel | `['dragon']` |

---

## 5. TypeMatchupService Design

### 5.1 Service Interface

```ts
// src/app/services/type-matchup-service/type-matchup.service.ts
import { Injectable } from '@angular/core';
import typeMatchups from '../../../../type-matchups.json';  // at project root
import { PokemonType } from '../../interfaces/pokemon-type';

export type Effectiveness = 0 | 0.5 | 1 | 2;

@Injectable({ providedIn: 'root' })
export class TypeMatchupService {

  /**
   * Returns the effectiveness multiplier for a single attacker→defender pair.
   * chart[attacker][defender]
   */
  getEffectiveness(attacker: PokemonType, defender: PokemonType): Effectiveness {
    return (typeMatchups as Record<string, Record<string, number>>)[attacker][defender] as Effectiveness;
  }

  /**
   * Best multiplier a Pokémon's type(s) have against any of the leader's types.
   * Returns max effectiveness across all [pokemon type] × [leader type] pairs.
   */
  getBestEffectiveness(
    pokemonTypes: PokemonType[],
    leaderTypes: PokemonType[]
  ): Effectiveness {
    let best: Effectiveness = 0;
    for (const atk of pokemonTypes) {
      for (const def of leaderTypes) {
        const e = this.getEffectiveness(atk, def);
        if (e > best) best = e as Effectiveness;
      }
    }
    return best;
  }

  /**
   * Net type bonus slots to add to yesOdds in calcVictoryOdds().
   * Each Pokémon contributes:
   *   super effective (×2) → +2 bonus slots
   *   neutral (×1)         → +0 (no change)
   *   not very effective   → -1 (add to noOdds instead, or skip — designer choice)
   *   immune (×0)          → -2
   */
  calcTypeBonus(
    pokemonTypes: (PokemonType | undefined | null)[],
    pokemonSecondTypes: (PokemonType | undefined | null)[],
    leaderTypes: PokemonType[]
  ): { yesBonus: number; noBonus: number } {
    let yesBonus = 0;
    let noBonus = 0;
    for (let i = 0; i < pokemonTypes.length; i++) {
      const pTypes = [pokemonTypes[i], pokemonSecondTypes[i]]
        .filter((t): t is PokemonType => !!t);
      const best = this.getBestEffectiveness(pTypes, leaderTypes);
      if (best === 2) yesBonus += 2;
      else if (best === 0.5) noBonus += 1;
      else if (best === 0) noBonus += 2;
    }
    return { yesBonus, noBonus };
  }
}
```

### 5.2 Integration into `calcVictoryOdds()`

**In `gym-battle-roulette.component.ts`:**

```ts
// inject TypeMatchupService in constructor
constructor(
  // ...existing...
  private typeMatchupService: TypeMatchupService
) {}

private calcVictoryOdds(): void {
  const yesOdds: WheelItem[] = [];
  const noOdds: WheelItem[] = [];

  yesOdds.push({ text: "game.main.roulette.gym.yes", fillStyle: "green", weight: 1 });

  this.trainerTeam.forEach(pokemon => {
    for (let i = 0; i < pokemon.power; i++) {
      yesOdds.push({ text: "game.main.roulette.gym.yes", fillStyle: "green", weight: 1 });
    }
  });

  const powerModifier = this.plusModifiers();
  for (let i = 0; i < powerModifier; i++) {
    yesOdds.push({ text: "game.main.roulette.gym.yes", fillStyle: "green", weight: 1 });
  }

  // === TYPE MATCHUP BONUS ===
  if (this.currentLeader?.types?.length) {
    const leaderTypes = this.currentLeader.types;
    const type1s = this.trainerTeam.map(p => p.type1);
    const type2s = this.trainerTeam.map(p => p.type2);
    const { yesBonus, noBonus } = this.typeMatchupService.calcTypeBonus(type1s, type2s, leaderTypes);
    for (let i = 0; i < yesBonus; i++) {
      yesOdds.push({ text: "game.main.roulette.gym.yes", fillStyle: "darkgreen", weight: 1 });
    }
    for (let i = 0; i < noBonus; i++) {
      noOdds.push({ text: "game.main.roulette.gym.no", fillStyle: "darkred", weight: 1 });
    }
  }
  // ========================

  for (let index = 0; index < this.currentRound; index++) {
    noOdds.push({ text: "game.main.roulette.gym.no", fillStyle: "crimson", weight: 1 });
  }
  noOdds.push({ text: "game.main.roulette.gym.no", fillStyle: "crimson", weight: 1 });

  this.victoryOdds = interleaveOdds(yesOdds, noOdds);
}
```

**Important:** `calcVictoryOdds()` is called both on team changes AND when the game state becomes `'gym-battle'`. At team-change time, `this.currentLeader` may not be set yet (it's set in `getCurrentLeader()` which runs on the state change). Guard with `this.currentLeader?.types?.length` as shown above.

### 5.3 Multi-Leader Type Resolution

For multi-leader slots (Gen 5/7/8), the `types` array on the data entry carries all variants. After `randomIndex` is chosen in `getCurrentLeader()`:

```ts
this.currentLeader = {
  name: leaderNames[randomIndex],
  sprite: leaderSprites[randomIndex],
  quotes: [...],
  types: [leaderTypes[randomIndex]]  // ← resolve to single type
} as GymLeader;
```

Where `leaderTypes` comes from the entry's `types` array.

---

## 6. JSON Import in Angular 21 (TypeScript)

Angular 21 uses TypeScript 5.x which supports JSON imports natively in strict mode.

**tsconfig.app.json** — verify `resolveJsonModule: true` is present (Angular CLI sets this by default):
```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    ...
  }
}
```

**Import in service:**
```ts
import typeMatchups from '../../../../type-matchups.json';
// Resolves relative to: src/app/services/type-matchup-service/type-matchup.service.ts
// → project root is 4 directories up
```

**Alternative (more robust):** Place `type-matchups.json` in `src/assets/` and fetch it via `HttpClient` — avoids path fragility if the service moves. But the static import is simpler and tree-shakeable.

---

## 7. Pitfalls and Technical Notes

### 7.1 `currentLeader` Not Set When `calcVictoryOdds()` Fires on Team Change

`getTeamObservable()` fires immediately on subscribe (BehaviorSubject). At `ngOnInit()`, this fires **before** `gameStateService.currentState` emits `'gym-battle'`, so `currentLeader` is undefined. **Always guard with `this.currentLeader?.types?.length`** before reading types in `calcVictoryOdds()`.

### 7.2 Multi-Leader Type Arrays Must Match Sprite/Quote Array Lengths

For Gen 5 round 0 (Cilan/Chili/Cress), `sprite` is already a 3-element array. The `types` array must also be 3 elements in the same order: `['grass', 'fire', 'water']`. The `randomIndex` is used to index into all three arrays consistently.

### 7.3 Drayden vs Iris — Same Type, Different Leader

Gen 5 round 7 has `['dragon', 'dragon']` (both use Dragon). Functionally identical from a type perspective — both need `types: ['dragon']` after the split.

### 7.4 Gen 7 Has 8 Trial Captains, Not Traditional Gym Leaders

The component treats them identically to gym leaders. The type assignments above follow USUM ordering as implemented in the file: Ilima (Normal), Hala (Fighting), Lana/Kiawe/Mallow, Olivia (Rock), Sophocles/Acerola, Nanu (Dark), Mina (Fairy), Hapu (Ground).

### 7.5 Gen 8 Elite Four Uses a Looser Definition

The Gen 8 "Elite Four" in this game represents the Champion Cup semi-finals (Marnie, Nessa, Bea/Allister, Raihan), not an actual Elite Four. The `currentRound % 4` logic handles looping correctly.

### 7.6 Type Bonus Scaling — Balance Consideration

The proposed formula (`2` yes-slots for super effective, `1/2` no-slots for resisted/immune) adds meaningful but not overwhelming influence. With a team of 6 fully super-effective Pokémon at gym 1:
- yesOdds: 1 (base) + 6 (power=1 each) + 12 (type bonus) = 19
- noOdds: 1 (base) = 1
- Win chance: ~95%

With a team of 6 fully resisted Pokémon at gym 1:
- yesOdds: 7
- noOdds: 1 + 6 = 7
- Win chance: ~50%

Adjust the bonus multipliers (currently hardcoded in `calcTypeBonus`) if balance needs tuning. A designer-configurable constant in a settings object would make this easy to adjust.

### 7.7 Type Icon Reuse — Avoid Duplication

`getTypeIconUrl()` exists in `PokedexDetailModalComponent` but is not exported. Either:
1. Extract to a shared utility: `src/app/utils/type-icon-utils.ts`
2. Or create a `TypeIconPipe` injectable anywhere

The base URL (`https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/types/generation-viii/brilliant-diamond-shining-pearl`) should be a single exported constant.

### 7.8 JSON File Location

The feature description states `type-matchups.json` goes at the **project root**. The service import path from `src/app/services/type-matchup-service/type-matchup.service.ts` would be `../../../../type-matchups.json` (4 levels up). Consider placing it at `src/assets/type-matchups.json` instead for:
- Cleaner Angular asset management
- Ability to load via `HttpClient` if the file grows
- Standard Angular convention for data files

However, a static import (`import typeMatchups from ...`) is zero-latency (bundled at build time) vs an HTTP fetch.

### 7.9 No `TypeMatchupService` Exists Yet

Confirmed via directory listing: `src/app/services/` contains no type-matchup service. The directory to create is `src/app/services/type-matchup-service/`.

---

## 8. Summary of Required Changes

| File | Change |
|------|--------|
| `src/app/interfaces/gym-leader.ts` | Add `types: PokemonType[]` |
| `type-matchups.json` (project root or `src/assets/`) | Create — full 18×18 JSON (§2.1) |
| `src/app/services/type-matchup-service/type-matchup.service.ts` | Create — `TypeMatchupService` |
| `gym-leaders-by-generation.ts` | Add `types` to every entry |
| `elite-four-by-generation.ts` | Add `types` to every entry |
| `gym-battle-roulette.component.ts` | Inject service, add type bonus in `calcVictoryOdds()`, resolve types after multi-leader split |
| `elite-four-battle-roulette.component.ts` | Same as gym, with `currentElite` instead of `currentLeader` |
| `gym-battle-roulette.component.html` | Optionally show type icons + advantage summary in `gymLeaderPresentationModal` |
| `elite-four-battle-roulette.component.html` | Same for elite four modal |

---

## 9. Complete Data for `gym-leaders-by-generation.ts` and `elite-four-by-generation.ts`

Quick reference — all `types` values to add per entry:

### Gym Leaders
```
Gen 1: [rock], [water], [electric], [grass], [poison], [psychic], [fire], [ground]
Gen 2: [flying], [bug], [normal], [ghost], [fighting], [steel], [ice], [dragon]
Gen 3: [rock], [fighting], [electric], [fire], [normal], [flying], [psychic], [water]
Gen 4: [rock], [grass], [fighting], [water], [ghost], [steel], [ice], [electric]
Gen 5: [grass,fire,water], [normal], [bug], [electric], [ground], [flying], [ice], [dragon,dragon]
Gen 6: [bug], [rock], [fighting], [grass], [electric], [fairy], [psychic], [ice]
Gen 7: [normal], [fighting], [water,fire,grass], [rock], [electric,ghost], [dark], [fairy], [ground]
Gen 8: [grass], [water], [fire], [fighting,ghost], [fairy], [rock,ice], [dark], [dragon]
Gen 9: [bug], [grass], [electric], [water], [normal], [ghost], [psychic], [ice]
```

### Elite Four
```
Gen 1: [ice], [fighting], [ghost], [dragon]
Gen 2: [psychic], [poison], [fighting], [dark]
Gen 3: [dark], [ghost], [ice], [dragon]
Gen 4: [bug], [ground], [fire], [psychic]
Gen 5: [ghost], [fighting], [dark], [psychic]
Gen 6: [fire], [water], [steel], [dragon]
Gen 7: [steel], [rock], [ghost], [flying]
Gen 8: [dark/normal/fairy], [water], [fighting/ghost], [dragon]
Gen 9: [ground], [steel], [flying], [dragon]
```

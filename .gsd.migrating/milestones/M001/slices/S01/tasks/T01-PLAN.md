---
estimated_steps: 15
estimated_files: 2
skills_used: []
---

# T01: Add 89 mega stone ItemName literals and ItemItem records

Why: The item system requires every stone name to appear as a union member in ItemName and have a matching record in itemsData before any code can reference it. Without this, TypeScript will reject any stone literal and the build will fail.

Do:
1. Append 89 new string literals to the ItemName union in `src/app/services/items-service/item-names.ts`. Use kebab-case format `<pokemon-name>-ite` (e.g. `venusaur-ite`, `charizard-ite`, `blastoise-ite`). Derive names from `pokemon-forms-mega-primal.json` — one stone per base Pokémon ID (dual-form Pokémon like Charizard share a single stone). The complete list of 89 stone names: venusaur-ite, charizard-ite, blastoise-ite, beedrill-ite, pidgeot-ite, raichu-ite, clefable-ite, alakazam-ite, victreebel-ite, slowbro-ite, gengar-ite, kangaskhan-ite, starmie-ite, pinsir-ite, gyarados-ite, aerodactyl-ite, dragonite-ite, mewtwo-ite, meganium-ite, feraligatr-ite, ampharos-ite, steelix-ite, scizor-ite, heracross-ite, skarmory-ite, houndoom-ite, kingdra-ite, tyranitar-ite, sceptile-ite, blaziken-ite, swampert-ite, gardevoir-ite, mawile-ite, aggron-ite, medicham-ite, manectric-ite, sharpedo-ite, camerupt-ite, altaria-ite, banette-ite, absol-ite, glalie-ite, salamence-ite, metagross-ite, latiasite, latiosite, latias-ite, latios-ite, rayquaza-ite, lopunny-ite, garchomp-ite, lucario-ite, abomasnow-ite, gallade-ite, audino-ite, diancie-ite, swellow-ite, milotic-ite, ninjask-ite, dewgong-ite, jolteon-ite, flareon-ite, vaporeon-ite, espeon-ite, umbreon-ite, leafeon-ite, glaceon-ite, sylveon-ite, groudon-ite, kyogre-ite, sableye-ite, barbaracle-ite, dragalge-ite, clawitzer-ite, tyrantrum-ite, aurorus-ite, goodra-ite, arcanine-ite, ninetales-ite, dodrio-ite, tentacruel-ite, jynx-ite, electabuzz-ite, magmar-ite, tauros-ite, eevee-ite. Verify the final count matches 89 (one per key in the JSON).

2. Append a matching record for each stone to `itemsData` in `src/app/services/items-service/items-data.ts`. Each record follows this template:
```ts
'<stone-name>': {
  text: 'items.<stone-name>.name',
  name: '<stone-name>',
  sprite: 'unknown.png',
  fillStyle: 'gray',
  weight: 1,
  description: 'items.<stone-name>.description'
},
```

Done when: `item-names.ts` union contains exactly 89 new stone literals, `items-data.ts` has exactly 89 new stone records, and every record key matches a union member.

## Inputs

- `src/app/services/trainer-service/pokemon-forms-mega-primal.json`
- `src/app/services/items-service/item-names.ts`
- `src/app/services/items-service/items-data.ts`
- `src/app/interfaces/item-item.ts`

## Expected Output

- `src/app/services/items-service/item-names.ts`
- `src/app/services/items-service/items-data.ts`

## Verification

npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.app.json

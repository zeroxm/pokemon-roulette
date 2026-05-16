# S01: Mega Forms Data and Items

**Goal:** Create the data layer for Mega Evolution: a TypeScript module mapping base Pokémon IDs to their mega form PokemonItem arrays, one ItemName literal per mega stone (89 stones), and one ItemItem record per stone with unknown.png sprite fallback. This is pure data wiring — no runtime logic or UI.
**Demo:** After this: pokemon-mega-forms.ts compiles, all stone names are valid ItemName literals, itemsData has records for every stone with unknown.png sprite.

## Must-Haves

- `src/app/services/trainer-service/pokemon-mega-forms.ts` exports `Record<number, PokemonItem[]>` covering all 89 base IDs in `pokemon-forms-mega-primal.json`
- All 89 stone names are valid `ItemName` literals in `item-names.ts`
- All 89 stone `ItemItem` records are present in `items-data.ts` with `sprite: 'unknown.png'`
- `ng build` reports zero TypeScript errors

## Proof Level

- This slice proves: contract

## Integration Closure

Upstream: `pokemon-forms-mega-primal.json` (existing), `item-names.ts` and `items-data.ts` (extended). No new runtime wiring — S02 and S03 consume the exports from this slice.

## Verification

- none — pure data files, no runtime signals

## Tasks

- [x] **T01: Add 89 mega stone ItemName literals and ItemItem records** `est:45m`
  Why: The item system requires every stone name to appear as a union member in ItemName and have a matching record in itemsData before any code can reference it. Without this, TypeScript will reject any stone literal and the build will fail.
  - Files: `src/app/services/items-service/item-names.ts`, `src/app/services/items-service/items-data.ts`
  - Verify: npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.app.json

- [x] **T02: Create pokemon-mega-forms.ts mapping base ID to mega PokemonItem array** `est:45m`
  Why: S02 and S03 need a typed, importable constant that maps each base Pokémon ID to its possible mega form(s) as PokemonItem arrays — mirroring the palafin-forms.ts pattern. This module is the authoritative source for which Pokémon can mega-evolve and what stone they need.
  - Files: `src/app/services/trainer-service/pokemon-mega-forms.ts`
  - Verify: npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.app.json

- [x] **T03: Verify clean build with ng build** `est:10m`
  Why: TypeScript --noEmit only checks types; a full Angular build additionally validates template bindings, module resolution, and AOT compilation. This task is the final gate ensuring no downstream import or template issue was introduced by T01/T02.
  - Verify: npx ng build --project pokemon-roulette 2>&1 | grep -c "Error"

## Files Likely Touched

- src/app/services/items-service/item-names.ts
- src/app/services/items-service/items-data.ts
- src/app/services/trainer-service/pokemon-mega-forms.ts

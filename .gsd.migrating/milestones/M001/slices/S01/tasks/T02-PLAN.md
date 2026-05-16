---
estimated_steps: 8
estimated_files: 1
skills_used: []
---

# T02: Create pokemon-mega-forms.ts mapping base ID to mega PokemonItem array

Why: S02 and S03 need a typed, importable constant that maps each base Pokémon ID to its possible mega form(s) as PokemonItem arrays — mirroring the palafin-forms.ts pattern. This module is the authoritative source for which Pokémon can mega-evolve and what stone they need.

Do:
1. Create `src/app/services/trainer-service/pokemon-mega-forms.ts`.
2. Import `PokemonItem` from `../../interfaces/pokemon-item`.
3. Export a constant `pokemonMegaForms: Record<number, PokemonItem[]>` derived from `pokemon-forms-mega-primal.json`. Each entry maps the base Pokémon ID (number) to an array of PokemonItem objects matching the JSON structure. Each PokemonItem must have: `pokemonId` (from JSON), `text` (from JSON), `fillStyle` (from JSON), `weight: 1`, `sprite: null`, `shiny: false`, `power: 5`.
4. The file is hand-authored (not dynamically importing JSON at runtime) to keep it a pure TS module. Reproduce all 89 entries from the JSON verbatim, converting the string keys to number keys.
5. Also export a helper `megaStoneNameForBaseId(baseId: number): ItemName | undefined` that returns the kebab-case stone name for a given base ID (e.g. `3 → 'venusaur-ite'`). Import `ItemName` from `../items-service/item-names`. This helper will be used by S02's award logic.

Done when: the file compiles with no errors, exports `pokemonMegaForms` typed as `Record<number, PokemonItem[]>`, and `megaStoneNameForBaseId(3)` returns `'venusaur-ite'`.

## Inputs

- `src/app/services/trainer-service/pokemon-forms-mega-primal.json`
- `src/app/interfaces/pokemon-item.ts`
- `src/app/services/items-service/item-names.ts`
- `src/app/services/trainer-service/palafin-forms.ts`

## Expected Output

- `src/app/services/trainer-service/pokemon-mega-forms.ts`

## Verification

npx tsc --noEmit --project D:/workspace/pokemon-roulette/tsconfig.app.json

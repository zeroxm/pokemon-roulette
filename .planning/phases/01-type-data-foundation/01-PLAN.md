# Phase 1: Type Data Foundation — Plan

**Phase:** 01-type-data-foundation
**Goal:** The raw type effectiveness data is available at build time and the `GymLeader` interface is ready to hold per-leader type arrays — unblocking all downstream data entry and service work.
**Requirements:** DATA-01, DATA-02
**Status:** Ready

---

## Pre-flight findings (read before executing)

| Item | Finding | Action required |
|------|---------|----------------|
| `type-matchups.json` | Exists. `strongAgainst` values are correct. `weakAgainst` values are **wrong** (e.g. `normal.weakAgainst` = `[ghost, rock, steel]`; should be `[fighting]`). Also has three non-canonical entries: `shadow`, `stellar`, `unknown`. | Replace file with corrected data |
| `tsconfig.json` + `tsconfig.app.json` | Neither has `resolveJsonModule: true` | Add to `tsconfig.app.json` |
| `src/app/interfaces/type-matchup.ts` | Does not exist | Create with `TypeMatchupEntry` / `TypeMatchupMap` types |
| `src/app/interfaces/gym-leader.ts` | `GymLeader` interface has no `types` field | Add `types?: PokemonType[]` (optional) |

---

## Plans

### Plan 1 — Fix type-matchups.json and wire TypeScript type support (DATA-01)

**Goal:** `type-matchups.json` holds the canonical 18-type chart with correct `weakAgainst` data, and TypeScript can import it with full type inference via `resolveJsonModule`.

**Files modified:**
- `type-matchups.json` — replace `weakAgainst` arrays with canonical values; remove `shadow`, `stellar`, `unknown` entries; keep correct `strongAgainst` values unchanged
- `src/app/interfaces/type-matchup.ts` — new file; exports `TypeMatchupEntry`, `TypeMatchupMap`; declares JSON module so Angular's compiler resolves the import with types
- `tsconfig.app.json` — add `"resolveJsonModule": true` to `compilerOptions`

**Steps:**

1. **Rewrite `type-matchups.json`** with exactly 18 top-level keys (alphabetical order preserved).  
   Keep all existing `strongAgainst` arrays verbatim — they are already correct.  
   Replace every `weakAgainst` array with the canonical values below.  
   Remove the three non-canonical keys (`shadow`, `stellar`, `unknown`).

   Canonical `weakAgainst` (defensive ×2 — types that are super-effective against the key type):

   ```
   normal:   ["fighting"]
   fighting: ["fairy", "flying", "psychic"]
   flying:   ["electric", "ice", "rock"]
   poison:   ["ground", "psychic"]
   ground:   ["grass", "ice", "water"]
   rock:     ["fighting", "grass", "ground", "steel", "water"]
   bug:      ["fire", "flying", "rock"]
   ghost:    ["dark", "ghost"]
   steel:    ["fighting", "fire", "ground"]
   fire:     ["ground", "rock", "water"]
   water:    ["electric", "grass"]
   grass:    ["bug", "fire", "flying", "ice", "poison"]
   electric: ["ground"]
   psychic:  ["bug", "dark", "ghost"]
   ice:      ["fighting", "fire", "rock", "steel"]
   dragon:   ["dragon", "fairy", "ice"]
   dark:     ["bug", "fairy", "fighting"]
   fairy:    ["poison", "steel"]
   ```

   All arrays must be sorted alphabetically (matching the convention already used in the file).

2. **Create `src/app/interfaces/type-matchup.ts`** with the following exact content:

   ```typescript
   import { PokemonType } from './pokemon-type';

   export interface TypeMatchupEntry {
     strongAgainst: PokemonType[];
     weakAgainst: PokemonType[];
   }

   export type TypeMatchupMap = Record<PokemonType, TypeMatchupEntry>;
   ```

   This is the contract that `TypeMatchupService` (Phase 4) will import. No JSON module declaration needed — `resolveJsonModule` in step 3 handles it; Angular's bundler resolves the import automatically.

3. **Add `resolveJsonModule: true` to `tsconfig.app.json`** inside `compilerOptions`:

   ```json
   {
     "extends": "./tsconfig.json",
     "compilerOptions": {
       "outDir": "./out-tsc/app",
       "resolveJsonModule": true,
       "types": ["@angular/localize"]
     },
     ...
   }
   ```

   Do not touch the base `tsconfig.json` — the setting only needs to be in the app compilation unit.

**Verification:**
- [ ] `type-matchups.json` has exactly 18 top-level keys — no `shadow`, `stellar`, `unknown`
- [ ] `normal.weakAgainst` === `["fighting"]`
- [ ] `fighting.weakAgainst` === `["fairy", "flying", "psychic"]`
- [ ] `electric.weakAgainst` === `["ground"]`
- [ ] `dragon.weakAgainst` === `["dragon", "fairy", "ice"]`
- [ ] `src/app/interfaces/type-matchup.ts` exports `TypeMatchupEntry` and `TypeMatchupMap`
- [ ] `tsconfig.app.json` contains `"resolveJsonModule": true`
- [ ] `npm run build` completes with zero TypeScript errors

**Threat model:** None — no user input, no network calls, pure data file + TypeScript interface definitions.

---

### Plan 2 — Extend `GymLeader` interface with optional `types` field (DATA-02)

**Goal:** `GymLeader` gains `types?: PokemonType[]` so gym leader data files can carry type arrays without breaking existing entries that omit the field.

**Files modified:**
- `src/app/interfaces/gym-leader.ts` — add `types?: PokemonType[]`; add import for `PokemonType`

**Steps:**

1. **Add the import** for `PokemonType` at the top of `gym-leader.ts`:

   ```typescript
   import { PokemonType } from './pokemon-type';
   ```

2. **Add the optional field** to the `GymLeader` interface:

   ```typescript
   export interface GymLeader {
     name: string;
     sprite: string | string[];
     quotes: string[];
     types?: PokemonType[];
   }
   ```

   The field is `optional` (`?`) — all existing gym leader objects that omit `types` continue to compile without errors. No data files need updating in this phase.

   The field is an **array** (not `PokemonType`) because multi-leader slots (Gen 5 Cilan/Chili/Cress, Gen 7 Lana/Kiawe/Mallow, Gen 8 Bea/Allister) store one type per possible leader at a given round index. After random leader selection the component resolves to the single element at that index.

**Verification:**
- [ ] `src/app/interfaces/gym-leader.ts` imports `PokemonType`
- [ ] `GymLeader` has `types?: PokemonType[]`
- [ ] `npm run build` completes with zero TypeScript errors
- [ ] A gym leader object literal without `types` (existing data) does not produce a TypeScript error

**Threat model:** None — no user input, no network calls, pure interface extension.

---

## UAT

Run these checks after both plans are complete:

- [ ] `npm run build` passes with zero TypeScript errors or warnings
- [ ] `type-matchups.json` has exactly 18 top-level keys (count with `jq 'keys | length' type-matchups.json` — expected: `18`)
- [ ] A developer can write the following in any `.ts` file and get full type inference (no `any`):
  ```typescript
  import typeMatchups from '../../type-matchups.json';
  const fireStrong = typeMatchups.fire.strongAgainst; // inferred as string[]
  ```
- [ ] `GymLeader` interface compiles correctly when `types` is absent from a literal:
  ```typescript
  const leader: GymLeader = { name: 'Brock', sprite: 'brock.png', quotes: ['...'] }; // no error
  ```
- [ ] `GymLeader` interface accepts `types` when present:
  ```typescript
  const leader: GymLeader = { name: 'Brock', sprite: 'brock.png', quotes: ['...'], types: ['rock'] }; // no error
  ```

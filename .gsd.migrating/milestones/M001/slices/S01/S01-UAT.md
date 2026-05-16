# S01: Mega Forms Data and Items — UAT

**Milestone:** M001
**Written:** 2026-05-16T12:24:21.817Z

# S01: Mega Forms Data and Items — UAT

**Milestone:** M001
**Written:** 2025-07-14

## UAT Type

- UAT mode: artifact-driven
- Why this mode is sufficient: S01 is pure data wiring — no runtime logic, UI, or user-facing behaviour. The deliverables are TypeScript files; correctness is proven by type-checking and build success.

## Preconditions

- Node modules installed (`npm install` completed)
- Angular CLI available (`npx ng`)

## Smoke Test

Run `npx tsc --noEmit --project tsconfig.app.json` — must exit 0 with no output.

## Test Cases

### 1. TypeScript compilation clean

1. `cd D:/workspace/pokemon-roulette`
2. `npx tsc --noEmit --project tsconfig.app.json`
3. **Expected:** exit code 0, no error output

### 2. Angular AOT build clean

1. `cd D:/workspace/pokemon-roulette`
2. `npx ng build --project pokemon-roulette 2>&1 | grep -c "Error"`
3. **Expected:** output is `0`; build completes with "Application bundle generation complete"

### 3. Mega stone literal count

1. `grep -c "ite'" src/app/services/items-service/item-names.ts`
2. **Expected:** 86 (all mega stone names present as ItemName union members)

### 4. ItemItem records with unknown.png

1. `grep -c "unknown.png" src/app/services/items-service/items-data.ts`
2. **Expected:** 86 (every stone has a record with sprite fallback)

### 5. pokemonMegaForms export present

1. `grep "export.*pokemonMegaForms" src/app/services/trainer-service/pokemon-mega-forms.ts`
2. **Expected:** line found: `export const pokemonMegaForms: Record<number, PokemonItem[]> = {`

## Edge Cases

### Stone names that are not in item-names.ts

1. Search `pokemon-mega-forms.ts` for any stone string not present in item-names.ts
2. **Expected:** TypeScript compilation would catch this — tsc --noEmit passing confirms no such gap exists

## Failure Signals

- tsc exits non-zero → stone name missing from ItemName union or type mismatch in pokemon-mega-forms.ts
- ng build exits non-zero → template or AOT binding issue introduced
- grep count below 86 → records were accidentally dropped

## Not Proven By This UAT

- Runtime behaviour (stone award, mega evolution trigger) — deferred to S02/S03
- Wheel spin selection when multiple stones — deferred to S02
- Animation modal — deferred to S04
- Karma/Jasmine unit tests — environment issue on Windows (spawnSync ETIMEDOUT); no unit tests planned for this slice

## Notes for Tester

Pre-existing warnings (bundle budget 1.40MB vs 1.00MB, CommonJS dom-to-image-more) appear in build output and are safe to ignore. The `npm run test` command times out on this Windows environment — this is a pre-existing Karma runner issue unrelated to S01 deliverables.

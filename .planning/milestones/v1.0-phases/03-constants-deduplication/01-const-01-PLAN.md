---
plan_id: "01-const-01"
phase: 3
requirement: CONST-01
title: "Extract NINCADA_ID constant and move Nincada evolution logic to EvolutionService"
depends_on: []
---

# Plan: Extract NINCADA_ID constant + EvolutionService encapsulation (CONST-01)

## Goal
`NINCADA_ID = 290` must be extracted out of `RouletteContainerComponent` into a shared constants file. Knowledge of Nincada's special dual-evolution behaviour (gaining Shedinja) must live in `EvolutionService`, not in the component.

## Current state

- `src/app/main-game/roulette-container/roulette-container.component.ts:96` — `NINCADA_ID = 290;` (class field)
- `src/app/main-game/roulette-container/roulette-container.component.ts:747` — `pokemon.pokemonId === this.NINCADA_ID`
- `src/app/services/evolution-service/evolution.service.ts` — no Nincada-specific knowledge

## Target state

- New file `src/app/constants/pokemon-ids.constants.ts` exports `NINCADA_ID = 290`
- `EvolutionService` imports `NINCADA_ID` and exposes `isNincadaSpecialEvolution(pokemon: PokemonItem): boolean`
- `RouletteContainerComponent` removes `NINCADA_ID = 290` field; `evolveSecondPokemon()` calls `this.evolutionService.isNincadaSpecialEvolution(pokemon)` instead of the inline comparison

## Tasks

### Task 1: Create constants file

Create new file `src/app/constants/pokemon-ids.constants.ts`:

```typescript
export const NINCADA_ID = 290;
```

### Task 2: Add `isNincadaSpecialEvolution()` to EvolutionService

File: `src/app/services/evolution-service/evolution.service.ts`

Add import at top:
```typescript
import { NINCADA_ID } from '../../constants/pokemon-ids.constants';
```

Add method to the class (after `getEvolutions()`):
```typescript
isNincadaSpecialEvolution(pokemon: PokemonItem): boolean {
  return pokemon.pokemonId === NINCADA_ID;
}
```

### Task 3: Remove NINCADA_ID field from RouletteContainerComponent

File: `src/app/main-game/roulette-container/roulette-container.component.ts`

Remove line 96:
```typescript
    NINCADA_ID = 290;
```

### Task 4: Replace inline comparison in evolveSecondPokemon()

File: `src/app/main-game/roulette-container/roulette-container.component.ts`

Change:
```typescript
    } else if (pokemon.pokemonId === this.NINCADA_ID) {
```
To:
```typescript
    } else if (this.evolutionService.isNincadaSpecialEvolution(pokemon)) {
```

(Note: `evolutionService` is already injected as a constructor dependency in this component.)

## Verification

1. **No NINCADA_ID field in component:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\app\main-game\roulette-container\roulette-container.component.ts" -Pattern "NINCADA_ID\s*=\s*290"
   ```
   Expected: 0 hits

2. **Constants file exists with correct export:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\app\constants\pokemon-ids.constants.ts" -Pattern "NINCADA_ID"
   ```
   Expected: 1 hit

3. **EvolutionService has new method:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\app\services\evolution-service\evolution.service.ts" -Pattern "isNincadaSpecialEvolution"
   ```
   Expected: 2 hits (method signature + return statement)

4. **Build:**
   ```powershell
   cd D:\workspace\pokemon-roulette; ng build
   ```
   Expected: exit code 0

5. **Tests:**
   ```powershell
   cd D:\workspace\pokemon-roulette; ng test --watch=false --browsers=ChromeHeadless
   ```
   Expected: 175 specs, 0 failures

## Commit

```
git commit -m "refactor: extract NINCADA_ID constant and encapsulate Nincada evolution in EvolutionService (CONST-01)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

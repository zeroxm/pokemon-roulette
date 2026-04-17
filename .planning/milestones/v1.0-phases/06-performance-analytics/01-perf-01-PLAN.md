---
plan_id: "01-perf-01"
phase: 6
requirement: PERF-01
title: "Build persistent Map reverse index in PokemonFormsService"
depends_on: []
---

# Plan: Map reverse index in PokemonFormsService (PERF-01)

## Goal
Replace the O(n) linear scan in `getBasePokemonId()` with an O(1) `Map` lookup built once at construction time.

## Current state

`src/app/services/pokemon-forms-service/pokemon-forms.service.ts`

`getBasePokemonId()` (lines 53–65) currently:
1. Checks `this.pokemonForms[pokemonId]` — if it exists, pokemonId is itself a base → return pokemonId
2. Otherwise iterates all `Object.entries(this.pokemonForms)` looking for a form entry matching pokemonId → O(n)

## Target state

Build a `Map<number, number>` at construction time mapping every pokemonId (base or variant) to its base pokemonId. `getBasePokemonId()` becomes a single `Map.get()` call.

## Tasks

### Task 1: Add variantToBase Map field and build it in constructor

File: `src/app/services/pokemon-forms-service/pokemon-forms.service.ts`

Replace the constructor:
```typescript
  constructor() {
  }
```

With:
```typescript
  private readonly variantToBase: Map<number, number>;

  constructor() {
    this.variantToBase = new Map<number, number>();
    for (const [baseIdStr, forms] of Object.entries(this.pokemonForms)) {
      const baseId = Number(baseIdStr);
      this.variantToBase.set(baseId, baseId);
      for (const form of forms) {
        this.variantToBase.set(form.pokemonId, baseId);
      }
    }
  }
```

**Important:** The `variantToBase` field declaration must come BEFORE `private pokemonForms = pokemonForms;` in the class body, or be placed after it — but since `pokemonForms` is used inside the constructor and is initialized as a class field before the constructor body runs, either order works. Place `variantToBase` declaration inside the constructor assignment block as shown above (the field is declared after the `pokemonForms` property).

Actually, declare `variantToBase` as a class field (not inside constructor). The safest pattern: declare it after `pokemonForms`:

```typescript
  private pokemonForms = pokemonForms;
  private readonly variantToBase: Map<number, number>;
```

Then initialize it in the constructor body as shown.

### Task 2: Replace getBasePokemonId() body

File: `src/app/services/pokemon-forms-service/pokemon-forms.service.ts`

Replace the entire `getBasePokemonId` method body:

**Old:**
```typescript
  getBasePokemonId(pokemonId: number): number | null {
    if (this.pokemonForms[pokemonId]) {
      return pokemonId;
    }

    for (const [basePokemonId, forms] of Object.entries(this.pokemonForms)) {
      if (forms.some(form => form.pokemonId === pokemonId)) {
        return Number(basePokemonId);
      }
    }

    return null;
  }
```

**New:**
```typescript
  getBasePokemonId(pokemonId: number): number | null {
    return this.variantToBase.get(pokemonId) ?? null;
  }
```

## Verification

1. **No O(n) loop in getBasePokemonId:**
   ```powershell
   (Select-String -Path "D:\workspace\pokemon-roulette\src\app\services\pokemon-forms-service\pokemon-forms.service.ts" -Pattern "Object.entries.*pokemonForms" | Measure-Object).Count
   ```
   Expected: 1 (only in the constructor, not in getBasePokemonId)

2. **Map.get() used in getBasePokemonId:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\app\services\pokemon-forms-service\pokemon-forms.service.ts" -Pattern "variantToBase.get"
   ```
   Expected: 1 hit

3. **Build:**
   ```powershell
   cd D:\workspace\pokemon-roulette; ng build
   ```
   Expected: exit code 0

4. **Tests:**
   ```powershell
   cd D:\workspace\pokemon-roulette; ng test --watch=false --browsers=ChromeHeadless
   ```
   Expected: 175 specs, 0 failures

## Commit

```
git commit -m "perf: build Map reverse index in PokemonFormsService for O(1) base-id lookup (PERF-01)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

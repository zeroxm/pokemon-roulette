---
plan_id: "02-const-02"
phase: 3
requirement: CONST-02
title: "Centralize default Potion constant in TrainerService"
depends_on: ["01-const-01"]
---

# Plan: Centralize default Potion constant (CONST-02)

## Goal
The default starting Potion object is duplicated verbatim in `trainerItems` field initializer (lines 51–60) and `resetItems()` (lines 254–265) in `TrainerService`. Extract it to a single `private readonly` constant so both usages reference the same definition.

## Current state

`src/app/services/trainer-service/trainer.service.ts` lines 51–60:
```typescript
  trainerItems: ItemItem[] = [
    {
      text: 'items.potion.name',
      name: 'potion',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
      fillStyle: 'purple',
      weight: 1,
      description: 'items.potion.description'
    }
  ];
```

`src/app/services/trainer-service/trainer.service.ts` lines 254–265:
```typescript
  resetItems() {
    this.trainerItems = [
      {
        text: 'items.potion.name',
        name: 'potion',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
        fillStyle: 'purple',
        weight: 1,
        description: 'items.potion.description'
      }
    ];
    this.trainerItemsObservable.next(this.trainerItems);
  }
```

## Target state

Add a `private static readonly DEFAULT_POTION` constant to `TrainerService`, and reference it from both `trainerItems` and `resetItems()`.

## Tasks

### Task 1: Add DEFAULT_POTION constant to TrainerService

File: `src/app/services/trainer-service/trainer.service.ts`

After the class opening line (`export class TrainerService implements OnDestroy {`), add the constant before the existing `private readonly gameStateSubscription` line:

```typescript
  private static readonly DEFAULT_POTION: ItemItem = {
    text: 'items.potion.name',
    name: 'potion',
    sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
    fillStyle: 'purple',
    weight: 1,
    description: 'items.potion.description'
  };
```

### Task 2: Update trainerItems field initializer

Replace the existing `trainerItems` field initializer (lines 51–60):

**Old:**
```typescript
  trainerItems: ItemItem[] = [
    {
      text: 'items.potion.name',
      name: 'potion',
      sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
      fillStyle: 'purple',
      weight: 1,
      description: 'items.potion.description'
    }
  ];
```

**New:**
```typescript
  trainerItems: ItemItem[] = [structuredClone(TrainerService.DEFAULT_POTION)];
```

### Task 3: Update resetItems() method

Replace the inline object literal in `resetItems()`:

**Old:**
```typescript
  resetItems() {
    this.trainerItems = [
      {
        text: 'items.potion.name',
        name: 'potion',
        sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png',
        fillStyle: 'purple',
        weight: 1,
        description: 'items.potion.description'
      }
    ];
    this.trainerItemsObservable.next(this.trainerItems);
  }
```

**New:**
```typescript
  resetItems() {
    this.trainerItems = [structuredClone(TrainerService.DEFAULT_POTION)];
    this.trainerItemsObservable.next(this.trainerItems);
  }
```

## Verification

1. **Potion literal appears only once (in the constant definition):**
   ```powershell
   (Select-String -Path "D:\workspace\pokemon-roulette\src\app\services\trainer-service\trainer.service.ts" -Pattern "items\.potion\.name" | Measure-Object).Count
   ```
   Expected: `1`

2. **DEFAULT_POTION constant present:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\app\services\trainer-service\trainer.service.ts" -Pattern "DEFAULT_POTION"
   ```
   Expected: 3 hits (definition + 2 usages)

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
git commit -m "refactor: centralize default Potion as a constant in TrainerService (CONST-02)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

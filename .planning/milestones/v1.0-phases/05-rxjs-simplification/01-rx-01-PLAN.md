---
plan_id: "01-rx-01"
phase: 5
requirement: RX-01
title: "Replace new Observable wrapping with of() in ItemSpriteService"
depends_on: []
---

# Plan: RxJS of() simplification in ItemSpriteService (RX-01)

## Goal
Replace the manual `new Observable(observer => { observer.next(data); observer.complete(); })` pattern with `of(data)` in `ItemSpriteService`.

## Current state

`src/app/services/item-sprite-service/item-sprite.service.ts`:
- Line 3: `import { Observable } from 'rxjs';`
- Lines 24–27:
```typescript
  getItemSprite(itemName: ItemName): Observable<{ sprite: string }> {
    return new Observable(observer => {
      observer.next(this.itemSpriteData[itemName]);
      observer.complete();
    });
  }
```

## Tasks

### Task 1: Update import to include `of`

File: `src/app/services/item-sprite-service/item-sprite.service.ts`

Change:
```typescript
import { Observable } from 'rxjs';
```
To:
```typescript
import { Observable, of } from 'rxjs';
```

### Task 2: Replace new Observable with of()

File: `src/app/services/item-sprite-service/item-sprite.service.ts`

Change:
```typescript
    return new Observable(observer => {
      observer.next(this.itemSpriteData[itemName]);
      observer.complete();
    });
```
To:
```typescript
    return of(this.itemSpriteData[itemName]);
```

## Verification

1. **No new Observable in the service:**
   ```powershell
   (Select-String -Path "D:\workspace\pokemon-roulette\src\app\services\item-sprite-service\item-sprite.service.ts" -Pattern "new Observable" | Measure-Object).Count
   ```
   Expected: 0

2. **of() imported and used:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\app\services\item-sprite-service\item-sprite.service.ts" -Pattern "of\("
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
git commit -m "refactor: replace new Observable with of() in ItemSpriteService (RX-01)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

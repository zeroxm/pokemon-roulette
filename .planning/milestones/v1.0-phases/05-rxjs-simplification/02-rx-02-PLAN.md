---
plan_id: "02-rx-02"
phase: 5
requirement: RX-02
title: "Replace new Observable wrapping with of() in BadgesService"
depends_on: []
---

# Plan: RxJS of() simplification in BadgesService (RX-02)

## Goal
Replace the manual `new Observable(observer => { observer.next(data); observer.complete(); })` pattern with `of(data)` in `BadgesService`.

## Current state

`src/app/services/badges-service/badges.service.ts`:
- Line 3: `import { Observable } from 'rxjs';`
- Lines 24–27:
```typescript
    return new Observable(observer => {
      observer.next(badge);
      observer.complete();
    });
```

## Tasks

### Task 1: Update import to include `of`

File: `src/app/services/badges-service/badges.service.ts`

Change:
```typescript
import { Observable } from 'rxjs';
```
To:
```typescript
import { Observable, of } from 'rxjs';
```

### Task 2: Replace new Observable with of()

File: `src/app/services/badges-service/badges.service.ts`

Change:
```typescript
    return new Observable(observer => {
      observer.next(badge);
      observer.complete();
    });
```
To:
```typescript
    return of(badge);
```

## Verification

1. **No new Observable in the service:**
   ```powershell
   (Select-String -Path "D:\workspace\pokemon-roulette\src\app\services\badges-service\badges.service.ts" -Pattern "new Observable" | Measure-Object).Count
   ```
   Expected: 0

2. **of() imported and used:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\app\services\badges-service\badges.service.ts" -Pattern "of\("
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
git commit -m "refactor: replace new Observable with of() in BadgesService (RX-02)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

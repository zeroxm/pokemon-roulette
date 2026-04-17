---
plan_id: "01-name-01"
phase: 2
requirement: NAME-01
title: "Rename restart-game-buttom to restart-game-button everywhere"
depends_on: []
---

# Plan: Rename restart-game-buttom → restart-game-button (NAME-01)

## Goal
Eradicate the "buttom" typo from the entire codebase. The component must work identically under its corrected name. CI must stay green.

## Scope

**Files to rename (via git mv):**
- `src/app/restart-game-buttom/restart-game-buttom.component.ts` → `src/app/restart-game-button/restart-game-button.component.ts`
- `src/app/restart-game-buttom/restart-game-buttom.component.spec.ts` → `src/app/restart-game-button/restart-game-button.component.spec.ts`
- `src/app/restart-game-buttom/restart-game-buttom.component.html` → `src/app/restart-game-button/restart-game-button.component.html`
- `src/app/restart-game-buttom/restart-game-buttom.component.css` → `src/app/restart-game-button/restart-game-button.component.css`

**Directory rename:** `src/app/restart-game-buttom/` → `src/app/restart-game-button/`

**Content edits (after rename):**

| File | Old | New |
|------|-----|-----|
| `restart-game-button.component.ts` | `selector: 'app-restart-game-buttom'` | `selector: 'app-restart-game-button'` |
| `restart-game-button.component.ts` | `templateUrl: './restart-game-buttom.component.html'` | `templateUrl: './restart-game-button.component.html'` |
| `restart-game-button.component.ts` | `styleUrl: './restart-game-buttom.component.css'` | `styleUrl: './restart-game-button.component.css'` |
| `restart-game-button.component.spec.ts` | `from './restart-game-buttom.component'` | `from './restart-game-button.component'` |
| `main-game.component.ts` | `from "../restart-game-buttom/restart-game-buttom.component"` | `from "../restart-game-button/restart-game-button.component"` |
| `main-game.component.html` | `<app-restart-game-buttom (restartEvent)="resetGameAction()"></app-restart-game-buttom>` | `<app-restart-game-button (restartEvent)="resetGameAction()"></app-restart-game-button>` |
| `game-over.component.ts` | `from "../../restart-game-buttom/restart-game-buttom.component"` | `from "../../restart-game-button/restart-game-button.component"` |
| `game-over.component.html` line 1 | `<app-restart-game-buttom` | `<app-restart-game-button` |
| `game-over.component.html` line 3 | `</app-restart-game-buttom>` | `</app-restart-game-button>` |

## Tasks

### Task 1: Rename directory and files using git mv
Use `git mv` so the rename is tracked in git history:

```powershell
cd D:\workspace\pokemon-roulette
git mv src/app/restart-game-buttom src/app/restart-game-button
git mv src/app/restart-game-button/restart-game-buttom.component.ts src/app/restart-game-button/restart-game-button.component.ts
git mv src/app/restart-game-button/restart-game-buttom.component.spec.ts src/app/restart-game-button/restart-game-button.component.spec.ts
git mv src/app/restart-game-button/restart-game-buttom.component.html src/app/restart-game-button/restart-game-button.component.html
git mv src/app/restart-game-button/restart-game-buttom.component.css src/app/restart-game-button/restart-game-button.component.css
```

### Task 2: Fix content inside renamed component files

Edit `src/app/restart-game-button/restart-game-button.component.ts`:
- Line 9: `selector: 'app-restart-game-buttom',` → `selector: 'app-restart-game-button',`
- Line 17: `templateUrl: './restart-game-buttom.component.html',` → `templateUrl: './restart-game-button.component.html',`
- Line 18: `styleUrl: './restart-game-buttom.component.css'` → `styleUrl: './restart-game-button.component.css'`

Edit `src/app/restart-game-button/restart-game-button.component.spec.ts`:
- Line 3: `from './restart-game-buttom.component'` → `from './restart-game-button.component'`

### Task 3: Fix import in main-game.component.ts

File: `src/app/main-game/main-game.component.ts`

Change:
```
import { RestartGameButtonComponent } from "../restart-game-buttom/restart-game-buttom.component";
```
To:
```
import { RestartGameButtonComponent } from "../restart-game-button/restart-game-button.component";
```

### Task 4: Fix selector usage in main-game.component.html

File: `src/app/main-game/main-game.component.html`

Change:
```html
<app-restart-game-buttom (restartEvent)="resetGameAction()"></app-restart-game-buttom>
```
To:
```html
<app-restart-game-button (restartEvent)="resetGameAction()"></app-restart-game-button>
```

### Task 5: Fix import in game-over.component.ts

File: `src/app/main-game/game-over/game-over.component.ts`

Change:
```
import { RestartGameButtonComponent } from "../../restart-game-buttom/restart-game-buttom.component";
```
To:
```
import { RestartGameButtonComponent } from "../../restart-game-button/restart-game-button.component";
```

### Task 6: Fix selector usage in game-over.component.html

File: `src/app/main-game/game-over/game-over.component.html`

Change both occurrences:
- `<app-restart-game-buttom` → `<app-restart-game-button`
- `</app-restart-game-buttom>` → `</app-restart-game-button>`

## Verification

After all edits, run in order:

1. **Zero "buttom" hits in src/:**
   ```powershell
   (Select-String -Recurse -Path "D:\workspace\pokemon-roulette\src" -Pattern "buttom" | Measure-Object).Count
   ```
   Expected: `0`

2. **New directory exists, old does not:**
   ```powershell
   Test-Path "D:\workspace\pokemon-roulette\src\app\restart-game-button"   # → True
   Test-Path "D:\workspace\pokemon-roulette\src\app\restart-game-buttom"   # → False
   ```

3. **Correct selector in component:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\app\restart-game-button\restart-game-button.component.ts" -Pattern "app-restart-game-button"
   ```
   Expected: 1 hit on `selector` line

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

After all verification steps pass:
```
git commit -m "refactor: rename restart-game-buttom to restart-game-button (NAME-01)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

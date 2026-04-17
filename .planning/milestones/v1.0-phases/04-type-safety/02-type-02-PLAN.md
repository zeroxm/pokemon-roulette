---
plan_id: "02-type-02"
phase: 4
requirement: TYPE-02
title: "Expand dom-to-image-more .d.ts and remove @ts-ignore"
depends_on: []
---

# Plan: Expand dom-to-image-more types + remove @ts-ignore (TYPE-02)

## Goal
Replace the bare `declare module 'dom-to-image-more';` stub with a typed declaration that includes the methods actually used (`toBlob`) plus the full standard API (`toPng`, `toJpeg`, `toSvg`). Make the types file reachable by the compiler. Then remove the `// @ts-ignore` suppressions from `end-game.component.ts` and `game-over.component.ts`.

## Current state

`types/dom-to-image-more.d.ts`:
```typescript
declare module 'dom-to-image-more';
```

`tsconfig.app.json` include:
```json
"include": ["src/**/*.d.ts"]
```
(types/ directory is NOT included — so the stub is unreachable)

`tsconfig.spec.json` include:
```json
"include": ["src/**/*.spec.ts", "src/**/*.d.ts"]
```
(same issue)

`src/app/main-game/end-game/end-game.component.ts`:
```typescript
// @ts-ignore
import domtoimage from 'dom-to-image-more'
```

`src/app/main-game/game-over/game-over.component.ts`:
```typescript
// @ts-ignore
import domtoimage from 'dom-to-image-more'
```

Both components call only `domtoimage.toBlob(element, options)`.

## Target state

- `types/dom-to-image-more.d.ts` has typed declarations using the `interface + const + export default` ambient pattern (valid TypeScript ambient context syntax)
- `tsconfig.app.json` and `tsconfig.spec.json` include `"types/**/*.d.ts"` so the file is reachable
- Both `// @ts-ignore` lines removed

## Tasks

### Task 1: Add types/**/*.d.ts to tsconfig.app.json

File: `tsconfig.app.json`

Change:
```json
  "include": [
    "src/**/*.d.ts"
  ]
```
To:
```json
  "include": [
    "src/**/*.d.ts",
    "types/**/*.d.ts"
  ]
```

### Task 2: Add types/**/*.d.ts to tsconfig.spec.json

File: `tsconfig.spec.json`

Change:
```json
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts"
  ]
```
To:
```json
  "include": [
    "src/**/*.spec.ts",
    "src/**/*.d.ts",
    "types/**/*.d.ts"
  ]
```

### Task 3: Expand types/dom-to-image-more.d.ts

Replace the entire file content with:
```typescript
declare module 'dom-to-image-more' {
  interface Options {
    filter?: (node: Node) => boolean;
    bgcolor?: string;
    width?: number;
    height?: number;
    style?: Partial<CSSStyleDeclaration>;
    quality?: number;
    imagePlaceholder?: string;
    cacheBust?: boolean;
    scale?: number;
  }

  interface DomToImageMore {
    toPng(node: Node, options?: Options): Promise<string>;
    toJpeg(node: Node, options?: Options): Promise<string>;
    toSvg(node: Node, options?: Options): Promise<string>;
    toBlob(node: Node, options?: Options): Promise<Blob | null>;
  }

  const domtoimage: DomToImageMore;
  export default domtoimage;
}
```

### Task 4: Remove @ts-ignore from end-game.component.ts

File: `src/app/main-game/end-game/end-game.component.ts`

Remove the `// @ts-ignore` line immediately before the import:
```typescript
// @ts-ignore
import domtoimage from 'dom-to-image-more'
```
→
```typescript
import domtoimage from 'dom-to-image-more'
```

### Task 5: Remove @ts-ignore from game-over.component.ts

File: `src/app/main-game/game-over/game-over.component.ts`

Remove the `// @ts-ignore` line immediately before the import:
```typescript
// @ts-ignore
import domtoimage from 'dom-to-image-more'
```
→
```typescript
import domtoimage from 'dom-to-image-more'
```

## Verification

1. **tsconfig.app.json includes types/:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\tsconfig.app.json" -Pattern "types/\*\*/\*.d.ts"
   ```
   Expected: 1 hit

2. **No @ts-ignore in end-game or game-over:**
   ```powershell
   (Select-String -Path "D:\workspace\pokemon-roulette\src\app\main-game\end-game\end-game.component.ts","D:\workspace\pokemon-roulette\src\app\main-game\game-over\game-over.component.ts" -Pattern "@ts-ignore" | Measure-Object).Count
   ```
   Expected: 0

3. **Typed declarations present in .d.ts:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\types\dom-to-image-more.d.ts" -Pattern "toBlob"
   ```
   Expected: at least 1 hit

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
git commit -m "refactor: expand dom-to-image-more type declarations and remove @ts-ignore (TYPE-02)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

---
phase: 07-detail-modal
plan: 02
status: complete
requirements: [DETAIL-01]
commit: f4ce37c
---

## What was done

Wired click-to-detail-modal flow from `PokedexEntryComponent` → `PokedexComponent` → `PokedexDetailModalComponent`.

### Changes

**`src/app/pokedex/pokedex-entry/pokedex-entry.component.ts`**
- Added `PokedexEntryClickEvent` interface (exported)
- Added `@Output() entryClicked = new EventEmitter<PokedexEntryClickEvent>()`
- Added `onCellClick()` method — returns early if `!isSeen`, otherwise emits event

**`src/app/pokedex/pokedex-entry/pokedex-entry.component.html`**
- Added `[class.clickable]="isSeen"` and `(click)="onCellClick()"` to root div

**`src/app/pokedex/pokedex-entry/pokedex-entry.component.css`**
- Added `.pokedex-cell.clickable { cursor: pointer; }`

**`src/app/pokedex/pokedex-entry/pokedex-entry.component.spec.ts`**
- Added 4 DETAIL-01 tests: emit on seen click, no emit on unseen click, .clickable class present/absent

**`src/app/trainer-team/pokedex/pokedex.component.ts`**
- Added imports for `PokedexDetailModalComponent` and `PokedexEntryClickEvent`
- Added `onEntryClicked()` method opening `PokedexDetailModalComponent` via `modalService.open()`

**`src/app/trainer-team/pokedex/pokedex.component.html`**
- Added `(entryClicked)="onEntryClicked($event)"` to `<app-pokedex-entry>`

**`src/app/trainer-team/pokedex/pokedex.component.spec.ts`**
- Added 1 DETAIL-01 test: `onEntryClicked` calls `modalService.open(PokedexDetailModalComponent)`

### Verification

- 165 specs, 0 failures
- All acceptance criteria met (grep checks all pass)

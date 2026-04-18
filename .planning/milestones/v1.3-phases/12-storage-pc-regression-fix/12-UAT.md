---
status: complete
phase: 12-storage-pc-regression-fix
source: 12-PLAN-01.md
started: 2026-04-17T21:26:38Z
updated: 2026-04-18T00:36:13Z
---

## Current Test

[testing complete]

## Tests

### 1. Drag Pokémon from team slot to storage
expected: Open the Storage PC modal. Drag a Pokémon from the active team list into the storage grid. Close the modal. The trainer team should show the updated lineup — the dragged Pokémon is gone from the team and appears in storage.
result: pass

### 2. Drag Pokémon from storage to team slot
expected: Open the Storage PC modal. Drag a Pokémon from the storage grid into the active team list. Close the modal. The trainer team now includes that Pokémon, and it is no longer in storage.
result: pass

### 3. Reorder team slots via drag-and-drop
expected: Open the Storage PC modal. Drag a Pokémon from one team slot to another to reorder. Close the modal. The team displays in the new order.
result: pass

### 4. Win odds update after team change
expected: While in a battle roulette (where win odds are displayed), open the Storage PC modal and swap a Pokémon. After closing the modal, the displayed win odds recalculate to reflect the new team composition.
result: pass

## Summary

total: 4
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

# Requirements: Pokemon Roulette — Milestone v1.3 (Storage PC Regression Fix)

**Defined:** 2026-04-17
**Core Value:** The game stays green (compilable, testable, and playable) after every change.

---

## v1.3 Requirements

### Storage PC Team Editing

- [ ] **PC-01**: `TrainerService` exposes a `commitTeamAndStorage(team: PokemonItem[], stored: PokemonItem[]): void` method that writes the provided arrays into the service's internal `trainerTeam` and `storedPokemon` state and immediately broadcasts the updated team via `trainerTeamObservable`.

- [ ] **PC-02**: `StoragePcComponent.drop()` calls `commitTeamAndStorage()` with the locally-modified `trainerTeam` and `storedPokemon` arrays after every CDK DragDrop event, replacing the current broken `updateTeam()` call.

- [ ] **PC-03**: After a drag-and-drop operation in the PC storage modal, the trainer team displayed in the main game view updates immediately without requiring a reload or any additional user action.

- [ ] **PC-04**: After a drag-and-drop operation changes the team composition, the win odds displayed in any active battle roulette update reactively (all battle roulette components already subscribe to `trainerTeamObservable` — this requirement validates the end-to-end chain is working).

---

## Future Requirements (Deferred)

- Language selector image-based flags — needs image assets
- ThemeSelectorComponent label alignment fix — cosmetic, deferred from v1.2 UAT
- DarkModeService injection cleanup in migrated components — cosmetic debt
- Additional themes (generation-specific backgrounds) — v1.4+

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Revert IMMUT-01 immutability fix | Wrong approach — getTeam()/getStored() must remain immutable; fix is a write-back API |
| Drag-and-drop persistence to localStorage | By design — in-memory only |
| PC storage UI redesign | Out of scope for this regression fix |

---

## Traceability

| Requirement | Phase | Status | Phase Name |
|-------------|-------|--------|------------|
| PC-01 | 12 | Pending | Storage PC Regression Fix |
| PC-02 | 12 | Pending | Storage PC Regression Fix |
| PC-03 | 12 | Pending | Storage PC Regression Fix |
| PC-04 | 12 | Pending | Storage PC Regression Fix |

**v1.3 requirements defined: 4 total**

---
*Requirements defined: 2026-04-17*

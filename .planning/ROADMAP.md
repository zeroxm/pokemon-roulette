# Roadmap: Pokémon Roulette

## Milestones

- ✅ **v1.0 Pokédex Feature** — Phases 1–3 (shipped 2026-04-03)
- ✅ **v1.1 Pokédex Corrections** — Phases 4–5 (shipped 2026-04-03)
- 🚧 **v1.2 Pokédex Visual Enhancement** — Phases 6–7 (in progress)

## Phases

<details>
<summary>✅ v1.0 Pokédex Feature (Phases 1–3) — SHIPPED 2026-04-03</summary>

- [x] Phase 1: Service & Game Hooks (1/1 plans) — completed 2026-04-03
- [x] Phase 2: Entry Component & Visual States (1/1 plans) — completed 2026-04-03
- [x] Phase 3: Modal & Navigation (1/1 plans) — completed 2026-04-03

Full archive: `.planning/milestones/v1.0-ROADMAP.md`

</details>

<details>
<summary>✅ v1.1 Pokédex Corrections (Phases 4–5) — SHIPPED 2026-04-03</summary>

- [x] Phase 4: Bug Fixes & Layout Polish (2/2 plans) — completed 2026-04-03
- [x] Phase 5: Complete Dex Data & Region Naming (2/2 plans) — completed 2026-04-03

Full archive: `.planning/milestones/v1.1-ROADMAP.md`

</details>

---

## v1.2 Pokédex Visual Enhancement

### Phases

- [ ] **Phase 6: Foundation & Visual Polish** — Service schema, mobile fix, and glow animation — no new components (2 plans)
- [ ] **Phase 7: Detail Modal** — Pokémon detail modal with official artwork, shiny toggle, and alternate forms

### Phase Details

### Phase 6: Foundation & Visual Polish
**Goal**: The service layer supports shiny tracking, mobile fullscreen works, and won cells pulse with gold glow
**Depends on**: Nothing (foundational changes only)
**Requirements**: MOB-01, SHINY-01, VIS-01
**Success Criteria** (what must be TRUE):
  1. Opening the Pokédex on a ≤576px viewport renders the modal fullscreen — no partial overlay or scroll bleed
  2. Winning a battle with a shiny Pokémon writes `shiny: true` to localStorage; reopening the app retains that flag
  3. Won Pokémon cells show a continuously pulsing gold glow animation instead of a static border
**Plans**: 2 plans
Plans:
- [ ] 06-01-PLAN.md — Extend PokedexEntry + markSeen for shiny tracking; update 5 call sites (SHINY-01)
- [ ] 06-02-PLAN.md — Mobile fullscreen CSS override + glow-pulse won-cell animation (MOB-01, VIS-01)
**UI hint**: yes

### Phase 7: Detail Modal
**Goal**: Tapping a seen or won Pokémon opens a rich detail modal with official artwork, shiny toggle, and alternate forms
**Depends on**: Phase 6 (SHINY-01 must be in place for SHINY-02)
**Requirements**: DETAIL-01, DETAIL-02, SHINY-02
**Success Criteria** (what must be TRUE):
  1. Clicking a seen or won Pokémon cell opens a modal showing the official-artwork sprite in a circle, a zero-padded Pokédex number (e.g. `#025`), and the localized name
  2. Unseen/unknown cells produce no action when clicked
  3. If the entry has `shiny: true`, a shiny toggle button appears; toggling switches the displayed sprite between regular and shiny official-artwork
  4. Alternate forms (where they exist) are shown in the detail modal and are selectable
**Plans**: TBD
**UI hint**: yes

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Service & Game Hooks | v1.0 | 1/1 | ✅ Complete | 2026-04-03 |
| 2. Entry Component & Visual States | v1.0 | 1/1 | ✅ Complete | 2026-04-03 |
| 3. Modal & Navigation | v1.0 | 1/1 | ✅ Complete | 2026-04-03 |
| 4. Bug Fixes & Layout Polish | v1.1 | 2/2 | ✅ Complete | 2026-04-03 |
| 5. Complete Dex Data & Region Naming | v1.1 | 2/2 | ✅ Complete | 2026-04-03 |
| 6. Foundation & Visual Polish | v1.2 | 0/2 | Not started | - |
| 7. Detail Modal | v1.2 | 0/TBD | Not started | - |


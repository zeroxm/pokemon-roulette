# Roadmap: Pokémon Roulette

## Milestones

- ✅ **v1.0 Pokédex Feature** — Phases 1–3 (shipped 2026-04-03)
- ✅ **v1.1 Pokédex Corrections** — Phases 4–5 (shipped 2026-04-03)
- ✅ **v1.2 Pokédex Visual Enhancement** — Phases 6–7 (shipped 2026-04-08)

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

<details>
<summary>✅ v1.2 Pokédex Visual Enhancement (Phases 6–7) — SHIPPED 2026-04-08</summary>

- [x] Phase 6: Foundation & Visual Polish (2/2 plans) — completed 2026-04-08
- [x] Phase 7: Detail Modal (2/2 plans) — completed 2026-04-08

Full archive: `.planning/milestones/v1.2-ROADMAP.md`

</details>

---

## v1.3 Pokédex Data Integrity

- [ ] **Phase 8: Data Integrity Fixes** — Fix shiny persistence and alt-form champion win tracking

---

## Phase Details

### Phase 8: Data Integrity Fixes
**Goal**: Pokédex entries accurately reflect shiny status and champion wins for all Pokémon, including alt-forms
**Depends on**: Phase 7 (v1.2 complete)
**Requirements**: SHINY-03, ALTW-01
**Success Criteria** (what must be TRUE):
  1. After a shiny roulette resolves, the Pokédex entry for that Pokémon shows `shiny: true`
  2. After beating the Champion with an alt-form Pokémon, the detail modal shows a gold border for both the alt-form and the base national dex entry
  3. Beating the Champion with a non-alt-form Pokémon continues to mark only that single entry as won (no regression)
  4. Shiny flag set via the detail modal toggle is unaffected by the roulette capture flow (no regression)
**Plans**: 1 plan

Plans:
- [ ] 08-01-PLAN.md — Fix shiny persistence (SHINY-03) and alt-form champion win tracking (ALTW-01)

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Service & Game Hooks | v1.0 | 1/1 | ✅ Complete | 2026-04-03 |
| 2. Entry Component & Visual States | v1.0 | 1/1 | ✅ Complete | 2026-04-03 |
| 3. Modal & Navigation | v1.0 | 1/1 | ✅ Complete | 2026-04-03 |
| 4. Bug Fixes & Layout Polish | v1.1 | 2/2 | ✅ Complete | 2026-04-03 |
| 5. Complete Dex Data & Region Naming | v1.1 | 2/2 | ✅ Complete | 2026-04-03 |
| 6. Foundation & Visual Polish | v1.2 | 2/2 | ✅ Complete | 2026-04-08 |
| 7. Detail Modal | v1.2 | 2/2 | ✅ Complete | 2026-04-08 |
| 8. Data Integrity Fixes | v1.3 | 0/? | Not started | - |


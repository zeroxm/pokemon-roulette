# Roadmap: Pokémon Roulette

## Milestones

- ✅ **v1.0 Pokédex Feature** — Phases 1–3 (shipped 2026-04-04)
- 🔄 **v1.1 Pokédex Corrections** — Phases 4–5 (in progress)

## Phases

<details>
<summary>✅ v1.0 Pokédex Feature (Phases 1–3) — SHIPPED 2026-04-04</summary>

- [x] Phase 1: Service & Game Hooks (1/1 plans) — completed 2026-04-03
- [x] Phase 2: Entry Component & Visual States (1/1 plans) — completed 2026-04-03
- [x] Phase 3: Modal & Navigation (1/1 plans) — completed 2026-04-03

Full archive: `.planning/milestones/v1.0-ROADMAP.md`

</details>

### v1.1 Pokédex Corrections

- [ ] **Phase 4: Bug Fixes & Layout Polish** — Correct button layout, grid columns, and missing markSeen hooks
  - [ ] 04-PLAN-01.md — Layout Polish: button alignment (LAYOUT-01) + grid columns (LAYOUT-02)
  - [ ] 04-PLAN-02.md — Hook Fixes: markSeen on evolution (HOOK-01) + markSeen on trade (HOOK-02)
- [ ] **Phase 5: Complete Dex Data & Region Naming** — Create full generation data files, wire into Local Dex, rename tab per region with i18n

## Progress| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Service & Game Hooks | v1.0 | 1/1 | Complete | 2026-04-03 |
| 2. Entry Component & Visual States | v1.0 | 1/1 | Complete | 2026-04-03 |
| 3. Modal & Navigation | v1.0 | 1/1 | Complete | 2026-04-03 |
| 4. Bug Fixes & Layout Polish | v1.1 | 0/2 | Not started | — |
| 5. Complete Dex Data & Region Naming | v1.1 | 0/? | Not started | — |

---

## Phase Details

### Phase 4: Bug Fixes & Layout Polish
**Goal**: All Pokédex interactions work correctly and the Pokédex UI is laid out as designed
**Depends on**: Phase 3 (v1.0 Pokédex exists)
**Requirements**: LAYOUT-01, LAYOUT-02, HOOK-01, HOOK-02
**Success Criteria** (what must be TRUE):
  1. The PC button and Pokédex button sit at opposite ends of the trainer-team panel — not side-by-side with a gap
  2. The Pokédex grid renders exactly 6 columns on mobile (≤576px) and exactly 9 columns on desktop (>576px) with 40px cells
  3. When a Pokémon evolves via any path, the evolved Pokémon immediately appears as seen in the Pokédex
  4. When a trade event completes, the received Pokémon immediately appears as seen in the Pokédex
**Plans**: TBD
**UI hint**: yes

### Phase 5: Complete Dex Data & Region Naming
**Goal**: The Local Dex shows every Pokémon in the current generation under a region-branded name in all supported languages
**Depends on**: Phase 4
**Requirements**: DATA-07, DATA-08, UX-01
**Success Criteria** (what must be TRUE):
  1. The Local Dex tab label reads "{Region} Dex" for the active generation (e.g. "Kanto Dex", "Johto Dex", "Paldea Dex")
  2. The "{Region} Dex" label renders correctly in all 6 locale files (EN, ES, FR, DE, IT, PT)
  3. The Local Dex grid displays every Pokémon in the generation — including legendaries, mythicals, Ultra Beasts, and Paradox Pokémon — with no omissions
  4. The progress counter in the Local Dex reflects the complete generation pool (e.g. "0 / 151" for Kanto, not the smaller roulette subset)
**Plans**: 2 plans
- [ ] 05-01-PLAN.md — Create pokedex-by-generation.ts with complete national dex ranges (DATA-07)
- [ ] 05-02-PLAN.md — Wire complete data + region-branded tab label in TS, HTML, and 6 i18n files (DATA-08, UX-01)
**UI hint**: yes

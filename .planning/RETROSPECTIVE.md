# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Pokédex Feature

**Shipped:** 2026-04-04  
**Phases:** 3 | **Plans:** 3 | **Sessions:** 1

### What Was Built

- **PokedexService** — BehaviorSubject+localStorage data layer with `markSeen`/`markWon`, deterministic sprite URLs, in-memory dedup cache, and 4 game hook call sites wired into `roulette-container.component.ts`
- **PokedexEntryComponent** — 40px compact flip-card cell with 3 visual states (unseen/seen/won), CSS 3D animation, gold won border, lazy-loaded sprites, number badge, and ngbTooltip
- **PokedexComponent** — NgbModal with tabbed Local/National Dex, live caught counter, mobile full-screen, dark mode, and 6-locale i18n — placed alongside the PC button in trainer-team

### What Worked

- **Service-first build order:** Data layer verified working before UI existed — no debugging of data vs UI bugs entangled
- **Research → Plan → Check → Execute cycle:** Each phase's research caught real pitfalls (iOS webkit prefixes, `@ViewChild static:true`, `String(id)` key lookup) before implementation
- **TDD discipline:** RED before GREEN on every phase; caught type errors and import issues early rather than during integration
- **Copy-from-blueprint pattern:** `StoragePcComponent` as a verbatim blueprint for `PokedexComponent` eliminated design time and produced consistent patterns
- **Parallel background agents:** Planner + checker in background while main context continues — significant throughput improvement

### What Was Inefficient

- **VERIFICATION.md gap:** `/gsd-verify-work` was never invoked for any phase, causing the milestone audit to show 12/17 requirements as "unsatisfied" in tracking — despite all code being delivered and tested
- **SUMMARY frontmatter:** Phases 1 and 2 executor didn't populate `requirements-completed` YAML field — caused audit cross-reference failures
- **ROADMAP.md checkbox drift:** Phase 1 and 2 checkboxes were never ticked to `[x]` as phases completed — cosmetic but visible in audit

### Patterns Established

- `PokedexService` pattern: `BehaviorSubject<T>` + localStorage persistence + private method for read/write — mirrors `SettingsService` exactly
- `String(id)` key lookup when consuming `Record<string, T>` services — document in phase research when the service uses string keys
- `@ViewChild('ref', { static: true })` is MANDATORY for NgbModal template refs — add to research checklist
- `windowClass` (not `size`) for Bootstrap modal custom classes — `size` expects Bootstrap keywords only
- `ng test --include` filter is broken in this project's Karma/webpack setup — always use `ng test --no-watch --browsers=ChromeHeadless`
- `pokedexData: PokedexData | undefined` (not `pokedexData!: PokedexData`) — truthful types prevent TS2532 in templates

### Key Lessons

1. **Run `/gsd-verify-work` after each phase** — even if tests pass, it updates SUMMARY frontmatter and creates the VERIFICATION.md that the milestone audit requires. Without it, audit shows false failures.
2. **The `!` non-null assertion hides real type errors** — Angular templates will still emit TS2532 on optional chain access. Declare `| undefined` and use double optional chain `?.prop?.[key]` in templates.
3. **Pre-research pitfalls prevent 90% of debugging** — the research phase caught every critical issue before a single line of implementation was written in this milestone.
4. **CSS 3D transforms on mobile need webkit prefixes** — always add `-webkit-transform-style: preserve-3d` and `-webkit-backface-visibility: hidden` for iOS Safari.

### Cost Observations

- Model mix: ~100% Sonnet (balanced profile)
- Sessions: 1 (full milestone in single session with context compaction)
- Notable: Background agents (planner, checker, executor) ran in parallel with main context — the Pokédex feature went from discuss → plan → check → execute → build-fix in under 2 hours of wall time

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Phases | Plans | Key Change |
|-----------|--------|-------|------------|
| v1.0 | 3 | 3 | First GSD milestone on this project |

### Cumulative Quality

| Milestone | Tests | Zero-Dep Additions |
|-----------|-------|--------------------|
| v1.0 | 141 | 0 (reused existing stack) |

### Top Lessons (Verified Across Milestones)

1. Run `/gsd-verify-work` after every phase — milestone audit depends on VERIFICATION.md files
2. Truthful types (`T | undefined`) over non-null assertions (`T!`) to avoid Angular template type errors

# Project Retrospective

*A living document updated after each milestone. Lessons feed forward into future planning.*

## Milestone: v1.0 — Low-Severity Technical Debt

**Shipped:** 2026-04-17
**Phases:** 6 | **Plans:** 11 | **Sessions:** 1

### What Was Built
- Removed all dead code (unreachable statements, cosmetic double-semicolon)
- Corrected "buttom" typo across component directory, files, selector, and 8 import/usage references
- Extracted `NINCADA_ID` magic number to a dedicated constants file; moved Nincada evolution logic to `EvolutionService`
- Eliminated duplicate Potion object literal via `private static readonly DEFAULT_POTION`
- Replaced `declare var gtag: any` with a fully typed `GtagCommand` + `GtagEventParams` interface
- Expanded `dom-to-image-more.d.ts` from a bare stub to a full typed interface; removed 2 `@ts-ignore` suppressions; added null guard for `toBlob`
- Replaced 2 `new Observable` constructor patterns with idiomatic RxJS `of()`
- Pre-computed `variantToBase: Map<number, number>` in `PokemonFormsService` — O(n) scan → O(1) lookup
- Cleared dev GA ID to prevent analytics pollution in local dev and CI runs

### What Worked
- Atomic-commit-per-concern discipline paid off — each commit is independently bisectable
- Running `ng build` + `ng test` after every change caught the `toBlob: Blob | null` type error immediately
- Sequential phase execution with clear success criteria made each phase self-contained and easy to verify
- 175/175 tests remained green from first commit to last — zero regressions

### What Was Inefficient
- REQUIREMENTS.md and ROADMAP.md plan-status checkboxes were not updated incrementally during execution — required batch update at milestone close
- STATE.md "Phase Summary" table had stale status for phases 3-6 even after completion

### Patterns Established
- `src/app/constants/` directory established for shared pokemon-id constants — future magic numbers go here
- `private static readonly` pattern for service-scoped default objects (vs module-level export)
- `types/**/*.d.ts` in both `tsconfig.app.json` and `tsconfig.spec.json` — ambient declarations need both to resolve

### Key Lessons
1. REQUIREMENTS.md traceability table status ("Pending" → "Complete") should be updated as each plan completes, not batched at milestone close
2. When expanding a third-party `.d.ts`, check actual return types against library source — `toBlob` returning `Promise<Blob | null>` was not in the original stub
3. The `declare var gtag: any` → typed interface pattern is reusable for any global injected by script tag — apply same approach to future third-party globals

### Cost Observations
- Sessions: 1 (single session from planning to milestone complete)
- Notable: All 11 concerns resolved with 0 test regressions in one focused session

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | 1 | 6 | Initial milestone — atomic commit discipline established |

### Cumulative Quality

| Milestone | Tests | Zero Regressions | New Deps |
|-----------|-------|-----------------|----------|
| v1.0 | 175 | ✅ | 0 |

### Top Lessons (Verified Across Milestones)

1. Atomic commits per concern enable targeted bisect — always commit one logical change at a time
2. Verify return types of typed third-party APIs against library source, not just usage

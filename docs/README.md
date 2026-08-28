# Project documentation

## Remediation campaign — 2026-08

Two whole-codebase audits were run against commit `a00ea99` and their findings worked through on
[PR #42](https://github.com/zeroxm/pokemon-roulette/pull/42).

| | Original | Cleared |
| --- | --- | --- |
| Correctness (`SEC-nn`) | 4 High · 14 Medium · 28 Low | **45 of 46** |
| Maintainability (`CQ-nn`) | 26 | **26 of 26** |

**The audit reports are deleted** — they are empty. Their content lives in the git history of this
branch, and every task commit names the findings it cleared.

**One finding was deliberately not fixed.** The sprites hot-linked from `raw.githubusercontent.com`
are now a cosmetic failure mode rather than a broken UI, but eliminating the dependency means either
pinning to a commit SHA or vendoring ~2,400 files — a trade-off for the maintainer, not something to
decide mid-campaign. It is recorded under **Known accepted risk** in `CLAUDE.md`.

## Still live

| Document | Purpose |
| --- | --- |
| [CHANGELOG.md](CHANGELOG.md) | **The UAT script.** Every observable change, written as something to check by playing. Not yet run. |
| [TASKS.md](TASKS.md) | The worklist, as a record of what was done and in what order. |

Both can be deleted once UAT passes and the PR merges.

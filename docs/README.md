# Project documentation

Audit reports and working notes for **Pokémon Roulette**.

## Audit reports

| Report | Focus | Findings | IDs |
| --- | --- | --- | --- |
| [Thermo-Nuclear Review](thermo-nuclear-review.md) | Correctness, bugs, security, breaking behavior, devex | 4 High · 14 Medium · 28 Low | `SEC-01`–`SEC-30` |
| [Thermo-Nuclear Code Quality Review](thermo-nuclear-code-quality-review.md) | Maintainability, structure, abstractions, decomposition | 26 | `CQ-01`–`CQ-26` |

Both were generated on **2026-08-27** against commit **`a00ea99`**, each by three reviewers working in
parallel over the same three areas (game-flow core, domain services, presentation/infra). The two runs
were independent — the quality reviewers were not told what the correctness pass had found.

### Read them in this order

Start with the **code quality** report. Four of its findings are the structural root causes of
correctness bugs in the other report, and fixing the structure makes those bugs unrepresentable rather
than patched:

| Quality finding | Correctness findings it structurally prevents |
| --- | --- |
| `CQ-02` unified form-rule model | `SEC-02`, `SEC-03`, `SEC-05` |
| `CQ-03` run modifiers into a service | `SEC-04`, `SEC-07` |
| `CQ-10` stone-on-form join | `SEC-30a` |
| `CQ-13` extract weighted-random | makes `SEC-01` unit-testable |

The exception is `SEC-01` itself — a reachable permanent soft-lock of the entire UI. That one is worth
fixing on its own before any refactor.

The quality report ends with a **15-step migration order** that sequences both reports' work.

### Scope

Both reports cover the **whole codebase**, not a branch diff. The Thermos review skills are normally
diff-scoped ("only report issues in code being added or modified"), but `main` was clean with no diff
against `origin/main`, so the reviewers were explicitly instructed to treat all of `src/` as the change
under review.

Static data tables received a **structural skim only** — key/shape consistency and dangling id
references, not a line-by-line audit. These are:

- `services/pokemon-service/national-dex-pokemon.ts` (14,353 lines)
- `services/pokemon-forms-service/pokemon-forms.ts` (2,232)
- `services/trainer-service/pokemon-mega-forms.ts` (1,404)
- `services/items-service/mega-stones-data.ts` (764)
- `roulettes/gym-battle-roulette/gym-leaders-by-generation.ts` (695)
- `roulettes/elite-four-battle-roulette/elite-four-by-generation.ts` (353)
- `services/evolution-service/evolution-chain.ts` (486)

### Known limitation of this audit round

`npm` was not installed on the machine where these reports were generated (`node` was present, but
`node_modules/` was absent), so **the build and test suite could not be executed**. Every finding is
the result of static analysis. No report claims a test passes or fails. Anything whose severity
depends on unobserved runtime behavior is marked as such in the finding itself.

To re-establish a runnable baseline:

```bash
sudo pacman -S npm && npm ci
```

```bash
npm run build && npm test -- --watch=false --browsers=ChromeHeadless
```

## Using these reports

Each finding carries a stable ID, a severity, a `file:line` location, a concrete failure scenario, and
a suggested fix — plus a `Status` checkbox so the reports double as a refactor worklist:

```markdown
- **Status:** [ ] open
```

Tick findings off as they are addressed, and reference the ID in the commit message
(e.g. `fix(SEC-03): clear stale container state on game reset`). IDs are stable — do not renumber
when a finding is closed.

Findings are recommendations only. Nothing in this round has been applied to the source.

# Remediation worklist

Working list for clearing every finding in
[thermo-nuclear-review.md](thermo-nuclear-review.md) (`SEC-nn`) and
[thermo-nuclear-code-quality-review.md](thermo-nuclear-code-quality-review.md) (`CQ-nn`).

## Process

All work lands on **`remediation/thermo-nuclear-audit`**, which is open as
[PR #42](https://github.com/zeroxm/pokemon-roulette/pull/42) (draft) against `main`. **Local `main`
tracks `origin/main` and must stay untouched** — every change lives on the branch so the PR shows the
complete picture.

Each task: task branch off the remediation branch → implement → verify → merge back into it → tick
here → **delete the covered findings from the report files**. When both reports are empty they get
deleted and the PR comes out of draft.

```bash
git switch remediation/thermo-nuclear-audit
git switch -c task/T-10-pokemon-unknown-key
# implement + verify
git switch remediation/thermo-nuclear-audit
git merge --no-ff task/T-10-pokemon-unknown-key
git branch -d task/T-10-pokemon-unknown-key
git push                      # keeps the PR current for review
```

Branch naming: `task/T-nn-short-slug`. Merges use `--no-ff` so each task stays a visible unit in
history, is reviewable on its own in the PR, and can be reverted whole.

## Ordering rationale

Structural work comes before the correctness fixes it subsumes — patching `revertMegaForms` by hand
(`SEC-02`) means writing code that `T-20` then deletes. The exceptions are `T-03` (`SEC-01`), a
reachable full-UI soft-lock worth fixing immediately, and the pure-data tasks, which are independent
of everything.

`T-01` comes first because without it nothing can be verified at all.

---

## Status

**25 / 36 complete.** Findings cleared: 26 of 46 `SEC` · 17 of 26 `CQ`.

### Verified baseline — commit `4f14d63`, 2026-08-27

| Check | Result |
| --- | --- |
| `npm ci` | 996 packages, exit 0 |
| `npm run build` | **pass** (1.47 MB initial, 3.9 s) |
| `npm test -- --watch=false --browsers=ChromeHeadless` | **234 / 234 pass** (baseline was 230; `T-05` −2, `T-03` +6) |

Every task below must leave both green. Re-run before each merge.

**Environment caveats** — these affect how much a green run proves:

- **Local Node is 26.7.0; CI builds on 24.x.** `.nvmrc` now records 24, but nothing enforces it until a
  version manager is installed, so local runs are on 26. A green local build is strong evidence, not
  proof.
- **`CHROME_BIN=/usr/bin/google-chrome-stable`** — `chromium` is not installed; the tests were run with
  this exported.
- **npm 12 blocked 4 install scripts** (`esbuild`, `@parcel/watcher`, `lmdb`, `msgpackr-extract`). Build
  and tests pass regardless, but a future toolchain bump may need `npm install-scripts approve`.

**Observed at baseline, not in either report** (both audits ran without a build):

- Initial bundle is **1.47 MB against a 1.00 MB warning budget** — 467 kB over. Error threshold is
  2 MB, so it warns rather than fails. Handled in `T-35`.
- `npm audit`: **52 vulnerabilities (2 low, 13 moderate, 34 high, 3 critical)**. Quantifies `SEC-30o`.
- `mega-evolution-animation-modal.component.css` is **8.52 kB** against a 4 kB warning / 10 kB error —
  confirming `SEC-15`'s hand-estimate of ~9.0 kB. 1.48 kB from breaking the build.
- `dom-to-image-more` is CommonJS, causing an optimization-bailout warning on every build.

| # | Task | Covers | Risk | Status |
| --- | --- | --- | --- | --- |
| **Phase 0 — make verification possible** ||||
| T-01 | Install `npm`, `npm ci`, capture green build + test baseline; pin `.nvmrc` to 24 | — | none | [x] |
| T-02 | Enable `noUnusedLocals` + `noUnusedParameters`; fix all 27 diagnostics (app + spec) | `CQ-21`, `CQ-24` | low | [x] |
| **Phase 1 — urgent standalone bug** ||||
| T-03 | Guard the wheel spin: readiness gate, single-array spin math, gate released on any throw, 6 regression tests | `SEC-01` | med | [x] |
| **Phase 2 — mechanical deletions** ||||
| T-04 | Delete 7 dead methods + 3 orphan JSON form files | `CQ-19` (with `T-02`, `T-08`), `SEC-30n` | low | [x] |
| T-05 | Delete `DarkModeService`, `DarkModeToggleComponent`, 14 dead injections, legacy CSS + storage key | `CQ-05`, `SEC-19` | low | [x] |
| T-06 | Declare `@angular/localize`; drop 3 unused deps | `CQ-20`, `SEC-30p` | low | [x] |
| T-07 | Delete `GENERATION_GAME_CONFIG` and the `initializeStates` params | `CQ-22` | low | [x] |
| T-08 | Remove the dead `quotes` ternary from all 4 battle roulettes | `CQ-19` | low | [x] |
| **Phase 3 — data and i18n (no build needed)** ||||
| T-09 | Add the 8 missing gen-9 badge keys to all six locales | `SEC-16` | low | [x] |
| T-10 | Add `pokemon.unknown` to all six locales | `SEC-17` | low | [x] |
| T-11 | Repopulate the gen-8 fishing table (4 → 45); fix the font clamp it exposes | `SEC-13`, `SEC-10` | low | [x] |
| T-12 | Replace the 404 scaffold with real translated content | `SEC-18` | low | [x] |
| T-13 | Remove the two English literals (`Multitask x`, `Empty`); add keys | `SEC-22`, `SEC-23` | low | [x] |
| T-14 | Apply the existing language whitelist before `translate.use()` | `SEC-27` | low | [x] |
| T-15 | Pass the real `EventSource`; adds an `elite-four-battle` member + consolation copy | `SEC-30l` | low | [x] |
| T-16 | Delete the orphan i18n key `…elite.prep.actions.catchPokemon` from six locales | report note | low | [x] |
| **Phase 4 — container decomposition** ||||
| T-17 | Extract the 6 inline `ng-template` modals into 4 components | `CQ-07`, `CQ-18` (partial) | med | [x] |
| T-18 | Add `setNextStates(...)`; collapse the 8 reverse-push sites | `CQ-11` | low | [x] |
| T-19 | Add `showModalThenContinue` | `CQ-12` | med | [x] |
| T-20 | Consolation-prize `Record<EventSource, …>` table + outcome-based test rewrite | `CQ-06`, `CQ-25` | med | [x] |
| T-21 | `PendingSelection<T>` continuations — deleted both mega dispatchers, 3 marker states, added `@default` arm | `CQ-01`, `SEC-06`, `SEC-26` | high | [x] |
| T-22 | `RunModifiers` into `GameStateService` + transient reset on `game-start` + regression tests | `CQ-03`, `SEC-04`, `SEC-07`, `SEC-30d`, `SEC-30f` | high | [x] |
| **Phase 5 — form subsystem** ||||
| T-23 | `FormRule` model + `FormRuleService` | `CQ-02`, `SEC-02`, `SEC-03`, `SEC-05` | high | [x] |
| T-24 | Stone moved onto the form; `_baseIdToStoneName` deleted; Greninja resolved; revert keeps the resolved sprite | `CQ-10`, `SEC-30a`, `SEC-08` | med | [x] |
| **Phase 6 — infra restructures** ||||
| T-25 | `SoundFxService` → one `Map<SoundFxName, SoundFxClip>`; 8 call sites; bounded ended-wait | `CQ-04`, `SEC-20`, `SEC-21` | med | [x] |
| T-26 | Extract `weighted-random.ts` + `SpinAnimation`; fix per-spin `duration`, double-translate, `ngOnDestroy`, resize redraw | `CQ-13`, `SEC-11`, `SEC-12`, `SEC-30c`, `SEC-30k` | med | [ ] |
| T-27 | Collapse the 5 group-A pool roulettes into `pokemon-pool-roulette` | `CQ-08` | med | [ ] |
| T-28 | Pull `buildVictoryOdds` + `resolveSplitTrainer` into the battle base | `CQ-09`, `SEC-30b` | med | [ ] |
| **Phase 7 — remaining correctness** ||||
| T-29 | Sprite resilience: error handler on `loadPokemonSpriteIfMissing`, shared `(error)` fallback, pin sprite URLs to a SHA | `SEC-09`, `SEC-14` | med | [ ] |
| T-30 | `ModalQueueService` unhandled rejection; route champion/rival modals through the queue | `SEC-24`, `SEC-25` | low | [ ] |
| T-31 | Guard `evolvePokemon` zero-evolutions; emit on `finishCurrentState` underflow | `SEC-28`, `SEC-30e`, `CQ-23` | low | [ ] |
| T-32 | Type/contract cleanups: `BadgesService` return type, `getItems()` copy, `WheelItem.weight` optional, `getGameState()`, `stolenPokemon`, `structuredClone` note | `CQ-15`, `CQ-16`, `CQ-17`, `CQ-18`, `SEC-30i` | med | [ ] |
| T-33 | Defensive-parse cleanups: pokédex entry shapes, settings field types, `getTrainerSprite` guard, `distinctUntilChanged` no-op, `replaceForEvolution` warn | `SEC-30g`, `SEC-30h`, `SEC-30j`, `SEC-30m`, `SEC-30q` | low | [ ] |
| **Phase 8 — tests, config, teardown** ||||
| T-34 | Specs for `ModalQueueService` + `SettingsService`; karma `src/assets` | `SEC-29`, `CQ-14`, `CQ-26` | low | [ ] |
| T-35 | Dependency vulnerabilities + bundle/CSS budgets; CI audit step — see below | `SEC-15`, `SEC-30o` + baseline obs. | med | [ ] |
| T-36 | UAT pass against `docs/CHANGELOG.md`; delete `docs/` audit reports, changelog and this file; push `main` to remote | — | — | [ ] |

### T-02 in detail

Running the flags at baseline surfaced **21 diagnostics**; `T-05` cleared 14 of them. The **7 that
remain** must be fixed in the same commit that enables the flags, or the build goes red:

| File | Diagnostic |
| --- | --- |
| `roulette-container.component.ts:735` | unused parameter `pokemon` |
| `champion-battle-roulette.component.ts:42` | unused `private modalQueueService` — note `SEC-25` wants this roulette routed *through* the queue, so the fix may be to **use** it, not delete it |
| `find-item-roulette.component.ts:27` | unused `private itemService` |
| `fishing-roulette.component.ts:1` | unused `OnInit` / `OnDestroy` imports — the component defines both hooks without `implements` (`CQ-24`) |
| `storage-pc.component.ts:83` | unused `modalRef` |
| `wheel.component.ts:310` | dead `const totalWeight` inside `animate()` — an O(n) reduce per frame (`CQ-19`) |

Three of these (`pokemon`, `itemService`, `modalRef`) were found by **neither audit** — the compiler
caught what two review passes missed, which is the argument for `CQ-21` in a nutshell.

### T-35 in detail

Both items were invisible to the audits, which ran without a build. Neither fails CI today; both are
close enough that the next ordinary change tips them over.

**Dependency vulnerabilities** — `npm audit` reports **52 (2 low, 13 moderate, 34 high, 3 critical)**
against a committed lockfile. Work it in this order, because the split matters:

1. `npm audit --omit=dev` first — separate what actually ships in the bundle from build-only tooling.
   A critical in a Karma transitive is not the same risk as one in a runtime dependency.
2. `npm audit fix` (no `--force`) for anything resolvable without a major bump; re-verify green.
3. Triage the remainder individually. **Do not run `npm audit fix --force`** — it will happily bump
   Angular majors and turn a 34-task campaign into a framework migration.
4. Add `npm audit --audit-level=high` to CI (`SEC-30o`, currently folded into `T-34`) only once the
   count is at a level that will not red-wall every future PR.

**Budgets** — measured at baseline:

| Budget | Configured | Actual | Headroom |
| --- | --- | --- | --- |
| initial bundle | 1 MB warn / 2 MB error | **1.47 MB** | 530 kB to failure |
| `mega-evolution-animation-modal.component.css` | 4 kB warn / 10 kB error | **8.52 kB** | **1.48 kB to failure** |

The stylesheet is the urgent half. `CQ-26` established the 517 lines are legitimately 15 `@keyframes`
driving a six-phase animation and should *not* be split for tidiness — so the fix is either hoisting
shared keyframes into `src/styles.css` or raising that budget deliberately, not decomposition.

For the bundle: `dom-to-image-more` is CommonJS and triggers an optimization bailout on every build;
check what it costs before assuming the 467 kB overage is inherent. Decide explicitly whether to trim
or to raise the warning threshold to something honest — a permanently-breached budget trains everyone
to ignore build warnings, which is worse than no budget.

---

## Coverage check

Every finding maps to exactly one task. Verified against the two reports:

- `SEC-01`–`SEC-30` (including all 17 `SEC-30` sub-items a–q) → covered
- `CQ-01`–`CQ-26` → covered

`CQ-26` (spec scaffolding) and `CQ-14` (`finishCurrentState` readability) fold into `T-34` and `T-31`
respectively rather than getting standalone tasks — both are small and touch files those tasks already
open.

## Notes

- **`T-01` gates real verification.** Until `npm` exists, tasks can only be checked by reading and by
  `node` scripts. Phase 3 is safe under that constraint (pure data, script-verifiable); Phases 4–7 are
  not, and should not merge unverified.
- **`T-23` is the highest-risk task.** Its own three-phase migration (adapt existing tables → switch
  the caller → flatten) should probably be three commits on one branch.
- Findings are struck from the reports as tasks merge, so the reports shrink monotonically toward
  empty. That shrinkage is the completion signal for `T-35`.

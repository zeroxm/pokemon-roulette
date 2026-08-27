# Remediation worklist

Working list for clearing every finding in
[thermo-nuclear-review.md](thermo-nuclear-review.md) (`SEC-nn`) and
[thermo-nuclear-code-quality-review.md](thermo-nuclear-code-quality-review.md) (`CQ-nn`).

## Process

Each task: local branch → implement → verify → merge to `main` locally → tick here → **delete the
covered findings from the report files**. When both reports are empty they get deleted, and only then
does anything push to the remote.

```bash
git switch -c task/T-09-gen9-badge-keys
# implement + verify
git switch main && git merge --no-ff task/T-09-gen9-badge-keys
git branch -d task/T-09-gen9-badge-keys
```

Branch naming: `task/T-nn-short-slug`. Merges use `--no-ff` so each task stays a visible unit in
history and can be reverted whole.

## Ordering rationale

Structural work comes before the correctness fixes it subsumes — patching `revertMegaForms` by hand
(`SEC-02`) means writing code that `T-20` then deletes. The exceptions are `T-03` (`SEC-01`), a
reachable full-UI soft-lock worth fixing immediately, and the pure-data tasks, which are independent
of everything.

`T-01` comes first because without it nothing can be verified at all.

---

## Status

**2 / 36 complete.** Findings cleared: 1 of 46 `SEC` · 0 of 26 `CQ`.

### Verified baseline — commit `4f14d63`, 2026-08-27

| Check | Result |
| --- | --- |
| `npm ci` | 996 packages, exit 0 |
| `npm run build` | **pass** (1.47 MB initial, 3.9 s) |
| `npm test -- --watch=false --browsers=ChromeHeadless` | **230 / 230 pass** |

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
| T-02 | Enable `noUnusedLocals` + `noUnusedParameters`; let the compiler list the dead code | `CQ-21` | low | [ ] |
| **Phase 1 — urgent standalone bug** ||||
| T-03 | Guard the wheel spin: disable until translations ready, single-array spin math, `finally` resets `wheelSpinning` | `SEC-01` | med | [ ] |
| **Phase 2 — mechanical deletions** ||||
| T-04 | Delete 6 dead methods + 3 orphan JSON form files | `CQ-19`, `SEC-30n` | low | [ ] |
| T-05 | Delete `DarkModeService`, `DarkModeToggleComponent`, 13 dead injections, legacy CSS | `CQ-05`, `SEC-19` | low | [ ] |
| T-06 | Declare `@angular/localize`; drop 3 unused deps | `CQ-20`, `SEC-30p` | low | [ ] |
| T-07 | Delete `GENERATION_GAME_CONFIG` and the `initializeStates` params | `CQ-22` | low | [ ] |
| T-08 | Fix the no-op `Array.isArray` ternary in 3 battle roulettes (decide intended behaviour) | `CQ-19` | low | [ ] |
| **Phase 3 — data and i18n (no build needed)** ||||
| T-09 | Add the 8 missing gen-9 badge keys to all six locales | `SEC-16` | low | [x] |
| T-10 | Add `pokemon.unknown` to all six locales | `SEC-17` | low | [ ] |
| T-11 | Repopulate the gen-8 fishing table; remove the duplicate id | `SEC-13` | low | [ ] |
| T-12 | Replace the 404 scaffold with real translated content | `SEC-18` | low | [ ] |
| T-13 | Remove the two English literals (`Multitask x`, `Empty`); add keys | `SEC-22`, `SEC-23` | low | [ ] |
| T-14 | Apply the existing language whitelist before `translate.use()` | `SEC-27` | low | [ ] |
| T-15 | Pass the real `EventSource` from check-evolution instead of hardcoded `gym-battle` | `SEC-30l` | low | [ ] |
| T-16 | Delete the orphan i18n key `…elite.prep.actions.catchPokemon` from six locales | report note | low | [ ] |
| **Phase 4 — container decomposition** ||||
| T-17 | Extract the 6 inline `ng-template` modals into components | `CQ-07`, `CQ-18` (partial) | med | [ ] |
| T-18 | Add `setNextStates(...)`; collapse the 7 reverse-push pairs | `CQ-11` | low | [ ] |
| T-19 | Add `showModalThenContinue`; fold the 12 repeated modal option literals | `CQ-12` | med | [ ] |
| T-20 | Consolation-prize `Record<EventSource, …>` table + outcome-based test rewrite | `CQ-06`, `CQ-25` | med | [ ] |
| T-21 | `PendingSelection<T>` continuations — delete `megaSelectionMode`, both mega dispatchers, 3 marker states, add `@default` arm | `CQ-01`, `SEC-06`, `SEC-26` | high | [ ] |
| T-22 | `RunModifiers` into `GameStateService`, reset in `resetGameState()` + regression test | `CQ-03`, `SEC-04`, `SEC-07`, `SEC-30d` | high | [ ] |
| **Phase 5 — form subsystem** ||||
| T-23 | `FormRule` model + `FormRuleService`; 3-phase migration | `CQ-02`, `SEC-02`, `SEC-03`, `SEC-05`, `SEC-08` | high | [ ] |
| T-24 | Move the mega stone onto the form; delete `_baseIdToStoneName`; resolve Greninja | `CQ-10`, `SEC-30a` | med | [ ] |
| **Phase 6 — infra restructures** ||||
| T-25 | `SoundFxService` → one `Map<SoundFxName, SoundFxClip>`; update 8 call sites | `CQ-04`, `SEC-20`, `SEC-21` | med | [ ] |
| T-26 | Extract `weighted-random.ts` + `SpinAnimation`; fix dead `totalWeight`, per-spin `duration`, double-translate, `ngOnDestroy`, resize redraw, font clamp | `CQ-13`, `SEC-10`, `SEC-11`, `SEC-12`, `SEC-30c`, `SEC-30k` | med | [ ] |
| T-27 | Collapse the 5 group-A pool roulettes into `pokemon-pool-roulette` | `CQ-08` | med | [ ] |
| T-28 | Pull `buildVictoryOdds` + `resolveSplitTrainer` into the battle base | `CQ-09`, `SEC-30b` | med | [ ] |
| **Phase 7 — remaining correctness** ||||
| T-29 | Sprite resilience: error handler on `loadPokemonSpriteIfMissing`, shared `(error)` fallback, pin sprite URLs to a SHA | `SEC-09`, `SEC-14` | med | [ ] |
| T-30 | `ModalQueueService` unhandled rejection; route champion/rival modals through the queue | `SEC-24`, `SEC-25` | low | [ ] |
| T-31 | Guard `evolvePokemon` zero-evolutions; fix `resetGameAction` ordering; emit on `finishCurrentState` underflow | `SEC-28`, `SEC-30e`, `SEC-30f`, `CQ-23` | low | [ ] |
| T-32 | Type/contract cleanups: `BadgesService` return type, `getItems()` copy, `WheelItem.weight` optional, `getGameState()`, `stolenPokemon`, `structuredClone` note | `CQ-15`, `CQ-16`, `CQ-17`, `CQ-18`, `SEC-30i` | med | [ ] |
| T-33 | Defensive-parse cleanups: pokédex entry shapes, settings field types, `getTrainerSprite` guard, `distinctUntilChanged` no-op, `replaceForEvolution` warn | `SEC-30g`, `SEC-30h`, `SEC-30j`, `SEC-30m`, `SEC-30q` | low | [ ] |
| **Phase 8 — tests, config, teardown** ||||
| T-34 | Specs for `ModalQueueService` + `SettingsService`; karma `src/assets`; `implements` on 2 roulettes | `SEC-29`, `CQ-14`, `CQ-24`, `CQ-26` | low | [ ] |
| T-35 | Dependency vulnerabilities + bundle/CSS budgets; CI audit step — see below | `SEC-15`, `SEC-30o` + baseline obs. | med | [ ] |
| T-36 | UAT pass against `docs/CHANGELOG.md`; delete `docs/` audit reports, changelog and this file; push `main` to remote | — | — | [ ] |

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

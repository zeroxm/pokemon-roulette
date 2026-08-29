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

**36 / 37 complete.** Findings cleared: **45 of 46 `SEC`** · **26 of 26 `CQ`**. Only `SEC-14` remains, and it is a decision for the maintainer.

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
| T-26 | Extract `weighted-random.ts` + `SpinAnimation`; per-spin `duration`, double-translate, `ngOnDestroy`, resize redraw | `CQ-13`, `SEC-11`, `SEC-12`, `SEC-30c`, `SEC-30k` | med | [x] |
| T-27 | Collapse the 5 group-A pool roulettes into `pokemon-pool-roulette` | `CQ-08` | med | [x] |
| T-28 | Pull `buildVictoryOdds` + `resolveSplitTrainer` up; guard `plusModifiers` | `CQ-09`, `SEC-30b` | med | [x] |
| **Phase 7 — remaining correctness** ||||
| T-29 | Sprite resilience: error handler + app-wide image fallback. `SEC-14` pinning left as a decision | `SEC-09`, `SEC-14` (partial) | med | [x] |
| T-30 | `ModalQueueService` unhandled rejection; route champion/rival modals through the queue | `SEC-24`, `SEC-25` | low | [x] |
| T-31 | Guard `evolvePokemon` zero-evolutions; emit on `finishCurrentState` underflow | `SEC-28`, `SEC-30e`, `CQ-23` | low | [x] |
| T-32 | Type/contract cleanups: `BadgesService` return type, `getItems()` copy, `getGameState()` removed | `CQ-15`, `CQ-16`, `CQ-18`, `SEC-30i` | med | [x] |
| T-33 | Defensive-parse cleanups: settings field types, `getTrainerSprite` guard, `distinctUntilChanged` no-op, `replaceForEvolution` warn | `SEC-30g`, `SEC-30h`, `SEC-30j`, `SEC-30m`, `SEC-30q` | low | [x] |
| **Phase 8 — tests, config, teardown** ||||
| T-34 | Specs for `ModalQueueService`; karma `src/assets`; `WheelItem.weight` optional; `finishCurrentState` clarity | `SEC-29`, `CQ-14`, `CQ-17`, `CQ-26` | low | [x] |
| T-35 | Angular patched to 21.2.22 (0 production advisories); budgets set honestly; CI audit gate | `SEC-15`, `SEC-30o` + baseline obs. | med | [x] |
| T-36 | Audit reports deleted; `CLAUDE.md` updated; PR marked ready | — | — | [x] |
| T-38 | Toolchain upgrade: Angular 22, ng-bootstrap 21, ngx-translate 18, TS 6.0; `@angular-devkit/build-angular` removed — **0 vulnerabilities including dev deps** | post-campaign request | high | [x] |
| T-39 | **UAT fix:** mega evolution fired on battle entry for merely holding the stone — a T-23 regression; `trigger` axis added to the rule table | UAT finding | high | [x] |
| T-40 | **New behaviour:** Mimikyu's Disguise as a last-resort retry; `pokemon-forms-gigantamax.json` restored as a reference | UAT request | high | [x] |
| T-41 | **UAT bugs:** mega X/Y always produced X (T-23 regression); item slot 6 rendered slot 5's sprite (pre-existing) | UAT findings | high | [x] |
| T-37 | **Yours:** run the UAT in `CHANGELOG.md`, then merge PR #42 and delete these two docs | `SEC-14` decision | — | [ ] |

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

### T-38 — toolchain upgrade to zero vulnerabilities

Asked for after the campaign closed: "did we address the node install vulnerabilities... you can
update everything, including angular, just as long it still works."

`T-35` had already cleared production advisories. The 7 that remained were dev-only and all
reachable through **one** package — `@angular-devkit/build-angular`, which carries the legacy
webpack stack (`webpack-dev-server` → `sockjs` → `uuid`, `less` → `image-size`). Since every
builder in use has a native equivalent in `@angular/build`, the fix was to drop webpack rather
than bump it: **7 → 0 advisories, 403 packages removed.** The unused `extract-i18n` target went
with it (this app translates via ngx-translate; there is not one `i18n` attribute in the source).

Then the majors: Angular 21 → 22 (`ng update`), ng-bootstrap 20 → 21 (forced into the same
commit — v20 pins the Angular 21 peer range), ngx-translate 17 → 18, ng-icons 33 → 35,
TypeScript 5.9 → 6.0.

**Three v22 breaking changes, two of which stay opted out.** `ChangeDetectionStrategy.Eager` is
now declared on all 60 components because v22 makes OnPush the default and this app mutates
component fields directly throughout the game loop; `provideHttpClient(withXhr())` keeps the old
transport. Both preserve current behaviour and are not cleanup targets. The third — the
`$safeNavigationMigration()` wrappers and the two tsconfig diagnostic suppressions — was
scaffolding and was removed after checking all 8 sites; one of them fed an input already declared
`| undefined`, so the wrapper had been forcing the wrong type.

**The finding worth remembering.** ngx-translate 18 moved the HTTP loader's paths into
`provideTranslateHttpLoader({prefix, suffix})`. The old shape parses as `resources: []`, and the
loader short-circuits an empty request list to `of({})`. The result was an app that booted, ran,
logged nothing, and rendered every string as its raw translation key — **with all 299 specs
passing**. It was caught by loading the page in a browser, not by the suite. `app.config.spec.ts`
now asserts the loader by the request it issues rather than by its configuration, and is
mutation-checked against the broken wiring. 299 → 301 tests.

**Two packages deliberately held back**, both documented in `CLAUDE.md`: `jasmine-core` stays on 6
(v7 seals the global test functions, so zone.js's `patchJasmine` cannot wrap `describe` and the
suite dies at load; `@types/jasmine` has no v7 either), and `typescript` stays on 6.0 (Angular's
compiler-cli peers `>=6.0 <6.1`).

Verified: build 1.50 MB with no budget breached, 301/301 tests, `npm audit` clean **with dev
dependencies included**, i18n parity across all six locales, and a browser session confirming
translations load, the state machine advances and the console stays clean.

### T-39 — mega evolution fired automatically (regression from T-23)

Found by playing, during UAT: reaching a battle with a Pokémon whose mega stone the player held
mega-evolved it immediately, with no tap.

**This was mine.** The pre-campaign `applyMegaForms` opened with
`if (this.megaBattleBaseId === null) return false;`, and `megaBattleBaseId` is set only by
`activateMegaEvolutionForPokemon` — the tap path. T-23 moved the mechanic into the rule table and
lost that gate: the `item-gated` rule says the target is "the form whose stone you hold", and
`applyAll` treated that as permission to apply it. Holding a stone became enough.

Worth noting how it slipped through. T-23's safety net was the 11 pre-existing form specs, and they
passed — but five of them *applied the mega form through `applyAll`*, so they were asserting the
regression rather than catching it. A test that reaches the behaviour by a path the game never uses
proves nothing about the game.

The fix separates two questions the model had merged: *which* form a rule picks (`selection`) and
*what makes it fire* (new `trigger: 'battle-start' | 'manual'`). Mega is `manual`; `applyAll` skips
it; `forceApply` and revert are untouched. A `selection.kind === 'item-gated'` check inside
`applyAll` would have fixed the symptom and left the confusion in place for the next rule.

Tests: the five misrouted specs now go through `forceApply`, plus four new ones covering both
directions — no mega on battle entry while holding the stone, an active mega undisturbed by a later
battle-start pass, other Pokémon still transforming normally, and revert still working.
Mutation-checked: removing the guard fails two of them. 301 → 305.

### T-40 — Mimikyu's Disguise, and the restored Gigantamax reference

Asked for during UAT, revisiting T-04's deletions: the Gigantamax table was wanted back as a
reference for future forms, and `mimikyu-forms` was wanted back as an actual mechanic.

`pokemon-forms-gigantamax.json` is restored verbatim from before T-04. Nothing imports it yet, which
is exactly what it was — a reference. `pikachu-forms.json` stays deleted; it was not asked for.

**The mechanic.** When a battle spin is lost, the retry ladder was: spend a potion, else lose. It is
now: spend a potion, else bust Mimikyu's Disguise, else lose. Busting grants `retries = 1` — the same
as a plain Potion — and shows a modal explaining what happened. It fires in all three battle types
because the ladder lives in `BaseBattleRouletteComponent`.

**Three deliberate choices.**

- **Sticky, not temporary.** `mimikyuForms` enters the rule table as `persistence: 'sticky'`, so
  `revertAll` leaves it alone and the busted sprite survives to the end of the run. It is also
  `trigger: 'manual'` (the axis added in T-39) because a *defeat* fires it, not entering a battle.
- **`power` is identical in both forms.** `carryOver` takes `power` from the target form, so a
  different value would silently shift the win/lose odds the moment the disguise broke. A free retry
  should not double as a stat change.
- **Once per battle, and repaired at the end of it.** The rule is `temporary`, so `revertAll` puts
  the disguise back on the way out, and the next battle gets a fresh one. The limit is a component
  field on `BaseBattleRouletteComponent`, not a run modifier: the container renders battle roulettes
  from an `@switch`, so leaving the state destroys the component and the flag with it. Tracking it
  apart from the Pokémon's own form is what stops a second Mimikyu caught mid-battle from buying a
  second retry in the same fight.

Three follow-up fixes came out of playing it, each one a gap the tests had left:

- **The retry banner threw.** All three battle templates rendered it as `currentItem.text`, and
  `currentItem` is set only by `usePotion` — so any other source of retries made the condition true
  while the field was undefined, and the view threw on every change-detection pass. Every disguise
  test asserted state and never rendered. Two tests now call `detectChanges()` and read
  `.respin-reason`.
- **The busted sprite never appeared.** Form tables leave `sprite: null` and let the runtime fetch
  the artwork, but PokéAPI returns a literal `null` official-artwork for 10143 — the request
  succeeded and produced no image. The busted form now hard-links the HOME sprites, `carryOver`
  keeps a sprite the target form declares instead of unconditionally nulling it, and a test asserts
  no HTTP call happens on a bust.
- **Revert now restores the recorded original** rather than the flat table form, so the disguised
  sprite resolved before the battle is reused and any power gained since survives the round trip.
  That also fixes the same loss for Palafin, whose rare-candy gains were being reset to the table
  value on every battle exit.

Tests: five on the rule itself (no bust on battle entry, busts on request, survives revert, keeps
shiny, leaves power alone) and six at the battle level (retry granted, potions still take priority,
no Mimikyu loses normally, no second rescue from the same Mimikyu, none from a new one, available
again after a restart). 305 → 316. Six locales gained `pokemon.mimikyu-busted` and the modal copy;
2,204 → 2,207 keys, parity verified.

### T-41 — two bugs found by playing

**Mega X/Y always produced X — my regression, from T-23.** The pre-campaign
`resolveMegaStoneForBattle` gave the tapped stone priority (`if (this.megaBattleStoneName &&
this.hasItem(...)) return it`). Migrating to the rule table replaced that with
`heldItems = [stoneName, ...heldItemNames()]`, and the rule picks with
`forms.find(form => heldItems.includes(form.stone))` — which scans **its own forms in order**, not
the list it is handed. So with both stones in the bag, Charizard's `forms[0]` (Mega X) won whichever
stone was tapped. Putting a value first in an array does not make it win a `find` over a different
array; the comment above the line claimed "offer only that one" while the code offered all of them.
Now it really does offer only the tapped stone, guarded by `hasItem` exactly as the old code was.

Worth noting the animation was *right* the whole time — `resolveMegaEvolutionPokemonId` indexes by
stone — so the modal showed Mega Y while the team got Mega X. Two code paths answering the same
question, which is what T-24 set out to remove and did not finish.

**Item slot 6 showed slot 5's sprite — pre-existing, present on `main`.** The bag was twelve
hand-written copies of the same block and one of them read `getItemSprite(5)` for slot 6. At six
slots per row that is the first slot of the second row, so an empty slot wore the previous item's
sprite and a mega stone could appear as a potion — the tooltip and the click target were correct,
only the image lied. The grid is now a single `@for` over a slot range, which makes that class of
typo unrepresentable, and two tests assert every slot renders its own sprite. The `cursor-pointer`
class on only the first three slots was preserved as `[class.cursor-pointer]="slot < 3"` rather than
silently normalised: it looks like an oversight, but it is a visual change and not this task's call.

Both fixes mutation-checked. 321 → 326.

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

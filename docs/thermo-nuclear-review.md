# Thermo-Nuclear Review — correctness, bugs, security

Generated **2026-08-27** · commit **`a00ea99`** · scope: **whole codebase** (no branch diff)

## Summary

**2 High · 8 Medium · 18 Low** (7 detailed as `SEC-20`–`SEC-29`, 14 tabulated under `SEC-30`).
Three reviewers audited the codebase in parallel across game-flow
core, domain services, and presentation/infra. Findings below are deduplicated, and every cited
`file:line` was independently re-verified against the source before inclusion.

Three themes dominate:

1. **Nothing resets on restart** — **half cleared by `T-22`**: run-scoped rules moved to
   `GameStateService` and transient container state is now wiped on `game-start`. What remains is
   `TrainerService`'s mega-battle bookkeeping (`SEC-05`), which `T-23` subsumes.
2. **Battle form apply/revert is not transactional.** `syncBattleForms` reacts to *every* state
   emission rather than tracking battle entry/exit, so any interrupt mid-battle double-applies sticky
   forms and cancels an active mega. A mega-evolved Pokémon moved to the PC mid-battle is stranded
   permanently *and* disables mega evolution for the rest of the run.
3. ~~The wheel has no failure envelope~~ — **cleared by `T-03`**: the spin is gated on translations
   being ready, reads a single array, and releases `wheelSpinning` on any throw. Six regression tests
   added, verified to fail against the pre-fix component.

**Security specifically: the app is clean.** Zero hits for `innerHTML`, `bypassSecurityTrust*`,
`eval`, or `document.write` across `src/`. All sprite URLs originate from static local tables or
PokéAPI ids and pass through Angular's URL sanitizer. No secrets in the bundle beyond the public GA
id. The `localStorage` parsers lack schema validation but cannot reach `Object.prototype` (object
spread copies `__proto__` as an own data property). The findings here are **correctness and
availability** problems, not vulnerabilities. The one item with a security flavour, an
unvalidated language key reaching a fetch URL, was cleared by `T-14`.

~~**i18n gaps**~~ — **cleared by `T-09` and the `T-10`–`T-16` batch.** All six locale files carry
exactly **2,200 keys** with zero divergence; the missing keys are authored and the two English
literals now resolve through the pipe.

---

## Provenance and limitations

- The `thermo-nuclear-review` skill is gated to explicit user invocation and refused to load inside
  the subagents, so all three ran under **the rubric's own stated fallback** (its item 2: act as a
  diff-scoped reviewer with the same rigor). Same standards, reached via the fallback path.
- The skill is normally diff-scoped. `main` was clean with no diff against `origin/main`, so
  reviewers were explicitly instructed to treat all of `src/` as the change under review.
- **Nothing was executed.** `npm` is not installed on this machine and `node_modules/` is absent, so
  the build and test suite could not run. Every finding is static analysis. No claim is made about
  any test passing or failing. Standalone `node` scripts *were* used to verify data-table integrity,
  the i18n key graph, and the odds math.
- No PR exists, so the rubric's PR-discussion / BugBot step was skipped.
- Findings marked **latent** are real defects with no currently reachable trigger. They are reported
  because the guard that makes them unreachable is incidental, not designed.

---

# High

### SEC-02 — A mega-evolved Pokémon moved to the PC mid-battle is stranded forever and permanently disables mega evolution
- **Severity:** High
- **Location:** `src/app/services/trainer-service/trainer.service.ts:413-446`
- **Status:** [ ] open

**What:** `revertMegaForms()` iterates **`this.trainerTeam` only** (line 426), `break`s after the
first match (line 437), and clears `megaBattleBaseId` / `megaBattleStoneName` /
`megaBattleOriginalPokemon` **only inside `if (reverted)`** (lines 440-444). By contrast
`revertBattleForms()` correctly sweeps team *and* `storedPokemon` (lines 379-380); the mega path gets
no storage pass. The PC is open during battles — `storage-pc.component.ts:77-99` blocks only on
`wheelSpinning` and only during `team-rocket-encounter`.

**Failure scenario:** Team has Charizard (id 6) + Charizardite X. Enter `gym-battle`, tap the stone →
slot 0 becomes id 10034 and the base is snapshotted. Before finishing, drag Mega Charizard X into the
PC. On battle exit `revertMegaForms()` finds no team member with base id 6 → `reverted === false` →
returns without clearing state. Two permanent consequences:

1. **Mega Charizard X stays in storage forever.** No other path reverts it —
   `replaceTemporaryForms` handles only Palafin, `applyStickyFormsToCollection` only sticky forms.
   Id 10034 is not in the National Dex, so `getPokemonById(10034)` returns `undefined` and the
   stranded Pokémon is outside normal lookup entirely.
2. **`megaBattleBaseId` stays `6` forever**, so the guard at
   `roulette-container.component.ts:798` (`if (getMegaBattleBaseId() !== null) return;`) rejects
   **every** future mega-stone activation for the rest of the run, for any Pokémon. The feature dies
   silently with no user-visible reason.

**Suggested fix:** Scan `trainerTeam` **and** `storedPokemon`; drop the `break` so every matching mega
form reverts; clear the three `megaBattle*` fields **unconditionally** at battle exit. They are
battle-scoped bookkeeping — leaving them set on a missed revert is what converts a cosmetic miss into
a permanent feature outage.

---

### SEC-03 — Using a Rare Candy during a battle reverts battle forms mid-battle, double-toggling sticky forms and cancelling an active mega
- **Severity:** High
- **Location:** `src/app/services/trainer-service/trainer.service.ts:165-172`
- **Status:** [ ] open

**What:** `syncBattleForms` applies forms on any battle state and **reverts on every other state**,
with no notion of "still inside a battle". The Rare Candy interrupt is gated only on `wheelSpinning`
(`main-game.component.ts:73-79`), not on battle state — unlike the mega stone path, which does
re-check `isBattleState` at `roulette-container.component.ts:786-788`.

**Failure scenario:** Rare candy during a gym battle → `handleRareCandyEvolution`
(`roulette-container.component.ts:164-171`) calls `repeatCurrentState()` then `chooseWhoWillEvolve`,
pushing `evolve-pokemon` + `select-from-pokemon-list`. Pop order is `select-from-pokemon-list` →
`evolve-pokemon` → `gym-battle`, so `select-from-pokemon-list` is emitted **while the battle is still
in progress**:

1. `syncBattleForms('select-from-pokemon-list')` → `revertBattleForms()` → the active mega is
   reverted and `megaBattleBaseId` nulled. The mega vanishes mid-battle and `calcVictoryOdds()`
   (`base-battle-roulette.component.ts:41-44`) silently drops the odds.
2. When `gym-battle` is popped again, `applyBattleForms()` runs a **second** time.
   `applyStickyFormsToCollection` (lines 472-503) is a *toggle*, not an idempotent set: Aegislash goes
   Shield → Blade → **Shield**, never reaching Blade for that battle. Ogerpon (`mode: 'random'`,
   line 490) re-rolls a second mask.

The sticky-form damage is **not transient** — `revertBattleForms` deliberately does not revert sticky
forms (line 376), so the team ends the run in a form the game believes it toggled once but toggled
twice.

**Suggested fix:** Track battle *entry/exit* with a `battleFormsApplied` flag — apply only on a
false→true transition, revert only on true→false. That also makes apply idempotent, the invariant
`applyStickyFormsToCollection` currently violates. Separately, gate the Rare Candy interrupt on
`isBattleState(currentGameState)` as the mega stone path already does.

---

### SEC-05 — `resetGame()` does not clear mega-battle state, leaking it into the next run
- **Severity:** Medium
- **Location:** `src/app/services/trainer-service/trainer.service.ts:346-350`
- **Status:** [ ] open

**Found independently by two reviewers** — weight accordingly.

**What:** `resetTeam()` clears the arrays but leaves `megaBattleBaseId`, `megaBattleStoneName`, and
`megaBattleOriginalPokemon` (declared lines 60-62) untouched. There is no `resetMegaBattleState`.

**Failure scenario:** Player mega-evolves in gym 3, then restarts mid-battle. `megaBattleBaseId`
survives. In the new run, the guard at `roulette-container.component.ts:798` sees a non-null base id
and refuses the very first mega stone the player earns.

Same failure mode as `SEC-02` but reached by a far more ordinary action. Rated Medium rather than High
only because `resetItems()` clears the stones, so `resolveMegaStoneForBattle` returns `null` and no
*incorrect* form is applied — the damage is confined to the blocked-activation guard.

**Suggested fix:** Add `resetMegaBattleState()` nulling all three fields; call it from `resetTeam()`.

---

### SEC-08 — Mega revert restores a stale snapshot, discarding in-battle changes
- **Severity:** Medium
- **Location:** `src/app/services/trainer-service/trainer.service.ts:404, 431-434`
- **Status:** [ ] open

**What:** Apply snapshots `structuredClone(trainerTeam[index])`; revert restores that clone, carrying
forward only `shiny` (line 432) and forcing `sprite = null` (line 433).

**Failure scenario:** Any in-battle mutation of that slot is lost. `makeShiny()` survives via line 432,
but `power`, `type1`/`type2`, and a resolved `sprite` do not. The forced `sprite = null` also triggers
a redundant PokéAPI round-trip on every apply *and* revert (lines 408, 434, 496, 534) for a sprite the
app already had.

**Suggested fix:** Store the base **id** and re-derive from `pokemonMegaForms` / the Dex on revert; at
minimum carry the resolved `sprite` across instead of nulling it.

---

### SEC-09 — `loadPokemonSpriteIfMissing` has no error handler
- **Severity:** Medium
- **Location:** `src/app/services/trainer-service/trainer.service.ts:505-511`
- **Status:** [ ] open

**What:** `subscribe(response => …)` with **no error callback**. `getPokemonSprites`
(`pokemon.service.ts:37-50`) re-raises via `throwError` after `retry({count: 3, delay: 1000})`. This is
the **only** subscriber to `getPokemonSprites` in the codebase, so the error path is unhandled
everywhere.

**Failure scenario:** PokéAPI down or user offline. Four failed requests later RxJS delivers an error
with no handler, surfacing through Angular's `ErrorHandler`. `pokemon.sprite` stays `null` and nothing
ever retries — the Pokémon renders as a placeholder for the remainder of the run. (Whether the error
reaches `window.onerror` or is swallowed by Angular's default handler could not be confirmed without
executing; the null-sprite half is certain from the code.)

**Suggested fix:** Add an error callback that logs and leaves the placeholder; consider a one-shot
retry when the Pokédex or team is next opened.

---

### SEC-11 — Wheel goes blank after any window resize
- **Severity:** Medium
- **Location:** `src/app/wheel/wheel.component.ts:83-91`
- **Status:** [ ] open

**What:** `handleResize()` updates `wheelWidth`/`canvasHeight` then *synchronously* calls `drawWheel()`,
which reads `this.wheelCanvas.width` — still the old value. Change detection runs *after* the handler
and writes the new `[width]`/`[height]`. Assigning `canvas.width` resets the drawing context and
clears everything just painted. Nothing redraws afterwards.

**Failure scenario:** On mobile, scrolling collapses the URL bar → `resize` fires → the wheel
disappears entirely and stays blank until the next spin. Desktop resize and orientation change do the
same.

**Suggested fix:** Set `wheelCanvas.width/height` imperatively in `handleResize()` before drawing, or
defer the redraw via `queueMicrotask` / `afterNextRender`.

---

### SEC-12 — `WheelComponent` has no `ngOnDestroy`
- **Severity:** Medium
- **Location:** `src/app/wheel/wheel.component.ts:21, 303, 317`
- **Status:** [ ] open

**What:** The class implements only `AfterViewInit, OnChanges`. `animate()` re-schedules itself via
`requestAnimationFrame` with no destroyed-check, and the container's `@switch` destroys the roulette —
and its `<app-wheel>` — on every state transition.

**Failure scenario:** A transition landing mid-spin leaves the loop running on a detached canvas, still
firing click SFX (line 328), then emitting `selectedItemEvent` (line 320) from a dead component. This
is also a second route to a stuck `wheelSpinning`: `setWheelSpinning(false)` at line 321 is the only
thing that clears it, and nothing guarantees it runs.

**Suggested fix:** Implement `OnDestroy`, cancel the stored rAF id, and clear `setWheelSpinning(false)`.

---

### SEC-14 — 2,401 sprite URLs pinned to a moving branch on a non-CDN host, with one error handler app-wide
- **Severity:** Medium
- **Location:** throughout the data tables, e.g. `src/app/services/badges-service/badges-data.ts`, `gym-battle-roulette.component.ts:49`
- **Status:** [ ] open

**What:** 2,401 references to
`https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/…`, plus 12 to
`archives.bulbagarden.net`. The only `(error)` handler in the entire app is
`pokedex-detail-modal.component.html:14`.

**Why it matters:** `raw.githubusercontent.com` is a source-fetch endpoint with unauthenticated
per-IP rate limits, not a CDN with an availability SLA, and `refs/heads/master` is a moving target.
Failure modes, all silent: a user behind corporate NAT hits 429 and gets broken images game-wide;
PokéAPI renames the default branch and *every* sprite breaks at once; a flaky connection produces a
game full of alt text.

**Suggested fix:** At minimum a shared `(error)` handler swapping in `place-holder-pixel.png`. Better:
pin a commit SHA instead of `refs/heads/master`, and consider vendoring the sprites into `public/`.

---

### SEC-15 — `mega-evolution-animation-modal.component.css` is at ~90% of the build-breaking budget
- **Severity:** Medium
- **Location:** `src/app/main-game/roulette-container/roulettes/mega-evolution-animation-modal/mega-evolution-animation-modal.component.css`
- **Status:** [ ] open

**What:** `angular.json:45-49` sets `anyComponentStyle` `maximumWarning: 4kB`, `maximumError: 10kB`,
and `defaultConfiguration: "production"` (line 65) means CI's `npm run build` enforces it. The file is
10,954 raw bytes, ~9.0 kB minified — under the error but 2.25× the warning and roughly 1 kB from
failing the build outright.

**Why it matters:** The next feature added to that stylesheet blocks both CI and `npm run deploy` with
a budget error rather than an obvious cause.

**Suggested fix:** Split the animation styles (move keyframes into `src/styles.css` or a sibling
component), or raise the budget deliberately.

---

# Low

### SEC-20 — `SoundFxService` has create-with-no-dispose
- **Severity:** Low · **Location:** `src/app/services/sound-fx-service/sound-fx.service.ts:21, 85`

`sourceByHandle` is written by `createSoundFx` and never read for deletion — there is no dispose API.
`WheelComponent`'s constructor mints a handle per instance and the wheel is recreated on every state;
`StoragePcComponent` mints three. Entries are small strings, so this is slow unbounded growth rather
than a crash. The other three maps *do* self-clean, and `decodedBufferCache` is keyed by `src` so it
is bounded at 7. **Fix:** add `disposeSoundFx(handle)`, call from `ngOnDestroy`.

### SEC-21 — `playSoundFxQueue` can await forever
- **Severity:** Low · **Location:** `src/app/services/sound-fx-service/sound-fx.service.ts:170`

Awaits `pendingEnded.promise`, resolved only via `source.onended`. If the tab is backgrounded Chrome
suspends the `AudioContext` and `onended` may never fire; the listener stays registered and the queue
never advances. Caller: `roulette-container.component.ts:815`. **Fix:** timeout or `visibilitychange`
bail-out.

### SEC-24 — `ModalQueueService` produces an unhandled rejection per dismissed modal
- **Severity:** Low · **Location:** `src/app/services/modal-queue-service/modal-queue.service.ts:26`

`modalRef.result.finally(...)` returns a *new* promise that adopts the rejection when the modal is
dismissed (backdrop, Esc, X). Nothing handles it, so every dismissal logs an uncaught rejection.
`open()` returns `scheduledOpen` (line 42) with no caller attaching `.catch`. **Fix:** `.catch(() => {})`
on the tracking chain. *The `dismissAll()` desync concern was traced and is sound* — `activeModal` is
nulled at line 47 and the queue's `.then(ok, () => undefined)` absorbs the rejection.

### SEC-25 — Two roulettes bypass `ModalQueueService`
- **Severity:** Low · **Location:** `champion-battle-roulette.component.ts:59,71`, `rival-battle-roulette.component.ts:60`

Both open game-flow modals through raw `NgbModal` while gym and elite-four use the queue. CLAUDE.md
states the queue is preferred for anything game flow triggers; modals opened outside it are invisible
to it and can be stacked on by a queued open.

### SEC-28 — `evolvePokemon` treats "zero evolutions" as "many", pushing an empty wheel
- **Severity:** Low (**latent**) · **Location:** `src/app/main-game/roulette-container/roulette-container.component.ts:903-913, 989-997`

Branches on `length === 1` vs. else. If `getEvolutions()` returns `[]`, `auxPokemonList` is empty and
`select-from-pokemon-list` is pushed → a zero-item wheel. `canEvolve` only checks the chain key exists
(`evolution.service.ts:20-22`) while `getEvolutions` drops unresolvable targets, so the two can
disagree in principle. All 484 `evolutionChain` entries were checked against the Dex and forms tables —
**every target resolves today**, so this is unreachable now.

**Severity reduced by `T-03`.** This originally inherited the permanent soft-lock from the old
`spinWheel`. The wheel now refuses to spin when it has nothing to spin, so the consequence is a
non-spinnable wheel and a stalled game state rather than a bricked UI — recoverable by restarting
instead of only by reload.

**Fix:** guard `if (length === 0) return this.finishCurrentState();` in both methods.

### SEC-29 — Karma config omits `src/assets`, making the real translation path untestable
- **Severity:** Low · **Location:** `angular.json:91-96`

The `test` target's `assets` includes only `public`. The i18n JSON is unavailable to Karma, so specs
use `TranslateModule.forRoot()` with no loader, and the real asynchronous translation path cannot be
exercised as configured. `T-03` covered the readiness gate with a synchronous stand-in, but the
async-loader case is still untested.

### SEC-30 — Remaining low-severity items
- **Severity:** Low

| # | Finding | Location |
| --- | --- | --- |
| a | Greninja declares 3 mega forms but has 1 stone; `getMegaFormForStone` pairs by index so 2 are permanently unreachable. The **only** length mismatch across all 92 mega bases. | `pokemon-mega-forms.ts` base `658` |
| b | `plusModifiers` divides by `trainerTeam.length` → `NaN` on an empty team; consuming loops use `i < NaN` so the X-Attack bonus is silently dropped rather than crashing. Fractional means always round up. | `base-battle-roulette.component.ts:65` |
| c | `duration` is randomized once per component instance, not per spin, so every spin of a given wheel takes identical time. `totalRotations` *is* per-spin, so the intent was clearly per-spin variety. | `wheel.component.ts:41` |
| e | `finishCurrentState()` underflow returns `'game-over'` **without emitting it**, so an over-pop would silently freeze on the previous state. No live trigger found. | `game-state.service.ts:66-75` |
| g | Pokédex `localStorage` entries are not shape-validated; individual entries cast unchecked. Not a security issue (see Summary). | `pokedex.service.ts:259-272` |
| h | `distinctUntilChanged()` on `pokedex$` is a no-op — `updatePokedex` always emits a fresh object. | `pokedex.service.ts:31` |
| i | `getItems()` returns the **live** mutable array while `getTeam()`/`getStored()` return copies. `usePotion` splices it directly then calls `removeItem`, which no-ops. Works by accident; one `OnPush` component away from a real bug. | `trainer.service.ts:207` |
| j | `replaceForEvolution`/`performTrade` fail silently on an `indexOf` identity miss while the caller has already consumed the item and shows the modal. Latent. | `trainer.service.ts:174-205` |
| k | `currentSegment` is translated twice — already-translated text piped through `\| translate` again. | `wheel.component.ts:343` + `.html:2` |
| m | `getTrainerSprite` indexes `[generation][gender]` unguarded. Cannot fire today (data covers 1-9). | `trainer.service.ts:81-83` |
| o | CI has no lint step (and no lint config in the repo) and no `npm audit`. `--if-present` on the build line is a no-op. | `.github/workflows/node.js.yml:29-31` |
| q | Settings `localStorage` has no per-field type validation (`{...defaults, ...stored}`). Not prototype pollution; impact cosmetic. | `settings.service.ts:82-85` |

---

# Test coverage gaps

Test coverage is the common thread under the High findings — every one sits in an untested path.
`T-03` added the first regression tests for one of them.

- **67 spec files; 40 (60%) contain one `it()` or fewer** — i.e. pure `should create` scaffolds.
- **No spec at all** for `sound-fx.service.ts` (367 lines, four parallel maps),
  `modal-queue.service.ts`, or `base-battle-roulette.component.ts`.
- **`trainer.service.spec.ts`** covers Palafin, sticky forms, and `commitTeamAndStorage` but has
  **zero** tests for the entire mega pathway (`applyMegaForms`, `revertMegaForms`,
  `resolveMegaStoneForBattle`, `getMegaFormForStone`, `forceMegaActivation`,
  `hasActiveMegaFormInTeam`), nor for `addToTeam` overflow, `removeItem`, `performTrade`, or
  `replaceForEvolution`. `SEC-02`, `SEC-05`, and `SEC-08` would all be caught by straightforward unit
  tests here. The existing sticky-form tests drive only one battle-state transition, which is exactly
  why `SEC-03`'s double-apply is invisible.
- **`roulette-container.component.spec.ts`** (370 lines) has no coverage of the mega-stone award chain,
  the running-shoes re-spin, multitask, exp-share/`secondEvolution`, `gymBattleResult`/
  `eliteFourBattleResult` (only `championBattleResult(true)` is exercised), `teamRocketDefeated`, or
  `useEscapeRope`. `SEC-04` and `SEC-07` still live in that gap.
- **`game-state.service.spec.ts`** (71 lines) never tests `initializeStates` play order — the thing the
  service exists for. Also untested: underflow, `repeatCurrentState`, `advanceRound`/`retreatRound`,
  and `resetGameState` on a *dirtied* stack.
- **Assertions too weak to catch the findings.** The eight zero-branch tests stub
  `modalQueueService.open` and assert only which consolation *method* ran — never `altPrizeText`/
  `altPrizeSprite`/`altPrizeDescription`, so the copy could be wired to the wrong branch and every test
  would still pass. `wheel.component.spec.ts` covers distribution only and bypasses the sync path.

---

# Verified clean

Stated explicitly so these are not re-investigated:

- **XSS surface is nil.** Zero hits for `innerHTML`, `bypassSecurityTrust*`, `document.write`, or
  `eval` across `src/`. All sprite URLs come from static local tables or PokéAPI ids and pass through
  Angular's URL sanitizer. The GA snippet interpolates a build-time constant.
- **No secrets in the bundle.** The prod `fileReplacements` correctly swaps `environment.prod.ts`; its
  only value is the public GA id `G-40CS5XD7G9`.
- **Prototype pollution is not reachable.** Both `localStorage` parse sites use `JSON.parse` + object
  spread, which copies `__proto__` as an own data property rather than invoking the setter.
- **i18n locale parity is perfect** — all six files carry exactly **2,196 keys**, zero missing, zero
  extra, zero structural divergence, zero empty values, zero placeholder mismatches. One genuine
  orphan: `game.main.roulette.elite.prep.actions.catchPokemon` (the prep wheel uses
  `catchTwoPokemon`/`catchThreePokemon`), safe to delete from all six.
- **Data integrity.** National Dex: 1025 entries, no duplicate ids, all `power` values in range.
  `pokemonForms`: no duplicate variant ids, every base id present among its variants. All 484
  `evolutionChain` targets resolve — there is **no** Pokémon where `canEvolve()` is true but
  `getEvolutions()` is empty. Gym leaders 8/gen, elite four 4/gen, champion 1/gen for all nine
  generations.
- **`interleaveSortedOdds` is correct** — brute-forced over all `(big, small)` pairs for `big` ∈ [1,200]:
  zero mismatches, no `undefined` slots.
- **`AudioContext` is created lazily** inside `playSoundFx`, not at construction, so it is created under
  a user gesture with a `resume()` re-check. The autoplay concern does not apply. Mute is honored on
  every play path.
- **`ThemeService` validates the stored theme against a whitelist** and its `baseHref` handling is
  consistent with `npm run deploy --base-href=/pokemon-roulette/`.
- **Stack push ordering is correct at every multi-push site** — `chooseWhoWillEvolve`,
  `secondEvolution`, `evolvePokemon`, `tradePokemon`, `stealPokemon`, `gymBattleResult` all push in
  proper reverse order and balance push/pop counts across every traced branch.
- **All seven `EventSource` members** have a case in `chooseWhoWillEvolve`, and every one ends in a
  call that advances the state machine.
- **Subscription lifecycle in the container and `BaseBattleRouletteComponent` is sound** — all
  `takeUntilDestroyed` and manual subscriptions are released.
- **`commitTeamAndStorage` is atomic** (copies both arrays in one shot), and `addToTeam` on a full team
  overflows to uncapped storage, so nothing is ever dropped.
- **`retries` does not leak between battles** — each battle state has its own `@case`, so the component
  is destroyed and `retries` resets.
- **`TypeMatchupService`, `BadgesService`, `ItemsService`, `ItemSpriteService`, `GenerationService`,
  `RareCandyService`, `MegaStoneService`** — no findings.

---

# Noted, not a defect

`coffee.component.ts:25` embeds a Pix payload containing the maintainer's name and phone number in the
shipped bundle. That is the intended function of a donation QR code, not a leak — flagged only so it
stays a conscious choice. Separately, `pixCodeCopied` (line 28) is never reset and the `.catch` at
line 29 only logs, so a clipboard failure on an insecure origin is invisible to the user.

# Thermo-Nuclear Review — correctness, bugs, security

Generated **2026-08-27** · commit **`a00ea99`** · scope: **whole codebase** (no branch diff)

## Summary

**0 High · 2 Medium · 2 Low.** Remaining: `SEC-14` (a decision), `SEC-15` and `SEC-29`, plus one `SEC-30` item — all owned by `T-34` and `T-35`.
Three reviewers audited the codebase in parallel across game-flow
core, domain services, and presentation/infra. Findings below are deduplicated, and every cited
`file:line` was independently re-verified against the source before inclusion.

Three themes dominate:

1. ~~Nothing resets on restart~~ — **cleared by `T-22` and `T-23`**.
2. ~~Battle form apply/revert is not transactional~~ — **cleared by `T-23`**: one rule engine owns
   every form change, apply is idempotent, and revert sweeps storage.
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

### SEC-14 — Sprites are hot-linked from a moving branch on a non-CDN host
- **Severity:** Low (reduced from Medium by `T-29`)
- **Location:** throughout the data tables, e.g. `services/badges-service/badges-data.ts`
- **Status:** [ ] open — **needs a decision, not a fix**

**What:** ~2,400 references to
`https://raw.githubusercontent.com/PokeAPI/sprites/…/master/…`. That is a source-fetch endpoint with
unauthenticated per-IP rate limits, not a CDN with an availability guarantee, and `master` is a
moving target.

**Mitigated by `T-29`:** every `<img>` in the app now falls back to a local placeholder on error,
and the one sprite-fetch subscriber handles failure. A rate-limited or offline player now sees
placeholders rather than broken-image icons, and no unhandled errors.

**What remains is a judgement call**, not something to fix blind:

- **Pin to a commit SHA.** Removes the moving-branch risk, but freezes artwork — new or updated
  sprites never arrive — and touches ~2,400 lines.
- **Vendor the sprites into `public/`.** Removes the third-party dependency entirely, at the cost of
  repository size and the GitHub Pages deploy.
- **Accept it.** The failure mode is now cosmetic and self-healing on the next load.

Whichever is chosen, the base URL should first be centralised so it is one edit rather than 2,400.

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
| o | CI has no lint step (and no lint config in the repo) and no `npm audit`. `--if-present` on the build line is a no-op. | `.github/workflows/node.js.yml:29-31` |

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

# Thermo-Nuclear Code Quality Review — maintainability and structure

Generated **2026-08-27** · commit **`a00ea99`** · scope: **whole codebase** (no branch diff)

## Summary

**2 of the original 26 findings remain** (`CQ-14`, `CQ-17`, `CQ-26` — see below). Everything else is cleared. Three reviewers audited game-flow core, domain services, and presentation/infra in
parallel, independently of the correctness pass in
[thermo-nuclear-review.md](thermo-nuclear-review.md). Findings are deduplicated and every cited
`file:line` was re-verified against source.

**The codebase is in better shape than its line counts suggest.** `tsconfig.json` is already stricter
than most professional Angular projects (`strict`, `strictTemplates`, `noImplicitOverride`,
`noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`). Total CSS is
1,797 lines across the entire app. `odd-utils.ts`, `ModalQueueService`, `ThemeService`,
`PokedexService`, `TypeMatchupService`, `ItemsService` and `EvolutionService` are well-shaped and need
nothing. This is not a report about a messy codebase — it is a report about **three specific
structural knots** and a pile of mechanical dead code.

The three knots, in order of leverage:

1. ~~The state model can't carry a payload~~ — **cleared by `T-21`**: selections now carry their own
   continuation, the three marker `GameState` members are gone, and both mega dispatchers with them.
   Every remaining member has exactly one `@switch` arm, with a `@default` backstop.
2. ~~Four form-swapping mechanisms in four costumes~~ — **cleared by `T-23`**: one `FormRuleService`
   now owns every form change. `TrainerService` went 516 → 376 lines and `SEC-02`, `SEC-03` and
   `SEC-05` became unrepresentable.
3. ~~Two theming services fighting each other~~ — **cleared by `T-05`**: `DarkModeService` and the
   unreachable toggle component are deleted, along with the legacy body classes and storage key.

**Deliberate non-findings.** Reviewers were asked to argue both sides and to say plainly when
something is fine. The `@switch` template should **stay**; `TrainerService` should **not** be split
four ways; ESLint is **not** worth adding (`T-02` enabled two tsconfig flags instead); and 26 of the
31 roulette components should **not** be collapsed — `T-27` collapsed only the five that were one
table in disguise. See **Verified healthy** below for the full list with reasoning.

### Relationship to the correctness report

`CQ-02` and `CQ-03` are the structural root causes of `SEC-02`, `SEC-03` and `SEC-04`. Doing the
refactors makes those bugs *unrepresentable* rather than fixed. If you plan to address both reports,
**do these two refactors first and let the correctness fixes fall out** — patching `SEC-02`'s
`revertMegaForms` by hand means writing code that `CQ-02` then deletes.

| Quality finding | Correctness finding it structurally prevents |
| --- | --- |
| ~~`CQ-02` FormRule model~~ **done (`T-23`)** | `SEC-02` · `SEC-03` · `SEC-05` — all cleared with it |
| ~~`CQ-03` RunModifiers~~ **done (`T-22`)** | `SEC-04` · `SEC-07` — both cleared with it |
| ~~`CQ-10` stone-on-form join~~ **done (`T-24`)** | `SEC-30a` — cleared with it |
| ~~`CQ-13` extract weighted-random~~ **done (`T-26`)** | `SEC-01` was fixed earlier in `T-03` |

---

## Provenance and limitations

- The `thermo-nuclear-code-quality-review` skill is gated to explicit user invocation and refused to
  load inside the subagents, so all three ran under **the rubric's own stated fallback** (its item 2:
  a harsh maintainability audit aligned with the skill's intent — ambitious simplification, 1k-line
  rule, spaghetti and boundary rules, its priority ordering and approval bar).
- The 1k-line rule is written for a diff crossing the threshold. Reviewers applied it to the *current
  state*, judging `roulette-container.component.ts` as if the diff that created it had just landed.
  Static data tables were judged on organization only — "this National Dex file is 14k lines" is not a
  useful finding.
- **Nothing was executed.** `npm` is absent, so no build, no tests, no linter. Standalone `node` was
  used for countable claims (duplication ratios, spec statistics, dependency references).
- Reviewers were told to calibrate to a solo-maintainer hobby game and to avoid recommending heavy
  patterns (NgRx, repository layers, DI ceremony) without unmistakable payoff. None did.

---

# 1 · Structural regressions and code-judo opportunities

# 2 · Spaghetti and API-shape problems

### CQ-14 — `finishCurrentState()` reads the post-pop state under a pre-pop name
- **Location:** `roulette-container.component.ts:217-227`
- **Status:** [ ] open

`this.currentGameState` is mutated by the `ngOnInit` subscription *during* the call on line 219, so the
running-shoes condition tests the state being **entered**, not the one being finished — under a method
name saying otherwise. The `ngOnInit` handler's own running-shoes branch (`:135-137`) reads
`runningShoesUsed` *before* line 223 sets it, so `respinReason` lands one arrival late. Behaviour
depends entirely on the interleaving of a synchronous `BehaviorSubject` emission with the lines after
it.

Not claimed as a visible bug — it may produce the intended result by accident. But it is unreadable,
and any future edit near it is a coin flip. Capture `const finishedState = this.currentGameState`
before the call, or name a local `enteredState` and comment the intent. Either way, stop relying on
mutation-during-call.

---

# 3 · Type and contract cleanliness

### CQ-17 — `WheelItem.weight` leaks wheel tuning into every hand-authored data row
- **Location:** `src/app/interfaces/wheel-item.ts`
- **Status:** [ ] open

The `WheelItem` inheritance itself is **fine** and should stay — `text` is a translation key every
domain object needs anyway, `fillStyle` doubles as team-card theming, and the adapter-layer
alternative is real ceremony for a game where nearly every domain object *is* a wheel entry.

But `weight` is pure wheel-selection tuning, and it is `1` in every literal sampled across
`pokemon-mega-forms.ts`, `sticky-battle-forms.ts`, `palafin-forms.ts`, `items-data.ts` and
`generation.service.ts`. Make it `weight?: number` defaulting to `1` in the selection function. That
removes one line per entry from every data table in the project.

---

# 4 · Dead code and configuration

# 5 · Tests

### CQ-26 — 60% of the spec suite is scaffolding; three specs are worth writing
- **Status:** [ ] open

**Measured: 67 spec files, 231 `it()` blocks, and 40 files (60%) with one or fewer.** Deleting the
scaffolds is not obviously right — they catch DI-wiring breakage at near-zero cost, worth something
with 14 root services. But three are actively misleading, because the subject has real logic and the
spec asserts none of it:

- **`settings.service.spec.ts`** — `should create` only, yet `getInitialSettings` does a
  `{...defaults, ...fromStorage}` merge and `getSettingsFromStorage` has a try/catch fallback. **Worth
  testing:** a persisted blob missing a newly-added key merges to the default rather than `undefined`;
  corrupt JSON falls back without throwing. That is the forward-compat path for *every future setting*,
  completely unverified.
- **`ModalQueueService`** — **no spec at all.** 49 lines of promise-chaining whose entire purpose is
  serialising modals so results "don't stomp each other". **Worth testing:** two `open()` calls resolve
  strictly in order; a *dismissed* first modal still lets the second open — the `catch` and the
  `.then(openModal, openModal)` both exist specifically for that.
- **`wheel.component.spec.ts`** — the three fairness tests are the best in the repo but reach through
  `as any`. `CQ-13` turns them into a plain function spec with a seedable `random`.

`odd-utils.spec.ts` is the model to copy: pure function, real assertions, no TestBed.

---

# Verified healthy — do not touch

Stated explicitly so this report is not read as "everything needs work". Each was actively considered
and deliberately cleared.

- **The 309-line `@switch` template should stay.** A data-driven alternative means `NgComponentOutlet`
  plus a registry encoding each state's component, inputs and output wiring. But the 30 arms are *not*
  near-identical — they take different inputs (`[currentRound]`, `[respinReason]`, `[(fromLeader)]`,
  `[forms]`) and wire 1 to 18 outputs each. A registry would be **more** code than the template, lose
  template type-checking on every input, lose AOT-compiled output binding, and turn "which component
  handles `catch-paradox`?" into a runtime question instead of a Ctrl-F. The switch is honest and
  exhaustively greppable. Its only real problem was sharing a file with 94 lines of modal markup,
  which `T-17` removed.
- **`TrainerService` should not be split four ways.** Team, PC storage, items and badges are one
  aggregate: `addToTeam` overflows into `storedPokemon`, and `getMegaStoneEligiblePokemon` /
  `resolveMegaStoneForBattle` need team *and* items together. Badges are 30 lines. Four services buys
  cross-service coordination and buys the maintainer nothing. `CQ-02`'s form extraction is the one real
  seam; after it, `TrainerService` is ~300 lines of plain aggregate state.
- **`MegaStoneService` (18 lines) and `RareCandyService` (20) are not identity abstractions.** Each is a
  decoupled event bus letting an item component interrupt game flow without a circular dependency on
  the container — real work in 18 lines. (`ItemSpriteService` is more marginal: a static lookup wrapped
  in `of()` whose eight entries overlap with `items-data.ts`, where `sprite` is `''` for all eight —
  two halves of one table. Merging is a clean win but small; do it opportunistically.)
- **`odd-utils.ts`** — the best file in the shard. Bresenham accumulator, O(n), documents the invariant
  it guarantees, correct empty-array guards.
- **`SettingsService`'s five near-identical `toggleX()` methods** — *look* like duplication, are not
  worth collapsing. The current form is compile-checked per setting and greppable; a generic
  `toggle(key)` needs an `Extract<keyof GameSettings, boolean>` constraint to stay safe and reads worse.
- **CSS is healthy.** 1,797 lines total, 10 empty stylesheets, hex colours concentrated in `styles.css`.
  The 517-line `mega-evolution-animation-modal.component.css` is 15 `@keyframes` plus phase-scoped
  selectors driving a six-phase animation state machine — a cinematic transition genuinely is that many
  rules. Splitting it would be worse. (It is separately near the *build budget* — see `SEC-15`.)
- **`ModalQueueService`, `ThemeService`, `AnalyticsService`, `app.config.ts`, `app.routes.ts`, the CI
  workflow, `angular.json` budgets** — all proportionate. The `typeof gtag === 'undefined'` guard is the
  right call for a page where GA may not have loaded.
- **`PokedexService`, `TypeMatchupService`, `PokemonFormsService`, `ItemsService`, `GenerationService`,
  `EvolutionService`** and the `evolution-chain.ts` / `national-dex-pokemon.ts` / `type-matchups-data.ts`
  tables — well-shaped and correctly placed.

---

# Suggested migration order

Each step is independently shippable. Steps 1–4 are near-mechanical; 5–10 are the structural work and
are mostly independent of each other.

| # | Step | Finding | Risk |
| --- | --- | --- | --- |
| 1 | ~~`noUnusedLocals` + `noUnusedParameters`~~ **done (`T-02`)** | `CQ-21` | — |
| 2 | ~~Delete `DarkModeService`, `DarkModeToggleComponent`, the dead injections, the legacy CSS~~ **done (`T-05`)** | `CQ-05` | — |
| 3 | ~~Declare `@angular/localize`; drop 3 unused deps; delete the dead methods and orphan JSON files~~ **done (`T-04`, `T-06`)** | `CQ-19`, `CQ-20` | — |
| 4 | ~~Extract the six inline modals into components~~ **done (`T-17`)** | `CQ-07` | — |
| 5 | ~~Add `setNextStates(...)`, collapse the reverse-push pairs~~ **done (`T-18`)** | `CQ-11` | — |
| 6 | ~~Add `showModalThenContinue`~~ **done (`T-19`)** — `stealPokemon` deliberately keeps its no-skip behaviour | `CQ-12` | — |
| 7 | ~~Consolation-prize table + outcome-based tests~~ **done (`T-20`)** | `CQ-06`, `CQ-25` | — |
| 8 | ~~**`PendingSelection<T>` continuations**~~ **done (`T-21`)** | `CQ-01` | — |
| 9 | ~~**`FormRuleService`**~~ **done (`T-23`)** — `CQ-10`'s stone-on-form join remains for `T-24` | `CQ-02` | — |
| 10 | ~~`RunModifiers` into the service~~ **done (`T-22`)** | `CQ-03` | — |
| 11 | ~~`SoundFxService` → one `Map<SoundFxName, SoundFxClip>`~~ **done (`T-25`)** | `CQ-04` | — |
| 12 | ~~Extract `weighted-random.ts` + `SpinAnimation`~~ **done (`T-26`)** | `CQ-13` | — |
| 13 | ~~Collapse group-A pool roulettes~~ **done (`T-27`)** | `CQ-08` | — |
| 14 | ~~Pull `buildVictoryOdds` + `resolveSplitTrainer` up~~ **done (`T-28`)** | `CQ-09` | — |
| 15 | Specs for `ModalQueueService` and `SettingsService`; remaining cleanups | `CQ-26`, `CQ-14`–`CQ-18`, `CQ-23` | Low |

**Expected landing:** `roulette-container.component.ts` at ~500–550 lines (from 1050), its template at
~215 (from 309), `trainer.service.ts` at ~300 (from 543), `sound-fx.service.ts` at ~200 (from 367),
roughly 20 files deleted — **with no new framework, no NgRx, no DI ceremony.** The stack stays, the
`@switch` stays, `TrainerService` stays. What goes away is machinery that existed only because states
couldn't carry values and forms couldn't be described as data.

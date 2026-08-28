# Thermo-Nuclear Code Quality Review — maintainability and structure

Generated **2026-08-27** · commit **`a00ea99`** · scope: **whole codebase** (no branch diff)

## Summary

**10 of the original 26 findings remain.** Cleared so far: `CQ-01`–`CQ-03`, `CQ-05`–`CQ-07`, `CQ-10`–`CQ-12`, `CQ-19`–`CQ-22`, `CQ-24`, `CQ-25`. Three reviewers audited game-flow core, domain services, and presentation/infra in
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
something is fine. The 309-line `@switch` template should **stay**; `TrainerService` should **not** be
split four ways; ESLint is **not** worth adding (`T-02` enabled two tsconfig flags instead); and 26
of the 31 roulette components should **not** be collapsed (`CQ-08` explains which five should, and
why the other 26 are a different population). See **Verified healthy** below for the full list with
reasoning.

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
| `CQ-13` extract weighted-random | `SEC-01` (fixed in `T-03`) — extraction would still remove the `as any` reach-through in its tests |

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

### CQ-04 — `SoundFxService`: five maps keyed by a handle that carries no identity
- **Location:** `src/app/services/sound-fx-service/sound-fx.service.ts:21-26`
- **Status:** [ ] open

**What:** Five parallel `Map`s (`sourceByHandle`, `decodedBufferCache`, `activeSourcesByHandle`,
`endedListenersByHandle`, `pendingPlayCountByHandle`) modelling one object. The tell:

```
roulette-container.component.ts:122:  this.itemFoundAudio = this.soundFxService.createItemFoundSoundFx();
find-item-roulette.component.ts:31:   this.itemFoundAudio = this.soundFxService.createItemFoundSoundFx();
```

Two components ask for the same asset and get two different handles. So `preventOverlap` is scoped to
the *caller*, not the sound — those two `ItemFound.mp3` plays cannot suppress each other, presumably
defeating the flag's purpose. Meanwhile `decodedBufferCache` is keyed by `src`, not handle: the service
already carries two competing notions of identity. And `sourceByHandle` is append-only while
`WheelComponent` mints a fresh handle per instantiation — dozens per playthrough.

**Remedy:** the identity that matters is the **asset**. One `SOUND_FX_SRC: Record<SoundFxName, string>`
table plus one `Map<SoundFxName, SoundFxClip>`, where `SoundFxClip` holds `active`, `endedListeners`,
`buffer`, `pending` and a `busy` getter. Public API becomes
`play(name: SoundFxName, volume?, options?)`.

Deletes: seven `createXSoundFx()` factories (`:33-77`, ~45 lines); five map declarations become one;
`trackActiveSource`, `isHandleBusy`, `incrementPending`, `decrementPending`, `untrackActiveSource`,
`emitEnded` (`:276-324`, ~55 lines) — all pure get-or-default-then-set boilerplate that exists *only*
because state lives in parallel maps. At call sites, **8** `!: SoundFxHandle` fields and their
initialisers disappear. **367 → ~200 lines**, and the union type lets `strictTemplates` police sound
names, which a `string` handle cannot.

---

### CQ-08 — Collapse the five pool roulettes; leave the other 26 alone
- **Location:** `src/app/main-game/roulette-container/roulettes/{fishing,fossil,legendary,starter,cave-pokemon}-roulette/`
- **Status:** [ ] open

The reviewer was asked to argue this both ways. **The 31 roulette components are not one population.**

| Group | Members | Verdict |
| --- | --- | --- |
| **A. Generation → id table → `PokemonItem[]`** | fishing, fossil, legendary, starter, cave-pokemon (5) | **Collapse** |
| B. Static full-dex list | mysterious-egg, trade-pokemon, area-zero (3) | Leave — already 21-27 lines |
| C. Pass-through `@Input` list | pokemon-from-aux-list, select-form, select-from-item-list (3) | Leave — 20 lines, different payload types |
| D. Static odds → binary emit | shiny, catch-legendary, catch-paradox, check-evolution (4) | Leave — the odds *are* the content |
| E. Action list → `switch(index)` → distinct outputs | start-adventure, main-adventure, explore-cave, elite-four-prep, snorlax, team-rocket (6) | **Leave — collapsing loses type safety** |
| F. Battle | gym, elite-four, champion, rival + base (5) | See `CQ-09` |

**Group A only.** Normalising identifiers and whitespace, **23 of ~37 statement lines are
byte-identical across all five**; the ~14 that differ do so only in the spelling of a field name
(`fish` vs `fossils` vs `starters`). Templates are the same four lines with one key swapped; all five
stylesheets are the identical three-line `.title { text-align: center; }`. That is **659 lines across
20 files expressing five rows of a table**, plus five `@switch` arms.

The counter-argument — that a generic roulette would be a *thin magic abstraction* hiding a data-shape
assumption behind an untyped string — is correct against the naive version, and is defused by making
the variance **named data**:

```ts
export const POKEMON_POOLS = {
  fish:   { titleKey: 'game.main.roulette.fishing.title', showGeneration: true,  idsByGeneration: fishByGeneration },
  // …
} as const satisfies Record<string, PokemonPool>;
export type PokemonPoolId = keyof typeof POKEMON_POOLS;
```

The shape is named (`PokemonPool`), so nothing is hidden; the key is a union type, so
`pool="fsh"` is a compile error — `strictTemplates` is already on, so that check is free. The
`*-by-generation.ts` data files stay put; only the five wrappers merge. **20 files → 5, 659 lines →
~120, one spec instead of five.**

**Group E deserves the opposite verdict, explicitly.** `main-adventure-roulette.component.ts:81-138` is
a 57-line `switch` on wheel index emitting into 18 distinct typed `@Output`s. It *looks* like the worst
duplication in the folder. Collapsing it would replace 18 compiler-checked outputs with one
`(action)="onAction($event)"` emitting a string, moving 18 bindings from compile-time to a runtime
string match inside the already-1050-line container. The `switch`-index coupling **is** fragile
(reordering `baseActions` silently rewires the game), but the fix for that is putting the emitter on
the item, not a generic component — and even that is optional.

---

### CQ-09 — `calcVictoryOdds` is copy-pasted four times into subclasses of a base that should own it
- **Location:** `gym-battle-roulette.component.ts:91-151` · `elite-four-battle-roulette.component.ts:90-151` · `champion-battle-roulette.component.ts:75-101` · `rival-battle-roulette.component.ts:64-88`
- **Status:** [ ] open

**What:** `BaseBattleRouletteComponent` is a *good* abstraction — it correctly owns subscriptions,
`plusModifiers`, `hasPotions`, and the `usePotion` lambda seam (whose comment honestly explains the
`ModalQueueService`-vs-`NgbModal` split). The problem is what it didn't absorb. Gym's and Elite Four's
`calcVictoryOdds` are **the same 60 lines** — team-power loop, `plusModifiers` loop, the full
type-matchup block with identical branch weights and an identical 6-field `else` reset — differing only
in `'gym'` vs `'elite'` in a translation key and a trailing 1-vs-2 `noOdds` push. Champion and Rival are
the same minus the matchup block. All four also duplicate `getTypeIconUrl` and `typeIconBaseUrl`.

**Remedy:** pull `buildVictoryOdds(opponentTypes?)`, `outcomeKeyPrefix`, `baseNoOdds`,
`typeIconBaseUrl` and `getTypeIconUrl` into the base. Each subclass's method becomes one line.
**~200 lines removed across four files with no new indirection** — the base class already exists and
the subclasses already extend it.

Same story for `getCurrentLeader`/`getCurrentElite`/`getCurrentChampion`/`getCurrentRival` — the same
`translate.get(name) → split('/') → pick index → rebuild` routine four times. That belongs in a free
function `resolveSplitTrainer(leader, translated, index)`: pure, no DI, trivially testable.

---

# 2 · Spaghetti and API-shape problems

### CQ-13 — `WheelComponent`: extract the two pieces that have no business being in a component
- **Location:** `src/app/wheel/wheel.component.ts` (379 lines)
- **Status:** [ ] open

**The evidence is in the spec.** `wheel.component.spec.ts` writes
`(component as any).translatedItems = component.items` at lines **42, 70 and 108** — because testing a
12-line weighted-random function currently requires standing up a component with two canvases,
`NgbModal`, `TranslateService`, `GameStateService`, `SoundFxService` and two theme services. That is
the seam telling you where the boundary is.

**Extract 1 — selection → `src/app/utils/weighted-random.ts`:** `pickWeightedIndex(items, random = Math.random)`
and `totalWeight(items)` move out verbatim. The three statistical tests lose all three `as any` casts
and the entire TestBed, and gain a seedable `random` for deterministic boundary assertions. Given
CLAUDE.md flags wheel fairness tests as load-bearing, **this is the best return in the file** — and it
makes the empty-items case directly testable without the `as any` reach-through `T-03`'s tests still need.

**Extract 2 — the spin animation → a plain `SpinAnimation` class** with `start(finalRotation, durationMs)`
and `cancel()`. Pulls five mutable fields and `animate()` out of a public surface that currently
exposes **twelve** mutable public fields.

**Do not extract the canvas drawing.** `drawWheel`/`drawBorderRing`/`drawPokeball`/`drawPointer`
(`:125-270`) are ~145 lines of pure `CanvasRenderingContext2D` calls with no logic worth isolating — a
"renderer" class would be indirection for its own sake.

---

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

### CQ-15 — `BadgesService` lies in its return type
- **Location:** `src/app/services/badges-service/badges.service.ts:23,33`
- **Status:** [ ] open

Both `return of(undefined as unknown as Badge)` from a method typed `Observable<Badge>`. The cast
exists purely to defeat the compiler, and the caller at `trainer.service.ts:336` then checks
`if (badge === undefined) return;` — proving the signature is wrong. Type it
`Observable<Badge | undefined>`, return `of(undefined)`, delete both casts. **The caller already
handles it correctly.**

Related: `PokemonItem.type1`/`type2` are optional while `PokemonForm`'s are required, which is why
`TypeMatchupService` needs `as Array<PokemonType | null | undefined>` at `:33` and `:93`. If the
National Dex always populates both, make them required and the casts go away.

---

### CQ-16 — `getItems()` hands out the live array while `getTeam()`/`getStored()` copy
- **Location:** `src/app/services/trainer-service/trainer.service.ts:207-209`
- **Status:** [ ] open

The one consumer, `base-battle-roulette.component.ts:39`, stores that reference — so `removeItem`'s
in-place `splice` silently mutates the component's field behind its back. Nothing depends on it today
(see `SEC-30i`), but it is an accident waiting for its second consumer. Return `[...this.trainerItems]`
and match the rest of the API.

---

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

### CQ-18 — Assorted type/contract cleanups in the container
- **Location:** `roulette-container.component.ts`
- **Status:** [ ] open

- `stolenPokemon!: PokemonItem | null` (`:208`) — a definite-assignment assertion on a nullable field is
  self-contradictory. Use `= null`.
- `currentContextPokemon!`, `pkmnIn!`, `pkmnOut!` are unset for most of the run. `T-17` made the
  modal-facing ones required component inputs; the remaining container fields still carry the
  definite-assignment assertion.
- `getGameState(): string` (`:213`) is invoked from `html:1` every change-detection pass **and widens
  the type to `string`**, discarding any chance of the template type-checker catching a typo'd `@case`.
  Bind `currentGameState` directly and delete the method.
- `structuredClone` appears at seven sites with no stated ownership rule — one comment on `PokemonItem`
  about who clones and why would save a future debugging session.

---

# 4 · Dead code and configuration

### CQ-23 — `finishCurrentState` returns a state it never emits
- **Location:** `src/app/services/game-state-service/game-state.service.ts:100-109`
- **Status:** [ ] open

On an empty stack it returns `'game-over'` without calling `this.state.next(...)`, so the caller
believes the game ended while the UI stays frozen. Either emit it or return `null` and let the caller
decide — **the current shape is a lie in the type signature.** Same defect as `SEC-30e`, filed here as
the contract problem it is.

---

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
| 11 | `SoundFxService` → one `Map<SoundFxName, SoundFxClip>`, 8 call sites | `CQ-04` | Medium |
| 12 | Extract `weighted-random.ts` + `SpinAnimation`; fix the remaining wheel defects | `CQ-13` | Medium |
| 13 | Collapse group-A pool roulettes into `pokemon-pool-roulette` | `CQ-08` | Medium |
| 14 | Pull `buildVictoryOdds` + `resolveSplitTrainer` into the base | `CQ-09` | Medium |
| 15 | Specs for `ModalQueueService` and `SettingsService`; remaining cleanups | `CQ-26`, `CQ-14`–`CQ-18`, `CQ-23` | Low |

**Expected landing:** `roulette-container.component.ts` at ~500–550 lines (from 1050), its template at
~215 (from 309), `trainer.service.ts` at ~300 (from 543), `sound-fx.service.ts` at ~200 (from 367),
roughly 20 files deleted — **with no new framework, no NgRx, no DI ceremony.** The stack stays, the
`@switch` stays, `TrainerService` stays. What goes away is machinery that existed only because states
couldn't carry values and forms couldn't be described as data.

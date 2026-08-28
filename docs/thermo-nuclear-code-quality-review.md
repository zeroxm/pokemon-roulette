# Thermo-Nuclear Code Quality Review — maintainability and structure

Generated **2026-08-27** · commit **`a00ea99`** · scope: **whole codebase** (no branch diff)

## Summary

**19 findings** (`CQ-01`–`CQ-26`; `CQ-05`, `CQ-19`–`CQ-22`, `CQ-24` cleared). Three reviewers audited game-flow core, domain services, and presentation/infra in
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

1. **`roulette-container.component.ts` is 1050 lines mostly because the state model can't carry a
   payload.** Three `GameState` members (`evolve-pokemon`, `select-evolution`, `steal-pokemon`) are not
   states at all — they render nothing and exist only as tags read back after a selection. When mega
   stones needed a fourth meaning for the same selection state, the mechanism was implemented a second
   time as `megaSelectionMode` + `pendingMegaAwardPokemon`. A third consumer will add a third. Give
   selections a continuation (`CQ-01`) and ~400 lines evaporate rather than move.
2. **Four form-swapping mechanisms are one mechanism in four costumes.** Mega, sticky, temporary and
   battle-only forms all end in the same five-line swap, written four times, differing on three
   orthogonal axes that should be table columns (`CQ-02`). This deletes ~180 lines *and* structurally
   eliminates two High-severity correctness bugs from Run 1.
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
| `CQ-02` FormRule model | `SEC-02` stranded mega form · `SEC-03` double-applied sticky forms · `SEC-05` mega state survives reset |
| `CQ-03` RunModifiers service | `SEC-04` stale container state · `SEC-07` exp-share flag |
| `CQ-10` stone-on-form join | `SEC-30a` unreachable Greninja forms |
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

### CQ-01 — Three `GameState` members are smuggled parameters; give selections a continuation
- **Location:** `src/app/services/game-state-service/game-state.ts:8,12,18` · `roulette-container.component.ts:210-211,364-386,752-784`
- **Status:** [ ] open

**What:** `'evolve-pokemon'`, `'select-evolution'` and `'steal-pokemon'` have **no `@case` arm** — verified
zero. They render nothing. They exist so `continueWithPokemon` can pop one and read it back as a tag
saying what the finished selection *meant*. The scheme ran out of road when mega stones needed a
fourth meaning for the same `'select-from-pokemon-list'` state, so `megaSelectionMode` was bolted on as
a parallel tag, guarded ahead of the switch, with `pendingMegaAwardPokemon` carrying the payload the
state string couldn't. **That is the same mechanism implemented twice.**

**Remedy:**

```ts
// roulette-container/pending-selection.ts
export interface PendingSelection<T> {
  title: string;                 // translation key
  options: T[];
  onSelected: (choice: T) => void;
}
```

```ts
continueWithPokemon(pokemon: PokemonItem): void {
  const selection = this.pendingPokemonSelection;
  this.pendingPokemonSelection = null;
  this.finishCurrentState();
  selection?.onSelected(pokemon);
}
```

**What this deletes** (not moves): the `switch` at `:368-386`; `megaSelectionMode`,
`pendingMegaAwardPokemon`, `handleMegaSelection`, `handleMegaStoneAwardSelection` (~40 lines);
`continueWithItem` collapses to the symmetric two-line form; `customWheelTitle`, `auxPokemonList`,
`auxItemList` stop being free-floating fields; three members leave the `GameState` union, which then
genuinely means "what is on screen". `awardMegaStoneAfterImportantBattle` stops being a two-phase dance
and becomes one `requestPokemonSelection({...})` call.

**The single highest-leverage change in the codebase.**

---

### CQ-02 — Four form mechanisms are one mechanism in four costumes
- **Location:** `src/app/services/trainer-service/trainer.service.ts:364-541`
- **Status:** [ ] open

**What:** `applyBattleForms`/`revertBattleForms` fan out to three private replacers that are
structurally the same function — `replaceTemporaryForms` (`:513-541`),
`applyStickyFormsToCollection` (`:472-503`), `applyMegaForms`/`revertMegaForms` (`:388-446`). All end
in the **identical five-line body**: clone target, carry `shiny`, null `sprite`,
`loadPokemonSpriteIfMissing`, write back — at `:404-409`, `:431-435`, `:493-497`, `:531-535`. Four
copies of the same swap.

They differ on exactly **three orthogonal axes**: scope (team vs. team+stored), persistence (revert on
exit vs. sticky), selection (cycle, random-other, item-gated). Those are table columns, not code paths.
Terastal and Gigantamax ids are already sitting unused in the data — each new mechanic means a fifth
copy plus another `changed = … || changed` line in both apply and revert.

**Remedy:**

```ts
// services/form-rule-service/form-rule.ts
export type FormSelection =
  | { kind: 'cycle' }
  | { kind: 'random-other' }
  | { kind: 'item-gated'; stones: MegaStoneItemName[] };

export interface FormRule {
  id: string;                    // 'palafin', 'aegislash', 'mega:6'
  forms: PokemonItem[];          // index 0 is the base form
  scope: 'team' | 'team+stored';
  persistence: 'temporary' | 'sticky';
  selection: FormSelection;
}
```

`FormRuleService.applyAll/revertAll/forceApply` iterate one flat `formRules` table and call a single
`swapInPlace`. Revert state stops being three ad-hoc fields (`:60-62`) and becomes one
`Map<string, {index, original}>` keyed by rule id — **which also removes the single-slot limitation
where only one Pokémon can be mid-mega at a time** (`revertMegaForms` `break`s at `:437`).

`TrainerService` keeps only:

```ts
private syncBattleForms(gameState: GameState): void {
  const changed = this.battleStates.has(gameState)
    ? this.formRuleService.applyAll(this.trainerTeam, this.storedPokemon, this.heldItemNames())
    : this.formRuleService.revertAll(this.trainerTeam, this.storedPokemon);
  if (changed) this.trainerTeamObservable.next(this.getTeam());
}
```

**~180 lines deleted from `trainer.service.ts`**, adding Gigantamax becomes a table row, and `SEC-02`,
`SEC-03` and `SEC-05` become structurally impossible.

**Migration:** (1) land `FormRule`/`FormRuleService` with `formRules` built by *adapting* the three
existing tables at module load — zero data edits, existing specs still pass; (2) switch
`syncBattleForms` over and delete the six private methods; (3) flatten the adapters into one literal
table and delete `palafin-forms.ts` / `sticky-battle-forms.ts` / the mega pairing helper.

---

### CQ-03 — Per-run game rules are stored as component fields, so restart can't reset them
- **Location:** `src/app/main-game/roulette-container/roulette-container.component.ts:192-210`
- **Status:** [ ] open

**What:** `resetGameAction()` (`:894-898`) resets exactly one field. `resetGameEvent` reaches
`MainGameComponent.resetGame()`, which resets the trainer and `GameStateService` — and nothing in the
container. The container is **not** recreated (no `@if` guards it), so `expShareUsed`, `expSharePokemon`,
`runningShoesUsed`, `multitaskCounter`, `respinReason`, `stolenPokemon`, `fromLeader` and
`megaSelectionMode` all survive a restart.

**The diagnosis is not "add lines to `resetGameAction`".** These are per-run *game rules*: they outlive
every individual state transition, and `GameStateService` already owns run-scoped data (`currentRound`).
They are in the wrong object.

**Remedy:** one `RunModifiers` object on `GameStateService` (or a small `RunModifiersService`), reset
inside the existing `resetGameState()`:

```ts
interface RunModifiers {
  expShareUsed: boolean;
  expSharePokemon: PokemonItem | null;
  runningShoesUsed: boolean;
  multitaskCounter: number;
  evolutionCredits: number;
  stolenPokemon: PokemonItem | null;
}
```

Reset becomes one assignment in the place that already resets everything else, and can never drift
again. **This is the structural fix for `SEC-04` and `SEC-07`.**

---

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

### CQ-06 — The consolation-prize switch is a lookup table written as 60 lines of code
- **Location:** `src/app/main-game/roulette-container/roulette-container.component.ts:259-320`
- **Status:** [ ] open

**What:** Six cases, each an eight-line block differing only in three translation keys, a sprite URL,
and a follow-up call. `'gym-battle'` and `'battle-trainer'` differ *only* in the key;
`'battle-rival'`, `'team-rocket-encounter'` and `'snorlax-encounter'` are identical except the key, and
repeat the same `unknown.png` URL three times (`:281, 299, 308`).

**Remedy:** a `Record<EventSource, ConsolationPrize>` in `roulette-container/consolation-prizes.ts`
with `{ text, sprite, description, action }`. The `Record` type makes the compiler **demand a row for
every new `EventSource`** — today the `default:` at `:317-318` silently swallows one. Sixty lines
become ~12: look up, open the modal if `action !== 'none'`, dispatch. Do this *after* `CQ-07` so the
modal call site is already one line.

---

### CQ-07 — Six inline `ng-template` modals cost 10 fields and 94 lines of HTML
- **Location:** `roulette-container.component.ts:174-179` · `roulette-container.component.html:217-310`
- **Status:** [ ] open

**What:** Six `@ViewChild(..., TemplateRef<any>)` (verified: exactly 6) require ten fields existing
purely as modal view-model — `altPrizeDescription`, `altPrizeSprite`, `altPrizeText`,
`infoModalMessage`, `infoModalTitle`, `pkmnEvoTitle`, `pkmnIn`, `pkmnOut`, `pkmnTradeTitle`,
`currentContextItem`.

**The codebase already knows the better pattern** — `showMegaEvolutionAnimation` (`:870-884`) opens a
real component and sets `componentInstance` inputs. `ModalQueueService` already accepts a component
type.

**Remedy:** extract `AltPrizeModalComponent`, `InfoModalComponent`, `ItemActivateModalComponent`,
`PokemonSwitchModalComponent` and `TeamRocketFailsModalComponent`. Note `pkmnEvoModal` and
`pkmnTradeModal` are the **same markup** (`html:232-262`, differing in three translation keys), so one
component with `title`/`sentKey`/`receivedKey` inputs covers both: six templates → four components.
The ten fields become inputs scoped to the modal's lifetime; the template drops 94 lines to ~215.

**This is the safest first step in the whole migration** — pure mechanical extraction, zero logic
change, biggest immediate line reduction.

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

### CQ-10 — The mega form↔stone pairing is an unenforceable positional invariant, already broken
- **Location:** `src/app/services/trainer-service/pokemon-mega-forms.ts:4,1294` · `trainer.service.ts:457-470`
- **Status:** [ ] open

**What:** Two tables keyed by the same base id, joined **by array index**:
`forms[stoneNames.indexOf(stoneName)] ?? forms[0] ?? null`. Nothing in the type system ties `forms[i]`
to `stones[i]`. Across all 92 entries, 91 agree in length — **Greninja does not**: base `658` has three
forms (`greninja-mega`, `greninja-battle-bond`, `greninja-ash` at `:971,982,993`) and one stone. So
`stoneIndex` is always `0`, two authored forms plus their i18n keys in six locales are dead, and the
silent `?? forms[0]` fallback is exactly what hid it.

**Remedy:** put the stone **on the form** — `{ pokemonId: 10034, stone: 'charizardite-x', … }`. The join
becomes `forms.find(f => f.stone === stoneName)`, and a missing or duplicated stone is a compile error
rather than a silent index slip. `megaStoneNamesForBaseId` derives from the forms table instead of
being maintained beside it, and `_baseIdToStoneName`'s 92 lines disappear. Falls out naturally from
`CQ-02`. Decide separately whether Greninja's extra forms should become reachable or be deleted.

*Also:* `_baseIdToStoneName` keys include `10061, 10120, 10147, 10258, 10259` — form ids used as "base"
ids. The name lies about the id space; keying by rule rather than base id removes the muddle.

---

# 2 · Spaghetti and API-shape problems

### CQ-11 — Callers must push states in reverse; fix the API, not the callers
- **Location:** `src/app/services/game-state-service/game-state.service.ts` · seven call sites incl. `roulette-container.component.ts:327-328,423-424,559-560,910-911`
- **Status:** [ ] open

Seven call sites push multi-state sequences backwards and rely on a comment or the reader's memory.
The spec at `roulette-container.component.spec.ts:248` needs prose to explain the resulting order.
**The stack is the right abstraction — do not replace it.** Add one method:

```ts
setNextStates(...states: GameState[]): void {
  for (let i = states.length - 1; i >= 0; i--) this.stateStack.push(states[i]);
}
```

Call sites then read in play order. An entire category of ordering bug stops being possible.
**Five-minute change, disproportionate payoff — do it early.**

---

### CQ-12 — The same modal-then-continue dance is written four times
- **Location:** `roulette-container.component.ts:544-553, 601-614, 1011-1024, 1034-1047`
- **Status:** [ ] open

Every one is a nested promise with two identical callbacks (because dismissal rejects). Three of the
four wrap it in `if (!lessExplanations)`; `stealPokemon` does not, and it is unclear whether that is
intentional — **decide explicitly when fixing.** One `showModalThenContinue(content, { skippable })`
helper kills all four. Verified: `{ centered: true, size: 'md' }` is repeated **12 times** in this file
(13 `centered: true` total, one with `size: 'lg'`) — fold the options into the helper too.

---

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
- `TemplateRef<any>` ×6 (`:174-179`) — disappears with `CQ-07`.
- `currentContextItem!`, `currentContextPokemon!`, `pkmnIn!`, `pkmnOut!` are unset for most of the run,
  yet `html:236` dereferences `pkmnOut.sprite?.front_default` — the `?.` on `sprite` but not on
  `pkmnOut` shows someone already hit this. `CQ-07` makes them required inputs.
- `grantMegaStone`'s empty `else` with only a comment (`:747-749`) is dead — delete the branch.
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

### CQ-25 — The container specs assert the shape of the switch, not behaviour
- **Location:** `roulette-container.component.spec.ts:168-214, 226, 279, 326`
- **Status:** [ ] open

The eight `chooseWhoWillEvolve` tests spy on the component's own public methods and assert *which
method was called*. That asserts the switch's shape, not the outcome — all eight break under `CQ-06`
and **none of them would catch a wrong sprite or a wrong translation key**. Replace with one
table-driven test over `CONSOLATION_PRIZES` asserting the observable outcome.

Likewise `(component as any).evolvePokemon = evolveSpy` and three `(component as any).auxPokemonList`
reads — reaching through `as any` into privates is the test telling you the seam is wrong. Under
`CQ-01`, `pendingPokemonSelection.options` is the natural, honest assertion target.

**The good tests are `:72-156`** — capture routing, Pokédex registration, shiny propagation,
champion-win marking. Those assert observable outcomes and survive every proposed change untouched.
That is the model. Notably **absent**: nothing covers the running-shoes re-spin, the mega-stone award
flow, or restart cleanup — the three most fragile behaviours in the file.

`trainer.service.spec.ts` is the counter-example and is **genuinely good** — behavioural, driving
through the real `GameStateService`. All 11 form tests would pass unchanged against `CQ-02`'s
`FormRuleService`, because none touch the private replacers by name.

---

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
  exhaustively greppable. Its only real problem is sharing a file with 94 lines of modal markup, which
  `CQ-07` fixes.
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
| 4 | Extract the six inline modals into components | `CQ-07` | Low — pure mechanical |
| 5 | Add `setNextStates(...)`, collapse the seven reverse-push pairs | `CQ-11` | Low |
| 6 | Add `showModalThenContinue`; decide the `stealPokemon` / `lessExplanations` question | `CQ-12` | Low |
| 7 | Consolation-prize table + rewrite the eight spies as one outcome test | `CQ-06`, `CQ-25` | Medium |
| 8 | **`PendingSelection<T>` continuations** — delete `megaSelectionMode`, both mega dispatchers, three `GameState` members | `CQ-01` | Medium — small diff by now |
| 9 | **`FormRuleService`** — three-phase migration; fixes `SEC-02`/`SEC-03`/`SEC-05` structurally | `CQ-02`, `CQ-10` | Medium-high |
| 10 | `RunModifiers` into the service, reset in `resetGameState()`; add the restart regression test | `CQ-03` | Medium |
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

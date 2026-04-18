---
phase: 09-battle-architecture
reviewed: 2026-04-17T20:30:00Z
depth: standard
files_reviewed: 5
files_reviewed_list:
  - src/app/main-game/roulette-container/roulettes/base-battle-roulette/base-battle-roulette.component.ts
  - src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-battle-roulette.component.ts
  - src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component.ts
  - src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-battle-roulette.component.ts
  - src/app/main-game/roulette-container/roulettes/rival-battle-roulette/rival-battle-roulette.component.ts
findings:
  critical: 0
  warning: 2
  info: 2
  total: 4
status: issues_found
---

# Phase 9: Code Review Report

**Reviewed commits:** `1251673` (base class) → `387e383` (subclasses extend base)
**Depth:** standard
**Files Reviewed:** 5
**Status:** issues_found

---

## Summary

Phase 9 extracted duplicated lifecycle, subscription, and item-usage logic from four battle-roulette
components into a shared `BaseBattleRouletteComponent` abstract class. The design is sound: the three
subscriptions are managed symmetrically, the `usePotion` lambda pattern is clean and avoids closure
issues, and every subclass correctly overrides both abstract methods with `override`.

Two warnings were found — both pre-existing bugs that were **carried through** the refactor unchanged
rather than introduced by it. Two info items cover minor code-health gaps in the new shared code.

No critical issues were found. The subscription lifecycle (review area 1), `usePotion` closures
(area 2), and `protected readonly modalService` access in champion (area 4) are all correct.

---

## Critical Issues

_None._

---

## Warnings

### WR-01: Elite-four `advantageLabelKey` uses `gym` i18n namespace

**File:** `src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-battle-roulette.component.ts:126`

**Issue:** The elite-four component builds its `advantageLabelKey` using the gym i18n namespace
(`game.main.roulette.gym.typeAdvantage.*`) instead of an elite-four-specific one. If the template
resolves this key, it will silently display gym-battle advantage text during an elite-four battle —
or fall back to the raw key string if the translation is missing for the current locale. This is a
copy-paste bug that predates the refactor and was preserved unchanged.

```typescript
// Current (line 126) — wrong namespace
this.advantageLabelKey = this.advantageLabel
  ? `game.main.roulette.gym.typeAdvantage.${this.advantageLabel}`
  : '';

// Fix — use the elite-four namespace (verify the key exists in i18n JSON)
this.advantageLabelKey = this.advantageLabel
  ? `game.main.roulette.elite.typeAdvantage.${this.advantageLabel}`
  : '';
```

> If the gym and elite-four translations intentionally share the same strings, extract the key to a
> shared constant and reference it from both components so the intent is explicit.

---

### WR-02: `teamSubscription` type inconsistency masks unguarded initialization

**File:** `src/app/main-game/roulette-container/roulettes/base-battle-roulette/base-battle-roulette.component.ts:23,54`

**Issue:** `gameSubscription` and `generationSubscription` are correctly typed as
`Subscription | null = null`, making their `ngOnDestroy` usage of `?.unsubscribe()` meaningful.
`teamSubscription` is declared with a `!` non-null assertion (`Subscription`) but then also accessed
with `?.` in `ngOnDestroy`. The `!` assertion promises the field is always initialized before use,
but if `ngOnDestroy` fires before `ngOnInit` (possible in some test-teardown scenarios or component
error paths), `teamSubscription` is `undefined` at runtime — the `?.` saves it, but the `!` misleads
the type checker and future readers.

```typescript
// Current — inconsistent
private gameSubscription: Subscription | null = null;
private generationSubscription: Subscription | null = null;
private teamSubscription!: Subscription;            // ← misleading assertion

// Fix — align all three to the same nullable pattern
private gameSubscription: Subscription | null = null;
private generationSubscription: Subscription | null = null;
private teamSubscription: Subscription | null = null;   // ← consistent, explicit
```

---

## Info

### IN-01: Modal-service split between subclasses is undocumented in code

**File:** `src/app/main-game/roulette-container/roulettes/base-battle-roulette/base-battle-roulette.component.ts:27`

**Issue:** Gym and elite-four use `ModalQueueService.open()` to sequence their two modals (presentation
then item-used), while champion and rival use `NgbModal` directly — a deliberate and correct choice.
The distinction is captured only in the commit message; there is no comment in the code. Readers
maintaining the base class or adding a fifth subclass have no in-code signal about which service to
choose.

**Fix:** Add a brief JSDoc or inline comment on the `protected readonly modalService` field:

```typescript
/**
 * Direct modal access for single-modal subclasses (champion, rival).
 * Subclasses that sequence two modals (gym, elite-four) should inject
 * ModalQueueService separately to prevent overlap.
 */
protected readonly modalService: NgbModal,
```

---

### IN-02: `trainerItems` snapshot not reactive to mid-game inventory changes

**File:** `src/app/main-game/roulette-container/roulettes/base-battle-roulette/base-battle-roulette.component.ts:38`

**Issue:** `this.trainerItems = this.trainerService.getItems()` captures a one-time array reference in
`ngOnInit`. `usePotion()` splices from this local reference _and_ calls `trainerService.removeItem()`,
keeping them in sync for removals. However, if `TrainerService` ever gains a reactive items observable
(or items are added externally), the base class snapshot would diverge silently. This is consistent
with pre-refactor behavior and is low-risk given the current service contract.

**Fix (preventive):** If `TrainerService` exposes an `itemsObservable`, subscribe to it in
`ngOnInit` the same way `getTeamObservable()` is used. If the synchronous getter is intentional,
add a comment marking it as a deliberate design decision.

---

## Subscription Lifecycle Analysis (review area 1)

All three subscriptions in `ngOnInit` are backed by `BehaviorSubject`, so they emit synchronously
on subscribe — `trainerTeam` and `generation` are populated before the game-state subscription
fires. Subclasses do **not** override `ngOnInit`, so the base implementation runs unmodified.
`calcVictoryOdds()` is called from within the `teamSubscription` callback (after setting `trainerTeam`)
and uses `this.currentLeader?.types?.length` optional chaining, so the first call before any game
state fires is safe. `ngOnDestroy` uses `?.` on all three subscriptions — no leak paths.

## `usePotion` Lambda Analysis (review area 2)

The `() => this.modalQueueService.open(...)` lambdas capture `this`, `this.itemUsedModal`, and
`this.modalQueueService` at call time. `itemUsedModal` is a `@ViewChild({ static: true })` available
from construction; `this` is the live component instance. No stale closures or memory leaks — the
lambda is ephemeral, created per `onItemSelected` call and released immediately after `usePotion`
returns.

## `calcVictoryOdds` Before `currentLeader` Set (review area 3)

Confirmed safe. The team-subscription callback calls `calcVictoryOdds()` before any game-state
event fires. All three type-matchup subclasses guard with `this.currentLeader?.types?.length` (gym)
and `this.currentElite?.types?.length` (elite-four), falling through to the `else` branch that zeroes
out all advantage fields. Champion and rival have no leader field referenced in `calcVictoryOdds()`.

## `protected readonly modalService` Access in Champion (review area 4)

Champion's `onItemSelected` lambda `() => this.modalService.open(this.itemUsedModal, ...)` accesses
the base-class `protected readonly modalService` correctly. TypeScript's `protected` permits subclass
access; the `readonly` modifier prevents reassignment. No issue.

---

_Reviewed: 2026-04-17T20:30:00Z_
_Reviewer: gsd-code-reviewer_
_Depth: standard_

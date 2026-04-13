# Requirements — v1.1 Inline Type Matchup Display

## Overview

Replace the type advantage modal with a persistent inline strip between the battle title and the wheel. The strip always shows the leader's type icon, the advantage label when applicable, and the relevant team type icons — fixing the double-modal bug on multi-slot leaders in the process.

---

## Categories

| Category | Description |
|----------|-------------|
| REFACTOR | Remove typeAdvantageModal from both battle components |
| SVC      | TypeMatchupService extension for type list output |
| STRIP    | Inline matchup strip UI in both battle roulettes |
| I18N     | Remove unused i18n keys from removed modal |

---

## V1 Requirements (Active Scope)

### REFACTOR — Remove Type Advantage Modal

**REF-01** — Remove `typeAdvantageModal` from gym battle roulette  
Remove `#typeAdvantageModal` ng-template from `gym-battle-roulette.component.html`,
`@ViewChild('typeAdvantageModal')` declaration, `queueTypeAdvantageModal()` method,
and all calls to `queueTypeAdvantageModal()` from `gym-battle-roulette.component.ts`.
The leader presentation modal is kept.

**REF-02** — Remove `typeAdvantageModal` from Elite Four battle roulette  
Same removal as REF-01 for `elite-four-battle-roulette.component.ts` and `.html`.

---

### SVC — Service Extension

**SVC-04** — `TypeMatchupService` returns relevant team type lists  
New method signature:
`getMatchupTypes(team: PokemonItem[], opponentTypes: PokemonType[]): { advantageTypes: PokemonType[], disadvantageTypes: PokemonType[] }`  
Rules:
- `advantageTypes`: unique `PokemonType` values from team members where `isStrongAgainst(memberType, opponentType)` is true for any opponent type. Order: type1 before type2, preserve team order, deduplicate.
- `disadvantageTypes`: unique `PokemonType` values from team members where `isWeakAgainst(memberType, opponentType)` is true for any opponent type. Same ordering rules.
- A type may appear in both lists (same rule as strongCount/weakCount — a member can be both).
- Returns empty arrays when team or opponentTypes is empty.
- Components use these arrays to render type icon rows — no matchup logic in templates.

---

### STRIP — Inline Matchup Display

**STRIP-01** — Inline matchup strip in both battle roulette components  
Both `gym-battle-roulette.component.html` and `elite-four-battle-roulette.component.html`
gain an inline matchup strip placed between the component title/header and the
roulette wheel. The strip is visible whenever a battle is active and a leader/Elite Four
member is set. It is hidden (or empty) before a battle starts.

**STRIP-02** — Strip layout: leader icon → label → team type icons  
Left-to-right layout within the strip:
1. Leader type icon (PokeAPI sprite, same URL pattern as v1.0 `getTypeIconUrl()`)
2. Advantage label text (translated i18n string: "Overwhelming Advantage", "Advantage", "Disadvantage")
3. Row of team type icons (one icon per unique relevant type)

**STRIP-03** — Null advantage state: leader icon only  
When `advantageLabel` is `null` (team has no type advantage or disadvantage against
the current leader), the strip shows only the leader type icon. The label and team
type icon row are not rendered.

**STRIP-04** — Advantage/Overwhelming state: team types that are SE against leader  
When `advantageLabel` is `'advantage'` or `'overwhelming'`, the team type icons
shown are the `advantageTypes` from `SVC-04` — unique types from team members
that are super-effective against the leader's type(s).

**STRIP-05** — Disadvantage state: team types the leader is SE against  
When `advantageLabel` is `'disadvantage'`, the team type icons shown are the
`disadvantageTypes` from `SVC-04` — unique types from team members that the
leader's type(s) are super-effective against.

**STRIP-06** — Live update on PC team swap  
The strip reflects the current team at all times. When the player changes their team
via PC during an active battle, the strip updates immediately (driven by the existing
`teamSubscription` → `calcVictoryOdds()` flow). No additional subscription needed.

---

### I18N — Cleanup

**I18N-01** — Remove unused `strong` and `weak` keys from all locale files  
The `game.main.roulette.gym.typeAdvantage.strong` and `.weak` keys were used
only in the now-removed `#typeAdvantageModal` count display. Remove them from
all 6 locale files: `en.json`, `de.json`, `es.json`, `fr.json`, `it.json`, `pt.json`.
The remaining keys (`overwhelming`, `advantage`, `disadvantage`) are kept and
reused by the inline strip.

---

## Out of Scope

| Item | Reason |
|------|--------|
| Champion / Rival battle type display | Explicitly excluded (same as v1.0) |
| Animated type icon transitions | Out of scope for this milestone |
| Tooltips on type icons | Deferred — keep strip minimal |
| `strong` / `weak` label text in strip | Removed — icons replace count text |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| REF-01   | Phase 7 | Pending |
| REF-02   | Phase 7 | Pending |
| SVC-04   | Phase 7 | Pending |
| I18N-01  | Phase 7 | Pending |
| STRIP-01 | Phase 8 | Pending |
| STRIP-02 | Phase 8 | Pending |
| STRIP-03 | Phase 8 | Pending |
| STRIP-04 | Phase 8 | Pending |
| STRIP-05 | Phase 8 | Pending |
| STRIP-06 | Phase 8 | Pending |

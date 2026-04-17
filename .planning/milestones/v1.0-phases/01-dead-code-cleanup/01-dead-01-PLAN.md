---
id: "01-dead-01"
title: "Remove unreachable break statements in chooseWhoWillEvolve()"
phase: 1
wave: 1
depends_on: []
files_modified:
  - src/app/main-game/roulette-container/roulette-container.component.ts
autonomous: true
requirements:
  - DEAD-01
---

<objective>
Remove all unreachable `break;` statements from the `chooseWhoWillEvolve()` switch block in
`roulette-container.component.ts`. Every `case` already ends with a `return` statement, making
the subsequent `break;` unreachable dead code. Removing them reduces noise and silences any
linter/compiler warnings without changing runtime behavior.

Purpose: Eliminate dead code flagged in the codebase audit (DEAD-01). Runtime behavior is
identical before and after — every `return` exits the function; the `break` is never reached.

Output: `roulette-container.component.ts` with 8 `break;` lines deleted (lines 252, 262, 272,
282, 292, 302, 305, 308 in the original file). CI stays green.
</objective>

<execution_context>
@~/.copilot/get-shit-done/workflows/execute-plan.md
@~/.copilot/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
</context>

<tasks>

<task id="T1" title="Delete 8 unreachable break statements from chooseWhoWillEvolve() switch" type="execute">
  <read_first>
    - src/app/main-game/roulette-container/roulette-container.component.ts — Read lines 236–310 to confirm current state of the switch block before making any edits.
  </read_first>
  <action>
The `chooseWhoWillEvolve(eventSource: EventSource)` method starts at line 236. Inside the
`if (this.auxPokemonList.length === 0)` guard (line 241) is a switch block (lines 242–309).
Every `case` ends with a `return` statement immediately followed by a lone `break;` on the next
line. The `break;` is unreachable and must be deleted.

Perform exactly 8 targeted single-line deletions — one per `break;` — preserving all surrounding
code verbatim. The lines to delete (in the original file) are:

1. Line 252:  `          break;`  (after `return this.buyPotions();` in case 'gym-battle')
2. Line 262:  `            break;` (after `return this.mysteriousEgg();` in case 'visit-daycare')
3. Line 272:  `          break;`  (after `return this.findItem();` in case 'battle-rival')
4. Line 282:  `          break;`  (after `return this.buyPotions();` in case 'battle-trainer')
5. Line 292:  `          break;`  (after `return this.findItem();` in case 'team-rocket-encounter')
6. Line 302:  `          break;`  (after `return this.findItem();` in case 'snorlax-encounter')
7. Line 305:  `          break;`  (after `return this.doNothing();` in case 'rare-candy')
8. Line 308:  `          break;`  (after `return this.doNothing();` in default case)

Use string-replacement edits targeting each unique context block so the correct line is removed:

Replacement 1 — gym-battle case:
  OLD:  `          return this.buyPotions();\n          break;\n        case 'visit-daycare':`
  NEW:  `          return this.buyPotions();\n        case 'visit-daycare':`

Replacement 2 — visit-daycare case:
  OLD:  `            return this.mysteriousEgg();\n            break;\n        case 'battle-rival':`
  NEW:  `            return this.mysteriousEgg();\n        case 'battle-rival':`

Replacement 3 — battle-rival case:
  OLD:  `          return this.findItem();\n          break;\n        case 'battle-trainer':`
  NEW:  `          return this.findItem();\n        case 'battle-trainer':`

Replacement 4 — battle-trainer case:
  OLD:  `          return this.buyPotions();\n          break;\n        case 'team-rocket-encounter':`
  NEW:  `          return this.buyPotions();\n        case 'team-rocket-encounter':`

Replacement 5 — team-rocket-encounter case:
  OLD:  `          return this.findItem();\n          break;\n        case 'snorlax-encounter':`
  NEW:  `          return this.findItem();\n        case 'snorlax-encounter':`

Replacement 6 — snorlax-encounter case:
  OLD:  `          return this.findItem();\n          break;\n        case 'rare-candy':`
  NEW:  `          return this.findItem();\n        case 'rare-candy':`

Replacement 7 — rare-candy case:
  OLD:  `          return this.doNothing();\n          break;\n        default:`
  NEW:  `          return this.doNothing();\n        default:`

Replacement 8 — default case:
  OLD:  `          return this.doNothing();\n          break;\n      }\n    }`
  NEW:  `          return this.doNothing();\n      }\n    }`

After all edits, verify the file compiles and tests pass.
  </action>
  <acceptance_criteria>
    - `awk 'NR>=236 && NR<=310' src/app/main-game/roulette-container/roulette-container.component.ts | grep -c 'break;'` returns `0` — no break; within the chooseWhoWillEvolve() switch block (lines 236–310)
    - `grep -c 'break;' src/app/main-game/roulette-container/roulette-container.component.ts` returns `5` — exactly 5 reachable break; statements remain in continueWithPokemon() and are untouched
    - The `chooseWhoWillEvolve` method still contains all 8 `case` labels ('gym-battle', 'visit-daycare', 'battle-rival', 'battle-trainer', 'team-rocket-encounter', 'snorlax-encounter', 'rare-candy', 'default') — confirm with `grep -n "case '" src/app/main-game/roulette-container/roulette-container.component.ts`
    - Each `return this.` call inside `chooseWhoWillEvolve` is still present: `grep -n 'return this\.' src/app/main-game/roulette-container/roulette-container.component.ts` shows at least 8 hits in that region
    - `ng build` exits with code 0 and produces zero new errors
    - `ng test --watch=false --browsers=ChromeHeadless` exits with code 0 and zero test failures
  </acceptance_criteria>
</task>

</tasks>

<verification>
```bash
# 1. No break; within chooseWhoWillEvolve() switch block (lines 236–310)
awk 'NR>=236 && NR<=310' src/app/main-game/roulette-container/roulette-container.component.ts | grep -c 'break;'
# Expected: 0

# 1b. Exactly 5 reachable break; remain in the file (in continueWithPokemon())
grep -c 'break;' src/app/main-game/roulette-container/roulette-container.component.ts
# Expected: 5

# 2. All 7 named cases still present
grep -c "case '" src/app/main-game/roulette-container/roulette-container.component.ts
# Expected: 7

# 3. Build succeeds
ng build
# Expected: exit code 0

# 4. Tests pass
ng test --watch=false --browsers=ChromeHeadless
# Expected: exit code 0, X specs, 0 failures
```
</verification>

<success_criteria>
- `awk 'NR>=236 && NR<=310'` on roulette-container.component.ts piped to `grep -c 'break;'` returns `0` (no break; in chooseWhoWillEvolve switch)
- `grep -c 'break;' roulette-container.component.ts` returns `5` (reachable breaks in continueWithPokemon() untouched)
- `ng build` exits with code 0, zero new errors or warnings
- `ng test --watch=false --browsers=ChromeHeadless` exits with code 0, zero regressions
</success_criteria>

## must_haves
- `awk 'NR>=236 && NR<=310' src/app/main-game/roulette-container/roulette-container.component.ts | grep -c 'break;'` returns `0` (all 8 unreachable break; removed from chooseWhoWillEvolve())
- `grep -c 'break;' src/app/main-game/roulette-container/roulette-container.component.ts` returns `5` (5 reachable break; in continueWithPokemon() are preserved)
- All 8 case labels in `chooseWhoWillEvolve()` switch block are still present and unchanged
- `ng build` exits with code 0 — zero errors, zero new warnings
- `ng test --watch=false --browsers=ChromeHeadless` exits with code 0 — zero test regressions

<output>
After completion, create `.planning/phases/01-dead-code-cleanup/01-dead-01-SUMMARY.md` with:
- What was changed (8 `break;` lines deleted from `chooseWhoWillEvolve()` switch)
- Exact grep verification output confirming zero hits
- Build and test pass confirmation
</output>

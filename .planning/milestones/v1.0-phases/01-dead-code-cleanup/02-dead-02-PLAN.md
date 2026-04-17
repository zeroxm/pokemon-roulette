---
id: "01-dead-02"
title: "Remove double semicolon in performTrade()"
phase: 1
wave: 1
depends_on: ["01-dead-01"]
files_modified:
  - src/app/main-game/roulette-container/roulette-container.component.ts
autonomous: true
requirements:
  - DEAD-02
---

<objective>
Remove the extraneous second semicolon (the `;;`) from line 570 of `roulette-container.component.ts`.
The statement `this.pkmnIn = structuredClone(pokemon);;` has one redundant `;` — a cosmetic typo
with no runtime effect that was flagged in the codebase audit.

Purpose: Eliminate dead code flagged in the codebase audit (DEAD-02). Runtime behavior is
identical before and after.

Output: `roulette-container.component.ts` with line 570 corrected from
`this.pkmnIn = structuredClone(pokemon);;` to `this.pkmnIn = structuredClone(pokemon);`.
CI stays green.
</objective>

<execution_context>
@~/.copilot/get-shit-done/workflows/execute-plan.md
@~/.copilot/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/01-dead-code-cleanup/01-dead-01-SUMMARY.md
</context>

<tasks>

<task id="T1" title="Replace double semicolon with single semicolon in performTrade()" type="execute">
  <read_first>
    - src/app/main-game/roulette-container/roulette-container.component.ts — Read lines 569–575 to confirm the `;;` is still present and see exact surrounding context before editing.
  </read_first>
  <action>
Locate the `performTrade(pokemon: PokemonItem)` method. The first statement inside the method body
reads:

  `    this.pkmnIn = structuredClone(pokemon);;`

Perform a single string-replacement edit:
  OLD: `    this.pkmnIn = structuredClone(pokemon);;`
  NEW: `    this.pkmnIn = structuredClone(pokemon);`

That is the entire change — remove one trailing semicolon from that line. No other lines are
touched. The surrounding lines (`this.pkmnOut = ...`, `this.pkmnTradeTitle = ...`, etc.) remain
verbatim.
  </action>
  <acceptance_criteria>
    - `grep -n ';;' src/app/main-game/roulette-container/roulette-container.component.ts` returns zero hits
    - `grep -n 'pkmnIn = structuredClone' src/app/main-game/roulette-container/roulette-container.component.ts` returns exactly one hit ending with a single `;` (not `;;`)
    - `ng build` exits with code 0 and produces zero new errors
    - `ng test --watch=false --browsers=ChromeHeadless` exits with code 0 and zero test failures
  </acceptance_criteria>
</task>

</tasks>

<verification>
```bash
# 1. No double semicolons remain anywhere in the file
grep -n ';;' src/app/main-game/roulette-container/roulette-container.component.ts
# Expected: (no output)

# 2. The corrected line reads with a single semicolon
grep -n 'pkmnIn = structuredClone' src/app/main-game/roulette-container/roulette-container.component.ts
# Expected: one hit, ending with single ;

# 3. Build succeeds
ng build
# Expected: exit code 0

# 4. Tests pass
ng test --watch=false --browsers=ChromeHeadless
# Expected: exit code 0, X specs, 0 failures
```
</verification>

<success_criteria>
- `grep -n ';;' roulette-container.component.ts` returns zero hits
- `ng build` exits with code 0, zero new errors or warnings
- `ng test --watch=false --browsers=ChromeHeadless` exits with code 0, zero regressions
</success_criteria>

## must_haves
- `grep -n ';;' src/app/main-game/roulette-container/roulette-container.component.ts` returns zero hits (double semicolon removed)
- The corrected line `this.pkmnIn = structuredClone(pokemon);` is present with exactly one trailing semicolon
- `ng build` exits with code 0 — zero errors, zero new warnings
- `ng test --watch=false --browsers=ChromeHeadless` exits with code 0 — zero test regressions

<output>
After completion, create `.planning/phases/01-dead-code-cleanup/01-dead-02-SUMMARY.md` with:
- What was changed (single `;;` → `;` on the `this.pkmnIn` assignment in `performTrade()`)
- Exact grep verification output confirming zero `;;` hits
- Build and test pass confirmation
</output>

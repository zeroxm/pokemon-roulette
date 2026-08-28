# Changelog — UAT checklist

Every **observable** change made during the remediation campaign ([TASKS.md](TASKS.md)), written as
something a human can verify by playing the game. This is the pre-push UAT script.

Entries are added as tasks merge. Internal refactors with no visible effect are listed under
**No observable change** — those still need a regression check (the game must behave *identically*),
which is exactly what makes them worth listing.

**Scope:** the `remediation/thermo-nuclear-audit` branch —
[PR #42](https://github.com/zeroxm/pokemon-roulette/pull/42). Nothing here has reached `main`.

```bash
git switch remediation/thermo-nuclear-audit    # UAT runs against this branch, not main
```

## How to run the UAT

```bash
export CHROME_BIN=/usr/bin/google-chrome-stable   # if chromium isn't installed
npm ci && npm start                                # http://localhost:4200
```

Work top to bottom. Tick each row only after seeing it with your own eyes in the running app —
a green test suite is not a substitute, since most of these are rendering and flow behaviours no
spec covers.

---

## Verify — visible changes

| # | Task | What to do | Expected | ✓ |
| --- | --- | --- | --- | --- |
| 0 | T-03 | **Throttle the network** (devtools → Slow 3G), hard-reload, and hammer the Spin button and spacebar the instant the page appears — before wheel labels render. | The Spin button is **disabled** until the wheel has labels, then enables. No console error. Critically, once the wheel is ready, **everything still works**: Spin, the settings/restart/coffee buttons, the storage PC, and rare-candy/mega-stone item clicks. Before this fix, spinning in that window permanently disabled all of them until a page reload. | [ ] |
| 1 | T-09 | Start a **Generation 9 (Paldea)** run and win any gym. Open the badges panel and hover each badge. | Every badge shows a real name (**Bug Badge**, **Grass Badge**, **Electric Badge**, **Water Badge**, **Normal Badge**, **Ghost Badge**, **Psychic Badge**, **Ice Badge**) — never a raw string like `badges.bug_paldea`. | [ ] |
| 2 | T-09 | Switch the language selector through **all six** locales (en, pt, es, fr, de, it) with gen-9 badges earned. | Badge names are translated in each. Portuguese shows *Insígnia Elétrica* / *Insígnia Normal*; German shows *Elektro-Orden* / *Normal-Orden*. No raw keys in any language. | [ ] |

| 3 | T-10 | Open the Pokédex and find an entry the app can't resolve (rare — a form id outside the National Dex). Failing that, confirm no entry anywhere shows the literal `pokemon.unknown`. | The fallback label reads **Unknown Pokémon** (localised), never the raw key. | [ ] |
| 4 | T-13 | Trigger a **Multitask** result on the adventure wheel, in a non-English locale. | The re-spin label reads e.g. *Multitarefa x2* (pt) / *Multitasking x2* (de) — not English `Multitask x2`. Then trigger a **Running Shoes** re-spin and confirm that label is still correct. | [ ] |
| 5 | T-13 | Hover an **empty item slot** in the items bar, in a non-English locale. | Tooltip reads *Vazio* / *Vacío* / *Vide* / *Leer* / *Vuoto* — not English "Empty". | [ ] |
| 6 | T-15 | Win an **Elite Four** battle with **no Pokémon able to evolve**. | The consolation modal says the *Elite Four member* gave you a Potion — not the gym-battle wording. A gym win in the same situation must still show the gym copy. | [ ] |
| 7 | T-14 | In devtools run `localStorage.setItem('language','../../../x')` and reload. | App loads normally in **English**. No failed request for a weird i18n path in the Network tab. Then set a valid `'pt'`, reload, and confirm Portuguese is restored. | [ ] |

### Regression watch for the above

| # | Check | Expected | ✓ |
| --- | --- | --- | --- |
| R1 | Badges in generations **1–8** | Unchanged — the 67 pre-existing badge names still render correctly in all six locales. | [ ] |
| R2 | **Wheel selection is honest** (T-03 touched the spin math) | Spin a large wheel — the gen-9 cave wheel has 73 segments — several times. The pointer must stop on the **same** segment the game then acts on. Also spin a 2-option wheel and a weighted wheel (gym battle odds) and confirm outcomes look right. | [ ] |
| R4 | **All six locales still load** (T-14 changed language selection) | Switch through every language in the selector; each applies and survives a reload. | [ ] |
| R5 | **Elite Four prep wheel** (T-16 deleted an orphan key from that section) | The prep wheel shows its full set of options with correct labels — nothing blank or raw. | [ ] |
| R3 | **Language switch mid-game** (T-03 changed when the wheel is considered ready) | Switch language while a wheel is on screen. Labels retranslate, the button stays usable, and the wheel still spins. | [ ] |

---

## No observable change — regression only

These tasks must leave the game behaving **exactly** as before. Verify nothing broke.

| # | Task | What changed under the hood | Regression check | ✓ |
| --- | --- | --- | --- | --- |
| N1 | T-01 | Added `.nvmrc` (Node 24). No source touched. | `npm ci && npm run build && npm test -- --watch=false --browsers=ChromeHeadless` → build passes, 230/230. | [ ] |
| N2 | T-05 | Deleted `DarkModeService` + the unreachable dark-mode toggle (12 files), 14 unused injections, the `body.dark-mode`/`body.light-mode` CSS rules, and the `dark-mode` localStorage key cleanup. `ThemeService` is now the only theming system. | **Theme switching must work identically.** Cycle all three themes (Starters / Plain Dark / Plain Light) in Settings; each applies immediately, survives a reload, and the Starters background image still renders. Check `<body>` in devtools carries exactly one `theme-*` class and **no** `dark-mode`/`light-mode` class. | [ ] |
| N3 | T-02 | Enabled `noUnusedLocals` + `noUnusedParameters`; removed 27 unused declarations across app and specs. Two roulettes gained `implements OnInit(, OnDestroy)`. One dead `getTotalWeights()` call removed from the wheel's animation frame. | **No user-visible change expected.** Spin several wheels of very different sizes — the gen-9 cave wheel (73 segments), a fishing wheel, and a 2-option yes/no wheel — and confirm each spins, lands on a segment, and reports the same segment it visually stopped on. Fishing and Snorlax roulettes must still load their Pokémon (their lifecycle hooks were re-declared). | [ ] |
| N4 | T-04 | Deleted 7 unreferenced methods (`updateTeam`, `getFirstAvailableMegaStoneNameForPokemon`, `getMegaBattleCandidates`, `getMegaStones`, `getAllItems`, `megaStoneNameForBaseId`, `retreatRound`) and 3 orphan JSON form files (`pikachu-forms`, `mimikyu-forms`, `pokemon-forms-gigantamax`). | **Nothing should change.** All seven had exactly one reference — their own declaration — and the JSON files were imported by nothing, including `angular.json`. Confirm mega-stone awards and activation still work, since three of the deletions were in that area. | [ ] |
| N5 | T-06 | `@angular/localize` promoted to a real dependency (it was only reaching the build as a transitive of a **devDependency**, while `angular.json` loads it as a runtime polyfill). Dropped `@angular/animations`, `@angular/platform-browser-dynamic` and `@popperjs/core` as direct deps. | **ng-bootstrap behaviour is the thing to watch** — `@angular/animations` is now fully absent (it was an *optional* peer). Open several modals: gym battle result, item found, evolution, the mega-evolution animation, and the storage PC. Each must open, animate/transition, and close normally. Also confirm tooltips and dropdowns still behave. | [ ] |
| N6 | T-07 | Replaced `GENERATION_GAME_CONFIG` — nine identical rows of `{ gymCount: 8, eliteFourCount: 4 }` consulted through a fallback of the same value — with two named constants. `GameStateService` no longer injects `GenerationService`. | **League shape must be unchanged.** Play a run and count: 8 gyms with an "adventure continues" between each (7 of them), then Elite Four prep, then 4 Elite Four battles, then the champion. Do this on **two different generations** to confirm nothing was generation-specific. Restart mid-run and confirm the same shape rebuilds. | [ ] |
| N7 | T-08 | Removed a dead `Array.isArray(x.quotes) ? x.quotes : x.quotes` ternary from the gym, elite-four and champion roulettes, plus rival's differently-dead variant. `quotes` is typed `string[]` and all 126 data entries are arrays, so the check was always true. | **Split-trainer battles are the check.** These sites only run where one entry covers two trainers: **gym gen 5 & gen 8**, **elite four**, **champion**, and **rival gen 6** (Serena/Calem, chosen by player gender). Reach one of each and confirm the opponent's name, sprite and quote all belong to the *same* trainer — a mismatch would mean the index wiring broke. | [ ] |

### Notes on N2

- **Test count intentionally drops 230 → 228.** Two `should create` scaffolds were deleted along with
  their components. This is expected, not a regression.
- **Existing players keep a stale `dark-mode` key** in localStorage. Nothing reads it; the cleanup was
  removed deliberately since the game has been live long enough for the population to be negligible.
  To simulate a returning player: `localStorage.setItem('dark-mode','true')`, reload, confirm the theme
  is unaffected and the page renders normally.
- **Watch for unstyled backgrounds.** The deleted CSS rules set the same colours as `theme-plain-dark`
  / `theme-plain-light`, and only source order made them harmless. If any surface loses its background,
  this is the change that did it.

### Notes on N3

- **The wheel is the risk area.** An overly broad edit initially deleted five `const totalWeight` lines
  instead of the one dead one — four were load-bearing in `drawWheel`, `spinWheel`,
  `getCurrentSegment` and `getRandomWeightedIndex`. The compiler caught it and only the dead line was
  removed, but wheel *selection* is worth a real look during UAT: spin a large wheel repeatedly and
  confirm the pointer lands on the segment that gets reported.
- **`grantMegaStone` lost an unused `pokemon` parameter.** Mega stone awards after important battles
  should still grant the right stone — worth confirming if a run reaches one.
- **Spec fixes removed write-only variables**, several of which were `TestBed.inject(...)` results
  assigned but never read. No test behaviour changed; count stays 228.

---

## Pre-push gate

Do not push until every box above is ticked **and**:

| Check | Expected | ✓ |
| --- | --- | --- |
| `npm run build` | passes | [ ] |
| `npm test -- --watch=false --browsers=ChromeHeadless` | 234/234 at time of writing (baseline 230; `T-05` −2, `T-03` +6) | [ ] |
| i18n parity script (see `CLAUDE.md`) | all five non-English locales report `ok` | [ ] |
| `git log --oneline --graph` | one `--no-ff` merge per task, no stray commits | [ ] |
| Both audit reports | empty and deleted | [ ] |
| A full playthrough | start → 8 gyms → Elite Four → champion, no console errors | [ ] |

---

## Notes for the UAT runner

- **Restart-related tasks (T-21, T-22) need cross-run testing.** Several bugs only appear when you
  restart mid-run and start a *second* game in the same browser session. Reloading the page hides
  them — use the in-game restart button.
- **Mega-evolution tasks (T-23, T-24) need a mega stone**, which is awarded after important battles —
  budget a full run to reach one.
- **`T-03` is best tested first**, while you still have throttling set up — it needs a slow load to
  reproduce, and its failure mode (every control silently dead) is easy to mistake for something else
  later in the session.
- Keep the browser console open throughout. Several findings (`SEC-09`, `SEC-24`) surface as unhandled
  errors rather than visible breakage.

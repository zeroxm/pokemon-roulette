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

| 8 | T-11 | Start a **Generation 8 (Galar)** run and reach the fishing roulette several times. | The wheel shows a **wide variety** of Pokémon — Magikarp, Chewtle, Arrokuda, Goldeen, Feebas, Tentacool, Wooper and many more. Previously it only ever showed Chewtle (twice on the wheel), Arrokuda and Barraskewda. | [ ] |
| 9 | T-11 | On that same gen-8 fishing wheel (45 segments), **read the segment labels**. | Labels are small but **legible and not overlapping**. This is the font-size clamp working; before this change a wheel this size drew labels at roughly double the intended size until the window was resized. | [ ] |

| 10 | T-12 | Visit a bad URL, e.g. `http://localhost:4200/#/nonsense` or any mistyped path. | A real 404 page: translated heading, the "fled into the tall grass" message, and a **working button back to the game**. Previously this rendered the Angular scaffold text `not-found works!`. Check it in a non-English locale too. | [ ] |

### Regression watch for the above

| # | Check | Expected | ✓ |
| --- | --- | --- | --- |
| R1 | Badges in generations **1–8** | Unchanged — the 67 pre-existing badge names still render correctly in all six locales. | [ ] |
| R6 | **Other generations' fishing wheels unchanged** | Gen 1–7 and gen 9 fishing wheels still show their usual species and label sizes. | [ ] |
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

| N8 | T-17 | The six inline `ng-template` modals moved out of the container into four components under `roulette-container/modals/`. Evolve+trade merged (identical markup, two differing phrases); consolation-prize+item-activation merged likewise. The container's stylesheet — which was 100% modal styling — was deleted, its rules moving to a shared `modal-shared.css`. | **Every modal must look and behave exactly as before.** Open all six: a consolation prize (win a battle with nothing able to evolve), an item activating (Escape Rope), an evolution, a trade, the Team Rocket recovery notice, and the Team Rocket failure (Entei). Check for each: heading, sprite(s), message text, button label, and that the **Ok button closes only that modal** — any queued modal behind it must still appear. | [ ] |

| N9 | T-18 | `GameStateService.setNextStates(...)` queues several states in play order; eight call sites that pushed backwards now read forwards. | **Game flow order must be identical.** Exercise each converted path: an evolution after a battle, a "catch two"/"catch three" result, a multitask double re-spin, Team Rocket stealing a Pokémon, and a second evolution via exp-share. In each, the wheels must appear in the same sequence as before. | [ ] |

| N10 | T-19/T-20 | The consolation-prize switch became a `Record<EventSource, ConsolationPrize>` table; the four modal-then-continue blocks became one `showModalThenContinue` helper. Two sprite URLs were normalised from `refs/heads/master/...` to `master/...` to match their siblings. | **Every consolation prize must still be right.** Win each of these with **nothing able to evolve** and check the modal copy matches the event: gym battle, Elite Four, a trainer battle, the daycare (egg), a rival battle, Team Rocket, and Snorlax. Confirm the **sprite loads** in each — the two normalised URLs are the ones to watch (egg and the generic unknown item). Also verify "less explanations" still skips the evolution/trade modals, and that the Team Rocket failure modal still appears **even with that setting on**. | [ ] |

| N11 | T-21 | Wheel selections now carry their own continuation. Three `GameState` members that rendered nothing (`evolve-pokemon`, `select-evolution`, `steal-pokemon`) and both mega-stone dispatchers are deleted. A `@default` arm was added to the state switch. | **Exercise every "pick one of these" wheel.** Choose who evolves (2+ candidates); pick which evolution (a branching line like Eevee); Team Rocket stealing (pick which Pokémon leaves); a trade (pick what you send); the exp-share second evolution; and the mega-stone award (pick the Pokémon, then pick the stone). Each must show the right heading, the right options, and do the right thing with your pick. | [ ] |
| N12 | T-21 | Mega-stone award ordering fix (`SEC-06`). | Win an important battle with **2+ mega-eligible Pokémon**, one holding **2+ unowned stones**. Pick the Pokémon — the **stone wheel must appear next**, titled "which stone". Previously the check-evolution wheel appeared first and the stone wheel surfaced later wearing the wrong title ("Who will evolve?"). | [ ] |

| N13 | T-22 | Run-scoped game rules (evolution credits, exp-share, running shoes, stolen Pokémon) moved from the container into `GameStateService`, cleared by one reset. Transient container state is now wiped whenever a new run starts. | **The bug only shows on a SECOND run — use the in-game restart, not a page reload.** Play until you have some state (a few failed evolution rolls, a Team Rocket theft, an unspun mega-stone award), restart, then in the new run check: the first check-evolution roll is **not** already near-guaranteed; defeating Team Rocket does **not** hand you a Pokémon from the previous run; and the first multi-candidate evolution actually happens. | [ ] |
| N14 | T-22 | Exp-share bonus release (`SEC-07`). | Trigger an evolution where the exp-share has **no second Pokémon** to evolve. Then trigger another evolution that **does** have one — the bonus second evolution must happen. Previously it was silently skipped every other time. | [ ] |
| N15 | T-22 | Multitask labels are queued per spin. | Trigger a **Multitask** result, then during those bonus spins use an **Escape Rope**. The multitask labels ("Multitask x2", then "x1") must still appear on the multitask spins — the escape rope must not eat one. | [ ] |

| N16 | T-23 | Every form change — mega, Aegislash/Ogerpon sticky forms, Palafin's Hero form — now runs through one `FormRuleService` instead of four separate code paths. `TrainerService` lost 140 lines. | **This touches every form change in the game.** Verify: Palafin becomes Hero on entering a battle and reverts after; Aegislash flips to Blade form for a battle and **stays** Blade; Ogerpon re-rolls a mask; and a mega evolution activates from a tapped stone and reverts after the fight. A **shiny** Pokémon must stay shiny through every one of those swaps. | [ ] |
| N17 | T-23 | Three bugs made structurally impossible. | **(a)** Use a **Rare Candy during a battle** — Aegislash must still be in Blade form afterwards, not back in Shield. **(b)** Mega-evolve, then **drag that Pokémon into the PC** before the battle ends — it must revert to its base form, not stay mega forever. **(c)** After doing (b), earn another stone in the same run — mega evolution must **still work**. All three were broken before. | [ ] |

| N18 | T-24 | Each mega form now names its own stone, replacing a second table joined by array position. Two unreachable Greninja entries were removed. Reverting a mega form keeps the sprite it already had. | **Mega evolution must work exactly as before.** Reach a mega stone, tap it in battle, and confirm the right Pokémon becomes the right mega form — then that it reverts afterwards **without the sprite blanking and reloading**. For a Pokémon with two stones (Charizard, Mewtwo, Raichu), confirm the stone you hold selects the matching form (X vs Y). | [ ] |

| N19 | T-25 | Sounds are now identified by name rather than by a per-caller handle. Five parallel maps became one clip object; the eight handle fields at call sites are gone. | **Every sound must still play.** Spin a wheel (click ticks), find an item, open and close the storage PC (boot → login, then logout), and tap a mega stone (tap, then the mega-evolution sound). Toggle **mute** in settings and confirm sounds respect it. Then background the tab mid mega-evolution and return — the game must not be stuck waiting. | [ ] |

| N20 | T-26 | Weighted selection and the spin animation were extracted from `WheelComponent`. Four wheel defects fixed with them. | **(a)** Spin, then **resize the window** — the wheel must stay visible, not go blank until the next spin. On mobile, scrolling collapses the URL bar and triggers this. **(b)** Spin the same wheel several times — the durations should **vary**, not be identical every time. **(c)** The label above the wheel must show a **real Pokémon/option name**, not a raw key. **(d)** Start a spin and let the result change the screen — no console errors, no ghost clicking sounds afterwards. | [ ] |

| N21 | T-27 | Five roulettes that differed only in a title key and a field name (fishing, fossil, legendary, starter, cave) are now one component driven by a named pool. Their `*-by-generation.ts` data files are untouched. | **All five wheels must look and behave exactly as before.** Reach each one: the **starter** pick at the start of a run, **fishing**, **fossil**, a **legendary encounter**, and **exploring a cave**. Check the heading text is right for each, that the generation appears in brackets on all of them **except starters**, and that picking a Pokémon does what it always did. | [ ] |

| N22 | T-28 | The win/lose odds calculation and the split-trainer routine, each duplicated across four battle roulettes, moved into the shared base and a pure helper. | **Battle difficulty must feel unchanged.** Fight a gym, an Elite Four member, the champion and a rival, and confirm the wheels look like they always did — the champion should still be visibly the hardest. Check the **type-advantage panel** on gym and Elite Four battles renders its icons. Then reach a **split trainer** (gen 5 or 8 gym, gen 8 Elite Four, gen 7 champion, gen 6 rival) and confirm the name, sprite and quote all belong to the *same* trainer. | [ ] |

| N23 | T-29 | Every `<img>` now falls back to the local placeholder if it fails to load, and the one sprite-fetch subscriber handles errors instead of throwing. | **Simulate the outage.** In devtools, block `raw.githubusercontent.com` (Network request blocking) and reload. The game must stay **usable**: wheels spin, battles resolve, the team panel and Pokédex render — every missing image shows the placeholder rather than a broken-image icon, and the console shows no unhandled errors. Then unblock and confirm sprites return. | [ ] |

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

### Notes on N8

- **CSS is the risk.** Angular scopes component styles, so markup moving into a child component
  loses the parent's rules. All shared modal styling was moved to `modal-shared.css` and the three
  identical panel classes (`.item-panel`, `.pokemon-switch-panel`, `.explain-panel`) collapsed into
  one `.panel`. If a modal looks unstyled — wrong layout, missing message box border, sprites
  stacked vertically — this is the change that did it.
- **Closing changed mechanism.** The templates called the container's `closeModal()`, which ran
  `dismissAll()` and tore down *every* open modal. Each component now closes only itself via
  `NgbActiveModal`. This is the intended behaviour, but it is a real behavioural difference worth
  watching where modals chain.
- The Entei image's `alt` text was a hardcoded Portuguese in-joke; it now uses the existing
  `pokemon.entei` key and is localised.

### Notes on N11 / N12

- **This is the deepest change so far.** Every selection wheel routes through a new mechanism. If a
  wheel shows the wrong heading, wrong options, or your pick does nothing, this is the cause.
- **One asymmetry was preserved, not fixed.** The exp-share second evolution shows the evolution
  modal when the Pokémon has several possible evolutions but not when it has exactly one. That
  predates this change; it is now visible in one place rather than split across two methods, and is
  worth deciding on separately.
- **A `@default` arm now exists.** If you ever see "Something went off the map", a state was queued
  with no matching wheel — please report which action triggered it.

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

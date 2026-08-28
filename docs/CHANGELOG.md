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
| 4 | T-13 | Trigger a **Multitask** result on the adventure wheel, in a non-English locale. | The re-spin label reads e.g. *Multitarefa x2* (pt) / *Multitasking x2* (de) — not English `Multitask x2`. Then trigger a **Running Shoes** re-spin and confirm that label is still correct. | [ ] |
| 6 | T-15 | Win an **Elite Four** battle with **no Pokémon able to evolve**. | The consolation modal says the *Elite Four member* gave you a Potion — not the gym-battle wording. A gym win in the same situation must still show the gym copy. | [ ] |

| 8 | T-11 | Start a **Generation 8 (Galar)** run and reach the fishing roulette several times. | The wheel shows a **wide variety** of Pokémon — Magikarp, Chewtle, Arrokuda, Goldeen, Feebas, Tentacool, Wooper and many more. Previously it only ever showed Chewtle (twice on the wheel), Arrokuda and Barraskewda. | [ ] |
| 9 | T-11 | On that same gen-8 fishing wheel (45 segments), **read the segment labels**. | Labels are small but **legible and not overlapping**. This is the font-size clamp working; before this change a wheel this size drew labels at roughly double the intended size until the window was resized. | [ ] |


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

| N24 | T-30 | Champion and rival battle modals now go through the modal queue like the others; dismissing any modal no longer logs an unhandled rejection. | Fight a **champion** and a **rival**. Their presentation modals must appear, and closing one by **clicking the backdrop or pressing Esc** must leave no error in the console. Use a potion during a champion fight and confirm the item modal appears in order. | [ ] |
| N25 | T-31/T-32/T-33 | Defensive cleanups: a stored settings blob is now validated field by field, an unknown trainer generation falls back to a placeholder, and a few silent failure paths now warn. | **Corrupt your settings deliberately.** In devtools: `localStorage.setItem('pokemon-roulette-settings','{"muteAudio":null,"defaultGender":"banana"}')`, reload. The game must start normally with **audio unmuted** and gender set to **Always Choose** — not crash, not stick on a broken value. Then set `'{not json'` and reload: same result. | [ ] |

| N26 | T-34 | `WheelItem.weight` is now optional and defaults to 1; the running-shoes re-spin reads the state it actually inspects. | **Wheel proportions must be unchanged.** Spin a wheel where one option is deliberately weighted — the **gym battle odds** wheel, where team power adds winning slices — and confirm the green/red proportions still reflect your team's strength. Then trigger a **Running Shoes** re-spin and confirm it grants exactly one extra spin, labelled as such. | [ ] |

| N27 | T-35 | Angular patched 21.2.7 → 21.2.22, clearing every advisory in shipped code. Build budgets set to honest values. CI now fails on a high-or-worse production advisory. | **This is a framework patch bump — exercise the app broadly.** A full run start to champion, all six languages, every modal, the storage PC, mega evolution, and the Pokédex. Watch the console for anything new. The tests cover a lot, but a framework bump is exactly the thing they cover least. | [ ] |

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

## T-39 — mega evolution no longer fires by itself

Found during this UAT and fixed. Entering a battle used to mega-evolve any team member whose stone
you were carrying, without being asked. A regression introduced by T-23's form-rule migration.

| # | What to do | Expected | ✓ |
| --- | --- | --- | --- |
| 40 | Earn a mega stone, then enter a battle with the matching Pokémon on your team. **Do not tap anything.** | The Pokémon stays in its **base form**. Nothing mega-evolves on its own. | [ ] |
| 41 | Now tap the mega stone in the items bar during that battle. | It mega-evolves, with the animation (or instantly, if *Skip Mega Evolution Animation* is on). | [ ] |
| 42 | Finish that battle and check the Pokémon afterwards — in the team **and** in the storage PC if you move it there mid-battle. | Back to base form, keeping its shiny status and stats. | [ ] |
| 43 | Enter a battle with **Palafin** on the team, and separately with **Aegislash** or **Ogerpon**. | These still transform automatically on battle entry — only mega became manual. | [ ] |
| 44 | Tap the stone, then let the battle advance a step (a potion retry, an X-Attack). | The mega form stays active; it is not reverted or re-applied mid-battle. | [ ] |

---

## T-38 — toolchain upgrade (added after the campaign closed)

Angular 21 → 22, ng-bootstrap 20 → 21, ngx-translate 17 → 18, ng-icons 33 → 35,
TypeScript 5.9 → 6.0, and the removal of `@angular-devkit/build-angular`. This took
`npm audit` to **0 vulnerabilities with dev dependencies included**, up from 7.

This is the highest-risk block in the whole UAT and the least covered by tests: it changes
the framework's change-detection default, the HTTP transport, and the entire i18n loader.
**Run these first — a failure here invalidates everything below.**

| # | What to do | Expected | ✓ |
| --- | --- | --- | --- |
| 30 | Load the app and read any screen. | Real words everywhere. **A page full of raw keys** (`game.main.roulette.generation.title`) means the i18n loader is misconfigured — this exact failure shipped mid-upgrade and passed all 299 tests. Verified fixed, but it is the first thing to look at. | [ ] |
| 31 | Switch through **all six** locales, then reload. | Each locale loads fully; the choice survives the reload. `getDefaultLang` → `getFallbackLang` was renamed in this upgrade, and that is the code path behind language restore. | [ ] |
| 32 | Play a full run with the console open. | No `ExpressionChangedAfterItHasBeenChecked`, and **no view that fails to repaint after an action** — a stale panel, a counter that does not tick, a modal that opens blank. v22 makes OnPush the default; every component declares `Eager` to keep today's behaviour, and a missed one shows up exactly like that. | [ ] |
| 33 | Watch sprites load across a run — team, Pokédex, storage PC. | Sprites appear, and failures still fall back to the local placeholder. HttpClient stayed on XHR (`withXhr()`) rather than v22's fetch default, so the sprite fetcher's 3× retry and error paths are unchanged — confirm that is still true in practice. | [ ] |
| 34 | Open Settings and toggle every checkbox; open a Pokémon switch modal and an item modal. | Toggles reflect state correctly, and both modals show their sprites. These are the 8 bindings where v22 changed `a?.b` from `null` to `undefined` and the migration's wrapper was removed. | [ ] |
| 35 | Use ng-bootstrap UI: modals, tooltips, the badges panel. | Unchanged look and behaviour. ng-bootstrap went up a major version in the same commit. | [ ] |

---

## Pre-push gate

Do not push until every box above is ticked **and**:

| Check | Expected | ✓ |
| --- | --- | --- |
| `npm run build` | passes | [ ] |
| `npm test -- --watch=false --browsers=ChromeHeadless` | **305/305** (baseline 230) | [ ] |
| `npm audit` (dev deps included, not just `--omit=dev`) | `found 0 vulnerabilities` | [ ] |
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
- **T-38 changes the framework itself.** Its rows are numbered 30+ but should be run *first*; if
  strings do not render or views do not repaint, stop and report that before working through the
  campaign's own findings — those results would be meaningless.
- Keep the browser console open throughout. Several findings (`SEC-09`, `SEC-24`) surface as unhandled
  errors rather than visible breakage.

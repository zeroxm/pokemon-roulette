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

## No observable change — regression only

These tasks must leave the game behaving **exactly** as before. Verify nothing broke.

| # | Task | What changed under the hood | Regression check | ✓ |
| --- | --- | --- | --- | --- |





| N14 | T-22 | Exp-share bonus release (`SEC-07`). | Trigger an evolution where the exp-share has **no second Pokémon** to evolve. Then trigger another evolution that **does** have one — the bonus second evolution must happen. Previously it was silently skipped every other time. | [ ] |
| N15 | T-22 | Multitask labels are queued per spin. | Trigger a **Multitask** result, then during those bonus spins use an **Escape Rope**. The multitask labels ("Multitask x2", then "x1") must still appear on the multitask spins — the escape rope must not eat one. | [ ] |

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

| N27 | T-35 | Build budgets set to honest values; CI fails on a high-or-worse production advisory. **Superseded in part:** the Angular 21.2.7 → 21.2.22 patch this row described was overtaken by T-38's upgrade to Angular 22. | The framework check now lives in rows **30–35**, which exercise it properly — do it there, not twice. What is left here: the build reports no breached budget, and `npm audit` is clean. | [ ] |

### Notes on N14

- **One asymmetry was preserved, not fixed.** The exp-share second evolution shows the evolution
  modal when the Pokémon has several possible evolutions but not when it has exactly one. That
  predates the campaign; it is now visible in one place rather than split across two methods, and is
  worth deciding on separately.

---

## T-41 — two bugs found in UAT

| # | What to do | Expected | ✓ |
| --- | --- | --- | --- |
| 60 | Hold **both Charizardite X and Charizardite Y**, then tap **Y** in a battle. | Charizard becomes **Mega Charizard Y**. Repeat tapping **X** in a later battle: **Mega X**. Before this fix both stones produced X. | [ ] |
| 61 | Do the same for any other two-stone species (**Mewtwo**). | The tapped stone decides the form. | [ ] |
| 62 | Fill the item bag past six items, so the **second row** is populated. | Every slot shows **its own** sprite and its own tooltip. Previously the first slot of the second row showed the sprite of the last slot of the first row. | [ ] |
| 63 | Leave the bag with exactly six items. | The seventh slot is **empty** — placeholder art, "Empty" tooltip. It used to borrow the sixth item's sprite, so an empty slot appeared to hold a potion. | [ ] |
| 64 | Click items in the second row — a **rare candy** or a **mega stone** placed there. | The item that activates is the one you clicked, and its sprite matched what you saw. | [ ] |

---

## T-40 — new: Mimikyu's Disguise

A new mechanic, requested during UAT. When a battle spin is lost and **no potion is left**, Mimikyu's
Disguise takes the hit instead: you get another spin, Mimikyu is busted for the **rest of that
battle**, and the disguise is repaired when the fight ends. Once per battle, reusable in the next one.

| # | What to do | Expected | ✓ |
| --- | --- | --- | --- |
| 50 | Lose a spin with a Mimikyu on the team **while still holding a potion**. | The **potion is used first**. The disguise is untouched — Mimikyu still looks normal. | [ ] |
| 51 | Now lose a spin with **no potions at all**. | A modal explains the disguise broke and you get another chance. The battle does **not** end. The retry banner reads **"Disguise x1"** where a potion would have read "Potion x1". | [ ] |
| 52 | Look at Mimikyu in the team panel **during** that battle. | It shows the **busted** artwork — a real sprite, not the placeholder. | [ ] |
| 53 | Win the battle, then look at Mimikyu again. | The disguise is **back on**, and it keeps its shiny status and any power it had gained. | [ ] |
| 54 | Lose again with no potions **in the same battle** (catch a second Mimikyu if you can). | No second rescue — the disguise is once per **battle**, not once per Mimikyu. | [ ] |
| 55 | Reach the **next** battle and lose with no potions. | It works again. Every battle gets one rescue while Mimikyu is on the team. | [ ] |
| 56 | Repeat 51 in the **Elite Four** and against the **Champion**. | Works the same in all three battle types. | [ ] |
| 57 | Check the modal and the retry banner in **all six locales**. | Translated everywhere; the busted form is named in each language (fr *Mimiqui*, de *Mimigma*). No raw keys. | [ ] |
| 58 | Compare the win/lose wheel before and after the disguise busts. | The odds are **unchanged** — the disguise is a free retry, not a stat change. | [ ] |
| 59 | Watch the network tab while the disguise busts. | **No request to pokeapi.co.** The busted artwork is hard-linked, because PokéAPI has no official artwork for that form. | [ ] |

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
| `npm test -- --watch=false --browsers=ChromeHeadless` | **326/326** (baseline 230) | [ ] |
| `npm audit` (dev deps included, not just `--omit=dev`) | `found 0 vulnerabilities` | [ ] |
| i18n parity script (see `CLAUDE.md`) | all five non-English locales report `ok` (2,207 keys) | [ ] |
| `git log --oneline --graph` | one `--no-ff` merge per task, no stray commits | [ ] |
| **Remove the N16/N17 storage seed** | `seedStorageForFormTesting` deleted from `roulette-container.component.ts`, and its call in `handleTrainerSelected` | [ ] |
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
- **A `@default` arm now exists on the container's state switch.** If you ever see "Something went
  off the map", a state was queued with no matching wheel — please report which action triggered it.
- **Six Pokémon are seeded into the storage PC at the start of every run** while N16/N17 are under
  test — Aegislash, Ogerpon, Palafin, Charizard, Blastoise and Venusaur. Move whichever you need onto
  the team. Unlike the earlier Mimikyu aid this one is **not gated on `environment.production`**, so
  it would reach a real build: the pre-push gate above requires deleting it.
  Mega stones are **not** seeded — Charizard, Blastoise and Venusaur still need one awarded after an
  important battle before they can mega-evolve.
- Keep the browser console open throughout. Several findings (`SEC-09`, `SEC-24`) surface as unhandled
  errors rather than visible breakage.

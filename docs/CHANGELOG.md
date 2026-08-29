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
| N25 | T-31/T-32/T-33 | Defensive cleanups: a stored settings blob is now validated field by field, an unknown trainer generation falls back to a placeholder, and a few silent failure paths now warn. | **Corrupt your settings deliberately.** In devtools: `localStorage.setItem('pokemon-roulette-settings','{"muteAudio":null,"defaultGender":"banana"}')`, reload. The game must start normally with **audio unmuted** and gender set to **Always Choose** — not crash, not stick on a broken value. Then set `'{not json'` and reload: same result. | [ ] |

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
| `npm test -- --watch=false --browsers=ChromeHeadless` | **336/336** (baseline 230) | [ ] |
| `npm audit` (dev deps included, not just `--omit=dev`) | `found 0 vulnerabilities` | [ ] |
| i18n parity script (see `CLAUDE.md`) | all five non-English locales report `ok` (2,207 keys) | [ ] |
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
- **A `@default` arm now exists on the container's state switch.** If you ever see "Something went
  off the map", a state was queued with no matching wheel — please report which action triggered it.
- Keep the browser console open throughout. Several findings (`SEC-09`, `SEC-24`) surface as unhandled
  errors rather than visible breakage.

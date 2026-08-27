# Changelog — UAT checklist

Every **observable** change made during the remediation campaign ([TASKS.md](TASKS.md)), written as
something a human can verify by playing the game. This is the pre-push UAT script.

Entries are added as tasks merge. Internal refactors with no visible effect are listed under
**No observable change** — those still need a regression check (the game must behave *identically*),
which is exactly what makes them worth listing.

**Scope:** local `main` only. Nothing here has been pushed to the remote.

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

### Regression watch for the above

| # | Check | Expected | ✓ |
| --- | --- | --- | --- |
| R1 | Badges in generations **1–8** | Unchanged — the 67 pre-existing badge names still render correctly in all six locales. | [ ] |
| R2 | **Wheel selection is honest** (T-03 touched the spin math) | Spin a large wheel — the gen-9 cave wheel has 73 segments — several times. The pointer must stop on the **same** segment the game then acts on. Also spin a 2-option wheel and a weighted wheel (gym battle odds) and confirm outcomes look right. | [ ] |
| R3 | **Language switch mid-game** (T-03 changed when the wheel is considered ready) | Switch language while a wheel is on screen. Labels retranslate, the button stays usable, and the wheel still spins. | [ ] |

---

## No observable change — regression only

These tasks must leave the game behaving **exactly** as before. Verify nothing broke.

| # | Task | What changed under the hood | Regression check | ✓ |
| --- | --- | --- | --- | --- |
| N1 | T-01 | Added `.nvmrc` (Node 24). No source touched. | `npm ci && npm run build && npm test -- --watch=false --browsers=ChromeHeadless` → build passes, 230/230. | [ ] |
| N2 | T-05 | Deleted `DarkModeService` + the unreachable dark-mode toggle (12 files), 14 unused injections, the `body.dark-mode`/`body.light-mode` CSS rules, and the `dark-mode` localStorage key cleanup. `ThemeService` is now the only theming system. | **Theme switching must work identically.** Cycle all three themes (Starters / Plain Dark / Plain Light) in Settings; each applies immediately, survives a reload, and the Starters background image still renders. Check `<body>` in devtools carries exactly one `theme-*` class and **no** `dark-mode`/`light-mode` class. | [ ] |
| N3 | T-02 | Enabled `noUnusedLocals` + `noUnusedParameters`; removed 27 unused declarations across app and specs. Two roulettes gained `implements OnInit(, OnDestroy)`. One dead `getTotalWeights()` call removed from the wheel's animation frame. | **No user-visible change expected.** Spin several wheels of very different sizes — the gen-9 cave wheel (73 segments), a fishing wheel, and a 2-option yes/no wheel — and confirm each spins, lands on a segment, and reports the same segment it visually stopped on. Fishing and Snorlax roulettes must still load their Pokémon (their lifecycle hooks were re-declared). | [ ] |

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

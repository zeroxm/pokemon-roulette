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
| 1 | T-09 | Start a **Generation 9 (Paldea)** run and win any gym. Open the badges panel and hover each badge. | Every badge shows a real name (**Bug Badge**, **Grass Badge**, **Electric Badge**, **Water Badge**, **Normal Badge**, **Ghost Badge**, **Psychic Badge**, **Ice Badge**) — never a raw string like `badges.bug_paldea`. | [ ] |
| 2 | T-09 | Switch the language selector through **all six** locales (en, pt, es, fr, de, it) with gen-9 badges earned. | Badge names are translated in each. Portuguese shows *Insígnia Elétrica* / *Insígnia Normal*; German shows *Elektro-Orden* / *Normal-Orden*. No raw keys in any language. | [ ] |

### Regression watch for the above

| # | Check | Expected | ✓ |
| --- | --- | --- | --- |
| R1 | Badges in generations **1–8** | Unchanged — the 67 pre-existing badge names still render correctly in all six locales. | [ ] |

---

## No observable change — regression only

These tasks must leave the game behaving **exactly** as before. Verify nothing broke.

| # | Task | What changed under the hood | Regression check | ✓ |
| --- | --- | --- | --- | --- |
| N1 | T-01 | Added `.nvmrc` (Node 24). No source touched. | `npm ci && npm run build && npm test -- --watch=false --browsers=ChromeHeadless` → build passes, 230/230. | [ ] |

---

## Pre-push gate

Do not push until every box above is ticked **and**:

| Check | Expected | ✓ |
| --- | --- | --- |
| `npm run build` | passes | [ ] |
| `npm test -- --watch=false --browsers=ChromeHeadless` | 230/230 (or higher, as tasks add specs) | [ ] |
| i18n parity script (see `CLAUDE.md`) | all five non-English locales report `ok` | [ ] |
| `git log --oneline --graph` | one `--no-ff` merge per task, no stray commits | [ ] |
| Both audit reports | empty and deleted | [ ] |
| A full playthrough | start → 8 gyms → Elite Four → champion, no console errors | [ ] |

---

## Notes for the UAT runner

- **Restart-related tasks (T-21, T-22) need cross-run testing.** Several bugs only appear when you
  restart mid-run and start a *second* game in the same browser session. Reloading the page hides
  them — use the in-game restart button.
- **T-03 needs a throttled connection.** The wheel soft-lock only reproduces when translations are
  still loading, so test it with network throttling on and click Spin immediately.
- **Mega-evolution tasks (T-23, T-24) need a mega stone**, which is awarded after important battles —
  budget a full run to reach one.
- Keep the browser console open throughout. Several findings (`SEC-09`, `SEC-24`) surface as unhandled
  errors rather than visible breakage.

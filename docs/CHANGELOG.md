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
| i18n parity script (see `CLAUDE.md`) | all five non-English locales report `ok` (2,208 keys) | [ ] |
| `git log --oneline --graph` | 30 `--no-ff` task merges for the campaign proper (T-01…T-38); the UAT-era work (T-39…T-42) is committed straight onto the branch, since each fix was a response to a specific finding rather than a planned task | [ ] |
| Both audit reports | empty and deleted | [ ] |
| No UAT seeds left in the source | `grep -rn 'ForTesting\|seedTest' src/` returns nothing — four temporary seeds were added and removed during UAT | [ ] |
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

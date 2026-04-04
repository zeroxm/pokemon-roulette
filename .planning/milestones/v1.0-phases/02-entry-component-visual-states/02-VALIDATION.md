# Phase 2: Entry Component & Visual States — Validation Architecture

**Generated from:** 02-RESEARCH.md Validation Architecture section
**Phase:** 02-entry-component-visual-states

---

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Karma 6.4.4 + Jasmine 6.1.0 |
| Config file | `angular.json` (lines 76-96) |
| Quick run command | `ng test --include="**/pokedex-entry/**" --watch=false --browsers=ChromeHeadless` |
| Full suite command | `ng test --no-watch --browsers=ChromeHeadless` |

---

## Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIS-01 | `.pokedex-cell-front img` src contains `unknown.png` when `entry` is undefined | unit | `ng test --include="**/pokedex-entry/**" --watch=false --browsers=ChromeHeadless` | ❌ Wave 0 |
| VIS-01 | No `<img>` in `.pokedex-cell-back` when unseen | unit | same | ❌ Wave 0 |
| VIS-02 | `.pokedex-cell-back img` exists with `getAttribute('loading') === 'lazy'` when seen | unit | same | ❌ Wave 0 |
| VIS-03 | `.won` CSS class present on `.pokedex-cell` when `entry.won === true` | unit | same | ❌ Wave 0 |
| VIS-03 | `.won` CSS class absent when `entry.won === false` | unit | same | ❌ Wave 0 |
| VIS-04 | `.number-badge` element exists with correct `#001` / `#1011` formatted text in all states | unit | same | ❌ Wave 0 |
| VIS-05 | `isSeen` is `false` when `entry` is `undefined`; `true` when defined | unit | same | ❌ Wave 0 |
| VIS-05 | `pokemonText` returns i18n key (e.g. `'pokemon.pikachu'`) | unit | same | ❌ Wave 0 |
| VIS-06 | `.seen` CSS class present on `.pokedex-cell` when `entry` is defined | unit | same | ❌ Wave 0 |
| VIS-06 | `.seen` CSS class absent when `entry` is `undefined` | unit | same | ❌ Wave 0 |

---

## Sampling Rate

- **Per task commit:** `ng test --include="**/pokedex-entry/**" --watch=false --browsers=ChromeHeadless`
- **Per wave merge:** `ng test --no-watch --browsers=ChromeHeadless` (full suite — confirm no regressions)
- **Phase gate:** Full suite green before `/gsd-verify-work`

---

## Wave 0 Gaps (files to create)

- [ ] `src/app/pokedex/pokedex-entry/pokedex-entry.component.spec.ts` — covers VIS-01 through VIS-06 (15 test cases; full spec embedded in 02-01-PLAN.md Task 1 action)
- [ ] `src/app/pokedex/pokedex-entry/pokedex-entry.component.ts` — new standalone component
- [ ] `src/app/pokedex/pokedex-entry/pokedex-entry.component.html` — flip card template
- [ ] `src/app/pokedex/pokedex-entry/pokedex-entry.component.css` — compact cell + 3D flip styles

> Note: `src/app/pokedex/` directory does not exist yet and must be created. No existing files conflict.

---

## Test Constraints & Notes

- **`loading="lazy"` testing:** In Karma (headless Chrome), `loading="lazy"` does not actually defer image loading. Test via `img.getAttribute('loading') === 'lazy'`, NOT via `img.naturalWidth > 0`.
- **`ngbTooltip` testing:** ng-bootstrap tooltips render on hover (DOM event), not at component init. Test the **tooltip binding input** (`component.isSeen`, `component.pokemonText`) rather than the rendered tooltip DOM.
- **Flip card CSS:** The CSS classes `.seen` and `.won` are the test assertions — the actual CSS transition happens in the browser, not in Karma. Confirm classes are present/absent; trust the CSS to do the animation.

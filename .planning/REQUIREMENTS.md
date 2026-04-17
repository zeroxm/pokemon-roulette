# Requirements: Pokemon Roulette — Milestone v1.2 (Theming System)

**Defined:** 2026-04-17
**Core Value:** The game stays green (compilable, testable, and playable) after every change.

---

## v1.2 Requirements

### Theme Service

- [ ] **THEME-01**: Create a `ThemeService` that manages three named themes — `starters`, `plain-dark`, `plain-light` — and applies the active theme to `document.body` via CSS class. The service must expose `theme$: Observable<Theme>`, `currentTheme: Theme`, and `setTheme(theme: Theme): void`. Persist theme under localStorage key `pokemon-roulette-theme`. Remove old `dark-mode`/`light-mode` body classes when applying new theme classes.

- [ ] **THEME-02**: Add CSS class rules for all three themes to the global stylesheet:
  - `theme-starters`: same color variables as current `dark-mode` (white fonts, dark backgrounds) PLUS `background-image: url('/dark-background.png'); background-size: 430px 430px; background-repeat: repeat;` on body
  - `theme-plain-dark`: identical to current `dark-mode` class behavior — no background image
  - `theme-plain-light`: identical to current `light-mode` class behavior

### Theme Selector Component

- [ ] **THEME-03**: Create a standalone `ThemeSelectorComponent` rendering a labeled `<select>` dropdown with 3 theme options. Reads current theme from `ThemeService`, calls `setTheme()` on change, uses i18n keys, matches settings panel layout style (`d-flex justify-content-between`). Replace `<app-dark-mode-toggle>` in `settings.component.html`.

### Internationalisation

- [ ] **THEME-04**: Add theme i18n keys to all 6 locale files (en, es, fr, de, it, pt):
  - `settings.theme.label`: "Theme" / "Tema" / "Theme" / "Thema" / "Tema" / "Tema"
  - `settings.theme.starters`: "Starters" (all locales — proper noun)
  - `settings.theme.plainDark`: "Plain Dark" / "Oscuro Simple" / "Sombre Classique" / "Einfaches Dunkel" / "Scuro Semplice" / "Escuro Simples"
  - `settings.theme.plainLight`: "Plain Light" / "Claro Simple" / "Clair Classique" / "Einfaches Hell" / "Chiaro Semplice" / "Claro Simples"

### Migration

- [ ] **THEME-05**: On `ThemeService` construction, if `localStorage` does not contain `pokemon-roulette-theme`, default to `starters` — silently migrating all existing users (who only have old `dark-mode` key) to the new default.

---

## Future Requirements (Deferred)

- Language selector image-based flags — needs image assets
- `RouletteContainerComponent` full refactor — tracked, not urgent
- Shiny propagation TODO cleanup — future PR
- Additional themes (generation-specific backgrounds) — after Starters ships

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Theme preview in selector | Scope — dropdown is sufficient |
| System-preference auto-detect for new theme | By design — Starters is always default |
| `DarkModeService` removal | Deferred — service stays, only toggle component is replaced |
| Additional themes beyond 3 | Deferred — v1.3+ backlog |

---

## Traceability

| Requirement | Phase | Status | Phase Name |
|-------------|-------|--------|------------|
| THEME-01 | 11 | Pending | Theming System |
| THEME-02 | 11 | Pending | Theming System |
| THEME-03 | 11 | Pending | Theming System |
| THEME-04 | 11 | Pending | Theming System |
| THEME-05 | 11 | Pending | Theming System |

**v1.2 requirements defined: 5 total**

---
*Requirements defined: 2026-04-17*

---
phase: 11
plan: 02
subsystem: settings-ui
tags: [theme, i18n, angular-component, settings]
dependency_graph:
  requires: [11-PLAN-01]
  provides: [ThemeSelectorComponent, theme-i18n-keys]
  affects: [settings.component, all-locale-files]
tech_stack:
  added: []
  patterns: [standalone-component, service-injection, bootstrap-select]
key_files:
  created:
    - src/app/settings/theme-selector/theme-selector.component.ts
    - src/app/settings/theme-selector/theme-selector.component.html
    - src/app/settings/theme-selector/theme-selector.component.css
    - src/app/settings/theme-selector/theme-selector.component.spec.ts
  modified:
    - src/app/settings/settings.component.ts
    - src/app/settings/settings.component.html
    - src/assets/i18n/en.json
    - src/assets/i18n/es.json
    - src/assets/i18n/fr.json
    - src/assets/i18n/de.json
    - src/assets/i18n/it.json
    - src/assets/i18n/pt.json
decisions:
  - Replaced DarkModeToggleComponent with ThemeSelectorComponent (not deleting source file)
  - Used Bootstrap form-select with [selected] binding instead of ngModel for simplicity
metrics:
  duration: ~5 minutes
  completed: 2026-04-17
  tasks_completed: 3
  files_created: 4
  files_modified: 8
---

# Phase 11 Plan 02: ThemeSelectorComponent + Settings Integration + i18n Summary

## One-liner

Standalone `ThemeSelectorComponent` with Bootstrap select wired to `ThemeService`, replacing dark-mode toggle in settings, with theme i18n keys added to all 6 locales.

## What Was Built

### Task 1: ThemeSelectorComponent (4 files)

Created a standalone Angular component with:
- **`.component.ts`** — Injects `ThemeService` publicly, exposes `currentTheme` getter, `onThemeChange()` event handler that calls `themeService.setTheme()`
- **`.component.html`** — Bootstrap `form-select-sm` dropdown with three options (starters, plain-dark, plain-light), all labels translated via `TranslatePipe`
- **`.component.css`** — Empty (Bootstrap handles all layout)
- **`.component.spec.ts`** — 5 unit tests covering: component creation, service injection, currentTheme getter, and setTheme calls for plain-dark and plain-light

### Task 2: Settings Component Integration

- **`settings.component.ts`** — Swapped `DarkModeToggleComponent` import/array entry for `ThemeSelectorComponent`
- **`settings.component.html`** — Replaced `<app-dark-mode-toggle>` with `<app-theme-selector>`

### Task 3: i18n Keys (6 locale files)

Added `"theme"` block inside `"settings"` for all 6 locales:

| Locale | label | starters | plainDark | plainLight |
|--------|-------|----------|-----------|------------|
| en | Theme | Starters | Plain Dark | Plain Light |
| es | Tema | Starters | Oscuro Simple | Claro Simple |
| fr | Thème | Starters | Sombre Classique | Clair Classique |
| de | Thema | Starters | Einfaches Dunkel | Einfaches Hell |
| it | Tema | Starters | Scuro Semplice | Chiaro Semplice |
| pt | Tema | Starters | Escuro Simples | Claro Simples |

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

Files created:
- ✅ `src/app/settings/theme-selector/theme-selector.component.ts`
- ✅ `src/app/settings/theme-selector/theme-selector.component.html`
- ✅ `src/app/settings/theme-selector/theme-selector.component.css`
- ✅ `src/app/settings/theme-selector/theme-selector.component.spec.ts`

Files modified:
- ✅ `src/app/settings/settings.component.ts`
- ✅ `src/app/settings/settings.component.html`
- ✅ 6 i18n locale files (en, es, fr, de, it, pt)

Commit: e6595d6

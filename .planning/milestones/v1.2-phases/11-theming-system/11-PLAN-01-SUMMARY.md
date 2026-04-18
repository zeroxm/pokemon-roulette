---
phase: 11
plan: 01
subsystem: theming
tags: [theme-service, css, rxjs, renderer2, localStorage]
dependency_graph:
  requires: []
  provides: [ThemeService, theme CSS rules]
  affects: [src/styles.css]
tech_stack:
  added: []
  patterns: [BehaviorSubject, Renderer2 via RendererFactory2, distinctUntilChanged]
key_files:
  created:
    - src/app/services/theme-service/theme.service.ts
  modified:
    - src/styles.css
decisions:
  - Default theme is 'starters' when localStorage key absent (THEME-05 migration)
  - ALL_THEME_CLASSES strips legacy dark-mode/light-mode classes from DarkModeService
  - dark-background.png served from /public/ at root path (Angular 21 convention)
metrics:
  duration: ~5 minutes
  completed: "2026-04-17"
  tasks: 2
  files: 2
---

# Phase 11 Plan 01: ThemeService + Global CSS Summary

## One-liner

Angular `ThemeService` with Renderer2-based body class management, localStorage persistence, and three CSS theme rules (`theme-starters`, `theme-plain-dark`, `theme-plain-light`).

## What Was Built

### Task 1: ThemeService (`src/app/services/theme-service/theme.service.ts`)

Created a `providedIn: 'root'` Angular service that:
- Exposes `theme$: Observable<Theme>` (distinct changes only via `distinctUntilChanged`)
- Exposes `currentTheme: Theme` getter for synchronous reads
- Exposes `setTheme(theme: Theme): void` for programmatic theme switching
- Reads and validates stored theme from `localStorage` on construction — falls back to `'starters'` for any unrecognized/absent value (satisfies THEME-05 migration)
- Removes all known theme classes (`theme-starters`, `theme-plain-dark`, `theme-plain-light`) **plus legacy** `dark-mode` / `light-mode` classes before applying the new class
- Uses `RendererFactory2.createRenderer(null, null)` (correct pattern for services — `Renderer2` cannot be injected directly)

### Task 2: Global CSS rules (`src/styles.css`)

Appended three `body.theme-*` selector blocks between the existing `body.light-mode` block and `.row`:

| Selector | Background | Notes |
|---|---|---|
| `body.theme-starters` | `#2d3436` dark + tiled `/dark-background.png` | 430×430px repeat |
| `body.theme-plain-dark` | `#2d3436` dark | No image |
| `body.theme-plain-light` | `#dfe6e9` light | No image |

## Verification Results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | ✅ Zero errors |
| `Test-Path theme.service.ts` | ✅ True |
| CSS selectors (3 matches) | ✅ All 3 present |
| No component/DarkModeService files touched | ✅ Confirmed |

## Commits

| Hash | Message |
|---|---|
| `9a72011` | `feat(11-01): add ThemeService and global theme CSS rules` |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — `ThemeService` is fully functional. No component wiring in this plan (PLAN-02 covers that).

## Self-Check: PASSED

- `src/app/services/theme-service/theme.service.ts` — FOUND
- `src/styles.css` contains `theme-starters`, `theme-plain-dark`, `theme-plain-light` — FOUND
- Commit `9a72011` — FOUND

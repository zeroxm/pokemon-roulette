---
status: complete
phase: 11-theming-system
source: [11-PLAN-01-SUMMARY.md, 11-PLAN-02-SUMMARY.md]
started: 2026-04-17T23:10:00Z
updated: 2026-04-17T23:22:42Z
---

## Current Test

[testing complete]

## Tests

### 1. Default Starters Theme on First Load
expected: Clear localStorage (or open a private/incognito window) and load the app. The body should have a dark background (#2d3436) with the tiled Pokémon image repeating every 430×430px. No plain color background — the Starters tile pattern should be visible.
result: pass
note: "User noted: on first theme save, the old 'dark-mode' localStorage key should be deleted and replaced with 'pokemon-roulette-theme'. Logged as gap."

### 2. Theme Dropdown Visible in Settings
expected: Open the Settings panel. Where the "Dark Mode" toggle used to be, a "Theme" labeled row now appears with a small dropdown (select) containing three options: Starters, Plain Dark, Plain Light.
result: pass

### 3. Switch to Plain Dark
expected: In Settings, select "Plain Dark" from the dropdown. The background immediately changes to a solid dark color (#2d3436) — identical to dark mode but with NO repeating tile image.
result: pass

### 4. Switch to Plain Light
expected: In Settings, select "Plain Light" from the dropdown. The background immediately changes to a light cream color (#dfe6e9) — the same light background as the old light mode.
result: issue
reported: "Background color is correct, but many elements that used to change color in dark mode are not getting black. For example items.component.html and trainer-team.component.html have borders and shadows that would become black when the light theme was set."
severity: major

### 5. Theme Persists After Reload
expected: With "Plain Light" selected, reload the page. The light cream background should still be showing and "Plain Light" should still be the selected option in the dropdown.
result: pass

### 6. Switch Back to Starters
expected: In Settings, select "Starters". The background changes back to the dark tiled Pokémon background image. The tile pattern repeats correctly across the whole page.
result: pass

### 7. Translated Labels (non-English locale)
expected: Switch the app language to Spanish (or any non-English locale). In Settings, the "Theme" label and dropdown options should appear in that language (e.g., "Tema", "Oscuro Simple", "Claro Simple" for Spanish).
result: issue
reported: "Translations are correct, but the theme selector label is misaligned with the rest of the settings items."
severity: cosmetic

## Summary

total: 7
passed: 5
issues: 3
skipped: 0
pending: 0

## Gaps

- truth: "On first theme initialization, the old 'dark-mode' localStorage key should be removed and replaced with 'pokemon-roulette-theme'"
  status: failed
  reason: "User reported: when the theming is first saved, it should look for the previously used 'dark-mode' key and delete it, then add the new 'pokemon-roulette-theme'"
  severity: major
  test: 1
  artifacts: [src/app/services/theme-service/theme.service.ts]
  missing: [localStorage.removeItem('dark-mode') call in ThemeService constructor or setTheme()]

- truth: "Plain Light theme should turn borders and shadows on component cards/panels dark/black, matching the old light-mode behavior"
  status: failed
  reason: "User reported: many elements that used to change color in dark mode are not getting black. For example items.component.html and trainer-team.component.html have borders and shadows that would become black when the light theme was set."
  severity: major
  test: 4
  artifacts: [src/app/items/items.component.css, src/app/trainer-team/trainer-team.component.css]
  missing: [body.theme-plain-light CSS selectors for borders/shadows — components still use old body.light-mode selectors]

- truth: "ThemeSelectorComponent label should align vertically with other settings rows"
  status: failed
  reason: "User reported: the label is misaligned with the rest of the settings items"
  severity: cosmetic
  test: 7
  artifacts: [src/app/settings/theme-selector/theme-selector.component.html, src/app/settings/theme-selector/theme-selector.component.css]
  missing: [alignment fix — likely needs matching margin/padding to other settings rows]

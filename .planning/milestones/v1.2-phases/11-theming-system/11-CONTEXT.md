# Phase 11: Theming System — Context

**Gathered:** 2026-04-17
**Status:** Ready for planning
**Source:** Direct codebase analysis + user requirements from milestone discussion

<domain>
## Phase Boundary

Replace the boolean dark/light mode toggle with a named theme selector. Ship three themes:
- **Starters** (new default): dark-mode colors + `dark-background.png` repeating tile background
- **Plain Dark**: identical to current dark-mode, no background image
- **Plain Light**: identical to current light-mode

All existing users are migrated to "Starters" on first load. The settings panel gets a dropdown
`<select>` in place of the checkbox toggle. Theme persists across sessions via localStorage.

This phase does NOT: remove DarkModeService, add more than 3 themes, or change any other settings.

</domain>

<decisions>
## Implementation Decisions

### ThemeService (THEME-01, THEME-05)

- **Type literal**: `export type Theme = 'starters' | 'plain-dark' | 'plain-light'`
- **Default**: `'starters'` — applied when no `pokemon-roulette-theme` key in localStorage
- **localStorage key**: `'pokemon-roulette-theme'` — new key, independent of old `'dark-mode'` key
- **Migration**: constructor reads localStorage; if key absent → write `'starters'` and apply immediately. No conditional logic on old `dark-mode` key — everyone gets Starters.
- **Body class management**: apply `theme-${theme}` to `document.body`; remove the other two theme classes. Also remove legacy `dark-mode` / `light-mode` classes (left by DarkModeService on old sessions).
- **API**:
  - `theme$: Observable<Theme>` — emits on change, distinctUntilChanged
  - `currentTheme: Theme` — synchronous getter
  - `setTheme(theme: Theme): void` — saves, applies, emits
- **DarkModeService**: leave it untouched (service stays); its toggle component is replaced
- **Renderer2 pattern**: use Angular's `Renderer2` (same pattern as DarkModeService) to add/remove body classes
- **Location**: `src/app/services/theme-service/theme.service.ts`

### CSS / Global Styles (THEME-02)

Target file: `src/styles.css` (only 20 lines currently — safe to extend)

Existing rules to preserve:
```css
body { font-family: "Pokemon GB", Monospace, sans-serif; }
body.dark-mode { background-color: #2d3436; color: #dfe6e9; }
body.light-mode { background-color: #dfe6e9; color: #2d3436; }
.row { margin-left: 0px; margin-right: 0px; }
```

New rules to add:
```css
body.theme-starters {
  background-color: #2d3436;
  color: #dfe6e9;
  background-image: url('/dark-background.png');
  background-size: 430px 430px;
  background-repeat: repeat;
}

body.theme-plain-dark {
  background-color: #2d3436;
  color: #dfe6e9;
}

body.theme-plain-light {
  background-color: #dfe6e9;
  color: #2d3436;
}
```

Note: `dark-background.png` is in `public/` — Angular serves `public/` at root, so `/dark-background.png` is the correct URL.

### ThemeSelectorComponent (THEME-03)

- **Location**: `src/app/settings/theme-selector/theme-selector.component.{ts,html,css,spec.ts}`
- **Standalone**: yes
- **Pattern to follow**: `LanguageSelectorComponent` (same settings panel, similar dropdown style)
- **Template layout**: `d-flex justify-content-between align-items-center` (match other settings rows)
- **i18n**: label via `{{ 'settings.theme.label' | translate }}`, each `<option>` text via translate pipe
- **Change handling**: `(change)="onThemeChange($event)"` → calls `themeService.setTheme(selectedValue)`
- **Current value binding**: `[value]="theme"` with `[selected]="theme === currentTheme"`
- In `settings.component.html`: replace `<app-dark-mode-toggle></app-dark-mode-toggle>` with `<app-theme-selector></app-theme-selector>`
- In `settings.component.ts`: replace `DarkModeToggleComponent` import with `ThemeSelectorComponent`

### i18n (THEME-04)

All 6 files: `src/assets/i18n/{en,es,fr,de,it,pt}.json`

Add under `"settings"` object:
```json
"theme": {
  "label": "Theme",
  "starters": "Starters",
  "plainDark": "Plain Dark",
  "plainLight": "Plain Light"
}
```

Translations:
| Key | en | es | fr | de | it | pt |
|-----|----|----|----|----|----|----|
| label | Theme | Tema | Thème | Thema | Tema | Tema |
| starters | Starters | Starters | Starters | Starters | Starters | Starters |
| plainDark | Plain Dark | Oscuro Simple | Sombre Classique | Einfaches Dunkel | Scuro Semplice | Escuro Simples |
| plainLight | Plain Light | Claro Simple | Clair Classique | Einfaches Hell | Chiaro Semplice | Claro Simples |

### Plan split for safe parallel execution

- **PLAN-01** (THEME-01, THEME-02, THEME-05): `theme.service.ts` + `styles.css` only — no UI files
- **PLAN-02** (THEME-03, THEME-04): `theme-selector.component.*` + `settings.component.{ts,html}` + 6 locale JSON files — no service files

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Current theme/dark-mode infrastructure
- `src/app/services/dark-mode-service/dark-mode.service.ts` — DarkModeService (pattern to follow for Renderer2 + BehaviorSubject)
- `src/app/services/dark-mode-service/default-options.ts` — storageKey: 'dark-mode', darkModeClass: 'dark-mode', lightModeClass: 'light-mode'
- `src/app/services/dark-mode-service/types.ts` — DarkModeOptions interface

### Current settings UI
- `src/app/settings/settings.component.ts` — imports DarkModeToggleComponent (to be replaced)
- `src/app/settings/settings.component.html` — `<app-dark-mode-toggle>` to replace with `<app-theme-selector>`
- `src/app/settings/dark-mode-toggle/dark-mode-toggle.component.ts` — reference for pattern only

### Global styles
- `src/styles.css` — add new theme CSS classes here (only 20 lines currently)

### i18n files (all 6 to modify)
- `src/assets/i18n/en.json` — English baseline, `settings.darkmode` already exists here
- `src/assets/i18n/es.json`, `fr.json`, `de.json`, `it.json`, `pt.json`

### Requirements
- `.planning/REQUIREMENTS.md` — THEME-01 through THEME-05

</canonical_refs>

<specifics>
## Specific Implementation Details

- `dark-background.png` is in `public/` — served at `/dark-background.png` in Angular 21 (public/ maps to root)
- Background tile: 430px × 430px, repeat in both axes
- `SettingsService` and `GameSettings` interface: do NOT add theme to this — theme is managed by ThemeService, not SettingsService
- DarkModeService: do NOT modify it — leave all existing code in place
- `DarkModeToggleComponent`: do NOT delete it — just stop using it in settings.component
- Angular 21 pattern for abstract base classes requiring decorator: `@Directive()` (see Phase 9 fix)
- ThemeService should NOT use `DARK_MODE_OPTIONS` injection token — it's a new standalone service

</specifics>

<deferred>
## Deferred Ideas

- Theme preview swatches in selector — v1.3+ backlog
- System-preference auto-detect for initial theme — not needed (always defaults to Starters)
- Additional themes (e.g., generation-specific) — v1.3+ backlog
- DarkModeService removal — deferred, not this milestone

</deferred>

---

*Phase: 11-theming-system*
*Context gathered: 2026-04-17 via direct codebase analysis*

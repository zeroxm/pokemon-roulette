---
phase: 07-component-hygiene
reviewed: 2025-01-17T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/app/restart-game-button/restart-game-button.component.ts
  - src/app/settings-button/settings-button.component.ts
  - src/app/wheel/wheel.component.ts
  - src/app/wheel/wheel.component.html
  - src/app/main-game/roulette-container/roulette-container.component.ts
  - src/assets/i18n/en.json
  - src/assets/i18n/es.json
  - src/assets/i18n/fr.json
  - src/assets/i18n/de.json
  - src/assets/i18n/it.json
  - src/assets/i18n/pt.json
findings:
  critical: 0
  warning: 0
  info: 2
  total: 2
status: clean
---

# Phase 7: Component Hygiene — Code Review Report

**Reviewed:** 2025-01-17  
**Depth:** standard  
**Files Reviewed:** 8 source files + 6 locale JSON files (11 total)  
**Status:** ✅ Clean — no bugs, security issues, or correctness regressions found

---

## Summary

Phase 7 addressed three concerns: subscription cleanup (SUB-01/02 via `takeUntilDestroyed()`), DOM
access refactor (DOM-01 via `@ViewChild`), and i18n hardcoded string fix (I18N-01 via translation
key). All three changes are correct. Two minor info-level items are noted below — neither is a bug
or regression risk.

---

## SUB-01/02 — `takeUntilDestroyed()` without `DestroyRef` argument

**Verdict: ✅ Safe**

`RestartGameButtonComponent` (line 26) and `SettingsButtonComponent` (line 26) both call
`takeUntilDestroyed()` without passing a `DestroyRef`. Angular's documentation permits this
pattern when `takeUntilDestroyed()` is called within an injection context — and a component
constructor **is** an injection context. Angular automatically captures the current `DestroyRef`
from the injector. This matches the established reference pattern in
`coffee-button.component.ts` line 21.

No issues.

---

## DOM-01 — `@ViewChild` replacing `document.getElementById`

**Verdict: ✅ Correct**

`WheelComponent` now uses:
```typescript
@ViewChild('wheel') wheelCanvasRef!: ElementRef<HTMLCanvasElement>;
@ViewChild('pointer') pointerCanvasRef!: ElementRef<HTMLCanvasElement>;
```

The refs are only accessed in `ngAfterViewInit` (lines 68–71), which is the correct lifecycle
hook — Angular guarantees `@ViewChild` queries are resolved by the time `ngAfterViewInit` runs.

The `ngOnChanges` handler (lines 91–99) guards against pre-`ngAfterViewInit` draw calls via
`!changes['items'].firstChange`, which is true during initial setup. By the time any subsequent
`ngOnChanges` fires (`firstChange === false`), `ngAfterViewInit` has already run and both
`this.wheelCanvas` / `this.wheelCtx` are populated. No timing window exists.

The `handleResize` handler (line 85) already guards with `if (this.wheelCtx && this.pointerCtx)`,
which correctly short-circuits resize redraws before `ngAfterViewInit`.

No `document.getElementById` calls remain in the codebase for `'wheel'` or `'pointer'`.

---

## I18N-01 — `pkmnTradeTitle` translation key

**Verdict: ✅ Correct**

`roulette-container.component.ts` line 563 now sets:
```typescript
this.pkmnTradeTitle = "game.main.trade.title";
```

The template (line 243 of `roulette-container.component.html`) pipes it through `| translate`:
```html
<h1>{{ pkmnTradeTitle | translate }}</h1>
```

This is the correct ngx-translate pattern — the key string is passed to the `TranslatePipe`,
which resolves it at render time.

Key-path validation across all 6 locales:

| Locale | `game.main.trade.title` value | Valid JSON |
|--------|-------------------------------|------------|
| `en`   | `"Trade!"`                    | ✅         |
| `es`   | `"¡Intercambio!"`             | ✅         |
| `fr`   | `"Échange\u00a0!"`            | ✅         |
| `de`   | `"Tausch!"`                   | ✅         |
| `it`   | `"Scambio!"`                  | ✅         |
| `pt`   | `"Troca!"`                    | ✅         |

All 6 files are valid JSON and the key path resolves to a non-empty translated string in every
locale. No regression risk.

---

## Info

### IN-01: Orphaned `id` attributes on canvas elements

**File:** `src/app/wheel/wheel.component.html:4,10`  
**Issue:** After replacing `document.getElementById('wheel')` / `document.getElementById('pointer')`
with `@ViewChild`, the `id="wheel"` and `id="pointer"` HTML attributes on the two `<canvas>`
elements were not removed. They are now dead — no Angular code references them by ID. They are
harmless in isolation (each roulette component renders alone, so IDs don't duplicate in the live
DOM), but they misrepresent the component's current access strategy.  
**Fix:** Remove the two `id=` attributes:
```html
<!-- before -->
<canvas id="wheel" #wheel [width]="wheelWidth" [height]="canvasHeight" (click)="spinWheel()">
<canvas id="pointer" #pointer [width]="cursorWidth" [height]="canvasHeight">

<!-- after -->
<canvas #wheel [width]="wheelWidth" [height]="canvasHeight" (click)="spinWheel()">
<canvas #pointer [width]="cursorWidth" [height]="canvasHeight">
```

---

### IN-02: Unmanaged subscriptions in `ngOnChanges` and `ngAfterViewInit` of `WheelComponent`

**File:** `src/app/wheel/wheel.component.ts:74,93`  
**Issue:** Both `ngAfterViewInit` and `ngOnChanges` subscribe to `translateService.get('wheel.spin')`
without storing or cancelling the subscription:
```typescript
this.translateService.get('wheel.spin').subscribe(() => { ... });
```
`TranslateService.get()` returns a one-shot Observable that completes immediately after emitting,
so there is **no memory leak** and no functional bug. However, if `ngOnChanges` fires in rapid
succession, multiple concurrent callbacks could trigger redundant `preprocessTranslations()` +
`drawWheel()` + `drawPointer()` calls before each prior one completes. This is a pre-existing
pattern (not introduced by this phase) and is low risk given how infrequently items change.  
**Fix (optional):** Replace with `take(1)` to make intent explicit, or restructure to use
`translateService.instant()` directly after confirming translations are loaded:
```typescript
this.translateService.get('wheel.spin').pipe(take(1)).subscribe(() => {
  this.preprocessTranslations();
  this.drawWheel();
  this.drawPointer();
});
```

---

## Conclusion

All three Phase 7 fixes are correct and safe:
- `takeUntilDestroyed()` is valid in the constructor (injection context present)
- `@ViewChild` refs are accessed at the right lifecycle stage; no timing regressions
- All 6 locale files pass JSON validation and resolve `game.main.trade.title` correctly

The two info items are pre-existing patterns surfaced during review — neither was introduced by
this phase and neither causes a bug or regression.

---

_Reviewed: 2025-01-17_  
_Reviewer: gsd-code-reviewer_  
_Depth: standard_

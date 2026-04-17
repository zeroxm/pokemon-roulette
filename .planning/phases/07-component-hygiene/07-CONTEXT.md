# Phase 7: Component Hygiene - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix 4 isolated component-level hygiene issues — subscription cleanup (SUB-01, SUB-02), DOM access refactor (DOM-01), and i18n string (I18N-01). Each item touches a single file. No cross-component dependencies. Phase ends when all 4 items are fixed and tests still pass.

</domain>

<decisions>
## Implementation Decisions

### Subscription Cleanup (SUB-01, SUB-02)
- Use `takeUntilDestroyed()` from `@angular/core/rxjs-interop` piped before `.subscribe()` — the pattern already established in `coffee-button.component.ts` (no explicit `DestroyRef` needed when called in constructor injection context)
- Do NOT introduce `DestroyRef` injection — the `takeUntilDestroyed()` call without arguments works in constructor context and is simpler
- Both `restart-game-button.component.ts` and `settings-button.component.ts` get the same treatment

### ViewChild Refactor (DOM-01)
- Add `#wheel` and `#pointer` template reference variables to the canvas elements in `wheel.component.html`
- Declare `@ViewChild('wheel') wheelCanvasRef!: ElementRef<HTMLCanvasElement>` and `@ViewChild('pointer') pointerCanvasRef!: ElementRef<HTMLCanvasElement>` in `WheelComponent`
- In `ngAfterViewInit()`, replace `document.getElementById(...)` with `this.wheelCanvasRef.nativeElement` and `this.pointerCanvasRef.nativeElement`
- The existing canvas property types (`HTMLCanvasElement`) remain the same — only the source of the reference changes

### I18N Trade Title (I18N-01)
- Add `"title": "Trade!"` key to the existing `game.main.trade` JSON object (alongside existing `received` and `sent` keys) in all 6 locale files
- Full key path: `game.main.trade.title`
- Translations per locale: en="Trade!", es="¡Intercambio!", fr="Échange\u00a0!", de="Tausch!", it="Scambio!", pt="Troca!"
- Change `this.pkmnTradeTitle = "Trade!"` to `this.pkmnTradeTitle = "game.main.trade.title"` in `roulette-container.component.ts:563`
- The HTML already uses `{{ pkmnTradeTitle | translate }}` so this correctly renders via the translate pipe

### the agent's Discretion
- Ordering of `takeUntilDestroyed()` in pipe chain (add as first/only pipe operator before subscribe)
- Whether to add ElementRef to imports list explicitly (required — add `ElementRef` to Angular imports in wheel.component.ts)

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `takeUntilDestroyed()` already used in: `coffee-button.component.ts:21` (no DestroyRef), `language-selector.component.ts`, `credits-button.component.ts`, `roulette-container.component.ts` (with explicit DestroyRef)
- `@ViewChild` already used in `restart-game-button.component.ts:31` for a modal template ref
- `TranslateService` already imported in `wheel.component.ts` (for `translateService.get/instant`)
- All 6 locale files: `src/assets/i18n/{en,es,fr,de,it,pt}.json`

### Established Patterns
- Subscription cleanup: `pipe(takeUntilDestroyed())` before `.subscribe()` — no manual unsubscribe needed
- ViewChild for elements: `@ViewChild('refName') propName!: ElementRef<HTMLType>`; nativeElement access in ngAfterViewInit
- i18n keys: nested objects using dot-notation paths (e.g., `game.main.trade.title`)

### Integration Points
- `restart-game-button.component.ts:25` — constructor subscription, no DestroyRef currently
- `settings-button.component.ts:25` — same pattern
- `wheel.component.ts:66-68` — ngAfterViewInit, replace getElementById calls
- `wheel.component.html:4,9` — add `#wheel` and `#pointer` template refs to existing canvas elements
- `roulette-container.component.ts:563` — single assignment statement to change
- All 6 locale files — add `"title"` to existing `"trade"` object under `"game"."main"`

</code_context>

<specifics>
## Specific Ideas

- `coffee-button.component.ts` is the exact template to copy for subscription cleanup (simplest pattern, no DestroyRef)
- The `game.main.trade` JSON object already has "received" and "sent" — add "title" alongside them
- `@ViewChild` is already imported in `restart-game-button.component.ts` — confirm it's imported in `wheel.component.ts` as well (it's not currently — need to add to import list along with `ElementRef`)

</specifics>

<deferred>
## Deferred Ideas

- Dark mode color theming of the wheel canvas (out of scope)
- Translating the empty-string default value of `pkmnTradeTitle` (intentional — empty string shows nothing before trade occurs)

</deferred>

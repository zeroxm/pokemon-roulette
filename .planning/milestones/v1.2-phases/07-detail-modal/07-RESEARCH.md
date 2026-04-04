# Phase 7: Detail Modal — Research

**Researched:** 2026-04-08
**Domain:** Angular standalone components, NgbModal component-based pattern, PokemonFormsService, ngx-translate, official artwork URLs
**Confidence:** HIGH

---

## Summary

Phase 7 adds a rich detail modal that opens when a user clicks a seen or won Pokémon cell. The codebase is well-prepared: `PokedexEntry` already has `shiny?: boolean` (SHINY-01 shipped), `PokemonFormsService` is synchronous and data-driven (no HTTP), and `NgbModal` is already wired in `PokedexComponent`. The main work is (1) adding a click `@Output()` to `PokedexEntryComponent`, (2) creating a new `PokedexDetailModalComponent`, and (3) opening it from `PokedexComponent`.

The biggest gotcha is that `PokemonFormsService.hasForms()` requires a full `PokemonItem` — but the detail modal only has `pokemonId`. Use `getFormIds(pokemonId).length > 1` directly instead. A second gotcha: alternate form Pokémon IDs (e.g., 10091 for Alolan Rattata) are **not** in `nationalDexPokemon`, so `PokemonService.getPokemonById()` won't find them. Use `PokemonForm.text` directly from the forms array instead.

**Primary recommendation:** Create `PokedexDetailModalComponent` as a standalone component opened via `modalService.open(PokedexDetailModalComponent)` with `componentInstance` property passing. Keep all modal state (shiny toggle, selected form) inside the modal component.

---

<user_constraints>
## User Constraints (from CONTEXT.md / STATE.md)

### Locked Decisions
- Detail modal: only seen/won Pokémon are clickable; unseen cells do nothing
- Shiny tracking: cumulative — once `shiny: true`, never reverts; tracked via `PokemonItem.shiny` at markSeen time
- Alternate forms: reuse existing captures/form implementation as reference
- Pokémon name: always via ngx-translate key
- Glow animation: CSS keyframes pulse on won cells (shipped Phase 6)
- Mobile fullscreen: global CSS override in styles.css (portal rendering)

### Agent's Discretion
- None explicitly documented for Phase 7

### Deferred Ideas (OUT OF SCOPE)
- Real-time flip animation when Pokédex modal is already open
- Pokédex completion reward/notification
- Per-generation progress breakdown
- Pokédex filtering/search
- Full Pokédex entries (types, stats, descriptions)
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DETAIL-01 | Tapping seen/won cell opens detail modal: official-artwork sprite in circle, `#025` padded number, localized name via ngx-translate | Circle layout from end-game; `PokemonService.getPokemonById(id)?.text` gives i18n key; official-artwork URL pattern confirmed |
| DETAIL-02 | Detail modal shows alternate form sprites where available; use existing form implementation as reference | `PokemonFormsService.getFormIds(id)` returns form ID array; each `PokemonForm.text` is the i18n key; artwork URL uses form pokemonId |
| SHINY-02 | If `entry.shiny === true`, show a toggle button; toggling switches between regular and shiny official-artwork | `PokedexEntry.shiny?: boolean` confirmed; shiny artwork URL pattern confirmed; toggle is local component state |
</phase_requirements>

---

## Standard Stack

### Core (already in project — no new installs)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@ng-bootstrap/ng-bootstrap` | 20.0.0 | `NgbModal` + `NgbActiveModal` for component-based modal | Already used in PokedexComponent, roulette-container |
| `@ngx-translate/core` | 17.0.0 | `TranslatePipe` for Pokémon names | All Pokémon names are i18n keys; already used everywhere |
| Angular `CommonModule` | 21.2.7 | `@if`, `@for`, `NgClass` | Standard standalone component import |
| `@ng-icons/core` | 33.2.0 | Close/toggle icons | Already registered in app.config.ts |

**Installation:** No new packages needed — all dependencies are already present.

---

## Architecture Patterns

### Recommended New File Structure
```
src/app/pokedex/
├── pokedex-entry/
│   ├── pokedex-entry.component.ts     ← add @Output() entryClicked
│   ├── pokedex-entry.component.html   ← add (click) handler
│   └── pokedex-entry.component.css    ← add cursor: pointer for seen
├── pokedex-detail-modal/              ← NEW directory
│   ├── pokedex-detail-modal.component.ts
│   ├── pokedex-detail-modal.component.html
│   ├── pokedex-detail-modal.component.css
│   └── pokedex-detail-modal.component.spec.ts
└── pokedex-by-generation.ts           ← no change
```

And `trainer-team/pokedex/pokedex.component.ts` gets the click handler + modal open call.

### Pattern 1: Component-Based NgbModal (preferred for stateful modals)

NgbModal supports opening a **component** directly (not just a template ref). The modal component injects `NgbActiveModal` to close itself. The opener sets data via `componentInstance`:

```typescript
// In pokedex.component.ts — opener
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PokedexDetailModalComponent } from '../../pokedex/pokedex-detail-modal/pokedex-detail-modal.component';

openDetailModal(pokemonId: number, entry: PokedexEntry): void {
  const modalRef = this.modalService.open(PokedexDetailModalComponent, {
    centered: true,
    size: 'md',
    windowClass: 'modal-fullscreen-sm-down'
  });
  modalRef.componentInstance.pokemonId = pokemonId;
  modalRef.componentInstance.entry = entry;
}
```

```typescript
// In pokedex-detail-modal.component.ts — the modal itself
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({ standalone: true, ... })
export class PokedexDetailModalComponent implements OnInit {
  @Input() pokemonId!: number;
  @Input() entry!: PokedexEntry;

  showShiny = false;          // local toggle state
  selectedFormId: number;     // currently displayed form id

  constructor(
    public activeModal: NgbActiveModal,
    private pokemonService: PokemonService,
    private pokemonFormsService: PokemonFormsService,
    private darkModeService: DarkModeService
  ) {}

  ngOnInit(): void {
    this.selectedFormId = this.pokemonId;  // default to base form
    this.darkMode = this.darkModeService.darkMode$;
  }

  get artworkUrl(): string {
    const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
    if (this.showShiny) {
      return `${base}/shiny/${this.selectedFormId}.png`;
    }
    return `${base}/${this.selectedFormId}.png`;
  }

  get pokemonNameKey(): string {
    // For base form: look up via PokemonService
    // For alt forms: use form.text directly from PokemonFormsService
    if (this.selectedFormId === this.pokemonId) {
      return this.pokemonService.getPokemonById(this.pokemonId)?.text ?? 'pokemon.unknown';
    }
    const forms = this.pokemonFormsService.getFormIds(this.pokemonId);
    // Find the matching PokemonForm to get text
    const formData = this.pokemonFormsService.getPokemonForms(
      this.pokemonService.getPokemonById(this.pokemonId)!
    );
    return formData.find(f => f.pokemonId === this.selectedFormId)?.text ?? 'pokemon.unknown';
  }

  get hasShinyToggle(): boolean {
    return this.entry?.shiny === true;
  }

  get hasAlternateForms(): boolean {
    return this.pokemonFormsService.getFormIds(this.pokemonId).length > 1;
  }

  get alternateForms(): PokemonForm[] {
    const base = this.pokemonService.getPokemonById(this.pokemonId);
    if (!base) return [];
    return this.pokemonFormsService.getPokemonForms(base);
  }

  formatPokemonNumber(id: number): string {
    if (id >= 1000) return `#${id}`;
    return `#${id.toString().padStart(3, '0')}`;
  }
}
```

**Why component-based instead of template-based:**
- The detail modal has its own state (shiny toggle, selected form)
- Keeps `PokedexComponent` template clean
- Follows the principle of separation of concerns
- `NgbActiveModal` provides clean `close()` / `dismiss()` without needing `modalService.dismissAll()`

### Pattern 2: Click Output Bubbling in PokedexEntryComponent

```typescript
// pokedex-entry.component.ts — add Output
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

export interface PokedexEntryClickEvent {
  pokemonId: number;
  entry: PokedexEntry;
}

@Component({ ... })
export class PokedexEntryComponent implements OnInit {
  @Input() pokemonId!: number;
  @Input() entry: PokedexEntry | undefined;
  @Output() entryClicked = new EventEmitter<PokedexEntryClickEvent>();

  onCellClick(): void {
    if (!this.isSeen) return;  // unseen cells do nothing
    this.entryClicked.emit({ pokemonId: this.pokemonId, entry: this.entry! });
  }
}
```

```html
<!-- pokedex-entry.component.html — add click binding -->
<div class="pokedex-cell"
     [class.seen]="isSeen"
     [class.won]="isWon"
     [class.clickable]="isSeen"
     (click)="onCellClick()"
     ...>
```

```css
/* pokedex-entry.component.css — already has cursor: default */
.pokedex-cell.clickable {
  cursor: pointer;
}
```

### Pattern 3: Circular Image Layout (from end-game.component.html)

```html
<!-- Official artwork in circle, no color tinting needed for detail modal -->
<div class="pokemon-artwork-circle rounded-circle"
     [ngClass]="(darkMode | async) ? 'black-border shadow' : 'border white-shadow'">
  <img [src]="artworkUrl" class="img-fluid rounded-circle" [alt]="pokemonNameKey | translate" loading="lazy">
</div>
```

```css
/* pokedex-detail-modal.component.css */
.pokemon-artwork-circle {
  width: 160px;
  height: 160px;
  aspect-ratio: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

The `rounded-circle` Bootstrap class applies `border-radius: 50%`. Combined with `aspect-ratio: 1` and `overflow: hidden`, this is the established circle pattern.

### Pattern 4: Pokémon Name via ngx-translate

Translation file structure (verified from `src/assets/i18n/en.json`):
```json
{
  "pokemon": {
    "pikachu": "Pikachu",
    "rattata-alola": "Alolan Rattata"
  }
}
```

i18n key format: `pokemon.{name}` where `{name}` is the slug (e.g., `pokemon.pikachu`, `pokemon.rattata-alola`).

**How to get the key:**
- Base Pokémon: `PokemonService.getPokemonById(pokemonId)?.text` → returns `'pokemon.pikachu'`
- Alt forms: `PokemonForm.text` directly (e.g., `'pokemon.rattata-alola'`) — these are pre-defined in `pokemon-forms.ts`

```html
{{ pokemonNameKey | translate }}
```

**No HTTP call needed** — translation files are loaded at startup. `PokemonService.nationalDexPokemon` is an in-memory array. Both are synchronous.

### Anti-Patterns to Avoid

- **`PokemonFormsService.hasForms(pokemon)` requires a full `PokemonItem`** — you only have `pokemonId` in the detail modal. Use `getFormIds(pokemonId).length > 1` instead.
- **`PokemonService.getPokemonById(formId)` for alternate form IDs** — alt form IDs like 10091, 10001 are NOT in `nationalDexPokemon`. Always get the name from `PokemonForm.text`, not from `getPokemonById`.
- **Do NOT pre-load official artwork** — it's a large image. Use `loading="lazy"` and construct the URL at render time.
- **Do NOT call `modalService.dismissAll()`** from inside the modal component — use `activeModal.dismiss()` or `activeModal.close()` to close only the specific modal.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal dialog with backdrop/close | Custom overlay div | `NgbModal.open(Component)` | Handles focus trap, keyboard ESC, backdrop, scroll lock |
| i18n Pokémon name lookup | HTTP call to PokeAPI species endpoint | `PokemonService.getPokemonById(id)?.text` + `TranslatePipe` | All names already loaded in-memory |
| Alternate forms data | PokeAPI HTTP call | `PokemonFormsService.getFormIds()` + `.getPokemonForms()` | Synchronous, data-driven, already tested |
| Shiny artwork URL | Custom service method | Direct URL string construction | Pattern is stable: `/other/official-artwork/shiny/{id}.png` |

---

## How SHINY-02 Connects to SHINY-01

**SHINY-01** (Phase 6, shipped): Extended `PokedexEntry` to include `shiny?: boolean`. When `markSeen(pokemonId, shiny: true)` is called, the entry is written with `shiny: true` and that flag never reverts.

```typescript
// Confirmed PokedexEntry interface (pokedex.service.ts)
export interface PokedexEntry {
  won: boolean;
  sprite: string | null;
  shiny?: boolean;  // ← added by SHINY-01
}
```

**SHINY-02** (Phase 7): The detail modal reads `entry.shiny`. If `true`, renders a toggle button. The toggle switches `showShiny` local state between `false` (regular) and `true` (shiny), changing the `artworkUrl` computed property.

```typescript
// Shiny artwork URL (SHINY-02)
get artworkUrl(): string {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
  return this.showShiny
    ? `${base}/shiny/${this.selectedFormId}.png`
    : `${base}/${this.selectedFormId}.png`;
}
```

**No service change needed for SHINY-02** — it purely reads the existing `shiny?: boolean` flag.

---

## Common Pitfalls

### Pitfall 1: `hasForms()` Requires `PokemonItem`, Not Just ID
**What goes wrong:** Calling `pokemonFormsService.hasForms(...)` in the detail modal — you only have `pokemonId: number` and `entry: PokedexEntry`, not a `PokemonItem`.
**Why it happens:** `hasForms(pokemon: PokemonItem)` internally calls `getFormIds(pokemon.pokemonId)`.
**How to avoid:** Call `pokemonFormsService.getFormIds(this.pokemonId).length > 1` directly for the boolean check. For getting forms to display, use `getPokemonForms(basePokemonItem)` — but you need to get the `PokemonItem` first from `PokemonService.getPokemonById(pokemonId)`. Handle the `undefined` case.
**Warning signs:** TypeScript compile error if you pass `number` to `hasForms()`; runtime undefined access if `getPokemonById` returns `undefined`.

### Pitfall 2: Alternate Form IDs Not in `nationalDexPokemon`
**What goes wrong:** Calling `pokemonService.getPokemonById(10091)` (Alolan Rattata) returns `undefined`.
**Why it happens:** `nationalDexPokemon` only contains base-form Pokémon from each generation's list.
**How to avoid:** For alt form names: use `PokemonForm.text` (already set in `pokemon-forms.ts`, e.g., `'pokemon.rattata-alola'`). For alt form artwork: construct URL with the form's `pokemonId` directly.
**Warning signs:** `getPokemonById()` returns `undefined` for IDs > 10000.

### Pitfall 3: `cursor: default` on All Cells
**What goes wrong:** Seen/won cells look like dead elements even after adding click handler.
**Why it happens:** `.pokedex-cell { cursor: default }` in `pokedex-entry.component.css`.
**How to avoid:** Add `.pokedex-cell.seen { cursor: pointer }` (or a `.clickable` class) to `pokedex-entry.component.css`.

### Pitfall 4: Official Artwork 404 for Some Form IDs
**What goes wrong:** Some alternate form IDs (especially high-ID forms like certain Mega evolutions) may not have official artwork in the PokeAPI sprite repository.
**Why it happens:** Not all form IDs have official artwork PNGs.
**How to avoid:** Add `(error)="onArtworkError($event)"` to the `<img>` tag. Fall back to `entry.sprite` (small sprite) or show a placeholder on error.
**Warning signs:** Broken image icons in the modal for certain forms.

### Pitfall 5: `@ViewChild` vs Component-Based Modal — Don't Mix
**What goes wrong:** If you try to use `@ViewChild('detailModal', { static: true })` pattern in `PokedexComponent` for the detail template, the template becomes complex and two nested `ng-template` modals can conflict.
**Why it happens:** The existing pokedex modal is already template-based with `static: true`.
**How to avoid:** Use `modalService.open(PokedexDetailModalComponent)` with a separate component. Don't add another `@ViewChild` template to `PokedexComponent`.

---

## Code Examples

### Opening the Detail Modal from PokedexComponent

```typescript
// trainer-team/pokedex/pokedex.component.ts — add import + method
import { PokedexDetailModalComponent } from '../../pokedex/pokedex-detail-modal/pokedex-detail-modal.component';
import { PokedexEntryClickEvent } from '../../pokedex/pokedex-entry/pokedex-entry.component';

onEntryClicked(event: PokedexEntryClickEvent): void {
  const modalRef = this.modalService.open(PokedexDetailModalComponent, {
    centered: true,
    size: 'md',
    windowClass: 'modal-fullscreen-sm-down'
  });
  modalRef.componentInstance.pokemonId = event.pokemonId;
  modalRef.componentInstance.entry = event.entry;
}
```

```html
<!-- trainer-team/pokedex/pokedex.component.html — wire output -->
<app-pokedex-entry
  [pokemonId]="id"
  [entry]="pokedexData?.caught?.[id.toString()]"
  (entryClicked)="onEntryClicked($event)">
</app-pokedex-entry>
```

### Detail Modal Template Structure

```html
<!-- pokedex-detail-modal.component.html -->
<div class="modal-header" [ngClass]="(darkMode | async) ? 'bg-dark text-white' : ''">
  <h5 class="modal-title">{{ pokemonNameKey | translate }}</h5>
  <button type="button" class="btn-close"
    [ngClass]="(darkMode | async) ? 'btn-close-white' : ''"
    (click)="activeModal.dismiss()" aria-label="Close"></button>
</div>
<div class="modal-body text-center" [ngClass]="(darkMode | async) ? 'bg-dark text-white' : ''">
  <!-- Circle artwork -->
  <div class="pokemon-artwork-circle rounded-circle mx-auto mb-3"
       [ngClass]="(darkMode | async) ? 'black-border shadow' : 'border'">
    <img [src]="artworkUrl"
         loading="lazy"
         class="img-fluid rounded-circle"
         [alt]="pokemonNameKey | translate"
         (error)="onArtworkError()">
  </div>

  <!-- Pokédex number -->
  <p class="fw-bold">{{ formatPokemonNumber(pokemonId) }}</p>

  <!-- Shiny toggle (only if entry.shiny === true) -->
  @if (hasShinyToggle) {
    <button class="btn btn-sm mb-2"
            [ngClass]="showShiny ? 'btn-warning' : 'btn-outline-warning'"
            (click)="showShiny = !showShiny">
      ✨ {{ showShiny ? ('detail.shiny.on' | translate) : ('detail.shiny.off' | translate) }}
    </button>
  }

  <!-- Alternate forms (only if hasAlternateForms) -->
  @if (hasAlternateForms) {
    <div class="d-flex flex-wrap gap-2 justify-content-center mt-2">
      @for (form of alternateForms; track form.pokemonId) {
        <button class="btn btn-sm"
                [ngClass]="selectedFormId === form.pokemonId ? 'btn-primary' : 'btn-outline-secondary'"
                (click)="selectedFormId = form.pokemonId">
          {{ form.text | translate }}
        </button>
      }
    </div>
  }
</div>
```

### Alternate Forms Official Artwork

```typescript
// Each form's artwork uses the form's pokemonId
// Form pokemonIds from pokemon-forms.ts: e.g., 10091 = Alolan Rattata
get artworkUrl(): string {
  const base = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork';
  const id = this.selectedFormId;  // updated when user selects a form
  return this.showShiny ? `${base}/shiny/${id}.png` : `${base}/${id}.png`;
}
```

---

## State of the Art

| Old Approach | Current Approach | Notes |
|--------------|------------------|-------|
| Template-based modal (`ng-template`) | Component-based modal (`modalService.open(Component)`) | Both work in ng-bootstrap 20; component-based is cleaner for stateful modals |
| `@NgModule` declarations | Standalone components (`standalone: true`) | This project uses standalone throughout — follow same pattern |

---

## Environment Availability

Step 2.6: SKIPPED — Phase 7 is code/config-only changes. No external tools, services, or CLI utilities beyond the existing Angular project are required. Official artwork URLs are served by GitHub's CDN (raw.githubusercontent.com), which requires internet access at runtime (same as all other sprite URLs already used).

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Karma 6.4.4 + Jasmine 6.1.0 |
| Config file | `angular.json` (karma config inline) |
| Quick run command | `ng test --include='**/pokedex**' --watch=false` |
| Full suite command | `ng test --watch=false` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DETAIL-01 | Click on seen cell emits `entryClicked` event | unit | `ng test --include='**/pokedex-entry**' --watch=false` | ✅ existing spec (needs new tests) |
| DETAIL-01 | Click on unseen cell does NOT emit | unit | same | ✅ existing spec (needs new tests) |
| DETAIL-01 | Modal shows `#025`, localized name, artwork circle | unit | `ng test --include='**/pokedex-detail-modal**' --watch=false` | ❌ Wave 0 |
| DETAIL-02 | Alt form buttons render when `getFormIds().length > 1` | unit | same | ❌ Wave 0 |
| DETAIL-02 | Clicking form button updates `selectedFormId` → artwork URL | unit | same | ❌ Wave 0 |
| SHINY-02 | Shiny toggle button absent when `entry.shiny` is falsy | unit | same | ❌ Wave 0 |
| SHINY-02 | Shiny toggle present when `entry.shiny === true`; toggles artwork | unit | same | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `ng test --include='**/pokedex**' --watch=false`
- **Per wave merge:** `ng test --watch=false`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/app/pokedex/pokedex-detail-modal/pokedex-detail-modal.component.spec.ts` — covers DETAIL-01, DETAIL-02, SHINY-02

*(Existing `pokedex-entry.component.spec.ts` covers the click/output behavior additions — new test cases needed but no new file)*

---

## Open Questions

1. **i18n keys for shiny toggle button label**
   - What we know: The project uses ngx-translate for all UI text
   - What's unclear: No existing `detail.*` translation keys in `en.json`; new keys like `detail.shiny.on` / `detail.shiny.off` need to be added to all 6 locale files (en, es, fr, pt, de, it)
   - Recommendation: Plan must include a task to add translation keys to all 6 `src/assets/i18n/*.json` files. Simplest keys: `"detail": { "shiny": { "on": "Shiny", "off": "Regular" } }` (or similar per-language strings).

2. **Artwork 404 fallback for alternate forms**
   - What we know: Not all high-ID form Pokémon have official artwork in the PokeAPI sprites repo
   - What's unclear: Which form IDs are affected — would need empirical testing
   - Recommendation: Add `(error)` binding on the `<img>` tag; fall back to `entry.sprite` (small sprite already stored) or hide the image gracefully.

3. **`getPokemonForms()` requires `PokemonItem` — what if `getPokemonById()` returns undefined?**
   - What we know: Alt form Pokémon IDs (>10000) are not in `nationalDexPokemon`; but `getPokemonForms()` is called with the BASE form ID (which IS in `nationalDexPokemon`)
   - What's unclear: Whether `getPokemonById(basePokemonId)` can ever return `undefined` for pokemonIds in the Pokédex grid
   - Recommendation: The Pokédex grid only contains IDs from `nationalDexPokemon`, so `getPokemonById(pokemonId)` should always succeed for base IDs. Add a null guard anyway for safety.

---

## Sources

### Primary (HIGH confidence)
- Direct code inspection: `src/app/pokedex/pokedex-entry/pokedex-entry.component.ts` — current inputs, no outputs, no click
- Direct code inspection: `src/app/trainer-team/pokedex/pokedex.component.ts` — `NgbModal`, `@ViewChild` pattern, subscription pattern
- Direct code inspection: `src/app/services/pokemon-forms-service/pokemon-forms.service.ts` — full API verified
- Direct code inspection: `src/app/services/pokedex-service/pokedex.service.ts` — `PokedexEntry` interface with `shiny?: boolean`
- Direct code inspection: `src/assets/i18n/en.json` — translation key format `pokemon.{name}` confirmed
- Direct code inspection: `src/app/main-game/end-game/end-game.component.html` + `.css` — circle layout pattern
- Direct code inspection: `src/app/interfaces/pokemon-item.ts` — `PokemonItem` interface
- Direct code inspection: `src/app/interfaces/pokemon-form.ts` — `PokemonForm` interface
- Direct code inspection: `src/app/services/pokemon-forms-service/pokemon-forms.ts` — form data format

### Secondary (MEDIUM confidence)
- ng-bootstrap 20 docs: Component-based modal via `modalService.open(Component)` with `componentInstance` is the standard pattern (consistent with what's used in roulette-container.component.ts for other modals)

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — no new packages, all already present and used
- Architecture: HIGH — direct code inspection of all referenced files
- Pitfalls: HIGH — identified from actual code (not theoretical)
- Forms integration: HIGH — service API fully verified, gotchas documented
- i18n translation keys: MEDIUM — new keys needed but format pattern is confirmed

**Research date:** 2026-04-08
**Valid until:** 2026-05-08 (stable stack)

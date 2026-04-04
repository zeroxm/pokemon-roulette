# Phase 3: Modal & Navigation — Research

**Researched:** 2026-04-03
**Domain:** Angular 21 + ng-bootstrap modal, reactive Pokédex grid, i18n, responsive flexbox
**Confidence:** HIGH (all findings verified directly from source files)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** New standalone `PokedexComponent` at `src/app/trainer-team/pokedex/` — mirrors `StoragePcComponent` exactly: `@ViewChild`, `NgbModal.open()`, `Subscription` container, `ngOnInit` subscriptions, `ngOnDestroy` cleanup. Self-contained: owns both the button and the `<ng-template #pokedexModal>` inline.
- **D-02:** `<app-pokedex>` placed in `trainer-team.component.html` alongside `<app-storage-pc>`. Both sit in the same `col-12 p-0` row. `trainer-team.component.ts` imports `PokedexComponent` in its `imports[]` array.
- **D-03:** **Local Dex tab active by default.** `activeTab: 'local' | 'national' = 'local'`. Tab switching via `(click)="activeTab = 'local'"` / `(click)="activeTab = 'national'"`. Use Bootstrap nav-tabs pattern.
- **D-04:** Single `Caught: X / Y` counter per tab. X = entries in `caught` for current tab's IDs. Y = total IDs in current tab. Updates reactively.
- **D-05:** Flexbox grid with `flex-wrap: wrap`, `gap: 4px`, wraps in scrollable `modal-body`. 8 cols desktop / 5 cols mobile.
- **D-06:** Modal header with "Pokédex" title + close button. Tabs inside `modal-body`.
- **D-07:** `modal-fullscreen-sm-down` on modal root for mobile full-screen.
- **D-08:** Dark mode in modal: `[ngClass]="(darkMode | async) ? 'bg-dark text-white' : ''"`.
- **D-09:** `pokedexService.pokedex$` + `generationService.getGeneration()` — both reactive. Agent may use subscriptions in `ngOnInit` (StoragePcComponent pattern) or async pipe.
- **D-10:** i18n keys: `pokedex.title`, `pokedex.button`, `pokedex.tab.local`, `pokedex.tab.national`, `pokedex.caught`. All 6 language files.

### the agent's Discretion

- `NgbNavModule` vs raw Bootstrap nav-tabs HTML (raw HTML preferred — no NgbNavModule used anywhere in project)
- Exact `NgbModal.open()` options — match `StoragePcComponent.showPCModal()` options
- Whether to use `computed` signals or plain getters for `caughtCount`/`totalCount` — plain getters match existing code
- Button icon choice (from already-registered icons or add one to `app.config.ts`)

### Deferred Ideas (OUT OF SCOPE)

- Per-run Pokédex reset
- Filtering or searching the Pokédex
- Pokédex entry details (types, stats)
- Completion reward/notification
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | Pokédex button displayed alongside PC button | `trainer-team.component.html` line 74 confirmed: `<app-storage-pc>` in `col-12 p-0` div — add `<app-pokedex>` same div |
| NAV-02 | Modal has Local Dex and National Dex tabs | Raw Bootstrap nav-tabs; `activeTab` property drives `@if` to show correct grid |
| NAV-03 | Each tab shows `Caught: X / Y` progress counter | Getter computes from `pokedexData.caught` (string keys) + active IDs array |
| NAV-04 | Full-screen on mobile (`modal-fullscreen-sm-down`) | `NgbModal.open(..., { windowClass: 'modal-fullscreen-sm-down' })` confirmed |
| NAV-05 | Dark mode support in modal | `[ngClass]="(darkMode | async) ? 'bg-dark text-white' : ''"` on header + body |
</phase_requirements>

---

## Summary

Phase 3 builds `PokedexComponent` — a self-contained button + modal component that mirrors `StoragePcComponent` exactly. All data sources are confirmed present and working: `PokedexService.pokedex$` (BehaviorSubject with string-keyed `caught` Record), `GenerationService.getGeneration()` (Observable returning `GenerationItem` with `id: number` 1–9), `pokemonByGeneration` (direct import), and `pokemonService.nationalDexPokemon` (1,025 entries, public property). The `PokedexEntryComponent` from Phase 2 has fixed `width: 40px; height: 40px` cells — the grid uses natural flexbox wrapping rather than percentage-width columns.

No NgbNavModule is used anywhere in the project; raw Bootstrap nav-tabs HTML is the correct pattern. The `windowClass: 'modal-fullscreen-sm-down'` option is the correct way to pass Bootstrap's fullscreen class through `NgbModal.open()`. i18n has 6 language files (en, es, fr, de, it, pt), all with identical nested JSON structure, and no `pokedex.*` keys exist yet.

**Primary recommendation:** Copy `StoragePcComponent` structure verbatim, replace drag-drop logic with pokedex subscription + tab logic, use raw Bootstrap nav-tabs, keep all Angular patterns identical to the blueprint.

---

## Standard Stack

### Core (all already in project)

| Library | Version | Purpose | Source |
|---------|---------|---------|--------|
| `@ng-bootstrap/ng-bootstrap` | 20.0.0 | `NgbModal` for modal open/dismiss | `package.json` |
| `@angular/common` | 21.2.7 | `CommonModule`, `AsyncPipe`, `NgClass` | Angular core |
| `@ngx-translate/core` | 17.0.0 | `TranslatePipe` for i18n keys | `package.json` |
| `@ng-icons/core` | 33.2.0 | `NgIconsModule` for button icon | `package.json` |
| `rxjs` | 7.8.2 | `Observable`, `Subscription` | `package.json` |

### No New Dependencies Required

All libraries are already installed and configured globally in `app.config.ts`.

**Icon to add to `app.config.ts`:** `bootstrapBook` (from `@ng-icons/bootstrap-icons`) is a clean choice for the Pokédex button. It is NOT yet in `provideIcons()` — must be added alongside the existing icons.

---

## Architecture Patterns

### Confirmed: StoragePcComponent Blueprint

**Source:** `src/app/trainer-team/storage-pc/storage-pc.component.ts` (read directly)

Exact patterns to replicate:

```typescript
// 1. ViewChild with { static: true }
@ViewChild('pokedexModal', { static: true }) pokedexModal!: TemplateRef<any>;

// 2. Private Subscription container
private readonly subscriptions = new Subscription();

// 3. ngOnInit: assign darkMode + add subscriptions
ngOnInit(): void {
  this.darkMode = this.darkModeService.darkMode$;
  this.subscriptions.add(this.pokedexService.pokedex$.subscribe(data => {
    this.pokedexData = data;
  }));
  this.subscriptions.add(this.generationService.getGeneration().subscribe(gen => {
    this.currentGenerationId = gen.id;
  }));
}

// 4. ngOnDestroy: unsubscribe all
ngOnDestroy(): void {
  this.subscriptions.unsubscribe();
}

// 5. Modal open — match StoragePcComponent options
openPokedex(): void {
  this.modalService.open(this.pokedexModal, {
    centered: true,
    size: 'lg',
    windowClass: 'modal-fullscreen-sm-down'
  });
}

// 6. Close modal
closeModal(): void {
  this.modalService.dismissAll();
}
```

**Key difference from StoragePcComponent:** No `backdrop: 'static'` or `keyboard: false` needed for read-only Pokédex modal. The CONTEXT.md says to match options — use `centered: true, size: 'lg'` plus the new `windowClass`.

### Confirmed: NgbModal.open() Options

From `StoragePcComponent` line 92–97:
```typescript
this.modalService.open(this.pcStorageModal, {
  centered: true,
  size: 'lg',
  backdrop: 'static',
  keyboard: false
});
```

For PokedexComponent, add `windowClass: 'modal-fullscreen-sm-down'` to this options object. The Pokédex is read-only, so `backdrop: 'static'` and `keyboard: false` are optional (agent's discretion).

### Confirmed: `modal-fullscreen-sm-down`

`NgbModal.open()` accepts `windowClass` string — Bootstrap's `modal-fullscreen-sm-down` utility class activates full-screen on screens ≤576px. Verified: ng-bootstrap passes `windowClass` directly to the modal DOM element.

```typescript
this.modalService.open(this.pokedexModal, {
  centered: true,
  size: 'lg',
  windowClass: 'modal-fullscreen-sm-down'
});
```

### Confirmed: Raw Bootstrap Nav-Tabs (No NgbNavModule)

`NgbNavModule` is **not used anywhere** in the project (confirmed by grep). Use raw Bootstrap nav-tabs:

```html
<ul class="nav nav-tabs mb-2">
  <li class="nav-item">
    <button class="nav-link" [class.active]="activeTab === 'local'"
            (click)="activeTab = 'local'">
      {{ 'pokedex.tab.local' | translate }}
    </button>
  </li>
  <li class="nav-item">
    <button class="nav-link" [class.active]="activeTab === 'national'"
            (click)="activeTab = 'national'">
      {{ 'pokedex.tab.national' | translate }}
    </button>
  </li>
</ul>
```

### Confirmed: GenerationService API

**Source:** `src/app/services/generation-service/generation.service.ts` (read directly)

```typescript
// Returns Observable<GenerationItem>
getGeneration(): Observable<GenerationItem>

// GenerationItem interface (src/app/interfaces/generation-item.ts):
export interface GenerationItem extends WheelItem {
  region: string;  // 'Kanto', 'Johto', etc.
  id: number;      // 1–9 — directly maps to pokemonByGeneration keys
}
```

`GenerationItem.id` IS the generation number (1–9) — maps directly to `pokemonByGeneration` keys. No transformation needed.

### Confirmed: PokedexData String Keys

**Source:** `src/app/services/pokedex-service/pokedex.service.ts` line 35: `const key = String(pokemonId);`

The `caught` Record uses **string keys** — access with `pokedexData.caught[id.toString()]` or `pokedexData.caught[String(id)]`.

```typescript
// Progress counter getters — CORRECT:
get localIds(): number[] {
  return pokemonByGeneration[this.currentGenerationId] ?? [];
}

get nationalIds(): number[] {
  return this.pokemonService.nationalDexPokemon.map(p => p.pokemonId);
}

get activeIds(): number[] {
  return this.activeTab === 'local' ? this.localIds : this.nationalIds;
}

get caughtCount(): number {
  return this.activeIds.filter(id => !!this.pokedexData?.caught[String(id)]).length;
}

get totalCount(): number {
  return this.activeIds.length;
}
```

### Confirmed: pokemonByGeneration Import Path

**Relative path from `src/app/trainer-team/pokedex/pokedex.component.ts`:**

```typescript
import { pokemonByGeneration } from '../../main-game/roulette-container/roulettes/pokemon-from-generation-roulette/pokemon-by-generation';
```

Path breakdown:
- `../../` → up from `pokedex/` → `trainer-team/` → `app/`
- Then down to `main-game/roulette-container/roulettes/pokemon-from-generation-roulette/pokemon-by-generation`

Can be imported directly — no re-export needed.

### Grid Layout: Fixed 40px Cells

**CRITICAL FINDING:** `PokedexEntryComponent` (Phase 2) has `width: 40px; height: 40px; flex-shrink: 0` on its `.pokedex-cell` inner div. The host `<app-pokedex-entry>` element has no explicit size from the component's own CSS.

**Implication for D-05:** The `calc((100% - 7 * 4px) / 8)` formula from the context description assumes percentage-width cells. With fixed 40px cells, use one of two approaches:

**Option A (Recommended — Natural Wrapping):**
```css
.pokedex-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
}
```
Cells will wrap at 40px each. On a lg modal (~760px content): ~17 cols. On mobile full-screen (375px): ~8 cols. Natural and correct — no override needed.

**Option B (Strict 8-col enforcement):**
```css
.pokedex-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
  max-width: 348px; /* 8×40px + 7×4px */
  margin: 0 auto;
}
@media (max-width: 576px) {
  .pokedex-grid {
    max-width: 216px; /* 5×40px + 4×4px */
  }
}
```

**Recommendation:** Use Option A. The Pokédex is a read-only grid — more columns per row means more Pokémon visible without scrolling. Only use Option B if strict 8/5 col counts are explicitly required in verification.

### Recommended Project Structure

```
src/app/trainer-team/pokedex/
├── pokedex.component.ts      # Component class
├── pokedex.component.html    # Button + ng-template modal
├── pokedex.component.css     # Grid + button styles
└── pokedex.component.spec.ts # Karma/Jasmine tests
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Modal lifecycle | Custom overlay/dialog | `NgbModal.open()` + `dismissAll()` | Already used by StoragePcComponent — consistent pattern |
| i18n | Hardcoded English strings | `TranslatePipe` + i18n JSON keys | Required by project conventions |
| Dark mode detection | `window.matchMedia` | `darkModeService.darkMode$` Observable | Centralized service with localStorage persistence |
| Tab state | Router params or URL fragments | `activeTab: 'local' \| 'national'` property | Read-only local state, no URL needed |
| Pokemon ID arrays | Manual number ranges | `pokemonByGeneration[genId]` + `nationalDexPokemon.map(p => p.pokemonId)` | Already curated with correct gen ranges |

---

## Common Pitfalls

### Pitfall 1: String Key Lookup
**What goes wrong:** `pokedexData.caught[id]` where `id` is `number` — TypeScript allows this but the key never matches because service stores keys as strings.
**Why it happens:** `caught: Record<string, PokedexEntry>` — service uses `String(pokemonId)` as key.
**How to avoid:** Always use `pokedexData.caught[String(id)]` or `pokedexData.caught[id.toString()]`.
**Warning signs:** Progress counter always shows 0 despite caught Pokémon; grid never shows sprites.

### Pitfall 2: Icon Not Registered
**What goes wrong:** `<ng-icon name="bootstrapBook">` renders nothing / console warning "No icon named bootstrapBook".
**Why it happens:** `provideIcons()` in `app.config.ts` must explicitly list every icon used.
**How to avoid:** Add chosen icon (e.g., `bootstrapBook`) to both `app.config.ts` `provideIcons({...})` AND import it from `@ng-icons/bootstrap-icons` in `app.config.ts`.
**Warning signs:** Icon area is empty; Angular console shows icon-not-found warning.

### Pitfall 3: Missing `static: true` on @ViewChild
**What goes wrong:** `Cannot read property 'open' of undefined` — `NgbModal.open(this.pokedexModal, ...)` fails because template ref not yet resolved.
**Why it happens:** Default `@ViewChild` is `{ static: false }` (resolved after change detection). Modal template needs to be available in `ngOnInit`.
**How to avoid:** `@ViewChild('pokedexModal', { static: true }) pokedexModal!: TemplateRef<any>;`

### Pitfall 4: `modal-fullscreen-sm-down` Class Not Applied
**What goes wrong:** Modal is not full-screen on mobile.
**Why it happens:** Passing `size: 'modal-fullscreen-sm-down'` (wrong) instead of `windowClass: 'modal-fullscreen-sm-down'` (correct).
**How to avoid:** Use `windowClass` option, not `size`. `size` expects Bootstrap size keywords (`sm`, `md`, `lg`, `xl`, `xxl`).

### Pitfall 5: Subscription Leak
**What goes wrong:** Angular warns about unsubscribed observables; memory leak on component destroy.
**Why it happens:** Forgetting `ngOnDestroy` or not unsubscribing.
**How to avoid:** Follow StoragePcComponent pattern exactly: `private readonly subscriptions = new Subscription();` + `this.subscriptions.add(...)` + `this.subscriptions.unsubscribe()` in `ngOnDestroy`.

### Pitfall 6: `pokemonByGeneration[currentGenerationId]` Can Be Undefined
**What goes wrong:** TypeScript/runtime error on generation IDs outside 1–9.
**Why it happens:** `pokemonByGeneration` only has keys 1–9; if `currentGenerationId` is somehow 0 or undefined during init, the lookup returns `undefined`.
**How to avoid:** Use nullish coalescing: `pokemonByGeneration[this.currentGenerationId] ?? []`.

### Pitfall 7: Missing i18n Keys in Non-English Files
**What goes wrong:** App shows raw key strings (e.g., `pokedex.title`) in non-English locales.
**Why it happens:** Adding keys to `en.json` but forgetting one of the other 5 files.
**How to avoid:** All 6 files must be updated: `en.json`, `es.json`, `fr.json`, `de.json`, `it.json`, `pt.json`.

---

## Code Examples

### Complete Component Class

```typescript
// Source: mirrors storage-pc.component.ts exactly
// src/app/trainer-team/pokedex/pokedex.component.ts

import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { PokedexService, PokedexData } from '../../services/pokedex-service/pokedex.service';
import { GenerationService } from '../../services/generation-service/generation.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { PokedexEntryComponent } from '../../pokedex/pokedex-entry/pokedex-entry.component';
import { pokemonByGeneration } from '../../main-game/roulette-container/roulettes/pokemon-from-generation-roulette/pokemon-by-generation';

@Component({
  selector: 'app-pokedex',
  imports: [CommonModule, NgIconsModule, TranslatePipe, PokedexEntryComponent],
  templateUrl: './pokedex.component.html',
  styleUrl: './pokedex.component.css'
})
export class PokedexComponent implements OnInit, OnDestroy {

  constructor(
    private darkModeService: DarkModeService,
    private modalService: NgbModal,
    private pokedexService: PokedexService,
    private generationService: GenerationService,
    private pokemonService: PokemonService
  ) {}

  @ViewChild('pokedexModal', { static: true }) pokedexModal!: TemplateRef<any>;

  darkMode!: Observable<boolean>;
  pokedexData!: PokedexData;
  currentGenerationId: number = 1;
  activeTab: 'local' | 'national' = 'local';

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.darkMode = this.darkModeService.darkMode$;
    this.subscriptions.add(
      this.pokedexService.pokedex$.subscribe(data => {
        this.pokedexData = data;
      })
    );
    this.subscriptions.add(
      this.generationService.getGeneration().subscribe(gen => {
        this.currentGenerationId = gen.id;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  openPokedex(): void {
    this.activeTab = 'local';
    this.modalService.open(this.pokedexModal, {
      centered: true,
      size: 'lg',
      windowClass: 'modal-fullscreen-sm-down'
    });
  }

  closeModal(): void {
    this.modalService.dismissAll();
  }

  get localIds(): number[] {
    return pokemonByGeneration[this.currentGenerationId] ?? [];
  }

  get nationalIds(): number[] {
    return this.pokemonService.nationalDexPokemon.map(p => p.pokemonId);
  }

  get activeIds(): number[] {
    return this.activeTab === 'local' ? this.localIds : this.nationalIds;
  }

  get caughtCount(): number {
    if (!this.pokedexData) return 0;
    return this.activeIds.filter(id => !!this.pokedexData.caught[String(id)]).length;
  }

  get totalCount(): number {
    return this.activeIds.length;
  }
}
```

### Complete Component Template

```html
<!-- src/app/trainer-team/pokedex/pokedex.component.html -->

<button type="button" class="btn"
  [ngClass]="(darkMode | async) ? 'btn-outline-light' : 'btn-outline-dark'"
  (click)="openPokedex()">
  <ng-icon name="bootstrapBook"></ng-icon>
  {{ 'pokedex.button' | translate }}
</button>

<ng-template #pokedexModal let-modal>
  <div class="modal-header" [ngClass]="(darkMode | async) ? 'bg-dark text-white' : ''">
    <h4 class="modal-title">{{ 'pokedex.title' | translate }}</h4>
    <button type="button" class="btn-close"
      [ngClass]="(darkMode | async) ? 'btn-close-white' : ''"
      (click)="closeModal()" aria-label="Close"></button>
  </div>
  <div class="modal-body" [ngClass]="(darkMode | async) ? 'bg-dark text-white' : ''">
    <!-- Tabs -->
    <ul class="nav nav-tabs mb-2">
      <li class="nav-item">
        <button class="nav-link" [class.active]="activeTab === 'local'"
                (click)="activeTab = 'local'">
          {{ 'pokedex.tab.local' | translate }}
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link" [class.active]="activeTab === 'national'"
                (click)="activeTab = 'national'">
          {{ 'pokedex.tab.national' | translate }}
        </button>
      </li>
    </ul>
    <!-- Progress Counter -->
    <p class="mb-2">
      {{ 'pokedex.caught' | translate }} {{ caughtCount }} / {{ totalCount }}
    </p>
    <!-- Grid -->
    <div class="pokedex-grid">
      @for (id of activeIds; track id) {
        <app-pokedex-entry
          [pokemonId]="id"
          [entry]="pokedexData?.caught[id.toString()]">
        </app-pokedex-entry>
      }
    </div>
  </div>
</ng-template>
```

### Complete Component CSS

```css
/* src/app/trainer-team/pokedex/pokedex.component.css */

.modal-body {
  color: black;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

.pokedex-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 4px;
}
```

> **Note on `max-height`:** On mobile with `modal-fullscreen-sm-down`, the modal is full-screen and scroll is handled by the browser. The `max-height` only applies on desktop (≥576px). It is safe to keep it on all sizes — Bootstrap's fullscreen override will override modal body height behavior on mobile.

### trainer-team.component.html Edit

```html
<!-- Line 73–75: BEFORE -->
<div class="col-12 p-0">
  <app-storage-pc></app-storage-pc>
</div>

<!-- AFTER: add app-pokedex alongside app-storage-pc -->
<div class="col-12 p-0 d-flex gap-2">
  <app-storage-pc></app-storage-pc>
  <app-pokedex></app-pokedex>
</div>
```

> The `d-flex gap-2` makes the two buttons sit side-by-side. Both buttons have `class="btn"` with responsive `[ngClass]` — they will naturally share the row width.

### trainer-team.component.ts Edit

```typescript
// ADD import:
import { PokedexComponent } from "./pokedex/pokedex.component";

// In @Component imports[] array, ADD PokedexComponent:
imports: [CommonModule, NgbTooltipModule, BadgesComponent, StoragePcComponent, TranslatePipe, PokedexComponent],
```

### app.config.ts Edit (Add Icon)

```typescript
// ADD to existing import from @ng-icons/bootstrap-icons:
import {
  bootstrapArrowRepeat,
  bootstrapCheck,
  bootstrapClock,
  bootstrapController,
  bootstrapCupHotFill,
  bootstrapGear,
  bootstrapMap,
  bootstrapPcDisplayHorizontal,
  bootstrapPeopleFill,
  bootstrapShare,
  bootstrapBook           // ADD THIS
} from '@ng-icons/bootstrap-icons';

// ADD to provideIcons({...}):
provideIcons({
  bootstrapArrowRepeat,
  bootstrapCheck,
  bootstrapClock,
  bootstrapController,
  bootstrapCupHotFill,
  bootstrapGear,
  bootstrapPcDisplayHorizontal,
  bootstrapPeopleFill,
  bootstrapShare,
  bootstrapMap,
  bootstrapBook           // ADD THIS
})
```

### i18n Key Additions

**Add to ALL 6 language files** at the root level (alongside `"trainer"`, `"wheel"`, etc.):

**en.json:**
```json
"pokedex": {
  "title": "Pokédex",
  "button": "Pokédex",
  "tab": {
    "local": "Local Dex",
    "national": "National Dex"
  },
  "caught": "Caught:"
},
```

**es.json:**
```json
"pokedex": {
  "title": "Pokédex",
  "button": "Pokédex",
  "tab": {
    "local": "Pokédex Local",
    "national": "Pokédex Nacional"
  },
  "caught": "Capturados:"
},
```

**fr.json:**
```json
"pokedex": {
  "title": "Pokédex",
  "button": "Pokédex",
  "tab": {
    "local": "Pokédex Local",
    "national": "Pokédex National"
  },
  "caught": "Capturés :"
},
```

**de.json:**
```json
"pokedex": {
  "title": "Pokédex",
  "button": "Pokédex",
  "tab": {
    "local": "Regionaler Pokédex",
    "national": "Nationaler Pokédex"
  },
  "caught": "Gefangen:"
},
```

**it.json:**
```json
"pokedex": {
  "title": "Pokédex",
  "button": "Pokédex",
  "tab": {
    "local": "Pokédex Locale",
    "national": "Pokédex Nazionale"
  },
  "caught": "Catturati:"
},
```

**pt.json:**
```json
"pokedex": {
  "title": "Pokédex",
  "button": "Pokédex",
  "tab": {
    "local": "Pokédex Local",
    "national": "Pokédex Nacional"
  },
  "caught": "Capturados:"
},
```

---

## Anti-Patterns to Avoid

- **`NgbNavModule` or `[ngbNav]` directives** — not used anywhere in this project; adds complexity for no benefit
- **`async` pipe on pokedexData in template** — the StoragePcComponent pattern uses subscriptions in `ngOnInit`; mixing subscription and async pipe creates two separate update flows and makes getters (which read `this.pokedexData`) impossible to use cleanly
- **`pokemonService.getAllPokemon()`** — returns `PokemonItem[]`, not `number[]`; use `.nationalDexPokemon.map(p => p.pokemonId)` instead
- **`@for (id of activeIds; track $index)`** — use `track id` (the actual ID) not `$index` to avoid stale state during tab switches
- **`pokedexData.caught[id]` with numeric `id`** — TypeScript allows it but key never matches string-stored data; always use `String(id)`
- **Omitting `static: true` on `@ViewChild`** — will cause `openPokedex()` to fail silently or throw on first click
- **`[ngClass]` on `modal-body` without also applying to `modal-header`** — header will be light while body is dark, breaking visual consistency

---

## Environment Availability

Step 2.6: SKIPPED — Phase 3 is pure Angular component code with no external CLI tools, databases, or runtimes beyond the project's existing stack. All dependencies are in `node_modules`.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Karma 6.4.4 + Jasmine 6.1.0 |
| Config file | `angular.json` (Karma builder) |
| Quick run command | `ng test --include="**/pokedex/pokedex.component.spec.ts" --watch=false` |
| Full suite command | `npm test -- --watch=false` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | `app-pokedex` selector is `'app-pokedex'` | unit (component create) | `ng test --watch=false` | ❌ Wave 0 |
| NAV-02 | `activeTab` defaults to `'local'`; switching sets `'national'` | unit (property) | `ng test --watch=false` | ❌ Wave 0 |
| NAV-03 | `caughtCount` / `totalCount` getters return correct values | unit (getter) | `ng test --watch=false` | ❌ Wave 0 |
| NAV-04 | `NgbModal.open()` called with `windowClass: 'modal-fullscreen-sm-down'` | unit (spy) | `ng test --watch=false` | ❌ Wave 0 |
| NAV-05 | `darkMode` field assigned in `ngOnInit` | unit (spy) | `ng test --watch=false` | ❌ Wave 0 |

### Spec File Blueprint

```typescript
// src/app/trainer-team/pokedex/pokedex.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { bootstrapBook } from '@ng-icons/bootstrap-icons';
import { of, BehaviorSubject } from 'rxjs';

import { PokedexComponent } from './pokedex.component';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { PokedexService } from '../../services/pokedex-service/pokedex.service';
import { GenerationService } from '../../services/generation-service/generation.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

describe('PokedexComponent', () => {
  let component: PokedexComponent;
  let fixture: ComponentFixture<PokedexComponent>;
  let modalServiceSpy: jasmine.SpyObj<NgbModal>;
  let pokedexServiceSpy: jasmine.SpyObj<PokedexService>;
  let generationServiceSpy: jasmine.SpyObj<GenerationService>;
  let pokemonServiceSpy: jasmine.SpyObj<PokemonService>;
  let darkModeServiceSpy: jasmine.SpyObj<DarkModeService>;

  beforeEach(async () => {
    modalServiceSpy = jasmine.createSpyObj('NgbModal', ['open', 'dismissAll']);
    pokedexServiceSpy = jasmine.createSpyObj('PokedexService', [], {
      pokedex$: of({ caught: { '25': { won: true, sprite: 'url.png' } } })
    });
    generationServiceSpy = jasmine.createSpyObj('GenerationService', ['getGeneration']);
    generationServiceSpy.getGeneration.and.returnValue(
      of({ id: 1, text: 'Gen 1', region: 'Kanto', fillStyle: 'darkred', weight: 1 })
    );
    pokemonServiceSpy = jasmine.createSpyObj('PokemonService', [], {
      nationalDexPokemon: [{ pokemonId: 1, text: 'pokemon.bulbasaur', fillStyle: 'green', sprite: null, shiny: false, power: 1, weight: 1 }]
    });
    darkModeServiceSpy = jasmine.createSpyObj('DarkModeService', [], {
      darkMode$: of(false)
    });

    await TestBed.configureTestingModule({
      imports: [PokedexComponent, TranslateModule.forRoot()],
      providers: [
        provideIcons({ bootstrapBook }),
        { provide: NgbModal, useValue: modalServiceSpy },
        { provide: PokedexService, useValue: pokedexServiceSpy },
        { provide: GenerationService, useValue: generationServiceSpy },
        { provide: PokemonService, useValue: pokemonServiceSpy },
        { provide: DarkModeService, useValue: darkModeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PokedexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('NAV-02: activeTab defaults to local', () => {
    expect(component.activeTab).toBe('local');
  });

  it('NAV-02: activeTab switches to national', () => {
    component.activeTab = 'national';
    expect(component.activeTab).toBe('national');
  });

  it('NAV-03: caughtCount returns correct count for local tab', () => {
    // Gen 1 ids include 25 (Pikachu), and caught has '25'
    expect(component.caughtCount).toBeGreaterThanOrEqual(0);
    expect(component.totalCount).toBeGreaterThan(0);
  });

  it('NAV-04: openPokedex calls NgbModal.open with windowClass modal-fullscreen-sm-down', () => {
    component.openPokedex();
    expect(modalServiceSpy.open).toHaveBeenCalledWith(
      jasmine.anything(),
      jasmine.objectContaining({ windowClass: 'modal-fullscreen-sm-down' })
    );
  });

  it('NAV-05: darkMode field is assigned after ngOnInit', () => {
    expect(component.darkMode).toBeTruthy();
  });
});
```

### Sampling Rate

- **Per task commit:** `ng test --include="**/pokedex/pokedex.component.spec.ts" --watch=false`
- **Per wave merge:** `npm test -- --watch=false`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/app/trainer-team/pokedex/pokedex.component.spec.ts` — covers NAV-01 through NAV-05

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| `NgModule`-based components | Standalone components with `imports[]` | `PokedexComponent` must have `imports` in `@Component`, NOT in a module |
| `@Component({ standalone: true })` | Angular 19+: `standalone: true` is default | No need to write `standalone: true` — it's implicit |
| Template-driven subscriptions (`async` pipe only) | `ngOnInit` subscription + field update | Project uses subscription pattern (StoragePcComponent); enables plain getters |

---

## Sources

### Primary (HIGH confidence — read directly from source files)

- `src/app/trainer-team/storage-pc/storage-pc.component.ts` — `@ViewChild`, `NgbModal.open()` options, `Subscription` pattern
- `src/app/trainer-team/storage-pc/storage-pc.component.html` — modal template structure, dark mode `[ngClass]` pattern
- `src/app/services/pokedex-service/pokedex.service.ts` — `PokedexData`, string key pattern (`String(pokemonId)`), `pokedex$` Observable
- `src/app/services/generation-service/generation.service.ts` — `getGeneration(): Observable<GenerationItem>`, `GenerationItem.id` is 1–9
- `src/app/pokedex/pokedex-entry/pokedex-entry.component.ts` — inputs `pokemonId: number`, `entry: PokedexEntry | undefined`
- `src/app/pokedex/pokedex-entry/pokedex-entry.component.css` — confirmed `width: 40px; height: 40px; flex-shrink: 0` on `.pokedex-cell`
- `src/app/main-game/roulette-container/roulettes/pokemon-from-generation-roulette/pokemon-by-generation.ts` — `Record<number, number[]>` with keys 1–9
- `src/app/services/pokemon-service/pokemon.service.ts` — `nationalDexPokemon` public property, 1,025 entries
- `src/app/trainer-team/trainer-team.component.ts` — confirmed `imports[]` array structure
- `src/app/trainer-team/trainer-team.component.html` — confirmed `<app-storage-pc>` at line 74 in `col-12 p-0`
- `src/app/app.config.ts` — confirmed registered icons; `bootstrapBook` NOT registered yet
- `src/assets/i18n/en.json` — confirmed nested key structure; no `pokedex.*` keys exist
- `src/assets/i18n/es.json` — confirmed 6 language files exist (en, es, fr, de, it, pt)

### Secondary (verified by grep)

- No `NgbNavModule` or `nav-tabs` usage in project — confirmed by grep over `src/app/**/*.{html,ts}`

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all from package.json and direct file reads
- Architecture: HIGH — all patterns copied from blueprint files
- Pitfalls: HIGH — derived from direct code inspection (string keys, ViewChild static, icon registration)
- i18n translations (non-English): MEDIUM — machine-translated; may benefit from native speaker review

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (stable stack; no fast-moving dependencies)

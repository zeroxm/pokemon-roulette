# Phase 2: Entry Component & Visual States — Research

**Researched:** 2026-04-03
**Domain:** Angular 21 standalone component, CSS 3D flip card, ng-bootstrap tooltip, dark mode
**Confidence:** HIGH (all findings verified against codebase source files)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Compact grid — 8 columns desktop / 5 columns mobile (~40px cells)
- **D-02:** Number badge overlaid top-left (absolute-positioned, `#001` format, always visible)
- **D-03:** Name via `ngbTooltip` — actual name (i18n key → `| translate`) when seen, `???` when unseen
- **D-04:** Unseen state: `unknown.png` image (`https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png`), no sprite HTTP call
- **D-05:** Seen state: `front_default` sprite from `PokedexData.caught[id].sprite`, `loading="lazy"` on `<img>`
- **D-06:** Won state: gold glowing border (`border-color: gold; box-shadow: 0 0 6px rgba(255, 215, 0, 0.7)`)
- **D-07:** Reveal animation: 3D CSS flip card (horizontal, 0.4s ease) on unseen→seen transition
- **D-08:** Lazy loading via native `loading="lazy"` — no IntersectionObserver, no CDK Virtual Scroll
- **D-09:** Component API: `@Input() pokemonId: number`, `@Input() entry: PokedexEntry | undefined`
- **D-10:** Dark mode via `(darkMode | async)` pattern from `DarkModeService`

### The Agent's Discretion

- Exact CSS sizing (cell width, border-radius, padding)
- Whether standalone (preferred: yes — all new components are standalone)
- Test file structure
- Number badge formatting logic

### Deferred Ideas (OUT OF SCOPE)

- Filtering/searching the Pokédex grid
- Pokédex entry details (types, stats, description)
- Shiny sprite tracking
- Sound effect on flip animation
- Completion reward/notification
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| VIS-01 | Unseen: `unknown.png`, no sprite loading | D-04: constant URL; `@if (!isSeen)` renders unknown.png only on front face |
| VIS-02 | Seen: `front_default` sprite | D-05: `entry.sprite` from localStorage via PokedexService; `loading="lazy"` on `<img>` |
| VIS-03 | Won: gold ★ visual (glowing border) | D-06: CSS class `.won` adds `border-color: gold; box-shadow` on outer cell |
| VIS-04 | Pokédex number always visible (all states) | D-02: absolutely-positioned `.number-badge` on outer `.pokedex-cell`; visible in both flip faces |
| VIS-05 | Name shown only when seen (`???` when unseen) | D-03: `[ngbTooltip]="isSeen ? (pokemonText \| translate) : '???'"` on outer container |
| VIS-06 | CSS flip card animation on unseen→seen transition | D-07: `.pokedex-cell.seen .pokedex-cell-inner { transform: rotateY(180deg); }` driven by Angular class binding |
</phase_requirements>

---

## Summary

`PokedexEntryComponent` is a compact (~40px) standalone Angular cell that renders one of three visual states (unseen/seen/won) for a Pokémon. It receives two inputs — `pokemonId: number` and `entry: PokedexEntry | undefined` — and computes derived state without subscribing to any service internally. This keeps it pure and easily testable.

The implementation follows three existing codebase patterns directly: (1) dark mode via `darkMode = this.darkModeService.darkMode$` assigned in `ngOnInit()` and consumed as `(darkMode | async)` in the template (exact copy from `trainer-team.component.ts`), (2) `ngbTooltip` with `| translate` pipe exactly as used in `trainer-team.component.html`, and (3) card sizing derived from `storage-pc.component.css`.

The flip card is pure CSS — no `@angular/animations` dependency. The class binding `[class.seen]="isSeen"` on the host element triggers the CSS transition automatically whenever `entry` changes from `undefined` to a defined value. iOS Safari requires `-webkit-backface-visibility: hidden` and `-webkit-transform-style: preserve-3d`.

**Primary recommendation:** Build the component exactly as specified. All patterns exist in the codebase already. The only new code is the flip card CSS and the number formatting method.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `@angular/core` | 21.2.7 | `@Component`, `@Input`, `OnInit`, `OnChanges` | Project framework |
| `@angular/common` | 21.2.7 | `CommonModule` (provides `async` pipe, `NgClass`, `NgIf`) | Required for `async` pipe in template |
| `@ng-bootstrap/ng-bootstrap` | 20.0.0 | `NgbTooltipModule` for `ngbTooltip` directive | Already used in `trainer-team.component.ts` |
| `@ngx-translate/core` | 17.0.0 | `TranslatePipe` for `| translate` pipe | Already used project-wide |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `rxjs` | 7.8.2 | `Observable<boolean>` for `darkMode$` | Template binding via `async` pipe |

**No new packages required.** All dependencies are already installed.

---

## Architecture Patterns

### Recommended Project Structure
```
src/app/pokedex/
└── pokedex-entry/
    ├── pokedex-entry.component.ts
    ├── pokedex-entry.component.html
    ├── pokedex-entry.component.css
    └── pokedex-entry.component.spec.ts
```

`src/app/pokedex/` does not yet exist — it must be created. No conflict with existing structure (verified: only `src/app/services/pokedex-service/` exists).

---

### Pattern 1: Dark Mode Observable (copy from trainer-team.component.ts)

**What:** Assign `darkMode$` Observable to a component field in `ngOnInit`, consume with `async` pipe in template.
**When to use:** Every component that needs dark mode styling.

```typescript
// Source: src/app/trainer-team/trainer-team.component.ts (lines 1-30)
// and src/app/trainer-team/storage-pc/storage-pc.component.ts (line 56)

darkMode!: Observable<boolean>;

ngOnInit(): void {
  this.darkMode = this.darkModeService.darkMode$;
}
```

```html
<!-- Source: src/app/trainer-team/trainer-team.component.html (line 2) -->
[ngClass]="(darkMode | async) ? 'border white-shadow' : 'black-border shadow'"
```

**Exact classes confirmed from codebase:**
- Dark mode: `'border'` (Bootstrap border utility)
- Light mode: `'black-border shadow'` where `.black-border { border: 1px solid #333; }`

---

### Pattern 2: ngbTooltip with translate pipe (copy from trainer-team.component.html)

**What:** `NgbTooltipModule` imported in `imports[]`; tooltip value uses interpolation with `| translate`.
**When to use:** Any element needing a hover tooltip with translated text.

```typescript
// Source: src/app/trainer-team/trainer-team.component.ts (line 6)
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  imports: [CommonModule, NgbTooltipModule, TranslatePipe, ...],
})
```

```html
<!-- Source: src/app/trainer-team/trainer-team.component.html (lines 24, 33, ...) -->
ngbTooltip="{{trainerTeam[0].text | translate }}"
placement="bottom"
```

**For the conditional tooltip** (seen vs unseen), use binding with ternary:
```html
[ngbTooltip]="isSeen ? (pokemonText | translate) : '???'"
placement="bottom"
```

`pokemonText` getter returns `getPokemonById(pokemonId)?.text ?? '???'` — the i18n key like `'pokemon.bulbasaur'`.

**Confirmed:** `PokemonItem.text` IS the i18n key (e.g., `'pokemon.bulbasaur'`), NOT the display name. The `en.json` has `"pokemon": { "bulbasaur": "Bulbasaur" }` at line 433.

---

### Pattern 3: CSS Flip Card (new to this codebase)

**What:** 3D horizontal flip using CSS `transform-style: preserve-3d` and `backface-visibility: hidden`.
**When to use:** The unseen→seen transition per D-07.

```css
/* .pokedex-cell is the outer container with [class.seen] binding */
.pokedex-cell {
  position: relative;
  width: 40px;
  height: 40px;
  perspective: 200px;   /* perspective on the PARENT of the 3D element */
}

.pokedex-cell-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;       /* iOS Safari */
  transition: transform 0.4s ease;
}

/* Class applied via [class.seen]="isSeen" on .pokedex-cell */
.pokedex-cell.seen .pokedex-cell-inner {
  transform: rotateY(180deg);
}

.pokedex-cell-front,
.pokedex-cell-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;        /* iOS Safari */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Back face starts rotated — becomes forward-facing when parent flips */
.pokedex-cell-back {
  transform: rotateY(180deg);
}
```

**Angular class binding (no @angular/animations needed):**
```html
<div class="pokedex-cell"
     [class.seen]="isSeen"
     [class.won]="isWon"
     ...>
  <div class="pokedex-cell-inner">
    <div class="pokedex-cell-front">...</div>
    <div class="pokedex-cell-back">...</div>
  </div>
</div>
```

**Why this works:** When `entry` changes from `undefined` to a `PokedexEntry` object (unseen→seen), Angular updates `isSeen` to `true` and adds the `seen` class, triggering the CSS transition.

**No `@angular/animations` needed** — pure CSS `transition` property handles the animation.

---

### Pattern 4: Number Formatting (pure method in component)

```typescript
// Source: D-02 from CONTEXT.md, implemented as pure method
formatPokemonNumber(id: number): string {
  if (id >= 1000) return `#${id}`;
  return `#${id.toString().padStart(3, '0')}`;
}
```

Examples: `formatPokemonNumber(1)` → `'#001'`, `formatPokemonNumber(25)` → `'#025'`, `formatPokemonNumber(1011)` → `'#1011'`.

---

### Complete Component — `.ts`

```typescript
// Source: src/app/pokedex/pokedex-entry/pokedex-entry.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { PokedexEntry } from '../../services/pokedex-service/pokedex.service';

@Component({
  selector: 'app-pokedex-entry',
  standalone: true,
  imports: [CommonModule, NgbTooltipModule, TranslatePipe],
  templateUrl: './pokedex-entry.component.html',
  styleUrl: './pokedex-entry.component.css'
})
export class PokedexEntryComponent implements OnInit {
  @Input() pokemonId!: number;
  @Input() entry: PokedexEntry | undefined;

  darkMode!: Observable<boolean>;

  readonly unknownPngUrl = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/unknown.png';

  constructor(
    private darkModeService: DarkModeService,
    private pokemonService: PokemonService
  ) {}

  ngOnInit(): void {
    this.darkMode = this.darkModeService.darkMode$;
  }

  get isSeen(): boolean {
    return !!this.entry;
  }

  get isWon(): boolean {
    return this.entry?.won === true;
  }

  get pokemonText(): string {
    return this.pokemonService.getPokemonById(this.pokemonId)?.text ?? 'pokemon.unknown';
  }

  get spriteUrl(): string | null {
    return this.entry?.sprite ?? null;
  }

  formatPokemonNumber(id: number): string {
    if (id >= 1000) return `#${id}`;
    return `#${id.toString().padStart(3, '0')}`;
  }
}
```

---

### Complete Component — `.html`

```html
<!-- Source: src/app/pokedex/pokedex-entry/pokedex-entry.component.html -->
<div class="pokedex-cell"
     [class.seen]="isSeen"
     [class.won]="isWon"
     [ngClass]="(darkMode | async) ? 'border' : 'black-border'"
     [ngbTooltip]="isSeen ? (pokemonText | translate) : '???'"
     placement="bottom">

  <span class="number-badge">{{ formatPokemonNumber(pokemonId) }}</span>

  <div class="pokedex-cell-inner">

    <!-- Front face: shown when unseen -->
    <div class="pokedex-cell-front">
      <img [src]="unknownPngUrl" class="cell-img" alt="unseen Pokémon">
    </div>

    <!-- Back face: shown when seen -->
    <div class="pokedex-cell-back">
      @if (spriteUrl) {
        <img [src]="spriteUrl"
             loading="lazy"
             class="cell-img"
             alt="Pokémon sprite">
      }
    </div>

  </div>
</div>
```

**Notes:**
- The `ngbTooltip` is on the outer `.pokedex-cell` div — it covers both states in one binding.
- `unknown.png` does NOT get `loading="lazy"` — it is a single shared URL, no viewport detection needed.
- `@if (spriteUrl)` uses Angular 17+ control flow syntax (consistent with project's use of `@for` in storage-pc.component.html).

---

### Complete Component — `.css`

```css
/* Source: src/app/pokedex/pokedex-entry/pokedex-entry.component.css */

.pokedex-cell {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 4px;
  perspective: 200px;
  cursor: default;
  flex-shrink: 0;
}

/* Won state: gold glow (D-06) */
.pokedex-cell.won {
  border-color: gold !important;
  box-shadow: 0 0 6px rgba(255, 215, 0, 0.7) !important;
}

/* Number badge (D-02) */
.number-badge {
  position: absolute;
  top: 2px;
  left: 2px;
  font-size: 8px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.45);
  padding: 0 2px;
  border-radius: 2px;
  z-index: 2;          /* above flip card faces */
  pointer-events: none;
}

/* Flip card inner wrapper */
.pokedex-cell-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
  transition: transform 0.4s ease;
}

/* Flip when .seen class is present */
.pokedex-cell.seen .pokedex-cell-inner {
  transform: rotateY(180deg);
}

/* Both faces */
.pokedex-cell-front,
.pokedex-cell-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
}

/* Back face starts 180° rotated */
.pokedex-cell-back {
  transform: rotateY(180deg);
}

/* Sprite image fills cell */
.cell-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  image-rendering: pixelated;   /* keeps pixel sprites crisp */
}
```

---

### Complete Component — `.spec.ts`

```typescript
// Source: src/app/pokedex/pokedex-entry/pokedex-entry.component.spec.ts
// Pattern from: src/app/trainer-team/storage-pc/storage-pc.component.spec.ts
//               src/app/services/pokedex-service/pokedex.service.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { PokedexEntryComponent } from './pokedex-entry.component';
import { DarkModeService } from '../../services/dark-mode-service/dark-mode.service';
import { PokemonService } from '../../services/pokemon-service/pokemon.service';
import { of } from 'rxjs';
import { PokedexEntry } from '../../services/pokedex-service/pokedex.service';

describe('PokedexEntryComponent', () => {
  let component: PokedexEntryComponent;
  let fixture: ComponentFixture<PokedexEntryComponent>;
  let darkModeServiceSpy: jasmine.SpyObj<DarkModeService>;
  let pokemonServiceSpy: jasmine.SpyObj<PokemonService>;

  const unseenEntry: PokedexEntry | undefined = undefined;
  const seenEntry: PokedexEntry = { won: false, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' };
  const wonEntry: PokedexEntry = { won: true, sprite: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' };

  beforeEach(async () => {
    localStorage.clear();

    darkModeServiceSpy = jasmine.createSpyObj('DarkModeService', [], {
      darkMode$: of(false)
    });
    pokemonServiceSpy = jasmine.createSpyObj('PokemonService', ['getPokemonById']);
    pokemonServiceSpy.getPokemonById.and.returnValue({
      pokemonId: 25,
      text: 'pokemon.pikachu',
      fillStyle: 'yellow',
      sprite: null,
      shiny: false,
      power: 2,
      weight: 1
    });

    await TestBed.configureTestingModule({
      imports: [
        PokedexEntryComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: DarkModeService, useValue: darkModeServiceSpy },
        { provide: PokemonService, useValue: pokemonServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PokedexEntryComponent);
    component = fixture.componentInstance;
    component.pokemonId = 25;
    component.entry = unseenEntry;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // VIS-01: Unseen shows unknown.png, no sprite
  it('VIS-01: renders unknown.png when entry is undefined', () => {
    const img = fixture.nativeElement.querySelector('.pokedex-cell-front img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toContain('unknown.png');
  });

  it('VIS-01: does not render sprite img when unseen', () => {
    const backImg = fixture.nativeElement.querySelector('.pokedex-cell-back img') as HTMLImageElement;
    expect(backImg).toBeNull();
  });

  // VIS-02: Seen shows front_default sprite with loading=lazy
  it('VIS-02: renders sprite img when entry is defined', () => {
    component.entry = seenEntry;
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.pokedex-cell-back img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  // VIS-03: Won adds .won CSS class
  it('VIS-03: adds .won class when entry.won is true', () => {
    component.entry = wonEntry;
    fixture.detectChanges();
    const cell = fixture.nativeElement.querySelector('.pokedex-cell') as HTMLElement;
    expect(cell.classList).toContain('won');
  });

  it('VIS-03: does not add .won class for seen-only entry', () => {
    component.entry = seenEntry;
    fixture.detectChanges();
    const cell = fixture.nativeElement.querySelector('.pokedex-cell') as HTMLElement;
    expect(cell.classList).not.toContain('won');
  });

  // VIS-04: Number badge always visible
  it('VIS-04: renders number badge when unseen', () => {
    const badge = fixture.nativeElement.querySelector('.number-badge') as HTMLElement;
    expect(badge).toBeTruthy();
    expect(badge.textContent?.trim()).toBe('#025');
  });

  it('VIS-04: renders number badge when seen', () => {
    component.entry = seenEntry;
    fixture.detectChanges();
    const badge = fixture.nativeElement.querySelector('.number-badge') as HTMLElement;
    expect(badge.textContent?.trim()).toBe('#025');
  });

  // VIS-05: Tooltip text
  it('VIS-05: isSeen is false when entry is undefined', () => {
    expect(component.isSeen).toBeFalse();
  });

  it('VIS-05: isSeen is true when entry is defined', () => {
    component.entry = seenEntry;
    fixture.detectChanges();
    expect(component.isSeen).toBeTrue();
  });

  it('VIS-05: pokemonText returns i18n key when seen', () => {
    expect(component.pokemonText).toBe('pokemon.pikachu');
  });

  // VIS-06: Flip card class
  it('VIS-06: adds .seen class to cell when entry is defined', () => {
    component.entry = seenEntry;
    fixture.detectChanges();
    const cell = fixture.nativeElement.querySelector('.pokedex-cell') as HTMLElement;
    expect(cell.classList).toContain('seen');
  });

  it('VIS-06: does not have .seen class when unseen', () => {
    const cell = fixture.nativeElement.querySelector('.pokedex-cell') as HTMLElement;
    expect(cell.classList).not.toContain('seen');
  });

  // Number formatting
  it('formatPokemonNumber formats IDs 1-9 with 3 digit padding', () => {
    expect(component.formatPokemonNumber(1)).toBe('#001');
  });

  it('formatPokemonNumber formats IDs 10-99 with 2 digit padding', () => {
    expect(component.formatPokemonNumber(25)).toBe('#025');
  });

  it('formatPokemonNumber formats IDs 1000+ without padding', () => {
    expect(component.formatPokemonNumber(1011)).toBe('#1011');
  });
});
```

---

### Anti-Patterns to Avoid

- **Subscribing to `pokedex$` inside `PokedexEntryComponent`:** The parent passes the entry slice. Subscribing internally makes the component impure and harder to test. Pass the computed slice from the parent.
- **Using `@angular/animations` for the flip:** Pure CSS `transition` is sufficient and has no extra runtime overhead.
- **Calling `ngbTooltip` with a separate element per state:** Use a single `[ngbTooltip]` ternary expression on the outer container; avoids duplicate tooltips.
- **Omitting `-webkit-backface-visibility`:** iOS Safari requires the `-webkit-` prefix for `backface-visibility`. Without it, the flip card shows both faces simultaneously on iPhone/iPad.
- **Using `OnPush` change detection:** Tempting for performance in a 1,025-cell grid, but the `async` pipe used for `darkMode$` works correctly with default CD. If `OnPush` is added, verify that the `async` pipe in the template still triggers re-renders. Given Phase 3 controls the outer loop, leave at default CD for Phase 2.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Tooltip with translate | Custom tooltip component | `NgbTooltipModule` + `ngbTooltip` directive | Already used in `trainer-team.component.html`; handles positioning, accessibility, and ng-bootstrap styling |
| Lazy loading | IntersectionObserver wrapper | `loading="lazy"` HTML attribute | Native browser feature; works with Angular `[src]` binding; no polyfill needed on GitHub Pages |
| Pokémon name lookup | Custom map or service | `PokemonService.getPokemonById(id)?.text` | `nationalDexPokemon` array is already the source of truth |
| Dark mode check | `localStorage.getItem()` | `DarkModeService.darkMode$` | Handles initial state, media query, and localStorage already |

---

## Common Pitfalls

### Pitfall 1: iOS Safari Flip Card Breaks (Both Faces Visible)
**What goes wrong:** On iPhone/iPad Safari, both front and back faces of the flip card are simultaneously visible.
**Why it happens:** Safari requires `-webkit-backface-visibility: hidden` and `-webkit-transform-style: preserve-3d` in addition to the unprefixed versions.
**How to avoid:** Always include both prefixed and unprefixed variants:
```css
backface-visibility: hidden;
-webkit-backface-visibility: hidden;
transform-style: preserve-3d;
-webkit-transform-style: preserve-3d;
```
**Warning signs:** Testing in Chrome/Firefox works fine; issue only visible on real iOS device or Safari browser.

### Pitfall 2: `perspective` on Wrong Element
**What goes wrong:** The 3D rotation looks flat (no depth effect) or the flip is incorrect.
**Why it happens:** `perspective` must be on the **parent** of the element with `transform-style: preserve-3d`. Setting it on `.pokedex-cell-inner` itself has no effect.
**How to avoid:** Set `perspective: 200px` on `.pokedex-cell` (the outer container), NOT on `.pokedex-cell-inner`.

### Pitfall 3: Number Badge Hidden Behind Flip Card Faces
**What goes wrong:** The `.number-badge` disappears when the flip card animates because it's inside `.pokedex-cell-inner` which has `transform-style: preserve-3d`.
**Why it happens:** Children of a `preserve-3d` element participate in the 3D context.
**How to avoid:** Place `.number-badge` as a **sibling** of `.pokedex-cell-inner` (both direct children of `.pokedex-cell`), with `z-index: 2` and `position: absolute`. The badge stays in normal flow above both 3D faces.

### Pitfall 4: `loading="lazy"` in Karma Tests
**What goes wrong:** The lazy-loaded sprite `<img>` never actually loads in Karma tests because there is no real browser viewport.
**Why it happens:** `loading="lazy"` is a browser hint; headless Karma/Chrome may treat all off-viewport images as deferred.
**How to avoid:** In specs, only assert the **attribute is present** (`img.getAttribute('loading') === 'lazy'`), not that the image loaded or has `naturalWidth > 0`. This is correct behavior and matches the spec goals.

### Pitfall 5: `ngbTooltip` Not Rendering in Tests
**What goes wrong:** Tooltip text is never shown in Jasmine tests even after `fixture.detectChanges()`.
**Why it happens:** `NgbTooltipModule` renders tooltips on hover (DOM event), which Jasmine doesn't trigger by default.
**How to avoid:** Test the **input to the tooltip directive** (e.g., `component.isSeen`, `component.pokemonText`) rather than the rendered tooltip DOM. Tooltip rendering is ng-bootstrap's responsibility, not this component's.

### Pitfall 6: `distinctUntilChanged` on `pokedex$` — Object Reference Equality
**What goes wrong:** Changes to `PokedexEntry` fields (e.g., `won: false → true`) don't trigger template updates.
**Why it happens:** `PokedexService.pokedex$` uses `distinctUntilChanged()` with default reference equality on `PokedexData`. However, `markSeen` and `markWon` always create **new objects** via spread (`{ ...current.caught, [key]: ... }`), so the reference changes on every update.
**How to avoid:** This is safe as-is. The new reference propagates through the `async` pipe in the parent and gets passed as a new `entry` input. No action needed in `PokedexEntryComponent`.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Karma 6.4.4 + Jasmine 6.1.0 |
| Config file | `angular.json` (lines 76-96) |
| Quick run command | `ng test --include="**/pokedex-entry/**" --watch=false` |
| Full suite command | `npm test` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIS-01 | Unseen renders `unknown.png`, no `<img>` in back face | unit | `ng test --include="**/pokedex-entry/**" --watch=false` | ❌ Wave 0 |
| VIS-02 | Seen renders sprite `<img>` with `loading="lazy"` | unit | same | ❌ Wave 0 |
| VIS-03 | Won adds `.won` CSS class to cell | unit | same | ❌ Wave 0 |
| VIS-04 | Number badge renders in all states with correct format | unit | same | ❌ Wave 0 |
| VIS-05 | `isSeen` false → tooltip is `???`; `isSeen` true → `pokemonText` is i18n key | unit | same | ❌ Wave 0 |
| VIS-06 | `.seen` class added when `entry` defined; absent when `entry` is `undefined` | unit | same | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `ng test --include="**/pokedex-entry/**" --watch=false`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/app/pokedex/pokedex-entry/pokedex-entry.component.spec.ts` — covers VIS-01 through VIS-06 (complete spec provided in Code Examples above)
- [ ] `src/app/pokedex/` directory — must be created (no existing files conflict)

*(Note: No test framework install needed — Karma + Jasmine already configured in `angular.json`)*

---

## Environment Availability

Step 2.6: No external dependencies beyond Node.js/npm and the project's own code. All required libraries (`@ng-bootstrap`, `@ngx-translate`, `@angular/common`) are already installed. No new `npm install` required.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/test | ✓ | 24.13.0 | — |
| `@ng-bootstrap/ng-bootstrap` | `NgbTooltipModule` | ✓ | 20.0.0 | — |
| `@ngx-translate/core` | `TranslatePipe` | ✓ | 17.0.0 | — |
| `@angular/common` | `async` pipe, `NgClass` | ✓ | 21.2.7 | — |

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `*ngIf`, `*ngFor` structural directives | `@if`, `@for` control flow blocks | Angular 17 | Project uses both; use `@if` for new code (consistent with `storage-pc.component.html` lines 17, 32) |
| `NgModule` imports | Standalone component `imports[]` array | Angular 14+ | All new components are standalone (`standalone: true`); confirmed in conventions |
| `styleUrls: []` (array) | `styleUrl: ''` (single string) | Angular 17 | Use `styleUrl` (singular); confirmed in `storage-pc.component.ts` line 25 |

---

## Open Questions

1. **Will `src/app/pokedex/` be a feature module or just a folder?**
   - What we know: All new components are standalone; no NgModules exist
   - What's unclear: Whether a barrel `index.ts` is needed for Phase 3's import
   - Recommendation: Simple folder, no barrel file — Phase 3 imports `PokedexEntryComponent` directly by path

2. **Should the number badge text color adapt to dark mode?**
   - What we know: D-02 specifies position/format but not color
   - What's unclear: Whether white-on-dark-background is sufficient in light mode
   - Recommendation: Semi-transparent dark background + white text (already in CSS above) works in both modes at 40px scale

---

## Sources

### Primary (HIGH confidence — files read directly)
- `src/app/trainer-team/storage-pc/storage-pc.component.ts` — dark mode `darkMode!: Observable<boolean>` + `ngOnInit` assignment pattern (line 42-43, 56)
- `src/app/trainer-team/storage-pc/storage-pc.component.html` — `@for` control flow, `pokemon-storage-card` card pattern
- `src/app/trainer-team/storage-pc/storage-pc.component.css` — card sizing, flexbox grid, shadow patterns
- `src/app/trainer-team/trainer-team.component.html` — `[ngClass]="(darkMode | async) ?"` exact pattern (lines 2, 6, 19, 27); `ngbTooltip` with `| translate` (lines 24, 33, 42, 51, 60, 69)
- `src/app/trainer-team/trainer-team.component.ts` — `NgbTooltipModule` import (line 6), `darkMode` field (line 43+)
- `src/app/trainer-team/trainer-team.component.css` — `.black-border`, `.white-shadow`, `.pokemon-container` CSS
- `src/app/services/pokedex-service/pokedex.service.ts` — `PokedexEntry`, `PokedexData` interfaces; `markSeen`/`markWon` always create new object references (confirmed spread pattern, lines 40-43, 49-54)
- `src/app/services/pokemon-service/pokemon.service.ts` — `getPokemonById(id)` returns `PokemonItem | undefined`; confirmed `.text` field
- `src/app/services/pokemon-service/national-dex-pokemon.ts` — `.text` is i18n key (e.g., `'pokemon.bulbasaur'`) not display name (lines 4-8)
- `src/app/services/dark-mode-service/dark-mode.service.ts` — `darkMode$: Observable<boolean>` via `BehaviorSubject` + `distinctUntilChanged`
- `src/app/interfaces/pokemon-item.ts` — `PokemonItem extends WheelItem` with `pokemonId`, `sprite`, `shiny`, `power`
- `src/app/interfaces/wheel-item.ts` — `WheelItem { text: string; fillStyle: string; weight: number }`
- `src/assets/i18n/en.json` — `"pokemon": { "bulbasaur": "Bulbasaur" }` at line 433 (confirmed i18n key format)
- `src/app/main-game/roulette-container/roulette-container.component.ts` — `unknown.png` URL at lines 262, 282, 292 (confirmed exact URL)
- `src/app/trainer-team/storage-pc/storage-pc.component.spec.ts` — test scaffold pattern (imports, mocking, `TranslateModule.forRoot()`)
- `src/app/services/pokedex-service/pokedex.service.spec.ts` — `localStorage.clear()` in `beforeEach`, `TestBed.configureTestingModule` pattern

### Secondary (MEDIUM confidence)
- `copilot-instructions.md` — Angular 21 + Bootstrap 5 + ng-bootstrap stack confirmed; standalone components; no new UI frameworks

---

## Project Constraints (from copilot-instructions.md)

| Directive | Source |
|-----------|--------|
| Tech stack: Angular 21 + Bootstrap 5 + ng-bootstrap — **no new UI frameworks** | copilot-instructions.md line 12 |
| Data must survive game resets | copilot-instructions.md line 13 |
| Must work on GitHub Pages (static, no server) | copilot-instructions.md line 14 |
| 1,025 entries — sprites lazy-loaded on demand | copilot-instructions.md line 15 |
| 2 spaces indentation, single quotes, final newline | copilot-instructions.md lines 114-118 |
| Standalone components (`standalone: true`) | copilot-instructions.md line 160 |
| `templateUrl` + `styleUrl` (not inline templates) | copilot-instructions.md line 171 |
| Services use `@Injectable({ providedIn: 'root' })` | copilot-instructions.md line 159 |
| No leading underscore for private fields | copilot-instructions.md line 105 |
| Observable fields end in `$` | copilot-instructions.md line 106 |
| Event handlers prefixed with `on` | copilot-instructions.md line 104 |
| Subscriptions unsubscribed in `ngOnDestroy()` | copilot-instructions.md line 176 |

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified all imports and versions against package.json and existing component source files
- Architecture: HIGH — complete patterns copied verbatim from existing codebase files
- Pitfalls: HIGH (iOS flip card) / MEDIUM (Karma lazy-loading) — flip card prefixes well-established; Karma behavior inferred from how headless Chrome handles viewport

**Research date:** 2026-04-03
**Valid until:** 2026-05-03 (Angular 21 stable; ng-bootstrap 20 stable)

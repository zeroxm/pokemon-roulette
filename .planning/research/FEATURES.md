# Feature Research

**Domain:** Browser-based Pokédex modal UI for Pokémon fan game
**Researched:** 2025-01-10
**Confidence:** HIGH (core visual language derived from established main-series conventions and direct codebase inspection)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features Pokémon fans assume exist. Missing any one of these makes the Pokédex feel like a generic list — not a Pokédex.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Pokédex number on every cell** (`#001`) | Every Pokédex in every game displays the national number. Absence breaks the "Pokédex feel" immediately. | LOW | Zero-padded 3 digits. Format: `#001`. Always shown even for unseen Pokémon. |
| **Black silhouette for unseen Pokémon** | This is the single most iconic Pokédex pattern since Gen 1. Players immediately recognise the reveal mechanic. | LOW | CSS `filter: brightness(0)` on the PokeAPI sprite achieves this authentically without a separate asset. Show the *real* sprite silhouette, not the generic unknown.png, so the shape is accurate. |
| **"???" name for unseen Pokémon** | Main games show `?????????` until caught. Players read a real name as "I've seen this before." | LOW | Display literal `???` when state = unseen. Reveal actual name on first seen state. |
| **Small sprite grid layout** | Pokédex = thumbnail grid, not large cards. Large cards feel like a "collection gallery" app, not a Pokédex. | LOW | ~56–64px sprite cells. Reference: storage-pc uses `calc((100% - 5*12px) / 6)` — Pokédex should match this rhythm. |
| **Progress counter** | Every in-game Pokédex shows "X / 151 caught." Players immediately look for this to gauge completion. | LOW | Two counts: **Seen** (assigned) and **Won** (champion). Format: `Seen: 45 / 151   Won: 12 / 151`. Place in modal header or sticky sub-header. |
| **Local / National view toggle** | The game already has a generation concept. A local dex without a tab to the national view feels incomplete; a national dex with no local context feels overwhelming. | LOW | Use Bootstrap `nav-tabs` (already in project) or two `btn-outline` buttons. National tab shows 1–1025; Local tab filters to current generation. |
| **Pokémon name shown when seen** | Once assigned, the player should know *what* they have. Hiding the name after unlock is annoying, not mysterious. | LOW | Show name below sprite. Use the existing `translate` pipe for multi-language name lookup if i18n names are available; otherwise use raw PokeAPI name. |
| **"Won" state visually distinct from "Seen"** | The game's key mechanic is the Champion run. The Pokédex must reward that differently. Without visual distinction, the second state is invisible. | MEDIUM | See "Seen vs Won Visual Patterns" section below — golden star badge is the chosen convention. |
| **Scrollable modal body** | With up to 151 (local) or 1,025 (national) entries, the modal must scroll. | LOW | `NgbModal` with `scrollable: true`. The grid itself scrolls inside `modal-body`. |
| **Dark mode support** | The game already has dark mode (body class `dark-mode` / `light-mode`). A modal that ignores it is visually jarring. | LOW | Use `darkMode | async` pattern from `StoragePcComponent`. Apply `.modal-body { color: black }` override only in light mode (match existing `.storage-pc.component.css` pattern). |

---

### Differentiators (Competitive Advantage)

Features that make *this* Pokédex feel crafted, not just functional.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Golden star badge for "Won" state** | Gold star = champion-tier achievement. Immediately communicates "I beat the game with this one." Fans associate gold/yellow with mastery (Ribbons, perfect IVs, completion stars). | LOW | Absolute-positioned `★` character (Unicode U+2605) in top-right corner of cell. Color: `#FFD700` (CSS gold). Use `position: relative` on cell, `position: absolute; top: 2px; right: 3px` for star. No image asset needed. |
| **Real-time cell reveal animation** | When a Pokémon is assigned mid-run, its cell in the Pokédex should feel like it "unlocks." The main games play a jingle — we can do a visual equivalent. | MEDIUM | CSS `@keyframes` scale pop (0→1.1→1) + grayscale-to-color transition on the sprite. Trigger only on the state transition, not on every modal open. Flag on the entry in localStorage to track "newly revealed." |
| **Per-generation progress in the tab label** | Instead of just "Local" and "National," show `Kanto (45/151)` — players know at a glance which gens they've completed. | LOW | Pipe the count into the tab label. Trivially computed from service state. |
| **Cell number always visible, name revealed** | Number present even when silhouette. The number is non-spoilery; the name is the reveal. This is authentic to Pokémon Sword/Shield's Pokédex preview behaviour. | LOW | CSS layering: number below silhouette, name hidden with `visibility: hidden` until seen. Do NOT use `display: none` so layout doesn't shift on reveal. |
| **Lazy-load sprites via IntersectionObserver** | 1,025 API calls on modal open would produce visible lag and hit PokeAPI rate limits. Lazy loading makes the modal feel instant. | MEDIUM | Angular directive (`[appLazySprite]`) that sets `src` only when cell enters the viewport. Use `IntersectionObserver` internally. Already established pattern in the ecosystem: observe `<img>` elements with a data attribute for deferred `src`. |
| **Pokéball icon on "Seen" cells** | Small Pokéball `⊙` (or SVG/icon) overlaid on seen-but-not-won cells communicates "in the Pokédex" clearly before the gold star era is reached. Fans recognise the Pokéball as the Pokédex symbol. | LOW | Can use an ng-icon (`bootstrapRecord` or `bootstrapCircle`) in the same corner position as the star, with lower visual weight. Only show when seen AND not won. |
| **"Pokémon GB" font on number/name** | The game body already uses `font-family: "Pokemon GB"`. The Pokédex cells should inherit this — it's the single biggest contributor to authentic feel at low cost. | LOW | Already in `styles.css`. No extra work — just don't override it with Bootstrap's default font. |

---

### Anti-Features (Deliberately NOT Building in V1)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Pokédex entry text / type / stats panel** | Players tap/click a cell expecting to see stats, type, abilities — like the real games. | Enormous data scope. PokeAPI calls per-Pokémon for type/ability/description + i18n for 6 languages = 6,000+ API responses to cache. Misleads scope. | Defer to v2. Cell click can do nothing in v1, or show a `<title>` tooltip with just the name. |
| **Search / filter bar** | With 1,025 entries, players will want to search by name or type. | Per the project spec, this is explicitly deferred. Adding it now also requires a text-input UX that competes with the grid for vertical space. | Out of scope per PROJECT.md. Add in v2 iteration. |
| **Shiny tracking** | Shiny Pokémon exist in the game. Players will want to know if they've gotten a shiny. | Shiny status is per-run only; making it global Pokédex state adds a third visual state and additional storage model complexity. | Shiny is tracked per-run already. National shiny tracking = v2. |
| **Completion reward or notification** | A "Pokédex complete!" modal is satisfying. | Scope creep. The progress counter provides the satisfaction signal. A completion modal requires state management for first-time detection across browser sessions. | Defer. Progress counter at 1025/1025 is its own reward. |
| **Animated sprite GIFs** | PokeAPI provides animated sprites. They would look great. | Animated GIF sprites from PokeAPI are large (~20–80KB each) and only exist for generations 1–5. Using them inconsistently across generations creates a jarring two-tier experience. | Use `front_default` static sprite uniformly. Consistent > flashy. |
| **Virtual scrolling (CDK)** | 1,025 DOM nodes is a lot. CdkVirtualScrollViewport seems like the right fix. | Virtual scrolling forces a fixed cell height, which conflicts with CSS flex/grid wrap layout. It also makes smooth scroll feel choppy on mobile. | Use `IntersectionObserver` lazy sprite loading instead. The DOM nodes are lightweight (just divs + imgs) — it's the image network requests that are expensive, not DOM count. |
| **Per-run Pokédex reset** | Players might want a "fresh" Pokédex for a new run. | Explicitly out of scope (PROJECT.md). The Pokédex is intentionally cumulative — that's its value proposition. | Restart Game clears the team but not the Pokédex. Documented behaviour. |

---

## Seen vs Won Visual Patterns

This is the most design-critical decision. Three approaches, evaluated for fan recognisability:

### Option A — Gold Star Badge ★ (RECOMMENDED)
```
┌─────────────┐
│           ★ │  ← gold star, top-right corner
│  [sprite]   │
│  #001       │
│  Bulbasaur  │
└─────────────┘
```
**Why this works:**
- Gold star is universally understood as "achievement/mastery" in gaming
- In main Pokémon games, gold stars appear on Ribbons and completion markers
- The ★ character (`\u2605`) requires zero images
- Does not obscure the sprite (corner placement)
- Works at small size (10–12px) without becoming unreadable
- Dark mode compatible: `#FFD700` reads on both `#2d3436` and `#dfe6e9` backgrounds

**State mapping:**
- Unseen: silhouette + `???` + no decoration
- Seen: color sprite + name + no decoration (bare)
- Won: color sprite + name + `★` gold star badge

### Option B — Border Color Ring (Alternative)
Border: `1px solid #333` (unseen/seen) → `2px solid #FFD700` (won)

Rejected: border color differences are hard to scan in a grid. Peripheral vision picks up shape (star) before color (border).

### Option C — Pokéball + Star (Both)
Pokéball icon for seen, star for won (star replaces Pokéball).

Acceptable as enhancement. Keep simple for v1: no decoration for seen, star for won. Pokéball can be added later.

---

## Feature Dependencies

```
[Pokédex Service (localStorage state)]
    └──required by──> [Seen/Won Cell State]
                          └──required by──> [Silhouette vs Sprite rendering]
                          └──required by──> [Gold Star badge]
                          └──required by──> [Progress counter]

[IntersectionObserver Lazy Load directive]
    └──required by──> [National Dex grid (1025 entries)]

[Local/National tab toggle]
    └──enhances──> [Progress counter] (per-tab counts)

[Per-generation count in tab label]
    └──enhances──> [Local/National tab toggle]

[Real-time cell reveal animation]
    └──requires──> [State transition detection] (not just current state)
    └──conflicts──> [Loading all cells fresh from localStorage on every modal open]
```

### Dependency Notes

- **Silhouette rendering requires knowing state**: The component cannot render correctly without the Pokédex service providing the state map. Service must be built first.
- **Lazy loading required by national dex**: Without it, 1,025 PokeAPI requests fire simultaneously. This is a hard technical requirement before the national dex tab can exist.
- **Animation requires transition detection**: Showing a reveal animation on every modal open would be annoying. The service needs a "newly seen" flag (cleared after first modal open) to know when to animate.

---

## MVP Definition

### Launch With (v1 — This Milestone)

- [x] **Pokédex service** — localStorage persistence, seen/won maps, update hooks — *enables everything else*
- [x] **Local dex tab** — grid of current generation's Pokémon, silhouette/sprite/star states — *core gameplay loop feedback*
- [x] **National dex tab** — all 1,025 entries, lazy-loaded sprites — *long-term replayability hook*
- [x] **Progress counters** — "Seen X / N  Won Y / N" in modal header — *immediate gratification signal*
- [x] **Gold star badge for Won state** — CSS-only, corner position — *distinguishes champion achievement*
- [x] **Dark mode support** — `darkMode | async` pattern — *matches existing game UI*
- [x] **Pokédex button next to PC button** — same `btn-outline-dark/light` pattern — *discovery/access*

### Add After Validation (v1.x)

- [ ] **Per-generation count in tab label** — `Kanto (45/151)` — low complexity, high polish
- [ ] **Real-time cell reveal animation** — adds delight on assignment, requires "newly seen" flag in service
- [ ] **Pokéball icon on seen-not-won cells** — additional visual differentiator between states

### Future Consideration (v2+)

- [ ] **Pokédex entry panel** (type, stats, description) — wait until data fetching strategy is clear
- [ ] **Search/filter** — wait until user demand is confirmed
- [ ] **Shiny Pokédex tracking** — requires third visual state + service model change
- [ ] **Per-run Pokédex reset option** — only if user feedback asks for it
- [ ] **Animated sprites** — inconsistent across generations; wait for uniform asset strategy

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Silhouette for unseen | HIGH | LOW | P1 |
| "???" name for unseen | HIGH | LOW | P1 |
| Pokédex number on cells | HIGH | LOW | P1 |
| Progress counter | HIGH | LOW | P1 |
| Local / National tab toggle | HIGH | LOW | P1 |
| Gold star for "Won" state | HIGH | LOW | P1 |
| Dark mode support | HIGH | LOW | P1 |
| Lazy sprite loading | HIGH (perf) | MEDIUM | P1 |
| Pokémon GB font on cells | MEDIUM | LOW | P1 (free — inherited) |
| Per-gen count in tab label | MEDIUM | LOW | P2 |
| Cell reveal animation | MEDIUM | MEDIUM | P2 |
| Pokéball icon on seen cells | LOW | LOW | P2 |
| Entry detail panel | HIGH | HIGH | P3 |
| Search/filter | MEDIUM | MEDIUM | P3 |
| Shiny tracking | LOW | HIGH | P3 |

---

## Mobile Considerations

The game has mobile users (Bootstrap responsive grid already in use).

| Concern | Desktop | Mobile |
|---------|---------|--------|
| Grid columns | 6 columns (matching storage-pc) | 4 columns minimum (touch targets ≥ 52px) |
| Cell size | ~64px sprite + number + name | ~56px sprite, name below — may truncate to 6 chars + `…` |
| Tab switching | Bootstrap nav-tabs horizontal | Same — nav-tabs work at any width |
| Progress counter | Header inline | Wrap to second line — use `flex-wrap` |
| Scroll performance | 1,025 div nodes fine | IntersectionObserver critical — do not load off-screen sprites |
| Modal size | `modal-xl` or `modal-dialog-scrollable` | `modal-fullscreen-sm-down` for phones |
| Touch target | N/A | Each cell min 44×44px (Apple HIG, WCAG 2.5.5) |

**Critical mobile pattern**: Use `modal-fullscreen-sm-down` class on the modal dialog. This makes the Pokédex fill the screen on phones (like a real handheld device), while staying as a centered modal on desktop. The existing `StoragePcComponent` does not do this — the Pokédex should, given the larger content volume.

---

## Visual Reference: Authentic Pokédex Cell States

```
UNSEEN                  SEEN                    WON
┌──────────┐            ┌──────────┐            ┌──────────┐
│ ████████ │            │  (img)   │            │  (img) ★ │
│ ████████ │  →assign→  │          │  →win→     │          │
│ ████████ │            │          │            │          │
│  #001    │            │  #001    │            │  #001    │
│  ???     │            │ Bulbasaur│            │ Bulbasaur│
└──────────┘            └──────────┘            └──────────┘
filter:brightness(0)    full-color sprite       full-color + ★ (#FFD700)
```

CSS implementation sketch (fits existing codebase patterns):
```css
/* Cell base */
.pokedex-cell {
  position: relative;        /* anchor for badge */
  width: calc((100% - 5 * 8px) / 6);  /* 6-col desktop */
  padding: 4px;
  border: 1px solid #333;
  border-radius: 4px;
  background: #dfe6e9;
  text-align: center;
  font-size: 10px;           /* Pokemon GB font at small size */
}

/* Unseen: silhouette */
.pokedex-cell.unseen img {
  filter: brightness(0);
}

/* Won: gold star badge */
.pokedex-cell.won::after {
  content: '★';
  position: absolute;
  top: 2px;
  right: 3px;
  color: #FFD700;
  font-size: 12px;
  line-height: 1;
}

/* Mobile: 4-col */
@media (max-width: 768px) {
  .pokedex-cell {
    width: calc((100% - 3 * 8px) / 4);
  }
}
```

---

## Competitor Feature Analysis

| Feature | Main Series Games (DS/3DS era) | Fan sites (PokéDB, Bulbapedia) | This Implementation |
|---------|-------------------------------|-------------------------------|-------------------|
| Unseen state | Black silhouette + ??? | Not applicable (all data shown) | Black silhouette via CSS filter |
| Seen vs caught | "Seen" counter + "Caught" counter | N/A | "Seen" (assigned) + "Won" (champion) |
| Number format | #001 | #0001 (national) | #001 (3-digit, matches main series) |
| Grid density | ~30 cells visible per screen | Table rows (1 per line) | ~30 cells visible (6-col grid) |
| Progress display | "Caught: 30" in top-right | Page count | Header counter, two stats |
| Local/National | Yes, via mode toggle | Yes, via region filter | Yes, via tabs |
| Achievement marker | Ribbons/Stars in later gens | N/A | Gold ★ badge |

---

## Sources

- **Main series Pokédex UI**: Pokémon Diamond/Pearl (DS), Pokémon X/Y (3DS), Pokémon Sword/Shield (Switch) — observed conventions from games in training data. Confidence: HIGH.
- **Silhouette CSS technique**: `filter: brightness(0)` — standard CSS, no library needed. Confidence: HIGH.
- **Gold star (`#FFD700`) convention**: Used by Pokémon fan community for mastery/completion signals. Confidence: HIGH.
- **PokeAPI sprite availability**: Confirmed working at `https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/pokemon/{id}.png`. Confidence: HIGH (200 response confirmed in this session).
- **Existing codebase patterns**: Directly read from `storage-pc.component.css`, `styles.css`, `storage-pc.component.html` in this session. Confidence: HIGH.
- **Bootstrap modal responsive classes**: `modal-fullscreen-sm-down` — Bootstrap 5 documented breakpoint modifier. Confidence: HIGH.
- **IntersectionObserver lazy loading**: Web standard API, supported in all modern browsers. Confidence: HIGH.

---

*Feature research for: Pokédex UI modal — Pokémon Roulette browser game*
*Researched: 2025-01-10*

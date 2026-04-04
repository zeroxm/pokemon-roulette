---
phase: 07-detail-modal
plan: 01
status: complete
requirements: [DETAIL-01, DETAIL-02, SHINY-02]
commit: 725ee81
---

## What was done

Created `PokedexDetailModalComponent` and added i18n keys for shiny toggle.

### Changes

**`src/assets/i18n/*.json` (6 files)**
- Added `detail.shiny.on` / `detail.shiny.off` keys to all locales
- FR: `"✨ Chromatique"` / `"Normal"`, IT: `"✨ Shiny"` / `"Normale"`, others: `"✨ Shiny"` / `"Normal"`

**`src/app/pokedex/pokedex-detail-modal/` (4 new files)**
- `pokedex-detail-modal.component.ts` — standalone component with:
  - `@Input() pokemonId`, `@Input() entry: PokedexEntry`
  - `artworkUrl` getter (official-artwork URL, switches on `showShiny`)
  - `displayUrl` getter (`hasError ? fallbackUrl : artworkUrl`)
  - `hasShinyToggle` (`entry.shiny === true`) — SHINY-02
  - `hasAlternateForms` (`getFormIds(id).length > 1`) — DETAIL-02
  - `alternateForms` via `PokemonFormsService.getPokemonForms()` — DETAIL-02
  - `onArtworkError()` sets `hasError = true` for 404 fallback
- `pokedex-detail-modal.component.html` — circle artwork, number, conditional shiny toggle, conditional form tabs
- `pokedex-detail-modal.component.css` — `.pokemon-artwork-circle` 160×160 circle
- `pokedex-detail-modal.component.spec.ts` — 15 specs (create, artworkUrl, displayUrl, formatPokemonNumber, hasShinyToggle, template toggle, hasAlternateForms, alternateForms)

### Verification

- 160 specs, 0 failures (15 new modal specs added to baseline of 145)
- All 6 locale files parse as valid JSON with `detail.shiny` keys

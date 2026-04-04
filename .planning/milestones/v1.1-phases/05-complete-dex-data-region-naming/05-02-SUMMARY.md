---
plan: 05-02
phase: 5
status: complete
completed: 2026-04-03
requirements_completed: [DATA-08, UX-01]
commits:
  - 61f2d29
---

# Plan 05-02: Wire Complete Data + Region Tab Label

## What Was Built

**DATA-08 — Local Dex uses complete generation data:**
- Replaced `pokemonByGeneration` import with `pokedexByGeneration` in `pokedex.component.ts`
- `localIds` getter now returns full consecutive ranges (e.g. 151 for Kanto, 120 for Paldea)
- Progress counter now shows correct denominator

**UX-01 — Region-branded tab label:**
- Added `currentRegion: string = 'Kanto'` property to `PokedexComponent`
- Generation subscription now captures both `gen.id` and `gen.region`
- Template: `{{ 'pokedex.tab.local' | translate: { region: currentRegion } }}`
- All 6 i18n files updated with `{{region}}` placeholder:
  - EN: `"{{region}} Dex"` → "Kanto Dex", "Johto Dex", etc.
  - ES/FR/IT/PT: `"Pokédex {{region}}"` → "Pokédex Kanto", etc.
  - DE: `"{{region}}-Pokédex"` → "Kanto-Pokédex" (compound noun convention)

## Files Modified

- `src/app/trainer-team/pokedex/pokedex.component.ts`
- `src/app/trainer-team/pokedex/pokedex.component.html`
- `src/assets/i18n/en.json`
- `src/assets/i18n/es.json`
- `src/assets/i18n/fr.json`
- `src/assets/i18n/de.json`
- `src/assets/i18n/it.json`
- `src/assets/i18n/pt.json`

## Verification

- `pokemonByGeneration` count in component: 0 ✓
- `pokedexByGeneration` import present ✓
- `currentRegion` property and `gen.region` assignment ✓
- Template uses `translate: { region: currentRegion }` ✓
- All 6 locale files have `{{region}}` in `pokedex.tab.local` ✓
- All JSON files valid ✓
- 141/141 tests pass ✓

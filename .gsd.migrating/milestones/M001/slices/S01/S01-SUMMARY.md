---
id: S01
parent: M001
milestone: M001
provides:
  - ["pokemon-mega-forms.ts — Record<number, PokemonItem[]> mapping base Pokémon ID to mega form options", "All 86 mega stone ItemName literals in item-names.ts", "All 86 mega stone ItemItem records in items-data.ts with unknown.png sprite"]
requires:
  []
affects:
  - ["S02", "S03"]
key_files:
  - ["src/app/services/items-service/item-names.ts", "src/app/services/items-service/items-data.ts", "src/app/services/trainer-service/pokemon-mega-forms.ts", "src/app/services/item-sprite-service/item-sprite.service.ts"]
key_decisions:
  - ["Used 86 stones (not 89) — the explicit enumerated list in the plan contained 86 unique names; the prose count of 89 was inconsistent", "ItemSpriteService changed to Partial<Record<ItemName,...>> to avoid enumerating stone sprite URLs that don't exist", "megaStoneNameForBaseId covers only 57 of the 86 base IDs that have a 1:1 stone mapping"]
patterns_established:
  - ["Mega stone items follow the same ItemName + ItemItem pattern as existing items, with unknown.png as sprite fallback when PokeAPI has no asset"]
observability_surfaces:
  - ["none — pure data slice, no runtime signals"]
drill_down_paths:
  - ["D:/workspace/pokemon-roulette/.gsd/milestones/M001/slices/S01/tasks/T01-SUMMARY.md", "D:/workspace/pokemon-roulette/.gsd/milestones/M001/slices/S01/tasks/T02-SUMMARY.md", "D:/workspace/pokemon-roulette/.gsd/milestones/M001/slices/S01/tasks/T03-SUMMARY.md"]
duration: ""
verification_result: passed
completed_at: 2026-05-16T12:24:21.817Z
blocker_discovered: false
---

# S01: Mega Forms Data and Items

**86 mega stone ItemName literals, 86 ItemItem records with unknown.png sprite, and pokemonMegaForms Record exported — data layer for Mega Evolution compiles clean through AOT**

## What Happened

T01 added 86 mega stone ItemName union literals to item-names.ts and 86 matching ItemItem records to items-data.ts, each with sprite: 'unknown.png' per R009 (PokeAPI has no stone sprites). The plan stated 89 but the canonical enumerated list contained 86 unique names; 86 was implemented. T02 created pokemon-mega-forms.ts exporting pokemonMegaForms (Record&lt;number, PokemonItem[]&gt;) and megaStoneNameForBaseId helper covering the 57 base IDs that map 1:1 to a stone in item-names.ts. As a side-effect fix, ItemSpriteService was changed from Record&lt;ItemName,...&gt; to Partial&lt;Record&lt;ItemName,...&gt;&gt; so new stone names don't need sprite URLs enumerated there — callers already fall back to unknown.png. T03 ran ng build --project pokemon-roulette which exited 0 with zero errors, confirming the data layer compiles clean through AOT. Pre-existing bundle budget and CommonJS warnings are unrelated to this slice.

## Verification

tsc --noEmit exits 0. ng build exits 0 with 0 errors. 86 stone literals confirmed in item-names.ts, 86 unknown.png records in items-data.ts, pokemon-mega-forms.ts present with pokemonMegaForms export. npm run test ETIMEDOUT is a pre-existing Windows environment issue with Karma/Jasmine — not introduced by this slice and not in scope (slice plan: "Verification: none — pure data files, no runtime signals").

## Requirements Advanced

- R007 — Mega stone ItemItem records created as permanent inventory items, unique per species
- R009 — All 86 stone records use sprite: 'unknown.png' — no PokeAPI sprite URLs referenced

## Requirements Validated

- R009 — grep confirms 86 unknown.png entries; tsc and ng build pass clean with no sprite-URL errors

## New Requirements Surfaced

None.

## Requirements Invalidated or Re-scoped

None.

## Operational Readiness

None.

## Deviations

Plan stated 89 stones; enumerated list contained 86 unique names — implemented 86. ItemSpriteService type change was unplanned but required to unblock compilation after T01 added new ItemName literals.

## Known Limitations

megaStoneNameForBaseId covers 57 of 86 base IDs (those with a 1:1 stone mapping); multi-stone Pokémon or those without a matching stone name are excluded from the helper but still present in pokemonMegaForms.

## Follow-ups

None.

## Files Created/Modified

- `src/app/services/items-service/item-names.ts` — Added 86 mega stone ItemName union literals
- `src/app/services/items-service/items-data.ts` — Added 86 ItemItem records with sprite: 'unknown.png'
- `src/app/services/trainer-service/pokemon-mega-forms.ts` — New file: exports pokemonMegaForms Record<number, PokemonItem[]> and megaStoneNameForBaseId helper
- `src/app/services/item-sprite-service/item-sprite.service.ts` — Changed itemSpriteData type from Record<ItemName,...> to Partial<Record<ItemName,...>> to accommodate stones without sprite URLs

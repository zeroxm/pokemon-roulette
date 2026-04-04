---
phase: 06-foundation-visual-polish
plan: 01
status: complete
requirements: [SHINY-01]
commit: 73bcb79
---

## What was done

Extended `PokedexService` to persist the shiny flag on caught Pokémon entries.

### Changes

**`src/app/services/pokedex-service/pokedex.service.ts`**
- Added `shiny?: boolean` to `PokedexEntry` interface (backward-compatible)
- Updated `markSeen(pokemonId, shiny=false)` with upgrade logic: returns early only if already caught AND (not shiny OR already has shiny). Spreads existing entry to preserve fields.
- Fixed `markWon` to spread existing entry before setting `won: true`, preserving the `shiny` flag

**`src/app/services/pokedex-service/pokedex.service.spec.ts`**
- Added 4 SHINY-01 specs: set shiny, upgrade non-shiny, permanent flag, preserved by markWon

**`src/app/main-game/roulette-container/roulette-container.component.ts`**
- Updated all 5 `markSeen` call sites to pass `.shiny` from `PokemonItem`
  - line 536: `stolenPokemon.shiny`
  - line 564: `pkmnIn.shiny`
  - line 695: `pokemon.shiny`
  - line 703: `pokemonIn.shiny`
  - line 725: `pokemonEvolutions[1].shiny`

### Verification

- 145 specs, 0 failures
- `grep -c "SHINY-01"` in spec file returns 4
- All 5 `markSeen` calls include `.shiny` second argument

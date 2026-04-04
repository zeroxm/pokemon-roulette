# Phase 1: Service & Game Hooks — Discussion Log

**Date:** 2026-04-03
**Phase:** 01-service-game-hooks

## Areas Discussed

### localStorage Schema

**Q: Which localStorage schema to use?**
Options: Flat arrays + sprite map (A) | Seen-map with embedded sprite (B) | Unified per-Pokémon record (C)
**Selected:** Option C — Unified per-Pokémon record (`caught[id] = { won, sprite }`)
*Rationale: Most explicit, easiest to extend later*

**Q: What localStorage key?**
Options: `pokemon-roulette-pokedex` | `pokedex` | custom
**Selected:** `pokemon-roulette-pokedex`
*Rationale: Consistent with existing `pokemon-roulette-settings` naming convention*

---

### Team Rocket Edge Case

**Q: Should a Pokémon obtained via Team Rocket steal be marked as 'seen'?**
Options: Yes | No | Agent decides
**Selected:** Yes — a stolen Pokémon is on your team, it should count as seen
*Note: Requires a second hook at line ~533 in roulette-container, not just completePokemonCapture()*

---

### Sprite Fetch Timing

**Q: When should the sprite URL be fetched?**
Options: Immediately on markSeen | Lazily on first Pokédex open | Agent decides
**Selected:** Immediately on markSeen — URL computed deterministically, stored before Pokédex ever opens

---

### Service Reactivity

**Q: Should PokedexService expose a BehaviorSubject Observable (pokedex$) now?**
Options: Yes (expose now) | No (sync only for now)
**Selected:** Yes — Phase 3 gets reactive counters for free; same pattern as SettingsService.settings$

---

*End of discussion log*

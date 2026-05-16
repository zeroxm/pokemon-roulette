---
phase: M001
phase_name: Mega Evolution
project: pokemon-roulette
generated: 2026-05-16T09:00:00Z
counts:
  decisions: 6
  lessons: 5
  patterns: 4
  surprises: 3
missing_artifacts: []
---

# M001 Learnings

### Decisions

- **Stone count: 86 not 89** — The plan's prose stated 89 stones but the enumerated list contained 86 unique names. Implemented 86, treating the enumerated list as authoritative over prose.  
  Source: S01-SUMMARY.md/Key decisions

- **ItemSpriteService changed to `Partial<Record<ItemName,...>>`** — Adding 86 new ItemName literals would require enumerating sprite URLs for all of them; using a Partial type lets the service compile without listing stone sprites that don't exist, falling back to unknown.png.  
  Source: S01-SUMMARY.md/Key decisions

- **`megaStoneNameForBaseId` covers only 57 of 86 base IDs** — Multi-stone Pokémon (Charizard, Mewtwo, Raichu) and those without a 1:1 name mapping are excluded from the helper but still present in `pokemonMegaForms`; specific stone resolved at award time via `getFirstAvailableMegaStoneNameForPokemon`.  
  Source: S01-SUMMARY.md/Known limitations

- **Original PokemonItem stored at apply-time for faithful revert** — `pokemonMegaForms` only contains mega forms, not base form data. Storing the original `PokemonItem` in `megaBattleOriginalPokemon` at apply-time is required for a faithful revert; reconstructing from the map is impossible.  
  Source: S03-SUMMARY.md/Key decisions

- **Pre-battle mega selection wired into `awardMegaStone()` handler, not a separate battle-entry hook** — Battle states are pre-initialized by `GameStateService.initializeStates()`, so a new hook inserted at battle entry would run after states are already set. Injecting mega selection states into the LIFO stack from the award handler guarantees they're consumed before the battle state.  
  Source: S03-SUMMARY.md/Key decisions

- **Animation modal uses hardcoded 'MEGA' text instead of TranslatePipe** — Avoids adding a translation dependency to a cinematic component; acceptable for MVP. Upgrade path documented in component comment.  
  Source: S04-SUMMARY.md/Key decisions

---

### Lessons

- **Partial record types unblock new ItemName literals without enumerating all entries** — When a `Record<ItemName, T>` can't be fully populated (missing sprite URLs), switching to `Partial<Record<ItemName, T>>` lets the compiler accept the incomplete map and avoids fabricating placeholder values.  
  Source: S01-SUMMARY.md/Deviations

- **LIFO GameState stack ordering is the insertion mechanism for pre-battle hooks** — There is no dedicated pre-battle lifecycle hook; pushing states onto the LIFO stack from post-award handlers is the idiomatic way to inject pre-battle wheels and modals because `GameStateService.initializeStates()` has already set the battle state by the time battle begins.  
  Source: S03-SUMMARY.md/Key decisions

- **Wheel i18n key naming convention: camelCase under feature namespace** — Key is `mega.whoMega` (not `mega.megaWho`), consistent with existing keys such as `evolution.whoWill`. Always match the existing camelCase convention under the feature namespace.  
  Source: S03-SUMMARY.md/Deviations

- **ModalQueueService prepend pattern sequences animation before presentation modals** — To display a cinematic before a leader/champion modal, prepend the animation modal to the ModalQueueService queue. This is the correct pattern for all pre-battle cinematics.  
  Source: S04-SUMMARY.md/Patterns established

- **Browser rendering is out of scope for artifact-level verification** — tsc + ng build exit 0 plus symbol-grep evidence is the achievable proof level for complex UI features. Live browser verification of animation timing/visuals requires a human reviewer.  
  Source: S03-SUMMARY.md/Known limitations

---

### Patterns

- **GameState enum extension pattern: add literal → add switch case → add i18n in all 6 locales** — Extending the game's state machine requires three coordinated edits: add the string literal to `game-state.ts`, add a `case` in `RouletteContainerComponent`'s switch, and add the i18n key in all 6 locale JSON files (en, es, de, fr, it, pt).  
  Source: S02-SUMMARY.md/Patterns established

- **Eligibility-check helper in TrainerService as single source of truth** — Reusable eligibility logic (hasItem + pokemonMegaForms lookup) belongs in TrainerService to avoid duplication across result handlers. Duplicating inline in each handler creates drift risk.  
  Source: S02-SUMMARY.md/Patterns established

- **Pre-battle conditional wheel via LIFO stack injection** — Push conditional `select-X` states via an award/result handler using `maybePushX()`. The LIFO stack ensures those states are consumed before the battle state. Use this pattern for any future pre-battle wheel or prompt.  
  Source: S03-SUMMARY.md/Patterns established

- **Dynamic form swap: store original at apply-time, revert from stored value** — When applying a temporary form that can't be reconstructed from a lookup table, store the original `PokemonItem` in a service field at apply-time. `revertBattleForms` reads from that field. Don't try to invert the forms map.  
  Source: S03-SUMMARY.md/Patterns established

---

### Surprises

- **Plan's stone count (89) was inconsistent with the enumerated list (86)** — The prose count of 89 appeared to include some duplicates or non-canonical names. The explicit list is the authoritative source; always enumerate and de-duplicate rather than rely on prose totals.  
  Source: S01-SUMMARY.md/Deviations

- **`pokemonMegaForms` contains only mega forms, not the base form** — The map key (base Pokémon ID) implies the base form is accessible, but the values are only mega variants. Storing the original PokemonItem at apply-time was required — this was discovered mid-implementation.  
  Source: S03-SUMMARY.md/Deviations

- **Champion component required ModalQueueService wiring (not NgbModal)** — The champion battle component used NgbModal directly for its own modals, while gym/elite-four used ModalQueueService. To keep sequencing consistent, the animation modal was wired through ModalQueueService even in the champion component.  
  Source: S04-SUMMARY.md/Key decisions

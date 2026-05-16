# M001: Mega Evolution

**Vision:** Add Mega Evolution to the game: post-battle mega stone rewards, a wheel to select among candidates, temporary Mega forms that apply on battle entry and revert on exit, and a cinematic animation modal that plays before the gym leader presentation.

## Success Criteria

- Winning a battle awards a mega stone when eligible Pokémon are on the team
- Wheel spins to select stone candidate when multiple exist
- Mega form applies on battle entry (power = 5), reverts on exit, stone persists
- Animation modal (sphere → crack → reveal → icon dissolve) plays before leader presentation
- No TypeScript errors, app builds clean

## Slices

- [x] **S01: S01** `risk:low` `depends:[]`
  > After this: After this: pokemon-mega-forms.ts compiles, all stone names are valid ItemName literals, itemsData has records for every stone with unknown.png sprite.

- [x] **S02: S02** `risk:medium` `depends:[]`
  > After this: After this: win a gym battle with a mega-capable Pokémon → mega stone appears in trainer items; wheel spins when multiple eligible Pokémon exist; no duplicate stones.

- [x] **S03: S03** `risk:high` `depends:[]`
  > After this: After this: entering a battle with a stone + matching Pokémon applies the Mega form (power = 5 visible in victory odds); battle exit reverts to base form; stone stays in inventory.

- [ ] **S04: S04** `risk:high` `depends:[]`
  > After this: After this: entering a battle with a mega-capable Pokémon triggers the full animation sequence in a modal before the gym leader / elite four / champion presentation appears.

## Boundary Map

### S01 → S02, S03\n\nProduces:\n- `pokemon-mega-forms.ts` — `Record<number, PokemonItem[]>` mapping base Pokémon ID to mega form options\n- All mega stone `ItemName` literals in `item-names.ts`\n- All mega stone `ItemItem` records in `items-data.ts`\n\nConsumes:\n- nothing (first slice)\n\n### S02 → S03\n\nProduces:\n- Stone award logic in `RouletteContainerComponent` (post-battle result handlers)\n- Guarantee that `trainerItems` will contain the relevant stone when S03 checks for it\n\nConsumes:\n- S01: `ItemName` literals, `itemsData` records, `pokemon-mega-forms.ts` (base ID → stone name mapping)\n\n### S03 → S04\n\nProduces:\n- `TrainerService` mega-form selection logic (which Pokémon mega-evolves this battle)\n- `applyBattleForms` / `revertBattleForms` extended to handle mega stones\n- Pre-battle hook in `BaseBattleRouletteComponent.onGameStateChange`\n\nConsumes:\n- S01: mega forms data, stone item names\n- S02: guarantee stone exists in inventory before battle entry

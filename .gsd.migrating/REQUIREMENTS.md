# Requirements

This file is the explicit capability and coverage contract for the project.

## Active

### R001 — After winning any battle (gym, elite four, champion), if one or more team Pokémon are mega-capable and the player does not yet hold their stone, award a mega stone for one of them.
- Class: primary-user-loop
- Status: active
- Description: After winning any battle (gym, elite four, champion), if one or more team Pokémon are mega-capable and the player does not yet hold their stone, award a mega stone for one of them.
- Why it matters: Core reward loop — winning battles unlocks Mega Evolution potential.
- Source: user
- Primary owning slice: M001/S02
- Validation: mapped

### R002 — When multiple mega-capable Pokémon are on the team and eligible for a stone award, spin a wheel (reusing PokemonFromAuxListRouletteComponent) to select which one receives the stone.
- Class: primary-user-loop
- Status: active
- Description: When multiple mega-capable Pokémon are on the team and eligible for a stone award, spin a wheel (reusing PokemonFromAuxListRouletteComponent) to select which one receives the stone.
- Why it matters: Preserves the roulette feel; player doesn't hand-pick the reward.
- Source: user
- Primary owning slice: M001/S02
- Validation: mapped

### R003 — Mega Evolution (animation + form swap) triggers before the gym leader / elite four / champion presentation modal opens, blocking it via the ModalQueueService queue.
- Class: primary-user-loop
- Status: active
- Description: Mega Evolution (animation + form swap) triggers before the gym leader / elite four / champion presentation modal opens, blocking it via the ModalQueueService queue.
- Why it matters: Player sees the transformation before the battle begins, which is the intended dramatic beat.
- Source: user
- Primary owning slice: M001/S03
- Supporting slices: M001/S04
- Validation: mapped

### R004 — Only one Pokémon mega-evolves per battle. If the player holds stones for multiple team Pokémon, a wheel selects which one mega-evolves for that battle.
- Class: primary-user-loop
- Status: active
- Description: Only one Pokémon mega-evolves per battle. If the player holds stones for multiple team Pokémon, a wheel selects which one mega-evolves for that battle.
- Why it matters: Keeps balance and maintains the roulette mechanic.
- Source: user
- Primary owning slice: M001/S03
- Validation: mapped

### R005 — A cinematic animation plays when a Pokémon mega-evolves: an opalescent sphere covers the sprite, cracks open to reveal the Mega form, then a Mega Evolution icon appears and dissolves.
- Class: differentiator
- Status: active
- Description: A cinematic animation plays when a Pokémon mega-evolves: an opalescent sphere covers the sprite, cracks open to reveal the Mega form, then a Mega Evolution icon appears and dissolves.
- Why it matters: The "very VERY cool animation" is the signature moment of the feature — it must feel special.
- Source: user
- Primary owning slice: M001/S04
- Validation: mapped

### R006 — Mega forms are temporary: the Pokémon reverts to its base form after each battle ends, via the existing revertBattleForms mechanism.
- Class: continuity
- Status: active
- Description: Mega forms are temporary: the Pokémon reverts to its base form after each battle ends, via the existing revertBattleForms mechanism.
- Why it matters: Mega Evolution is a per-battle power boost, not a permanent evolution.
- Source: user
- Primary owning slice: M001/S03
- Validation: mapped

### R007 — Mega stones are permanent items, unique per Pokémon species. Once awarded, the stone stays in the trainer's inventory and enables Mega Evolution every battle as long as the Pokémon is on the team.
- Class: continuity
- Status: active
- Description: Mega stones are permanent items, unique per Pokémon species. Once awarded, the stone stays in the trainer's inventory and enables Mega Evolution every battle as long as the Pokémon is on the team.
- Why it matters: Stones are a durable reward that compounds over the run.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: M001/S02, M001/S03
- Validation: mapped

### R008 — Mega-evolved Pokémon have power = 5, contributing maximum weight to battle victory odds.
- Class: core-capability
- Status: active
- Description: Mega-evolved Pokémon have power = 5, contributing maximum weight to battle victory odds.
- Why it matters: Mega Evolution must meaningfully improve battle odds; power = 5 is the game maximum.
- Source: inferred
- Primary owning slice: M001/S03
- Validation: mapped

### R009 — Sprites for mega stones and the Mega Evolution icon are not available from PokeAPI; unknown.png must be used as fallback without throwing errors.
- Class: constraint
- Status: active
- Description: Sprites for mega stones and the Mega Evolution icon are not available from PokeAPI; unknown.png must be used as fallback without throwing errors.
- Why it matters: Prevents broken image placeholders and keeps the UI consistent.
- Source: user
- Primary owning slice: M001/S01
- Validation: mapped

## Validated

## Deferred

## Out of Scope

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | primary-user-loop | active | M001/S02 | none | mapped |
| R002 | primary-user-loop | active | M001/S02 | none | mapped |
| R003 | primary-user-loop | active | M001/S03 | M001/S04 | mapped |
| R004 | primary-user-loop | active | M001/S03 | none | mapped |
| R005 | differentiator | active | M001/S04 | none | mapped |
| R006 | continuity | active | M001/S03 | none | mapped |
| R007 | continuity | active | M001/S01 | M001/S02, M001/S03 | mapped |
| R008 | core-capability | active | M001/S03 | none | mapped |
| R009 | constraint | active | M001/S01 | none | mapped |

## Coverage Summary

- Active requirements: 9
- Mapped to slices: 9
- Validated: 0
- Unmapped active requirements: 0

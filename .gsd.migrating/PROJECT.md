# Pokémon Roulette — Project

## What This Is

A Pokémon-themed roulette/adventure game built in Angular. Players spin wheels to catch Pokémon, battle gym leaders, encounter legendaries, and progress through a generation-based adventure. The game manages a trainer team, items, badges, and a series of game states that drive the flow.

## Core Value

The roulette wheel driving every decision — catching, battling, evolving — must always feel responsive and fair.

## Project Shape

- **Complexity:** complex
- **Why:** Multiple interacting systems (game state machine, modal queue, battle forms, evolution, items), and the Mega Evolution feature adds animation, new item types, and temporary form management wired across several existing services.

## Current State

Core game loop is fully implemented: generation select, character select, catching Pokémon, gym battles, elite four, champion, evolution, trading, legendaries, cave exploration, rival battles, fishing, fossils, area zero, paradox Pokémon, shininess, exp-share, rare candy, escape rope, running shoes, x-attack. Palafin and sticky battle forms are implemented. ModalQueueService serializes all modals.

## Architecture / Key Patterns

- Angular standalone components, NgbModal + ModalQueueService for modal sequencing
- GameStateService drives state transitions via a queue; components react to state changes
- TrainerService owns team/storage/items; applyBattleForms/revertBattleForms handle battle-entry form swaps
- BaseBattleRouletteComponent is the base for gym/elite-four/champion battle components
- PokemonFromAuxListRouletteComponent provides wheel-based selection from a list
- Sprites fetched from PokeAPI; unknown.png used as fallback

## Capability Contract

See `.gsd/REQUIREMENTS.md` for the explicit capability contract.

## Milestone Sequence

- [ ] M001: Mega Evolution — Award mega stones after battle wins, animate and apply temporary Mega forms before each battle, revert after.

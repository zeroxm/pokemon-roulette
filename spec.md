# Pokemon Roulette - Project Specification

## Overview
Angular-based web game simulating a Pokemon adventure through roulette wheels. Players progress through game states by spinning wheels to determine outcomes like catching Pokemon, battling gym leaders, and finding items.

**Live Demo**: [https://zeroxm.github.io/pokemon-roulette/](https://zeroxm.github.io/pokemon-roulette/)

## Tech Stack
- **Framework**: Angular 19.1.0
- **UI**: Bootstrap 5.3.3 + ng-bootstrap 18.0.0
- **Icons**: ng-icons with Bootstrap Icons
- **i18n**: ngx-translate (EN, ES, FR, PT)
- **Audio**: HTML5 Audio API
- **Testing**: Jasmine + Karma

## Architecture

### Core Components
- **Main Game Component** (`src/app/main-game/main-game.component.ts`): Central controller managing game state and roulette flow
- **25+ Roulette Components** (`src/app/main-game/roulettes/`): Specialized wheels for different scenarios, for example:
  - `starter-roulette/` - Choose initial Pokemon
  - `gym-battle-roulette/` - Battle gym leaders
  - `legendary-roulette/` - Encounter legendary Pokemon
  - `evolution-roulette/` - Check Pokemon evolution
  - `cave-pokemon-roulette/` - Explore caves
  - `fishing-roulette/` - Go fishing
  - `elite-four-battle-roulette/` - End-game battles
- **Wheel Component** (`src/app/wheel/wheel.component.ts`): Reusable spinning wheel with canvas rendering, weighted probabilities, and i18n support. Preprocesses translations for performance and displays translated text on both wheel segments and current segment indicator.
- **Services** (`src/app/services/`): Business logic for game state, Pokemon data, items, trainer management

### Game States
30+ distinct states managed by `src/app/services/game-state-service/game-state.ts`, for Example:
```typescript
export type GameState =
  | 'game-start' | 'character-select' | 'starter-pokemon'
  | 'gym-battle' | 'legendary-encounter' | 'elite-four-battle'
  | 'champion-battle' | 'game-finish'
```

### Data Models
Located in `src/app/interfaces/`:
```typescript
// wheel-item.ts - Base interface for all roulette items
interface WheelItem {
  text: string, fillStyle: string, weight: number;
}

// pokemon-item.ts - Pokemon-specific data
interface PokemonItem extends WheelItem {
  pokemonId: number;
  sprite: { front_default: string; front_shiny: string; } | null;
  shiny: boolean;
  power: 1 | 2 | 3 | 4 | 5;
}

// item-item.ts - In-game items
interface ItemItem extends WheelItem {
  itemId: number;
  itemType: string;
  sprite: string | null;
}
```

### Services Location & Purpose
- **`src/app/services/game-state-service/`**: Controls game progression and state transitions
- **`src/app/services/pokemon-service/`**: Manages Pokemon data, connects to PokeAPI for sprites
- **`src/app/services/items-service/`**: Handles all in-game items and their sprites
- **`src/app/services/trainer-service/`**: Manages Pokemon team, badges, and progress
- **`src/app/services/dark-mode-service/`**: Theme switching with localStorage persistence
- **`src/app/services/evolution-service/`**: Pokemon evolution mechanics
- **`src/app/services/badges-service/`**: Gym badge management
- **`src/app/services/generation-service/`**: Pokemon generation selection

## Key Features
- **Progressive Adventure**: Linear Pokemon journey progression
- **Weighted Probability System**: All decisions use probability weights
- **Team Building**: Collect and manage Pokemon team
- **Badge Collection**: Earn gym badges through battles
- **Evolution System**: Pokemon evolution mechanics
- **Responsive Design**: Works on desktop and mobile
- **Audio Feedback**: Sound effects for interactions
- **Dark Mode**: Theme switching with localStorage persistence

## Development

### Setup & Commands
```bash
npm install
ng serve --host 0.0.0.0 --port 4200  # Development
ng build                                # Build
ng test                                 # Testing
ng deploy --base-href=/pokemon-roulette/  # Deploy
```

### Project Structure
```
src/app/
├── main-game/           # Main game logic
│   ├── roulettes/      # 25+ roulette components
│   ├── end-game/       # Game completion screens
│   ├── game-over/      # Game over handling
│   └── main-game.component.ts
├── services/            # Business logic services
├── interfaces/          # TypeScript interfaces
├── wheel/              # Reusable wheel component
├── trainer-team/       # Team management UI
├── items/              # Items display component
├── dark-mode-toggle/   # Theme switching
├── coffee/             # Donations page
└── credits/            # Credits screen
```

### Audio Files Location
Located in `public/`:
- `click.mp3` - Wheel spinning sound
- `ItemFound.mp3` - Item discovery
- `PCLogin.mp3`, `PCLogout.mp3`, `PCTurningOn.mp3` - PC interactions

### Translation Files
- `public/i18n/` - Main translations (EN, ES, FR, PT)

## Extension Points

### Adding New Roulettes
1. Create component in `src/app/main-game/roulettes/` directory
2. Extend `WheelItem` interface if needed (in `src/app/interfaces/`)
3. Add to main game component imports (`main-game.component.ts`)
4. Update game state flow in `game-state.ts`

### Adding Content
- **Pokemon**: Update `src/app/services/pokemon-service/national-dex-pokemon.ts`
- **Items**: Extend `ItemItem` interface and update `items.service.ts`
- **Languages**: Add translation files to `public/i18n/`

### Component Communication Pattern
- **Event Emitters**: Parent-child communication between roulettes and main game
- **Services**: Cross-component state sharing (game state, Pokemon data, etc.)
- **Input/Output**: Component data flow (items, Pokemon selection)

## Translation System

### Implementation Details
- **Wheel Component Translation**: The wheel component preprocesses all translation keys when items change or on initial load for optimal performance
- **Translation Timing**: Uses `translateService.get()` to ensure translations are loaded before processing wheel items
- **Nested Keys**: Supports nested JSON translation keys (e.g., `game.main.roulette.start.actions.catchPokemon`)
- **Fallback**: Falls back to original text if translation key doesn't exist
- **Performance**: Avoids calling `translateService.instant()` on every animation frame

### Adding Wheel Item Translations
1. Add translation keys to all language files in `public/i18n/`
2. Use nested structure: `"game": { "main": { "roulette": { "start": { "actions": { "catchPokemon": "Translation" } } } } }`
3. Wheel component automatically picks up new translations on next item change

## Performance & Compatibility
- **Optimizations**: Lazy loading, canvas rendering, audio preloading, translation preprocessing
- **Memory**: Component cleanup, service singletons, event unsubscription
- **Browsers**: Modern browsers with HTML5 Canvas and Audio API support
- **Mobile**: Responsive design for mobile devices

## Future Enhancements
- Save/load system, multiplayer battles, custom rules
- Achievement system, social features, progress sharing

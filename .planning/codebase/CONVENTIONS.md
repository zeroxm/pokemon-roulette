# Coding Conventions

**Analysis Date:** 2025-01-10

## Naming Patterns

**Files:**
- Components: `{feature}.component.ts`, `{feature}.component.html`, `{feature}.component.css`
  - Example: `starter-roulette.component.ts`, `main-game.component.ts`
- Services: `{feature}.service.ts`
  - Example: `pokemon.service.ts`, `game-state.service.ts`, `dark-mode.service.ts`
- Test specs: `{feature}.spec.ts` (co-located with source)
  - Example: `pokemon.service.spec.ts`, `app.component.spec.ts`
- Type/Interface files: `{name}.ts` (exported as types/interfaces)
  - Example: `game-state.ts` (enum), `pokemon-item.ts` (interface), `EventSource.ts` (type union)
- Data/Config files: `{feature}-data.ts` or `{feature}-by-generation.ts`
  - Example: `starter-by-generation.ts`, `badges-data.ts`, `national-dex-pokemon.ts`
- Utilities: `{name}-utils.ts`
  - Example: `odd-utils.ts`

**Functions:**
- camelCase for all functions, methods, and properties
  - Example: `getPokemonById()`, `onItemSelected()`, `interleaveOdds()`
- Private methods prefixed with `private` access modifier
  - Example: `private finishCurrentState()`, `private interleaveSortedOdds()`
- Angular lifecycle methods use standard names: `ngOnInit()`, `ngOnDestroy()`, `ngOnChanges()`
- Event handlers prefixed with `on`: `onItemSelected()`, `onRouletteWheelSpun()`

**Variables:**
- camelCase for all local and member variables
  - Example: `wheelSpinning`, `darkMode`, `starters`
- Private fields marked with `private` or use leading underscore is NOT used
  - Example: `private generationSubscription!: Subscription`
- Observable fields typically include descriptive suffix like `$` or `Observer`
  - Example: `darkMode$: Observable<boolean>`, `wheelSpinningObserver: Observable<boolean>`
- Boolean properties clearly indicate state
  - Example: `wheelSpinning`, `mapIsCollapsed`, `shiny`

**Types/Interfaces:**
- PascalCase for all interfaces and types
  - Example: `PokemonItem`, `GenerationItem`, `GameState`, `WheelItem`
- Interfaces define data structures; types define unions or primitives
  - Interfaces: `PokemonItem`, `GenerationItem`, `ItemItem`
  - Type unions: `EventSource = 'battle-trainer' | 'gym-battle' | ...`
- Type names located in `src/app/interfaces/` directory

**Constants:**
- UPPER_SNAKE_CASE for module-level constants (rare in this codebase)
- camelCase for immutable configuration data
  - Example: `startersByGeneration` (const object), `generations` (const array in services)

## Code Style

**Formatting:**
- 2 spaces for indentation (.editorconfig enforced)
- Single quotes for strings (`'string'` not `"string"`)
- Max line length: unspecified but generally kept reasonable
- Final newline required on all files (EditorConfig enforced)

**Linting:**
- No ESLint or Prettier config found in repository
- .editorconfig enforces basic style (`charset=utf-8`, `indent_size=2`, `trim_trailing_whitespace=true`)
- TypeScript strict mode enabled in `tsconfig.json`:
  - `strict: true` - All strict type checking enabled
  - `noImplicitOverride: true` - Require explicit `override` keyword
  - `noPropertyAccessFromIndexSignature: true` - No bracket access to typed properties
  - `noImplicitReturns: true` - Functions must have explicit return types
  - `noFallthroughCasesInSwitch: true` - Switch cases must break/return
- Angular strict mode in `tsconfig.json`:
  - `strictInjectionParameters: true` - Type DI correctly
  - `strictInputAccessModifiers: true` - Mark @Input/@Output with access modifiers
  - `strictTemplates: true` - Strict template type checking

## Import Organization

**Order:**
1. Angular core imports (`@angular/...`)
2. Third-party library imports (`@ng-bootstrap/...`, `rxjs`, etc.)
3. Application services
4. Application interfaces/types
5. Application components/features (relative imports)
6. Data/utilities

**Example from `main-game.component.ts`:**
```typescript
import { Component, OnInit } from '@angular/core';
import { NgbCollapseModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TrainerTeamComponent } from "../trainer-team/trainer-team.component";
import { ItemsComponent } from "../items/items.component";
import { GameStateService } from '../services/game-state-service/game-state.service';
import { CommonModule } from '@angular/common';
import { ItemItem } from '../interfaces/item-item';
```

**Path Aliases:**
- No path aliases configured (`baseUrl` or `paths` in tsconfig.json)
- All imports use relative paths with `../` or `./`

## Error Handling

**Patterns:**
- Try/catch for synchronous errors (rare in this codebase)
- RxJS Observable error handling via `.catch()` or `.subscribe()` error callback
- Console error logging for unrecoverable errors
  - Example: `console.error('Error capturing image:', error)` in `src/app/main-game/end-game/end-game.component.ts`
  - Example: `console.error(\`Failed to fetch Pokémon ${pokemonId}:\`, error)` in `src/app/services/pokemon-service/pokemon.service.ts`
- No custom error classes or error boundary components detected
- HTTP errors not explicitly handled with custom error responses

## Logging

**Framework:** console (no dedicated logging framework)

**Patterns:**
- Use `console.log()` for informational messages
  - Example: `console.log('Pix code copied to clipboard')` in `src/app/coffee/coffee.component.ts`
- Use `console.error()` for errors and exceptions
  - Example: `console.error('Could not copy text: ', err)` in `src/app/coffee/coffee.component.ts`
- No debug logging level or conditional logging observed
- No structured logging (JSON logging) used
- Production code should avoid excessive logging; current codebase is minimal

## Comments

**When to Comment:**
- Comments are minimal; code is generally self-documenting
- Complex algorithms (like `interleaveOdds()`) have detailed comments
- JSDoc/TSDoc comments used for utility functions and algorithms

**JSDoc/TSDoc:**
- Used for complex utility functions and algorithms
- Includes `@param`, `@returns`, and descriptive text
- Example from `odd-utils.ts`:
```typescript
/**
 * Distributes two lists of wheel items (`yes` and `no`) in proportion to each other.
 *
 * @param yes   Array of items considered a positive outcome.
 * @param no    Array of items considered a negative outcome.
 * @returns     Newly ordered array mixing both inputs.
 */
export function interleaveOdds(yes: WheelItem[], no: WheelItem[]): WheelItem[] { ... }
```
- Rarely used for components or services (mostly self-explanatory)
- Line comments (`/** ... */`) used for marking code sections: `/** Draw the segment */`

## Function Design

**Size:** 
- Typically small to medium (10-30 lines)
- Larger functions exist in complex components like `wheel.component.ts` (281 lines)
- No documented maximum line length for functions

**Parameters:**
- Prefer typed parameters (TypeScript strict mode enforced)
- Destructuring used occasionally for objects
- No rest parameters or function overloading observed

**Return Values:**
- Explicit return types required (TypeScript strict mode)
- Void methods when no return needed
- Observable or Promise return types for async operations
- Example: `getGeneration(): Observable<GenerationItem>`

## Module Design

**Exports:**
- Default exports not used; named exports standard
- Services marked with `@Injectable({ providedIn: 'root' })` for singleton pattern
- Components standalone (`standalone: true`) in Angular 19
- Example from `starter-roulette.component.ts`:
```typescript
@Component({
  selector: 'app-starter-roulette',
  imports: [WheelComponent, TranslatePipe],
  templateUrl: './starter-roulette.component.html',
  styleUrl: './starter-roulette.component.css'
})
export class StarterRouletteComponent implements OnInit, OnDestroy { ... }
```

**Barrel Files:**
- Not used; imports directly from feature modules
- Example: `import { PokemonService } from '../services/pokemon-service/pokemon.service'`

## Angular Specifics

**Dependency Injection:**
- Constructor injection standard for services
- Private access modifier used for injected dependencies
- Example from `main-game.component.ts`:
```typescript
constructor(
  private darkModeService: DarkModeService,
  private gameStateService: GameStateService,
  private trainerService: TrainerService,
  private modalService: NgbModal,
  private analyticsService: AnalyticsService,
  private rareCandyService: RareCandyService
) { }
```

**Components:**
- Standalone components (Angular 19)
- Imports declared inline in @Component decorator
- Template and style URLs use `templateUrl` and `styleUrl` (not inline)
- Example:
```typescript
@Component({
  selector: 'app-main-game',
  imports: [CommonModule, RouletteContainerComponent, ...],
  templateUrl: './main-game.component.html',
  styleUrl: './main-game.component.css'
})
```

**Services:**
- `providedIn: 'root'` for singleton pattern
- Use `BehaviorSubject` for state management
- Expose as Observable with `.asObservable()`
- Example from `game-state.service.ts`:
```typescript
@Injectable({ providedIn: 'root' })
export class GameStateService {
  private state = new BehaviorSubject<GameState>('game-start');
  currentState = this.state.asObservable();
}
```

**Observable Subscription:**
- Subscriptions stored and unsubscribed in `ngOnDestroy()`
- Example from `starter-roulette.component.ts`:
```typescript
ngOnInit(): void {
  this.generationSubscription = this.generationService.getGeneration().subscribe(...);
}

ngOnDestroy(): void {
  this.generationSubscription?.unsubscribe();
}
```

---

*Convention analysis: 2025-01-10*

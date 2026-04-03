# Codebase Concerns

**Analysis Date:** 2024-01-16

## Memory Leak Risk: Unmanaged Subscriptions in Main Component

**Issue:** Memory leak from unmanaged subscription in `src/app/main-game/main-game.component.ts`

**Files:** `src/app/main-game/main-game.component.ts` (line 54-56)

**Problem:**
```typescript
// Line 54-56: Subscribe without unsubscribe
this.gameStateService.wheelSpinningObserver.subscribe(state => {
  this.wheelSpinning = state;
});
```

The subscription is created in `ngOnInit()` but the component only implements `OnInit`, not `OnDestroy`. This subscription will persist after the component is destroyed, causing memory leaks if the main game component is ever recreated.

**Impact:** 
- Multiple subscriptions accumulate in memory
- Potential memory exhaustion with extended gameplay sessions
- Observable state updates continue to execute even after component is destroyed

**Fix Approach:**
1. Implement `OnDestroy` interface in `MainGameComponent`
2. Store subscription in class property
3. Unsubscribe in `ngOnDestroy()` 
4. Alternative: Use `takeUntil()` pattern with destroy$ subject

---

## Missing Subscription Cleanup in Multiple Components

**Issue:** Incomplete pattern for subscription cleanup across roulette components

**Files:** 
- `src/app/main-game/roulette-container/roulette-container.component.ts` (lines 116-135)
- 19+ roulette component files use similar patterns

**Problem:**
The `roulette-container.component.ts` creates multiple subscriptions (currentState, currentRoundObserver, wheelSpinningObserver) but only unsubscribes from one in `ngOnDestroy()`:
```typescript
// Only rareCandySubscription is cleaned up
this.rareCandySubscription?.unsubscribe();

// But these three subscriptions in ngOnInit() have no cleanup:
this.gameStateService.currentState.subscribe(state => {...});
this.gameStateService.currentRoundObserver.subscribe(round => {...});
this.gameStateService.wheelSpinningObserver.subscribe(state => {...});
```

**Impact:**
- Memory leaks from 3+ unmanaged subscriptions per route navigation
- Component trees accumulate subscriptions over gameplay sessions
- Observer callbacks fire for destroyed components

**Fix Approach:**
1. Create `Subscription[]` array to collect all subscriptions
2. Iterate and unsubscribe all in `ngOnDestroy()`
3. Consider using `ModalQueueService` or similar for subscription management

---

## Hardcoded External URLs - Maintenance and Reliability Risk

**Issue:** 241+ hardcoded URLs to external GitHub and PokeAPI resources scattered throughout codebase

**Files:**
- `src/app/main-game/roulette-container/roulette-container.component.ts` (6+ URLs)
- `src/app/main-game/roulette-container/roulettes/champion-battle-roulette/champion-by-generation.ts` (15+ URLs)
- `src/app/main-game/roulette-container/roulettes/elite-four-battle-roulette/elite-four-by-generation.ts`
- `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts`

**Examples:**
```typescript
// Line 240: Hardcoded URL in business logic
this.altPrizeSprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png';

// Lines 250, 260, 280, 290: More hardcoded URLs
this.altPrizeSprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/refs/heads/master/sprites/items/mystery-egg.png';

// champion-by-generation.ts has pattern:
sprite: "https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/FireRed_LeafGreen_Blue.png"
```

**Impact:**
- If GitHub URLs break or repositories move, images fail silently
- No fallback mechanism for broken external resources
- Inconsistent URL formats (master vs refs/heads/master)
- Difficult to migrate or provide fallback CDN
- Mixed URL bases (raw.githubusercontent vs PokeAPI official)

**Fix Approach:**
1. Create `ImageService` with centralized URL management
2. Define URL constants/configuration
3. Add fallback image support
4. Implement image caching strategy
5. Consider bundling critical sprites locally

---

## Unhandled Promise Rejections in Modal Operations

**Issue:** Promise chains without error handlers in modal management

**Files:** `src/app/main-game/roulette-container/roulette-container.component.ts` (lines 511-516, 567-568, 738-739, 761-762)

**Problem:**
```typescript
// Line 511-516: Promise without catch
}).then(modalRef => {
  modalRef.result.then(() => {
    return this.doNothing();
  }, () => {
    return this.doNothing();
  });
});
// No .catch() on parent promise
```

Multiple instances of promise chains with rejection handlers only on nested promises, but no catch on the outer promise. If `this.modalQueueService.open()` rejects, error is unhandled.

**Impact:**
- Unhandled promise rejection warnings in browser console
- Silent failures if modal queue service fails
- Game state may become inconsistent if modal opening fails
- Poor debugging visibility into modal failures

**Fix Approach:**
1. Add `.catch()` to all `this.modalQueueService.open()` calls
2. Log errors for debugging
3. Implement fallback state recovery
4. Consider retry logic for transient failures

---

## Type Safety Issue: `any` Type Usage in PokeAPI Service

**Issue:** Use of `any` type in HTTP response handling

**Files:** `src/app/services/pokemon-service/pokemon.service.ts` (line 24)

**Problem:**
```typescript
// Line 24: Using 'any' defeats type safety
return this.http.get<any>(url).pipe(
  retry({
    count: 3,
    delay: 1000
  }),
  map((response) => ({
    sprite: response.sprites.other['official-artwork']  // No type checking
  })),
```

The response is typed as `any`, which bypasses TypeScript's type checking. If PokeAPI response structure changes, the error is only discovered at runtime.

**Impact:**
- No compile-time type safety
- Changes to PokeAPI response silently break sprite loading
- Difficult to detect breaking API changes
- Harder for IDE to provide autocomplete

**Fix Approach:**
1. Create interface for PokeAPI response
2. Type the HTTP get properly: `this.http.get<PokemonApiResponse>(url)`
3. Handle missing fields gracefully

---

## Large Component File Complexity

**Issue:** Component files exceed reasonable complexity thresholds

**Files:**
- `src/app/main-game/roulette-container/roulette-container.component.ts` (773 lines)
- `src/app/services/pokemon-service/national-dex-pokemon.ts` (1028 lines - data file)
- `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts` (623 lines - data file)

**Problem:**
The roulette-container component at 773 lines handles:
- Game state subscriptions (lines 116-135)
- Evolution logic (lines 147-220+)
- Team rocket encounters (lines 231-297)
- Modal orchestration (40+ modal.open calls)
- 25+ roulette component coordination
- Pokemon catchment, evolution, item finding, trading

**Impact:**
- Difficult to test individual features
- High cognitive load for maintenance
- Single point of failure for core game logic
- Hard to reuse roulette coordination logic
- Risk of side effects when modifying one feature

**Fix Approach:**
1. Extract modal management to dedicated service (partially done with ModalQueueService)
2. Create separate state handlers for major features (evolution handler, team rocket handler, etc.)
3. Consider state machine pattern for game flow
4. Move data (pokemon, gym leaders) to separate data service
5. Split into logical feature services

---

## Missing Error Recovery in External API Calls

**Issue:** Sprite loading failures have no fallback or retry at UI level

**Files:**
- `src/app/services/pokemon-service/pokemon.service.ts` (line 32-35)
- Image references in component templates throughout

**Problem:**
```typescript
// Line 32-35: Retry at HTTP level, but no UI fallback
catchError((error) => {
  console.error(`Failed to fetch Pokémon ${pokemonId}:`, error);
  return throwError(() => new Error('Failed to fetch Pokémon data'));
})
```

If sprites fail to load after 3 retries, the Observable throws an error. The UI has no fallback sprite or placeholder logic. Pokemon display will break silently.

**Impact:**
- Broken pokemon display if PokeAPI is down
- Poor UX when network is unstable
- Silent failures (console error only)
- Game becomes unplayable with missing sprites

**Fix Approach:**
1. Implement placeholder/default sprite in service
2. Add error handling in component subscribe
3. Show loading state while fetching
4. Provide visual indicator for failed loads

---

## Potential XSS Vulnerability: Canvas Text Rendering

**Issue:** User-controlled translation strings rendered directly to canvas without sanitization

**Files:** `src/app/wheel/wheel.component.ts` (lines 150-151)

**Problem:**
```typescript
// Line 150-151: Drawing text from translation service directly
this.wheelCtx.fillText(item.text, radius - 7, 5);
```

While the actual risk is low (canvas doesn't interpret HTML), the pattern of drawing unsanitized user content is not best practice. If translation service is compromised, this is an injection point.

**Impact:**
- Low risk in current implementation (canvas is binary)
- But establishes poor security pattern
- Translation service needs strict input validation
- Future migration to HTML rendering could expose vulnerability

**Fix Approach:**
1. Validate translation strings at service level
2. Document that canvas text is user-visible
3. Consider HTML5 Canvas security best practices
4. If moving to HTML rendering in future, sanitize properly

---

## Subscription Pattern Inconsistency: Mixed Null Check Styles

**Issue:** Inconsistent null handling for subscriptions across components

**Files:** Multiple roulette components

**Problem:**
Some components use optional chaining with unsubscribe:
```typescript
this.rareCandySubscription?.unsubscribe();  // Optional chaining
```

Others initialize without null:
```typescript
private generationSubscription!: Subscription;  // Non-null assertion
// Later: this.generationSubscription?.unsubscribe();  // Redundant check
```

Mixed patterns indicate inconsistent understanding of subscription lifecycle.

**Impact:**
- Maintainability issues when working across components
- Potential for missed unsubscription if pattern not followed consistently
- Code review difficulty

**Fix Approach:**
1. Establish standard pattern (recommend optional Subscription with ?.)
2. Create base component class with subscription cleanup helper
3. Use linting rules to enforce pattern

---

## LocalStorage Error Handling Without User Feedback

**Issue:** LocalStorage parsing errors logged but not reported to user

**Files:**
- `src/app/services/dark-mode-service/dark-mode.service.ts` (lines 77-82)
- `src/app/services/settings-service/settings.service.ts` (lines 79-82)

**Problem:**
```typescript
// Line 77-82: Error only logged to console
catch (error) {
  console.error(
    'Invalid darkMode localStorage item:',
    storageItem,
    'falling back to color scheme media query'
  );
}
```

When localStorage is corrupted, the error is silently logged. User sees default behavior without knowing data was lost.

**Impact:**
- Silent data loss (settings, preferences)
- User has no way to know settings weren't preserved
- Difficult to debug in production
- No telemetry about localStorage corruption frequency

**Fix Approach:**
1. Add error tracking service integration
2. Optionally notify user of data loss
3. Implement corruption recovery (reset to defaults)
4. Track error frequency via analytics

---

## Test Coverage Gaps

**Issue:** Only 61 test files for 11,754 lines of code (~0.5% coverage ratio)

**Files:** `src/app/`

**Test files found:**
- `wheel.component.spec.ts` (125 lines)
- `roulette-container.component.spec.ts` (84 lines)
- `trainer.service.spec.ts` (260 lines)
- ~58 other test files (likely minimal)

**Problem:**
- Largest files (773 lines for roulette-container, 1028 for national-dex) have minimal test coverage
- No test files found for most roulette components (25+ components)
- Critical services (GameStateService, EvolutionService) lack visible test coverage
- Modal orchestration logic untested
- External API integration untested

**Impact:**
- Regressions not caught by automated tests
- Refactoring is risky without safety net
- Complex game state transitions can break silently
- Adding features requires manual testing

**Fix Approach:**
1. Add unit tests for game state service state transitions
2. Test evolution service logic comprehensively
3. Create integration tests for roulette components
4. Test error paths and edge cases
5. Set code coverage goals (>80%)

---

## Potential Race Condition: Game State and Wheel Spinning

**Issue:** Asynchronous state updates could race with wheel spinning logic

**Files:**
- `src/app/services/game-state-service/game-state.service.ts`
- `src/app/wheel/wheel.component.ts` (line 223)
- `src/app/main-game/roulette-container/roulette-container.component.ts`

**Problem:**
Game state updates are asynchronous (Observables), while wheel spinning sets a synchronous flag. A race condition could occur if:
1. Wheel finishes spinning and calls `setWheelSpinning(false)`
2. But game state handler is still processing previous state
3. User clicks spin again before state handler completes

**Impact:**
- Wheel could appear to spin twice if clicked rapidly
- Game state machine could become inconsistent
- Items could be claimed twice (potential duplication bug)

**Fix Approach:**
1. Add queue to game state service for state transitions
2. Use existing ModalQueueService pattern for state changes
3. Prevent user input during state transitions
4. Add integration tests for rapid clicking

---

## Performance Issue: Canvas Redraw on Every Animation Frame

**Issue:** Canvas rendering called repeatedly without optimization

**Files:** `src/app/wheel/wheel.component.ts` (lines 208-219)

**Problem:**
```typescript
// Line 219: requestAnimationFrame calls animate which redraws entire wheel
requestAnimationFrame(this.animate.bind(this));

// animate() calls drawWheel() every frame during spin
this.drawWheel(this.currentRotation);
```

For a 5-second spin (60fps), this redraws the entire wheel 300 times. Each redraw:
- Calculates all segment angles
- Clears canvas
- Redraws all segments and text
- Recalculates rotation

**Impact:**
- High CPU usage during spin
- Battery drain on mobile devices
- Potential frame drops on lower-end devices
- Scales poorly as segment count increases (160+ checks on line 143)

**Fix Approach:**
1. Use CSS transforms instead of canvas rotation for simple animations
2. Cache segment calculations between frames
3. Skip text rendering for first few frames during spin
4. Profile on mobile devices
5. Consider WebGL for higher performance

---

## Missing CORS Error Handling for External Sprite URLs

**Issue:** No CORS error handling for GitHub and PokeAPI sprite requests

**Files:** Component templates and services loading images from external domains

**Problem:**
Images are loaded from:
- `https://raw.githubusercontent.com/`
- `https://pokeapi.co/`

If these domains implement stricter CORS policies or disable access, images silently fail. No error is caught or reported.

**Impact:**
- Silent sprite loading failures
- User sees broken images with no indication of cause
- No way to provide feedback or retry mechanism
- Game becomes less visually appealing

**Fix Approach:**
1. Test CORS headers for both domains
2. Add image loading error handlers in components
3. Implement fallback sprite display
4. Consider proxying images through own server
5. Add browser console warnings for CORS failures

---

## Unused/Redundant Service: AnalyticsService

**Issue:** Analytics service is partially integrated with unclear implementation

**Files:** 
- `src/app/services/analytics-service/`
- `src/app/main-game/main-game.component.ts` (line 52)

**Problem:**
```typescript
// Line 52: Single event tracked, no clear analytics strategy
this.analyticsService.trackEvent('main-game-loaded', 'Main Game Loaded', 'user acess');
```

Analytics is used once for game load. No other events tracked. Service exists but is not utilized throughout codebase.

**Impact:**
- Incomplete telemetry
- Unable to track user behavior
- No data on which features are used
- Can't identify performance issues in production

**Fix Approach:**
1. Either expand analytics coverage throughout app
2. Or remove unused service to reduce complexity
3. If keeping, document tracking strategy

---

## Fragile String-Based State Management

**Issue:** Game states managed as string literals without compile-time verification

**Files:** `src/app/services/game-state-service/game-state.ts`

**Problem:**
States are defined as union type:
```typescript
export type GameState = 
  | 'game-start' | 'character-select' | 'starter-pokemon' | ...
```

But state is set using string literals throughout codebase without type checking:
```typescript
this.gameStateService.setNextState('catch-legendary');
```

A typo like `'catch-legenadry'` won't be caught until runtime.

**Impact:**
- State machine can reach undefined states
- Typos cause silent state transitions to fail
- Difficult to refactor state names
- No IDE support for finding all state references

**Fix Approach:**
1. Create enum instead of string union for states
2. Provide constants for all state values
3. Use barrel exports for state constants
4. Consider state machine library for complex transitions

---

## Modal Queue Service Doesn't Guarantee Modal Display

**Issue:** Modal queue uses promises but doesn't guarantee modal was actually displayed

**Files:** `src/app/services/modal-queue-service/modal-queue.service.ts` (lines 35-39)

**Problem:**
```typescript
// The promise resolves after modal result resolves, but if ngbModal.open() fails,
// it throws an error that's not explicitly caught
this.queue = scheduledOpen.then(
  (modalRef) => modalRef.result.then(() => undefined, () => undefined),
  () => undefined  // Empty catch handler
);
```

If `ngbModal.open()` throws an exception, the error is swallowed by the empty catch handler.

**Impact:**
- Modal failures silently skip queued modals
- Subsequent modals may not display
- Game flow becomes unpredictable
- Hard to debug modal display issues

**Fix Approach:**
1. Add error logging to catch handlers
2. Implement retry logic for failed modals
3. Provide error callback to component level
4. Consider error state recovery

---

## Missing Null Safety in Sprite Access

**Issue:** Pokemon form sprites may be null but accessed without checks

**Files:** Components displaying pokemon with form variants

**Problem:**
Pokemon items have:
```typescript
sprite: { front_default: string; front_shiny: string; } | null;
```

But code may attempt to access sprite.front_default without null check.

**Impact:**
- Runtime errors if sprite is null
- Broken pokemon display
- Game could crash during evolution with missing forms

**Fix Approach:**
1. Add null checks before sprite access in templates
2. Use fallback sprite service
3. Type component inputs to require non-null sprites
4. Add form variant tests with missing sprites


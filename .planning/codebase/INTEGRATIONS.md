# External Integrations

**Analysis Date:** 2025-01-17

## APIs & External Services

**PokeAPI:**
- PokeAPI v2 (https://pokeapi.co/api/v2) - Primary data source for Pokemon sprite imagery
  - Service: `src/app/services/pokemon-service/pokemon.service.ts`
  - Used for: Official Pokemon artwork sprites (front and shiny variants)
  - Implementation: HTTP GET requests via Angular HttpClient
  - Endpoint: `https://pokeapi.co/api/v2/pokemon/{pokemonId}`
  - Retry logic: 3 retries with 1-second delay between attempts
  - Error handling: Catches and logs failures with fallback error throwing

**GitHub Raw Content:**
- GitHub Raw (https://raw.githubusercontent.com) - CDN for item sprites
  - Service: `src/app/services/item-sprite-service/item-sprite.service.ts`
  - Used for: Item sprite images (potion, rare-candy, running-shoes, etc.)
  - Repository: PokeAPI/sprites (master branch)
  - Examples:
    - `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/potion.png`
    - `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/rare-candy.png`

**Bulbapedia/Bulbagarden:**
- Bulbagarden Archives (https://archives.bulbagarden.net) - Alternative item sprite source
  - Used for: Running Shoes sprite when PokeAPI version unavailable
  - Example: `https://archives.bulbagarden.net/media/upload/4/42/Bag_Running_Shoes_Sprite.png`

## Data Storage

**Browser-Based Storage:**
- localStorage - Client-side persistent storage (no external backend)
  - Language preference: `localStorage.getItem('language')`/`setItem('language')`
    - Location: `src/app/app.component.ts`, `src/app/main-game/language-selector/language-selector.component.ts`
  - Dark mode preference: Stored via DarkModeService with configurable storage key
    - Location: `src/app/services/dark-mode-service/dark-mode.service.ts`
  - Settings: Stored and retrieved with validation
    - Location: `src/app/services/settings-service/settings.service.ts`

**No External Databases:**
- Application is fully client-side
- All game state stored in memory or localStorage
- No backend server or database required

## File Storage

**Static Assets - Served from Project:**
- Audio files in `public/`:
  - `click.mp3` - Wheel spin sound
  - `ItemFound.mp3` - Item discovery sound
  - `PCLogin.mp3`, `PCLogout.mp3`, `PCTurningOn.mp3` - PC interaction sounds
  - `favicon.ico` - Site favicon
  - `qr_code.jpeg` - QR code for sharing
  - `place-holder-pixel.png` - Fallback image

- Asset files in `src/assets/`:
  - `i18n/` - Translation JSON files (en.json, es.json, fr.json, pt.json, de.json, it.json)

**No External CDN for Assets:**
- All static assets served locally from project directories
- Bootstrap CSS embedded via npm package: `node_modules/bootstrap/dist/css/bootstrap.min.css`

## Authentication & Identity

**Auth Provider:**
- None - Application requires no user authentication
- No login system
- No user accounts or sessions
- Fully anonymous, public-facing game

## Monitoring & Observability

**Analytics:**
- Google Analytics 4 (GA4)
  - Measurement ID: `G-40CS5XD7G9`
  - Configured in: `src/index.html` (lines 10-18)
  - Implementation:
    - Global gtag script loaded from `https://www.googletagmanager.com/gtag/js`
    - Service wrapper: `src/app/services/analytics-service/analytics.service.ts`
  - Tracked events:
    - Main game loads: `analyticsService.trackEvent('main-game-loaded', 'Main Game Loaded', 'user access')`
    - Method: `trackEvent(eventName: string, eventDetails: string, eventCategory: string)`
  - Event structure: event_category, event_label, value

**Error Tracking:**
- Console logging for Pokemon sprite fetch failures
  - Location: `src/app/services/pokemon-service/pokemon.service.ts` line 33
  - Pattern: `console.error()` with descriptive messages
- No external error tracking service (Sentry, etc.)

**Logs:**
- Browser console only
- No centralized logging service

## CI/CD & Deployment

**Hosting:**
- GitHub Pages
- Domain: https://zeroxm.github.io/pokemon-roulette/
- Base href path: `/pokemon-roulette/`

**Build & Deployment:**
- Angular CLI with ghpages builder
  - Deployment command: `ng deploy --base-href=/pokemon-roulette/`
  - Tool: `angular-cli-ghpages` (version 3.0.2)
  - Location: `angular.json` lines 97-99

**CI Pipeline:**
- Not detected - Appears to be manual deployment
- No GitHub Actions, CircleCI, or other CI configuration found

**Build Artifacts:**
- Output path: `dist/pokemon-roulette/`
- Built application deployed to GitHub Pages gh-pages branch

## Environment Configuration

**Required Environment Variables:**
- None explicitly configured
- No .env files present (checked `/home/andre/workspace/pokemon-roulette/.env*`)
- All configuration is code-based or client-side

**Build Configuration:**
- `angular.json` - Complete build and serve configuration
- Base href path: `/pokemon-roulette/` (for GitHub Pages subdirectory)

**Secrets & Credentials:**
- GA4 Measurement ID: Hardcoded in `src/index.html` (public, non-sensitive)
- No API keys or secrets required (PokeAPI is public, no auth)
- No credentials stored or needed

## Webhooks & Callbacks

**Incoming Webhooks:**
- None - Application is frontend-only, no backend to receive webhooks

**Outgoing Webhooks:**
- None - Application does not send webhooks

**Event Emission:**
- Internal only: Angular component event emitters for parent-child communication
- No external event systems or webhook integrations

## Translation System

**i18n Implementation:**
- ngx-translate for runtime language switching
- Configuration in `src/app/app.config.ts`:
  - HTTP loader: Loads translations from JSON files
  - Default language: 'en' (English)
  - Asset path: `./assets/i18n/`
  - File format: JSON with nested keys
  - Suffix: `.json` (e.g., `en.json`, `es.json`)

**Supported Languages:**
- English (en.json)
- Spanish (es.json)
- French (fr.json)
- Portuguese (pt.json)
- German (de.json)
- Italian (it.json)

**Translation Loading:**
- HTTP GET requests for language JSON files from `src/assets/i18n/`
- Preprocessing in wheel component for performance optimization
- Fallback to original text if translation key missing

## Third-Party Dependencies

**UI Libraries:**
- Bootstrap 5.3.8 (CSS framework)
- ng-bootstrap 20.0.0 (Angular Bootstrap components)
- @popperjs/core 2.11.8 (Positioning library for dropdowns/tooltips)

**Icon Libraries:**
- @ng-icons/bootstrap-icons 33.2.0 (Bootstrap icon set)

**Graphics & Effects:**
- fireworks-js 2.10.8 (Celebration animations)
- HTML5 Canvas API (for wheel rendering - native, no library)
- HTML5 Audio API (for sound effects - native, no library)

**Utilities:**
- dom-to-image-more 3.7.2 (Screenshot/image export)
- rxjs 7.8.2 (Reactive programming)

**Data Source:**
- National Dex Pokemon list: Static data in `src/app/services/pokemon-service/national-dex-pokemon.ts`
- Item data: Static data in `src/app/services/items-service/`

---

*Integration audit: 2025-01-17*

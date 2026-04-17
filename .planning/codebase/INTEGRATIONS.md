# External Integrations

**Analysis Date:** 2025-01-31

## APIs

### PokéAPI (pokeapi.co)
- **Type:** REST
- **Auth:** None (public API)
- **Base URL:** `https://pokeapi.co/api/v2` (hardcoded in service)
- **Used in:** `src/app/services/pokemon-service/pokemon.service.ts`
- **Endpoints used:**
  - `GET /pokemon/{id}` — Fetches Pokémon sprites (official-artwork front_default and front_shiny)
- **Retry policy:** 3 retries with 1-second delay via RxJS `retry` operator
- **Notes:** Only sprite data is fetched at runtime. All other Pokémon data (names, IDs, types, evolution chains, forms) is bundled as static TypeScript data files in `src/app/services/pokemon-service/national-dex-pokemon.ts`, `src/app/services/evolution-service/evolution-chain.ts`, etc.

### PokeAPI GitHub Sprites CDN (raw.githubusercontent.com/PokeAPI)
- **Type:** Static asset CDN (GitHub raw content)
- **Auth:** None (public)
- **Base URL:** `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/`
- **Used in:**
  - `src/app/services/pokedex-service/pokedex.service.ts` — Pokémon sprites: `/pokemon/{id}.png`
  - `src/app/services/item-sprite-service/item-sprite.service.ts` — Item sprites: `/items/{item-name}.png`
  - `src/app/services/badges-service/badges-data.ts` — Badge sprites: `/badges/{id}.png` and `refs/heads/master` variant
- **Assets fetched:**
  - Pokémon sprites: `sprites/pokemon/{id}.png`
  - Item sprites: `sprites/items/potion.png`, `rare-candy.png`, `super-potion.png`, `x-attack.png`, `exp-share.png`, `hyper-potion.png`, `escape-rope.png`
  - Badge sprites: `sprites/badges/1.png` through `sprites/badges/N.png` (all gym badges across generations)
- **Notes:** URLs are constructed at runtime and cached in memory (`spriteCache` Map in `PokedexService`). No authentication or rate limiting.

### Custom Trainer Sprites Repository (raw.githubusercontent.com/zeroxm)
- **Type:** Static asset CDN (GitHub raw content, project-owned repo)
- **Auth:** None (public)
- **Base URL:** `https://raw.githubusercontent.com/zeroxm/pokemon-roulette-trainer-sprites/refs/heads/main/sprites/`
- **Used in:** `src/app/services/trainer-service/trainer-sprite-data.ts`
- **Assets fetched:** Per-generation trainer character sprites (male/female) across generations 1–9
  - Examples: `Spr_FRLG_Red.png`, `Spr_HGSS_Ethan.png`, `Spr_RS_Brendan.png`, `Spr_DP_Lucas.png`, `Spr_BW_Hilbert.png`, `Spr_Masters_Calem.png`, etc.

### Bulbagarden Archives (archives.bulbagarden.net)
- **Type:** Static asset CDN (Bulbapedia media)
- **Auth:** None (public)
- **Used in:** `src/app/services/item-sprite-service/item-sprite.service.ts`
- **Assets fetched:** `Bag_Running_Shoes_Sprite.png` — Running Shoes item sprite not available via PokeAPI sprites

### Google Analytics (gtag.js)
- **Type:** Analytics / tracking script
- **Auth:** Measurement ID (`G-40CS5XD7G9`) — hardcoded in environment files
- **Used in:** `src/app/app.component.ts`, `src/app/services/analytics-service/analytics.service.ts`
- **Integration method:** Script tag injected dynamically into `document.head` at app bootstrap, only when `environment.production === true`
  - Loads `https://www.googletagmanager.com/gtag/js?id={measurementId}`
  - Initializes `window.dataLayer` and `gtag()` function inline
- **Events tracked:** Custom events via `AnalyticsService.trackEvent(eventName, eventDetails, eventCategory)` using `gtag('event', ...)`
- **Notes:** Falls back silently if `gtag` is undefined (non-production builds, ad-blockers)

## Databases

None. All persistent state is stored in the user's browser **localStorage**:

- **`pokemon-roulette-pokedex`** — Pokédex progress (`caught` Pokémon records with sprite URLs, won/shiny status)
  - Managed by: `src/app/services/pokedex-service/pokedex.service.ts`
- **`pokemon-roulette-settings`** — User game settings (mute audio, skip shiny rolls, less explanations, default gender)
  - Managed by: `src/app/services/settings-service/settings.service.ts`
- **`language`** — Selected UI language code (e.g., `'en'`, `'es'`)
  - Managed by: `src/app/app.component.ts`

No backend database, server, or cloud storage is used.

## Auth Providers

None. The application is fully client-side with no user authentication or accounts.

## File Storage

None. No server-side file storage. Sprites are loaded on-demand from external CDN URLs (see APIs above). Audio files are bundled as static assets in `public/` (`ItemFound.mp3`, `PCLogin.mp3`, `PCLogout.mp3`, `PCTurningOn.mp3`, `click.mp3`).

## Deployment

- **Platform:** GitHub Pages
- **Deploy tool:** `angular-cli-ghpages` ^3.0.2 (`ng deploy` command configured in `angular.json`)
- **Build output:** `dist/pokemon-roulette/`

## CI/CD

- **Provider:** GitHub Actions
- **Config:** `.github/workflows/node.js.yml`
- **Triggers:** Push and pull request to `main` branch
- **Pipeline:**
  1. Checkout code
  2. Setup Node.js 24.x with npm cache
  3. `npm ci` — clean install
  4. `npm run build` — production build
  5. `npm run test -- --watch=false --browsers=ChromeHeadless` — headless Karma tests

## Webhooks & Callbacks

None. No incoming webhooks. No outgoing webhook calls.

## Translation / i18n Assets

- **Source:** Local static JSON files in `src/assets/i18n/`
- **Files:** `en.json`, `es.json`, `fr.json`, `de.json`, `it.json`, `pt.json`
- **Loaded via:** `@ngx-translate/http-loader` using Angular `HttpClient` at runtime
- **Not an external service** — files are bundled with the application

---

*Integration audit: 2025-01-31*

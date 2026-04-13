# External Integrations

**Analysis Date:** 2025-07-09

## APIs & External Services

**PokéAPI (REST):**
- What: Fetches live Pokémon sprite URLs (official artwork, shiny variants) by Pokémon ID
- Base URL: `https://pokeapi.co/api/v2` (hardcoded in service)
- Endpoint used: `GET /pokemon/{id}` — extracts `sprites.other['official-artwork']`
- SDK/Client: Angular `HttpClient` (`@angular/common/http`)
- Auth: None — public API, no key required
- Retry policy: 3 retries with 1-second delay (via RxJS `retry` operator)
- Implementation: `src/app/services/pokemon-service/pokemon.service.ts` (`getPokemonSprites()`)

**PokeAPI GitHub CDN — Item Sprites:**
- What: Static item sprite images served from the PokeAPI sprites GitHub repository
- Base URL: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/`
- Usage: Hardcoded URLs for 8 in-game items (potion, rare-candy, running-shoes, etc.)
- Auth: None — public GitHub raw content
- Implementation: `src/app/services/item-sprite-service/item-sprite.service.ts` (`itemSpriteData` map)

**PokeAPI GitHub CDN — Pokémon Sprites (Pokédex):**
- What: Default Pokémon sprite images for the Pokédex (`/pokemon/{id}.png`)
- Base URL: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/`
- Usage: URLs constructed in `getSpriteUrl()` and cached to localStorage under `pokemon-roulette-pokedex`
- Auth: None
- Implementation: `src/app/services/pokedex-service/pokedex.service.ts`

**Bulbagarden Archives (image CDN):**
- What: One-off sprite for the Running Shoes item not available in PokeAPI sprites
- URL: `https://archives.bulbagarden.net/media/upload/4/42/Bag_Running_Shoes_Sprite.png`
- Auth: None — public CDN
- Implementation: `src/app/services/item-sprite-service/item-sprite.service.ts`

## Data Storage

**Databases:**
- None — no backend database

**Browser localStorage (client-side persistence):**
- Game settings: key `pokemon-roulette-settings` — JSON-serialised `GameSettings` object
  - Implementation: `src/app/services/settings-service/settings.service.ts`
- Dark mode preference: key configured via `DarkModeOptions.storageKey` (default from `src/app/services/dark-mode-service/default-options.ts`)
  - Implementation: `src/app/services/dark-mode-service/dark-mode.service.ts`
- Pokédex progress: key `pokemon-roulette-pokedex` — JSON-serialised `PokedexData` object
  - Implementation: `src/app/services/pokedex-service/pokedex.service.ts`

**File Storage:**
- Local static assets only (`public/` and `src/assets/`)
  - Audio: `public/click.mp3`, `public/ItemFound.mp3`, `public/PCLogin.mp3`, `public/PCLogout.mp3`, `public/PCTurningOn.mp3`
  - Images: `public/place-holder-pixel.png`, `public/qr_code.jpeg`
  - Translations: `src/assets/i18n/en.json`, `de.json`, `es.json`, `fr.json`, `it.json`, `pt.json`

**Caching:**
- In-memory sprite cache: `Map<number, string>` inside `PokedexService` (process lifetime)
- In-memory audio buffer cache: `Map<string, Promise<AudioBuffer>>` inside `SoundFxService` (process lifetime)

## Authentication & Identity

**Auth Provider:** None

No authentication or user accounts. The application is fully anonymous and client-side only. All state is stored in browser localStorage.

## Analytics

**Google Analytics (GA4):**
- Measurement ID: `G-40CS5XD7G9`
- Integration: `gtag.js` script tag loaded asynchronously in `src/index.html` via Google Tag Manager CDN (`https://www.googletagmanager.com/gtag/js?id=G-40CS5XD7G9`)
- Usage: Custom event tracking via `gtag('event', ...)` calls
- Angular wrapper: `src/app/services/analytics-service/analytics.service.ts` — `trackEvent(eventName, eventDetails, eventCategory)` method; `gtag` accessed via `declare var gtag: any`

## Monitoring & Observability

**Error Tracking:** None (no Sentry or similar)

**Logs:** `console.error()` only, used in error catch blocks within services (e.g., localStorage parse failures, failed HTTP fetches)

## CI/CD & Deployment

**Hosting:**
- GitHub Pages — static hosting
- Deploy command: `ng deploy` using `angular-cli-ghpages` ^3.0.2

**CI Pipeline:**
- GitHub Actions — `.github/workflows/` (workflow file present)
- Trigger: push and pull_request to `main` branch
- Node.js version matrix: 24.x
- Steps: `npm ci` → `npm run build` → `npm run test -- --watch=false --browsers=ChromeHeadless`
- Runner: `ubuntu-latest`

## Environment Configuration

**Required environment variables:** None
- The application has no server-side runtime and no environment variable injection
- All external URLs are hardcoded constants in service files:
  - `https://pokeapi.co/api/v2` — `src/app/services/pokemon-service/pokemon.service.ts`
  - `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/` — `src/app/services/item-sprite-service/item-sprite.service.ts`, `src/app/services/pokedex-service/pokedex.service.ts`
  - `https://archives.bulbagarden.net/...` — `src/app/services/item-sprite-service/item-sprite.service.ts`

**Secrets:** None required

## Webhooks & Callbacks

**Incoming:** None

**Outgoing:** None

## Audio (Web API)

**Web Audio API:**
- Native browser `AudioContext` (with `webkitAudioContext` fallback)
- Used to play MP3 sound effects loaded from `public/*.mp3` via `fetch()` + `decodeAudioData()`
- Implementation: `src/app/services/sound-fx-service/sound-fx.service.ts`
- Not a third-party integration but a significant browser API dependency

---

*Integration audit: 2025-07-09*

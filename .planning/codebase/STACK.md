# Technology Stack

**Analysis Date:** 2025-01-17

## Languages

**Primary:**
- TypeScript 5.9.3 - Application code, services, components
- HTML 5 - Templates and UI structure
- CSS 3 - Styling and responsive design

**Secondary:**
- JavaScript (ES2022) - Runtime execution

## Runtime

**Environment:**
- Node.js (LTS recommended - specified via Angular CLI requirements)

**Package Manager:**
- npm (version specified via package-lock.json)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Angular 21.2.7 - Modern single-page application framework (`package.json`, `src/app/app.config.ts`)
- Angular CLI 21.2.6 - Build and development tooling (`angular.json`)

**UI & Components:**
- Bootstrap 5.3.8 - CSS framework and grid system (`angular.json`, lines 31-33)
- ng-bootstrap 20.0.0 - Angular-native Bootstrap components (`package.json`)
- Angular Component Development Kit (CDK) 21.2.5 - Advanced component patterns (`package.json`)

**Internationalization:**
- @ngx-translate/core 17.0.0 - Multi-language support (`package.json`, `src/app/app.config.ts`)
- @ngx-translate/http-loader 17.0.0 - Loads translations from JSON files (`src/app/app.config.ts`, lines 18, 40-45)
- Translation files: `src/assets/i18n/` (en.json, es.json, fr.json, pt.json, de.json, it.json)

**Icons:**
- @ng-icons/core 33.2.0 - Icon system (`package.json`, `src/app/app.config.ts`)
- @ng-icons/bootstrap-icons 33.2.0 - Bootstrap icon set (`package.json`, `src/app/app.config.ts`, lines 26-36)

**Utilities:**
- rxjs 7.8.2 - Reactive programming library for observables and streams (`package.json`)
- zone.js 0.16.1 - Angular zone management (`package.json`)
- tslib 2.8.1 - TypeScript runtime helpers (`package.json`)
- @popperjs/core 2.11.8 - Tooltip/dropdown positioning library (`package.json`)
- fireworks-js 2.10.8 - Celebration fireworks animations (`package.json`)
- dom-to-image-more 3.7.2 - Image export utility for game screenshots (`package.json`)

## Testing

**Runner & Framework:**
- Karma 6.4.4 - Test runner (`package.json`, `angular.json` lines 76-96)
- Jasmine 6.1.0 - Testing framework and assertions (`package.json`)

**Tooling:**
- karma-jasmine 5.1.0 - Karma adapter for Jasmine (`package.json`)
- karma-chrome-launcher 3.2.0 - Chrome browser launcher for tests (`package.json`)
- karma-jasmine-html-reporter 2.2.0 - HTML test report generation (`package.json`)
- karma-coverage 2.2.1 - Code coverage reporting (`package.json`)
- @types/jasmine 6.0.0 - TypeScript type definitions for Jasmine (`package.json`)

## Build & Development

**Core Build Tools:**
- @angular-devkit/build-angular 21.2.6 - Angular build system (`package.json`)
- @angular/compiler-cli 21.2.7 - AOT compilation for Angular templates (`package.json`)

**Deployment:**
- angular-cli-ghpages 3.0.2 - GitHub Pages deployment integration (`package.json`, `angular.json` lines 97-99)
- Configured for deployment at `/pokemon-roulette/` base href

## Key Dependencies

**Critical:**
- Angular platform modules - Core framework components
  - @angular/platform-browser - DOM rendering (`package.json`)
  - @angular/platform-browser-dynamic - Dynamic module loading (`package.json`)
  - @angular/router - Client-side routing (`package.json`)
  - @angular/forms - Reactive and template-driven forms (`package.json`)
  - @angular/common - Common directives and pipes (`package.json`)
  - @angular/animations - Animation support (`package.json`)

**Data & External:**
- @angular/common/http - HttpClient for API calls (`src/app/app.config.ts` line 38)

## Configuration Files

**TypeScript:**
- `tsconfig.json` - Base TypeScript configuration
  - Target: ES2022
  - Module: ES2022
  - Strict mode enabled
  - `tsconfig.app.json` - Application-specific config with @angular/localize
  - `tsconfig.spec.json` - Test-specific configuration

**Angular:**
- `angular.json` - Angular CLI configuration
  - Project name: pokemon-roulette
  - Source root: `src`
  - Build output: `dist/pokemon-roulette`
  - Configured styles: Bootstrap CSS + `src/styles.css`
  - Build budgets: 1MB initial / 2MB error; 4kB component style warning / 8kB error
  - Development mode: source maps enabled
  - Production: output hashing and optimization enabled

**Application:**
- `src/app/app.config.ts` - Application providers
  - HTTP client configuration
  - Routing setup
  - Icon providers
  - Translation module configuration with HTTP loader
  - i18n asset path: `./assets/i18n/`

## Environment & Build Execution

**Development:**
- Command: `npm start` or `ng serve --host 0.0.0.0 --port 4200`
- Runs on http://localhost:4200
- Hot reload on file changes

**Production Build:**
- Command: `npm run build` or `ng build`
- Output: `dist/pokemon-roulette/`
- Optimizations: tree-shaking, minification, output hashing

**Watch Mode:**
- Command: `npm run watch` or `ng build --watch --configuration development`
- Continuous compilation during development

**Testing:**
- Command: `npm test` or `ng test`
- Runs tests in Chrome browser using Karma + Jasmine

**Deployment:**
- Command: `ng deploy --base-href=/pokemon-roulette/`
- Targets: GitHub Pages via angular-cli-ghpages
- Base href: `/pokemon-roulette/`

## Platform Requirements

**Development:**
- Node.js with npm (version matching package-lock.json)
- Modern terminal/shell
- Git for version control

**Production:**
- Modern web browser with:
  - HTML5 Canvas support (for wheel rendering)
  - HTML5 Audio API support (for sound effects)
  - ES2022+ JavaScript support
  - Cookies/localStorage support (for preferences and theme persistence)

**Deployment Target:**
- GitHub Pages (primary)
- Served from: https://zeroxm.github.io/pokemon-roulette/

---

*Stack analysis: 2025-01-17*

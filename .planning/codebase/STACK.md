# Tech Stack

**Analysis Date:** 2025-01-31

## Languages

- **TypeScript** ~5.9.3 — All application source code (`src/**/*.ts`)
- **HTML** — Angular component templates (`src/app/**/*.html`)
- **CSS** — Component styles and global styles (`src/styles.css`, `src/app/**/*.css`)

## Runtime & Platform

- **Node.js** 24.x — Build and CI runtime (per `.github/workflows/node.js.yml`)
- **Browser** — Target deployment platform; uses `localStorage`, `AudioContext`, `Canvas` APIs

## Frameworks & Libraries

### Core
- **Angular** ^21.2.7 — Primary SPA framework (standalone components, signals-ready)
  - `@angular/core` — DI, component lifecycle
  - `@angular/router` — Client-side routing (`src/app/app.routes.ts`)
  - `@angular/forms` — Form handling
  - `@angular/animations` — Animation primitives
  - `@angular/common` — `CommonModule`, `HttpClient`
  - `@angular/cdk` ^21.2.5 — Component Dev Kit (used for overlays/utilities)
- **RxJS** ~7.8.2 — Reactive state management via `BehaviorSubject`, `Observable`; used throughout all services

### UI / Frontend
- **Bootstrap** ^5.3.8 — CSS utility/component framework (loaded via `angular.json` styles)
- **@ng-bootstrap/ng-bootstrap** ^20.0.0 — Angular Bootstrap components (`NgbModal`, `NgbCollapseModule`); used in `wheel.component.ts`, `main-game.component.ts`
- **@ng-icons/core** ^33.2.0 — Icon system (registered in `src/app/app.config.ts`)
- **@ng-icons/bootstrap-icons** ^33.2.0 — Bootstrap icon set (11 icons registered: `bootstrapArrowRepeat`, `bootstrapCheck`, `bootstrapClock`, etc.)
- **@popperjs/core** ^2.11.8 — Tooltip/popover positioning (Bootstrap dependency)
- **fireworks-js** ^2.10.8 — Canvas-based fireworks animation; used in `src/app/main-game/end-game/end-game.component.ts`
- **dom-to-image-more** ^3.7.2 — DOM-to-image screenshot export; used in `src/app/main-game/end-game/end-game.component.ts` and `src/app/main-game/game-over/game-over.component.ts`

### Internationalization
- **@ngx-translate/core** ^17.0.0 — Runtime i18n translation service (`TranslateService`, `TranslateModule`, `TranslatePipe`)
- **@ngx-translate/http-loader** ^17.0.0 — HTTP-based JSON translation loader; loads from `./assets/i18n/{lang}.json`
  - Supported languages: `en`, `es`, `fr`, `de`, `it`, `pt`

### Dev Dependencies
- **@angular/cli** ^21.2.6 — CLI tooling (`ng serve`, `ng build`, `ng test`)
- **@angular-devkit/build-angular** ^21.2.6 — Application builder
- **angular-cli-ghpages** ^3.0.2 — GitHub Pages deployment (`ng deploy`)
- **Karma** ~6.4.4 — Test runner (browser-based)
- **karma-chrome-launcher** ~3.2.0 — Chrome/ChromeHeadless launcher for CI
- **karma-coverage** ~2.2.1 — Code coverage reporting
- **karma-jasmine** ~5.1.0 — Jasmine test framework bridge
- **karma-jasmine-html-reporter** ~2.2.0 — HTML test report
- **Jasmine** ~6.1.0 — Test assertion/suite framework (`@types/jasmine` ~6.0.0)
- **TypeScript** ~5.9.3 — Compiler

## Build & Tooling

- **Angular CLI / `@angular-devkit/build-angular`** — Application bundler using `@angular-devkit/build-angular:application` builder
  - Output: `dist/pokemon-roulette/`
  - Production: output hashing enabled, budgets (initial: warn 1MB / error 2MB)
  - Development: source maps, no optimization
  - Default config: `production`
- **`ng serve`** — Dev server on `0.0.0.0:4200`
- **`ng build --watch`** — Watch mode for development
- **`ng test`** — Karma test runner
- **`angular-cli-ghpages`** — `ng deploy` pushes built output to GitHub Pages
- **GitHub Actions** — CI pipeline (`.github/workflows/node.js.yml`): runs `npm ci`, `ng build`, `ng test --watch=false --browsers=ChromeHeadless` on push/PR to `main`

## Configuration Files

- `package.json` — Dependencies and npm scripts
- `package-lock.json` — Dependency lockfile (npm)
- `angular.json` — Angular workspace config (builders, assets, styles, budgets, deploy)
- `tsconfig.json` — Base TypeScript config (ES2022 target/module, strict mode, `bundler` resolution)
- `tsconfig.app.json` — App-specific TS config (extends base, resolves JSON modules, `@angular/localize` types)
- `tsconfig.spec.json` — Test-specific TS config
- `src/environments/environment.ts` — Development environment config (`production: false`, `googleAnalyticsId`)
- `src/environments/environment.prod.ts` — Production environment config (`production: true`, `googleAnalyticsId`)
- `.editorconfig` — Editor formatting: 2-space indent, single quotes for TS, UTF-8
- `.github/workflows/node.js.yml` — GitHub Actions CI workflow
- `src/styles.css` — Global CSS entry point
- `types/dom-to-image-more.d.ts` — Custom type declaration for `dom-to-image-more`

## Environment Variables

No `.env` files detected. Environment configuration is managed via Angular environment files:

- `environment.googleAnalyticsId` — Google Analytics measurement ID (`G-40CS5XD7G9`); hardcoded in `src/environments/environment.ts` and `src/environments/environment.prod.ts`
- `environment.production` — Boolean flag swapped at build time via `angular.json` `fileReplacements`

## TypeScript Configuration

- Target: `ES2022`, Module: `ES2022`
- Strict mode fully enabled: `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`
- Angular strict templates: `strictTemplates`, `strictInjectionParameters`, `strictInputAccessModifiers`
- `experimentalDecorators: true` (required for Angular decorators)
- `moduleResolution: "bundler"` (Angular v21 standard)

---

*Stack analysis: 2025-01-31*

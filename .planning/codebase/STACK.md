# Technology Stack

**Analysis Date:** 2025-07-09

## Languages

**Primary:**
- TypeScript ~5.9.3 — all application source code under `src/`

**Secondary:**
- HTML — Angular component templates (`.component.html` files)
- CSS — component and global styles (`.component.css`, `src/styles.css`)

## Runtime

**Environment:**
- Node.js 24.x (CI matrix target; local env running v24.13.0)

**Package Manager:**
- npm 11.12.1
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Angular ^21.2.7 — SPA framework; standalone components (no NgModule), signals-era config
  - `@angular/animations` ^21.2.7
  - `@angular/cdk` ^21.2.5 — component dev kit (overlays, portals, etc.)
  - `@angular/common` ^21.2.7
  - `@angular/compiler` / `@angular/compiler-cli` ^21.2.7
  - `@angular/core` ^21.2.7
  - `@angular/forms` ^21.2.7
  - `@angular/platform-browser` / `@angular/platform-browser-dynamic` ^21.2.7
  - `@angular/router` ^21.2.7

**UI / Component Libraries:**
- Bootstrap ^5.3.8 — CSS utility/component framework; loaded via `angular.json` styles glob
- `@ng-bootstrap/ng-bootstrap` ^20.0.0 — Angular wrappers around Bootstrap components
- `@ng-icons/core` ^33.2.0 — icon primitive
- `@ng-icons/bootstrap-icons` ^33.2.0 — Bootstrap icon set; icons registered in `src/app/app.config.ts`
- `@popperjs/core` ^2.11.8 — tooltip/dropdown positioning (Bootstrap peer dep)

**Internationalisation:**
- `@ngx-translate/core` ^17.0.0 — runtime i18n
- `@ngx-translate/http-loader` ^17.0.0 — loads JSON translation files via HTTP
  - Translation files: `src/assets/i18n/{en,de,es,fr,it,pt}.json`
  - Loader prefix/suffix configured in `src/app/app.config.ts`

**Visual Effects:**
- `fireworks-js` ^2.10.8 — canvas fireworks used in end-game screen (`src/app/main-game/end-game/end-game.component.ts`)
- `dom-to-image-more` ^3.7.2 — DOM → image export; used in `end-game.component.ts` and `game-over.component.ts`; requires ambient declaration `types/dom-to-image-more.d.ts`

**Reactive Programming:**
- `rxjs` ~7.8.2 — observables, BehaviorSubjects, operators; used pervasively across all services
- `zone.js` ~0.16.1 — Angular change detection

**Utilities:**
- `tslib` ^2.8.1 — TypeScript runtime helpers

**Testing:**
- Karma ~6.4.4 — test runner; config target `@angular-devkit/build-angular:karma`
- `karma-chrome-launcher` ~3.2.0 — launches ChromeHeadless in CI
- `karma-coverage` ~2.2.1 — code coverage reporter
- `karma-jasmine` ~5.1.0 — Jasmine adapter
- `karma-jasmine-html-reporter` ~2.2.0 — HTML report
- Jasmine ~6.1.0 (`jasmine-core`, `@types/jasmine` ~6.0.0) — test/assertion framework

**Build / Dev:**
- Angular CLI ^21.2.6 (`@angular/cli`, `@angular-devkit/build-angular` ^21.2.6)
  - Builder: `@angular-devkit/build-angular:application` (esbuild-based)
  - Entry: `src/main.ts`
  - Output: `dist/pokemon-roulette/`
- `angular-cli-ghpages` ^3.0.2 — deploy target (`ng deploy`) for GitHub Pages

## Key Dependencies

**Critical:**
- `@angular/core` ^21.2.7 — entire application depends on this
- `rxjs` ~7.8.2 — state management backbone (BehaviorSubject throughout all services)
- `@ngx-translate/core` ^17.0.0 — i18n; app will break without translation JSON files

**Infrastructure:**
- `bootstrap` ^5.3.8 — loaded globally via `angular.json`, styles fail to build without it
- `zone.js` ~0.16.1 — Angular change detection; must be first polyfill

## Configuration

**Build:**
- `angular.json` — project builder config, asset globs, style bundles, budget limits (1 MB warning / 2 MB error initial; 4 kB warning / 8 kB error component styles)
- `tsconfig.json` — base TypeScript config; strict mode enabled, target ES2022/module ES2022, `moduleResolution: bundler`
- `tsconfig.app.json` — extends base; entry `src/main.ts`; type reference `@angular/localize`
- `tsconfig.spec.json` — extends base; includes `src/**/*.spec.ts`; type references `jasmine`, `@angular/localize`

**TypeScript Strict Mode flags enabled:**
- `strict`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `strictInjectionParameters`, `strictInputAccessModifiers`, `strictTemplates`

**Angular Polyfills:**
- `zone.js` and `@angular/localize/init` declared in `angular.json` `polyfills` array

**Environment:**
- No `.env` files or environment-specific TypeScript environment files detected
- No runtime environment variable injection — API URLs are hardcoded in service files (e.g., `https://pokeapi.co/api/v2` in `src/app/services/pokemon-service/pokemon.service.ts`)

## Platform Requirements

**Development:**
- Node.js 24.x
- npm (comes with Node)
- Google Chrome or Chromium (for Karma test runner)
- `npm start` → `ng serve --host 0.0.0.0 --port 4200`

**Production:**
- Static file hosting (GitHub Pages via `angular-cli-ghpages`)
- Output: `dist/pokemon-roulette/` (all-static HTML/JS/CSS/assets bundle)
- No server-side runtime required

---

*Stack analysis: 2025-07-09*

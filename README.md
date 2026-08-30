# pokemon-roulette

A game involving Pokémon and Roulettes — a randomised run driven by spinning wheels. Pick a region,
spin for what happens next, and try to reach the Champion with whatever the wheels give you.

**Play it here: [zeroxm.github.io/pokemon-roulette](https://zeroxm.github.io/pokemon-roulette/)**

Angular 22, standalone components, Bootstrap 5 + ng-bootstrap, `@ngx-translate` for six languages,
deployed to GitHub Pages.

## Getting started

```bash
npm ci
npm start
```

`npm start` serves on `0.0.0.0:4200` and reloads on save. Open <http://localhost:4200/>.

> Use `npm ci` rather than `npm install` for a first checkout — it installs exactly what
> `package-lock.json` pins, which is what CI uses.

## Commands

| Command | What it does |
| --- | --- |
| `npm start` | Dev server on `0.0.0.0:4200` |
| `npm run build` | Production build into `dist/pokemon-roulette` |
| `npm run watch` | Development build, rebuilding on change |
| `npm test` | Karma/Jasmine in watch mode |
| `npm test -- --watch=false --browsers=ChromeHeadless` | One-shot run — what CI does |
| `npm run deploy` | Publish to GitHub Pages |

Prefer the npm scripts over bare `ng` commands: they carry flags the project needs, such as the
`--base-href=/pokemon-roulette/` that deployment depends on.

### Running a single spec

```bash
npm test -- --include='**/wheel.component.spec.ts'
```

### If the tests will not start

Karma needs a Chrome binary and cannot always find one:

```bash
export CHROME_BIN=/usr/bin/google-chrome-stable
```

Point it at whatever Chrome or Chromium you have installed.

## Before you open a pull request

CI runs `npm ci`, `npm audit --omit=dev --audit-level=high`, `npm run build` and the headless test
command on every push and pull request to `main`. Locally:

```bash
npm run build      # must not breach the bundle budgets in angular.json
npm test -- --watch=false --browsers=ChromeHeadless
npm audit          # should report 0 vulnerabilities
```

There is no lint step. `noUnusedLocals` and `noUnusedParameters` in `tsconfig.json` cover that class
of problem, so an unused import or variable is a **build error** rather than a warning.

### Translations must stay in step

User-facing strings are never literals — they are dotted keys resolved by the `translate` pipe, and
all six locale files in `src/assets/i18n/` hold an identical key set. A key present in one file and
missing from another ships as raw text like `badges.bug_paldea` to that language's players. After
any i18n change:

```bash
node -e "const p=(o,x='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v?p(v,x+k+'.'):[x+k]);const b=p(require('./src/assets/i18n/en.json')).sort();for(const l of ['pt','es','fr','de','it']){const o=p(require('./src/assets/i18n/'+l+'.json')).sort();console.log(l,b.filter(k=>!o.includes(k)).length||o.filter(k=>!b.includes(k)).length?'DIVERGENT':'ok')}"
```

Every locale must report `ok`.

## Deploying

```bash
npm run deploy
```

This builds for production and pushes to the `gh-pages` branch via `angular-cli-ghpages`. GitHub
Pages then takes roughly a minute to publish, so the live site keeps serving the previous build for
a short while — check the deployment finished rather than assuming, for example by confirming the
`main-*.js` filename on the live page matches the one in `dist/pokemon-roulette/browser/`.

## Working on the code

`CLAUDE.md` at the repo root is the architecture guide: the game-state stack, how roulettes and the
adventure wheel are put together, the services, and the conventions this codebase actually follows.
Read it before adding a feature — several things that look like free choices (adding a wheel slice,
a form-changing mechanic, a Pokémon pool) have an established, compiler-checked way of being done.

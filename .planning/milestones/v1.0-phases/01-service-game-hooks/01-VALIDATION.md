# Phase 1: Service & Game Hooks — Validation Architecture

**Generated from:** 01-RESEARCH.md Validation Architecture section
**Phase:** 01-service-game-hooks

---

## Test Framework

| Property | Value |
|----------|-------|
| Framework | Karma 6.4.4 + Jasmine 6.1.0 |
| Config file | `angular.json` (lines 76-96) |
| Quick run command | `ng test --include="**/pokedex.service.spec.ts" --no-watch --browsers=ChromeHeadless` |
| Full suite command | `npm test` (runs all `*.spec.ts` files) |

---

## Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DATA-01 | `markSeen(pokemonId)` creates entry in `caught` | unit | `ng test --include="**/pokedex.service.spec.ts" --no-watch --browsers=ChromeHeadless` | ❌ Wave 0 |
| DATA-01 | `markSeen` is idempotent (called twice → one entry) | unit | same | ❌ Wave 0 |
| DATA-02 | `markWon([1,2,3])` sets `won: true` on entries | unit | same | ❌ Wave 0 |
| DATA-02 | `markWon` also marks unseen Pokémon as seen | unit | same | ❌ Wave 0 |
| DATA-03 | After `markSeen`, localStorage contains `pokemon-roulette-pokedex` key | unit | same | ❌ Wave 0 |
| DATA-03 | Constructor reads from localStorage on initialization | unit | same | ❌ Wave 0 |
| DATA-04 | Pokédex data NOT reset when new game run starts — no `clearPokedex`/reset method callable from game loop | design | `expect(service['clearPokedex']).toBeUndefined()` + no hook to resetGameAction | ❌ Wave 0 |
| DATA-05 | `caught[id].sprite` is populated on `markSeen` | unit | same | ❌ Wave 0 |
| DATA-06 | `spriteCache.has(pokemonId)` is true after first `markSeen` | unit | same | ❌ Wave 0 |

---

## Sampling Rate

- **Per task commit:** `ng test --include="**/pokedex.service.spec.ts" --no-watch --browsers=ChromeHeadless`
- **Per wave merge:** `npm test` (full suite — confirm existing tests still pass)
- **Phase gate:** Full suite green before `/gsd-verify-work`

---

## Wave 0 Gaps (files to create)

- [ ] `src/app/services/pokedex-service/pokedex.service.spec.ts` — covers DATA-01 through DATA-06 unit tests
- [ ] `src/app/services/pokedex-service/pokedex.service.ts` — the service implementation (new directory)

> Note: `roulette-container.component.spec.ts` already exists. The existing "should create" test will continue to pass after constructor injection is added correctly. No new integration tests are needed for the hook sites — they are single-line calls verified by the phase gate grep counts.

---
phase: 02-gym-leader-types
plan: 1
title: "Add types to all gym leaders"
goal: "Assign PokemonType arrays to every gym leader entry across all 9 generations"
depends_on: []
files_modified:
  - src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts
autonomous: true
requirements: []

must_haves:
  truths:
    - "Every gym leader entry in gym-leaders-by-generation.ts has a types array"
    - "Multi-slot entries (Gen 5 rounds 0+7, Gen 7 rounds 2+4, Gen 8 rounds 3+5) have types arrays whose length matches sprite array length"
    - "types values are valid PokemonType literals — no typos, no any casts"
    - "Spot-checks pass: Brock=['rock'], Morty=['ghost'], Fantina=['ghost'], Valerie=['fairy']"
    - "npm run build completes with zero TypeScript errors"
  artifacts:
    - path: "src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts"
      provides: "All 72 gym leader entries with types populated"
      contains: "types:"
  key_links:
    - from: "gym-leaders-by-generation.ts GymLeader objects"
      to: "GymLeader interface types?: PokemonType[]"
      via: "TypeScript structural typing — literal strings inferred as PokemonType"
---

# Plan 1: Add types to all gym leaders

## Objective

Add `types: PokemonType[]` to every gym leader entry in `gym-leaders-by-generation.ts`, covering all 9 generations (72 leader slots total, including 6 multi-leader slots).

## Target File

`src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts`

**Key constraints:**
- Do NOT restructure the file, rename variables, or change imports.
- Do NOT import `PokemonType` — TypeScript infers literal types from the `GymLeader` interface.
- Add `types: [...]` as the last property of each leader object, immediately after the closing `]` of `quotes`.
- For multi-slot entries (where `sprite` is already an array), `types` must be an array of the same length, with index alignment: `types[i]` is the type of the leader whose sprite is `sprite[i]`.

---

## Tasks

### Task 1: Add types to Generation 1 (Kanto) and Generation 2 (Johto)

**File:** `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts`

**Action:** For each leader object in the `1:` and `2:` blocks, add a `types` line after the closing `]` of `quotes`. Use the closing quotes bracket line as your anchor. The indentation in Gen 1 uses 12 spaces; Gen 2 uses 8 spaces — match the surrounding code.

**Gen 1 — edit each object's `quotes` closing bracket:**

```
// Brock (lines ~8-10): add after quotes closing ]
            quotes: [
                'gymLeaders.brock.quote1'
            ],
            types: ['rock']

// Misty (lines ~15-17):
            quotes: [
                'gymLeaders.misty.quote1'
            ],
            types: ['water']

// Lt. Surge (lines ~22-26):
            quotes: [
                "gymLeaders.surge.quote1",
                "gymLeaders.surge.quote2",
                "gymLeaders.surge.quote3",
            ],
            types: ['electric']

// Erika (lines ~31-34):
            quotes: [
                "gymLeaders.erika.quote1",
                "gymLeaders.erika.quote2",
            ],
            types: ['grass']

// Koga (lines ~39-42):
            quotes: [
                "gymLeaders.koga.quote1",
                "gymLeaders.koga.quote2",
            ],
            types: ['poison']

// Sabrina (lines ~47-50):
            quotes: [
                "gymLeaders.sabrina.quote1",
                "gymLeaders.sabrina.quote2",
            ],
            types: ['psychic']

// Blaine (lines ~55-58):
            quotes: [
                "gymLeaders.blaine.quote1",
                "gymLeaders.blaine.quote2",
            ],
            types: ['fire']

// Giovanni (lines ~63-66):
            quotes: [
                "gymLeaders.giovanni.quote1",
                "gymLeaders.giovanni.quote2",
            ],
            types: ['ground']
```

**Gen 2 — same pattern, 8-space indent:**

```
// Falkner:  types: ['flying']
// Bugsy:    types: ['bug']
// Whitney:  types: ['normal']
// Morty:    types: ['ghost']
// Chuck:    types: ['fighting']
// Jasmine:  types: ['steel']
// Pryce:    types: ['ice']
// Clair:    types: ['dragon']
```

**Exact replacement pairs for Gen 2** (find the `quotes` closing `]` then closing `}`):

For Falkner (around line 73-76): the object ends with `]` then `}`. Change to add `types` before the `}`:
```typescript
        quotes: [
          "gymLeaders.falkner.quote1"
        ],
        types: ['flying']
      },
```
Repeat this pattern for every Gen 2 leader using the types listed above.

**Verify after this task:** `grep -c "types:" gym-leaders-by-generation.ts` should return 16.

---

### Task 2: Add types to Generation 3 (Hoenn) and Generation 4 (Sinnoh)

**File:** `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts`

**Action:** Same pattern as Task 1. Add `types` after `quotes` closing bracket for each leader in the `3:` block (lines ~136-202) and `4:` block (lines ~203-269).

**Gen 3 types (round order):**
```
Roxanne   (round 0): types: ['rock']
Brawly    (round 1): types: ['fighting']
Wattson   (round 2): types: ['electric']
Flannery  (round 3): types: ['fire']
Norman    (round 4): types: ['normal']
Winona    (round 5): types: ['flying']
Liza&Tate (round 6): types: ['psychic']
Wallace   (round 7): types: ['water']
```

**Gen 4 types (round order):**
```
Roark        (round 0): types: ['rock']
Gardenia     (round 1): types: ['grass']
Maylene      (round 2): types: ['fighting']
Crasher Wake (round 3): types: ['water']
Fantina      (round 4): types: ['ghost']
Byron        (round 5): types: ['steel']
Candice      (round 6): types: ['ice']
Volkner      (round 7): types: ['electric']
```

**Verify after this task:** `grep -c "types:" gym-leaders-by-generation.ts` should return 32.

---

### Task 3: Add types to Generations 5 (Unova), 6 (Kalos), 7 (Alola), 8 (Galar), and 9 (Paldea)

**File:** `src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts`

**Action:** Add `types` for the remaining 5 generations. Pay special attention to the 6 multi-slot entries — their `sprite` is already an array; `types` must also be an array with the same number of elements, in the same order.

**Gen 5 — Unova (lines ~270-344):**
```
round 0: Cilan/Chili/Cress — sprite is a 3-element array
  types: ['grass', 'fire', 'water']
  (index 0=Cilan/grass, 1=Chili/fire, 2=Cress/water — matches sprite array order)

round 1: Lenora    types: ['normal']
round 2: Burgh     types: ['bug']
round 3: Elesa     types: ['electric']
round 4: Clay      types: ['ground']
round 5: Skyla     types: ['flying']
round 6: Brycen    types: ['ice']

round 7: Drayden/Iris — sprite is a 2-element array
  types: ['dragon', 'dragon']
  (index 0=Drayden/dragon, 1=Iris/dragon — matches sprite array order)
```

**Gen 6 — Kalos (lines ~345-409):**
```
Viola   (round 0): types: ['bug']
Grant   (round 1): types: ['rock']
Korrina (round 2): types: ['fighting']
Ramos   (round 3): types: ['grass']
Clemont (round 4): types: ['electric']
Valerie (round 5): types: ['fairy']
Olympia (round 6): types: ['psychic']
Wulfric (round 7): types: ['ice']
```

**Gen 7 — Alola (lines ~410-484):**
```
round 0: Ilima     types: ['normal']
round 1: Hala      types: ['fighting']

round 2: Lana/Kiawe/Mallow — sprite is a 3-element array
  types: ['water', 'fire', 'grass']
  (index 0=Lana/water, 1=Kiawe/fire, 2=Mallow/grass — matches sprite array order)

round 3: Olivia    types: ['rock']

round 4: Sophocles/Acerola — sprite is a 2-element array
  types: ['electric', 'ghost']
  (index 0=Sophocles/electric, 1=Acerola/ghost — matches sprite array order)

round 5: Nanu      types: ['dark']
round 6: Mina      types: ['fairy']
round 7: Hapu      types: ['ground']
```

**Gen 8 — Galar (lines ~485-556):**
```
round 0: Milo      types: ['grass']
round 1: Nessa     types: ['water']
round 2: Kabu      types: ['fire']

round 3: Bea/Allister — sprite is a 2-element array
  types: ['fighting', 'ghost']
  (index 0=Bea/fighting, 1=Allister/ghost — matches sprite array order)

round 4: Opal      types: ['fairy']

round 5: Gordie/Melony — sprite is a 2-element array
  types: ['rock', 'ice']
  (index 0=Gordie/rock, 1=Melony/ice — matches sprite array order)

round 6: Piers     types: ['dark']
round 7: Raihan    types: ['dragon']
```

**Gen 9 — Paldea (lines ~557-622):**
```
Katy     (round 0): types: ['bug']
Brassius (round 1): types: ['grass']
Iono     (round 2): types: ['electric']
Kofu     (round 3): types: ['water']
Larry    (round 4): types: ['normal']
Ryme     (round 5): types: ['ghost']
Tulip    (round 6): types: ['psychic']
Grusha   (round 7): types: ['ice']
```

**Verify after this task:** `grep -c "types:" gym-leaders-by-generation.ts` should return 72.

---

## Verification

Run these commands from the project root after all three tasks are complete:

```bash
# 1. Confirm total types count — must be 72
grep -c "types:" src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts

# 2. Spot-check canonical leaders
grep -A1 "brock.name" src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts
grep "types:" src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts | head -8
# Brock should show types: ['rock']

grep -B5 "types:" src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts | grep -A1 "morty"
# Morty should show types: ['ghost']

# 3. Verify multi-slot array lengths
grep -A1 "cilan-chili-cress" src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts | grep types
# Should show: types: ['grass', 'fire', 'water']  (3 elements)

grep -A1 "drayden-iris" src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts | grep types
# Should show: types: ['dragon', 'dragon']  (2 elements)

grep -A1 "bea-allister" src/app/main-game/roulette-container/roulettes/gym-battle-roulette/gym-leaders-by-generation.ts | grep types
# Should show: types: ['fighting', 'ghost']  (2 elements)

# 4. TypeScript compilation — zero errors
npm run build 2>&1 | tail -20
```

- [ ] `grep -c "types:"` returns exactly `72`
- [ ] Brock = `['rock']`, Morty = `['ghost']`, Fantina = `['ghost']`, Valerie = `['fairy']`
- [ ] Gen 5 round 0: `['grass', 'fire', 'water']` (3 elements)
- [ ] Gen 5 round 7: `['dragon', 'dragon']` (2 elements)
- [ ] Gen 7 round 2: `['water', 'fire', 'grass']` (3 elements)
- [ ] Gen 7 round 4: `['electric', 'ghost']` (2 elements)
- [ ] Gen 8 round 3: `['fighting', 'ghost']` (2 elements)
- [ ] Gen 8 round 5: `['rock', 'ice']` (2 elements)
- [ ] `npm run build` — zero TypeScript errors

## Output

After completion, create `.planning/phases/02-gym-leader-types/02-01-SUMMARY.md` with:
- What was changed (N entries updated across 9 generations)
- Any deviations from the plan (e.g. if a `PokemonType` import was needed)
- Final `grep -c "types:"` count
- Build result

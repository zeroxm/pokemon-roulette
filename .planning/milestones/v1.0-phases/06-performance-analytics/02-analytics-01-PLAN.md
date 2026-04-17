---
plan_id: "02-analytics-01"
phase: 6
requirement: ANALYTICS-01
title: "Use stub GA measurement ID in dev environment"
depends_on: []
---

# Plan: Stub GA measurement ID in dev environment (ANALYTICS-01)

## Goal
Replace the production GA measurement ID in `environment.ts` with an empty string so that local development sessions no longer send events to the production Google Analytics property. `environment.prod.ts` retains the real ID.

## Current state

`src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  googleAnalyticsId: 'G-40CS5XD7G9',
};
```

`src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  googleAnalyticsId: 'G-40CS5XD7G9',
};
```

Both files share the same ID — dev sessions pollute production analytics.

## Target state

`src/environments/environment.ts` uses `''` as the GA ID. `environment.prod.ts` is unchanged.

## Tasks

### Task 1: Stub out GA ID in environment.ts

File: `src/environments/environment.ts`

Change:
```typescript
export const environment = {
  production: false,
  googleAnalyticsId: 'G-40CS5XD7G9',
};
```
To:
```typescript
export const environment = {
  production: false,
  googleAnalyticsId: '',
};
```

## Verification

1. **Dev environment has empty GA ID:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\environments\environment.ts" -Pattern "googleAnalyticsId: ''"
   ```
   Expected: 1 hit

2. **Prod environment still has real GA ID:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\environments\environment.prod.ts" -Pattern "G-40CS5XD7G9"
   ```
   Expected: 1 hit

3. **Build:**
   ```powershell
   cd D:\workspace\pokemon-roulette; ng build
   ```
   Expected: exit code 0

4. **Tests:**
   ```powershell
   cd D:\workspace\pokemon-roulette; ng test --watch=false --browsers=ChromeHeadless
   ```
   Expected: 175 specs, 0 failures

## Commit

```
git commit -m "config: use empty GA measurement ID in dev environment to prevent analytics pollution (ANALYTICS-01)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

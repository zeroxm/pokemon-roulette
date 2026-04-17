---
plan_id: "01-type-01"
phase: 4
requirement: TYPE-01
title: "Replace declare var gtag: any with a typed Gtag interface"
depends_on: []
---

# Plan: Typed Gtag interface (TYPE-01)

## Goal
Remove `declare var gtag: any` from `analytics.service.ts` and replace it with a typed interface that covers the GA4 `event` command used in the codebase.

## Current state

`src/app/services/analytics-service/analytics.service.ts` line 3:
```typescript
declare var gtag : any;
```

Used at lines 13–22:
```typescript
gtag('event', eventName, {
  'event_category': eventCategory,
  'event_label': eventName,
  'value': eventDetails
})
```

## Target state

Replace `declare var gtag: any` with a typed interface:
```typescript
interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: string;
  [key: string]: unknown;
}

type GtagCommand = (command: 'event', eventName: string, params: GtagEventParams) => void;

declare var gtag: GtagCommand;
```

## Tasks

### Task 1: Replace the gtag declaration in analytics.service.ts

File: `src/app/services/analytics-service/analytics.service.ts`

Replace:
```typescript
declare var gtag : any;
```

With:
```typescript
interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: string;
  [key: string]: unknown;
}

type GtagCommand = (command: 'event', eventName: string, params: GtagEventParams) => void;

declare var gtag: GtagCommand;
```

## Verification

1. **No `any` type on gtag:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\app\services\analytics-service\analytics.service.ts" -Pattern "declare var gtag.*any"
   ```
   Expected: 0 hits

2. **Typed interface present:**
   ```powershell
   Select-String -Path "D:\workspace\pokemon-roulette\src\app\services\analytics-service\analytics.service.ts" -Pattern "GtagCommand"
   ```
   Expected: 2 hits (type definition + declare statement)

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
git commit -m "refactor: replace declare var gtag: any with typed GtagCommand interface (TYPE-01)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

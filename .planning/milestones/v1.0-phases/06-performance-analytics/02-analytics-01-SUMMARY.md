---
phase: "06"
plan: "02"
subsystem: config
tags: [analytics, environment, dev, google-analytics]
dependency_graph:
  requires: []
  provides: [dev-ga-stub]
  affects: [environment.ts]
tech_stack:
  added: []
  patterns: [environment-file separation, dev/prod config divergence]
key_files:
  modified:
    - src/environments/environment.ts
decisions:
  - Set `googleAnalyticsId` to empty string in dev environment so analytics events are not fired during local development or CI test runs
metrics:
  duration: "~3 minutes"
  completed: "2026-04-17"
  tasks: 1
  files: 1
---

# Phase 06 Plan 02: ANALYTICS-01 — Stub GA ID in Dev Summary

**One-liner:** Cleared `googleAnalyticsId` in `environment.ts` to prevent analytics events from firing in dev/CI while keeping the real `G-40CS5XD7G9` ID intact in `environment.prod.ts`.

## What Was Done

`src/environments/environment.ts` had the live GA measurement ID `G-40CS5XD7G9` hardcoded, causing analytics events to be sent from local development sessions and CI runs. Changed the value to an empty string (`''`) so that GA is effectively disabled in non-production builds. The production environment file (`environment.prod.ts`) is unchanged and still carries the live ID.

## Changes

| File | Change |
|------|--------|
| `src/environments/environment.ts` | `googleAnalyticsId` changed from `'G-40CS5XD7G9'` to `''` |

## Verification

- `environment.ts` has `googleAnalyticsId: ''`: **1 match** ✅
- `environment.prod.ts` still has `G-40CS5XD7G9`: **1 match** ✅
- `ng build` exit 0 ✅ (pre-existing bundle-size and CommonJS warnings unchanged)
- `ng test --watch=false --browsers=ChromeHeadless`: **175 specs, 0 failures** ✅

## Commit

- `f717e1b` — `config: use empty GA measurement ID in dev environment to prevent analytics pollution (ANALYTICS-01)`

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- File `src/environments/environment.ts` exists ✅
- Commit `f717e1b` exists ✅

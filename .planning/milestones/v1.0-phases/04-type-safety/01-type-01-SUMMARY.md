---
phase: "04-type-safety"
plan: "01-type-01"
subsystem: "analytics"
tags: ["typescript", "type-safety", "gtag", "refactor"]
dependency_graph:
  requires: []
  provides: ["typed-gtag-interface"]
  affects: ["analytics.service.ts"]
tech_stack:
  added: []
  patterns: ["typed-declare-var", "function-type-alias"]
key_files:
  created: []
  modified:
    - "src/app/services/analytics-service/analytics.service.ts"
decisions:
  - "Used a named type alias GtagCommand for the declare var to allow type reuse"
  - "Used index signature [key: string]: unknown in GtagEventParams for forward compatibility"
metrics:
  duration: "~5 minutes"
  completed: "2026-04-17"
---

# Phase 04 Plan 01: TYPE-01 — Typed Gtag Interface Summary

**One-liner:** Replace `declare var gtag: any` with a typed `GtagCommand` function-type alias and `GtagEventParams` interface in analytics.service.ts.

## What Was Done

Replaced the bare `declare var gtag: any` ambient declaration in `analytics.service.ts` with:

- `GtagEventParams` interface — typed parameters for the `'event'` gtag call (event_category, event_label, value, plus index signature for unknown extra params)
- `GtagCommand` type alias — typed as `(command: 'event', eventName: string, params: GtagEventParams) => void`
- `declare var gtag: GtagCommand` — uses the typed alias instead of `any`

## Verification Results

| Check | Expected | Actual |
|-------|----------|--------|
| `declare var gtag.*any` count | 0 | 0 ✅ |
| `GtagCommand` occurrences | 2 | 2 ✅ |
| `ng build` exit code | 0 | 0 ✅ |
| `ng test` specs/failures | 175/0 | 175/0 ✅ |

## Commit

- `8c5b78d` — refactor: replace declare var gtag: any with typed GtagCommand interface (TYPE-01)

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- File modified: `src/app/services/analytics-service/analytics.service.ts` ✅
- Commit `8c5b78d` exists ✅
- Build and tests green ✅

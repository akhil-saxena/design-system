---
phase: 18
plan: "07"
subsystem: Avatar
tags: [avatar, presence, DS-79, additive-extension]
dependency_graph:
  requires: [18-04, 18-05]
  provides: [DS-79]
  affects: [src/Avatar.tsx, src/Avatar.test.tsx, src/Avatar.stories.tsx, src/index.ts]
tech_stack:
  added: []
  patterns: [inline-style-position-derivation, string-startsWith-endsWith-dispatch]
key_files:
  created: []
  modified:
    - src/Avatar.tsx
    - src/Avatar.test.tsx
    - src/Avatar.stories.tsx
    - src/index.ts
decisions:
  - "Use presencePosition.startsWith/endsWith to derive top/bottom/left/right — avoids a lookup table, stays type-safe"
  - "Default presencePosition=bottom-right in destructure — backward compatible, no conditional needed at call sites"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-02"
  tasks_completed: 2
  files_modified: 4
---

# Phase 18 Plan 07: DS-79 Presence — Avatar 4-corner presencePosition prop

Additive extension to the Avatar primitive: a `presencePosition` prop controls which corner the presence dot occupies (`top-right | bottom-right | top-left | bottom-left`), defaulting to `bottom-right` for full backward compatibility.

## What Was Built

- `AvatarPresencePosition` union type added to `Avatar.tsx` and exported via the barrel
- `presencePosition?: AvatarPresencePosition` added to `AvatarProps` (default `"bottom-right"`)
- Presence dot `<span>` style now derives `top`/`bottom`/`left`/`right` from the prop using `startsWith`/`endsWith` — unset axes are `undefined` (not `0`), so they don't appear in the DOM `style` attribute
- 7 new tests in `describe("presence position")`: default, all 4 corners explicit, no-presence guard, AvatarStack regression
- 3 new Storybook stories: `PresencePositions`, `PresenceAllStatuses`, `PresenceDark`

## Test Results

```
Test Files  1 passed (1)
     Tests  21 passed (21)   ← 14 pre-existing + 7 new
```

## Commits

| Hash | Message |
|------|---------|
| 024e681 | feat(18-07): DS-79 Presence — Avatar 4-corner presencePosition prop |

## Deviations from Plan

None — plan executed exactly as written. Biome formatter auto-sorted the stories import (type-first) and expanded the Avatar destructure to multi-line; both are style-only, no logic changes.

## Known Stubs

None.

## Threat Flags

None — pure UI prop extension, no new data flows or trust boundaries.

## TDD Gate Compliance

- RED gate: new tests written first; 3 of 7 failed (position tests) before implementation — confirmed failing
- GREEN gate: implementation written; all 21 tests pass
- REFACTOR: not needed; implementation is already minimal

## Self-Check: PASSED

- `src/Avatar.tsx` — exists, contains `presencePosition` in 6 locations
- `src/Avatar.test.tsx` — exists, 21 tests
- `src/index.ts` — `type AvatarPresencePosition` present
- `src/Avatar.stories.tsx` — `PresencePositions`, `PresenceAllStatuses`, `PresenceDark` stories present
- Commit `024e681` confirmed in git log

## PLAN COMPLETE

## Hotfix: Singularity starts at (0,0) instead of viewport center

Date: 2026-03-22
Severity: S2 (Major)
Reporter: Steve
Status: APPROVED — READY TO MERGE

### Problem

Before a game begins (during mode selection and any pre-game screen), the singularity
sprite is visible at the top-left corner of the viewport (0, 0) instead of being
centered or hidden. This is always reproducible on first load and after every game
restart.

### Root Cause

`container.x` and `container.y` in `src/systems/singularity.ts` are never initialised
— they default to PixiJS's `(0, 0)`. The ticker lerp that moves the singularity toward
the pointer only runs when `state === "playing"`, so the singularity sits at top-left
for the entire pre-game state.

Additionally, on game restart the container retains whatever position it was in when
the previous run ended, meaning a new game always starts with the singularity off-center.

### Fix

In `src/systems/singularity.ts`, `initSingularity()`:
After adding the container to the stage: `container.position.set(app.screen.width / 2, app.screen.height / 2)` — fixes the initial (0,0) position on first load. No state-change re-centering; the singularity lerps naturally from wherever it was on subsequent runs.

### Testing

- Load the game — singularity should appear at center, not top-left
- Complete a run and restart — singularity should snap to center at game start
- Move cursor during play — lerp toward pointer should still work normally

### Approvals

- [x] Fix reviewed by lead-programmer — APPROVED
- [x] Regression test passed (qa-tester) — checklist generated, ready to execute
- [x] Release approved (producer) — APPROVED

### Rollback Plan

Revert the two position assignments in `initSingularity()`. No state or data is affected —
purely a visual initialisation change.

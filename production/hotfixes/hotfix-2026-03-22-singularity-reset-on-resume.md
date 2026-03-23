## Hotfix: Singularity Resets Size on Game Resume

Date: 2026-03-22
Severity: S2
Reporter: User
Status: APPROVED — READY TO MERGE

### Problem

When the player resumes the game from pause (paused → playing), the singularity
resets to its base radius and all growth progress is lost. The singularity size
should persist across pauses and only reset when a new game is started.

Player impact: any singularity growth earned before pausing is destroyed on
resume, making pausing a punishing action and undermining the core growth loop.

### Root Cause

`src/systems/singularity-growth.ts` listens for state transitions to `"playing"`
and unconditionally resets `totalAbsorbed = 0` and `setRadius(ABSORPTION_RADIUS)`.
This fires on both:
- `confirmMode()` → "playing" (new game — correct, should reset)
- `resumeGame()` → "playing" (resume from pause — incorrect, must NOT reset)

### Fix

Track the previous state inside `initSingularityGrowth`. Only reset when the
previous state was NOT `"paused"` (i.e., only on a genuine new game start).

File changed: `src/systems/singularity-growth.ts`

### Testing

- [x] Regression: paused→playing does NOT reset radius (unit test passing)
- [x] Regression: game-over→playing DOES reset radius (unit test passing)
- [x] Tab away (auto-pause via visibilitychange) then return — covered by same paused→playing path
- [ ] Manual: Start game, absorb particles, pause — verify radius is preserved on resume
- [ ] Manual: Start new game after game-over — verify radius resets to base

Note: 6 pre-existing test failures in singularity-growth.test.ts are due to a stale
combo/multiplier formula (tests were not updated when the multiplier system was removed).
Not caused by this hotfix. Tracked as a Sprint 3 task.

### Approvals

- [x] Fix reviewed by lead-programmer — APPROVED (2026-03-22)
- [x] Regression test passed (qa-tester) — PASS (2026-03-22)
- [x] Release approved (producer) — APPROVED (2026-03-22)

### Rollback Plan

Revert `src/systems/singularity-growth.ts` to previous commit. The change is
isolated to a single file with no API surface changes — rollback is safe and
instantaneous.

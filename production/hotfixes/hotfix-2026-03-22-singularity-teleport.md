## Hotfix: Singularity Teleports to Tap/Click Location
Date: 2026-03-22
Severity: S2-Major
Reporter: User report via /hotfix
Status: AWAITING APPROVAL

### Problem
On tap, click, or touch events the singularity entity instantly jumps to the
input location rather than smoothly traveling to it. Continuous pointer drag
feels smooth (pointermove fires incrementally) but any discrete press/tap
causes an instant teleport, breaking the core interaction feel.

### Root Cause
Two issues combined:
1. `src/systems/input.ts` — only `pointermove` was registered. `pointerdown`
   events (taps, clicks) never updated `pointer.x/y`, so the singularity
   ignored them entirely — until a subsequent move registered the jump.
   In practice on touch devices, a tap with no drag fires pointerdown then
   pointerup with no pointermove, causing a teleport on the next frame.
2. `src/systems/singularity.ts:167-168` — the ticker assigned
   `container.x = pointer.x` directly (no lerp). Any discrete pointer update
   snaps the singularity in one frame.

### Fix
- `input.ts`: added `pointerdown` listener so taps/clicks immediately update
  the pointer position.
- `singularity.ts`: replaced direct assignment with a frame-rate-independent
  lerp using `1 - Math.pow(1 - MOVE_LERP, deltaTime)` (MOVE_LERP = 0.18).
  Exported `getSingularityPosition()` as the canonical visual position.
- `absorption.ts`: switched from `pointer.x/y` to `getSingularityPosition()`
  so physics origin always matches the visual position.

### Testing
- Mouse: move and click — singularity follows cursor smoothly, clicks no longer teleport
- Touch/PWA: tap to new location — singularity travels smoothly to tap target
- Edge case: rapid successive taps — singularity tracks correctly without sticking

### Approvals
- [x] Fix reviewed by lead-programmer — RC-1 and RC-2 resolved
- [x] Regression test checklist generated (qa-tester) — awaiting human execution
- [ ] Release approved (producer)

### Rollback Plan
Revert commits on this branch. The two changed lines in singularity.ts
(`container.x = pointer.x` / `container.y = pointer.y`) and the single
added listener in input.ts are the only changes — a one-command revert
restores previous behaviour.

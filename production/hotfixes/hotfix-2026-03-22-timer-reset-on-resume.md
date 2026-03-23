## Hotfix: Timer Resets on Resume
Date: 2026-03-22
Severity: S2
Reporter: Steve
Status: COMPLETE

### Problem
Resuming the game from the pause menu resets the session clock to its full initial
value (30s Standard, 15s Blitz) instead of resuming from where it left off.
Affects Standard and Blitz modes. Zen mode unaffected (no timer).

### Root Cause
`src/systems/clock.ts` registered an `onStateChange` listener that reset
`timeRemaining` on every transition to `"playing"` — including resume from pause.
The listener had no way to distinguish a new game start from a resume because
`onStateChange` only passed the new state, not the previous state.

### Fix
Two-file change:

1. **`src/state.ts`** — `StateListener` type updated to receive `(state, prev)`.
   `setState` now captures `prev` before mutating `current` and passes both to
   listeners. All existing listeners are unaffected (they ignore the second arg).

2. **`src/systems/clock.ts`** — Timer reset is now guarded:
   `if (state === "playing" && prev !== "paused")` — a resume transition no longer
   clobbers the remaining time.

### Testing
- Regression test added: `tests/unit/clock.test.ts` — "preserves time remaining
  when resuming from pause" (paused → playing transition leaves `timeRemaining`
  unchanged).
- `tests/unit/state.test.ts` updated to assert listener receives `(state, prev)`.
- Full suite: 36/36 pass.

### Approvals
- [x] Fix reviewed by lead-programmer — APPROVED
- [x] Regression test passed (qa-tester) — APPROVED WITH CONDITIONS (manual checklist required before prod merge)
- [x] Release approved (producer) — APPROVED, deploy immediately

### Rollback Plan
Revert commits on `hotfix/timer-reset-on-resume`. No data migrations; rollback
is safe at any point before merge.

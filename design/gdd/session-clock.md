---
status: reverse-documented
source: src/systems/clock.ts
date: 2026-03-22
---

# Session Clock

> **Note**: Reverse-engineered from implementation. Captures current behavior and confirmed design intent.

## Overview

The Session Clock counts down during Standard and Blitz modes, ending the run when it reaches
zero. Threshold crossings extend the clock in Standard mode. Zen mode disables the clock
entirely, making runs infinite.

## Player Fantasy

Racing against time, snatching seconds back from the void with each milestone. In Standard mode
the clock is a pressure valve that rewards sustained absorption. In Blitz it's a sprint with no
mercy. In Zen it doesn't exist — pure, uninterrupted flow.

## Detailed Rules

| Mode | Starting Time | Extensions | End Condition |
|------|--------------|------------|---------------|
| Standard | 30s | +5s per threshold (max 30s) | Clock reaches 0 |
| Blitz | 15s | None | Clock reaches 0 |
| Zen | N/A | N/A | Player quits (infinite) |

- Clock counts down only during `"playing"` state; pauses when game is paused or on game-over screen
- When the clock reaches 0, it triggers `game-over` state immediately
- Clock resets to the mode's starting value on each new game
- `addTime(n)` grants extra seconds; the result is capped at `CLOCK_DURATION` (30s) so the clock
  can never exceed its starting value even with multiple extensions

## Formulas

**Countdown (real-time, frame-rate independent):**
```
timeRemaining -= deltaMS / 1000
```

**Time extension (capped):**
```
timeRemaining = min(timeRemaining + seconds, CLOCK_DURATION)
```
- `CLOCK_DURATION = 30` — Standard starting time and hard cap
- `BLITZ_CLOCK_DURATION = 15` — Blitz starting time

**Display:** `timeRemaining.toFixed(1)` — one decimal place

## Edge Cases

- The clock cap (30s) means a full-health Standard clock cannot be extended; only clocks below
  30s benefit from threshold bonuses
- Blitz mode calls the same `addTime` code path but `threshold.ts` guards the call behind
  `getMode() === "standard"` — Blitz clocks never extend
- Zen mode: the ticker returns early if `getMode() === "zen"`; the `timeRemaining` variable
  still exists but is never decremented and never triggers game-over
- If `deltaMS` is very large (e.g. tab backgrounding), the clock may jump past 0; the `<= 0`
  check fires on the next tick and the final displayed value is clamped to 0

## Dependencies

| System | Role |
|--------|------|
| Game State Machine | `onStateChange` to reset clock on new game; `setState("game-over")` when clock expires |
| Threshold Events | Calls `addTime(5)` on each threshold crossing (Standard only) |
| HUD | Reads `getTimeRemaining()` each frame for display |

## Tuning Knobs

| Constant | Value | Effect |
|----------|-------|--------|
| `CLOCK_DURATION` | 30s | Standard starting time and extension ceiling |
| `BLITZ_CLOCK_DURATION` | 15s | Blitz starting time |
| `TIME_BONUS` | 5s | Seconds granted per threshold (in `threshold.ts`) |

Safe ranges: `CLOCK_DURATION` 20–60s; `BLITZ_CLOCK_DURATION` 10–20s; `TIME_BONUS` 3–10s.

## Acceptance Criteria

- [ ] Standard: clock displays `30.0` at game start and counts down in real time
- [ ] Standard: threshold crossing extends clock by 5s, capped at 30s
- [ ] Blitz: clock displays `15.0` at game start; no extension occurs
- [ ] Zen: no clock displayed; run continues indefinitely until player quits
- [ ] Clock freezes when game is paused
- [ ] Clock reaching 0 triggers game-over immediately
- [ ] Clock resets correctly on restart (same mode) and mode change

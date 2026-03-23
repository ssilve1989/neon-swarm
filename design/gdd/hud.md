---
status: reverse-documented
source: src/ui/hud.ts
date: 2026-03-22
---

# HUD (Heads-Up Display)

> **Note**: Reverse-engineered from implementation. Captures current behavior and confirmed design intent.

## Overview

The HUD displays score, clock, mode indicator, and pause button in a semi-transparent top strip
during play. It also manages the "+5s" toast animation, clock pulse, and a one-time SHIFT hint
for new players.

## Player Fantasy

All the information you need at a glance, out of the way. The clock pulsing cyan when time is
extended feels rewarding. Red urgency when time runs low creates tension. The HUD never obscures
the particle field.

## Detailed Rules

### Visibility

- Visible during `"playing"` and `"paused"` states
- Hidden during `"mode-select"` and `"game-over"`
- Values update (animations play) only during `"playing"`; paused state shows frozen values

### Layout (top strip, 80px tall)

| Element | Position | Notes |
|---------|----------|-------|
| Score label ("SCORE") | Top-left + 16px padding | Gray monospace, 11px |
| Score value | Below label | White bold monospace, 22px |
| Clock label ("TIME") | Top-center | Gray, 11px; hidden in Zen |
| Clock value | Below label, center | White bold, 22px; hidden in Zen |
| Mode badge ("STANDARD"/"BLITZ") | Below clock value | Dim, 10px; hidden in Zen |
| "ZEN" label | Center | Purple, 22px; Zen mode only |
| "+5s" toast | Floats above clock | Standard threshold only |
| Pause button | Top-right | 44×32px, rounded rect |
| SHIFT hint | Below strip, centered | First run only |

### Clock Urgency

- Below 5 seconds remaining: clock value turns red (`0xff4444`)
- During clock pulse animation: overrides urgency red with cyan (`0x00ffcc`)

### "+5s" Toast (Standard mode, threshold only)

- Appears at clock position, floats upward 40px over 900ms
- Fully opaque for first 200ms, then fades linearly over remaining 700ms
- Dismissed automatically at end of animation

### Clock Pulse (Standard mode, threshold only)

- Scale animates: 1.0 → 1.35 (peak at 120ms) → 1.0 (at 350ms)
- Clock text turns cyan for duration of pulse
- Peak is at 34% of the animation (120/350ms)

### Pause Controls

- Pause button (top-right): hover, pressed states; calls `pauseGame()` on click
- ESC key: pauses during `"playing"` state
- P key: pauses during `"playing"` state

### SHIFT Hint

- Shown once per device, on first tick of first play session
- Reads `localStorage["shift-hint-seen"]` to determine if seen
- Displays "SHIFT — cursor mode" below the HUD strip, centered, for 5 seconds
- Fades out over the last 1000ms of its duration
- Dismissed immediately if SHIFT is used (cursorMode becomes true)
- On dismiss: writes `localStorage["shift-hint-seen"] = "1"`
- All localStorage calls are wrapped in try/catch (private browsing safety)

## Formulas

**Clock pulse scale:**
```
peakAt = 120 / 350 ≈ 0.343
if progress < peakAt:
    scale = 1 + 0.35 * (progress / peakAt)
else:
    scale = 1.35 - 0.35 * ((progress - peakAt) / (1 - peakAt))
```

**Toast alpha:**
```
elapsed = toastProgress * TOAST_DURATION_MS
alpha = elapsed < 200 ? 1.0 : max(0, 1 - (elapsed - 200) / 700)
```

**SHIFT hint alpha:**
```
alpha = shiftHintTimer < 1000 ? shiftHintTimer / 1000 : 1.0
```

## Edge Cases

- **Zen mode:** clock, time label, and mode badge are hidden; "ZEN" label shown instead;
  toast and clock pulse never trigger (Standard guard)
- **Blitz mode:** clock shows but no toast or pulse on threshold (Standard guard)
- **localStorage unavailable:** try/catch ensures hint shows but is never persisted;
  hint will re-appear next session in private browsing
- **SHIFT hint re-check:** `shiftHintTriggered` flag prevents re-reading localStorage
  every frame; check happens exactly once on the first "playing" tick
- **Pause button during cursor mode:** SHIFT mode exposes the cursor precisely so the pause
  button can be clicked — intentional usability design

## Dependencies

| System | Role |
|--------|------|
| Clock | `getTimeRemaining()` for display |
| Scoring | `getScore()` for display |
| Threshold Events | `onThreshold` triggers toast + clock pulse (Standard), or flash-only (all) |
| Game State Machine | `getState()`, `getMode()`, `pauseGame()` |
| Input | `cursorMode` for SHIFT hint dismissal |

## Tuning Knobs

| Constant | Value | Effect |
|----------|-------|--------|
| `TOAST_DURATION_MS` | 900ms | Total toast animation length |
| `CLOCK_PULSE_MS` | 350ms | Clock scale animation duration |
| `CLOCK_URGENT_FILL` | `0xff4444` | Red color when time < 5s |
| `TOAST_COLOR` | `0x00ffcc` | Cyan for toast text and clock pulse |
| `SHIFT_HINT_DURATION_MS` | 5000ms | Auto-dismiss time for SHIFT hint |
| Clock urgent threshold | 5s | When clock turns red |
| Clock pulse peak scale | 1.35 | Maximum scale during pulse |

## Acceptance Criteria

- [ ] Score label and value display correctly and update in real time
- [ ] Clock counts down and displays to one decimal place in Standard and Blitz
- [ ] "ZEN" label shown in Zen mode; clock hidden
- [ ] Clock turns red when time < 5s (not during pulse)
- [ ] "+5s" toast floats up from clock on Standard threshold; fades correctly
- [ ] Clock pulses to 1.35× scale, turns cyan, on Standard threshold
- [ ] Pause button triggers pause; hover and pressed states render correctly
- [ ] ESC and P keys pause the game during play
- [ ] HUD hidden on mode-select and game-over screens
- [ ] HUD visible but frozen during pause
- [ ] SHIFT hint appears on first play, persists via localStorage, dismisses on SHIFT use

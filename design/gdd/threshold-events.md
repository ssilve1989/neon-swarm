---
status: reverse-documented
source: src/systems/threshold.ts
date: 2026-03-22
---

# Threshold Events

> **Note**: Reverse-engineered from implementation. Captures current behavior and confirmed design intent.

## Overview

Threshold Events are milestone rewards triggered at cumulative absorption counts. They grant
time extensions in Standard mode and broadcast a celebration signal (visual flash, audio chime)
to all modes. Each threshold fires exactly once per run.

## Player Fantasy

Hitting a threshold breaks the rhythm in the best way. The screen flashes. A chime rings. In
Standard mode you've bought yourself more time. It's a punctuation mark on sustained effort.

## Detailed Rules

- Three tiers, triggered at cumulative absorption counts: 50, 200, and 500
- Each tier fires **exactly once per run** (tracked via a `Set<ThresholdTier>`)
- Counter resets to 0 at the start of each new game
- **Standard mode:** each threshold grants +5s, capped at the 30s clock maximum
- **All modes:** fires the `onThreshold` event for audio and visual feedback

| Tier | Absorbs Required | Time Bonus (Standard) |
|------|-----------------|----------------------|
| 1 | 50 | +5s |
| 2 | 200 | +5s |
| 3 | 500 | +5s |

## Formulas

No computation beyond threshold comparison:
```
if totalAbsorbed >= thresholdValue AND tier not yet crossed:
    mark tier as crossed
    if mode === "standard": addTime(5)
    notify all listeners
```

**Total possible time granted (Standard):** 3 × 5s = 15s (if clock is below 30s for all three)

## Edge Cases

- **Multiple thresholds in one frame:** If a large absorption batch pushes the counter past
  multiple thresholds simultaneously (e.g. starting at 45, absorbing 200), all triggered tiers
  fire in ascending order within the same tick. Each fires the full celebration (flash, chime)
  independently.
- **Threshold at or above cap:** If the clock is already at 30s when a Standard threshold fires,
  `addTime` has no effect (clock stays at 30s). The visual/audio celebration still plays.
- **Blitz/Zen:** `addTime` is never called — the mode guard is inside `threshold.ts`
  (`if (getMode() === "standard")`). The celebration still fires in all modes.
- **Re-crossing:** Once a tier is added to `crossed`, it can never fire again in the same run.
  Even if the counter is somehow reset externally, the `Set` prevents duplicate events.

## Dependencies

| System | Role |
|--------|------|
| Absorption System | `onAbsorb(count)` drives the running total |
| Clock | `addTime(5)` — Standard mode time extension |
| Game State Machine | `onStateChange` resets counter and `crossed` Set on new game |
| Audio | Subscribes via `onThreshold` → plays clock-extension chime (Standard only) |
| Visual Feedback | Subscribes via `onThreshold` → triggers bloom flash |
| HUD | Subscribes via `onThreshold` → triggers "+5s" toast and clock pulse (Standard only) |

## Tuning Knobs

| Constant | Value | Effect | Safe Range |
|----------|-------|--------|------------|
| Tier 1 threshold | 50 absorbs | First milestone | 25–100 |
| Tier 2 threshold | 200 absorbs | Mid-run milestone | 100–400 |
| Tier 3 threshold | 500 absorbs | Late-run milestone | 300–1000 |
| `TIME_BONUS` | 5s | Seconds per threshold (Standard) | 3–10 |

Tier values currently have no gameplay difference beyond their fire order (no tier-specific
audio or visual differentiation yet — all tiers use the same flash and chime).

## Acceptance Criteria

- [ ] First threshold fires at exactly 50 cumulative absorbs
- [ ] Second threshold fires at exactly 200 cumulative absorbs
- [ ] Third threshold fires at exactly 500 cumulative absorbs
- [ ] Each threshold fires exactly once per run, regardless of subsequent absorptions
- [ ] Standard mode: clock extends by 5s on each crossing; cannot exceed 30s
- [ ] Blitz and Zen: no clock extension; celebration still plays
- [ ] All three tiers reset on new game
- [ ] If two thresholds crossed in one frame, both celebrations fire

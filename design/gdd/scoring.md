---
status: reverse-documented
source: src/systems/scoring.ts
date: 2026-03-22
---

# Scoring

> **Note**: Reverse-engineered from implementation. Captures current behavior and confirmed design intent.

## Overview

Score is a raw count of absorbed particles. One particle absorbed equals one point. There is no
multiplier, no combo bonus, and no decay — score only ever increases. This was an intentional
simplification made in Sprint 2 (combo/multiplier system removed).

## Player Fantasy

Every particle you consume counts. The number growing on screen is a direct readout of your
output. No mental math, no multiplier to track — just momentum made visible.

## Detailed Rules

- Score increments by the number of particles absorbed each frame (batch, not per-particle)
- Score resets to 0 on new game (`"playing"` state transition)
- Score is displayed live in the HUD during the run
- Score is shown on the game-over screen at run end
- Score is not persisted between sessions (High Score system is pending)
- All three modes (Standard, Blitz, Zen) use the same scoring formula

## Formulas

**Score accumulation:**
```
score += absorbedCount   (each absorption event)
```

**Display:** `score.toLocaleString()` — locale-formatted integer (e.g. `"1,234"`)

Example progression:
| Total absorbed | Score |
|---------------|-------|
| 50 | 50 |
| 200 | 200 |
| 500 | 500 |
| 1,000 | 1,000 |

## Edge Cases

- Score cannot go negative (no subtraction mechanism exists)
- If no particles are absorbed in a frame, `onAbsorb` is not fired and score does not change
- Score is an integer in practice but stored as a JS `number` — no overflow risk at realistic
  particle counts (max ~10,000 particles × 60s = 600,000 points)
- Zen mode has no clock pressure; scores can be arbitrarily high over a long session

## Dependencies

| System | Role |
|--------|------|
| Absorption System | `onAbsorb(count)` drives score accumulation |
| Game State Machine | `onStateChange` resets score on new game |
| HUD | Reads `getScore()` each frame for live display |
| Game Over Screen | Reads `getScore()` on game-over to display final score |

## Tuning Knobs

None — score is a direct count. Future extension points:
- Per-particle-type point value (e.g. Time particles worth 2pt)
- Mode-specific multipliers

## Acceptance Criteria

- [ ] Score starts at 0 at the beginning of each game
- [ ] Score increments correctly as particles are absorbed
- [ ] Score is displayed in the HUD and updates in real time
- [ ] Score is shown on the game-over screen
- [ ] Score resets to 0 on restart (same mode) and mode change
- [ ] Score does not change while paused

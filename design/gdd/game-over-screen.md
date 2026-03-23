---
status: reverse-documented
source: src/ui/game-over-screen.ts
date: 2026-03-22
---

# Game Over Screen

> **Note**: Reverse-engineered from implementation. Captures current behavior and confirmed design intent.

## Overview

The Game Over Screen appears after a run ends, displays the final score, and gives the player
two choices: play again with the same mode, or return to mode selection to change mode.

## Player Fantasy

A clean moment of reflection. Your score front-and-center. One action to go again. No friction
between "just failed" and "playing again."

## Detailed Rules

### Appearance

- Overlays the game canvas with a semi-transparent black background (alpha 0.78)
- Fades in via alpha lerp toward 1.0 (`alpha += (1 - alpha) * 0.12` per frame)
- Content: "GAME OVER" title, final score, restart prompt, mode-change prompt

### Player Actions

| Action | Input | Result |
|--------|-------|--------|
| Play again | Click overlay / Space / Enter | Restart with same mode |
| Change mode | Click mode-change text / M key | Return to mode-select |

- Input is ignored until overlay `alpha >= 0.5` (prevents accidental restart during fade-in)
- On action: `targetAlpha` set to 0; overlay fades out; `eventMode = "none"` immediately
  (blocks further input during fade-out); state transition fires

### Text Content

| Element | Text | Style |
|---------|------|-------|
| Title | "GAME OVER" | 52px white bold monospace |
| Score | "SCORE  {n.toLocaleString()}" | 24px gray monospace |
| Restart prompt | "CLICK OR PRESS SPACE TO PLAY AGAIN" | 14px dim monospace |
| Mode prompt | "CLICK OR PRESS M TO CHANGE MODE" | 12px dimmer monospace |

Layout: vertically centered on screen, title at mid−70px, score at mid, restart at mid+60px,
mode prompt at mid+86px.

## Formulas

**Fade-in:**
```
overlay.alpha += (targetAlpha - overlay.alpha) * 0.12
```
- Approaches target asymptotically; effectively fully opaque after ~30 frames (~500ms)

**Input guard:**
```
if (overlay.alpha < 0.5) return  ← ignores all input
```

## Edge Cases

- **Accidental restart during fade:** the 0.5 alpha guard means the player must wait ~10 frames
  before input is accepted. Prevents a click at game-over from immediately restarting.
- **Mode-change text stopPropagation:** clicking the mode prompt fires `handleChangeMode` and
  stops event bubbling — prevents the overlay's `pointerdown` handler from also firing
  `handleRestart`.
- **M key guard:** keyboard handler checks `if (overlay.alpha < 0.5) return` — same fade-in
  guard as pointer input.
- **Zen mode game-over:** Zen runs only end if the player somehow triggers game-over externally
  (no clock). In practice Zen is infinite; this screen is not normally reached in Zen mode.
- **Score on display:** `getScore()` is called at the moment the state changes to `"game-over"`,
  capturing the final score. Score cannot change after game-over.

## Dependencies

| System | Role |
|--------|------|
| Game State Machine | `onStateChange` shows/hides overlay; `restartGame()`, `changeMode()` for actions |
| Scoring | `getScore()` for final score display |

## Tuning Knobs

| Value | Current | Effect |
|-------|---------|--------|
| Fade-in speed | 0.12 | Higher = faster fade; lower = slower |
| Input guard threshold | 0.5 alpha | Higher = longer wait before input accepted |
| Background alpha | 0.78 | Overlay darkness |

## Acceptance Criteria

- [ ] Screen appears after run ends (Standard, Blitz; not normally in Zen)
- [ ] Displays correct final score in locale-formatted style
- [ ] Click anywhere on overlay / Space / Enter restarts with same mode
- [ ] Click mode-change text / M returns to mode-select
- [ ] No input accepted during first ~10 frames of fade-in (alpha < 0.5)
- [ ] Clicking mode-change text does not also trigger restart
- [ ] Screen is not visible during play, pause, or mode-select
- [ ] Screen fades out on action before state transitions

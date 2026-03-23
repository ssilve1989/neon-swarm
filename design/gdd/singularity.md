---
status: reverse-documented
source: src/systems/singularity.ts, src/systems/input.ts
date: 2026-03-22
---

# Singularity

> **Note**: Reverse-engineered from implementation. Captures current behavior and confirmed design intent.

## Overview

The Singularity is the player's avatar — a black hole visual that follows the cursor. It is the
sole actor in the game world: everything flows toward it. The player steers it through the
particle field to absorb as many particles as possible.

## Player Fantasy

You are a cosmic force of gravity, pulling the universe into yourself. The black hole grows
visibly as you consume particles. Its hot spot changes color to reflect what you've absorbed.
Control feels effortless — the singularity glides, not snaps.

## Detailed Rules

- The singularity follows the cursor with an exponential lerp (frame-rate independent)
- It starts centered on screen at the beginning of each game
- It does not teleport or reset position on new game — it stays where the run ended
- **Cursor mode (SHIFT):** holding SHIFT freezes the singularity in place and reveals the
  cursor. This is a usability feature — it lets players click the Pause button or other UI
  elements without the singularity moving. Released SHIFT restores normal tracking.
- The cursor is hidden during play and restored on pause or menu screens
- Cursor mode is reset on every state transition
- The accretion disk rotates continuously during play
- The hot spot tints to the dominant color of recently absorbed particles (slow lerp)

### Visual Layers (back to front)

| Layer | Description |
|-------|-------------|
| Lens halo | 256px radial blue glow; additive blend |
| Accretion disk ring | 128px ring with blue→cyan→white→orange→red gradient; additive blend; rotates |
| Hot spot | 56px white glow offset 33px from disk center; tinted to absorbed color; rotates with disk |
| Photon sphere rim | 64px soft cyan ring at event horizon boundary; additive blend |
| Event horizon void | 52px solid black circle; normal blend; occludes all layers behind it |

## Formulas

**Position lerp (frame-rate independent):**
```
t = 1 - (1 - MOVE_LERP)^deltaTime
x += (target.x - x) * t
y += (target.y - y) * t
```
- `MOVE_LERP = 0.05` — fraction of remaining distance closed per frame at 60fps

**Hot spot color lerp (per RGB channel, per frame):**
```
cur.r += (tgt.r - cur.r) * LERP   (LERP = 0.03)
```
- Slow lerp keeps the color transition smooth; does not snap to new color instantly

**Influence radius:**
```
influenceRadius = absorptionRadius * INFLUENCE_RATIO   (INFLUENCE_RATIO = 4.0)
```
- The influence radius always scales proportionally with the absorption radius

## Edge Cases

- SHIFT key only affects behavior during `"playing"` state; ignored on pause/menu
- If the player holds SHIFT when the game ends, cursor mode is cleared on state transition
- Position is not bounded; the singularity can be moved fully off-screen (rare in practice;
  the influence zone extends 120px, so off-screen singularity still affects nearby particles)
- At exactly `dist = 0` between a particle and singularity center, division by zero is
  possible in the absorption force calculation — mitigated by the event horizon void sprite
  which occludes the dead center

## Dependencies

| System | Role |
|--------|------|
| Input System | Provides `pointer` (cursor position) and `cursorMode` (SHIFT state) |
| Singularity Growth | Calls `setRadius()` to grow the singularity over time |
| Absorption System | Reads `getRadius()`, `getInfluenceRadius()`, `getSingularityPosition()`; calls `setHotSpotColor()` |
| Game State Machine | `onStateChange` used to manage cursor visibility and reset cursor mode |

## Tuning Knobs

| Constant | Value | Effect |
|----------|-------|--------|
| `MOVE_LERP` | 0.05 | Responsiveness; higher = snappier, lower = floatier |
| `ROTATION_SPEED` | 0.015 rad/tick | Disk spin rate |
| `LERP` | 0.03 | Hot spot color response speed |
| `EVENT_HORIZON_RADIUS` | 20px | Visual void radius |
| `ABSORPTION_RADIUS` | 30px | Starting absorption zone radius |
| `INFLUENCE_RADIUS` | 120px | Starting gravity field radius |

## Acceptance Criteria

- [ ] Singularity follows cursor smoothly at 60fps with no visible teleport or stutter
- [ ] Holding SHIFT freezes singularity position; cursor becomes visible
- [ ] Releasing SHIFT resumes normal tracking immediately
- [ ] Hot spot color slowly shifts to match the color of recently absorbed particles
- [ ] Accretion disk rotates continuously during play; frozen during pause/game-over
- [ ] Cursor is hidden during play, visible on all other screens
- [ ] Singularity starts centered on screen at game start

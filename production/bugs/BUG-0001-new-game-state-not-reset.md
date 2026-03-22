# Bug Report

## Summary
**Title**: New game after game-over does not reset particle positions or velocities
**ID**: BUG-0001
**Severity**: S2-Major
**Priority**: P1-Immediate
**Status**: Open
**Reported**: 2026-03-22
**Reporter**: Steve

## Classification
- **Category**: Gameplay
- **System**: State reset / game restart flow
- **Frequency**: Always
- **Regression**: Unknown — likely present since game-modes feature was added (commit `c731935`)

## Environment
- **Build**: `b85d20c`
- **Platform**: All
- **Scene/Level**: Main game loop
- **Game State**: Post game-over, triggering restart via game-over screen

## Reproduction Steps
**Preconditions**: Complete a game and reach the game-over screen

1. Play a game and move the singularity around to absorb particles (accelerating nearby particles with gravity/swirl forces)
2. Let the clock run out — game-over screen appears
3. Click / press Space to "Play Again"

**Expected Result**: A fresh game starts with particles respawned at random positions with fresh velocities
**Actual Result**: Particles retain their positions and velocities from the previous game — particles that were accelerated toward the singularity continue on those trajectories into the new game

## Technical Context

**Root cause**: `src/systems/particles.ts` has no `onStateChange` listener. When `restartGame()` fires and state transitions to `"playing"`, no bulk respawn occurs. Two compounding factors make this worse:

1. **Velocities carry over** — `absorption.ts` applies gravity and swirl forces to `vx[]`/`vy[]` for any particle inside the influence radius. These modified velocities are never reset on restart. Particles that were spiralling into the singularity continue that motion at the start of the new game.

2. **Particles keep moving during game-over** — the `particles.ts` ticker runs unconditionally with no `getState()` guard. During the entire time the game-over overlay is displayed, all particles continue drifting from wherever they were when the run ended.

By contrast, `absorption.ts` does guard on `getState() !== "playing"`, so gravity/swirl forces correctly stop during game-over — but this only prevents further velocity changes, it does not undo the accumulated velocities.

- **Affected files**:
  - `src/systems/particles.ts` — missing `onStateChange` handler to respawn all particles on `"playing"`

## Evidence
- `particles.ts:60–77`: ticker has no `getState()` guard — runs every frame regardless of game state
- `particles.ts`: no import of `onStateChange`, no reset logic anywhere in the file
- `absorption.ts:67–79`: `vx[i]` / `vy[i]` mutated by gravity/swirl during play; never zeroed on restart

## Fix Recommendation
Add an `onStateChange` handler in `initParticles()` that calls `spawn(i)` for every particle when state transitions to `"playing"`. This is consistent with how `scoring.ts`, `clock.ts`, and `combo.ts` already self-reset via the same pattern.

## Related Issues
- Design doc: `design/gdd/game-state-machine.md`
- Feature commit: `c731935 feat(game-modes): add mode selection, pause system, and mode-aware gameplay`

## Additional: Threshold state not reset
A secondary issue was also identified: `src/systems/threshold.ts` clears its `crossed` Set only via `onComboBreak`. Since `combo.ts` resets `multiplier`/`timer` directly on restart without firing `breakListeners`, `crossed` is never cleared — threshold time bonuses (Standard/Blitz modes) will not fire in any game after the first. This may warrant a separate bug report.

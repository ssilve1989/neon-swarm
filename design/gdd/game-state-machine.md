# Game State Machine

> **Status**: Approved
> **Author**: design session
> **Last Updated**: 2026-03-22
> **Implements Pillar**: Zero Friction / Feel over Mechanics

## Overview

The Game State Machine governs the lifecycle of a Neon Swarm session — from mode selection through active play, game over, and restart. It is not directly visible to the player; rather, it controls which systems are active and which screens are rendered at any given moment. The GSM stores the player's chosen game mode (Standard, Blitz, or Zen) and makes it available as a read-only value to every dependent system (Session Clock, Scoring, Threshold Events). State transitions are event-driven: the game starts when the player confirms a mode, ends when the clock hits zero, when the player pauses and chooses "End Run" (Standard/Blitz), or when the player uses the HUD quit button (Zen), and resets immediately on restart without reloading the page.

## Player Fantasy

The Game State Machine has no direct player fantasy — it is invisible infrastructure. Its contribution to player experience is negative space: the game is never in a broken or ambiguous state, it starts the moment a mode is confirmed, and after a run ends the restart path is one action away with no loading screens or page reloads. The feeling it enables is *immediacy* — the game always feels snappy and responsive at its seams. A fumbled run should never feel punishing to reset; the cost of "one more try" must be near zero.

## Detailed Design

### Core Rules

1. The GSM is the single source of truth for the current game state and active mode.
2. No system modifies GSM state directly — all transitions are triggered via named events dispatched to the GSM.
3. The GSM emits a `stateChanged(newState, prevState)` event on every transition; dependent systems subscribe and react.
4. `mode` is set once per session when the `MODE_SELECT → PLAYING` transition fires. It is read-only until the next `MODE_SELECT` entry.
5. Gameplay systems (Session Clock, Particle System, Absorption System, etc.) are active only in `PLAYING` and `PAUSED`. `PAUSED` freezes their tick loop but does not destroy them.
6. `GAME_OVER` persists until the player explicitly acts — the GSM never auto-exits `GAME_OVER`.
7. Page Visibility API changes (tab hidden/visible) auto-trigger `PAUSE`/`RESUME` while in `PLAYING`. The GSM owns the `document.visibilitychange` listener and dispatches `EVT_PAUSE`/`EVT_RESUME` itself.
8. Systems self-manage their active/frozen state by subscribing to `stateChanged(newState, prevState)`. The GSM does not call `pause()` or `resume()` on individual systems and does not maintain a system registry. Each system is responsible for responding to the state it cares about.

### States and Transitions

| State | Entry Condition | Exit Condition | Behavior |
|-------|----------------|----------------|----------|
| `MODE_SELECT` | App init; `EVT_BACK_TO_MENU`; `EVT_QUIT_TO_MENU` | `EVT_MODE_CONFIRMED(mode)` | Mode picker rendered; gameplay systems inactive |
| `PLAYING` | `EVT_MODE_CONFIRMED(mode)`; `EVT_RESTART_SAME_MODE`; `EVT_RESUME` | `EVT_CLOCK_EXPIRED`; `EVT_PLAYER_QUIT`; `EVT_PAUSE` | Gameplay systems active; HUD visible |
| `PAUSED` | `EVT_PAUSE` from PLAYING; page hidden | `EVT_RESUME`; `EVT_PLAYER_QUIT`; `EVT_QUIT_TO_MENU` | Gameplay systems frozen; pause overlay shown |
| `GAME_OVER` | `EVT_CLOCK_EXPIRED`; `EVT_PLAYER_QUIT` | `EVT_RESTART_SAME_MODE`; `EVT_BACK_TO_MENU` | Stats/score displayed; gameplay systems inactive |

**Events reference:**

| Event | Fired by | Effect |
|-------|----------|--------|
| `EVT_MODE_CONFIRMED(mode)` | Mode Selection UI | `MODE_SELECT → PLAYING`; stores selected mode |
| `EVT_CLOCK_EXPIRED` | Session Clock | `PLAYING → GAME_OVER` (Standard/Blitz only) |
| `EVT_PLAYER_QUIT` | HUD quit button (Zen, from PLAYING); Pause menu "End Run" (Standard/Blitz, from PAUSED) | `PLAYING → GAME_OVER` or `PAUSED → GAME_OVER` |
| `EVT_PAUSE` | Player action or Page Visibility API | `PLAYING → PAUSED` |
| `EVT_RESUME` | Player action | `PAUSED → PLAYING` |
| `EVT_QUIT_TO_MENU` | Pause overlay "Quit without stats" | `PAUSED → MODE_SELECT`; clears stored mode |
| `EVT_RESTART_SAME_MODE` | Game Over Screen | `GAME_OVER → PLAYING`; reuses stored mode |
| `EVT_BACK_TO_MENU` | Game Over Screen | `GAME_OVER → MODE_SELECT`; clears stored mode |

### Interactions with Other Systems

| System | Direction | Interface |
|--------|-----------|-----------|
| Mode Selection UI (#17) | Mode Sel → GSM | Fires `EVT_MODE_CONFIRMED(mode)` |
| Session Clock (#7) | GSM → Clock | Subscribes to `stateChanged`; starts on `PLAYING` entry, freezes on `PAUSED`, reads `mode` to configure duration |
| Scoring (#8) | GSM → Scoring | Reads `mode` at session start to configure metric: total score (Standard/Blitz) vs. peak multiplier (Zen) |
| Combo & Multiplier (#6) | GSM → Combo | Resets on every `PLAYING` entry |
| Threshold Events (#11) | GSM → Thresh. | Active only in `PLAYING` state |
| Particle System (#4) | GSM → Particles | Starts on `PLAYING`; frozen on `PAUSED`; cleared on `GAME_OVER` |
| HUD (#14) | GSM → HUD | Renders based on current state; shows quit button in Zen mode only |
| Game Over Screen (#15) | GSM → GO Screen | Activated on `GAME_OVER` entry; fires `EVT_RESTART_SAME_MODE` or `EVT_BACK_TO_MENU` |
| Input System (#2), Absorption System (#9), Singularity Growth (#10), Audio (#12), Visual Feedback (#13) | GSM → Systems | All subscribe to `stateChanged`; self-manage active/frozen state per Core Rule #8. None receive mode-specific data — state signal is sufficient. |

## Formulas

The Game State Machine contains no mathematical formulas. It is a pure state-transition system driven by events. All numeric values (session duration, multiplier thresholds, score calculations) are owned by their respective systems and provided to those systems via the GSM's read-only `mode` property. No calculations are performed within the GSM itself.

**Mode data model** *(provisional — exact TypeScript interface defined during implementation)*:

```
type GameMode    = 'standard' | 'blitz' | 'zen'
type GameStateId = 'MODE_SELECT' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'

interface GSMState {
  currentState : GameStateId
  mode         : GameMode | null   // null only in MODE_SELECT before confirming
}
```

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|----------|------------------|-----------|
| `EVT_CLOCK_EXPIRED` fires in Zen mode | Ignored — Session Clock is disabled in Zen; this event should never be emitted in Zen, but if it is, the GSM discards it | Clock is not active in Zen mode |
| `EVT_PLAYER_QUIT` fires in Standard/Blitz from `PLAYING` (not `PAUSED`) | Ignored — `EVT_PLAYER_QUIT` is only a valid transition from `PLAYING` in Zen mode; Standard/Blitz players must pause first | Prevents accidental mid-run quit without an intermediate step |
| `EVT_PAUSE` fires in `MODE_SELECT` or `GAME_OVER` | Ignored — `PAUSED` is only reachable from `PLAYING` | No active game to pause |
| `EVT_RESUME` fires while not in `PAUSED` | Ignored (no-op) | Defensive guard |
| Page visibility changes during `MODE_SELECT` or `GAME_OVER` | Ignored — auto-pause only applies in `PLAYING` | Nothing time-sensitive is running |
| Page visibility changes during `PAUSED` | Ignored — game is already paused | Already handled |
| `EVT_RESTART_SAME_MODE` fires while `mode` is null | Should never occur; if it does, log a warning and transition to `MODE_SELECT` instead | Defensive; prevents a null-mode session |
| Player closes tab mid-game | Game state is lost; no persistence for in-progress runs | Acceptable for arcade format; session stats are only saved on `GAME_OVER` entry |

## Dependencies

| System | Direction | Nature |
|--------|-----------|--------|
| Mode Selection UI (#17) | Mode Sel → GSM | Hard — GSM cannot enter `PLAYING` without a mode confirmation from this system |
| Session Clock (#7) | GSM → Clock | Hard — Clock cannot configure duration or start without mode and state signals from GSM |
| Scoring (#8) | GSM → Scoring | Hard — Scoring metric (total score vs. peak multiplier) is determined by `mode` |
| Combo & Multiplier (#6) | GSM → Combo | Hard — Must reset on every `PLAYING` entry |
| Threshold Events (#11) | GSM → Thresh. | Hard — Must only fire while in `PLAYING` state |
| Particle System (#4) | GSM → Particles | Hard — Must start, freeze, and clear in sync with state transitions |
| HUD (#14) | GSM → HUD | Soft — HUD can render without GSM signals but won't show correct state-dependent UI (quit button, pause overlay) |
| Game Over Screen (#15) | GSM → GO Screen | Hard — Game Over Screen has no activation trigger without GSM's `GAME_OVER` state signal |
| High Score (#16) | GSM → High Score | Soft — High Score reads `mode` to bucket personal bests; could default to `'standard'` if mode is missing |

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|-----------|--------------|------------|-------------------|-------------------|
| `autoResumePausedOnTabVisible` | `false` | boolean | `true`: game auto-resumes when tab regains focus (no player action needed) | `false` (default): player must explicitly unpause after a tab switch |

All other timing and numeric values (clock duration, multiplier thresholds) are owned by Session Clock and Combo & Multiplier respectively. The GSM contains no other configurable values.

## Visual/Audio Requirements

[To be designed]

## UI Requirements

[To be designed]

## Acceptance Criteria

- [ ] App initializes directly in `MODE_SELECT` — no blank screen or loading state visible to player
- [ ] Confirming a mode transitions to `PLAYING` and activates gameplay systems within one frame
- [ ] `EVT_CLOCK_EXPIRED` correctly transitions to `GAME_OVER` in Standard and Blitz; is a no-op in Zen
- [ ] `EVT_PLAYER_QUIT` from `PLAYING` transitions to `GAME_OVER` in Zen; is ignored in Standard/Blitz from `PLAYING`
- [ ] `EVT_PLAYER_QUIT` from `PAUSED` transitions to `GAME_OVER` in Standard/Blitz
- [ ] `EVT_QUIT_TO_MENU` from `PAUSED` transitions to `MODE_SELECT` and clears stored mode
- [ ] Tab-hiding while in `PLAYING` auto-transitions to `PAUSED` via Page Visibility API
- [ ] `EVT_RESTART_SAME_MODE` from `GAME_OVER` restarts a full session with the same mode without page reload
- [ ] `EVT_BACK_TO_MENU` from `GAME_OVER` returns to `MODE_SELECT` with no stale game state
- [ ] Gameplay systems do not tick while in `PAUSED` or `GAME_OVER`
- [ ] All unknown events in all states are silently ignored — no invalid transition is possible
- [ ] `mode` is never null when in `PLAYING`, `PAUSED`, or `GAME_OVER`
- [ ] All state transitions complete in < 1ms (pure logic, no async operations)

## Open Questions

| Question | Owner | Resolution Needed By |
|----------|-------|---------------------|
| How is `EVT_PAUSE` triggered by the player on mobile? Options: dedicated pause button in HUD, double-tap, or auto-only (Page Visibility API, no manual pause on touch). | UX | Before HUD design (#14) |
| Should `PAUSED` show a semi-transparent overlay on top of the frozen game, or a dedicated full-screen pause state? | Art / UX | Before HUD and Mode Selection design |
| Should `EVT_RESTART_SAME_MODE` do a full system teardown + reinit, or reset systems in-place? This determines whether gameplay systems need a `reset()` method separate from `destroy()`. | Engineering | Before implementation of any gameplay system |

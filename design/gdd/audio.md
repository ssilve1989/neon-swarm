---
status: reverse-documented
source: src/systems/audio.ts
date: 2026-03-22
---

# Audio

> **Note**: Reverse-engineered from implementation. Captures current behavior and confirmed design intent.

## Overview

The Audio system provides ambient background music and a procedural clock-extension chime.
BGM is delivered via an MP3 asset streamed through the HTML Audio API; sound effects use the
Web Audio API for sample-accurate scheduling. See ADR-003 for the rationale behind this hybrid
approach.

## Player Fantasy

The ambient track sets a cosmic, drifting mood. The ascending chime on threshold crossing is
a reward signal — something good just happened. It confirms momentum without demanding attention.

## Detailed Rules

### Background Music (BGM)

- Asset: `assets/audio/nebula-drift.mp3`, looping
- Volume: 0.4 (fixed)
- Starts from the beginning (`currentTime = 0`) on each new game (`"playing"` state)
- Pauses on `"paused"`, `"game-over"`, and `"mode-select"` states
- Also pauses when the browser tab is hidden (Page Visibility API)
- Resumes on tab restore only if game is still in `"playing"` state
- BGM is created at module load; playback begins on first state transition to `"playing"`

### Clock Extension Chime

- Fires on `onThreshold` events **in Standard mode only**
- Procedurally synthesized: two oscillators summed to `AudioContext.destination`
- `AudioContext` is lazily created on first chime trigger (autoplay policy compliance)

**Oscillator 1 — Sine body:**
- Frequency: C5 (523Hz) → G5 (784Hz) over 200ms
- Gain envelope: 0 → 0.12 in 10ms, hold to 90ms, exponential decay to 0.0001 at 350ms

**Oscillator 2 — Triangle shimmer (one octave up, 30% gain):**
- Frequency: C6 (1046Hz) → G6 (1568Hz) over 200ms
- Gain envelope: 0 → 0.036 in 10ms, hold to 90ms, exponential decay to 0.0001 at 350ms

Total chime duration: 350ms

## Formulas

No mathematical formulas beyond Web Audio API scheduling:
```
osc.frequency.setValueAtTime(523, now)
osc.frequency.linearRampToValueAtTime(784, now + 0.2)
gain.gain.linearRampToValueAtTime(0.12, now + 0.01)
gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
```

## Edge Cases

- **Autoplay policy:** `bgm.play()` returns a Promise; rejection is silently caught
  (`catch(() => undefined)`). BGM may not play until the user has interacted with the page —
  which is guaranteed by the mode-select interaction before any `"playing"` state.
- **Tab backgrounding:** if the player switches tabs during a Zen run (which can be very long),
  BGM pauses correctly. On return, `document.visibilityState` is `"visible"` and BGM resumes.
- **Chime in Blitz/Zen:** the `onThreshold` listener fires in all modes, but the chime is gated
  by `if (getMode() === "standard")`. No chime plays in Blitz or Zen on threshold events.
  (Thresholds still trigger visual flash in all modes — only audio is Standard-only.)
- **Multiple rapid thresholds:** each chime creates new `OscillatorNode` and `GainNode` objects
  scheduled to `AudioContext.currentTime`. Multiple chimes can overlap if thresholds fire in
  rapid succession; they sum at the destination without clipping concern at these gain levels.

## Dependencies

| System | Role |
|--------|------|
| Threshold Events | `onThreshold` triggers chime (Standard mode) |
| Game State Machine | `onStateChange` controls BGM play/pause; `getMode()` gates chime |
| `assets/audio/nebula-drift.mp3` | BGM asset (required build artifact) |

## Tuning Knobs

| Parameter | Value | Effect |
|-----------|-------|--------|
| BGM volume | 0.4 | Ambient level; lower if effects feel buried |
| Chime osc1 gain | 0.12 | Body loudness |
| Chime osc2 gain | 0.036 | Shimmer loudness (should stay ~30% of osc1) |
| Chime start freq | C5 / C6 (523/1046Hz) | Starting pitch |
| Chime end freq | G5 / G6 (784/1568Hz) | Ending pitch (a fifth up) |
| Chime duration | 350ms | Total sound length |

## Acceptance Criteria

- [ ] BGM plays immediately when a new game starts
- [ ] BGM pauses on pause, game-over, and mode-select screens
- [ ] BGM pauses when the browser tab is hidden
- [ ] BGM resumes when the tab is restored (if still playing)
- [ ] BGM restarts from the beginning on each new game
- [ ] Chime plays on threshold crossing in Standard mode
- [ ] No chime in Blitz or Zen mode on threshold crossing
- [ ] No console errors from blocked autoplay

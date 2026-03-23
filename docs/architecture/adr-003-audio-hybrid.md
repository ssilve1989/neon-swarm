# ADR-003: Audio — HTML Audio Element for BGM, Web Audio API for Effects

**Status**: Accepted
**Date**: 2026-03-22
**Affects**: `src/systems/audio.ts`

## Context

The game requires two distinct categories of audio:

1. **Background music (BGM)** — a looping ambient track that plays throughout
   a run, pauses on game-over and tab-hide, and restarts on new game.
2. **Sound effects** — short, precisely timed events triggered by gameplay
   (e.g. clock extension chime at threshold crossings). These require exact
   scheduling and synthesis-level control over waveform, frequency, and
   envelope.

Both must comply with browser autoplay policy: audio cannot start without a
prior user gesture.

## Decision

Use a **hybrid approach**:

- **BGM**: `HTMLAudioElement` (`new Audio(...)`) streaming `nebula-drift.mp3`.
  Simple API (`play()`, `pause()`, `loop`, `volume`) is sufficient for a
  single looping track. The element is created once at module load; playback
  starts on the first `"playing"` state transition (user has already interacted
  via the mode-select screen).

- **Sound effects**: Web Audio API (`AudioContext`) with programmatically
  created oscillators, gain nodes, and scheduled parameter ramps. The
  `AudioContext` is **lazily initialised** on first use (via `getCtx()`) to
  satisfy autoplay policy — the context is not created until a gameplay event
  fires, which always follows a user gesture.

Current effects:
- **Clock extension chime**: dual oscillator (sine C5→G5 + triangle C6→G6),
  35ms attack, 350ms total duration, scheduled via `AudioContext.currentTime`.

## Alternatives Considered

**Web Audio API for BGM and effects (fully procedural)**
Rejected for BGM. Generating a musically coherent ambient track procedurally
requires significant DSP complexity (additive synthesis, reverb, filtering)
that is out of scope. An MP3 achieves the same result in minutes. The
"no audio files" preference applies to *sound effects*, not music assets —
effects benefit from procedural generation (exact timing, parameter control);
music does not.

**HTMLAudioElement for both BGM and effects**
Rejected for effects. `HTMLAudioElement` cannot schedule audio at sub-frame
precision — latency is indeterminate and varies by browser. Clock extension
feedback must land within the same frame as the threshold event. Web Audio API
scheduling (via `AudioContext.currentTime`) is sample-accurate.

**Howler.js or Tone.js**
Rejected. Adding a library for audio management introduces dependency weight
for functionality already available natively. The audio surface is small (one
BGM track, one effect). A library would be appropriate if the effect count grew
significantly.

## Consequences

- `assets/audio/nebula-drift.mp3` is a required build asset; Vite bundles it
  via the `new URL("...", import.meta.url)` import pattern
- `AudioContext` is created lazily — no autoplay policy violations
- The Page Visibility API pauses BGM when the tab is hidden and resumes on
  return (prevents audio playing in background tabs)
- Adding new effects requires only adding oscillator/gain node chains in
  `audio.ts` — no library API to learn
- BGM restarts from the beginning (`bgm.currentTime = 0`) on each new game,
  which is intentional for a short arcade loop

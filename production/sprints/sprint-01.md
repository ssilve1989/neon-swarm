# Sprint 1 — Neon Swarm: Empty Canvas → Shippable MVP

## Sprint Goal

Build the complete game from scratch in dependency order, reaching a shippable
browser build: particle swarm, singularity, full combo loop, clock, audio,
juice, HUD, and game over screen.

## Capacity

- Pace: user-defined (no fixed deadline)
- Approach: implement directly from systems index — no individual GDDs
- Buffer: Absorption System spatial optimization is the only remaining
  technical unknown; address before considering the loop "done"

---

## Milestone 1: Project Bootstrap

*Prerequisite — none of the game systems can exist without this*

| ID | Task | Est. | Acceptance Criteria |
|----|------|------|---------------------|
| S1-00 | Initialize Vite + TypeScript + PixiJS v8 project | S | `npm run dev` serves a black canvas at 60fps with no console errors |
| S1-01 | Establish `src/` directory structure | S | Folders exist: `src/systems/`, `src/ui/`, `src/types.ts` |

---

## Milestone 2: Foundation

*Core infrastructure — all game systems register on these*

| ID | Task | Est. | Dependencies | Acceptance Criteria |
|----|------|------|-------------|---------------------|
| S1-02 | Renderer / App | S | S1-00 | PixiJS app wraps game loop; `app.ticker` runs; canvas fills window and resizes |
| S1-03 | Input System | S | S1-00 | `pointerX`/`pointerY` update on mouse move and touch; single unified interface |
| S1-04 | Game State Machine | S | S1-02 | States: `idle → playing → game-over → idle`; state transitions fire events; no game logic inside |

---

## Milestone 3: First Visual

*First time something appears and moves on screen*

| ID | Task | Est. | Dependencies | Acceptance Criteria |
|----|------|------|-------------|---------------------|
| S1-05 | Particle System | M | S1-02 | 10,000 additive-blended neon particles drift and wrap; object pool pre-allocated; JS frame time < 4ms |
| S1-06 | Singularity | S | S1-03, S1-02 | Glowing entity follows pointer with no lag; visible glow radius; renders above particles |

**Checkpoint:** Open the game — you should see a glowing cursor sweeping through a neon particle field.

---

## Milestone 4: First Playable

*Complete core loop — you can play a session start to finish*

| ID | Task | Est. | Dependencies | Acceptance Criteria |
|----|------|------|-------------|---------------------|
| S1-07 | Absorption System | S | S1-05, S1-06 | Particles within singularity radius are absorbed (hidden + respawned); fires `onAbsorb` event; no frame drop at 10k particles |
| S1-08 | Combo & Multiplier | S | S1-04 | Timer decays at configurable rate; each absorption resets timer and increments multiplier; combo break fires event and resets to 1× |
| S1-09 | Session Clock | S | S1-04 | Counts down from 30s; pauses outside `playing` state; triggers game over at 0 |
| S1-10 | Threshold Events | S | S1-08, S1-09 | Detects 50×/100×/200× multiplier crossings; fires `onThreshold` event with tier; grants +5s to Session Clock |
| S1-11 | Scoring | S | S1-08 | Score increments by `absorbed × multiplier` per absorption event; resets on new game |
| S1-12 | Singularity Growth | S | S1-08, S1-06 | Absorption radius scales with multiplier (configurable curve); resets to base on combo break |

**Checkpoint:** Play a full session — absorb particles, build combo, watch the clock, lose when time runs out.

---

## Milestone 5: Full MVP (Shippable)

*Juice, audio, UI — the game feels like a game*

| ID | Task | Est. | Dependencies | Acceptance Criteria |
|----|------|------|-------------|---------------------|
| S1-13 | Audio | S | S1-07, S1-10, S1-08 | Absorption blip pitch rises with multiplier; combo break plays descending tone; threshold event plays ascending chime; no audio files — Web Audio API only |
| S1-14 | Visual Feedback | S | S1-07, S1-10 | Screen shake on absorption (intensity scales with multiplier); bloom punch on threshold events; chromatic aberration filter on high multipliers |
| S1-15 | HUD | S | S1-11, S1-08, S1-09 | Score, multiplier, and clock visible; combo timer shown as decaying bar; readable during gameplay without covering play area |
| S1-16 | Game Over Screen | S | S1-04, S1-11 | Shows final score; restart button/keypress returns to `idle` state; clean transition |

**Checkpoint:** Full playthrough feels arcade-complete. Show this to someone unfamiliar with the project.

---

## Milestone 6: Stretch Goals

*Only after M5 is done and feels good*

| ID | Task | Est. | Dependencies | Acceptance Criteria |
|----|------|------|-------------|---------------------|
| S1-17 | High Score (localStorage) | S | S1-11, S1-16 | Personal best persists across sessions; displayed on game over screen |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Absorption System O(n) cost tanks frame budget | Medium | High | Use spatial grid (divide canvas into cells, check only overlapping cells per frame). Prototype this before building the full system if concerned. |
| Web Audio API quirks on Safari / iOS | Medium | Medium | Test early; Safari requires `AudioContext.resume()` after a user gesture |
| Chromatic aberration filter performance | Low | Low | PixiJS filter pipeline adds a render pass; test at high multiplier states; fall back to simpler glow if needed |

---

## Definition of Done

- [ ] All Milestone 1–5 tasks complete and pass acceptance criteria
- [ ] Game runs at ≥60fps on desktop Chrome with 10,000 particles
- [ ] Full session plays: start → build combo → clock runs out → game over → restart
- [ ] Audio plays on absorption, combo break, and threshold events
- [ ] No S1 bugs (game-breaking / unplayable states)
- [ ] Stretch (M6): High score persists correctly

# Systems Index: Neon Swarm

> **Status**: Approved
> **Created**: 2026-03-22
> **Last Updated**: 2026-03-22
> **Source Concept**: design/gdd/game-concept.md

---

## Overview

Neon Swarm is a single-screen arcade game built entirely around one
feedback loop: move → absorb → chain → escalate. The system scope reflects
that focus — 17 systems covering rendering, input, particle simulation,
collision, combo logic, time pressure, audio, visual juice, game modes, and persistence.

**Current state (2026-03-22):** The core MVP is fully implemented (15 systems). Six
systems need updates to support the v1.1 feature set (game modes, nova burst, particle
types, session stats). Two systems are not yet started (Mode Selection, High Score).

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Renderer / App | Core | MVP | Implemented | src/app.ts, src/main.ts | — |
| 2 | Input System | Core | MVP | Implemented | src/systems/input.ts | — |
| 3 | Game State Machine | Core | MVP | Needs Update | design/gdd/game-state-machine.md | — |
| 4 | Particle System | Core | MVP | Needs Update | src/systems/particles.ts | Renderer / App |
| 5 | Singularity | Core | MVP | Implemented | src/systems/singularity.ts | Input System, Renderer / App |
| 6 | Combo & Multiplier | Gameplay | MVP | Implemented | src/systems/combo.ts | Game State Machine |
| 7 | Session Clock | Gameplay | MVP | Needs Update | src/systems/clock.ts | Game State Machine |
| 8 | Scoring | Gameplay | MVP | Needs Update | src/systems/scoring.ts | Combo & Multiplier |
| 9 | Absorption System | Gameplay | MVP | Implemented | src/systems/absorption.ts | Particle System, Singularity |
| 10 | Singularity Growth | Gameplay | MVP | Implemented | src/systems/singularity-growth.ts | Combo & Multiplier, Singularity |
| 11 | Threshold Events | Gameplay | MVP | Needs Update | src/systems/threshold.ts | Combo & Multiplier, Session Clock |
| 12 | Audio | Audio | MVP | Implemented | src/systems/audio.ts | Absorption System, Threshold Events, Combo & Multiplier |
| 13 | Visual Feedback | Core | MVP | Implemented | src/systems/visual-feedback.ts | Absorption System, Threshold Events |
| 14 | HUD | UI | MVP | Needs Update | src/ui/hud.ts | Scoring, Combo & Multiplier, Session Clock |
| 15 | Game Over Screen | UI | MVP | Needs Update | src/ui/game-over-screen.ts | Game State Machine, Scoring |
| 16 | High Score | Persistence | Vertical Slice | Not Started | — | Scoring, Game Over Screen, Game State Machine |
| 17 | Mode Selection | UI | MVP | Approved | design/gdd/mode-selection.md | Game State Machine |

---

## Categories

| Category | Description |
|----------|-------------|
| **Core** | Foundation systems and rendering pipeline |
| **Gameplay** | Systems that drive the core loop |
| **Audio** | Procedural sound generation |
| **UI** | Player-facing displays and screens |
| **Persistence** | Local data storage |

---

## Priority Tiers

| Tier | Definition | Target |
|------|------------|--------|
| **MVP** | Required for core loop to function | First playable |
| **Vertical Slice** | Polish and persistence | Stretch goal |

---

## Dependency Map

### Foundation Layer (no dependencies)

1. **Renderer / App** — PixiJS init; stage, WebGL context, and tick loop
2. **Input System** — Pointer tracking; no upstream requirements
3. **Game State Machine** — State orchestration; must exist before any system starts/stops

### Core Layer (depends on foundation)

1. **Particle System** — depends on: Renderer / App
2. **Singularity** — depends on: Input System, Renderer / App
3. **Combo & Multiplier** — depends on: Game State Machine
4. **Session Clock** — depends on: Game State Machine
5. **Scoring** — depends on: Combo & Multiplier

### Feature Layer (depends on core)

1. **Absorption System** — depends on: Particle System, Singularity
2. **Singularity Growth** — depends on: Combo & Multiplier, Singularity
3. **Threshold Events** — depends on: Combo & Multiplier, Session Clock

### Presentation Layer (depends on features)

1. **Audio** — depends on: Absorption System, Threshold Events, Combo & Multiplier
2. **Visual Feedback** — depends on: Absorption System, Threshold Events
3. **HUD** — depends on: Scoring, Combo & Multiplier, Session Clock
4. **Mode Selection** — depends on: Game State Machine (pre-game UI; sets active mode for clock, scoring, and state)
5. **Game Over Screen** — depends on: Game State Machine, Scoring

### Polish Layer

1. **High Score** — depends on: Scoring, Game Over Screen

---

## Recommended Design Order

| Order | System | Priority | Layer | Est. Effort |
|-------|--------|----------|-------|-------------|
| 1 | Renderer / App | MVP | Foundation | S |
| 2 | Input System | MVP | Foundation | S |
| 3 | Game State Machine | MVP | Foundation | S |
| 4 | Particle System | MVP | Core | M |
| 5 | Singularity | MVP | Core | S |
| 6 | Combo & Multiplier | MVP | Core | S |
| 7 | Session Clock | MVP | Core | S |
| 8 | Scoring | MVP | Core | S |
| 9 | Absorption System | MVP | Feature | S |
| 10 | Singularity Growth | MVP | Feature | S |
| 11 | Threshold Events | MVP | Feature | S |
| 12 | Audio | MVP | Presentation | S |
| 13 | Visual Feedback | MVP | Presentation | S |
| 14 | HUD | MVP | Presentation | S |
| 15 | Mode Selection | MVP | Presentation | S |
| 16 | Game Over Screen | MVP | Presentation | S |
| 17 | High Score | Vertical Slice | Polish | S |

*S = 1 session, M = 2–3 sessions*

---

## Circular Dependencies

None found.

---

## High-Risk Systems

| System | Risk Type | Risk Description | Mitigation |
|--------|-----------|-----------------|------------|
| ~~Particle System~~ | ~~Technical~~ | ~~Prototyped and validated~~ — 120fps at 20k particles, ~1 draw call, 1–2.5ms JS time. **Not a risk.** | See `prototypes/particle-system/REPORT.md` |
| Absorption System | Technical | Per-frame proximity check on 10k particles is O(n); naive impl will tank frame budget | Spatial grid or squared-distance batch check; skip sqrt; benchmark early |

---

## Scope Changes (v1.1 Feature Expansion)

Six existing systems have expanded scope from the original design. Flag these for additional design work:

| System | Expansion |
|--------|-----------|
| Particle System (#4) | Must support variant particle types (Time, Repulsor) with distinct behaviors |
| Session Clock (#7) | Must be mode-aware: Standard (30s + extensions), Blitz (15s flat), Zen (disabled) |
| Threshold Events (#11) | Must trigger nova burst in addition to +5s clock bonus |
| Scoring (#8) | Must track peak multiplier and session stats; Zen mode uses peak multiplier as primary metric |
| High Score (#16) | Must store and retrieve personal bests per-mode (3 separate records) |
| Game Over Screen (#15) | Must display session stats and expose score card export (Canvas PNG) |

---

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 17 |
| Implemented (no changes needed) | 9 |
| Implemented (needs update for v1.1) | 6 |
| Not started | 2 |
| Design docs written | 2 (Game State Machine, Mode Selection) |
| Design docs approved | 2 |

---

## Next Steps

### New systems to build
- [ ] Mode Selection screen — genuinely new UI, no existing code (`/design-system mode-selection`)
- [ ] High Score — per-mode localStorage, Vertical Slice (`/design-system high-score`)

### Existing systems to update (v1.1 features)
- [ ] Game State Machine — expand `state.ts`: add PAUSED state, mode tracking, Page Visibility API (GDD approved)
- [ ] Particle System — add Time + Repulsor particle type architecture
- [ ] Session Clock — make mode-aware (Standard 30s, Blitz 15s, Zen disabled)
- [ ] Scoring — add session stats tracking + peak multiplier metric for Zen
- [ ] Threshold Events — add nova burst logic
- [ ] HUD — add Zen quit button; mode indicator
- [ ] Game Over Screen — add session stats display + Canvas PNG export

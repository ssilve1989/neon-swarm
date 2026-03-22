# Systems Index: Neon Swarm

> **Status**: Approved
> **Created**: 2026-03-22
> **Last Updated**: 2026-03-22
> **Source Concept**: design/gdd/game-concept.md

---

## Overview

Neon Swarm is a single-screen arcade game built entirely around one
feedback loop: move → absorb → chain → escalate. The system scope reflects
that focus — 15 MVP systems covering rendering, input, particle simulation,
collision, combo logic, time pressure, audio, and visual juice. There is no
inventory, no progression, no dialogue, no level loading. Every system either
directly drives the core loop or amplifies the feel of it. The two highest-risk
systems (Particle System and Absorption System) are marked for early prototyping
due to WebGL performance constraints at 10k+ entities.

---

## Systems Enumeration

| # | System Name | Category | Priority | Status | Design Doc | Depends On |
|---|-------------|----------|----------|--------|------------|------------|
| 1 | Renderer / App | Core | MVP | Not Started | — | — |
| 2 | Input System | Core | MVP | Not Started | — | — |
| 3 | Game State Machine | Core | MVP | Not Started | — | — |
| 4 | Particle System | Core | MVP | Not Started | — | Renderer / App |
| 5 | Singularity | Core | MVP | Not Started | — | Input System, Renderer / App |
| 6 | Combo & Multiplier | Gameplay | MVP | Not Started | — | Game State Machine |
| 7 | Session Clock | Gameplay | MVP | Not Started | — | Game State Machine |
| 8 | Scoring | Gameplay | MVP | Not Started | — | Combo & Multiplier |
| 9 | Absorption System | Gameplay | MVP | Not Started | — | Particle System, Singularity |
| 10 | Singularity Growth | Gameplay | MVP | Not Started | — | Combo & Multiplier, Singularity |
| 11 | Threshold Events | Gameplay | MVP | Not Started | — | Combo & Multiplier, Session Clock |
| 12 | Audio | Audio | MVP | Not Started | — | Absorption System, Threshold Events, Combo & Multiplier |
| 13 | Visual Feedback | Core | MVP | Not Started | — | Absorption System, Threshold Events |
| 14 | HUD | UI | MVP | Not Started | — | Scoring, Combo & Multiplier, Session Clock |
| 15 | Game Over Screen | UI | MVP | Not Started | — | Game State Machine, Scoring |
| 16 | High Score | Persistence | Vertical Slice | Not Started | — | Scoring, Game Over Screen |

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
4. **Game Over Screen** — depends on: Game State Machine, Scoring

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
| 15 | Game Over Screen | MVP | Presentation | S |
| 16 | High Score | Vertical Slice | Polish | S |

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

## Progress Tracker

| Metric | Count |
|--------|-------|
| Total systems identified | 16 |
| Design docs started | 0 |
| Design docs reviewed | 0 |
| Design docs approved | 0 |
| MVP systems designed | 0 / 15 |
| Vertical Slice systems designed | 0 / 1 |

---

## Next Steps

- [ ] Design MVP systems in order (use `/design-system [system-name]`)
- [ ] Prototype Particle System first — highest technical risk
- [ ] Run `/design-review` on each completed GDD
- [ ] Run `/sprint-plan new` to organize build order into a jam sprint

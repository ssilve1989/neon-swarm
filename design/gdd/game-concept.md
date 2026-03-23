# Neon Swarm — Game Concept

## One-Line Pitch

A fast-paced arcade web game where you sweep a glowing singularity across thousands
of neon particles, chasing absorption milestones to earn time extensions before your
clock runs out.

## Genre

Arcade / Casual / Bullet-Heaven (Reverse Bullet-Hell)

## Core Fantasy

Effortless dominance and flow state. The player is not dodging — they are *consuming*.
Everything on screen exists to be absorbed. The reward is screen-filling visual chaos
and escalating numbers.

## Core Loop

1. Move cursor → singularity follows (mouse + touch via PixiJS pointermove)
2. Singularity collides with particles → absorption triggers
3. Each absorption adds to your cumulative count and the singularity grows
4. Singularity never shrinks — growth is permanent for the run
5. Growth increases absorption radius → easier to absorb → positive feedback loop
6. Reaching absorption milestones (50/200/500) grants +5 seconds (Standard only)
7. Session ends when the master clock hits zero

## Session Structure — Survival Time Attack

- Player starts with **30 seconds** on the master clock
- The particle field starts sparse (~2% of device budget) and ramps to full density over 60s of active play
- Crossing absorption milestones (**50/200/500 absorbs**) grants **+5 seconds** (Standard only)
- Singularity size compounds across the run — there is no setback or reset
- The threat is the clock: keep absorbing to earn extensions before time runs out
- Tension curve: early game is low-density with room to breathe; late game is dense and fast-paced

## Particle Types

| Type | Color | Behavior | Score Value |
|------|-------|----------|-------------|
| Standard | Cyan | Normal drift | 1 per absorption |

Time and Repulsor particle types are deferred pending redesign. See Sprint 3 (`production/sprints/sprint-02.md` → Deferred).

## Threshold Events

At each absorption milestone (50/200/500 absorbs):

1. Clock receives **+5s** (Standard mode only)
2. Visual: clock pulses cyan at 1.35× scale for 350ms; "+5s" toast floats upward from the clock
3. Audio: ascending C5→G5 chime

**Nova burst** (singularity absorption radius expands to ~3× for 0.5s, auto-absorbing nearby particles) is designed but deferred to Sprint 3 — the CA filter interaction needs a dedicated visual pass. See `production/sprints/sprint-02.md`.

## Game Modes

| Mode | Clock | Threshold Extensions | Score Metric | Run Ends When |
|------|-------|---------------------|--------------|---------------|
| Standard | 30s | +5s at 50/200/500 absorbs | Total absorptions | Clock hits 0 |
| Blitz | 15s | None | Total absorptions | Clock hits 0 |
| Zen | None | N/A | Total absorptions | Player quits |

- **Standard**: chase absorption milestones to earn clock extensions; manage time pressure while the field densifies.
- **Blitz**: same core loop in 15 fixed seconds. No extensions. Pure ceiling run.
- **Zen**: no clock, no pressure. Play indefinitely. Score = total absorptions at quit.

## Audio — Procedural (Web Audio API)

No asset files. All audio generated at runtime:

- **Absorption blip**: sine wave, pitch rises with singularity size (tied to growth curve)
- **Threshold milestone**: ascending C5→G5 chime on +5s grant (Standard only)
- Bundle cost: ~0 bytes

## Persistence

All data in `localStorage` — no server required.

- **Personal best per mode**: all-time high score (Standard / Blitz) or peak multiplier (Zen)
- **Session stats on game over**: peak multiplier, particles absorbed, time survived
- **Shareable score card**: Canvas API renders final score + singularity snapshot as PNG (download or native share API)

## Design Pillars

- **Feel over mechanics** — juice and feedback are the game
- **Zero friction** — pointer input only (mouse + touch), instant start, no UI clutter
- **Escalation** — everything gets bigger, faster, louder until it breaks

## Scope

| Must Have | Nice to Have | Cut |
|-----------|-------------|-----|
| Particle swarm (10k+) | Screen shake + chromatic aberration | Levels / progression |
| Cursor singularity with growth | Session stats (absorptions, time survived) | Enemies / hazards |
| Absorption milestones + clock extensions | Shareable score card (Canvas PNG) | Multiplayer |
| Particle density ramp | Time + Repulsor particle types (Sprint 3) | Combo timer + multiplier |
| Nova burst at milestones (Sprint 3) | Attract mode / idle animation | Unlockables |
| Game modes (Standard, Blitz, Zen) | — | — |
| Mode selection screen | — | — |
| Per-mode personal bests (localStorage) | — | — |
| Score display | — | — |
| Game over + restart | — | — |
| Procedural audio (Web Audio API) | — | — |
| Mobile/touch (PixiJS pointermove) | — | — |

## Tech

- **Renderer**: PixiJS (WebGL, additive blending)
- **Language**: TypeScript
- **Target**: Browser (desktop + mobile, 60fps)
- **Bundle**: Minimal — no game engine overhead

## Success Criteria

- Stable 60fps with 10,000+ active particles on desktop
- Absorption feedback (blip + growth) feels satisfying within 30 seconds of first play
- Clock extension events are visually and audibly distinct — player notices the +5s
- Density ramp is perceptible: field feels noticeably fuller at 60s than at game start
- Session length: 1–3 minutes natural arc
- Touch input works equivalently to mouse

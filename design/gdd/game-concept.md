# Neon Swarm — Game Concept

## One-Line Pitch

A fast-paced arcade web game where you sweep a glowing singularity across thousands
of neon particles, chaining absorptions to build massive multipliers before your
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
3. Each absorption resets/extends the combo timer and adds to the multiplier
4. Combo timer decays continuously — stop moving and you lose the chain
5. Multiplier drives score and singularity growth
6. Growth increases absorption radius → easier to chain → positive feedback loop
7. Session ends when the master clock hits zero

## Session Structure — Survival Time Attack

- Player starts with **30 seconds** on the master clock
- Crossing multiplier thresholds (**50x, 100x, 200x**) grants **+5 seconds**
- Dropping a combo does NOT end the game — it resets growth and multiplier back
  to baseline, creating a setback, not a fail state
- The threat is the clock: frantic sweeps to maintain chain as time bleeds away
- Tension curve: early game is generous, late game is desperate clock management

## Audio — Procedural (Web Audio API)

No asset files. All audio generated at runtime:

- **Absorption blip**: sine/square wave, pitch mapped directly to `State.multiplier`
  (chain sounds rise dynamically as the combo climbs)
- **Combo break**: short descending tone
- **Threshold milestone**: brief ascending chime on +5s grants
- Bundle cost: ~0 bytes

## Design Pillars

- **Feel over mechanics** — juice and feedback are the game
- **Zero friction** — pointer input only (mouse + touch), instant start, no UI clutter
- **Escalation** — everything gets bigger, faster, louder until it breaks

## Scope (Jam)

| Must Have | Nice to Have | Cut |
|-----------|-------------|-----|
| Particle swarm (10k+) | Particle variety/behaviors | Levels / progression |
| Cursor singularity with growth | Screen shake + chromatic aberration | Enemies / hazards |
| Combo timer + multiplier | High score persistence (localStorage) | Multiplayer |
| Survival Time Attack (30s clock) | Attract mode / idle animation | Unlockables |
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
- Combo chain feels satisfying and readable within 30 seconds of first play
- Procedural audio pitch rise is noticeable and rewarding by 10x multiplier
- Session length: 1–3 minutes natural arc
- Touch input works equivalently to mouse

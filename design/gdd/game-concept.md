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

## Particle Types

| Type | Color | Behavior | Score Value |
|------|-------|----------|-------------|
| Standard | Cyan | Normal drift | Base |
| Time | Gold / amber | Slow passive drift | +1s per absorption |
| Repulsor | Red / orange | Flees singularity | 2× base |

- **Time particles**: rare spawn (~2–3 on screen at a time). Create deliberate clock-hunting moments. Reward players who pursue them instead of sweeping blindly.
- **Repulsor particles**: actively flee from the singularity. Worth 2× base score to reward aggressive pursuit. Punish passive or slow circular sweeping.

## Threshold Spectacle — Nova Burst

At each multiplier threshold (50×, 100×, 200×):

1. Singularity absorption radius expands to **~3× normal for 0.5 seconds** (nova burst)
2. All particles within burst radius are auto-absorbed — each counts as a full combo hit
3. Clock receives +5s (Standard mode only)
4. Visual: shockwave ripple + brief flash at singularity origin

Nova burst absorptions chain naturally into the existing combo — the burst extends the combo timer and feeds the multiplier, making thresholds feel like a rewarded frenzy.

## Game Modes

| Mode | Clock | Threshold Extensions | Score Metric | Run Ends When |
|------|-------|---------------------|--------------|---------------|
| Standard | 30s | +5s at 50×/100×/200× | Total score | Clock hits 0 |
| Blitz | 15s | None | Total score | Clock hits 0 |
| Zen | None | N/A | Peak multiplier | Player quits |

- **Standard**: existing flow — build multiplier, chase threshold bonuses, manage the clock.
- **Blitz**: same core loop in 15 fixed seconds. No clock extensions. Pure ceiling score run.
- **Zen**: no clock. Combo break resets multiplier but never ends the run. Play indefinitely. Score = highest multiplier reached.

## Audio — Procedural (Web Audio API)

No asset files. All audio generated at runtime:

- **Absorption blip**: sine/square wave, pitch mapped directly to `State.multiplier`
  (chain sounds rise dynamically as the combo climbs)
- **Combo break**: short descending tone
- **Threshold milestone**: brief ascending chime on +5s grants
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
| Time + Repulsor particle types | Session stats (peak multiplier, absorbed) | Enemies / hazards |
| Cursor singularity with growth | Shareable score card (Canvas PNG) | Multiplayer |
| Combo timer + multiplier | Attract mode / idle animation | Unlockables |
| Nova burst at thresholds | — | — |
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
- Combo chain feels satisfying and readable within 30 seconds of first play
- Procedural audio pitch rise is noticeable and rewarding by 10x multiplier
- Session length: 1–3 minutes natural arc
- Touch input works equivalently to mouse

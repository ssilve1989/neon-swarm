---
status: reverse-documented
source: src/systems/particles.ts, src/systems/absorption.ts
date: 2026-03-22
verified-by: user
---

# Particle System

> Reverse-engineered from implementation. Captures current behavior and
> clarified design intent. See "Known Gaps" for deferred design work.

## Overview

The particle system fills the play field with a dense neon swarm. A fixed pool
of sprites drifts autonomously, wrapping at screen edges, and is consumed and
immediately respawned by the absorption system. Pool size is determined once at
startup based on the player's device tier.

## Player Fantasy

The field reads as an infinite, living swarm of neon energy — always dense,
always moving. The player's singularity feeds on it continuously; the field
never empties, reinforcing the feeling that there is always more to absorb.

## Detailed Rules

- Pool size is fixed at startup by device tier (see ADR: device-tier-particle-budget)
- All particles are active at all times — none are hidden or deactivated
- Each particle has: position (px, py), velocity (vx, vy), scale, alpha, tint
- On init: random screen position, random speed and direction, random scale,
  random alpha, color from palette cycling by particle index
- Each frame: position advances by velocity × deltaTime; screen wrap applied
- On absorption: position and velocity re-randomized; alpha re-randomized
- Color and scale are fixed per particle — not changed on respawn

## Formulas

**Speed (px/frame)**
```
speed = 0.3 + rand() × 0.6       → range [0.3, 0.9]
```

**Velocity components**
```
angle = rand() × 2π
vx = cos(angle) × speed
vy = sin(angle) × speed
```

**Position update (per frame)**
```
px += vx × deltaTime
py += vy × deltaTime
```
deltaTime is normalized to 60fps by the PixiJS ticker.

**Screen wrap**
```
if px < 0            → px += screenWidth
if px > screenWidth  → px -= screenWidth
(same for py / screenHeight)
```

**Alpha on spawn**
```
alpha = 0.4 + rand() × 0.6       → range [0.4, 1.0]
```

**Scale on spawn**
```
scale = 0.3 + rand() × 1.2       → range [0.3, 1.5]
```

**Color assignment**
```
tint = PARTICLE_COLORS[i % 6]
palette: #00ffff  #ff00ff  #7700ff  #00ff88  #ff4400  #ccccff
```

## Edge Cases

- **Absorbed particle respawns instantly**: the field never becomes sparse.
  NOTE: instant respawn is not deliberate design — it is the simplest
  implementation. Intended behavior is a brief alpha fade-out followed by
  respawn at a random screen position. See Known Gaps.
- **Screen wrap is seamless**: particles slide off one edge and appear on the
  opposite edge with no visible pop.
- **Tier does not update mid-session**: orientation changes or window resizes
  after page load do not alter pool size. A page reload is required.

## Dependencies

- **Renderer / App** (`src/app.ts`): provides stage, ticker, and screen dimensions
- **Device Tier** (`src/utils/device-tier.ts`): determines PARTICLE_COUNT at
  module load
- **Absorption System** (`src/systems/absorption.ts`): reads px/py/vx/vy arrays
  and calls absorbParticle() each frame

## Tuning Knobs

| Knob | Location | Current Value | Safe Range | Affects |
|------|----------|---------------|------------|---------|
| SPEED_MIN | particles.ts | 0.3 px/frame | 0.1–0.5 | Field restlessness |
| SPEED_MAX | particles.ts | 0.9 px/frame | 0.5–2.0 | Field energy |
| Scale min | particles.ts | 0.3 | 0.2–0.5 | Smallest visible particles |
| Scale max | particles.ts | 1.5 | 1.0–3.0 | Largest visible particles |
| Alpha min | particles.ts | 0.4 | 0.2–0.6 | Dimmest particles |
| Alpha max | particles.ts | 1.0 | 0.7–1.0 | Brightest particles |
| Pool size (mobile) | device-tier.ts | 1,000 | 500–2,000 | Density on mobile |
| Pool size (tablet) | device-tier.ts | 3,000 | 1,500–5,000 | Density on tablet |
| Pool size (desktop) | device-tier.ts | 10,000 | 5,000–20,000 | Density on desktop |

## Acceptance Criteria

- [ ] Field appears dense on all three device tiers without frame drops
- [ ] Particles wrap at screen edges with no visible pop
- [ ] Absorbed particles reappear — field never goes empty
- [ ] Color variety is visually distributed (no single-color clusters)
- [ ] Pool allocates once at startup; no Sprite allocation during gameplay

## Known Gaps

- **Delayed respawn**: absorbed particles should fade out and respawn at a
  random screen position rather than teleporting instantly. This is deferred
  design work for a future pass.

---
status: active
source: src/systems/threshold.ts, src/systems/nova-burst.ts
date: 2026-03-22
updated: 2026-04-05
---

# Threshold Events

> **Note**: Reverse-engineered from implementation. Captures current behavior and confirmed design intent.

## Overview

Threshold Events are milestone rewards triggered at cumulative absorption counts. They grant
time extensions in Standard mode and trigger a nova burst celebration — an expanding shockwave
ring, particle scatter, and singularity bloom — in all modes. Each threshold fires exactly once
per run with the same burst intensity regardless of tier.

## Player Fantasy

Hitting a threshold breaks the rhythm in the best way. The singularity goes supernova — a
shockwave ring tears outward, scattering particles in all directions, and a deep boom rings out.
In Standard mode you've bought yourself more time. It's a punctuation mark on sustained effort:
the universe noticed what you just did.

## Detailed Rules

- Three tiers, triggered at cumulative absorption counts: 50, 200, and 500
- Each tier fires **exactly once per run** (tracked via a `Set<ThresholdTier>`)
- Counter resets to 0 at the start of each new game
- **Standard mode:** each threshold grants +5s, capped at the 30s clock maximum
- **All modes:** fires the `onThreshold` event for audio and visual feedback

| Tier | Absorbs Required | Time Bonus (Standard) |
|------|-----------------|----------------------|
| 1 | 50 | +5s |
| 2 | 200 | +5s |
| 3 | 500 | +5s |

## Detailed Rules — Nova Burst

When a threshold fires, a nova burst plays simultaneously with the existing flash and chime.
All three tiers produce the same burst intensity.

### Shockwave Ring

- A single ring expands from the singularity's current position
- Starts at the singularity's current visual radius, expands to `NOVA_RADIUS` (400px) over `NOVA_DURATION` (600ms)
- Color: white at origin, transitions to orange/gold at full expansion, alpha fades to 0 by end
- Additive blend mode, consistent with particle rendering
- One ring per threshold crossing; if two thresholds fire in the same frame, two rings play concurrently with no offset (they stack visually)

### Particle Scatter

- At the moment of trigger, all active particles within `NOVA_RADIUS` of the singularity receive an outward velocity impulse
- Impulse magnitude is proportional to proximity — particles near the center are hit harder
- Applied directly to `vx[]`/`vy[]`; existing wrap behavior handles off-screen particles
- Particles currently off-screen (respawning) are unaffected

### Singularity Bloom

- The singularity scales to `NOVA_BLOOM_SCALE` (2.5×) over 150ms, then snaps back over 50ms
- Visual only — `singularity.radius` (absorption radius) is unchanged during bloom
- If a second threshold fires while bloom is active, the animation restarts from current scale

### Audio

- A low-frequency boom plays at trigger: ~60Hz sine oscillator, 0ms attack, 300ms exponential decay, via Web Audio API
- Existing ascending chime plays immediately after (unchanged, no delay)

---

## Formulas

### Threshold check (unchanged)

```
if totalAbsorbed >= thresholdValue AND tier not yet crossed:
    mark tier as crossed
    if mode === "standard": addTime(5)
    notify all listeners
```

**Total possible time granted (Standard):** 3 × 5s = 15s (if clock is below 30s for all three)

### Particle scatter impulse

```
for each particle i where distance(i, singularity) <= NOVA_RADIUS:
    dx = particle[i].x - singularity.x
    dy = particle[i].y - singularity.y
    dist = sqrt(dx*dx + dy*dy)          // or skip sqrt: use squared falloff
    if dist === 0: skip                  // particle is inside singularity, skip
    falloff = 1 - (dist / NOVA_RADIUS)  // 1.0 at center, 0.0 at edge
    impulse = NOVA_IMPULSE_STRENGTH * falloff
    vx[i] += (dx / dist) * impulse
    vy[i] += (dy / dist) * impulse
```

**Variables:**
| Variable | Value | Unit | Notes |
|----------|-------|------|-------|
| `NOVA_RADIUS` | 400 | px | Shockwave max radius; also scatter influence radius |
| `NOVA_DURATION` | 600 | ms | Shockwave ring expansion time |
| `NOVA_IMPULSE_STRENGTH` | 8 | px/frame | Impulse at the singularity center (falloff to 0 at edge) |
| `NOVA_BLOOM_SCALE` | 2.5 | × | Peak singularity scale during bloom |

**Example:** Particle 120px from singularity center with `NOVA_IMPULSE_STRENGTH = 8`:
```
falloff = 1 - (120 / 400) = 0.7
impulse = 8 × 0.7 = 5.6 px/frame added to velocity
```

## Edge Cases

- **Multiple thresholds in one frame:** If a large absorption batch pushes the counter past
  multiple thresholds simultaneously (e.g. starting at 45, absorbing 200), all triggered tiers
  fire in ascending order within the same tick. Each fires the full celebration (flash, chime)
  independently. Two shockwave rings spawn concurrently at the same origin and expand in
  parallel. Two impulse passes apply to particles — a particle in range of both fires receives
  two impulse additions in the same tick. The combined velocity is handled by natural wrap
  behavior; no additional clamping needed.
- **Threshold at or above cap:** If the clock is already at 30s when a Standard threshold fires,
  `addTime` has no effect (clock stays at 30s). The nova burst and audio still play.
- **Blitz/Zen:** `addTime` is never called — the mode guard is inside `threshold.ts`
  (`if (getMode() === "standard")`). The nova burst fires in all modes.
- **Re-crossing:** Once a tier is added to `crossed`, it can never fire again in the same run.
  Even if the counter is somehow reset externally, the `Set` prevents duplicate events.
- **Burst during game-over transition:** If the absorption that triggers threshold 3 also ends
  the game (clock hits 0 simultaneously), the burst plays for its full duration over the
  game-over screen. The shockwave ring and bloom are purely cosmetic and do not interact with
  game state.
- **Burst while paused:** Nova burst cannot trigger while paused — `threshold.ts` only fires
  inside the `playing` state. No guard needed in `nova-burst.ts`.
- **Singularity at canvas edge:** The shockwave ring is clipped by canvas bounds naturally
  (PixiJS does not render outside the stage). Particle scatter still applies to all particles
  within radius, including those near edges — they may immediately wrap.
- **`dist === 0` guard:** If a particle is exactly at the singularity position, skip the
  impulse calculation to avoid divide-by-zero.

## Dependencies

| System | Role |
|--------|------|
| Absorption System | `onAbsorb(count)` drives the running total |
| Clock | `addTime(5)` — Standard mode time extension |
| Game State Machine | `onStateChange` resets counter and `crossed` Set on new game |
| Audio | Subscribes via `onThreshold` → plays clock-extension chime (Standard only) and nova boom (all modes) |
| Visual Feedback | Subscribes via `onThreshold` → triggers bloom flash (unchanged) |
| HUD | Subscribes via `onThreshold` → triggers "+5s" toast and clock pulse (Standard only) |
| **Nova Burst** *(new)* | Subscribes via `onThreshold` → owns shockwave ring, particle scatter, and singularity bloom; implemented in `src/systems/nova-burst.ts` |
| Particles | Read by Nova Burst — `x[]`, `y[]`, `vx[]`, `vy[]` arrays mutated for scatter impulse |
| Singularity | Read by Nova Burst — `singularity.x`, `singularity.y`, `singularity.radius` for ring origin and bloom |

## Tuning Knobs

| Constant | Value | Effect | Safe Range |
|----------|-------|--------|------------|
| Tier 1 threshold | 50 absorbs | First milestone | 25–100 |
| Tier 2 threshold | 200 absorbs | Mid-run milestone | 100–400 |
| Tier 3 threshold | 500 absorbs | Late-run milestone | 300–1000 |
| `TIME_BONUS` | 5s | Seconds per threshold (Standard) | 3–10 |
| `NOVA_RADIUS` | 400px | Shockwave max radius and scatter influence area | 200–600 |
| `NOVA_DURATION` | 600ms | Shockwave ring expansion time | 300–1000 |
| `NOVA_IMPULSE_STRENGTH` | 8 px/frame | Peak outward velocity added at singularity center | 3–20 |
| `NOVA_BLOOM_SCALE` | 2.5× | Peak singularity visual scale during bloom | 1.5–4.0 |

All four nova burst constants live in `src/systems/nova-burst.ts`. All three tiers share the
same values — there is no tier-specific scaling.

## Acceptance Criteria

- [ ] First threshold fires at exactly 50 cumulative absorbs
- [ ] Second threshold fires at exactly 200 cumulative absorbs
- [ ] Third threshold fires at exactly 500 cumulative absorbs
- [ ] Each threshold fires exactly once per run, regardless of subsequent absorptions
- [ ] Standard mode: clock extends by 5s on each crossing; cannot exceed 30s
- [ ] Blitz and Zen: no clock extension; nova burst still plays
- [ ] All three tiers reset on new game
- [ ] If two thresholds crossed in one frame, both celebrations fire
- [ ] Nova burst triggers on all three threshold crossings (50, 200, 500 absorbs) in all modes
- [ ] Shockwave ring expands from singularity position to ~400px and fades to transparent within 600ms
- [ ] Ring color transitions white→orange/gold as it expands
- [ ] Particles within 400px of the singularity receive an outward velocity impulse at trigger
- [ ] Particles closer to the singularity receive a stronger impulse than particles at the edge
- [ ] Particle wrap behavior is unchanged — scattered particles reappear at the opposite edge
- [ ] Singularity blooms to ~2.5× scale over 150ms and snaps back over 50ms
- [ ] Singularity absorption radius is unchanged during bloom (no gameplay effect)
- [ ] Nova boom audio plays at trigger; ascending chime follows immediately
- [ ] No frame drop during burst at any device tier (measure JS frame time)
- [ ] If two thresholds fire in the same frame, both bursts play independently without error

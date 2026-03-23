---
status: reverse-documented
source: src/systems/absorption.ts
date: 2026-03-22
---

# Absorption System

> **Note**: Reverse-engineered from implementation. Captures current behavior and confirmed design intent.

## Overview

The Absorption System is the engine of the core loop. Every frame it queries particles near the
singularity, applies gravitational and swirl forces to draw them in, and absorbs any that cross
the event boundary. It broadcasts absorption events that drive scoring, growth, thresholds, audio,
and visual feedback.

## Player Fantasy

Particles spiral into your gravity well in a natural, satisfying arc. Getting close to a dense
cluster feels powerful. The pull is real — you can watch particles accelerate as they approach.

## Detailed Rules

The system runs every frame during `"playing"` state only.

### Two-Zone Model

```
[  influence zone (120px)  ]
    [ absorption zone (30px) ]
             ●  ← singularity center
```

| Zone | Condition | Effect |
|------|-----------|--------|
| Absorption | `dist ≤ absorptionRadius` | Particle consumed; removed from field |
| Influence | `absorptionRadius < dist ≤ influenceRadius` | Gravity + swirl forces applied |
| Outside | `dist > influenceRadius` | No effect |

### Force Model (Influence Zone)

- **Gravity:** inverse-square attraction toward singularity center
- **Swirl:** tangential force perpendicular to the radial direction, creating a counter-clockwise spiral
- **Speed cap:** velocity magnitude is capped at 6px/frame to prevent particles teleporting

### Absorption Events

Each frame, if any particles were absorbed:
- Count and dominant color (average RGB) are computed for the batch
- All registered `onAbsorb` listeners are called once with `(count, dominantColor)`
- If zero particles absorbed: no event fired

## Formulas

**Distance squared (no sqrt):**
```
dist² = dx² + dy²
```
Compared directly against `r²` and `inf²` — avoids sqrt for performance.

**Force components (per particle in influence zone):**
```
fx = (-dx * GRAVITY_K - dy * SWIRL_K) / dist²
fy = (-dy * GRAVITY_K + dx * SWIRL_K) / dist²
```
- `GRAVITY_K = 60` — pull strength
- `SWIRL_K = 40` — spiral contribution

**Velocity integration:**
```
vx[i] += fx * deltaTime
vy[i] += fy * deltaTime
```

**Speed cap:**
```
speed² = vx² + vy²
if speed² > MAX_SPEED_SQ:
    scale = sqrt(MAX_SPEED_SQ / speed²)
    vx *= scale; vy *= scale
```
- `MAX_SPEED_SQ = 36` → max speed = 6px/frame

**Dominant color:**
```
dominantColor = avg(R) << 16 | avg(G) << 8 | avg(B)
```
Averaged across all absorbed particles in the current frame.

**Example force at various distances** (GRAVITY_K=60, SWIRL_K=40):
| Distance (px) | Gravity force magnitude |
|--------------|------------------------|
| 30 (edge of abs zone) | 60/900 ≈ 0.067 |
| 60 | 60/3600 ≈ 0.017 |
| 120 (edge of influence) | 60/14400 ≈ 0.004 |

## Edge Cases

- **dist ≈ 0:** Division by `dist²` approaches infinity at the singularity center. The event
  horizon void sprite visually occludes the center; particles entering the absorption zone are
  consumed before they reach center. Practical risk is negligible.
- **Multiple thresholds in one frame:** Large absorption batches may cross multiple thresholds
  simultaneously. The threshold system handles this correctly (iterates all thresholds each event).
- **Particles at exact boundary:** `dist² <= r²` — particles exactly on the absorption radius
  are consumed. Floating point comparison; no special handling needed.
- **Only runs while playing:** `getState() !== "playing"` guard prevents force accumulation
  during pause or game-over.

## Dependencies

| System | Role |
|--------|------|
| Particle System | `getParticlesInRegion()` spatial query; `absorbParticle()` to remove; `px/py/vx/vy` arrays |
| Singularity | `getSingularityPosition()`, `getRadius()`, `getInfluenceRadius()` |
| Game State Machine | `getState()` guard on ticker |
| Scoring | Subscribes via `onAbsorb` |
| Singularity Growth | Subscribes via `onAbsorb` |
| Threshold Events | Subscribes via `onAbsorb` |
| Visual Feedback | Subscribes via `onAbsorb` |
| Singularity (hot spot) | Subscribes via `onAbsorb` for dominant color |

## Tuning Knobs

| Constant | Value | Effect | Safe Range |
|----------|-------|--------|------------|
| `GRAVITY_K` | 60 | Pull strength; higher = stronger attraction | 30–120 |
| `SWIRL_K` | 40 | Spiral tightness; higher = tighter spiral | 0–80 |
| `MAX_SPEED_SQ` | 36 | Velocity cap (6px/frame); prevents blink | 16–64 |

Absorption and influence radii are controlled by the Singularity system (base) and Singularity
Growth system (scaling over time).

## Acceptance Criteria

- [ ] Particles within influence radius accelerate toward the singularity in a counter-clockwise spiral
- [ ] Particles crossing the absorption radius disappear immediately
- [ ] Score increments on absorption
- [ ] Singularity hot spot color reflects recently absorbed particle colors
- [ ] Singularity grows after absorptions
- [ ] Threshold events fire at correct cumulative counts
- [ ] No particle exceeds 6px/frame velocity
- [ ] No force is applied while game is paused

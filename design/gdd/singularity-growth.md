---
status: reverse-documented
source: src/systems/singularity-growth.ts
date: 2026-03-22
---

# Singularity Growth

> **Note**: Reverse-engineered from implementation. Captures current behavior and confirmed design intent.

## Overview

The Singularity grows larger as particles are absorbed, visualizing the player's cumulative
power. Growth follows a square-root curve — front-loaded so early absorbs feel impactful —
and is capped to prevent the singularity from dominating the screen on smaller viewports.

## Player Fantasy

Your black hole is visibly becoming an unstoppable force. Each absorption makes it bigger.
The early growth feels dramatic; by mid-run it's an imposing presence that swallows whole
clusters in one pass.

## Detailed Rules

- Radius grows monotonically — it never shrinks during a run
- Growth is cumulative across the entire run; each absorption event adds to the lifetime total
- Radius resets to base (30px) at the start of each new game
- Growth is capped at the lesser of 120px (absolute desktop ceiling) or 15% of the viewport's
  short axis (mobile safety — prevents singularity filling the screen)
- The influence radius always scales proportionally with the absorption radius (4:1 ratio,
  maintained by the Singularity system via `setRadius`)

## Formulas

**Radius from total absorbed:**
```
radius = ABSORPTION_RADIUS + GROWTH_SCALE * sqrt(totalAbsorbed)
```
- `ABSORPTION_RADIUS = 30px` — base radius at game start
- `GROWTH_SCALE = 2` — pixels added per sqrt-unit of absorptions

**Max radius (evaluated at each absorption event):**
```
maxRadius = max(ABSORPTION_RADIUS, min(viewport_short_axis * 0.15, MAX_RADIUS_ABS))
```
- `MAX_RADIUS_ABS = 120px` — desktop ceiling
- `MAX_RADIUS_VIEWPORT_FRACTION = 0.15`

**Final radius:**
```
radius = min(computedRadius, maxRadius)
```

**Example progression:**

| Total absorbed | Computed radius | Notes |
|---------------|----------------|-------|
| 0 | 30px | Game start |
| 25 | 40px | First 25 absorbs |
| 100 | 50px | +10px from first 100 |
| 225 | 60px | +10px from next 125 |
| 400 | 70px | Diminishing returns |
| 900 | 90px | |
| 2025 | 120px | Desktop cap reached |

**On mobile (375px viewport):**
- `maxRadius = min(375 * 0.15, 120) = min(56.25, 120) = 56.25px`
- Cap reached at: `(56.25 - 30)² / 4 = 173 absorbs`

## Edge Cases

- Viewport is evaluated fresh on each absorption event (not cached), so a resize mid-session
  is handled correctly — though the game does not officially support mid-session resize
- Once capped, additional absorbs continue to increment score and thresholds; only the visual
  radius stops growing
- `getMaxRadius()` has a lower bound of `ABSORPTION_RADIUS` to prevent the max from ever
  being set below the starting radius (defensive guard; should not occur in practice)

## Dependencies

| System | Role |
|--------|------|
| Absorption System | `onAbsorb(count)` drives growth |
| Singularity | `setRadius()` applies the new radius; `ABSORPTION_RADIUS` provides the base |
| Game State Machine | `onStateChange` resets growth counter on new game |

## Tuning Knobs

| Constant | Value | Effect | Safe Range |
|----------|-------|--------|------------|
| `GROWTH_SCALE` | 2 | px per sqrt-absorb; higher = faster growth | 1–4 |
| `MAX_RADIUS_ABS` | 120px | Desktop ceiling | 80–160 |
| `MAX_RADIUS_VIEWPORT_FRACTION` | 0.15 | Mobile safety multiplier | 0.10–0.20 |

## Acceptance Criteria

- [ ] Singularity is visually larger after absorbing particles
- [ ] Growth is front-loaded — early absorbs produce more visible growth than late absorbs
- [ ] Singularity never exceeds 120px radius on a 1920px wide viewport
- [ ] Singularity never exceeds 15% of the short viewport axis on mobile
- [ ] Singularity resets to 30px radius at the start of each new game
- [ ] Growth never reverses mid-run

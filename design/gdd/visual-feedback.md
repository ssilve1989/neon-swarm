---
status: reverse-documented
source: src/systems/visual-feedback.ts
date: 2026-03-22
---

# Visual Feedback

> **Note**: Reverse-engineered from implementation. Captures current behavior and confirmed design intent.

## Overview

Visual Feedback provides screen-space juice on milestone events. Currently: a white bloom flash
on threshold crossings. A chromatic aberration (CA) post-process filter is implemented but
inactive and may be removed in a future sprint.

## Player Fantasy

The screen briefly erupts on a milestone hit. It's visceral confirmation — something big just
happened — without obscuring gameplay. The flash is sharp and fast.

## Detailed Rules

### Bloom Flash

- Triggered by each `onThreshold` event (all modes)
- A white full-screen rectangle overlaid at alpha 0.35
- Decays multiplicatively each frame: `alpha *= 0.88`
- Cleared (set to 0 and rectangle removed) when alpha drops below 0.004
- The flash overlay has no game-state guard — it plays out even if game-over triggers mid-flash

### Chromatic Aberration Filter (Inactive)

- A GLSL post-process filter shifting the R channel right and B channel left by `uOffset` pixels
- Currently `chromaTarget = 0`; the filter is effectively disabled (`chromaFilter.enabled = false`)
- Infrastructure retained in case the effect is re-enabled in a future sprint
- **May be removed** if the design direction confirms it is not wanted

## Formulas

**Flash decay:**
```
flashAlpha *= 0.88   (per frame, ~60fps)
```

Approximate duration at 60fps:
| Frame | Alpha |
|-------|-------|
| 0 | 0.350 |
| 5 | 0.189 |
| 10 | 0.102 |
| 15 | 0.055 |
| 20 | 0.030 |
| 26 | ~0.004 (cleared) |

Total visible duration: ~26 frames (~430ms at 60fps)

**CA lerp (currently inactive):**
```
chromaCurrent += (chromaTarget - chromaCurrent) * 0.1
```
`chromaTarget` is always 0, so `chromaCurrent` always decays to 0.

## Edge Cases

- **Multiple thresholds in one frame:** the second threshold resets `flashAlpha` to 0.35,
  effectively refreshing the flash. Visually identical to a single flash.
- **Flash during game-over:** no state guard on the ticker. If the clock expires while a flash
  is playing, the flash continues to decay on the game-over overlay — acceptable behavior.
- **CA filter:** even though `chromaFilter.enabled` toggles based on `chromaCurrent`, it is
  always false in practice because `chromaTarget` is 0. The `void CHROMA_MAX` at file end
  suppresses the compiler unused-variable warning for the reserved constant.

## Dependencies

| System | Role |
|--------|------|
| Threshold Events | `onThreshold` triggers the bloom flash |
| Absorption System | `onAbsorb` subscribed (currently no active behavior) |
| PixiJS Application | `app.stage.filters` — CA filter applied to entire stage |

## Tuning Knobs

| Constant | Value | Effect | Safe Range |
|----------|-------|--------|------------|
| `flashAlpha` initial | 0.35 | Flash intensity at trigger | 0.2–0.6 |
| Decay factor | 0.88 | Per-frame multiplier; lower = shorter flash | 0.80–0.95 |
| Cutoff threshold | 0.004 | Snap-to-zero point | 0.001–0.01 |

## Acceptance Criteria

- [ ] White flash appears on threshold crossing (all modes)
- [ ] Flash fades out over approximately 26 frames (~430ms)
- [ ] No flash occurs during normal play (only on threshold events)
- [ ] No chromatic aberration visible during any gameplay state
- [ ] Flash does not interfere with game-over overlay visibility

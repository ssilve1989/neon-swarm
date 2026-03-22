# Prototype: Particle System

**Hypothesis:** PixiJS (WebGL) can render 10,000+ additive-blended, tinted
sprites at stable 60fps in a desktop browser with frame budget headroom for
game logic.

**Status:** Concluded — PROCEED

## How to Run

```bash
npx serve prototypes/particle-system --listen 3456
# open http://localhost:3456
```

Use the count buttons (1k / 5k / 10k / 15k / 20k) to benchmark each tier.
The overlay shows live FPS and JS frame time.

## Findings

Tested in Chrome on a 120Hz desktop display:

| Count | FPS | JS time |
|-------|-----|---------|
| 1k | 120 | 0.3–0.7ms |
| 5k | 120 | 1–2ms |
| 10k | 120 | 1–2.5ms |
| 15k | 120 | 1–1.2ms |
| 20k | 120 | 1.6–2ms |

**Verdict:** The particle renderer is not a performance risk. At 10k particles
~70% of the 8.3ms frame budget (120fps) remains after the JS update loop.
All sprites batch to ~1 GPU draw call (shared texture + shared blend mode).

**Next prototype to run:** Absorption System — spatial query performance
against 10k particles per frame is the only remaining technical unknown.

See full analysis: `REPORT.md`

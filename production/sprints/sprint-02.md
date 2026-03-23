# Sprint 2 — Neon Swarm: Core Loop Simplification

**Status**: Complete
**Closed**: 2026-03-22

## Sprint Goal

Simplify the core loop by removing the combo multiplier, add particle density ramp, and surface clock extensions clearly to the player.

---

## Completed

| ID | Task | Notes |
|----|------|-------|
| S2-01 | Particle density ramp | Standard particles start at 2% of device-tier budget, ramp to full density over 60s of active play. Pauses when game is paused. |
| S2-02 | Remove combo/multiplier system | `combo.ts` deleted. Score is now raw absorption count. Singularity grows on cumulative absorbs (never shrinks). Threshold triggers rewritten to absorption-count based (50/200/500). |
| S2-03 | Clock extension feedback | "+5s" toast floats up from the clock on time extension (Standard only); clock pulses cyan 1.35× scale for 350ms; ascending C5→G5 chime plays via Web Audio API. |

---

## Deferred to Sprint 3

| ID | Task | Reason |
|----|------|--------|
| S3-01 | Nova burst | CA filter caused blur when visual-feedback was wired in; needs dedicated visual pass |
| S3-02 | Special particle types (Time, Repulsor) | Hard to distinguish at density; time particles made timer unbeatable; needs redesign |
| S3-03 | High Score | Stretch goal; localStorage per-mode personal bests |

---

## Definition of Done — Met

- [x] Particle field starts sparse and ramps to full density during play
- [x] No combo timer or multiplier in any UI surface
- [x] Score is legible and meaningful without a multiplier
- [x] Clock extension is visually and audibly confirmed to the player
- [x] Thresholds fire at meaningful absorption milestones (50/200/500)
- [x] No regressions in Standard, Blitz, or Zen modes

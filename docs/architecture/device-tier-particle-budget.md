# ADR: Device-Tier Particle Budget via Viewport Width

**Status**: Accepted
**Date**: 2026-03-22
**Affects**: `src/utils/device-tier.ts`, `src/systems/particles.ts`

## Context

The particle pool (`Float32Array` + `Sprite` array) is allocated once at startup
and never resized. 10,000 particles saturate the physics loop on mobile devices —
two O(n) tickers execute every frame. Device capability detection is needed to
set the pool size before allocation.

The prototype report (`prototypes/particle-system/REPORT.md`) left mobile
performance as an explicit unknown and suggested `navigator.hardwareConcurrency
< 4` as a possible detection heuristic.

## Decision

Use `window.innerWidth` breakpoints evaluated once at module load:

| Tier | Breakpoint | Pool Size | Density (per 1000 px²) |
|------|-----------|-----------|------------------------|
| Mobile | ≤ 768px | 1,000 | ~2.7 |
| Tablet | 769–1199px | 3,000 | ~4.0 |
| Desktop | ≥ 1200px | 10,000 | ~4.8 |

All breakpoints and counts live in `src/utils/device-tier.ts` as the single
source of truth. The exported `DeviceTier` type is available to any future
system that needs to branch on tier.

## Alternatives Considered

**`navigator.hardwareConcurrency` heuristic (prototype suggestion)**
Rejected. CPU core count does not reliably correlate with GPU fill rate or
sustained JS throughput — a flagship phone has 8+ cores but thermal throttles
under sustained load. Viewport width is a direct proxy for what the user is
experiencing and matches the established breakpoints used elsewhere in the
codebase (e.g. singularity growth viewport capping).

**Dynamic resize listener**
Rejected. The `Float32Array` buffers and `Sprite` array are sized at init.
Resizing at runtime requires destroying and rebuilding the entire particle
container — a guaranteed frame-drop event. The edge case (orientation change
mid-session) is rare, and a page reload is the conventional PWA pattern.

**Continuous density formula (`count = viewport_area × k`)**
Rejected. Produces non-integer counts, complicates typed array allocation,
and is harder to QA than three discrete tiers.

**Single universal lower count**
Rejected. A count safe for mobile (e.g. 3,000) is visually sparse on desktop
and discards the validated headroom from the prototype (70%+ frame budget
remaining at 10k on desktop).

## Consequences

- Pool size is fixed for the session; a page reload is required after an
  orientation change (accepted limitation for this PWA)
- Three discrete tiers are straightforward to QA: test at 375px, 1024px, 1920px
- Per-frame physics loop work reduced by 10× on mobile (10k → 1k iterations)
- `DeviceTier` is exported and available project-wide for any future
  tier-aware system

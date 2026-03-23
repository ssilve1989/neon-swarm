# ADR-002: PixiJS v8 as the 2D Renderer

**Status**: Accepted
**Date**: 2026-03-22
**Affects**: `src/app.ts`, `src/systems/particles.ts`, `src/systems/visual-feedback.ts`

## Context

Neon Swarm is a browser-based arcade game that renders 1,000–10,000 moving
sprites per frame (device-tiered particle pool — see ADR-001). The renderer
must sustain 60 fps across desktop and mobile, minimise draw calls, and
integrate cleanly with TypeScript.

The core rendering challenge is the particle field: thousands of small colored
sprites that move every frame. Naively issuing one draw call per sprite would
saturate the GPU command queue well before the particle budget is reached.

## Decision

Use **PixiJS v8** with the following configuration:

```ts
await app.init({
  resizeTo: window,
  backgroundColor: 0x000000,
  antialias: false,
  preference: "webgl",
  powerPreference: "high-performance",
});
```

All particles are added to a single `Container`. PixiJS v8 batches these into
**one draw call** per frame via its built-in sprite batcher, provided sprites
share a texture atlas (which they do — all particles use the same circle
texture generated at startup).

`antialias: false` is deliberate: the neon-on-black aesthetic does not require
anti-aliasing, and disabling it reduces GPU memory pressure on mobile.

## Alternatives Considered

**Canvas 2D API (`CanvasRenderingContext2D`)**
Rejected. Canvas 2D issues one draw call per `drawImage()` or `fillRect()`.
At 10,000 particles this would exhaust the frame budget on any device. No
batching mechanism exists without reimplementing a sprite batcher from scratch.

**Three.js (WebGL)**
Rejected. Three.js targets 3D scenes and carries significant bundle overhead
(geometry, materials, scene graph, camera) that adds no value for a flat 2D
arcade game. PixiJS v8 is purpose-built for 2D sprite batching and has a
smaller footprint.

**Raw WebGL**
Rejected. Writing and maintaining GLSL shaders, buffer management, and a
sprite batcher from scratch would consume significant development time with no
gameplay benefit. PixiJS provides all of this with a well-tested, maintained
implementation.

**PixiJS v7**
Not considered. v8 was current at project start and introduced a new renderer
architecture with improved batching performance. No reason to adopt an older
version.

## Consequences

- All 1,000–10,000 particles render in a single WebGL draw call — frame budget
  is dominated by JS physics, not GPU submission
- PixiJS `Ticker` is used as the main game loop — all per-frame systems hook
  into `app.ticker.add()`
- The `Application` instance is exported from `src/app.ts` as a singleton and
  imported by any system that needs the stage or ticker
- Bundle size increases by ~400 KB (minified+gzip) for the PixiJS runtime
- Visual effects (additive blending for glow) are achievable via PixiJS
  `BlendMode` without custom shaders

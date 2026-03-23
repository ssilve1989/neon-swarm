# ADR-004: Manual Physics — Euler Integration and Spatial Grid

**Status**: Accepted
**Date**: 2026-03-22
**Affects**: `src/systems/particles.ts`, `src/systems/absorption.ts`

## Context

The particle field requires per-frame physics for 1,000–10,000 particles:
position update, boundary wrapping, and singularity gravity/swirl forces.
The absorption system must also query "which particles are within radius R of
point P?" every frame — naively an O(n) operation per query.

At 10,000 particles, every per-frame algorithm must stay well within the
physics JS time budget (~4ms at 60fps, leaving ~12ms for rendering and other
systems).

## Decision

**No physics library.** All motion is implemented as manual semi-implicit
Euler integration over typed arrays:

```ts
export const px = new Float32Array(PARTICLE_COUNT);
export const py = new Float32Array(PARTICLE_COUNT);
export const vx = new Float32Array(PARTICLE_COUNT);
export const vy = new Float32Array(PARTICLE_COUNT);
```

Each tick:
```
vx[i] += ax * dt
vy[i] += ay * dt
px[i] += vx[i]
py[i] += vy[i]
```

`Float32Array` is used throughout (not `number[]`) to keep data in a compact,
cache-friendly memory layout and avoid JS object overhead.

**Spatial grid for proximity queries.** A uniform 128px cell hash grid is
rebuilt each frame using `Int32Array` linked lists (`cellHeads`, `cellNext`).
`getParticlesInRegion(cx, cy, radius)` walks only the cells that overlap the
query AABB — O(k) where k is the number of particles in the region, rather
than O(n) over the entire pool.

## Alternatives Considered

**Matter.js**
Rejected. Matter.js models rigid bodies with mass, restitution, and constraint
solving — none of which are needed. Particles in Neon Swarm have no
collisions with each other; only the singularity exerts force on them.
Wrapping 10,000 Matter bodies would impose constraint-solver overhead that
buys nothing.

**Rapier (WASM physics)**
Rejected. WASM startup cost, bundle size (~1.5 MB), and the async init
requirement add significant complexity for a game whose physics is two lines
of Euler integration per particle. Rapier is the right choice for games
needing rigid body simulation; this is not that game.

**Naive O(n) proximity scan per frame**
Rejected after profiling the prototype. At 10,000 particles, a per-particle
distance check every frame costs ~2ms in isolation — acceptable, but leaves
no headroom for gravity/swirl force application on the returned candidates.
The spatial grid reduces the proximity query to ~0.1ms, bringing total physics
JS time to ~2ms at desktop tier.

**`number[]` arrays instead of `Float32Array`**
Rejected. Standard JS arrays store boxed doubles and are not guaranteed to be
stored contiguously in memory. `Float32Array` guarantees compact layout,
avoids GC pressure from boxed values, and is directly accessible to future
WASM or GPU compute paths.

## Consequences

- Physics is entirely under project control — tuning constants are plain
  TypeScript constants, not library configuration objects
- `Float32Array` buffers are allocated once at init and never reallocated —
  zero per-frame GC pressure from the physics layer
- The spatial grid is rebuilt from scratch every frame (O(n) rebuild) which
  is cheaper than maintaining an incremental structure given that all particles
  move every tick
- Adding new force types (repulsor, attractor) requires only adding to the
  per-particle force accumulation loop — no library API to extend
- The Euler integrator has no energy conservation guarantee; particles
  absorbed into the singularity can acquire unbounded velocity if time steps
  are large (not an issue at 60fps fixed tick)

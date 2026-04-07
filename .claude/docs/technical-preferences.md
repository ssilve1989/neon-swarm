# Technical Preferences

<!-- Populated by /setup-engine. Updated as the user makes decisions throughout development. -->
<!-- All agents reference this file for project-specific standards and conventions. -->

## Engine & Language

- **Engine**: PixiJS v8 (browser-based, no native engine)
- **Language**: TypeScript (Vite build, strict mode)
- **Rendering**: WebGL via PixiJS v8 — additive blending for particles, single draw call via Container + shared texture
- **Physics**: Custom — manual Euler integration (velocity arrays `vx[]`/`vy[]`), no physics library

## Naming Conventions

- **Types/Interfaces**: PascalCase (e.g. `GameState`, `GameMode`, `ComboBreakListener`)
- **Variables & Functions**: camelCase (e.g. `multiplier`, `getMultiplier`, `breakListeners`)
- **Event Callbacks**: `onX(fn)` pattern, returns an unsubscribe function (e.g. `onComboBreak`, `onStateChange`)
- **Files**: kebab-case (e.g. `singularity-growth.ts`, `game-over-screen.ts`)
- **Scenes/Prefabs**: N/A — web game, no scene system
- **Constants**: SCREAMING_SNAKE_CASE (e.g. `COMBO_DURATION`)

## Performance Budgets

- **Target Framerate**: 60 fps (all tiers)
- **Frame Budget**: 16.67ms
- **Draw Calls**: ~1 (PixiJS batches all particles into a single draw call via Container + shared texture)
- **Memory Ceiling**: Not formally budgeted — monitor via DevTools heap snapshots

### Particle Budget by Device Tier

Tier classification is determined at startup by `src/utils/device-tier.ts`.

| Tier | Viewport Width | Particle Count | Density (per 1000 px²) |
|------|---------------|----------------|------------------------|
| Mobile | ≤ 768px | 1,000 | ~2.7 |
| Tablet | 769–1199px | 3,000 | ~4.0 |
| Desktop | ≥ 1200px | 10,000 | ~4.8 |

Tier is read-once at page load. A page reload is required for tier changes (e.g. orientation change).

## Testing

- **Framework**: Vitest (unit tests in `tests/unit/`)
- **Minimum Coverage**: Not formally set — cover all gameplay formula systems
- **Required Tests**: Score formula, combo timer, clock countdown, singularity growth curve, threshold crossings

## Forbidden Patterns

- No audio files for sound effects — Web Audio API only (procedural oscillators, sample-accurate scheduling); BGM uses HTML Audio Element with an MP3 asset — see ADR-003
- No physics library — all motion is manual Euler integration
- No `as any` type casts — fix type errors with proper narrowing

## Deployment

- **Production server**: Hono (`hono/bun`) serving static `dist/` — see `serve.ts` at project root
- **Run command**: `bun run serve.ts`
- **Health endpoint**: `GET /health` → `200 ok`
- **Port**: 3000 (hardcoded)

## Allowed Libraries / Addons

- **PixiJS v8** — rendering, ticker, container/sprite management
- **Vite** — build and dev server
- **Vitest** — unit testing
- **Hono** — production static-file server (Bun runtime only)

## Architecture Decisions Log

- [ADR-001] Device-tier particle budget — `docs/architecture/device-tier-particle-budget.md`
- [ADR-002] PixiJS v8 as renderer — `docs/architecture/adr-002-pixijs-v8-renderer.md`
- [ADR-003] Audio hybrid (HTML Audio + Web Audio API) — `docs/architecture/adr-003-audio-hybrid.md`
- [ADR-004] Manual physics (Euler integration + spatial grid) — `docs/architecture/adr-004-manual-physics.md`
- [ADR-005] Game state machine (module-level observer) — `docs/architecture/adr-005-game-state-machine.md`
- [ADR-006] Hono/Bun production server — `docs/architecture/adr-006-production-server.md`

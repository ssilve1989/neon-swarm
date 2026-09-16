# Neon Swarm

A fast-paced arcade web game. Sweep a glowing singularity across thousands of neon
particles, absorbing everything in your path to earn time extensions before the clock
runs out.

## How It Plays

Move the cursor (mouse or touch) and the singularity follows. Collide with particles
to absorb them — every absorption adds to your count, the singularity grows permanently,
and growth widens its absorption radius. The particle field ramps from sparse to dense
over 60 seconds of play.

The threat is the clock:

| Mode | Clock | Extensions |
|------|-------|------------|
| **Standard** | 30s | +5s at 50 / 200 / 500 absorptions |
| **Blitz** | 15s | None — pure ceiling run |
| **Zen** | None | Play indefinitely, quit anytime |

Your score is total absorptions; per-mode personal bests persist in `localStorage`.

## Features

- **10,000+ neon particles at 60fps** — sweeps stay smooth on desktop and mobile alike, tuned to what your device can handle
- **Sound, synthesized live** — every blip and chime is generated in the browser; the only audio file is the ambient BGM
- **Nova burst** — cross a milestone and the singularity surges ~3× wide, vacuuming up everything in reach
- **Three modes, per-mode high scores, and a shareable score card** you can save as an image
- **Installable PWA** — works offline, and updates itself in the background
- **No game engine** — just TypeScript and a bare WebGL canvas

## Tech Stack

- **Language**: TypeScript (no build-time type stripping; standard `tsc` config)
- **Renderer**: PixiJS v8 (WebGL, additive blending)
- **Build**: Vite + `vite-plugin-pwa`
- **Server**: Hono + `@hono/node-server` (`serve.ts`), static files from `dist`, run directly by Node's native TS support
- **Deploy**: Fly.io (Dockerfile + `fly.toml`)
- **QA**: Vitest (unit tests), Biome (lint/format), Lefthook + commitlint (git hooks)

## Getting Started

Requires [Node](https://nodejs.org) 26+, [pnpm](https://pnpm.io) 12, and
[mise](https://mise.jdx.dev) (pins both via `mise.toml`).

```bash
pnpm install     # install dependencies
pnpm dev         # start Vite dev server
pnpm test        # run unit tests
pnpm lint        # lint + autofix (Biome)
pnpm build       # production build to dist/
pnpm preview     # serve the production build
```

## Deployment

Production runs as a static site served by Hono on `@hono/node-server`, run
directly by Node (native TypeScript support, no build step), containerized via
`Dockerfile` and deployed to Fly.io as the `neon-swarm` app:

```bash
pnpm build
fly deploy
```

`GET /health` reports liveness; the server falls back to `dist/index.html` for
client-side routing.

## Project Structure

```
design/gdd/            Game design documents (concept, modes, systems)
docs/architecture/     ADRs — renderer, audio, physics, state machine, server
src/                   Game source
  app.ts, main.ts, state.ts, types.ts
  systems/             absorption, audio, clock, input, particles, scoring,
                       singularity, singularity-growth, threshold, nova-burst, …
  ui/                  hud, mode-selection, pause-overlay, game-over-screen, …
  utils/               device-tier (particle budget)
tests/                 Unit tests + smoke/regression suites
assets/audio/          BGM
production/            Sprints, stage reports, releases
```

## Design & Architecture

- `design/gdd/game-concept.md` — one-line pitch, core loop, design pillars
- `docs/architecture/adr-002-pixijs-v8-renderer.md` — why PixiJS, batching rationale
- `docs/architecture/adr-003-audio-hybrid.md` — BGM vs. effects audio split
- `docs/architecture/adr-004-manual-physics.md` — hand-rolled collision, no engine
- `docs/architecture/adr-005-game-state-machine.md` — mode-select / playing / paused / game-over
- `docs/architecture/adr-007-production-server-node.md` — Bun → Node + `@hono/node-server` (supersedes ADR-006)

## License

MIT. See [LICENSE](LICENSE).

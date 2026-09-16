# ADR-007: Node.js + @hono/node-server Production Server

**Status**: Accepted (supersedes ADR-006)
**Date**: 2026-09-15
**Deciders**: Steve

---

## Context

### Problem Statement

ADR-006 chose Bun (`hono/bun`) as the runtime and static-file server for Neon Swarm.
The surrounding toolchain has since moved to **pnpm 12 + Node.js 26**: `mise.toml` pin
switched from `bun` to `node`/`pnpm`, the lockfile is now `pnpm-lock.yaml`, and the
test/lint tools run under Node via pnpm. Keeping Bun purely for the production server
would mean:

- A second runtime installed on dev machines (Bun) for a single 10-line file
- A Split toolchain: pnpm on Node for everything except the server (Bun)
- `hono/bun` imports that cannot run under Node at all

### Constraints

- Must serve static files from `dist/` with SPA fallback to `index.html`
- Must expose a `/health` endpoint for Fly.io uptime checks
- Must stay a single small file (`serve.ts`), runnable without a build step
- Must run inside the Docker image described by `Dockerfile`

### Requirements

- Runs on the project's pinned runtime (Node 26), not a second runtime
- Uses the same production server framework as before (Hono) to minimize churn
- Composable with the existing `fly.toml` health check (GET `/health`, port 3000)

---

## Decision

Run `serve.ts` under **Node 26's native TypeScript support** (no build step) using
**Hono** with **`@hono/node-server`** for the HTTP listener and
**`@hono/node-server/serve-static`** for static files:

```ts
import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";

const app = new Hono();

app.get("/health", (c) => c.text("ok"));
app.use("*", serveStatic({ root: "./dist" }));
app.use("*", serveStatic({ path: "./dist/index.html" }));

serve({ port: Number(process.env.PORT ?? 3000), fetch: app.fetch });
```

Run with: `node serve.ts`

Key changes from ADR-006:

1. **Runtime**: Bun → Node 26 (native type stripping; Node ≥23.6 runs `.ts` without flags)
2. **HTTP listener**: Bun's `export default { port, fetch }` → `serve()` from `@hono/node-server`
3. **Static middleware**: `hono/bun` → `@hono/node-server/serve-static`
4. **Port**: now overridable via `PORT` env var (`fly.toml` keeps 3000)

### Architecture Diagram

```
Fly.io (docker)
  node:26-slim
    └─ CMD node serve.ts
         └─ @hono/node-server ::3000
              └─ Hono app
                   ├─ GET /health        → "ok"
                   ├─ GET *              → dist/ (static)
                   └─ GET * (unmatched)  → dist/index.html (SPA fallback)
```

### Key Interfaces

- `serve({ port, fetch: app.fetch })` — Node HTTP server entry
- `serveStatic({ root: "./dist" })` — serves built assets
- `serveStatic({ path: "./dist/index.html" })` — SPA fallback for unmatched paths
- `@hono/node-server` added to `dependencies`; `@types/bun` removed

---

## Alternatives Considered

### Alternative 1: Keep Bun (`hono/bun`)
- **Description**: Retain ADR-006 unchanged; Bun remains pinned for the server only
- **Pros**: No server-code change; proven in production since ADR-006
- **Cons**: Second runtime on dev machines and in CI; Bun's install uses a second
  lockfile; `hono/bun` cannot run on Node
- **Rejection Reason**: The toolchain is now uniformly Node/pnpm; a lone Bun server
  re-introduces the exact split-runtime friction this project just removed

### Alternative 2: Precompile `serve.ts` and run plain JS
- **Description**: Add a tsc step emitting `serve.js`, run `node serve.js`
- **Pros**: No reliance on runtime type stripping
- **Cons**: Build step for a 10-line file; wastes the native TS support Node ≥23.6 ships
- **Rejection Reason**: Node 26 runs `serve.ts` directly; a compile step adds complexity
  for zero benefit

### Alternative 3: Self-hosted static server (no Hono)
- **Description**: Serve `dist/` with Node's `http` module and hand-rolled MIME/fallback
- **Pros**: Zero dependencies
- **Cons**: Re-implements paths, MIME types, and SPA fallback; loses Hono's ergonomics
- **Rejection Reason**: Hono was already in `dependencies`; `@hono/node-server` reuses it

---

## Consequences

### Positive

- Single runtime (Node 26) across dev, CI, and production
- `serve.ts` still < 10 lines; unchanged route semantics
- Node native type stripping removes any build step for the server
- `PORT` override removes the previously hardcoded port

### Negative

- `@hono/node-server` adds roughly ~100 KB to `node_modules` (runtime-only, not bundled)
- Requires Node ≥23.6 (project pins 26 via `mise.toml` and `engines`)

### Risks

- **Node type stripping behavior changes** — mitigations: pin Node 26 in `mise.toml`,
  `engines`, and the `node:26-slim` Docker base
- **`@hono/node-server` v2 API differences** — mitigations: verified against `serve()`
  signature at install; covered by the smoke test in CI/deploy

---

## Performance Implications

- **CPU**: Negligible; per-request overhead comparable to Bun's server for static files
- **Memory**: Negligible difference at this scale (single VM, 256 MB on Fly.io)
- **Load Time**: Cold start dominated by Node startup (~tens of ms), same order as Bun
- **Network**: Unchanged; same static file responses over same 3000 port

---

## Migration Plan

1. `mise.toml`: `bun = "1.3.11"` → `node = "26"` + `pnpm = "12"`
2. `package.json`: replace `@types/bun` with `@hono/node-server` dependency; scripts
   drop `bun --bun`; add `engines.node >= 26` and `packageManager: pnpm@12.4.2`
3. `serve.ts`: rewrite per the Decision above
4. `Dockerfile`: `oven/bun` → `node:26-slim`, `bun install` → `pnpm install --frozen-lockfile`
5. `lefthook.yml`: `bunx --bun biome|commitlint` → `pnpm exec …`
6. Delete `bun.lock`; regenerate `pnpm-lock.yaml` via `pnpm install`
7. Verify with `pnpm check`, `pnpm test`, `pnpm build`, and a `node serve.ts` smoke test

---

## Validation Criteria

- `pnpm build && node serve.ts` serves `index.html` and `/health` returns `ok`
- `pnpm test` passes fully under Node 26
- Docker image builds and the Fly.io health check (GET `/health` :3000) passes after deploy
- No `bun`/`oven/bun`/`bunx` references remain in tracked files

---

## Related Decisions

- **Supersedes**: [ADR-006: Hono/Bun Production Server](./adr-006-production-server.md)
- **References**: ADR-002 (PixiJS renderer), ADR-003 (audio), ADR-004 (manual physics)

---

## Status Update (supersedes ADR-006)

ADR-006 is marked superseded by this decision. Its `hono/bun` import and `export default`
server shape no longer reflect the running system.
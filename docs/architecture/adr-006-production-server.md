# ADR-006: Hono/Bun Production Server

**Status**: Accepted
**Date**: 2026-04-05
**Deciders**: Steve

---

## Context

Neon Swarm is a static web game built with Vite. The `dist/` directory produced by
`vite build` must be served over HTTP with proper SPA fallback (all paths → `index.html`)
for PWA and deep-link support. A lightweight production server is needed that:

- Serves static files from `dist/`
- Falls back to `index.html` for unmatched routes
- Responds to a `/health` endpoint for uptime monitoring
- Runs natively under Bun without a separate Node.js install

---

## Decision

Use **Hono** with Bun's native HTTP server (`hono/bun`) as the production static-file server,
defined in `serve.ts` at the project root.

```ts
import { Hono } from "hono";
import { serveStatic } from "hono/bun";

const app = new Hono();
app.get("/health", (c) => c.text("ok"));
app.use("*", serveStatic({ root: "./dist" }));
app.use("*", serveStatic({ path: "./dist/index.html" }));

export default { port: 3000, fetch: app.fetch, development: false };
```

Run with: `bun run serve.ts`

`development: false` disables Bun's error overlay in production, preventing the
overlay from intercepting unhandled errors and displaying them to players.

---

## Alternatives Considered

| Option | Rejected Because |
|--------|-----------------|
| `vite preview` | Not intended for production; no health endpoint |
| `serve` (npm) | Requires Node.js; extra dependency for a trivial use case |
| Nginx/Caddy | Heavyweight for a single-file static game |
| Express | Node.js; Bun already available; Hono is faster and lighter |

---

## Consequences

- **Positive**: Zero-config static serving; health endpoint for uptime checks; runs on Bun
- **Positive**: `serve.ts` is < 10 lines — minimal maintenance burden
- **Neutral**: `hono` and `hono/bun` must be listed in `dependencies` (not `devDependencies`)
- **Neutral**: Port 3000 is hardcoded; override via environment variable if needed in future

# Mutators — Frame Budget Check (2026-10-10)

Build: `feat/mutators`, `pnpm build` + `vite preview`, Chromium (Playwright), Apple Silicon Mac.

## Mobile tier (390×844 viewport → 1,000 particles), CPU throttled 6× via CDP

| Build (3 drafts) | Before drafts fps / p95 frame | Stacked fps / p95 frame |
|---|---|---|
| OVERCLOCK · GREED | 121 / 9.2ms | 120 / 9.2ms |
| OVERCLOCK · VORTEX · SURGE | 121 / 9.2ms | 121 / 9.2ms |
| MAGNET · VORTEX · HEAVY | 121 / 9.1ms | 120 / 9.1ms |

## Desktop tier (1400×900 → 10,000 particles), no throttle

HEAVY · OVERCLOCK · VORTEX at full density: 120fps (display cap).

## Verdict input

Every mutator stack stays far inside the 16.67ms budget, including Vortex (one extra
sqrt per particle per frame). CPU throttling does not slow the GPU, and no physical
phone was tested.

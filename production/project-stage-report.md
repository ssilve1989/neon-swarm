# Project Stage Analysis — Neon Swarm

**Date**: 2026-03-22
**Stage**: Production
**Detection Method**: Auto-detected (no `production/stage.txt`)

---

## Completeness Overview

| Area | Score | Detail |
|------|-------|--------|
| Design | 65% | 5 GDD docs; only 2 have full 8-section specs; 10+ systems have no design doc |
| Code | 88% | 14/17 systems implemented; 2 need v1.1 updates; 1 not started (High Score) |
| Architecture | 20% | 1 ADR (device-tier-particle-budget); major decisions undocumented |
| Production | 75% | Sprint-02 active; release checklist exists; 1 resolved bug; 3 hotfixes landed |
| Tests | 70% | 6 test files covering all formula systems; no integration or UI tests |

---

## Artifact Inventory

### Design (`design/`)
- `design/gdd/game-concept.md` — concept doc
- `design/gdd/systems-index.md` — 17 systems tracked; 14 implemented, 2 need updates, 1 not started
- `design/gdd/game-state-machine.md` — full 8-section spec
- `design/gdd/mode-selection.md` — full 8-section spec
- `design/gdd/particles.md` — partial (no 8-section format confirmed)
- No narrative docs (`design/narrative/`)
- No level docs (`design/levels/`) — N/A for arcade format

Systems with no design doc (source listed as doc in systems-index):
Singularity, Combo & Multiplier, Session Clock, Scoring, Absorption System,
Singularity Growth, Threshold Events, Audio, Visual Feedback, HUD, Game Over Screen

### Source Code (`src/`)
- 23 TypeScript files
- Directories: `systems/` (10 files), `ui/` (5 files), `utils/` (1 file)
- Entry points: `app.ts`, `main.ts`, `state.ts`, `types.ts`

### Architecture (`docs/architecture/`)
- `device-tier-particle-budget.md` (ADR-001)
- Missing ADRs: Web Audio API choice, PixiJS v8 renderer, spatial grid for collision,
  game state machine pattern

### Production (`production/`)
- Active sprint: sprint-02 (0% complete — all tasks open)
- Release checklist: `releases/release-checklist-0.1.0.md`
- Patch notes: `releases/patch-note-2026-03-22.md`
- Hotfixes (3, all 2026-03-22): singularity-teleport, singularity-size-cap, pwa-install-button
- Bugs: BUG-0001 (Resolved — game-restart state not reset)

### Tests (`tests/unit/`)
- `state.test.ts`, `combo.test.ts`, `clock.test.ts`, `scoring.test.ts`,
  `singularity-growth.test.ts`, `threshold.test.ts`
- All formula systems covered; no integration or UI tests

### Prototypes (`prototypes/`)
- `particle-system/` — documented (README + REPORT); archived/validated

---

## Gaps Identified

1. **Design docs are thin.** 11 systems in the index reference source files as their design doc.
   These are code, not design specs. Reverse-documentation via `/reverse-document` is an option
   if docs become required for a gate check or onboarding.

2. **Missing ADRs.** Four major architectural decisions lack ADRs: Web Audio API (no audio files),
   PixiJS v8 renderer, spatial grid for particle collision, game state machine pattern.
   Most likely to confuse future contributors or agents.

3. **Sprint-02 not started.** All five tasks (S2-01 through S2-05) are open. No tasks are
   in-progress as of this report.

4. **No milestone definition.** A release checklist exists for 0.1.0 but no milestone document
   defines the scope of "0.1.0 shipped." Sprint plans currently serve this purpose.

---

## Recommended Next Steps

| Priority | Action | Skill |
|----------|--------|-------|
| 1 | Implement S2-01 — nova burst (threshold.ts + visual-feedback.ts) | — |
| 2 | Implement S2-02 — game over peak multiplier display | — |
| 3 | Implement S2-03/S2-04 — Time and Repulsor particle types | — |
| 4 | Create missing ADRs for Web Audio and PixiJS v8 decisions | `/architecture-decision` |
| 5 | Reverse-document key systems if gate check is approaching | `/reverse-document` |
| 6 | Run gate check before declaring sprint-02 complete | `/gate-check` |

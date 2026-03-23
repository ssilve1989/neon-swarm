# Project Stage Analysis — Neon Swarm

**Date**: 2026-03-22
**Stage**: Production
**Detection Method**: Auto-detected (no `production/stage.txt`)
**Last Updated**: 2026-03-22 (post hotfix/timer-reset-on-resume)

---

## Completeness Overview

| Area | Score | Detail |
|------|-------|--------|
| Design | 80% | 14 GDD docs + systems-index; most systems have design coverage |
| Code | 88% | 15/17 systems implemented; 1 removed (Combo & Multiplier); 1 not started (High Score) |
| Architecture | 100% | 5 ADRs covering all major decisions |
| Production | 90% | Sprint 2 closed; 8 hotfixes landed; 0 open bugs; patch notes current |
| Tests | 75% | 37 unit tests across 5 files; no integration or UI tests |

---

## Artifact Inventory

### Design (`design/`)
- `design/gdd/game-concept.md` — concept doc
- `design/gdd/systems-index.md` — 17 systems tracked; 15 implemented, 1 removed, 1 not started
- `design/gdd/game-state-machine.md` — full 8-section spec
- `design/gdd/mode-selection.md` — full 8-section spec
- `design/gdd/particles.md`, `scoring.md`, `absorption.md`, `singularity.md`,
  `singularity-growth.md`, `session-clock.md`, `threshold-events.md`, `audio.md`,
  `visual-feedback.md`, `hud.md`, `game-over-screen.md` — reverse-documented
- No narrative docs (`design/narrative/`) — N/A for arcade format
- No level docs (`design/levels/`) — N/A for arcade format

### Source Code (`src/`)
- 22 TypeScript files
- Directories: `systems/` (10 files), `ui/` (5 files), `utils/` (1 file)
- Entry points: `app.ts`, `main.ts`, `state.ts`, `types.ts`
- `onStateChange` listener API: `(state: GameState, prev: GameState)` — all systems
  use `prev !== "paused"` guard to distinguish new game from resume

### Architecture (`docs/architecture/`)
- ADR-001: `device-tier-particle-budget.md`
- ADR-002: `adr-002-pixijs-v8-renderer.md`
- ADR-003: `adr-003-audio-hybrid.md`
- ADR-004: `adr-004-manual-physics.md`
- ADR-005: `adr-005-game-state-machine.md` (updated to document `(state, prev)` signature)

### Production (`production/`)
- Last completed sprint: sprint-02 (closed 2026-03-22)
- No sprint-03 planned yet
- Release checklist: `releases/release-checklist-0.1.0.md`
- Patch notes: `releases/patch-note-2026-03-22.md` (3 hotfix entries)
- Hotfixes (8, all 2026-03-22): singularity-teleport, singularity-size-cap,
  pwa-install-button, pause-visibility, singularity-start-position, shift-cursor-mode,
  singularity-reset-on-resume, timer-reset-on-resume
- Bugs: BUG-0001 (Resolved — game-restart state not reset, including secondary threshold fix)

### Tests (`tests/unit/`)
- `state.test.ts`, `clock.test.ts`, `scoring.test.ts`,
  `singularity-growth.test.ts`, `threshold.test.ts` — 37 tests, all passing
- All formula systems and state transitions covered
- No integration or UI tests

### Prototypes (`prototypes/`)
- `particle-system/` — documented (README + REPORT); archived/validated

---

## Gaps Identified

1. **No Sprint 3 plan.** Sprint 2 closed with 3 items deferred: Nova Burst (blocked by CA
   filter blur), Time/Repulsor particle types (needs redesign — Time particles made timer
   unbeatable), and High Score (stretch goal). Recommend `/sprint-plan` to plan Sprint 3.

2. **Nova burst and special particles need design direction.** Nova burst was blocked by a
   visual artifact. Special particle types need a redesign pass before implementation.
   Direction should be confirmed before sprint planning.

3. **High Score is the last unimplemented system.** Per-mode localStorage personal bests.
   Marked as Vertical Slice stretch goal — confirm if in scope for Sprint 3.

4. **`threshold.test.ts` has a stale `StateListener` type.** The mock type is
   `(state: string)` instead of `(state: string, prev: string)`. No test failures,
   but inconsistent with the rest of the codebase. 2-line cleanup for Sprint 3.

5. **No integration or UI tests.** All coverage is unit-level. Manual testing is the
   current strategy for UI and integration scenarios.

---

## Recommended Next Steps

| Priority | Action | Skill |
|----------|--------|-------|
| 1 | Decide direction on nova burst and special particles | Design conversation |
| 2 | Plan Sprint 3 | `/sprint-plan` |
| 3 | Run gate check before declaring v0.1.0 ready | `/gate-check` |

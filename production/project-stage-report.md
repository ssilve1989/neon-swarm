# Project Stage Analysis — Neon Swarm

**Date**: 2026-03-22
**Stage**: Production
**Detection Method**: Auto-detected (no `production/stage.txt`)

---

## Completeness Overview

| Area | Score | Detail |
|------|-------|--------|
| Design | 65% | 5 GDD docs; only 2 have full 8-section specs; 11 systems have source files as their "design doc" |
| Code | 88% | 15/17 systems implemented; 1 removed (Combo & Multiplier); 1 not started (High Score) |
| Architecture | 20% | 1 ADR (device-tier-particle-budget); Web Audio API, PixiJS v8, state machine choices undocumented |
| Production | 80% | Sprint 2 closed; no Sprint 3 planned; 6 hotfixes landed; 1 resolved bug |
| Tests | 70% | 6 unit test files covering all formula systems; no integration or UI tests |

---

## Artifact Inventory

### Design (`design/`)
- `design/gdd/game-concept.md` — concept doc
- `design/gdd/systems-index.md` — 17 systems tracked; 15 implemented, 1 removed, 1 not started
- `design/gdd/game-state-machine.md` — full 8-section spec
- `design/gdd/mode-selection.md` — full 8-section spec
- `design/gdd/particles.md` — partial (no 8-section format confirmed)
- No narrative docs (`design/narrative/`) — N/A for arcade format
- No level docs (`design/levels/`) — N/A for arcade format

Systems with no design doc (source file listed as doc in systems-index):
Singularity, Session Clock, Scoring, Absorption System, Singularity Growth,
Threshold Events, Audio, Visual Feedback, HUD, Game Over Screen, High Score

### Source Code (`src/`)
- 22 TypeScript files
- Directories: `systems/` (10 files), `ui/` (5 files), `utils/` (1 file)
- Entry points: `app.ts`, `main.ts`, `state.ts`, `types.ts`

### Architecture (`docs/architecture/`)
- `device-tier-particle-budget.md` (ADR-001)
- Missing ADRs: Web Audio API (no audio files), PixiJS v8 renderer, manual Euler physics,
  game state machine pattern

### Production (`production/`)
- Last completed sprint: sprint-02 (closed 2026-03-22)
- No sprint-03 planned yet
- Release checklist: `releases/release-checklist-0.1.0.md`
- Patch notes: `releases/patch-note-2026-03-22.md`
- Hotfixes (6, all 2026-03-22): singularity-teleport, singularity-size-cap, pwa-install-button,
  pause-visibility, singularity-start-position, shift-cursor-mode
- Bugs: BUG-0001 (Resolved — game-restart state not reset)

### Tests (`tests/unit/`)
- `state.test.ts`, `combo.test.ts`, `clock.test.ts`, `scoring.test.ts`,
  `singularity-growth.test.ts`, `threshold.test.ts`
- All formula systems covered; no integration or UI tests

### Prototypes (`prototypes/`)
- `particle-system/` — documented (README + REPORT); archived/validated

---

## Gaps Identified

1. **No Sprint 3 plan.** Sprint 2 closed with 3 items deferred: Nova Burst (blocked by CA
   filter blur), Time/Repulsor particle types (needs redesign — Time particles made timer
   unbeatable), and High Score (stretch goal). Recommend `/sprint-plan` to plan Sprint 3.

2. **Nova burst and special particles need design revision.** Nova burst was blocked by a
   visual artifact. Special particle types need a redesign pass before implementation.
   Direction should be confirmed before sprint planning.

3. **High Score is the last unimplemented system.** Per-mode localStorage personal bests.
   Marked as Vertical Slice stretch goal — confirm if in scope for Sprint 3.

4. **Missing ADRs.** Four major architectural decisions lack records: Web Audio API choice
   (no audio files), PixiJS v8 renderer, manual Euler physics (no physics library),
   game state machine pattern. Risk for onboarding contributors or agents.

5. **Design docs are thin.** 11 systems reference source files as their design doc.
   These are code, not specs. Run `/reverse-document` if a gate check or new contributor
   onboarding requires formal design coverage.

---

## Recommended Next Steps

| Priority | Action | Skill |
|----------|--------|-------|
| 1 | Plan Sprint 3 (nova burst, special particles, high score) | `/sprint-plan` |
| 2 | Document missing ADRs for Web Audio API and PixiJS v8 | `/architecture-decision` |
| 3 | Reverse-document key systems if gate check is approaching | `/reverse-document` |
| 4 | Run gate check before declaring v0.1.0 ready | `/gate-check` |

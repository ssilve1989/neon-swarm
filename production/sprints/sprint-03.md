# Sprint 3 — Neon Swarm: Polish & Release Prep

**Status**: Complete
**Started**: 2026-04-05
**Closed**: 2026-04-06
**Target**: v0.1.0

## Sprint Goal

Implement nova burst visual polish, add High Score persistence, verify cross-browser readiness, and gate-check for v0.1.0.

## Capacity

- Pace: user-defined (no fixed deadline)
- Buffer: 20% reserved for unplanned work
- Special particle types deferred to post-v0.1.0 (need full redesign, too risky to rush before release)

---

## Tasks

### Must Have (Critical Path)

| ID | Task | Est. | Dependencies | Acceptance Criteria |
|----|------|------|-------------|---------------------|
| S3-01 | **Nova Burst** — supernova animation on threshold event: expanding white→orange/gold shockwave ring (~400px, ~600ms, additive blend), velocity impulse on particles in radius, singularity bloom (2–3× scale, 150ms snap-back), low-freq audio boom + existing chime | M | threshold-events, visual-feedback, particles, audio | Shockwave visible and fades cleanly; particles scatter outward then wrap/drift naturally; singularity flash doesn't break growth state; boom + chime plays on threshold; no frame drop during effect |
| S3-02 | **Update `design/gdd/threshold-events.md`** — add nova burst spec (shockwave params, scatter formula, color, timing) | S | S3-01 design | Doc reflects implemented behavior; tuning knobs for radius, duration, impulse strength documented |
| S3-03 | **Cross-browser audio** — verify Web Audio on Safari (AudioContext resume after user gesture), Firefox, Chrome | S | — | Absorption blip, combo break tone, threshold chime, and nova boom all play on first gesture in Safari; no silent failures; console clean |
| S3-04 | **`threshold.test.ts` StateListener type fix** — update mock type from `(state: string)` to `(state: string, prev: string)` | XS | — | Type matches `onStateChange` signature; tests still pass |

### Should Have

| ID | Task | Est. | Dependencies | Acceptance Criteria |
|----|------|------|-------------|---------------------|
| S3-05 | **High Score** — per-mode personal bests in `localStorage` (Standard, Blitz, Zen separate records); display on game-over screen below final score | M | game-over-screen, scoring, state | New PB is saved and survives page reload; correct mode key used; "Personal Best!" label shown when PB beaten; first play (no stored value) shows nothing |
| S3-06 | **Update `design/gdd/systems-index.md`** — mark High Score as Implemented; mark nova burst in Threshold Events as Done | XS | S3-01, S3-05 | Index reflects current implementation state |

### Nice to Have

| ID | Task | Est. | Dependencies | Acceptance Criteria |
|----|------|------|-------------|---------------------|
| S3-07 | **Gate check for v0.1.0** — run `/gate-check`, update `release-checklist-0.1.0.md`, confirm Go/No-Go | S | S3-01–S3-05 | Gate check passes or blockers are explicitly documented with owner |

---

## Carryover from Sprint 2

| Task | Reason Deferred | Status |
|------|----------------|--------|
| Nova Burst (S3-01) | CA filter caused blur when wired into visual-feedback | Redesigned as supernova animation |
| Special Particle Types | Time particles made timer unbeatable; needs full redesign | **Deferred to post-v0.1.0** |
| High Score (S3-05) | Stretch goal | Included as Should Have |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Shockwave ring + particle impulse causes frame drop | Medium | High | Cap impulse to particles within radius only; measure JS frame time; reduce ring resolution if needed |
| Safari `AudioContext` fails to resume for nova boom | Medium | Low | Nova boom is additive with existing chime; if boom fails silently, chime still plays — acceptable degradation |
| High Score `localStorage` key collision across modes | Low | Medium | Use namespaced keys: `ns_hiscore_standard`, `ns_hiscore_blitz`, `ns_hiscore_zen` |

---

## Definition of Done

- [x] All Must Have tasks complete and pass acceptance criteria
- [x] Nova burst fires on all 3 threshold crossings (50/200/500 absorbs)
- [x] No S1 or S2 bugs in delivered features
- [x] `threshold-events.md` and `systems-index.md` updated
- [x] 45 unit tests passing (no regressions)
- [ ] Cross-browser audio verified on Chrome, Firefox, Safari — **deferred to Polish**

## Playtest
- **Date**: 2026-04-06
- **Result**: No issues found — core loop, nova burst, and high score all felt good

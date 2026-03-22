# Sprint 2 — Neon Swarm v1.1: Remaining Features

## Sprint Goal

Ship the three remaining v1.1 items and add particle variety.

## Capacity

- Pace: user-defined (no fixed deadline)
- Approach: implement directly from systems index and sprint tasks
- Buffer: Particle types (Time, Repulsor) are the main design unknown — validate behavior feel before tuning values

---

## Milestone 1: Finish v1.1

| ID | Task | Est. | Dependencies | Acceptance Criteria |
|----|------|------|-------------|---------------------|
| S2-01 | Nova burst | S | Threshold Events, Visual Feedback | Threshold crossing triggers a radial burst of particles outward from singularity position; visual only, no gameplay effect; distinct from existing white bloom flash |
| S2-02 | Game Over Screen — peak multiplier | S | Scoring, Game Over Screen | Peak multiplier displayed on game over screen alongside final score |

**Checkpoint:** Play a full session to a threshold — nova burst fires. Reach game over — peak multiplier is shown.

---

## Milestone 2: Particle Types

| ID | Task | Est. | Dependencies | Acceptance Criteria |
|----|------|------|-------------|---------------------|
| S2-03 | Time particle | M | Particle System, Session Clock | Visually distinct from standard particles; absorbing one grants a clock extension (Standard/Blitz only, no effect in Zen); spawns at low rate alongside standard particles |
| S2-04 | Repulsor particle | M | Particle System, Singularity, Input System | Visually distinct; exerts a repulsion force on the singularity when within range; destroyed on direct contact with singularity |

**Checkpoint:** Both particle types spawn and behave correctly. Time particle extends clock in Standard. Repulsor pushes singularity away and is destroyed on contact.

---

## Milestone 3: Stretch

| ID | Task | Est. | Dependencies | Acceptance Criteria |
|----|------|------|-------------|---------------------|
| S2-05 | High Score | S | Scoring, Game Over Screen, localStorage | Personal best per mode stored in localStorage; displayed on game over screen; persists across sessions and page reloads |

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Nova burst particles conflict visually with gameplay particles | Medium | Low | Use a distinct color/shape and short lifetime; burst particles should not enter the standard pool |
| Repulsor force feel is hard to tune (too strong = unplayable, too weak = ignored) | High | Medium | Start with a soft push, not a hard wall; expose repulsion radius and force as tuning knobs |
| Time particle spawn rate disrupts game balance | Medium | Medium | Start at ~1–2% of particle pool; adjust after playtesting Standard and Blitz modes |

---

## Definition of Done

- [ ] All M1–M2 tasks complete and pass acceptance criteria
- [ ] Nova burst does not cause frame drops at any device tier
- [ ] Time particle clock extension feels rewarding, not confusing
- [ ] Repulsor adds tension without being punishing
- [ ] No regressions in Standard, Blitz, or Zen modes
- [ ] Stretch (M3): High score persists correctly per mode

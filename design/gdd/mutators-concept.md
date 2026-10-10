# Neon Swarm — Mutators (Post-Launch Feature Concept)

Extends `game-concept.md`. Does not replace it.

## One-Line Pitch

At each absorption milestone the player drafts one of three mutators that change how
the swarm, the singularity, or the scoring rules behave, so every run becomes a
different build. A daily seeded run gives everyone the same offers.

## Creative Brief

Post-launch, the goal is to deepen **expression and creativity**. Timeline is weeks,
the developer has shipped before, and there is no backend. Mutators reuse existing
systems (threshold events, particles, scoring, share card, localStorage).

## Core Verb / Fantasy

- **Verb:** Remix
- **Fantasy:** "I invented a way to play."
- **Hook:** Like Neon Swarm, AND ALSO every run is a different build, with a shareable daily.
- **Primary MDA aesthetic:** Challenge, with expression through play style.

## Core Loop

- **30s:** unchanged. Sweep, absorb, grow. Mutators change the feel, never replace the loop.
- **5 min (one run, three acts):**
  - Act 1 (0–50 absorbs): vanilla, sparse field.
  - Draft 1 at 50: pick 1 of 3. Existing +5s and chime play; the field changes.
  - Act 2 (50–200): first mutator reshapes play. Draft 2 at 200 stacks a second.
  - Act 3 (200–500+): stacked build runs wild. Draft 3 at 500 is the climax pick.
- **Session:** "one more run" becomes "what build can I find this time?" 15–40 builds per session.
- **Progression:** none persistent. Pull is build discovery, the daily seed, and the share card.

### Player Motivation (SDT)

- **Autonomy:** high — build choice is the point.
- **Competence:** moderate — builds amplify skill, not replace it.
- **Relatedness:** light — shared daily seed and build on the share card.

## Mutator Levers

Each mutator pulls exactly one lever.

| Lever | Examples |
|---|---|
| Swarm behavior | Vortex (particles orbit), Skittish (flee at distance), Pulse (field breathes) |
| Singularity powers | Magnet (wider pull, slower), Twin (split cursor), Dash (burst on tap) |
| Rules & scoring | Greed (2x score, faster clock drain), Overclock (+density, +5s per draft), Glass (nova kills growth) |

Names and numbers are placeholders. Final values are data-driven config.

## Pillars

1. **Feel over mechanics** — a mutator ships only if it is visibly and audibly distinct within 2 seconds.
   *Test: if it needs a tooltip to understand, cut or redesign it.*
2. **Zero friction** — the draft is a 3-second glance-and-tap overlay: no menus, no pause.
   *Test: when unsure, choose the pick that keeps the player moving.*
3. **Escalation** — stacking mutators multiplies, not adds.
   *Test: if two mutators don't interact, the second isn't pulling its weight.*
4. **Readable chaos** — the screen can be wild; the cursor and clock must stay legible.
   *Test: if it hurts 60fps or hides the singularity, it doesn't ship.*

Tension: Escalation vs. Readable chaos; Zero friction caps how much a draft can explain.

## Anti-Pillars

- No permanent meta-progression or unlocks — variety comes from builds, not grind (protects Zero friction).
- No mutator that needs explanatory UI beyond a one-word name and an icon (protects Feel over mechanics).
- No server or accounts — the daily seed derives from the date.
- No mutator that breaks the 60fps budget on the Mobile tier.

## Player Type

- **Primary:** Achievers / Experimenters (hunt the broken build, beat their best).
- **Secondary:** Competitors (daily seed, share card).
- **Not for:** players wanting story or long meta-progression.
- **Comparables:** Vampire Survivors, Balatro (synergy stacking drives replay in short runs).

## Scope

### MVP (Target tier)

1. Mutator registry with data-driven definitions (id, lever, params, one-word name).
2. Draft overlay at the 50 / 200 / 500 thresholds (pick 1 of 3, no pause).
3. 6 launch mutators, 2 per lever.
4. Seeded RNG for draft offers; daily seed derived from the date.
5. Build shown on the game-over screen and share card.

### Tiers

| Tier | Contents | Est. |
|---|---|---|
| Minimum | Registry, draft overlay, 4 mutators, Standard only, no daily | ~1.5 weeks |
| Target | MVP above | ~3 weeks |
| Stretch | 10+ mutators, Blitz time-mark drafts, Zen sandbox, per-mutator audio stingers | 5+ weeks |

## Open Questions

- **Blitz and Zen have no milestones.** Options: fixed time-mark drafts in Blitz (e.g. 5s / 10s),
  Zen as a free-form mutator sandbox, or Standard only for v1. Recommendation: Standard only for v1.
- Only 3 drafts per run may feel sparse — playtest early.

## Risks

- **Technical:** per-particle behavior mutators at 10k particles must fit the frame budget (ADR-004).
  *Checked 2026-10-10:* all stacks hold 120fps at the mobile tier under 6× CPU throttle and at
  desktop 10k — see `production/qa/evidence/mutators-perf.md`. Not yet tried on a physical phone.
- **Technical:** daily-seed determinism — draft offers need a seeded RNG separate from particle spawn randomness.
- **Design:** deferred Time/Repulsor particle types stalled on filter/visual interaction; reuse that learning.
- **Design:** feasibility and scope gates (TD-FEASIBILITY, PR-SCOPE) skipped in Lean mode — not assessed.

## Implementation (v1, 2026-10-10)

Shipped on `feat/mutators`. Decisions made during build:

- Roster: Vortex, Surge (swarm) · Magnet, Heavy (singularity) · Greed, Overclock (rules).
  Skittish, Twin, Dash, Pulse and Glass were not built.
- Drafts run in Standard and a new **Daily** mode (Standard rules, date-seeded offers, per-day PB).
  Blitz and Zen have no drafts.
- A draft earned while one is open is queued, not skipped. An ignored offer auto-picks card 1 after 6s.
- The build appears in the HUD, on the game-over screen, and on a 1200×630 share card
  (native share sheet, else PNG download).

## Next Steps

1. `/quick-design` or `/design-system mutators` — GDD for the registry, draft flow and seeded RNG.
2. `/prototype` one behavior mutator (Vortex) at 10k particles to validate the frame budget first.
3. `/architecture-decision` — seeded RNG strategy and mutator hook points in particles/scoring/clock.
4. `/create-stories` for the MVP list, then `/dev-story`.

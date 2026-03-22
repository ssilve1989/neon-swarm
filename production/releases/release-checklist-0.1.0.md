# Release Checklist: 0.1.0 -- Web (Browser / PWA)
Generated: 2026-03-22

## Project: Neon Swarm Sucker
**Sprint:** Sprint-01 — Empty Canvas → Shippable MVP
**Stack:** Vite 8 + TypeScript + PixiJS v8 + vite-plugin-pwa

---

### Codebase Health

- TODO count: 0
- FIXME count: 0
- HACK count: 0

> No code quality markers found in `src/`. Clean baseline.

---

### Build Verification

- [x] `npm run build` completes without errors
- [x] `npm run lint:ci` passes (Biome, zero-error policy)
- [x] `npm run check` (Biome check) passes
- [x] TypeScript compiles with zero errors (`tsc --noEmit`)
- [x] All assets included and loading correctly in production build
- [x] Build output is in `dist/` and serves correctly via `npm run preview`
- [x] Build version correctly set to `0.1.0`
- [x] Build is reproducible from tagged commit (`ac4f555`)
- [ ] Service worker registered correctly (vite-plugin-pwa)
- [ ] PWA manifest valid and complete

---

### Quality Gates

- [ ] Zero S1 (Critical) bugs — game-breaking / unplayable states
- [ ] Zero S2 (Major) bugs — or documented exceptions with approval
- [ ] All Sprint-01 M1-M5 acceptance criteria verified:
  - [ ] S1-00: `npm run dev` serves black canvas at 60fps, no console errors
  - [ ] S1-01: `src/systems/`, `src/ui/`, `src/types.ts` all exist
  - [ ] S1-02: PixiJS app loop running; canvas fills window and resizes
  - [ ] S1-03: `pointerX`/`pointerY` update on mouse move and touch
  - [ ] S1-04: State machine `idle → playing → game-over → idle` fires events
  - [ ] S1-05: 10,000 additive-blended particles drift and wrap; JS frame < 4ms
  - [ ] S1-06: Singularity follows pointer with no lag; glow visible
  - [ ] S1-07: Absorption works at 10k particles with no frame drop
  - [ ] S1-08: Combo timer decays; absorption resets it; combo break fires and resets
  - [ ] S1-09: Session clock counts down from 30s; triggers game over at 0
  - [ ] S1-10: 50x/100x/200x threshold events fire; each grants +5s
  - [ ] S1-11: Score increments by `absorbed × multiplier`; resets on new game
  - [ ] S1-12: Absorption radius scales with multiplier; resets on combo break
  - [ ] S1-13: Web Audio blips, descending tone, and ascending chime all play
  - [ ] S1-14: Screen shake, bloom punch, and chromatic aberration all trigger
  - [ ] S1-15: HUD shows score, multiplier, clock, and combo decay bar
  - [ ] S1-16: Game over screen shows score; restart returns to `idle`
- [x] Performance target met: ≥60fps on desktop Chrome with 10,000 particles
  - **Confirmed 120fps** @ 10k particles on Chrome (120Hz monitor); JS frame time 1.0–2.5ms; ~70% frame budget remaining
  - Source: `prototypes/particle-system/REPORT.md`
  - Note: Safari and mobile untested in prototype — see platform checklist items
- [ ] Full session verified: start → build combo → clock runs out → game over → restart
- [ ] No memory leaks over extended play sessions
- [ ] Soak test passed (4+ hours continuous play, browser tab active)

---

### Content Complete

- [ ] No placeholder assets (project is code-only; confirm no placeholder sprites or audio files)
- [ ] All player-facing text proofread (HUD labels, game over screen)
- [ ] Scoring formula confirmed correct and matching design spec
- [ ] Audio confirmed working on Chrome, Firefox, and Safari (Safari requires `AudioContext.resume()` after user gesture)
- [ ] Chromatic aberration filter confirmed within performance budget at high multipliers

---

### Platform Requirements: Web / Browser

- [ ] Runs correctly on Chrome (latest)
- [ ] Runs correctly on Firefox (latest)
- [ ] Runs correctly on Safari (latest) — confirm Web Audio context unlocks on first user gesture
- [ ] Mouse controls fully functional (pointer tracking, click to start)
- [ ] Touch controls tested on mobile viewport (pointerX/pointerY via touch events)
- [ ] Canvas resizes correctly on window resize
- [ ] Fullscreen / windowed both work
- [ ] No console errors or warnings in production build
- [ ] HTTPS required for PWA service worker — confirm deployment target uses HTTPS
- [ ] PWA installable: manifest icon, `start_url`, `display: standalone` configured
- [ ] Offline play works after first load (service worker caches assets)
- [ ] `vite build` bundle size acceptable for web delivery (check `dist/` output)

---

### Store / Distribution

- [ ] Deployment target confirmed (itch.io, GitHub Pages, Netlify, etc.)
- [ ] Game page / listing description written and proofread
- [ ] Cover image / thumbnail prepared (per platform requirements)
- [ ] Controls documented for players (how to play)
- [ ] Age rating assessed (casual game — likely no formal rating required for web)
- [ ] Third-party license attributions complete:
  - [ ] PixiJS license included (MIT)
  - [ ] Any other bundled dependencies attributed

---

### Launch Readiness

- [ ] Error reporting in place or accepted as out-of-scope for 0.1.0
- [ ] Analytics accepted as out-of-scope for 0.1.0 (confirm)
- [ ] Known issues documented (Safari Web Audio, potential iOS touch quirks)
- [ ] Rollback plan documented (re-deploy prior build from git tag)
- [ ] Game URL shareable and working

---

### Stretch Goal Status (M6)

- [ ] S1-17: High score persists in `localStorage` across sessions
- [ ] High score displayed on game over screen

---

### Go / No-Go: NOT READY

**Rationale:**
Codebase is clean (zero TODO/FIXME/HACK markers) and all Sprint-01 systems are
present in `src/`. However, the following blockers must be resolved before
marking the release READY:

**Blocking:**
~~1. No test suite exists~~ — **RESOLVED**: 41 unit tests across 6 files; all passing (`bun run test`).
~~2. Build verification not confirmed~~ — **RESOLVED**: build confirmed passing.
3. Cross-browser audio testing not completed — Safari Web Audio `AudioContext`
   resume behavior is a known risk (see sprint risks) and must be verified.
~~4. Performance benchmark not recorded~~ — **RESOLVED** via `prototypes/particle-system/`: 120fps @ 10k on Chrome, 1–2.5ms JS frame time.

**Not blocking (deferred):**
- No test framework configured (no `tests/` directory) — acceptable for 0.1.0
  if manual acceptance criteria are fully signed off.
- Analytics and crash reporting are out of scope for this release.

**Sign-offs Required:**
- [ ] Developer (manual playtest, acceptance criteria)
- [ ] Producer / Owner

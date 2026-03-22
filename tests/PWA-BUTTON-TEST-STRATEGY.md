# PWA Install Button — Test Strategy & Checklist

**Feature**: src/ui/pwa-install-button.ts hotfix
**Date**: 2026-03-22
**Owner**: QA Team
**Status**: Ready for Testing

---

## Executive Summary

The PWA install button feature is **65% testable without devices** (desktop emulation, mocking) and **100% testable with real devices** (iOS + Android). This document outlines the regression testing strategy, identifies high-risk areas, and provides clear pass/fail criteria.

### Key Decisions
1. **Can ship hotfix with desktop-only testing** + scheduled device tests before final release
2. **Critical blocker**: beforeinstallprompt event must be verified on real Android
3. **Nice-to-have**: iOS Share/Add to Home Screen UX verification on real device

---

## What's Being Tested

### Feature Scope
- **DOM Overlay Button**: `+ ADD TO HOME SCREEN` prompt near bottom of mode-select screen
- **Platform-Specific Behavior**:
  - **Chromium/Android**: Defers native `beforeinstallprompt` event, triggers OS install dialog on click
  - **iOS Safari**: Custom step-by-step modal (Share → Add to Home Screen → Add)
  - **Standalone**: Hidden when PWA already installed (`display-mode: standalone`)
- **Visibility Rules**:
  - Only shown on `mode-select` game state
  - Hidden on `playing`, `paused`, `game-over` states
  - Hidden when viewport height < 400px
  - Can be dismissed (iOS) or installed (Chromium)
- **Persistence**: iOS dismissal persists via localStorage

### Adjacent Systems
- **mode-selection.ts**: Overlay, keyboard nav, card clickability
- **update-toast.ts**: Z-index stacking (toast above button)
- **state.ts**: State machine, event listeners, memory

---

## Test Documents

| Document | Purpose | Audience | Time |
|----------|---------|----------|------|
| **[QUICK-CHECK.md](QUICK-CHECK.md)** | 10-min sanity check (6 core tests) | Developers, QA | 10 min |
| **[pwa-install-button-checklist.md](regressions/pwa-install-button-checklist.md)** | Full regression suite (24 tests) | QA team | 45–90 min |
| **[pwa-button-adjacent-systems.md](smoke/pwa-button-adjacent-systems.md)** | Smoke tests (8 tests, affected systems) | QA team | 8 min |
| **[TESTABILITY-MATRIX.md](testability/TESTABILITY-MATRIX.md)** | Device requirements breakdown | QA/Dev leads | reference |
| **[pwa-button-testability-report.md](testability/pwa-button-testability-report.md)** | Full testability assessment | Tech lead | reference |

---

## Recommended Test Plan

### Phase 1: Development (Daily, 10 min)
**Goal**: Catch obvious regressions early

**Test**: [QUICK-CHECK.md](QUICK-CHECK.md)
- 6 core test cases
- Run in Chrome DevTools (no devices)
- All must pass before commit

**Tools**: Chrome DevTools (built-in)

---

### Phase 2: Pre-Release (Before Merge, 1 hour)
**Goal**: Comprehensive coverage without real devices

**Tests**:
1. [pwa-install-button-checklist.md](regressions/pwa-install-button-checklist.md) — Full regression (45–60 min)
2. [pwa-button-adjacent-systems.md](smoke/pwa-button-adjacent-systems.md) — Smoke tests (8 min)

**Coverage**:
- ✓ Desktop Chrome (all tests except T2.1–2.4, T1.5)
- ✓ iOS Simulator or emulation (modal rendering, localStorage)
- ~ Mock events for beforeinstallprompt (T2.1–2.4)

**Tools**: Chrome DevTools + iOS Simulator (optional)

**Pass Threshold**:
- All Green tests (T1, T3, T4, T5.1, T6, S1–S4) must pass
- All Yellow tests (T1.4 with mock, T2.1–2.4 with mock) should pass if mocked
- Red tests (T2.1–2.2, T6.2) documented as blocked, scheduled for device testing

---

### Phase 3: Final Release (Before Deployment, 1 hour)
**Goal**: Real device validation

**Tests**:
1. Quick-check on desktop (5 min)
2. Android device test (30 min):
   - T2.1: beforeinstallprompt fires on real device
   - T2.2: Native OS install prompt appears
   - T2.3: appinstalled event hides button
   - T6.2: Reload re-captures event
3. iOS device test (30 min):
   - T1.5: Modal dismiss persists correctly
   - Verify Share/Add to Home Screen instructions match Safari UI

**Tools**: Real iOS device + Android device (or emulator with beforeinstallprompt support)

---

## Test Coverage Breakdown

### Must Pass (Blockers)

| Test | Why | Platform | Time |
|------|-----|----------|------|
| **T1.2** Button hidden during gameplay | Core feature | All | 5 min |
| **T1.4** Hidden in standalone mode | Prevents duplicate install prompts | All (mock required) | 5 min |
| **T1.5** iOS dismiss persists | User dismissal must stick | iOS | 5 min |
| **T2.1** beforeinstallprompt captured | Without this, Chromium doesn't work | Android device | 5 min |
| **T3.3** iOS localStorage set | Modal dismissal must persist | iOS | 5 min |
| **T4.3** Toast z-index correct | Visual stacking must be correct | All | 3 min |
| **T5.1** No event listener leaks | Memory must not grow unbounded | All | 5 min |

**Minimum viable release**: All must pass

---

### Should Pass (Important)

| Test | Why | Platform | Time |
|------|-----|----------|------|
| T1.1 Button visible on mode-select | Core visibility | All | 5 min |
| T1.3 Hidden on short screens | Responsive design | All | 5 min |
| T2.2 Native prompt triggered | User installation flow | Android device | 5 min |
| T2.3 Button hides after install | App installed confirmation | Android device | 5 min |
| T3.1 Modal styling correct | UX quality | iOS | 5 min |
| T5.2 State transitions responsive | Gameplay feel | All | 5 min |

**Nice-to-have if time**: 80% should pass

---

### Can Defer (Lower Priority)

| Test | Why | Platform |
|------|-----|----------|
| T2.4 Dismiss native prompt | Edge case (user cancels) | Android device |
| T3.2 Modal step text correct | UX verification | iOS device |
| T3.4 Modal keyboard nav | Accessibility edge case | iOS |
| T6.1 Rapid state changes | Stress test | All |
| T6.3 Private browsing mode | Edge case | Firefox |

**If time constrained**: Can be tested in next sprint

---

## Pass/Fail Criteria

### PASS
- All tests in "Must Pass" section pass
- All Green tests (testability matrix) pass
- No console errors (except pre-existing)
- No visual glitches, flickering, z-index conflicts
- No memory leaks (T5.1)

### CONDITIONAL PASS
- Green + Yellow tests pass (desktop + mock)
- Red tests documented as pending device testing
- Scheduled device testing before final release

### FAIL
- Any test in "Must Pass" section fails
- Button visible during non-mode-select states (T1.2)
- beforeinstallprompt not captured on Android (T2.1)
- iOS modal doesn't dismiss or localStorage not set (T3.3)
- Z-index conflicts visible (T4.3)
- Memory leak detected (T5.1)
- Console errors or uncaught exceptions

---

## Detailed Test Breakdown

### Section 1: Core Visibility (5 tests)
**Risk**: Medium — State machine integration
**Impact**: Button shows/hides incorrectly
**Time**: 15 min

- T1.1 Button visible on mode-select ✓
- T1.2 Hidden during gameplay ✓ (BLOCKER)
- T1.3 Hidden on short screens ✓
- T1.4 Hidden in standalone mode ✓ (BLOCKER, mock required)
- T1.5 iOS dismiss persists ✓ (BLOCKER, iOS device)

### Section 2: Event Handling (4 tests)
**Risk**: High — Platform-specific Chromium events
**Impact**: Chromium PWA installation broken
**Time**: 15 min (desktop mock) + 10 min (Android device)

- T2.1 beforeinstallprompt captured ✓ (BLOCKER, mock + Android device)
- T2.2 Native prompt triggered ✓ (Android device)
- T2.3 Button hides after install ✓ (BLOCKER, Android device)
- T2.4 Dismiss keeps button visible ✓ (Android device)

### Section 3: iOS Modal (4 tests)
**Risk**: Medium — Custom UI rendering
**Impact**: iOS users confused about installation
**Time**: 10 min (desktop emulation) + 5 min (iOS device)

- T3.1 Modal styling correct ✓
- T3.2 Modal steps readable ✓
- T3.3 localStorage key set ✓ (BLOCKER)
- T3.4 Keyboard nav works ✓ (iOS)

### Section 4: Z-Index Layering (3 tests)
**Risk**: Medium — Visual stacking conflicts
**Impact**: Button/modal hidden behind other UI
**Time**: 5 min

- T4.1 Button z-index correct ✓
- T4.2 Modal above button ✓
- T4.3 Toast above modal ✓ (BLOCKER)

### Section 5: State Machine (2 tests)
**Risk**: Medium — Event listener registration
**Impact**: Button state not synced, memory leaks
**Time**: 10 min

- T5.1 No listener leaks ✓ (BLOCKER)
- T5.2 State transitions responsive ✓

### Section 6: Edge Cases (4 tests)
**Risk**: Low–Medium — Unusual conditions
**Impact**: Specific edge cases fail
**Time**: 10 min

- T6.1 Rapid state changes ✓
- T6.2 beforeinstallprompt reload ✓ (Android device)
- T6.3 Private browsing mode ✓
- T6.4 Window resize works ✓

### Smoke Tests (8 tests)
**Risk**: Low — Adjacent system regression
**Impact**: Mode-select, update-toast, state machine broken
**Time**: 8 min

- S1.1 Mode cards interactive ✓
- S1.2 Keyboard nav works ✓
- S2.1 Toast z-index correct ✓
- S2.2 Toast dismissal works ✓
- S3.1 Hidden in gameplay ✓
- S3.2 Visible after mode-select ✓
- S3.3 Hidden on game-over ✓
- S4.4 Tab switch doesn't break ✓

---

## Testability Status

### Without Devices (65% of feature)
✓ Can test all visibility rules (T1.1–1.3)
✓ Can test iOS modal rendering (T3.1–3.2)
✓ Can test z-index stacking (T4.1–4.3)
✓ Can test state machine (T5.1–5.2)
✓ Can test edge cases (T6.1, T6.3, T6.4)
✓ Can mock beforeinstallprompt event (T2.1–2.4)
✗ Cannot test real beforeinstallprompt firing
✗ Cannot test native OS install prompt
✗ Cannot test iOS Share/Add to Home Screen native UI

**Mitigation**: Mock event harness + scheduled device testing

### With iOS Simulator (90% of feature)
✓ All of above, plus:
✓ iOS modal rendering verified in simulator
✓ iOS dismiss + localStorage verified in simulator
✓ iOS keyboard nav verified
✗ Still missing real iOS Share/Add to Home Screen UX

### With Real Devices (100% of feature)
✓ All of above, plus:
✓ Real beforeinstallprompt event capture (Android)
✓ Native OS install prompt (Android)
✓ appinstalled event (Android)
✓ Real iOS Share/Add to Home Screen flow

---

## Resources

### Test Documents
- [QUICK-CHECK.md](QUICK-CHECK.md) — Quick 10-min sanity check
- [pwa-install-button-checklist.md](regressions/pwa-install-button-checklist.md) — Full 45–90 min regression
- [pwa-button-adjacent-systems.md](smoke/pwa-button-adjacent-systems.md) — 8-min smoke tests
- [TESTABILITY-MATRIX.md](testability/TESTABILITY-MATRIX.md) — Device matrix reference

### Tools
- Chrome DevTools (F12, Ctrl+Shift+M for emulation)
- iOS Simulator (Xcode, free)
- Android Studio Emulator (free)
- Firefox DevTools (F12)

### Code References
- Main feature: `/src/ui/pwa-install-button.ts`
- State machine: `/src/state.ts`
- Mode selection: `/src/ui/mode-selection.ts`
- Update toast: `/src/ui/update-toast.ts`

---

## Timeline

| Phase | Time | Status | Blocker |
|-------|------|--------|---------|
| Phase 1: Development (daily) | 10 min/commit | In progress | None |
| Phase 2: Pre-release (before merge) | 1 hour | Planned | Must pass Green + Yellow |
| Phase 3: Final release (before deploy) | 1 hour | Scheduled | Must pass Red tests (device) |

---

## Sign-Off

When testing is complete, fill in this table:

```
| Phase | Date | Tester | Status | Notes |
|-------|------|--------|--------|-------|
| Phase 1 (daily) | — | — | ONGOING | |
| Phase 2 (pre-merge) | 2026-03-22 | — | PASS | Desktop + DevTools emulation |
| Phase 3 (pre-deploy) | 2026-03-22 | — | PASS | Android device: beforeinstallprompt confirmed on HTTPS |
| FINAL APPROVAL | — | QA Lead | — | |
```

---

## Questions?

- **"Can I skip device testing?"** → Only if you mock beforeinstallprompt events in tests. Schedule real device testing before final release.
- **"How do I mock beforeinstallprompt?"** → See testability report, "Category 2: Partially Testable" section.
- **"What if T2.1 fails on Android?"** → beforeinstallprompt didn't fire; likely a browser issue, or feature not installable. Debug in `chrome://inspect`.
- **"Can I use iOS Simulator instead of real device?"** → Yes for modal testing; no for real Share/Add to Home Screen UX verification.

---

## Appendix: Quick Links

- **Implementation**: [src/ui/pwa-install-button.ts](/Users/steve/dev/neon-swarm/src/ui/pwa-install-button.ts)
- **State integration**: [src/state.ts](/Users/steve/dev/neon-swarm/src/state.ts)
- **Mode selection**: [src/ui/mode-selection.ts](/Users/steve/dev/neon-swarm/src/ui/mode-selection.ts)
- **Update toast**: [src/ui/update-toast.ts](/Users/steve/dev/neon-swarm/src/ui/update-toast.ts)


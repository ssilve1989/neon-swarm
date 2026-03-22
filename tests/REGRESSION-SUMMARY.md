# Regression Test Summary — PWA Install Button Hotfix

**Hotfix**: src/ui/pwa-install-button.ts (DOM overlay + iOS modal)
**Date**: 2026-03-22
**Scope**: Targeted regression checklist for QA

---

## Quick Links

| Document | Purpose | Time |
|----------|---------|------|
| [pwa-install-button-checklist.md](regressions/pwa-install-button-checklist.md) | Full regression test suite (24 test cases) | 45–90 min |
| [pwa-button-adjacent-systems.md](smoke/pwa-button-adjacent-systems.md) | Quick smoke tests for affected systems | 8 min |
| [pwa-button-testability-report.md](testability/pwa-button-testability-report.md) | Device requirements and testing strategy | reference |

---

## What's Being Tested

### Core Feature
- **Button label**: `+ ADD TO HOME SCREEN` (DOM overlay, fixed position, bottom-center)
- **Visibility rules**:
  - Only shown on `mode-select` screen
  - Only if NOT already installed (not in standalone mode)
  - Only if viewport height ≥400px
  - Platform-specific: Chromium shows button + native prompt; iOS shows instruction modal
- **Platforms**:
  - Chromium/Android: defers `beforeinstallprompt`, triggers native OS prompt on click
  - iOS: custom step-by-step modal (tap Share → Add to Home Screen → Add)
  - Firefox: no button (beforeinstallprompt not supported)
- **Persistence**:
  - iOS users can dismiss modal, which persists in localStorage
  - Chromium users can install (appinstalled event) or dismiss (button stays visible)

### Adjacent Systems at Risk
- **mode-selection.ts** — Z-index, keyboard nav, card clickability
- **update-toast.ts** — Z-index stacking (toast should appear above button)
- **state.ts** — State change listeners, memory leaks, rapid transitions

---

## Critical Test Cases (Must Pass)

| ID | Title | Risk Level | Time |
|----|-------|-----------|------|
| T1.2 | Button hidden during non-mode-select states | 🔴 HIGH | 5 min |
| T1.4 | Button remains hidden in standalone mode | 🔴 HIGH | 5 min |
| T1.5 | Button hidden on iOS after dismissal (localStorage) | 🔴 HIGH | 5 min |
| T2.1 | beforeinstallprompt captured (Chromium) | 🔴 HIGH | 5 min |
| T2.3 | Button hides after appinstalled event | 🔴 HIGH | 5 min |
| T3.3 | iOS modal dismiss sets localStorage key | 🔴 HIGH | 5 min |
| T4.3 | Update toast (z-index 9999) above button (9990) | 🟡 MEDIUM | 3 min |
| T5.1 | Event listeners don't leak (memory profiling) | 🟡 MEDIUM | 5 min |
| T5.2 | Button shows/hides on state transitions | 🟡 MEDIUM | 5 min |

**Minimum Pass Requirement**: All 🔴 HIGH tests pass; all 🟡 MEDIUM tests pass

---

## Testability Quick Reference

### Can Test Without Real Device
- ✓ Button visibility rules (T1.1–1.3)
- ✓ Standalone mode detection (T1.4, with DevTools media query override)
- ✓ iOS modal rendering and accessibility (T3.1–3.2)
- ✓ iOS dismiss button and localStorage (T3.3, T3.4)
- ✓ Z-index stacking (T4.1–4.3)
- ✓ State machine integration (T5.1–5.2)
- ✓ Smoke tests (S1–S4)

### Need Real Device / Emulator
- ✗ beforeinstallprompt natural capture (T2.1) → Android device
- ✗ Native OS install prompt (T2.2) → Android device
- ✗ appinstalled event (T2.3) → Android device after real install
- ✗ iOS Share/Add to Home Screen UX (T1.5, T3.2) → iOS device (emulator UI not available)

### Can Mock in Tests
- ~ beforeinstallprompt event (mock event object + listener verification)
- ~ appinstalled event (mock event + hide() verification)
- ~ userChoice promise outcome ("accepted" vs "dismissed")

---

## Execution Plan

### Desktop Testing (~1 hour)

**Tools**: Chrome DevTools, Node.js test runner

**Steps**:
1. Open test checklist: [pwa-install-button-checklist.md](regressions/pwa-install-button-checklist.md)
2. Open game in Chrome, toggle device emulation (Ctrl+Shift+M)
3. Test T1.1–T1.3 (visibility rules)
4. Test T1.4 (standalone mode via DevTools Rendering tab)
5. Test T3.1–T3.2 (iOS modal styling)
6. Test T4.1–T4.3 (z-index)
7. Test T5.1–T5.2 (state machine)
8. Test T6.1–T6.4 (edge cases)
9. Run smoke tests: [pwa-button-adjacent-systems.md](smoke/pwa-button-adjacent-systems.md)

**Time**: ~1 hour (all tests except T1.5, T2.1–2.4, T3.3–3.4, S2.1–2.2 if no update staged)

---

### Mobile Testing (Pre-Release Only, ~1 hour)

**Platform**: Android device + iOS device (or emulator)

**Android (30 min)**:
- T2.1: Verify beforeinstallprompt fires
- T2.2: Trigger native install prompt
- T2.3: Verify appinstalled event hides button
- T2.4: Verify dismissing prompt keeps button visible

**iOS (30 min)**:
- T1.5: Verify button hidden after modal dismiss
- T3.3: Verify localStorage key set via DevTools Web Inspector
- T3.4: Verify keyboard nav in modal

---

## Expected Results

### Must Pass Before Merge
- All tests in sections 1–6 of regression checklist marked PASS (or SKIPPED for platform-specific tests)
- No console errors, warnings (except pre-existing)
- No visual glitches, z-index conflicts, or flicker

### Acceptable State Before Release
- ✓ Desktop testing complete (100%)
- ✓ iOS modal testing complete (emulator)
- ○ Android device testing scheduled (not critical for hotfix, but required before final release)

---

## Known Limitations

1. **beforeinstallprompt not fired in DevTools emulator** — Can mock event, but real behavior requires Android device
2. **iOS Share/Add to Home Screen** — Not available in iOS simulator UI; test on real device
3. **Actual PWA installation** — Requires real device and proper app registration
4. **display-mode: standalone detection** — Only accurate on actual installed PWAs; can simulate in DevTools

---

## Sign-Off Template

When testing is complete, update this table:

| Test Suite | Status | Tester | Date | Notes |
|------------|--------|--------|------|-------|
| Desktop Regression (T1–T6) | PASS / FAIL | — | — | |
| Smoke Tests (S1–S4) | PASS / FAIL | — | — | |
| Android Manual | PASS / FAIL / PENDING | — | — | |
| iOS Manual | PASS / FAIL / PENDING | — | — | |
| **Overall** | **READY / BLOCKED** | — | — | |

---

## Support

- **Questions about test steps?** See detailed descriptions in [pwa-install-button-checklist.md](regressions/pwa-install-button-checklist.md)
- **Can't run a test?** Check [pwa-button-testability-report.md](testability/pwa-button-testability-report.md) for workarounds
- **Need to mock events?** See testability report, "Category 2: Partially Testable"


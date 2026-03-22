# PWA Install Button — Testability Report

**Feature**: src/ui/pwa-install-button.ts (DOM overlay + iOS modal)
**Date**: 2026-03-22
**Assessment**: PARTIAL — See breakdown below

---

## Executive Summary

**Can fully test WITHOUT real devices**: ~65% of feature
**Can fully test WITH real devices**: 100% of feature

The PWA button feature is testable in browser DevTools emulation for most critical paths (visibility rules, state machine integration, z-index layering, iOS modal UI/accessibility). The major blockers are:

1. **beforeinstallprompt event** — Not fired in Chrome DevTools emulator (Android only)
2. **Actual PWA installation** — Requires real device or native app capability
3. **iOS Share/Add to Home Screen native UI** — Not available in iOS simulator or emulator

However, these can be **mitigated with mocking** and **scheduled manual testing** before release.

---

## Feature Breakdown by Testability

### Category 1: Fully Testable Without Devices (95%+ confidence)

| Feature | Method | Confidence |
|---------|--------|-----------|
| **Button visibility on mode-select** | DevTools emulation + responsive design testing | 95% |
| **Button hidden during gameplay** | State machine verification | 100% |
| **Button hidden on short screens** | DevTools resize tool | 95% |
| **Button hidden in standalone mode** | DevTools media query override (Rendering tab) | 90% |
| **Z-index stacking (button vs modal)** | DevTools computed styles inspection | 95% |
| **iOS modal HTML structure** | DevTools DOM inspection | 100% |
| **iOS modal CSS styling** | DevTools Styles panel | 100% |
| **iOS modal accessibility (aria attributes)** | DevTools accessibility audit | 100% |
| **iOS dismiss button functionality** | Click simulation in DevTools | 100% |
| **localStorage persistence** | DevTools Storage tab | 100% |
| **State machine event binding** | Memory profiling in DevTools | 95% |
| **Rapid state transitions** | Console timing verification | 100% |
| **Window resize responsiveness** | DevTools resize tool | 95% |

---

### Category 2: Partially Testable Without Devices (needs mocking)

| Feature | Method | Confidence | Mitigation |
|---------|--------|-----------|-----------|
| **beforeinstallprompt capture** | Mock event in test harness | 75% | Create synthetic event, verify listener registration |
| **Native prompt trigger** | Mock prompt() method | 70% | Test deferred event lifecycle, userChoice promise handling |
| **appinstalled event** | Mock event + hide() verification | 75% | Verify button hides after synthetic "installed" event |
| **User dismisses native prompt** | Mock outcome = "dismissed" | 70% | Verify button remains visible, deferredPrompt persists |

**Workaround**: Unit test harness with event mocking

```typescript
// Example: Mock beforeinstallprompt for testing
const mockPrompt = {
  prompt: async () => {},
  userChoice: Promise.resolve({ outcome: "accepted" as const, platform: "web" })
};
const event = new Event("beforeinstallprompt");
Object.assign(event, mockPrompt);
window.dispatchEvent(event);
```

---

### Category 3: Not Testable Without Real Device/Emulator

| Feature | Why | Impact | Schedule |
|---------|-----|--------|----------|
| **Actual beforeinstallprompt firing** | Chromium-specific event; DevTools emulator doesn't trigger it | Medium | Manual test on Android before release |
| **Real PWA installation flow** | Requires native app registration and installation | High | Manual test on Android + iOS before release |
| **iOS Safari Share prompt** | Not in iOS simulator/emulator | Medium | Manual test on real iPad/iPhone before release |
| **Standalone mode detection on installed app** | `matchMedia("(display-mode: standalone)")` only true for installed PWAs | Medium | Manual test after installation on real device |

**Frequency**: Test once per major OS update (iOS Safari major version, Chromium update)

---

## Testability by Platform

### Desktop Chrome/Edge (Linux/Mac/Windows)

| Test | Available | Notes |
|------|-----------|-------|
| Button visibility | ✓ | Full emulation via DevTools |
| State machine | ✓ | All state transitions testable |
| Z-index | ✓ | Computed styles inspection |
| iOS modal UI | ✓ | Full DOM rendering in desktop Chrome |
| beforeinstallprompt | ✗ | Requires device emulation or mock |
| appinstalled | ✗ | Synthetic events need mock |

**Recommendation**: Run primary test suite on desktop Chrome with DevTools

---

### Android Chrome (Device or Emulator)

| Test | Available | Notes |
|------|-----------|-------|
| Button visibility | ✓ | Full support |
| State machine | ✓ | Full support |
| Z-index | ✓ | Full support |
| beforeinstallprompt | ✓ | Native event fires |
| Native install prompt | ✓ | Real OS-level prompt |
| appinstalled | ✓ | Real event fires after install |

**Recommendation**: Schedule manual test on Android device before release (30 min)

---

### iOS Safari (Device or Emulator)

| Test | Available | Notes |
|------|-----------|-------|
| Button visibility | ✓ | Full support in emulator |
| State machine | ✓ | Full support |
| Z-index | ✓ | Full support |
| iOS modal UI | ✓ | Full rendering in emulator/device |
| iOS modal dismiss | ✓ | Full interaction in emulator/device |
| localStorage persist | ✓ | Full support via DevTools Web Inspector |
| beforeinstallprompt | ✗ | Not fired on iOS (expected) |
| Share/Add to Home Screen | ✗ | iOS emulator doesn't expose native Share UI |

**Recommendation**: Run smoke tests on iOS emulator (5 min); schedule device test before release (30 min)

---

## Device Matrix for Full Coverage

| Test Phase | Device | Time | Notes |
|------------|--------|------|-------|
| **Development** | Desktop Chrome | 15 min/day | Automated and manual DevTools testing |
| **Pre-release** | Android device | 30 min | beforeinstallprompt, native prompt, appinstalled |
| **Pre-release** | iOS device | 30 min | iOS modal, Safari Share prompt, localStorage |
| **Regression (per update)** | — | 10 min | Desktop smoke tests only |

**Total Manual Test Time**: ~1 hour per major release

---

## Testing Tools & Setup

### Desktop Testing (No devices needed)

**Tools**:
- Chrome DevTools (built-in)
- Firefox DevTools (built-in)
- Node.js test harness for event mocking

**Setup**:
```bash
# 1. Run automated tests with mocked events
npm test -- pwa-install-button.test.ts

# 2. Manual testing
# Open game in Chrome, open DevTools (F12)
# Toggle device emulation (Ctrl+Shift+M)
# Select "iPhone 14" or "Android" device preset
```

**Steps** (from checklist section 7):
- T1.1–1.3: DevTools device emulator
- T1.4: DevTools Rendering tab → Emulate CSS media feature → display-mode: standalone
- T2.1–2.4: Event mocking in test suite
- T3.1–3.4: DevTools device emulator or local iOS simulator
- T4.1–4.3: DevTools computed styles
- T5.1–5.2: DevTools memory profiler + console logging
- T6.1–6.4: DevTools + responsive design mode

### Android Manual Testing

**Tools**:
- Android device or emulator (Android Studio)
- Chrome on Android
- Remote debugging via `chrome://inspect/#devices`

**Setup**:
```bash
# 1. Connect Android device via USB
# 2. Open game URL on Android Chrome
# 3. In desktop Chrome, navigate to chrome://inspect
# 4. Click "inspect" on your device
# 5. Use console and DevTools normally
```

### iOS Manual Testing

**Tools**:
- iPhone or iPad (or Simulator via Xcode)
- Safari on iOS
- Mac with Xcode for remote debugging

**Setup**:
```bash
# 1. Open Safari on iOS device
# 2. Navigate to game URL
# 3. On Mac, open Safari → Develop → [Device] → [Page]
# 4. Use Web Inspector (similar to DevTools)
```

---

## Risk Assessment

### High-Risk Areas (Needs Real Device Testing)

1. **beforeinstallprompt lifecycle** — Not firable in DevTools; requires Android device
   - Risk: Feature doesn't work on Chromium at all
   - Mitigation: Scheduled Android test, early in release cycle

2. **iOS Share/Add to Home Screen UX** — Not testable in emulator
   - Risk: Instructions modal is correct, but user still can't find Share prompt
   - Mitigation: Screenshots/video walkthrough; user testing with beta testers

3. **Actual PWA installation detection** — Real app installation required
   - Risk: Button doesn't hide after real install
   - Mitigation: Manual smoke test after installation

### Medium-Risk Areas (Testable with mocking)

1. **appinstalled event** — Can mock but not trigger naturally
   - Mitigation: Synthetic event testing covers the hide() path

2. **Natural beforeinstallprompt capture** — Can mock but won't test early capture window
   - Mitigation: Verify listener is registered in initPwaInstallButton()

### Low-Risk Areas (Fully testable without devices)

1. **State machine integration** — All states covered by state.ts tests
2. **Z-index layering** — Computed styles verify stacking order
3. **localStorage** — DevTools Storage tab confirms persistence
4. **iOS modal UI** — DOM and CSS fully testable in desktop emulation

---

## Recommended Testing Strategy

### Phase 1: Development (Continuous)

**Daily verification** (~10 min):
1. Run smoke tests (pwa-button-adjacent-systems.md) on desktop
2. Verify button visibility on mode-select
3. Verify button hidden during gameplay
4. Verify z-index not conflicting with update-toast

**No device needed**; use `npm test` or manual DevTools inspection

---

### Phase 2: Pre-Release (Before Hotfix Merge)

**Comprehensive test suite** (~1 hour):

1. **Desktop automated** (15 min):
   - Run full regression checklist (tests 1–6)
   - Execute mock event tests for beforeinstallprompt/appinstalled

2. **Android manual** (30 min):
   - Real beforeinstallprompt capture
   - Native OS install prompt
   - appinstalled event after real installation
   - Button hidden in standalone mode

3. **iOS manual** (30 min):
   - iOS modal rendering and styling
   - Dismiss button functionality
   - localStorage persistence check
   - Keyboard navigation in modal

---

### Phase 3: Release Validation (1 hour before deploy)

**Smoke test only** (~10 min):
- Run S1–S3 from pwa-button-adjacent-systems.md
- Verify no regressions in adjacent systems (mode-select, update-toast, state machine)

---

## Testability Verdict

### Overall Assessment: **PARTIAL — PASS for immediate release with caveats**

**Can ship without real device testing?** NO — beforeinstallprompt event and native prompt flow require Android verification

**Can ship with desktop-only testing?** CONDITIONAL — If you add automated event mocking and schedule iOS/Android tests for 1.1.1 hotfix

**Can ship with iOS emulator + desktop testing?** YES — Covers iOS modal and 95% of feature; schedule brief Android test for next release

---

## Recommended Action

**For this hotfix**:
1. ✓ Run full desktop regression checklist (sections 1–6)
2. ✓ Run smoke tests (sections S1–S4)
3. ✓ Execute mock event unit tests
4. ○ Schedule 30-min Android device test (beforeinstallprompt)
5. ○ Schedule 30-min iOS device test (Share/Add to Home Screen)

**Before final release**:
- Blocks: beforeinstallprompt must fire on real Android device
- Blocks: appinstalled event must hide button after real install
- No blocks for iOS (modal is testable in emulator; Share UI is UX-only)

---

## Sign-Off

| Role | Testability Assessment | Approval |
|------|------------------------|----------|
| QA Lead | 65% without devices, 100% with devices | Required |
| Dev Lead | Mock strategy feasible? Code ready? | Required |
| Release Manager | Schedule device testing before release? | Required |


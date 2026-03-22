# PWA Install Button — Testability Matrix

**Quick Reference**: Which tests can run without real devices?

---

## Test Coverage Matrix

```
TEST CASE                          | Desktop | Android | iOS | Emulator | Mock
                                   | Chrome  | Device  | Dev | Required | OK?
───────────────────────────────────┼─────────┼─────────┼─────┼──────────┼─────
T1.1 Button visible on mode-select | ✓ FULL  | ✓       | ✓   |    —     | —
T1.2 Hidden during gameplay        | ✓ FULL  | ✓       | ✓   |    —     | —
T1.3 Hidden on short screens       | ✓ FULL  | ✓       | ✓   |    —     | —
T1.4 Hidden in standalone mode     | ○ MOCK  | ✓       | ✓   |    —     | YES
T1.5 iOS dismiss persists          | ✗ N/A   | —       | ✓   | ○ EMUL   | YES
                                   |         |         |     |          |
T2.1 beforeinstallprompt captured  | ✗ N/A   | ✓ REAL  | ✗   |    —     | YES
T2.2 Native prompt triggered       | ✗ N/A   | ✓ REAL  | ✗   |    —     | —
T2.3 Button hides after install    | ✗ N/A   | ✓ REAL  | ✗   |    —     | YES
T2.4 Dismiss keeps button visible  | ✗ N/A   | ✓ REAL  | ✗   |    —     | YES
                                   |         |         |     |          |
T3.1 Modal styling + a11y          | ✓ FULL  | —       | ✓   |    —     | —
T3.2 Modal steps readable          | ✓ FULL  | —       | ✓   | ✓ EMUL   | —
T3.3 localStorage key set          | ✓ FULL  | —       | ✓   | ✓ EMUL   | —
T3.4 Modal keyboard nav            | ✓ FULL  | —       | ○   | ○ EMUL   | —
                                   |         |         |     |          |
T4.1 Button z-index correct        | ✓ FULL  | ✓       | ✓   |    —     | —
T4.2 Modal z-index above button    | ✓ FULL  | ✓       | ✓   |    —     | —
T4.3 Toast z-index above modal     | ✓ FULL  | ✓       | ✓   |    —     | —
                                   |         |         |     |          |
T5.1 Event listener memory         | ✓ FULL  | ✓       | ✓   |    —     | —
T5.2 State transitions work        | ✓ FULL  | ✓       | ✓   |    —     | —
                                   |         |         |     |          |
T6.1 Rapid state changes           | ✓ FULL  | ✓       | ✓   |    —     | —
T6.2 beforeinstallprompt reload    | ✗ N/A   | ✓ REAL  | ✗   |    —     | YES
T6.3 localStorage private mode     | ✓ FULL  | ✓       | ✓   |    —     | —
T6.4 Resize during gameplay        | ✓ FULL  | ✓       | ✓   |    —     | —
                                   |         |         |     |          |
S1.1 Mode cards interactive        | ✓ FULL  | ✓       | ✓   |    —     | —
S1.2 Keyboard nav (arrows)         | ✓ FULL  | ✓       | ✓   |    —     | —
S2.1 Z-index with toast            | ✓ FULL  | ✓       | ✓   |    —     | —
S2.2 Toast dismissal works         | ✓ FULL  | ✓       | ✓   |    —     | —
S3.1 Hidden in gameplay            | ✓ FULL  | ✓       | ✓   |    —     | —
S3.2 Visible after mode-select     | ✓ FULL  | ✓       | ✓   |    —     | —
S3.3 Hidden on game-over           | ✓ FULL  | ✓       | ✓   |    —     | —
S4.4 Tab switch doesn't break      | ✓ FULL  | ✓       | ✓   |    —     | —
```

**Legend**:
- `✓ FULL` = Fully testable without devices
- `✓ REAL` = Testable on real device only (required for this test)
- `✗ N/A` = Not applicable (platform doesn't support feature)
- `○ MOCK` = Testable with mocking/simulation
- `○ EMUL` = Testable in emulator (iOS Simulator, Android Emulator)
- `—` = Not applicable / skipped for this platform

---

## Summary by Test Complexity

### Green (Easy — Fully Testable)
**24 test cases** can run in Chrome DevTools without any devices

```
✓ FULL  T1.1, T1.2, T1.3, T3.1, T3.2, T3.3, T3.4
✓ FULL  T4.1, T4.2, T4.3
✓ FULL  T5.1, T5.2
✓ FULL  T6.1, T6.3, T6.4
✓ FULL  S1.1, S1.2, S2.1, S2.2, S3.1, S3.2, S3.3, S4.4
```

**Effort**: 45–60 min (run all on desktop)
**Risk if skipped**: Low — most core functionality covered

---

### Yellow (Medium — Testable with Workarounds)
**6 test cases** require mocking or emulation

```
○ MOCK  T1.4 (standalone mode detection)
○ MOCK  T2.1, T2.3, T2.4 (beforeinstallprompt lifecycle)
○ EMUL  T1.5 (iOS modal on simulator)
○ EMUL  T3.4 (iOS keyboard nav on simulator)
```

**Effort**: 20 min (add mock event harness + iOS simulator)
**Risk if skipped**: Medium — beforeinstallprompt flow untested, but iOS modal covered

---

### Red (Hard — Requires Real Device)
**7 test cases** cannot be tested without actual iOS/Android devices

```
✗ REAL  T2.2 (native Android install prompt)
✗ REAL  T6.2 (beforeinstallprompt on real Android)
✗ REAL  T1.5 (actual iOS Share → Add to Home Screen)
```

**Effort**: 1 hour (schedule 30 min per device)
**Risk if skipped**: High — Real PWA installation flow untested

---

## Recommended Test Coverage by Release Phase

### Development (Daily)
- Run: **Green tests only** (desktop, 10 min)
- Use: `npm test` or manual DevTools
- Pass threshold: 100% of Green tests

### Pre-Release (Before merge to main)
- Run: **Green + Yellow tests** (desktop + mock, 1 hour)
- Use: DevTools + Node.js test harness + iOS Simulator
- Pass threshold: 100% of Green + Yellow tests

### Final Release (Before deploy to production)
- Run: **All tests** (Green + Yellow + Red, 2 hours)
- Use: Desktop + iOS Simulator + real Android device + real iOS device
- Pass threshold: 100% of tests (Red tests scheduled if time-constrained)

---

## Test Execution Checklist

### Desktop Only (No Devices) — 45 min

```bash
# 1. Open Chrome DevTools
npm run dev
# F12 → Ctrl+Shift+M → Select device

# 2. Run green tests (manual or automated)
✓ T1.1–1.3, T1.4 (with mock), T3.1–3.4
✓ T4.1–4.3, T5.1–5.2, T6.1–6.4
✓ S1–S4

# 3. Summary
# Passed: 24 tests
# Mocked: 4 tests
# Skipped (device): 7 tests
```

**Verdict**: READY FOR CODE REVIEW (pending device tests before release)

---

### With iOS Simulator — Add 15 min

```bash
# 1. Start iOS Simulator
# 2. Open Safari on simulator
# 3. Navigate to game URL
# 4. Run Yellow tests on simulator

✓ T1.5 (iOS dismiss persists)
✓ T3.2–3.4 (modal rendering, keyboard nav)

# Summary
# Passed: 24 + 6 = 30 tests
# Skipped (real device): 1 test
```

**Verdict**: READY FOR BETA (pending Android real device test)

---

### With Real Devices — Add 1 hour

```bash
# 1. Android device: Test T2.1–2.4, T6.2 (beforeinstallprompt, native prompt)
# 2. iOS device: Test T1.5, T3.4 (Share prompt, real install flow)
# 3. Log results

✓ All 31 tests passed

# Summary
# Passed: 31 tests
# Skipped: 0
```

**Verdict**: PRODUCTION READY

---

## Risk Matrix

| Untested Area | Risk | Impact | Mitigation |
|---|---|---|---|
| beforeinstallprompt lifecycle | HIGH | Feature completely broken on Chromium | Mock in tests, verify with Android device |
| Native OS install prompt | HIGH | Users can't install app | Schedule Android device test |
| iOS Share/Add to Home Screen UX | MEDIUM | Users confused about installation | Provide screenshot guide, beta test with real users |
| Standalone mode detection | LOW | Button shows after install | Mock media query in DevTools, test on real device |
| localStorage persistence (iOS) | MEDIUM | Modal re-appears after dismiss | Test in iOS Simulator with DevTools Web Inspector |

---

## Device Borrowing Guide

**If you don't have devices**, consider:
1. **Android**: Ask team for loaner device, or use Android Studio Emulator (free)
2. **iOS**: Use iOS Simulator (free, macOS only), or ask for loaner iPhone/iPad
3. **Time**: Schedule 30–45 min per device at end of sprint

**If no devices available**: Proceed with Green + Yellow tests; schedule device testing before final release (not critical for hotfix if mocking is in place)


# PWA Button — 10-Minute Quick Check

**For**: Developers/QA doing a rapid sanity check before commit
**Time**: 10 minutes
**Platform**: Chrome DevTools (desktop only)

---

## Setup (1 min)

```bash
npm run dev
# Open game in Chrome
# Press F12 to open DevTools
# Press Ctrl+Shift+M to toggle device emulation
# Select "iPhone 14" preset
```

---

## Test 1: Visibility on Mode-Select (2 min)

✓ **Expected**: Button "ADD TO HOME SCREEN" visible at bottom center of mode-select screen

**Steps**:
1. Game loaded on mode-select
2. Look for button labeled `+ ADD TO HOME SCREEN` in cyan
3. Button should be above update toast (if visible)

**Result**: PASS ☐ / FAIL ☐

---

## Test 2: Hidden During Gameplay (2 min)

✓ **Expected**: Button disappears when game starts, reappears when you quit

**Steps**:
1. Click any game mode (Standard/Blitz/Zen)
2. Game should start
3. Look for button (should NOT be visible)
4. Pause and click "Quit to Menu"
5. Should be back on mode-select
6. Button should reappear

**Result**: PASS ☐ / FAIL ☐

---

## Test 3: Hidden on Short Screens (2 min)

✓ **Expected**: Button hidden when viewport < 400px height

**Steps**:
1. Mode-select screen
2. In DevTools, right-click on device name → Edit (bottom-left)
3. Set Height to 399px, click Add custom device
4. Button should be hidden
5. Change height to 400px
6. Button should reappear

**Result**: PASS ☐ / FAIL ☐

---

## Test 4: iOS Modal Rendering (2 min)

✓ **Expected**: Click button → Modal appears with 3-step instructions

**Steps**:
1. Select "iPhone 14" device in DevTools
2. Mode-select screen
3. Click the button
4. Modal should appear with:
   - "TO INSTALL NEON SWARM" heading
   - Steps: "Tap Share → Scroll down → Tap Add"
   - Close button (✕) in top-right
5. Click ✕ to close
6. Modal should disappear
7. Button should also disappear (localStorage set)

**Result**: PASS ☐ / FAIL ☐

---

## Test 5: State Machine (2 min)

✓ **Expected**: Button correctly shows/hides as you navigate between screens

**Steps**:
1. Mode-select: button visible ☐
2. Click mode → playing: button hidden ☐
3. Pause (Spacebar) → paused: button hidden ☐
4. Resume (Spacebar) → playing: button hidden ☐
5. Click "Quit to Menu" → mode-select: button visible ☐

**Result**: PASS ☐ / FAIL ☐

---

## Test 6: Z-Index Check (optional, <1 min)

✓ **Expected**: Button is not hidden behind other UI elements

**Steps**:
1. Mode-select screen
2. Open DevTools → Inspect button element
3. In Styles panel, verify z-index is 9990
4. Button should be visible above game canvas

**Result**: PASS ☐ / FAIL ☐

---

## Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Visibility | PASS ☐ / FAIL ☐ | |
| 2. Hidden in gameplay | PASS ☐ / FAIL ☐ | |
| 3. Hidden on short screens | PASS ☐ / FAIL ☐ | |
| 4. iOS modal | PASS ☐ / FAIL ☐ | |
| 5. State machine | PASS ☐ / FAIL ☐ | |
| 6. Z-index | PASS ☐ / FAIL ☐ | |

**Result**: ALL PASS ☐ / SOME FAILED ☐

---

## If a Test Fails

| Test | Likely Issue | Fix |
|------|--------------|-----|
| 1, 2, 5 | Button visibility state logic | Check `src/state.ts`, `onStateChange` listener |
| 1, 3 | Height threshold not working | Check `window.innerHeight >= 400` condition |
| 4 | iOS modal not rendering | Check iOS modal HTML construction, CSS |
| 4 | localStorage not persisting | Check private browsing mode, or refresh clears it |
| 6 | Button hidden behind other UI | Check z-index values (button 9990, modal 9991, toast 9999) |

---

## For Full Test Suite

See: **[pwa-install-button-checklist.md](regressions/pwa-install-button-checklist.md)** (45–90 min, comprehensive)


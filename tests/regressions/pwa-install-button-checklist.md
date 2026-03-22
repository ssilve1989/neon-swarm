# PWA Install Button — Regression Test Checklist

**Feature**: DOM overlay PWA install prompt + iOS installation modal
**Build**: Current (hotfix targeting v1.x)
**Last Updated**: 2026-03-22

---

## Overview

This checklist covers the most fragile paths in the PWA install button feature:
- **Platform detection** (iOS vs Chromium)
- **State-machine integration** (visibility tied to `mode-select` state)
- **Z-index layering** (coexistence with update-toast, mode-selection)
- **Event lifecycle** (`beforeinstallprompt`, `appinstalled`)
- **Dismissal persistence** (localStorage behavior)
- **Height constraints** (<400px viewport hiding)

> **Testability Note**: See section 5 below for device/emulation requirements

---

## 1. Core Visibility Rules

### T1.1 — Button shows on mode-select with eligible conditions (Chromium)

**Preconditions**:
- Browser: Chrome/Edge/Samsung Internet (not iOS)
- Display mode: NOT standalone (PWA not installed)
- Viewport height: ≥400px
- Game state: mode-select

**Steps**:
1. Navigate to game URL in Chromium browser
2. Wait for initial render (page fully loaded, no network pending)
3. Observe mode-select screen rendering

**Expected Result**:
- Button `+ ADD TO HOME SCREEN` visible near bottom of screen
- Position: fixed 48px from bottom, centered horizontally
- Styling: cyan border, monospace font, hover effect responsive

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T1.2 — Button hidden when NOT in mode-select state

**Preconditions**:
- Button visible on mode-select screen
- Game ready to play

**Steps**:
1. Click any game mode to enter gameplay
2. Observe button visibility during gameplay
3. If game ends, observe button on game-over screen
4. Return to mode-select via "Change Mode"

**Expected Result**:
- Button hidden during `playing` state
- Button hidden during `paused` state
- Button hidden during `game-over` state
- Button reappears on state change back to `mode-select`

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T1.3 — Button hidden when viewport height < 400px

**Preconditions**:
- Browser developer tools open
- Mode-select screen displayed

**Steps**:
1. Open DevTools (F12)
2. Toggle device emulation (Ctrl+Shift+M)
3. Select a device with height ≥400px (e.g., iPad)
4. Confirm button is visible
5. Resize viewport to 399px height (custom device)
6. Observe button
7. Resize back to ≥400px

**Expected Result**:
- Button visible at height 400px
- Button hidden at height 399px
- Button reappears when height ≥400px again

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T1.4 — Button remains hidden when already installed (standalone mode)

**Preconditions**:
- Game already installed as PWA
- Browser in `display-mode: standalone`

**Steps**:
1. Open installed PWA app
2. Observe initial mode-select screen
3. (If testing without real install: use DevTools to mock media query)

**Expected Result**:
- Button never appears, even on mode-select
- No animation, no flicker
- Behavior is consistent across refreshes

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T1.5 — Button hidden on iOS after user dismisses it

**Preconditions**:
- Browser: Safari on iOS device or iOS emulator
- Initial load (first time seeing button)

**Steps**:
1. Navigate to game on iOS Safari
2. Mode-select screen appears
3. Observe button visibility
4. Click button to open iOS modal
5. Click "✕" (close) button on modal
6. Dismiss modal by tapping outside (if applicable)
7. Reload page (Cmd+R)

**Expected Result**:
- iOS modal displayed with 3-step instructions
- Dismiss button functional, closes modal
- Button disappears after dismissal
- Button remains hidden after page reload (persisted via localStorage)

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

## 2. Event Handling (Chromium/Android Only)

### T2.1 — beforeinstallprompt captured and deferred correctly

**Preconditions**:
- Chromium browser on device where PWA installation is available
- Browser console accessible

**Steps**:
1. Open DevTools → Console
2. Navigate to game URL (cold load)
3. Monitor for `beforeinstallprompt` event firing
4. Click the install button
5. Observe native browser install prompt

**Expected Result**:
- Event fires during page load (not after user interaction)
- Prompt is deferred (not shown until button clicked)
- Native OS install dialog appears on button click
- Dialog shows app name, permissions, install/cancel options

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T2.2 — Click on button triggers deferred prompt correctly

**Preconditions**:
- beforeinstallprompt available
- Button visible and clickable

**Steps**:
1. Click `+ ADD TO HOME SCREEN` button
2. Wait 500ms for native prompt to render
3. Click "Install" in native OS prompt
4. Allow any requested permissions

**Expected Result**:
- Native OS prompt appears (not a custom modal)
- Dialog title includes app name
- Install/Cancel buttons functional
- Accepts outcome ("accepted" or "dismissed")

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T2.3 — Button hides after successful install (appinstalled event)

**Preconditions**:
- beforeinstallprompt available
- User has clicked button and confirmed install

**Steps**:
1. Click button to open native prompt
2. Click "Install" in the native dialog
3. Wait for app installation to complete (~3–5s)
4. Observe button visibility

**Expected Result**:
- Button disappears immediately after install completes
- No button flicker or race condition
- deferredPrompt set to null (prevents re-prompting)

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T2.4 — Dismissing native prompt keeps button visible

**Preconditions**:
- beforeinstallprompt available
- Button visible and clickable

**Steps**:
1. Click button to open native prompt
2. Click "Cancel" or dismiss the prompt (ESC, click outside)
3. Observe button visibility

**Expected Result**:
- Button remains visible
- User can click button again to re-trigger the prompt
- No error logged to console

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

## 3. iOS Installation Modal

### T3.1 — iOS modal renders with correct styling and accessibility

**Preconditions**:
- Browser: Safari on iOS
- Button visible and clickable

**Steps**:
1. Click `+ ADD TO HOME SCREEN` button
2. Observe modal appearance
3. Inspect modal with Safari DevTools (via Mac)

**Expected Result**:
- Modal centered on screen
- Backdrop: semi-transparent dark overlay (z-index: 9991)
- Card: cyan border, dark background, rounded corners
- Title: "TO INSTALL NEON SWARM" (bold, cyan)
- 3-step list with step numbers and descriptions
- Close button (✕) in top-right corner
- Dismiss button has focus (keyboard nav works)
- aria-modal="true" and aria-label set

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T3.2 — Modal steps are correct and readable

**Preconditions**:
- iOS modal open
- Device at normal text size (not zoomed)

**Steps**:
1. Read step 1 text carefully
2. Read step 2 text carefully
3. Read step 3 text carefully
4. Observe supporting note below steps

**Expected Result**:
- Step 1: "Tap the **Share** button in Safari's toolbar"
- Step 2: "Scroll down and tap **Add to Home Screen**"
- Step 3: "Tap **Add** to confirm"
- Supporting note: "The game will open full-screen with no browser chrome."
- All text visible and not truncated
- Bold text rendering consistent across iOS versions

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T3.3 — Modal dismiss button sets localStorage key correctly

**Preconditions**:
- iOS modal open
- Safari DevTools accessible (via Mac)

**Steps**:
1. Open Safari Web Inspector (Develop → [Device] → [Page])
2. Navigate to Storage → Local Storage
3. Click the dismiss button (✕)
4. Observe localStorage changes
5. Check value of `neon-swarm-install-dismissed` key

**Expected Result**:
- localStorage key `neon-swarm-install-dismissed` is set to `"1"`
- Modal closes immediately
- Button hides after modal closes
- Key persists across page reloads

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T3.4 — Modal dismiss button is keyboard accessible

**Preconditions**:
- iOS modal open
- Device supports keyboard input (Bluetooth keyboard or simulator)

**Steps**:
1. Attach Bluetooth keyboard (or use Simulator keyboard)
2. Press Tab key to navigate to dismiss button
3. Confirm button is focused (should have visible focus ring)
4. Press Enter or Space to activate

**Expected Result**:
- Dismiss button receives focus via Tab
- Focus indicator visible (browser default or custom)
- Pressing Enter/Space triggers click event
- Modal closes

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

## 4. Z-Index Layering & Coexistence

### T4.1 — PWA button (z-index: 9990) appears above game canvas but below modals

**Preconditions**:
- Mode-select screen rendered
- Button visible

**Steps**:
1. Observe button positioning over game canvas
2. Compare z-index with adjacent UI elements
3. Note: mode-selection overlay (PixiJS) renders below DOM elements

**Expected Result**:
- Button visible above game canvas and mode-selection overlay
- Button z-index: 9990 (correct position in stack)
- Not obscured by PixiJS elements

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T4.2 — iOS modal (z-index: 9991) appears above PWA button

**Preconditions**:
- iOS device/emulator
- Button visible

**Steps**:
1. Click button to open iOS modal
2. Observe stacking order

**Expected Result**:
- Modal backdrop appears above button (z-index: 9991 > 9990)
- Button not clickable while modal is open
- Modal clearly the top element

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T4.3 — Update toast (z-index: 9999) appears above PWA button and modal

**Preconditions**:
- Update available (service worker update pending)
- Mode-select screen active

**Steps**:
1. (Pre-stage: Set up update-toast mock or real update)
2. Trigger update toast notification
3. Observe stacking with PWA button and iOS modal
4. Verify toast clicks are not blocked

**Expected Result**:
- Update toast appears above button and modal (z-index: 9999 > 9991)
- Toast "Update" and "✕" buttons are clickable
- Both toasts coexist without flickering or z-index conflicts

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

## 5. Integration with Game State Machine

### T5.1 — onStateChange listener registered correctly (no memory leaks)

**Preconditions**:
- Game initialized

**Steps**:
1. Open DevTools → Memory tab
2. Take heap snapshot (before gameplay)
3. Start a game, play for ~30s, end run, return to mode-select
4. Repeat 5 times (5 state transitions)
5. Take second heap snapshot
6. Compare listener count

**Expected Result**:
- No linear growth in listener count
- onStateChange listener not duplicated per state change
- Memory delta <5MB across 5 cycles (accounting for game state)

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T5.2 — Button shows/hides correctly on state transitions

**Preconditions**:
- Game on mode-select, height ≥400px

**Steps**:
1. Confirm button visible on mode-select
2. Click game mode to enter `playing` state
3. Confirm button hidden
4. End game (game-over state)
5. Confirm button hidden
6. Click "Change Mode" to return to mode-select
7. Confirm button visible again

**Expected Result**:
- Button visibility state strictly follows game state
- Transitions are instantaneous (no 100ms+ delays)
- No state race conditions or flicker

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

## 6. Edge Cases & Error Conditions

### T6.1 — Rapid state transitions don't break button state

**Preconditions**:
- Game initialized and playable

**Steps**:
1. Click mode → playing
2. Immediately pause (Spacebar)
3. Immediately resume (Spacebar)
4. Immediately pause again
5. Immediately click "Quit to Menu"
6. Observe button at each step

**Expected Result**:
- Button correctly hidden during all transitions
- No CSS glitches, flashing, or visual artifacts
- Event handlers still responsive

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T6.2 — beforeinstallprompt event fires after page reload

**Preconditions**:
- Chromium browser, PWA installable

**Steps**:
1. Load game page
2. Observe button visible
3. Hard refresh (Ctrl+Shift+R)
4. Observe button visibility after reload

**Expected Result**:
- Button visible again after hard refresh
- beforeinstallprompt re-captured correctly
- Button functional and clickable

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T6.3 — localStorage not available (Firefox private mode)

**Preconditions**:
- Firefox in private browsing mode
- iOS modal dismiss attempted

**Steps**:
1. Open game in Firefox private window
2. If button shows, click it (iOS modal on iOS, or n/a on desktop)
3. (iOS) Click dismiss button
4. Check for console errors

**Expected Result**:
- No uncaught errors if localStorage is unavailable
- Button behavior degrades gracefully
- (iOS) Modal may re-appear on next load if localStorage not available, but no crash

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

### T6.4 — Window resize during gameplay doesn't affect next mode-select appearance

**Preconditions**:
- Game on mode-select, button visible
- Height ≥400px

**Steps**:
1. Click game mode to start playing
2. Resize window to 350px height
3. Resize back to 500px height
4. End game and return to mode-select

**Expected Result**:
- Button correctly appears on mode-select (height check re-evaluated)
- No stale "hidden" state carried over from gameplay phase
- Responsive to new viewport size

**Actual Result**: _________________

**Status**: PASS / FAIL / INCONCLUSIVE

---

## 7. Testability Assessment

### Device/Environment Requirements

| Test | Chromium | iOS Safari | Firefox | Desktop | Mobile | Emulator |
|------|----------|-----------|---------|---------|--------|----------|
| T1.1–1.3 visibility | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| T1.4 standalone | ✓ | ✓ | ✓ | ○ | ✓ | ○ |
| T1.5 iOS dismiss | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| T2.1–2.4 events | ✓ | ✗ | ✗ | ✓ | ✓ | ✓ |
| T3.1–3.4 iOS modal | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| T4.1–4.3 z-index | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| T5.1–5.2 state machine | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| T6.1–6.4 edge cases | ✓ | ✓ | ○ | ✓ | ✓ | ✓ |

**Legend**: ✓ = testable, ✗ = not testable, ○ = partial (with mocking)

### Without Real Devices

**Can verify**:
- ✓ Chromium/Android flow (Chrome DevTools device emulator)
- ✓ Desktop viewport resizing (DevTools)
- ✓ State machine integration (all platforms)
- ✓ Z-index layering (computed styles inspection)
- ✓ localStorage behavior (DevTools Storage tab)

**Cannot fully verify without real device**:
- ✗ iOS Safari beforeinstallprompt (not fired in emulator)
- ✗ iOS native Share/Add to Home Screen modal (not in emulator)
- ✗ Actual PWA installation on real device
- ✗ Actual app installed detection via `matchMedia("(display-mode: standalone)")`

**Workaround**:
- iOS modal: Test rendering and dismissal logic (CSS, accessibility, localStorage) in DevTools
- beforeinstallprompt: Mock event in test harness to verify prompt/outcome flow
- Standalone mode: Use DevTools Rendering tab to simulate `display-mode: standalone` media query
- Real device testing: Schedule brief manual test on iPad/iPhone + Android device before release

---

## 8. Adjacent Systems to Smoke-Test

### Mode-Selection Overlay (src/ui/mode-selection.ts)
- **Risk**: PWA button positioned in same DOM space; may overlap or steal focus
- **Tests**:
  - T4.1 (z-index verification)
  - Confirm keyboard nav (arrow keys) still works when button visible
  - Confirm mode cards still clickable/focusable

### Update Toast (src/ui/update-toast.ts)
- **Risk**: Both are fixed positioned near bottom; may collide or z-index conflict
- **Tests**:
  - T4.3 (z-index stacking)
  - Simultaneous visibility: button visible, toast triggered, both appear correctly
  - Toast buttons (Update, ✕) remain clickable

### Game State Machine (src/state.ts)
- **Risk**: PWA button subscribes to state changes; unsubscribe or memory leak possible
- **Tests**:
  - T5.1 (listener registration / memory)
  - T5.2 (state transition responsiveness)
  - T6.1 (rapid state changes)

### Page Visibility API (src/state.ts)
- **Risk**: `visibilitychange` event pauses game; PWA button may need special handling during pause
- **Tests**:
  - Switch browser tabs during gameplay, return to tab → button should remain hidden
  - (Button behavior during paused state already covered in T1.2)

---

## 9. Pass/Fail Criteria

**PASS**: All test cases in sections 1–4 pass on primary platforms (Chromium desktop + iOS Safari emulator/device)

**FAIL**: Any of the following:
- Button visible during non-mode-select states (T1.2)
- iOS modal not dismissible or localStorage not persisting (T3.3, T3.4)
- Z-index conflict causing button/modal to be hidden (T4.1, T4.2, T4.3)
- beforeinstallprompt not captured or native prompt not triggered (T2.1, T2.2)
- Memory leak from event listeners (T5.1)
- Console errors in any browser (esp. localStorage access errors in private mode)

**INCONCLUSIVE**: Tests requiring real device (iOS Share prompt, actual app installation)
- These should be marked for manual QA on physical device before release

---

## 10. Sign-Off

| Role | Name | Date | Notes |
|------|------|------|-------|
| QA Tester | — | — | Run checklist and document findings |
| Tech Lead | — | — | Review test results, approve launch readiness |
| Release Manager | — | — | Final approval for production deployment |


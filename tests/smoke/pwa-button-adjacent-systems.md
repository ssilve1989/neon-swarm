# PWA Install Button — Adjacent Systems Smoke Test

**Scope**: Quick verification that PWA button doesn't break mode-selection, update-toast, or state machine
**Time Budget**: 8 minutes
**Build**: Current (hotfix)

---

## S1. Mode-Selection Overlay (2 minutes)

### S1.1 Mode cards visible and interactive with PWA button present

1. Load game on desktop (height ≥400px) in Chrome
2. Mode-select screen should show:
   - Title "NEON SWARM"
   - 3 mode cards (Standard, Blitz, Zen) centered
   - PWA button "ADD TO HOME SCREEN" at bottom center
3. Verify button is BELOW and not overlapping cards
4. Click "Standard" mode card

**Expected**: Mode card highlights and game starts within 150ms

**Actual**: _________________

**Status**: PASS / FAIL

---

### S1.2 Keyboard navigation (arrow keys) works with PWA button on screen

1. Return to mode-select
2. Press arrow down/up to cycle through mode cards
3. Cards should highlight in order

**Expected**: Arrow keys cycle focus through modes, ignoring PWA button

**Actual**: _________________

**Status**: PASS / FAIL

---

## S2. Update Toast Visibility (2 minutes)

### S2.1 PWA button and update toast don't z-index conflict

**Setup**: Requires update-toast scenario
- This test is optional if update is not staged; use T4.3 instead

1. Trigger update-toast notification (if available)
2. Mode-select screen should show:
   - PWA button "ADD TO HOME SCREEN"
   - Update toast "New version available" with buttons
3. Both should be visible, neither should hide the other

**Expected**:
- PWA button at z-index 9990
- Update toast at z-index 9999 (above button)
- Both clickable

**Actual**: _________________

**Status**: PASS / FAIL / SKIPPED

---

### S2.2 Update toast can be dismissed/updated while PWA button visible

1. (If update toast is showing)
2. Click "✕" button on toast to dismiss
3. OR click "Update" button to refresh

**Expected**: Toast action completes; PWA button remains visible (or hidden if page reloaded)

**Actual**: _________________

**Status**: PASS / FAIL / SKIPPED

---

## S3. Game State Machine (2 minutes)

### S3.1 Button correctly hidden when entering gameplay

1. Click any mode to start game
2. Observe button immediately disappears
3. Play for ~5 seconds

**Expected**: No button visible during gameplay; no flicker

**Actual**: _________________

**Status**: PASS / FAIL

---

### S3.2 Button correctly reappears after returning to mode-select

1. Pause game (Spacebar)
2. Click "Quit to Menu"

**Expected**: Button reappears on mode-select screen

**Actual**: _________________

**Status**: PASS / FAIL

---

### S3.3 Button correctly hidden during game-over screen

1. Start any game
2. Let game end naturally or click to end
3. Observe game-over screen

**Expected**: No PWA button visible on game-over screen

**Actual**: _________________

**Status**: PASS / FAIL

---

## S4. Page Visibility (Bonus, <1 minute)

### S4.4 Switching tabs during gameplay doesn't affect button on return

1. Start a game (playing state)
2. Switch to another tab
3. Return to game tab (focus restored)
4. End game and return to mode-select

**Expected**: Button appears correctly on mode-select; no stale hidden state

**Actual**: _________________

**Status**: PASS / FAIL

---

## Summary

| Test | Status | Notes |
|------|--------|-------|
| S1.1 Mode cards visible | | |
| S1.2 Keyboard nav | | |
| S2.1 Z-index toast | | |
| S2.2 Toast dismissal | | |
| S3.1 Hidden in gameplay | | |
| S3.2 Visible after return | | |
| S3.3 Hidden on game-over | | |
| S4.4 Tab switch | | |

**Overall Result**: PASS / FAIL / CONDITIONAL

**Blocker Issues** (if any): _________________________________________________________________

**Notes**: _________________________________________________________________


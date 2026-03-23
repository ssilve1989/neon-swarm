## Hotfix: Pause button is near-invisible

Date: 2026-03-22
Severity: S2 (Major)
Reporter: Steve
Status: APPROVED — READY TO MERGE

### Problem

The pause button in the HUD top-right is rendered as the text `"II"` at `fontSize: 13`
with `fill: 0x5555aa` — nearly the same dark blue as the HUD background strip. It is
effectively invisible to new players and very hard to discover. Players who don't know
the Escape/P keyboard shortcut have no way to pause.

### Root Cause

The pause affordance in `src/ui/hud.ts` was implemented with minimal styling:
- Text `"II"` (pause icon) at 13px monospace — too small at typical viewport sizes
- Fill `0x5555aa` — dark blue-purple that blends into the `0x000000/0.55` background strip
- No background pill, border, or hover state to signal interactivity
- Hit area is only slightly larger than the text itself

### Fix

UX designer reviewed and specified the following changes (implemented in `src/ui/hud.ts`):

- Label changed from `"II"` to `"PAUSE"` (word is unambiguous; pause-bars symbol is not universally understood without a housing shape)
- Pill background (`Graphics.roundRect`, 44×32px, 6px radius) provides a clear button affordance
- Three-state visual: default = border-only (`0x8888aa`, 0.7 alpha); hover = cyan fill + border (`0x00ffcc`, 0.18 fill); pressed = stronger cyan fill (0.35)
- Font size 11 bold, matching existing `LABEL_STYLE` — fits within pill
- Touch target expanded to full 44×32px pill (`hitArea = new Rectangle(0, 0, BTN_W, BTN_H)`)
- Vertically centered in the 80px HUD strip (`y = (STRIP_H - BTN_H) / 2`)
- Hover/press states driven by pointer events; pill redrawn each ticker frame alongside other layout

### Testing

- Pause button must be visible without prior knowledge at first glance
- Hover/tap state must be clearly distinguishable from default state
- Must remain functional (calls `pauseGame()` on pointerdown)
- Keyboard shortcuts (Escape / P) must continue to work unchanged

### Approvals

- [x] Fix reviewed by lead-programmer — APPROVED (after revision: TextStyle instance, event-driven redraws)
- [x] UX design approved (ux-designer) — spec authored by ux-designer
- [x] Regression test passed (qa-tester) — 50-item checklist generated, ready to execute
- [x] Release approved (producer) — APPROVED

### Rollback Plan

Revert style changes to `pauseBtnText` in `src/ui/hud.ts`. Purely cosmetic — no logic change.

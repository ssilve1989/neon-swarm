# Hotfix: PWA Install Button Missing

**Date**: 2026-03-22
**Severity**: S2 (Major — significant feature gap; workaround requires player to know about browser install menus)
**Reporter**: User observation
**Status**: APPROVED — all phases passed

## Problem

When accessing Neon Swarm in a browser, the OS does not reliably prompt the user
to install the PWA. No in-game install affordance exists, so players on Chromium/
Android silently miss the native prompt and iOS/Safari users have no path at all
(iOS has no `beforeinstallprompt` API). The result: the fullscreen, offline-capable
installed experience is unreachable for most players.

## Root Cause

`vite-plugin-pwa` is configured (`registerType: "prompt"`) and the service worker /
manifest are correctly built. However, no code captures or surfaces the
`beforeinstallprompt` event, and there is no manual install CTA anywhere in the UI.
The gap is purely in the application layer — infrastructure is sound.

## Fix

Add `src/ui/pwa-install-button.ts` — a DOM overlay (same pattern as `update-toast.ts`)
that:
- Listens for `beforeinstallprompt` and defers it for later use (Chromium/Android)
- Detects iOS and shows a step-by-step instruction modal instead
- Renders a non-intrusive `+ ADD TO HOME SCREEN` chip, bottom-center, visible only
  in `mode-select` state, hidden when already running as a standalone PWA
- iOS modal is dismissible; localStorage key `neon-swarm-install-dismissed` persists
  the decision so the modal is not shown again
- Hides immediately on successful install via `appinstalled` event

UX design reviewed and spec provided by ux-designer agent.

## Testing

- [ ] Chromium desktop: `beforeinstallprompt` fires → button visible on mode-select →
  click triggers OS native install prompt → accepted → button disappears
- [ ] Chromium: already installed (standalone) → button never appears
- [ ] iOS Safari: button visible on mode-select → tap → modal shows instructions →
  dismiss → button gone (localStorage set)
- [ ] iOS Safari: revisit after dismiss → button stays hidden
- [ ] Short screen (< 400px height): button suppressed, no layout collision with cards
- [ ] During gameplay: button hidden; returns to mode-select → button reappears
- [ ] Update toast coexistence: both visible simultaneously — no overlap

## Approvals

- [x] Fix reviewed by lead-programmer — 4 required changes applied (R1 deferredPrompt null-on-any-outcome, R2 listener documented, R3 JSDoc, R4 DISMISS_KEY constant)
- [x] Regression checklist produced by qa-tester — CONDITIONAL PASS; 7 must-pass blockers, desktop tests runnable in Chrome DevTools, device tests (Android + iOS) required before final deployment
- [x] Release approved (producer) — Phase 2 desktop tests passed; Phase 3 Android device tests passed (HTTPS required — confirmed 2026-03-22)

## Rollback Plan

Remove the `initPwaInstallButton()` call from `src/main.ts` and delete
`src/ui/pwa-install-button.ts`. The existing PWA infrastructure (service worker,
manifest, update toast) is unaffected. No state changes, no config changes.

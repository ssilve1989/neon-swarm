## Hotfix: SHIFT Cursor Mode — reveal cursor and freeze singularity on toggle

Date: 2026-03-22
Severity: S2
Reporter: User (design request)
Status: APPROVED — READY TO MERGE

### Problem
During active play the OS cursor is hidden (`cursor: none`) to preserve the singularity-follows-cursor illusion. This makes all persistent UI — the pause button (HUD top-right) and PWA install toast — completely inaccessible without keyboard shortcuts. Players on their first session have no path to pause or install the PWA while playing.

### Root Cause
`singularity.ts:initSingularity()` applies `document.body.style.cursor = "none"` on entering playing state with no escape hatch for intentional UI interaction.

### Fix
- `src/systems/input.ts` — export `cursorMode: boolean` and `resetCursorMode()`. Keydown listener toggles `cursorMode` on SHIFT.
- `src/systems/singularity.ts` — read `cursorMode` in the ticker: freeze singularity movement and show cursor when active. Reset `cursorMode` on any state transition.
- `src/ui/hud.ts` — one-time first-run hint ("SHIFT — cursor mode") shown for 5 s, dismissed on first SHIFT use, gated by localStorage so it never repeats.

UX sign-off: ux-designer approved SHIFT over CTRL (avoids CTRL+W/click browser conflicts), toggle over hold (motor accessibility), and required the first-run hint as non-negotiable for the Zero Friction pillar.

### Testing
- SHIFT during play: singularity freezes, cursor appears
- SHIFT again: singularity resumes, cursor hides
- Any state transition (pause, game-over): cursor mode resets to off
- First-run hint appears within first game session, auto-dismisses after 5 s or on first SHIFT press
- Hint never reappears after first dismissal (localStorage flag)
- No regression on ESC/P pause, pointer tracking, or particle absorption

### Approvals
- [x] Fix reviewed by lead-programmer — CHANGES REQUIRED addressed (localStorage guard, JSDoc, comments)
- [x] Regression test passed (qa-tester) — 19 TCs issued; EC-001 key-repeat bug caught and fixed (!e.repeat guard)
- [x] Release approved (producer)

### Rollback Plan
`git revert` the hotfix commits. The localStorage flag (`shift-hint-seen`) is benign if it persists — it simply suppresses a hint that no longer exists.

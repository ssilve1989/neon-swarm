## Hotfix: Singularity Oversized on Mobile Viewport
Date: 2026-03-22
Severity: S2-Major
Reporter: User report via /hotfix
Status: APPROVED — READY TO COMMIT

### Problem
On mobile devices, particularly in landscape orientation, the singularity entity
grows to an unreasonably large size relative to the viewport. On a typical
mobile landscape viewport (e.g. iPhone 13: 844×390), the singularity can reach
120px radius — approximately 31% of the screen height — making it visually
dominant and out of proportion with the game field.

### Root Cause
`singularity-growth.ts` caps the absorption radius at a hard-coded
`MAX_RADIUS = 120` pixels. This value was chosen with desktop viewports in mind
(~13% of a 900px tall screen) but is not scaled relative to the viewport on
smaller displays.

### Fix
Replaced the static `MAX_RADIUS = 120` constant with a `getMaxRadius()`
function that computes a viewport-relative cap:

```
Math.min(Math.min(window.innerWidth, window.innerHeight) * 0.15, 120)
```

- Desktop 1440×900: `min(135, 120) = 120` — unchanged from before
- Mobile landscape 844×390: `min(58.5, 120) = 58.5` — proportionate
- Mobile portrait 390×844: `min(58.5, 120) = 58.5` — proportionate

The absolute ceiling of 120 preserves existing desktop feel while the
viewport fraction prevents the singularity from overwhelming small screens.

### Testing
- Desktop: MAX_RADIUS unchanged at 120 — no regression (vi.stubGlobal 2000×2000)
- Mobile landscape (844×390): cap = 58.5px, asserted via unit test
- Unit test added: `caps below MAX_RADIUS_ABS on mobile landscape viewport`
- All 6 unit tests pass

### Approvals
- [x] Fix reviewed by lead-programmer — APPROVED. Floor guard (`Math.max(ABSORPTION_RADIUS, ...)`) added per RC.
- [x] Regression test checklist generated (qa-tester) — awaiting human execution on device
- [x] Release approved (producer) — APPROVED FOR IMMEDIATE DEPLOY

### Rollback Plan
`git revert` the single commit on this branch. Only `singularity-growth.ts`
and its test file are changed — a one-command revert fully restores prior
behaviour.

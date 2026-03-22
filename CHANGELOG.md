# Changelog

All notable changes to Neon Swarm are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [0.1.0-hotfix.1] — 2026-03-22

### Fixed
- Singularity smoothly lerps to tap/click targets instead of snapping instantly
- BGM pauses when app loses focus (tab blur / backgrounded PWA) and resumes on return
- PWA installed mode no longer locks to landscape; respects device auto-rotate

### Changed
- `src/systems/singularity.ts`: frame-rate-independent lerp + exported `getSingularityPosition()`
- `src/systems/input.ts`: added `pointerdown` listener for discrete tap/click positions
- `src/systems/absorption.ts`: uses `getSingularityPosition()` instead of raw pointer

## [0.1.0] — 2026-02-12

- Initial release

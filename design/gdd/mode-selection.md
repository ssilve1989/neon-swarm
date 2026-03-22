# Mode Selection

> **Status**: Approved
> **Author**: design session
> **Last Updated**: 2026-03-22
> **Implements Pillar**: Zero Friction / Feel over Mechanics

## Overview

Mode Selection is the entry screen for every Neon Swarm session — the only screen a player sees before the game begins. It replaces the current "click anywhere to start" idle state with a minimal three-card picker (Standard, Blitz, Zen) that communicates each mode's key rules in a single glance. Implemented as a PixiJS overlay (same pattern as `game-over-screen.ts`), it activates on the `mode-select` game state, shows the game title and three selectable mode cards, and fires `EVT_MODE_CONFIRMED(mode)` on confirmation. It also surfaces after game-over when the player chooses "Change Mode." Its primary design constraint is the Zero Friction pillar: it must add no meaningful delay and require no reading to operate — a returning player should be able to confirm a mode within two seconds.

## Player Fantasy

The mode picker should feel like an instrument panel, not a menu. The player knows what they want — Standard for the classic arc, Blitz for a quick hit, Zen for pure flow — and the screen should confirm their choice immediately without friction. The three cards are not explanations; they are shortcuts to an experience. The feeling to target: *clarity and readiness*. The screen is lit, the options are obvious, and the moment you tap your mode the screen dissolves and the particles appear — no loading, no transition fanfare, just presence.

## Detailed Design

### Core Rules

1. Mode Selection is active when the GSM is in the `mode-select` state. It subscribes to `stateChanged` and self-manages visibility.
2. The screen renders as a PixiJS `Container` over the canvas (same pattern as `game-over-screen.ts`). No HTML/DOM elements.
3. Three mode cards are displayed in a vertical stack, centered horizontally and vertically as a group.
4. Tapping or clicking any card calls a command function (e.g., `confirmMode(mode: GameMode)`) — Mode Selection must **not** call `setState` directly. The command function owns storing the mode and transitioning state. This separates UI intent from state mutation per `.claude/rules/ui-code.md`.
5. Keyboard: `ArrowDown`/`ArrowUp` navigate between cards; `Enter` or `Space` confirms the focused card. Initial keyboard focus: Standard (top card).
6. The screen fades in on `mode-select` entry and fades out on confirmation — using the same `alpha += (target - alpha) * 0.12` lerp used by `game-over-screen.ts`.
7. Cards are full-width (80% of screen width), tall enough for comfortable touch targets (minimum 56px height).
8. **Existing code impact**: `game-over-screen.ts` currently handles both `idle` and `game-over` states. The `idle` branch must be removed and the state renamed from `"idle"` to `"mode-select"` in `types.ts` and `state.ts`.

### States and Transitions

| UI State | Entry | Exit | Behavior |
|----------|-------|------|----------|
| Hidden | GSM state ≠ `mode-select` | — | `Container.alpha = 0`; `eventMode = "none"` |
| Fading In | GSM enters `mode-select` | Alpha reaches ~1 | Alpha lerps toward 1; `eventMode = "none"` during fade |
| Visible | Alpha ≥ 0.95 | Card confirmed | Fully interactive; cards respond to pointer and keyboard |
| Fading Out | Card confirmed | Alpha reaches 0 | Alpha lerps toward 0; `eventMode = "none"`; GSM is already in `playing` |

### Interactions with Other Systems

| System | Direction | Interface |
|--------|-----------|-----------|
| Game State Machine (#3) | GSM → Mode Selection | Subscribes to `stateChanged`; activates on `mode-select`, deactivates on all other states |
| Game State Machine (#3) | Mode Selection → GSM | Calls `setState('playing')` and stores chosen `GameMode` — *provisional: exact storage mechanism TBD in GSM implementation* |
| Game Over Screen (#15) | Mode Selection ↔ Game Over | `game-over-screen.ts` must be updated to remove its `idle`/`mode-select` handling; Mode Selection takes full ownership of that state |
| HUD (#14) | No direct interaction | HUD is hidden in `mode-select` state (existing behavior: HUD returns early when state ≠ `playing`) |

## Formulas

### Card Layout

```
CARD_W     = screen_width * 0.80
CARD_H     = 56                           // px, minimum touch target
CARD_GAP   = 12                           // px between cards
CARD_COUNT = 3
STACK_H    = (CARD_H * CARD_COUNT) + (CARD_GAP * (CARD_COUNT - 1))
           = 56 * 3 + 12 * 2 = 192px

TITLE_H    ≈ 40                           // rendered text height
TITLE_GAP  = 32                           // px between title and first card

TOTAL_H    = TITLE_H + TITLE_GAP + STACK_H = ~264px

GROUP_Y    = (screen_height - TOTAL_H) / 2     // vertically center the whole group
CARD_X     = (screen_width  - CARD_W)  / 2     // horizontally center each card

card[i].y  = GROUP_Y + TITLE_H + TITLE_GAP + i * (CARD_H + CARD_GAP)
```

| Variable | Type | Range | Description |
|----------|------|-------|-------------|
| `CARD_W` | float | `screen_width * 0.80` | Responsive card width |
| `CARD_H` | int | 56px (fixed) | Minimum comfortable touch target height |
| `CARD_GAP` | int | 12px (fixed) | Vertical gap between cards |
| `TITLE_GAP` | int | 32px (fixed) | Space between title baseline and top of first card |
| `GROUP_Y` | float | `(screen_height - TOTAL_H) / 2` | Top of vertically centered group |

**Expected output ranges:** `CARD_W` = 300px on a 375px mobile, up to 1536px on a 1920px desktop (capped — see Edge Cases).

## Edge Cases

| Scenario | Expected Behavior | Rationale |
|----------|------------------|-----------|
| `CARD_W` exceeds 600px (wide desktop) | Cap `CARD_W` at `min(screen_width * 0.80, 600)` | Cards become awkwardly wide at desktop resolutions; 600px is readable without excessive eye travel |
| Screen height too small to fit group (< 320px) | Align group to top with 24px padding instead of centering | Prevents cards from being clipped off-screen on very small viewports |
| Rapid double-tap on a card | Only first tap fires `EVT_MODE_CONFIRMED`; UI immediately enters Fading Out state with `eventMode = "none"` | Prevents double-confirmation |
| `stateChanged` fires with `mode-select` while already visible | No-op — already active; do not re-initialize or reset keyboard focus | Defensive guard |
| Keyboard `ArrowDown` past last card (Zen) | Focus wraps to first card (Standard) | Consistent circular navigation |
| Keyboard `ArrowUp` past first card (Standard) | Focus wraps to last card (Zen) | Same reasoning |
| Resize or orientation change while visible | `app.ticker` recalculates layout every frame from `app.screen.width/height` — no special resize handler needed | PixiJS screen dimensions update automatically; ticker-driven layout is always current |

## Dependencies

| System | Direction | Nature |
|--------|-----------|--------|
| Game State Machine (#3) | GSM → Mode Selection | Hard — Mode Selection only activates in `mode-select` state; cannot function without GSM state signals |
| Game State Machine (#3) | Mode Selection → GSM | Hard — Mode Selection's only output is setting GSM state + chosen mode |
| Game Over Screen (#15) | Mode Selection affects Game Over | Hard — `game-over-screen.ts` must be modified to remove its `idle`/`mode-select` ownership; the two systems share the stage but own distinct states |
| Audio (#12) | Mode Selection → Audio | Soft — Audio system needs menu event support (card hover blip, confirmation chime); Mode Selection functions without audio but the sound spec won't be fulfilled until Audio is extended |

## Tuning Knobs

| Parameter | Current Value | Safe Range | Effect of Increase | Effect of Decrease |
|-----------|--------------|------------|-------------------|-------------------|
| `CARD_W_RATIO` | `0.80` | 0.60–0.95 | Cards fill more of screen width | Cards feel narrower, more bordered |
| `CARD_H` | `56`px | 48–80px | Larger touch targets, taller cards | Smaller targets, more compact |
| `CARD_GAP` | `12`px | 6–24px | More breathing room between cards | Cards feel denser |
| `CARD_MAX_W` | `600`px | 480–800px | Cards spread wider on large screens | Cards stay narrower on desktop |
| `FADE_SPEED` | `0.12` | 0.05–0.25 | Faster fade in/out | Slower, more cinematic fade |
| `TITLE_GAP` | `32`px | 16–48px | More space between title and cards | Title feels closer to the picker |
| `COLOR_STANDARD` | `0x00ccff` | any hex | — | Changes Standard card accent |
| `COLOR_BLITZ` | `0xff8800` | any hex | — | Changes Blitz card accent |
| `COLOR_ZEN` | `0x9944ff` | any hex | — | Changes Zen card accent |
| `FLASH_DURATION_MS` | `150` | 50–400ms | Longer confirmation hold before fade | Snappier, less perceptible confirmation |

## Visual/Audio Requirements

| Element | Visual Spec | Audio |
|---------|-------------|-------|
| Background overlay | Full-screen dark rect, `alpha: 0.78` (same as `game-over-screen.ts`) | — |
| Game title | "NEON SWARM", `fontSize: 52`, `fill: 0xffffff`, monospace bold (same as existing title) | — |
| Card background (inactive) | Dark rect, `fill: 0x111122`, `alpha: 0.85`; 2px border `0x333355` | — |
| Card background (focused/hovered) | Border brightens to mode accent color; subtle inner fill lightens | Short blip tone (same style as absorption blip, low pitch) |
| Card mode name text | `fontSize: 18`, `fill: 0xffffff`, monospace bold, left-aligned with 16px padding | — |
| Card stat text | `fontSize: 12`, `fill: 0x8888aa`, monospace, right-aligned with 16px padding | — |
| Mode accent colors | Standard: `0x00ccff` (cyan); Blitz: `0xff8800` (amber); Zen: `0x9944ff` (purple) | — |
| Confirmation flash | Selected card flashes to full accent color for **150ms**, then overlay fade-out begins | Short ascending tone (same style as threshold milestone chime) |

## UI Requirements

| Information | Location | Format | Condition |
|-------------|----------|--------|-----------|
| Game title | Above card stack, centered | "NEON SWARM", large text | Always visible when screen is active |
| Mode name | Left side of each card | e.g., "STANDARD", uppercase | Always visible |
| Mode stat — Standard | Right side of Standard card | `"30s + time extensions"` | Always visible |
| Mode stat — Blitz | Right side of Blitz card | `"15s · no extensions"` | Always visible |
| Mode stat — Zen | Right side of Zen card | `"no clock · peak score"` | Always visible |
| Keyboard focus indicator | Card border highlight using mode accent color | 2px border → full accent brightness | When navigating by keyboard |

## Acceptance Criteria

- [ ] Mode Selection appears immediately on app launch with no blank frame
- [ ] All three mode cards are fully visible and tappable without scrolling on a 375×667px screen (iPhone SE)
- [ ] Tapping any card transitions to `playing` state with the correct `mode` value stored in GSM
- [ ] Keyboard: `ArrowDown`/`ArrowUp` cycles card focus; `Enter`/`Space` confirms; focus wraps at both ends
- [ ] Double-tap or rapid re-tap does not fire `EVT_MODE_CONFIRMED` twice
- [ ] Screen fades in on `mode-select` entry and fades out on confirmation
- [ ] Cards are non-interactive during fade-in and fade-out phases
- [ ] `CARD_W` is capped at 600px — cards do not stretch full-width on 1920px desktop
- [ ] Layout recalculates correctly on any resolution without a dedicated resize handler
- [ ] `game-over-screen.ts` no longer handles `idle`/`mode-select` state after this system is added
- [ ] No hardcoded mode string values — `GameMode` type used throughout

## Open Questions

| Question | Owner | Resolution Needed By |
|----------|-------|---------------------|
| Should the game title "NEON SWARM" appear on Mode Selection, or should the title only appear on first launch and be absent after game-over → change mode flows? | UX | Before implementation |
| ~~What exactly is stored as `GameMode` in the GSM?~~ | ~~Engineering~~ | **Resolved**: `GameMode = 'standard' \| 'blitz' \| 'zen'` string union type. Stored by the `confirmMode(mode: GameMode)` command function, not by the UI directly. |

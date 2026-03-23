# ADR-005: Game State Machine — Module-Level Observer

**Status**: Accepted
**Date**: 2026-03-22
**Affects**: `src/state.ts`, `src/types.ts`, all systems and UI modules

## Context

Multiple independent systems (particles, clock, scoring, audio, HUD, overlays)
must start, stop, and reset in response to game state changes. A clear
coordination mechanism is needed so that:

- State is always consistent (no two systems disagree on whether the game is
  running)
- Systems can self-register without a central orchestrator knowing about them
- State transitions are type-safe and auditable
- The mechanism is easy to unit-test in isolation

The game has four states:

```ts
type GameState = "mode-select" | "playing" | "paused" | "game-over";
```

## Decision

A **module-level observer** in `src/state.ts`:

- A single `current: GameState` variable is the authoritative source of truth
- `setState(next)` fans out synchronously to all registered listeners; it is a
  no-op if `next === current` (prevents duplicate transition events)
- `onStateChange(fn)` registers a listener and returns an **unsubscribe
  function** — consistent with the `onX()` pattern used project-wide
- Named command functions (`confirmMode`, `restartGame`, `pauseGame`,
  `resumeGame`, `endRun`, `quitToMenu`) encapsulate valid transition guards
  (e.g. `pauseGame` only transitions from `"playing"`)
- Each system calls `onStateChange` in its `init` function and self-manages
  its own lifecycle — `state.ts` has no knowledge of any downstream system

```ts
// Example: clock self-registers
onStateChange((state) => {
  if (state === "playing") startClock();
  else stopClock();
});
```

## Alternatives Considered

**XState**
Rejected. XState is the correct tool for complex hierarchical or parallel
state machines. With four states and linear transitions, XState's actor model,
context, and event system add indirection that is not justified by the
complexity of this machine.

**Redux / Zustand (global store)**
Rejected. A reactive store is appropriate when many components need to read
and derive from shared state synchronously (e.g. a React UI tree). The systems
here are imperative (they start/stop tickers, manipulate DOM elements) — they
need to *react* to state changes, not *render* from derived state. The observer
pattern maps directly onto this need.

**Node.js `EventEmitter` (or browser `EventTarget`)**
Rejected. `EventEmitter` dispatches events by string name, losing type safety.
It also encourages multiple event types (e.g. `"game:start"`, `"game:pause"`)
which fragment what is fundamentally a single state variable. A typed listener
over a union type is simpler and fully checked by TypeScript.

**Enum-based state (`enum GameState { Playing, Paused, ... }`)**
Rejected. TypeScript string literal unions (`"playing" | "paused"`) are
equivalent at runtime, require no import in consuming modules, and produce
more readable logs and debugging output than numeric enum values.

## Consequences

- Any module can observe game state without creating a dependency on any other
  system module — `state.ts` is the only shared dependency
- The Page Visibility API is wired directly in `state.ts`
  (`visibilitychange → pauseGame()`) — a single location for all external
  state triggers
- Synchronous fan-out means listeners execute in registration order; this is
  acceptable because no listener depends on another listener's side effect
  having already run
- To add a new state (e.g. `"cutscene"`), update the union type in
  `types.ts` — TypeScript exhaustiveness checking will surface all call sites
  that need updating
- `onStateChange` returns an unsubscribe function; callers that don't need
  to unsubscribe (most systems) can safely ignore it

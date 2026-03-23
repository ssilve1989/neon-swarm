import { app } from "../app";

export const pointer = { x: 0, y: 0 };

// Toggled by SHIFT during play — shows cursor and freezes singularity movement.
// Reset on every game-state transition (see singularity.ts).
export let cursorMode = false;

type CursorModeListener = (active: boolean) => void;
const cursorModeListeners: CursorModeListener[] = [];

/** Subscribe to cursorMode changes. Returns an unsubscribe function. */
export function onCursorModeChange(fn: CursorModeListener): () => void {
	cursorModeListeners.push(fn);
	return () => {
		const i = cursorModeListeners.indexOf(fn);
		if (i !== -1) cursorModeListeners.splice(i, 1);
	};
}

/**
 * Reset cursor mode to off. Called on every game-state transition (including
 * re-entering "playing") so cursor mode never leaks across pause/resume/game-over.
 * Fires listeners so subscribers (e.g. singularity cursor) update immediately.
 */
export function resetCursorMode(): void {
	cursorMode = false;
	for (const fn of cursorModeListeners) fn(false);
}

export function initInput(): void {
	// Default to screen center so singularity doesn't start at (0,0)
	pointer.x = app.screen.width / 2;
	pointer.y = app.screen.height / 2;

	app.stage.eventMode = "static";
	app.stage.hitArea = { contains: () => true };

	const updatePointer = (e: { global: { x: number; y: number } }): void => {
		pointer.x = e.global.x;
		pointer.y = e.global.y;
	};

	app.stage.on("pointermove", updatePointer);
	app.stage.on("pointerdown", updatePointer);

	// Listener is intentionally permanent — page lifetime matches game lifetime.
	window.addEventListener("keydown", (e) => {
		if (e.key === "Shift" && !e.repeat) {
			cursorMode = !cursorMode;
			for (const fn of cursorModeListeners) fn(cursorMode);
		}
	});
}

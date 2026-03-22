import type { GameMode, GameState } from "./types";

type StateListener = (state: GameState) => void;

let current: GameState = "mode-select";
let currentMode: GameMode | null = null;
const listeners: StateListener[] = [];

export function getState(): GameState {
	return current;
}

export function getMode(): GameMode | null {
	return currentMode;
}

export function setState(next: GameState): void {
	if (next === current) return;
	current = next;
	for (const fn of listeners) fn(current);
}

/** UI command: store the chosen mode and start the game. */
export function confirmMode(mode: GameMode): void {
	currentMode = mode;
	setState("playing");
}

/** UI command: restart with the same mode already stored. */
export function restartGame(): void {
	setState("playing");
}

/** UI command: return to mode selection to pick a different mode. */
export function changeMode(): void {
	currentMode = null;
	setState("mode-select");
}

/** UI command: pause the current run. */
export function pauseGame(): void {
	if (current === "playing") setState("paused");
}

/** UI command: resume from pause. */
export function resumeGame(): void {
	if (current === "paused") setState("playing");
}

/** UI command: end the current run and show results. */
export function endRun(): void {
	if (current === "playing" || current === "paused") setState("game-over");
}

/** UI command: abandon run and return to mode selection without saving stats. */
export function quitToMenu(): void {
	if (current === "paused") {
		currentMode = null;
		setState("mode-select");
	}
}

// Page Visibility API: auto-pause when player switches tabs during play
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState === "hidden") pauseGame();
});

// Returns an unsubscribe function
export function onStateChange(fn: StateListener): () => void {
	listeners.push(fn);
	return () => {
		const i = listeners.indexOf(fn);
		if (i !== -1) listeners.splice(i, 1);
	};
}

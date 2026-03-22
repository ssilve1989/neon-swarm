import type { GameState } from "./types";

type StateListener = (state: GameState) => void;

let current: GameState = "idle";
const listeners: StateListener[] = [];

export function getState(): GameState {
	return current;
}

export function setState(next: GameState): void {
	if (next === current) return;
	current = next;
	for (const fn of listeners) fn(current);
}

// Returns an unsubscribe function
export function onStateChange(fn: StateListener): () => void {
	listeners.push(fn);
	return () => {
		const i = listeners.indexOf(fn);
		if (i !== -1) listeners.splice(i, 1);
	};
}

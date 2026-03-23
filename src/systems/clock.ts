import { app } from "../app";
import { getMode, getState, onStateChange, setState } from "../state";

export const CLOCK_DURATION = 30; // Standard (seconds)
export const BLITZ_CLOCK_DURATION = 15; // Blitz (seconds)

let timeRemaining = 0;

export function getTimeRemaining(): number {
	return timeRemaining;
}

/** Grants additional time — called by Threshold Events in Standard mode only. */
export function addTime(seconds: number): void {
	timeRemaining = Math.min(timeRemaining + seconds, CLOCK_DURATION);
}

export function initClock(): void {
	onStateChange((state, prev) => {
		if (state === "playing" && prev !== "paused") {
			const mode = getMode();
			timeRemaining = mode === "blitz" ? BLITZ_CLOCK_DURATION : CLOCK_DURATION;
		}
	});

	app.ticker.add((ticker) => {
		if (getState() !== "playing") return;
		if (getMode() === "zen") return;
		timeRemaining -= ticker.deltaMS / 1000;
		if (timeRemaining <= 0) {
			timeRemaining = 0;
			setState("game-over");
		}
	});
}

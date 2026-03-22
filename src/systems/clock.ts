import { app } from "../app";
import { getState, setState, onStateChange } from "../state";

export const CLOCK_DURATION = 30; // seconds

let timeRemaining = 0;

export function getTimeRemaining(): number {
	return timeRemaining;
}

/** Grants additional time (used by S1-10 Threshold Events for +5s bonuses). */
export function addTime(seconds: number): void {
	timeRemaining = Math.min(timeRemaining + seconds, CLOCK_DURATION);
}

export function initClock(): void {
	onStateChange((state) => {
		if (state === "playing") {
			timeRemaining = CLOCK_DURATION;
		}
	});

	app.ticker.add((ticker) => {
		if (getState() !== "playing") return;
		timeRemaining -= ticker.deltaMS / 1000;
		if (timeRemaining <= 0) {
			timeRemaining = 0;
			setState("game-over");
		}
	});
}

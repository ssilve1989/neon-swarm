import { onStateChange } from "../state";
import { onAbsorb } from "./absorption";

let score = 0;

export function getScore(): number {
	return score;
}

export function initScoring(): void {
	onStateChange((state, prev) => {
		if (state === "playing" && prev !== "paused") score = 0;
	});

	onAbsorb((count) => {
		score += count;
	});
}

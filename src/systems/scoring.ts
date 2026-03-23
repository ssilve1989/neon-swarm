import { onStateChange } from "../state";
import { onAbsorb } from "./absorption";

let score = 0;

export function getScore(): number {
	return score;
}

export function initScoring(): void {
	onStateChange((state) => {
		if (state === "playing") score = 0;
	});

	onAbsorb((count) => {
		score += count;
	});
}

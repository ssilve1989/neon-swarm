import { onAbsorb } from "./absorption";
import { getMultiplier } from "./combo";
import { onStateChange } from "../state";

let score = 0;
let peakMultiplier = 1;

export function getScore(): number {
	return score;
}

export function getPeakMultiplier(): number {
	return peakMultiplier;
}

export function initScoring(): void {
	onStateChange((state) => {
		if (state === "playing") {
			score = 0;
			peakMultiplier = 1;
		}
	});

	onAbsorb((count) => {
		const mult = getMultiplier();
		score += count * mult;
		if (mult > peakMultiplier) peakMultiplier = mult;
	});
}

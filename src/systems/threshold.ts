import { getMode, onStateChange } from "../state";
import { onAbsorb } from "./absorption";
import { addTime } from "./clock";

export type ThresholdTier = 1 | 2 | 3;

// Absorption count thresholds — tuning knobs
const THRESHOLDS: [number, ThresholdTier][] = [
	[50, 1],
	[200, 2],
	[500, 3],
];

const TIME_BONUS = 5; // seconds granted per threshold crossing (Standard only)

type ThresholdListener = (tier: ThresholdTier) => void;
const listeners: ThresholdListener[] = [];

let totalAbsorbed = 0;
const crossed = new Set<ThresholdTier>();

export function onThreshold(fn: ThresholdListener): () => void {
	listeners.push(fn);
	return () => {
		const i = listeners.indexOf(fn);
		if (i !== -1) listeners.splice(i, 1);
	};
}

export function initThreshold(): void {
	onStateChange((state) => {
		if (state === "playing") {
			totalAbsorbed = 0;
			crossed.clear();
		}
	});

	onAbsorb((count) => {
		totalAbsorbed += count;
		for (const [value, tier] of THRESHOLDS) {
			if (totalAbsorbed >= value && !crossed.has(tier)) {
				crossed.add(tier);
				if (getMode() === "standard") addTime(TIME_BONUS);
				for (const fn of listeners) fn(tier);
			}
		}
	});
}

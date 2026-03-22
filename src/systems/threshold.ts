import { onAbsorb } from "./absorption";
import { getMultiplier, onComboBreak } from "./combo";
import { addTime } from "./clock";
import { getMode } from "../state";

export type ThresholdTier = 1 | 2 | 3;

const THRESHOLDS: [number, ThresholdTier][] = [
	[50, 1],
	[100, 2],
	[200, 3],
];

const TIME_BONUS = 5; // seconds granted per threshold crossing

type ThresholdListener = (tier: ThresholdTier) => void;
const listeners: ThresholdListener[] = [];

const crossed = new Set<ThresholdTier>();

export function onThreshold(fn: ThresholdListener): () => void {
	listeners.push(fn);
	return () => {
		const i = listeners.indexOf(fn);
		if (i !== -1) listeners.splice(i, 1);
	};
}

export function initThreshold(): void {
	onComboBreak(() => crossed.clear());

	onAbsorb(() => {
		const m = getMultiplier();
		for (const [value, tier] of THRESHOLDS) {
			if (m >= value && !crossed.has(tier)) {
				crossed.add(tier);
				if (getMode() === "standard") addTime(TIME_BONUS);
				for (const fn of listeners) fn(tier);
			}
		}
	});
}

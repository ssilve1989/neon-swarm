import { app } from "../app";
import { onAbsorb } from "./absorption";
import { getState, onStateChange } from "../state";

// Combo timer duration in ticks (1.0 = one frame at target fps, so 120 ≈ 2s at 60fps)
export const COMBO_DURATION = 120;

type ComboBreakListener = () => void;
const breakListeners: ComboBreakListener[] = [];

let multiplier = 1;
let timer = 0;

export function getMultiplier(): number {
	return multiplier;
}

/** Returns 0–1: how full the combo timer is (1 = just reset, 0 = expired). */
export function getComboTimer(): number {
	return timer / COMBO_DURATION;
}

export function onComboBreak(fn: ComboBreakListener): () => void {
	breakListeners.push(fn);
	return () => {
		const i = breakListeners.indexOf(fn);
		if (i !== -1) breakListeners.splice(i, 1);
	};
}

export function initCombo(): void {
	onStateChange((state) => {
		if (state === "playing") {
			multiplier = 1;
			timer = 0;
		}
	});

	onAbsorb(() => {
		if (getState() !== "playing") return;
		multiplier += 1;
		timer = COMBO_DURATION;
	});

	app.ticker.add((ticker) => {
		if (getState() !== "playing" || timer <= 0) return;
		timer -= ticker.deltaTime;
		if (timer <= 0) {
			timer = 0;
			multiplier = 1;
			for (const fn of breakListeners) fn();
		}
	});
}

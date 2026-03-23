import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type AbsorbFn = (count: number, color: number) => void;
type StateListener = (state: string) => void;

const mocks = vi.hoisted(() => ({
	absorbListeners: [] as AbsorbFn[],
	stateListeners: [] as StateListener[],
	addTimeCalls: [] as number[],
	mode: "standard" as string | null,
}));

vi.mock("../../src/systems/absorption", () => ({
	onAbsorb: (fn: AbsorbFn) => {
		mocks.absorbListeners.push(fn);
		return () => {};
	},
}));

vi.mock("../../src/systems/clock", () => ({
	addTime: (s: number) => {
		mocks.addTimeCalls.push(s);
	},
}));

vi.mock("../../src/state", () => ({
	getMode: () => mocks.mode,
	onStateChange: (fn: StateListener) => {
		mocks.stateListeners.push(fn);
		return () => {};
	},
}));

import type { ThresholdTier } from "../../src/systems/threshold";
import { initThreshold, onThreshold } from "../../src/systems/threshold";

function triggerAbsorb(count = 1) {
	for (const fn of mocks.absorbListeners) fn(count, 0);
}

function triggerStateChange(state: string) {
	for (const fn of mocks.stateListeners) fn(state);
}

beforeAll(() => {
	initThreshold();
});

beforeEach(() => {
	mocks.addTimeCalls.length = 0;
	// Reset totalAbsorbed and crossed set via new game start
	triggerStateChange("playing");
});

describe("threshold crossings", () => {
	it("fires tier 1 at 50 total absorbed", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		triggerAbsorb(50);
		expect(listener).toHaveBeenCalledWith(1 satisfies ThresholdTier);
		unsub();
	});

	it("fires tier 2 at 200 total absorbed", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		triggerAbsorb(200);
		expect(listener).toHaveBeenCalledWith(2 satisfies ThresholdTier);
		unsub();
	});

	it("fires tier 3 at 500 total absorbed", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		triggerAbsorb(500);
		expect(listener).toHaveBeenCalledWith(3 satisfies ThresholdTier);
		unsub();
	});

	it("fires all three tiers when total absorbed exceeds all thresholds in one absorb", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		triggerAbsorb(500);
		expect(listener).toHaveBeenCalledTimes(3);
		unsub();
	});

	it("does not fire below the lowest threshold", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		triggerAbsorb(49);
		expect(listener).not.toHaveBeenCalled();
		unsub();
	});
});

describe("time bonus", () => {
	it("grants +5s on a single threshold crossing", () => {
		triggerAbsorb(50);
		expect(mocks.addTimeCalls).toEqual([5]);
	});

	it("grants +5s for each tier when all crossed in one absorb", () => {
		triggerAbsorb(500);
		expect(mocks.addTimeCalls).toEqual([5, 5, 5]);
	});
});

describe("one-shot per game run", () => {
	it("does not fire the same tier twice within one run", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		triggerAbsorb(50);
		triggerAbsorb(10); // still same run, tier 1 already crossed
		expect(listener).toHaveBeenCalledTimes(1);
		unsub();
	});

	it("fires again after a new game start resets crossings", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		triggerAbsorb(50); // cross tier 1
		triggerStateChange("playing"); // new game — resets totalAbsorbed and crossed
		triggerAbsorb(50); // cross tier 1 again
		expect(listener).toHaveBeenCalledTimes(2);
		unsub();
	});
});

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

type AbsorbFn = (count: number, color: number) => void;
type BreakFn = () => void;

const mocks = vi.hoisted(() => ({
	absorbListeners: [] as AbsorbFn[],
	comboBreakListeners: [] as BreakFn[],
	multiplier: 1,
	addTimeCalls: [] as number[],
	mode: "standard" as string | null,
}));

vi.mock("../../src/systems/absorption", () => ({
	onAbsorb: (fn: AbsorbFn) => {
		mocks.absorbListeners.push(fn);
		return () => {};
	},
}));

vi.mock("../../src/systems/combo", () => ({
	getMultiplier: () => mocks.multiplier,
	onComboBreak: (fn: BreakFn) => {
		mocks.comboBreakListeners.push(fn);
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
}));

import type { ThresholdTier } from "../../src/systems/threshold";
import { initThreshold, onThreshold } from "../../src/systems/threshold";

function triggerAbsorb() {
	for (const fn of mocks.absorbListeners) fn(1, 0);
}

function triggerComboBreak() {
	for (const fn of mocks.comboBreakListeners) fn();
}

beforeAll(() => {
	initThreshold();
});

beforeEach(() => {
	mocks.multiplier = 1;
	mocks.addTimeCalls.length = 0;
	triggerComboBreak(); // clears the `crossed` set in threshold.ts
});

describe("threshold crossings", () => {
	it("fires tier 1 at 50× multiplier", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		mocks.multiplier = 50;
		triggerAbsorb();
		expect(listener).toHaveBeenCalledWith(1 satisfies ThresholdTier);
		unsub();
	});

	it("fires tier 2 at 100× multiplier", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		mocks.multiplier = 100;
		triggerAbsorb();
		expect(listener).toHaveBeenCalledWith(2 satisfies ThresholdTier);
		unsub();
	});

	it("fires tier 3 at 200× multiplier", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		mocks.multiplier = 200;
		triggerAbsorb();
		expect(listener).toHaveBeenCalledWith(3 satisfies ThresholdTier);
		unsub();
	});

	it("fires all three tiers when multiplier jumps past all thresholds", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		mocks.multiplier = 250;
		triggerAbsorb();
		expect(listener).toHaveBeenCalledTimes(3);
		unsub();
	});

	it("does not fire below the lowest threshold", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		mocks.multiplier = 49;
		triggerAbsorb();
		expect(listener).not.toHaveBeenCalled();
		unsub();
	});
});

describe("time bonus", () => {
	it("grants +5s on a single threshold crossing", () => {
		mocks.multiplier = 50;
		triggerAbsorb();
		expect(mocks.addTimeCalls).toEqual([5]);
	});

	it("grants +5s for each tier when all crossed in one absorb", () => {
		mocks.multiplier = 250;
		triggerAbsorb();
		expect(mocks.addTimeCalls).toEqual([5, 5, 5]);
	});
});

describe("one-shot per combo", () => {
	it("does not fire the same tier twice within one combo", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		mocks.multiplier = 50;
		triggerAbsorb();
		triggerAbsorb(); // already crossed — should not fire again
		expect(listener).toHaveBeenCalledTimes(1);
		unsub();
	});

	it("fires again after a combo break resets crossings", () => {
		const listener = vi.fn();
		const unsub = onThreshold(listener);
		mocks.multiplier = 50;
		triggerAbsorb(); // cross tier 1
		triggerComboBreak(); // resets crossed set
		triggerAbsorb(); // cross tier 1 again
		expect(listener).toHaveBeenCalledTimes(2);
		unsub();
	});
});
